import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { AdminRegister } from './pages/AdminRegister';
import { AdminLogin } from './pages/AdminLogin';
import { AdminDashboard } from './pages/AdminDashboard';
import { useAuth } from './context/AuthContext';
import './index.css';

/**
 * ProtectedRoute Component
 * Checks if admin has valid JWT token before allowing access to protected pages
 * If no token, redirects to login page
 */
const ProtectedRoute = ({ children }) => {
  const { token } = useAuth();
  return token ? children : <Navigate to="/admin/login" replace />;
};

/**
 * Main App Component
 * Sets up routing for the admin panel:
 * - /admin/register - Public, registration page
 * - /admin/login - Public, login page
 * - /admin/dashboard - Protected, admin dashboard
 * - / - Redirects to login
 */
function App() {
  return (
    <Router>
      <Routes>
        {/* Public routes */}
        <Route path="/admin/register" element={<AdminRegister />} />
        <Route path="/admin/login" element={<AdminLogin />} />

        {/* Protected routes */}
        <Route
          path="/admin/dashboard"
          element={
            <ProtectedRoute>
              <AdminDashboard />
            </ProtectedRoute>
          }
        />

        {/* Fallback - redirect to login */}
        <Route path="/" element={<Navigate to="/admin/login" replace />} />
      </Routes>
    </Router>
  );
}

export default App;
