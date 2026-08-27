-- Repair only unambiguous active sidebar links whose category and board belong
-- to different teams. Links without exactly one active default category in the
-- board's team are left untouched for separate reconciliation.

{{if .postgres}}
WITH resolved AS (
    SELECT source.id, MIN(target.id) AS category_id
    FROM {{.prefix}}category_boards AS source
    JOIN {{.prefix}}boards AS board
        ON board.id = source.board_id AND board.delete_at = 0
    JOIN {{.prefix}}categories AS current_category
        ON current_category.id = source.category_id AND current_category.delete_at = 0
    JOIN {{.prefix}}categories AS target
        ON target.user_id = source.user_id
        AND target.team_id = board.team_id
        AND target.name = 'Boards'
        AND target.delete_at = 0
    WHERE board.team_id <> current_category.team_id
    GROUP BY source.id
    HAVING COUNT(target.id) = 1
)
UPDATE {{.prefix}}category_boards AS category_board
SET category_id = resolved.category_id
FROM resolved
WHERE category_board.id = resolved.id;
{{end}}

{{if .mysql}}
UPDATE {{.prefix}}category_boards AS category_board
JOIN (
    SELECT source.id, MIN(target.id) AS category_id
    FROM {{.prefix}}category_boards AS source
    JOIN {{.prefix}}boards AS board
        ON board.id = source.board_id AND board.delete_at = 0
    JOIN {{.prefix}}categories AS current_category
        ON current_category.id = source.category_id AND current_category.delete_at = 0
    JOIN {{.prefix}}categories AS target
        ON target.user_id = source.user_id
        AND target.team_id = board.team_id
        AND target.name = 'Boards'
        AND target.delete_at = 0
    WHERE board.team_id <> current_category.team_id
    GROUP BY source.id
    HAVING COUNT(target.id) = 1
) AS resolved ON resolved.id = category_board.id
SET category_board.category_id = resolved.category_id;
{{end}}

{{if .sqlite}}
WITH resolved AS (
    SELECT source.id, MIN(target.id) AS category_id
    FROM {{.prefix}}category_boards AS source
    JOIN {{.prefix}}boards AS board
        ON board.id = source.board_id AND board.delete_at = 0
    JOIN {{.prefix}}categories AS current_category
        ON current_category.id = source.category_id AND current_category.delete_at = 0
    JOIN {{.prefix}}categories AS target
        ON target.user_id = source.user_id
        AND target.team_id = board.team_id
        AND target.name = 'Boards'
        AND target.delete_at = 0
    WHERE board.team_id <> current_category.team_id
    GROUP BY source.id
    HAVING COUNT(target.id) = 1
)
UPDATE {{.prefix}}category_boards
SET category_id = (
    SELECT resolved.category_id
    FROM resolved
    WHERE resolved.id = {{.prefix}}category_boards.id
)
WHERE id IN (SELECT id FROM resolved);
{{end}}
