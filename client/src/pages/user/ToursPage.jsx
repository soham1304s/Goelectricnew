import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  Plane, 
  Calendar, 
  MapPin, 
  Users, 
  Filter, 
  Search, 
  XCircle, 
  Check, 
  AlertCircle,
  Clock,
  ArrowRight,
  CreditCard,
  CheckCircle,
  ChevronRight,
  MoreVertical,
  Car
} from 'lucide-react';
import UserLayout from './UserLayout.jsx';
import * as packageService from '../../services/packageService.js';
import { ridePaymentService } from '../../services/ridePaymentService.js';
import { toast } from 'react-hot-toast';
import { useAuth } from '../../context/AuthContext.jsx';

export default function ToursPage() {
  const { user } = useAuth();
  const [tours, setTours] = useState([]);
  const [filteredTours, setFilteredTours] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [filterStatus, setFilterStatus] = useState('all');
  const [searchTerm, setSearchTerm] = useState('');
  const navigate = useNavigate();

  const handlePayAdvance = async (tour) => {
    try {
      if (!user) {
        toast.error('Session expired. Please login again.');
        return;
      }

      toast.loading('Initiating secure payment...', { id: 'payment' });
      
      const totalPrice = getTotalPrice(tour);
      const advanceAmount = Math.round(totalPrice * 0.2);

      const paymentPayload = {
        bookingId: tour._id,
        amount: advanceAmount,
        tourName: tour.package?.title || tour.tourName
      };

      const paymentOrderResponse = await ridePaymentService.createTourPaymentOrder(paymentPayload);

      if (!paymentOrderResponse.success) {
        toast.error(paymentOrderResponse.message || 'Failed to create payment order', { id: 'payment' });
        return;
      }

      await ridePaymentService.initiateRazorpayPayment(
        paymentOrderResponse.data,
        {
          name: user.name || `${user.firstName} ${user.lastName}`,
          email: user.email,
          phone: user.phone
        },
        { rideType: 'Tour' },
        async (paymentData) => {
          try {
            const verifyResponse = await ridePaymentService.verifyTourPayment(paymentData);
            if (verifyResponse.success) {
              toast.success('Advance payment successful! Your tour is confirmed.', { id: 'payment' });
              loadTours(); // Refresh the list
            } else {
              toast.error('Payment verification failed', { id: 'payment' });
            }
          } catch (err) {
            toast.error('Verification failed: ' + err.message, { id: 'payment' });
          }
        },
        (error) => {
          toast.error(error || 'Payment failed. Please try again.', { id: 'payment' });
        }
      );
    } catch (err) {
      toast.error('Something went wrong. Please try again.', { id: 'payment' });
      console.error(err);
    }
  };

  useEffect(() => {
    loadTours();
  }, []);

  const loadTours = async () => {
    try {
      setLoading(true);
      const response = await packageService.getMyTourBookings?.();
      if (response?.success) {
        const toursList = Array.isArray(response.data) ? response.data : [];
        setTours(toursList);
        filterTours(toursList, 'all', '');
      }
    } catch (err) {
      setError('Failed to sync tour data with the server');
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const filterTours = (toursData, status, search) => {
    let filtered = toursData;

    if (status !== 'all') {
      filtered = filtered.filter(t => t.status?.toLowerCase() === status.toLowerCase());
    }

    if (search) {
      filtered = filtered.filter(t => {
        const title = t.package?.title || t.tourName || '';
        const location = t.package?.location || t.destination || '';
        return title.toLowerCase().includes(search.toLowerCase()) || 
               location.toLowerCase().includes(search.toLowerCase());
      });
    }

    setFilteredTours(filtered);
  };

  const handleFilterChange = (status) => {
    setFilterStatus(status);
    filterTours(tours, status, searchTerm);
  };

  const handleSearchChange = (search) => {
    setSearchTerm(search);
    filterTours(tours, filterStatus, search);
  };

  const formatDate = (date) => {
    return new Date(date).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });
  };

  const getTotalPrice = (tour) => {
    if (tour.package?.pricing) {
      const carType = tour.carType || 'premium';
      return carType === 'economy' ? tour.package.pricing.economy : tour.package.pricing.premium;
    }
    return tour.pricing?.totalAmount || tour.package?.basePrice || 0;
  };

  const has20PercentPaid = (tour) => {
    const totalPrice = getTotalPrice(tour);
    const paidAmount = tour.pricing?.paidAmount || 0;
    return totalPrice > 0 && paidAmount >= (totalPrice * 0.2);
  };

  const getStatusConfig = (status) => {
    switch (status?.toLowerCase()) {
      case 'completed':
        return { color: 'text-emerald-500', bg: 'bg-emerald-500/10', icon: CheckCircle, label: 'Completed' };
      case 'confirmed':
        return { color: 'text-amber-500', bg: 'bg-amber-500/10', icon: CheckCircle, label: 'Confirmed' };
      case 'cancelled':
        return { color: 'text-rose-500', bg: 'bg-rose-500/10', icon: XCircle, label: 'Cancelled' };
      default:
        return { color: 'text-slate-500', bg: 'bg-slate-500/10', icon: Clock, label: 'Pending' };
    }
  };

  // Statistics calculation
  const statsData = {
    total: tours.length,
    completed: tours.filter(t => t.status?.toLowerCase() === 'completed').length,
    pending: tours.filter(t => t.status?.toLowerCase() === 'pending').length
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
          <p className="text-slate-500 font-medium animate-pulse">Syncing your tour experiences...</p>
        </div>
      </UserLayout>
    );
  }

  return (
    <UserLayout>
      <div className="max-w-7xl mx-auto space-y-10">
        {/* Premium Header Section */}
        <div className="relative mb-12 rounded-[2.5rem] overflow-hidden bg-white text-slate-900 p-8 md:p-12 shadow-xl border border-slate-100">
          <div className="absolute top-0 right-0 w-1/2 h-full bg-gradient-to-l from-emerald-500/20 to-transparent pointer-events-none" />
          <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-8">
            <div>
              <h1 className="text-4xl md:text-5xl font-black tracking-tight mb-4">
                My <span className="text-emerald-400">Tours</span>
              </h1>
              <p className="text-slate-500 text-lg max-w-md font-medium leading-relaxed">
                Explore your curated travel experiences and manage your upcoming adventures.
              </p>
            </div>

            <div className="grid grid-cols-2 md:grid-cols-3 gap-4 md:gap-8">
              <div className="bg-slate-50 border border-slate-100 rounded-3xl p-6 text-center shadow-sm">
                <p className="text-emerald-600 text-2xl font-black mb-1">{statsData.total}</p>
                <p className="text-slate-500 text-[10px] uppercase font-bold tracking-widest">Total Bookings</p>
              </div>
              <div className="bg-slate-50 border border-slate-100 rounded-3xl p-6 text-center shadow-sm">
                <p className="text-emerald-600 text-2xl font-black mb-1">{statsData.completed}</p>
                <p className="text-slate-500 text-[10px] uppercase font-bold tracking-widest">Completed</p>
              </div>
              <div className="bg-slate-50 border border-slate-100 rounded-3xl p-6 text-center shadow-sm hidden md:block">
                <p className="text-emerald-600 text-2xl font-black mb-1">{statsData.pending}</p>
                <p className="text-slate-500 text-[10px] uppercase font-bold tracking-widest">Awaiting</p>
              </div>
            </div>
          </div>
        </div>

        {error && (
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            className="bg-rose-50 border border-rose-200 p-4 rounded-2xl flex items-center gap-4 text-rose-600"
          >
            <AlertCircle size={20} />
            <p className="font-bold text-sm">{error}</p>
          </motion.div>
        )}

        {/* Controls Section */}
        <div className="flex flex-col md:flex-row gap-6 mb-10 items-center justify-between bg-white p-6 rounded-[2rem] shadow-sm border border-slate-100">
          <div className="flex flex-wrap gap-2">
            {['all', 'pending', 'confirmed', 'completed', 'cancelled'].map((status) => (
              <button
                key={status}
                onClick={() => handleFilterChange(status)}
                className={`px-6 py-2.5 rounded-full text-sm font-bold transition-all duration-300 ${filterStatus === status
                  ? 'bg-emerald-600 text-white shadow-lg shadow-emerald-500/20 scale-105'
                  : 'text-slate-500 hover:bg-slate-100'
                  }`}
              >
                {status.charAt(0).toUpperCase() + status.slice(1)}
              </button>
            ))}
          </div>

          <div className="relative w-full md:w-80 group">
            <Search size={18} className="absolute left-5 top-1/2 -translate-y-1/2 text-slate-400 group-focus-within:text-emerald-500 transition-colors" />
            <input
              type="text"
              placeholder="Search tours..."
              value={searchTerm}
              onChange={(e) => handleSearchChange(e.target.value)}
              className="w-full pl-12 pr-6 py-3 bg-slate-50 rounded-2xl border-none focus:ring-2 focus:ring-emerald-500 text-sm font-medium transition-all"
            />
          </div>
        </div>

        {/* Tours Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          <AnimatePresence mode='popLayout'>
            {filteredTours.length === 0 ? (
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                className="col-span-full py-20 text-center"
              >
                <div className="w-24 h-24 bg-slate-100 rounded-full flex items-center justify-center mx-auto mb-6 text-slate-300">
                  <Plane size={40} />
                </div>
                <h3 className="text-2xl font-bold text-slate-800 mb-2">No Tours Found</h3>
                <p className="text-slate-500 font-medium">Try adjusting your filters or explore our packages.</p>
              </motion.div>
            ) : (
              filteredTours.map((tour, idx) => {
                const statusConfig = getStatusConfig(tour.status);
                const isPaid = has20PercentPaid(tour);
                
                return (
                  <motion.div
                    key={tour._id}
                    layout
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, scale: 0.95 }}
                    transition={{ delay: idx * 0.05 }}
                    className="group bg-white rounded-[2.5rem] border border-slate-100 overflow-hidden hover:shadow-2xl hover:-translate-y-2 transition-all duration-500"
                  >
                    <div className="p-8">
                      <div className="flex justify-between items-start mb-8">
                        <div>
                          <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1">Package ID</p>
                          <p className="text-sm font-bold text-slate-900 font-mono">{tour._id.slice(-8).toUpperCase()}</p>
                        </div>
                        <div className={`px-4 py-1.5 rounded-full text-[10px] font-black uppercase tracking-widest ${statusConfig.bg} ${statusConfig.color}`}>
                          {statusConfig.label}
                        </div>
                      </div>

                      <div className="space-y-6 mb-8">
                        <div className="flex gap-4">
                          <div className="w-12 h-12 bg-emerald-50 rounded-2xl flex items-center justify-center text-emerald-600 shrink-0">
                            <Plane size={24} />
                          </div>
                          <div>
                            <p className="text-[10px] font-bold text-slate-400 uppercase mb-0.5">Tour Name</p>
                            <p className="text-lg font-black text-slate-800 line-clamp-1">{tour.package?.title || tour.tourName || 'Tour'}</p>
                          </div>
                        </div>

                        <div className="flex gap-4">
                          <MapPin size={18} className="text-emerald-500 shrink-0 mt-0.5" />
                          <p className="text-sm font-bold text-slate-600">{tour.package?.location || tour.destination || 'N/A'}</p>
                        </div>

                        <div className="grid grid-cols-2 gap-3">
                          <div className="bg-slate-50/80 p-4 rounded-3xl">
                            <p className="text-[10px] font-bold text-slate-400 uppercase mb-1">Date</p>
                            <div className="flex items-center gap-2">
                              <Calendar size={12} className="text-emerald-500" />
                              <p className="text-xs font-black text-slate-700">{formatDate(tour.scheduledDate || tour.createdAt)}</p>
                            </div>
                          </div>
                          <div className="bg-slate-50/80 p-4 rounded-3xl text-right">
                            <p className="text-[10px] font-bold text-slate-400 uppercase mb-1">Package</p>
                            <p className="text-xs font-black text-slate-900 capitalize">{tour.carType || 'Premium'}</p>
                          </div>
                        </div>
                      </div>

                      <div className="flex items-center justify-between border-t border-slate-100 pt-6">
                        <div>
                          <p className="text-[10px] font-bold text-slate-400 uppercase tracking-tighter">Total Fare</p>
                          <p className="text-xl font-black text-emerald-600">₹{getTotalPrice(tour)}</p>
                        </div>

                        <div className="flex gap-2">
                          {!isPaid && tour.status !== 'cancelled' ? (
                            <button
                              onClick={() => handlePayAdvance(tour)}
                              className="px-6 py-3 bg-emerald-500 text-white rounded-2xl text-xs font-black hover:scale-105 active:scale-95 transition-all shadow-lg shadow-emerald-500/30 flex items-center gap-2"
                            >
                              <CreditCard size={14} />
                              Pay 20%
                            </button>
                          ) : (
                            <button
                              onClick={() => navigate(`/user/booking-confirmation?id=${tour._id}`)}
                              className="px-6 py-3 bg-emerald-600 text-white rounded-2xl text-xs font-black hover:scale-105 active:scale-95 transition-all shadow-xl"
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
    </UserLayout>
  );
}
