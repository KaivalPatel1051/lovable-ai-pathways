import React, { useState } from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate, useNavigate, useLocation } from 'react-router-dom';
import { MessageCircle, Video, BarChart3, BookOpen, Trophy, Users } from 'lucide-react';
import { AuthProvider, useAuth } from './contexts/AuthContext';
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
import TestBackend from './components/TestBackend';
import WorkingLogin from './components/WorkingLogin';

// Protected Route Component
const ProtectedRoute: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const { isAuthenticated, loading } = useAuth();
  
  if (loading) {
    return <Loader onLoadingComplete={() => {}} />;
  }
  
  return isAuthenticated ? <>{children}</> : <Navigate to="/login" replace />;
};

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

// Main App Content Component
const AppContent: React.FC = () => {
  const { isAuthenticated, loading } = useAuth();
  const [showLoader, setShowLoader] = useState(true);

  const handleLoadingComplete = () => {
    setShowLoader(false);
  };

  // Show initial loader
  if (showLoader) {
    return <Loader onLoadingComplete={handleLoadingComplete} />;
  }

  // Show login page if not authenticated
  if (!loading && !isAuthenticated) {
    return (
      <div className="login-page-wrapper">
        <LoginPage />
      </div>
    );
  }

  // Show main app if authenticated
  return (
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
        <Route path="/login" element={<Navigate to="/dashboard" replace />} />
        <Route path="/dashboard" element={
          <ProtectedRoute>
            <DashboardPage />
          </ProtectedRoute>
        } />
        <Route path="/chat" element={
          <ProtectedRoute>
            <ChatPage />
          </ProtectedRoute>
        } />
        <Route path="/reels" element={
          <ProtectedRoute>
            <ReelsPage />
          </ProtectedRoute>
        } />
        <Route path="/tracker" element={
          <ProtectedRoute>
            <TrackerPage />
          </ProtectedRoute>
        } />
        <Route path="/guidance" element={
          <ProtectedRoute>
            <GuidancePage />
          </ProtectedRoute>
        } />
        <Route path="/achievements" element={
          <ProtectedRoute>
            <AchievementsPage />
          </ProtectedRoute>
        } />
        <Route path="/community" element={
          <ProtectedRoute>
            <CommunityPage />
          </ProtectedRoute>
        } />
        <Route path="/test-backend" element={<TestBackend />} />
        <Route path="/working-login" element={<WorkingLogin />} />
        <Route path="*" element={<Navigate to="/dashboard" replace />} />
      </Routes>
      
      {/* Magnifying Dock Navigation - Always visible when authenticated */}
      {isAuthenticated && <DockWrapper />}
    </div>
  );
};

const App: React.FC = () => {
  return (
    <AuthProvider>
      <Router>
        <AppContent />
      </Router>
    </AuthProvider>
  );
};

export default App;
