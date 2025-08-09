import React, { useState } from 'react';
import Loader from './components/Loader';
import LoginPage from './pages/LoginPage';
import DashboardPage from './components/DashboardPage';  // Import your full dashboard page

const App: React.FC = () => {
  const [currentPage, setCurrentPage] = useState<'loader' | 'login' | 'dashboard'>('loader');

  const handleLoadingComplete = () => {
    setCurrentPage('login'); // Show login after loader
  };

  const handleLoginSuccess = () => {
    setCurrentPage('dashboard'); // Show full dashboard after login
  };

  return (
    <div className="App">
      {currentPage === 'loader' && <Loader onLoadingComplete={handleLoadingComplete} />}
      {currentPage === 'login' && <LoginPage onLoginSuccess={handleLoginSuccess} />}
      {currentPage === 'dashboard' && <DashboardPage />} {/* Show entire dashboard page */}
    </div>
  );
};

export default App;
