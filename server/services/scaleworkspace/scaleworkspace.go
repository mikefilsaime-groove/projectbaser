// Copyright (c) 2015-present Mattermost, Inc. All Rights Reserved.
// See LICENSE.txt for license information.

// Package scaleworkspace implements the ProjectBaser adapter for the
// Scale Plus Pro Max Team Workspaces rollout.
//
// The feature is DISABLED BY DEFAULT. Nothing in this package changes any
// behavior unless the environment variable SCALE_TEAM_WORKSPACES_ENABLED is
// explicitly set to "true". The signed-in Keycloak user always remains the
// actor; an owner workspace is only a resource scope. Central authorization
// is revalidated on every guest request and any failure denies access
// (fail closed).
package scaleworkspace

import (
	"bytes"
	"context"
	"encoding/json"
	"errors"
	"fmt"
	"net/http"
	"os"
	"regexp"
	"strings"
	"time"
)

// AppSlug is the canonical application slug registered with the central hub.
const AppSlug = "projectbaser"

// KeycloakTokenHeader carries the actor's CURRENT Keycloak access token on
// guest requests. It is read transiently for the central authorize call and
// must never be logged or persisted.
const KeycloakTokenHeader = "X-Scale-Keycloak-Token"

// Session prop keys. The workspace context lives ONLY in the server-side
// session row (sessions.props), never in localStorage, JS-readable cookies,
// or domain tables.
const (
	SessionPropContext     = "scale_workspace_context"
	SessionPropOwnerTeamID = "scale_workspace_owner_team_id"
	SessionPropHomeTeamID  = "scale_workspace_home_team_id"
	SessionPropAllowedApps = "scale_workspace_allowed_apps"
)

const defaultHubURL = "https://app.scaleplus.gg"

const hubTimeout = 5 * time.Second

// ErrAccessRevoked signals that the central hub explicitly rejected the
// workspace authorization (membership removed, grant revoked, workspace
// suspended, or owner lost Pro Max). The local guest context must be cleared.
var ErrAccessRevoked = errors.New("scale workspace access revoked")

// ErrNotConfigured signals missing client credentials.
var ErrNotConfigured = errors.New("scale workspace client credentials are not configured")

// Enabled reports whether the team workspace adapter is switched on.
// Default is OFF; only the literal string "true" enables it.
func Enabled() bool {
	return os.Getenv("SCALE_TEAM_WORKSPACES_ENABLED") == "true"
}

// HubURL returns the central hub base URL without a trailing slash.
func HubURL() string {
	raw := strings.TrimSpace(os.Getenv("SCALE_WORKSPACE_HUB_URL"))
	if raw == "" {
		raw = defaultHubURL
	}
	return strings.TrimRight(raw, "/")
}

// SwitchURL is the sanitized, display-only URL for switching workspaces.
func SwitchURL() string {
	return HubURL() + "/team"
}

// Context is the strict WorkspaceContextV1 contract shape.
type Context struct {
	Version int `json:"version"`
	Actor   struct {
		KeycloakSubject string `json:"keycloakSubject"`
		Email           string `json:"email"`
	} `json:"actor"`
	Workspace struct {
		ID          string `json:"id"`
		DisplayName string `json:"displayName"`
		Type        string `json:"type"`
	} `json:"workspace"`
	Owner struct {
		KeycloakSubject string `json:"keycloakSubject"`
		DisplayName     string `json:"displayName"`
		Email           string `json:"email"`
	} `json:"owner"`
	Membership struct {
		Role   string `json:"role"`
		Status string `json:"status"`
	} `json:"membership"`
	Application struct {
		Slug       string `json:"slug"`
		Capability string `json:"capability"`
	} `json:"application"`
	AuthorizationVersion string `json:"authorizationVersion"`
	ExpiresAt            string `json:"expiresAt"`
}

// ValidateContext strictly validates a WorkspaceContextV1 payload bound to
// this application's slug. Anything unexpected is rejected.
func ValidateContext(c *Context) error {
	if c == nil {
		return errors.New("workspace context is missing")
	}
	if c.Version != 1 {
		return fmt.Errorf("unsupported workspace context version %d", c.Version)
	}
	if c.Workspace.Type != "guest" {
		return errors.New("workspace context type must be guest")
	}
	if c.Membership.Role != "member" || c.Membership.Status != "active" {
		return errors.New("workspace membership must be an active member")
	}
	if c.Application.Slug != AppSlug {
		return errors.New("workspace context is bound to a different application")
	}
	if c.Application.Capability != "general-member" {
		return errors.New("unsupported workspace capability")
	}
	if strings.TrimSpace(c.Actor.KeycloakSubject) == "" {
		return errors.New("workspace context actor subject is missing")
	}
	if strings.TrimSpace(c.Owner.KeycloakSubject) == "" {
		return errors.New("workspace context owner subject is missing")
	}
	if strings.TrimSpace(c.Workspace.ID) == "" {
		return errors.New("workspace context workspace id is missing")
	}
	if _, err := time.Parse(time.RFC3339, c.ExpiresAt); err != nil {
		return errors.New("workspace context expiry is invalid")
	}
	return nil
}

// ParseContext decodes and validates a stored context JSON document.
func ParseContext(raw string) (*Context, error) {
	var c Context
	if err := json.Unmarshal([]byte(raw), &c); err != nil {
		return nil, errors.New("workspace context is malformed")
	}
	if err := ValidateContext(&c); err != nil {
		return nil, err
	}
	return &c, nil
}

// ---------------------------------------------------------------------------
// Guest request policy (fail-closed allowlist)
// ---------------------------------------------------------------------------

// Decision classifies a guest request against the route policy.
type Decision int

const (
	// DecisionDeny rejects the request: sensitive or unknown surface.
	DecisionDeny Decision = iota
	// DecisionAllow permits normal member work scoped to the owner tenant.
	DecisionAllow
)

var sensitivePatterns = []*regexp.Regexp{
	regexp.MustCompile(`^/admin(/|$)`),
	regexp.MustCompile(`^/login$`),
	regexp.MustCompile(`^/register$`),
	regexp.MustCompile(`^/users/[^/]+/changepassword$`),
	regexp.MustCompile(`^/teams/[^/]+/regenerate_signup_token$`),
	regexp.MustCompile(`^/boards/[^/]+/sharing(/|$)`),
	regexp.MustCompile(`^/teams/[^/]+/archive/(import|export)$`),
	regexp.MustCompile(`^/statistics$`),
	regexp.MustCompile(`^/compliance(/|$)`),
	regexp.MustCompile(`^/channels(/|$)`),
	regexp.MustCompile(`^/teams/[^/]+/channels(/|$)`),
}

type allowRule struct {
	pattern *regexp.Regexp
	methods map[string]bool
}

func anyMethod() map[string]bool { return nil }

func methods(list ...string) map[string]bool {
	m := make(map[string]bool, len(list))
	for _, v := range list {
		m[v] = true
	}
	return m
}

var allowRules = []allowRule{
	// Board, block, and card collaboration inside the owner team.
	{regexp.MustCompile(`^/boards(/|$)`), anyMethod()},
	{regexp.MustCompile(`^/boards-and-blocks(/|$)`), anyMethod()},
	{regexp.MustCompile(`^/cards(/|$)`), anyMethod()},
	{regexp.MustCompile(`^/content-blocks(/|$)`), anyMethod()},
	// Team-scoped reads and member work.
	{regexp.MustCompile(`^/teams$`), methods(http.MethodGet)},
	{regexp.MustCompile(`^/teams/[^/]+$`), methods(http.MethodGet)},
	{regexp.MustCompile(`^/teams/[^/]+/boards(/|$)`), anyMethod()},
	{regexp.MustCompile(`^/teams/[^/]+/templates$`), methods(http.MethodGet)},
	{regexp.MustCompile(`^/teams/[^/]+/categories(/|$)`), anyMethod()},
	{regexp.MustCompile(`^/teams/[^/]+/users$`), methods(http.MethodGet, http.MethodPost)},
	{regexp.MustCompile(`^/teams/[^/]+/onboard$`), methods(http.MethodPost)},
	// File upload/download (team + board scoped).
	{regexp.MustCompile(`^/teams/[^/]+/[^/]+/files$`), methods(http.MethodPost)},
	{regexp.MustCompile(`^/files/teams/`), methods(http.MethodGet)},
	// Subscriptions/notifications.
	{regexp.MustCompile(`^/subscriptions(/|$)`), anyMethod()},
	// User reads and own preferences.
	{regexp.MustCompile(`^/users$`), methods(http.MethodPost)}, // batch read by IDs
	{regexp.MustCompile(`^/users/me$`), methods(http.MethodGet)},
	{regexp.MustCompile(`^/users/me/memberships$`), methods(http.MethodGet)},
	{regexp.MustCompile(`^/users/me/config$`), methods(http.MethodGet)},
	{regexp.MustCompile(`^/users/[^/]+$`), methods(http.MethodGet)},
	{regexp.MustCompile(`^/users/[^/]+/config$`), methods(http.MethodPut)},
	// Session/config basics.
	{regexp.MustCompile(`^/logout$`), methods(http.MethodPost)},
	{regexp.MustCompile(`^/clientConfig$`), methods(http.MethodGet)},
	{regexp.MustCompile(`^/auth/keycloak-token-login$`), methods(http.MethodPost)},
	// Workspace adapter's own endpoints.
	{regexp.MustCompile(`^/scale-workspace/(exchange|display-context|leave)$`), anyMethod()},
}

// Classify applies the fail-closed guest route policy to a full request path
// (e.g. "/api/v2/boards/xyz"). Sensitive routes are denied, explicitly
// allowlisted member-work routes are allowed, and EVERYTHING ELSE is denied.
func Classify(method, fullPath string) Decision {
	path, ok := strings.CutPrefix(fullPath, "/api/v2")
	if !ok {
		return DecisionDeny
	}
	if path == "" {
		path = "/"
	}
	for _, re := range sensitivePatterns {
		if re.MatchString(path) {
			return DecisionDeny
		}
	}
	for _, rule := range allowRules {
		if !rule.pattern.MatchString(path) {
			continue
		}
		if rule.methods == nil || rule.methods[method] {
			return DecisionAllow
		}
	}
	return DecisionDeny
}

// ---------------------------------------------------------------------------
// Central hub client
// ---------------------------------------------------------------------------

var httpClient = &http.Client{Timeout: hubTimeout}

func appHeaders() (map[string]string, error) {
	clientID := os.Getenv("SCALE_WORKSPACE_CLIENT_ID")
	clientSecret := os.Getenv("SCALE_WORKSPACE_CLIENT_SECRET")
	if clientID == "" || clientSecret == "" {
		return nil, ErrNotConfigured
	}
	return map[string]string{
		"Content-Type":             "application/json",
		"X-Scale-Workspace-Client": clientID,
		"X-Scale-Workspace-Secret": clientSecret,
	}, nil
}

// ExchangeResult is the response of the central exchange endpoint.
type ExchangeResult struct {
	Context             *Context `json:"context"`
	ReturnPath          string   `json:"returnPath"`
	AllowedApplications []string `json:"allowedApplications"`
}

// AuthorizeResult is the response of the central authorize endpoint.
type AuthorizeResult struct {
	Context             *Context `json:"context"`
	AllowedApplications []string `json:"allowedApplications"`
}

func postJSON(ctx context.Context, url string, body any, bearer string) (*http.Response, error) {
	headers, err := appHeaders()
	if err != nil {
		return nil, err
	}
	payload, err := json.Marshal(body)
	if err != nil {
		return nil, err
	}
	req, err := http.NewRequestWithContext(ctx, http.MethodPost, url, bytes.NewReader(payload))
	if err != nil {
		return nil, err
	}
	for k, v := range headers {
		req.Header.Set(k, v)
	}
	if bearer != "" {
		req.Header.Set("Authorization", "Bearer "+bearer)
	}
	return httpClient.Do(req)
}

// ExchangeCode consumes a single-use, app-bound launch code at the central
// hub. Any failure is returned as an error; the caller must fail closed.
func ExchangeCode(ctx context.Context, code string) (*ExchangeResult, error) {
	resp, err := postJSON(ctx, HubURL()+"/api/workspaces/v1/exchange", map[string]string{"code": code}, "")
	if err != nil {
		return nil, err
	}
	defer resp.Body.Close()
	if resp.StatusCode < 200 || resp.StatusCode >= 300 {
		return nil, fmt.Errorf("workspace launch code was rejected (status %d)", resp.StatusCode)
	}
	var result ExchangeResult
	if err := json.NewDecoder(resp.Body).Decode(&result); err != nil {
		return nil, errors.New("workspace exchange response was malformed")
	}
	if err := ValidateContext(result.Context); err != nil {
		return nil, err
	}
	return &result, nil
}

// Authorize revalidates the guest workspace grant with the central hub using
// the ACTOR's current Keycloak access token. It must be called on every guest
// request. A definitive rejection returns ErrAccessRevoked (clear the local
// guest context); transient transport/server failures return other errors
// (deny WITHOUT clearing).
func Authorize(ctx context.Context, workspaceID, keycloakToken string) (*AuthorizeResult, error) {
	if strings.TrimSpace(keycloakToken) == "" {
		return nil, errors.New("missing actor keycloak token")
	}
	resp, err := postJSON(ctx, HubURL()+"/api/workspaces/v1/authorize", map[string]string{"workspaceId": workspaceID}, keycloakToken)
	if err != nil {
		return nil, err
	}
	defer resp.Body.Close()
	switch {
	case resp.StatusCode >= 200 && resp.StatusCode < 300:
		// fall through to decoding
	case resp.StatusCode >= 400 && resp.StatusCode < 500:
		return nil, ErrAccessRevoked
	default:
		return nil, fmt.Errorf("workspace authorization unavailable (status %d)", resp.StatusCode)
	}
	var result AuthorizeResult
	if err := json.NewDecoder(resp.Body).Decode(&result); err != nil {
		return nil, errors.New("workspace authorization response was malformed")
	}
	if err := ValidateContext(result.Context); err != nil {
		return nil, err
	}
	return &result, nil
}

// SanitizeReturnPath keeps only safe, local, absolute paths.
func SanitizeReturnPath(path string) string {
	if strings.HasPrefix(path, "/") && !strings.HasPrefix(path, "//") && !strings.ContainsAny(path, "\\\r\n") {
		return path
	}
	return "/"
}

// ValidLaunchCode bounds the opaque single-use code shape.
func ValidLaunchCode(code string) bool {
	if code == "" || len(code) > 256 {
		return false
	}
	for _, r := range code {
		if r <= ' ' || r > '~' {
			return false
		}
	}
	return true
}
