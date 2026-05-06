import { useState, useEffect, useMemo } from 'react';
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
  ArrowUpRight,
  ShieldCheck,
  Globe,
  Layers,
  Search,
  Bell
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
import { motion, AnimatePresence } from 'framer-motion';

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

  useEffect(() => {
    void fetchAnalytics();
    let intervalId;
    if (autoRefresh) {
      intervalId = window.setInterval(() => {
        void fetchAnalytics();
      }, 15000); // 15 seconds
    }
    return () => {
      if (intervalId) clearInterval(intervalId);
    };
  }, [autoRefresh]);

  const quickStats = useMemo(() => [
    {
      title: 'Total Users',
      value: analytics?.totalUsers || 0,
      subtitle: `${analytics?.activeUsers || 0} Synchronized`,
      icon: Users,
      link: '/admin/users',
      color: 'text-emerald-500',
      bg: 'bg-emerald-500/10',
      trend: '+12.5%',
    },
    {
      title: 'Active Fleet',
      value: analytics?.activeDrivers || 0,
      subtitle: 'Operational Units',
      icon: Car,
      link: '/admin/driver-bookings',
      color: 'text-blue-500',
      bg: 'bg-blue-500/10',
      trend: '+8.2%',
    },
    {
      title: 'Gross Bookings',
      value: analytics?.totalBookings || 0,
      subtitle: 'System Wide',
      icon: Calendar,
      link: '/admin/rides',
      color: 'text-violet-500',
      bg: 'bg-violet-500/10',
      trend: '+23.1%',
    },
    {
      title: 'Total Revenue',
      value: `₹${(analytics?.totalRevenue || 0).toLocaleString()}`,
      subtitle: 'Net Volume',
      icon: DollarSign,
      link: '/admin/payments',
      color: 'text-amber-500',
      bg: 'bg-amber-500/10',
      trend: '+15.4%',
    },
  ], [analytics]);

  const chartData = useMemo(() => analytics?.revenueData || [], [analytics]);

  return (
    <AdminLayout>
      <div className="max-w-[1600px] mx-auto space-y-10 pb-20">
        {/* Dynamic System Header */}
        <div className="relative flex flex-col lg:flex-row lg:items-center justify-between gap-8 bg-slate-900 rounded-[3rem] p-10 md:p-14 text-white overflow-hidden shadow-2xl">
          <div className="absolute top-0 right-0 w-96 h-96 bg-emerald-500/10 rounded-full blur-[120px] -mr-48 -mt-48" />
          <div className="absolute bottom-0 left-0 w-96 h-96 bg-blue-500/10 rounded-full blur-[120px] -ml-48 -mb-48" />
          
          <div className="relative z-10">
            <div className="flex items-center gap-3 mb-4">
              <div className="w-2 h-2 bg-emerald-500 rounded-full animate-pulse" />
              <span className="text-[10px] font-black uppercase tracking-[0.2em] text-slate-400">System Command Center</span>
            </div>
            <h1 className="text-4xl md:text-5xl font-black tracking-tighter mb-4">
              Operational <span className="text-emerald-400">Intelligence</span>
            </h1>
            <p className="text-slate-400 text-lg max-w-xl font-medium leading-relaxed">
              Global oversight of the GoElectriQ EV ecosystem. Real-time telemetry and financial analytics synchronized across all nodes.
            </p>
          </div>

          <div className="relative z-10 flex flex-wrap items-center gap-4">
            <div className="px-6 py-4 bg-white/5 backdrop-blur-xl rounded-2xl border border-white/10">
              <p className="text-[10px] font-black text-slate-500 uppercase tracking-widest mb-1">Last Update</p>
              <p className="text-sm font-black text-white">{lastUpdated?.toLocaleTimeString() || '--:--:--'}</p>
            </div>
            <button
              onClick={() => setAutoRefresh(!autoRefresh)}
              className={`flex items-center gap-3 px-8 py-4 rounded-2xl font-black text-xs uppercase tracking-widest transition-all ${
                autoRefresh
                  ? 'bg-emerald-500 text-white shadow-lg shadow-emerald-500/20'
                  : 'bg-slate-800 text-slate-400'
              }`}
            >
              <RefreshCw size={16} className={autoRefresh ? 'animate-spin' : ''} />
              {autoRefresh ? 'Live Node' : 'Manual Sync'}
            </button>
          </div>
        </div>

        {/* Analytical Matrix */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
          {quickStats.map((stat, idx) => (
            <motion.div
              key={idx}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: idx * 0.1 }}
              className="group bg-white rounded-[2.5rem] p-8 shadow-sm border border-slate-100 hover:shadow-2xl transition-all duration-500"
            >
              <div className="flex justify-between items-start mb-8">
                <div className={`p-4 ${stat.bg} ${stat.color} rounded-2xl`}>
                  <stat.icon size={24} />
                </div>
                <div className="flex flex-col items-end">
                  <div className="flex items-center gap-1 text-emerald-500">
                    <TrendingUp size={14} />
                    <span className="text-[10px] font-black">{stat.trend}</span>
                  </div>
                </div>
              </div>
              <div>
                <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1">{stat.title}</p>
                <h3 className="text-3xl font-black text-slate-900 mb-2">{stat.value}</h3>
                <p className="text-xs font-bold text-slate-500">{stat.subtitle}</p>
              </div>
              <Link to={stat.link} className="mt-8 flex items-center justify-between text-[10px] font-black uppercase tracking-widest text-slate-400 group-hover:text-emerald-500 transition-colors">
                Deep Analysis
                <ArrowUpRight size={14} />
              </Link>
            </motion.div>
          ))}
        </div>

        {/* Primary Data Visualizations */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
          <div className="lg:col-span-8 bg-white rounded-[3rem] shadow-sm border border-slate-100 p-10 md:p-14">
            <div className="flex items-center justify-between mb-12">
              <div>
                <h2 className="text-2xl font-black text-slate-900 tracking-tight">Revenue Dynamics</h2>
                <p className="text-sm font-bold text-slate-400 mt-1 uppercase tracking-widest">Financial Performance Index</p>
              </div>
              <div className="flex gap-2">
                {['7D', '1M', '3M', '1Y'].map(t => (
                  <button key={t} className={`px-4 py-2 rounded-xl text-[10px] font-black transition-all ${t === '7D' ? 'bg-slate-900 text-white shadow-lg' : 'bg-slate-50 text-slate-400 hover:bg-slate-100'}`}>{t}</button>
                ))}
              </div>
            </div>
            <div className="h-[400px] w-full">
              <ResponsiveContainer width="100%" height="100%">
                <AreaChart data={chartData}>
                  <defs>
                    <linearGradient id="colorRev" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#10b981" stopOpacity={0.1}/>
                      <stop offset="95%" stopColor="#10b981" stopOpacity={0}/>
                    </linearGradient>
                  </defs>
                  <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
                  <XAxis 
                    dataKey="date" 
                    axisLine={false} 
                    tickLine={false} 
                    tick={{fill: '#94a3b8', fontSize: 10, fontWeight: 'bold'}}
                    dy={10}
                  />
                  <YAxis 
                    axisLine={false} 
                    tickLine={false} 
                    tick={{fill: '#94a3b8', fontSize: 10, fontWeight: 'bold'}}
                    tickFormatter={(value) => `₹${value}`}
                  />
                  <Tooltip 
                    contentStyle={{borderRadius: '24px', border: 'none', boxShadow: '0 25px 50px -12px rgb(0 0 0 / 0.1)', padding: '20px'}}
                    itemStyle={{fontWeight: '900', fontSize: '12px'}}
                    labelStyle={{fontWeight: '900', color: '#64748b', marginBottom: '8px', fontSize: '10px', textTransform: 'uppercase'}}
                  />
                  <Area 
                    type="monotone" 
                    dataKey="revenue" 
                    stroke="#10b981" 
                    strokeWidth={4}
                    fillOpacity={1} 
                    fill="url(#colorRev)" 
                  />
                </AreaChart>
              </ResponsiveContainer>
            </div>
          </div>

          <div className="lg:col-span-4 bg-slate-900 rounded-[3rem] shadow-2xl p-10 md:p-14 text-white relative overflow-hidden flex flex-col justify-between">
            <div className="absolute top-0 right-0 w-64 h-64 bg-emerald-500/10 rounded-full blur-[80px] -mr-32 -mt-32" />
            
            <div className="relative z-10">
              <h2 className="text-2xl font-black tracking-tight mb-2">Ecosystem Split</h2>
              <p className="text-[10px] font-black text-slate-500 uppercase tracking-widest mb-10">Asset Allocation</p>
              
              <div className="h-[250px] w-full relative">
                <ResponsiveContainer width="100%" height="100%">
                  <PieChart>
                    <Pie
                      data={[
                        { name: 'Rides', value: analytics?.rideBookings || 0 },
                        { name: 'Tours', value: analytics?.tourBookings || 0 },
                      ]}
                      cx="50%"
                      cy="50%"
                      innerRadius={70}
                      outerRadius={90}
                      paddingAngle={8}
                      dataKey="value"
                    >
                      <Cell fill="#10b981" />
                      <Cell fill="#3b82f6" />
                    </Pie>
                    <Tooltip 
                      contentStyle={{borderRadius: '20px', border: 'none', backgroundColor: '#0f172a', color: '#fff'}}
                    />
                  </PieChart>
                </ResponsiveContainer>
                <div className="absolute inset-0 flex flex-col items-center justify-center pointer-events-none">
                  <p className="text-3xl font-black text-white">{analytics?.totalBookings || 0}</p>
                  <p className="text-[9px] font-black text-slate-500 uppercase tracking-widest">Total Nodes</p>
                </div>
              </div>
            </div>

            <div className="relative z-10 space-y-4">
              <div className="flex items-center justify-between p-4 bg-white/5 rounded-2xl border border-white/5">
                <div className="flex items-center gap-3">
                  <div className="w-2 h-2 rounded-full bg-emerald-500" />
                  <span className="text-xs font-bold text-slate-400">Direct Rides</span>
                </div>
                <span className="text-sm font-black">{analytics?.rideBookings || 0}</span>
              </div>
              <div className="flex items-center justify-between p-4 bg-white/5 rounded-2xl border border-white/5">
                <div className="flex items-center gap-3">
                  <div className="w-2 h-2 rounded-full bg-blue-500" />
                  <span className="text-xs font-bold text-slate-400">Curated Tours</span>
                </div>
                <span className="text-sm font-black">{analytics?.tourBookings || 0}</span>
              </div>
            </div>
          </div>
        </div>

        {/* Operational Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          <div className="lg:col-span-2 bg-white rounded-[3rem] shadow-sm border border-slate-100 overflow-hidden flex flex-col">
            <div className="p-10 md:p-12 border-b border-slate-50 flex items-center justify-between">
              <div>
                <h2 className="text-2xl font-black text-slate-900 tracking-tight">Recent Missions</h2>
                <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mt-1">Live Transaction Stream</p>
              </div>
              <Link to="/admin/rides" className="p-4 bg-slate-900 text-white rounded-2xl hover:bg-black transition-all">
                <ArrowUpRight size={20} />
              </Link>
            </div>
            
            <div className="overflow-x-auto flex-1">
              <table className="w-full text-left">
                <thead>
                  <tr className="bg-slate-50/50">
                    <th className="px-10 py-6 text-[10px] font-black uppercase tracking-widest text-slate-400">Identifier</th>
                    <th className="px-10 py-6 text-[10px] font-black uppercase tracking-widest text-slate-400">Operator</th>
                    <th className="px-10 py-6 text-[10px] font-black uppercase tracking-widest text-slate-400">Status</th>
                    <th className="px-10 py-6 text-[10px] font-black uppercase tracking-widest text-slate-400 text-right">Volume</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-50">
                  {analytics?.recentBookings?.slice(0, 6).map((ride) => (
                    <tr key={ride._id} className="hover:bg-slate-50/50 transition-colors">
                      <td className="px-10 py-6">
                        <p className="text-sm font-black text-slate-900 font-mono">#{ride.bookingId.slice(-8).toUpperCase()}</p>
                        <p className="text-[10px] font-bold text-slate-400 uppercase">{ride.rideType}</p>
                      </td>
                      <td className="px-10 py-6">
                        <p className="text-sm font-black text-slate-900">{ride.user?.firstName} {ride.user?.lastName}</p>
                        <p className="text-[10px] font-bold text-slate-400 uppercase">{ride.cabType}</p>
                      </td>
                      <td className="px-10 py-6">
                        <div className={`inline-flex items-center gap-2 px-4 py-2 rounded-xl text-[10px] font-black uppercase tracking-widest ${
                          ride.status === 'completed' ? 'bg-emerald-50 text-emerald-600' : 
                          ride.status === 'cancelled' ? 'bg-rose-50 text-rose-600' : 'bg-amber-50 text-amber-600'
                        }`}>
                          <div className={`w-1.5 h-1.5 rounded-full ${
                            ride.status === 'completed' ? 'bg-emerald-500' : 
                            ride.status === 'cancelled' ? 'bg-rose-500' : 'bg-amber-500'
                          }`} />
                          {ride.status}
                        </div>
                      </td>
                      <td className="px-10 py-6 text-right text-sm font-black text-slate-900">
                        ₹{ride.pricing?.totalFare?.toLocaleString() || 0}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>

          <div className="space-y-6">
            <div className="bg-white rounded-[2.5rem] p-10 border border-slate-100 shadow-sm">
              <h3 className="text-lg font-black text-slate-900 mb-8 tracking-tight uppercase tracking-widest text-[10px] text-slate-400">System Shortcuts</h3>
              <div className="grid grid-cols-2 gap-4">
                {[
                  { icon: ShieldCheck, label: 'Security', color: 'text-blue-500', bg: 'bg-blue-50', link: '/admin/settings' },
                  { icon: Globe, label: 'Regional', color: 'text-emerald-500', bg: 'bg-emerald-50', link: '/admin/pricing' },
                  { icon: Layers, label: 'Assets', color: 'text-violet-500', bg: 'bg-violet-50', link: '/admin/packages' },
                  { icon: Bell, label: 'Alerts', color: 'text-amber-500', bg: 'bg-amber-50', link: '/admin/feedback' }
                ].map((item, idx) => (
                  <Link key={idx} to={item.link} className="flex flex-col items-center justify-center p-6 bg-slate-50 rounded-3xl hover:bg-slate-100 transition-all group">
                    <div className={`p-4 ${item.bg} ${item.color} rounded-2xl mb-3 group-hover:scale-110 transition-transform`}>
                      <item.icon size={20} />
                    </div>
                    <span className="text-[10px] font-black text-slate-900 uppercase tracking-widest">{item.label}</span>
                  </Link>
                ))}
              </div>
            </div>

            <div className="bg-gradient-to-br from-indigo-600 to-violet-700 rounded-[2.5rem] p-10 text-white shadow-2xl relative overflow-hidden group">
              <div className="absolute top-0 right-0 w-32 h-32 bg-white/10 rounded-full blur-3xl -mr-16 -mt-16" />
              <div className="relative z-10">
                <Zap size={32} className="text-emerald-400 mb-6" />
                <h3 className="text-2xl font-black mb-2 tracking-tight">Active Enquiries</h3>
                <p className="text-indigo-100 text-sm font-medium mb-8 leading-relaxed opacity-80">There are {analytics?.chargingEnquiries || 0} pending charging station enquiries requiring administrative review.</p>
                <Link to="/admin/charging-bookings" className="inline-flex items-center gap-2 px-8 py-4 bg-white text-indigo-600 rounded-2xl font-black text-xs uppercase tracking-widest hover:shadow-2xl transition-all">
                  Process Queue
                  <ArrowRight size={16} />
                </Link>
              </div>
            </div>
          </div>
        </div>
      </div>
    </AdminLayout>
  );
};

export default DashboardPage;
