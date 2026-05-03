import { useEffect, useMemo, useState } from 'react';
import { Search, Eye } from 'lucide-react';
import AdminLayout from './AdminLayout';
import { getAllTourBookings } from '../../services/adminService';

const ToursPage = () => {
  const [tours, setTours] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('all'); // Show all tour bookings by default
  const [pagination, setPagination] = useState({ page: 1, pages: 1, total: 0 });
  const [selectedTour, setSelectedTour] = useState(null);
  const [autoRefresh, setAutoRefresh] = useState(true);
  const [lastUpdated, setLastUpdated] = useState(null);
  const [error, setError] = useState(null);
  const [packagePrices, setPackagePrices] = useState({});
  const [actualPayments, setActualPayments] = useState({});
  const [advancePaymentOnly, setAdvancePaymentOnly] = useState(true); // Show only tours with advance payment by default

  const fetchTours = async (page = 1) => {
    try {
      console.log('🔄 Fetching tours - Page:', page, 'Status:', statusFilter);
      const response = await getAllTourBookings({ page, limit: 10, status: statusFilter === 'all' ? undefined : statusFilter });
      
      console.log('✅ API Response:', response);
      const tourData = response.data?.tourBookings || [];
      
      console.log(`📈 Total tours received: ${tourData.length}`);
      
      // Log detailed pricing for all tours
      if (tourData.length > 0) {
        tourData.forEach((tour, index) => {
          console.log(`\n📋 Tour ${index + 1}: ${tour.package?.title || 'N/A'}`, {
            bookingId: tour.bookingId,
            packageId: tour.package?._id,
            packageTitle: tour.package?.title,
            packageBasePrice: tour.package?.basePrice,
            carType: tour.carType,
            pricing: {
              packagePrice: tour.pricing?.packagePrice,
              carUpgradeCharge: tour.pricing?.carUpgradeCharge,
              discount: tour.pricing?.discount,
              totalAmount: tour.pricing?.totalAmount,
              paidAmount: tour.pricing?.paidAmount,
            },
            paymentStatus: tour.paymentStatus,
            paymentOption: tour.paymentOption,
          });
        });
        
        // Fetch actual payment data for all tours in parallel
        console.log('💳 Fetching actual payment data for all tours...');
        const paymentPromises = tourData.map(tour =>
          fetch(`/api/admin/tour-bookings/${tour._id}/payments`, {
            headers: {
              'Authorization': `Bearer ${localStorage.getItem('token')}`
            }
          })
            .then(res => res.json())
            .then(data => {
              if (data.success) {
                return { tourId: tour._id, paymentData: data.data };
              }
              return { tourId: tour._id, paymentData: null };
            })
            .catch(err => {
              console.error(`Error fetching payments for tour ${tour._id}:`, err);
              return { tourId: tour._id, paymentData: null };
            })
        );
        
        const paymentResults = await Promise.all(paymentPromises);
        const newActualPayments = {};
        paymentResults.forEach(({ tourId, paymentData }) => {
          if (paymentData) {
            newActualPayments[tourId] = paymentData;
            console.log(`✅ Payment data for tour ${tourId}:`, paymentData);
          }
        });
        setActualPayments(newActualPayments);
      }
      
      setTours(tourData);
      setPagination(response.data?.pagination || { page: 1, pages: 1, total: 0 });
      setLastUpdated(new Date());
      console.log('✔️ Data updated successfully');
    } catch (error) {
      console.error('❌ Error fetching tours:', error);
      console.error('📋 Error details:', error.response?.data || error.message);
      setError(error.message || 'Failed to load tours');
      setTours([]);
    } finally {
      setLoading(false);
    }
  };

  // Helper function to safely get tour data
  const getTourName = (tour) => tour.package?.title || tour.tourName || 'N/A';
  const getTourLocation = (tour) => tour.package?.location || tour.destination || tour.location || 'N/A';
  
  const getTotalPrice = (tour) => {
    if (!tour) return 0;
    
    // Use car-type specific pricing from package if available
    const carType = tour.carType || 'premium';
    let carTypePrice = 0;
    
    if (tour.package?.pricing) {
      // Map car types to pricing fields in package
      if (carType === 'economy') {
        carTypePrice = tour.package.pricing.economy || tour.package.basePrice || 0;
      } else if (carType === 'premium') {
        carTypePrice = tour.package.pricing.premium || tour.package.basePrice || 0;
      } else {
        carTypePrice = tour.package.pricing[carType] || tour.package.basePrice || 0;
      }
    } else {
      carTypePrice = tour.package?.basePrice || tour.pricing?.totalAmount || 0;
    }
    
    return carTypePrice || tour.pricing?.totalAmount || 0;
  };
  
  const getPaidAmount = (tour) => {
    return tour.pricing?.paidAmount ?? 0;
  };
  
  const getPaymentPercentage = (tour) => {
    const total = getTotalPrice(tour);
    const paid = getPaidAmount(tour);
    if (total === 0) return 0;
    return Math.round((paid / total) * 100);
  };
  
  const getPendingAmount = (tour) => {
    const total = getTotalPrice(tour);
    const paid = getPaidAmount(tour);
    return Math.max(0, total - paid);
  };
  
  const getParticipants = (tour) => tour.passengers || tour.numberOfParticipants || 0;
  
  const getPaymentStatus = (tour) => {
    const paymentStatus = tour.paymentStatus || 'pending';
    if (paymentStatus === 'paid') return 'Full Paid';
    if (paymentStatus === 'partial') return `${getPaymentPercentage(tour)}% Paid`;
    if (paymentStatus === 'pending') return 'Not Paid';
    return paymentStatus;
  };

  const getActualPaidAmount = (tour) => {
    if (!tour || !tour._id) return 0;
    const paymentData = actualPayments[tour._id];
    return paymentData?.totalActualPaid || 0;
  };

  // Initial fetch and auto-refresh
  useEffect(() => {
    console.log('Fetching tours with status filter:', statusFilter);
    void fetchTours(1); // Always fetch from page 1
    
    let intervalId;
    if (autoRefresh) {
      intervalId = window.setInterval(() => {
        console.log('Auto-refreshing tours...');
        void fetchTours(1); // Refresh from page 1
      }, 5000); // Refresh every 5 seconds for real-time updates
    }
    
    return () => {
      if (intervalId) clearInterval(intervalId);
    };
  }, [statusFilter, autoRefresh]);

  const filteredTours = useMemo(() => (
    tours.filter(
      (tour) =>
        (statusFilter === 'all' || tour.status === statusFilter) &&
        (advancePaymentOnly ? getActualPaidAmount(tour) > 0 : true) && // Filter by advance payment if enabled
        (tour.user?.name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        tour.user?.email?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        tour.user?.phone?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        tour.tourName?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        tour.destination?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        tour.location?.toLowerCase().includes(searchTerm.toLowerCase()))
    )
  ), [searchTerm, tours, statusFilter, advancePaymentOnly, actualPayments]);

  const changePage = (page) => {
    setLoading(true);
    setError(null);
    void fetchTours(page);
  };

  // Fetch actual payment data when a tour is selected
  useEffect(() => {
    if (selectedTour && selectedTour._id) {
      const fetchPayments = async () => {
        try {
          console.log(`💳 Fetching actual payments for tour ${selectedTour._id}...`);
          const response = await fetch(`/api/admin/tour-bookings/${selectedTour._id}/payments`, {
            headers: {
              'Authorization': `Bearer ${localStorage.getItem('token')}`
            }
          });
          const data = await response.json();
          if (data.success) {
            setActualPayments(prev => ({
              ...prev,
              [selectedTour._id]: data.data
            }));
            console.log('✅ Actual payment data:', data.data);
          }
        } catch (err) {
          console.error('❌ Error fetching payments:', err);
        }
      };
      fetchPayments();
    }
  }, [selectedTour?._id]);

  return (
    <AdminLayout>
      <div className="space-y-4 sm:space-y-6 px-2 sm:px-4 lg:px-6">
        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center gap-3">
          <div>
            <div className="flex items-center gap-3">
              <h1 className="text-2xl sm:text-3xl font-bold text-gray-900 dark:text-white">Tour Bookings</h1>
              <span className="bg-green-100 dark:bg-green-900/30 text-green-700 dark:text-green-300 px-3 py-1 rounded-full text-sm font-bold">REAL-TIME</span>
            </div>
            <p className="text-xs sm:text-sm text-gray-600 dark:text-gray-400 mt-2">
              Total: <span className="font-bold text-green-600">{pagination.total}</span> tour bookings | 
              <span className="font-bold text-blue-600 ml-2">
                💳 {tours.filter(t => getActualPaidAmount(t) > 0).length} with 20% Advance
              </span>
              {lastUpdated && <span className="ml-3 text-xs text-gray-500">(Updated: {lastUpdated.toLocaleTimeString()})</span>}
            </p>
          </div>
          <button
            onClick={() => setAutoRefresh(!autoRefresh)}
            className={`px-4 py-2 rounded-lg text-sm font-medium ${autoRefresh ? 'bg-green-500 text-white' : 'bg-gray-500 text-white'}`}
          >
            {autoRefresh ? '● Live' : '○ Off'}
          </button>
        </div>

        {/* Search */}
        <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-4">
          {error && (
            <div className="mb-4 bg-red-100 border border-red-400 text-red-700 dark:bg-red-900 px-4 py-3 rounded">
              {error}
              <button onClick={() => setError(null)} className="float-right font-bold">×</button>
            </div>
          )}
          <div className="flex flex-col sm:flex-row gap-3">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-3 text-gray-400" size={18} />
              <input
                type="text"
                placeholder="Search by tour name, user name, phone..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-10 pr-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg dark:bg-gray-700 dark:text-white"
              />
            </div>
            <select
              value={statusFilter}
              onChange={(e) => {
                setLoading(true);
                setError(null);
                setStatusFilter(e.target.value);
              }}
              className="px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg dark:bg-gray-700 dark:text-white font-semibold"
            >
              <option value="all">All Statuses</option>
              <option value="pending">Pending</option>
              <option value="confirmed">Confirmed</option>
              <option value="completed">Completed</option>
              <option value="cancelled">Cancelled</option>
            </select>
            <button
              onClick={() => setAdvancePaymentOnly(!advancePaymentOnly)}
              className={`px-4 py-2 rounded-lg font-semibold text-sm transition ${
                advancePaymentOnly
                  ? 'bg-blue-500 hover:bg-blue-600 text-white'
                  : 'bg-gray-300 dark:bg-gray-600 hover:bg-gray-400 dark:hover:bg-gray-500 text-gray-900 dark:text-white'
              }`}
              title={advancePaymentOnly ? 'Showing: Tours with 20% advance payment only' : 'Showing: All tours'}
            >
              💳 {advancePaymentOnly ? 'Advance Only' : 'All Tours'}
            </button>
          </div>
        </div>

        {/* Table */}
        <div className="bg-white dark:bg-gray-800 rounded-lg shadow overflow-hidden">
          {loading && tours.length === 0 ? (
            <div className="p-8 text-center">
              <div className="inline-block animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500 mb-4"></div>
              <p className="text-gray-500">Loading tour bookings...</p>
            </div>
          ) : filteredTours.filter(t => statusFilter === 'all' || t.status === statusFilter).length === 0 ? (
            <div className="p-8 text-center text-gray-500">
              {tours.length === 0 ? 'No tour bookings found' : 'No results matching your search'}
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead className="bg-gray-100 dark:bg-gray-700 border-b border-gray-200 dark:border-gray-600">
                  <tr>
                    <th className="px-4 py-3 text-left font-semibold text-gray-900 dark:text-white">Tour Name</th>
                    <th className="px-4 py-3 text-left font-semibold text-gray-900 dark:text-white">Booked Date</th>
                    <th className="px-4 py-3 text-left font-semibold text-gray-900 dark:text-white">Name</th>
                    <th className="px-4 py-3 text-left font-semibold text-gray-900 dark:text-white">Car Type</th>
                    <th className="px-4 py-3 text-left font-semibold text-gray-900 dark:text-white">Location</th>
                    <th className="px-4 py-3 text-left font-semibold text-gray-900 dark:text-white">Payment</th>
                    <th className="px-4 py-3 text-center font-semibold text-gray-900 dark:text-white">Action</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-200 dark:divide-gray-600">
                  {filteredTours.filter(t => statusFilter === 'all' || t.status === statusFilter).map((tour) => (
                    <tr key={tour._id} className="hover:bg-gray-50 dark:hover:bg-gray-700">
                      <td className="px-4 py-3 text-gray-900 dark:text-white font-medium">{getTourName(tour)}</td>
                      <td className="px-4 py-3 text-gray-600 dark:text-gray-400 text-sm">
                        <div>
                          {tour?.createdAt ? new Date(tour.createdAt).toLocaleDateString('en-IN') : 'N/A'}
                        </div>
                        <div className="text-xs text-gray-500 dark:text-gray-500">
                          {tour?.createdAt ? new Date(tour.createdAt).toLocaleTimeString('en-IN', { hour: '2-digit', minute: '2-digit' }) : 'N/A'}
                        </div>
                      </td>
                      <td className="px-4 py-3 text-gray-600 dark:text-gray-400">{tour?.user?.name || 'N/A'}</td>
                      <td className="px-4 py-3 text-gray-600 dark:text-gray-400">
                        <span className="px-2 py-1 bg-blue-100 dark:bg-blue-900/30 text-blue-700 dark:text-blue-300 rounded text-sm font-semibold">
                          {tour?.carType?.toUpperCase() || 'N/A'}
                        </span>
                      </td>
                      <td className="px-4 py-3 text-gray-600 dark:text-gray-400">{getTourLocation(tour)}</td>
                      <td className="px-4 py-3">
                        <div className="flex flex-col gap-1">
                          <span className="text-blue-600 dark:text-blue-400 font-bold">₹{getActualPaidAmount(tour)}/₹{getTotalPrice(tour)}</span>
                          <span className={`text-xs px-2 py-1 rounded w-fit font-semibold ${tour.paymentStatus === 'paid' || getActualPaidAmount(tour) >= getTotalPrice(tour) ? 'bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-300' : getActualPaidAmount(tour) > 0 ? 'bg-orange-100 text-orange-700 dark:bg-orange-900/30 dark:text-orange-300' : 'bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-300'}`}>
                            {getActualPaidAmount(tour) === 0 ? '❌ NOT PAID' :
                             getActualPaidAmount(tour) >= getTotalPrice(tour) ? '✓ FULLY PAID' :
                             `⏳ ${Math.round((getActualPaidAmount(tour) / getTotalPrice(tour)) * 100)}% PAID`}
                          </span>
                        </div>
                      </td>
                      <td className="px-4 py-3 text-center">
                        <button
                          onClick={() => setSelectedTour(tour)}
                          className="text-blue-500 hover:text-blue-700 dark:text-blue-400 dark:hover:text-blue-300 inline-flex items-center gap-1"
                        >
                          <Eye size={18} />
                          <span className="text-xs font-medium">View</span>
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>

        {/* Pagination */}
        <div className="flex justify-between items-center">
          <p className="text-sm text-gray-600 dark:text-gray-400">
            Total: {filteredTours.filter(t => statusFilter === 'all' || t.status === statusFilter).length} bookings
          </p>
          <div className="flex gap-2">
            <button
              disabled={pagination.page === 1}
              onClick={() => changePage(pagination.page - 1)}
              className="px-4 py-2 bg-gray-200 dark:bg-gray-700 rounded disabled:opacity-50 text-sm"
            >
              Previous
            </button>
            <span className="px-4 py-2 text-sm text-gray-600 dark:text-gray-400">
              Page {pagination.page} of {pagination.pages}
            </span>
            <button
              disabled={pagination.page === pagination.pages}
              onClick={() => changePage(pagination.page + 1)}
              className="px-4 py-2 bg-gray-200 dark:bg-gray-700 rounded disabled:opacity-50 text-sm"
            >
              Next
            </button>
          </div>
        </div>

        {/* Detail Modal */}
        {selectedTour && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
            <div className="bg-white dark:bg-gray-800 rounded-lg max-w-4xl w-full p-6 space-y-4 max-h-[90vh] overflow-y-auto">
              <div className="flex justify-between items-center mb-6">
                <h2 className="text-2xl font-bold text-gray-900 dark:text-white">📋 Tour Booking Details</h2>
                <button onClick={() => setSelectedTour(null)} className="text-gray-500 hover:text-gray-700 dark:text-gray-400 text-2xl">×</button>
              </div>

              {/* Booking Timeline */}
              <div className="bg-gradient-to-r from-blue-50 to-purple-50 dark:from-blue-900/20 dark:to-purple-900/20 p-4 rounded-lg border border-blue-200 dark:border-blue-700">
                <h3 className="font-semibold text-gray-900 dark:text-white mb-3">📅 Booking Timeline</h3>
                <div className="grid grid-cols-3 gap-3">
                  <div>
                    <p className="text-xs font-semibold text-gray-600 dark:text-gray-400">Booked On</p>
                    <p className="text-sm font-bold text-gray-900 dark:text-white">{selectedTour.createdAt ? new Date(selectedTour.createdAt).toLocaleDateString('en-IN') : 'N/A'}</p>
                  </div>
                  <div>
                    <p className="text-xs font-semibold text-gray-600 dark:text-gray-400">Scheduled Date</p>
                    <p className="text-sm font-bold text-gray-900 dark:text-white">{selectedTour.scheduledDate ? new Date(selectedTour.scheduledDate).toLocaleDateString('en-IN') : 'N/A'}</p>
                  </div>
                  <div>
                    <p className="text-xs font-semibold text-gray-600 dark:text-gray-400">Time</p>
                    <p className="text-sm font-bold text-gray-900 dark:text-white">{selectedTour.scheduledTime || 'N/A'}</p>
                  </div>
                </div>
              </div>

              {/* User Information */}
              <div className="bg-gray-50 dark:bg-gray-700/50 p-4 rounded-lg border border-gray-200 dark:border-gray-600">
                <h3 className="font-semibold text-gray-900 dark:text-white mb-3">👤 Customer Information</h3>
                <div className="grid grid-cols-3 gap-3 text-sm">
                  <div>
                    <p className="text-gray-600 dark:text-gray-400 font-semibold">Name</p>
                    <p className="text-gray-900 dark:text-white break-words">{selectedTour.user?.name || 'N/A'}</p>
                  </div>
                  <div>
                    <p className="text-gray-600 dark:text-gray-400 font-semibold">Email</p>
                    <p className="text-gray-900 dark:text-white break-words">{selectedTour.user?.email || 'N/A'}</p>
                  </div>
                  <div>
                    <p className="text-gray-600 dark:text-gray-400 font-semibold">Phone</p>
                    <p className="text-gray-900 dark:text-white">{selectedTour.user?.phone || 'N/A'}</p>
                  </div>
                </div>
              </div>

              {/* Tour Details */}
              <div className="bg-gray-50 dark:bg-gray-700/50 p-4 rounded-lg border border-gray-200 dark:border-gray-600">
                <h3 className="font-semibold text-gray-900 dark:text-white mb-3">🎫 Tour Details</h3>
                <div className="grid grid-cols-2 gap-3 text-sm">
                  <div>
                    <p className="text-gray-600 dark:text-gray-400 font-semibold">Tour Name</p>
                    <p className="text-gray-900 dark:text-white">{getTourName(selectedTour)}</p>
                  </div>
                  <div>
                    <p className="text-gray-600 dark:text-gray-400 font-semibold">Category</p>
                    <p className="text-gray-900 dark:text-white">{selectedTour.package?.tourCategory || 'N/A'}</p>
                  </div>
                  <div>
                    <p className="text-gray-600 dark:text-gray-400 font-semibold">Tour Location</p>
                    <p className="text-gray-900 dark:text-white">{getTourLocation(selectedTour)}</p>
                  </div>
                  <div>
                    <p className="text-gray-600 dark:text-gray-400 font-semibold">Pickup Location</p>
                    <p className="text-gray-900 dark:text-white">{selectedTour.pickupLocation || 'N/A'}</p>
                  </div>
                </div>
              </div>

                {/* Vehicle & Passengers */}
              <div className="bg-gray-50 dark:bg-gray-700/50 p-4 rounded-lg border border-gray-200 dark:border-gray-600">
                <h3 className="font-semibold text-gray-900 dark:text-white mb-3">Vehicle Information</h3>
                <div className="grid grid-cols-3 gap-3 text-sm">
                  <div>
                    <p className="text-gray-600 dark:text-gray-400 font-semibold">Car Type Selected</p>
                    <p className="text-gray-900 dark:text-white font-bold uppercase">{selectedTour.carType || 'N/A'}</p>
                    <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
                      {selectedTour.carType === 'economy' ? 'Standard' :
                       selectedTour.carType === 'premium' ? 'Premium' :
                       'N/A'}
                    </p>
                  </div>
                  <div>
                    <p className="text-gray-600 dark:text-gray-400 font-semibold">Passengers</p>
                    <p className="text-gray-900 dark:text-white font-bold">{getParticipants(selectedTour)} People</p>
                  </div>
                  <div>
                    <p className="text-gray-600 dark:text-gray-400 font-semibold">Payment Method</p>
                    <p className="text-gray-900 dark:text-white font-bold">{selectedTour.paymentMethod?.charAt(0).toUpperCase() + selectedTour.paymentMethod?.slice(1) || 'Online'}</p>
                  </div>
                </div>
              </div>

              <div className="border-t border-gray-200 dark:border-gray-700 pt-4 space-y-3">
                <h3 className="font-semibold text-gray-900 dark:text-white">💰 Payment Information</h3>
                
                {/* Detailed Pricing Breakdown */}
                <div className="bg-gradient-to-br from-blue-50 to-blue-100 dark:from-blue-900/20 dark:to-blue-900/10 p-4 rounded-lg border border-blue-200 dark:border-blue-700">
                  <h4 className="text-sm font-semibold text-blue-900 dark:text-blue-300 mb-3">📊 Complete Price Breakdown</h4>
                  <div className="space-y-2 text-sm">
                    <div>
                      <p className="text-blue-600 dark:text-blue-400 text-xs font-semibold mb-2">Package Details:</p>
                      <p className="text-blue-800 dark:text-blue-300 text-xs">Title: {selectedTour.package?.title}</p>
                      <p className="text-blue-800 dark:text-blue-300 text-xs">Base Price: ₹{selectedTour.package?.basePrice || 'N/A'}</p>
                    </div>
                    <div className="border-t border-blue-300 dark:border-blue-600 pt-2">
                      <p className="text-blue-600 dark:text-blue-400 text-xs font-semibold mb-2">Car Type Pricing from Package:</p>
                      <div className="space-y-1 text-xs">
                        {/* Show Economy */}
                        {selectedTour.package?.pricing?.economy !== undefined && (
                          <div className={`p-2 rounded ${selectedTour.carType === 'economy' ? 'bg-green-100 dark:bg-green-900/30' : 'bg-white dark:bg-blue-900/20'}`}>
                            <span className="text-emerald-800 dark:text-emerald-300">Economy:</span>
                            <span className="font-bold text-blue-900 dark:text-blue-200 ml-2">₹{selectedTour.package?.pricing?.economy}</span>
                            {selectedTour.carType === 'economy' && <span className="ml-2 text-green-600 font-bold">✓ SELECTED</span>}
                          </div>
                        )}
                        {/* Show Premium */}
                        {selectedTour.package?.pricing?.premium !== undefined && (
                          <div className={`p-2 rounded ${selectedTour.carType === 'premium' ? 'bg-green-100 dark:bg-green-900/30' : 'bg-white dark:bg-blue-900/20'}`}>
                            <span className="text-emerald-800 dark:text-emerald-300">Premium:</span>
                            <span className="font-bold text-blue-900 dark:text-blue-200 ml-2">₹{selectedTour.package?.pricing?.premium}</span>
                            {selectedTour.carType === 'premium' && <span className="ml-2 text-green-600 font-bold">✓ SELECTED</span>}
                          </div>
                        )}
                      </div>
                    </div>
                    <div className="border-t-2 border-blue-400 dark:border-blue-500 pt-2 mt-2">
                      <div className="flex justify-between">
                        <span className="text-blue-900 dark:text-blue-300 font-bold">SELECTED CAR PRICE ({selectedTour.carType?.toUpperCase()}):</span>
                        <span className="text-lg font-bold text-blue-600 dark:text-blue-400">
                          ₹{getTotalPrice(selectedTour)}
                        </span>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Payment Status Grid - Using ACTUAL Payment Data */}
                <div className="grid grid-cols-3 gap-3">
                  <div className={`p-3 rounded-lg border ${getActualPaidAmount(selectedTour) > 0 ? 'bg-green-50 dark:bg-green-900/20 border-green-200 dark:border-green-700' : 'bg-gray-100 dark:bg-gray-700 border-gray-300 dark:border-gray-600'}`}>
                    <p className={`text-xs font-bold mb-1 ${getActualPaidAmount(selectedTour) > 0 ? 'text-green-700 dark:text-green-400' : 'text-gray-600 dark:text-gray-400'}`}>✓ AMOUNT PAID (From Gateway)</p>
                    <p className={`text-2xl font-bold ${getActualPaidAmount(selectedTour) > 0 ? 'text-green-600 dark:text-green-400' : 'text-gray-700 dark:text-gray-300'}`}>₹{getActualPaidAmount(selectedTour)}</p>
                  </div>
                  <div className={`p-3 rounded-lg border ${getTotalPrice(selectedTour) - getActualPaidAmount(selectedTour) > 0 ? 'bg-orange-50 dark:bg-orange-900/20 border-orange-200 dark:border-orange-700' : 'bg-green-50 dark:bg-green-900/20 border-green-200 dark:border-green-700'}`}>
                    <p className={`text-xs font-bold mb-1 ${getTotalPrice(selectedTour) - getActualPaidAmount(selectedTour) > 0 ? 'text-orange-700 dark:text-orange-400' : 'text-green-700 dark:text-green-400'}`}>⏳ PENDING</p>
                    <p className={`text-2xl font-bold ${getTotalPrice(selectedTour) - getActualPaidAmount(selectedTour) > 0 ? 'text-orange-600 dark:text-orange-400' : 'text-green-600 dark:text-green-400'}`}>₹{Math.max(0, getTotalPrice(selectedTour) - getActualPaidAmount(selectedTour))}</p>
                  </div>
                  <div className="bg-purple-50 dark:bg-purple-900/20 p-3 rounded-lg border border-purple-200 dark:border-purple-700">
                    <p className="text-xs font-bold text-purple-700 dark:text-purple-400 mb-1">📊 PAID%</p>
                    <p className="text-2xl font-bold text-purple-600 dark:text-purple-400">{getTotalPrice(selectedTour) > 0 ? Math.round((getActualPaidAmount(selectedTour) / getTotalPrice(selectedTour)) * 100) : 0}%</p>
                  </div>
                </div>

                {/* Payment Status */}
                <div className="flex items-center gap-3 bg-gray-50 dark:bg-gray-700/50 p-4 rounded-lg border border-gray-200 dark:border-gray-600">
                  <span className="text-sm font-bold text-gray-700 dark:text-gray-300">Payment Status (via Gateway):</span>
                  <span className={`text-sm font-bold px-4 py-2 rounded-full ${
                    getActualPaidAmount(selectedTour) === 0 ? 'bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-300' :
                    getActualPaidAmount(selectedTour) >= getTotalPrice(selectedTour) ? 'bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-300' :
                    'bg-orange-100 text-orange-700 dark:bg-orange-900/30 dark:text-orange-300'
                  }`}>
                    {getActualPaidAmount(selectedTour) === 0 ? '❌ NOT PAID' :
                     getActualPaidAmount(selectedTour) >= getTotalPrice(selectedTour) ? '✓ FULLY PAID' :
                     `⏳ ${Math.round((getActualPaidAmount(selectedTour) / getTotalPrice(selectedTour)) * 100)}% PAID`}
                  </span>
                </div>

                {/* Booking Status */}
                <div className="flex items-center gap-3 bg-gray-50 dark:bg-gray-700/50 p-4 rounded-lg border border-gray-200 dark:border-gray-600">
                  <span className="text-sm font-bold text-gray-700 dark:text-gray-300">Booking Status:</span>
                  <span className={`text-sm font-bold px-4 py-2 rounded-full ${
                    selectedTour.status === 'confirmed' ? 'bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-300' :
                    selectedTour.status === 'completed' ? 'bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-300' :
                    selectedTour.status === 'cancelled' ? 'bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-300' :
                    'bg-yellow-100 text-yellow-700 dark:bg-yellow-900/30 dark:text-yellow-300'
                  }`}>
                    {selectedTour.status?.toUpperCase()}
                  </span>
                </div>

                {/* Payment Verification Summary */}
                <div className="bg-amber-50 dark:bg-amber-900/20 border border-amber-200 dark:border-amber-700 p-4 rounded-lg">
                  <h4 className="text-sm font-semibold text-amber-900 dark:text-amber-300 mb-3">✓ Payment Verification Summary</h4>
                  <div className="space-y-2 text-sm text-amber-900 dark:text-amber-200">
                    <div className="flex justify-between">
                      <span>Total Package Cost (Car Type: {selectedTour.carType?.toUpperCase()}):</span>
                      <span className="font-bold text-lg text-blue-600 dark:text-blue-400">₹{getTotalPrice(selectedTour)}</span>
                    </div>
                    <div className="flex justify-between text-xs text-gray-600 dark:text-gray-400">
                      <span>(Old booking stored: ₹{getPaidAmount(selectedTour)}/₹{selectedTour.pricing?.totalAmount})</span>
                    </div>
                    <div className="border-t border-amber-300 dark:border-amber-600 pt-2 flex justify-between">
                      <span className="font-bold">✅ ACTUAL Amount Received from Payment Gateway:</span>
                      <span className="font-bold text-green-600 dark:text-green-400 text-lg">₹{getActualPaidAmount(selectedTour)}</span>
                    </div>
                    <div className="flex justify-between">
                      <span>Payment Percentage:</span>
                      <span className={`font-bold text-lg ${getTotalPrice(selectedTour) > 0 && getActualPaidAmount(selectedTour) >= getTotalPrice(selectedTour) ? 'text-green-600 dark:text-green-400' : 'text-orange-600 dark:text-orange-400'}`}>
                        {getTotalPrice(selectedTour) > 0 ? Math.round((getActualPaidAmount(selectedTour) / getTotalPrice(selectedTour)) * 100) : 0}%
                      </span>
                    </div>
                    <div className="flex justify-between">
                      <span>Remaining Balance:</span>
                      <span className={`font-bold text-lg ${Math.max(0, getTotalPrice(selectedTour) - getActualPaidAmount(selectedTour)) === 0 ? 'text-green-600 dark:text-green-400' : 'text-orange-600 dark:text-orange-400'}`}>
                        ₹{Math.max(0, getTotalPrice(selectedTour) - getActualPaidAmount(selectedTour))}
                      </span>
                    </div>
                    <div className="bg-white dark:bg-amber-900/30 p-3 rounded mt-3 text-xs border border-amber-300 dark:border-amber-600">
                      <p className="text-amber-800 dark:text-amber-200">
                        {getActualPaidAmount(selectedTour) === 0 
                          ? '❌ No payment received yet' 
                          : getActualPaidAmount(selectedTour) === getTotalPrice(selectedTour)
                          ? '✅ Full payment completed via payment gateway'
                          : getActualPaidAmount(selectedTour) > 0
                          ? `⏳ Partial payment received (₹${Math.max(0, getTotalPrice(selectedTour) - getActualPaidAmount(selectedTour))} still due)`
                          : 'Payment data not available'
                        }
                      </p>
                    </div>
                  </div>
                </div>

                {/* Payment Transaction History */}
                {actualPayments[selectedTour._id]?.payments && actualPayments[selectedTour._id].payments.length > 0 && (
                  <div className="bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-700 p-4 rounded-lg">
                    <h4 className="text-sm font-semibold text-blue-900 dark:text-blue-300 mb-3">💳 Payment Transaction History</h4>
                    <div className="space-y-2">
                      {actualPayments[selectedTour._id].payments.map((payment, idx) => (
                        <div key={idx} className="bg-white dark:bg-blue-900/30 p-3 rounded flex justify-between items-center">
                          <div className="flex-1">
                            <p className="text-sm font-semibold text-gray-900 dark:text-white">₹{payment.amount}</p>
                            <p className="text-xs text-gray-500 dark:text-gray-400">
                              {payment.paymentMethod?.toUpperCase()} • {payment.paidAt ? new Date(payment.paidAt).toLocaleDateString('en-IN') : 'Pending'}
                            </p>
                          </div>
                          <span className={`text-xs font-bold px-2 py-1 rounded ${
                            payment.status === 'success' ? 'bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400' :
                            payment.status === 'pending' ? 'bg-yellow-100 text-yellow-700 dark:bg-yellow-900/30 dark:text-yellow-400' :
                            'bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400'
                          }`}>
                            {payment.status?.toUpperCase()}
                          </span>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </div>

              <button
                onClick={() => setSelectedTour(null)}
                className="w-full bg-blue-500 hover:bg-blue-600 text-white px-4 py-3 rounded-lg transition font-semibold"
              >
                Close Details
              </button>
            </div>
          </div>
        )}
      </div>
    </AdminLayout>
  );
};

export default ToursPage;
