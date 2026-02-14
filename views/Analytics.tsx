import React from 'react';

export const Analytics: React.FC = () => {
    return (
        <div className="p-8 max-w-[1600px] mx-auto space-y-6 animate-in fade-in duration-700">
            <div className="flex flex-col gap-2 mb-8">
                <h1 className="text-4xl font-bold tracking-tight text-white">
                    Analíticas
                </h1>
                <p className="text-text-muted text-lg">
                    Visualiza tu progreso y estadísticas detalladas.
                </p>
            </div>

            <div className="glass-card rounded-3xl p-12 border border-white/5 flex flex-col items-center justify-center text-center space-y-4 min-h-[400px]">
                <div className="w-16 h-16 rounded-full bg-primary/10 flex items-center justify-center mb-4">
                    <svg xmlns="http://www.w3.org/2000/svg" width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="text-primary"><line x1="18" y1="20" x2="18" y2="10"></line><line x1="12" y1="20" x2="12" y2="4"></line><line x1="6" y1="20" x2="6" y2="14"></line></svg>
                </div>
                <h3 className="text-xl font-bold text-white">En Construcción</h3>
                <p className="text-text-muted max-w-md">
                    Estamos trabajando en nuevas gráficas y métricas para ayudarte a entender mejor tus hábitos.
                </p>
            </div>
        </div>
    );
};
