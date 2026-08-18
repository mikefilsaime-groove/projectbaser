// Copyright (c) 2015-present Mattermost, Inc. All Rights Reserved.
// See LICENSE.txt for license information.

package app

import (
	"github.com/mattermost/focalboard/server/model"
)

// Thin pass-throughs used by the Scale Plus team workspace adapter. They are
// only invoked when SCALE_TEAM_WORKSPACES_ENABLED=true (default: false).

// GetUserByKeycloakSubID returns the local user bound to a Keycloak subject.
func (a *App) GetUserByKeycloakSubID(keycloakSubID string) (*model.User, error) {
	return a.store.GetUserByKeycloakSubID(keycloakSubID)
}

// UpdateSession persists changed session props (server-side session storage
// for the guest workspace context).
func (a *App) UpdateSession(session *model.Session) error {
	return a.store.UpdateSession(session)
}

// GetScaleWorkspaceBinding fetches the local owner-team binding for a central
// workspace ID.
func (a *App) GetScaleWorkspaceBinding(workspaceID string) (*model.ScaleWorkspaceBinding, error) {
	return a.store.GetScaleWorkspaceBinding(workspaceID)
}

// UpsertScaleWorkspaceBinding persists the workspace -> owner team binding.
func (a *App) UpsertScaleWorkspaceBinding(binding *model.ScaleWorkspaceBinding) error {
	return a.store.UpsertScaleWorkspaceBinding(binding)
}

// CreateScaleWorkspaceAuditEvent records a guest-mode mutation attempt with
// the actual actor recorded separately from the owner tenant.
func (a *App) CreateScaleWorkspaceAuditEvent(event *model.ScaleWorkspaceAuditEvent) error {
	return a.store.CreateScaleWorkspaceAuditEvent(event)
}
