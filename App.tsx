import React, { useState } from 'react';
import { Sidebar } from './components/Sidebar';
import { Overview } from './pages/Overview';
import { Analytics } from './pages/Analytics';
import { Settings } from './pages/Settings';
import { Page } from './types';

const App: React.FC = () => {
  const [currentPage, setCurrentPage] = useState<Page>(Page.OVERVIEW);

  const renderPage = () => {
    switch(currentPage) {
      case Page.OVERVIEW:
        return <Overview />;
      case Page.ANALYTICS:
        return <Analytics />;
      case Page.SETTINGS:
        return <Settings />;
      default:
        // Placeholder for other pages
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

  return (
    <div className="flex min-h-screen font-sans text-white bg-bg-dark">
      <Sidebar currentPage={currentPage} onNavigate={setCurrentPage} />
      <main className="flex-1 overflow-y-auto h-screen bg-bg-dark relative">
        {/* Background gradient effects */}
        <div className="fixed top-0 left-0 w-full h-96 bg-primary/5 rounded-full blur-[128px] pointer-events-none -z-10 translate-x-1/4 -translate-y-1/2"></div>
        {renderPage()}
      </main>
    </div>
  );
};

export default App;