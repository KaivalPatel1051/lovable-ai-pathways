import React, { useState } from 'react';
import Loader from './components/Loader';
import LoginPage from './pages/LoginPage';
import DashboardHeader from './components/DashboardHeader'; // You'll create this


const App: React.FC = () => {
  const [currentPage, setCurrentPage] = useState('loader');

  const handleLoadingComplete = () => {
    setCurrentPage('login');
  };

  const handleLoginSuccess = () => {
    setCurrentPage('dashboard');
  };

  const renderPage = () => {
    switch (currentPage) {
      case 'loader':
        return <Loader onLoadingComplete={handleLoadingComplete} />;
      case 'login':
        return <LoginPage onLoginSuccess={handleLoginSuccess} />;
      case 'dashboard':
        return <DashboardHeader />;
      default:
        return null;
    }
  };

  return <div className="App">{renderPage()}</div>;
};

export default App;