import { useEffect } from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { useAuthStore } from './store/authStore';
import LoginPage from './pages/auth/LoginPage';
import DashboardLayout from './components/layouts/DashboardLayout';
import AdminDashboard from './pages/dashboard/AdminDashboard';
import GuruDashboard from './pages/dashboard/GuruDashboard';
import SiswaDashboard from './pages/dashboard/SiswaDashboard';
import NotFoundPage from './pages/NotFoundPage';

// Siswa pages
import SiswaListPage from './pages/dashboard/siswa/index';
import SiswaTambahPage from './pages/dashboard/siswa/tambah';
import SiswaEditPage from './pages/dashboard/siswa/[id]';
import SiswaCreateUserPage from './pages/dashboard/siswa/create-user';

// Guru pages
import GuruListPage from './pages/dashboard/guru/index';

// Mata Pelajaran pages
import MataPelajaranListPage from './pages/dashboard/mata-pelajaran/index';

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
        return <Navigate to="/dashboard/guru-dashboard" />;
      case 'siswa':
        return <Navigate to="/dashboard/siswa-dashboard" />;
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
          
          {/* Guru dashboard route */}
          <Route path="guru-dashboard" element={
            <RoleRoute allowedRoles={['guru']}>
              <GuruDashboard />
            </RoleRoute>
          } />
          
          {/* Guru management routes (for admin) */}
          <Route path="guru" element={
            <RoleRoute allowedRoles={['admin']}>
              <GuruListPage />
            </RoleRoute>
          } />
          
          {/* Mata Pelajaran management routes (for admin) */}
          <Route path="mata-pelajaran" element={
            <RoleRoute allowedRoles={['admin']}>
              <MataPelajaranListPage />
            </RoleRoute>
          } />
          
          {/* Siswa dashboard route */}
          <Route path="siswa-dashboard" element={
            <RoleRoute allowedRoles={['siswa']}>
              <SiswaDashboard />
            </RoleRoute>
          } />

          {/* Siswa management routes (for admin) */}
          <Route path="siswa" element={
            <RoleRoute allowedRoles={['admin']}>
              <SiswaListPage />
            </RoleRoute>
          } />
          <Route path="siswa/tambah" element={
            <RoleRoute allowedRoles={['admin']}>
              <SiswaTambahPage />
            </RoleRoute>
          } />
          <Route path="siswa/:id" element={
            <RoleRoute allowedRoles={['admin']}>
              <SiswaEditPage />
            </RoleRoute>
          } />
          <Route path="siswa/:id/create-user" element={
            <RoleRoute allowedRoles={['admin']}>
              <SiswaCreateUserPage />
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