import React from 'react';
import { Navigate, Outlet } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { LoadingSpinner } from '../components/common/LoadingSpinner';

const ProtectedRoute = ({ allowedRoles = [] }) => {
  const { user, isAuthenticated, loading } = useAuth();

  if (loading) {
    return (
      <div className="min-h-screen bg-navy-900 flex items-center justify-center">
        <LoadingSpinner size="lg" text="Authenticating MediTrackX session..." />
      </div>
    );
  }

  if (!isAuthenticated) {
    return <Navigate to="/login" replace />;
  }

  if (allowedRoles.length > 0 && !allowedRoles.includes(user?.role)) {
    // Redirect user to their own role dashboard
    const roleRedirects = {
      admin: '/admin/dashboard',
      hospital_staff: '/hospital/dashboard',
      collector: '/collector/dashboard',
    };
    return <Navigate to={roleRedirects[user?.role] || '/login'} replace />;
  }

  return <Outlet />;
};

export default ProtectedRoute;
