import { useEffect, useState, useCallback } from 'react';
import { io, Socket } from 'socket.io-client';
import { Vehicle, VehicleGroup, AuditEntry, User, FleetData } from '../types';

interface UseSocketReturn {
  socket: Socket | null;
  connected: boolean;
  fleetData: FleetData;
  activeUsers: User[];
  joinAsUser: (userName: string) => void;
  updateVehicle: (vehicleId: string, updates: Partial<Vehicle>) => void;
  requestAuditHistory: (limit?: number) => void;
}

export const useSocket = (): UseSocketReturn => {
  const [socket, setSocket] = useState<Socket | null>(null);
  const [connected, setConnected] = useState(false);
  const [fleetData, setFleetData] = useState<FleetData>({
    vehicles: [],
    groups: [],
    auditHistory: []
  });
  const [activeUsers, setActiveUsers] = useState<User[]>([]);
  const [currentUser, setCurrentUser] = useState<{ id: string; name: string } | null>(null);

  useEffect(() => {
    const newSocket = io('http://localhost:5000');
    setSocket(newSocket);

    newSocket.on('connect', () => {
      setConnected(true);
      console.log('Connected to server');
    });

    newSocket.on('disconnect', () => {
      setConnected(false);
      console.log('Disconnected from server');
    });

    newSocket.on('fleet:initial', (data: FleetData) => {
      // Convert date strings back to Date objects
      const processedData = {
        ...data,
        vehicles: data.vehicles.map(vehicle => ({
          ...vehicle,
          lastUpdated: new Date(vehicle.lastUpdated)
        })),
        auditHistory: data.auditHistory.map(entry => ({
          ...entry,
          timestamp: new Date(entry.timestamp)
        }))
      };
      setFleetData(processedData);
    });

    newSocket.on('vehicle:updated', (data: { vehicle: Vehicle; groups: VehicleGroup[] }) => {
      const processedVehicle = {
        ...data.vehicle,
        lastUpdated: new Date(data.vehicle.lastUpdated)
      };

      setFleetData(prev => ({
        ...prev,
        vehicles: prev.vehicles.map(v => 
          v.id === processedVehicle.id ? processedVehicle : v
        ),
        groups: data.groups
      }));
    });

    newSocket.on('audit:update', (auditHistory: AuditEntry[]) => {
      const processedHistory = auditHistory.map(entry => ({
        ...entry,
        timestamp: new Date(entry.timestamp)
      }));
      
      setFleetData(prev => ({
        ...prev,
        auditHistory: processedHistory
      }));
    });

    newSocket.on('audit:history', (auditHistory: AuditEntry[]) => {
      const processedHistory = auditHistory.map(entry => ({
        ...entry,
        timestamp: new Date(entry.timestamp)
      }));
      
      setFleetData(prev => ({
        ...prev,
        auditHistory: processedHistory
      }));
    });

    newSocket.on('users:update', (users: User[]) => {
      const processedUsers = users.map(user => ({
        ...user,
        lastActive: new Date(user.lastActive)
      }));
      setActiveUsers(processedUsers);
    });

    return () => {
      newSocket.close();
    };
  }, []);

  const joinAsUser = useCallback((userName: string) => {
    if (socket) {
      const userData = { name: userName };
      setCurrentUser({ id: Date.now().toString(), name: userName });
      socket.emit('user:join', userData);
    }
  }, [socket]);

  const updateVehicle = useCallback((vehicleId: string, updates: Partial<Vehicle>) => {
    if (socket && currentUser) {
      socket.emit('vehicle:update', {
        vehicleId,
        updates,
        userId: currentUser.id,
        userName: currentUser.name
      });
    }
  }, [socket, currentUser]);

  const requestAuditHistory = useCallback((limit: number = 50) => {
    if (socket) {
      socket.emit('audit:request', limit);
    }
  }, [socket]);

  return {
    socket,
    connected,
    fleetData,
    activeUsers,
    joinAsUser,
    updateVehicle,
    requestAuditHistory
  };
};
