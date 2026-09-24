import React from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import ProtectedRoute from './ProtectedRoute';
import Layout from '../components/layout/Layout';

// Auth Pages
import Login from '../pages/auth/Login';
import Register from '../pages/auth/Register';

// Admin Pages
import AdminDashboard from '../pages/admin/AdminDashboard';
import HospitalsPage from '../pages/admin/HospitalsPage';
import BinsManagementPage from '../pages/admin/BinsManagementPage';
import WasteCategoriesPage from '../pages/admin/WasteCategoriesPage';
import AllWasteRecordsPage from '../pages/admin/AllWasteRecordsPage';
import CollectionRequestsPage from '../pages/admin/CollectionRequestsPage';
import UsersPage from '../pages/admin/UsersPage';
import ReportsAnalyticsPage from '../pages/admin/ReportsAnalyticsPage';

// Hospital Staff Pages
import HospitalDashboard from '../pages/hospital/HospitalDashboard';
import HospitalWastePage from '../pages/hospital/HospitalWastePage';
import HospitalBinsPage from '../pages/hospital/HospitalBinsPage';
import HospitalRequestsPage from '../pages/hospital/HospitalRequestsPage';

// Collector Pages
import CollectorDashboard from '../pages/collector/CollectorDashboard';
import CollectorAssignmentsPage from '../pages/collector/CollectorAssignmentsPage';
import CollectorHistoryPage from '../pages/collector/CollectorHistoryPage';

// Integration Pages (Future Work Modules)
import AIClassifierPage from '../pages/integrations/AIClassifierPage';
import IoTBinsTelemetryPage from '../pages/integrations/IoTBinsTelemetryPage';
import GPSFleetPage from '../pages/integrations/GPSFleetPage';
import RobotDispatchPage from '../pages/integrations/RobotDispatchPage';

// Common Pages
import WasteDetailPage from '../pages/common/WasteDetailPage';
import CollectionDetailPage from '../pages/common/CollectionDetailPage';
import TraceabilitySearchPage from '../pages/common/TraceabilitySearchPage';
import ProfilePage from '../pages/common/ProfilePage';
import NotFoundPage from '../pages/common/NotFoundPage';

// Smart Root Redirect based on user role
const RootRedirect = () => {
  const { user, isAuthenticated } = useAuth();
  if (!isAuthenticated) return <Navigate to="/login" replace />;

  switch (user?.role) {
    case 'admin':
      return <Navigate to="/admin/dashboard" replace />;
    case 'collector':
      return <Navigate to="/collector/dashboard" replace />;
    case 'hospital_staff':
    default:
      return <Navigate to="/hospital/dashboard" replace />;
  }
};

const AppRoutes = () => {
  return (
    <Routes>
      {/* Public Routes */}
      <Route path="/login" element={<Login />} />
      <Route path="/register" element={<Register />} />

      {/* Protected Routes Layout */}
      <Route element={<ProtectedRoute />}>
        <Route element={<Layout />}>
          {/* Smart Root Index */}
          <Route path="/" element={<RootRedirect />} />

          {/* Admin Routes */}
          <Route element={<ProtectedRoute allowedRoles={['admin']} />}>
            <Route path="/admin/dashboard" element={<AdminDashboard />} />
            <Route path="/admin/hospitals" element={<HospitalsPage />} />
            <Route path="/admin/bins" element={<BinsManagementPage />} />
            <Route path="/admin/categories" element={<WasteCategoriesPage />} />
            <Route path="/admin/waste" element={<AllWasteRecordsPage />} />
            <Route path="/admin/collections" element={<CollectionRequestsPage />} />
            <Route path="/admin/users" element={<UsersPage />} />
            <Route path="/admin/reports" element={<ReportsAnalyticsPage />} />
          </Route>

          {/* Hospital Staff Routes */}
          <Route element={<ProtectedRoute allowedRoles={['hospital_staff', 'admin']} />}>
            <Route path="/hospital/dashboard" element={<HospitalDashboard />} />
            <Route path="/hospital/waste" element={<HospitalWastePage />} />
            <Route path="/hospital/bins" element={<HospitalBinsPage />} />
            <Route path="/hospital/requests" element={<HospitalRequestsPage />} />
          </Route>

          {/* Collector Routes */}
          <Route element={<ProtectedRoute allowedRoles={['collector', 'admin']} />}>
            <Route path="/collector/dashboard" element={<CollectorDashboard />} />
            <Route path="/collector/assigned" element={<CollectorAssignmentsPage />} />
            <Route path="/collector/history" element={<CollectorHistoryPage />} />
          </Route>

          {/* Shared Common Detail Pages */}
          <Route path="/waste/:id" element={<WasteDetailPage />} />
          <Route path="/collections/:id" element={<CollectionDetailPage />} />
          <Route path="/traceability" element={<TraceabilitySearchPage />} />
          <Route path="/profile" element={<ProfilePage />} />

          {/* Future Work / Advanced Hardware & AI Integrations */}
          <Route path="/integrations/ai-classifier" element={<AIClassifierPage />} />
          <Route path="/integrations/iot-telemetry" element={<IoTBinsTelemetryPage />} />
          <Route path="/integrations/gps-fleet" element={<GPSFleetPage />} />
          <Route path="/integrations/robot-dispatch" element={<RobotDispatchPage />} />
        </Route>
      </Route>

      {/* Fallback 404 Route */}
      <Route path="*" element={<NotFoundPage />} />
    </Routes>
  );
};

export default AppRoutes;
