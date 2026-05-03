import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Plane, Calendar, MapPin, Users, Filter, Search, XCircle, Check, AlertCircle } from 'lucide-react';
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
      console.log('📊 Tours API Response:', response);
      if (response?.success) {
        // API returns { success: true, data: [...], pagination: {...} }
        const toursList = Array.isArray(response.data) ? response.data : [];
        console.log('✈️ Processed Tours:', toursList);
        console.log('Sample Tour Data:', toursList[0] ? {
          _id: toursList[0]._id,
          totalAmount: toursList[0].pricing?.totalAmount,
          paidAmount: toursList[0].pricing?.paidAmount,
          paymentStatus: toursList[0].paymentStatus,
          has20Percent: (toursList[0].pricing?.paidAmount || 0) >= ((toursList[0].pricing?.totalAmount || 0) * 0.2)
        } : null);
        setTours(toursList);
        filterTours(toursList, 'all', '');
      }
    } catch (err) {
      setError('Failed to load tours');
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

  const getPaidAmount = (tour) => {
    return tour.pricing?.paidAmount ?? 0;
  };

  const getStatusColor = (status) => {
    switch (status?.toLowerCase()) {
      case 'completed':
        return 'bg-green-100 text-green-800';
      case 'pending':
        return 'bg-yellow-100 text-yellow-800';
      case 'cancelled':
        return 'bg-red-100 text-red-800';
      case 'confirmed':
        return 'bg-emerald-100 text-emerald-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  const has20PercentPaid = (tour) => {
    const totalPrice = getTotalPrice(tour);
    // For tours, paidAmount is nested in pricing object
    const paidAmount = tour.pricing?.paidAmount || 0;
    return totalPrice > 0 && paidAmount >= (totalPrice * 0.2);
  };

  const get20PercentAmount = (tour) => {
    const totalPrice = getTotalPrice(tour);
    return (totalPrice * 0.2).toFixed(2);
  };

  if (loading) {
    return (
      <UserLayout>
        <div className="flex items-center justify-center min-h-screen">
          <div className="text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-emerald-500 mx-auto mb-4"></div>
            <p className="text-gray-600">Loading tours...</p>
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
          <h1 className="text-3xl sm:text-4xl font-bold text-gray-900 flex items-center gap-3 mb-2">
            <Plane size={40} className="text-emerald-500" />
            My Tours
          </h1>
          <p className="text-gray-600">Explore and manage your tour bookings</p>
        </div>

        {error && (
          <div className="bg-red-50 border-2 border-red-300 text-red-800 p-4 rounded-xl flex items-center gap-3">
            <XCircle size={24} />
            {error}
          </div>
        )}

        {/* Stats */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          <div className="bg-gradient-to-br from-emerald-500 to-emerald-600 text-white rounded-xl shadow-lg p-6 border border-emerald-400">
            <p className="text-emerald-100 text-sm font-medium uppercase">Total Tours</p>
            <p className="text-4xl font-bold mt-2">{tours.length}</p>
          </div>
          <div className="bg-gradient-to-br from-green-500 to-emerald-600 text-white rounded-xl shadow-lg p-6 border border-green-400">
            <p className="text-green-100 text-sm font-medium uppercase">Completed</p>
            <p className="text-4xl font-bold mt-2">{tours.filter(t => t.status?.toLowerCase() === 'completed').length}</p>
          </div>
          <div className="bg-gradient-to-br from-teal-500 to-emerald-600 text-white rounded-xl shadow-lg p-6 border border-teal-400">
            <p className="text-teal-100 text-sm font-medium uppercase">Pending</p>
            <p className="text-4xl font-bold mt-2">{tours.filter(t => t.status?.toLowerCase() === 'pending').length}</p>
          </div>
        </div>

        {/* Filters */}
        <div className="bg-white rounded-xl shadow-lg p-6 border border-gray-200 space-y-4">
          <div className="flex flex-col sm:flex-row gap-4">
            {/* Search */}
            <div className="flex-1">
              <div className="relative">
                <Search className="absolute left-3 top-3 text-gray-400" size={20} />
                <input
                  type="text"
                  placeholder="Search by tour name or destination..."
                  value={searchTerm}
                  onChange={(e) => handleSearchChange(e.target.value)}
                  className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-emerald-500"
                />
              </div>
            </div>

            {/* Status Filter */}
            <div className="flex items-center gap-2 flex-wrap sm:flex-nowrap">
              <Filter size={20} className="text-gray-600" />
              {['all', 'completed', 'pending', 'confirmed', 'cancelled'].map(status => (
                <button
                  key={status}
                  onClick={() => handleFilterChange(status)}
                  className={`px-4 py-2 rounded-lg font-semibold transition whitespace-nowrap ${
                    filterStatus === status
                      ? 'bg-emerald-500 text-white shadow-lg'
                      : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                  }`}
                >
                  {status.charAt(0).toUpperCase() + status.slice(1)}
                </button>
              ))}
            </div>
          </div>
        </div>

        {/* Table */}
        <div className="bg-white rounded-xl shadow-lg border border-gray-200 overflow-hidden">
          {filteredTours.length === 0 ? (
            <div className="p-12 text-center">
              <Plane size={48} className="text-gray-400 mx-auto mb-4" />
              <h3 className="text-2xl font-bold text-gray-900 mb-2">No Tours Found</h3>
              <p className="text-gray-600">
                {tours.length === 0 
                  ? "You haven't booked any tours yet."
                  : "No tours match your filters."}
              </p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="border-b-2 border-gray-200 bg-gray-50">
                    <th className="px-6 py-4 text-left text-sm font-bold text-gray-900">Tour Name</th>
                    <th className="px-6 py-4 text-left text-sm font-bold text-gray-900">Destination</th>
                    <th className="px-6 py-4 text-left text-sm font-bold text-gray-900">Date</th>
                    <th className="px-6 py-4 text-left text-sm font-bold text-gray-900">Car Type</th>
                    <th className="px-6 py-4 text-left text-sm font-bold text-gray-900">Passengers</th>
                    <th className="px-6 py-4 text-left text-sm font-bold text-gray-900">Total Amount</th>
                    <th className="px-6 py-4 text-left text-sm font-bold text-gray-900">Paid / 20% Needed</th>
                    <th className="px-6 py-4 text-left text-sm font-bold text-gray-900">Status</th>
                    <th className="px-6 py-4 text-left text-sm font-bold text-gray-900">Action</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-200 dark:divide-gray-700">
                  {filteredTours.map((tour, index) => (
                    <tr key={tour._id || index} className="hover:bg-gray-50 transition">
                      <td className="px-6 py-4">
                        <div className="flex items-center gap-2">
                          <Plane size={16} className="text-emerald-500 flex-shrink-0" />
                          <p className="font-semibold text-gray-900">
                            {tour.package?.title || tour.tourName || 'Tour'}
                          </p>
                        </div>
                      </td>
                      <td className="px-6 py-4">
                        <div className="flex items-center gap-2 text-gray-900">
                          <MapPin size={16} className="text-red-500 flex-shrink-0" />
                          {tour.package?.location || tour.destination || 'N/A'}
                        </div>
                      </td>
                      <td className="px-6 py-4">
                        <div className="flex items-center gap-2 text-sm text-gray-900">
                          <Calendar size={16} className="text-blue-500 flex-shrink-0" />
                          {formatDate(tour.scheduledDate || tour.createdAt)}
                        </div>
                      </td>
                      <td className="px-6 py-4">
                        <span className="px-3 py-1 bg-emerald-100 text-emerald-800 rounded-lg font-semibold text-sm">
                          {tour.carType || 'Premium'}
                        </span>
                      </td>
                      <td className="px-6 py-4">
                        <div className="flex items-center gap-2 text-gray-900 font-semibold">
                          <Users size={16} className="text-blue-500" />
                          {tour.passengers || 1}
                        </div>
                      </td>
                      <td className="px-6 py-4">
                        <div className="font-bold text-green-600 text-lg">
                          ₹{getTotalPrice(tour)}
                        </div>
                      </td>
                      <td className="px-6 py-4">
                        <div className="flex flex-col gap-1">
                          <div className="text-sm">
                            <span className="font-semibold">₹{getPaidAmount(tour)}</span>
                            <span className="text-gray-500"> / ₹{get20PercentAmount(tour)}</span>
                          </div>
                          {has20PercentPaid(tour) ? (
                            <span className="px-2 py-1 bg-emerald-100 text-emerald-800 rounded text-xs font-semibold inline-flex items-center gap-1 w-fit">
                              <Check size={14} /> Paid
                            </span>
                          ) : (
                            <span className="px-2 py-1 bg-orange-100 text-orange-800 rounded text-xs font-semibold inline-flex items-center gap-1 w-fit">
                              <AlertCircle size={14} /> Pending
                            </span>
                          )}
                        </div>
                      </td>
                      <td className="px-6 py-4">
                        <span className={`px-3 py-1 rounded-lg font-semibold text-sm ${getStatusColor(tour.status)}`}>
                          {tour.status || 'Pending'}
                        </span>
                      </td>
                      <td className="px-6 py-4">
                        {!has20PercentPaid(tour) ? (
                          <button
                            onClick={() => handlePayAdvance(tour)}
                            className="px-4 py-2 bg-green-500 hover:bg-green-600 text-white rounded-lg font-semibold text-sm transition"
                          >
                            Pay Now
                          </button>
                        ) : (
                          <button
                            onClick={() => navigate(`/user/booking-confirmation?id=${tour._id}`)}
                            className="px-4 py-2 bg-emerald-500 hover:bg-emerald-600 text-white rounded-lg font-semibold text-sm transition"
                          >
                            View
                          </button>
                        )}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>

        {/* Summary */}
        {filteredTours.length > 0 && (
          <div className="bg-gradient-to-r from-emerald-50 to-teal-100 rounded-xl p-6 border border-emerald-200">
            <p className="text-gray-900 font-semibold">
              Showing {filteredTours.length} tours out of {tours.length} total
            </p>
          </div>
        )}
      </div>
    </UserLayout>
  );
}
