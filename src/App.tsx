import React, { useState } from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import Loader from './components/Loader';
import LoginPage from './pages/LoginPage';
import DashboardPage from './components/DashboardPage';
import ChatPage from './pages/ChatPage';
import ReelsPage from './pages/ReelsPage';
import TrackerPage from './pages/TrackerPage';
import GuidancePage from './pages/GuidancePage';
import AchievementsPage from './pages/AchievementsPage';
import CommunityPage from './pages/CommunityPage';
import Navigation from './components/Navigation';

const App: React.FC = () => {
  const [currentPage, setCurrentPage] = useState<'loader' | 'login' | 'dashboard'>('loader');

  const handleLoadingComplete = () => {
    setCurrentPage('login');
  };

  const handleLoginSuccess = () => {
    setCurrentPage('dashboard');
  };

  // Show loader or login without router
  if (currentPage === 'loader') {
    return <Loader onLoadingComplete={handleLoadingComplete} />;
  }

  if (currentPage === 'login') {
    return <LoginPage onLoginSuccess={handleLoginSuccess} />;
  }

  // Main app with routing
  return (
    <Router>
      <div className="App min-h-screen bg-background">
        <Routes>
          <Route path="/" element={<Navigate to="/dashboard" replace />} />
          <Route path="/dashboard" element={<DashboardPage />} />
          <Route path="/chat" element={<ChatPage />} />
          <Route path="/reels" element={<ReelsPage />} />
          <Route path="/tracker" element={<TrackerPage />} />
          <Route path="/guidance" element={<GuidancePage />} />
          <Route path="/achievements" element={<AchievementsPage />} />
          <Route path="/community" element={<CommunityPage />} />
          <Route path="*" element={<Navigate to="/dashboard" replace />} />
        </Routes>
        
        {/* Show navigation on all main app pages */}
        <Navigation />
      </div>
    </Router>
  );
};

export default App;
