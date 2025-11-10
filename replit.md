# Leave Management System

## Overview
A comprehensive leave management system combining a WhatsApp bot and web dashboard for managing employee leave requests. Successfully imported from GitHub and configured for Replit.

**Project Type**: WhatsApp Bot + Web Dashboard (Express + EJS)  
**Main Features**: Leave tracking, admin approval system, PDF reports, public leave display  
**Timezone**: Asia/Colombo (Sri Lanka)

## Current Status (November 10, 2025)
- ✅ **Replit Setup**: Complete and running
- ✅ **Web Dashboard**: Running on port 5000 with webview
- ✅ **WhatsApp Bot**: Connected and operational ✔️
- ✅ **Security**: Admin credentials configured via Replit Secrets
- ✅ **Database**: Single leave.json file shared by bot and dashboard
- ✅ **Commands**: Work with or without prefix (flexible usage)
- ✅ **Deployment**: Configured for autoscale deployment

## Quick Start

### Access the Dashboard
- **Login Page**: Click the webview or navigate to your Replit URL
- **Use Your Credentials**: Login with the ADMIN_USERNAME and ADMIN_PASSWORD you set in Replit Secrets
- **Public Today's Leave Page**: Available at `/today` (no login required)

### Default Routes
- `/` or `/admin` - Login page (redirects to dashboard if logged in)
- `/dashboard` - Main admin dashboard (requires authentication)
- `/today` - Public page showing today's leaves
- `/logout` - Logout and return to login page

### WhatsApp Commands (Work with or without prefix)
- `menu` or `.menu` - Show all commands
- `leave` or `.leave` (or `l`) - Request full day leave
- `halfleave` or `.halfleave` (or `hl`) - Request half day leave
- `leavelogs` or `.ll` - View all leave requests
- `.approve` - Admin: Approve pending request
- `.reject` - Admin: Reject pending request
- `.tagall` - Admin: Tag all members

## Project Structure

### Core Files
- `start.js` - Main startup script (simplified for Replit)
- `server.js` - Express web server with dashboard (port 5000)
- `nexa.js` - WhatsApp bot using Baileys library (optional)
- `setting.js` - Global configuration
- `system/case.js` - WhatsApp bot command handlers

### Frontend (EJS Templates)
- `views/login.ejs` - Admin login page
- `views/dashboard.ejs` - Main admin dashboard with search, filters, approval/rejection
- `views/today.ejs` - Public page showing today's leaves

### Database
- `nexaDB/` - JSON-based database directory
- `leave.json` - Main leave database
- Additional JSON files for user data, balances, premium features

## Features

### Web Dashboard (Port 5000)
1. **Login System** - Secure admin authentication via Replit Secrets
2. **Search Functionality** - Search leaves by name or phone number
3. **Approval/Rejection** - Admins can approve or reject pending leaves
4. **Monthly Filtering** - View leaves by year and month
5. **Statistics Dashboard** - Real-time stats for total, approved, and pending leaves
6. **PDF Reports** - Download monthly reports with tables and bar charts
7. **Delete Function** - Remove leave records
8. **Today's Leaves Page** - Public page (no login) showing current day's leaves

### WhatsApp Bot (Optional - Currently Disabled)
The WhatsApp bot component is available but requires setup:
- Leave request commands (.leave, .halfleave)
- Admin approval/rejection via WhatsApp
- Restricted to designated WhatsApp group
- **To Enable**: Requires WhatsApp session authentication

## Configuration

### Environment Variables (Replit Secrets)
Your admin credentials are securely stored in Replit Secrets:
- `ADMIN_USERNAME` - Your admin username ✅ Configured
- `ADMIN_PASSWORD` - Your admin password ✅ Configured

To update:
1. Open Secrets panel in Replit
2. Update ADMIN_USERNAME and/or ADMIN_PASSWORD
3. Restart the application

### WhatsApp Settings (setting.js)
If you want to enable the WhatsApp bot:
- Global admins: `["94781352903", "94760405102"]`
- Owner: `"94760405102"`
- Bot name: "Miss Nexa"
- Leave group URL: Configurable in `global.leaveGroup`
- Timezone: Asia/Colombo

## Running the Project

### Development (Replit)
The workflow is configured to run automatically:
```bash
npm start
```

This starts the web dashboard on port 5000. The WhatsApp bot is disabled by default.

### Deployment
Deployment is configured for Replit's autoscale deployment:
- **Type**: Autoscale (stateless web application)
- **Command**: `node start.js`
- **Port**: 5000 (automatically exposed)

To deploy: Click the "Deploy" button in Replit

## Database Schema

### Full Day Leave Object
```json
{
  "user": "94XXXXXXXXXX@s.whatsapp.net",
  "name": "John Doe",
  "date": "2025.11.15",
  "status": "pending|approved|rejected",
  "requestedAt": "2025-11-07T10:30:00.000Z",
  "approvedAt": "2025-11-07T11:00:00.000Z",
  "approvedBy": "94XXXXXXXXXX@s.whatsapp.net"
}
```

### Half Day Leave Object
```json
{
  "user": "94XXXXXXXXXX@s.whatsapp.net",
  "name": "Jane Smith",
  "time": "Morning|Afternoon",
  "status": "pending|approved|rejected",
  "requestedAt": "2025-11-07T10:30:00.000Z",
  "approvedAt": "2025-11-07T11:00:00.000Z"
}
```

## Dependencies

### Web Server
- express: Web framework
- ejs: Template engine
- pdfkit: PDF generation
- body-parser: Request parsing
- cors: Cross-origin support

### WhatsApp Bot (Optional)
- @whiskeysockets/baileys: WhatsApp Web API
- @hapi/boom: Error handling
- pino: Logging
- qrcode-terminal: QR code display
- awesome-phonenumber: Phone number validation

### Utilities
- chalk: Terminal colors
- moment-timezone: Date/time handling
- axios: HTTP requests
- jimp: Image processing
- file-type: File detection

## Recent Changes

### November 10, 2025 - Critical Fixes (Latest)
- ✅ **Fixed "gl" command** - Button IDs now use correct leaveId for approve/reject
- ✅ **Fixed "halfconfirm" command** - Button IDs now use correct leaveId for approvehalf/rejecthalf
- ✅ **Verified approve/reject system** - All approval commands working correctly
- ✅ **Confirmed auto-delete** - Messages automatically deleted after approval/rejection
- ✅ **Architect reviewed** - All fixes verified with no security issues

### November 10, 2025 - Command & Database Updates
- ✅ **Removed prefix requirement** - Commands now work with or without prefix
- ✅ **Simplified database** - Single `leave.json` file for both bot and dashboard
- ✅ **Fixed start.js** - Both bot and dashboard run together properly
- ✅ **Updated menu** - Help text reflects new command structure
- ✅ **Database connection** - Verified both services share same database
- ✅ **Documentation** - Added COMMANDS.md with full command guide

### November 10, 2025 - Replit Import
- ✅ Created .gitignore for Node.js project
- ✅ Configured workflow for port 5000 with webview
- ✅ Configured admin credentials via Replit Secrets
- ✅ Configured deployment settings (autoscale)
- ✅ Successfully tested login page and dashboard

### Previous (November 7, 2025)
- Created combined startup script
- Implemented admin dashboard with all features
- Added login/session management
- Created search and filter functionality
- Enhanced PDF reports with charts

## Architecture Decisions

- **Date Format**: YYYY.MM.DD for full leaves (e.g., "2025.11.15")
- **Session Management**: Simple in-memory sessions (sufficient for autoscale)
- **Database**: JSON files for easy portability
- **Timezone**: All timestamps use Asia/Colombo
- **Port**: 5000 (Replit requirement for webview)
- **Host**: 0.0.0.0 (allows Replit proxy access)
- **Deployment**: Autoscale (stateless web app, suitable for dashboard)

## Enabling WhatsApp Bot (Optional)

If you want to enable the WhatsApp bot feature:

1. Update `start.js` to spawn the bot process
2. Run the bot with pairing code: `npm run pairing`
3. Scan QR code or use pairing code to authenticate
4. Session files will be saved in `session/` directory
5. Bot will auto-start with the dashboard

**Note**: The bot requires an active WhatsApp account and internet connection.

## User Preferences
- Timezone: Asia/Colombo (Sri Lanka)
- Leave group restriction: Enabled for WhatsApp bot
- Session duration: 24 hours
- Auto monthly JSON creation: Enabled
- Secure credentials: Stored in Replit Secrets

## Known Behavior

### WhatsApp Bot (Disabled)
The WhatsApp bot is disabled by default to prevent startup errors. It requires:
1. Valid WhatsApp session files in `session/` directory
2. Active internet connection to WhatsApp servers
3. Pairing code or QR code authentication

The web dashboard works independently and does not require the bot.

## Support & Maintenance

### Created By
- BuyMore Technical Team
- Original Bot: FallZx Infinity
- Maintainer: MrNadun

### Troubleshooting
1. **Can't login**: Verify your ADMIN_USERNAME and ADMIN_PASSWORD in Replit Secrets
2. **Port already in use**: Restart the Repl
3. **Dashboard not loading**: Check workflow logs for errors
4. **PDF download fails**: Ensure sufficient permissions and disk space
