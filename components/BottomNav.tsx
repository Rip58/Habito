import React from 'react';
import { LayoutDashboard, Settings, Timer } from 'lucide-react';
import { Page } from '../types';

interface BottomNavProps {
    currentPage: Page;
    onNavigate: (page: Page) => void;
}

export const BottomNav: React.FC<BottomNavProps> = ({ currentPage, onNavigate }) => {
    const navItems = [
        { id: Page.OVERVIEW, label: 'Resumen', icon: <LayoutDashboard size={20} /> },
        { id: Page.FOCUS, label: 'Focus', icon: <Timer size={20} /> },
        { id: Page.SETTINGS, label: 'Ajustes', icon: <Settings size={20} /> },
    ];

    return (
        <nav className="md:hidden fixed bottom-0 left-0 right-0 bg-background/90 backdrop-blur-md border-t border-border flex justify-around items-center px-2 pb-[env(safe-area-inset-bottom)] pt-2 z-50 h-[calc(4rem+env(safe-area-inset-bottom))]">
            {navItems.map((item) => {
                const isActive = currentPage === item.id;
                return (
                    <button
                        key={item.id}
                        onClick={() => onNavigate(item.id as Page)}
                        className={`tap-highlight-transparent flex flex-col items-center justify-center gap-1 flex-1 h-full transition-all duration-200 active:scale-[0.96] rounded-xl ${isActive ? 'text-primary' : 'text-muted-foreground hover:text-foreground'
                            }`}
                    >
                        <div className={`p-1.5 rounded-xl transition-all duration-200 ${isActive ? 'bg-primary/10' : ''
                            }`}>
                            {item.icon}
                        </div>
                        <span className={`text-[10px] font-medium transition-all duration-200 ${isActive ? 'text-primary' : 'text-muted-foreground'
                            }`}>
                            {item.label}
                        </span>
                    </button>
                );
            })}
        </nav>
    );
};
