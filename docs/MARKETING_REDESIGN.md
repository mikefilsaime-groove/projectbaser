# ProjectBaser Marketing Redesign

## Scope

The public page at `/static/landing/index.html` is a full one-page redesign. The prior page used generic stock photography, legacy-style positioning, unsupported limit claims, and an unsupported customer-count statement. The replacement is built around the current ProjectBaser workflow and the Scale.gg product-site family system.

The authenticated React/Go application, its routes, and its runtime theme behavior are unchanged. The marketing page is a standalone light presentation with explicit colors and no theme toggle.

## Verified product claims used

- Boards and cards with custom properties
- Kanban, Table, Gallery, and Calendar views over the same board data
- Filters, grouping, sorting, and search
- Board sharing with view-only, edit, and admin access
- Card comments and mentions
- Real-time collaborator updates
- Pre-built and custom templates
- Archiving, export, and backup workflows
- Available now and included in Scale.gg Pro

The page intentionally omits team-size, storage, board, project, and other product limits. It also omits customer counts, performance promises, savings claims, security/compliance guarantees, and legacy Focalboard positioning.

## Product UI presentation

The visual system uses purpose-built HTML/CSS representations of the current ProjectBaser experience instead of legacy screenshots or stock imagery. The interactive view switcher demonstrates the same sample project in Kanban, Table, Gallery, and Calendar views. The card-detail, sharing, comments, and activity compositions reinforce verified product mechanics without presenting fictional results as product data.

## Verification

Build the complete web application bundle with:

```bash
cd webapp
npm run pack
```

Then serve `webapp` locally and inspect `/static/landing/index.html` at desktop and mobile widths. Verify the mobile navigation, all four view tabs, FAQ disclosures, one-page anchors, `/login` calls to action, metadata, and structured data.
