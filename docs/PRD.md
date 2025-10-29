# ProjectBaser - Product Requirements Document

## ⚠️ CRITICAL: How Theme/Color Changes Work

**DO NOT EDIT HTML TEMPLATES FOR THEME CHANGES!**

Theme colors in this application are **dynamically set by JavaScript at runtime**, not by HTML templates.

**The ONLY file to edit for theme/color changes:**
- **`webapp/src/theme.ts`** - This is where ALL theme colors are defined

**Why?**
- The JavaScript in `theme.ts` reads the theme definitions and **dynamically sets CSS variables** on `document.documentElement.style` when the page loads
- The HTML template (`webapp/html-templates/page.ejs`) contains **inline styles as fallback only**, but they are immediately overridden by JavaScript
- Editing the HTML template will NOT change the live app colors

**Workflow for theme changes:**
1. Edit `webapp/src/theme.ts` (change `defaultTheme` and/or `lightTheme` objects)
2. Rebuild webpack: `cd webapp && npm run pack`
3. Restart server workflow
4. Hard refresh browser (Ctrl+Shift+R or Cmd+Shift+R)

---

## Product Overview

**Product Name:** ProjectBaser  
**Version:** 1.0  
**Last Updated:** October 29, 2025  
**Status:** Production Ready

### Executive Summary
ProjectBaser is a self-hosted project management application designed specifically for technical teams. It provides a flexible, collaborative workspace for organizing tasks, tracking progress, and managing projects across multiple views (Kanban, Table, Gallery, Calendar).

### Vision Statement
To provide technical teams with a powerful, self-hosted project management tool that offers complete control over their data while maintaining enterprise-level features and an intuitive user experience.

---

## Product Goals

### Primary Goals
1. **Self-Hosted Solution**: Provide teams complete ownership and control of their project data
2. **Flexible Organization**: Support multiple view types to accommodate different work styles
3. **Real-Time Collaboration**: Enable seamless team collaboration with live updates
4. **Technical Team Focus**: Optimize workflows for development, engineering, and technical project management

### Success Metrics
- User adoption rate within technical teams
- Daily active users
- Average session duration
- Number of boards created per user
- Team collaboration engagement (comments, mentions, shares)

---

## Target Audience

### Primary Users
- Software development teams
- Engineering departments
- Technical project managers
- DevOps teams
- Product development teams

### User Personas

**Persona 1: Technical Team Lead**
- Needs to track multiple projects simultaneously
- Requires visibility into team capacity and progress
- Values customization and flexibility
- Prefers keyboard shortcuts and efficient workflows

**Persona 2: Software Developer**
- Needs clear task assignments and priorities
- Values quick updates and minimal context switching
- Requires integration-friendly platform
- Prefers clean, distraction-free interface

**Persona 3: Product Manager**
- Needs high-level project overview
- Requires roadmap visualization
- Values reporting and analytics capabilities
- Needs to share project status with stakeholders

---

## Features & Requirements

### Core Features

#### 1. Multi-View Project Management
**Priority:** P0 (Critical)
- **Kanban Board View**: Drag-and-drop cards across customizable columns
- **Table View**: Spreadsheet-like interface for data-heavy projects
- **Gallery View**: Visual card layout for design-focused work
- **Calendar View**: Timeline and deadline visualization

#### 2. User Authentication & Access Control
**Priority:** P0 (Critical)
- Username/password authentication
- Session management with secure tokens
- User permissions and board-level access control
- Team-based access management

#### 3. Board & Card Management
**Priority:** P0 (Critical)
- Unlimited boards per user
- Customizable card properties and attributes
- Card comments and mentions
- File attachments and sharing
- Card archiving and history

#### 4. Real-Time Collaboration
**Priority:** P0 (Critical)
- WebSocket-based live updates
- Multi-user simultaneous editing
- @mentions for team communication
- Activity feed and notifications

#### 5. Templates
**Priority:** P1 (High)
- Pre-built templates for common use cases:
  - Project Tasks
  - Content Calendar
  - Company Goals & OKRs
  - Roadmap
  - Meeting Agenda
  - Sprint Planning
  - User Research Sessions
  - Competitive Analysis
- Custom template creation

#### 6. Filtering & Organization
**Priority:** P1 (High)
- Advanced filtering by properties
- Saved filter views
- Grouping and sorting options
- Search functionality

#### 7. Data Management
**Priority:** P0 (Critical)
- SQLite database with automatic migrations
- File storage and management
- Data export capabilities
- Backup and restore functionality

---

## Technical Requirements

### System Architecture
- **Backend**: Go 1.21+ server
- **Frontend**: React 17 with TypeScript
- **Database**: SQLite3
- **Real-Time**: WebSocket connections
- **Build System**: Webpack for asset bundling

### Performance Requirements
- Page load time: < 2 seconds
- Real-time update latency: < 500ms
- Support for 100+ concurrent users
- Database query response: < 100ms

### Security Requirements
- Secure session token management
- HTTPS support (SSL/TLS)
- SQL injection prevention
- XSS protection
- CSRF protection

### Scalability Requirements
- Horizontal scaling capability
- Database connection pooling
- Efficient WebSocket management
- Static asset caching

---

## User Interface & Experience

### Design Principles
1. **Clean & Professional**: Modern gradient design with blue/purple color scheme
2. **Consistent Iconography**: Lucide icon library throughout
3. **Responsive**: Full mobile and desktop support
4. **Intuitive**: Minimal learning curve for new users
5. **Accessible**: WCAG 2.1 AA compliance

### Key User Flows

#### 1. New User Onboarding
1. User visits landing page
2. Clicks "Get Started"
3. Creates account on registration page
4. Logs in
5. Sees welcome template and getting started guide
6. Creates first board from template or scratch

#### 2. Daily Task Management
1. User logs in (redirected to dashboard)
2. Views existing boards
3. Opens active project board
4. Switches between Kanban/Table/Calendar views
5. Updates card status via drag-and-drop
6. Adds comments and updates
7. Mentions team members as needed

#### 3. Project Creation
1. User clicks "Add board"
2. Chooses template or empty board
3. Customizes board properties
4. Sets permissions and shares with team
5. Begins adding cards and organizing work

---

## Branding & Marketing

### Brand Identity
- **Name**: ProjectBaser
- **Logo**: Lucide "Layers" icon (symbolizes project organization and hierarchy)
- **Color Scheme**: Blue/purple gradient (#667eea to #764ba2)
- **Typography**: Modern sans-serif fonts

### Value Propositions
1. **Complete Control**: Self-hosted solution, your data stays yours
2. **Flexible Views**: Work your way with multiple visualization options
3. **Built for Technical Teams**: Optimized for engineering workflows
4. **Real-Time Collaboration**: Stay in sync with your team
5. **Unlimited Customization**: Tailor boards to your exact needs

### Landing Page Content
- Hero section emphasizing project management for technical teams
- Three key feature callouts:
  - Accelerate Productivity
  - Organize and Visualize Work, Your Way
  - Align Your Teams with Real-Time Collaboration
- Template showcase
- Feature highlights grid
- Call-to-action for getting started

---

## Deployment & Distribution

### Deployment Options
- **VM Deployment**: Production-ready server binary
- **Self-Hosted**: Single server installation
- **Port Configuration**: Default port 5000
- **Environment Variables**: Configurable via config.json

### System Requirements
- Linux-based operating system
- Go runtime (for building from source)
- 2GB+ RAM
- 10GB+ storage
- Network connectivity for WebSocket support

---

## Roadmap & Future Enhancements

### Phase 1 (Current - v1.0)
- ✅ Core project management features
- ✅ Multi-view support
- ✅ Real-time collaboration
- ✅ User authentication
- ✅ Landing page and branding

### Phase 2 (Future)
- Advanced reporting and analytics
- API integrations (GitHub, GitLab, Jira)
- Email notifications
- Advanced user roles and permissions
- Mobile applications (iOS/Android)

### Phase 3 (Future)
- Enterprise SSO integration
- Advanced automation and workflows
- Custom field types
- Enhanced search with full-text indexing
- Multi-language support expansion

---

## Competitive Analysis

### Key Differentiators
1. **Self-Hosted**: Unlike Trello, Asana, or Monday.com
2. **Technical Team Focus**: Optimized for engineering workflows
3. **No Subscription Fees**: One-time setup, no recurring costs
4. **Complete Data Ownership**: All data stays on your infrastructure
5. **Lightweight**: Minimal resource requirements

### Competitive Advantages
- Open architecture for customization
- Real-time collaboration without cloud dependency
- No per-user pricing
- SQLite simplicity (no complex database setup)
- Modern, professional interface

---

## Support & Maintenance

### Documentation
- Product Requirements Document (this document)
- User Guide for end users
- Technical documentation in replit.md
- Build and deployment instructions

### Maintenance Plan
- Regular security updates
- Bug fixes and patches
- Performance optimization
- Feature enhancements based on user feedback

---

## Compliance & Data Privacy

### Data Handling
- All data stored locally in SQLite database
- User credentials hashed and secured
- Session tokens with expiration
- File uploads stored in local filesystem

### Privacy Principles
- No data collection or telemetry (disabled)
- No third-party analytics
- Complete user data ownership
- Transparent data storage

---

## Appendix

### Glossary
- **Board**: A project workspace containing cards
- **Card**: Individual task or item within a board
- **View**: Different ways to visualize board data (Kanban, Table, etc.)
- **Template**: Pre-configured board structure for common use cases
- **Session**: Authenticated user connection with token

### References
- Built on Focalboard architecture
- Lucide icon library for iconography
- React and TypeScript for frontend
- Go for backend services
