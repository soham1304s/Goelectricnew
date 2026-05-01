import { useState, useEffect } from 'react';
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
  MoreVertical
} from 'lucide-react';
import UserLayout from './UserLayout.jsx';
import * as bookingService from '../../services/bookingService.js';
import { useAuth } from '../../context/AuthContext.jsx';
import { ridePaymentService } from '../../services/ridePaymentService.js';
import { toast } from 'react-hot-toast';

export default function RidesPage() {
  const { user } = useAuth();
  const [bookings, setBookings] = useState([]);
  const [filteredBookings, setFilteredBookings] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [filterStatus, setFilterStatus] = useState('all');
  const [searchTerm, setSearchTerm] = useState('');
  const [showCancelModal, setShowCancelModal] = useState(false);
  const [selectedRideForCancel, setSelectedRideForCancel] = useState(null);
  const [cancelReason, setCancelReason] = useState('');
  const [cancelling, setCancelling] = useState(false);
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
        amount: Math.round(ride.totalFare * 0.2), // 20% advance
        user: {
          name: user.name || `${user.firstName} ${user.lastName}`,
          email: user.email,
          phone: user.phone
        }
      };

      await ridePaymentService.initiateRazorpayPayment(
        paymentParams,
        (response) => {
          toast.success('Advance payment successful! Your ride is confirmed.', { id: 'payment' });
          loadRides(); // Refresh the list
        },
        (error) => {
          toast.error(error || 'Payment failed. Please try again.', { id: 'payment' });
        }
      );
    } catch (err) {
      toast.error('Something went wrong. Please try again.', { id: 'payment' });
    }
  };

  useEffect(() => {
    loadRides();
  }, []);

  const loadRides = async () => {
    try {
      setLoading(true);
      const response = await bookingService.getMyBookings?.();
      if (response?.success) {
        const rides = response.data?.bookings || response.data || [];
        setBookings(Array.isArray(rides) ? rides : []);
        filterRides(Array.isArray(rides) ? rides : [], 'all', '');
      }
    } catch (err) {
      setError('Failed to sync ride data with the server');
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const filterRides = (ridesData, status, search) => {
    let filtered = ridesData;

    // Show all rides regardless of initial payment status to allow recovery
    // filtered = filtered.filter(b => has20PercentPaid(b));

    if (status !== 'all') {
      filtered = filtered.filter(b => b.status?.toLowerCase() === status.toLowerCase());
    }

    if (search) {
      filtered = filtered.filter(b => {
        const pickup = getLocationString(b.pickupLocation);
        const drop = getLocationString(b.dropLocation);
        return pickup.toLowerCase().includes(search.toLowerCase()) || drop.toLowerCase().includes(search.toLowerCase());
      });
    }

    setFilteredBookings(filtered);
  };

  const handleFilterChange = (status) => {
    setFilterStatus(status);
    filterRides(bookings, status, searchTerm);
  };

  const handleSearchChange = (search) => {
    setSearchTerm(search);
    filterRides(bookings, filterStatus, search);
  };

  const getLocationString = (location) => {
    if (!location) return 'Not Specified';
    if (typeof location === 'string') return location;
    return location.address || location.name || 'Not Specified';
  };

  const formatDate = (date) => {
    return new Date(date).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });
  };

  const formatTime = (date) => {
    return new Date(date).toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' });
  };

  const getStatusConfig = (status) => {
    switch (status?.toLowerCase()) {
      case 'completed':
        return { color: 'text-emerald-500', bg: 'bg-emerald-500/10', icon: CheckCircle, label: 'Completed' };
      case 'ongoing':
        return { color: 'text-indigo-500', bg: 'bg-indigo-500/10', icon: Clock, label: 'On Journey' };
      case 'cancelled':
        return { color: 'text-rose-500', bg: 'bg-rose-500/10', icon: X, label: 'Cancelled' };
      case 'confirmed':
        return { color: 'text-amber-500', bg: 'bg-amber-500/10', icon: CheckCircle, label: 'Confirmed' };
      default:
        return { color: 'text-slate-500', bg: 'bg-slate-500/10', icon: AlertCircle, label: 'Processing' };
    }
  };

  const has20PercentPaid = (ride) => {
    const totalFare = ride.pricing?.totalFare || ride.totalFare || 0;
    const paidAmount = ride.paidAmount || ride.pricing?.paidAmount || 0;
    return totalFare > 0 && paidAmount >= (totalFare * 0.2);
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

  // Statistics calculation
  const statsData = {
    total: bookings.length,
    distance: bookings.reduce((acc, b) => acc + (parseFloat(b.distance) || 0), 0).toFixed(1),
    co2: (bookings.reduce((acc, b) => acc + (parseFloat(b.distance) || 0), 0) * 0.12).toFixed(1) // 0.12kg per km saved
  };

  if (loading) {
    return (
      <UserLayout>
        <div className="flex flex-col items-center justify-center h-[60vh]">
          <motion.div
            animate={{ rotate: 360 }}
            transition={{ duration: 1, repeat: Infinity, ease: 'linear' }}
            className="w-12 h-12 border-4 border-indigo-500 border-t-transparent rounded-full mb-4"
          />
          <p className="text-slate-500 font-medium animate-pulse">Synchronizing your journeys...</p>
        </div>
      </UserLayout>
    );
  }

  return (
    <UserLayout>
      <div className="max-w-7xl mx-auto space-y-10">
        {/* Premium Header Section */}
        <div className="relative mb-12 rounded-[2.5rem] overflow-hidden bg-slate-900 text-white p-8 md:p-12 shadow-2xl">
          <div className="absolute top-0 right-0 w-1/2 h-full bg-gradient-to-l from-emerald-500/20 to-transparent pointer-events-none" />
          <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-8">
            <div>
              <h1 className="text-4xl md:text-5xl font-black tracking-tight mb-4">
                My <span className="text-emerald-400">Journeys</span>
              </h1>
              <p className="text-slate-400 text-lg max-w-md font-medium leading-relaxed">
                Track your carbon-neutral travels and manage your upcoming reservations.
              </p>
            </div>
            
            <div className="grid grid-cols-2 md:grid-cols-3 gap-4 md:gap-8">
              <div className="bg-white/5 backdrop-blur-md border border-white/10 rounded-3xl p-6 text-center">
                <p className="text-emerald-400 text-2xl font-black mb-1">{statsData.total}</p>
                <p className="text-slate-400 text-[10px] uppercase font-bold tracking-widest">Total Rides</p>
              </div>
              <div className="bg-white/5 backdrop-blur-md border border-white/10 rounded-3xl p-6 text-center">
                <p className="text-indigo-400 text-2xl font-black mb-1">{statsData.distance}km</p>
                <p className="text-slate-400 text-[10px] uppercase font-bold tracking-widest">Distance</p>
              </div>
              <div className="bg-white/5 backdrop-blur-md border border-white/10 rounded-3xl p-6 text-center hidden md:block">
                <p className="text-rose-400 text-2xl font-black mb-1">{statsData.co2}kg</p>
                <p className="text-slate-400 text-[10px] uppercase font-bold tracking-widest">CO2 Saved</p>
              </div>
            </div>
          </div>
        </div>

        {error && (
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            className="bg-rose-50 dark:bg-rose-900/20 border border-rose-200 dark:border-rose-800 p-4 rounded-2xl flex items-center gap-4 text-rose-600 dark:text-rose-400"
          >
            <AlertCircle size={20} />
            <p className="font-bold text-sm">{error}</p>
          </motion.div>
        )}

        {/* Controls Section */}
        <div className="flex flex-col md:flex-row gap-6 mb-10 items-center justify-between bg-white dark:bg-slate-900 p-6 rounded-[2rem] shadow-sm border border-slate-100 dark:border-slate-800">
          <div className="flex flex-wrap gap-2">
            {['all', 'pending', 'confirmed', 'completed', 'cancelled'].map((status) => (
              <button
                key={status}
                onClick={() => handleFilterChange(status)}
                className={`px-6 py-2.5 rounded-full text-sm font-bold transition-all duration-300 ${
                  filterStatus === status
                    ? 'bg-slate-900 dark:bg-white text-white dark:text-slate-900 shadow-lg scale-105'
                    : 'text-slate-500 hover:bg-slate-100 dark:hover:bg-slate-800'
                }`}
              >
                {status.charAt(0).toUpperCase() + status.slice(1)}
              </button>
            ))}
          </div>

          <div className="relative w-full md:w-80 group">
            <Search size={18} className="absolute left-5 top-1/2 -translate-y-1/2 text-slate-400 group-focus-within:text-indigo-500 transition-colors" />
            <input
              type="text"
              placeholder="Search destinations..."
              value={searchTerm}
              onChange={(e) => handleSearchChange(e.target.value)}
              className="w-full pl-12 pr-6 py-3 bg-slate-50 dark:bg-slate-800/50 rounded-2xl border-none focus:ring-2 focus:ring-indigo-500 text-sm font-medium transition-all"
            />
          </div>
        </div>

        {/* Rides Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          <AnimatePresence mode='popLayout'>
            {filteredBookings.length === 0 ? (
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                className="col-span-full py-20 text-center"
              >
                <div className="w-24 h-24 bg-slate-100 dark:bg-slate-800 rounded-full flex items-center justify-center mx-auto mb-6 text-slate-300">
                  <Car size={40} />
                </div>
                <h3 className="text-2xl font-bold text-slate-800 dark:text-white mb-2">No Journeys Found</h3>
                <p className="text-slate-500 font-medium">Try adjusting your filters or book a new ride.</p>
              </motion.div>
            ) : (
              filteredBookings.map((ride, idx) => {
                const isPendingPayment = ride.paymentStatus === 'pending';
                return (
                  <motion.div
                    key={ride._id}
                    layout
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, scale: 0.95 }}
                    transition={{ delay: idx * 0.05 }}
                    className="group bg-white dark:bg-slate-900 rounded-[2.5rem] border border-slate-100 dark:border-slate-800 overflow-hidden hover:shadow-2xl hover:-translate-y-2 transition-all duration-500"
                  >
                    <div className="p-8">
                      <div className="flex justify-between items-start mb-8">
                        <div>
                          <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1">Booking ID</p>
                          <p className="text-sm font-bold text-slate-900 dark:text-white font-mono">{ride.bookingId}</p>
                        </div>
                        <div className={`px-4 py-1.5 rounded-full text-[10px] font-black uppercase tracking-widest ${
                          ride.status === 'completed' ? 'bg-emerald-100 text-emerald-600' :
                          ride.status === 'cancelled' ? 'bg-rose-100 text-rose-600' :
                          'bg-indigo-100 text-indigo-600'
                        }`}>
                          {ride.status}
                        </div>
                      </div>

                      <div className="space-y-6 mb-8">
                        <div className="flex gap-4">
                          <div className="flex flex-col items-center gap-1 pt-1">
                            <div className="w-2.5 h-2.5 rounded-full border-2 border-emerald-500" />
                            <div className="w-0.5 h-10 bg-slate-100 dark:bg-slate-800" />
                            <div className="w-2.5 h-2.5 rounded-full bg-indigo-500 shadow-lg shadow-indigo-500/50" />
                          </div>
                          <div className="flex-1 flex flex-col justify-between py-0.5">
                            <div className="line-clamp-1">
                              <p className="text-[10px] font-bold text-slate-400 uppercase mb-0.5">Pickup</p>
                              <p className="text-sm font-bold text-slate-800 dark:text-white">{getLocationString(ride.pickupLocation)}</p>
                            </div>
                            <div className="line-clamp-1">
                              <p className="text-[10px] font-bold text-slate-400 uppercase mb-0.5">Destination</p>
                              <p className="text-sm font-bold text-slate-800 dark:text-white">{getLocationString(ride.dropLocation)}</p>
                            </div>
                          </div>
                        </div>

                        <div className="grid grid-cols-2 gap-3">
                          <div className="bg-slate-50 dark:bg-slate-800/50 p-4 rounded-3xl">
                            <p className="text-[10px] font-bold text-slate-400 uppercase mb-1">Date</p>
                            <div className="flex items-center gap-2">
                              <Calendar size={12} className="text-indigo-500" />
                              <p className="text-xs font-black text-slate-700 dark:text-slate-200">{formatDate(ride.scheduledDate || ride.createdAt)}</p>
                            </div>
                          </div>
                          <div className="bg-slate-50 dark:bg-slate-800/50 p-4 rounded-3xl text-right">
                            <p className="text-[10px] font-bold text-slate-400 uppercase mb-1">Fare</p>
                            <p className="text-sm font-black text-slate-900 dark:text-white">₹{ride.pricing?.totalFare || ride.totalFare || 0}</p>
                          </div>
                        </div>
                      </div>

                      <div className="flex items-center justify-between border-t border-slate-100 dark:border-slate-800 pt-6">
                        <div className="flex items-center gap-3">
                          <div className="w-10 h-10 rounded-2xl bg-indigo-50 dark:bg-indigo-900/30 flex items-center justify-center text-indigo-600">
                            <Car size={20} />
                          </div>
                          <div>
                            <p className="text-[10px] font-bold text-slate-400 uppercase tracking-tighter">Vehicle</p>
                            <p className="text-xs font-black text-slate-700 dark:text-slate-200">{ride.cabType || 'Electric Sedan'}</p>
                          </div>
                        </div>

                        <div className="flex gap-2">
                          {isPendingPayment && ride.status !== 'cancelled' ? (
                            <button
                              onClick={() => handlePayAdvance(ride)}
                              className="px-6 py-3 bg-emerald-500 text-white rounded-2xl text-xs font-black hover:scale-105 active:scale-95 transition-all shadow-lg shadow-emerald-500/30 flex items-center gap-2"
                            >
                              <CreditCard size={14} />
                              Pay Now
                            </button>
                          ) : (
                            <button
                              onClick={() => navigate(`/user/booking-confirmation?id=${ride._id}`)}
                              className="px-6 py-3 bg-slate-900 dark:bg-white text-white dark:text-slate-900 rounded-2xl text-xs font-black hover:scale-105 active:scale-95 transition-all shadow-xl"
                            >
                              Details
                            </button>
                          )}
                        </div>
                      </div>
                    </div>
                  </motion.div>
                );
              })
            )}
          </AnimatePresence>
        </div>
      </div>

      {/* Modern Cancel Modal */}
      <AnimatePresence>
        {showCancelModal && selectedRideForCancel && (
          <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setShowCancelModal(false)}
              className="absolute inset-0 bg-slate-900/60 backdrop-blur-sm"
            />
            <motion.div
              initial={{ opacity: 0, scale: 0.9, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.9, y: 20 }}
              className="relative bg-white dark:bg-slate-900 w-full max-w-lg rounded-[3rem] shadow-2xl overflow-hidden border border-slate-200 dark:border-slate-800"
            >
              <div className="p-10 text-center">
                <div className="w-20 h-20 bg-rose-100 dark:bg-rose-900/30 text-rose-500 rounded-full flex items-center justify-center mx-auto mb-8 shadow-inner">
                  <AlertCircle size={40} />
                </div>
                <h2 className="text-3xl font-black text-slate-900 dark:text-white mb-4">Cancel Journey?</h2>
                <p className="text-slate-500 font-medium mb-8">This action cannot be undone. Please provide a reason for cancellation below.</p>

                <textarea
                  value={cancelReason}
                  onChange={(e) => setCancelReason(e.target.value)}
                  placeholder="Reason for cancellation..."
                  className="w-full p-6 bg-slate-50 dark:bg-slate-800 rounded-3xl border-none focus:ring-2 focus:ring-rose-500 text-sm font-medium mb-8"
                  rows="3"
                />

                <div className="flex gap-4">
                  <button
                    onClick={() => setShowCancelModal(false)}
                    className="flex-1 py-4 bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 rounded-2xl font-bold hover:bg-slate-200 transition-colors"
                  >
                    No, Go Back
                  </button>
                  <button
                    onClick={handleCancelRide}
                    disabled={cancelling || !cancelReason.trim()}
                    className="flex-1 py-4 bg-rose-500 text-white rounded-2xl font-bold shadow-lg shadow-rose-500/30 hover:scale-105 active:scale-95 transition-all disabled:opacity-50"
                  >
                    {cancelling ? 'Processing...' : 'Confirm Cancel'}
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
