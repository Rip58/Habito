"use client";
import React, { useCallback, useEffect, useState } from 'react';
import { Sidebar } from './components/Sidebar';
import { Overview } from './views/Overview';
import { Focus } from './views/Focus';
import { Settings } from './views/Settings';
import { MobileHeader } from './components/MobileHeader';
import { BottomNav } from './components/BottomNav';
import { Login } from './components/Login';
import { VersionCheck } from './components/VersionCheck';
import { LoadingScreen } from './components/v6/LoadingScreen';
import { NAV_ITEMS } from './components/v6/nav';
import { Page, Category } from './types';
import { api, ApiError } from './lib/api';

type AuthState = 'checking' | 'signedOut' | 'signedIn';

const App: React.FC = () => {
  const [currentPage, setCurrentPage] = useState<Page>(Page.OVERVIEW);
  const [authState, setAuthState] = useState<AuthState>('checking');
  const [loginError, setLoginError] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [categories, setCategories] = useState<Category[]>([]);
  const [introDone, setIntroDone] = useState(false);

  // La barra de carga tarda 2s. Con movimiento reducido no hay animación que
  // esperar, así que la comprobación va también aquí: si no, el temporizador
  // aguardaría un evento que nunca llega.
  useEffect(() => {
    const reduced = window.matchMedia?.('(prefers-reduced-motion: reduce)').matches;
    const timer = setTimeout(() => setIntroDone(true), reduced ? 0 : 2000);
    return () => clearTimeout(timer);
  }, []);

  useEffect(() => {
    api.auth.status()
      .then(({ authenticated }) => setAuthState(authenticated ? 'signedIn' : 'signedOut'))
      .catch(() => setAuthState('signedOut'));
  }, []);

  const fetchCategories = useCallback(async () => {
    try {
      let cats = await api.categories.getAll();
      if (cats.length === 0) {
        await api.seed();
        cats = await api.categories.getAll();
      }
      setCategories(cats.map(c => ({ ...c, id: String(c.id) })));
    } catch (err) {
      if (err instanceof ApiError && err.status === 401) { setAuthState('signedOut'); return; }
      console.error('Failed to fetch categories:', err);
    }
  }, []);

  useEffect(() => {
    if (authState === 'signedIn') fetchCategories();
  }, [authState, fetchCategories]);

  const handleLogin = async (pin: string) => {
    setIsSubmitting(true);
    setLoginError(null);
    try {
      await api.auth.login(pin);
      setAuthState('signedIn');
    } catch (err) {
      setLoginError(err instanceof ApiError ? err.message.toLowerCase() : 'no se pudo conectar con el servidor');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleLogout = async () => {
    try { await api.auth.logout(); } finally {
      setCategories([]);
      setAuthState('signedOut');
    }
  };

  // No se enseña nada hasta que la barra termina Y sabemos si hay sesión.
  if (!introDone || authState === 'checking') return <LoadingScreen />;

  if (authState === 'signedOut') {
    return <Login onLogin={handleLogin} error={loginError} isSubmitting={isSubmitting} />;
  }

  const section = NAV_ITEMS.find(i => i.id === currentPage)?.label ?? 'resumen';

  const renderPage = () => {
    switch (currentPage) {
      case Page.FOCUS:
        return <Focus categories={categories} onCategoriesChange={fetchCategories} />;
      case Page.SETTINGS:
        return <Settings categories={categories} onCategoriesChange={fetchCategories} onLogout={handleLogout} />;
      default:
        return <Overview categories={categories} onCategoriesChange={fetchCategories} />;
    }
  };

  return (
    <VersionCheck>
      <div className="flex min-h-screen flex-col bg-background text-foreground">
        <Sidebar currentPage={currentPage} onNavigate={setCurrentPage} />
        <MobileHeader section={section} />
        <main className="flex-1">{renderPage()}</main>
        <BottomNav currentPage={currentPage} onNavigate={setCurrentPage} />
      </div>
    </VersionCheck>
  );
};

export default App;
