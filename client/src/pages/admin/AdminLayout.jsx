import { useState, useEffect } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import {
  LayoutDashboard,
  Users,
  Car,
  Calendar,
  Package,
  Menu,
  X,
  MessageSquare,
  LogOut,
  Settings,
  CreditCard,
  Home,
  DollarSign,
  AlertCircle,
  Plane,
  Zap,
  ChevronDown,
} from 'lucide-react';
import logoDark from '../../assets/main1.png';

const AdminLayout = ({ children }) => {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [isMobile, setIsMobile] = useState(window.innerWidth < 768);
  const [openMenu, setOpenMenu] = useState(null);

  const location = useLocation();
  const navigate = useNavigate();

  // Responsive
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

  const toggleMenu = (menu) => {
    setOpenMenu((currentMenu) => (currentMenu === menu ? null : menu));
  };

  const isActive = (path) => location.pathname === path;

  const handleLogout = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    window.location.href = '/login';
  };

  // 🔥 GROUPED NAV ITEMS
  const navItems = [
    {
      title: "Bookings",
      items: [
        { path: '/admin/rides', label: 'Ride Bookings', icon: Car },
        { path: '/admin/tours', label: 'Tours Bookings', icon: Calendar },
        { path: '/admin/airport-rides', label: 'Airport Rides', icon: Plane },
        { path: '/admin/charging-bookings', label: 'Charging Enquiries', icon: Zap },
        { path: '/admin/driver-bookings', label: 'Driver Applications', icon: Users },
        { path: '/admin/cab-partners', label: 'Cab Applications', icon: Car },
      ],
    },

    {
      title: "Management",
      items: [
        { path: '/admin/users', label: 'Users', icon: Users },
        { path: '/admin/packages', label: 'Packages', icon: Package },
      ],
    },
    {
      title: "Finance",
      items: [
        { path: '/admin/payments', label: 'Payments', icon: CreditCard },
        { path: '/admin/pending-payments', label: 'Pending Collections', icon: AlertCircle },
        { path: '/admin/pricing', label: 'Pricing', icon: DollarSign },
      ],
    },
    {
      title: "Other",
      items: [
        { path: '/admin/offers', label: 'Offers', icon: AlertCircle },
        { path: '/admin/feedback', label: 'Feedback', icon: MessageSquare },
        { path: '/admin/settings', label: 'Settings', icon: Settings },
      ],
    },
  ];

  return (
    <div className="flex h-screen bg-gray-50 dark:bg-gray-950">

      {/* Overlay */}
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

        {/* NAV */}
        <nav className="flex-1 p-4 space-y-2 overflow-y-auto">

          {/* Dashboard Link - Direct */}
          <Link
            to="/admin"
            onClick={() => isMobile && setSidebarOpen(false)}
            className={`flex items-center px-4 py-3 rounded-lg transition font-medium ${isActive('/admin')
                ? 'bg-blue-600 text-white shadow-lg'
                : 'text-gray-300 hover:bg-gray-700 hover:text-white'
              }`}
          >
            <LayoutDashboard size={18} />
            <span className="ml-3">Dashboard</span>
          </Link>

          {/* Divider */}
          <div className="my-3 px-4">
            <div className="h-px bg-gray-700"></div>
          </div>

          {navItems.map((section, index) => (
            <div key={index} className="mt-4">

              {/* SECTION HEADER */}
              <button
                onClick={() => toggleMenu(section.title)}
                className="w-full flex justify-between items-center px-4 py-2 font-semibold text-gray-400 hover:text-gray-200 hover:bg-gray-700 rounded-lg transition text-sm uppercase tracking-wide"
              >
                {section.title}

                <ChevronDown
                  size={16}
                  className={`transition-transform ${openMenu === section.title ? "rotate-180" : ""
                    }`}
                />
              </button>

              {/* DROPDOWN */}
              <div
                className={`overflow-hidden transition-all duration-300 ${openMenu === section.title ? "max-h-96 mt-1" : "max-h-0"
                  }`}
              >
                {section.items.map((item) => {
                  const Icon = item.icon;

                  return (
                    <Link
                      key={item.path}
                      to={item.path}
                      onClick={() => isMobile && setSidebarOpen(false)}
                      className={`flex items-center ml-2 px-4 py-2 rounded-lg transition text-sm ${isActive(item.path)
                          ? 'bg-blue-600 text-white shadow-lg'
                          : 'text-gray-300 hover:bg-gray-700 hover:text-white'
                        }`}
                    >
                      <Icon size={18} />
                      <span className="ml-3">{item.label}</span>
                    </Link>
                  );
                })}
              </div>
            </div>
          ))}

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
          <span className="text-white font-semibold">Admin Panel</span>
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

export default AdminLayout;
