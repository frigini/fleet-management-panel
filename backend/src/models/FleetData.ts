import { Vehicle, VehicleGroup, VehicleType, VehicleStatus, AuditEntry, User } from '../types';
import { DatabaseService } from '../services/DatabaseService';
import { v4 as uuidv4 } from 'uuid';

export class FleetDataStore {
  private database: DatabaseService;
  private users: Map<string, User> = new Map();

  getDatabase(): DatabaseService {
    return this.database;
  }

  constructor(dbPath?: string) {
    this.database = new DatabaseService(dbPath);
    this.seedDatabaseIfEmpty();
  }

  private async seedDatabaseIfEmpty(): Promise<void> {
    try {
      const vehicleCount = await this.database.getVehicleCount();
      if (vehicleCount === 0) {
        console.log('🌱 Database is empty, seeding with default vehicles...');
        await this.database.seedDefaultVehicles();
      } else {
        console.log(`📊 Database already contains ${vehicleCount} vehicles`);
      }
    } catch (error) {
      console.error('Error seeding database:', error);
    }
  }

  async getAllVehicles(): Promise<Vehicle[]> {
    return await this.database.getAllVehicles();
  }

  async getVehicleById(id: string): Promise<Vehicle | null> {
    return await this.database.getVehicleById(id);
  }

  async updateVehicle(id: string, updates: Partial<Vehicle>, userId: string, userName: string): Promise<Vehicle | null> {
    try {
      const vehicle = await this.database.getVehicleById(id);
      if (!vehicle) return null;

      const oldVehicle = { ...vehicle };
      const updatedVehicle = {
        ...vehicle,
        ...updates,
        lastUpdated: new Date(),
        updatedBy: userName
      };

      await this.database.updateVehicle(id, {
        ...updates,
        lastUpdated: updatedVehicle.lastUpdated,
        updatedBy: userName
      });

      // Create audit entries for changes
      for (const key of Object.keys(updates)) {
        const field = key as keyof Vehicle;
        if (oldVehicle[field] !== updatedVehicle[field]) {
          await this.addAuditEntry({
            vehicleId: id,
            vehicleName: vehicle.name,
            action: field === 'status' ? 'STATUS_CHANGE' : field === 'notes' ? 'NOTES_UPDATE' : 'LOCATION_CHANGE',
            field,
            oldValue: String(oldVehicle[field] || ''),
            newValue: String(updatedVehicle[field] || ''),
            userId,
            userName
          });
        }
      }

      return updatedVehicle;
    } catch (error) {
      console.error('Error updating vehicle:', error);
      return null;
    }
  }

  async getVehicleGroups(): Promise<VehicleGroup[]> {
    try {
      const vehicles = await this.getAllVehicles();
      const groups: { [key: string]: VehicleGroup } = {};

      vehicles.forEach(vehicle => {
        const groupKey = `${vehicle.type}_${vehicle.location}`;
        
        if (!groups[groupKey]) {
          groups[groupKey] = {
            id: groupKey,
            name: vehicle.location,
            type: vehicle.type,
            vehicles: [],
            availableCount: 0,
            totalCount: 0
          };
        }

        groups[groupKey].vehicles.push(vehicle);
        groups[groupKey].totalCount++;
        
        if (vehicle.status === VehicleStatus.DISPONIVEL) {
          groups[groupKey].availableCount++;
        }
      });

      return Object.values(groups);
    } catch (error) {
      console.error('Error getting vehicle groups:', error);
      return [];
    }
  }

  async addAuditEntry(entry: Omit<AuditEntry, 'id' | 'timestamp'>): Promise<void> {
    const auditEntry: AuditEntry = {
      ...entry,
      id: uuidv4(),
      timestamp: new Date()
    };
    
    await this.database.insertAuditEntry(auditEntry);
  }

  async getAuditHistory(limit: number = 50): Promise<AuditEntry[]> {
    return await this.database.getAuditHistory(limit);
  }

  addUser(user: User) {
    this.users.set(user.id, user);
  }

  removeUser(userId: string) {
    this.users.delete(userId);
  }

  removeUserByName(userName: string) {
    const users = Array.from(this.users.entries());
    const userToRemove = users.find(([id, user]) => user.name === userName);
    if (userToRemove) {
      this.users.delete(userToRemove[0]);
    }
  }

  clearAllUsers() {
    this.users.clear();
  }

  getActiveUsers(): User[] {
    return Array.from(this.users.values());
  }

  async addVehicle(vehicleData: Omit<Vehicle, 'id' | 'lastUpdated'>, userId: string, userName: string): Promise<Vehicle> {
    const vehicle: Vehicle = {
      ...vehicleData,
      id: uuidv4(),
      lastUpdated: new Date()
    };

    await this.database.insertVehicle(vehicle);

    // Create audit entry for vehicle creation
    await this.addAuditEntry({
      vehicleId: vehicle.id,
      vehicleName: vehicle.name,
      action: 'CREATED',
      field: 'status',
      oldValue: '',
      newValue: vehicle.status,
      userId,
      userName
    });

    return vehicle;
  }

  async close(): Promise<void> {
    await this.database.close();
  }
}
