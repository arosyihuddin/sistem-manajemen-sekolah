import { useEffect } from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { useAuthStore } from './store/authStore';
import LoginPage from './pages/auth/LoginPage';
import DashboardLayout from './components/layouts/DashboardLayout';
import AdminDashboard from './pages/dashboard/AdminDashboard';
import GuruDashboard from './pages/dashboard/GuruDashboard';
import SiswaDashboard from './pages/dashboard/SiswaDashboard';
import NotFoundPage from './pages/NotFoundPage';

// Protección de rutas
const ProtectedRoute = ({ children }: { children: React.ReactNode }) => {
  const { isAuthenticated, isLoading } = useAuthStore();

  if (isLoading) {
    return <div className="flex h-screen items-center justify-center">Loading...</div>;
  }

  if (!isAuthenticated) {
    return <Navigate to="/login" replace />;
  }

  return <>{children}</>;
};

// Redirección por rol
const RoleRoute = ({ 
  children, 
  allowedRoles 
}: { 
  children: React.ReactNode; 
  allowedRoles: string[] 
}) => {
  const { user, isLoading } = useAuthStore();

  if (isLoading) {
    return <div className="flex h-screen items-center justify-center">Loading...</div>;
  }

  if (!user || !allowedRoles.includes(user.role)) {
    return <Navigate to="/dashboard" replace />;
  }

  return <>{children}</>;
};

function App() {
  const { checkAuth, isAuthenticated, user } = useAuthStore();

  useEffect(() => {
    checkAuth();
  }, [checkAuth]);

  // Determine dashboard based on user role
  const getDashboardRoute = () => {
    if (!isAuthenticated || !user) return <Navigate to="/login" />;

    switch (user.role) {
      case 'admin':
        return <Navigate to="/dashboard/admin" />;
      case 'guru':
        return <Navigate to="/dashboard/guru" />;
      case 'siswa':
        return <Navigate to="/dashboard/siswa" />;
      default:
        return <Navigate to="/login" />;
    }
  };

  return (
    <BrowserRouter>
      <Routes>
        {/* Public routes */}
        <Route path="/login" element={
          isAuthenticated ? <Navigate to="/dashboard" /> : <LoginPage />
        } />

        {/* Dashboard routes */}
        <Route path="/dashboard" element={
          <ProtectedRoute>
            <DashboardLayout />
          </ProtectedRoute>
        }>
          <Route index element={getDashboardRoute()} />
          
          <Route path="admin" element={
            <RoleRoute allowedRoles={['admin']}>
              <AdminDashboard />
            </RoleRoute>
          } />
          
          <Route path="guru" element={
            <RoleRoute allowedRoles={['guru']}>
              <GuruDashboard />
            </RoleRoute>
          } />
          
          <Route path="siswa" element={
            <RoleRoute allowedRoles={['siswa']}>
              <SiswaDashboard />
            </RoleRoute>
          } />
        </Route>

        {/* Redirect / to /dashboard if authenticated, otherwise to /login */}
        <Route path="/" element={
          isAuthenticated ? <Navigate to="/dashboard" /> : <Navigate to="/login" />
        } />

        {/* 404 page */}
        <Route path="*" element={<NotFoundPage />} />
      </Routes>
    </BrowserRouter>
  );
}

export default App;