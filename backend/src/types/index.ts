export enum VehicleStatus {
  DISPONIVEL = 'DISPONIVEL',
  EM_USO = 'EM_USO',
  MANUTENCAO = 'MANUTENCAO',
  INDISPONIVEL = 'INDISPONIVEL'
}

export enum VehicleType {
  EMPILHADEIRA = 'EMPILHADEIRA',
  TRATOR = 'TRATOR',
  CARROCA = 'CARROCA',
  KRANE_CAR = 'KRANE_CAR',
  CAMINHAO = 'CAMINHAO'
}

export interface Vehicle {
  id: string;
  name: string;
  plate?: string;
  type: VehicleType;
  status: VehicleStatus;
  location: string;
  notes?: string;
  lastUpdated: Date;
  updatedBy: string;
}

export interface VehicleGroup {
  id: string;
  name: string;
  type: VehicleType;
  vehicles: Vehicle[];
  availableCount: number;
  totalCount: number;
}

export interface AuditEntry {
  id: string;
  vehicleId: string;
  vehicleName: string;
  action: 'STATUS_CHANGE' | 'NOTES_UPDATE' | 'LOCATION_CHANGE' | 'CREATED' | 'DELETED';
  oldValue?: string;
  newValue?: string;
  field?: string;
  timestamp: Date;
  userId: string;
  userName: string;
}

export interface FleetReport {
  id: string;
  date: Date;
  groups: VehicleGroup[];
  lastVerification: Date;
  generatedBy: string;
}

export interface User {
  id: string;
  name: string;
  socketId?: string;
  lastActive: Date;
}
