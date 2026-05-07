import { useEffect, useMemo, useState } from 'react';
import { 
  Search, 
  AlertCircle, 
  CheckCircle, 
  Clock, 
  RefreshCw, 
  Building2, 
  ChevronRight, 
  ChevronDown, 
  CreditCard, 
  Wallet, 
  Banknote,
  MoreVertical,
  ArrowUpRight,
  Filter,
  Calendar,
  User,
  MapPin,
  Zap,
  X
} from 'lucide-react';
import AdminLayout from './AdminLayout';
import axios from 'axios';
import { motion, AnimatePresence } from 'framer-motion';

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || '/api';

const PendingPaymentsDashboard = () => {
  const [pendingPayments, setPendingPayments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('partial');
  const [pagination, setPagination] = useState({ page: 1, totalPages: 1, totalCount: 0 });
  const [selectedBooking, setSelectedBooking] = useState(null);
  const [showCollectModal, setShowCollectModal] = useState(false);
  const [collectAmount, setCollectAmount] = useState('');
  const [paymentMethod, setPaymentMethod] = useState('cash');
  const [notes, setNotes] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [successMessage, setSuccessMessage] = useState('');
  const [errorMessage, setErrorMessage] = useState('');
  const [lastUpdated, setLastUpdated] = useState(null);
  const [expandedRows, setExpandedRows] = useState(new Set());

  const fetchPendingPayments = async (page = 1) => {
    try {
      setLoading(true);
      const response = await axios.get(`${API_BASE_URL}/admin/pending-payments`, {
        params: { page, limit: 20 },
        headers: {
          Authorization: `Bearer ${localStorage.getItem('token')}`,
        },
      });

      if (response.data.success) {
        setPendingPayments(response.data.data || []);
        setPagination(response.data.pagination || {});
        setLastUpdated(new Date());
      }
    } catch (error) {
      setErrorMessage('Failed to synchronize pending payments');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    void fetchPendingPayments(1);
  }, []);

  const filteredPayments = useMemo(() => {
    let filtered = pendingPayments;
    if (statusFilter !== 'all') {
      filtered = filtered.filter((payment) => payment.paymentStatus === statusFilter);
    }
    if (searchTerm) {
      const normalizedSearch = searchTerm.toLowerCase();
      filtered = filtered.filter((payment) =>
        payment.bookingId.toLowerCase().includes(normalizedSearch) ||
        payment.user?.name?.toLowerCase().includes(normalizedSearch) ||
        payment.user?.email?.toLowerCase().includes(normalizedSearch)
      );
    }
    return filtered;
  }, [searchTerm, statusFilter, pendingPayments]);

  const handleOpenCollectModal = (booking) => {
    setSelectedBooking(booking);
    setCollectAmount(booking.remainingAmount.toString());
    setPaymentMethod('cash');
    setNotes('');
    setShowCollectModal(true);
  };

  const toggleExpandedRow = (bookingId) => {
    const newExpandedRows = new Set(expandedRows);
    if (newExpandedRows.has(bookingId)) {
      newExpandedRows.delete(bookingId);
    } else {
      newExpandedRows.add(bookingId);
    }
    setExpandedRows(newExpandedRows);
  };

  const handleSubmitPayment = async (e) => {
    e.preventDefault();
    if (!selectedBooking || !collectAmount) return;

    setSubmitting(true);
    try {
      const paymentResponse = await axios.post(
        `${API_BASE_URL}/admin/bookings/${selectedBooking._id}/collect-payment`,
        {
          paymentMethod,
          notes,
          paidAmount: parseFloat(collectAmount),
        },
        {
          headers: { Authorization: `Bearer ${localStorage.getItem('token')}` },
        }
      );

      if (paymentResponse.data.success) {
        try {
          await axios.patch(
            `${API_BASE_URL}/admin/ride-bookings/${selectedBooking._id}/complete`,
            { completionNotes: `Balance collected via ${paymentMethod.toUpperCase()}. ${notes}` },
            { headers: { Authorization: `Bearer ${localStorage.getItem('token')}` } }
          );
          setSuccessMessage('Payment synchronized and ride finalized.');
        } catch (err) {
          setSuccessMessage('Payment recorded successfully.');
        }

        setShowCollectModal(false);
        setTimeout(() => {
          void fetchPendingPayments(pagination.page);
          setSuccessMessage('');
        }, 2000);
      }
    } catch (error) {
      setErrorMessage(error.response?.data?.message || 'Transaction failed');
    }
    setSubmitting(false);
  };

  const totalOutstanding = filteredPayments.reduce((sum, p) => sum + p.remainingAmount, 0);

  return (
    <AdminLayout>
      <div className="max-w-[1600px] mx-auto space-y-8 p-4 md:p-8">
        {/* Modern Header Section */}
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
          <div>
            <h1 className="text-3xl md:text-4xl font-black tracking-tight text-slate-900 mb-2">
              Payment <span className="text-emerald-600">Reconciliation</span>
            </h1>
            <p className="text-slate-500 font-medium">Manage and finalize outstanding balances for completed journeys.</p>
          </div>
          <div className="flex items-center gap-3">
            <div className="px-4 py-2 bg-emerald-50 rounded-2xl border border-emerald-100 flex items-center gap-2">
              <div className="w-2 h-2 bg-emerald-500 rounded-full animate-pulse" />
              <span className="text-[10px] font-black uppercase tracking-widest text-emerald-600">Live Sync Enabled</span>
            </div>
            <button
              onClick={() => fetchPendingPayments(1)}
              className="p-3 bg-white hover:bg-slate-50 border border-slate-200 rounded-2xl transition-all shadow-sm"
            >
              <RefreshCw size={20} className={`text-slate-600 ${loading ? 'animate-spin' : ''}`} />
            </button>
          </div>
        </div>

        {/* Dynamic Stats Section */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="bg-white p-8 rounded-[2.5rem] border border-slate-100 shadow-xl shadow-slate-200/50">
            <div className="flex items-center justify-between mb-4">
              <div className="w-12 h-12 bg-emerald-50 rounded-2xl flex items-center justify-center text-emerald-600">
                <Banknote size={24} />
              </div>
              <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Outstanding</span>
            </div>
            <p className="text-3xl font-black text-slate-900">₹{totalOutstanding.toLocaleString('en-IN')}</p>
            <p className="text-sm text-slate-400 font-medium mt-1">Total pending collection</p>
          </div>

          <div className="bg-white p-8 rounded-[2.5rem] border border-slate-100 shadow-xl shadow-slate-200/50">
            <div className="flex items-center justify-between mb-4">
              <div className="w-12 h-12 bg-amber-50 rounded-2xl flex items-center justify-center text-amber-600">
                <Clock size={24} />
              </div>
              <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Partial</span>
            </div>
            <p className="text-3xl font-black text-slate-900">{pendingPayments.filter(p => p.paymentStatus === 'partial').length}</p>
            <p className="text-sm text-slate-400 font-medium mt-1">Awaiting 80% balance</p>
          </div>

          <div className="bg-white p-8 rounded-[2.5rem] border border-slate-100 shadow-xl shadow-slate-200/50">
            <div className="flex items-center justify-between mb-4">
              <div className="w-12 h-12 bg-rose-50 rounded-2xl flex items-center justify-center text-rose-600">
                <AlertCircle size={24} />
              </div>
              <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Unpaid</span>
            </div>
            <p className="text-3xl font-black text-slate-900">{pendingPayments.filter(p => p.paymentStatus === 'pending').length}</p>
            <p className="text-sm text-slate-400 font-medium mt-1">Requiring immediate action</p>
          </div>
        </div>

        {/* Table/Controls Section */}
        <div className="bg-white rounded-[2.5rem] border border-slate-100 shadow-xl overflow-hidden">
          <div className="p-8 border-b border-slate-100 flex flex-col lg:flex-row gap-6 justify-between items-center bg-slate-50/30">
            <div className="relative w-full lg:w-96 group">
              <Search className="absolute left-5 top-1/2 -translate-y-1/2 text-slate-400 group-focus-within:text-emerald-500 transition-colors" size={18} />
              <input
                type="text"
                placeholder="Search identifier or user..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-12 pr-6 py-3.5 bg-white border-none rounded-2xl focus:ring-2 focus:ring-emerald-500 font-bold text-sm shadow-sm transition-all"
              />
            </div>

            <div className="flex flex-wrap items-center gap-3">
              <div className="flex items-center gap-2 bg-white px-4 py-2 rounded-2xl shadow-sm border border-slate-100">
                <Filter size={14} className="text-slate-400" />
                <select
                  value={statusFilter}
                  onChange={(e) => setStatusFilter(e.target.value)}
                  className="bg-transparent border-none focus:ring-0 text-xs font-black text-slate-600 uppercase tracking-tight"
                >
                  <option value="partial">80% Awaiting</option>
                  <option value="pending">Full Awaiting</option>
                  <option value="all">Comprehensive View</option>
                </select>
              </div>
            </div>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="bg-slate-50/50 border-b border-slate-100">
                  <th className="w-12 px-8 py-5"></th>
                  <th className="px-6 py-5 text-left text-[10px] font-black text-slate-400 uppercase tracking-widest">Booking Context</th>
                  <th className="px-6 py-5 text-left text-[10px] font-black text-slate-400 uppercase tracking-widest">Customer Profile</th>
                  <th className="px-6 py-5 text-left text-[10px] font-black text-slate-400 uppercase tracking-widest">Financial Status</th>
                  <th className="px-6 py-5 text-left text-[10px] font-black text-slate-400 uppercase tracking-widest">Action Center</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                <AnimatePresence>
                  {filteredPayments.map((booking) => (
                    <React.Fragment key={booking._id}>
                      <motion.tr
                        layout
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        className="hover:bg-slate-50/50 transition-colors group cursor-pointer"
                        onClick={() => toggleExpandedRow(booking._id)}
                      >
                        <td className="px-8 py-6 text-center">
                          <div className={`p-1 rounded-lg transition-transform ${expandedRows.has(booking._id) ? 'rotate-180 text-emerald-500' : 'text-slate-300'}`}>
                            <ChevronDown size={20} />
                          </div>
                        </td>
                        <td className="px-6 py-6">
                          <p className="text-sm font-black text-slate-900 tracking-tight">{booking.bookingId}</p>
                          <p className="text-[10px] font-black text-emerald-600 uppercase mt-1 tracking-tighter">{booking.rideType}</p>
                        </td>
                        <td className="px-6 py-6">
                          <div className="flex items-center gap-3">
                            <div className="w-10 h-10 rounded-xl bg-slate-100 flex items-center justify-center text-slate-500 font-black text-xs">
                              {booking.user?.name?.charAt(0) || 'U'}
                            </div>
                            <div>
                              <p className="text-sm font-black text-slate-800">{booking.user?.name || 'Unknown Entity'}</p>
                              <p className="text-[10px] font-bold text-slate-400">{booking.user?.phone}</p>
                            </div>
                          </div>
                        </td>
                        <td className="px-6 py-6">
                          <div className="space-y-1">
                            <div className="flex items-center gap-2">
                              <p className="text-lg font-black text-slate-900">₹{booking.totalFare}</p>
                              <div className={`px-2 py-0.5 rounded-full text-[8px] font-black uppercase tracking-widest ${booking.paymentStatus === 'partial' ? 'bg-amber-100 text-amber-700' : 'bg-rose-100 text-rose-700'}`}>
                                {booking.paymentStatus === 'partial' ? 'Partial' : 'Awaiting'}
                              </div>
                            </div>
                            <p className="text-[10px] font-bold text-slate-400">Remaining: <span className="text-rose-500">₹{booking.remainingAmount}</span></p>
                          </div>
                        </td>
                        <td className="px-6 py-6">
                          <button
                            onClick={(e) => {
                              e.stopPropagation();
                              handleOpenCollectModal(booking);
                            }}
                            className="px-5 py-2.5 bg-slate-900 text-white rounded-xl text-xs font-black hover:bg-black transition-all flex items-center gap-2 shadow-lg active:scale-95"
                          >
                            <CreditCard size={14} />
                            Reconcile
                          </button>
                        </td>
                      </motion.tr>

                      {expandedRows.has(booking._id) && (
                        <motion.tr
                          initial={{ opacity: 0, height: 0 }}
                          animate={{ opacity: 1, height: 'auto' }}
                          exit={{ opacity: 0, height: 0 }}
                          className="bg-slate-50/50"
                        >
                          <td colSpan="5" className="px-12 py-8">
                            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                              <div className="space-y-4">
                                <h4 className="text-[10px] font-black text-slate-400 uppercase tracking-widest flex items-center gap-2">
                                  <MapPin size={12} className="text-emerald-500" />
                                  Route Configuration
                                </h4>
                                <div className="bg-white p-6 rounded-[2rem] border border-slate-100 space-y-4">
                                  <div>
                                    <p className="text-[9px] font-black text-slate-400 uppercase tracking-tighter">Pickup</p>
                                    <p className="text-sm font-bold text-slate-700 mt-1 line-clamp-2">{booking.pickupLocation}</p>
                                  </div>
                                  <div>
                                    <p className="text-[9px] font-black text-slate-400 uppercase tracking-tighter">Destination</p>
                                    <p className="text-sm font-bold text-slate-700 mt-1 line-clamp-2">{booking.dropLocation}</p>
                                  </div>
                                  <div className="flex justify-between pt-2 border-t border-slate-50">
                                    <p className="text-[10px] font-black text-slate-900 uppercase">{booking.distance?.toFixed(1)} KM Total</p>
                                    <p className="text-[10px] font-black text-emerald-600 uppercase tracking-widest">{booking.cabType}</p>
                                  </div>
                                </div>
                              </div>

                              <div className="space-y-4">
                                <h4 className="text-[10px] font-black text-slate-400 uppercase tracking-widest flex items-center gap-2">
                                  <CreditCard size={12} className="text-emerald-500" />
                                  Financial Breakdown
                                </h4>
                                <div className="bg-white p-6 rounded-[2rem] border border-slate-100 space-y-3">
                                  <div className="flex justify-between text-xs font-bold text-slate-500">
                                    <span>Total Fare</span>
                                    <span className="text-slate-900">₹{booking.totalFare}</span>
                                  </div>
                                  <div className="flex justify-between text-xs font-bold text-emerald-600">
                                    <span>Advance Collected</span>
                                    <span>- ₹{booking.paidAmount}</span>
                                  </div>
                                  <div className="pt-3 border-t border-slate-50 flex justify-between items-center">
                                    <p className="text-[10px] font-black text-slate-900 uppercase">Balance Due</p>
                                    <p className="text-xl font-black text-rose-500">₹{booking.remainingAmount}</p>
                                  </div>
                                </div>
                              </div>

                              <div className="space-y-4">
                                <h4 className="text-[10px] font-black text-slate-400 uppercase tracking-widest flex items-center gap-2">
                                  <Calendar size={12} className="text-emerald-500" />
                                  Booking Metadata
                                </h4>
                                <div className="bg-white p-6 rounded-[2rem] border border-slate-100 space-y-4">
                                  <div>
                                    <p className="text-[9px] font-black text-slate-400 uppercase tracking-tighter">Scheduled For</p>
                                    <p className="text-sm font-bold text-slate-700 mt-1">
                                      {booking.scheduledDate ? new Date(booking.scheduledDate).toLocaleDateString('en-IN', { dateStyle: 'long' }) : 'N/A'}
                                    </p>
                                  </div>
                                  <div>
                                    <p className="text-[9px] font-black text-slate-400 uppercase tracking-tighter">Creation Node</p>
                                    <p className="text-[10px] font-bold text-slate-500 mt-1 uppercase tracking-tight italic">Backend Cluster - ID: {booking._id.slice(-6)}</p>
                                  </div>
                                </div>
                              </div>
                            </div>
                          </td>
                        </motion.tr>
                      )}
                    </React.Fragment>
                  ))}
                </AnimatePresence>
              </tbody>
            </table>
          </div>
        </div>
      </div>

      {/* Collect Payment Modal */}
      <AnimatePresence>
        {showCollectModal && selectedBooking && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
            <motion.div 
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="absolute inset-0 bg-slate-900/60 backdrop-blur-sm"
              onClick={() => setShowCollectModal(false)}
            />
            <motion.div
              initial={{ opacity: 0, scale: 0.9, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.9, y: 20 }}
              className="relative w-full max-w-lg bg-white rounded-[3rem] shadow-2xl overflow-hidden border border-slate-100"
            >
              <div className="p-10">
                <div className="flex items-center justify-between mb-8">
                  <div>
                    <h2 className="text-2xl font-black text-slate-900 tracking-tight">Reconciliation</h2>
                    <p className="text-slate-400 font-medium text-sm">Finalize collection for {selectedBooking.bookingId}</p>
                  </div>
                  <div className="w-12 h-12 bg-slate-50 rounded-2xl flex items-center justify-center text-slate-400 hover:text-rose-500 cursor-pointer transition-colors" onClick={() => setShowCollectModal(false)}>
                    <X size={20} />
                  </div>
                </div>

                <form onSubmit={handleSubmitPayment} className="space-y-6">
                  <div className="bg-slate-50 p-6 rounded-[2rem] border border-slate-100 grid grid-cols-2 gap-4 text-center">
                    <div>
                      <p className="text-[9px] font-black text-slate-400 uppercase tracking-widest mb-1">Total</p>
                      <p className="text-lg font-black text-slate-800">₹{selectedBooking.totalFare}</p>
                    </div>
                    <div>
                      <p className="text-[9px] font-black text-slate-400 uppercase tracking-widest mb-1 text-rose-500">Balance</p>
                      <p className="text-lg font-black text-rose-500">₹{selectedBooking.remainingAmount}</p>
                    </div>
                  </div>

                  <div>
                    <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1 mb-2 block">Settlement Method</label>
                    <div className="grid grid-cols-2 gap-3">
                      {[
                        { id: 'cash', icon: Banknote, label: 'Cash' },
                        { id: 'upi', icon: Zap, label: 'UPI' },
                        { id: 'wallet', icon: Wallet, label: 'Wallet' },
                        { id: 'razorpay', icon: CreditCard, label: 'Digital' }
                      ].map((method) => (
                        <button
                          key={method.id}
                          type="button"
                          onClick={() => setPaymentMethod(method.id)}
                          className={`flex items-center gap-3 p-4 rounded-2xl border-2 transition-all font-bold text-sm ${
                            paymentMethod === method.id 
                            ? 'border-emerald-500 bg-emerald-50 text-emerald-700 shadow-inner' 
                            : 'border-slate-100 bg-white text-slate-500 hover:border-slate-200'
                          }`}
                        >
                          <method.icon size={18} className={paymentMethod === method.id ? 'text-emerald-500' : 'text-slate-300'} />
                          {method.label}
                        </button>
                      ))}
                    </div>
                  </div>

                  <div>
                    <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1 mb-2 block">Collection Notes</label>
                    <textarea
                      value={notes}
                      onChange={(e) => setNotes(e.target.value)}
                      placeholder="e.g. Verified by driver, office collection..."
                      className="w-full px-6 py-4 bg-slate-50 rounded-2xl border-none focus:ring-2 focus:ring-emerald-500 font-bold text-sm shadow-inner min-h-[100px] resize-none"
                    />
                  </div>

                  <button
                    type="submit"
                    disabled={submitting}
                    className="w-full py-5 bg-slate-900 text-white rounded-[1.5rem] font-black hover:bg-black transition-all flex items-center justify-center gap-3 shadow-xl active:scale-[0.98] disabled:opacity-50"
                  >
                    {submitting ? (
                      <RefreshCw size={20} className="animate-spin" />
                    ) : (
                      <>
                        <CheckCircle size={20} className="text-emerald-400" />
                        Authorize Settlement
                      </>
                    )}
                  </button>
                </form>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </AdminLayout>
  );
};

export default PendingPaymentsDashboard;
