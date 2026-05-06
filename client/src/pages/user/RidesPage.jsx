import { useState, useEffect, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import {
  MapPin,
  Calendar,
  Clock,
  Filter,
  Search,
  X,
  Car,
  ArrowRight,
  CreditCard,
  CheckCircle,
  AlertCircle,
  ChevronRight,
  Zap,
  Leaf,
  Navigation,
  ArrowUpRight,
  MoreHorizontal
} from 'lucide-react';
import UserLayout from './UserLayout.jsx';
import * as bookingService from '../../services/bookingService.js';
import { useAuth } from '../../context/AuthContext.jsx';
import { ridePaymentService } from '../../services/ridePaymentService.js';
import { toast } from 'react-hot-toast';

export default function RidesPage() {
  const { user } = useAuth();
  const [bookings, setBookings] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [filterStatus, setFilterStatus] = useState('all');
  const [searchTerm, setSearchTerm] = useState('');
  const [showCancelModal, setShowCancelModal] = useState(false);
  const [selectedRideForCancel, setSelectedRideForCancel] = useState(null);
  const [cancelReason, setCancelReason] = useState('');
  const [cancelling, setCancelling] = useState(false);
  const [driverApp, setDriverApp] = useState(null);
  const navigate = useNavigate();

  const handlePayAdvance = async (ride) => {
    try {
      if (!user) {
        toast.error('Session expired. Please login again.');
        return;
      }

      toast.loading('Initiating secure payment...', { id: 'payment' });

      const paymentParams = {
        bookingId: ride.bookingId,
        _id: ride._id,
        amount: Math.round(ride.totalFare * 0.2),
        user: {
          name: user.name || `${user.firstName} ${user.lastName}`,
          email: user.email,
          phone: user.phone
        }
      };

      await ridePaymentService.initiateRazorpayPayment(
        paymentParams,
        (response) => {
          toast.success('Advance payment successful!', { id: 'payment' });
          loadRides();
        },
        (error) => {
          toast.error(error || 'Payment failed.', { id: 'payment' });
        }
      );
    } catch (err) {
      toast.error('Something went wrong.', { id: 'payment' });
    }
  };

  useEffect(() => {
    loadRides();
    fetchDriverStatus();
  }, []);

  const fetchDriverStatus = async () => {
    try {
      const response = await fetch(`${import.meta.env.VITE_API_BASE_URL || '/api'}/partners/driver/status`, {
        headers: { Authorization: `Bearer ${localStorage.getItem('token')}` }
      });
      const data = await response.json();
      if (data.success) setDriverApp(data.data);
    } catch (err) {
      console.error('Error fetching driver status:', err);
    }
  };

  const loadRides = async () => {
    try {
      setLoading(true);
      const response = await bookingService.getMyBookings?.();
      if (response?.success) {
        const rides = response.data?.bookings || response.data || [];
        setBookings(Array.isArray(rides) ? rides : []);
      }
    } catch (err) {
      setError('System synchronization failed');
    } finally {
      setLoading(false);
    }
  };

  const filteredBookings = useMemo(() => {
    let filtered = bookings;
    if (filterStatus !== 'all') {
      filtered = filtered.filter(b => b.status?.toLowerCase() === filterStatus.toLowerCase());
    }
    if (searchTerm) {
      const query = searchTerm.toLowerCase();
      filtered = filtered.filter(b => 
        (b.pickupLocation?.address || b.pickupLocation || '').toString().toLowerCase().includes(query) ||
        (b.dropLocation?.address || b.dropLocation || '').toString().toLowerCase().includes(query) ||
        b.bookingId?.toLowerCase().includes(query)
      );
    }
    return filtered;
  }, [bookings, filterStatus, searchTerm]);

  const getLocationString = (location) => {
    if (!location) return 'Not Specified';
    if (typeof location === 'string') return location;
    return location.address || location.name || 'Not Specified';
  };

  const statsData = {
    total: bookings.length,
    distance: bookings.reduce((acc, b) => acc + (parseFloat(b.distance) || 0), 0).toFixed(1),
    co2: (bookings.reduce((acc, b) => acc + (parseFloat(b.distance) || 0), 0) * 0.12).toFixed(1)
  };

  const handleCancelRide = async () => {
    if (!cancelReason.trim()) return;
    setCancelling(true);
    try {
      const response = await fetch(`${import.meta.env.VITE_API_BASE_URL || '/api'}/bookings/${selectedRideForCancel._id}/cancel`, {
        method: 'PUT',
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('token')}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ reason: cancelReason })
      });
      const data = await response.json();
      if (data.success) {
        setShowCancelModal(false);
        loadRides();
      }
    } catch (err) {
      console.error(err);
    } finally {
      setCancelling(false);
    }
  };

  if (loading) {
    return (
      <UserLayout>
        <div className="flex flex-col items-center justify-center h-[60vh]">
          <motion.div
            animate={{ rotate: 360 }}
            transition={{ duration: 1, repeat: Infinity, ease: 'linear' }}
            className="w-12 h-12 border-4 border-emerald-500 border-t-transparent rounded-full mb-4"
          />
          <p className="text-slate-500 font-black text-[10px] uppercase tracking-widest animate-pulse">Syncing Cloud Node...</p>
        </div>
      </UserLayout>
    );
  }

  return (
    <UserLayout>
      <div className="max-w-[1400px] mx-auto space-y-12">
        {/* Partner Ecosystem Banner */}
        <AnimatePresence>
          {driverApp && (
            <motion.div
              initial={{ opacity: 0, y: -20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              className="relative"
            >
              {(driverApp.status === 'approved' || driverApp.status === 'active') ? (
                <div className="bg-emerald-600 rounded-[3rem] p-10 text-white shadow-2xl relative overflow-hidden group">
                  <div className="absolute top-0 right-0 w-80 h-80 bg-white/10 rounded-full -translate-y-1/2 translate-x-1/2 blur-3xl group-hover:scale-110 transition-transform duration-700" />
                  <div className="relative z-10 flex flex-col md:flex-row items-center justify-between gap-8">
                    <div className="flex items-center gap-8">
                      <div className="w-20 h-20 bg-white/20 backdrop-blur-md rounded-[2rem] flex items-center justify-center shadow-inner transform -rotate-6">
                        <CheckCircle size={36} className="text-white" />
                      </div>
                      <div>
                        <div className="flex items-center gap-3 mb-2">
                          <h2 className="text-3xl font-black tracking-tight">Partner Status: Active</h2>
                          <span className="px-3 py-1 bg-white/20 backdrop-blur-sm rounded-full text-[10px] font-black uppercase tracking-widest">Verified</span>
                        </div>
                        <p className="text-emerald-50 text-sm font-medium max-w-lg leading-relaxed opacity-90">
                          Your driver profile is fully synchronized. You are now authorized to accept missions within the GoElectriQ EV ecosystem.
                        </p>
                      </div>
                    </div>
                    <button
                      onClick={() => navigate('/user/application-status')}
                      className="px-10 py-5 bg-white text-emerald-600 rounded-2xl font-black text-sm hover:shadow-2xl transition-all active:scale-95 whitespace-nowrap"
                    >
                      Enter Driver Dashboard
                    </button>
                  </div>
                </div>
              ) : driverApp.status === 'pending' && (
                <div className="bg-blue-600 rounded-[3rem] p-10 text-white shadow-2xl relative overflow-hidden group">
                  <div className="relative z-10 flex flex-col md:flex-row items-center justify-between gap-8">
                    <div className="flex items-center gap-8">
                      <div className="w-20 h-20 bg-white/20 backdrop-blur-md rounded-[2rem] flex items-center justify-center shadow-inner animate-pulse">
                        <Zap size={36} className="text-white" />
                      </div>
                      <div>
                        <div className="flex items-center gap-3 mb-2">
                          <h2 className="text-3xl font-black tracking-tight">Profile Under Review</h2>
                        </div>
                        <p className="text-blue-50 text-sm font-medium max-w-lg leading-relaxed opacity-90">
                          Our verification engine is currently validating your credentials. Expected synchronization completion within 24-48 hours.
                        </p>
                      </div>
                    </div>
                    <button
                      onClick={() => navigate('/user/application-status')}
                      className="px-10 py-5 bg-white text-blue-600 rounded-2xl font-black text-sm hover:shadow-2xl transition-all whitespace-nowrap"
                    >
                      Monitor Progress
                    </button>
                  </div>
                </div>
              )}
            </motion.div>
          )}
        </AnimatePresence>

        {/* Dynamic Stats Header */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-stretch">
          <div className="lg:col-span-8 bg-white rounded-[3rem] p-10 md:p-14 shadow-xl border border-slate-100 relative overflow-hidden group">
            <div className="absolute top-0 right-0 w-1/2 h-full bg-gradient-to-l from-emerald-500/5 to-transparent pointer-events-none" />
            <div className="relative z-10">
              <h1 className="text-5xl md:text-6xl font-black tracking-tighter text-slate-900 mb-6">
                Travel <span className="text-emerald-500">Log</span>
              </h1>
              <p className="text-slate-500 text-lg max-w-md font-medium leading-relaxed mb-8">
                Visualizing your commitment to sustainable mobility. Every kilometer tracks your contribution to a greener Jaipur.
              </p>
              <div className="flex gap-4">
                <button 
                  onClick={() => navigate('/airport-ride')}
                  className="px-8 py-4 bg-slate-900 text-white rounded-2xl font-black text-sm hover:bg-black transition-all flex items-center gap-2 group/btn"
                >
                  Initiate New Journey
                  <ArrowRight size={18} className="group-hover/btn:translate-x-1 transition-transform" />
                </button>
              </div>
            </div>
          </div>

          <div className="lg:col-span-4 grid grid-cols-1 gap-6">
            <div className="bg-emerald-50 rounded-[2.5rem] p-8 border border-emerald-100 flex flex-col justify-between">
              <div className="flex justify-between items-start">
                <div className="p-3 bg-white rounded-2xl shadow-sm text-emerald-600">
                  <Leaf size={24} />
                </div>
                <span className="text-[10px] font-black text-emerald-600 uppercase tracking-widest">Impact Metric</span>
              </div>
              <div>
                <p className="text-4xl font-black text-slate-900">{statsData.co2}kg</p>
                <p className="text-xs font-bold text-slate-500 uppercase tracking-tight mt-1">Net CO2 Offset</p>
              </div>
            </div>
            <div className="bg-slate-900 rounded-[2.5rem] p-8 text-white flex flex-col justify-between">
              <div className="flex justify-between items-start">
                <div className="p-3 bg-white/10 rounded-2xl backdrop-blur-md text-emerald-400">
                  <Navigation size={24} />
                </div>
                <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Global Matrix</span>
              </div>
              <div>
                <p className="text-4xl font-black text-white">{statsData.distance}km</p>
                <p className="text-xs font-bold text-slate-400 uppercase tracking-tight mt-1">Accumulated Distance</p>
              </div>
            </div>
          </div>
        </div>

        {/* Navigation & Controls */}
        <div className="flex flex-col md:flex-row gap-6 items-center justify-between bg-white/50 backdrop-blur-md p-6 rounded-[2.5rem] shadow-sm border border-slate-100">
          <div className="flex flex-wrap gap-2">
            {['all', 'confirmed', 'completed', 'cancelled'].map((status) => (
              <button
                key={status}
                onClick={() => setFilterStatus(status)}
                className={`px-8 py-3 rounded-2xl text-xs font-black transition-all duration-500 uppercase tracking-widest ${filterStatus === status
                  ? 'bg-slate-900 text-white shadow-2xl scale-105'
                  : 'text-slate-500 hover:bg-slate-200/50 hover:text-slate-900'
                  }`}
              >
                {status}
              </button>
            ))}
          </div>

          <div className="relative w-full md:w-96 group">
            <Search size={18} className="absolute left-6 top-1/2 -translate-y-1/2 text-slate-400 group-focus-within:text-emerald-500 transition-colors" />
            <input
              type="text"
              placeholder="Search history node..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-14 pr-8 py-4 bg-white rounded-2xl border-none focus:ring-2 focus:ring-emerald-500 text-sm font-bold shadow-sm transition-all"
            />
          </div>
        </div>

        {/* Journeys Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-8">
          <AnimatePresence mode='popLayout'>
            {filteredBookings.map((ride, idx) => {
              const isPendingPayment = ride.paymentStatus === 'pending';
              const statusColor = ride.status === 'completed' ? 'text-emerald-500 bg-emerald-50' : 
                               ride.status === 'cancelled' ? 'text-rose-500 bg-rose-50' : 
                               'text-amber-500 bg-amber-50';
              return (
                <motion.div
                  key={ride._id}
                  layout
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, scale: 0.95 }}
                  transition={{ delay: idx * 0.05 }}
                  className="group bg-white rounded-[3rem] border border-slate-100 overflow-hidden hover:shadow-[0_32px_64px_-16px_rgba(0,0,0,0.1)] transition-all duration-700 flex flex-col"
                >
                  <div className="p-10 flex-1">
                    <div className="flex justify-between items-start mb-10">
                      <div className="flex items-center gap-3">
                        <div className="w-12 h-12 bg-slate-50 rounded-2xl flex items-center justify-center text-slate-900 shadow-inner">
                          <Car size={24} />
                        </div>
                        <div>
                          <p className="text-[9px] font-black text-slate-400 uppercase tracking-widest mb-0.5">Reference</p>
                          <p className="text-sm font-black text-slate-900 tracking-tight">{ride.bookingId}</p>
                        </div>
                      </div>
                      <div className={`px-4 py-2 rounded-xl text-[10px] font-black uppercase tracking-widest ${statusColor}`}>
                        {ride.status}
                      </div>
                    </div>

                    <div className="space-y-8 mb-10">
                      <div className="flex gap-6">
                        <div className="flex flex-col items-center gap-2 pt-1.5">
                          <div className="w-3 h-3 rounded-full border-[3px] border-emerald-500 bg-white" />
                          <div className="w-0.5 flex-1 bg-slate-100 min-h-[40px] rounded-full" />
                          <div className="w-3 h-3 rounded-full bg-emerald-500 shadow-lg shadow-emerald-500/50" />
                        </div>
                        <div className="flex-1 space-y-6">
                          <div>
                            <p className="text-[9px] font-black text-slate-400 uppercase tracking-widest mb-1">Departure</p>
                            <p className="text-sm font-black text-slate-800 line-clamp-1">{getLocationString(ride.pickupLocation)}</p>
                          </div>
                          <div>
                            <p className="text-[9px] font-black text-slate-400 uppercase tracking-widest mb-1">Arrival</p>
                            <p className="text-sm font-black text-slate-800 line-clamp-1">{getLocationString(ride.dropLocation)}</p>
                          </div>
                        </div>
                      </div>

                      <div className="grid grid-cols-2 gap-4">
                        <div className="bg-slate-50 p-5 rounded-[2rem] border border-slate-100/50">
                          <p className="text-[9px] font-black text-slate-400 uppercase tracking-widest mb-2">Schedule</p>
                          <div className="flex items-center gap-2">
                            <Calendar size={14} className="text-emerald-500" />
                            <p className="text-xs font-black text-slate-700">{new Date(ride.scheduledDate || ride.createdAt).toLocaleDateString('en-IN', { day: '2-digit', month: 'short' })}</p>
                          </div>
                        </div>
                        <div className="bg-slate-50 p-5 rounded-[2rem] border border-slate-100/50">
                          <p className="text-[9px] font-black text-slate-400 uppercase tracking-widest mb-2">Volume</p>
                          <div className="flex items-center gap-2">
                            <Zap size={14} className="text-emerald-500" />
                            <p className="text-xs font-black text-slate-700">₹{ride.pricing?.totalFare || ride.totalFare || 0}</p>
                          </div>
                        </div>
                      </div>
                    </div>

                    <div className="flex items-center justify-between border-t border-slate-50 pt-8">
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-xl bg-slate-50 flex items-center justify-center text-slate-400">
                          <MoreHorizontal size={20} />
                        </div>
                        <div>
                          <p className="text-[9px] font-black text-slate-400 uppercase tracking-widest mb-0.5">Category</p>
                          <p className="text-[10px] font-black text-slate-900 uppercase tracking-tighter">{ride.rideType || 'Standard'}</p>
                        </div>
                      </div>

                      <div className="flex gap-2">
                        {isPendingPayment && ride.status !== 'cancelled' ? (
                          <button
                            onClick={() => handlePayAdvance(ride)}
                            className="px-6 py-3.5 bg-emerald-500 text-white rounded-2xl text-[10px] font-black uppercase tracking-widest hover:bg-emerald-600 transition-all shadow-lg active:scale-95 flex items-center gap-2"
                          >
                            <CreditCard size={14} />
                            Settlement
                          </button>
                        ) : (
                          <button
                            onClick={() => navigate(`/user/booking-confirmation?id=${ride._id}`)}
                            className="px-6 py-3.5 bg-slate-900 text-white rounded-2xl text-[10px] font-black uppercase tracking-widest hover:bg-black transition-all shadow-xl active:scale-95 flex items-center gap-2"
                          >
                            Analysis
                            <ArrowUpRight size={14} />
                          </button>
                        )}
                      </div>
                    </div>
                  </div>
                </motion.div>
              );
            })}
          </AnimatePresence>
        </div>

        {/* Empty State Logic */}
        {filteredBookings.length === 0 && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="py-32 text-center"
          >
            <div className="w-32 h-32 bg-slate-50 rounded-full flex items-center justify-center mx-auto mb-8 text-slate-200">
              <Navigation size={64} />
            </div>
            <h3 className="text-3xl font-black text-slate-900 mb-4">No Historical Data</h3>
            <p className="text-slate-500 font-medium max-w-sm mx-auto">Your journey log is currently empty. Initiate your first carbon-neutral mission today.</p>
            <button 
              onClick={() => navigate('/airport-ride')}
              className="mt-8 px-10 py-5 bg-emerald-500 text-white rounded-2xl font-black text-sm hover:bg-emerald-600 transition-all shadow-2xl"
            >
              Start Your First Journey
            </button>
          </motion.div>
        )}
      </div>

      {/* Premium Cancellation Dialog */}
      <AnimatePresence>
        {showCancelModal && selectedRideForCancel && (
          <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setShowCancelModal(false)}
              className="absolute inset-0 bg-slate-900/80 backdrop-blur-md"
            />
            <motion.div
              initial={{ opacity: 0, scale: 0.9, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.9, y: 20 }}
              className="relative bg-white w-full max-w-lg rounded-[3.5rem] shadow-2xl overflow-hidden border border-slate-100"
            >
              <div className="p-14 text-center">
                <div className="w-24 h-24 bg-rose-50 text-rose-500 rounded-[2.5rem] flex items-center justify-center mx-auto mb-10 shadow-inner">
                  <AlertCircle size={48} />
                </div>
                <h2 className="text-4xl font-black text-slate-900 mb-6 tracking-tight">Abort Journey?</h2>
                <p className="text-slate-500 font-medium mb-10 leading-relaxed">This operation will terminate the reservation protocol. Please specify the reason for record-keeping.</p>

                <textarea
                  value={cancelReason}
                  onChange={(e) => setCancelReason(e.target.value)}
                  placeholder="Operational reason for cancellation..."
                  className="w-full p-8 bg-slate-50 rounded-[2rem] border-none focus:ring-2 focus:ring-rose-500 text-sm font-bold mb-10 min-h-[120px] resize-none"
                />

                <div className="flex gap-4">
                  <button
                    onClick={() => setShowCancelModal(false)}
                    className="flex-1 py-5 bg-slate-100 text-slate-600 rounded-2xl font-black text-sm hover:bg-slate-200 transition-all"
                  >
                    Discard
                  </button>
                  <button
                    onClick={handleCancelRide}
                    disabled={cancelling || !cancelReason.trim()}
                    className="flex-1 py-5 bg-rose-500 text-white rounded-2xl font-black text-sm shadow-2xl hover:bg-rose-600 active:scale-95 transition-all disabled:opacity-50"
                  >
                    {cancelling ? 'Processing...' : 'Confirm Abortion'}
                  </button>
                </div>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </UserLayout>
  );
}
