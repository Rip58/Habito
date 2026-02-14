import React from 'react';
import { LayoutDashboard, BarChart2, Layers, Bell, Settings } from 'lucide-react';
import { Page } from '../types';

interface BottomNavProps {
    currentPage: Page;
    onNavigate: (page: Page) => void;
}

export const BottomNav: React.FC<BottomNavProps> = ({ currentPage, onNavigate }) => {
    const navItems = [
        { id: Page.OVERVIEW, label: 'Resumen', icon: <LayoutDashboard size={20} /> },
        { id: Page.ANALYTICS, label: 'Análisis', icon: <BarChart2 size={20} /> },
        { id: Page.SETTINGS, label: 'Ajustes', icon: <Settings size={20} /> },
    ];

    return (
        <nav className="md:hidden fixed bottom-0 left-0 right-0 glass flex justify-around items-center px-4 pb-[env(safe-area-inset-bottom)] pt-3 z-50 h-[calc(4.5rem+env(safe-area-inset-bottom))] transition-all duration-300">
            {navItems.map((item) => {
                const isActive = currentPage === item.id;
                return (
                    <button
                        key={item.id}
                        onClick={() => onNavigate(item.id as Page)}
                        className={`group relative flex flex-col items-center justify-center w-full h-full gap-1 transition-all duration-300 tap-highlight-transparent ${isActive ? 'text-primary' : 'text-text-muted hover:text-white'
                            }`}
                    >
                        {/* Active Indicator Glow */}
                        <div className={`absolute -top-3 w-8 h-1 rounded-b-full bg-primary transition-all duration-300 ${isActive ? 'opacity-100 shadow-[0_0_10px_#CA8A04]' : 'opacity-0'}`} />

                        <div className={`p-2 rounded-xl transition-all duration-300 ${isActive ? 'bg-primary/10 translate-y-[-4px]' : 'group-active:scale-95'}`}>
                            {item.icon}
                        </div>
                        <span className={`text-[10px] font-medium transition-all duration-300 ${isActive ? 'opacity-100 translate-y-[-2px]' : 'opacity-70'}`}>
                            {item.label}
                        </span>
                    </button>
                );
            })}
        </nav>
    );
};
