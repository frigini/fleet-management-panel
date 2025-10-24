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

    this.setupSocketHandlers();
  }

  private setupSocketHandlers() {
    this.io.on('connection', (socket: Socket) => {
      console.log(`User connected: ${socket.id}`);

      socket.on('user:join', (userData: { name: string }) => {
        const user: User = {
          id: uuidv4(),
          name: userData.name,
          socketId: socket.id,
          lastActive: new Date()
        };

        this.fleetData.addUser(user);
        
        // Send initial data to the new user
        socket.emit('fleet:initial', {
          vehicles: this.fleetData.getAllVehicles(),
          groups: this.fleetData.getVehicleGroups(),
          auditHistory: this.fleetData.getAuditHistory(20)
        });

        // Notify all clients about active users
        this.io.emit('users:update', this.fleetData.getActiveUsers());
        
        console.log(`User ${userData.name} joined with ID: ${user.id}`);
      });

      socket.on('vehicle:update', (data: { vehicleId: string; updates: Partial<Vehicle>; userId: string; userName: string }) => {
        const { vehicleId, updates, userId, userName } = data;
        
        const updatedVehicle = this.fleetData.updateVehicle(vehicleId, updates, userId, userName);
        
        if (updatedVehicle) {
          // Broadcast the update to all connected clients
          this.io.emit('vehicle:updated', {
            vehicle: updatedVehicle,
            groups: this.fleetData.getVehicleGroups()
          });

          // Send updated audit history
          this.io.emit('audit:update', this.fleetData.getAuditHistory(20));
          
          console.log(`Vehicle ${updatedVehicle.name} updated by ${userName}`);
        }
      });

      socket.on('audit:request', (limit: number = 50) => {
        socket.emit('audit:history', this.fleetData.getAuditHistory(limit));
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
