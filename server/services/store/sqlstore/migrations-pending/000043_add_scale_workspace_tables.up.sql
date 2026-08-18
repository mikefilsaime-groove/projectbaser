{{- /* DO NOT APPLY UNTIL THE PRO MAX TEAM WORKSPACES ROLLOUT IS APPROVED. */ -}}
{{- /* Additive tables for the disabled-by-default Scale Plus team workspace adapter. */ -}}

{{if not (doesTableExist "scale_workspace_bindings") }}
CREATE TABLE IF NOT EXISTS {{.prefix}}scale_workspace_bindings (
    workspace_id VARCHAR(36) NOT NULL,
    owner_team_id VARCHAR(36) NOT NULL,
    create_at BIGINT NOT NULL,
    update_at BIGINT NOT NULL,
    PRIMARY KEY (workspace_id),
    CONSTRAINT {{.prefix}}scale_workspace_bindings_owner_unique UNIQUE (owner_team_id)
) {{if .mysql}}DEFAULT CHARACTER SET utf8mb4{{end}};
{{end}}

CREATE TABLE IF NOT EXISTS {{.prefix}}scale_workspace_audit_events (
    id VARCHAR(36) NOT NULL,
    workspace_id VARCHAR(36) NOT NULL,
    actor_user_id VARCHAR(36) NOT NULL,
    owner_team_id VARCHAR(36) NOT NULL,
    method VARCHAR(10) NOT NULL,
    path TEXT NOT NULL,
    create_at BIGINT NOT NULL,
    PRIMARY KEY (id)
) {{if .mysql}}DEFAULT CHARACTER SET utf8mb4{{end}};

{{ createIndexIfNeeded "scale_workspace_audit_events" "workspace_id, create_at" }}
