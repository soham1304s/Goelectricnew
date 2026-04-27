import { useState, useEffect } from 'react';
import { Edit2, Check, X, Plane, ParkingCircle, Save, AlertCircle, MapPin, BookOpen, Calendar, User, Phone, MapPinIcon } from 'lucide-react';
import AdminLayout from './AdminLayout';
import { useTheme } from '../../context/ThemeContext';
import { fetchCarRates } from '../../services/rateService';
import api from '../../services/api';

const AirportRidesPage = () => {
  const { theme } = useTheme();
  const isDark = theme === 'dark';

  const [carRates, setCarRates] = useState([]);
  const [editingId, setEditingId] = useState(null);
  const [editingData, setEditingData] = useState({});
  const [successMessage, setSuccessMessage] = useState('');
  const [errorMessage, setErrorMessage] = useState('');
  const [loading, setLoading] = useState(true);
  const [rideType, setRideType] = useState('pickup'); // 'pickup' or 'drop'
  const [showBookings, setShowBookings] = useState(false);
  const [airportBookings, setAirportBookings] = useState([]);
  const [bookingsLoading, setBookingsLoading] = useState(false);

  // Fetch rates on component mount
  useEffect(() => {
    fetchRates();
    // Remove auto-refresh interval to prevent overwriting user edits
    // const interval = setInterval(fetchRates, 5000);
    // return () => clearInterval(interval);
  }, []);

  // Fetch airport bookings
  const fetchAirportBookings = async () => {
    try {
      setBookingsLoading(true);
      const response = await api.get('/admin/airport-bookings');
      if (response.data?.success) {
        setAirportBookings(response.data.bookings || []);
      } else {
        setErrorMessage('Failed to fetch airport bookings');
      }
    } catch (error) {
      console.error('Error fetching airport bookings:', error);
      setErrorMessage('Error loading airport bookings');
    } finally {
      setBookingsLoading(false);
    }
  };

  const handleShowBookings = () => {
    setShowBookings(true);
    fetchAirportBookings();
  };

  const fetchRates = async () => {
    try {
      setLoading(true);
      const rates = await fetchCarRates(true);
      if (rates && Array.isArray(rates)) {
        // Filter to only show Premium and Economy (no Mini or others)
        const filteredRates = rates.filter(rate => 
          rate.id === 'premium' || rate.id === 'economy'
        );
        setCarRates(filteredRates);
      } else {
        setErrorMessage('Invalid rates data received');
      }
    } catch (error) {
      console.error('Error fetching rates:', error);
      setErrorMessage('Failed to fetch rates');
    } finally {
      setLoading(false);
    }
  };

  const handleEdit = (rate) => {
    // Get charges for current rideType (pickup/drop)
    const chargesForType = rate.airportCharges?.[rideType] || {};
    setEditingId(rate.id);
    setEditingData({
      ...rate,
      fixedCharge: chargesForType.fixedCharge || 0,
      parkingCharge: chargesForType.parkingCharge || 0,
    });
  };

  const handleCancel = () => {
    setEditingId(null);
    setEditingData({});
  };

  const handleSave = async (id) => {
    if (editingData.fixedCharge === undefined || editingData.fixedCharge < 0) {
      setErrorMessage('Please enter a valid fixed charge');
      setTimeout(() => setErrorMessage(''), 3000);
      return;
    }

    if (editingData.parkingCharge === undefined || editingData.parkingCharge < 0) {
      setErrorMessage('Please enter a valid parking charge');
      setTimeout(() => setErrorMessage(''), 3000);
      return;
    }

    try {
      const updatedRate = {
        rideType: rideType, // Add rideType to request
        fixedCharge: parseFloat(editingData.fixedCharge),
        parkingCharge: parseFloat(editingData.parkingCharge),
      };

      console.log(`💾 Saving ${rideType} airport charges:`, updatedRate);

      // Update through API
      const response = await api.patch(`/admin/pricing/airport/${id}`, updatedRate);

      if (response.data?.success) {
        // Update local state with new airportCharges structure
        const updatedRates = carRates.map((rate) =>{
          if (rate.id === id) {
            // Update airportCharges for specific rideType
            return {
              ...rate,
              airportCharges: {
                ...rate.airportCharges,
                [rideType]: {
                  fixedCharge: parseFloat(editingData.fixedCharge),
                  parkingCharge: parseFloat(editingData.parkingCharge),
                }
              }
            };
          }
          return rate;
        });

        setCarRates(updatedRates);
        setSuccessMessage(`✅ ${rideType.charAt(0).toUpperCase() + rideType.slice(1)} airport charges updated successfully!`);
        setEditingId(null);
        setEditingData({});

        // Clear rate cache so next page load gets fresh data
        localStorage.removeItem('rateCache');

        // Clear success message after 3 seconds
        setTimeout(() => setSuccessMessage(''), 3000);
      } else {
        setErrorMessage(response.data?.message || 'Failed to update charges');
      }
    } catch (error) {
      console.error('Error saving charges:', error);
      setErrorMessage('❌ Failed to update charges: ' + error.message);
    }
  };

  const handleInputChange = (field, value) => {
    setEditingData({
      ...editingData,
      [field]: value === '' ? '' : parseFloat(value) || 0,
    });
  };

  if (loading) {
    return (
      <AdminLayout>
        <div className={`flex items-center justify-center min-h-screen ${isDark ? 'bg-gradient-to-br from-gray-900 via-gray-800 to-gray-900' : 'bg-gradient-to-br from-gray-50 via-blue-50 to-gray-100'}`}>
          <div className="text-center space-y-4">
            <div className="h-14 w-14 border-4 border-emerald-400 border-t-emerald-600 rounded-full animate-spin mx-auto"></div>
            <p className={`font-semibold text-lg ${isDark ? 'text-gray-300' : 'text-gray-700'}`}>Loading Airport Rates...</p>
            <p className={`text-sm ${isDark ? 'text-gray-500' : 'text-gray-500'}`}>Please wait while we fetch the latest pricing</p>
          </div>
        </div>
      </AdminLayout>
    );
  }

  return (
    <AdminLayout>
      <div className={`min-h-screen ${isDark ? 'bg-gradient-to-br from-gray-900 via-gray-800 to-gray-900' : 'bg-gradient-to-br from-gray-50 via-blue-50 to-gray-100'}`}>
        <div className="p-6 md:p-8">
          {/* Header */}
          <div className="mb-8">
            <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4 md:gap-0">
              <div className="flex items-center gap-3">
                <div className={`p-2 md:p-3 rounded-xl ${isDark ? 'bg-emerald-500/20' : 'bg-emerald-100'}`}>
                  <Plane className={`h-6 md:h-8 w-6 md:w-8 ${isDark ? 'text-emerald-400' : 'text-emerald-600'}`} />
                </div>
                <div className="flex-1">
                  <h1 className={`text-2xl md:text-4xl font-bold ${isDark ? 'text-white' : 'text-gray-900'}`}>
                    ✈️ Airport Charges
                  </h1>
                  <p className={`text-xs md:text-sm ${isDark ? 'text-gray-400' : 'text-gray-600'}`}>
                    JAI - Fixed Rate Pricing
                  </p>
                </div>
              </div>
              {/* Bookings Button */}
              <button
                onClick={handleShowBookings}
                className={`w-full md:w-auto px-4 md:px-5 py-3 rounded-xl font-semibold flex items-center justify-center md:justify-start gap-2 transition-all shadow-lg whitespace-nowrap ${
                  isDark
                    ? 'bg-blue-600 hover:bg-blue-700 text-white hover:shadow-blue-500/50'
                    : 'bg-blue-500 hover:bg-blue-600 text-white hover:shadow-blue-400/50'
                }`}
              >
                <BookOpen className="h-5 w-5 flex-shrink-0" />
                <span className="text-sm md:text-base">📋 Bookings</span>
              </button>
            </div>
          </div>

          {/* Ride Type Tabs */}
          <div className={`mb-8 rounded-2xl p-1 flex gap-2 ${isDark ? 'bg-gray-800' : 'bg-white'} shadow-lg`}>
            <button
              onClick={() => setRideType('pickup')}
              className={`flex-1 px-6 py-3 rounded-xl font-semibold flex items-center justify-center gap-2 transition-all duration-300 ${
                rideType === 'pickup'
                  ? `${isDark ? 'bg-emerald-600 text-white shadow-lg' : 'bg-emerald-500 text-white shadow-lg'}`
                  : `${isDark ? 'text-gray-400 hover:text-white' : 'text-gray-600 hover:text-gray-900'}`
              }`}
            >
              <MapPin className="h-5 w-5" />
              <span>Pickup from Airport</span>
            </button>
            <button
              onClick={() => setRideType('drop')}
              className={`flex-1 px-6 py-3 rounded-xl font-semibold flex items-center justify-center gap-2 transition-all duration-300 ${
                rideType === 'drop'
                  ? `${isDark ? 'bg-purple-600 text-white shadow-lg' : 'bg-purple-500 text-white shadow-lg'}`
                  : `${isDark ? 'text-gray-400 hover:text-white' : 'text-gray-600 hover:text-gray-900'}`
              }`}
            >
              <Plane className="h-5 w-5" />
              <span>Drop to Airport</span>
            </button>
          </div>

          {/* Alerts */}
          {successMessage && (
            <div className="mb-6 p-4 rounded-xl bg-emerald-500/20 border border-emerald-500 text-emerald-600 dark:bg-emerald-900/30 dark:border-emerald-600 dark:text-emerald-300 shadow-lg animate-pulse">
              <div className="flex items-center gap-3">
                <Check className="h-5 w-5" />
                <span className="font-semibold">{successMessage}</span>
              </div>
            </div>
          )}

          {errorMessage && (
            <div className="mb-6 p-4 rounded-xl bg-red-500/20 border border-red-500 text-red-600 dark:bg-red-900/30 dark:border-red-600 dark:text-red-300 shadow-lg">
              <div className="flex items-center gap-3">
                <AlertCircle className="h-5 w-5" />
                <span className="font-semibold">{errorMessage}</span>
              </div>
            </div>
          )}

          {/* Current Pricing Info */}
          <div className={`mb-8 rounded-2xl p-6 border-2 shadow-xl ${isDark ? 'border-blue-500/50 bg-gradient-to-br from-blue-900/20 to-blue-800/10 backdrop-blur-sm' : 'border-blue-300 bg-gradient-to-br from-blue-50 to-blue-100 backdrop-blur-sm'}`}>
            <h3 className={`text-2xl font-bold mb-4 flex items-center gap-2 ${isDark ? 'text-blue-300' : 'text-blue-900'}`}>
              📊 {rideType === 'pickup' ? '✈️ Pickup' : '🏠 Drop'} Pricing Breakdown
            </h3>
            <div className="grid gap-4 md:grid-cols-2">
              {carRates.map((rate) => {
                // Get charges for CURRENT rideType (pickup/drop)
                const chargesForType = rate.airportCharges?.[rideType] || {};
                const fixedCharge = chargesForType.fixedCharge || 0;
                const parkingCharge = chargesForType.parkingCharge || 0;
                const totalFare = fixedCharge + parkingCharge;
                const advancePayment = Math.round(totalFare * 0.2);
                const remainingPayment = totalFare - advancePayment;

                return (
                  <div key={rate.id} className={`p-5 rounded-xl border-2 backdrop-blur-sm transition-all hover:shadow-lg ${isDark ? 'border-gray-700 bg-gray-800/80 hover:bg-gray-700/80' : 'border-gray-200 bg-white/80 hover:bg-white'}`}>
                    <h4 className={`font-bold mb-4 text-xl flex items-center gap-2 ${isDark ? 'text-emerald-400' : 'text-emerald-600'}`}>
                      {rate.id === 'economy' ? '🚗' : '🅿️'} {rate.name}
                      <span className={`text-sm px-2 py-1 rounded-lg ${isDark ? 'bg-gray-700 text-gray-300' : 'bg-gray-100 text-gray-700'}`}>
                        {rate.id}
                      </span>
                    </h4>
                    <div className={`space-y-3 ${isDark ? 'text-gray-300' : 'text-gray-700'}`}>
                      <div className="flex justify-between items-center p-2 rounded-lg" style={{backgroundColor: isDark ? 'rgba(59, 130, 246, 0.1)' : 'rgba(59, 130, 246, 0.05)'}}>
                        <span className="font-medium">Fixed Rate:</span>
                        <span className="font-bold text-lg">₹{fixedCharge}</span>
                      </div>
                      <div className="flex justify-between items-center p-2 rounded-lg" style={{backgroundColor: isDark ? 'rgba(139, 92, 246, 0.1)' : 'rgba(139, 92, 246, 0.05)'}}>
                        <span className="font-medium">Parking Fee:</span>
                        <span className="font-bold text-lg">₹{parkingCharge}</span>
                      </div>
                      <div className={`border-t-2 pt-3 flex justify-between items-center ${isDark ? 'border-gray-700' : 'border-gray-200'}`}>
                        <span className="font-bold">Total Fare:</span>
                        <span className="font-bold text-2xl bg-gradient-to-r from-emerald-400 to-emerald-500 bg-clip-text text-transparent">₹{totalFare}</span>
                      </div>
                      <div className={`rounded-xl p-3 mt-3 border-2 ${isDark ? 'border-green-600/50 bg-green-900/20' : 'border-green-300 bg-green-50'}`}>
                        <p className={`text-xs font-semibold mb-2 ${isDark ? 'text-green-300' : 'text-green-700'}`}>💳 Payment Split</p>
                        <div className="flex justify-between text-sm font-bold">
                          <span className={isDark ? 'text-green-400' : 'text-green-600'}>Pay Now (20%): ₹{advancePayment}</span>
                        </div>
                        <div className="flex justify-between text-sm font-bold">
                          <span className={isDark ? 'text-orange-400' : 'text-orange-600'}>After Ride (80%): ₹{remainingPayment}</span>
                        </div>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Car Rates Table */}
          <div className={`rounded-2xl border-2 overflow-hidden shadow-xl ${isDark ? 'border-gray-700 bg-gray-800' : 'border-gray-200 bg-white'}`}>
            <div className={`px-6 py-4 ${isDark ? 'bg-gradient-to-r from-gray-900 to-gray-800 border-b border-gray-700' : 'bg-gradient-to-r from-gray-100 to-gray-50 border-b border-gray-200'}`}>
              <p className={`text-sm font-bold flex items-center gap-2 ${isDark ? 'text-gray-300' : 'text-gray-700'}`}>
                ✏️ Editing <span className={`text-base px-3 py-1 rounded-lg font-bold ${
                  rideType === 'pickup'
                    ? isDark ? 'text-emerald-400 bg-emerald-900/30' : 'text-emerald-600 bg-emerald-100'
                    : isDark ? 'text-purple-400 bg-purple-900/30' : 'text-purple-600 bg-purple-100'
                }`}>
                  {rideType === 'pickup' ? '✈️ Pickup Charges' : '🏠 Drop Charges'}
                </span>
              </p>
            </div>
            <table className="w-full">
              <thead>
                <tr className={`border-b-2 ${isDark ? 'border-gray-700 bg-gray-900/50' : 'border-gray-200 bg-gray-50'}`}>
                  <th className={`px-6 py-4 text-left text-sm font-bold ${isDark ? 'text-gray-300' : 'text-gray-900'}`}>
                    🚗 Car Type
                  </th>
                  <th className={`px-6 py-4 text-left text-sm font-bold ${isDark ? 'text-gray-300' : 'text-gray-900'}`}>
                    👥 Capacity
                  </th>
                  <th className={`px-6 py-4 text-left text-sm font-bold ${isDark ? 'text-gray-300' : 'text-gray-900'}`}>
                    💰 Fixed Rate
                  </th>
                  <th className={`px-6 py-4 text-left text-sm font-bold ${isDark ? 'text-gray-300' : 'text-gray-900'}`}>
                    🅿️ Parking
                  </th>
                  <th className={`px-6 py-4 text-center text-sm font-bold ${isDark ? 'text-gray-300' : 'text-gray-900'}`}>
                    ⚙️ Actions
                  </th>
                </tr>
              </thead>
              <tbody>
                {carRates.map((rate) => {
                  // Get charges for CURRENT rideType (pickup/drop)
                  const chargesForType = rate.airportCharges?.[rideType] || {};
                  const fixedCharge = chargesForType.fixedCharge || 0;
                  const parkingCharge = chargesForType.parkingCharge || 0;

                  return (
                    <tr
                      key={rate.id}
                      className={`border-b transition-all duration-200 ${
                        isDark
                          ? 'border-gray-700 hover:bg-gray-700/50'
                          : 'border-gray-200 hover:bg-gray-100'
                      }`}
                    >
                      {/* Car Name */}
                      <td className={`px-6 py-5 ${isDark ? 'text-white' : 'text-gray-900'}`}>
                        <div className="font-bold text-lg">{rate.name}</div>
                        <div className={`text-xs font-medium ${isDark ? 'text-gray-400' : 'text-gray-500'}`}>
                          ID: {rate.id.toUpperCase()}
                        </div>
                      </td>

                      {/* Capacity */}
                      <td className={`px-6 py-5 font-semibold ${isDark ? 'text-gray-300' : 'text-gray-700'}`}>
                        <span className={`px-3 py-1 rounded-lg text-sm font-bold ${
                          isDark ? 'bg-blue-900/30 text-blue-300' : 'bg-blue-100 text-blue-700'
                        }`}>
                          {rate.maxPassengers} Seats
                        </span>
                      </td>

                      {/* Fixed Charge */}
                      <td className={`px-6 py-5`}>
                        {editingId === rate.id ? (
                          <div className="flex items-center gap-2 bg-emerald-100 dark:bg-emerald-900/30 px-3 py-2 rounded-lg">
                            <span className={`${isDark ? 'text-gray-400' : 'text-gray-600'}`}>₹</span>
                            <input
                              type="number"
                              min="0"
                              step="10"
                              value={editingData.fixedCharge}
                              onChange={(e) => handleInputChange('fixedCharge', e.target.value)}
                              className={`w-24 px-2 py-2 rounded border-2 font-bold text-lg ${
                                isDark
                                  ? 'bg-gray-700 border-emerald-600 text-white'
                                  : 'bg-white border-emerald-400 text-gray-900'
                              } focus:outline-none focus:ring-2 focus:ring-emerald-500`}
                            />
                          </div>
                        ) : (
                          <div className={`font-bold text-lg ${isDark ? 'text-emerald-400' : 'text-emerald-600'}`}>
                            ₹{fixedCharge}
                          </div>
                        )}
                      </td>

                      {/* Parking Charge */}
                      <td className={`px-6 py-5`}>
                        {editingId === rate.id ? (
                          <div className="flex items-center gap-2 bg-purple-100 dark:bg-purple-900/30 px-3 py-2 rounded-lg">
                            <span className={`${isDark ? 'text-gray-400' : 'text-gray-600'}`}>₹</span>
                            <input
                              type="number"
                              min="0"
                              step="10"
                              value={editingData.parkingCharge}
                              onChange={(e) => handleInputChange('parkingCharge', e.target.value)}
                              className={`w-24 px-2 py-2 rounded border-2 font-bold text-lg ${
                                isDark
                                  ? 'bg-gray-700 border-purple-600 text-white'
                                  : 'bg-white border-purple-400 text-gray-900'
                              } focus:outline-none focus:ring-2 focus:ring-purple-500`}
                            />
                          </div>
                        ) : (
                          <div className={`font-bold text-lg flex items-center gap-2 ${isDark ? 'text-purple-400' : 'text-purple-600'}`}>
                            <ParkingCircle className="h-4 w-4" />
                            ₹{parkingCharge}
                          </div>
                        )}
                      </td>

                      {/* Actions */}
                      <td className={`px-6 py-5`}>
                        <div className="flex gap-2 justify-center">
                          {editingId === rate.id ? (
                            <>
                              <button
                                onClick={() => handleSave(rate.id)}
                                className="p-2 rounded-lg bg-emerald-600 hover:bg-emerald-700 text-white transition-all hover:shadow-lg"
                                title="Save"
                              >
                                <Check className="h-5 w-5" />
                              </button>
                              <button
                                onClick={handleCancel}
                                className={`p-2 rounded-lg transition-all hover:shadow-lg ${
                                  isDark
                                    ? 'bg-gray-700 hover:bg-gray-600 text-gray-300'
                                    : 'bg-gray-200 hover:bg-gray-300 text-gray-700'
                                }`}
                                title="Cancel"
                              >
                                <X className="h-5 w-5" />
                              </button>
                            </>
                          ) : (
                            <button
                              onClick={() => handleEdit(rate)}
                              className="p-2 px-4 rounded-lg bg-blue-600 hover:bg-blue-700 text-white transition-all hover:shadow-lg flex items-center gap-2 font-semibold"
                              title="Edit"
                            >
                              <Edit2 className="h-4 w-4" />
                              Edit
                            </button>
                          )}
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>

          {/* Summary Section */}
          <div className="mt-8 grid md:grid-cols-2 gap-6">
            {/* How it works */}
            <div className={`rounded-2xl border-2 p-6 shadow-xl ${isDark ? 'border-emerald-500/30 bg-gradient-to-br from-emerald-900/10 to-emerald-800/5' : 'border-emerald-300 bg-gradient-to-br from-emerald-50 to-emerald-100'}`}>
              <h3 className={`text-xl font-bold mb-5 flex items-center gap-2 ${isDark ? 'text-emerald-400' : 'text-emerald-700'}`}>
                ✅ How Airport Pricing Works
              </h3>
              <ul className={`space-y-3 ${isDark ? 'text-gray-300' : 'text-gray-700'}`}>
                <li className="flex gap-3">
                  <span className={`font-bold text-lg px-2 py-0.5 rounded-lg min-w-fit ${isDark ? 'bg-emerald-600/30 text-emerald-400' : 'bg-emerald-200 text-emerald-700'}`}>1.</span>
                  <span className="pt-1"><strong>Fixed Flat Rate:</strong> Same charge for all Jaipur airport rides</span>
                </li>
                <li className="flex gap-3">
                  <span className={`font-bold text-lg px-2 py-0.5 rounded-lg min-w-fit ${isDark ? 'bg-blue-600/30 text-blue-400' : 'bg-blue-200 text-blue-700'}`}>2.</span>
                  <span className="pt-1"><strong>No Distance Calculation:</strong> Fixed amount applies everywhere in Jaipur</span>
                </li>
                <li className="flex gap-3">
                  <span className={`font-bold text-lg px-2 py-0.5 rounded-lg min-w-fit ${isDark ? 'bg-purple-600/30 text-purple-400' : 'bg-purple-200 text-purple-700'}`}>3.</span>
                  <span className="pt-1"><strong>Total Fare:</strong> Fixed Flat Rate + Parking Charge</span>
                </li>
                <li className="flex gap-3">
                  <span className={`font-bold text-lg px-2 py-0.5 rounded-lg min-w-fit ${isDark ? 'bg-orange-600/30 text-orange-400' : 'bg-orange-200 text-orange-700'}`}>4.</span>
                  <span className="pt-1"><strong>Payment Split:</strong> Customers pay 20% upfront, 80% after ride</span>
                </li>
              </ul>
            </div>

            {/* Quick Stats */}
            <div className={`rounded-2xl border-2 p-6 shadow-xl ${isDark ? 'border-blue-500/30 bg-gradient-to-br from-blue-900/10 to-blue-800/5' : 'border-blue-300 bg-gradient-to-br from-blue-50 to-blue-100'}`}>
              <h3 className={`text-xl font-bold mb-5 flex items-center gap-2 ${isDark ? 'text-blue-400' : 'text-blue-700'}`}>
                📊 Quick Reference
              </h3>
              <div className="space-y-3">
                <div className={`p-4 rounded-xl border-2 ${isDark ? 'border-emerald-500/30 bg-emerald-900/20' : 'border-emerald-300 bg-emerald-50'}`}>
                  <p className={`text-xs font-bold uppercase tracking-wide mb-1 ${isDark ? 'text-emerald-400' : 'text-emerald-700'}`}>Active Ride Types</p>
                  <p className={`text-2xl font-bold ${isDark ? 'text-white' : 'text-gray-900'}`}>2</p>
                  <p className={`text-xs ${isDark ? 'text-gray-400' : 'text-gray-600'}`}>Pickup & Drop</p>
                </div>
                <div className={`p-4 rounded-xl border-2 ${isDark ? 'border-purple-500/30 bg-purple-900/20' : 'border-purple-300 bg-purple-50'}`}>
                  <p className={`text-xs font-bold uppercase tracking-wide mb-1 ${isDark ? 'text-purple-400' : 'text-purple-700'}`}>Car Types</p>
                  <p className={`text-2xl font-bold ${isDark ? 'text-white' : 'text-gray-900'}`}>2</p>
                  <p className={`text-xs ${isDark ? 'text-gray-400' : 'text-gray-600'}`}>Economy & Premium</p>
                </div>
                <div className={`p-4 rounded-xl border-2 ${isDark ? 'border-orange-500/30 bg-orange-900/20' : 'border-orange-300 bg-orange-50'}`}>
                  <p className={`text-xs font-bold uppercase tracking-wide mb-1 ${isDark ? 'text-orange-400' : 'text-orange-700'}`}>Payment Pattern</p>
                  <p className={`text-2xl font-bold ${isDark ? 'text-white' : 'text-gray-900'}`}>20% + 80%</p>
                  <p className={`text-xs ${isDark ? 'text-gray-400' : 'text-gray-600'}`}>Advance + Balance</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Airport Bookings Modal */}
      {showBookings && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className={`rounded-2xl shadow-2xl max-w-4xl w-full max-h-[90vh] overflow-y-auto ${isDark ? 'bg-gray-900 border border-gray-700' : 'bg-white border border-gray-200'}`}>
            {/* Modal Header */}
            <div className={`sticky top-0 flex items-center justify-between p-6 border-b backdrop-blur-sm ${isDark ? 'border-gray-700 bg-gradient-to-r from-gray-900/95 via-blue-900/20 to-gray-900/95' : 'border-gray-200 bg-gradient-to-r from-white/95 via-blue-50/50 to-white/95'}`}>
              <div className="flex items-center gap-4">
                <div className={`p-3 rounded-xl ${isDark ? 'bg-blue-600/20 border border-blue-500/30' : 'bg-blue-100 border border-blue-300'}`}>
                  <BookOpen className={`h-8 w-8 ${isDark ? 'text-blue-400' : 'text-blue-600'}`} />
                </div>
                <div className="flex flex-col gap-1">
                  <h2 className={`text-3xl font-bold bg-gradient-to-r ${isDark ? 'from-blue-300 via-blue-400 to-blue-300 bg-clip-text text-transparent' : 'from-blue-600 via-blue-700 to-blue-600 bg-clip-text text-transparent'}`}>
                    ✈️ Airport Ride Bookings
                  </h2>
                  <p className={`text-sm font-medium ${isDark ? 'text-gray-400' : 'text-gray-600'}`}>
                    Track all airport ride reservations
                  </p>
                </div>
              </div>
              <button
                onClick={() => setShowBookings(false)}
                className={`p-2 rounded-lg transition-all hover:shadow-lg ${
                  isDark
                    ? 'hover:bg-gray-800 text-gray-400 hover:text-gray-200'
                    : 'hover:bg-gray-100 text-gray-600 hover:text-gray-900'
                }`}
              >
                <X className="h-6 w-6" />
              </button>
            </div>

            {/* Modal Content */}
            <div className="p-6">
              {bookingsLoading ? (
                <div className="flex items-center justify-center py-12">
                  <div className="text-center space-y-3">
                    <div className="h-10 w-10 border-4 border-blue-400 border-t-blue-600 rounded-full animate-spin mx-auto"></div>
                    <p className={`font-semibold ${isDark ? 'text-gray-300' : 'text-gray-700'}`}>
                      Loading bookings...
                    </p>
                  </div>
                </div>
              ) : airportBookings.length === 0 ? (
                <div className="text-center py-12">
                  <BookOpen className={`h-16 w-16 mx-auto mb-4 opacity-50 ${isDark ? 'text-gray-600' : 'text-gray-400'}`} />
                  <p className={`text-lg font-semibold ${isDark ? 'text-gray-400' : 'text-gray-600'}`}>
                    No airport bookings found
                  </p>
                  <p className={`text-sm ${isDark ? 'text-gray-500' : 'text-gray-500'}`}>
                    Bookings will appear here when users make airport ride reservations
                  </p>
                </div>
              ) : (
                <div className="space-y-4">
                  {airportBookings.map((booking, index) => (
                    <div
                      key={booking._id || index}
                      className={`p-5 rounded-xl border-2 transition-all hover:shadow-lg ${
                        isDark
                          ? 'border-gray-700 bg-gray-800/50 hover:bg-gray-800'
                          : 'border-gray-200 bg-gray-50/50 hover:bg-white'
                      }`}
                    >
                      {/* Booking Header */}
                      <div className="flex items-center justify-between mb-4 pb-4 border-b" style={{borderColor: isDark ? 'rgba(55, 65, 81, 0.5)' : 'rgba(209, 213, 219, 0.5)'}}>
                        <div className="flex items-center gap-3">
                          <div className={`px-3 py-1 rounded-lg font-bold text-sm ${
                            booking.rideType === 'pickup'
                              ? isDark ? 'bg-emerald-600/20 text-emerald-400' : 'bg-emerald-100 text-emerald-700'
                              : isDark ? 'bg-purple-600/20 text-purple-400' : 'bg-purple-100 text-purple-700'
                          }`}>
                            {booking.rideType === 'pickup' ? '✈️ Pickup' : '🏠 Drop'}
                          </div>
                          <div className={`px-3 py-1 rounded-lg font-bold text-sm ${
                            booking.paymentStatus === 'completed'
                              ? isDark ? 'bg-green-600/20 text-green-400' : 'bg-green-100 text-green-700'
                              : booking.paymentStatus === 'partial'
                              ? isDark ? 'bg-blue-600/20 text-blue-400' : 'bg-blue-100 text-blue-700'
                              : isDark ? 'bg-orange-600/20 text-orange-400' : 'bg-orange-100 text-orange-700'
                          }`}>
                            {booking.paymentStatus?.charAt(0).toUpperCase() + booking.paymentStatus?.slice(1) || 'Pending'}
                          </div>
                        </div>
                        <span className={`text-sm font-semibold ${isDark ? 'text-gray-400' : 'text-gray-600'}`}>
                          {booking.createdAt ? (
                            <div>
                              <div>{new Date(booking.createdAt).toLocaleDateString()}</div>
                              <div className="text-xs text-gray-500">{new Date(booking.createdAt).toLocaleTimeString('en-IN', { hour: '2-digit', minute: '2-digit' })}</div>
                            </div>
                          ) : 'N/A'}
                        </span>
                      </div>

                      {/* Booking Details Grid */}
                      <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4">
                        {/* User Info */}
                        <div className={`p-3 rounded-lg ${isDark ? 'bg-gray-900/50' : 'bg-gray-100/50'}`}>
                          <p className={`text-xs font-bold uppercase mb-1 ${isDark ? 'text-gray-500' : 'text-gray-600'}`}>
                            <User className="h-3 w-3 inline mr-1" />
                            User Name
                          </p>
                          <p className={`text-sm font-semibold ${isDark ? 'text-white' : 'text-gray-900'}`}>
                            {booking.userId?.name || booking.userName || 'N/A'}
                          </p>
                        </div>

                        {/* Contact */}
                        <div className={`p-3 rounded-lg ${isDark ? 'bg-gray-900/50' : 'bg-gray-100/50'}`}>
                          <p className={`text-xs font-bold uppercase mb-1 ${isDark ? 'text-gray-500' : 'text-gray-600'}`}>
                            <Phone className="h-3 w-3 inline mr-1" />
                            Phone
                          </p>
                          <p className={`text-sm font-semibold ${isDark ? 'text-white' : 'text-gray-900'}`}>
                            {booking.userId?.phone || booking.userPhone || 'N/A'}
                          </p>
                        </div>

                        {/* Car Type */}
                        <div className={`p-3 rounded-lg ${isDark ? 'bg-gray-900/50' : 'bg-gray-100/50'}`}>
                          <p className={`text-xs font-bold uppercase mb-1 ${isDark ? 'text-gray-500' : 'text-gray-600'}`}>
                            \ud83d\ude97 Car Type
                          </p>
                          <p className={`text-sm font-semibold ${isDark ? 'text-white' : 'text-gray-900'}`}>
                            {booking.carType || 'N/A'}
                          </p>
                        </div>

                        {/* Total Fare */}
                        <div className={`p-3 rounded-lg ${isDark ? 'bg-emerald-900/20 border border-emerald-600/30' : 'bg-emerald-50 border border-emerald-300'}`}>
                          <p className={`text-xs font-bold uppercase mb-1 ${isDark ? 'text-emerald-400' : 'text-emerald-700'}`}>
                            \ud83d\udcb5 Total Fare
                          </p>
                          <p className={`text-lg font-bold ${isDark ? 'text-emerald-300' : 'text-emerald-700'}`}>
                            \u20b9{booking.totalFare || 0}
                          </p>
                        </div>

                        {/* Paid Amount */}
                        <div className={`p-3 rounded-lg ${isDark ? 'bg-blue-900/20 border border-blue-600/30' : 'bg-blue-50 border border-blue-300'}`}>
                          <p className={`text-xs font-bold uppercase mb-1 ${isDark ? 'text-blue-400' : 'text-blue-700'}`}>
                            ✅ Paid Amount
                          </p>
                          <p className={`text-lg font-bold ${isDark ? 'text-blue-300' : 'text-blue-700'}`}>
                            \u20b9{booking.paidAmount || 0}
                          </p>
                        </div>

                        {/* Remaining */}
                        <div className={`p-3 rounded-lg ${isDark ? 'bg-orange-900/20 border border-orange-600/30' : 'bg-orange-50 border border-orange-300'}`}>
                          <p className={`text-xs font-bold uppercase mb-1 ${isDark ? 'text-orange-400' : 'text-orange-700'}`}>
                            \u26a0\ufe0f Remaining
                          </p>
                          <p className={`text-lg font-bold ${isDark ? 'text-orange-300' : 'text-orange-700'}`}>
                            \u20b9{(booking.totalFare || 0) - (booking.paidAmount || 0)}
                          </p>
                        </div>
                      </div>

                      {/* Location Info */}
                      {(booking.pickupLocation || booking.dropLocation) && (
                        <div className="mt-4 pt-4 border-t" style={{borderColor: isDark ? 'rgba(55, 65, 81, 0.5)' : 'rgba(209, 213, 219, 0.5)'}}>
                          <p className={`text-xs font-bold uppercase mb-2 ${isDark ? 'text-gray-400' : 'text-gray-600'}`}>
                            <MapPinIcon className="h-3 w-3 inline mr-1" />
                            Location Details
                          </p>
                          <div className="flex gap-3 text-sm">
                            {booking.pickupLocation && (
                              <span className={isDark ? 'text-gray-400' : 'text-gray-600'}>
                                <MapPinIcon className="h-4 w-4 inline mr-1" /> <strong>From:</strong> {booking.pickupLocation}
                              </span>
                            )}
                            {booking.dropLocation && (
                              <span className={isDark ? 'text-gray-400' : 'text-gray-600'}>
                                <MapPinIcon className="h-4 w-4 inline mr-1" /> <strong>To:</strong> {booking.dropLocation}
                              </span>
                            )}
                          </div>
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              )}
            </div>

            {/* Modal Footer */}
            <div className={`border-t p-6 flex justify-end gap-3 ${isDark ? 'border-gray-700 bg-gray-800/50' : 'border-gray-200 bg-gray-50'}`}>
              <button
                onClick={() => setShowBookings(false)}
                className={`px-5 py-2 rounded-lg font-semibold transition-all ${
                  isDark
                    ? 'bg-gray-700 hover:bg-gray-600 text-gray-200'
                    : 'bg-gray-200 hover:bg-gray-300 text-gray-900'
                }`}
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}
    </AdminLayout>
  );
}

export default AirportRidesPage;
