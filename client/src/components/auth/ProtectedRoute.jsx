import React from 'react';
import { Navigate, useLocation } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';

// Spinner
const Spinner = () => (
  <div className="min-h-screen flex items-center justify-center bg-cream">
    <div className="w-10 h-10 border-4 border-tea-200 border-t-tea-600 rounded-full animate-spin" />
  </div>
);

// Require login
export const PrivateRoute = ({ children }) => {
  const { user, loading } = useAuth();
  const location = useLocation();
  if (loading) return <Spinner />;
  if (!user) return <Navigate to="/login" state={{ from: location }} replace />;
  return children;
};

// Require admin or superadmin
export const AdminRoute = ({ children }) => {
  const { user, loading, isAdmin } = useAuth();
  const location = useLocation();
  if (loading) return <Spinner />;
  if (!user) return <Navigate to="/login" state={{ from: location }} replace />;
  if (!isAdmin) return <Navigate to="/" replace />;
  return children;
};

// Require superadmin
export const SuperAdminRoute = ({ children }) => {
  const { user, loading, isSuperAdmin } = useAuth();
  const location = useLocation();
  if (loading) return <Spinner />;
  if (!user) return <Navigate to="/login" state={{ from: location }} replace />;
  if (!isSuperAdmin) return <Navigate to="/admin" replace />;
  return children;
};
