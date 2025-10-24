import express from 'express';
import { createServer } from 'http';
import cors from 'cors';
import { FleetDataStore } from './models/FleetData';
import { SocketService } from './services/SocketService';
import { createAuthRoutes } from './routes/authRoutes';
import { createAuthMiddleware } from './middleware/authMiddleware';

const app = express();
const server = createServer(app);
const PORT = process.env.PORT || 5000;

// Initialize data store
const fleetData = new FleetDataStore();

// Initialize Socket.IO service
const socketService = new SocketService(server, fleetData);

// Initialize auth middleware
const authMiddleware = createAuthMiddleware(fleetData.getDatabase());

// Middleware
app.use(cors({
  origin: "http://localhost:3000",
  credentials: true
}));
app.use(express.json());

// Authentication routes (public)
app.use('/api/auth', createAuthRoutes(fleetData.getDatabase()));

// REST API Routes
app.get('/api/health', (req, res) => {
  res.json({ status: 'OK', timestamp: new Date().toISOString() });
});

// Protected routes (require authentication)
app.get('/api/vehicles', authMiddleware, async (req, res) => {
  try {
    const vehicles = await fleetData.getAllVehicles();
    res.json(vehicles);
  } catch (error) {
    console.error('Error getting vehicles:', error);
    res.status(500).json({ error: 'Failed to get vehicles' });
  }
});

app.get('/api/groups', authMiddleware, async (req, res) => {
  try {
    const groups = await fleetData.getVehicleGroups();
    res.json(groups);
  } catch (error) {
    console.error('Error getting vehicle groups:', error);
    res.status(500).json({ error: 'Failed to get vehicle groups' });
  }
});

app.get('/api/audit', authMiddleware, async (req, res) => {
  try {
    const limit = parseInt(req.query.limit as string) || 50;
    const auditHistory = await fleetData.getAuditHistory(limit);
    res.json(auditHistory);
  } catch (error) {
    console.error('Error getting audit history:', error);
    res.status(500).json({ error: 'Failed to get audit history' });
  }
});

app.get('/api/users', authMiddleware, (req, res) => {
  res.json(fleetData.getActiveUsers());
});

// Start server
server.listen(PORT, () => {
  console.log(`🚛 Fleet Management Server running on port ${PORT}`);
  console.log(`📊 WebSocket endpoint: ws://localhost:${PORT}`);
  console.log(`🔗 API endpoint: http://localhost:${PORT}/api`);
});
