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

### UI Modernization - ShadCN-Inspired Design
Complete modernization from "Bootstrap 2010" look to contemporary ShadCN aesthetic:

**Global CSS Variables** (`webapp/src/styles/`)
- Modern color palette with darker contrast (rgb(9, 9, 11) for text)
- Dark modern sidebar (rgb(24, 24, 27)) 
- Soft elevation shadows (ShadCN-inspired layered shadows)
- Larger border radius (8px default, 12px modals, 10px cards)
- Consistent RGB triplet format for all color variables
- Additional modern utility colors (border, muted backgrounds, accent)
- CSS backup stored in `/backup-css/` for easy rollback

**Complete Emoji Replacement with Lucide Icons**
- Installed `lucide-react` package for professional icon system
- Created `lucideIconList.ts` with 150+ curated Lucide icons
- Built searchable `LucidePicker` component replacing emoji picker
- Implemented emoji-to-Lucide mapping for backward compatibility
- Updated all icon selectors to render Lucide SVG icons
- Handles multi-codepoint emojis (ZWJ sequences, variation selectors)
- Board icons, card icons, and template icons all use Lucide
- Existing emoji data automatically converts to Lucide icons
- **Fixed webpack tree-shaking**: Changed from `import *` to explicit named imports (100+ icons) to prevent bundler from removing Lucide library

**Icon System Architecture**
- `lucideIconList.ts`: Curated icon lists and emoji mapping (source of truth for emoji→Lucide conversion)
- `lucidePicker.tsx/scss`: Modern searchable icon picker (8x grid, 352px wide)
- `blockIconSelector.tsx`: Renders Lucide icons for cards in detail view (explicit imports to force bundling)
- `kanbanCard.tsx`: Renders Lucide icons for cards in kanban board (explicit imports to force bundling)
- `boardIconSelector.tsx`: Renders Lucide icons for boards
- `iconSelector.tsx`: Updated menu to use LucidePicker
- `blockIcons.ts`: Random Lucide icon selection

**Known Limitation**: Icon imports are explicitly listed in blockIconSelector.tsx and kanbanCard.tsx to prevent webpack tree-shaking. When adding new emojis to `emojiToLucideMap`, the corresponding Lucide components must also be added to the import statements in both files. Future improvement: Create a shared icon component to centralize this logic.

**Webpack Content-Hash Fix for Replit CDN**
- Replit's front-door proxy/CDN was caching `/static/main.js` and ignoring cache-control headers and query-string hashes
- Solution: Changed webpack output to use content-hashed filenames: `[name].[contenthash:8].js`
- Now generates files like `main.3ce10848.js` instead of `main.js?hash`
- Forces Replit's CDN to fetch new files when bundle content changes
- Disabled HtmlWebpackPlugin's `hash: true` option (redundant with contenthash in filename)

**Emoji Normalization Fix**
- Database stored emojis with variation selectors (U+FE0F) and zero-width joiners (U+200D)
- Example: stored as `📝️` (length 3) instead of `📝` (length 2)
- Updated `convertEmojiToLucideIcon` in `lucideIconList.ts` to normalize emoji input before lookup
- Strips variation selectors and zero-width joiners: `.replace(/[\uFE0F\u200D]/g, '').trim()`
- Now correctly maps stored emoji variants to Lucide icons
- Also fixed dynamic favicon override in `utils.ts` to use static `favicon.svg` instead of emoji data URIs

### Rebranding to ProjectBaser
1. Implemented Lucide "Layers" icon (inline SVG) consistently across all pages:
   - Landing page navigation
   - Login page header
   - Registration page header
   - App sidebar (FocalboardLogoIcon component)
   - Favicon (SVG version)
2. Removed version number display (v8.0.0) from sidebar for cleaner look
3. Replaced ALL emojis with professional Lucide-style SVG icons:
   - Section headers on landing page (Layers, Grid, Users icons)
   - Template cards (Check, Calendar, Clock icons, etc.)
   - Feature highlights (Grid, File, Folder, Lock icons, etc.)
   - In-app board and card icons (via Lucide icon system)
4. Created stunning landing page based on focalboard.com content
5. Re-skinned login and registration pages with modern gradient design
6. Updated all UI references from "Focalboard" to "ProjectBaser"
7. Removed all open source references and pricing information
8. Downloaded and integrated professional stock images
9. Modified React routing:
   - Smart redirect at "/" routes logged-in users to dashboard, others to login
   - No more landing page for authenticated users
   - Client-side login state detection

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
│   │   └── *.jpg         # Stock images
│   ├── static/           # Static assets
│   │   └── favicon.svg   # Browser favicon (Lucide Layers icon)
│   └── pack/              # Production build output
├── config.json            # Server configuration
├── focalboard.db          # SQLite database (auto-created)
└── files/                 # Uploaded files storage
```

## Design & Branding
- **Design Style**: Modern ShadCN-inspired aesthetic (clean, professional, accessible)
- **Color Scheme**: Blue/purple gradient (matching Brand Baser style)
- **Primary Colors**: Darker text contrast, modern blue links, subtle borders
- **Shadows**: Soft layered elevations (no harsh Bootstrap shadows)
- **Border Radius**: 8px+ for modern rounded corners
- **Logo**: Lucide "Layers" icon (inline SVG) used consistently everywhere
- **Icons Style**: Professional Lucide SVG icons (NO emojis anywhere)
- **Typography**: Modern sans-serif fonts with better spacing
- **Landing Page**: Single-page design with hero, features, templates, and CTA sections
- **Login/Register**: Matching gradient background with clean white card design
- **Sidebar**: Clean dark modern design without version number
- **Favicon**: SVG version of Layers icon
- **Icon Picker**: Searchable grid interface with 150+ professional icons

## Configuration Details
- **Server Port**: 5000 (frontend and backend integrated)
- **Database**: SQLite with busy timeout of 5000ms
- **File Storage**: Local filesystem (`./files/`)
- **Telemetry**: Disabled
- **Public Sharing**: Disabled by default
- **Authentication Mode**: Native (username/password)
- **Routing**: 
  - Landing page at / for unauthenticated users
  - App dashboard at / for authenticated users (checks FOCALBOARDAUTHTOKEN cookie)
  - SPA for all other routes

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
