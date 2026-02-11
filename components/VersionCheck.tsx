import React, { useEffect, useState, createContext, useContext } from 'react';
import { RefreshCw } from 'lucide-react';

interface VersionInfo {
    buildHash: string;
    buildDate: string;
    deployNumber: number;
}

interface VersionContextType {
    currentVersion: VersionInfo | null;
    checkForUpdates: () => Promise<void>;
    isChecking: boolean;
}

const VersionContext = createContext<VersionContextType>({
    currentVersion: null,
    checkForUpdates: async () => { },
    isChecking: false
});

export const useVersion = () => useContext(VersionContext);

export const VersionCheck: React.FC<{ children: React.ReactNode }> = ({ children }) => {
    const [currentVersion, setCurrentVersion] = useState<VersionInfo | null>(null);
    const [isChecking, setIsChecking] = useState(false);
    const [showUpdateNotification, setShowUpdateNotification] = useState(false);

    // Load local version on mount
    useEffect(() => {
        loadLocalVersion();
    }, []);

    // Check for updates on mount (after login)
    useEffect(() => {
        if (currentVersion) {
            checkForUpdates();
        }
    }, [currentVersion?.buildHash]); // Only run when version is first loaded

    const loadLocalVersion = async () => {
        try {
            const response = await fetch('/version.json');
            if (response.ok) {
                const version = await response.json();
                setCurrentVersion(version);
                // Store in localStorage for comparison
                localStorage.setItem('app_version', JSON.stringify(version));
            }
        } catch (error) {
            console.error('Failed to load local version:', error);
        }
    };

    const checkForUpdates = async () => {
        setIsChecking(true);
        try {
            // In development, fetch directly from /version.json
            // In production (Vercel), the API endpoint will work
            const endpoint = process.env.NODE_ENV === 'production' ? '/api/version' : '/version.json';
            const response = await fetch(endpoint);

            if (response.ok) {
                const serverVersion: VersionInfo = await response.json();

                // Compare with current version
                if (currentVersion && serverVersion.buildHash !== currentVersion.buildHash) {
                    console.log('New version detected:', serverVersion);
                    setShowUpdateNotification(true);

                    // Force reload after 3 seconds
                    setTimeout(() => {
                        window.location.reload();
                    }, 3000);
                } else {
                    console.log('App is up to date');
                }
            }
        } catch (error) {
            console.error('Failed to check for updates:', error);
        } finally {
            setIsChecking(false);
        }
    };

    return (
        <VersionContext.Provider value={{ currentVersion, checkForUpdates, isChecking }}>
            {children}

            {/* Update Notification */}
            {showUpdateNotification && (
                <div className="fixed top-4 left-1/2 -translate-x-1/2 z-50 animate-in slide-in-from-top-4 fade-in">
                    <div className="bg-primary text-bg-dark px-6 py-4 rounded-xl shadow-2xl shadow-primary/20 flex items-center gap-3">
                        <RefreshCw className="animate-spin" size={20} />
                        <div>
                            <p className="font-bold">Nueva versión disponible</p>
                            <p className="text-sm opacity-90">Actualizando en 3 segundos...</p>
                        </div>
                    </div>
                </div>
            )}
        </VersionContext.Provider>
    );
};
