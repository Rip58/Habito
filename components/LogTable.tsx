import React, { useState, useMemo } from 'react';
import { ActivityLog } from '../types';
import { ChevronRight, Circle, ChevronDown, Edit2, Trash2, ArrowUpDown } from 'lucide-react';

interface LogTableProps {
  logs: ActivityLog[];
  onEdit?: (log: ActivityLog) => void;
  onDelete?: (id: number) => void;
}

export const LogTable: React.FC<LogTableProps> = ({ logs, onEdit, onDelete }) => {
  const [isOpen, setIsOpen] = useState(false);
  const [sortOrder, setSortOrder] = useState<'newest' | 'oldest'>('newest');

  // Sort logs based on selected order
  const sortedLogs = useMemo(() => {
    const sorted = [...logs].sort((a, b) => {
      const dateA = a.dateObj?.getTime() || 0;
      const dateB = b.dateObj?.getTime() || 0;
      return sortOrder === 'newest' ? dateB - dateA : dateA - dateB;
    });
    return sorted;
  }, [logs, sortOrder]);

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
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="w-full flex items-center justify-between group"
      >
        <div className="flex items-center gap-2">
          <h2 className="text-xl font-bold text-white group-hover:text-primary transition-colors">Registros Mensuales Recientes</h2>
          <ChevronDown size={20} className={`text-text-muted transition-transform duration-300 ${isOpen ? 'rotate-180' : ''}`} />
        </div>
        <span className="text-primary text-sm font-semibold flex items-center gap-1 hover:underline">
          {isOpen ? 'Ocultar' : 'Ver Todos'}
        </span>
      </button>

      {isOpen && (
        <div className="animate-in fade-in slide-in-from-top-2 duration-300 space-y-4">
          {/* Sort Filter */}
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <ArrowUpDown size={16} className="text-text-muted" />
              <select
                value={sortOrder}
                onChange={(e) => setSortOrder(e.target.value as 'newest' | 'oldest')}
                className="bg-white/5 border border-white/10 rounded-lg px-3 py-2 text-sm text-white font-medium focus:ring-2 focus:ring-primary/50 focus:border-primary/50 outline-none hover:border-primary/30 transition-all cursor-pointer"
              >
                <option value="newest" className="bg-bg-dark">Más reciente primero</option>
                <option value="oldest" className="bg-bg-dark">Más antigua primero</option>
              </select>
            </div>
            <span className="text-xs text-text-muted">
              {sortedLogs.length} {sortedLogs.length === 1 ? 'registro' : 'registros'}
            </span>
          </div>

          {/* Mobile View */}
          <div className="space-y-2 md:hidden">
            {sortedLogs.map((log) => (
              <div key={log.id} className="bg-bg-card px-3 py-2.5 rounded-lg border border-white/5 flex items-center justify-between gap-2">
                {/* Left side: Event info */}
                <div className="flex items-center gap-2 flex-1 min-w-0">
                  <span className="px-2 py-0.5 rounded bg-white/10 text-[9px] text-slate-300 font-medium whitespace-nowrap">
                    {log.category}
                  </span>
                  <div className="flex-1 min-w-0 flex items-baseline gap-1.5">
                    <p className="text-xs font-semibold text-white truncate">{log.eventName}</p>
                    <span className="text-[10px] text-text-muted whitespace-nowrap">{log.timestamp.split(',')[1]?.trim() || log.timestamp}</span>
                  </div>
                </div>

                {/* Right side: Status and actions */}
                <div className="flex items-center gap-2 shrink-0">
                  <span className={`w-1.5 h-1.5 rounded-full ${getStatusColor(log.status)}`} style={{ backgroundColor: 'currentColor' }}></span>

                  {onEdit && (
                    <button
                      onClick={() => onEdit(log)}
                      className="p-1.5 hover:bg-white/10 rounded text-text-muted hover:text-primary transition-colors"
                      title="Editar"
                    >
                      <Edit2 size={12} />
                    </button>
                  )}
                  {onDelete && log.id !== undefined && (
                    <button
                      onClick={() => onDelete(log.id!)}
                      className="p-1.5 hover:bg-white/10 rounded text-text-muted hover:text-red-400 transition-colors"
                      title="Eliminar"
                    >
                      <Trash2 size={12} />
                    </button>
                  )}
                </div>
              </div>
            ))}
          </div>

          {/* Desktop View */}
          <div className="hidden md:block bg-bg-card rounded-2xl border border-white/5 overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse">
                <thead>
                  <tr className="bg-white/5 border-b border-white/5 text-xs font-bold uppercase tracking-wider text-text-muted">
                    <th className="px-6 py-4">Hora</th>
                    <th className="px-6 py-4">Evento</th>
                    <th className="px-6 py-4">Categoría</th>
                    <th className="px-6 py-4">Estado</th>
                    <th className="px-6 py-4 text-right">Acciones</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-white/5">
                  {sortedLogs.map((log) => (
                    <tr key={log.id} className="hover:bg-white/5 transition-colors group">
                      <td className="px-6 py-4 text-sm font-medium text-slate-200">{log.timestamp}</td>
                      <td className="px-6 py-4 text-sm text-slate-300">{log.eventName}</td>
                      <td className="px-6 py-4">
                        <span className="px-2.5 py-1 rounded bg-white/10 text-xs text-slate-300 font-medium">
                          {log.category}
                        </span>
                      </td>
                      <td className="px-6 py-4">
                        <span className={`flex items-center gap-2 text-xs font-bold ${getStatusColor(log.status)}`}>
                          <Circle size={8} fill="currentColor" className={log.status === 'PENDING' ? '' : 'animate-pulse-slow'} />
                          {getStatusLabel(log.status)}
                        </span>
                      </td>
                      <td className="px-6 py-4">
                        <div className="flex items-center justify-end gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                          {onEdit && (
                            <button
                              onClick={() => onEdit(log)}
                              className="p-2 hover:bg-white/10 rounded-lg text-text-muted hover:text-primary transition-colors"
                              title="Editar"
                            >
                              <Edit2 size={16} />
                            </button>
                          )}
                          {onDelete && log.id !== undefined && (
                            <button
                              onClick={() => onDelete(log.id!)}
                              className="p-2 hover:bg-white/10 rounded-lg text-text-muted hover:text-red-400 transition-colors"
                              title="Eliminar"
                            >
                              <Trash2 size={16} />
                            </button>
                          )}
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};