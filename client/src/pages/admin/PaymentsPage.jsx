import { useEffect, useMemo, useState } from 'react';
import { 
  Search, 
  Download, 
  Eye, 
  AlertCircle, 
  CheckCircle, 
  TrendingUp, 
  CreditCard, 
  Banknote, 
  Wallet, 
  ShieldCheck,
  Calendar,
  User,
  ArrowUpRight,
  Filter,
  RefreshCw,
  Clock,
  X
} from 'lucide-react';
import AdminLayout from './AdminLayout';
import { getAllPayments } from '../../services/adminService';
import { motion, AnimatePresence } from 'framer-motion';

const PaymentsPage = () => {
  const [payments, setPayments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [paymentTypeFilter, setPaymentTypeFilter] = useState('all');
  const [pagination, setPagination] = useState({ page: 1, pages: 1, total: 0 });
  const [selectedPayment, setSelectedPayment] = useState(null);
  const [autoRefresh, setAutoRefresh] = useState(true);
  const [lastUpdated, setLastUpdated] = useState(null);
  
  const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || '/api';
  const token = localStorage.getItem('token');

  const fetchPayments = async (page = 1) => {
    try {
      const response = await getAllPayments({ 
        page, 
        limit: 1000,
        status: statusFilter === 'all' ? undefined : statusFilter 
      });
      
      let allPayments = (response.data.payments || []).map(p => {
        const userName = `${p.user?.firstName || ''} ${p.user?.lastName || ''}`.trim() ||
                        p.user?.name ||
                        'Anonymous User';
        
        return {
          ...p,
          paymentType: p.paymentType || 'advance',
          user: {
            ...p.user,
            name: userName,
            email: p.user?.email || 'N/A',
            phone: p.user?.phone || 'N/A'
          }
        };
      });
      
      try {
        const ridesResponse = await fetch(`${API_BASE_URL}/admin/bookings?limit=1000`, {
          headers: {
            'Authorization': `Bearer ${token}`,
            'Content-Type': 'application/json',
          },
        });
        
        if (ridesResponse.ok) {
          const ridesData = await ridesResponse.json();
          let rides = ridesData.data || [];
          
          const manualPayments = rides
            .filter(ride => {
              const isCompleted = ride.status === 'completed';
              const hasPaidAmount = ride.paidAmount && ride.paidAmount > 0;
              const hasNotes = ride.rideCompletion?.completionNotes;
              return isCompleted && hasPaidAmount && hasNotes;
            })
            .map(ride => {
              const totalFare = ride.pricing?.totalFare || 0;
              const paid = parseFloat(ride.paidAmount) || 0;
              const remaining = totalFare - paid;
              
              return {
                _id: `manual-${ride._id}`,
                paymentType: 'manual',
                amount: remaining,
                paidAmount: paid,
                totalAmount: totalFare,
                status: 'success',
                transactionId: `MANUAL-${ride.bookingId}`,
                user: {
                  name: `${ride.user?.firstName || ''} ${ride.user?.lastName || ''}`.trim() || ride.user?.name,
                  email: ride.user?.email,
                  phone: ride.user?.phone,
                },
                paymentMethod: ride.rideCompletion?.completionNotes.toLowerCase().includes('cash') ? 'cash' : 
                             ride.rideCompletion?.completionNotes.toLowerCase().includes('upi') ? 'upi' :
                             ride.rideCompletion?.completionNotes.toLowerCase().includes('bank') ? 'bank' : 'other',
                paymentNotes: ride.rideCompletion?.completionNotes,
                createdAt: ride.rideCompletion?.completedAt || ride.updatedAt,
                bookingId: ride.bookingId
              };
            });
          
          allPayments = [...allPayments, ...manualPayments];
          allPayments.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));
        }
      } catch (err) {
        console.error('Manual payment fetch error:', err);
      }
      
      setPayments(allPayments);
      setPagination(response.data.pagination || { page: 1, pages: 1, total: allPayments.length });
      setLastUpdated(new Date());
    } catch (error) {
      console.error('Payment fetch error:', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    void fetchPayments(1);
    let intervalId;
    if (autoRefresh) {
      intervalId = window.setInterval(() => void fetchPayments(1), 8000);
    }
    return () => intervalId && clearInterval(intervalId);
  }, [statusFilter, autoRefresh]);

  const filteredPayments = useMemo(() => {
    const query = searchTerm.trim().toLowerCase();
    return payments.filter((p) => {
      const matchesStatus = statusFilter === 'all' || p.status === statusFilter;
      const matchesType = paymentTypeFilter === 'all' || p.paymentType === paymentTypeFilter;
      const matchesSearch = !query || 
        p.user?.name?.toLowerCase().includes(query) ||
        p.transactionId?.toLowerCase().includes(query) ||
        p.bookingId?.toLowerCase().includes(query);
      return matchesStatus && matchesType && matchesSearch;
    });
  }, [payments, searchTerm, statusFilter, paymentTypeFilter]);

  const getStatusConfig = (status) => {
    switch(status) {
      case 'success': return { bg: 'bg-emerald-50', text: 'text-emerald-700', border: 'border-emerald-100', icon: CheckCircle };
      case 'pending': return { bg: 'bg-amber-50', text: 'text-amber-700', border: 'border-amber-100', icon: Clock };
      case 'failed': return { bg: 'bg-rose-50', text: 'text-rose-700', border: 'border-rose-100', icon: AlertCircle };
      default: return { bg: 'bg-slate-50', text: 'text-slate-700', border: 'border-slate-100', icon: AlertCircle };
    }
  };

  const getMethodBadge = (payment) => {
    if (payment.razorpayPaymentId) {
      const method = payment.paymentDetails?.method || payment.paymentMethod || 'card';
      return { label: `Razorpay - ${method.toUpperCase()} (20%)`, bg: 'bg-blue-50 text-blue-700 border-blue-100' };
    }
    const method = payment.paymentMethod?.toUpperCase() || 'MANUAL';
    return { label: `${method} (80%)`, bg: 'bg-slate-50 text-slate-700 border-slate-100' };
  };

  const downloadCSV = () => {
    const headers = ['Transaction ID', 'Booking ID', 'User', 'Amount', 'Method', 'Type', 'Status', 'Date'];
    const rows = filteredPayments.map(p => [
      p.transactionId || p.razorpayPaymentId || 'N/A',
      p.bookingId || 'N/A',
      p.user?.name,
      p.amount,
      getMethodBadge(p).label,
      p.paymentType,
      p.status,
      new Date(p.createdAt).toLocaleString()
    ]);
    const csv = [headers, ...rows].map(r => r.join(',')).join('\n');
    const blob = new Blob([csv], { type: 'text/csv' });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `ledger-${new Date().toISOString().slice(0,10)}.csv`;
    a.click();
  };

  return (
    <AdminLayout>
      <div className="max-w-[1600px] mx-auto space-y-8 p-4 md:p-8">
        {/* Premium Header */}
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-6">
          <div>
            <h1 className="text-3xl md:text-4xl font-black tracking-tight text-slate-900 mb-2">
              Transaction <span className="text-emerald-600">Ledger</span>
            </h1>
            <p className="text-slate-500 font-medium">Real-time monitoring of global payment activities and settlement status.</p>
          </div>
          <div className="flex items-center gap-3">
            <button
              onClick={() => setAutoRefresh(!autoRefresh)}
              className={`flex items-center gap-2 px-5 py-2.5 rounded-2xl font-black text-[10px] uppercase tracking-widest transition-all ${
                autoRefresh ? 'bg-emerald-500 text-white shadow-lg shadow-emerald-500/20' : 'bg-slate-200 text-slate-500'
              }`}
            >
              <div className={`w-1.5 h-1.5 rounded-full ${autoRefresh ? 'bg-white animate-pulse' : 'bg-slate-400'}`} />
              {autoRefresh ? 'Live Monitoring' : 'Offline'}
            </button>
            <button
              onClick={downloadCSV}
              className="p-3 bg-white hover:bg-slate-50 border border-slate-200 rounded-2xl transition-all shadow-sm flex items-center gap-2 text-slate-700 font-bold text-xs"
            >
              <Download size={18} />
              Export
            </button>
          </div>
        </div>

        {/* Financial Analytics Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          <div className="bg-white p-8 rounded-[2.5rem] border border-slate-100 shadow-xl shadow-slate-200/40 relative overflow-hidden group">
            <div className="absolute top-0 right-0 w-24 h-24 bg-emerald-500/5 -mr-8 -mt-8 rounded-full transition-transform group-hover:scale-110" />
            <div className="flex items-center justify-between mb-4">
              <div className="w-12 h-12 bg-emerald-50 rounded-2xl flex items-center justify-center text-emerald-600">
                <TrendingUp size={24} />
              </div>
              <ArrowUpRight size={16} className="text-emerald-500" />
            </div>
            <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1">Total Revenue</p>
            <p className="text-3xl font-black text-slate-900">
              ₹{payments.filter(p => p.status === 'success').reduce((sum, p) => sum + (p.totalAmount || p.amount || 0), 0).toLocaleString()}
            </p>
          </div>

          <div className="bg-white p-8 rounded-[2.5rem] border border-slate-100 shadow-xl shadow-slate-200/40">
            <div className="flex items-center justify-between mb-4">
              <div className="w-12 h-12 bg-blue-50 rounded-2xl flex items-center justify-center text-blue-600">
                <CreditCard size={24} />
              </div>
            </div>
            <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1">Advance (20%)</p>
            <p className="text-3xl font-black text-slate-900">
              ₹{payments.filter(p => p.paymentType === 'advance').reduce((sum, p) => sum + (p.amount || 0), 0).toLocaleString()}
            </p>
          </div>

          <div className="bg-white p-8 rounded-[2.5rem] border border-slate-100 shadow-xl shadow-slate-200/40">
            <div className="flex items-center justify-between mb-4">
              <div className="w-12 h-12 bg-amber-50 rounded-2xl flex items-center justify-center text-amber-600">
                <Banknote size={24} />
              </div>
            </div>
            <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1">Settled (80%)</p>
            <p className="text-3xl font-black text-slate-900">
              ₹{payments.filter(p => p.paymentType === 'manual').reduce((sum, p) => sum + (p.amount || 0), 0).toLocaleString()}
            </p>
          </div>

          <div className="bg-white p-8 rounded-[2.5rem] border border-slate-100 shadow-xl shadow-slate-200/40">
            <div className="flex items-center justify-between mb-4">
              <div className="w-12 h-12 bg-purple-50 rounded-2xl flex items-center justify-center text-purple-600">
                <ShieldCheck size={24} />
              </div>
            </div>
            <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1">Success Rate</p>
            <p className="text-3xl font-black text-slate-900">
              {payments.length ? Math.round((payments.filter(p => p.status === 'success').length / payments.length) * 100) : 0}%
            </p>
          </div>
        </div>

        {/* Search & Filter Toolbar */}
        <div className="bg-white rounded-[2.5rem] border border-slate-100 shadow-xl overflow-hidden">
          <div className="p-8 border-b border-slate-100 flex flex-col lg:flex-row gap-6 justify-between items-center bg-slate-50/30">
            <div className="relative w-full lg:w-96 group">
              <Search className="absolute left-5 top-1/2 -translate-y-1/2 text-slate-400 group-focus-within:text-emerald-500 transition-colors" size={18} />
              <input
                type="text"
                placeholder="Search transaction or user..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-12 pr-6 py-3.5 bg-white border-none rounded-2xl focus:ring-2 focus:ring-emerald-500 font-bold text-sm shadow-sm transition-all"
              />
            </div>

            <div className="flex flex-wrap items-center gap-4">
              <div className="flex items-center gap-2 bg-white px-4 py-2.5 rounded-2xl shadow-sm border border-slate-100">
                <Filter size={14} className="text-slate-400" />
                <select
                  value={paymentTypeFilter}
                  onChange={(e) => setPaymentTypeFilter(e.target.value)}
                  className="bg-transparent border-none focus:ring-0 text-xs font-black text-slate-600 uppercase tracking-tight"
                >
                  <option value="all">All Channels</option>
                  <option value="advance">Advance (20%)</option>
                  <option value="manual">Manual (80%)</option>
                </select>
              </div>

              <div className="flex items-center gap-2 bg-white px-4 py-2.5 rounded-2xl shadow-sm border border-slate-100">
                <select
                  value={statusFilter}
                  onChange={(e) => setStatusFilter(e.target.value)}
                  className="bg-transparent border-none focus:ring-0 text-xs font-black text-slate-600 uppercase tracking-tight"
                >
                  <option value="all">All States</option>
                  <option value="success">Successful</option>
                  <option value="pending">Processing</option>
                  <option value="failed">Rejected</option>
                </select>
              </div>
            </div>
          </div>

          {/* Ledger Table */}
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="bg-slate-50/50 border-b border-slate-100">
                  <th className="px-8 py-5 text-left text-[10px] font-black text-slate-400 uppercase tracking-widest">Transaction Ref</th>
                  <th className="px-6 py-5 text-left text-[10px] font-black text-slate-400 uppercase tracking-widest">Stakeholder</th>
                  <th className="px-6 py-5 text-left text-[10px] font-black text-slate-400 uppercase tracking-widest">Volume</th>
                  <th className="px-6 py-5 text-left text-[10px] font-black text-slate-400 uppercase tracking-widest">Channel</th>
                  <th className="px-6 py-5 text-left text-[10px] font-black text-slate-400 uppercase tracking-widest">State</th>
                  <th className="px-8 py-5 text-center text-[10px] font-black text-slate-400 uppercase tracking-widest">Context</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                <AnimatePresence>
                  {filteredPayments.map((p) => {
                    const status = getStatusConfig(p.status);
                    const method = getMethodBadge(p);
                    return (
                      <motion.tr
                        layout
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        className="hover:bg-slate-50/50 transition-colors group"
                        key={p._id}
                      >
                        <td className="px-8 py-6">
                          <p className="text-xs font-black text-slate-900 tracking-tight">{(p.transactionId || p.razorpayPaymentId || 'N/A').slice(0, 12)}...</p>
                          <p className="text-[10px] font-bold text-slate-400 mt-1">ID: {p.bookingId || 'N/A'}</p>
                        </td>
                        <td className="px-6 py-6">
                          <div className="flex items-center gap-3">
                            <div className="w-9 h-9 rounded-xl bg-slate-100 flex items-center justify-center text-slate-500 font-black text-[10px]">
                              {p.user?.name?.charAt(0)}
                            </div>
                            <div>
                              <p className="text-sm font-black text-slate-800 tracking-tight">{p.user?.name}</p>
                              <p className="text-[10px] font-bold text-slate-400">{p.user?.email}</p>
                            </div>
                          </div>
                        </td>
                        <td className="px-6 py-6">
                          <p className="text-lg font-black text-slate-900">₹{p.amount?.toLocaleString()}</p>
                        </td>
                        <td className="px-6 py-6">
                          <div className={`inline-flex px-3 py-1.5 rounded-xl border text-[9px] font-black uppercase tracking-widest ${method.bg}`}>
                            {method.label}
                          </div>
                        </td>
                        <td className="px-6 py-6">
                          <div className={`inline-flex items-center gap-2 px-3 py-1.5 rounded-xl border text-[9px] font-black uppercase tracking-widest ${status.bg} ${status.text} ${status.border}`}>
                            <status.icon size={12} />
                            {p.status}
                          </div>
                        </td>
                        <td className="px-8 py-6 text-center">
                          <button
                            onClick={() => setSelectedPayment(p)}
                            className="p-2.5 text-slate-400 hover:text-emerald-500 hover:bg-emerald-50 rounded-xl transition-all"
                          >
                            <Eye size={20} />
                          </button>
                        </td>
                      </motion.tr>
                    );
                  })}
                </AnimatePresence>
              </tbody>
            </table>
            {loading && (
              <div className="p-20 text-center">
                <RefreshCw size={40} className="animate-spin text-slate-200 mx-auto" />
                <p className="mt-4 text-slate-400 font-black text-xs uppercase tracking-widest">Synchronizing Ledger...</p>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Modern Detail Overlay */}
      <AnimatePresence>
        {selectedPayment && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
            <motion.div 
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="absolute inset-0 bg-slate-900/60 backdrop-blur-sm"
              onClick={() => setSelectedPayment(null)}
            />
            <motion.div
              initial={{ opacity: 0, scale: 0.9, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.9, y: 20 }}
              className="relative w-full max-w-2xl bg-white rounded-[3rem] shadow-2xl overflow-hidden border border-slate-100"
            >
              <div className="p-10">
                <div className="flex items-center justify-between mb-8">
                  <div>
                    <h2 className="text-2xl font-black text-slate-900 tracking-tight">Transaction Detail</h2>
                    <p className="text-slate-400 font-medium text-sm">Reference: {selectedPayment.transactionId || selectedPayment.razorpayPaymentId}</p>
                  </div>
                  <button onClick={() => setSelectedPayment(null)} className="p-3 bg-slate-50 hover:bg-rose-50 text-slate-400 hover:text-rose-500 rounded-2xl transition-colors">
                    <X size={20} />
                  </button>
                </div>

                <div className="grid grid-cols-2 gap-8">
                  <div className="space-y-6">
                    <div>
                      <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-2">Financial Vector</p>
                      <div className="p-6 bg-slate-50 rounded-[2rem] border border-slate-100">
                        <p className="text-xs font-bold text-slate-500 mb-1">Amount Settled</p>
                        <p className="text-4xl font-black text-slate-900">₹{selectedPayment.amount}</p>
                        <div className="mt-4 flex items-center gap-2">
                          <div className={`w-2 h-2 rounded-full ${selectedPayment.status === 'success' ? 'bg-emerald-500' : 'bg-rose-500'}`} />
                          <p className="text-[10px] font-black text-slate-800 uppercase tracking-widest">{selectedPayment.status}</p>
                        </div>
                      </div>
                    </div>

                    <div>
                      <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-2">Network Metadata</p>
                      <div className="space-y-4">
                        <div className="flex items-center gap-3">
                          <div className="w-10 h-10 bg-blue-50 rounded-xl flex items-center justify-center text-blue-500">
                            <CreditCard size={18} />
                          </div>
                          <div>
                            <p className="text-[10px] font-black text-slate-400 uppercase">Channel</p>
                            <p className="text-sm font-black text-slate-800">{selectedPayment.paymentType?.toUpperCase()}</p>
                          </div>
                        </div>
                        <div className="flex items-center gap-3">
                          <div className="w-10 h-10 bg-amber-50 rounded-xl flex items-center justify-center text-amber-500">
                            <Calendar size={18} />
                          </div>
                          <div>
                            <p className="text-[10px] font-black text-slate-400 uppercase">Timestamp</p>
                            <p className="text-sm font-black text-slate-800">{new Date(selectedPayment.createdAt).toLocaleString()}</p>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>

                  <div className="space-y-6">
                    <div>
                      <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-2">Stakeholder</p>
                      <div className="p-6 bg-white border border-slate-100 rounded-[2rem] shadow-sm">
                        <div className="flex items-center gap-4 mb-4">
                          <div className="w-12 h-12 bg-slate-900 rounded-2xl flex items-center justify-center text-white font-black">
                            {selectedPayment.user?.name?.charAt(0)}
                          </div>
                          <div>
                            <p className="text-sm font-black text-slate-900">{selectedPayment.user?.name}</p>
                            <p className="text-xs font-bold text-emerald-600 uppercase tracking-tighter">Verified Identity</p>
                          </div>
                        </div>
                        <div className="space-y-2 border-t border-slate-50 pt-4">
                          <div className="flex items-center gap-2 text-slate-500">
                            <Mail size={14} />
                            <span className="text-xs font-medium">{selectedPayment.user?.email}</span>
                          </div>
                          <div className="flex items-center gap-2 text-slate-500">
                            <Phone size={14} />
                            <span className="text-xs font-medium">{selectedPayment.user?.phone}</span>
                          </div>
                        </div>
                      </div>
                    </div>

                    <div>
                      <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-2">Gateway Status</p>
                      <div className={`p-4 rounded-2xl border text-xs font-bold ${selectedPayment.status === 'success' ? 'bg-emerald-50 border-emerald-100 text-emerald-700' : 'bg-rose-50 border-rose-100 text-rose-700'}`}>
                        {selectedPayment.status === 'success' ? 'Settlement synchronized with global network.' : 'Transaction verification failed at gateway level.'}
                      </div>
                    </div>
                  </div>
                </div>

                <button
                  onClick={() => setSelectedPayment(null)}
                  className="w-full mt-10 py-5 bg-slate-900 text-white rounded-[1.5rem] font-black hover:bg-black transition-all flex items-center justify-center gap-3 shadow-xl active:scale-[0.98]"
                >
                  Close Document
                </button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </AdminLayout>
  );
};

export default PaymentsPage;
