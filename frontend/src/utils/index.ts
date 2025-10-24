import { VehicleStatus, VehicleType } from '../types';
import { clsx, type ClassValue } from 'clsx';

export function cn(...inputs: ClassValue[]) {
  return clsx(inputs);
}

export const getStatusColor = (status: VehicleStatus): string => {
  switch (status) {
    case VehicleStatus.DISPONIVEL:
      return 'text-green-600 bg-green-50';
    case VehicleStatus.EM_USO:
      return 'text-orange-600 bg-orange-50';
    case VehicleStatus.MANUTENCAO:
      return 'text-red-600 bg-red-50';
    case VehicleStatus.INDISPONIVEL:
      return 'text-gray-600 bg-gray-50';
    default:
      return 'text-gray-600 bg-gray-50';
  }
};

export const getStatusIcon = (status: VehicleStatus): string => {
  switch (status) {
    case VehicleStatus.DISPONIVEL:
      return '✅';
    case VehicleStatus.EM_USO:
      return '🔄';
    case VehicleStatus.MANUTENCAO:
      return '🔧';
    case VehicleStatus.INDISPONIVEL:
      return '❌';
    default:
      return '❓';
  }
};

export const getStatusText = (status: VehicleStatus): string => {
  switch (status) {
    case VehicleStatus.DISPONIVEL:
      return 'Disponível';
    case VehicleStatus.EM_USO:
      return 'Em uso';
    case VehicleStatus.MANUTENCAO:
      return 'Em manutenção';
    case VehicleStatus.INDISPONIVEL:
      return 'Indisponível';
    default:
      return 'Desconhecido';
  }
};

export const getVehicleTypeIcon = (type: VehicleType): string => {
  switch (type) {
    case VehicleType.EMPILHADEIRA:
      return '🚜';
    case VehicleType.TRATOR:
      return '🚜';
    case VehicleType.CARROCA:
      return '🚛';
    case VehicleType.KRANE_CAR:
      return '🚛';
    case VehicleType.CAMINHAO:
      return '🚛';
    default:
      return '🚗';
  }
};

export const getVehicleTypeText = (type: VehicleType): string => {
  switch (type) {
    case VehicleType.EMPILHADEIRA:
      return 'Empilhadeiras';
    case VehicleType.TRATOR:
      return 'Tratores';
    case VehicleType.CARROCA:
      return 'Carroças';
    case VehicleType.KRANE_CAR:
      return 'Krane-Car';
    case VehicleType.CAMINHAO:
      return 'Caminhões';
    default:
      return 'Veículos';
  }
};

export const formatDateTime = (date: Date): string => {
  return new Intl.DateTimeFormat('pt-BR', {
    day: '2-digit',
    month: '2-digit',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit'
  }).format(date);
};

export const formatDate = (date: Date): string => {
  return new Intl.DateTimeFormat('pt-BR', {
    day: '2-digit',
    month: '2-digit',
    year: 'numeric'
  }).format(date);
};

export const formatTime = (date: Date): string => {
  return new Intl.DateTimeFormat('pt-BR', {
    hour: '2-digit',
    minute: '2-digit'
  }).format(date);
};
