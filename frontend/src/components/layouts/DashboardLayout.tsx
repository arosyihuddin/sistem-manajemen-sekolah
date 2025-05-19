import { useState } from 'react';
import { Outlet, Link, useNavigate, useLocation } from 'react-router-dom';
import { useAuthStore } from '@/store/authStore';
import { 
  Home, 
  User, 
  Users, 
  BookOpen, 
  Calendar, 
  FileText, 
  DollarSign, 
  Package, 
  LogOut, 
  Menu, 
  X, 
  ChevronDown
} from 'lucide-react';
import { toast } from 'sonner';

const DashboardLayout = () => {
  const { user, logout } = useAuthStore();
  const navigate = useNavigate();
  const location = useLocation();
  const [isSidebarOpen, setIsSidebarOpen] = useState(true);
  const [activeSubmenu, setActiveSubmenu] = useState<string | null>(null);

  // Function to handle logout
  const handleLogout = async () => {
    try {
      await logout();
      navigate('/login');
      toast.success('Logout berhasil');
    } catch (error) {
      toast.error('Logout gagal');
    }
  };

  // Toggle sidebar for mobile view
  const toggleSidebar = () => {
    setIsSidebarOpen(!isSidebarOpen);
  };

  // Toggle submenu
  const toggleSubmenu = (menu: string) => {
    if (activeSubmenu === menu) {
      setActiveSubmenu(null);
    } else {
      setActiveSubmenu(menu);
    }
  };

  // Check if route is active
  const isActive = (path: string) => {
    return location.pathname === path;
  };

  // Navigation menus based on user role
  const getNavigationMenus = () => {
    const commonMenus = [
      { path: '/dashboard', icon: <Home size={20} />, label: 'Dashboard' },
    ];

    const adminMenus = [
      { path: '/dashboard/siswa', icon: <User size={20} />, label: 'Manajemen Siswa' },
      { path: '/dashboard/guru', icon: <Users size={20} />, label: 'Manajemen Guru & Staff' },
      { path: '/dashboard/kelas', icon: <BookOpen size={20} />, label: 'Manajemen Kelas' },
      { path: '/dashboard/jadwal', icon: <Calendar size={20} />, label: 'Jadwal Pelajaran' },
      { path: '/dashboard/absensi', icon: <FileText size={20} />, label: 'Absensi' },
      { path: '/dashboard/nilai', icon: <FileText size={20} />, label: 'Penilaian & Rapor' },
      { path: '/dashboard/keuangan', icon: <DollarSign size={20} />, label: 'Keuangan Sekolah' },
      { path: '/dashboard/inventaris', icon: <Package size={20} />, label: 'Inventaris Sekolah' },
    ];

    const guruMenus = [
      { path: '/dashboard/jadwal-mengajar', icon: <Calendar size={20} />, label: 'Jadwal Mengajar' },
      { path: '/dashboard/input-nilai', icon: <FileText size={20} />, label: 'Input Nilai' },
      { path: '/dashboard/absensi-siswa', icon: <FileText size={20} />, label: 'Absensi Siswa' },
    ];

    const siswaMenus = [
      { path: '/dashboard/jadwal-pelajaran', icon: <Calendar size={20} />, label: 'Jadwal Pelajaran' },
      { path: '/dashboard/nilai-rapor', icon: <FileText size={20} />, label: 'Nilai & Rapor' },
      { path: '/dashboard/pembayaran', icon: <DollarSign size={20} />, label: 'Pembayaran' },
    ];

    if (user?.role === 'admin') {
      return [...commonMenus, ...adminMenus];
    } else if (user?.role === 'guru') {
      return [...commonMenus, ...guruMenus];
    } else if (user?.role === 'siswa') {
      return [...commonMenus, ...siswaMenus];
    }

    return commonMenus;
  };

  const navigationMenus = getNavigationMenus();

  return (
    <div className="flex h-screen bg-gray-100">
      {/* Mobile Sidebar Toggle */}
      <div className="lg:hidden fixed top-4 left-4 z-50">
        <button
          onClick={toggleSidebar}
          className="p-2 rounded-md bg-white shadow-md"
        >
          {isSidebarOpen ? <X size={20} /> : <Menu size={20} />}
        </button>
      </div>

      {/* Sidebar */}
      <aside
        className={`w-64 bg-white border-r shadow-sm transition-all duration-300 ${
          isSidebarOpen ? 'translate-x-0' : '-translate-x-full'
        } lg:translate-x-0 fixed inset-y-0 z-40 lg:static`}
      >
        <div className="h-full flex flex-col">
          {/* Sidebar Header */}
          <div className="px-4 py-6 border-b">
            <h2 className="text-xl font-bold text-gray-800">Manajemen Sekolah</h2>
            <p className="text-sm text-gray-600 mt-1">
              {user?.role === 'admin' ? 'Administrator' : user?.role === 'guru' ? 'Guru' : 'Siswa'}
            </p>
          </div>

          {/* Sidebar Navigation */}
          <nav className="flex-1 overflow-y-auto py-4 px-2">
            <ul className="space-y-1">
              {navigationMenus.map((menu) => (
                <li key={menu.path}>
                  <Link
                    to={menu.path}
                    className={`flex items-center px-4 py-2 rounded-md transition-colors ${
                      isActive(menu.path)
                        ? 'bg-primary text-primary-foreground'
                        : 'text-gray-700 hover:bg-gray-100'
                    }`}
                  >
                    {menu.icon}
                    <span className="ml-3">{menu.label}</span>
                  </Link>
                </li>
              ))}
            </ul>
          </nav>

          {/* Sidebar Footer */}
          <div className="p-4 border-t">
            <button
              onClick={handleLogout}
              className="flex items-center text-red-500 hover:text-red-700 transition-colors"
            >
              <LogOut size={20} />
              <span className="ml-3">Logout</span>
            </button>
          </div>
        </div>
      </aside>

      {/* Main Content Area */}
      <div className="flex-1 flex flex-col overflow-hidden">
        {/* Topbar */}
        <header className="bg-white border-b shadow-sm h-16 flex items-center px-6">
          <div className="flex-1">
            <h1 className="text-xl font-semibold text-gray-800">
              {location.pathname === '/dashboard' ? 'Dashboard' : navigationMenus.find(menu => menu.path === location.pathname)?.label || 'Dashboard'}
            </h1>
          </div>
          <div className="flex items-center space-x-4">
            <div className="text-right">
              <p className="text-sm font-medium text-gray-900">{user?.username}</p>
              <p className="text-xs text-gray-500">{user?.email}</p>
            </div>
            <div className="h-8 w-8 rounded-full bg-gray-300 flex items-center justify-center">
              <User size={16} />
            </div>
          </div>
        </header>

        {/* Page Content */}
        <main className="flex-1 overflow-y-auto p-6">
          <Outlet />
        </main>
      </div>
    </div>
  );
};

export default DashboardLayout;