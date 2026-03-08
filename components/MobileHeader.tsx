import React from 'react';
import { Activity } from 'lucide-react';

export const MobileHeader: React.FC = () => {
    return (
        <header className="md:hidden bg-background/80 backdrop-blur-md border-b border-border z-[60] px-4 py-3 pt-[calc(0.75rem+env(safe-area-inset-top))] flex items-center justify-between sticky top-0">
            <div className="flex items-center gap-2.5">
                <div className="w-8 h-8 bg-primary/10 border border-primary/20 rounded-xl flex items-center justify-center">
                    <Activity className="text-primary" size={16} />
                </div>
                <span className="text-base font-semibold text-foreground tracking-tight">
                    Habitos Pro
                </span>
            </div>
        </header>
    );
};
