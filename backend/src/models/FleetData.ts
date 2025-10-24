import { Vehicle, VehicleGroup, VehicleType, VehicleStatus, AuditEntry, User } from '../types';
import { v4 as uuidv4 } from 'uuid';

export class FleetDataStore {
  private vehicles: Map<string, Vehicle> = new Map();
  private auditHistory: AuditEntry[] = [];
  private users: Map<string, User> = new Map();

  constructor() {
    this.initializeDefaultData();
  }

  private initializeDefaultData() {
    const defaultVehicles: Omit<Vehicle, 'id' | 'lastUpdated'>[] = [
      // PMO Empilhadeiras
      { name: 'MVX003', type: VehicleType.EMPILHADEIRA, status: VehicleStatus.DISPONIVEL, location: 'PMO', updatedBy: 'system' },
      { name: 'MVX006', type: VehicleType.EMPILHADEIRA, status: VehicleStatus.DISPONIVEL, location: 'PMO', updatedBy: 'system' },
      
      // Piquete Empilhadeiras
      { name: 'EPM004', type: VehicleType.EMPILHADEIRA, status: VehicleStatus.DISPONIVEL, location: 'Piquete', updatedBy: 'system' },
      { name: 'EPM020', type: VehicleType.EMPILHADEIRA, status: VehicleStatus.DISPONIVEL, location: 'Piquete', updatedBy: 'system' },
      { name: 'EPM021', type: VehicleType.EMPILHADEIRA, status: VehicleStatus.MANUTENCAO, location: 'Piquete', notes: 'EIXO QUEBRADO/SEM PREVISÃO', updatedBy: 'system' },
      { name: 'EMP027', type: VehicleType.EMPILHADEIRA, status: VehicleStatus.INDISPONIVEL, location: 'Piquete', updatedBy: 'system' },
      { name: 'EMP028', type: VehicleType.EMPILHADEIRA, status: VehicleStatus.DISPONIVEL, location: 'Piquete', updatedBy: 'system' },
      
      // Expedição Empilhadeiras
      { name: 'EMP029', type: VehicleType.EMPILHADEIRA, status: VehicleStatus.INDISPONIVEL, location: 'Expedição', updatedBy: 'system' },
      { name: 'MNP003', type: VehicleType.EMPILHADEIRA, status: VehicleStatus.DISPONIVEL, location: 'Expedição', notes: 'PREVENTIVA/CORRETIVA PROGRAMADA', updatedBy: 'system' },
      { name: 'MNP002', type: VehicleType.EMPILHADEIRA, status: VehicleStatus.DISPONIVEL, location: 'Expedição', updatedBy: 'system' },
      { name: 'MVX001', type: VehicleType.EMPILHADEIRA, status: VehicleStatus.DISPONIVEL, location: 'Expedição', updatedBy: 'system' },
      { name: 'MVX002', type: VehicleType.EMPILHADEIRA, status: VehicleStatus.DISPONIVEL, location: 'Expedição', updatedBy: 'system' },
      { name: 'MVX004', type: VehicleType.EMPILHADEIRA, status: VehicleStatus.DISPONIVEL, location: 'Expedição', updatedBy: 'system' },
      { name: 'MVX005', type: VehicleType.EMPILHADEIRA, status: VehicleStatus.DISPONIVEL, location: 'Expedição', updatedBy: 'system' },
      { name: 'MVX007', type: VehicleType.EMPILHADEIRA, status: VehicleStatus.INDISPONIVEL, location: 'Expedição', notes: 'EM FINALIZAÇÃO', updatedBy: 'system' },
      { name: 'MVX008', type: VehicleType.EMPILHADEIRA, status: VehicleStatus.DISPONIVEL, location: 'Expedição', updatedBy: 'system' },
      { name: 'MVX009', type: VehicleType.EMPILHADEIRA, status: VehicleStatus.DISPONIVEL, location: 'Expedição', updatedBy: 'system' },
      { name: 'MVX011', type: VehicleType.EMPILHADEIRA, status: VehicleStatus.DISPONIVEL, location: 'Expedição', updatedBy: 'system' },
      { name: 'MVX012', type: VehicleType.EMPILHADEIRA, status: VehicleStatus.DISPONIVEL, location: 'Expedição', updatedBy: 'system' },
      { name: 'EMP030', type: VehicleType.EMPILHADEIRA, status: VehicleStatus.INDISPONIVEL, location: 'Expedição', notes: 'SEM PREVISÃO', updatedBy: 'system' },
      { name: 'MVX010', type: VehicleType.EMPILHADEIRA, status: VehicleStatus.DISPONIVEL, location: 'Expedição', updatedBy: 'system' },
      
      // Tratores
      { name: 'TRT001', type: VehicleType.TRATOR, status: VehicleStatus.DISPONIVEL, location: 'Geral', updatedBy: 'system' },
      { name: 'TRT002', type: VehicleType.TRATOR, status: VehicleStatus.INDISPONIVEL, location: 'Geral', notes: 'TRANCA DO CAPU, (AVALIANDO ADAPTAÇÃO)', updatedBy: 'system' },
      { name: 'TRT003', type: VehicleType.TRATOR, status: VehicleStatus.DISPONIVEL, location: 'Geral', updatedBy: 'system' },
      { name: 'TRT004', type: VehicleType.TRATOR, status: VehicleStatus.DISPONIVEL, location: 'Geral', updatedBy: 'system' },
      { name: 'TRT005', type: VehicleType.TRATOR, status: VehicleStatus.DISPONIVEL, location: 'Geral', updatedBy: 'system' },
      
      // Krane-Car
      { name: 'GDT001', type: VehicleType.KRANE_CAR, status: VehicleStatus.DISPONIVEL, location: 'Geral', updatedBy: 'system' },
      { name: 'GDT002', type: VehicleType.KRANE_CAR, status: VehicleStatus.DISPONIVEL, location: 'Geral', updatedBy: 'system' },
      { name: 'GDT003', type: VehicleType.KRANE_CAR, status: VehicleStatus.DISPONIVEL, location: 'Geral', updatedBy: 'system' },
      
      // Caminhões
      { name: 'GDT006', type: VehicleType.CAMINHAO, status: VehicleStatus.DISPONIVEL, location: 'Geral', updatedBy: 'system' },
      { name: 'GDT007', type: VehicleType.CAMINHAO, status: VehicleStatus.DISPONIVEL, location: 'Geral', updatedBy: 'system' },
      { name: 'GDT009', type: VehicleType.CAMINHAO, status: VehicleStatus.DISPONIVEL, location: 'Geral', updatedBy: 'system' }
    ];

    defaultVehicles.forEach(vehicleData => {
      const vehicle: Vehicle = {
        ...vehicleData,
        id: uuidv4(),
        lastUpdated: new Date()
      };
      this.vehicles.set(vehicle.id, vehicle);
    });
  }

  getAllVehicles(): Vehicle[] {
    return Array.from(this.vehicles.values());
  }

  getVehicleById(id: string): Vehicle | undefined {
    return this.vehicles.get(id);
  }

  updateVehicle(id: string, updates: Partial<Vehicle>, userId: string, userName: string): Vehicle | null {
    const vehicle = this.vehicles.get(id);
    if (!vehicle) return null;

    const oldVehicle = { ...vehicle };
    const updatedVehicle = {
      ...vehicle,
      ...updates,
      lastUpdated: new Date(),
      updatedBy: userName
    };

    this.vehicles.set(id, updatedVehicle);

    // Create audit entries for changes
    Object.keys(updates).forEach(key => {
      const field = key as keyof Vehicle;
      if (oldVehicle[field] !== updatedVehicle[field]) {
        this.addAuditEntry({
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
    });

    return updatedVehicle;
  }

  getVehicleGroups(): VehicleGroup[] {
    const vehicles = this.getAllVehicles();
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
  }

  addAuditEntry(entry: Omit<AuditEntry, 'id' | 'timestamp'>) {
    const auditEntry: AuditEntry = {
      ...entry,
      id: uuidv4(),
      timestamp: new Date()
    };
    
    this.auditHistory.unshift(auditEntry);
    
    // Keep only last 1000 entries
    if (this.auditHistory.length > 1000) {
      this.auditHistory = this.auditHistory.slice(0, 1000);
    }
  }

  getAuditHistory(limit: number = 50): AuditEntry[] {
    return this.auditHistory.slice(0, limit);
  }

  addUser(user: User) {
    this.users.set(user.id, user);
  }

  removeUser(userId: string) {
    this.users.delete(userId);
  }

  getActiveUsers(): User[] {
    return Array.from(this.users.values());
  }
}
