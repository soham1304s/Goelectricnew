import { useEffect, useMemo, useState } from 'react';
import { Search, AlertCircle, CheckCircle, Clock, RefreshCw, Building2 } from 'lucide-react';
import AdminLayout from './AdminLayout';
import axios from 'axios';

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || '/api';

const PendingPaymentsDashboard = () => {
  const [pendingPayments, setPendingPayments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('partial'); // all, pending, partial
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

  // Fetch pending payments
  const fetchPendingPayments = async (page = 1) => {
    try {
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
        console.log('✅ Pending payments loaded:', response.data.data);
      }
    } catch (error) {
      console.error('❌ Error fetching pending payments:', error);
      setErrorMessage('Error loading pending payments: ' + error.message);
    } finally {
      setLoading(false);
    }
  };

  // Initial fetch
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
        payment.bookingId.includes(searchTerm) ||
        payment.user?.name?.toLowerCase().includes(normalizedSearch) ||
        payment.user?.email?.toLowerCase().includes(normalizedSearch) ||
        payment.user?.phone?.includes(searchTerm)
      );
    }

    return filtered;
  }, [searchTerm, statusFilter, pendingPayments]);

  // Open collect modal with pre-filled amount
  const handleOpenCollectModal = (booking) => {
    setSelectedBooking(booking);
    setCollectAmount(booking.remainingAmount.toString());
    setPaymentMethod('cash');
    setNotes('');
    setShowCollectModal(true);
    setSuccessMessage('');
  };

  // Toggle expanded row
  const toggleExpandedRow = (bookingId) => {
    const newExpandedRows = new Set(expandedRows);
    if (newExpandedRows.has(bookingId)) {
      newExpandedRows.delete(bookingId);
    } else {
      newExpandedRows.add(bookingId);
    }
    setExpandedRows(newExpandedRows);
  };

  // Submit payment collection
  const handleSubmitPayment = async (e) => {
    e.preventDefault();
    if (!selectedBooking || !collectAmount) {
      setErrorMessage('Please enter payment amount');
      return;
    }

    setSubmitting(true);
    try {
      // Step 1: Collect payment
      const paymentResponse = await axios.post(
        `${API_BASE_URL}/admin/bookings/${selectedBooking._id}/collect-payment`,
        {
          paymentMethod,
          notes,
          paidAmount: parseFloat(collectAmount),
        },
        {
          headers: {
            Authorization: `Bearer ${localStorage.getItem('token')}`,
          },
        }
      );

      if (paymentResponse.data.success) {
        console.log('✅ Payment collected:', paymentResponse.data);
        
        // Step 2: Automatically complete the ride
        try {
          const completeResponse = await axios.patch(
            `${API_BASE_URL}/admin/ride-bookings/${selectedBooking._id}/complete`,
            {
              completionNotes: `Payment collected via ${paymentMethod.toUpperCase()}. ${notes}`,
            },
            {
              headers: {
                Authorization: `Bearer ${localStorage.getItem('token')}`,
              },
            }
          );

          if (completeResponse.data.success) {
            console.log('✅ Ride marked as complete:', completeResponse.data);
            setSuccessMessage(`✅ Payment collected (₹${collectAmount}) & Ride automatically completed!`);
          }
        } catch (completeError) {
          console.error('⚠️ Payment collected but auto-complete failed:', completeError);
          // Still show success for payment collection
          setSuccessMessage(`✅ Payment of ₹${collectAmount} collected successfully! (Ride completion manual)`);
        }

        setShowCollectModal(false);
        setCollectAmount('');
        setNotes('');
        
        // Refresh pending payments
        setTimeout(() => {
          void fetchPendingPayments(pagination.page);
          setSuccessMessage('');
        }, 2000);
      }
    } catch (error) {
      console.error('❌ Error collecting payment:', error);
      setErrorMessage('Error collecting payment: ' + (error.response?.data?.message || error.message));
    }
    setSubmitting(false);
  };

  // Calculate totals
  const totalOutstanding = filteredPayments.reduce((sum, p) => sum + p.remainingAmount, 0);
  const totalPending = filteredPayments.filter(p => p.paymentStatus === 'pending').length;
  const totalPartial = filteredPayments.filter(p => p.paymentStatus === 'partial').length;

  const getStatusBadge = (paymentStatus) => {
    if (paymentStatus === 'pending') {
      return (
        <span className="inline-flex items-center gap-2 px-3 py-1 bg-red-100 text-red-700 dark:bg-red-900 dark:text-red-300 rounded-lg text-sm font-medium">
          <Clock size={14} />
          No Payment Yet
        </span>
      );
    }
    return (
      <span className="inline-flex items-center gap-2 px-3 py-1 bg-yellow-100 text-yellow-700 dark:bg-yellow-900 dark:text-yellow-300 rounded-lg text-sm font-medium">
        <AlertCircle size={14} />
        Partial (20% Paid)
      </span>
    );
  };

  return (
    <AdminLayout>
      <div className="p-6">
        {/* Header */}
        <div className="mb-6">
          <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-2">
            Pending 80% Balance Collections
          </h1>
          <p className="text-gray-600 dark:text-gray-400">
            Collect remaining balance from completed rides where 20% advance was paid
          </p>
        </div>

        {/* Summary Cards */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
          <div className="bg-white dark:bg-gray-800 rounded-lg p-4 shadow">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-gray-600 dark:text-gray-400 text-sm">Total Outstanding</p>
                <p className="text-2xl font-bold text-gray-900 dark:text-white">
                  ₹{totalOutstanding.toFixed(0)}
                </p>
              </div>
              <Building2 size={32} className="text-blue-500" />
            </div>
          </div>

          <div className="bg-white dark:bg-gray-800 rounded-lg p-4 shadow">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-gray-600 dark:text-gray-400 text-sm">No Payment Yet</p>
                <p className="text-2xl font-bold text-red-600">{totalPending}</p>
              </div>
              <Clock size={32} className="text-red-500" />
            </div>
          </div>

          <div className="bg-white dark:bg-gray-800 rounded-lg p-4 shadow">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-gray-600 dark:text-gray-400 text-sm">20% Paid Only</p>
                <p className="text-2xl font-bold text-yellow-600">{totalPartial}</p>
              </div>
              <AlertCircle size={32} className="text-yellow-500" />
            </div>
          </div>

          <div className="bg-white dark:bg-gray-800 rounded-lg p-4 shadow">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-gray-600 dark:text-gray-400 text-sm">Last Updated</p>
                <p className="text-sm font-mono text-gray-700 dark:text-gray-300">
                  {lastUpdated ? lastUpdated.toLocaleTimeString() : 'N/A'}
                </p>
              </div>
              <RefreshCw size={32} className="text-green-500" />
            </div>
          </div>
        </div>

        {/* Success Message */}
        {successMessage && (
          <div className="mb-4 p-4 bg-green-100 border border-green-400 text-green-700 dark:bg-green-900 dark:border-green-700 dark:text-green-300 rounded">
            {successMessage}
          </div>
        )}

        {/* Error Message */}
        {errorMessage && (
          <div className="mb-4 p-4 bg-red-100 border border-red-400 text-red-700 dark:bg-red-900 dark:border-red-700 dark:text-red-300 rounded">
            {errorMessage}
            <button
              onClick={() => setErrorMessage('')}
              className="ml-4 text-sm underline hover:no-underline"
            >
              Dismiss
            </button>
          </div>
        )}

        {/* Controls */}
        <div className="mb-6 flex gap-4">
          <div className="flex-1">
            <div className="relative">
              <Search
                size={20}
                className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400"
              />
              <input
                type="text"
                placeholder="Search by Booking ID, User name, email, or phone..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-10 pr-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg dark:bg-gray-700 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>
          </div>

          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            className="px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg dark:bg-gray-700 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
          >
            <option value="partial">20% Paid Only (Ready to Collect)</option>
            <option value="pending">No Payment Yet</option>
            <option value="all">All Payments</option>
          </select>

          <button
            onClick={() => fetchPendingPayments(1)}
            className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg flex items-center gap-2 transition"
          >
            <RefreshCw size={16} />
            Refresh
          </button>
        </div>

        {/* Loading */}
        {loading ? (
          <div className="flex justify-center items-center h-64">
            <div className="text-center">
              <RefreshCw size={32} className="animate-spin text-blue-500 mx-auto mb-2" />
              <p className="text-gray-600 dark:text-gray-400">Loading pending payments...</p>
            </div>
          </div>
        ) : filteredPayments.length === 0 ? (
          <div className="text-center py-12 bg-gray-50 dark:bg-gray-800 rounded-lg">
            <CheckCircle size={48} className="mx-auto text-green-500 mb-4" />
            <p className="text-gray-600 dark:text-gray-400 text-lg">
              All payments collected!
            </p>
            <p className="text-gray-500 dark:text-gray-500 text-sm mt-2">
              No pending payments to collect.
            </p>
          </div>
        ) : (
          <div className="overflow-x-auto bg-white dark:bg-gray-800 rounded-lg shadow">
            <table className="w-full">
              <thead className="bg-gray-100 dark:bg-gray-700">
                <tr>
                  <th className="px-6 py-3 text-left text-sm font-semibold text-gray-900 dark:text-white w-8">
                    
                  </th>
                  <th className="px-6 py-3 text-left text-sm font-semibold text-gray-900 dark:text-white">
                    Booking
                  </th>
                  <th className="px-6 py-3 text-left text-sm font-semibold text-gray-900 dark:text-white">
                    User
                  </th>
                  <th className="px-6 py-3 text-left text-sm font-semibold text-gray-900 dark:text-white">
                    Fare
                  </th>
                  <th className="px-6 py-3 text-left text-sm font-semibold text-gray-900 dark:text-white">
                    Status
                  </th>
                  <th className="px-6 py-3 text-left text-sm font-semibold text-gray-900 dark:text-white">
                    Paid / Remaining
                  </th>
                  <th className="px-6 py-3 text-left text-sm font-semibold text-gray-900 dark:text-white">
                    Action
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-200 dark:divide-gray-700">
                {filteredPayments.map((booking) => (
                  <React.Fragment key={booking._id}>
                    <tr className="hover:bg-gray-50 dark:hover:bg-gray-700 cursor-pointer">
                      <td className="px-6 py-4 text-center">
                        <button
                          onClick={() => toggleExpandedRow(booking._id)}
                          className="text-blue-600 hover:text-blue-800 dark:text-blue-400 dark:hover:text-blue-200 font-bold text-lg"
                        >
                          {expandedRows.has(booking._id) ? '▼' : '▶'}
                        </button>
                      </td>
                      <td className="px-6 py-4">
                        <div className="font-mono text-sm font-semibold text-gray-900 dark:text-white">
                          {booking.bookingId}
                        </div>
                        <div className="text-xs text-gray-500 dark:text-gray-400">
                          {booking.rideType} • {booking.distance?.toFixed(1) || 'N/A'} km
                        </div>
                      </td>
                      <td className="px-6 py-4">
                        <div className="text-sm font-medium text-gray-900 dark:text-white font-bold">
                          {booking.user?.name || `${booking.user?.firstName || ''} ${booking.user?.lastName || ''}`.trim() || 'N/A'}
                        </div>
                        <div className="text-xs text-gray-500 dark:text-gray-400">
                          {booking.user?.phone || 'N/A'}
                        </div>
                      </td>
                      <td className="px-6 py-4">
                        <div className="text-lg font-bold text-gray-900 dark:text-white">
                          ₹{booking.totalFare || 0}
                        </div>
                      </td>
                      <td className="px-6 py-4">
                        {getStatusBadge(booking.paymentStatus)}
                      </td>
                      <td className="px-6 py-4">
                        <div className="text-sm">
                          <div className="text-green-600 dark:text-green-400 font-semibold">
                            ₹{booking.paidAmount || 0} ✓
                          </div>
                          <div className="text-red-600 dark:text-red-400 font-semibold">
                            ₹{booking.remainingAmount || 0} pending
                          </div>
                        </div>
                      </td>
                      <td className="px-6 py-4">
                        <button
                          onClick={() => handleOpenCollectModal(booking)}
                          className="px-4 py-2 bg-gradient-to-r from-emerald-600 to-emerald-700 hover:from-emerald-700 hover:to-emerald-800 text-white text-sm font-bold rounded transition shadow-md hover:shadow-lg flex items-center gap-2"
                        >
                          <CheckCircle size={16} />
                          Collect & Complete
                        </button>
                      </td>
                    </tr>

                    {/* Expandable Details Row */}
                    {expandedRows.has(booking._id) && (
                      <tr className="bg-blue-50 dark:bg-blue-900/20 border-t-2 border-b-2 border-blue-300 dark:border-blue-700">
                        <td colSpan="7" className="px-6 py-6">
                          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                            {/* Left Column - Ride Details */}
                            <div className="space-y-4">
                              <h3 className="text-lg font-bold text-gray-900 dark:text-white mb-3">Ride Details</h3>
                              
                              <div className="bg-white dark:bg-gray-800 p-4 rounded-lg border border-gray-200 dark:border-gray-700">
                                <p className="text-xs text-gray-600 dark:text-gray-400 font-semibold uppercase mb-1">Car Type Selected</p>
                                <p className="text-lg font-bold text-gray-900 dark:text-white uppercase tracking-wide">{booking.cabType || booking.carType || 'N/A'}</p>
                              </div>

                              <div className="bg-white dark:bg-gray-800 p-4 rounded-lg border border-gray-200 dark:border-gray-700">
                                <p className="text-xs text-gray-600 dark:text-gray-400 font-semibold uppercase mb-1">Distance Traveled</p>
                                <p className="text-lg font-bold text-gray-900 dark:text-white">{booking.distance?.toFixed(2) || 'N/A'} km</p>
                              </div>

                              <div className="bg-white dark:bg-gray-800 p-4 rounded-lg border border-gray-200 dark:border-gray-700">
                                <p className="text-xs text-gray-600 dark:text-gray-400 font-semibold uppercase mb-3">Fare Breakdown</p>
                                <div className="space-y-2">
                                  <div className="flex justify-between text-sm">
                                    <span className="text-gray-700 dark:text-gray-300">Per KM Rate:</span>
                                    <span className="font-bold text-gray-900 dark:text-white">₹{booking.perKmRate?.toFixed(2) || 0}/km</span>
                                  </div>
                                  <div className="flex justify-between text-sm">
                                    <span className="text-gray-700 dark:text-gray-300">Distance:</span>
                                    <span className="font-bold text-gray-900 dark:text-white">{booking.distance?.toFixed(2) || 0} km</span>
                                  </div>
                                  <div className="border-t border-gray-200 dark:border-gray-700 pt-2 flex justify-between">
                                    <span className="font-semibold text-gray-700 dark:text-gray-300">Total Fare (from system):</span>
                                    <span className="font-bold text-lg text-blue-600 dark:text-blue-400">₹{booking.totalFare?.toFixed(2) || 0}</span>
                                  </div>
                                </div>
                              </div>
                              
                              <div className="bg-white dark:bg-gray-800 p-4 rounded-lg border border-gray-200 dark:border-gray-700">
                                <p className="text-xs text-gray-600 dark:text-gray-400 font-semibold uppercase mb-1">Scheduled Date & Time</p>
                                <p className="text-sm font-bold text-gray-900 dark:text-white">
                                  {booking.scheduledDate 
                                    ? new Date(booking.scheduledDate).toLocaleDateString('en-IN', { 
                                        weekday: 'short', 
                                        year: 'numeric', 
                                        month: 'short', 
                                        day: 'numeric' 
                                      })
                                    : 'N/A'}
                                </p>
                                <p className="text-xs text-gray-500 dark:text-gray-400 mt-1 font-semibold">
                                  {booking.scheduledDate 
                                    ? new Date(booking.scheduledDate).toLocaleTimeString('en-IN', { 
                                        hour: '2-digit', 
                                        minute: '2-digit',
                                        hour12: true
                                      })
                                    : 'N/A'}
                                </p>
                              </div>

                              <div className="bg-white dark:bg-gray-800 p-4 rounded-lg border border-gray-200 dark:border-gray-700">
                                <p className="text-xs text-gray-600 dark:text-gray-400 font-semibold uppercase mb-2">Pickup Location</p>
                                <p className="text-sm text-gray-900 dark:text-white font-semibold">
                                  {booking.pickupLocation || 'N/A'}
                                </p>
                              </div>

                              <div className="bg-white dark:bg-gray-800 p-4 rounded-lg border border-gray-200 dark:border-gray-700">
                                <p className="text-xs text-gray-600 dark:text-gray-400 font-semibold uppercase mb-2">Drop Location</p>
                                <p className="text-sm text-gray-900 dark:text-white font-semibold">
                                  {booking.dropLocation || 'N/A'}
                                </p>
                              </div>
                            </div>

                            {/* Right Column - Payment & User Details */}
                            <div className="space-y-4">
                              <h3 className="text-lg font-bold text-gray-900 dark:text-white mb-3">Payment & User Details</h3>
                              
                              <div className="bg-gradient-to-br from-blue-50 to-cyan-50 dark:from-blue-900/30 dark:to-cyan-900/30 p-4 rounded-lg border-2 border-blue-300 dark:border-blue-600">
                                <p className="text-xs text-blue-600 dark:text-blue-300 font-bold uppercase mb-3">Actual Total Fare</p>
                                <div className="space-y-2">
                                  <div className="flex justify-between items-center">
                                    <span className="text-sm text-blue-700 dark:text-blue-200">Car Type:</span>
                                    <span className="font-bold text-lg text-gray-900 dark:text-white uppercase">{booking.cabType || 'N/A'}</span>
                                  </div>
                                  <div className="flex justify-between items-center">
                                    <span className="text-sm text-blue-700 dark:text-blue-200">Distance:</span>
                                    <span className="font-bold text-lg text-gray-900 dark:text-white">{booking.distance?.toFixed(2) || 0} km</span>
                                  </div>
                                  <div className="flex justify-between items-center">
                                    <span className="text-sm text-blue-700 dark:text-blue-200">Rate/KM:</span>
                                    <span className="font-bold text-lg text-gray-900 dark:text-white">₹{booking.perKmRate?.toFixed(2) || 0}</span>
                                  </div>
                                  <div className="border-t-2 border-blue-300 dark:border-blue-600 pt-3 mt-3 flex justify-between items-center">
                                    <span className="text-sm font-bold text-blue-800 dark:text-blue-100">TOTAL FARE:</span>
                                    <span className="font-bold text-2xl text-blue-600 dark:text-blue-400">₹{booking.totalFare?.toFixed(2) || 0}</span>
                                  </div>
                                </div>
                              </div>

                              <div className="bg-white dark:bg-gray-800 p-4 rounded-lg border border-gray-200 dark:border-gray-700">
                                <p className="text-xs text-gray-600 dark:text-gray-400 font-semibold uppercase mb-3">Payment Status Breakdown</p>
                                <div className="space-y-2">
                                  <div className="flex justify-between">
                                    <span className="text-sm text-gray-700 dark:text-gray-300">Total Fare:</span>
                                    <span className="font-bold text-gray-900 dark:text-white">₹{booking.totalFare?.toFixed(2) || 0}</span>
                                  </div>
                                  <div className="flex justify-between bg-green-50 dark:bg-green-900/20 p-2 rounded">
                                    <span className="text-sm text-green-700 dark:text-green-300 font-semibold">20% Advance (Paid):</span>
                                    <span className="font-bold text-green-600 dark:text-green-400">₹{(booking.totalFare * 0.2)?.toFixed(2) || 0}</span>
                                  </div>
                                  <div className="flex justify-between">
                                    <span className="text-sm text-gray-700 dark:text-gray-300">Already Paid (Advance):</span>
                                    <span className="font-bold text-green-600 dark:text-green-400">₹{booking.paidAmount?.toFixed(2) || 0}</span>
                                  </div>
                                  <div className="border-t border-gray-200 dark:border-gray-700 pt-2 flex justify-between bg-red-50 dark:bg-red-900/20 p-2 rounded">
                                    <span className="text-sm font-bold text-red-700 dark:text-red-300">80% Balance Due Now:</span>
                                    <span className="font-bold text-xl text-red-600 dark:text-red-400">₹{booking.remainingAmount?.toFixed(2) || 0}</span>
                                  </div>
                                </div>
                              </div>

                              <div className="bg-white dark:bg-gray-800 p-4 rounded-lg border border-gray-200 dark:border-gray-700">
                                <p className="text-xs text-gray-600 dark:text-gray-400 font-semibold uppercase mb-2">User Details</p>
                                <div className="space-y-2">
                                  <div>
                                    <p className="text-xs text-gray-500 dark:text-gray-400">Name:</p>
                                    <p className="text-sm font-semibold text-gray-900 dark:text-white">
                                      {booking.user?.name || `${booking.user?.firstName || ''} ${booking.user?.lastName || ''}`.trim() || 'N/A'}
                                    </p>
                                  </div>
                                  <div>
                                    <p className="text-xs text-gray-500 dark:text-gray-400">Email:</p>
                                    <p className="text-sm text-gray-900 dark:text-white break-all">{booking.user?.email || 'N/A'}</p>
                                  </div>
                                  <div>
                                    <p className="text-xs text-gray-500 dark:text-gray-400">Phone:</p>
                                    <p className="text-sm font-semibold text-gray-900 dark:text-white">{booking.user?.phone || 'N/A'}</p>
                                  </div>
                                </div>
                              </div>

                              <div className="bg-white dark:bg-gray-800 p-4 rounded-lg border border-gray-200 dark:border-gray-700">
                                <p className="text-xs text-gray-600 dark:text-gray-400 font-semibold uppercase mb-2">Booking Created</p>
                                <p className="text-sm text-gray-900 dark:text-white">
                                  {booking.createdAt 
                                    ? new Date(booking.createdAt).toLocaleDateString('en-IN', {
                                        year: 'numeric',
                                        month: 'short',
                                        day: 'numeric'
                                      })
                                    : 'N/A'}
                                </p>
                                <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
                                  {booking.createdAt 
                                    ? new Date(booking.createdAt).toLocaleTimeString('en-IN')
                                    : 'N/A'}
                                </p>
                              </div>
                            </div>
                          </div>
                        </td>
                      </tr>
                    )}
                  </React.Fragment>
                ))}
              </tbody>
            </table>
          </div>
        )}

        {/* Pagination */}
        {pagination.totalPages > 1 && (
          <div className="mt-6 flex justify-between items-center">
            <p className="text-sm text-gray-600 dark:text-gray-400">
              Showing {filteredPayments.length} of {pagination.totalCount} pending payments
            </p>
            <div className="flex gap-2">
              <button
                onClick={() => fetchPendingPayments(Math.max(1, pagination.page - 1))}
                disabled={pagination.page === 1}
                className="px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg disabled:opacity-50 dark:text-white"
              >
                Previous
              </button>
              <span className="px-4 py-2 text-gray-600 dark:text-gray-400">
                Page {pagination.page} of {pagination.totalPages}
              </span>
              <button
                onClick={() => fetchPendingPayments(Math.min(pagination.totalPages, pagination.page + 1))}
                disabled={pagination.page === pagination.totalPages}
                className="px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg disabled:opacity-50 dark:text-white"
              >
                Next
              </button>
            </div>
          </div>
        )}
      </div>

      {/* Collect Payment Modal */}
      {showCollectModal && selectedBooking && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className="bg-white dark:bg-gray-800 rounded-lg shadow-lg max-w-md w-full">
            <div className="border-b border-gray-200 dark:border-gray-700 p-6">
              <h2 className="text-xl font-bold text-gray-900 dark:text-white">
                Collect Payment
              </h2>
              <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">
                Booking: {selectedBooking.bookingId}
              </p>
            </div>

            <form onSubmit={handleSubmitPayment} className="p-6 space-y-4">
              {/* Booking Summary */}
              <div className="bg-gray-50 dark:bg-gray-700 p-4 rounded-lg">
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <p className="text-xs text-gray-600 dark:text-gray-400">Total Fare</p>
                    <p className="text-lg font-bold text-gray-900 dark:text-white">
                      ₹{selectedBooking.totalFare}
                    </p>
                  </div>
                  <div>
                    <p className="text-xs text-gray-600 dark:text-gray-400">Already Paid</p>
                    <p className="text-lg font-bold text-green-600 dark:text-green-400">
                      ₹{selectedBooking.paidAmount}
                    </p>
                  </div>
                  <div>
                    <p className="text-xs text-gray-600 dark:text-gray-400">Remaining</p>
                    <p className="text-lg font-bold text-red-600 dark:text-red-400">
                      ₹{selectedBooking.remainingAmount}
                    </p>
                  </div>
                </div>
              </div>

              {/* Amount Input */}
              <div>
                <label className="block text-sm font-medium text-gray-900 dark:text-white mb-2">
                  Payment Amount <span className="text-red-500">*</span>
                </label>
                <input
                  type="number"
                  value={collectAmount}
                  onChange={(e) => setCollectAmount(e.target.value)}
                  className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg dark:bg-gray-700 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
                  placeholder="0"
                  step="0.01"
                  min="0"
                  max={selectedBooking.remainingAmount}
                  required
                />
                <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
                  Max: ₹{selectedBooking.remainingAmount}
                </p>
              </div>

              {/* Payment Method */}
              <div>
                <label className="block text-sm font-medium text-gray-900 dark:text-white mb-2">
                  Payment Method <span className="text-red-500">*</span>
                </label>
                <select
                  value={paymentMethod}
                  onChange={(e) => setPaymentMethod(e.target.value)}
                  className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg dark:bg-gray-700 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
                >
                  <option value="cash">Cash</option>
                  <option value="upi">UPI</option>
                  <option value="wallet">Wallet</option>
                  <option value="razorpay">Razorpay</option>
                </select>
              </div>

              {/* Notes */}
              <div>
                <label className="block text-sm font-medium text-gray-900 dark:text-white mb-2">
                  Notes (Optional)
                </label>
                <textarea
                  value={notes}
                  onChange={(e) => setNotes(e.target.value)}
                  placeholder="e.g., Collected from driver, Paid at office, etc."
                  className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg dark:bg-gray-700 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500 resize-none"
                  rows="3"
                />
              </div>

              {/* Auto-Complete Info */}
              <div className="bg-blue-50 dark:bg-blue-900/30 border border-blue-200 dark:border-blue-700 rounded-lg p-3">
                <p className="text-sm text-blue-800 dark:text-blue-200 font-semibold mb-2">
                  <Zap size={14} className="inline mr-1" /> Auto-Complete Enabled
                </p>
                <p className="text-xs text-blue-700 dark:text-blue-300">
                  When you confirm this payment, the ride will <strong>automatically be marked as COMPLETED</strong> and the user's account will be updated instantly.
                </p>
              </div>

              {/* Buttons */}
              <div className="flex gap-3 pt-2">
                <button
                  type="button"
                  onClick={() => setShowCollectModal(false)}
                  className="flex-1 px-4 py-2 border border-gray-300 dark:border-gray-600 text-gray-900 dark:text-white rounded-lg hover:bg-gray-50 dark:hover:bg-gray-700 transition"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={submitting}
                  className="flex-1 px-4 py-2 bg-emerald-600 hover:bg-emerald-700 disabled:bg-gray-400 text-white rounded-lg font-medium transition"
                >
                  {submitting ? 'Processing...' : 'Confirm Payment'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </AdminLayout>
  );
};

export default PendingPaymentsDashboard;
