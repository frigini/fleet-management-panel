import React, { useState } from 'react';
import { VehicleGroup as VehicleGroupType, Vehicle, VehicleStatus } from '../types';
import { getStatusIcon, getStatusText, getStatusColor, getVehicleTypeIcon, getVehicleTypeText, cn } from '../utils';
import { ChevronDown, ChevronRight, Edit3 } from 'lucide-react';

interface VehicleGroupProps {
  group: VehicleGroupType;
  onVehicleUpdate: (vehicleId: string, updates: Partial<Vehicle>) => void;
}

interface VehicleRowProps {
  vehicle: Vehicle;
  onUpdate: (vehicleId: string, updates: Partial<Vehicle>) => void;
}

const VehicleRow: React.FC<VehicleRowProps> = ({ vehicle, onUpdate }) => {
  const [isEditing, setIsEditing] = useState(false);
  const [editingField, setEditingField] = useState<'status' | 'notes' | null>(null);
  const [tempValue, setTempValue] = useState('');

  const handleEdit = (field: 'status' | 'notes') => {
    setEditingField(field);
    setTempValue(field === 'status' ? vehicle.status : vehicle.notes || '');
    setIsEditing(true);
  };

  const handleSave = () => {
    if (editingField) {
      const updates: Partial<Vehicle> = {};
      if (editingField === 'status') {
        updates.status = tempValue as VehicleStatus;
      } else if (editingField === 'notes') {
        updates.notes = tempValue;
      }
      onUpdate(vehicle.id, updates);
    }
    setIsEditing(false);
    setEditingField(null);
    setTempValue('');
  };

  const handleCancel = () => {
    setIsEditing(false);
    setEditingField(null);
    setTempValue('');
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') {
      handleSave();
    } else if (e.key === 'Escape') {
      handleCancel();
    }
  };

  return (
    <div className="flex items-center justify-between p-3 border-b border-gray-100 hover:bg-gray-50">
      <div className="flex items-center space-x-3">
        <span className="text-lg">{getStatusIcon(vehicle.status)}</span>
        <span className="font-medium text-gray-900">{vehicle.name}</span>
      </div>
      
      <div className="flex items-center space-x-4">
        {/* Status */}
        <div className="flex items-center space-x-2">
          {isEditing && editingField === 'status' ? (
            <select
              value={tempValue}
              onChange={(e) => setTempValue(e.target.value)}
              onBlur={handleSave}
              onKeyDown={handleKeyPress}
              className="px-2 py-1 border rounded text-sm"
              autoFocus
            >
              {Object.values(VehicleStatus).map(status => (
                <option key={status} value={status}>
                  {getStatusText(status)}
                </option>
              ))}
            </select>
          ) : (
            <button
              onClick={() => handleEdit('status')}
              className={cn(
                'px-2 py-1 rounded-full text-xs font-medium flex items-center space-x-1 hover:opacity-80',
                getStatusColor(vehicle.status)
              )}
            >
              <span>{getStatusText(vehicle.status)}</span>
              <Edit3 className="w-3 h-3" />
            </button>
          )}
        </div>

        {/* Notes */}
        <div className="flex-1 max-w-xs">
          {isEditing && editingField === 'notes' ? (
            <input
              type="text"
              value={tempValue}
              onChange={(e) => setTempValue(e.target.value)}
              onBlur={handleSave}
              onKeyDown={handleKeyPress}
              className="w-full px-2 py-1 border rounded text-sm"
              placeholder="Adicionar observação..."
              autoFocus
            />
          ) : (
            <button
              onClick={() => handleEdit('notes')}
              className="text-sm text-gray-600 hover:text-gray-900 flex items-center space-x-1 truncate"
            >
              <span>{vehicle.notes || 'Adicionar observação...'}</span>
              <Edit3 className="w-3 h-3 flex-shrink-0" />
            </button>
          )}
        </div>
      </div>
    </div>
  );
};

export const VehicleGroup: React.FC<VehicleGroupProps> = ({ group, onVehicleUpdate }) => {
  const [isExpanded, setIsExpanded] = useState(true);

  return (
    <div className="bg-white rounded-lg shadow-sm border border-gray-200 mb-4">
      <button
        onClick={() => setIsExpanded(!isExpanded)}
        className="w-full px-4 py-3 flex items-center justify-between hover:bg-gray-50"
      >
        <div className="flex items-center space-x-3">
          <span className="text-xl">{getVehicleTypeIcon(group.type)}</span>
          <div className="text-left">
            <h3 className="font-semibold text-gray-900">
              {getVehicleTypeText(group.type)}
            </h3>
            <p className="text-sm text-gray-600">
              {group.name} – {group.availableCount}/{group.totalCount} disponíveis
            </p>
          </div>
        </div>
        
        <div className="flex items-center space-x-2">
          <div className="text-right">
            <div className="text-lg font-bold text-green-600">
              {group.availableCount}
            </div>
            <div className="text-xs text-gray-500">
              de {group.totalCount}
            </div>
          </div>
          {isExpanded ? (
            <ChevronDown className="w-5 h-5 text-gray-400" />
          ) : (
            <ChevronRight className="w-5 h-5 text-gray-400" />
          )}
        </div>
      </button>

      {isExpanded && (
        <div className="border-t border-gray-200">
          {group.vehicles.map(vehicle => (
            <VehicleRow
              key={vehicle.id}
              vehicle={vehicle}
              onUpdate={onVehicleUpdate}
            />
          ))}
        </div>
      )}
    </div>
  );
};
