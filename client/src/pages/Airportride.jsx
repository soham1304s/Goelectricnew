import { useMemo, useState, useEffect } from 'react';
import { Calendar, CarTaxiFront, ChevronLeft, Clock3, Loader2, Navigation, Plane, MapPin, Zap } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext.jsx';
import { useTheme } from '../context/ThemeContext.jsx';
import LocationPickerComponent from '../components/LocationPickerComponent.jsx';
import api from '../services/api.js';
import bookingService from '../services/bookingService.js';
import { fetchCarRates } from '../services/rateService.js';
import { ridePaymentService } from '../services/ridePaymentService.js';

const AIRPORT_LOCATION = {
  name: 'Jaipur International Airport (JAI)',
  lat: 26.8283,
  lng: 75.8060,
};

const formatDateValue = (date) => {
  const year = date.getFullYear();
  const month = `${date.getMonth() + 1}`.padStart(2, '0');
  const day = `${date.getDate()}`.padStart(2, '0');
  return `${year}-${month}-${day}`;
};

const formatTimeValue = (date) => {
  const hours = `${date.getHours()}`.padStart(2, '0');
  const minutes = `${date.getMinutes()}`.padStart(2, '0');
  return `${hours}:${minutes}`;
};

export default function AirportRidePage() {
  const navigate = useNavigate();
  const { user } = useAuth();
  const { theme } = useTheme();
  const isDark = theme === 'dark';

  const now = useMemo(() => new Date(), []);
  const defaultRideTime = useMemo(() => {
    const time = new Date();
    time.setMinutes(time.getMinutes() + 30);
    return time;
  }, []);

  // State
  const [rideType, setRideType] = useState(() => {
    // Initialize from localStorage if available
    const saved = localStorage.getItem('airportRideType');
    return saved || 'pickup';
  }); // 'pickup' or 'drop'
  const [carTypes, setCarTypes] = useState([]);
  const [airportPricing, setAirportPricing] = useState({});
  const [ratesLoading, setRatesLoading] = useState(true);

  const [pickupLocation, setPickupLocation] = useState(''); // For drop mode location
  const [pickupCoordinates, setPickupCoordinates] = useState(null);
  const [destinationCity, setDestinationCity] = useState('');
  const [destinationCoordinates, setDestinationCoordinates] = useState(null);
  const [selectedDate, setSelectedDate] = useState(formatDateValue(defaultRideTime));
  const [selectedTime, setSelectedTime] = useState(formatTimeValue(defaultRideTime));
  const [selectedCar, setSelectedCar] = useState('');
  const [bookingLoading, setBookingLoading] = useState(false);
  const [bookingError, setBookingError] = useState('');
  const [fetchingLocation, setFetchingLocation] = useState(false);

  // Save rideType to localStorage whenever it changes
  useEffect(() => {
    localStorage.setItem('airportRideType', rideType);
    console.log(`💾 Saved rideType to localStorage: ${rideType}`);
  }, [rideType]);

  // Fetch rates and airport pricing from admin
  useEffect(() => {
    const loadRates = async () => {
      try {
        setRatesLoading(true);

        // Force refresh - don't use cache to get latest pickup/drop rates
        const rates = await fetchCarRates(true); // forceRefresh = true
        if (rates && Array.isArray(rates)) {
          // Filter to only show Premium and Economy (no Mini or others)
          const filteredRates = rates.filter(rate => 
            rate.id === 'premium' || rate.id === 'economy'
          );
          
          // Use filtered car types
          setCarTypes(
            filteredRates.map((rate) => ({
              id: rate.id,
              name: rate.name,
              baseRate: rate.baseRate,
              passengers: rate.maxPassengers,
            }))
          );

          // Set airport pricing from filtered car rates
          // Use airportCharges if available (new format), otherwise fallback to fixedCharge/parkingCharge (legacy)
          const pricing = {};
          filteredRates.forEach((rate) => {
            // Prefer airportCharges structure for current ride type
            if (rate.airportCharges && rate.airportCharges[rideType]) {
              const chargesForRideType = rate.airportCharges[rideType];
              // Only use if charges are set, otherwise use legacy fields
              if (chargesForRideType.fixedCharge > 0 || chargesForRideType.parkingCharge > 0) {
                pricing[rate.id] = {
                  fixedCharge: chargesForRideType.fixedCharge || 0,
                  parkingCharge: chargesForRideType.parkingCharge || 0,
                };
              } else {
                // Fallback to legacy fields
                pricing[rate.id] = {
                  fixedCharge: rate.fixedCharge || 0,
                  parkingCharge: rate.parkingCharge || 0,
                };
              }
            } else {
              // Fallback to legacy fields
              pricing[rate.id] = {
                fixedCharge: rate.fixedCharge || 0,
                parkingCharge: rate.parkingCharge || 0,
              };
            }
          });
          
          console.log(`📍 ${rideType.toUpperCase()} Pricing Loaded:`, pricing);
          setAirportPricing(pricing);
          
          // Set first car as default
          if (filteredRates.length > 0) {
            setSelectedCar(filteredRates[0].id);
          }
        }
      } catch (error) {
        console.error('Error loading rates:', error);
      } finally {
        setRatesLoading(false);
      }
    };

    loadRates();

    // Also refetch on ride type change (dependency array includes rideType now)
    // This ensures we always get the latest rates for the selected ride type
  }, [rideType]);

  // No distance calculation for airport rides - using flat rate pricing

  const selectedCarData = carTypes.find((car) => car.id === selectedCar);
  const carPricing = airportPricing[selectedCar] || { fixedCharge: 0, parkingCharge: 0 };
  // Fixed flat rate - no distance calculation
  const baseFare = carPricing.fixedCharge || 0;
  const parkingCharge = carPricing.parkingCharge || 0;
  const totalAmount = baseFare + parkingCharge;
  const advancePayment = Math.round(totalAmount * 0.2);

  const minDate = formatDateValue(now);
  const currentDateTime = new Date();
  const isSameDayBooking = selectedDate === formatDateValue(currentDateTime);
  const minTime = isSameDayBooking ? formatTimeValue(currentDateTime) : '00:00';

  const formatMoney = (value) => `₹${Math.round(value).toLocaleString('en-IN')}`;

  const handleFetchCurrentLocation = async () => {
    if (!navigator.geolocation) {
      setBookingError('Geolocation is not supported by your browser');
      return;
    }

    setFetchingLocation(true);
    setBookingError('');

    navigator.geolocation.getCurrentPosition(
      async (position) => {
        try {
          const { latitude, longitude } = position.coords;
          
          // Set coordinates
          setPickupCoordinates({ latitude, longitude });

          // Try to get address from coordinates using reverse geocoding
          try {
            const response = await api.get(
              `/location/reverse-geocode?lat=${latitude}&lon=${longitude}`
            );

            if (response.data?.success && response.data?.data?.address) {
              setPickupLocation(response.data.data.address);
            } else {
              // Fallback to coordinates display
              setPickupLocation(`${latitude.toFixed(4)}, ${longitude.toFixed(4)}`);
            }
          } catch (error) {
            // Fallback if reverse geocoding fails
            console.warn('Reverse geocoding failed, using coordinates');
            setPickupLocation(`${latitude.toFixed(4)}, ${longitude.toFixed(4)}`);
          }

          setFetchingLocation(false);
        } catch (error) {
          console.error('Error processing location:', error);
          setBookingError('Error processing location');
          setFetchingLocation(false);
        }
      },
      (error) => {
        console.error('Geolocation error:', error);
        let errorMsg = 'Unable to fetch your location';
        
        if (error.code === error.PERMISSION_DENIED) {
          errorMsg = 'Location permission denied. Please enable location access.';
        } else if (error.code === error.POSITION_UNAVAILABLE) {
          errorMsg = 'Location information is unavailable.';
        } else if (error.code === error.TIMEOUT) {
          errorMsg = 'Location request timed out.';
        }
        
        setBookingError(errorMsg);
        setFetchingLocation(false);
      }
    );
  };

  const handleBooking = async () => {
    try {
      // Validate inputs based on ride type
      if (rideType === 'pickup') {
        if (!destinationCity.trim()) {
          setBookingError('Please enter your destination city');
          return;
        }
      } else {
        if (!pickupLocation.trim()) {
          setBookingError('Please enter your current location');
          return;
        }
      }

      if (!user) {
        setBookingError('Please login to book a ride');
        navigate('/login');
        return;
      }

      if (!selectedDate || !selectedTime) {
        setBookingError('Please select both travel date and time');
        return;
      }

      const selectedDateTime = new Date(`${selectedDate}T${selectedTime}:00`);
      if (Number.isNaN(selectedDateTime.getTime())) {
        setBookingError('Please select a valid date and time');
        return;
      }

      if (selectedDateTime < new Date()) {
        setBookingError('Pickup time cannot be in the past');
        return;
      }

      setBookingError('');
      setBookingLoading(true);

      // Set pickup and drop locations based on ride type
      const pickupLocationData =
        rideType === 'pickup'
          ? {
              address: 'Jaipur International Airport (JAI)',
              coordinates: { latitude: 26.8283, longitude: 75.8060 },
            }
          : {
              address: pickupLocation,
              coordinates: pickupCoordinates || { latitude: 28.7041, longitude: 77.1025 },
            };

      const dropLocationData =
        rideType === 'pickup'
          ? {
              address: destinationCity,
              coordinates: destinationCoordinates || { latitude: 28.7041, longitude: 77.1025 },
            }
          : {
              address: 'Jaipur International Airport (JAI)',
              coordinates: { latitude: 26.8283, longitude: 75.8060 },
            };

      // For airport rides, calculate distance between coordinates
      let distanceValue = 1; // Default fallback for airport rides
      
      if (pickupLocationData.coordinates && dropLocationData.coordinates) {
        try {
          const lat1 = pickupLocationData.coordinates.latitude;
          const lon1 = pickupLocationData.coordinates.longitude;
          const lat2 = dropLocationData.coordinates.latitude;
          const lon2 = dropLocationData.coordinates.longitude;
          
          // Haversine formula for rough distance calculation
          const R = 6371; // Earth radius in km
          const dLat = (lat2 - lat1) * Math.PI / 180;
          const dLon = (lon2 - lon1) * Math.PI / 180;
          const a = 
            Math.sin(dLat / 2) * Math.sin(dLat / 2) +
            Math.cos(lat1 * Math.PI / 180) * Math.cos(lat2 * Math.PI / 180) *
            Math.sin(dLon / 2) * Math.sin(dLon / 2);
          const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
          distanceValue = Math.round((R * c) * 10) / 10; // Round to 1 decimal place
          console.log('✈️ Calculated airport ride distance:', distanceValue, 'km');
        } catch (error) {
          console.warn('Distance calculation failed, using default:', error);
        }
      }

      const bookingData = {
        pickupLocation: pickupLocationData,
        dropLocation: dropLocationData,
        scheduledDate: selectedDate,
        scheduledTime: selectedTime,
        cabType: selectedCar,
        distance: distanceValue, // Required by backend
        rideType: 'airport',
        airportType: rideType,
        passengerDetails: {
          name: user.name || 'Guest',
          phone: user.phone || '',
          email: user.email || '',
        },
      };

      // Create booking first
      const bookingResponse = await bookingService.createBooking(bookingData);

      if (!bookingResponse.success || !bookingResponse.data) {
        setBookingError(bookingResponse.message || 'Failed to create booking');
        setBookingLoading(false);
        return;
      }

      const booking = bookingResponse.data;

      // Now process 20% advance payment via Razorpay
      const remainingAmount = totalAmount - advancePayment;
      const paymentOrderResponse = await ridePaymentService.createRidePaymentOrder({
        bookingId: booking._id || booking.bookingId,
        amount: advancePayment, // 20% of total
        rideType: 'airport',
        pickupLocation: pickupLocationData.address,
        dropLocation: dropLocationData.address,
      });

      if (!paymentOrderResponse.success) {
        setBookingError('Failed to create payment order');
        setBookingLoading(false);
        return;
      }

      // Initiate Razorpay payment
      await ridePaymentService.initiateRazorpayPayment(
        paymentOrderResponse.data,
        {
          name: user.name || 'Guest',
          email: user.email || '',
          phone: user.phone || '',
        },
        { rideType: 'airport' },
        async (paymentData) => {
          // Payment success callback
          try {
            const verifyResponse = await ridePaymentService.verifyRidePayment(paymentData);
            if (verifyResponse.success) {
              setBookingLoading(false);
              const bookingId = verifyResponse.data?.bookingId;
              navigate(`/user/booking-confirmation/${bookingId}`, {
                state: {
                  booking: booking,
                  bookingConfirmed: true,
                  paymentVerified: true,
                  advancePaymentDone: true,
                  advanceAmount: advancePayment,
                  remainingAmount: remainingAmount,
                  message: `Airport ride booked! 20% advance (₹${advancePayment.toLocaleString('en-IN')}) paid successfully. Remaining ₹${remainingAmount.toLocaleString('en-IN')} due after ride.`,
                },
              });
            } else {
              setBookingError('Payment verification failed');
              setBookingLoading(false);
            }
          } catch (error) {
            console.error('Payment verification error:', error);
            setBookingError('Payment verification failed: ' + error.message);
            setBookingLoading(false);
          }
        },
        (error) => {
          // Payment failure callback
          setBookingError('Payment failed: ' + error);
          setBookingLoading(false);
        }
      );
    } catch (error) {
      console.error('Booking error:', error);
      setBookingError(error.message || 'An error occurred while booking');
      setBookingLoading(false);
    }
  };

  if (ratesLoading) {
    return (
      <div className={`min-h-screen flex items-center justify-center ${isDark ? 'bg-gradient-to-br from-slate-950 via-slate-900 to-slate-950' : 'bg-gradient-to-br from-blue-50 via-white to-orange-50'}`}>
        <div className="text-center">
          <div className={`h-16 w-16 border-4 rounded-full animate-spin mx-auto mb-6 ${isDark ? 'border-gray-700 border-t-orange-500' : 'border-orange-200 border-t-orange-600'}`}></div>
          <p className={`text-lg font-semibold ${isDark ? 'text-gray-300' : 'text-gray-600'}`}>🛫 Loading airport rates...</p>
          <p className={`text-sm mt-2 ${isDark ? 'text-gray-500' : 'text-gray-400'}`}>Please wait while we fetch the best rates for you</p>
        </div>
      </div>
    );
  }

  return (
    <div
      className={`min-h-screen font-['Poppins'] transition-colors duration-300 ${
        isDark 
          ? 'bg-gradient-to-br from-slate-950 via-slate-900 to-slate-950' 
          : 'bg-gradient-to-br from-blue-50 via-white to-orange-50'
      }`}
    >
      {/* Decorative background elements */}
      <div className="fixed inset-0 overflow-hidden pointer-events-none">
        <div className={`absolute top-0 right-0 w-96 h-96 rounded-full blur-3xl opacity-10 ${isDark ? 'bg-orange-500' : 'bg-orange-300'}`}></div>
        <div className={`absolute bottom-0 left-0 w-96 h-96 rounded-full blur-3xl opacity-10 ${isDark ? 'bg-blue-500' : 'bg-blue-200'}`}></div>
      </div>

      <div className="container mx-auto px-4 py-8 md:py-12 relative z-10">
        <div className="mx-auto max-w-6xl">
          {/* Header */}
          <div className="mb-10 md:mb-16">
            <div className="flex items-center gap-3 mb-3">
              <div className={`p-3 rounded-2xl ${isDark ? 'bg-orange-500/20' : 'bg-orange-100'}`}>
                <Plane className={`h-8 w-8 ${isDark ? 'text-orange-400' : 'text-orange-600'}`} />
              </div>
              <h1 className={`text-3xl md:text-5xl font-bold bg-clip-text bg-gradient-to-r ${isDark ? 'from-orange-400 to-orange-300 text-transparent' : 'from-orange-600 to-red-500 text-transparent'}`}>
                Airport Transfers
              </h1>
            </div>
            <p className={`mt-3 text-base md:text-lg ${isDark ? 'text-gray-400' : 'text-slate-600'}`}>
              Premium and comfortable rides to/from Jaipur International Airport
            </p>
          </div>

          <div className="grid gap-8 lg:grid-cols-3">
            {/* Main Booking Form */}
            <div
              className={`rounded-3xl backdrop-blur-xl border shadow-2xl lg:col-span-2 transition-all hover:shadow-3xl ${
                isDark 
                  ? 'border-gray-700/50 bg-gray-900/50 bg-gradient-to-br from-gray-900/80 to-gray-800/50' 
                  : 'border-white/40 bg-white/80 bg-gradient-to-br from-white/90 to-blue-50/50'
              }`}
            >
              <div className="p-8 md:p-10">
                {bookingError && (
                  <div className="mb-8 rounded-2xl border border-red-500/30 bg-red-500/10 backdrop-blur-sm p-4 animate-pulse">
                    <p className="text-sm font-medium text-red-500 flex items-center gap-2">
                      <span className="inline-block w-2 h-2 bg-red-500 rounded-full"></span>
                      {bookingError}
                    </p>
                  </div>
                )}

                {/* Ride Type Selection */}
                <div className="mb-8">
                  <label className={`mb-4 block text-lg font-bold ${isDark ? 'text-white' : 'text-slate-900'}`}>
                    Choose Your Journey
                  </label>
                  <div className="grid gap-4 md:grid-cols-2">
                    <button
                      type="button"
                      onClick={() => setRideType('pickup')}
                      className={`group rounded-2xl border-2 p-6 text-left transition-all duration-300 transform hover:scale-105 ${
                        rideType === 'pickup'
                          ? isDark
                            ? 'border-orange-500 bg-gradient-to-br from-orange-500/20 to-orange-600/10 shadow-xl shadow-orange-500/20'
                            : 'border-orange-400 bg-gradient-to-br from-orange-50 to-orange-100 shadow-lg shadow-orange-300/30'
                          : isDark
                            ? 'border-gray-700/50 bg-black/20 hover:border-orange-400/50 hover:bg-black/30'
                            : 'border-slate-200/50 bg-white/50 hover:border-orange-300 hover:bg-white/80'
                      }`}
                    >
                      <div className="flex items-center gap-3 mb-3">
                        <div className={`p-2.5 rounded-xl transition-all ${
                          rideType === 'pickup'
                            ? isDark ? 'bg-orange-500/30' : 'bg-orange-200'
                            : isDark ? 'bg-gray-700/50' : 'bg-slate-100'
                        }`}>
                          <MapPin className={`h-5 w-5 transition-all ${rideType === 'pickup' ? 'text-orange-500' : isDark ? 'text-gray-400' : 'text-slate-500'}`} />
                        </div>
                        <span className={`font-bold text-base ${rideType === 'pickup' ? 'text-orange-500' : isDark ? 'text-white' : 'text-slate-900'}`}>
                          From Airport
                        </span>
                      </div>
                      <p className={`text-sm leading-relaxed ${rideType === 'pickup' ? isDark ? 'text-orange-300' : 'text-orange-600' : isDark ? 'text-gray-400' : 'text-slate-600'}`}>
                        Travel from airport to your destination anywhere in Jaipur
                      </p>
                    </button>

                    <button
                      type="button"
                      onClick={() => setRideType('drop')}
                      className={`group rounded-2xl border-2 p-6 text-left transition-all duration-300 transform hover:scale-105 ${
                        rideType === 'drop'
                          ? isDark
                            ? 'border-blue-500 bg-gradient-to-br from-blue-500/20 to-blue-600/10 shadow-xl shadow-blue-500/20'
                            : 'border-blue-400 bg-gradient-to-br from-blue-50 to-blue-100 shadow-lg shadow-blue-300/30'
                          : isDark
                            ? 'border-gray-700/50 bg-black/20 hover:border-blue-400/50 hover:bg-black/30'
                            : 'border-slate-200/50 bg-white/50 hover:border-blue-300 hover:bg-white/80'
                      }`}
                    >
                      <div className="flex items-center gap-3 mb-3">
                        <div className={`p-2.5 rounded-xl transition-all ${
                          rideType === 'drop'
                            ? isDark ? 'bg-blue-500/30' : 'bg-blue-200'
                            : isDark ? 'bg-gray-700/50' : 'bg-slate-100'
                        }`}>
                          <Plane className={`h-5 w-5 transition-all ${rideType === 'drop' ? 'text-blue-500' : isDark ? 'text-gray-400' : 'text-slate-500'}`} />
                        </div>
                        <span className={`font-bold text-base ${rideType === 'drop' ? 'text-blue-500' : isDark ? 'text-white' : 'text-slate-900'}`}>
                          To Airport
                        </span>
                      </div>
                      <p className={`text-sm leading-relaxed ${rideType === 'drop' ? isDark ? 'text-blue-300' : 'text-blue-600' : isDark ? 'text-gray-400' : 'text-slate-600'}`}>
                        Travel from your location to Jaipur International Airport
                      </p>
                    </button>
                  </div>
                </div>

                {/* Location Inputs - Different based on ride type */}
                {rideType === 'pickup' ? (
                  <>
                    {/* Pickup from Airport */}
                    <div className="mb-8">
                      <label className={`mb-4 block text-lg font-bold ${isDark ? 'text-white' : 'text-slate-900'}`}>
                        📍 Where would you like to go?
                      </label>
                      <div className={`rounded-2xl border-2 transition-all overflow-hidden shadow-lg ${
                        isDark 
                          ? 'border-gray-700/50 bg-black/30 focus-within:border-orange-400 focus-within:shadow-orange-500/20' 
                          : 'border-slate-200/50 bg-white/50 focus-within:border-orange-400 focus-within:shadow-orange-300/20'
                      }`}>
                        <LocationPickerComponent
                          value={destinationCity}
                          onChange={(value) => setDestinationCity(value)}
                          onSelectLocation={(location) => {
                            console.log('📍 Destination location selected:', location);
                            if (location && (location.lat || location.latitude)) {
                              const coords = {
                                latitude: location.lat || location.latitude,
                                longitude: location.lng || location.longitude,
                              };
                              console.log('✅ Setting destination coordinates:', coords);
                              setDestinationCoordinates(coords);
                            } else {
                              console.log('❌ Location missing coordinates:', location);
                            }
                          }}
                          placeholder="Type your destination city"
                          showMap={false}
                        />
                      </div>
                    </div>
                  </>
                ) : (
                  <>
                    {/* Drop to Airport */}
                    <div className="mb-8">
                      <label className={`mb-4 block text-lg font-bold ${isDark ? 'text-white' : 'text-slate-900'}`}>
                        📍 Where are you located?
                      </label>
                      <div className={`relative rounded-2xl border-2 flex items-center overflow-hidden transition-all shadow-lg ${
                        isDark 
                          ? 'border-gray-700/50 bg-black/30 focus-within:border-blue-400 focus-within:shadow-blue-500/20' 
                          : 'border-slate-200/50 bg-white/50 focus-within:border-blue-400 focus-within:shadow-blue-300/20'
                      }`}>
                        <div className="flex-1">
                          <input
                            type="text"
                            value={pickupLocation}
                            onChange={(e) => setPickupLocation(e.target.value)}
                            placeholder="Enter your current location"
                            className={`w-full bg-transparent px-6 py-4 focus:outline-none text-base font-medium ${isDark ? 'text-white placeholder-gray-500' : 'text-slate-900 placeholder-slate-400'}`}
                          />
                        </div>
                        <button
                          type="button"
                          onClick={handleFetchCurrentLocation}
                          disabled={fetchingLocation}
                          className={`px-6 py-4 font-semibold transition-all flex items-center gap-2 border-l ${
                            fetchingLocation
                              ? isDark
                                ? 'bg-gray-800/50 border-gray-700 text-gray-400 cursor-not-allowed'
                                : 'bg-gray-100/50 border-slate-200 text-gray-400 cursor-not-allowed'
                              : isDark
                                ? 'bg-emerald-600/20 border-gray-700 hover:bg-emerald-600/40 text-emerald-400 hover:text-emerald-300'
                                : 'bg-emerald-50/80 border-slate-200 hover:bg-emerald-500/20 text-emerald-600 hover:text-emerald-700'
                          }`}
                          title="Get current location"
                        >
                          {fetchingLocation ? (
                            <Loader2 className="h-5 w-5 animate-spin" />
                          ) : (
                            <Navigation className="h-5 w-5" />
                          )}
                        </button>
                      </div>
                    </div>
                  </>
                )}

              {/* Date and Time Selection */}
              <div className="mb-8 grid gap-4 md:grid-cols-2">
                <div>
                  <label className={`mb-4 block text-lg font-bold ${isDark ? 'text-white' : 'text-slate-900'}`}>
                    📅 Travel Date
                  </label>
                  <div className="relative">
                    <Calendar className={`pointer-events-none absolute left-4 top-1/2 h-5 w-5 -translate-y-1/2 ${isDark ? 'text-gray-400' : 'text-slate-500'}`} />
                    <input
                      type="date"
                      min={minDate}
                      value={selectedDate}
                      onChange={(e) => setSelectedDate(e.target.value)}
                      className={`w-full rounded-2xl border-2 py-4 pl-12 pr-4 text-base font-medium focus:outline-none focus:ring-0 transition-all shadow-md ${
                        isDark 
                          ? 'border-gray-700/50 bg-black/30 text-white focus:border-orange-400 focus:shadow-orange-500/20' 
                          : 'border-slate-200/50 bg-white/50 text-slate-900 focus:border-orange-400 focus:shadow-orange-300/20'
                      }`}
                    />
                  </div>
                </div>
                <div>
                  <label className={`mb-4 block text-lg font-bold ${isDark ? 'text-white' : 'text-slate-900'}`}>
                    🕐 Departure Time
                  </label>
                  <div className="relative">
                    <Clock3 className={`pointer-events-none absolute left-4 top-1/2 h-5 w-5 -translate-y-1/2 ${isDark ? 'text-gray-400' : 'text-slate-500'}`} />
                    <input
                      type="time"
                      value={selectedTime}
                      min={minTime}
                      onChange={(e) => setSelectedTime(e.target.value)}
                      className={`w-full rounded-2xl border-2 py-4 pl-12 pr-4 text-base font-medium focus:outline-none focus:ring-0 transition-all shadow-md ${
                        isDark 
                          ? 'border-gray-700/50 bg-black/30 text-white focus:border-orange-400 focus:shadow-orange-500/20' 
                          : 'border-slate-200/50 bg-white/50 text-slate-900 focus:border-orange-400 focus:shadow-orange-300/20'
                      }`}
                    />
                  </div>
                </div>
              </div>

              {/* Vehicle Selection */}
              <div className="mb-8">
                <label className={`mb-4 block text-lg font-bold ${isDark ? 'text-white' : 'text-slate-900'}`}>
                  🚗 Select Your Vehicle
                </label>
                <div className="grid gap-4 md:grid-cols-2">
                  {carTypes.map((car) => (
                    <button
                      key={car.id}
                      type="button"
                      onClick={() => setSelectedCar(car.id)}
                      className={`rounded-2xl border-2 p-6 text-left transition-all duration-300 transform hover:scale-105 shadow-lg ${
                        selectedCar === car.id
                          ? isDark
                            ? 'border-orange-500 bg-gradient-to-br from-orange-500/20 to-orange-600/10 shadow-orange-500/30'
                            : 'border-orange-400 bg-gradient-to-br from-orange-50 to-orange-100 shadow-orange-300/30'
                          : isDark
                            ? 'border-gray-700/50 bg-black/20 hover:border-orange-500/50 hover:shadow-orange-500/20'
                            : 'border-slate-200/50 bg-white/50 hover:border-orange-400 hover:shadow-orange-300/20'
                      }`}
                    >
                      <div className="mb-3 flex items-center justify-between">
                        <CarTaxiFront
                          className={`h-6 w-6 transition-all ${
                            selectedCar === car.id ? 'text-orange-500' : isDark ? 'text-gray-400' : 'text-slate-500'
                          }`}
                        />
                        <span
                          className={`rounded-full px-3 py-1 text-sm font-bold transition-all ${
                            selectedCar === car.id
                              ? 'bg-orange-500 text-white shadow-lg shadow-orange-500/50'
                              : isDark
                                ? 'bg-gray-700/50 text-gray-200'
                                : 'bg-slate-100 text-slate-700'
                          }`}
                        >
                          {car.passengers} seats
                        </span>
                      </div>
                      <p className={`font-bold text-lg ${isDark ? 'text-white' : 'text-slate-900'}`}>{car.name}</p>
                      <p className={`text-sm mt-2 ${selectedCar === car.id ? 'text-orange-500' : isDark ? 'text-gray-400' : 'text-slate-600'}`}>
                        Perfect for your journey
                      </p>
                    </button>
                  ))}
                </div>
              </div>
            </div>
            </div>

            {/* Fare Summary Panel */}
            <div className="lg:sticky lg:top-24 lg:self-start">
              <div
                className={`rounded-3xl border backdrop-blur-xl shadow-2xl transition-all hover:shadow-3xl overflow-hidden ${
                  isDark 
                    ? 'border-gray-700/50 bg-gray-900/50 bg-gradient-to-br from-gray-900/80 to-gray-800/50' 
                    : 'border-white/40 bg-white/80 bg-gradient-to-br from-white/90 to-blue-50/50'
                }`}
              >
                <div className={`h-1 bg-gradient-to-r ${rideType === 'pickup' ? 'from-orange-500 to-orange-600' : 'from-blue-500 to-blue-600'}`}></div>
                
                <div className="p-8">
                  <h2 className={`mb-6 text-2xl font-bold ${isDark ? 'text-white' : 'text-slate-900'}`}>
                    💰 Fare Breakdown
                  </h2>

                  <div className="space-y-4 text-sm">
                    <div className="flex items-center justify-between pb-4 border-b" style={{borderColor: isDark ? '#4B5563' : '#E2E8F0'}}>
                      <span className={isDark ? 'text-gray-400' : 'text-slate-600'}>Ride Type</span>
                      <span className={`font-bold px-3 py-1 rounded-full text-xs ${
                        rideType === 'pickup'
                          ? isDark ? 'bg-blue-500/20 text-blue-300' : 'bg-blue-100 text-blue-700'
                          : isDark ? 'bg-purple-500/20 text-purple-300' : 'bg-purple-100 text-purple-700'
                      }`}>
                        {rideType === 'pickup' ? '✈️ From Airport' : '🏠 To Airport'}
                      </span>
                    </div>

                    <div className="flex items-center justify-between pb-4 border-b" style={{borderColor: isDark ? '#4B5563' : '#E2E8F0'}}>
                      <span className={isDark ? 'text-gray-400' : 'text-slate-600'}>Route</span>
                      <span className={`max-w-[140px] truncate text-right font-medium text-xs ${isDark ? 'text-white' : 'text-slate-900'}`}>
                        {rideType === 'pickup'
                          ? `JAI → ${destinationCity || 'Dest.'}`
                          : `${pickupLocation?.split(',')[0] || 'Location'} → JAI`}
                      </span>
                    </div>

                    <div className="flex items-center justify-between pb-4 border-b" style={{borderColor: isDark ? '#4B5563' : '#E2E8F0'}}>
                      <span className={isDark ? 'text-gray-400' : 'text-slate-600'}>Service</span>
                      <span className={`font-medium text-xs ${isDark ? 'text-white' : 'text-slate-900'}`}>
                        Fixed Rate
                      </span>
                    </div>

                    <div className={`my-6 p-4 rounded-2xl ${isDark ? 'bg-emerald-500/10 border border-emerald-500/30' : 'bg-emerald-50 border border-emerald-200'}`}>
                      <div className="flex items-center justify-between mb-3">
                        <span className={`text-sm font-semibold ${isDark ? 'text-emerald-300' : 'text-emerald-700'}`}>Flat Rate</span>
                        <span className={`text-lg font-bold ${isDark ? 'text-emerald-300' : 'text-emerald-700'}`}>
                          {formatMoney(baseFare)}
                        </span>
                      </div>
                      <div className="flex items-center justify-between">
                        <span className={`text-sm font-semibold ${isDark ? 'text-emerald-300' : 'text-emerald-700'}`}>Parking Fee</span>
                        <span className={`text-lg font-bold ${isDark ? 'text-emerald-300' : 'text-emerald-700'}`}>
                          {formatMoney(parkingCharge)}
                        </span>
                      </div>
                    </div>

                    <div className={`p-4 rounded-2xl border-2 ${isDark ? 'bg-orange-500/10 border-orange-500/30' : 'bg-orange-50 border-orange-200'}`}>
                      <p className={`font-bold mb-4 text-lg ${isDark ? 'text-orange-300' : 'text-orange-600'}`}>
                        Total: {formatMoney(totalAmount)}
                      </p>
                      <p className={`text-xs font-medium mb-4 ${isDark ? 'text-gray-400' : 'text-slate-600'}`}>
                        20% Advance Payment Model
                      </p>
                      <div className={`space-y-3 p-3 rounded-lg ${isDark ? 'bg-black/30' : 'bg-white/60'}`}>
                        <div className="flex justify-between items-center">
                          <span className={`font-semibold ${isDark ? 'text-green-300' : 'text-green-700'}`}>💳 Pay Now:</span>
                          <span className={`font-bold text-lg ${isDark ? 'text-green-300' : 'text-green-700'}`}>{formatMoney(advancePayment)}</span>
                        </div>
                        <div className="flex justify-between items-center">
                          <span className={`font-semibold ${isDark ? 'text-orange-300' : 'text-orange-700'}`}>🚗 After Ride:</span>
                          <span className={`font-bold text-lg ${isDark ? 'text-orange-300' : 'text-orange-700'}`}>{formatMoney(totalAmount - advancePayment)}</span>
                        </div>
                      </div>
                    </div>
                  </div>

                  <button
                    type="button"
                    onClick={handleBooking}
                    disabled={bookingLoading}
                    className={`w-full mt-8 rounded-2xl py-4 font-bold text-lg transition-all duration-300 transform hover:scale-105 shadow-xl ${
                      bookingLoading
                        ? 'cursor-not-allowed bg-gray-400 text-gray-200 shadow-gray-400/20'
                        : isDark
                          ? 'bg-gradient-to-r from-orange-500 to-orange-600 text-white hover:from-orange-600 hover:to-orange-700 hover:shadow-orange-500/30'
                          : 'bg-gradient-to-r from-orange-500 to-orange-600 text-white hover:from-orange-600 hover:to-orange-700 hover:shadow-orange-400/30'
                    }`}
                  >
                    <span className="inline-flex items-center gap-3">
                      {bookingLoading ? (
                        <Loader2 className="h-5 w-5 animate-spin" />
                      ) : (
                        <Zap className="h-5 w-5" />
                      )}
                      {bookingLoading ? 'Processing Your Booking...' : 'Book Now'}
                    </span>
                  </button>

                  <p className={`mt-4 text-xs text-center ${isDark ? 'text-gray-400' : 'text-slate-500'}`}>
                    ✓ Secure booking • Real-time validation • Best rates guaranteed
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
