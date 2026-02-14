import React from 'react';
import { Zap } from 'lucide-react';

export const MobileHeader: React.FC = () => {
    return (

        <header className="md:hidden glass z-[60] px-4 py-3 pt-[calc(0.75rem+env(safe-area-inset-top))] flex items-center justify-between transition-all duration-300">
            <div className="flex items-center gap-3">
                <div className="relative group">
                    <div className="absolute inset-0 bg-primary/20 blur-lg rounded-full opacity-50 group-hover:opacity-100 transition-opacity" />
                    <div className="relative w-10 h-10 bg-gradient-to-br from-primary to-primary-hover rounded-xl flex items-center justify-center shadow-lg shadow-primary/20">
                        <Zap className="text-white fill-white" size={20} />
                    </div>
                </div>
                <div>
                    <span className="block text-lg font-bold tracking-tight text-white leading-none">Activator</span>
                    <span className="text-[10px] text-primary font-medium tracking-wider uppercase">Pro</span>
                </div>
            </div>


        </header>
    );

};
