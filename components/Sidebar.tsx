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
  ];

  return (
    <header className="hidden md:flex w-full bg-bg-sidebar/80 backdrop-blur-xl border-b border-white/5 flex-row items-center justify-between sticky top-0 z-50 px-8 h-20 transition-all">
      <div className="flex items-center gap-3 cursor-pointer hover:opacity-80 transition-opacity" onClick={() => onNavigate(Page.OVERVIEW)}>
        <div className="w-10 h-10 bg-primary rounded-xl flex items-center justify-center shadow-[0_0_20px_rgba(48,232,122,0.3)]">
          <Zap className="text-bg-dark fill-bg-dark" size={24} />
        </div>
        <span className="text-xl font-bold tracking-tight text-white">Activator</span>
      </div>

      <nav className="flex items-center gap-2 bg-white/5 p-1.5 rounded-xl border border-white/5">
        {navItems.map((item) => (
          <button
            key={item.id}
            onClick={() => onNavigate(item.id as Page)}
            className={`flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium transition-all duration-200 ${currentPage === item.id
              ? 'bg-bg-dark text-white shadow-sm border border-white/10'
              : 'text-text-muted hover:text-white hover:bg-white/5'
              }`}
          >
            {item.icon}
            {item.label}
          </button>
        ))}
      </nav>

      <div className="flex items-center gap-4">

        <button
          onClick={() => onNavigate(Page.SETTINGS)}
          className={`flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium transition-all duration-200 ${currentPage === Page.SETTINGS
            ? 'bg-primary/20 text-primary border border-primary/20'
            : 'text-text-muted hover:text-white hover:bg-white/5'
            }`}
        >
          <Settings size={18} />
          <span>Configuración</span>
        </button>
      </div>
    </header>
  );
};