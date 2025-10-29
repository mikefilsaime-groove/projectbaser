{{- /* Create team_users table for multi-tenant user-to-team membership */ -}}
{{if not (doesTableExist "team_users") }}
CREATE TABLE IF NOT EXISTS {{.prefix}}team_users (
    team_id VARCHAR(36) NOT NULL,
    user_id VARCHAR(36) NOT NULL,
    role VARCHAR(20) NOT NULL DEFAULT 'member',
    {{if .postgres}}created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),{{end}}
    {{if .sqlite}}created_at DATETIME NOT NULL DEFAULT(STRFTIME('%Y-%m-%d %H:%M:%f', 'NOW')),{{end}}
    {{if .mysql}}created_at DATETIME(6) NOT NULL DEFAULT NOW(6),{{end}}
    PRIMARY KEY (team_id, user_id)
) {{if .mysql}}DEFAULT CHARACTER SET utf8mb4{{end}};

{{- /* Create indexes for efficient queries */ -}}
{{ createIndexIfNeeded "team_users" "user_id" }}
{{ createIndexIfNeeded "team_users" "team_id" }}

{{- /* Migrate existing users to GlobalTeamID='0' for backward compatibility */ -}}
{{- /* This ensures existing users can still access their data after the migration */ -}}
INSERT INTO {{.prefix}}team_users (team_id, user_id, role)
SELECT '0', id, 'owner' FROM {{.prefix}}users
WHERE id NOT IN (SELECT user_id FROM {{.prefix}}team_users);

{{end}}
