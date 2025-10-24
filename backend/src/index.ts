import express from 'express';
import { createServer } from 'http';
import cors from 'cors';
import { FleetDataStore } from './models/FleetData';
import { SocketService } from './services/SocketService';

const app = express();
const server = createServer(app);
const PORT = process.env.PORT || 5000;

// Initialize data store
const fleetData = new FleetDataStore();

// Initialize Socket.IO service
const socketService = new SocketService(server, fleetData);

// Middleware
app.use(cors({
  origin: "http://localhost:3000",
  credentials: true
}));
app.use(express.json());

// REST API Routes
app.get('/api/health', (req, res) => {
  res.json({ status: 'OK', timestamp: new Date().toISOString() });
});

app.get('/api/vehicles', (req, res) => {
  res.json(fleetData.getAllVehicles());
});

app.get('/api/groups', (req, res) => {
  res.json(fleetData.getVehicleGroups());
});

app.get('/api/audit', (req, res) => {
  const limit = parseInt(req.query.limit as string) || 50;
  res.json(fleetData.getAuditHistory(limit));
});

app.get('/api/users', (req, res) => {
  res.json(fleetData.getActiveUsers());
});

// Start server
server.listen(PORT, () => {
  console.log(`🚛 Fleet Management Server running on port ${PORT}`);
  console.log(`📊 WebSocket endpoint: ws://localhost:${PORT}`);
  console.log(`🔗 API endpoint: http://localhost:${PORT}/api`);
});
