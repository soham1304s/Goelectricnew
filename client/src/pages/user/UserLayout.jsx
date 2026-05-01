import { useState, useEffect } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext.jsx';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Car,
  Plane,
  User,
  Menu,
  X,
  LogOut,
  Home,
  CheckCircle,
  Bell,
  Search,
  Settings,
  ChevronRight
} from 'lucide-react';
import logoDark from '../../assets/main1.png';

const UserLayout = ({ children }) => {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [isMobile, setIsMobile] = useState(window.innerWidth < 1024);
  const location = useLocation();
  const navigate = useNavigate();
  const { logout, user } = useAuth();

  const navItems = [
    { path: '/user/rides', label: 'My Rides', icon: Car },
    { path: '/user/tours', label: 'Tour Bookings', icon: Plane },
    { path: '/user/bookings', label: 'Payment History', icon: CheckCircle },
    { path: '/user/profile', label: 'Profile Settings', icon: User },
  ];

  const isActive = (path) => location.pathname === path;

  const handleLogout = async () => {
    await logout();
    navigate('/');
  };

  useEffect(() => {
    const handleResize = () => {
      const mobile = window.innerWidth < 1024;
      setIsMobile(mobile);
      if (!mobile) setSidebarOpen(true);
    };

    handleResize();
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  const sidebarVariants = {
    open: { x: 0, width: 280, transition: { type: 'spring', stiffness: 300, damping: 30 } },
    closed: { x: -280, width: 0, transition: { type: 'spring', stiffness: 300, damping: 30 } }
  };

  return (
    <div className="flex h-screen bg-[#f8fafc] dark:bg-[#0f172a] font-['Outfit'] overflow-hidden">
      {/* Sidebar for Desktop & Mobile */}
      <motion.aside
        initial={isMobile ? "closed" : "open"}
        animate={sidebarOpen || !isMobile ? "open" : "closed"}
        variants={sidebarVariants}
        className="fixed inset-y-0 left-0 z-50 bg-[#1e293b] text-slate-300 shadow-2xl flex flex-col lg:relative lg:translate-x-0"
      >
        {/* Sidebar Header */}
        <div className="h-20 flex items-center px-6 border-b border-slate-700/50 justify-between">
          <Link to="/" className="flex items-center gap-2 group">
            <div className="w-10 h-10 bg-indigo-600 rounded-xl flex items-center justify-center group-hover:rotate-12 transition-transform duration-300">
              <Car className="text-white" size={24} />
            </div>
            <span className="text-xl font-bold text-white tracking-tight">GoElectriQ</span>
          </Link>
          {isMobile && (
            <button onClick={() => setSidebarOpen(false)} className="p-2 text-slate-400 hover:text-white transition">
              <X size={20} />
            </button>
          )}
        </div>

        {/* User Quick Profile */}
        <div className="p-6">
          <div className="bg-slate-800/50 rounded-2xl p-4 flex items-center gap-4 border border-slate-700/50">
            <div className="w-12 h-12 rounded-full bg-gradient-to-tr from-indigo-500 to-purple-500 flex items-center justify-center text-white font-bold text-lg shadow-lg">
              {user?.firstName?.charAt(0) || user?.email?.charAt(0) || 'U'}
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-sm font-semibold text-white truncate">
                {user?.firstName ? `${user.firstName} ${user.lastName || ''}` : 'User Profile'}
              </p>
              <p className="text-xs text-slate-400 truncate">{user?.email || 'Premium Member'}</p>
            </div>
          </div>
        </div>

        {/* Navigation Items */}
        <nav className="flex-1 px-4 py-4 space-y-1.5 overflow-y-auto">
          <p className="px-4 text-[10px] font-bold text-slate-500 uppercase tracking-[0.2em] mb-4">Main Menu</p>
          
          <Link
            to="/"
            className="flex items-center gap-3 px-4 py-3 rounded-xl transition-all duration-200 group text-slate-400 hover:bg-slate-800/50 hover:text-white"
          >
            <Home size={20} className="group-hover:scale-110 transition-transform" />
            <span className="font-medium">Landing Page</span>
            <ChevronRight size={14} className="ml-auto opacity-0 group-hover:opacity-100 transition-opacity" />
          </Link>

          {navItems.map((item) => (
            <Link
              key={item.path}
              to={item.path}
              className={`flex items-center gap-3 px-4 py-3 rounded-xl transition-all duration-200 group ${
                isActive(item.path)
                  ? 'bg-indigo-600 text-white shadow-lg shadow-indigo-500/20'
                  : 'text-slate-400 hover:bg-slate-800/50 hover:text-white'
              }`}
            >
              <item.icon size={20} className={`${isActive(item.path) ? '' : 'group-hover:scale-110 transition-transform'}`} />
              <span className="font-medium">{item.label}</span>
              {isActive(item.path) && <motion.div layoutId="activeNav" className="w-1 h-6 bg-white rounded-full ml-auto" />}
              {!isActive(item.path) && <ChevronRight size={14} className="ml-auto opacity-0 group-hover:opacity-100 transition-opacity" />}
            </Link>
          ))}
        </nav>

        {/* Sidebar Footer */}
        <div className="p-4 mt-auto border-t border-slate-700/50">
          <button
            onClick={handleLogout}
            className="w-full flex items-center justify-center gap-3 px-4 py-3.5 bg-rose-500/10 hover:bg-rose-500 text-rose-500 hover:text-white rounded-xl transition-all duration-300 font-bold text-sm"
          >
            <LogOut size={18} />
            Logout Session
          </button>
        </div>
      </motion.aside>

      {/* Main Content Area */}
      <div className="flex-1 flex flex-col relative overflow-hidden">
        {/* Top Header */}
        <header className="h-20 bg-white dark:bg-slate-900/50 backdrop-blur-md border-b border-slate-200 dark:border-slate-800 flex items-center justify-between px-6 lg:px-10 z-30">
          <div className="flex items-center gap-4">
            {isMobile && (
              <button onClick={() => setSidebarOpen(true)} className="p-2 bg-slate-100 dark:bg-slate-800 rounded-lg text-slate-600 dark:text-slate-300">
                <Menu size={20} />
              </button>
            )}
            <div className="hidden sm:flex items-center gap-3 px-4 py-2 bg-slate-100 dark:bg-slate-800 rounded-xl border border-slate-200 dark:border-slate-700 w-80">
              <Search size={18} className="text-slate-400" />
              <input type="text" placeholder="Quick search..." className="bg-transparent border-none focus:ring-0 text-sm w-full" />
            </div>
          </div>

          <div className="flex items-center gap-3 sm:gap-6">
            <button className="relative p-2.5 text-slate-500 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-xl transition-all">
              <Bell size={20} />
              <span className="absolute top-2.5 right-2.5 w-2 h-2 bg-indigo-500 rounded-full border-2 border-white dark:border-slate-900" />
            </button>
            <button className="p-2.5 text-slate-500 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-xl transition-all">
              <Settings size={20} />
            </button>
            <div className="h-8 w-px bg-slate-200 dark:bg-slate-800 hidden sm:block" />
            <div className="flex items-center gap-3 cursor-pointer group">
              <div className="hidden sm:block text-right">
                <p className="text-sm font-bold text-slate-900 dark:text-white leading-none mb-1">
                  {user?.firstName || 'User'}
                </p>
                <p className="text-[11px] font-bold text-emerald-500 uppercase tracking-wider">Premium User</p>
              </div>
              <div className="w-10 h-10 rounded-full border-2 border-indigo-100 group-hover:border-indigo-500 transition-colors duration-300 overflow-hidden shadow-md">
                <div className="w-full h-full bg-slate-200 flex items-center justify-center text-indigo-600 font-bold">
                  {user?.firstName?.charAt(0) || 'U'}
                </div>
              </div>
            </div>
          </div>
        </header>

        {/* Content Body */}
        <main className="flex-1 overflow-y-auto p-6 lg:p-10 scrollbar-thin scrollbar-thumb-slate-200 dark:scrollbar-thumb-slate-800">
          <AnimatePresence mode="wait">
            <motion.div
              key={location.pathname}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              transition={{ duration: 0.3 }}
            >
              {children}
            </motion.div>
          </AnimatePresence>
        </main>
      </div>

      {/* Mobile Sidebar Overlay */}
      <AnimatePresence>
        {isMobile && sidebarOpen && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={() => setSidebarOpen(false)}
            className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm z-40 lg:hidden"
          />
        )}
      </AnimatePresence>
    </div>
  );
};

export default UserLayout;
