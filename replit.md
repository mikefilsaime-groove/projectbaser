# ProjectBaser - Project Management Tool

## Overview
ProjectBaser is a self-hosted project management tool for technical teams. Built on Focalboard's architecture, it has been completely rebranded with modern styling and a professional landing page.

## Current State
- **Status**: Fully functional and running
- **Branding**: Complete ProjectBaser rebrand with modern blue/purple gradient design
- **Landing Page**: Stunning one-page marketing site at root /
- **Server**: Go backend on port 5000
- **Frontend**: React webapp (webpack bundled)
- **Database**: SQLite3 (local file-based)
- **Authentication**: Native authentication enabled

## Architecture
- **Backend**: Go 1.21 server (`server/`)
  - RESTful API for board management
  - WebSocket support for real-time updates
  - SQLite database with automatic migrations
  - Custom routing to serve landing page at root
  
- **Frontend**: React 17 application (`webapp/`)
  - Webpack bundled production build
  - Multi-language support (i18n)
  - Responsive UI with multiple view types (Kanban, Table, Calendar, Gallery)
  - Modern login/registration pages with gradient backgrounds

- **Landing Page**: Static HTML/CSS (`webapp/static/landing/`)
  - Modern single-page marketing site
  - Blue/purple gradient design (matching Brand Baser style)
  - Stock images for feature sections
  - Custom ProjectBaser logo
  - No open source or pricing references
  - CTA buttons linking to /login

## Recent Changes (October 29, 2025)
### Rebranding to ProjectBaser
1. Generated custom ProjectBaser icon (geometric, professional design)
2. Implemented consistent icon across all pages:
   - Landing page navigation
   - Login page header
   - Registration page header
   - App sidebar
   - Favicon
3. Removed version number display (v8.0.0) from sidebar for cleaner look
4. Replaced ALL emojis with professional Lucide-style SVG icons:
   - Section headers on landing page
   - Template cards
   - Feature highlights
5. Created stunning landing page based on focalboard.com content
6. Re-skinned login and registration pages with modern gradient design
7. Updated all UI references from "Focalboard" to "ProjectBaser"
8. Removed all open source references and pricing information
9. Downloaded and integrated professional stock images
10. Modified Go server routing to serve landing page at root /

### Previous Setup
1. Installed Node.js 20 and Go 1.21
2. Built React webapp using webpack (production bundle)
3. Compiled Go server with SQLite support
4. Configured server to run on port 5000 (Replit standard)
5. Disabled localMode socket to avoid filesystem conflicts
6. Set up deployment configuration for VM deployment

## Project Structure
```
.
├── bin/                    # Compiled server binary
├── server/                 # Go backend source
│   └── web/               # Web server with custom routing
├── webapp/                 # React frontend source
│   ├── src/               # TypeScript/React components
│   │   └── pages/        # Login/register pages (re-skinned)
│   ├── static/landing/   # Landing page assets
│   │   ├── index.html    # Marketing landing page with Lucide icons
│   │   ├── icon.png      # ProjectBaser icon
│   │   └── *.jpg         # Stock images
│   ├── static/           # Static assets
│   │   ├── app-icon.png  # App icon (used in sidebar)
│   │   └── favicon.png   # Browser favicon
│   └── pack/              # Production build output
├── config.json            # Server configuration
├── focalboard.db          # SQLite database (auto-created)
└── files/                 # Uploaded files storage
```

## Design & Branding
- **Color Scheme**: Blue/purple gradient (matching Brand Baser style)
- **Icon**: Custom geometric icon used consistently across all pages
- **Icons Style**: Professional Lucide-style SVG icons (NO emojis)
- **Typography**: Modern sans-serif fonts
- **Landing Page**: Single-page design with hero, features, templates, and CTA sections
- **Login/Register**: Matching gradient background with clean white card design
- **Sidebar**: Clean design without version number

## Configuration Details
- **Server Port**: 5000 (frontend and backend integrated)
- **Database**: SQLite with busy timeout of 5000ms
- **File Storage**: Local filesystem (`./files/`)
- **Telemetry**: Disabled
- **Public Sharing**: Disabled by default
- **Authentication Mode**: Native (username/password)
- **Routing**: Custom routing serves landing page at / and SPA for all other routes

## How to Use
1. Visit the landing page at the root URL
2. Click "Get Started" to go to login
3. Create an account by clicking "or create an account if you don't have one"
4. Log in with your credentials
5. Start creating boards and managing projects

## Build Commands
- **Install dependencies**: `cd webapp && npm install`
- **Build webapp**: `cd webapp && npm run pack`
- **Build server**: `cd server && go build -ldflags '-X "github.com/mattermost/focalboard/server/model.BuildNumber=dev"' -tags 'json1 sqlite3' -o ../bin/focalboard-server ./main`
- **Rebuild everything**: Run build server, then build webapp, then restart workflow

## Deployment
The project is configured for VM deployment with the production-ready server binary. The deployment automatically starts the server on port 5000.

## Data Storage
- Database: `./focalboard.db` (SQLite)
- Uploaded files: `./files/`
- Session data: Stored in database
- Landing page assets: `./webapp/static/landing/`

## Notes
- The server includes 13 pre-loaded template boards for quick start
- WebSocket connections enable real-time collaboration
- All data persists in the SQLite database between restarts
- Landing page is pure HTML/CSS for fast loading
- Login/register pages are React components with SCSS styling
