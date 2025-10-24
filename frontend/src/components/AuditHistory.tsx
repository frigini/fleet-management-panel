import React, { useState } from 'react';
import { AuditEntry } from '../types';
import { formatDateTime } from '../utils';
import { History, ChevronDown, ChevronRight, User, Clock } from 'lucide-react';

interface AuditHistoryProps {
  auditHistory: AuditEntry[];
  onRequestMore: (limit: number) => void;
}

export const AuditHistory: React.FC<AuditHistoryProps> = ({ auditHistory, onRequestMore }) => {
  const [isExpanded, setIsExpanded] = useState(false);
  const [showLimit, setShowLimit] = useState(10);

  const getActionText = (entry: AuditEntry): string => {
    switch (entry.action) {
      case 'STATUS_CHANGE':
        return `alterou o status de "${entry.oldValue}" para "${entry.newValue}"`;
      case 'NOTES_UPDATE':
        return `${entry.oldValue ? 'atualizou' : 'adicionou'} observação: "${entry.newValue}"`;
      case 'LOCATION_CHANGE':
        return `moveu de "${entry.oldValue}" para "${entry.newValue}"`;
      case 'CREATED':
        return 'criou o veículo';
      case 'DELETED':
        return 'removeu o veículo';
      default:
        return 'realizou uma alteração';
    }
  };

  const getActionColor = (action: string): string => {
    switch (action) {
      case 'STATUS_CHANGE':
        return 'text-blue-600 bg-blue-50';
      case 'NOTES_UPDATE':
        return 'text-green-600 bg-green-50';
      case 'LOCATION_CHANGE':
        return 'text-orange-600 bg-orange-50';
      case 'CREATED':
        return 'text-green-600 bg-green-50';
      case 'DELETED':
        return 'text-red-600 bg-red-50';
      default:
        return 'text-gray-600 bg-gray-50';
    }
  };

  const visibleEntries = auditHistory.slice(0, showLimit);

  return (
    <div className="bg-white rounded-lg shadow-sm border border-gray-200">
      <button
        onClick={() => setIsExpanded(!isExpanded)}
        className="w-full px-4 py-3 flex items-center justify-between hover:bg-gray-50"
      >
        <div className="flex items-center space-x-3">
          <History className="w-5 h-5 text-gray-600" />
          <h3 className="font-semibold text-gray-900">Histórico de Alterações</h3>
          <span className="text-sm text-gray-500">({auditHistory.length} registros)</span>
        </div>
        {isExpanded ? (
          <ChevronDown className="w-5 h-5 text-gray-400" />
        ) : (
          <ChevronRight className="w-5 h-5 text-gray-400" />
        )}
      </button>

      {isExpanded && (
        <div className="border-t border-gray-200">
          {visibleEntries.length === 0 ? (
            <div className="p-4 text-center text-gray-500">
              Nenhum registro de alteração encontrado
            </div>
          ) : (
            <>
              <div className="max-h-96 overflow-y-auto">
                {visibleEntries.map((entry) => (
                  <div key={entry.id} className="p-4 border-b border-gray-100 last:border-b-0">
                    <div className="flex items-start justify-between">
                      <div className="flex-1">
                        <div className="flex items-center space-x-2 mb-2">
                          <span className={`px-2 py-1 rounded-full text-xs font-medium ${getActionColor(entry.action)}`}>
                            {entry.action.replace('_', ' ')}
                          </span>
                          <span className="font-medium text-gray-900">{entry.vehicleName}</span>
                        </div>
                        
                        <p className="text-sm text-gray-700 mb-2">
                          <span className="font-medium">{entry.userName}</span> {getActionText(entry)}
                        </p>
                        
                        <div className="flex items-center space-x-4 text-xs text-gray-500">
                          <div className="flex items-center space-x-1">
                            <User className="w-3 h-3" />
                            <span>{entry.userName}</span>
                          </div>
                          <div className="flex items-center space-x-1">
                            <Clock className="w-3 h-3" />
                            <span>{formatDateTime(entry.timestamp)}</span>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
              
              {auditHistory.length > showLimit && (
                <div className="p-4 border-t border-gray-200 text-center">
                  <button
                    onClick={() => {
                      const newLimit = showLimit + 20;
                      setShowLimit(newLimit);
                      if (newLimit > auditHistory.length) {
                        onRequestMore(newLimit);
                      }
                    }}
                    className="text-sm text-blue-600 hover:text-blue-800 font-medium"
                  >
                    Carregar mais registros ({auditHistory.length - showLimit} restantes)
                  </button>
                </div>
              )}
            </>
          )}
        </div>
      )}
    </div>
  );
};
