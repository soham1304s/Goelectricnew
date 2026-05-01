import { useState, useEffect } from 'react';
import {
  Users,
  Calendar,
  DollarSign,
  RefreshCw,
  BarChart3,
  Car,
  Package,
  User,
  TrendingUp,
  Activity,
  Zap,
  Settings,
  LogOut,
  Box,
  PieChart as PieIcon,
} from 'lucide-react';
import {
  AreaChart,
  Area,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
} from 'recharts';
import { Link } from 'react-router-dom';
import AdminLayout from './AdminLayout';
import { getAnalytics } from '../../services/adminService';

const DashboardPage = () => {
  const [analytics, setAnalytics] = useState(null);
  const [loading, setLoading] = useState(true);
  const [autoRefresh, setAutoRefresh] = useState(true);
  const [lastUpdated, setLastUpdated] = useState(null);

  const fetchAnalytics = async () => {
    try {
      const response = await getAnalytics();
      setAnalytics(response.data || {});
      setLastUpdated(new Date());
    } catch (error) {
      console.error('Error fetching analytics:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleRefresh = async () => {
    setLoading(true);
    await fetchAnalytics();
  };

  useEffect(() => {
    // Initial fetch
    void fetchAnalytics();

    // Set up auto-refresh interval (every 10 seconds for real-time updates)
    let intervalId;
    if (autoRefresh) {
      intervalId = window.setInterval(() => {
        void fetchAnalytics();
      }, 10000); // 10 seconds
    }

    // Cleanup interval on unmount or when autoRefresh changes
    return () => {
      if (intervalId) clearInterval(intervalId);
    };
  }, [autoRefresh]);

  const quickStats = [
    {
      title: 'Total Users',
      value: `${analytics?.totalUsers || 0}`,
      subtitle: `${analytics?.activeUsers || 0} active`,
      icon: Users,
      link: '/admin/users',
      color: 'from-blue-500 to-blue-600',
      bgLight: 'bg-blue-50',
      textLight: 'text-blue-500',
      trend: '+12% this month',
    },
    {
      title: 'Active Drivers',
      value: analytics?.activeDrivers || 0,
      icon: Car,
      link: '/admin/driver-bookings',
      color: 'from-green-500 to-green-600',
      bgLight: 'bg-green-50',
      textLight: 'text-green-500',
      trend: '+8% this month',
    },
    {
      title: 'Total Bookings',
      value: analytics?.totalBookings || 0,
      icon: Calendar,
      link: '/admin/rides',
      color: 'from-purple-500 to-purple-600',
      bgLight: 'bg-purple-50',
      textLight: 'text-purple-500',
      trend: '+23% this month',
    },
    {
      title: 'Total Revenue',
      value: `₹${analytics?.totalRevenue || 0}`,
      icon: DollarSign,
      link: '/admin/payments',
      color: 'from-amber-500 to-amber-600',
      bgLight: 'bg-amber-50',
      textLight: 'text-amber-500',
      trend: '+15% this month',
    },
  ];

  return (
    <AdminLayout>
      <div className="space-y-6 md:space-y-8 pb-8">
        {/* Premium Header */}
        <div className="bg-gradient-to-r from-indigo-600 via-purple-600 to-pink-600 rounded-2xl shadow-xl p-6 md:p-8 text-white overflow-hidden relative">
          <div className="absolute top-0 right-0 w-40 h-40 bg-white/10 rounded-full -mr-20 -mt-20 blur-xl"></div>
          <div className="absolute bottom-0 left-0 w-40 h-40 bg-white/10 rounded-full -ml-20 -mb-20 blur-xl"></div>
          
          <div className="relative z-10 flex flex-col md:flex-row md:justify-between md:items-start gap-4">
            <div className="flex-1 min-w-0">
              <h1 className="text-3xl md:text-4xl font-bold drop-shadow-lg">
                Welcome back, Admin! 👋
              </h1>
              <p className="text-indigo-100 mt-3 text-sm md:text-base">
                Manage your entire GoElectriQ ecosystem at a glance
                {lastUpdated && (
                  <span className="block md:inline md:ml-2 text-xs text-indigo-200 mt-2 md:mt-0 font-medium">
                    🔄 Last updated: {lastUpdated.toLocaleTimeString()}
                  </span>
                )}
              </p>
            </div>
            <div className="flex flex-wrap items-center gap-3">
              <button
                onClick={() => setAutoRefresh(!autoRefresh)}
                className={`flex items-center gap-2 px-4 py-2 rounded-lg transition-all duration-300 transform hover:scale-105 font-medium shadow-lg ${
                  autoRefresh
                    ? 'bg-green-400 hover:bg-green-500 text-gray-900'
                    : 'bg-gray-600 hover:bg-gray-700 text-white'
                }`}
                title={autoRefresh ? 'Auto-refresh ON' : 'Auto-refresh OFF'}
              >
                <RefreshCw size={18} className={autoRefresh ? 'animate-spin' : ''} />
                <span>{autoRefresh ? 'Live' : 'Off'}</span>
              </button>
              <button
                onClick={handleRefresh}
                disabled={loading}
                className="flex items-center gap-2 bg-white hover:bg-gray-100 text-purple-600 px-4 py-2 rounded-lg transition-all duration-300 transform hover:scale-105 disabled:opacity-50 font-medium shadow-lg"
              >
                <RefreshCw size={18} className={loading ? 'animate-spin' : ''} />
                <span>Refresh</span>
              </button>
            </div>
          </div>
        </div>

        {/* Quick Stats - Enhanced */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 md:gap-6">
          {quickStats.map((stat, index) => {
            const Icon = stat.icon;
            return (
              <Link
                key={index}
                to={stat.link}
                className="group bg-white dark:bg-gray-800 rounded-xl shadow-md hover:shadow-2xl transition-all duration-300 transform hover:scale-105 hover:-translate-y-2 overflow-hidden border border-gray-100 dark:border-gray-700"
              >
                <div className={`bg-gradient-to-br ${stat.color} p-4 md:p-5 text-white relative overflow-hidden`}>
                  <div className="absolute top-0 right-0 w-20 h-20 bg-white/20 rounded-full -mr-10 -mt-10 blur-lg"></div>
                  <div className="relative z-10 flex justify-between items-start">
                    <div>
                      <p className="text-xs md:text-sm font-semibold text-white/90">
                        {stat.title}
                      </p>
                      <p className="text-2xl md:text-3xl font-bold mt-2 md:mt-3 drop-shadow-lg break-words">
                        {stat.value}
                      </p>
                    </div>
                    <Icon size={32} className="opacity-20" />
                  </div>
                </div>
                <div className="p-4 md:p-5">
                  {stat.subtitle && (
                    <p className="text-xs md:text-sm text-gray-600 dark:text-gray-400 mb-2">
                      {stat.subtitle}
                    </p>
                  )}
                  <p className="text-xs font-bold text-green-600 dark:text-green-400 flex items-center gap-1">
                    <TrendingUp size={14} />
                    {stat.trend}
                  </p>
                  <div className="mt-3 inline-flex items-center gap-1 text-purple-600 dark:text-purple-400 font-semibold text-xs group-hover:gap-2 transition-all">
                    View Details
                    <span>→</span>
                  </div>
                </div>
              </Link>
            );
          })}
        </div>

        {/* Business Overview - Charts */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Revenue Trend Chart */}
          <div className="lg:col-span-2 bg-white dark:bg-gray-800 rounded-2xl shadow-lg p-6 border border-gray-100 dark:border-gray-700">
            <div className="flex items-center justify-between mb-6">
              <div>
                <h2 className="text-xl font-bold text-gray-900 dark:text-white">Revenue Trends</h2>
                <p className="text-sm text-gray-500 dark:text-gray-400">Daily revenue for the last 7 days</p>
              </div>
              <div className="p-2 bg-green-50 dark:bg-green-900/30 rounded-lg text-green-600">
                <TrendingUp size={20} />
              </div>
            </div>
            <div className="h-[300px] w-full">
              <ResponsiveContainer width="100%" height="100%">
                <AreaChart data={analytics?.revenueData || []}>
                  <defs>
                    <linearGradient id="colorRev" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#8b5cf6" stopOpacity={0.3}/>
                      <stop offset="95%" stopColor="#8b5cf6" stopOpacity={0}/>
                    </linearGradient>
                  </defs>
                  <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#e2e8f0" />
                  <XAxis 
                    dataKey="date" 
                    axisLine={false} 
                    tickLine={false} 
                    tick={{fill: '#94a3b8', fontSize: 12}}
                    dy={10}
                  />
                  <YAxis 
                    axisLine={false} 
                    tickLine={false} 
                    tick={{fill: '#94a3b8', fontSize: 12}}
                    tickFormatter={(value) => `₹${value}`}
                  />
                  <Tooltip 
                    contentStyle={{borderRadius: '12px', border: 'none', boxShadow: '0 10px 15px -3px rgb(0 0 0 / 0.1)'}}
                    formatter={(value) => [`₹${value}`, 'Revenue']}
                  />
                  <Area 
                    type="monotone" 
                    dataKey="revenue" 
                    stroke="#8b5cf6" 
                    strokeWidth={3}
                    fillOpacity={1} 
                    fill="url(#colorRev)" 
                  />
                </AreaChart>
              </ResponsiveContainer>
            </div>
          </div>

          {/* Booking Distribution Pie Chart */}
          <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-lg p-6 border border-gray-100 dark:border-gray-700">
            <div className="flex items-center justify-between mb-6">
              <div>
                <h2 className="text-xl font-bold text-gray-900 dark:text-white">Distribution</h2>
                <p className="text-sm text-gray-500 dark:text-gray-400">Rides vs Tours</p>
              </div>
              <div className="p-2 bg-blue-50 dark:bg-blue-900/30 rounded-lg text-blue-600">
                <PieIcon size={20} />
              </div>
            </div>
            <div className="h-[300px] w-full relative">
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={[
                      { name: 'Rides', value: analytics?.rideBookings || 0 },
                      { name: 'Tours', value: analytics?.tourBookings || 0 },
                    ]}
                    cx="50%"
                    cy="50%"
                    innerRadius={60}
                    outerRadius={80}
                    paddingAngle={5}
                    dataKey="value"
                  >
                    <Cell fill="#6366f1" />
                    <Cell fill="#ec4899" />
                  </Pie>
                  <Tooltip 
                    contentStyle={{borderRadius: '12px', border: 'none', boxShadow: '0 10px 15px -3px rgb(0 0 0 / 0.1)'}}
                  />
                </PieChart>
              </ResponsiveContainer>
              <div className="absolute inset-0 flex flex-col items-center justify-center pointer-events-none">
                <p className="text-2xl font-bold text-gray-900 dark:text-white">{analytics?.totalBookings || 0}</p>
                <p className="text-xs text-gray-500 font-medium uppercase">Total</p>
              </div>
            </div>
            <div className="mt-4 space-y-2">
              <div className="flex items-center justify-between text-sm">
                <div className="flex items-center gap-2">
                  <div className="w-3 h-3 rounded-full bg-[#6366f1]"></div>
                  <span className="text-gray-600 dark:text-gray-400 font-medium">Ride Bookings</span>
                </div>
                <span className="font-bold text-gray-900 dark:text-white">{analytics?.rideBookings || 0}</span>
              </div>
              <div className="flex items-center justify-between text-sm">
                <div className="flex items-center gap-2">
                  <div className="w-3 h-3 rounded-full bg-[#ec4899]"></div>
                  <span className="text-gray-600 dark:text-gray-400 font-medium">Tour Bookings</span>
                </div>
                <span className="font-bold text-gray-900 dark:text-white">{analytics?.tourBookings || 0}</span>
              </div>
            </div>
          </div>
        </div>

        {/* Management Quick Links - Enhanced */}
        <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-lg p-6 md:p-8 border border-gray-100 dark:border-gray-700">
          <div className="flex items-center gap-3 mb-6 md:mb-8">
            <div className="w-1 h-8 bg-gradient-to-b from-indigo-600 to-purple-600 rounded-full"></div>
            <h2 className="text-xl md:text-2xl font-bold text-gray-900 dark:text-white">
              Quick Management
            </h2>
            <Activity size={24} className="text-purple-600 ml-auto" />
          </div>
          
          <div className="grid grid-cols-2 sm:grid-cols-2 lg:grid-cols-3 gap-3 md:gap-5">
            <Link
              to="/admin/users"
              className="group p-5 md:p-6 border-2 border-blue-200 dark:border-blue-900 rounded-xl hover:border-blue-500 dark:hover:border-blue-500 hover:bg-blue-50 dark:hover:bg-gray-700 transition-all duration-300 text-center transform hover:scale-105"
            >
              <div className="bg-blue-100 dark:bg-blue-900/30 w-12 h-12 md:w-14 md:h-14 rounded-lg mx-auto flex items-center justify-center mb-3 group-hover:bg-blue-200 transition-all">
                <Users size={24} className="text-blue-600 dark:text-blue-400" />
              </div>
              <p className="text-sm md:text-base font-bold text-gray-900 dark:text-white">Manage Users</p>
              <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">View all users</p>
            </Link>

            <Link
              to="/admin/driver-bookings"
              className="group p-5 md:p-6 border-2 border-green-200 dark:border-green-900 rounded-xl hover:border-green-500 dark:hover:border-green-500 hover:bg-green-50 dark:hover:bg-gray-700 transition-all duration-300 text-center transform hover:scale-105"
            >
              <div className="bg-green-100 dark:bg-green-900/30 w-12 h-12 md:w-14 md:h-14 rounded-lg mx-auto flex items-center justify-center mb-3 group-hover:bg-green-200 transition-all">
                <Car size={24} className="text-green-600 dark:text-green-400" />
              </div>
              <p className="text-sm md:text-base font-bold text-gray-900 dark:text-white">Manage Drivers</p>
              <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">Monitor drivers</p>
            </Link>

            <Link
              to="/admin/rides"
              className="group p-5 md:p-6 border-2 border-purple-200 dark:border-purple-900 rounded-xl hover:border-purple-500 dark:hover:border-purple-500 hover:bg-purple-50 dark:hover:bg-gray-700 transition-all duration-300 text-center transform hover:scale-105"
            >
              <div className="bg-purple-100 dark:bg-purple-900/30 w-12 h-12 md:w-14 md:h-14 rounded-lg mx-auto flex items-center justify-center mb-3 group-hover:bg-purple-200 transition-all">
                <Calendar size={24} className="text-purple-600 dark:text-purple-400" />
              </div>
              <p className="text-sm md:text-base font-bold text-gray-900 dark:text-white">Ride Bookings</p>
              <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">Active bookings</p>
            </Link>

            <Link
              to="/admin/tours"
              className="group p-5 md:p-6 border-2 border-amber-200 dark:border-amber-900 rounded-xl hover:border-amber-500 dark:hover:border-amber-500 hover:bg-amber-50 dark:hover:bg-gray-700 transition-all duration-300 text-center transform hover:scale-105"
            >
              <div className="bg-amber-100 dark:bg-amber-900/30 w-12 h-12 md:w-14 md:h-14 rounded-lg mx-auto flex items-center justify-center mb-3 group-hover:bg-amber-200 transition-all">
                <Package size={24} className="text-amber-600 dark:text-amber-400" />
              </div>
              <p className="text-sm md:text-base font-bold text-gray-900 dark:text-white">Tour Bookings</p>
              <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">Tour packages</p>
            </Link>

            <Link
              to="/admin/packages"
              className="group p-5 md:p-6 border-2 border-cyan-200 dark:border-cyan-900 rounded-xl hover:border-cyan-500 dark:hover:border-cyan-500 hover:bg-cyan-50 dark:hover:bg-gray-700 transition-all duration-300 text-center transform hover:scale-105"
            >
              <div className="bg-cyan-100 dark:bg-cyan-900/30 w-12 h-12 md:w-14 md:h-14 rounded-lg mx-auto flex items-center justify-center mb-3 group-hover:bg-cyan-200 transition-all">
                <Box size={24} className="text-cyan-600 dark:text-cyan-400" />
              </div>
              <p className="text-sm md:text-base font-bold text-gray-900 dark:text-white">Packages</p>
              <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">Package plans</p>
            </Link>

            <Link
              to="/admin/payments"
              className="group p-5 md:p-6 border-2 border-indigo-200 dark:border-indigo-900 rounded-xl hover:border-indigo-500 dark:hover:border-indigo-500 hover:bg-indigo-50 dark:hover:bg-gray-700 transition-all duration-300 text-center transform hover:scale-105"
            >
              <div className="bg-indigo-100 dark:bg-indigo-900/30 w-12 h-12 md:w-14 md:h-14 rounded-lg mx-auto flex items-center justify-center mb-3 group-hover:bg-indigo-200 transition-all">
                <BarChart3 size={24} className="text-indigo-600 dark:text-indigo-400" />
              </div>
              <p className="text-sm md:text-base font-bold text-gray-900 dark:text-white">Payments</p>
              <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">Revenue & Payments</p>
            </Link>
          </div>
        </div>

        {/* Additional Quick Actions */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <Link
            to="/admin/settings"
            className="group bg-gradient-to-br from-slate-900 to-slate-800 dark:from-slate-800 dark:to-slate-900 rounded-xl shadow-lg p-6 hover:shadow-2xl transition-all duration-300 transform hover:scale-105 text-white border border-slate-700 hover:border-slate-500"
          >
            <div className="flex items-center justify-between">
              <div>
                <h3 className="text-lg font-bold mb-2 flex items-center gap-2">
                  <Settings size={20} />
                  Settings & Configuration
                </h3>
                <p className="text-slate-300 text-sm">Manage system settings and preferences</p>
              </div>
              <Settings size={32} className="opacity-20" />
            </div>
          </Link>

          <Link
            to="/admin/profile"
            className="group bg-gradient-to-br from-purple-600 to-indigo-600 dark:from-purple-700 dark:to-indigo-700 rounded-xl shadow-lg p-6 hover:shadow-2xl transition-all duration-300 transform hover:scale-105 text-white border border-purple-500 hover:border-purple-400"
          >
            <div className="flex items-center justify-between">
              <div>
                <h3 className="text-lg font-bold mb-2 flex items-center gap-2">
                  <User size={20} />
                  My Profile
                </h3>
                <p className="text-purple-100 text-sm">View and update your profile</p>
              </div>
              <User size={32} className="opacity-20" />
            </div>
          </Link>
        </div>
      </div>
    </AdminLayout>
  );
};

export default DashboardPage;
