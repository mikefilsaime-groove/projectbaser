# ProjectBaser - Project Management Tool

### Overview
ProjectBaser is a self-hosted, multi-tenant project management tool designed for technical teams, built on a re-branded and modernized Focalboard architecture. It offers a professional user experience with a focus on data isolation, real-time collaboration, and a modern UI, enabling thousands of independent organizations to securely manage projects within a single instance. The project aims to provide a robust, scalable, and visually appealing solution for project management.

### User Preferences
I prefer simple language and clear, concise explanations. For development, I favor iterative progress and clear communication. Please ask for my approval before implementing any major architectural changes or significant feature modifications. I value detailed explanations for complex concepts but prefer direct answers for routine queries. I do not want any changes to be made to the `/backup-css/` and `/backup-css-current/` folders.

### System Architecture
**UI/UX Decisions:**
- **Design Style:** Modern ShadCN-inspired aesthetic (clean, professional, accessible)
- **Color Scheme:** Blue/purple gradient (matching Brand Baser style)
- **Theming:** Dynamic theme colors set by JavaScript at runtime via `webapp/src/theme.ts`. Direct editing of HTML templates for theme changes is strictly prohibited.
- **Iconography:** Exclusive use of professional Lucide SVG icons; all emojis have been replaced and converted to Lucide icon names in the database.
- **Typography:** Inter font family for a modern sans-serif look.
- **Landing Page:** Single-page marketing site with hero, features, templates, and CTA sections.
- **Login/Register Pages:** Re-skinned with modern gradient backgrounds and clean white card designs.
- **Animations:** Enhanced drag-and-drop animations with directional tilt, custom floating preview, and visual drop indicators for improved UX.

**Technical Implementations:**
- **Backend:** Go 1.21 server (`server/`) providing a RESTful API, WebSocket support for real-time updates, and SQLite database integration with automatic migrations.
- **Frontend:** React 17 application (`webapp/`) bundled with Webpack, featuring multi-language support (i18n) and responsive UI across multiple view types (Kanban, Table, Calendar, Gallery).
- **Multi-Tenancy:**
    - Complete data isolation for each organization (team).
    - Automatic organization creation upon user registration, assigning the user as the owner.
    - Role-Based Access Control (owner, admin, member).
    - Session-based team context for secure request handling.
    - `GlobalTeamID="0"` reserved for system-wide templates.
    - Security layers include user registration validation, session team context loading, permission layer security, API endpoint protection (`validateTeamAccess`), and WebSocket real-time security.
- **Icon System:**
    - `lucideIconList.ts` for curated icon lists and emoji-to-Lucide mapping.
    - `LucidePicker` component for searchable icon selection.
    - Database stores icon names, and UI renders Lucide components.
    - Property badges automatically display Lucide icons based on text patterns (e.g., "High" → Flame icon).
- **Webpack Configuration:** Uses content-hashed filenames (`[name].[contenthash:8].js`) to bypass Replit CDN caching issues.

**Feature Specifications:**
- **About Page:** Professional page detailing ProjectBaser features, multi-tenant architecture, and version info, accessible via the user dropdown.
- **Authentication:** Native username/password authentication.
- **Project Structure:** Clear separation of Go backend, React frontend, static assets, and configuration files.

**System Design Choices:**
- **Server Port:** 5000.
- **Database:** SQLite (`focalboard.db`) with a busy timeout of 5000ms.
- **File Storage:** Local filesystem (`./files/`).
- **Routing:** Smart redirect at the root (`/`) for unauthenticated users to the landing page and authenticated users to the dashboard. SPA for all other routes.
- **Pre-loaded Templates:** Includes 13 pre-loaded template boards.

### External Dependencies
- **Node.js:** v20 (for frontend development).
- **Go:** v1.21 (for backend development).
- **React:** v17.
- **Webpack:** For bundling the React frontend.
- **SQLite3:** Local file-based database (`focalboard.db`).
- **lucide-react:** For professional SVG icons.
- **Google Fonts:** For Inter font family.