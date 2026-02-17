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
    <header className="hidden md:flex w-full bg-bg-sidebar/60 backdrop-blur-md border-b border-white/5 flex-row items-center justify-between sticky top-0 z-50 px-8 h-20 transition-all">
      <div className="flex items-center gap-3 cursor-pointer group" onClick={() => onNavigate(Page.OVERVIEW)}>
        <div className="w-10 h-10 bg-gradient-to-br from-primary to-primary-hover rounded-xl flex items-center justify-center shadow-lg shadow-primary/20 group-hover:scale-105 transition-transform duration-300">
          <Zap className="text-white fill-white" size={20} />
        </div>
        <span className="text-2xl font-bold tracking-tight text-white group-hover:text-primary transition-colors">Habitos Pro</span>
      </div>

      <nav className="flex items-center gap-2 bg-black/20 p-1.5 rounded-xl border border-white/5">
        {navItems.map((item) => (
          <button
            key={item.id}
            onClick={() => onNavigate(item.id as Page)}
            className={`flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-bold transition-all duration-300 ${currentPage === item.id
              ? 'bg-white/10 text-white shadow-sm border border-white/10'
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
          className={`group flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium transition-all duration-300 ${currentPage === Page.SETTINGS
            ? 'bg-primary/20 text-primary border border-primary/20'
            : 'text-text-muted hover:text-white hover:bg-white/5'
            }`}
        >
          <Settings size={18} className="group-hover:rotate-90 transition-transform duration-500" />
          <span>Configuración</span>
        </button>
      </div>
    </header>
  );
};