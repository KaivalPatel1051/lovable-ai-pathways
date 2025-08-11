import React, { useState } from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate, useNavigate, useLocation } from 'react-router-dom';
import { MessageCircle, Video, BarChart3, BookOpen, Trophy, Users } from 'lucide-react';
import { SupabaseAuthProvider, useSupabaseAuth } from '@/contexts/SupabaseAuthContext';
import SupabaseLoginPage from '@/pages/SupabaseLoginPage';
import DashboardPage from '@/components/DashboardPage';
import SupabaseChatPage from '@/pages/SupabaseChatPage';
import EnhancedReelsPage from '@/pages/EnhancedReelsPage';
import AchievementsPage from '@/pages/AchievementsPage';
import TrackerPage from '@/pages/TrackerPage';
import GuidancePage from '@/pages/GuidancePage';
import CommunityPage from '@/pages/CommunityPage';
import SupabaseAdminDashboard from '@/components/SupabaseAdminDashboard';
import AddictionIntakeForm from '@/components/AddictionIntakeForm';
import SupabaseTest from '@/components/SupabaseTest';
import SimpleLogin from '@/components/SimpleLogin';
import SimpleChat from '@/components/SimpleChat';
import SupabaseReelsPage from '@/pages/SupabaseReelsPage';
import InstagramReelsPage from '@/pages/InstagramReelsPage';
import InstagramChatPage from '@/pages/InstagramChatPage';
import NischayLoader from '@/components/NischayLoader';
import Dock, { DockItemData } from '@/components/Dock';
import Particles from '@/components/Particles';
import FloatingAIButton from '@/components/FloatingAIButton';
import './App.css';

// Protected Route Component
const ProtectedRoute: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const { user, loading } = useSupabaseAuth();
  
  if (loading) {
    return (
      <div className="flex items-center justify-center h-screen bg-background">
        <NischayLoader size="lg" />
      </div>
    );
  }
  
  return user ? <>{children}</> : <Navigate to="/login" replace />;
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
  const { user, loading } = useSupabaseAuth();

  // Show login page if not authenticated
  if (!loading && !user) {
    return <SupabaseLoginPage />;
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
        <Route path="/admin" element={
          <ProtectedRoute>
            <SupabaseAdminDashboard />
          </ProtectedRoute>
        } />
        <Route path="/test-supabase" element={<SupabaseTest />} />
        <Route path="/simple-login" element={<SimpleLogin />} />
        <Route path="/intake" element={
          <ProtectedRoute>
            <AddictionIntakeForm onSubmit={() => {}} onClose={() => {}} />
          </ProtectedRoute>
        } />
        <Route path="/chat" element={
          <ProtectedRoute>
            <InstagramChatPage />
          </ProtectedRoute>
        } />
        <Route path="/reels" element={
          <ProtectedRoute>
            <InstagramReelsPage />
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
        <Route path="/admin" element={
          <ProtectedRoute>
            <SupabaseAdminDashboard />
          </ProtectedRoute>
        } />
        <Route path="/addiction-intake" element={
          <ProtectedRoute>
            <AddictionIntakeForm onSubmit={() => {}} onClose={() => {}} />
          </ProtectedRoute>
        } />
        <Route path="*" element={<Navigate to="/dashboard" replace />} />
      </Routes>
      
      {/* Magnifying Dock Navigation - Always visible when authenticated */}
      {user && <DockWrapper />}
      
      {/* AI Chatbox - Only show for authenticated users */}
      {user && <FloatingAIButton />}
    </div>
  );
};

const App: React.FC = () => {
  return (
    <SupabaseAuthProvider>
      <Router>
        <AppContent />
      </Router>
    </SupabaseAuthProvider>
  );
};

export default App;
