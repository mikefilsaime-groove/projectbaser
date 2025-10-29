{{if doesTableExist "team_users" }}
DROP TABLE {{.prefix}}team_users;
{{end}}
