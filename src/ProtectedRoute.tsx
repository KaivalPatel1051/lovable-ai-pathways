import React from 'react';
import { Navigate } from 'react-router-dom';
import { useSupabaseAuth } from './contexts/SupabaseAuthContext';

interface ProtectedRouteProps {
  children: React.ReactElement;
}

const ProtectedRoute: React.FC<ProtectedRouteProps> = ({ children }) => {
  const { session, loading } = useSupabaseAuth();

  if (loading) {
    // You can return a loading spinner here if you want
    return <div>Loading...</div>;
  }

  if (!session) {
    return <Navigate to="/login" replace />;
  }

  return children;
};

export default ProtectedRoute;
