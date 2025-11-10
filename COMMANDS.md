# Leave Management Bot - Commands Guide

## 🎯 Command Overview
All commands now work **with or without prefix** (e.g., `.menu` or just `menu`)

## 📱 Leave Commands (For All Users)

### Request Full Day Leave
- **Command:** `.leave` or `.l` or `leave` or `l`
- **Description:** Request a full day off
- **Usage:** Send the command and select a date from the interactive menu
- **Example:** `.leave`

### Request Half Day Leave
- **Command:** `.halfleave` or `.hl` or `halfleave` or `hl`
- **Description:** Request morning or afternoon off
- **Usage:** Send the command and select morning/afternoon
- **Example:** `.halfleave`

### View Leave Logs
- **Command:** `.leavelogs` or `.ll` or `leavelogs` or `ll`
- **Description:** View all your leave requests and their status
- **Example:** `.ll`

### Menu / Help
- **Command:** `.menu` or `menu`
- **Description:** Display all available commands
- **Example:** `menu`

## 🔑 Admin Commands (Admins Only)

### Approve Leave Request
- **Command:** `.approve`
- **Description:** Approve a pending leave request
- **Usage:** Used in response to leave request notifications
- **Example:** `.approve`

### Reject Leave Request
- **Command:** `.reject`
- **Description:** Reject a pending leave request
- **Usage:** Used in response to leave request notifications
- **Example:** `.reject`

### Tag All Members
- **Command:** `.tagall`
- **Description:** Mention all group members
- **Example:** `.tagall`

## 🌐 Web Dashboard

### Access
- Login with your admin credentials (set in Replit Secrets)
- View all leave requests
- Approve/reject pending requests
- Search by name or phone
- Download PDF reports
- View today's leaves (public access at `/today`)

### Features
- ✅ Real-time statistics
- ✅ Search functionality
- ✅ Approve/Reject buttons
- ✅ Delete leave records
- ✅ PDF export with charts
- ✅ Public "Today's Leaves" page

## 💾 Database Structure

### Single Database File
- **Location:** `nexaDB/leave.json`
- **Shared by:** Both WhatsApp bot and web dashboard
- **Format:** JSON with fullLeaves[] and halfLeaves[] arrays

### Data Fields
```json
{
  "fullLeaves": [
    {
      "user": "phone@s.whatsapp.net",
      "name": "User Name",
      "date": "YYYY.MM.DD",
      "status": "pending|approved|rejected",
      "requestedAt": "ISO timestamp",
      "approvedAt": "ISO timestamp",
      "approvedBy": "admin phone"
    }
  ],
  "halfLeaves": [
    {
      "user": "phone@s.whatsapp.net",
      "name": "User Name",
      "time": "Morning|Afternoon",
      "status": "pending|approved|rejected",
      "requestedAt": "ISO timestamp"
    }
  ]
}
```

## 🔧 Configuration

### Admin Setup
1. Set `ADMIN_USERNAME` in Replit Secrets
2. Set `ADMIN_PASSWORD` in Replit Secrets
3. Restart the application

### Bot Settings (setting.js)
- Admins: `global.admins` array
- Owner: `global.owner`
- Bot name: `global.botname`
- Timezone: Asia/Colombo

## ✅ Current Status
- ✅ Commands work without prefix requirement
- ✅ Single database file (leave.json) for both bot and dashboard
- ✅ Both WhatsApp bot and web dashboard running
- ✅ Database connection working for both services
