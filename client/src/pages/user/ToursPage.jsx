import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Plane, Calendar, MapPin, Users, Filter, Search } from 'lucide-react';
import UserLayout from './UserLayout.jsx';
import * as packageService from '../../services/packageService.js';

export default function ToursPage() {
  const [tours, setTours] = useState([]);
  const [filteredTours, setFilteredTours] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [filterStatus, setFilterStatus] = useState('all');
  const [searchTerm, setSearchTerm] = useState('');
  const navigate = useNavigate();

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

    // 🔒 IMPORTANT: Only show tours where user has paid 20% advance
    filtered = filtered.filter(t => has20PercentPaid(t));
    console.log(`🔒 After 20% payment filter: ${filtered.length} tours out of ${toursData.length}`);

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
        return 'bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-400';
      case 'pending':
        return 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900/30 dark:text-yellow-400';
      case 'cancelled':
        return 'bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-400';
      case 'confirmed':
        return 'bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-400';
      default:
        return 'bg-gray-100 text-gray-800 dark:bg-gray-700 dark:text-gray-300';
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
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-purple-500 mx-auto mb-4"></div>
            <p className="text-gray-600 dark:text-gray-300">Loading tours...</p>
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
            <span className="text-4xl">✈️</span>
            My Tours
          </h1>
          <p className="text-gray-600 dark:text-gray-400">Explore and manage your tour bookings</p>
        </div>

        {error && (
          <div className="bg-red-50 dark:bg-red-900/30 border-2 border-red-300 dark:border-red-600 text-red-800 dark:text-red-200 p-4 rounded-xl flex items-center gap-3">
            <span className="text-2xl">❌</span>
            {error}
          </div>
        )}

        {/* Stats */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          <div className="bg-gradient-to-br from-purple-500 to-purple-600 text-white rounded-xl shadow-lg p-6 border border-purple-400">
            <p className="text-purple-100 text-sm font-medium uppercase">Total Tours (20% Paid)</p>
            <p className="text-4xl font-bold mt-2">{tours.filter(t => has20PercentPaid(t)).length}</p>
          </div>
          <div className="bg-gradient-to-br from-green-500 to-emerald-600 text-white rounded-xl shadow-lg p-6 border border-green-400">
            <p className="text-green-100 text-sm font-medium uppercase">Completed</p>
            <p className="text-4xl font-bold mt-2">{tours.filter(t => has20PercentPaid(t) && t.status?.toLowerCase() === 'completed').length}</p>
          </div>
          <div className="bg-gradient-to-br from-orange-500 to-red-600 text-white rounded-xl shadow-lg p-6 border border-orange-400">
            <p className="text-orange-100 text-sm font-medium uppercase">Pending</p>
            <p className="text-4xl font-bold mt-2">{tours.filter(t => has20PercentPaid(t) && t.status?.toLowerCase() === 'pending').length}</p>
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
                  placeholder="Search by tour name or destination..."
                  value={searchTerm}
                  onChange={(e) => handleSearchChange(e.target.value)}
                  className="w-full pl-10 pr-4 py-2 border border-gray-300 dark:border-gray-600 dark:bg-gray-700 dark:text-white rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500"
                />
              </div>
            </div>

            {/* Status Filter */}
            <div className="flex items-center gap-2 flex-wrap sm:flex-nowrap">
              <Filter size={20} className="text-gray-600 dark:text-gray-400" />
              {['all', 'completed', 'pending', 'confirmed', 'cancelled'].map(status => (
                <button
                  key={status}
                  onClick={() => handleFilterChange(status)}
                  className={`px-4 py-2 rounded-lg font-semibold transition whitespace-nowrap ${
                    filterStatus === status
                      ? 'bg-purple-500 text-white shadow-lg'
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
          {filteredTours.length === 0 ? (
            <div className="p-12 text-center">
              <Plane size={48} className="text-gray-400 mx-auto mb-4" />
              <h3 className="text-2xl font-bold text-gray-900 dark:text-white mb-2">No Tours Found</h3>
              <p className="text-gray-600 dark:text-gray-400">
                {tours.length === 0 
                  ? "You haven't booked any tours yet."
                  : tours.filter(t => has20PercentPaid(t)).length === 0
                  ? "Please pay 20% advance to see your tour booking."
                  : "No tours match your filters."}
              </p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="border-b-2 border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-700">
                    <th className="px-6 py-4 text-left text-sm font-bold text-gray-900 dark:text-white">Tour Name</th>
                    <th className="px-6 py-4 text-left text-sm font-bold text-gray-900 dark:text-white">Destination</th>
                    <th className="px-6 py-4 text-left text-sm font-bold text-gray-900 dark:text-white">Date</th>
                    <th className="px-6 py-4 text-left text-sm font-bold text-gray-900 dark:text-white">Car Type</th>
                    <th className="px-6 py-4 text-left text-sm font-bold text-gray-900 dark:text-white">Passengers</th>
                    <th className="px-6 py-4 text-left text-sm font-bold text-gray-900 dark:text-white">Total Amount</th>
                    <th className="px-6 py-4 text-left text-sm font-bold text-gray-900 dark:text-white">Paid / 20% Needed</th>
                    <th className="px-6 py-4 text-left text-sm font-bold text-gray-900 dark:text-white">Status</th>
                    <th className="px-6 py-4 text-left text-sm font-bold text-gray-900 dark:text-white">Action</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-200 dark:divide-gray-700">
                  {filteredTours.map((tour, index) => (
                    <tr key={tour._id || index} className="hover:bg-gray-50 dark:hover:bg-gray-700/50 transition">
                      <td className="px-6 py-4">
                        <div className="flex items-center gap-2">
                          <Plane size={16} className="text-purple-500 flex-shrink-0" />
                          <p className="font-semibold text-gray-900 dark:text-white">
                            {tour.package?.title || tour.tourName || 'Tour'}
                          </p>
                        </div>
                      </td>
                      <td className="px-6 py-4">
                        <div className="flex items-center gap-2 text-gray-900 dark:text-white">
                          <MapPin size={16} className="text-red-500 flex-shrink-0" />
                          {tour.package?.location || tour.destination || 'N/A'}
                        </div>
                      </td>
                      <td className="px-6 py-4">
                        <div className="flex items-center gap-2 text-sm text-gray-900 dark:text-white">
                          <Calendar size={16} className="text-blue-500 flex-shrink-0" />
                          {formatDate(tour.scheduledDate || tour.createdAt)}
                        </div>
                      </td>
                      <td className="px-6 py-4">
                        <span className="px-3 py-1 bg-purple-100 dark:bg-purple-900/30 text-purple-800 dark:text-purple-300 rounded-lg font-semibold text-sm">
                          {tour.carType || 'Premium'}
                        </span>
                      </td>
                      <td className="px-6 py-4">
                        <div className="flex items-center gap-2 text-gray-900 dark:text-white font-semibold">
                          <Users size={16} className="text-blue-500" />
                          {tour.passengers || 1}
                        </div>
                      </td>
                      <td className="px-6 py-4">
                        <div className="font-bold text-green-600 dark:text-green-400 text-lg">
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
                            <span className="px-2 py-1 bg-emerald-100 dark:bg-emerald-900/30 text-emerald-800 dark:text-emerald-400 rounded text-xs font-semibold inline-flex items-center gap-1 w-fit">
                              <span>✓</span> Paid
                            </span>
                          ) : (
                            <span className="px-2 py-1 bg-orange-100 dark:bg-orange-900/30 text-orange-800 dark:text-orange-400 rounded text-xs font-semibold inline-flex items-center gap-1 w-fit">
                              <span>⚠</span> Pending
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
                        <button
                          onClick={() => navigate(`/user/booking-confirmation?id=${tour._id}`)}
                          className="px-4 py-2 bg-purple-500 hover:bg-purple-600 text-white rounded-lg font-semibold text-sm transition"
                        >
                          View
                        </button>
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
          <div className="bg-gradient-to-r from-purple-50 to-pink-100 dark:from-purple-900/20 dark:to-pink-800/20 rounded-xl p-6 border border-purple-200 dark:border-purple-700">
            <p className="text-gray-900 dark:text-white font-semibold">
              Showing {filteredTours.length} tours (with 20% advance paid) out of {tours.filter(t => has20PercentPaid(t)).length} total
            </p>
          </div>
        )}
      </div>
    </UserLayout>
  );
}
