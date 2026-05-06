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
  ChevronRight,
  Star,
  ShieldCheck,
  Award,
  Phone,
  Navigation,
  MapPin,
  Sun,
  Moon
} from 'lucide-react';
import logoDark from '../../assets/logo_dark.png';
import logoLight from '../../assets/logo_light.png';
import * as bookingService from '../../services/bookingService.js';
import * as authService from '../../services/authService.js';
import { useTheme } from '../../context/ThemeContext.jsx';


const UserLayout = ({ children }) => {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [isMobile, setIsMobile] = useState(window.innerWidth < 1024);
  const [notificationsOpen, setNotificationsOpen] = useState(false);
  const [activeBooking, setActiveBooking] = useState(null);
  const [driverApp, setDriverApp] = useState(null);
  const navigate = useNavigate();
  const { logout, user } = useAuth();
  const { theme, toggleTheme } = useTheme();
  const darkMode = theme === 'dark';

  useEffect(() => {
    if (user) {
      const fetchActiveRide = async () => {
        try {
          let res, tourRes;
          if (user.role === 'driver') {
            res = await bookingService.getDriverBookings?.() || { success: false };
          } else {
            // Fetch both regular rides and tour bookings
            [res, tourRes] = await Promise.all([
              bookingService.getMyBookings(),
              bookingService.getMyTourBookings?.() || { success: true, data: [] }
            ]);
          }

          if (res?.success || tourRes?.success) {
            let bookings = [];
            // Merge regular bookings
            if (res?.success) {
              const bData = res.data?.bookings || (Array.isArray(res.data) ? res.data : (res.data?.data || []));
              bookings = [...bookings, ...bData.map(b => ({ ...b, rideType: b.rideType || 'ride' }))];
            }
            // Merge tour bookings
            if (tourRes?.success) {
              const tData = tourRes.data?.tourBookings || (Array.isArray(tourRes.data) ? tourRes.data : []);
              bookings = [...bookings, ...tData.map(b => ({ ...b, rideType: 'tour' }))];
            }

            // Find most "active" booking
            let active = bookings.find(b =>
              ['ongoing', 'confirmed'].includes(b.status?.toLowerCase())
            );

            if (!active) {
              active = bookings.find(b =>
                ['pending'].includes(b.status?.toLowerCase())
              );
            }
            setActiveBooking(active);
          }
        } catch (err) {
          console.error('Error fetching active ride for sidebar:', err);
        }
      };
      fetchActiveRide();

      const fetchDriverStatus = async () => {
        try {
          const res = await authService.getDriverStatus();
          if (res.success && res.data) {
            setDriverApp(res.data);
          }
        } catch (err) {
          console.error('Error fetching driver status for layout:', err);
        }
      };
      fetchDriverStatus();
    }
  }, [user]);

  const navItems = [
    { path: '/user/rides', label: 'My Rides', icon: Car },
    { path: '/user/tours', label: 'Tour Bookings', icon: Plane },
    { path: '/user/bookings', label: 'Payment History', icon: CheckCircle },
    { path: '/user/profile', label: 'Profile Settings', icon: User },
    ...(driverApp ? [{ path: '/user/application-status', label: 'Application Status', icon: ShieldCheck }] : []),
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
    <div className="flex h-screen bg-[#fafafa] dark:bg-slate-950 font-['Outfit'] overflow-hidden transition-colors duration-300">
      <motion.aside
        initial={isMobile ? "closed" : "open"}
        animate={sidebarOpen || !isMobile ? "open" : "closed"}
        variants={sidebarVariants}
        className="fixed inset-y-0 left-0 z-50 bg-white dark:bg-slate-900 text-slate-600 dark:text-slate-300 border-r border-slate-100 dark:border-slate-800 shadow-xl flex flex-col lg:relative lg:translate-x-0"
      >
        <div className="h-20 flex items-center px-6 border-b border-slate-100 justify-between">
          <Link to="/" className="flex items-center group">
            <img
              src={darkMode ? logoDark : logoLight}
              alt="GoElectriQ Logo"
              className="h-32 md:h-40 w-auto object-contain transition-transform duration-300 group-hover:scale-105"
            />
          </Link>
          {isMobile && (
            <button onClick={() => setSidebarOpen(false)} className="p-2 text-slate-400 hover:text-emerald-500 transition">
              <X size={20} />
            </button>
          )}
        </div>

        <div className="p-6 pb-2">
          <div className="bg-white dark:bg-slate-800 rounded-2xl p-4 flex items-center gap-4 border border-slate-100 dark:border-slate-700 shadow-sm transition-all hover:shadow-md group">
            <div className={`w-12 h-12 rounded-full flex items-center justify-center text-white font-bold text-lg shadow-lg transform transition-transform group-hover:scale-110 ${user?.role === 'driver' ? 'bg-gradient-to-tr from-blue-600 to-indigo-600' : 'bg-gradient-to-tr from-emerald-500 to-teal-500'
              }`}>
              {user?.role === 'driver' ? user?.name?.charAt(0) : (user?.firstName?.charAt(0) || user?.email?.charAt(0) || 'U')}
            </div>
            <div className="flex-1 min-w-0">
              <div className="flex items-center gap-1.5">
                <p className="text-sm font-bold text-slate-900 truncate">
                  {user?.role === 'driver' ? user.name : (user?.firstName ? `${user.firstName} ${user.lastName || ''}` : 'User Profile')}
                </p>
                {(user?.isVerified || user?.role === 'driver') && (
                  <div className="flex-shrink-0" title="Verified Professional">
                    <ShieldCheck size={14} className="text-blue-500 fill-blue-500/10" />
                  </div>
                )}
              </div>
              <p className="text-[10px] font-bold text-slate-400 uppercase tracking-wider truncate">
                {user?.role === 'driver' ? 'Certified Partner' : 'Premium Member'}
              </p>
            </div>
          </div>
        </div>

        {user?.role === 'driver' && (
          <div className="px-6 py-4">
            <div className="bg-slate-900 rounded-[1.5rem] p-5 border border-slate-800 shadow-2xl relative overflow-hidden group">
              <div className="absolute -right-4 -top-4 w-24 h-24 bg-blue-600/10 rounded-full blur-2xl group-hover:bg-blue-600/20 transition-all duration-500" />
              <div className="absolute -left-4 -bottom-4 w-16 h-16 bg-emerald-600/10 rounded-full blur-xl group-hover:bg-emerald-600/20 transition-all duration-500" />

              <div className="relative z-10 space-y-4">
                <div className="flex justify-between items-start">
                  <div className="space-y-1">
                    <div className="flex items-center gap-2">
                      <div className="w-6 h-6 rounded-lg bg-blue-500/20 flex items-center justify-center">
                        <Car size={12} className="text-blue-400" />
                      </div>
                      <p className="text-[10px] font-black text-blue-400 uppercase tracking-[0.2em]">Vehicle Fleet</p>
                    </div>
                    <p className="text-sm font-black text-white tracking-tight">
                      {user?.vehicleDetails?.vehicleModel || 'Electric Sedan'}
                    </p>
                    <p className="text-[10px] font-mono text-slate-500 bg-slate-800/50 px-2 py-0.5 rounded-md inline-block border border-slate-700/50">
                      {user?.vehicleDetails?.vehicleNumber || 'RJ 14 EV 0000'}
                    </p>
                  </div>
                  <div className="flex flex-col items-end gap-1">
                    <div className="bg-amber-400/10 px-2 py-1 rounded-lg flex items-center gap-1 border border-amber-400/20">
                      <Star size={10} className="text-amber-400 fill-amber-400" />
                      <span className="text-xs font-black text-amber-400">{user?.rating || '4.9'}</span>
                    </div>
                    <p className="text-[9px] font-bold text-slate-500 uppercase">Rating</p>
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-3 pt-3 border-t border-slate-800">
                  <div>
                    <p className="text-[9px] font-bold text-slate-500 uppercase mb-1">Today's Earnings</p>
                    <p className="text-xs font-black text-white">₹{user?.earnings?.today || '2,450'}</p>
                  </div>
                  <div className="text-right">
                    <p className="text-[9px] font-bold text-slate-500 uppercase mb-1">Current Zone</p>
                    <div className="flex items-center justify-end gap-1">
                      <MapPin size={10} className="text-blue-400" />
                      <span className="text-[10px] font-black text-white">{user?.address?.city || 'Jaipur'}</span>
                    </div>
                  </div>
                </div>

                <div className="pt-3 border-t border-slate-800 flex justify-between items-center">
                  <div className="flex items-center gap-2">
                    <Award size={14} className="text-emerald-400" />
                    <span className="text-xs font-black text-white">{user?.totalRides || '128'} Rides</span>
                  </div>
                  <div className="flex items-center justify-end gap-1.5">
                    <div className={`w-1.5 h-1.5 rounded-full shadow-[0_0_8px] ${user?.availability === 'offline' ? 'bg-rose-500 shadow-rose-500/50' : 'bg-emerald-500 shadow-emerald-500/50 animate-pulse'
                      }`} />
                    <span className="text-[10px] font-black text-white uppercase tracking-wider">
                      {user?.availability || 'Available'}
                    </span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}

        {user?.role === 'driver' && activeBooking && (
          <div className="px-6 py-4">
            <div className="bg-blue-600 rounded-[1.5rem] p-5 shadow-xl relative overflow-hidden group">
              <div className="absolute -right-4 -top-4 w-24 h-24 bg-white/10 rounded-full blur-2xl group-hover:scale-125 transition-transform duration-700" />
              <div className="relative z-10 space-y-4">
                <div className="flex justify-between items-start">
                  <div className="space-y-1">
                    <p className="text-[10px] font-black text-blue-100 uppercase tracking-[0.2em]">Active Trip</p>
                    <p className="text-sm font-black text-white tracking-tight">
                      {activeBooking.user?.name || `${activeBooking.user?.firstName || ''} ${activeBooking.user?.lastName || ''}`.trim() || 'Guest Customer'}
                    </p>
                    <div className="flex items-center gap-1.5 mt-1">
                      <a href={`tel:${activeBooking.user?.phone}`} className="bg-white/20 hover:bg-white/30 p-1.5 rounded-lg transition-colors group/phone">
                        <Phone size={12} className="text-white group-hover/phone:scale-110 transition-transform" />
                      </a>
                      <span className="text-xs font-bold text-blue-50">{activeBooking.user?.phone || 'N/A'}</span>
                    </div>
                  </div>
                  <div className="bg-white/20 p-2 rounded-2xl">
                    <Navigation size={18} className="text-white animate-pulse" />
                  </div>
                </div>

                <div className="pt-3 border-t border-white/20">
                  <div className="flex justify-between items-center mb-2">
                    <p className="text-[9px] font-bold text-blue-100 uppercase">Trip Details</p>
                    <span className={`text-[9px] font-black bg-white px-2 py-0.5 rounded-full uppercase ${activeBooking.status === 'ongoing' ? 'text-blue-600' : 'text-amber-600'
                      }`}>
                      {activeBooking.status}
                    </span>
                  </div>
                  <div className="flex items-center justify-between">
                    <div className="max-w-[70%]">
                      <p className="text-[10px] font-black text-white uppercase opacity-70">Pickup</p>
                      <p className="text-xs font-bold text-white truncate">
                        {activeBooking.pickupLocation?.address || 'Not specified'}
                      </p>
                    </div>
                    <button onClick={() => navigate(`/user/rides`)} className="text-[10px] font-black text-white hover:underline uppercase tracking-widest">
                      View
                    </button>
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}

        {user?.role === 'user' && activeBooking && (
          <div className="px-6 py-4">
            <div className={`${activeBooking.driver ? 'bg-emerald-600' : 'bg-amber-500'} rounded-[1.5rem] p-5 shadow-xl relative overflow-hidden group`}>
              <div className="absolute -right-4 -top-4 w-24 h-24 bg-white/10 rounded-full blur-2xl group-hover:scale-125 transition-transform duration-700" />
              <div className="relative z-10 space-y-4">
                <div className="flex justify-between items-start">
                  <div className="space-y-1">
                    <p className="text-[10px] font-black text-white/80 uppercase tracking-[0.2em]">
                      {activeBooking.driver ? 'Your Driver' : 'Active Booking'}
                    </p>
                    <p className="text-sm font-black text-white tracking-tight">
                      {activeBooking.rideType === 'tour' 
                        ? (activeBooking.package?.title || 'Active Tour Package')
                        : (activeBooking.driver ? activeBooking.driver.name : 'Searching for Driver...')}
                    </p>
                    <div className="flex items-center gap-1.5 mt-1">
                      {activeBooking.rideType === 'tour' ? (
                        <div className="flex items-center gap-2">
                          <Plane size={12} className="text-white" />
                          <span className="text-[10px] font-bold text-white/90">Tour Journey</span>
                        </div>
                      ) : activeBooking.driver ? (
                        <>
                          <a href={`tel:${activeBooking.driver.phone}`} className="bg-white/20 hover:bg-white/30 p-1.5 rounded-lg transition-colors group/phone">
                            <Phone size={12} className="text-white group-hover/phone:scale-110 transition-transform" />
                          </a>
                          <span className="text-xs font-bold text-white">{activeBooking.driver.phone}</span>
                        </>
                      ) : (
                        <div className="flex items-center gap-2">
                          <div className="w-2 h-2 bg-white rounded-full animate-ping" />
                          <span className="text-[10px] font-bold text-white/90">Waiting for assignment</span>
                        </div>
                      )}
                    </div>
                  </div>
                  <div className="bg-white/20 p-2 rounded-2xl">
                    <Navigation size={18} className="text-white animate-bounce" />
                  </div>
                </div>

                <div className="pt-3 border-t border-white/20">
                  <div className="flex justify-between items-center mb-2">
                    <p className="text-[9px] font-bold text-white/80 uppercase">Trip Overview</p>
                    <span className="text-[9px] font-black bg-white text-emerald-600 px-2 py-0.5 rounded-full uppercase">
                      {activeBooking.status}
                    </span>
                  </div>
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-xs font-black text-white">
                        {activeBooking.rideType === 'tour'
                          ? `Car: ${activeBooking.carType?.toUpperCase() || 'Economy'}`
                          : (activeBooking.driver?.vehicleDetails?.vehicleModel || activeBooking.cabType || 'Electric Sedan')}
                      </p>
                      <p className="text-[10px] font-mono text-white/80">
                        {activeBooking.rideType === 'tour'
                          ? `Status: ${activeBooking.status?.toUpperCase()}`
                          : (activeBooking.driver?.vehicleDetails?.vehicleNumber || 'ID: ' + activeBooking.bookingId)}
                      </p>
                    </div>
                    <button onClick={() => navigate(`/user/booking-confirmation?id=${activeBooking._id}`)} className="text-[10px] font-black text-white hover:underline uppercase tracking-widest">
                      Track
                    </button>
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}

        <nav className="flex-1 px-4 py-4 space-y-1.5 overflow-y-auto">
          <p className="px-4 text-[10px] font-bold text-slate-500 uppercase tracking-[0.2em] mb-4">Main Menu</p>
          <Link to="/" className="flex items-center gap-3 px-4 py-3 rounded-xl transition-all duration-200 group text-slate-500 hover:bg-slate-50 hover:text-emerald-600">
            <Home size={20} className="group-hover:scale-110 transition-transform" />
            <span className="font-medium">Landing Page</span>
            <ChevronRight size={14} className="ml-auto opacity-0 group-hover:opacity-100 transition-opacity" />
          </Link>
          {navItems.map((item) => (
            <Link key={item.path} to={item.path} className={`flex items-center gap-3 px-4 py-3 rounded-xl transition-all duration-200 group ${isActive(item.path) ? 'bg-emerald-600 text-white shadow-lg shadow-emerald-500/20' : 'text-slate-500 dark:text-slate-400 hover:bg-slate-50 dark:hover:bg-slate-800 hover:text-emerald-600 dark:hover:text-emerald-400'}`}>
              <item.icon size={20} className={`${isActive(item.path) ? '' : 'group-hover:scale-110 transition-transform'}`} />
              <span className="font-medium">{item.label}</span>
              {isActive(item.path) && <motion.div layoutId="activeNav" className="w-1 h-6 bg-white rounded-full ml-auto" />}
              {!isActive(item.path) && <ChevronRight size={14} className="ml-auto opacity-0 group-hover:opacity-100 transition-opacity" />}
            </Link>
          ))}
        </nav>

        <div className="p-4 mt-auto border-t border-slate-100 dark:border-slate-800 space-y-2">
          <button
            onClick={toggleTheme}
            className="w-full flex items-center justify-center gap-3 px-4 py-3 bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 text-slate-600 dark:text-slate-300 rounded-xl transition-all duration-300 font-bold text-sm"
          >
            {darkMode ? <Sun size={18} /> : <Moon size={18} />}
            {darkMode ? 'Light Mode' : 'Dark Mode'}
          </button>
          
          <button onClick={handleLogout} className="w-full flex items-center justify-center gap-3 px-4 py-3.5 bg-rose-500/10 hover:bg-rose-500 text-rose-500 hover:text-white rounded-xl transition-all duration-300 font-bold text-sm">
            <LogOut size={18} />
            Logout Session
          </button>
        </div>
      </motion.aside>

      <div className="flex-1 flex flex-col relative overflow-hidden">
        <header className="h-20 bg-white dark:bg-slate-900 backdrop-blur-md border-b border-slate-200 dark:border-slate-800 flex items-center justify-between px-6 lg:px-10 z-30">
          <div className="flex items-center gap-4">
            {isMobile && (
              <button onClick={() => setSidebarOpen(true)} className="p-2 bg-slate-100 dark:bg-slate-800 rounded-lg text-slate-600 dark:text-slate-300">
                <Menu size={20} />
              </button>
            )}
            <div className="hidden sm:flex items-center gap-3 px-4 py-2 bg-slate-50 dark:bg-slate-800 rounded-xl border border-slate-200 dark:border-slate-700 w-80 transition-all focus-within:ring-2 focus-within:ring-emerald-500 focus-within:border-transparent">
              <Search size={18} className="text-slate-400" />
              <input type="text" placeholder="Quick search journeys..." className="bg-transparent border-none focus:ring-0 text-sm w-full dark:text-white" onKeyDown={(e) => { if (e.key === 'Enter') navigate(`/user/rides?search=${e.target.value}`); }} />
            </div>
          </div>

          <div className="flex items-center gap-3 sm:gap-6">
            <div className="relative">
              <button onClick={() => setNotificationsOpen(!notificationsOpen)} className="relative p-2.5 text-slate-500 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-xl transition-all">
                <Bell size={20} />
                <span className="absolute top-2.5 right-2.5 w-2 h-2 bg-emerald-500 rounded-full border-2 border-white dark:border-slate-900" />
              </button>
              {notificationsOpen && (
                <div className="absolute right-0 mt-2 w-80 bg-white dark:bg-slate-800 rounded-2xl shadow-2xl border border-slate-100 dark:border-slate-700 overflow-hidden z-50">
                  <div className="p-4 border-b border-slate-100 dark:border-slate-700 flex justify-between items-center">
                    <h3 className="font-bold text-slate-900 dark:text-white">Notifications</h3>
                    <span className="text-[10px] bg-emerald-100 text-emerald-600 px-2 py-0.5 rounded-full font-bold">NEW</span>
                  </div>
                  <div className="p-6 text-center">
                    <div className="w-12 h-12 bg-slate-50 dark:bg-slate-900 rounded-full flex items-center justify-center mx-auto mb-3">
                      <Bell size={20} className="text-slate-400" />
                    </div>
                    <p className="text-sm text-slate-500 dark:text-slate-400">No new notifications yet.</p>
                  </div>
                </div>
              )}
            </div>
            <button onClick={() => navigate('/user/profile')} className="p-2.5 text-slate-500 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-xl transition-all" title="Settings">
              <Settings size={20} />
            </button>
            <div className="h-8 w-px bg-slate-200 dark:bg-slate-800 hidden sm:block" />
            <div className="flex items-center gap-3 cursor-pointer group">
              <div className="hidden sm:block text-right">
                <p className="text-sm font-bold text-slate-900 dark:text-white leading-none mb-1">
                  {user?.role === 'driver' ? user.name : (user?.firstName || 'User')}
                </p>
                <p className={`text-[11px] font-bold uppercase tracking-wider ${user?.role === 'driver' ? 'text-blue-500' : 'text-emerald-500'}`}>
                  {user?.role === 'driver' ? 'Certified Partner' : 'Premium Member'}
                </p>
              </div>
              <div className={`w-10 h-10 rounded-full border-2 group-hover:border-slate-400 transition-colors duration-300 overflow-hidden shadow-md ${user?.role === 'driver' ? 'border-blue-100' : 'border-emerald-100'}`}>
                <div className={`w-full h-full flex items-center justify-center font-bold ${user?.role === 'driver' ? 'bg-blue-600 text-white' : 'bg-slate-200 text-emerald-600'}`}>
                  {user?.role === 'driver' ? user?.name?.charAt(0) : (user?.firstName?.charAt(0) || 'U')}
                </div>
              </div>
            </div>
          </div>
        </header>

        <main className="flex-1 overflow-y-auto p-6 lg:p-10 scrollbar-thin scrollbar-thumb-slate-200 dark:scrollbar-thumb-slate-800">
          <AnimatePresence mode="wait">
            <motion.div key={location.pathname} initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -10 }} transition={{ duration: 0.3 }}>
              {children}
            </motion.div>
          </AnimatePresence>
        </main>
      </div>

      <AnimatePresence>
        {isMobile && sidebarOpen && (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} onClick={() => setSidebarOpen(false)} className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm z-40 lg:hidden" />
        )}
      </AnimatePresence>
    </div>
  );
};

export default UserLayout;
