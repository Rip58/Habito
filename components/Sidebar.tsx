import React from 'react';
import { LayoutDashboard, Settings, Activity, Timer } from 'lucide-react';
import { Page } from '../types';

interface SidebarProps {
  currentPage: Page;
  onNavigate: (page: Page) => void;
}

export const Sidebar: React.FC<SidebarProps> = ({ currentPage, onNavigate }) => {
  const navItems = [
    { id: Page.OVERVIEW, label: 'Resumen', icon: <LayoutDashboard size={16} /> },
    { id: Page.FOCUS, label: 'Focus', icon: <Timer size={16} /> },
  ];

  return (
    <header className="hidden md:flex w-full bg-background/80 backdrop-blur-md border-b border-border flex-row items-center justify-between sticky top-0 z-50 px-6 h-16 transition-all">

      {/* Logo */}
      <div
        className="flex items-center gap-2.5 cursor-pointer group"
        onClick={() => onNavigate(Page.OVERVIEW)}
      >
        <div className="w-8 h-8 bg-primary/10 border border-primary/20 rounded-xl flex items-center justify-center group-hover:bg-primary/20 transition-colors">
          <Activity className="text-primary" size={16} />
        </div>
        <span className="text-base font-semibold text-foreground tracking-tight">
          Habitos Pro
        </span>
      </div>

      {/* Navigation — shadcn TabsList style */}
      <nav className="flex items-center gap-1 bg-muted/60 p-1 rounded-md border border-border/40">
        {navItems.map((item) => (
          <button
            key={item.id}
            onClick={() => onNavigate(item.id as Page)}
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-sm text-sm font-medium transition-all duration-200 ${currentPage === item.id
              ? 'bg-card shadow-sm text-foreground'
              : 'text-muted-foreground hover:text-foreground'
              }`}
          >
            {item.icon}
            {item.label}
          </button>
        ))}
      </nav>

      {/* Settings */}
      <button
        onClick={() => onNavigate(Page.SETTINGS)}
        className={`flex items-center gap-1.5 px-3 py-1.5 rounded-md text-sm font-medium transition-all duration-200 ${currentPage === Page.SETTINGS
          ? 'bg-primary/10 text-primary border border-primary/20'
          : 'text-muted-foreground hover:text-foreground hover:bg-accent'
          }`}
      >
        <Settings size={16} />
        <span>Configuración</span>
      </button>
    </header>
  );
};