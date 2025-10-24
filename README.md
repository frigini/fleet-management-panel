# Fleet Management Panel

A collaborative fleet management panel with real-time editing capabilities and audit history tracking.

## Features

- 🚛 Real-time fleet status management
- 👥 Collaborative editing with multiple users
- 📋 Comprehensive audit history
- 🔄 Live updates using WebSocket
- 📱 Modern responsive UI
- 🎯 TypeScript for type safety

## Tech Stack

- **Frontend**: React 18, TypeScript, TailwindCSS, Lucide Icons
- **Backend**: Node.js, Express, Socket.IO, TypeScript
- **Database**: In-memory (easily extensible to PostgreSQL/MongoDB)

## Quick Start

1. Install all dependencies:
```bash
npm run install:all
```

2. Start development servers:
```bash
npm run dev
```

3. Open your browser to:
   - Frontend: http://localhost:3000
   - Backend API: http://localhost:5000

## Project Structure

```
fleet-management-panel/
├── backend/          # Express + Socket.IO server
├── frontend/         # React application
└── package.json      # Root package.json with scripts
```

## Usage

- Access the panel at http://localhost:3000
- Multiple users can edit simultaneously
- All changes are tracked in the audit history
- Status updates are reflected in real-time across all connected clients
