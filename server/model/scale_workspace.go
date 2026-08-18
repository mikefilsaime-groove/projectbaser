// Copyright (c) 2015-present Mattermost, Inc. All Rights Reserved.
// See LICENSE.txt for license information.

package model

// ScaleWorkspaceBinding maps one central Scale Plus workspace ID to exactly
// one existing local owner team (the tenant every guest request is scoped
// to). The table enforces one owner team per workspace and one workspace per
// owner team. Owner data is bound in place; rows are never copied or
// reassigned.
// swagger:model
type ScaleWorkspaceBinding struct {
	// Central opaque workspace ID
	// required: true
	WorkspaceID string `json:"workspaceId"`

	// Local owner team (tenant) the workspace is bound to
	// required: true
	OwnerTeamID string `json:"ownerTeamId"`

	// Creation time in milliseconds since epoch
	// required: true
	CreateAt int64 `json:"createAt"`

	// Last update time in milliseconds since epoch
	// required: true
	UpdateAt int64 `json:"updateAt"`
}

// ScaleWorkspaceAuditEvent records a guest-mode mutation attempt. The actual
// actor (the signed-in member) is recorded separately from the owner tenant
// the request was scoped to.
// swagger:model
type ScaleWorkspaceAuditEvent struct {
	// Event ID
	// required: true
	ID string `json:"id"`

	// Central workspace ID
	// required: true
	WorkspaceID string `json:"workspaceId"`

	// The acting member's local user ID (never the owner)
	// required: true
	ActorUserID string `json:"actorUserId"`

	// The owner team (tenant) the request was scoped to
	// required: true
	OwnerTeamID string `json:"ownerTeamId"`

	// HTTP method
	// required: true
	Method string `json:"method"`

	// Request path
	// required: true
	Path string `json:"path"`

	// Creation time in milliseconds since epoch
	// required: true
	CreateAt int64 `json:"createAt"`
}
