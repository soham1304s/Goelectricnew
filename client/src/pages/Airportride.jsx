import { useMemo, useState, useEffect } from 'react';
import { Calendar, CarTaxiFront, ChevronLeft, Clock3, Loader2, Navigation, Plane, MapPin, Zap, CheckCircle2, AlertCircle } from 'lucide-react';
import { useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../context/AuthContext.jsx';
import { useTheme } from '../context/ThemeContext.jsx';
import LocationPickerComponent from '../components/LocationPickerComponent.jsx';
import api from '../services/api.js';
import bookingService from '../services/bookingService.js';
import { fetchCarRates } from '../services/rateService.js';
import { ridePaymentService } from '../services/ridePaymentService.js';
import GoogleMapComponent from '../components/GoogleMapComponent.jsx';
import SEO from '../components/SEO.jsx';

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
  const location = useLocation();

  // Consume state from navigate (e.g. from Home Hero)
  useEffect(() => {
    if (location.state) {
      const { pickup, destination, date, time, pickupData, destData } = location.state;
      
      // Determine if it's a pickup (from airport) or drop (to airport)
      if (pickup && (pickup.toLowerCase().includes('airport') || pickup.toLowerCase().includes('jai'))) {
        setRideType('pickup');
        if (destination) setDestinationCity(destination);
        if (destData?.latitude) {
          setDestinationCoordinates({
            latitude: destData.latitude,
            longitude: destData.longitude
          });
        }
      } else if (destination && (destination.toLowerCase().includes('airport') || destination.toLowerCase().includes('jai'))) {
        setRideType('drop');
        if (pickup) setPickupLocation(pickup);
        if (pickupData?.latitude) {
          setPickupCoordinates({
            latitude: pickupData.latitude,
            longitude: pickupData.longitude
          });
        }
      } else {
        // Default to pickup if neither matches airport clearly
        setRideType('pickup');
        if (destination) setDestinationCity(destination);
      }

      if (date) setSelectedDate(date);
      if (time) setSelectedTime(time);
    }
  }, [location.state]);

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

      // Safety check for payment amount
      if (!advancePayment || advancePayment <= 0) {
        setBookingError('Fare could not be calculated. Please check your car selection and locations.');
        setBookingLoading(false);
        return;
      }

      // Now process 20% advance payment via Razorpay
      const remainingAmount = totalAmount - advancePayment;
      const paymentPayload = {
        bookingId: booking._id || booking.bookingId,
        amount: advancePayment, // 20% of total
        rideType: 'airport',
        pickupLocation: pickupLocationData.address,
        dropLocation: dropLocationData.address,
      };
      console.log('📡 Sending Payment Order Request:', paymentPayload);
      const paymentOrderResponse = await ridePaymentService.createRidePaymentOrder(paymentPayload);

      if (!paymentOrderResponse.success) {
        setBookingError(paymentOrderResponse.message || 'Failed to create payment order');
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
              // Show success message first
              setBookingError(''); // Clear any previous errors
              const bookingId = verifyResponse.data?.bookingId || booking?._id;

              // We keep the loading state true so user sees a spinner while we prepare to redirect
              // but we show a success message if you had a separate state for it.
              // For now, let's just navigate.
              console.log('✅ Payment verified, navigating to confirmation...');

              setTimeout(() => {
                setBookingLoading(false);
                navigate(`/user/booking-confirmation/${bookingId}`, {
                  state: {
                    booking: verifyResponse.data?.booking || booking,
                    bookingConfirmed: true,
                    paymentVerified: true,
                    advancePaymentDone: true,
                    advanceAmount: advancePayment,
                    remainingAmount: remainingAmount,
                    message: `Airport ride booked! 20% advance (₹${advancePayment.toLocaleString('en-IN')}) paid successfully. Remaining ₹${remainingAmount.toLocaleString('en-IN')} due after ride.`,
                  },
                });
              }, 1500); // 1.5s delay for professional feel
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
      <div className={`min-h-screen flex items-center justify-center font-['Inter',sans-serif] ${isDark ? 'bg-black' : 'bg-[#fafafa]'}`}>
        <div className="text-center">
          <div className="h-16 w-16 border-4 rounded-full animate-spin mx-auto mb-6 border-slate-200 dark:border-zinc-800 border-t-emerald-600 dark:border-t-emerald-500"></div>
          <p className={`text-lg font-semibold ${isDark ? 'text-zinc-300' : 'text-slate-600'}`}>Loading airport rates...</p>
          <p className={`text-sm mt-2 ${isDark ? 'text-zinc-500' : 'text-slate-400'}`}>Please wait while we fetch the best rates for you</p>
        </div>
      </div>
    );
  }

  return (
    <>
      <SEO
        title="Eco-Friendly Airport Transfers in Jaipur"
        description="Book zero-emission electric cab transfers to and from Jaipur International Airport (JAI). Punctual, silent, and sustainable airport rides."
        keywords="Jaipur airport taxi, electric airport transfer, JAI airport cab, eco-friendly airport ride"
        url="/airport"
      />
      <div className={`min-h-screen font-['Inter',sans-serif] transition-colors duration-300 ${isDark ? 'bg-black' : 'bg-[#fafafa]'}`}>
        <div className="container mx-auto px-4 pt-24 pb-8 md:pt-32 md:pb-16">
          <div className="mx-auto max-w-6xl">
            {/* Header Section */}
            <div className="mb-10 text-center md:text-left flex flex-col md:flex-row items-center justify-between gap-6">
              <div>
                <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-emerald-100 dark:bg-emerald-900/30 text-emerald-700 dark:text-emerald-300 font-semibold text-xs mb-4">
                  <Plane size={14} />
                  <span>100% Electric Airport Transfers</span>
                </div>
                <h1 className={`text-4xl font-black tracking-tight md:text-5xl ${isDark ? 'text-white' : 'text-slate-900'}`}>
                  Airport <span className="text-transparent bg-clip-text bg-gradient-to-r from-emerald-600 to-teal-500">Transfers</span>
                </h1>
                <p className={`mt-3 text-base md:text-lg ${isDark ? 'text-slate-400' : 'text-slate-600'}`}>
                  Premium, zero-emission rides to and from Jaipur International Airport.
                </p>
              </div>
            </div>

            <div className="grid gap-8 lg:grid-cols-12">
              {/* Left Column: Form */}
              <div className={`rounded-3xl p-6 md:p-8 shadow-sm lg:col-span-8 ${isDark ? 'border border-zinc-800 bg-zinc-900/50' : 'border border-slate-200 bg-white'}`}>
                {bookingError && (
                  <div className="mb-6 rounded-xl border border-red-400/50 bg-red-50 p-4 text-red-600 flex items-start gap-3">
                    <AlertCircle className="w-5 h-5 shrink-0 mt-0.5" />
                    <p className="text-sm font-medium">{bookingError}</p>
                  </div>
                )}

                {/* Ride Type Selection */}
                <div className="mb-8">
                  <label className={`mb-2.5 block text-sm font-bold ${isDark ? 'text-gray-200' : 'text-slate-800'}`}>
                    Choose Your Journey
                  </label>
                  <div className="grid gap-4 md:grid-cols-2">
                    <button
                      type="button"
                      onClick={() => setRideType('pickup')}
                      className={`group relative rounded-2xl border p-5 text-left transition-all overflow-hidden ${rideType === 'pickup'
                        ? 'border-emerald-500 bg-emerald-50 dark:bg-emerald-900/10 shadow-sm ring-1 ring-emerald-500'
                        : isDark
                          ? 'border-zinc-800 bg-zinc-800/50 hover:border-zinc-600 hover:bg-zinc-800'
                          : 'border-slate-200 bg-white hover:border-slate-300 hover:bg-slate-50'
                        }`}
                    >
                      {rideType === 'pickup' && (
                        <div className="absolute top-0 right-0 w-16 h-16 bg-emerald-100 dark:bg-emerald-900/30 rounded-bl-[100px] -z-0"></div>
                      )}
                      <div className="relative z-10">
                        <div className="flex items-center gap-3 mb-3">
                          <div className={`p-2.5 rounded-xl ${rideType === 'pickup' ? 'bg-emerald-100 dark:bg-emerald-900/50 text-emerald-600 dark:text-emerald-400' : isDark ? 'bg-zinc-700 text-zinc-300' : 'bg-slate-100 text-slate-500'}`}>
                            <MapPin className="h-5 w-5" />
                          </div>
                          <span className={`font-bold text-base ${rideType === 'pickup' ? 'text-emerald-600 dark:text-emerald-400' : isDark ? 'text-white' : 'text-slate-900'}`}>
                            From Airport
                          </span>
                        </div>
                        <p className={`text-sm ${rideType === 'pickup' ? 'text-emerald-700 dark:text-emerald-500' : isDark ? 'text-zinc-400' : 'text-slate-600'}`}>
                          Travel from airport to your destination
                        </p>
                      </div>
                    </button>

                    <button
                      type="button"
                      onClick={() => setRideType('drop')}
                      className={`group relative rounded-2xl border p-5 text-left transition-all overflow-hidden ${rideType === 'drop'
                        ? 'border-teal-500 bg-teal-50 dark:bg-teal-900/10 shadow-sm ring-1 ring-teal-500'
                        : isDark
                          ? 'border-zinc-800 bg-zinc-800/50 hover:border-zinc-600 hover:bg-zinc-800'
                          : 'border-slate-200 bg-white hover:border-slate-300 hover:bg-slate-50'
                        }`}
                    >
                      {rideType === 'drop' && (
                        <div className="absolute top-0 right-0 w-16 h-16 bg-teal-100 dark:bg-teal-900/30 rounded-bl-[100px] -z-0"></div>
                      )}
                      <div className="relative z-10">
                        <div className="flex items-center gap-3 mb-3">
                          <div className={`p-2.5 rounded-xl ${rideType === 'drop' ? 'bg-teal-100 dark:bg-teal-900/50 text-teal-600 dark:text-teal-400' : isDark ? 'bg-zinc-700 text-zinc-300' : 'bg-slate-100 text-slate-500'}`}>
                            <Plane className="h-5 w-5" />
                          </div>
                          <span className={`font-bold text-base ${rideType === 'drop' ? 'text-teal-600 dark:text-teal-400' : isDark ? 'text-white' : 'text-slate-900'}`}>
                            To Airport
                          </span>
                        </div>
                        <p className={`text-sm ${rideType === 'drop' ? 'text-teal-700 dark:text-teal-500' : isDark ? 'text-zinc-400' : 'text-slate-600'}`}>
                          Travel from your location to airport
                        </p>
                      </div>
                    </button>
                  </div>
                </div>

                {/* Location Inputs */}
                {rideType === 'pickup' ? (
                  <div className="space-y-6 mb-8">
                    <div>
                      <label className={`mb-2.5 block text-sm font-bold ${isDark ? 'text-gray-200' : 'text-slate-800'}`}>Where would you like to go?</label>
                      <div className="flex gap-3 items-start">
                        <div className="flex-1">
                          <LocationPickerComponent
                            value={destinationCity}
                            onChange={(value) => setDestinationCity(value)}
                            onSelectLocation={(location) => {
                              if (location && (location.lat || location.latitude)) {
                                setDestinationCoordinates({
                                  latitude: location.lat || location.latitude,
                                  longitude: location.lng || location.longitude,
                                });
                              }
                            }}
                            placeholder="Search destination area..."
                            showMap={false}
                          />
                        </div>
                      </div>
                    </div>
                  </div>
                ) : (
                  <div className="space-y-6 mb-8">
                    <div>
                      <label className={`mb-2.5 block text-sm font-bold ${isDark ? 'text-gray-200' : 'text-slate-800'}`}>Where are you located?</label>
                      <div className="flex gap-3 items-start">
                        <div className="flex-1">
                          <LocationPickerComponent
                            value={pickupLocation}
                            onChange={(value) => setPickupLocation(value)}
                            onSelectLocation={(location) => {
                              if (location && (location.lat || location.latitude)) {
                                setPickupCoordinates({
                                  latitude: location.lat || location.latitude,
                                  longitude: location.lng || location.longitude,
                                });
                              }
                            }}
                            placeholder="Search your location..."
                            showMap={false}
                          />
                        </div>
                        <button
                          type="button"
                          onClick={handleFetchCurrentLocation}
                          disabled={fetchingLocation}
                          className={`rounded-xl p-3.5 flex-shrink-0 transition-all border ${fetchingLocation ? 'bg-slate-100 border-slate-200 cursor-not-allowed text-slate-400' : isDark ? 'border-zinc-700 bg-zinc-800 hover:bg-zinc-700 text-teal-400' : 'border-slate-200 bg-slate-50 hover:bg-slate-100 text-teal-600'}`}
                          title="Use current location"
                        >
                          {fetchingLocation ? (
                            <Loader2 className="h-5 w-5 animate-spin" />
                          ) : (
                            <Navigation className="h-5 w-5" />
                          )}
                        </button>
                      </div>
                    </div>
                  </div>
                )}

                {/* Time Section */}
                <div className="mb-8 grid gap-6 md:grid-cols-2">
                  <div>
                    <label className={`mb-2.5 block text-sm font-bold ${isDark ? 'text-gray-200' : 'text-slate-800'}`}>Travel Date</label>
                    <div className="relative group">
                      <Calendar className={`pointer-events-none absolute left-4 top-1/2 h-5 w-5 -translate-y-1/2 transition-colors ${isDark ? 'text-zinc-500 group-focus-within:text-emerald-400' : 'text-slate-400 group-focus-within:text-emerald-600'}`} />
                      <input
                        type="date"
                        min={minDate}
                        value={selectedDate}
                        onChange={(e) => setSelectedDate(e.target.value)}
                        className={`w-full rounded-xl border py-3.5 pl-12 pr-4 text-sm font-medium transition-all focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500 ${isDark ? 'border-zinc-700 bg-zinc-800/50 text-white' : 'border-slate-200 bg-slate-50 text-slate-900'}`}
                      />
                    </div>
                  </div>
                  <div>
                    <label className={`mb-2.5 block text-sm font-bold ${isDark ? 'text-gray-200' : 'text-slate-800'}`}>Departure Time</label>
                    <div className="relative group">
                      <Clock3 className={`pointer-events-none absolute left-4 top-1/2 h-5 w-5 -translate-y-1/2 transition-colors ${isDark ? 'text-zinc-500 group-focus-within:text-emerald-400' : 'text-slate-400 group-focus-within:text-emerald-600'}`} />
                      <input
                        type="time"
                        value={selectedTime}
                        min={minTime}
                        onChange={(e) => setSelectedTime(e.target.value)}
                        className={`w-full rounded-xl border py-3.5 pl-12 pr-4 text-sm font-medium transition-all focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500 ${isDark ? 'border-zinc-700 bg-zinc-800/50 text-white' : 'border-slate-200 bg-slate-50 text-slate-900'}`}
                      />
                    </div>
                  </div>
                </div>

                {/* Vehicle Selection */}
                <div>
                  <label className={`mb-4 block text-sm font-bold ${isDark ? 'text-gray-200' : 'text-slate-800'}`}>Choose Vehicle</label>
                  <div className="grid gap-4 md:grid-cols-2">
                    {carTypes.map((car) => (
                      <button
                        key={car.id}
                        type="button"
                        onClick={() => setSelectedCar(car.id)}
                        className={`group relative rounded-2xl border p-5 text-left transition-all overflow-hidden ${selectedCar === car.id
                          ? 'border-emerald-500 bg-emerald-50 dark:bg-emerald-900/10 shadow-sm ring-1 ring-emerald-500'
                          : isDark
                            ? 'border-zinc-800 bg-zinc-800/50 hover:border-zinc-600 hover:bg-zinc-800'
                            : 'border-slate-200 bg-white hover:border-slate-300 hover:bg-slate-50'
                          }`}
                      >
                        {selectedCar === car.id && (
                          <div className="absolute top-0 right-0 w-16 h-16 bg-emerald-100 dark:bg-emerald-900/30 rounded-bl-[100px] -z-0"></div>
                        )}

                        <div className="relative z-10">
                          <div className="mb-4 flex items-center justify-between">
                            <div className={`p-2 rounded-xl ${selectedCar === car.id ? 'bg-emerald-100 dark:bg-emerald-900/50 text-emerald-600 dark:text-emerald-400' : isDark ? 'bg-zinc-700 text-zinc-300' : 'bg-slate-100 text-slate-500'}`}>
                              <CarTaxiFront className="h-6 w-6" />
                            </div>
                            <span className={`rounded-full px-2.5 py-1 text-xs font-bold ${selectedCar === car.id ? 'bg-emerald-600 text-white' : isDark ? 'bg-zinc-700 text-zinc-300' : 'bg-slate-100 text-slate-600'}`}>
                              {car.passengers} seats
                            </span>
                          </div>
                          <p className={`font-bold text-lg ${isDark ? 'text-white' : 'text-slate-900'}`}>{car.name}</p>
                          <p className={`text-sm mt-1 ${selectedCar === car.id ? 'text-emerald-600 dark:text-emerald-400' : isDark ? 'text-zinc-500' : 'text-slate-500'}`}>
                            Perfect for your journey
                          </p>
                        </div>
                      </button>
                    ))}
                  </div>
                </div>
              </div>

              {/* Right Column: Summary */}
              <div className="lg:col-span-4">
                <div className="mb-6 h-[350px] rounded-3xl overflow-hidden shadow-sm border border-slate-200 dark:border-zinc-800">
                  <GoogleMapComponent
                    pickupCoords={rideType === 'pickup' ? AIRPORT_LOCATION : pickupCoordinates}
                    dropCoords={rideType === 'pickup' ? destinationCoordinates : AIRPORT_LOCATION}
                    isDark={isDark}
                  />
                </div>
                <div className={`sticky top-24 rounded-3xl border p-6 md:p-8 shadow-sm ${isDark ? 'border-zinc-800 bg-zinc-900/50' : 'border-slate-200 bg-white'}`}>
                  <h2 className={`mb-6 text-xl font-black tracking-tight ${isDark ? 'text-white' : 'text-slate-900'}`}>Fare Summary</h2>

                  <div className="space-y-4 text-sm mb-6">
                    <div className="flex items-center justify-between">
                      <span className={`font-medium ${isDark ? 'text-zinc-400' : 'text-slate-500'}`}>Ride Type</span>
                      <span className={`font-bold px-2 py-1 rounded-md text-xs ${rideType === 'pickup'
                        ? isDark ? 'bg-emerald-900/30 text-emerald-300' : 'bg-emerald-100 text-emerald-700'
                        : isDark ? 'bg-teal-900/30 text-teal-300' : 'bg-teal-100 text-teal-700'
                        }`}>
                        {rideType === 'pickup' ? 'From Airport' : 'To Airport'}
                      </span>
                    </div>

                    <div className="flex items-start justify-between gap-4">
                      <span className={`font-medium ${isDark ? 'text-zinc-400' : 'text-slate-500'}`}>Route</span>
                      <span className={`text-right font-semibold leading-snug ${isDark ? 'text-white' : 'text-slate-900'}`}>
                        {rideType === 'pickup'
                          ? `JAI → ${destinationCity ? destinationCity : 'Dest.'}`
                          : `${pickupLocation ? pickupLocation.split(',')[0] : 'Loc.'} → JAI`}
                      </span>
                    </div>

                    <div className="flex items-center justify-between">
                      <span className={`font-medium ${isDark ? 'text-zinc-400' : 'text-slate-500'}`}>Service</span>
                      <span className={`font-bold ${isDark ? 'text-white' : 'text-slate-900'}`}>Fixed Rate</span>
                    </div>
                  </div>

                  <div className={`my-6 p-4 rounded-xl ${isDark ? 'bg-zinc-800/50' : 'bg-slate-50'}`}>
                    <div className="flex items-center justify-between mb-2">
                      <span className={`text-sm font-semibold ${isDark ? 'text-zinc-300' : 'text-slate-700'}`}>Flat Rate</span>
                      <span className={`font-bold ${isDark ? 'text-zinc-300' : 'text-slate-700'}`}>
                        {formatMoney(baseFare)}
                      </span>
                    </div>
                    <div className="flex items-center justify-between">
                      <span className={`text-sm font-semibold ${isDark ? 'text-zinc-300' : 'text-slate-700'}`}>Parking Fee</span>
                      <span className={`font-bold ${isDark ? 'text-zinc-300' : 'text-slate-700'}`}>
                        {formatMoney(parkingCharge)}
                      </span>
                    </div>
                  </div>

                  <div className={`my-6 h-px border-t border-dashed ${isDark ? 'border-zinc-700' : 'border-slate-200'}`} />

                  <div className="space-y-4 mb-8">
                    <div className="flex items-end justify-between">
                      <span className={`font-bold ${isDark ? 'text-zinc-300' : 'text-slate-700'}`}>Total Fare</span>
                      <span className={`text-2xl font-black ${isDark ? 'text-white' : 'text-slate-900'}`}>{formatMoney(totalAmount)}</span>
                    </div>

                    <div className={`p-4 rounded-xl ${isDark ? 'bg-emerald-900/10 border border-emerald-900/30' : 'bg-emerald-50 border border-emerald-100'}`}>
                      <div className="flex items-center justify-between mb-1">
                        <span className="font-bold text-emerald-700 dark:text-emerald-400 flex items-center gap-1.5">
                          <CheckCircle2 size={16} /> Pay Now (20%)
                        </span>
                        <span className="text-xl font-black text-emerald-700 dark:text-emerald-400">{formatMoney(advancePayment)}</span>
                      </div>
                      <div className="flex items-center justify-between text-sm mt-3 pt-3 border-t border-emerald-200 dark:border-emerald-800/50">
                        <span className={`font-medium ${isDark ? 'text-zinc-400' : 'text-slate-600'}`}>Balance (Due later)</span>
                        <span className={`font-bold ${isDark ? 'text-zinc-300' : 'text-slate-700'}`}>{formatMoney(totalAmount - advancePayment)}</span>
                      </div>
                    </div>
                  </div>

                  <button
                    type="button"
                    onClick={handleBooking}
                    disabled={bookingLoading}
                    className={`w-full rounded-xl py-4 font-bold text-base transition-all flex items-center justify-center gap-2 shadow-sm ${bookingLoading
                      ? 'cursor-not-allowed bg-slate-100 text-slate-400 dark:bg-zinc-800 dark:text-zinc-500 shadow-none'
                      : 'bg-emerald-600 text-white hover:bg-emerald-700 hover:shadow-emerald-500/25 hover:shadow-lg active:scale-[0.98]'
                      }`}
                  >
                    {bookingLoading && <Loader2 className="h-5 w-5 animate-spin" />}
                    {bookingLoading ? 'Processing Booking...' : 'Book Ride Now'}
                  </button>

                  <p className={`mt-4 text-center text-xs font-medium ${isDark ? 'text-zinc-500' : 'text-slate-400'}`}>
                    Instant confirmation • Secure payment
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </>
  );
}
