import React, { useState, useMemo } from 'react';
import { ActivityLog, Category } from '../types';
import { ChevronRight, Circle, ChevronDown, Edit2, Trash2, ArrowUpDown, Filter, MessageSquare } from 'lucide-react';

interface LogTableProps {
  logs: ActivityLog[];
  categories?: Category[];
  onEdit?: (log: ActivityLog) => void;
  onDelete?: (id: string) => void;
}

const LogTableRow: React.FC<{ log: ActivityLog; category?: Category; onEdit?: (log: ActivityLog) => void; onDelete?: (id: string) => void }> = ({ log, category, onEdit, onDelete }) => {
  const [isExpanded, setIsExpanded] = useState(false);
  const categoryName = category?.name || log.category;

  const dateObj = log.dateObj || new Date(log.timestamp.split(',')[0]);
  const day = dateObj instanceof Date && !isNaN(dateObj.getTime()) ? dateObj.getDate().toString().padStart(2, '0') : '--';
  const month = dateObj instanceof Date && !isNaN(dateObj.getTime()) ? dateObj.toLocaleString('es-ES', { month: 'short' }).replace('.', '') : '---';

  // Si el eventName es distinto a "Sesión de [categoría]", lo consideramos una nota personalizada
  const defaultEventName = `Sesión de ${categoryName}`;
  const isCustomNote = log.eventName && log.eventName !== defaultEventName;

  return (
    <div className="border-b border-border/40 last:border-b-0 group">
      <div
        className={`flex items-center justify-between p-3 rounded-xl transition-colors ${isCustomNote ? 'cursor-pointer hover:bg-muted/50' : ''} ${isExpanded ? 'bg-muted/30' : ''}`}
        onClick={() => isCustomNote && setIsExpanded(!isExpanded)}
      >
        <div className="flex items-center gap-4">
          {/* Icon */}
          <div
            className="h-9 w-9 rounded-full flex items-center justify-center shrink-0 border transition-colors"
            style={{
              backgroundColor: `${category?.color || 'var(--primary)'}15`,
              borderColor: `${category?.color || 'var(--primary)'}25`,
            }}
          >
            <div
              className="w-2.5 h-2.5 rounded-full"
              style={{ backgroundColor: category?.color || 'var(--primary)' }}
            />
          </div>

          {/* Date Block (Prominent) */}
          <div className="flex flex-col items-center justify-center min-w-[2.5rem]">
            <span className="text-base font-bold text-foreground leading-none">{day}</span>
            <span className="text-[10px] font-semibold text-muted-foreground uppercase tracking-wider mt-0.5">{month}</span>
          </div>

          {/* Text */}
          <div className="flex flex-col min-w-0 text-left pl-3 border-l border-border/50">
            <div className="flex items-center gap-2">
              <p className="text-sm font-semibold text-foreground truncate">{defaultEventName}</p>
              {isCustomNote && <MessageSquare size={12} className="text-muted-foreground opacity-50 shrink-0" />}
            </div>
            <p className="text-xs text-muted-foreground truncate mt-0.5">
              {categoryName} {log.timestamp && ` · ${log.timestamp.split(',')[1]?.trim()}`}
            </p>
          </div>
        </div>

        {/* Actions */}
        <div className="flex items-center gap-1 opacity-100 md:opacity-0 md:group-hover:opacity-100 transition-opacity duration-200 shrink-0 pl-2">
          {onEdit && (
            <button
              onClick={(e) => { e.stopPropagation(); onEdit(log); }}
              className="p-1.5 hover:bg-accent rounded-md text-muted-foreground hover:text-primary transition-colors"
              title="Editar"
            >
              <Edit2 size={13} />
            </button>
          )}
          {onDelete && log.id !== undefined && (
            <button
              onClick={(e) => { e.stopPropagation(); onDelete(log.id!); }}
              className="p-1.5 hover:bg-destructive/10 rounded-md text-muted-foreground hover:text-destructive transition-colors"
              title="Eliminar"
            >
              <Trash2 size={13} />
            </button>
          )}
          {isCustomNote && (
            <div className="p-1.5 text-muted-foreground ml-1">
              <ChevronDown size={14} className={`transition-transform duration-200 ${isExpanded ? 'rotate-180' : ''}`} />
            </div>
          )}
        </div>
      </div>

      {isExpanded && isCustomNote && (
        <div className="px-14 md:px-[4.5rem] pb-4 pt-1 animate-in slide-in-from-top-2 duration-200">
          <div className="text-sm text-muted-foreground bg-muted/40 p-3 rounded-lg border border-border/50 italic whitespace-pre-wrap">
            {log.eventName}
          </div>
        </div>
      )}
    </div>
  );
};

export const LogTable: React.FC<LogTableProps> = ({ logs, categories = [], onEdit, onDelete }) => {
  const [isOpen, setIsOpen] = useState(true);
  const [sortOrder, setSortOrder] = useState<'newest' | 'oldest'>('newest');
  const [selectedCategory, setSelectedCategory] = useState<string>('all');

  const processedLogs = useMemo(() => {
    let filtered = [...logs];
    if (selectedCategory !== 'all') {
      filtered = filtered.filter(log => (log.categoryId === selectedCategory) || (log.category === selectedCategory));
    }
    return filtered.sort((a, b) => {
      const dateA = a.dateObj?.getTime() || 0;
      const dateB = b.dateObj?.getTime() || 0;
      return sortOrder === 'newest' ? dateB - dateA : dateA - dateB;
    });
  }, [logs, sortOrder, selectedCategory]);

  return (
    <div className="flex flex-col h-full space-y-3">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between shrink-0 gap-3 sm:gap-0">
        <div
          className="flex items-center gap-1.5 cursor-pointer group"
          onClick={() => setIsOpen(!isOpen)}
        >
          <h2 className="text-base font-semibold text-foreground group-hover:text-primary transition-colors">
            Actividad Reciente
          </h2>
          {isOpen
            ? <ChevronDown size={16} className="text-muted-foreground" />
            : <ChevronRight size={16} className="text-muted-foreground" />
          }
        </div>

        <div className="flex items-center gap-2">
          {/* Category Filter */}
          {categories.length > 0 && (
            <div className="relative">
              <select
                value={selectedCategory}
                onChange={(e) => setSelectedCategory(e.target.value)}
                className="appearance-none bg-muted/60 border border-border/40 text-xs text-foreground font-medium rounded-md pl-3 pr-8 py-1.5 focus:outline-none focus:ring-1 focus:ring-ring/50 cursor-pointer hover:bg-muted transition-colors"
              >
                <option value="all">Todas</option>
                {categories.map(cat => (
                  <option key={cat.id} value={cat.id}>{cat.name}</option>
                ))}
              </select>
              <Filter size={11} className="absolute right-2.5 top-1/2 -translate-y-1/2 text-muted-foreground pointer-events-none" />
            </div>
          )}

          {/* Sort */}
          <button
            onClick={() => setSortOrder(prev => prev === 'newest' ? 'oldest' : 'newest')}
            title={sortOrder === 'newest' ? 'Más recientes primero' : 'Más antiguos primero'}
            className={`p-1.5 rounded-md border transition-all text-xs flex items-center justify-center w-8 h-8 ${sortOrder === 'newest'
              ? 'bg-primary/10 border-primary/20 text-primary'
              : 'bg-muted/60 border-border/40 text-muted-foreground hover:text-foreground'
              }`}
          >
            <ArrowUpDown size={13} />
          </button>

          {/* Count badge */}
          <span className="text-xs font-semibold text-muted-foreground px-2.5 py-1 bg-muted/60 rounded-full border border-border/40 tabular-nums h-8 flex items-center justify-center">
            {processedLogs.length}
          </span>
        </div>
      </div>

      {/* Log List */}
      {isOpen && (
        <div className="flex-1 overflow-y-auto pr-2 -mr-2">
          {processedLogs.length > 0 ? (
            <div className="space-y-1">
              {processedLogs.map((log) => (
                <LogTableRow
                  key={log.id}
                  log={log}
                  category={categories.find(c => c.id === log.categoryId)}
                  onEdit={onEdit}
                  onDelete={onDelete}
                />
              ))}
            </div>
          ) : (
            <div className="h-32 flex flex-col items-center justify-center text-muted-foreground text-sm">
              <p>Sin actividad registrada</p>
              {selectedCategory !== 'all' && (
                <p className="text-xs mt-1 text-muted-foreground/60">en esta categoría</p>
              )}
            </div>
          )}
        </div>
      )}
    </div>
  );
};