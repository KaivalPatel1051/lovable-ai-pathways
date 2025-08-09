import React, { useState } from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate, useNavigate, useLocation } from 'react-router-dom';
import { MessageCircle, Video, BarChart3, BookOpen, Trophy, Users } from 'lucide-react';
import Loader from './components/Loader';
import LoginPage from './pages/LoginPage';
import DashboardPage from './components/DashboardPage';
import ChatPage from './pages/ChatPage';
import ReelsPage from './pages/ReelsPage';
import TrackerPage from './pages/TrackerPage';
import GuidancePage from './pages/GuidancePage';
import AchievementsPage from './pages/AchievementsPage';
import CommunityPage from './pages/CommunityPage';
import Dock, { DockItemData } from './components/Dock';
import Particles from './components/Particles';

// Dock wrapper component to use navigation hooks
const DockWrapper: React.FC = () => {
  const navigate = useNavigate();
  const location = useLocation();

  const dockItems: DockItemData[] = [
    {
      icon: <MessageCircle />,
      label: "Chat",
      onClick: () => navigate('/chat'),
      className: location.pathname === '/chat' ? 'active' : '',
    },
    {
      icon: <Video />,
      label: "Reels",
      onClick: () => navigate('/reels'),
      className: location.pathname === '/reels' ? 'active' : '',
    },
    {
      icon: <BarChart3 />,
      label: "Tracker",
      onClick: () => navigate('/tracker'),
      className: location.pathname === '/tracker' ? 'active' : '',
    },
    {
      icon: <BookOpen />,
      label: "Guidance",
      onClick: () => navigate('/guidance'),
      className: location.pathname === '/guidance' ? 'active' : '',
    },
    {
      icon: <Trophy />,
      label: "Achievements",
      onClick: () => navigate('/achievements'),
      className: location.pathname === '/achievements' ? 'active' : '',
    },
    {
      icon: <Users />,
      label: "Community",
      onClick: () => navigate('/community'),
      className: location.pathname === '/community' ? 'active' : '',
    },
  ];

  return <Dock items={dockItems} />;
};

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
    return (
      <div className="login-page-wrapper">
        <LoginPage onLoginSuccess={handleLoginSuccess} />
      </div>
    );
  }

  // Main app with routing
  return (
    <Router>
      <div className="App min-h-screen bg-background relative">
        {/* Dynamic Particles Background */}
        <Particles
          particleColors={['#8b5cf6', '#06b6d4', '#10b981', '#f59e0b']}
          particleCount={100}
          particleSpread={8}
          speed={0.3}
          particleBaseSize={3}
          moveParticlesOnHover={true}
          alphaParticles={true}
          disableRotation={false}
        />
        
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
        
        {/* Magnifying Dock Navigation - Always visible */}
        <DockWrapper />
      </div>
    </Router>
  );
};

export default App;
