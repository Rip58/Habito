import React, { useState, useMemo } from 'react';
import { ActivityLog, Category } from '../types';
import { ChevronRight, Circle, ChevronDown, Edit2, Trash2, ArrowUpDown, Filter, ChevronUp } from 'lucide-react';

interface LogTableProps {
  logs: ActivityLog[];
  categories?: Category[];
  onEdit?: (log: ActivityLog) => void;
  onDelete?: (id: string) => void;
}

export const LogTable: React.FC<LogTableProps> = ({ logs, categories = [], onEdit, onDelete }) => {
  const [isOpen, setIsOpen] = useState(true);
  const [sortOrder, setSortOrder] = useState<'newest' | 'oldest'>('newest');
  const [selectedCategory, setSelectedCategory] = useState<string>('all');

  // Filter and Sort logs
  const processedLogs = useMemo(() => {
    let filtered = [...logs];

    // Filter by category
    if (selectedCategory !== 'all') {
      filtered = filtered.filter(log => (log.categoryId === selectedCategory) || (log.category === selectedCategory));
    }

    // Sort
    return filtered.sort((a, b) => {
      const dateA = a.dateObj?.getTime() || 0;
      const dateB = b.dateObj?.getTime() || 0;
      return sortOrder === 'newest' ? dateB - dateA : dateA - dateB;
    });
  }, [logs, sortOrder, selectedCategory]);

  const toggleSortOrder = () => {
    setSortOrder(prev => prev === 'newest' ? 'oldest' : 'newest');
  };

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
    <div className="flex flex-col h-full space-y-4">
      <div className="flex items-center justify-between shrink-0">
        <div className="flex items-center gap-2 cursor-pointer" onClick={() => setIsOpen(!isOpen)}>
          <h2 className="text-xl font-bold text-white transition-colors hover:text-primary/90">Actividad Reciente</h2>
          {isOpen ? <ChevronDown size={20} className="text-text-muted" /> : <ChevronRight size={20} className="text-text-muted" />}
        </div>

        <div className="flex items-center gap-2">
          {/* Category Filter */}
          {categories.length > 0 && (
            <div className="relative group">
              <select
                value={selectedCategory}
                onChange={(e) => setSelectedCategory(e.target.value)}
                className="appearance-none bg-white/5 border border-white/5 text-xs text-text-muted font-medium rounded-lg pl-3 pr-8 py-1.5 focus:outline-none focus:ring-1 focus:ring-primary/50 cursor-pointer hover:bg-white/10 transition-colors"
              >
                <option value="all">Todas</option>
                {categories.map(cat => (
                  <option key={cat.id} value={cat.id}>{cat.name}</option>
                ))}
              </select>
              <div className="absolute right-2 top-1/2 -translate-y-1/2 pointer-events-none text-text-muted">
                <Filter size={12} />
              </div>
            </div>
          )}

          {/* Sort Button */}
          <div className="flex items-center bg-white/5 rounded-lg p-1 border border-white/5">
            <button
              onClick={toggleSortOrder}
              className={`p-1.5 rounded-md transition-all ${sortOrder === 'newest' ? 'bg-primary text-white shadow-sm' : 'text-text-muted hover:text-white'}`}
              title={sortOrder === 'newest' ? "Más recientes primero" : "Más antiguos primero"}
            >
              <ArrowUpDown size={14} />
            </button>
          </div>
          <span className="text-xs font-semibold text-text-muted px-2 py-1 bg-white/5 rounded-lg border border-white/5">
            {processedLogs.length}
          </span>
        </div>
      </div>

      {/* Collapsible Content */}
      {isOpen && (
        <div className="flex-1 overflow-y-auto pr-2 space-y-3 custom-scrollbar transition-all duration-300 ease-in-out">
          {processedLogs.length > 0 ? (
            processedLogs.map((log) => {
              const categoryName = categories.find(c => c.id === log.categoryId)?.name || log.category;
              return (
                <div key={log.id} className="group bg-white/5 hover:bg-white/10 px-4 py-3 rounded-xl border border-white/5 hover:border-primary/20 transition-all duration-300 flex items-center justify-between gap-3 relative overflow-hidden">

                  {/* Event Info */}
                  <div className="flex items-center gap-3 flex-1 min-w-0 z-10">
                    <div className={`w-8 h-8 rounded-lg flex items-center justify-center shrink-0 bg-primary/10 text-primary border border-primary/10`}>
                      <Circle size={8} fill="currentColor" className={log.status === 'PENDING' ? 'text-yellow-500' : 'text-primary'} />
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2">
                        <h3 className="text-sm font-semibold text-white truncate">{log.eventName}</h3>
                        <span className="px-1.5 py-0.5 rounded-md bg-white/10 text-[10px] text-text-muted font-medium whitespace-nowrap border border-white/5">
                          {categoryName}
                        </span>
                      </div>
                      <p className="text-xs text-text-muted truncate mt-0.5">{log.timestamp}</p>
                    </div>
                  </div>

                  {/* Actions (Hover reveal) */}
                  <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity duration-200 z-10">
                    {onEdit && (
                      <button
                        onClick={() => onEdit(log)}
                        className="p-2 hover:bg-white/20 rounded-lg text-text-muted hover:text-primary transition-colors"
                        title="Editar"
                      >
                        <Edit2 size={14} />
                      </button>
                    )}
                    {onDelete && log.id !== undefined && (
                      <button
                        onClick={() => onDelete(log.id!)}
                        className="p-2 hover:bg-red-500/20 rounded-lg text-text-muted hover:text-red-400 transition-colors"
                        title="Eliminar"
                      >
                        <Trash2 size={14} />
                      </button>
                    )}
                  </div>

                  {/* Hover Glow */}
                  <div className="absolute inset-0 bg-gradient-to-r from-transparent via-primary/5 to-transparent translate-x-[-100%] group-hover:translate-x-[100%] transition-transform duration-1000 pointer-events-none"></div>
                </div>
              );
            })
          ) : (
            <div className="h-40 flex flex-col items-center justify-center text-text-muted text-sm italic">
              <p>No hay actividad registrada</p>
              {selectedCategory !== 'all' && <p className="text-xs mt-1">en esta categoría</p>}
            </div>
          )}
        </div>
      )}
    </div>
  );
};