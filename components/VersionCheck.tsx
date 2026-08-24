import React, { createContext, useCallback, useContext, useEffect, useRef, useState } from 'react';
import { RefreshCw, X } from 'lucide-react';
import buildInfo from '../public/version.json';

export interface VersionInfo {
    buildId: string;
    commit: string;
    buildDate: string;
}

// Horneado en el bundle al compilar: es la versión que ESTA pestaña está
// ejecutando, no la que el servidor sirve ahora mismo.
//
// Esa distinción es todo el mecanismo. Antes se comparaba /version.json contra
// /api/v1/version, pero ambos leen el mismo archivo del mismo despliegue: dos
// lecturas del mismo sitio nunca difieren, así que jamás detectaba nada.
const RUNNING: VersionInfo = buildInfo;

const CHECK_INTERVAL_MS = 5 * 60 * 1000;

interface VersionContextType {
    currentVersion: VersionInfo;
    updateAvailable: boolean;
    checkForUpdates: () => Promise<void>;
    isChecking: boolean;
    lastCheckedAt: Date | null;
}

const VersionContext = createContext<VersionContextType>({
    currentVersion: RUNNING,
    updateAvailable: false,
    checkForUpdates: async () => { },
    isChecking: false,
    lastCheckedAt: null,
});

export const useVersion = () => useContext(VersionContext);

export const VersionCheck: React.FC<{ children: React.ReactNode }> = ({ children }) => {
    const [updateAvailable, setUpdateAvailable] = useState(false);
    const [isChecking, setIsChecking] = useState(false);
    const [lastCheckedAt, setLastCheckedAt] = useState<Date | null>(null);
    const [dismissed, setDismissed] = useState(false);
    const inFlight = useRef(false);

    const checkForUpdates = useCallback(async () => {
        if (inFlight.current) return;
        inFlight.current = true;
        setIsChecking(true);
        try {
            // no-store: si el navegador sirve la respuesta de su caché, la
            // comprobación mira una versión vieja del servidor.
            const response = await fetch('/api/v1/version', { cache: 'no-store' });
            if (!response.ok) return;

            const served: VersionInfo = await response.json();
            if (served.buildId && served.buildId !== RUNNING.buildId) {
                setUpdateAvailable(true);
                setDismissed(false);
            }
            setLastCheckedAt(new Date());
        } catch {
            // Sin red o sesión caducada: se reintenta en el siguiente ciclo.
        } finally {
            inFlight.current = false;
            setIsChecking(false);
        }
    }, []);

    // Al montar, cada cinco minutos, y al volver a la pestaña. Antes solo
    // comprobaba al montar, así que una pestaña abierta no se enteraba nunca.
    useEffect(() => {
        checkForUpdates();
        const timer = setInterval(checkForUpdates, CHECK_INTERVAL_MS);
        const onVisibilityChange = () => {
            if (document.visibilityState === 'visible') checkForUpdates();
        };
        document.addEventListener('visibilitychange', onVisibilityChange);
        return () => {
            clearInterval(timer);
            document.removeEventListener('visibilitychange', onVisibilityChange);
        };
    }, [checkForUpdates]);

    return (
        <VersionContext.Provider
            value={{ currentVersion: RUNNING, updateAvailable, checkForUpdates, isChecking, lastCheckedAt }}
        >
            {children}

            {/* Recargar lo decide la persona. Antes se forzaba a los 3 segundos,
                lo que se lleva por delante un formulario a medias. */}
            {updateAvailable && !dismissed && (
                <div
                    role="status"
                    className="fixed top-4 left-1/2 -translate-x-1/2 z-[70] w-[min(26rem,calc(100vw-2rem))] fade-in"
                >
                    <div className="flex items-center gap-3 rounded-lg border border-border bg-card px-4 py-3 shadow-lg">
                        <RefreshCw size={18} className="text-primary shrink-0" />
                        <div className="flex-1 min-w-0">
                            <p className="text-sm font-semibold text-foreground">Hay una versión nueva</p>
                            <p className="text-xs text-muted-foreground">Recarga cuando te venga bien.</p>
                        </div>
                        <button
                            onClick={() => window.location.reload()}
                            className="h-9 px-3.5 rounded-md bg-primary text-primary-foreground text-sm font-semibold hover:opacity-90 transition-opacity shrink-0"
                        >
                            Actualizar
                        </button>
                        <button
                            onClick={() => setDismissed(true)}
                            aria-label="Descartar"
                            className="h-9 w-9 rounded-md flex items-center justify-center text-muted-foreground hover:bg-accent hover:text-foreground transition-colors shrink-0"
                        >
                            <X size={16} />
                        </button>
                    </div>
                </div>
            )}
        </VersionContext.Provider>
    );
};
