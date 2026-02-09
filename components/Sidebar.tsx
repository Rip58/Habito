import React from 'react';
import { LayoutDashboard, BarChart2, Layers, Bell, Settings, Zap } from 'lucide-react';
import { Page } from '../types';

interface SidebarProps {
  currentPage: Page;
  onNavigate: (page: Page) => void;
}

export const Sidebar: React.FC<SidebarProps> = ({ currentPage, onNavigate }) => {
  const navItems = [
    { id: Page.OVERVIEW, label: 'Resumen', icon: <LayoutDashboard size={20} /> },
    { id: Page.ANALYTICS, label: 'Análisis Detallado', icon: <BarChart2 size={20} /> },
    { id: Page.LOGS, label: 'Historial', icon: <Layers size={20} /> },
    { id: Page.ALERTS, label: 'Alertas', icon: <Bell size={20} /> },
  ];

  return (
    <aside className="w-64 bg-bg-sidebar border-r border-white/5 flex flex-col h-screen sticky top-0">
      <div className="p-6 flex items-center gap-3">
        <div className="w-8 h-8 bg-primary rounded-lg flex items-center justify-center shadow-[0_0_15px_rgba(48,232,122,0.3)]">
          <Zap className="text-bg-dark fill-bg-dark" size={20} />
        </div>
        <span className="text-xl font-bold tracking-tight text-white">Activator</span>
      </div>

      <nav className="flex-1 px-4 py-4 space-y-1">
        {navItems.map((item) => (
          <button
            key={item.id}
            onClick={() => onNavigate(item.id as Page)}
            className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-lg transition-all duration-200 ${
              currentPage === item.id
                ? 'bg-primary/10 text-primary font-medium'
                : 'text-text-muted hover:text-primary hover:bg-primary/5'
            }`}
          >
            {item.icon}
            {item.label}
          </button>
        ))}

        <div className="pt-6 pb-2 px-3 text-xs font-bold text-text-muted/50 uppercase tracking-wider">
          Espacio de Trabajo
        </div>

        <button
          onClick={() => onNavigate(Page.SETTINGS)}
          className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-lg transition-all duration-200 ${
            currentPage === Page.SETTINGS
              ? 'bg-primary/10 text-primary font-medium'
              : 'text-text-muted hover:text-primary hover:bg-primary/5'
          }`}
        >
          <Settings size={20} />
          Configuración
        </button>
      </nav>

      <div className="p-4 border-t border-white/5">
        <div className="bg-white/5 rounded-xl p-3 flex items-center gap-3 hover:bg-white/10 transition-colors cursor-pointer group">
          <div className="w-10 h-10 rounded-full bg-gradient-to-tr from-blue-500 to-purple-500 overflow-hidden border-2 border-transparent group-hover:border-primary transition-all">
             <img src="https://picsum.photos/100/100" alt="User" className="w-full h-full object-cover" />
          </div>
          <div className="flex-1 min-w-0">
            <p className="text-sm font-semibold text-white truncate">Alex Rivers</p>
            <p className="text-xs text-text-muted truncate">Miembro Pro Plan</p>
          </div>
        </div>
      </div>
    </aside>
  );
};