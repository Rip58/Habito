import React from 'react';
import { ActivityLog } from '../types';
import { ChevronRight, Circle } from 'lucide-react';

interface LogTableProps {
  logs: ActivityLog[];
}

export const LogTable: React.FC<LogTableProps> = ({ logs }) => {
  const getStatusColor = (status: string) => {
    switch (status) {
      case 'COMPLETED': return 'text-primary';
      case 'PENDING': return 'text-yellow-500';
      case 'FAILED': return 'text-red-500';
      default: return 'text-text-muted';
    }
  };

  const getStatusLabel = (status: string) => {
    switch (status) {
      case 'COMPLETED': return 'COMPLETADO';
      case 'PENDING': return 'PENDIENTE';
      case 'FAILED': return 'FALLIDO';
      default: return status;
    }
  };

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h2 className="text-xl font-bold text-white">Registros Mensuales Recientes</h2>
        <button className="text-primary text-sm font-semibold flex items-center gap-1 hover:underline">
          Ver Historial Completo <ChevronRight size={16} />
        </button>
      </div>

      <div className="bg-bg-card rounded-2xl border border-white/5 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-white/5 border-b border-white/5 text-xs font-bold uppercase tracking-wider text-text-muted">
                <th className="px-6 py-4">Hora</th>
                <th className="px-6 py-4">Evento</th>
                <th className="px-6 py-4">Categoría</th>
                <th className="px-6 py-4">Intensidad</th>
                <th className="px-6 py-4">Estado</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-white/5">
              {logs.map((log) => (
                <tr key={log.id} className="hover:bg-white/5 transition-colors group">
                  <td className="px-6 py-4 text-sm font-medium text-slate-200">{log.timestamp}</td>
                  <td className="px-6 py-4 text-sm text-slate-300">{log.eventName}</td>
                  <td className="px-6 py-4">
                    <span className="px-2.5 py-1 rounded bg-white/10 text-xs text-slate-300 font-medium">
                      {log.category}
                    </span>
                  </td>
                  <td className="px-6 py-4">
                    <div className="w-24 h-1.5 bg-white/10 rounded-full overflow-hidden">
                      <div 
                        className="bg-primary h-full rounded-full transition-all duration-500 ease-out" 
                        style={{ width: `${log.intensity}%` }}
                      />
                    </div>
                  </td>
                  <td className="px-6 py-4">
                    <span className={`flex items-center gap-2 text-xs font-bold ${getStatusColor(log.status)}`}>
                      <Circle size={8} fill="currentColor" className={log.status === 'PENDING' ? '' : 'animate-pulse-slow'} />
                      {getStatusLabel(log.status)}
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};