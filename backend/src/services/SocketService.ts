import { Server as SocketIOServer, Socket } from 'socket.io';
import { Server as HTTPServer } from 'http';
import { FleetDataStore } from '../models/FleetData';
import { Vehicle, User } from '../types';
import { v4 as uuidv4 } from 'uuid';

export class SocketService {
  private io: SocketIOServer;
  private fleetData: FleetDataStore;

  constructor(server: HTTPServer, fleetData: FleetDataStore) {
    this.fleetData = fleetData;
    this.io = new SocketIOServer(server, {
      cors: {
        origin: "http://localhost:3000",
        methods: ["GET", "POST"]
      }
    });

    // Clear any stale users from previous server sessions
    this.fleetData.clearAllUsers();

    this.setupSocketHandlers();
  }

  private setupSocketHandlers() {
    this.io.on('connection', (socket: Socket) => {
      console.log(`User connected: ${socket.id}`);

      socket.on('user:join', async (userData: { name: string }) => {
        // Remove any existing user with the same name to prevent duplicates
        this.fleetData.removeUserByName(userData.name);

        const user: User = {
          id: uuidv4(),
          name: userData.name,
          socketId: socket.id,
          lastActive: new Date()
        };

        this.fleetData.addUser(user);
        
        // Send initial data to the new user
        try {
          const [vehicles, groups, auditHistory] = await Promise.all([
            this.fleetData.getAllVehicles(),
            this.fleetData.getVehicleGroups(),
            this.fleetData.getAuditHistory(20)
          ]);

          socket.emit('fleet:initial', {
            vehicles,
            groups,
            auditHistory
          });
        } catch (error) {
          console.error('Error loading initial data:', error);
          socket.emit('error', { message: 'Failed to load initial data' });
        }

        // Notify all clients about active users
        this.io.emit('users:update', this.fleetData.getActiveUsers());
        
        console.log(`User ${userData.name} joined with ID: ${user.id}`);
      });

      socket.on('vehicle:update', async (data: { vehicleId: string; updates: Partial<Vehicle>; userId: string; userName: string }) => {
        const { vehicleId, updates, userId, userName } = data;
        
        try {
          const updatedVehicle = await this.fleetData.updateVehicle(vehicleId, updates, userId, userName);
          
          if (updatedVehicle) {
            const [groups, auditHistory] = await Promise.all([
              this.fleetData.getVehicleGroups(),
              this.fleetData.getAuditHistory(20)
            ]);

            // Broadcast the update to all connected clients
            this.io.emit('vehicle:updated', {
              vehicle: updatedVehicle,
              groups
            });

            // Send updated audit history
            this.io.emit('audit:update', auditHistory);
            
            console.log(`Vehicle ${updatedVehicle.name} updated by ${userName}`);
          }
        } catch (error) {
          console.error('Error updating vehicle:', error);
          socket.emit('error', { message: 'Failed to update vehicle' });
        }
      });

      socket.on('vehicle:create', async (data: { vehicleData: Omit<Vehicle, 'id' | 'lastUpdated'>; userId: string; userName: string }) => {
        const { vehicleData, userId, userName } = data;
        
        try {
          const newVehicle = await this.fleetData.addVehicle(vehicleData, userId, userName);
          
          const [groups, auditHistory] = await Promise.all([
            this.fleetData.getVehicleGroups(),
            this.fleetData.getAuditHistory(20)
          ]);

          // Broadcast the new vehicle to all connected clients
          this.io.emit('vehicle:created', {
            vehicle: newVehicle,
            groups
          });

          // Send updated audit history
          this.io.emit('audit:update', auditHistory);
          
          console.log(`Vehicle ${newVehicle.name} created by ${userName}`);
        } catch (error) {
          console.error('Error creating vehicle:', error);
          socket.emit('error', { message: 'Failed to create vehicle' });
        }
      });

      socket.on('audit:request', async (limit: number = 50) => {
        try {
          const auditHistory = await this.fleetData.getAuditHistory(limit);
          socket.emit('audit:history', auditHistory);
        } catch (error) {
          console.error('Error getting audit history:', error);
          socket.emit('error', { message: 'Failed to load audit history' });
        }
      });

      socket.on('disconnect', () => {
        // Remove user from active users
        const users = this.fleetData.getActiveUsers();
        const disconnectedUser = users.find(user => user.socketId === socket.id);
        
        if (disconnectedUser) {
          this.fleetData.removeUser(disconnectedUser.id);
          this.io.emit('users:update', this.fleetData.getActiveUsers());
          console.log(`User ${disconnectedUser.name} disconnected`);
        }
      });
    });
  }

  getIO(): SocketIOServer {
    return this.io;
  }
}
