import React, { useState } from 'react';
import { VehicleGroup } from './components/VehicleGroup';
import { AuditHistory } from './components/AuditHistory';
import { AddVehicleModal } from './components/AddVehicleModal';
import { AuthPage } from './components/AuthPage';
import { useSocket } from './hooks/useSocket';
import { useAuth } from './contexts/AuthContext';
import { formatDate, formatTime } from './utils';
import { Truck, Users, Wifi, WifiOff, Calendar, Clock, Plus, LogOut } from 'lucide-react';

function App() {
  const [isAddVehicleModalOpen, setIsAddVehicleModalOpen] = useState(false);
  const { user, logout } = useAuth();
  const { 
    connected, 
    fleetData, 
    activeUsers, 
    joinAsUser, 
    updateVehicle, 
    createVehicle,
    requestAuditHistory 
  } = useSocket();

  // Auto-join socket when user is authenticated
  React.useEffect(() => {
    if (user && connected) {
      joinAsUser(user.name);
    }
  }, [user, connected, joinAsUser]);

  const currentDate = new Date();

  // Show auth page if user is not authenticated
  if (!user) {
    return <AuthPage />;
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white shadow-sm border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center py-4">
            <div className="flex items-center space-x-4">
              <Truck className="w-8 h-8 text-blue-600" />
              <div>
                <h1 className="text-xl font-bold text-gray-900">
                  📋 RELATÓRIO DIÁRIO – EQUIPAMENTOS
                </h1>
                <div className="flex items-center space-x-4 text-sm text-gray-600">
                  <div className="flex items-center space-x-1">
                    <Calendar className="w-4 h-4" />
                    <span>🗓️ Data: {formatDate(currentDate)}</span>
                  </div>
                  <div className="flex items-center space-x-1">
                    <Clock className="w-4 h-4" />
                    <span>⏰ Horário: {formatTime(currentDate)}</span>
                  </div>
                </div>
              </div>
            </div>
            
            <div className="flex items-center space-x-4">
              {/* Add Vehicle Button */}
              <button
                onClick={() => setIsAddVehicleModalOpen(true)}
                className="bg-blue-600 text-white px-3 py-2 rounded-md hover:bg-blue-700 transition-colors flex items-center space-x-2 text-sm"
              >
                <Plus className="w-4 h-4" />
                <span>Adicionar Veículo</span>
              </button>
              
              {/* Connection Status */}
              <div className="flex items-center space-x-2">
                {connected ? (
                  <>
                    <Wifi className="w-4 h-4 text-green-600" />
                    <span className="text-sm text-green-600">Conectado</span>
                  </>
                ) : (
                  <>
                    <WifiOff className="w-4 h-4 text-red-600" />
                    <span className="text-sm text-red-600">Desconectado</span>
                  </>
                )}
              </div>
              
              {/* Active Users */}
              <div className="flex items-center space-x-2">
                <Users className="w-4 h-4 text-gray-600" />
                <span className="text-sm text-gray-600">
                  {activeUsers.length} usuário{activeUsers.length !== 1 ? 's' : ''} online
                </span>
              </div>
              
              {/* Current User */}
              <div className="flex items-center space-x-3">
                <div className="text-sm text-gray-900 font-medium">
                  Olá, {user.name}
                </div>
                <button
                  onClick={logout}
                  className="text-gray-600 hover:text-gray-900 p-1 rounded-md hover:bg-gray-100"
                  title="Logout"
                >
                  <LogOut className="w-4 h-4" />
                </button>
              </div>
            </div>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Fleet Groups */}
          <div className="lg:col-span-2 space-y-6">
            {fleetData.groups.map(group => (
              <VehicleGroup
                key={group.id}
                group={group}
                onVehicleUpdate={updateVehicle}
              />
            ))}
            
            {fleetData.groups.length === 0 && (
              <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-8 text-center">
                <Truck className="w-12 h-12 text-gray-400 mx-auto mb-4" />
                <h3 className="text-lg font-medium text-gray-900 mb-2">
                  Nenhum equipamento encontrado
                </h3>
                <p className="text-gray-600">
                  Os dados da frota serão carregados automaticamente quando disponíveis.
                </p>
              </div>
            )}
          </div>

          {/* Sidebar */}
          <div className="space-y-6">
            {/* Summary Card */}
            <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">Resumo da Frota</h3>
              <div className="space-y-3">
                {fleetData.groups.map(group => (
                  <div key={group.id} className="flex justify-between items-center">
                    <span className="text-sm text-gray-600">{group.name}</span>
                    <span className="text-sm font-medium">
                      {group.availableCount}/{group.totalCount}
                    </span>
                  </div>
                ))}
              </div>
            </div>

            {/* Active Users */}
            {activeUsers.length > 0 && (
              <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
                <h3 className="text-lg font-semibold text-gray-900 mb-4">Usuários Online</h3>
                <div className="space-y-2">
                  {activeUsers.map(user => (
                    <div key={user.id} className="flex items-center space-x-2">
                      <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                      <span className="text-sm text-gray-700">{user.name}</span>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Audit History */}
            <AuditHistory
              auditHistory={fleetData.auditHistory}
              onRequestMore={requestAuditHistory}
            />
          </div>
        </div>
      </main>

      {/* Add Vehicle Modal */}
      <AddVehicleModal
        isOpen={isAddVehicleModalOpen}
        onClose={() => setIsAddVehicleModalOpen(false)}
        onSubmit={(vehicleData) => {
          createVehicle(vehicleData);
          setIsAddVehicleModalOpen(false);
        }}
      />
    </div>
  );
}

export default App;
