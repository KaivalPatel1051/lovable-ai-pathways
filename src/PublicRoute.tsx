import React from 'react';
import { Navigate } from 'react-router-dom';
import { useSupabaseAuth } from './contexts/SupabaseAuthContext';

interface PublicRouteProps {
  children: React.ReactElement;
}

const PublicRoute: React.FC<PublicRouteProps> = ({ children }) => {
  const { session, loading } = useSupabaseAuth();

  if (loading) {
    return <div>Loading...</div>; // Or a loading spinner
  }

  if (session) {
    return <Navigate to="/dashboard" replace />;
  }

  return children;
};

export default PublicRoute;