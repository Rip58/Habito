import React, { useState, useEffect } from 'react';
import { Sidebar } from './components/Sidebar';
import { Overview } from './pages/Overview';
import { Analytics } from './pages/Analytics';
import { Settings } from './pages/Settings';
import { MobileHeader } from './components/MobileHeader';
import { BottomNav } from './components/BottomNav';
import { Login } from './components/Login';
import { Page, Category } from './types';
import { useLiveQuery } from 'dexie-react-hooks';
import { db, seedDatabase } from './db';

const App: React.FC = () => {
  const [currentPage, setCurrentPage] = useState<Page>(Page.OVERVIEW);
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [pin, setPin] = useState('0001');
  const [loginError, setLoginError] = useState(false);

  /* Live Query for categories */
  const dbCategories = useLiveQuery(() => db.categories.toArray());
  // Cast DB categories (number ID) to UI categories (string ID) compatibility
  const categories = (dbCategories?.map(c => ({ ...c, id: String(c.id) })) as Category[]) || [];

  // Seed data on initial load
  useEffect(() => {
    seedDatabase();
  }, []);

  // Check for saved PIN in localStorage on mount (optional, but requested "configure pin")
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
      // Reset error after animation
      setTimeout(() => setLoginError(false), 2000);
    }
  };

  const handleUpdatePin = (newPin: string) => {
    setPin(newPin);
    localStorage.setItem('app_pin', newPin);
  };

  // Helper to sync category changes (add, edit, delete) to DB
  const handleCategoriesUpdate = async (newCats: Category[]) => {
    // This function signature is flawed for DB updates when simply passing array.
    // Instead, Settings should call db operations directly.
    // We will update Settings.tsx to handle DB operations directly.
    // Keeping this prop for now as optional but better to remove or ignore.
  };

  const renderPage = () => {
    switch (currentPage) {
      case Page.OVERVIEW:
        return <Overview categories={categories} />;
      case Page.ANALYTICS:
        return <Analytics />;
      case Page.SETTINGS:
        return (
          <Settings
            categories={categories}
            // Passing db interaction logic isn't ideal here, Settings should handle it.
            // But to keep props compatible with existing interface:
            setCategories={() => { }} // No-op, Settings will use DB
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
    <div className="flex flex-col h-screen font-sans text-white bg-bg-dark overflow-hidden max-w-full">
      {/* Reused "Sidebar" component is now the Top Navigation Bar for Desktop */}
      <Sidebar currentPage={currentPage} onNavigate={setCurrentPage} />

      <MobileHeader />

      <main className="flex-1 overflow-y-auto overflow-x-hidden relative w-full max-w-full pt-[calc(4rem+env(safe-area-inset-top))] pb-[calc(6rem+env(safe-area-inset-bottom))] md:pt-0 md:pb-8">
        {/* Background gradient effects */}
        <div className="fixed top-0 left-0 w-full h-96 bg-primary/5 rounded-full blur-[128px] pointer-events-none -z-10 translate-x-1/4 -translate-y-1/2"></div>
        {renderPage()}
      </main>

      <BottomNav currentPage={currentPage} onNavigate={setCurrentPage} />
    </div>
  );
};

export default App;