import { useState, useEffect } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext.jsx';
import {
  Car,
  Plane,
  User,
  Menu,
  X,
  LogOut,
  Home,
  CheckCircle,
} from 'lucide-react';
import logoDark from '../../assets/main1.png';

const UserLayout = ({ children }) => {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [isMobile, setIsMobile] = useState(window.innerWidth < 768);
  const location = useLocation();
  const navigate = useNavigate();
  const { logout, user } = useAuth();

  const navItems = [
    { path: '/user/rides', label: 'Rides', icon: Car },
    { path: '/user/tours', label: 'Tours', icon: Plane },
    { path: '/user/bookings', label: 'Bookings', icon: CheckCircle },
    { path: '/user/profile', label: 'Profile', icon: User },
  ];

  const isActive = (path) => location.pathname === path;

  const handleLogout = async () => {
    await logout();
    navigate('/');
  };

  useEffect(() => {
    const handleResize = () => {
      const mobile = window.innerWidth < 768;
      setIsMobile(mobile);
      if (mobile) setSidebarOpen(false);
    };

    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  useEffect(() => {
    if (!isMobile || !sidebarOpen) return undefined;

    const frameId = window.requestAnimationFrame(() => {
      setSidebarOpen(false);
    });

    return () => window.cancelAnimationFrame(frameId);
  }, [location.pathname, isMobile, sidebarOpen]);

  return (
    <div className="flex h-screen bg-gray-50 dark:bg-gray-950">
      {/* Overlay for mobile */}
      {isMobile && sidebarOpen && (
        <div
          className="fixed inset-0 bg-black bg-opacity-60 z-40 md:hidden"
          onClick={() => setSidebarOpen(false)}
        />
      )}

      {/* SIDEBAR */}
      <aside
        className={`${sidebarOpen ? 'w-64' : 'w-0'
          } bg-gradient-to-b from-gray-900 via-gray-800 to-gray-900 dark:from-gray-950 dark:via-gray-900 dark:to-gray-950 shadow-2xl transition-all duration-300 flex flex-col overflow-hidden md:w-64 md:z-0 z-50`}
      >
        {/* Logo */}
        <button
          onClick={() => navigate('/')}
          className="p-6 border-b border-gray-700 flex justify-center hover:bg-gray-800 transition"
        >
          <div className="flex flex-col items-center">
            <img
              src={logoDark}
              alt="GoElectriQ"
              className="h-12 w-auto object-contain mb-2"
            />
          </div>
        </button>

        {/* User Profile Section */}
        <div className="p-4 border-b border-gray-700 bg-gray-800">
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 bg-gradient-to-br from-blue-500 to-emerald-500 rounded-full flex items-center justify-center text-white font-bold text-lg flex-shrink-0 shadow-lg">
              {user?.firstName?.charAt(0) || user?.email?.charAt(0) || 'U'}
            </div>
            <div className="flex-1 min-w-0">
              <p className="font-semibold text-white text-sm truncate">
                {user?.firstName && user?.lastName ? `${user.firstName} ${user.lastName}` : user?.firstName || user?.email || 'User'}
              </p>
              <p className="text-xs text-gray-400 truncate">
                {user?.email || 'user@example.com'}
              </p>
            </div>
          </div>
        </div>

        {/* NAV */}
        <nav className="flex-1 p-4 space-y-3 overflow-y-auto flex flex-col">

          {/* Home Link */}
          <Link
            to="/"
            onClick={() => isMobile && setSidebarOpen(false)}
            className={`flex items-center px-4 py-3 rounded-lg transition font-medium w-full ${isActive('/')
                ? 'bg-blue-600 text-white shadow-lg'
                : 'text-gray-300 hover:bg-gray-700 hover:text-white'
              }`}
          >
            <Home size={18} className="flex-shrink-0" />
            <span className="ml-3 truncate">Home</span>
          </Link>

          {/* Divider */}
          <div className="my-2 px-4">
            <div className="h-px bg-gray-700"></div>
          </div>

          {/* Navigation Items */}
          {navItems.map((item) => {
            const Icon = item.icon;
            return (
              <Link
                key={item.path}
                to={item.path}
                onClick={() => isMobile && setSidebarOpen(false)}
                className={`flex items-center px-4 py-3 rounded-lg transition font-medium w-full whitespace-nowrap ${isActive(item.path)
                    ? 'bg-blue-600 text-white shadow-lg'
                    : 'text-gray-300 hover:bg-gray-700 hover:text-white'
                  }`}
              >
                <Icon size={18} className="flex-shrink-0" />
                <span className="ml-3 truncate">{item.label}</span>
              </Link>
            );
          })}
        </nav>

        {/* BOTTOM */}
        <div className="p-4 border-t border-gray-700 space-y-2">
          <button
            onClick={() => navigate('/')}
            className="w-full flex items-center justify-center px-4 py-3 bg-gradient-to-r from-green-600 to-green-700 hover:from-green-700 hover:to-green-800 text-white rounded-lg transition font-medium shadow-lg"
          >
            <Home size={18} />
            <span className="ml-2">Home</span>
          </button>

          <button
            onClick={handleLogout}
            className="w-full flex items-center justify-center px-4 py-3 bg-gradient-to-r from-red-600 to-red-700 hover:from-red-700 hover:to-red-800 text-white rounded-lg transition font-medium shadow-lg"
          >
            <LogOut size={18} />
            <span className="ml-2">Logout</span>
          </button>
        </div>
      </aside>

      {/* RIGHT SIDE */}
      <div className="flex flex-col flex-1 overflow-hidden bg-gray-50 dark:bg-gray-900">

        {/* MOBILE HEADER */}
        <div className="md:hidden bg-gradient-to-r from-gray-800 to-gray-900 dark:from-gray-950 dark:to-gray-900 border-b border-gray-700 flex justify-between p-4 shadow-lg">
          <button onClick={() => setSidebarOpen(!sidebarOpen)} className="text-white">
            {sidebarOpen ? <X size={24} /> : <Menu size={24} />}
          </button>
          <span className="text-white font-semibold">User Panel</span>
          <div className="w-6"></div>
        </div>

        {/* CONTENT */}
        <main className="flex-1 overflow-auto p-4 md:p-8">
          {children}
        </main>
      </div>
    </div>
  );
};

export default UserLayout;
