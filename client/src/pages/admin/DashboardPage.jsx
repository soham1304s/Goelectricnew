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
      color: 'from-emerald-500 to-emerald-600',
      bgLight: 'bg-emerald-50',
      textLight: 'text-emerald-500',
      trend: '+12% this month',
    },
    {
      title: 'Active Drivers',
      value: analytics?.activeDrivers || 0,
      icon: Car,
      link: '/admin/driver-bookings',
      color: 'from-cyan-500 to-cyan-600',
      bgLight: 'bg-cyan-50',
      textLight: 'text-cyan-500',
      trend: '+8% this month',
    },
    {
      title: 'Total Bookings',
      value: analytics?.totalBookings || 0,
      icon: Calendar,
      link: '/admin/rides',
      color: 'from-teal-500 to-teal-600',
      bgLight: 'bg-teal-50',
      textLight: 'text-teal-500',
      trend: '+23% this month',
    },
    {
      title: 'Total Revenue',
      value: `₹${analytics?.totalRevenue || 0}`,
      icon: DollarSign,
      link: '/admin/payments',
      color: 'from-emerald-600 to-cyan-600',
      bgLight: 'bg-emerald-50',
      textLight: 'text-emerald-600',
      trend: '+15% this month',
    },
    {
      title: 'Charging Enquiries',
      value: analytics?.chargingEnquiries || 0,
      icon: Zap,
      link: '/admin/charging-bookings',
      color: 'from-orange-500 to-orange-600',
      bgLight: 'bg-orange-50',
      textLight: 'text-orange-500',
      trend: 'New leads this week',
    },
  ];

  return (
    <AdminLayout>
      <div className="space-y-6 md:space-y-8 pb-8">
        {/* Premium Header */}
        <div className="bg-gradient-to-r from-emerald-600 via-teal-600 to-cyan-600 rounded-2xl shadow-xl p-6 md:p-8 text-white overflow-hidden relative">
          <div className="absolute top-0 right-0 w-40 h-40 bg-white/10 rounded-full -mr-20 -mt-20 blur-xl"></div>
          <div className="absolute bottom-0 left-0 w-40 h-40 bg-white/10 rounded-full -ml-20 -mb-20 blur-xl"></div>
          
          <div className="relative z-10 flex flex-col md:flex-row md:justify-between md:items-start gap-4">
            <div className="flex-1 min-w-0">
              <h1 className="text-3xl md:text-4xl font-bold drop-shadow-lg">
                Welcome back, Admin!
              </h1>
              <p className="text-indigo-100 mt-3 text-sm md:text-base">
                Manage your entire GoElectriQ ecosystem at a glance
                {lastUpdated && (
                  <span className="block md:inline md:ml-2 text-xs text-indigo-200 mt-2 md:mt-0 font-medium">
                    <RefreshCw size={12} className="inline mr-1" /> Last updated: {lastUpdated.toLocaleTimeString()}
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
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-4 md:gap-6">
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
                      <stop offset="5%" stopColor="#10b981" stopOpacity={0.3}/>
                      <stop offset="95%" stopColor="#10b981" stopOpacity={0}/>
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
                    stroke="#10b981" 
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
                    <Cell fill="#10b981" />
                    <Cell fill="#06b6d4" />
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
                  <div className="w-3 h-3 rounded-full bg-[#10b981]"></div>
                  <span className="text-gray-600 dark:text-gray-400 font-medium">Ride Bookings</span>
                </div>
                <span className="font-bold text-gray-900 dark:text-white">{analytics?.rideBookings || 0}</span>
              </div>
              <div className="flex items-center justify-between text-sm">
                <div className="flex items-center gap-2">
                  <div className="w-3 h-3 rounded-full bg-[#06b6d4]"></div>
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
          
          <div className="grid grid-cols-2 sm:grid-cols-2 lg:grid-cols-4 gap-3 md:gap-5">
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
              to="/admin/charging-bookings"
              className="group p-5 md:p-6 border-2 border-orange-200 dark:border-orange-900 rounded-xl hover:border-orange-500 dark:hover:border-orange-500 hover:bg-orange-50 dark:hover:bg-gray-700 transition-all duration-300 text-center transform hover:scale-105"
            >
              <div className="bg-orange-100 dark:bg-orange-900/30 w-12 h-12 md:w-14 md:h-14 rounded-lg mx-auto flex items-center justify-center mb-3 group-hover:bg-orange-200 transition-all">
                <Zap size={24} className="text-orange-600 dark:text-orange-400" />
              </div>
              <p className="text-sm md:text-base font-bold text-gray-900 dark:text-white">Charging Enquiries</p>
              <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">New leads</p>
            </Link>

            <Link
              to="/admin/rides"
              className="group p-5 md:p-6 border-2 border-teal-200 dark:border-teal-900 rounded-xl hover:border-teal-500 dark:hover:border-teal-500 hover:bg-teal-50 dark:hover:bg-gray-700 transition-all duration-300 text-center transform hover:scale-105"
            >
              <div className="bg-teal-100 dark:bg-teal-900/30 w-12 h-12 md:w-14 md:h-14 rounded-lg mx-auto flex items-center justify-center mb-3 group-hover:bg-teal-200 transition-all">
                <Calendar size={24} className="text-teal-600 dark:text-teal-400" />
              </div>
              <p className="text-sm md:text-base font-bold text-gray-900 dark:text-white">Ride Bookings</p>
              <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">Active bookings</p>
            </Link>

            <Link
              to="/admin/tours"
              className="group p-5 md:p-6 border-2 border-cyan-200 dark:border-cyan-900 rounded-xl hover:border-cyan-500 dark:hover:border-cyan-500 hover:bg-cyan-50 dark:hover:bg-gray-700 transition-all duration-300 text-center transform hover:scale-105"
            >
              <div className="bg-cyan-100 dark:bg-cyan-900/30 w-12 h-12 md:w-14 md:h-14 rounded-lg mx-auto flex items-center justify-center mb-3 group-hover:bg-cyan-200 transition-all">
                <Package size={24} className="text-cyan-600 dark:text-cyan-400" />
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
              className="group p-5 md:p-6 border-2 border-emerald-200 dark:border-emerald-900 rounded-xl hover:border-emerald-500 dark:hover:border-emerald-500 hover:bg-emerald-50 dark:hover:bg-gray-700 transition-all duration-300 text-center transform hover:scale-105"
            >
              <div className="bg-emerald-100 dark:bg-emerald-900/30 w-12 h-12 md:w-14 md:h-14 rounded-lg mx-auto flex items-center justify-center mb-3 group-hover:bg-emerald-200 transition-all">
                <BarChart3 size={24} className="text-emerald-600 dark:text-emerald-400" />
              </div>
              <p className="text-sm md:text-base font-bold text-gray-900 dark:text-white">Payments</p>
              <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">Revenue & Payments</p>
            </Link>
          </div>
        </div>

        {/* Recent Activity Table */}
        <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-lg border border-gray-100 dark:border-gray-700 overflow-hidden">
          <div className="p-6 md:p-8 border-b border-gray-100 dark:border-gray-700 flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="w-1 h-8 bg-emerald-500 rounded-full"></div>
              <h2 className="text-xl md:text-2xl font-bold text-gray-900 dark:text-white">
                Recent Ride Activity
              </h2>
            </div>
            <Link to="/admin/rides" className="text-indigo-600 dark:text-indigo-400 text-sm font-bold hover:underline">
              View All Rides
            </Link>
          </div>
          
          <div className="overflow-x-auto">
            <table className="w-full text-left">
              <thead>
                <tr className="bg-gray-50 dark:bg-gray-900/50">
                  <th className="px-6 py-4 text-xs font-black uppercase tracking-wider text-gray-500 dark:text-gray-400">ID</th>
                  <th className="px-6 py-4 text-xs font-black uppercase tracking-wider text-gray-500 dark:text-gray-400">Customer</th>
                  <th className="px-6 py-4 text-xs font-black uppercase tracking-wider text-gray-500 dark:text-gray-400">Type</th>
                  <th className="px-6 py-4 text-xs font-black uppercase tracking-wider text-gray-500 dark:text-gray-400">Status</th>
                  <th className="px-6 py-4 text-xs font-black uppercase tracking-wider text-gray-500 dark:text-gray-400">Amount</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100 dark:divide-gray-700">
                {analytics?.recentBookings?.length > 0 ? (
                  analytics.recentBookings.map((ride) => (
                    <tr key={ride._id} className="hover:bg-gray-50 dark:hover:bg-gray-700/50 transition-colors">
                      <td className="px-6 py-4 text-sm font-bold text-gray-900 dark:text-white">#{ride.bookingId.slice(-6)}</td>
                      <td className="px-6 py-4">
                        <div className="flex flex-col">
                          <span className="text-sm font-bold text-gray-900 dark:text-white">{ride.user?.firstName} {ride.user?.lastName}</span>
                          <span className="text-xs text-gray-500 dark:text-gray-400">{ride.cabType}</span>
                        </div>
                      </td>
                      <td className="px-6 py-4">
                        <span className={`px-2 py-1 rounded-full text-[10px] font-black uppercase tracking-widest ${
                          ride.rideType === 'airport' ? 'bg-blue-100 text-blue-600' : 
                          ride.rideType === 'intercity' ? 'bg-purple-100 text-purple-600' : 'bg-green-100 text-green-600'
                        }`}>
                          {ride.rideType}
                        </span>
                      </td>
                      <td className="px-6 py-4">
                        <span className={`flex items-center gap-1.5 text-xs font-bold ${
                          ride.status === 'completed' ? 'text-green-500' : 
                          ride.status === 'cancelled' ? 'text-red-500' : 'text-amber-500'
                        }`}>
                          <div className={`w-1.5 h-1.5 rounded-full ${
                            ride.status === 'completed' ? 'bg-green-500' : 
                            ride.status === 'cancelled' ? 'bg-red-500' : 'bg-amber-500'
                          }`}></div>
                          {ride.status}
                        </span>
                      </td>
                      <td className="px-6 py-4 text-sm font-black text-gray-900 dark:text-white">
                        ₹{ride.pricing?.totalFare || 0}
                      </td>
                    </tr>
                  ))
                ) : (
                  <tr>
                    <td colSpan="5" className="px-6 py-10 text-center text-gray-500 dark:text-gray-400">
                      No recent ride activity found.
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
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
