import React, { useState, useEffect, useCallback } from 'react';
import { Sidebar } from './components/Sidebar';
import { Overview } from './pages/Overview';
import { Analytics } from './pages/Analytics';
import { Settings } from './pages/Settings';
import { MobileHeader } from './components/MobileHeader';
import { BottomNav } from './components/BottomNav';
import { Login } from './components/Login';
import { VersionCheck } from './components/VersionCheck';
import { Page, Category } from './types';
import { api } from './lib/api';

const App: React.FC = () => {
  const [currentPage, setCurrentPage] = useState<Page>(Page.OVERVIEW);
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [pin, setPin] = useState('0001');
  const [loginError, setLoginError] = useState(false);
  const [categories, setCategories] = useState<Category[]>([]);

  // Fetch categories from API
  const fetchCategories = useCallback(async () => {
    try {
      const cats = await api.categories.getAll();
      setCategories(cats.map(c => ({ ...c, id: String(c.id) })) as Category[]);
    } catch (err) {
      console.error('Failed to fetch categories:', err);
    }
  }, []);

  // Seed data and fetch categories on initial load
  useEffect(() => {
    api.seed().then(() => fetchCategories()).catch(console.error);
  }, [fetchCategories]);

  // Check for saved PIN in localStorage on mount
  useEffect(() => {
    const savedPin = localStorage.getItem('app_pin');
    if (savedPin) {
      setPin(savedPin);
    }
  }, []);

  const handleLogin = (enteredPin: string) => {
    if (enteredPin === pin) {
      setIsAuthenticated(true);
      setLoginError(false);
    } else {
      setLoginError(true);
      setTimeout(() => setLoginError(false), 2000);
    }
  };

  const handleUpdatePin = (newPin: string) => {
    setPin(newPin);
    localStorage.setItem('app_pin', newPin);
  };

  const renderPage = () => {
    switch (currentPage) {
      case Page.OVERVIEW:
        return <Overview categories={categories} onCategoriesChange={fetchCategories} />;
      case Page.ANALYTICS:
        return <Analytics />;
      case Page.SETTINGS:
        return (
          <Settings
            categories={categories}
            setCategories={() => { }}
            onCategoriesChange={fetchCategories}
            currentPin={pin}
            onUpdatePin={handleUpdatePin}
          />
        );
      default:
        return (
          <div className="flex items-center justify-center h-full text-text-muted">
            <div className="text-center">
              <h2 className="text-2xl font-bold mb-2">Próximamente</h2>
              <p>La página {currentPage} está en construcción.</p>
            </div>
          </div>
        );
    }
  };

  if (!isAuthenticated) {
    return <Login onLogin={handleLogin} error={loginError} />;
  }

  return (
    <VersionCheck>
      <div className="flex flex-col h-screen font-sans text-white bg-bg-dark overflow-hidden max-w-full">
        <Sidebar currentPage={currentPage} onNavigate={setCurrentPage} />
        <MobileHeader />
        <main className="flex-1 overflow-y-auto overflow-x-hidden relative w-full max-w-full pt-[calc(4rem+env(safe-area-inset-top))] pb-[calc(6rem+env(safe-area-inset-bottom))] md:pt-0 md:pb-8">
          <div className="fixed top-0 left-0 w-full h-96 bg-primary/5 rounded-full blur-[128px] pointer-events-none -z-10 translate-x-1/4 -translate-y-1/2"></div>
          {renderPage()}
        </main>
        <BottomNav currentPage={currentPage} onNavigate={setCurrentPage} />
      </div>
    </VersionCheck>
  );
};

export default App;