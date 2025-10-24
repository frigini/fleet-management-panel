import React, { useState } from 'react';
import { VehicleGroup } from './components/VehicleGroup';
import { AuditHistory } from './components/AuditHistory';
import { useSocket } from './hooks/useSocket';
import { formatDate, formatTime } from './utils';
import { Truck, Users, Wifi, WifiOff, Calendar, Clock } from 'lucide-react';

function App() {
  const [userName, setUserName] = useState('');
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const { 
    connected, 
    fleetData, 
    activeUsers, 
    joinAsUser, 
    updateVehicle, 
    requestAuditHistory 
  } = useSocket();

  const handleLogin = (e: React.FormEvent) => {
    e.preventDefault();
    if (userName.trim()) {
      joinAsUser(userName.trim());
      setIsLoggedIn(true);
    }
  };

  const currentDate = new Date();

  if (!isLoggedIn) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="bg-white p-8 rounded-lg shadow-md w-full max-w-md">
          <div className="text-center mb-6">
            <Truck className="w-12 h-12 text-blue-600 mx-auto mb-4" />
            <h1 className="text-2xl font-bold text-gray-900">Painel de Frota</h1>
            <p className="text-gray-600">Sistema colaborativo de gerenciamento</p>
          </div>
          
          <form onSubmit={handleLogin}>
            <div className="mb-4">
              <label htmlFor="userName" className="block text-sm font-medium text-gray-700 mb-2">
                Seu nome
              </label>
              <input
                type="text"
                id="userName"
                value={userName}
                onChange={(e) => setUserName(e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                placeholder="Digite seu nome..."
                required
              />
            </div>
            
            <button
              type="submit"
              className="w-full bg-blue-600 text-white py-2 px-4 rounded-md hover:bg-blue-700 transition-colors"
            >
              Entrar no Painel
            </button>
          </form>
        </div>
      </div>
    );
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
              <div className="text-sm text-gray-900 font-medium">
                Olá, {userName}
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
    </div>
  );
}

export default App;
