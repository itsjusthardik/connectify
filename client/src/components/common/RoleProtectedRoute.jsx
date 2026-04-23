import React from 'react';
import { Navigate } from 'react-router-dom';
import { useAuth } from '../../hooks/useAuth';
import Loader from './Loader';

/**
 * RoleProtectedRoute Component
 * Protects routes based on user role
 * If user has wrong role: redirects to their dashboard
 * Otherwise: same protection as ProtectedRoute
 */
export const RoleProtectedRoute = ({ children, allowedRoles = [] }) => {
  const { user, isAuthenticated, loading } = useAuth();

  if (loading) {
    return <Loader />;
  }

  if (!isAuthenticated) {
    return <Navigate to="/" replace />;
  }

  if (allowedRoles.length > 0 && !allowedRoles.includes(user?.role)) {
    // Redirect to their dashboard
    const dashboardMap = {
      'Content Creator': '/dashboard/creator',
      'Video Editor': '/dashboard/editor',
      'Graphic Designer': '/dashboard/designer',
      'Consumer': '/dashboard/consumer',
    };
    return <Navigate to={dashboardMap[user?.role] || '/dashboard'} replace />;
  }

  return children;
};

export default RoleProtectedRoute;
