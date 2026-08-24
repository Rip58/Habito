"use client";
import React, { useState, useEffect, useCallback } from 'react';
import { Sidebar } from './components/Sidebar';
import { Overview } from './views/Overview';
import { Focus } from './views/Focus';
import { Settings } from './views/Settings';
import { MobileHeader } from './components/MobileHeader';
import { BottomNav } from './components/BottomNav';
import { Login } from './components/Login';
import { VersionCheck } from './components/VersionCheck';
import { Page, Category } from './types';
import { api, ApiError } from './lib/api';

type AuthState = 'checking' | 'signedOut' | 'signedIn';

const App: React.FC = () => {
  const [currentPage, setCurrentPage] = useState<Page>(Page.OVERVIEW);
  const [authState, setAuthState] = useState<AuthState>('checking');
  const [loginError, setLoginError] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [categories, setCategories] = useState<Category[]>([]);

  // La sesión vive en una cookie httpOnly, así que se la preguntamos al servidor.
  useEffect(() => {
    api.auth.status()
      .then(({ authenticated }) => setAuthState(authenticated ? 'signedIn' : 'signedOut'))
      .catch(() => setAuthState('signedOut'));
  }, []);

  // Siembra las categorías por defecto solo si la cuenta está vacía, en vez de
  // llamar a /seed en cada carga.
  const fetchCategories = useCallback(async () => {
    try {
      let cats = await api.categories.getAll();
      if (cats.length === 0) {
        await api.seed();
        cats = await api.categories.getAll();
      }
      setCategories(cats.map(c => ({ ...c, id: String(c.id) })));
    } catch (err) {
      if (err instanceof ApiError && err.status === 401) {
        setAuthState('signedOut');
        return;
      }
      console.error('Failed to fetch categories:', err);
    }
  }, []);

  useEffect(() => {
    if (authState === 'signedIn') fetchCategories();
  }, [authState, fetchCategories]);

  const handleLogin = async (enteredPin: string) => {
    setIsSubmitting(true);
    setLoginError(null);
    try {
      await api.auth.login(enteredPin);
      setAuthState('signedIn');
    } catch (err) {
      setLoginError(err instanceof ApiError ? err.message : 'No se pudo conectar con el servidor.');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleLogout = async () => {
    try {
      await api.auth.logout();
    } finally {
      setCategories([]);
      setAuthState('signedOut');
    }
  };

  const renderPage = () => {
    switch (currentPage) {
      case Page.OVERVIEW:
        return <Overview categories={categories} onCategoriesChange={fetchCategories} />;
      case Page.FOCUS:
        return <Focus categories={categories} onCategoriesChange={fetchCategories} />;
      case Page.SETTINGS:
        return (
          <Settings
            categories={categories}
            onCategoriesChange={fetchCategories}
            onLogout={handleLogout}
          />
        );
      default:
        return (
          <div className="flex items-center justify-center h-full text-muted-foreground">
            <div className="text-center">
              <h2 className="text-2xl font-bold mb-2">Próximamente</h2>
              <p>La página {currentPage} está en construcción.</p>
            </div>
          </div>
        );
    }
  };

  if (authState === 'checking') {
    return (
      <div className="flex items-center justify-center h-screen bg-background text-muted-foreground text-sm">
        Cargando…
      </div>
    );
  }

  if (authState === 'signedOut') {
    return <Login onLogin={handleLogin} error={loginError} isSubmitting={isSubmitting} />;
  }

  return (
    <VersionCheck>
      <div className="flex flex-col h-screen font-sans text-foreground bg-background overflow-hidden max-w-full">
        <Sidebar currentPage={currentPage} onNavigate={setCurrentPage} />
        <main className="flex-1 overflow-y-auto overflow-x-hidden relative w-full max-w-full pb-[calc(6rem+env(safe-area-inset-bottom))] md:pb-8">
          <MobileHeader />
          <div className="absolute top-0 right-0 w-[500px] h-[500px] bg-primary/5 rounded-full blur-[128px] pointer-events-none -z-10 translate-x-1/2 -translate-y-1/2"></div>
          {renderPage()}
        </main>
        <BottomNav currentPage={currentPage} onNavigate={setCurrentPage} />
      </div>
    </VersionCheck>
  );
};

export default App;
