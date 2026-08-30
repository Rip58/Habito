import React from 'react';

/**
 * Barra determinada: arranca vacía, se llena una vez en 2s y se queda llena
 * hasta que el contenido real esté listo. El gate en JS vive en App.tsx —
 * con movimiento reducido la animación no dispara ningún evento, así que la
 * comprobación tiene que estar también allí.
 */
export const LoadingScreen: React.FC<{ label?: string }> = ({ label = 'cargando' }) => (
    <div className="flex min-h-screen items-center justify-center bg-background p-4">
        <div className="w-full max-w-[300px]">
            <div className="mb-3.5 text-13">
                <span className="text-green">sergi@habitos</span>
                <span className="text-subtle">:~</span>
                <span className="text-green">$</span>{' '}
                <span className="text-white">{label}</span>
                <span className="v6-cursor text-white" />
            </div>
            <div className="relative h-[3px] overflow-hidden rounded-sm bg-border">
                <span className="v6-carga-barra absolute inset-y-0 left-0 rounded-sm bg-green" />
            </div>
            <p className="mt-2.5 text-11 text-subtle">{'// cargando…'}</p>
        </div>
    </div>
);
