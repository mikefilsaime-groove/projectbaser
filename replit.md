# Focalboard - Project Management Tool

## Overview
Focalboard is an open-source, multilingual, self-hosted project management tool that serves as an alternative to Trello, Notion, and Asana. This is the Personal Server edition running on Replit.

## Current State
- **Status**: Fully functional and running
- **Server**: Go backend on port 5000
- **Frontend**: React webapp (webpack bundled)
- **Database**: SQLite3 (local file-based)
- **Authentication**: Native authentication enabled

## Architecture
- **Backend**: Go 1.21 server (`server/`)
  - RESTful API for board management
  - WebSocket support for real-time updates
  - SQLite database with automatic migrations
  
- **Frontend**: React 17 application (`webapp/`)
  - Webpack bundled production build
  - Multi-language support (i18n)
  - Responsive UI with multiple view types (Kanban, Table, Calendar, Gallery)

## Recent Setup (October 29, 2025)
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
├── webapp/                 # React frontend source
│   ├── src/               # TypeScript/React components
│   └── pack/              # Production build output
├── config.json            # Server configuration
├── focalboard.db          # SQLite database (auto-created)
└── files/                 # Uploaded files storage
```

## Configuration Details
- **Server Port**: 5000 (frontend and backend integrated)
- **Database**: SQLite with busy timeout of 5000ms
- **File Storage**: Local filesystem (`./files/`)
- **Telemetry**: Disabled
- **Public Sharing**: Disabled by default
- **Authentication Mode**: Native (username/password)

## How to Use
1. Access the application through the Replit webview
2. Create an account by clicking "create an account if you don't have one"
3. Log in with your credentials
4. Start creating boards and managing projects

## Build Commands
- **Install dependencies**: `cd webapp && npm install`
- **Build webapp**: `cd webapp && npm run pack`
- **Build server**: `cd server && go build -ldflags '-X "github.com/mattermost/focalboard/server/model.BuildNumber=dev" -X "github.com/mattermost/focalboard/server/model.Edition=dev"' -tags 'json1 sqlite3' -o ../bin/focalboard-server ./main`

## Deployment
The project is configured for VM deployment with the production-ready server binary. The deployment automatically starts the server on port 5000.

## Data Storage
- Database: `./focalboard.db` (SQLite)
- Uploaded files: `./files/`
- Session data: Stored in database

## Notes
- The server includes 13 pre-loaded template boards for quick start
- WebSocket connections enable real-time collaboration
- All data persists in the SQLite database between restarts
