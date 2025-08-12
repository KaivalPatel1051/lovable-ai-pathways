import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { Toaster } from 'sonner';
import { SupabaseAuthProvider } from '@/contexts/SupabaseAuthContext';

// Route Guard Components
import ProtectedRoute from '@/ProtectedRoute';
import PublicRoute from '@/PublicRoute';

// Layout Component
import MainAppLayout from '@/components/MainAppLayout';

// Page Components
import LoaderPage from '@/pages/LoaderPage';
import SupabaseLoginPage from '@/pages/SupabaseLoginPage';
import SignUp from '@/SignUP';
import DashboardPage from '@/components/DashboardPage';
import GuidancePage from '@/pages/GuidancePage';
import TrackerPage from '@/pages/TrackerPage';
import CommunityPage from '@/pages/CommunityPage';
import AchievementsPage from '@/pages/AchievementsPage';
import InstagramChatPage from '@/pages/InstagramChatPage';
import InstagramReelsPage from '@/pages/InstagramReelsPage';

const App: React.FC = () => {
  return (
    <SupabaseAuthProvider>
      <Router>
        <Toaster richColors closeButton />
        <Routes>
          {/* Public routes that redirect if logged in */}
          <Route path="/login" element={<PublicRoute><SupabaseLoginPage /></PublicRoute>} />
          <Route path="/signup" element={<PublicRoute><SignUp /></PublicRoute>} />
          <Route path="/loader" element={<PublicRoute><LoaderPage onComplete={() => {}} /></PublicRoute>} />

          {/* Protected routes that require login */}
          <Route
            path="/*"
            element={
              <ProtectedRoute>
                <MainAppLayout>
                  <Routes>
                    <Route path="/dashboard" element={<DashboardPage />} />
                    <Route path="/guidance" element={<GuidancePage />} />
                    <Route path="/tracker" element={<TrackerPage />} />
                    <Route path="/community" element={<CommunityPage />} />
                    <Route path="/achievements" element={<AchievementsPage />} />
                    <Route path="/chat" element={<InstagramChatPage />} />
                    <Route path="/reels" element={<InstagramReelsPage />} />
                    <Route path="*" element={<Navigate to="/dashboard" replace />} />
                  </Routes>
                </MainAppLayout>
              </ProtectedRoute>
            }
          />
          
          {/* Redirect root to loader */}
          <Route path="/" element={<Navigate to="/loader" replace />} />
        </Routes>
      </Router>
    </SupabaseAuthProvider>
  );
};

export default App;