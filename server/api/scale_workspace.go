// Copyright (c) 2015-present Mattermost, Inc. All Rights Reserved.
// See LICENSE.txt for license information.

package api

import (
	"encoding/json"
	"errors"
	"io"
	"net/http"
	"net/url"
	"strings"

	"github.com/gorilla/mux"
	"github.com/mattermost/focalboard/server/model"
	"github.com/mattermost/focalboard/server/services/auth"
	"github.com/mattermost/focalboard/server/services/scaleworkspace"

	"github.com/mattermost/mattermost/server/public/shared/mlog"
)

// Scale Plus Pro Max Team Workspaces adapter (disabled by default).
//
// - The signed-in Keycloak member always remains the actor.
// - The guest workspace context lives only in the server-side session row.
// - Every guest request is revalidated against the central hub; any failure
//   denies access (fail closed). Unknown API surfaces are denied to guests.
// - When SCALE_TEAM_WORKSPACES_ENABLED is not "true", every route below
//   returns 404 and the guard is a no-op: zero behavior change.

func (a *API) registerScaleWorkspaceRoutes(r *mux.Router) {
	r.HandleFunc("/scale-workspace/exchange", a.sessionRequired(a.handleScaleWorkspaceExchange)).Methods(http.MethodPost)
	r.HandleFunc("/scale-workspace/display-context", a.sessionRequired(a.handleScaleWorkspaceDisplayContext)).Methods(http.MethodGet)
	r.HandleFunc("/scale-workspace/leave", a.sessionRequired(a.handleScaleWorkspaceLeave)).Methods(http.MethodPost)
}

// registerScaleWorkspacePublicRoutes registers the browser-facing callback
// outside /api/v2. The central hub redirects here with the single-use,
// two-minute launch code.
func (a *API) registerScaleWorkspacePublicRoutes(r *mux.Router) {
	r.HandleFunc("/auth/scale-workspace/callback", a.handleScaleWorkspaceCallback).Methods(http.MethodGet)
}

// handleScaleWorkspaceCallback preserves the launch code through the SPA's
// normal Keycloak sign-in flow. It never exchanges or stores anything itself:
// the code is handed to the client boot path as a query parameter and the
// authenticated exchange happens server-side via /api/v2/scale-workspace/
// exchange, keeping single-use and expiry semantics intact.
func (a *API) handleScaleWorkspaceCallback(w http.ResponseWriter, r *http.Request) {
	if !scaleworkspace.Enabled() {
		http.NotFound(w, r)
		return
	}
	code := r.URL.Query().Get("scale_workspace_code")
	if !scaleworkspace.ValidLaunchCode(code) {
		http.Error(w, "Invalid workspace launch code", http.StatusBadRequest)
		return
	}
	http.Redirect(w, r, "/?scale_workspace_code="+url.QueryEscape(code), http.StatusFound)
}

type scaleWorkspaceExchangeRequest struct {
	Code string `json:"code"`
}

type scaleWorkspaceExchangeResponse struct {
	TeamID     string `json:"teamId"`
	ReturnPath string `json:"returnPath"`
}

func (a *API) handleScaleWorkspaceExchange(w http.ResponseWriter, r *http.Request) {
	if !scaleworkspace.Enabled() {
		a.errorResponse(w, r, model.NewErrNotFound("scale-workspace"))
		return
	}

	session, _ := r.Context().Value(sessionContextKey).(*model.Session)
	if session == nil {
		a.errorResponse(w, r, model.NewErrUnauthorized("not authenticated"))
		return
	}
	actorSub, _ := session.Props["keycloak_sub_id"].(string)
	if actorSub == "" {
		a.errorResponse(w, r, model.NewErrForbidden("a keycloak sign-in is required for team workspaces"))
		return
	}

	body, err := io.ReadAll(io.LimitReader(r.Body, 4096))
	if err != nil {
		a.errorResponse(w, r, model.NewErrBadRequest("unable to read request"))
		return
	}
	var request scaleWorkspaceExchangeRequest
	if err = json.Unmarshal(body, &request); err != nil || !scaleworkspace.ValidLaunchCode(request.Code) {
		a.errorResponse(w, r, model.NewErrBadRequest("invalid workspace launch code"))
		return
	}

	result, err := scaleworkspace.ExchangeCode(r.Context(), request.Code)
	if err != nil {
		a.logger.Warn("scale workspace exchange rejected", mlog.Err(err))
		a.errorResponse(w, r, model.NewErrForbidden("workspace launch code was rejected"))
		return
	}
	context := result.Context

	// The destination's CURRENT authenticated Keycloak subject must be the
	// context actor. Never store anything on a mismatch.
	if context.Actor.KeycloakSubject != actorSub {
		a.errorResponse(w, r, model.NewErrForbidden("workspace actor mismatch"))
		return
	}
	// The owner uses personal access, never a guest context.
	if context.Owner.KeycloakSubject == actorSub {
		a.errorResponse(w, r, model.NewErrForbidden("owners use their personal workspace access"))
		return
	}

	// Map the opaque central workspace ID to the owner's ONE existing local
	// tenant (their primary team). The owner must already be provisioned
	// locally; guests never create or reassign owner data.
	owner, err := a.app.GetUserByKeycloakSubID(context.Owner.KeycloakSubject)
	if err != nil || owner == nil {
		a.errorResponse(w, r, model.NewErrForbidden("workspace owner is not provisioned in this application"))
		return
	}
	ownerTeam, err := a.app.GetPrimaryTeamForUser(owner.ID)
	if err != nil || ownerTeam == nil {
		a.errorResponse(w, r, model.NewErrForbidden("workspace owner has no local tenant"))
		return
	}

	existing, err := a.app.GetScaleWorkspaceBinding(context.Workspace.ID)
	if err != nil && !model.IsErrNotFound(err) {
		a.errorResponse(w, r, err)
		return
	}
	if existing != nil && existing.OwnerTeamID != ownerTeam.ID {
		jsonBytesResponse(w, http.StatusConflict, []byte(`{"error":"workspace binding conflict"}`))
		return
	}
	if err = a.app.UpsertScaleWorkspaceBinding(&model.ScaleWorkspaceBinding{
		WorkspaceID: context.Workspace.ID,
		OwnerTeamID: ownerTeam.ID,
	}); err != nil {
		a.errorResponse(w, r, err)
		return
	}

	contextJSON, err := json.Marshal(context)
	if err != nil {
		a.errorResponse(w, r, err)
		return
	}

	// Store the context ONLY in the server-side session. Remember the
	// member's own home team once so leaving restores it.
	if session.Props == nil {
		session.Props = map[string]interface{}{}
	}
	if _, ok := session.Props[scaleworkspace.SessionPropHomeTeamID].(string); !ok {
		if homeTeamID, ok2 := session.Props["team_id"].(string); ok2 {
			session.Props[scaleworkspace.SessionPropHomeTeamID] = homeTeamID
		}
	}
	session.Props[scaleworkspace.SessionPropContext] = string(contextJSON)
	session.Props[scaleworkspace.SessionPropOwnerTeamID] = ownerTeam.ID
	session.Props[scaleworkspace.SessionPropAllowedApps] = strings.Join(result.AllowedApplications, ",")
	session.Props["team_id"] = ownerTeam.ID
	if err = a.app.UpdateSession(session); err != nil {
		a.errorResponse(w, r, err)
		return
	}

	response, err := json.Marshal(scaleWorkspaceExchangeResponse{
		TeamID:     ownerTeam.ID,
		ReturnPath: scaleworkspace.SanitizeReturnPath(result.ReturnPath),
	})
	if err != nil {
		a.errorResponse(w, r, err)
		return
	}
	jsonBytesResponse(w, http.StatusOK, response)
}

type scaleWorkspaceDisplayContext struct {
	WorkspaceType       string   `json:"workspaceType"`
	WorkspaceName       string   `json:"workspaceName"`
	WorkspaceOwnerName  string   `json:"workspaceOwnerName,omitempty"`
	WorkspaceOwnerEmail string   `json:"workspaceOwnerEmail,omitempty"`
	WorkspaceSwitchURL  string   `json:"workspaceSwitchUrl,omitempty"`
	AllowedApplications []string `json:"allowedApplications,omitempty"`
	TeamID              string   `json:"teamId,omitempty"`
}

// handleScaleWorkspaceDisplayContext returns SANITIZED, display-only fields
// for the launcher UI. It never authorizes anything.
func (a *API) handleScaleWorkspaceDisplayContext(w http.ResponseWriter, r *http.Request) {
	personal := scaleWorkspaceDisplayContext{WorkspaceType: "personal", WorkspaceName: "Your workspace"}
	session, _ := r.Context().Value(sessionContextKey).(*model.Session)

	var payload scaleWorkspaceDisplayContext
	payload = personal
	if scaleworkspace.Enabled() && session != nil {
		if raw, ok := session.Props[scaleworkspace.SessionPropContext].(string); ok && raw != "" {
			if context, err := scaleworkspace.ParseContext(raw); err == nil {
				allowedApps := []string{scaleworkspace.AppSlug}
				if csv, ok2 := session.Props[scaleworkspace.SessionPropAllowedApps].(string); ok2 && csv != "" {
					allowedApps = strings.Split(csv, ",")
				}
				teamID, _ := session.Props[scaleworkspace.SessionPropOwnerTeamID].(string)
				payload = scaleWorkspaceDisplayContext{
					WorkspaceType:       "guest",
					WorkspaceName:       context.Workspace.DisplayName,
					WorkspaceOwnerName:  context.Owner.DisplayName,
					WorkspaceOwnerEmail: context.Owner.Email,
					WorkspaceSwitchURL:  scaleworkspace.SwitchURL(),
					AllowedApplications: allowedApps,
					TeamID:              teamID,
				}
			}
		}
	}

	response, err := json.Marshal(payload)
	if err != nil {
		a.errorResponse(w, r, err)
		return
	}
	jsonBytesResponse(w, http.StatusOK, response)
}

func (a *API) handleScaleWorkspaceLeave(w http.ResponseWriter, r *http.Request) {
	if !scaleworkspace.Enabled() {
		a.errorResponse(w, r, model.NewErrNotFound("scale-workspace"))
		return
	}
	session, _ := r.Context().Value(sessionContextKey).(*model.Session)
	if session == nil {
		a.errorResponse(w, r, model.NewErrUnauthorized("not authenticated"))
		return
	}
	teamID := a.clearScaleWorkspaceSession(session)
	response, err := json.Marshal(map[string]string{"teamId": teamID})
	if err != nil {
		a.errorResponse(w, r, err)
		return
	}
	jsonBytesResponse(w, http.StatusOK, response)
}

// clearScaleWorkspaceSession removes the guest context from the server-side
// session and restores the member's own home team. Returns the restored team.
func (a *API) clearScaleWorkspaceSession(session *model.Session) string {
	homeTeamID, _ := session.Props[scaleworkspace.SessionPropHomeTeamID].(string)
	if homeTeamID != "" {
		session.Props["team_id"] = homeTeamID
	}
	delete(session.Props, scaleworkspace.SessionPropContext)
	delete(session.Props, scaleworkspace.SessionPropOwnerTeamID)
	delete(session.Props, scaleworkspace.SessionPropHomeTeamID)
	delete(session.Props, scaleworkspace.SessionPropAllowedApps)
	if err := a.app.UpdateSession(session); err != nil {
		a.logger.Error("failed to clear scale workspace session", mlog.Err(err))
	}
	currentTeamID, _ := session.Props["team_id"].(string)
	return currentTeamID
}

// scaleWorkspaceGuard enforces the guest workspace boundary on every /api/v2
// request. Personal sessions (no guest context) pass through untouched, so
// there is zero behavior change when the flag is off or nobody is in a guest
// workspace.
func (a *API) scaleWorkspaceGuard(next http.Handler) http.Handler {
	return http.HandlerFunc(func(w http.ResponseWriter, r *http.Request) {
		if !scaleworkspace.Enabled() {
			next.ServeHTTP(w, r)
			return
		}

		token, _ := auth.ParseAuthTokenFromRequest(r)
		if token == "" {
			next.ServeHTTP(w, r)
			return
		}
		session, err := a.app.GetSession(token)
		if err != nil || session == nil {
			// Let the standard auth middleware produce its usual response.
			next.ServeHTTP(w, r)
			return
		}
		rawContext, ok := session.Props[scaleworkspace.SessionPropContext].(string)
		if !ok || rawContext == "" {
			// Personal (non-guest) access: existing auth path, unchanged.
			next.ServeHTTP(w, r)
			return
		}

		// ---- Guest workspace request: fail closed from here on. ----

		if scaleworkspace.Classify(r.Method, r.URL.Path) != scaleworkspace.DecisionAllow {
			jsonBytesResponse(w, http.StatusForbidden,
				[]byte(`{"error":"this action is owner-only in a guest workspace"}`))
			return
		}

		storedContext, err := scaleworkspace.ParseContext(rawContext)
		if err != nil {
			a.clearScaleWorkspaceSession(session)
			jsonBytesResponse(w, http.StatusForbidden,
				[]byte(`{"error":"guest workspace context is invalid"}`))
			return
		}

		// Revalidate with the central hub on EVERY guest request, using the
		// actor's CURRENT Keycloak access token. The token is read
		// transiently and never logged or persisted.
		keycloakToken := r.Header.Get(scaleworkspace.KeycloakTokenHeader)
		if keycloakToken == "" {
			jsonBytesResponse(w, http.StatusUnauthorized,
				[]byte(`{"error":"a current keycloak token is required for guest workspace access"}`))
			return
		}
		result, err := scaleworkspace.Authorize(r.Context(), storedContext.Workspace.ID, keycloakToken)
		if err != nil {
			if errors.Is(err, scaleworkspace.ErrAccessRevoked) {
				a.clearScaleWorkspaceSession(session)
				jsonBytesResponse(w, http.StatusConflict,
					[]byte(`{"code":"WORKSPACE_ACCESS_REVOKED","error":"guest workspace access is no longer active","redirectUrl":"/"}`))
				return
			}
			jsonBytesResponse(w, http.StatusServiceUnavailable,
				[]byte(`{"error":"guest workspace authorization is temporarily unavailable"}`))
			return
		}

		actorSub, _ := session.Props["keycloak_sub_id"].(string)
		if actorSub == "" || result.Context.Actor.KeycloakSubject != actorSub ||
			result.Context.Workspace.ID != storedContext.Workspace.ID {
			a.clearScaleWorkspaceSession(session)
			jsonBytesResponse(w, http.StatusForbidden,
				[]byte(`{"error":"workspace actor validation failed"}`))
			return
		}

		// Record the actual actor (the member) separately for mutations.
		if r.Method != http.MethodGet && r.Method != http.MethodHead && r.Method != http.MethodOptions {
			ownerTeamID, _ := session.Props[scaleworkspace.SessionPropOwnerTeamID].(string)
			path := r.URL.Path
			if len(path) > 2000 {
				path = path[:2000]
			}
			if auditErr := a.app.CreateScaleWorkspaceAuditEvent(&model.ScaleWorkspaceAuditEvent{
				WorkspaceID: storedContext.Workspace.ID,
				ActorUserID: session.UserID,
				OwnerTeamID: ownerTeamID,
				Method:      r.Method,
				Path:        path,
			}); auditErr != nil {
				a.logger.Error("failed to record scale workspace audit event", mlog.Err(auditErr))
			}
		}

		next.ServeHTTP(w, r)
	})
}
