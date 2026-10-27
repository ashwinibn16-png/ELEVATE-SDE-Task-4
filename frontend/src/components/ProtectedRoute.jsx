import React from 'react';
import { Navigate, useLocation } from 'react-router-dom';
import { isAdminAuthenticated } from '../services/api';

/**
 * ProtectedRoute Component
 * Restricts access to administrative pages.
 * Redirects unauthenticated users to /admin/login.
 */
export default function ProtectedRoute({ children }) {
  const location = useLocation();
  const isAuthenticated = isAdminAuthenticated();

  if (!isAuthenticated) {
    return <Navigate to="/admin/login" state={{ from: location }} replace />;
  }

  return children;
}
