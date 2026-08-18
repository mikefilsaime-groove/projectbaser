// Copyright (c) 2015-present Mattermost, Inc. All Rights Reserved.
// See LICENSE.txt for license information.

package sqlstore

import (
	"database/sql"
	"errors"

	sq "github.com/Masterminds/squirrel"
	"github.com/mattermost/focalboard/server/model"
	"github.com/mattermost/focalboard/server/utils"
)

// NOTE: These methods depend on the additive tables defined in
// migrations-pending/000043_add_scale_workspace_tables.up.sql, which must be
// reviewed, approved, and applied BEFORE SCALE_TEAM_WORKSPACES_ENABLED is
// ever switched on. While the flag is off (the default) nothing calls them.

func (s *SQLStore) getScaleWorkspaceBinding(db sq.BaseRunner, workspaceID string) (*model.ScaleWorkspaceBinding, error) {
	query := s.getQueryBuilder(db).
		Select("workspace_id", "owner_team_id", "create_at", "update_at").
		From(s.tablePrefix + "scale_workspace_bindings").
		Where(sq.Eq{"workspace_id": workspaceID})

	row := query.QueryRow()
	binding := model.ScaleWorkspaceBinding{}
	err := row.Scan(&binding.WorkspaceID, &binding.OwnerTeamID, &binding.CreateAt, &binding.UpdateAt)
	if errors.Is(err, sql.ErrNoRows) {
		return nil, model.NewErrNotFound("scale workspace binding " + workspaceID)
	}
	if err != nil {
		return nil, err
	}
	return &binding, nil
}

func (s *SQLStore) upsertScaleWorkspaceBinding(db sq.BaseRunner, binding *model.ScaleWorkspaceBinding) error {
	now := utils.GetMillis()

	existing, err := s.getScaleWorkspaceBinding(db, binding.WorkspaceID)
	if err != nil && !model.IsErrNotFound(err) {
		return err
	}
	if existing != nil {
		if existing.OwnerTeamID != binding.OwnerTeamID {
			// A workspace can never be re-pointed at a different owner team.
			return model.NewErrBadRequest("scale workspace binding conflict")
		}
		update := s.getQueryBuilder(db).
			Update(s.tablePrefix+"scale_workspace_bindings").
			Set("update_at", now).
			Where(sq.Eq{"workspace_id": binding.WorkspaceID})
		_, updateErr := update.Exec()
		return updateErr
	}

	insert := s.getQueryBuilder(db).
		Insert(s.tablePrefix+"scale_workspace_bindings").
		Columns("workspace_id", "owner_team_id", "create_at", "update_at").
		Values(binding.WorkspaceID, binding.OwnerTeamID, now, now)
	_, err = insert.Exec()
	return err
}

func (s *SQLStore) createScaleWorkspaceAuditEvent(db sq.BaseRunner, event *model.ScaleWorkspaceAuditEvent) error {
	id := event.ID
	if id == "" {
		id = utils.NewID(utils.IDTypeNone)
	}
	insert := s.getQueryBuilder(db).
		Insert(s.tablePrefix+"scale_workspace_audit_events").
		Columns("id", "workspace_id", "actor_user_id", "owner_team_id", "method", "path", "create_at").
		Values(id, event.WorkspaceID, event.ActorUserID, event.OwnerTeamID, event.Method, event.Path, utils.GetMillis())
	_, err := insert.Exec()
	return err
}
