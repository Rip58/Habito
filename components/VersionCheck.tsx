"use client";
import React, { createContext, useCallback, useContext, useEffect, useRef, useState } from 'react';
import buildInfo from '../public/version.json';
import { Cmd } from './v6/Button';

export interface VersionInfo {
    buildId: string;
    commit: string;
    buildDate: string;
}

// Horneado en el bundle al compilar: la versión que ESTA pestaña ejecuta, no la
// que el servidor sirve ahora mismo. Esa diferencia es todo el mecanismo.
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

            {updateAvailable && !dismissed && (
                <div
                    role="status"
                    className="fixed left-1/2 top-3 z-[70] w-[min(26rem,calc(100vw-1.75rem))] -translate-x-1/2 rounded border border-border bg-surface px-3 py-2.5"
                    style={{ boxShadow: '0 8px 24px rgba(0,0,0,0.5)' }}
                >
                    <div className="text-12">
                        <span className="text-green">$</span>{' '}
                        <span className="font-bold text-white">versión nueva disponible</span>
                    </div>
                    <div className="mt-1 flex items-center gap-4">
                        <Cmd strong onClick={() => window.location.reload()}>actualizar</Cmd>
                        <Cmd accent="var(--v6-dim)" onClick={() => setDismissed(true)}>ahora no</Cmd>
                    </div>
                </div>
            )}
        </VersionContext.Provider>
    );
};
