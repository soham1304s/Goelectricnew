import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { MapPin, Calendar, Clock, Filter, Search, X } from 'lucide-react';
import UserLayout from './UserLayout.jsx';
import * as bookingService from '../../services/bookingService.js';

export default function RidesPage() {
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

  useEffect(() => {
    loadRides();
  }, []);

  const loadRides = async () => {
    try {
      setLoading(true);
      const response = await bookingService.getMyBookings?.();
      console.log('📊 Rides API Response:', response);
      if (response?.success) {
        // API returns { success: true, data: { bookings: [...], pagination: {...} } }
        const rides = response.data?.bookings || response.data || [];
        console.log('🚗 Processed Rides:', rides);
        console.log('Sample Ride Data:', rides[0] ? {
          _id: rides[0]._id,
          totalFare: rides[0].pricing?.totalFare || rides[0].totalFare,
          paidAmount: rides[0].paidAmount,
          paymentStatus: rides[0].paymentStatus,
          has20Percent: rides[0].paidAmount >= ((rides[0].pricing?.totalFare || rides[0].totalFare) * 0.2)
        } : null);
        setBookings(Array.isArray(rides) ? rides : []);
        filterRides(Array.isArray(rides) ? rides : [], 'all', '');
      }
    } catch (err) {
      setError('Failed to load rides');
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const filterRides = (ridesData, status, search) => {
    let filtered = ridesData;

    // 🔒 IMPORTANT: Only show rides where user has paid 20% advance
    filtered = filtered.filter(b => has20PercentPaid(b));
    console.log(`🔒 After 20% payment filter: ${filtered.length} rides out of ${ridesData.length}`);

    if (status !== 'all') {
      filtered = filtered.filter(b => b.status?.toLowerCase() === status.toLowerCase());
    }

    if (search) {
      filtered = filtered.filter(b => {
        const pickup = typeof b.pickupLocation === 'string' ? b.pickupLocation : b.pickupLocation?.address || '';
        const drop = typeof b.dropLocation === 'string' ? b.dropLocation : b.dropLocation?.address || '';
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
    if (!location) return 'Unknown';
    if (typeof location === 'string') return location;
    return location.address || location.name || 'Unknown';
  };

  const formatDate = (date) => {
    return new Date(date).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });
  };

  const formatTime = (date) => {
    return new Date(date).toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' });
  };

  const getStatusColor = (status) => {
    switch (status?.toLowerCase()) {
      case 'completed':
        return 'bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-400';
      case 'ongoing':
        return 'bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-400';
      case 'cancelled':
        return 'bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-400';
      case 'confirmed':
        return 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900/30 dark:text-yellow-400';
      default:
        return 'bg-gray-100 text-gray-800 dark:bg-gray-700 dark:text-gray-300';
    }
  };

  const has20PercentPaid = (ride) => {
    const totalFare = ride.pricing?.totalFare || ride.totalFare || 0;
    const paidAmount = ride.paidAmount || ride.pricing?.paidAmount || 0;
    return totalFare > 0 && paidAmount >= (totalFare * 0.2);
  };

  const get20PercentAmount = (ride) => {
    const totalFare = ride.pricing?.totalFare || ride.totalFare || 0;
    return (totalFare * 0.2).toFixed(2);
  };

  const handleCancelRide = async () => {
    if (!cancelReason.trim()) {
      alert('Please provide a cancellation reason');
      return;
    }

    setCancelling(true);
    try {
      const response = await fetch(`${import.meta.env.VITE_API_BASE_URL || 'http://localhost:5000/api'}/bookings/${selectedRideForCancel._id}/cancel`, {
        method: 'PUT',
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('token')}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ reason: cancelReason })
      });

      const data = await response.json();

      if (data.success) {
        alert('Ride cancelled successfully!');
        setShowCancelModal(false);
        setCancelReason('');
        setSelectedRideForCancel(null);
        // Reload rides
        loadRides();
      } else {
        alert(data.message || 'Failed to cancel ride');
      }
    } catch (err) {
      alert('Error cancelling ride: ' + err.message);
      console.error(err);
    } finally {
      setCancelling(false);
    }
  };

  if (loading) {
    return (
      <UserLayout>
        <div className="flex items-center justify-center min-h-screen">
          <div className="text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500 mx-auto mb-4"></div>
            <p className="text-gray-600 dark:text-gray-300">Loading rides...</p>
          </div>
        </div>
      </UserLayout>
    );
  }

  return (
    <UserLayout>
      <div className="w-full space-y-6">
        {/* Header */}
        <div>
          <h1 className="text-3xl sm:text-4xl font-bold text-gray-900 dark:text-white flex items-center gap-3 mb-2">
            <span className="text-4xl">🚗</span>
            My Rides
          </h1>
          <p className="text-gray-600 dark:text-gray-400">View and manage all your ride bookings</p>
        </div>

        {error && (
          <div className="bg-red-50 dark:bg-red-900/30 border-2 border-red-300 dark:border-red-600 text-red-800 dark:text-red-200 p-4 rounded-xl flex items-center gap-3">
            <span className="text-2xl">❌</span>
            {error}
          </div>
        )}

        {/* Stats */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          <div className="bg-gradient-to-br from-blue-500 to-blue-600 text-white rounded-xl shadow-lg p-6 border border-blue-400">
            <p className="text-blue-100 text-sm font-medium uppercase">Total Rides (20% Paid)</p>
            <p className="text-4xl font-bold mt-2">{bookings.filter(b => has20PercentPaid(b)).length}</p>
          </div>
          <div className="bg-gradient-to-br from-green-500 to-emerald-600 text-white rounded-xl shadow-lg p-6 border border-green-400">
            <p className="text-green-100 text-sm font-medium uppercase">Completed</p>
            <p className="text-4xl font-bold mt-2">{bookings.filter(b => has20PercentPaid(b) && b.status?.toLowerCase() === 'completed').length}</p>
          </div>
          <div className="bg-gradient-to-br from-orange-500 to-red-600 text-white rounded-xl shadow-lg p-6 border border-orange-400">
            <p className="text-orange-100 text-sm font-medium uppercase">Pending</p>
            <p className="text-4xl font-bold mt-2">{bookings.filter(b => has20PercentPaid(b) && b.status?.toLowerCase() === 'pending').length}</p>
          </div>
        </div>

        {/* Filters */}
        <div className="bg-white dark:bg-gray-800 rounded-xl shadow-lg p-6 border border-gray-200 dark:border-gray-700 space-y-4">
          <div className="flex flex-col sm:flex-row gap-4">
            {/* Search */}
            <div className="flex-1">
              <div className="relative">
                <Search className="absolute left-3 top-3 text-gray-400" size={20} />
                <input
                  type="text"
                  placeholder="Search by pickup or drop location..."
                  value={searchTerm}
                  onChange={(e) => handleSearchChange(e.target.value)}
                  className="w-full pl-10 pr-4 py-2 border border-gray-300 dark:border-gray-600 dark:bg-gray-700 dark:text-white rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>
            </div>

            {/* Status Filter */}
            <div className="flex items-center gap-2 flex-wrap sm:flex-nowrap">
              <Filter size={20} className="text-gray-600 dark:text-gray-400" />
              {['all', 'completed', 'ongoing', 'confirmed', 'pending', 'cancelled'].map(status => (
                <button
                  key={status}
                  onClick={() => handleFilterChange(status)}
                  className={`px-4 py-2 rounded-lg font-semibold transition whitespace-nowrap ${
                    filterStatus === status
                      ? 'bg-blue-500 text-white shadow-lg'
                      : 'bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300 hover:bg-gray-200'
                  }`}
                >
                  {status.charAt(0).toUpperCase() + status.slice(1)}
                </button>
              ))}
            </div>
          </div>
        </div>

        {/* Table */}
        <div className="bg-white dark:bg-gray-800 rounded-xl shadow-lg border border-gray-200 dark:border-gray-700 overflow-hidden">
          {filteredBookings.length === 0 ? (
            <div className="p-12 text-center">
              <MapPin size={48} className="text-gray-400 mx-auto mb-4" />
              <h3 className="text-2xl font-bold text-gray-900 dark:text-white mb-2">No Rides Found</h3>
              <p className="text-gray-600 dark:text-gray-400">
                {bookings.length === 0 
                  ? "You haven't booked any rides yet."
                  : bookings.filter(b => has20PercentPaid(b)).length === 0
                  ? "Please pay 20% advance to see your ride booking."
                  : "No rides match your filters."}
              </p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="border-b-2 border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-700">
                    <th className="px-6 py-4 text-left text-sm font-bold text-gray-900 dark:text-white">From - To</th>
                    <th className="px-6 py-4 text-left text-sm font-bold text-gray-900 dark:text-white">Date</th>
                    <th className="px-6 py-4 text-left text-sm font-bold text-gray-900 dark:text-white">Car Type</th>
                    <th className="px-6 py-4 text-left text-sm font-bold text-gray-900 dark:text-white">Distance</th>
                    <th className="px-6 py-4 text-left text-sm font-bold text-gray-900 dark:text-white">Amount</th>
                    <th className="px-6 py-4 text-left text-sm font-bold text-gray-900 dark:text-white">Paid / 20% Needed</th>
                    <th className="px-6 py-4 text-left text-sm font-bold text-gray-900 dark:text-white">Status</th>
                    <th className="px-6 py-4 text-left text-sm font-bold text-gray-900 dark:text-white">Action</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-200 dark:divide-gray-700">
                  {filteredBookings.map((ride, index) => (
                    <tr key={ride._id || index} className="hover:bg-gray-50 dark:hover:bg-gray-700/50 transition">
                      <td className="px-6 py-4">
                        <div className="flex items-center gap-2">
                          <MapPin size={16} className="text-gray-500 flex-shrink-0" />
                          <div>
                            <p className="font-semibold text-gray-900 dark:text-white text-sm">{getLocationString(ride.pickupLocation)}</p>
                            <p className="text-xs text-gray-500 dark:text-gray-400">→ {getLocationString(ride.dropLocation)}</p>
                          </div>
                        </div>
                      </td>
                      <td className="px-6 py-4">
                        <div className="flex items-center gap-2 text-sm text-gray-900 dark:text-white">
                          <Calendar size={16} className="text-gray-500" />
                          <div>
                            <p className="font-semibold">{formatDate(ride.scheduledDate || ride.createdAt)}</p>
                            <p className="text-xs text-gray-500">{formatTime(ride.scheduledDate || ride.createdAt)}</p>
                          </div>
                        </div>
                      </td>
                      <td className="px-6 py-4">
                        <span className="px-3 py-1 bg-blue-100 dark:bg-blue-900/30 text-blue-800 dark:text-blue-300 rounded-lg font-semibold text-sm">
                          {ride.cabType || ride.carType || 'Standard'}
                        </span>
                      </td>
                      <td className="px-6 py-4">
                        <div className="flex items-center gap-2 text-gray-900 dark:text-white font-semibold">
                          <Clock size={16} className="text-gray-500" />
                          {ride.distance} km
                        </div>
                      </td>
                      <td className="px-6 py-4">
                        <div className="font-bold text-green-600 dark:text-green-400 text-lg">
                          ₹{ride.pricing?.totalFare || ride.totalFare || 0}
                        </div>
                      </td>
                      <td className="px-6 py-4">
                        <div className="flex flex-col gap-1">
                          <div className="text-sm">
                            <span className="font-semibold text-gray-900 dark:text-white">₹{ride.paidAmount || 0}</span>
                            <span className="text-gray-500 dark:text-gray-400"> / ₹{get20PercentAmount(ride)}</span>
                          </div>
                          {has20PercentPaid(ride) ? (
                            <span className="inline-flex items-center gap-1 px-2 py-1 bg-emerald-100 dark:bg-emerald-900/30 text-emerald-800 dark:text-emerald-400 rounded text-xs font-semibold w-fit">
                              <span>✓</span>
                              Paid
                            </span>
                          ) : (
                            <span className="inline-flex items-center gap-1 px-2 py-1 bg-orange-100 dark:bg-orange-900/30 text-orange-800 dark:text-orange-400 rounded text-xs font-semibold w-fit">
                              <span>⚠</span>
                              Pending
                            </span>
                          )}
                        </div>
                      </td>
                      <td className="px-6 py-4">
                        <span className={`px-3 py-1 rounded-lg font-semibold text-sm ${getStatusColor(ride.status)}`}>
                          {ride.status || 'Pending'}
                        </span>
                      </td>
                      <td className="px-6 py-4">
                        <div className="flex gap-2">
                          <button
                            onClick={() => navigate(`/user/booking-confirmation?id=${ride._id}`)}
                            className="px-4 py-2 bg-blue-500 hover:bg-blue-600 text-white rounded-lg font-semibold text-sm transition"
                          >
                            View
                          </button>
                          {ride.status?.toLowerCase() !== 'completed' && ride.status?.toLowerCase() !== 'cancelled' && (
                            <button
                              onClick={() => {
                                setSelectedRideForCancel(ride);
                                setShowCancelModal(true);
                              }}
                              className="px-4 py-2 bg-red-500 hover:bg-red-600 text-white rounded-lg font-semibold text-sm transition"
                            >
                              Cancel
                            </button>
                          )}
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>

        {/* Summary */}
        {filteredBookings.length > 0 && (
          <div className="bg-gradient-to-r from-blue-50 to-blue-100 dark:from-blue-900/20 dark:to-blue-800/20 rounded-xl p-6 border border-blue-200 dark:border-blue-700">
            <p className="text-gray-900 dark:text-white font-semibold">
              Showing {filteredBookings.length} rides (with 20% advance paid) out of {bookings.filter(b => has20PercentPaid(b)).length} total
            </p>
          </div>
        )}

        {/* Cancel Ride Modal */}
        {showCancelModal && selectedRideForCancel && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
            <div className="bg-white dark:bg-gray-800 rounded-lg shadow-xl max-w-md w-full p-6">
              <div className="flex items-center justify-between mb-4">
                <h2 className="text-xl font-bold text-gray-900 dark:text-white">
                  Cancel Ride
                </h2>
                <button
                  onClick={() => {
                    setShowCancelModal(false);
                    setCancelReason('');
                    setSelectedRideForCancel(null);
                  }}
                  className="text-gray-500 hover:text-gray-700"
                >
                  <X size={24} />
                </button>
              </div>

              <div className="bg-amber-50 dark:bg-amber-900/30 border border-amber-200 dark:border-amber-700 rounded-lg p-3 mb-4">
                <p className="text-sm text-amber-800 dark:text-amber-200">
                  ⚠️ Are you sure you want to cancel this ride? Cancellation charges may apply.
                </p>
              </div>

              <div className="mb-4 p-3 bg-gray-50 dark:bg-gray-700 rounded-lg">
                <p className="text-sm text-gray-600 dark:text-gray-400 mb-1">Booking ID:</p>
                <p className="font-semibold text-gray-900 dark:text-white">#{selectedRideForCancel.bookingId}</p>
              </div>

              <div className="mb-4">
                <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-2">
                  Cancellation Reason <span className="text-red-500">*</span>
                </label>
                <textarea
                  value={cancelReason}
                  onChange={(e) => setCancelReason(e.target.value)}
                  placeholder="Please tell us why you're cancelling this ride..."
                  className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-red-500"
                  rows="4"
                />
              </div>

              <div className="flex gap-3">
                <button
                  onClick={() => {
                    setShowCancelModal(false);
                    setCancelReason('');
                    setSelectedRideForCancel(null);
                  }}
                  className="flex-1 px-4 py-2 bg-gray-300 hover:bg-gray-400 text-gray-900 rounded-lg transition font-semibold"
                  disabled={cancelling}
                >
                  Keep Booking
                </button>
                <button
                  onClick={handleCancelRide}
                  disabled={cancelling || !cancelReason.trim()}
                  className="flex-1 px-4 py-2 bg-red-500 hover:bg-red-600 text-white rounded-lg transition font-semibold disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {cancelling ? 'Cancelling...' : 'Cancel Ride'}
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </UserLayout>
  );
}
