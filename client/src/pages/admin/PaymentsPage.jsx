import { useEffect, useMemo, useState } from 'react';
import { Search, Download, Eye, AlertCircle, CheckCircle } from 'lucide-react';
import AdminLayout from './AdminLayout';
import { getAllPayments } from '../../services/adminService';

const PaymentsPage = () => {
  const [payments, setPayments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('all'); // Show all payment types
  const [paymentTypeFilter, setPaymentTypeFilter] = useState('all'); // all, advance, manual
  const [pagination, setPagination] = useState({ page: 1, pages: 1, total: 0 });
  const [selectedPayment, setSelectedPayment] = useState(null);
  const [autoRefresh, setAutoRefresh] = useState(true);
  const [lastUpdated, setLastUpdated] = useState(null);
  const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:5000/api';
  const token = localStorage.getItem('token');

  const fetchPayments = async (page = 1) => {
    try {
      const response = await getAllPayments({ 
        page, 
        limit: 1000, // Increased limit to fetch more pages of payments
        status: statusFilter === 'all' ? undefined : statusFilter 
      });
      console.log('🔄 Fetching payments - Status:', statusFilter);
      console.log('✅ Payments response:', response);
      console.log('💳 Razorpay payments count:', response.data.payments?.length);
      console.log('🔍 Sample Razorpay payment structure:', response.data.payments?.[0]);
      
      let allPayments = (response.data.payments || []).map(p => {
        // Ensure user name is properly set for Razorpay payments from firstName + lastName
        const userName = `${p.user?.firstName || ''} ${p.user?.lastName || ''}`.trim() ||
                        p.user?.name ||
                        'Unknown User';
        
        return {
          ...p,
          paymentType: p.paymentType || 'advance', // Default Razorpay payments as advance
          user: {
            ...p.user,
            name: userName,
            email: p.user?.email || 'N/A',
            phone: p.user?.phone || 'N/A'
          }
        };
      });
      
      // Fetch completed rides with manual payments
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
          
          console.log('📋 All rides fetched:', rides.length);
          console.log('✅ Completed rides:', rides.filter(r => r.status === 'completed').length);
          
          // Filter completed rides with manual payments (80% balance) and paidAmount exists
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
              const remaining = totalFare - paid; // This is the 80% manual payment
              
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
                             ride.rideCompletion?.completionNotes.toLowerCase().includes('cheque') ? 'cheque' :
                             ride.rideCompletion?.completionNotes.toLowerCase().includes('bank') ? 'bank' : 'other',
                paymentNotes: ride.rideCompletion?.completionNotes,
                createdAt: ride.rideCompletion?.completedAt || ride.updatedAt,
                bookingId: ride.bookingId,
                bookingDetails: {
                  fixedCharge: ride.pricing?.fixedCharge,
                  parkingCharge: ride.pricing?.parkingCharge,
                  perKmRate: ride.pricing?.perKmRate,
                  distance: ride.distance,
                  rideType: ride.rideType,
                }
              };
            });
          
          console.log('💰 Manual payments found:', manualPayments.length);
          console.log('📜 Manual payment details:', manualPayments.slice(0, 3));
          
          // Combine Razorpay and manual payments
          allPayments = [...allPayments, ...manualPayments];
          // Sort by date descending
          allPayments.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));
          
          console.log('📊 Total payments combined:', allPayments.length);
          console.log('🎯 All payments:', allPayments.slice(0, 5));
        }
      } catch (err) {
        console.error('❌ Error fetching completed rides:', err);
      }
      
      setPayments(allPayments);
      setPagination(response.data.pagination || { page: 1, pages: 1, total: allPayments.length });
      setLastUpdated(new Date());
    } catch (error) {
      console.error('❌ Error fetching payments:', error);
      alert('Error loading payments: ' + error.message);
    } finally {
      setLoading(false);
    }
  };

  // Initial fetch and auto-refresh
  useEffect(() => {
    void fetchPayments(1); // Always fetch from page 1 to get all data
    
    let intervalId;
    if (autoRefresh) {
      intervalId = window.setInterval(() => {
        console.log('🔄 Auto-refreshing payments (Real-time)...');
        void fetchPayments(1);
      }, 5000); // Refresh every 5 seconds for real-time updates
    }
    
    return () => {
      if (intervalId) clearInterval(intervalId);
    };
  }, [statusFilter, autoRefresh]);

  const filteredPayments = useMemo(() => {
    const normalizedSearch = searchTerm.trim().toLowerCase();

    return payments.filter((payment) => {
      const matchesStatus = statusFilter === 'all' || payment.status === statusFilter;
      const matchesPaymentType = paymentTypeFilter === 'all' || payment.paymentType === paymentTypeFilter;
      const matchesSearch =
        !normalizedSearch ||
        payment.user?.name?.toLowerCase().includes(normalizedSearch) ||
        payment.user?.email?.toLowerCase().includes(normalizedSearch) ||
        payment.transactionId?.toLowerCase().includes(normalizedSearch) ||
        payment.razorpayPaymentId?.toLowerCase().includes(normalizedSearch) ||
        payment.bookingId?.toLowerCase().includes(normalizedSearch);

      return matchesStatus && matchesPaymentType && matchesSearch;
    });
  }, [payments, searchTerm, statusFilter, paymentTypeFilter]);

  const getStatusColor = (status) => {
    const colorMap = {
      pending: 'bg-yellow-100 text-yellow-700 dark:bg-yellow-900 dark:text-yellow-300',
      success: 'bg-green-100 text-green-700 dark:bg-green-900 dark:text-green-300',
      failed: 'bg-red-100 text-red-700 dark:bg-red-900 dark:text-red-300',
      refunded: 'bg-blue-100 text-blue-700 dark:bg-blue-900 dark:text-blue-300',
    };
    return colorMap[status] || 'bg-gray-100 text-gray-700 dark:bg-gray-700 dark:text-gray-300';
  };

  const getStatusIcon = (status) => {
    switch (status) {
      case 'success':
        return <CheckCircle size={16} className="text-green-600 dark:text-green-400" />;
      case 'failed':
        return <AlertCircle size={16} className="text-red-600 dark:text-red-400" />;
      default:
        return null;
    }
  };

  const getPaymentMethodBadge = (payment) => {
    // Check if this is a Razorpay payment (has razorpayPaymentId)
    if (payment.razorpayPaymentId) {
      // Get actual payment method from Razorpay
      const razorpayMethod = payment.paymentDetails?.method || payment.paymentMethod || 'card';
      const methodUpper = razorpayMethod.toLowerCase();
      
      if (methodUpper === 'card') {
        return { label: '💳 Razorpay - Card (20%)', color: 'bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-300' };
      } else if (methodUpper === 'upi') {
        return { label: '📱 Razorpay - UPI (20%)', color: 'bg-purple-100 text-purple-800 dark:bg-purple-900 dark:text-purple-300' };
      } else if (methodUpper === 'wallet') {
        return { label: '💼 Razorpay - Wallet (20%)', color: 'bg-pink-100 text-pink-800 dark:bg-pink-900 dark:text-pink-300' };
      } else if (methodUpper === 'netbanking') {
        return { label: '🏦 Razorpay - Net Banking (20%)', color: 'bg-indigo-100 text-indigo-800 dark:bg-indigo-900 dark:text-indigo-300' };
      } else {
        return { label: '💳 Razorpay (20%)', color: 'bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-300' };
      }
    }
    
    // Otherwise it's a manual payment (80% balance)
    if (payment.paymentType === 'manual' || (payment._id && payment._id.startsWith('manual-'))) {
      const method = payment.paymentMethod?.toLowerCase() || 'other';
      if (method === 'cash') {
        return { label: '💵 Cash (80%)', color: 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-300' };
      } else if (method === 'upi') {
        return { label: '📱 UPI (80%)', color: 'bg-purple-100 text-purple-800 dark:bg-purple-900 dark:text-purple-300' };
      } else if (method === 'bank') {
        return { label: '🏦 Bank (80%)', color: 'bg-indigo-100 text-indigo-800 dark:bg-indigo-900 dark:text-indigo-300' };
      } else {
        return { label: '💰 Manual (80%)', color: 'bg-orange-100 text-orange-800 dark:bg-orange-900 dark:text-orange-300' };
      }
    }
    return { label: payment.paymentMethod || 'Unknown', color: 'bg-gray-100 text-gray-800 dark:bg-gray-900 dark:text-gray-300' };
  };

  const downloadCSV = () => {
    const headers = ['Transaction ID', 'Booking ID', 'User', 'Amount', 'Payment Method', 'Payment Type', 'Status', 'Date & Time'];
    const rows = filteredPayments.map((payment) => [
      payment.transactionId || payment.razorpayPaymentId || 'N/A',
      payment.bookingId || 'N/A',
      typeof payment.user === 'object' ? payment.user?.name : payment.user,
      payment.amount || 0,
      getPaymentMethodBadge(payment).label,
      payment.paymentType || 'N/A',
      payment.status,
      payment.createdAt ? new Date(payment.createdAt).toLocaleString('en-IN') : 'N/A',
    ]);

    const csv = [headers, ...rows].map((row) => row.join(',')).join('\n');
    const blob = new Blob([csv], { type: 'text/csv' });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `payments-${new Date().toISOString().split('T')[0]}.csv`;
    a.click();
  };

  return (
    <AdminLayout>
      <div className="space-y-6">
        {/* Header */}
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
          <div>
            <div className="flex items-center gap-3">
              <h1 className="text-2xl sm:text-3xl font-bold text-gray-900 dark:text-white">💰 Payment Transaction History</h1>
              <span className="bg-green-100 dark:bg-green-900/30 text-green-700 dark:text-green-300 px-3 py-1 rounded-full text-sm font-bold">REAL-TIME</span>
            </div>
            <p className="text-xs sm:text-sm text-gray-600 dark:text-gray-400 mt-2">
              Total Transactions: <span className="font-bold text-green-600">{filteredPayments.length}</span> | 
              Advance (20%): <span className="font-bold text-blue-600">{filteredPayments.filter(p => p.paymentType === 'advance').length}</span> | 
              Manual (80%): <span className="font-bold text-orange-600">{filteredPayments.filter(p => p.paymentType === 'manual').length}</span>
              {lastUpdated && (
                <span className="ml-2 sm:ml-3 text-xs text-gray-500">
                  (Last updated: {lastUpdated.toLocaleTimeString()})
                </span>
              )}
           
            </p>
          </div>
          <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-2 w-full sm:w-auto">
            <button
              onClick={() => setAutoRefresh(!autoRefresh)}
              className={`flex items-center justify-center gap-2 px-3 sm:px-4 py-2 rounded-lg transition text-sm font-medium ${
                autoRefresh
                  ? 'bg-green-500 hover:bg-green-600 text-white'
                  : 'bg-gray-500 hover:bg-gray-600 text-white'
              }`}
              title={autoRefresh ? 'Auto-refresh ON' : 'Auto-refresh OFF'}
            >
              <span>{autoRefresh ? '● Live' : '○ Off'}</span>
            </button>
            <button
              onClick={downloadCSV}
              className="flex items-center justify-center gap-2 bg-blue-500 hover:bg-blue-600 text-white px-3 sm:px-4 py-2 rounded-lg transition text-sm font-medium"
            >
              <Download size={16} />
              <span className="hidden sm:inline">Export CSV</span>
              <span className="sm:hidden">Export</span>
            </button>
          </div>
        </div>

        {/* Stats Cards - Payment Breakdown */}
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-3 sm:gap-4">
          <div className="bg-gradient-to-br from-blue-50 to-blue-100 dark:from-blue-900/40 dark:to-blue-900/20 rounded-lg p-4 sm:p-6 border-2 border-blue-300 dark:border-blue-700">
            <p className="text-sm sm:text-base font-bold text-blue-700 dark:text-blue-300">💳 Advance Payments (20%)</p>
            <p className="text-2xl sm:text-3xl font-bold text-blue-700 dark:text-blue-400 mt-2 sm:mt-3">
              {filteredPayments.filter(p => p.paymentType === 'advance').length}
            </p>
            <p className="text-xs sm:text-sm text-blue-600 dark:text-blue-300 mt-2">
              ₹{filteredPayments.filter(p => p.paymentType === 'advance').reduce((sum, p) => sum + (p.amount || 0), 0).toLocaleString()}
            </p>
          </div>
          
          <div className="bg-gradient-to-br from-orange-50 to-orange-100 dark:from-orange-900/40 dark:to-orange-900/20 rounded-lg p-4 sm:p-6 border-2 border-orange-300 dark:border-orange-700">
            <p className="text-sm sm:text-base font-bold text-orange-700 dark:text-orange-300">💰 Manual Payments (80%)</p>
            <p className="text-2xl sm:text-3xl font-bold text-orange-700 dark:text-orange-400 mt-2 sm:mt-3">
              {filteredPayments.filter(p => p.paymentType === 'manual').length}
            </p>
            <p className="text-xs sm:text-sm text-orange-600 dark:text-orange-300 mt-2">
              ₹{filteredPayments.filter(p => p.paymentType === 'manual').reduce((sum, p) => sum + (p.amount || 0), 0).toLocaleString()}
            </p>
          </div>

          <div className="bg-green-50 dark:bg-green-900/20 rounded-lg p-4 sm:p-6 border border-green-200 dark:border-green-700">
            <p className="text-sm sm:text-base text-green-700 dark:text-green-300 font-semibold">Total Revenue</p>
            <p className="text-2xl sm:text-3xl font-bold text-green-700 dark:text-green-400 mt-2 sm:mt-3">
              ₹{filteredPayments.filter(p => p.status === 'success').reduce((sum, p) => sum + (p.totalAmount || p.amount || 0), 0).toLocaleString()}
            </p>
          </div>

          <div className="bg-purple-50 dark:bg-purple-900/20 rounded-lg p-4 sm:p-6 border border-purple-200 dark:border-purple-700">
            <p className="text-sm sm:text-base text-purple-700 dark:text-purple-300 font-semibold">Cash Payments</p>
            <p className="text-2xl sm:text-3xl font-bold text-purple-700 dark:text-purple-400 mt-2 sm:mt-3">
              {filteredPayments.filter(p => p.paymentType === 'manual' && p.paymentMethod === 'cash').length}
            </p>
            <p className="text-xs sm:text-sm text-purple-600 dark:text-purple-300 mt-2">
              ₹{filteredPayments.filter(p => p.paymentType === 'manual' && p.paymentMethod === 'cash').reduce((sum, p) => sum + (p.amount || 0), 0).toLocaleString()}
            </p>
          </div>
        </div>

        {/* Filters */}
        <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-4 sm:p-6 space-y-4">
          <div className="bg-blue-50 dark:bg-blue-900/20 border-l-4 border-blue-500 p-3 rounded">
            <p className="text-sm text-blue-800 dark:text-blue-200">
              <strong>📊 Payment Transaction History</strong> - Showing all payment transactions including Razorpay (20% advance) and manual payments (80% balance)
            </p>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-3 sm:gap-4">
            <div className="relative">
              <Search className="absolute left-3 top-3 text-gray-400" size={18} />
              <input
                type="text"
                placeholder="Search by name, email, booking ID..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-10 pr-4 py-2 text-sm border border-gray-300 dark:border-gray-600 rounded-lg dark:bg-gray-700 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>
            <select
              value={paymentTypeFilter}
              onChange={(e) => setPaymentTypeFilter(e.target.value)}
              className="px-4 py-2 text-sm border border-gray-300 dark:border-gray-600 rounded-lg dark:bg-gray-700 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500 font-semibold"
            >
              <option value="all">All Payment Types</option>
              <option value="advance">💳 Advance Payments (20%)</option>
              <option value="manual">💰 Manual Payments (80%)</option>
            </select>
            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              className="px-4 py-2 text-sm border border-gray-300 dark:border-gray-600 rounded-lg dark:bg-gray-700 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500 font-semibold"
            >
              <option value="all">✓ All Status</option>
              <option value="success">✓ Successful</option>
              <option value="pending">⏳ Pending</option>
              <option value="failed">❌ Failed</option>
            </select>
          </div>
        </div>

        {/* Payments Table - Responsive */}
        <div className="bg-white dark:bg-gray-800 rounded-lg shadow overflow-hidden">
          {loading ? (
            <div className="p-6 sm:p-8 text-center text-gray-500 text-sm">Loading payments...</div>
          ) : filteredPayments.filter(p => statusFilter === 'all' || p.status === statusFilter).length === 0 ? (
            <div className="p-6 sm:p-8 text-center text-gray-500 text-sm">No {statusFilter === 'all' ? '' : statusFilter} payments found</div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-xs sm:text-sm">
                <thead className="bg-gray-100 dark:bg-gray-700 border-b border-gray-200 dark:border-gray-600">
                  <tr>
                    <th className="px-2 sm:px-4 py-2 sm:py-3 text-left font-semibold text-gray-900 dark:text-white">
                      Transaction ID
                    </th>
                    <th className="px-2 sm:px-4 py-2 sm:py-3 text-left font-semibold text-gray-900 dark:text-white">
                      User
                    </th>
                    <th className="px-2 sm:px-4 py-2 sm:py-3 text-left font-semibold text-gray-900 dark:text-white">
                      Amount
                    </th>
                    <th className="px-2 sm:px-4 py-2 sm:py-3 text-left font-semibold text-gray-900 dark:text-white">
                      Method
                    </th>
                    <th className="hidden sm:table-cell px-2 sm:px-4 py-2 sm:py-3 text-left font-semibold text-gray-900 dark:text-white">
                      Type
                    </th>
                    <th className="px-2 sm:px-4 py-2 sm:py-3 text-left font-semibold text-gray-900 dark:text-white">
                      Status
                    </th>
                    <th className="hidden sm:table-cell px-2 sm:px-4 py-2 sm:py-3 text-left font-semibold text-gray-900 dark:text-white">
                      Date
                    </th>
                    <th className="px-2 sm:px-4 py-2 sm:py-3 text-center font-semibold text-gray-900 dark:text-white">
                      Actions
                    </th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-200 dark:divide-gray-600">
                  {filteredPayments.filter(p => statusFilter === 'all' || p.status === statusFilter).map((payment) => {
                    const userName = typeof payment.user === 'object' ? payment.user?.name : payment.user;
                    const userEmail = typeof payment.user === 'object' ? payment.user?.email : 'N/A';
                    const transId = payment.transactionId || payment.razorpayPaymentId || 'N/A';
                    
                    return (
                    <tr
                      key={payment._id}
                      className="hover:bg-gray-50 dark:hover:bg-gray-700 transition"
                    >
                      <td className="px-2 sm:px-4 py-2 sm:py-3 text-gray-900 dark:text-white font-medium text-xs">
                        <div className="truncate" title={transId}>{transId.substring(0, 10)}...</div>
                      </td>
                      <td className="px-2 sm:px-4 py-2 sm:py-3 text-gray-600 dark:text-gray-400">
                        <div className="text-xs sm:text-sm">
                          <p className="font-medium text-gray-900 dark:text-white truncate">{userName || 'Unknown'}</p>
                          <p className="text-xs text-gray-500 truncate hidden sm:block">{userEmail}</p>
                        </div>
                      </td>
                      <td className="px-2 sm:px-4 py-2 sm:py-3 text-gray-900 dark:text-white font-semibold text-xs sm:text-sm">
                        ₹{payment.amount || 0}
                      </td>
                      <td className="px-2 sm:px-4 py-2 sm:py-3">
                        <span className={`inline-block px-2 sm:px-3 py-1 rounded-full text-xs font-semibold ${getPaymentMethodBadge(payment).color}`}>
                          {getPaymentMethodBadge(payment).label}
                        </span>
                      </td>
                      <td className="hidden sm:table-cell px-2 sm:px-4 py-2 sm:py-3 text-gray-600 dark:text-gray-400 text-xs">
                        {payment.paymentType || 'N/A'}
                      </td>
                      <td className="px-2 sm:px-4 py-2 sm:py-3">
                        <div className="flex items-center gap-1">
                          {getStatusIcon(payment.status)}
                          <span className={`px-2 sm:px-3 py-0.5 sm:py-1 rounded-full text-xs font-semibold ${getStatusColor(payment.status)}`}>
                            {payment.status}
                          </span>
                        </div>
                      </td>
                      <td className="hidden sm:table-cell px-2 sm:px-4 py-2 sm:py-3 text-gray-600 dark:text-gray-400 text-xs">
                        <div>
                          {new Date(payment.createdAt).toLocaleDateString()}
                        </div>
                        <div className="text-xs text-gray-500 dark:text-gray-500">
                          {new Date(payment.createdAt).toLocaleTimeString('en-IN', { hour: '2-digit', minute: '2-digit' })}
                        </div>
                      </td>
                      <td className="px-2 sm:px-4 py-2 sm:py-3 text-center">
                        <button
                          onClick={() => setSelectedPayment(payment)}
                          className="text-blue-500 hover:text-blue-700 transition"
                          title="View Details"
                        >
                          <Eye size={16} />
                        </button>
                      </td>
                    </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          )}
        </div>

        {/* Payment Detail Modal */}
        {selectedPayment && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-3 sm:p-4 z-50">
            <div className="bg-white dark:bg-gray-800 rounded-lg max-w-2xl w-full p-4 sm:p-6 space-y-4 max-h-[90vh] overflow-y-auto">
              <div className="flex flex-col sm:flex-row sm:items-center gap-3 mb-4">
                <h2 className="text-xl sm:text-2xl font-bold text-gray-900 dark:text-white flex-1">
                  Payment Details
                </h2>
                <div className="flex items-center gap-2">
                  {getStatusIcon(selectedPayment.status)}
                  <span className={`px-3 py-1 rounded-full text-sm font-semibold ${getStatusColor(selectedPayment.status)}`}>
                    {selectedPayment.status}
                  </span>
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 sm:gap-4 text-gray-700 dark:text-gray-300 text-sm">
                <p className="break-words">
                  <strong>Transaction ID:</strong>
                  <br className="sm:hidden" />
                  <span className="text-xs sm:text-sm">{selectedPayment.transactionId || selectedPayment.razorpayPaymentId || 'N/A'}</span>
                </p>
                <p>
                  <strong>Amount:</strong> ₹{selectedPayment.amount || 0}
                </p>
                <p>
                  <strong>Currency:</strong> {selectedPayment.currency || 'INR'}
                </p>
                <p>
                  <strong>Method:</strong>
                  {selectedPayment.razorpayPaymentId ? (
                    <span className="ml-2">
                      {selectedPayment.paymentDetails?.method 
                        ? selectedPayment.paymentDetails.method.charAt(0).toUpperCase() + selectedPayment.paymentDetails.method.slice(1)
                        : selectedPayment.paymentMethod?.charAt(0).toUpperCase() + selectedPayment.paymentMethod?.slice(1) || 'Card'}
                      {' '}<strong className="text-green-600 dark:text-green-400">(Razorpay)</strong>
                    </span>
                  ) : (
                    <span className="ml-2">
                      {selectedPayment.paymentMethod?.charAt(0).toUpperCase() + selectedPayment.paymentMethod?.slice(1) || 'N/A'}
                      {' '}<strong className="text-orange-600 dark:text-orange-400">(Manual)</strong>
                    </span>
                  )}
                </p>
                <p>
                  <strong>Type:</strong> {selectedPayment.paymentType || 'N/A'}
                </p>
                <p>
                  <strong>User:</strong> {selectedPayment.user?.name || 'Unknown User'}
                </p>
                <p className="sm:col-span-2">
                  <strong>Email:</strong> {typeof selectedPayment.user === 'object' ? selectedPayment.user?.email : 'N/A'}
                </p>
                <p className="sm:col-span-2">
                  <strong>Phone:</strong> {typeof selectedPayment.user === 'object' ? selectedPayment.user?.phone : 'N/A'}
                </p>

                {/* Razorpay Payment Details */}
                {selectedPayment.razorpayPaymentId && selectedPayment.paymentDetails && (
                  <div className="sm:col-span-2 bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-700 rounded-lg p-3">
                    <p className="text-xs font-bold text-blue-800 dark:text-blue-200 mb-2">💳 Razorpay Payment Details:</p>
                    <div className="space-y-1 text-xs">
                      {selectedPayment.paymentDetails.email && (
                        <div className="flex justify-between">
                          <span>Email:</span>
                          <span className="font-semibold">{selectedPayment.paymentDetails.email}</span>
                        </div>
                      )}
                      {selectedPayment.paymentDetails.contact && (
                        <div className="flex justify-between">
                          <span>Contact:</span>
                          <span className="font-semibold">{selectedPayment.paymentDetails.contact}</span>
                        </div>
                      )}
                      {selectedPayment.paymentDetails.vpa && (
                        <div className="flex justify-between">
                          <span>UPI ID:</span>
                          <span className="font-semibold">{selectedPayment.paymentDetails.vpa}</span>
                        </div>
                      )}
                      {selectedPayment.paymentDetails.bank && (
                        <div className="flex justify-between">
                          <span>Bank:</span>
                          <span className="font-semibold">{selectedPayment.paymentDetails.bank}</span>
                        </div>
                      )}
                      {selectedPayment.paymentDetails.wallet && (
                        <div className="flex justify-between">
                          <span>Wallet:</span>
                          <span className="font-semibold">{selectedPayment.paymentDetails.wallet}</span>
                        </div>
                      )}
                    </div>
                  </div>
                )}
                
                {selectedPayment.paymentType === 'manual' && (
                  <>
                    <p className="sm:col-span-2">
                      <strong>Booking ID:</strong> #{selectedPayment.bookingId}
                    </p>
                    <p className="sm:col-span-2">
                      <strong>Payment Notes:</strong> {selectedPayment.paymentNotes || 'No notes'}
                    </p>
                    <div className="sm:col-span-2 bg-amber-50 dark:bg-amber-900/20 border border-amber-200 dark:border-amber-700 rounded-lg p-3">
                      <p className="text-xs font-bold text-amber-800 dark:text-amber-200 mb-2">📊 Payment Breakdown:</p>
                      <div className="space-y-1 text-xs">
                        <div className="flex justify-between">
                          <span>20% Advance (Razorpay):</span>
                          <span className="font-semibold">₹{selectedPayment.paidAmount || 0}</span>
                        </div>
                        <div className="flex justify-between">
                          <span>80% Balance (Manual):</span>
                          <span className="font-semibold">₹{selectedPayment.amount || 0}</span>
                        </div>
                        <div className="border-t border-amber-300 pt-1 flex justify-between font-bold">
                          <span>Total Ride Amount:</span>
                          <span>₹{selectedPayment.totalAmount || (selectedPayment.paidAmount + selectedPayment.amount) || 0}</span>
                        </div>
                      </div>
                    </div>
                  </>
                )}

                {selectedPayment.razorpayOrderId && (
                  <p className="sm:col-span-2 break-words">
                    <strong>Razorpay Order ID:</strong>
                    <br className="sm:hidden" />
                    <span className="text-xs sm:text-sm">{selectedPayment.razorpayOrderId}</span>
                  </p>
                )}
                {selectedPayment.razorpayPaymentId && (
                  <p className="sm:col-span-2 break-words">
                    <strong>Razorpay Payment ID:</strong>
                    <br className="sm:hidden" />
                    <span className="text-xs sm:text-sm">{selectedPayment.razorpayPaymentId}</span>
                  </p>
                )}
                <p className="sm:col-span-2">
                  <strong>Date & Time:</strong>
                  <br className="sm:hidden" />
                  {selectedPayment.createdAt ? new Date(selectedPayment.createdAt).toLocaleString() : 'N/A'}
                </p>
              </div>

              {selectedPayment.status === 'failed' && (
                <div className="p-3 sm:p-4 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-700 rounded-lg">
                  <p className="text-xs sm:text-sm text-red-700 dark:text-red-300">
                    <strong>⚠️ Payment Failed:</strong> This payment could not be processed. Please contact the user to retry or use a different payment method.
                  </p>
                </div>
              )}

              {selectedPayment.status === 'success' && (
                <div className="p-3 sm:p-4 bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-700 rounded-lg">
                  <p className="text-xs sm:text-sm text-green-700 dark:text-green-300">
                    <strong>✓ Payment Successful:</strong> This payment has been completed successfully.
                  </p>
                </div>
              )}

              <button
                onClick={() => setSelectedPayment(null)}
                className="w-full bg-blue-500 hover:bg-blue-600 text-white px-4 py-2 rounded-lg transition text-sm"
              >
                Close
              </button>
            </div>
          </div>
        )}
      </div>
    </AdminLayout>
  );
};

export default PaymentsPage;
