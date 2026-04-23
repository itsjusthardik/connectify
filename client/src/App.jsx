import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom'
import { Toaster } from 'react-hot-toast'
import { AuthProvider, useAuth } from './context/AuthContext'
import { ThemeProvider } from './context/ThemeContext'
import { SocketProvider } from './context/SocketContext'
import Loader from './components/common/Loader'
import { AuthModal } from './components/auth/AuthModal'

import Landing from './pages/Landing'
import CreatorDashboard from './pages/dashboard/CreatorDashboard'
import EditorDashboard from './pages/dashboard/EditorDashboard'
import DesignerDashboard from './pages/dashboard/DesignerDashboard'
import ConsumerDashboard from './pages/dashboard/ConsumerDashboard'
import GenericDashboard from './pages/dashboard/GenericDashboard'
import BrowseUsers from './pages/browse/BrowseUsers'
import MyProfile from './pages/profile/MyProfile'
import ViewProfile from './pages/profile/ViewProfile'
import RequestsPage from './pages/requests/RequestsPage'
import ChatPage from './pages/chat/ChatPage'
import AdminLogin from './pages/admin/AdminLogin'
import AdminRegister from './pages/admin/AdminRegister'
import AdminDashboard from './pages/admin/AdminDashboard'
import DemandsPage from './pages/demands/DemandsPage'
import MyDemandsPage from './pages/demands/MyDemandsPage'

const dashboardMap = {
  'Content Creator': '/dashboard/creator',
  'Video Editor': '/dashboard/editor',
  'Graphic Designer': '/dashboard/designer',
  'Consumer': '/dashboard/consumer',
  'Other': '/dashboard/other'
}

const Protected = ({ children }) => {
  const { user, loading, openModal } = useAuth()
  if (loading) return <Loader />
  if (!user) {
    setTimeout(() => openModal('login'), 10)
    return <Navigate to="/" replace />
  }
  return children
}

const DashboardRedirect = () => {
  const { user, loading } = useAuth()
  if (loading) return <Loader />
  if (!user) return <Navigate to="/" replace />
  return <Navigate to={dashboardMap[user.role] || '/dashboard/creator'} replace />
}

const AuthRouteRedirect = ({ mode }) => {
  const { openModal, user, loading } = useAuth();
  const React = import('react');
  
  if (!loading && user) return <Navigate to="/dashboard" replace />;
  if (!loading && !user) {
    // Small timeout to ensure context is ready and prevents render warnings
    setTimeout(() => openModal(mode), 10);
  }
  return <Navigate to="/" replace />;
}

function AppRoutes() {
  return (
    <Routes>
      <Route path="/" element={<Landing />} />
      <Route path="/login" element={<AuthRouteRedirect mode="login" />} />
      <Route path="/register" element={<AuthRouteRedirect mode="register" />} />
      <Route path="/admin/login" element={<AdminLogin />} />
      <Route path="/admin/register" element={<AdminRegister />} />
      <Route path="/dashboard" element={<DashboardRedirect />} />
      <Route path="/dashboard/creator" element={<Protected><CreatorDashboard /></Protected>} />
      <Route path="/dashboard/editor" element={<Protected><EditorDashboard /></Protected>} />
      <Route path="/dashboard/designer" element={<Protected><DesignerDashboard /></Protected>} />
      <Route path="/dashboard/consumer" element={<Protected><ConsumerDashboard /></Protected>} />
      <Route path="/dashboard/other" element={<Protected><GenericDashboard /></Protected>} />
      <Route path="/browse" element={<Protected><BrowseUsers /></Protected>} />
      <Route path="/profile/me" element={<Protected><MyProfile /></Protected>} />
      <Route path="/profile/:id" element={<Protected><ViewProfile /></Protected>} />
      <Route path="/requests" element={<Protected><RequestsPage /></Protected>} />
      <Route path="/chat" element={<Protected><ChatPage /></Protected>} />
      <Route path="/demands" element={<Protected><DemandsPage /></Protected>} />
      <Route path="/demands/mine" element={<Protected><MyDemandsPage /></Protected>} />
      <Route path="/admin/dashboard" element={<AdminDashboard />} />
      <Route path="*" element={
        <div style={{color:'white',textAlign:'center',marginTop:'20vh'}}>
          <h1>404</h1>
          <p>Page not found</p>
          <a href="/" style={{color:'#6366F1'}}>Go home</a>
        </div>
      } />
    </Routes>
  )
}

export default function App() {
  return (
    <BrowserRouter>
      <ThemeProvider>
        <AuthProvider>
          <SocketProvider>
            <AuthModal />
            <AppRoutes />
            <Toaster
              position="top-right"
              toastOptions={{
                style: {
                  background: 'var(--card-bg)',
                  color: 'var(--text)',
                  border: '1px solid var(--border)',
                  borderRadius: '12px',
                  fontSize: '14px'
                }
              }}
            />
          </SocketProvider>
        </AuthProvider>
      </ThemeProvider>
    </BrowserRouter>
  )
}
