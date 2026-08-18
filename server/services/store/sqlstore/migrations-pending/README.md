# Pending migrations — DO NOT APPLY UNTIL APPROVED

This directory is intentionally OUTSIDE the embedded `migrations/` directory
(`//go:embed migrations/*.sql` in `migrate.go`), so nothing in here runs at
server startup.

`000043_add_scale_workspace_tables.{up,down}.sql` are the additive tables for
the disabled-by-default Scale Plus Pro Max Team Workspaces adapter. They use
the same `{{.prefix}}` template conventions as the real migrations directory.

Rollout order (only after explicit approval of the coordinated rollout):

1. Review and approve the SQL.
2. Move both files into `migrations/` so they run as migration 000043.
3. Only then may `SCALE_TEAM_WORKSPACES_ENABLED=true` ever be set.

While the flag is off (the default), no code path touches these tables.
