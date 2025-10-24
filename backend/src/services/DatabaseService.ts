import sqlite3 from 'sqlite3';
import { Vehicle, AuditEntry, VehicleType, VehicleStatus, AuthUser } from '../types';
import { v4 as uuidv4 } from 'uuid';
import path from 'path';

export class DatabaseService {
  private db: sqlite3.Database;
  private dbPath: string;

  constructor(dbPath: string = './fleet_management.db') {
    this.dbPath = path.resolve(dbPath);
    this.db = new sqlite3.Database(this.dbPath);
    this.initializeTables();
  }

  private initializeTables(): Promise<void> {
    return new Promise((resolve, reject) => {
      this.db.serialize(() => {
        // Create vehicles table
        this.db.run(`
          CREATE TABLE IF NOT EXISTS vehicles (
            id TEXT PRIMARY KEY,
            name TEXT NOT NULL,
            plate TEXT,
            type TEXT NOT NULL,
            status TEXT NOT NULL,
            location TEXT NOT NULL,
            notes TEXT,
            lastUpdated DATETIME NOT NULL,
            updatedBy TEXT NOT NULL,
            createdAt DATETIME DEFAULT CURRENT_TIMESTAMP
          )
        `);

        // Create audit_entries table
        this.db.run(`
          CREATE TABLE IF NOT EXISTS audit_entries (
            id TEXT PRIMARY KEY,
            vehicleId TEXT NOT NULL,
            vehicleName TEXT NOT NULL,
            action TEXT NOT NULL,
            field TEXT,
            oldValue TEXT,
            newValue TEXT,
            timestamp DATETIME NOT NULL,
            userId TEXT NOT NULL,
            userName TEXT NOT NULL,
            FOREIGN KEY (vehicleId) REFERENCES vehicles (id)
          )
        `);

        // Create auth_users table
        this.db.run(`
          CREATE TABLE IF NOT EXISTS auth_users (
            id TEXT PRIMARY KEY,
            email TEXT UNIQUE NOT NULL,
            name TEXT NOT NULL,
            password TEXT NOT NULL,
            resetToken TEXT,
            resetTokenExpiry DATETIME,
            createdAt DATETIME DEFAULT CURRENT_TIMESTAMP,
            lastLogin DATETIME
          )
        `);

        // Create indexes for better performance
        this.db.run(`CREATE INDEX IF NOT EXISTS idx_vehicles_type_location ON vehicles (type, location)`);
        this.db.run(`CREATE INDEX IF NOT EXISTS idx_audit_timestamp ON audit_entries (timestamp DESC)`);
        this.db.run(`CREATE INDEX IF NOT EXISTS idx_audit_vehicle ON audit_entries (vehicleId)`);
        this.db.run(`CREATE INDEX IF NOT EXISTS idx_auth_users_email ON auth_users (email)`);
        this.db.run(`CREATE INDEX IF NOT EXISTS idx_auth_users_reset_token ON auth_users (resetToken)`);

        resolve();
      });
    });
  }

  // Vehicle operations
  async getAllVehicles(): Promise<Vehicle[]> {
    return new Promise((resolve, reject) => {
      this.db.all(
        'SELECT * FROM vehicles ORDER BY name',
        (err, rows: any[]) => {
          if (err) {
            reject(err);
            return;
          }
          
          const vehicles = rows.map(row => ({
            ...row,
            lastUpdated: new Date(row.lastUpdated)
          }));
          
          resolve(vehicles);
        }
      );
    });
  }

  async getVehicleById(id: string): Promise<Vehicle | null> {
    return new Promise((resolve, reject) => {
      this.db.get(
        'SELECT * FROM vehicles WHERE id = ?',
        [id],
        (err, row: any) => {
          if (err) {
            reject(err);
            return;
          }
          
          if (!row) {
            resolve(null);
            return;
          }
          
          resolve({
            ...row,
            lastUpdated: new Date(row.lastUpdated)
          });
        }
      );
    });
  }

  async insertVehicle(vehicle: Vehicle): Promise<void> {
    return new Promise((resolve, reject) => {
      this.db.run(
        `INSERT INTO vehicles (id, name, plate, type, status, location, notes, lastUpdated, updatedBy)
         VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)`,
        [
          vehicle.id,
          vehicle.name,
          vehicle.plate || null,
          vehicle.type,
          vehicle.status,
          vehicle.location,
          vehicle.notes || null,
          vehicle.lastUpdated.toISOString(),
          vehicle.updatedBy
        ],
        (err) => {
          if (err) {
            reject(err);
            return;
          }
          resolve();
        }
      );
    });
  }

  async updateVehicle(id: string, updates: Partial<Vehicle>): Promise<void> {
    const fields: string[] = [];
    const values: any[] = [];
    
    if (updates.name !== undefined) {
      fields.push('name = ?');
      values.push(updates.name);
    }
    if (updates.plate !== undefined) {
      fields.push('plate = ?');
      values.push(updates.plate);
    }
    if (updates.type !== undefined) {
      fields.push('type = ?');
      values.push(updates.type);
    }
    if (updates.status !== undefined) {
      fields.push('status = ?');
      values.push(updates.status);
    }
    if (updates.location !== undefined) {
      fields.push('location = ?');
      values.push(updates.location);
    }
    if (updates.notes !== undefined) {
      fields.push('notes = ?');
      values.push(updates.notes);
    }
    if (updates.lastUpdated !== undefined) {
      fields.push('lastUpdated = ?');
      values.push(updates.lastUpdated.toISOString());
    }
    if (updates.updatedBy !== undefined) {
      fields.push('updatedBy = ?');
      values.push(updates.updatedBy);
    }

    if (fields.length === 0) return;

    values.push(id);

    return new Promise((resolve, reject) => {
      this.db.run(
        `UPDATE vehicles SET ${fields.join(', ')} WHERE id = ?`,
        values,
        (err) => {
          if (err) {
            reject(err);
            return;
          }
          resolve();
        }
      );
    });
  }

  async getVehicleCount(): Promise<number> {
    return new Promise((resolve, reject) => {
      this.db.get(
        'SELECT COUNT(*) as count FROM vehicles',
        (err, row: any) => {
          if (err) {
            reject(err);
            return;
          }
          resolve(row.count);
        }
      );
    });
  }

  // Audit operations
  async insertAuditEntry(entry: AuditEntry): Promise<void> {
    return new Promise((resolve, reject) => {
      this.db.run(
        `INSERT INTO audit_entries (id, vehicleId, vehicleName, action, field, oldValue, newValue, timestamp, userId, userName)
         VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
        [
          entry.id,
          entry.vehicleId,
          entry.vehicleName,
          entry.action,
          entry.field || null,
          entry.oldValue || null,
          entry.newValue || null,
          entry.timestamp.toISOString(),
          entry.userId,
          entry.userName
        ],
        (err) => {
          if (err) {
            reject(err);
            return;
          }
          resolve();
        }
      );
    });
  }

  async getAuditHistory(limit: number = 50): Promise<AuditEntry[]> {
    return new Promise((resolve, reject) => {
      this.db.all(
        'SELECT * FROM audit_entries ORDER BY timestamp DESC LIMIT ?',
        [limit],
        (err, rows: any[]) => {
          if (err) {
            reject(err);
            return;
          }
          
          const entries = rows.map(row => ({
            ...row,
            timestamp: new Date(row.timestamp)
          }));
          
          resolve(entries);
        }
      );
    });
  }

  // Seed default data
  async seedDefaultVehicles(): Promise<void> {
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

    for (const vehicleData of defaultVehicles) {
      const vehicle: Vehicle = {
        ...vehicleData,
        id: uuidv4(),
        lastUpdated: new Date()
      };
      
      await this.insertVehicle(vehicle);
    }

    console.log(`✅ Seeded ${defaultVehicles.length} default vehicles`);
  }

  // Authentication operations
  async createUser(user: Omit<AuthUser, 'createdAt'>): Promise<void> {
    return new Promise((resolve, reject) => {
      this.db.run(
        `INSERT INTO auth_users (id, email, name, password, resetToken, resetTokenExpiry, lastLogin)
         VALUES (?, ?, ?, ?, ?, ?, ?)`,
        [
          user.id,
          user.email,
          user.name,
          user.password,
          user.resetToken || null,
          user.resetTokenExpiry ? user.resetTokenExpiry.toISOString() : null,
          user.lastLogin ? user.lastLogin.toISOString() : null
        ],
        (err) => {
          if (err) {
            reject(err);
            return;
          }
          resolve();
        }
      );
    });
  }

  async getUserByEmail(email: string): Promise<AuthUser | null> {
    return new Promise((resolve, reject) => {
      this.db.get(
        'SELECT * FROM auth_users WHERE email = ?',
        [email],
        (err, row: any) => {
          if (err) {
            reject(err);
            return;
          }
          
          if (!row) {
            resolve(null);
            return;
          }
          
          resolve({
            ...row,
            createdAt: new Date(row.createdAt),
            lastLogin: row.lastLogin ? new Date(row.lastLogin) : undefined,
            resetTokenExpiry: row.resetTokenExpiry ? new Date(row.resetTokenExpiry) : undefined
          });
        }
      );
    });
  }

  async getUserById(id: string): Promise<AuthUser | null> {
    return new Promise((resolve, reject) => {
      this.db.get(
        'SELECT * FROM auth_users WHERE id = ?',
        [id],
        (err, row: any) => {
          if (err) {
            reject(err);
            return;
          }
          
          if (!row) {
            resolve(null);
            return;
          }
          
          resolve({
            ...row,
            createdAt: new Date(row.createdAt),
            lastLogin: row.lastLogin ? new Date(row.lastLogin) : undefined,
            resetTokenExpiry: row.resetTokenExpiry ? new Date(row.resetTokenExpiry) : undefined
          });
        }
      );
    });
  }

  async updateUserLastLogin(userId: string): Promise<void> {
    return new Promise((resolve, reject) => {
      this.db.run(
        'UPDATE auth_users SET lastLogin = ? WHERE id = ?',
        [new Date().toISOString(), userId],
        (err) => {
          if (err) {
            reject(err);
            return;
          }
          resolve();
        }
      );
    });
  }

  async setResetToken(email: string, token: string, expiry: Date): Promise<void> {
    return new Promise((resolve, reject) => {
      this.db.run(
        'UPDATE auth_users SET resetToken = ?, resetTokenExpiry = ? WHERE email = ?',
        [token, expiry.toISOString(), email],
        (err) => {
          if (err) {
            reject(err);
            return;
          }
          resolve();
        }
      );
    });
  }

  async getUserByResetToken(token: string): Promise<AuthUser | null> {
    return new Promise((resolve, reject) => {
      this.db.get(
        'SELECT * FROM auth_users WHERE resetToken = ? AND resetTokenExpiry > ?',
        [token, new Date().toISOString()],
        (err, row: any) => {
          if (err) {
            reject(err);
            return;
          }
          
          if (!row) {
            resolve(null);
            return;
          }
          
          resolve({
            ...row,
            createdAt: new Date(row.createdAt),
            lastLogin: row.lastLogin ? new Date(row.lastLogin) : undefined,
            resetTokenExpiry: row.resetTokenExpiry ? new Date(row.resetTokenExpiry) : undefined
          });
        }
      );
    });
  }

  async updatePassword(userId: string, newPassword: string): Promise<void> {
    return new Promise((resolve, reject) => {
      this.db.run(
        'UPDATE auth_users SET password = ?, resetToken = NULL, resetTokenExpiry = NULL WHERE id = ?',
        [newPassword, userId],
        (err) => {
          if (err) {
            reject(err);
            return;
          }
          resolve();
        }
      );
    });
  }

  async close(): Promise<void> {
    return new Promise((resolve) => {
      this.db.close(() => {
        resolve();
      });
    });
  }
}
