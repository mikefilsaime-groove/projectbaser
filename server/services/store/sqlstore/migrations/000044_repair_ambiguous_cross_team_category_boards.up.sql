-- Repair the remaining active cross-team sidebar links. When a user has more
-- than one system "Boards" category in the board's team, choose the same
-- category the sidebar reads first: lowest sort_order, then lowest ID.
-- Links with no such category remain untouched; the normal default-category
-- creation path creates one and assigns the board on the user's next load.

{{if .postgres}}
WITH resolved AS (
    SELECT source.id, target.id AS category_id
    FROM {{.prefix}}category_boards AS source
    JOIN {{.prefix}}boards AS board
        ON board.id = source.board_id AND board.delete_at = 0
    JOIN {{.prefix}}categories AS current_category
        ON current_category.id = source.category_id AND current_category.delete_at = 0
    JOIN {{.prefix}}categories AS target
        ON target.user_id = source.user_id
        AND target.team_id = board.team_id
        AND target.name = 'Boards'
        AND target.type = 'system'
        AND target.delete_at = 0
    WHERE board.team_id <> current_category.team_id
        AND NOT EXISTS (
            SELECT 1
            FROM {{.prefix}}categories AS preferred
            WHERE preferred.user_id = source.user_id
                AND preferred.team_id = board.team_id
                AND preferred.name = 'Boards'
                AND preferred.type = 'system'
                AND preferred.delete_at = 0
                AND (
                    preferred.sort_order < target.sort_order
                    OR (preferred.sort_order = target.sort_order AND preferred.id < target.id)
                )
        )
)
UPDATE {{.prefix}}category_boards AS category_board
SET category_id = resolved.category_id
FROM resolved
WHERE category_board.id = resolved.id;
{{end}}

{{if .mysql}}
UPDATE {{.prefix}}category_boards AS category_board
JOIN (
    SELECT source.id, target.id AS category_id
    FROM {{.prefix}}category_boards AS source
    JOIN {{.prefix}}boards AS board
        ON board.id = source.board_id AND board.delete_at = 0
    JOIN {{.prefix}}categories AS current_category
        ON current_category.id = source.category_id AND current_category.delete_at = 0
    JOIN {{.prefix}}categories AS target
        ON target.user_id = source.user_id
        AND target.team_id = board.team_id
        AND target.name = 'Boards'
        AND target.type = 'system'
        AND target.delete_at = 0
    WHERE board.team_id <> current_category.team_id
        AND NOT EXISTS (
            SELECT 1
            FROM {{.prefix}}categories AS preferred
            WHERE preferred.user_id = source.user_id
                AND preferred.team_id = board.team_id
                AND preferred.name = 'Boards'
                AND preferred.type = 'system'
                AND preferred.delete_at = 0
                AND (
                    preferred.sort_order < target.sort_order
                    OR (preferred.sort_order = target.sort_order AND preferred.id < target.id)
                )
        )
) AS resolved ON resolved.id = category_board.id
SET category_board.category_id = resolved.category_id;
{{end}}

{{if .sqlite}}
WITH resolved AS (
    SELECT source.id, target.id AS category_id
    FROM {{.prefix}}category_boards AS source
    JOIN {{.prefix}}boards AS board
        ON board.id = source.board_id AND board.delete_at = 0
    JOIN {{.prefix}}categories AS current_category
        ON current_category.id = source.category_id AND current_category.delete_at = 0
    JOIN {{.prefix}}categories AS target
        ON target.user_id = source.user_id
        AND target.team_id = board.team_id
        AND target.name = 'Boards'
        AND target.type = 'system'
        AND target.delete_at = 0
    WHERE board.team_id <> current_category.team_id
        AND NOT EXISTS (
            SELECT 1
            FROM {{.prefix}}categories AS preferred
            WHERE preferred.user_id = source.user_id
                AND preferred.team_id = board.team_id
                AND preferred.name = 'Boards'
                AND preferred.type = 'system'
                AND preferred.delete_at = 0
                AND (
                    preferred.sort_order < target.sort_order
                    OR (preferred.sort_order = target.sort_order AND preferred.id < target.id)
                )
        )
)
UPDATE {{.prefix}}category_boards
SET category_id = (
    SELECT resolved.category_id
    FROM resolved
    WHERE resolved.id = {{.prefix}}category_boards.id
)
WHERE id IN (SELECT id FROM resolved);
{{end}}
