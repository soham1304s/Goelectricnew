import { useState, useEffect } from 'react';
import { CheckCircle, XCircle, Clock, MapPin, User, PhoneIcon, AlertCircle, RefreshCw } from 'lucide-react';
import AdminLayout from './AdminLayout';

export default function RidesPage() {
  const [bookings, setBookings] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [activeTab, setActiveTab] = useState('pending');
  const [selectedBooking, setSelectedBooking] = useState(null);
  const [showModal, setShowModal] = useState(false);
  const [modalAction, setModalAction] = useState(null);
  const [rejectionReason, setRejectionReason] = useState('');
  const [completionNotes, setCompletionNotes] = useState('');

  const API_BASE_URL = (import.meta.env.VITE_API_URL || '') + '/api';
  const token = localStorage.getItem('token');

  // Debug: Log the API base URL being used
  useEffect(() => {
    console.log('🔧 API Configuration:', {
      API_BASE_URL,
      env: import.meta.env.VITE_API_URL,
      token: token ? 'Present' : 'Missing'
    });
  }, []);

  const fetchBookings = async (status) => {
    setLoading(true);
    setError('');
    try {
      let url = `${API_BASE_URL}/admin/bookings`;

      if (status === 'pending') {
        url = `${API_BASE_URL}/admin/ride-bookings/pending`;
      } else if (status === 'confirmed') {
        url = `${API_BASE_URL}/admin/bookings`;
      } else if (status === 'paid') {
        url = `${API_BASE_URL}/admin/bookings`;
      } else if (status === 'completed') {
        url = `${API_BASE_URL}/admin/bookings`;
      }

      console.log('🔄 Fetching bookings:', { status, url });

      const response = await fetch(url, {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
      });

      console.log('📡 Response status:', response.status);

      if (!response.ok) {
        throw new Error(`API Error: ${response.status} ${response.statusText}`);
      }

      const data = await response.json();
      console.log('✅ API Response:', data);

      if (data.success) {
        let filteredBookings = Array.isArray(data.data) ? data.data : (data.data?.bookings || []);
        console.log('📊 Total bookings received:', filteredBookings.length);

        // Filter by payment status for different tabs
        if (status === 'pending') {
          filteredBookings = filteredBookings.filter(b =>
            b.adminApproval?.status === 'pending' &&
            b.status !== 'cancelled'
            // Show all pending approval rides, even if payment is not yet initiated
          );
        } else if (status === 'confirmed') {
          filteredBookings = filteredBookings.filter(b =>
            b.adminApproval?.status === 'approved' && b.paymentStatus !== 'paid' && b.status !== 'completed'
          );
        } else if (status === 'paid') {
          filteredBookings = filteredBookings.filter(b =>
            b.paymentStatus === 'paid' && b.status !== 'completed'
          );
        } else if (status === 'completed') {
          filteredBookings = filteredBookings.filter(b =>
            b.status === 'completed'
          );
        } else if (status === 'cancelled') {
          filteredBookings = filteredBookings.filter(b =>
            b.status === 'cancelled' || b.adminApproval?.status === 'rejected'
          );
        }

        setBookings(filteredBookings);
        console.log('🎯 Filtered bookings for', status, ':', filteredBookings.length);
      } else {
        const errorMsg = data.message || 'Failed to fetch bookings';
        setError(errorMsg);
        console.error('❌ API Error:', errorMsg);
        setBookings([]);
      }
    } catch (error) {
      const errorMsg = error.message || 'An error occurred while fetching bookings';
      setError(`${errorMsg}. Make sure backend server is running on ${API_BASE_URL}`);
      console.error('❌ Error fetching bookings:', error);
      setBookings([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchBookings(activeTab);
  }, [activeTab]);

  const handleApprove = async (bookingId) => {
    try {
      const response = await fetch(
        `${API_BASE_URL}/admin/ride-bookings/${bookingId}/approve`,
        {
          method: 'PATCH',
          headers: {
            'Authorization': `Bearer ${token}`,
            'Content-Type': 'application/json',
          },
        }
      );

      const data = await response.json();

      if (data.success) {
        alert('Booking approved successfully!');
        fetchBookings(activeTab);
        setShowModal(false);
      } else {
        alert(data.message || 'Failed to approve booking');
      }
    } catch (error) {
      alert('Error approving booking: ' + error.message);
    }
  };

  const handleReject = async (bookingId) => {
    if (!rejectionReason.trim()) {
      alert('Please provide a rejection reason');
      return;
    }

    try {
      const response = await fetch(
        `${API_BASE_URL}/admin/ride-bookings/${bookingId}/reject`,
        {
          method: 'PATCH',
          headers: {
            'Authorization': `Bearer ${token}`,
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({ rejectionReason }),
        }
      );

      const data = await response.json();

      if (data.success) {
        alert('Booking rejected successfully!');
        fetchBookings(activeTab);
        setShowModal(false);
        setRejectionReason('');
      } else {
        alert(data.message || 'Failed to reject booking');
      }
    } catch (error) {
      alert('Error rejecting booking: ' + error.message);
    }
  };

  const handleCompleteRide = async (bookingId) => {
    try {
      const response = await fetch(
        `${API_BASE_URL}/admin/ride-bookings/${bookingId}/complete`,
        {
          method: 'PATCH',
          headers: {
            'Authorization': `Bearer ${token}`,
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({ completionNotes }),
        }
      );

      const data = await response.json();

      if (data.success) {
        alert('Ride marked as completed!');
        fetchBookings(activeTab);
        setShowModal(false);
        setCompletionNotes('');
      } else {
        alert(data.message || 'Failed to complete ride');
      }
    } catch (error) {
      alert('Error completing ride: ' + error.message);
    }
  };

  const openModal = (booking, action) => {
    setSelectedBooking(booking);
    setModalAction(action);
    setShowModal(true);
  };

  // Helper function to extract payment method from notes
  const getPaymentMethodBadge = (notes) => {
    if (!notes) return null;

    const notesLower = notes.toLowerCase();
    if (notesLower.includes('cash')) {
      return {
        label: 'Cash Payment',
        color: 'bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-200'
      };
    } else if (notesLower.includes('upi') || notesLower.includes('online')) {
      return {
        label: 'Online Payment',
        color: 'bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-200'
      };
    } else if (notesLower.includes('bank') || notesLower.includes('transfer')) {
      return {
        label: 'Bank Transfer',
        color: 'bg-purple-100 text-purple-800 dark:bg-purple-900/30 dark:text-purple-200'
      };
    }
    return null;
  };

  const tabs = [
    { id: 'pending', label: 'New Requests', count: 'new' },
    { id: 'confirmed', label: 'Awaiting Action', count: 'pending' },
    { id: 'paid', label: 'Ready to Complete', count: 'active' },
    { id: 'completed', label: 'Completed History', count: 'done' },
    { id: 'cancelled', label: 'Cancelled/Rejected', count: 'cancelled' },
  ];

  return (
    <AdminLayout>
      <div className="p-6 bg-gray-50 dark:bg-gray-900 min-h-screen">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-2">Ride Bookings Management</h1>
          <p className="text-gray-600 dark:text-gray-400">Manage and approve all incoming ride bookings</p>
        </div>

        {/* Error Message */}
        {error && (
          <div className="mb-6 p-4 bg-red-100 dark:bg-red-900 border border-red-400 dark:border-red-700 text-red-700 dark:text-red-200 rounded-lg flex items-center gap-3">
            <AlertCircle size={20} />
            <div>
              <p className="font-semibold">Error</p>
              <p className="text-sm">{error}</p>
            </div>
          </div>
        )}

        {/* Tabs */}
        <div className="flex gap-4 mb-6 overflow-x-auto border-b border-gray-200 dark:border-gray-700">
          {tabs.map((tab) => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`px-4 py-3 font-medium whitespace-nowrap border-b-2 transition ${activeTab === tab.id
                  ? 'border-blue-500 text-blue-600'
                  : 'border-transparent text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-gray-200'
                }`}
            >
              {tab.label}
            </button>
          ))}
        </div>

        {/* Refresh Button */}
        <button
          onClick={() => fetchBookings(activeTab)}
          className="mb-4 px-4 py-2 bg-blue-500 hover:bg-blue-600 text-white rounded-lg flex items-center gap-2 transition"
        >
          <RefreshCw size={18} />
          Refresh
        </button>

        {/* Loading */}
        {loading && (
          <div className="text-center py-12">
            <div className="inline-block animate-spin">
              <RefreshCw size={32} className="text-blue-500" />
            </div>
            <p className="mt-4 text-gray-600 dark:text-gray-400">Loading bookings...</p>
          </div>
        )}

        {/* Bookings List */}
        {!loading && bookings.length > 0 && (
          <div className="space-y-4">
            {bookings.map((booking) => (
              <div
                key={booking._id}
                className="bg-white dark:bg-gray-800 rounded-lg shadow-md p-6 hover:shadow-lg transition"
              >
                {/* Booking Header */}
                <div className="flex justify-between items-start mb-4">
                  <div>
                    <h3 className="text-lg font-bold text-gray-900 dark:text-white">
                      Booking #{booking.bookingId}
                    </h3>
                    <p className="text-sm text-gray-500 dark:text-gray-400">
                      {new Date(booking.createdAt).toLocaleString()}
                    </p>
                  </div>
                  <div className="flex items-center gap-2">
                    <span className={`px-3 py-1 rounded-full text-sm font-medium ${booking.adminApproval?.status === 'pending'
                        ? 'bg-yellow-100 text-yellow-800'
                        : booking.adminApproval?.status === 'approved'
                          ? 'bg-green-100 text-green-800'
                          : 'bg-red-100 text-red-800'
                      }`}>
                      {booking.adminApproval?.status === 'pending' ? 'Pending' :
                        booking.adminApproval?.status === 'approved' ? 'Approved' : 'Rejected'}
                    </span>
                  </div>
                </div>

                {/* User Info */}
                <div className="bg-gray-50 dark:bg-gray-700 p-4 rounded-lg mb-4">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="flex items-start gap-3">
                      <User size={20} className="text-blue-500 mt-1" />
                      <div>
                        <p className="text-sm text-gray-600 dark:text-gray-400">User</p>
                        <p className="font-semibold text-gray-900 dark:text-white">
                          {booking.user?.name || `${booking.user?.firstName || ''} ${booking.user?.lastName || ''}`.trim() || 'N/A'}
                        </p>
                      </div>
                    </div>
                    <div className="flex items-start gap-3">
                      <PhoneIcon size={20} className="text-blue-500 mt-1" />
                      <div>
                        <p className="text-sm text-gray-600 dark:text-gray-400">Contact</p>
                        <p className="font-semibold text-gray-900 dark:text-white">
                          {booking.user?.phone || 'N/A'}
                        </p>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Ride Details */}
                <div className="space-y-3 mb-4">
                  <div className="flex items-start gap-3">
                    <MapPin size={20} className="text-green-500 mt-1" />
                    <div>
                      <p className="text-sm text-gray-600 dark:text-gray-400">Pickup</p>
                      <p className="font-semibold text-gray-900 dark:text-white">
                        {booking.pickupLocation?.address
                          ? booking.pickupLocation.address.substring(0, 60) + (booking.pickupLocation.address.length > 60 ? '...' : '')
                          : 'N/A'}
                      </p>
                    </div>
                  </div>
                  <div className="flex items-start gap-3">
                    <MapPin size={20} className="text-red-500 mt-1" />
                    <div>
                      <p className="text-sm text-gray-600 dark:text-gray-400">Dropoff</p>
                      <p className="font-semibold text-gray-900 dark:text-white">
                        {booking.dropLocation?.address
                          ? booking.dropLocation.address.substring(0, 60) + (booking.dropLocation.address.length > 60 ? '...' : '')
                          : 'N/A'}
                      </p>
                    </div>
                  </div>
                </div>

                {/* Booking Details Grid */}
                <div className="grid grid-cols-2 md:grid-cols-5 gap-4 mb-4 py-4 border-t border-b border-gray-200 dark:border-gray-700">
                  <div>
                    <p className="text-xs text-gray-600 dark:text-gray-400 uppercase">Car Type</p>
                    <p className="font-semibold text-gray-900 dark:text-white capitalize">
                      {booking.cabType || 'N/A'}
                    </p>
                  </div>
                  {booking.rideType === 'airport' ? (
                    <>
                      <div>
                        <p className="text-xs text-gray-600 dark:text-gray-400 uppercase">Fixed Rate</p>
                        <p className="font-semibold text-gray-900 dark:text-white">
                          ₹{booking.pricing?.fixedCharge || '0'}
                        </p>
                      </div>
                      <div>
                        <p className="text-xs text-gray-600 dark:text-gray-400 uppercase">Parking Fee</p>
                        <p className="font-semibold text-gray-900 dark:text-white">
                          ₹{booking.pricing?.parkingCharge || '0'}
                        </p>
                      </div>
                      <div>
                        <p className="text-xs text-gray-600 dark:text-gray-400 uppercase">Total Fare</p>
                        <p className="font-bold text-green-600 text-lg">
                          ₹{booking.pricing?.fixedCharge && booking.pricing?.parkingCharge
                            ? (parseFloat(booking.pricing.fixedCharge) + parseFloat(booking.pricing.parkingCharge)).toFixed(2)
                            : booking.pricing?.totalFare?.toFixed(2) || '0.00'}
                        </p>
                      </div>
                      <div>
                        <p className="text-xs text-gray-600 dark:text-gray-400 uppercase font-bold">User Payment</p>
                        <p className="font-semibold text-green-600 text-sm">
                          Paid: ₹{booking.paidAmount || '0'}
                        </p>
                        <p className="text-xs text-red-600 font-bold mt-1">
                          Remaining: ₹{(
                            (parseFloat(booking.pricing?.fixedCharge || 0) + parseFloat(booking.pricing?.parkingCharge || 0)) -
                            parseFloat(booking.paidAmount || 0)
                          ).toFixed(2)}
                        </p>
                      </div>
                    </>
                  ) : (
                    <>
                      <div>
                        <p className="text-xs text-gray-600 dark:text-gray-400 uppercase">Distance</p>
                        <p className="font-semibold text-gray-900 dark:text-white">
                          {booking.distance ? booking.distance.toFixed(2) : '0'} km
                        </p>
                      </div>
                      <div>
                        <p className="text-xs text-gray-600 dark:text-gray-400 uppercase">Rate/KM</p>
                        <p className="font-semibold text-gray-900 dark:text-white">
                          ₹{booking.pricing?.perKmRate || '0'}/km
                        </p>
                      </div>
                      <div>
                        <p className="text-xs text-gray-600 dark:text-gray-400 uppercase">Fare Calculation</p>
                        <p className="text-xs text-gray-700 dark:text-gray-300 font-medium mb-1">
                          {booking.distance ? booking.distance.toFixed(2) : '0'} × ₹{booking.pricing?.perKmRate || '0'}
                        </p>
                        <p className="font-bold text-green-600">
                          ₹{booking.pricing?.totalFare || (booking.distance && booking.pricing?.perKmRate
                            ? (booking.distance * booking.pricing.perKmRate).toFixed(2)
                            : '0.00')}
                        </p>
                      </div>
                      <div>
                        <p className="text-xs text-gray-600 dark:text-gray-400 uppercase">Payment Status</p>
                        <div className="flex flex-col gap-1">
                          {booking.rideCompletion?.completionNotes && getPaymentMethodBadge(booking.rideCompletion.completionNotes) ? (
                            <span className={`inline-block text-sm font-semibold px-3 py-1 rounded w-fit ${getPaymentMethodBadge(booking.rideCompletion.completionNotes)?.color
                              }`}>
                              {getPaymentMethodBadge(booking.rideCompletion.completionNotes)?.label}
                            </span>
                          ) : (
                            <p className={`font-semibold text-sm ${booking.paymentStatus === 'paid' ? 'text-green-600' : 'text-yellow-600'
                              }`}>
                              {booking.paymentStatus?.toUpperCase() || 'PENDING'}
                            </p>
                          )}
                        </div>
                      </div>
                    </>
                  )}
                </div>

                {/* Scheduled Time */}
                <div className="flex items-center gap-2 mb-4 text-gray-600 dark:text-gray-400">
                  <Clock size={18} />
                  <span>
                    {booking.scheduledDate
                      ? new Date(booking.scheduledDate).toLocaleDateString()
                      : 'N/A'} at {booking.scheduledTime || 'N/A'}
                  </span>
                </div>

                {/* Payment Details for Completed Rides */}
                {activeTab === 'completed' && booking.rideCompletion?.completionNotes && (
                  <div className="mb-4 p-4 bg-green-50 dark:bg-green-900/30 border-l-4 border-green-500 rounded-lg">
                    <div className="flex items-start justify-between gap-3">
                      <div>
                        <p className="text-sm font-semibold text-green-900 dark:text-green-200 mb-2">Payment Completed</p>
                        <p className="text-sm text-green-800 dark:text-green-300 mb-3">{booking.rideCompletion.completionNotes}</p>
                        {getPaymentMethodBadge(booking.rideCompletion.completionNotes) && (
                          <span className={`inline-block px-3 py-1 rounded-full text-sm font-semibold ${getPaymentMethodBadge(booking.rideCompletion.completionNotes).color}`}>
                            {getPaymentMethodBadge(booking.rideCompletion.completionNotes).label}
                          </span>
                        )}
                      </div>
                    </div>
                  </div>
                )}

                {/* Cancellation Details */}
                {activeTab === 'cancelled' && booking.cancellation && (
                  <div className={`mb-4 p-4 border-l-4 rounded-lg ${booking.cancellation.cancelledBy === 'admin'
                      ? 'bg-red-50 dark:bg-red-900/30 border-red-500'
                      : 'bg-yellow-50 dark:bg-yellow-900/30 border-yellow-500'
                    }`}>
                    <div className="flex items-start justify-between gap-3">
                      <div className="w-full">
                        <p className={`text-sm font-semibold mb-3 ${booking.cancellation.cancelledBy === 'admin'
                            ? 'text-red-900 dark:text-red-200'
                            : 'text-yellow-900 dark:text-yellow-200'
                          }`}>
                          {booking.cancellation.cancelledBy === 'admin'
                            ? 'Admin Cancelled'
                            : `Cancelled by ${booking.cancellation.cancelledBy?.toUpperCase()}`}
                        </p>
                        <div className={`space-y-2 text-sm ${booking.cancellation.cancelledBy === 'admin'
                            ? 'text-red-800 dark:text-red-300'
                            : 'text-yellow-800 dark:text-yellow-300'
                          }`}>
                          {booking.cancellation.cancelledAt && (
                            <p><strong>Cancelled At:</strong> {new Date(booking.cancellation.cancelledAt).toLocaleString()}</p>
                          )}
                          {booking.cancellation.reason && (
                            <p><strong>Reason:</strong> {booking.cancellation.reason}</p>
                          )}
                          {booking.cancellation.refundStatus && (
                            <p><strong>Refund Status:</strong> <span className="font-semibold">{booking.cancellation.refundStatus.toUpperCase()}</span></p>
                          )}
                        </div>
                      </div>
                    </div>
                  </div>
                )}

                {/* Rejection Details */}
                {activeTab === 'cancelled' && booking.adminApproval?.status === 'rejected' && (
                  <div className="mb-4 p-4 bg-orange-50 dark:bg-orange-900/30 border-l-4 border-orange-500 rounded-lg">
                    <div className="flex items-start justify-between gap-3">
                      <div className="w-full">
                        <p className="text-sm font-semibold text-orange-900 dark:text-orange-200 mb-3">Admin Rejection</p>
                        <div className="space-y-2 text-sm text-orange-800 dark:text-orange-300">
                          {booking.adminApproval?.reason && (
                            <p><strong>Rejection Reason:</strong> {booking.adminApproval.reason}</p>
                          )}
                          {booking.adminApproval?.rejectedAt && (
                            <p><strong>Rejected At:</strong> {new Date(booking.adminApproval.rejectedAt).toLocaleString()}</p>
                          )}
                          {booking.adminApproval?.rejectedBy && (
                            <p><strong>Rejected By:</strong> {booking.adminApproval.rejectedBy}</p>
                          )}
                        </div>
                      </div>
                    </div>
                  </div>
                )}

                {/* Action Buttons */}
                <div className="flex gap-3 flex-wrap">
                  {activeTab === 'pending' && (
                    <>
                      <button
                        onClick={() => openModal(booking, 'approve')}
                        className="px-4 py-2 bg-green-500 hover:bg-green-600 text-white rounded-lg flex items-center gap-2 transition"
                      >
                        <CheckCircle size={18} />
                        Approve
                      </button>
                      <button
                        onClick={() => openModal(booking, 'reject')}
                        className="px-4 py-2 bg-red-500 hover:bg-red-600 text-white rounded-lg flex items-center gap-2 transition"
                      >
                        <XCircle size={18} />
                        Reject
                      </button>
                    </>
                  )}
                  {activeTab === 'confirmed' && (
                    <button
                      onClick={() => openModal(booking, 'manual-complete')}
                      className="px-4 py-2 bg-purple-500 hover:bg-purple-600 text-white rounded-lg flex items-center gap-2 transition"
                    >
                      <CheckCircle size={18} />
                      Mark as Complete (Manual Payment)
                    </button>
                  )}
                  {activeTab === 'paid' && (
                    <button
                      onClick={() => openModal(booking, 'complete')}
                      className="px-4 py-2 bg-blue-500 hover:bg-blue-600 text-white rounded-lg flex items-center gap-2 transition"
                    >
                      <CheckCircle size={18} />
                      Mark as Complete
                    </button>
                  )}
                  {activeTab === 'cancelled' && (
                    <button
                      disabled
                      className="px-4 py-2 bg-gray-400 text-white rounded-lg flex items-center gap-2 cursor-not-allowed opacity-60"
                    >
                      <XCircle size={18} />
                      No Actions Available
                    </button>
                  )}
                </div>
              </div>
            ))}
          </div>
        )}

        {/* Empty State */}
        {!loading && bookings.length === 0 && (
          <div className="text-center py-12 bg-white dark:bg-gray-800 rounded-lg">
            <AlertCircle size={48} className="mx-auto text-gray-400 mb-4" />
            <p className="text-gray-600 dark:text-gray-400">
              {activeTab === 'pending'
                ? 'No ride requests with 20% payment yet'
                : 'No bookings found for this category'}
            </p>
            {activeTab === 'pending' && (
              <p className="text-sm text-gray-500 dark:text-gray-500 mt-2">
                Ride requests will appear here once users pay the 20% advance
              </p>
            )}
          </div>
        )}
      </div>

      {/* Modal */}
      {showModal && selectedBooking && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white dark:bg-gray-800 rounded-lg shadow-xl max-w-md w-full p-6">
            {modalAction === 'approve' && (
              <>
                <h2 className="text-xl font-bold text-gray-900 dark:text-white mb-4">
                  Approve Booking?
                </h2>
                <p className="text-gray-600 dark:text-gray-400 mb-6">
                  Are you sure you want to approve this booking? The user will be able to proceed with payment.
                </p>
                <div className="flex gap-3">
                  <button
                    onClick={() => setShowModal(false)}
                    className="flex-1 px-4 py-2 bg-gray-300 hover:bg-gray-400 text-gray-900 rounded-lg transition"
                  >
                    Cancel
                  </button>
                  <button
                    onClick={() => handleApprove(selectedBooking._id)}
                    className="flex-1 px-4 py-2 bg-green-500 hover:bg-green-600 text-white rounded-lg transition"
                  >
                    Approve
                  </button>
                </div>
              </>
            )}

            {modalAction === 'reject' && (
              <>
                <h2 className="text-xl font-bold text-gray-900 dark:text-white mb-4">
                  Reject Booking
                </h2>
                <p className="text-gray-600 dark:text-gray-400 mb-4">
                  Please provide a reason for rejecting this booking:
                </p>
                <textarea
                  value={rejectionReason}
                  onChange={(e) => setRejectionReason(e.target.value)}
                  placeholder="Enter rejection reason..."
                  className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white mb-4 focus:outline-none focus:ring-2 focus:ring-red-500"
                  rows="4"
                />
                <div className="flex gap-3">
                  <button
                    onClick={() => setShowModal(false)}
                    className="flex-1 px-4 py-2 bg-gray-300 hover:bg-gray-400 text-gray-900 rounded-lg transition"
                  >
                    Cancel
                  </button>
                  <button
                    onClick={() => handleReject(selectedBooking._id)}
                    className="flex-1 px-4 py-2 bg-red-500 hover:bg-red-600 text-white rounded-lg transition"
                  >
                    Reject
                  </button>
                </div>
              </>
            )}

            {modalAction === 'complete' && (
              <>
                <h2 className="text-xl font-bold text-gray-900 dark:text-white mb-4">
                  Complete Ride
                </h2>
                <p className="text-gray-600 dark:text-gray-400 mb-4">
                  Mark this ride as completed. Add any notes if needed:
                </p>
                <textarea
                  value={completionNotes}
                  onChange={(e) => setCompletionNotes(e.target.value)}
                  placeholder="Enter completion notes (optional)..."
                  className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white mb-4 focus:outline-none focus:ring-2 focus:ring-blue-500"
                  rows="4"
                />
                <div className="flex gap-3">
                  <button
                    onClick={() => setShowModal(false)}
                    className="flex-1 px-4 py-2 bg-gray-300 hover:bg-gray-400 text-gray-900 rounded-lg transition"
                  >
                    Cancel
                  </button>
                  <button
                    onClick={() => handleCompleteRide(selectedBooking._id)}
                    className="flex-1 px-4 py-2 bg-blue-500 hover:bg-blue-600 text-white rounded-lg transition"
                  >
                    Complete
                  </button>
                </div>
              </>
            )}

            {modalAction === 'manual-complete' && (
              <>
                <h2 className="text-xl font-bold text-gray-900 dark:text-white mb-4">
                  Complete Ride (Manual Payment)
                </h2>
                <p className="text-gray-600 dark:text-gray-400 mb-4">
                  Mark this ride as completed. User has paid manually (cash/bank transfer).
                </p>

                {/* Amount Display */}
                <div className="bg-blue-50 dark:bg-blue-900/30 border border-blue-200 dark:border-blue-700 rounded-lg p-4 mb-4">
                  <p className="text-sm text-blue-700 dark:text-blue-300 font-semibold mb-2">Total Amount Due:</p>
                  <p className="text-2xl font-bold text-blue-600 dark:text-blue-400">
                    ₹{selectedBooking.pricing?.fixedCharge && selectedBooking.pricing?.parkingCharge
                      ? (parseFloat(selectedBooking.pricing.fixedCharge) + parseFloat(selectedBooking.pricing.parkingCharge)).toFixed(2)
                      : selectedBooking.pricing?.totalFare?.toFixed(2) || '0.00'}
                  </p>
                </div>

                {/* Amount Input */}
                <div className="mb-4">
                  <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-2">
                    Amount Received <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="number"
                    placeholder="Enter amount received"
                    className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white mb-2 focus:outline-none focus:ring-2 focus:ring-purple-500"
                    min="0"
                  />
                  <p className="text-xs text-gray-500 dark:text-gray-400">Enter the exact amount you received from the customer</p>
                </div>

                {/* Payment Method */}
                <div className="mb-4">
                  <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-2">
                    Payment Method <span className="text-red-500">*</span>
                  </label>
                  <select className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-purple-500">
                    <option value="">Select payment method</option>
                    <option value="cash">Cash</option>
                    <option value="bank_transfer">Bank Transfer</option>
                    <option value="upi">UPI</option>
                    <option value="check">Cheque</option>
                    <option value="other">Other</option>
                  </select>
                </div>

                {/* Notes */}
                <div className="mb-4">
                  <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-2">
                    Payment Details / Reference ID (Optional)
                  </label>
                  <textarea
                    value={completionNotes}
                    onChange={(e) => setCompletionNotes(e.target.value)}
                    placeholder="e.g., Cash collected, Bank Ref: TXN12345, UPI ID: xyz@bank, etc..."
                    className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white mb-4 focus:outline-none focus:ring-2 focus:ring-purple-500"
                    rows="3"
                  />
                </div>

                <div className="bg-yellow-50 dark:bg-yellow-900/30 border border-yellow-200 dark:border-yellow-700 rounded-lg p-3 mb-4">
                  <p className="text-sm text-yellow-800 dark:text-yellow-200">
                    This will mark ride as completed with manual payment status. Ensure payment verification before confirmation.
                  </p>
                </div>
                <div className="flex gap-3">
                  <button
                    onClick={() => setShowModal(false)}
                    className="flex-1 px-4 py-2 bg-gray-300 hover:bg-gray-400 text-gray-900 rounded-lg transition"
                  >
                    Cancel
                  </button>
                  <button
                    onClick={() => handleCompleteRide(selectedBooking._id)}
                    className="flex-1 px-4 py-2 bg-purple-500 hover:bg-purple-600 text-white rounded-lg transition"
                  >
                    Complete (Manual)
                  </button>
                </div>
              </>
            )}
          </div>
        </div>
      )}
    </AdminLayout>
  );
}
