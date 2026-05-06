import { useMemo, useState, useEffect } from 'react';
import { Calendar, CarTaxiFront, ChevronLeft, Clock3, Loader2, Navigation, AlertCircle, MapPin, CheckCircle2, Zap } from 'lucide-react';
import { useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../context/AuthContext.jsx';
import { useTheme } from '../context/ThemeContext.jsx';
import LocationPickerComponent from '../components/LocationPickerComponent.jsx';
import { bookingService } from '../services/bookingService.js';
import { estimateDistance } from '../services/locationService.js';
import { fetchCarRates } from '../services/rateService.js';
import { ridePaymentService } from '../services/ridePaymentService.js';
import GoogleMapComponent from '../components/GoogleMapComponent.jsx';

const popularRoutes = [
  { id: 'jaipur-udaipur', from: 'Jaipur', to: 'Udaipur', fromLat: 26.9124, fromLng: 75.7873, toLat: 24.5854, toLng: 73.7125 },
  { id: 'jaipur-jodhpur', from: 'Jaipur', to: 'Jodhpur', fromLat: 26.9124, fromLng: 75.7873, toLat: 26.2389, toLng: 73.0243 },
  { id: 'jaipur-pushkar', from: 'Jaipur', to: 'Pushkar', fromLat: 26.9124, fromLng: 75.7873, toLat: 26.4894, toLng: 74.5619 },
  { id: 'jaipur-agra', from: 'Jaipur', to: 'Agra', fromLat: 26.9124, fromLng: 75.7873, toLat: 27.1767, toLng: 78.0081 },
  { id: 'custom', from: 'Custom Route', to: 'Enter your cities' },
];

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

export default function IntercityRidePage() {
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

  // Fetch rates from admin
  const [carTypes, setCarTypes] = useState([]);
  const [ratesLoading, setRatesLoading] = useState(true);

  const [selectedRoute, setSelectedRoute] = useState('');
  const [customFromCity, setCustomFromCity] = useState('');
  const [customFromCoordinates, setCustomFromCoordinates] = useState(null);
  const [customToCity, setCustomToCity] = useState('');
  const [customToCoordinates, setCustomToCoordinates] = useState(null);
  const [geocodedFromCoordinates, setGeocodedFromCoordinates] = useState(null);
  const [geocodedToCoordinates, setGeocodedToCoordinates] = useState(null);
  const [selectedDate, setSelectedDate] = useState(formatDateValue(defaultRideTime));
  const [selectedTime, setSelectedTime] = useState(formatTimeValue(defaultRideTime));
  const [selectedCar, setSelectedCar] = useState('economy');
  const [bookingLoading, setBookingLoading] = useState(false);
  const [bookingError, setBookingError] = useState('');
  const [calculatedDistance, setCalculatedDistance] = useState(0);
  const [distanceLoading, setDistanceLoading] = useState(false);
  const location = useLocation();

  // Consume state from navigate (e.g. from Home Hero)
  useEffect(() => {
    if (location.state) {
      const { pickup, destination, date, time, pickupData, destData } = location.state;
      setSelectedRoute('custom');
      if (pickup) setCustomFromCity(pickup);
      if (destination) setCustomToCity(destination);
      if (date) setSelectedDate(date);
      if (time) setSelectedTime(time);
      if (pickupData?.latitude) {
        setCustomFromCoordinates({
          lat: pickupData.latitude,
          lng: pickupData.longitude
        });
      }
      if (destData?.latitude) {
        setCustomToCoordinates({
          lat: destData.latitude,
          lng: destData.longitude
        });
      }
    }
  }, [location.state]);

  // Fetch rates from admin when component mounts
  useEffect(() => {
    const loadRates = async () => {
      try {
        setRatesLoading(true);
        const rates = await fetchCarRates(true); // Force fresh fetch
        setCarTypes(rates.map(rate => ({
          id: rate.id,
          name: rate.name,
          additionalCharge: rate.baseRate,
          passengers: rate.maxPassengers,
        })));
      } catch (error) {
        console.error('Error loading rates:', error);
      } finally {
        setRatesLoading(false);
      }
    };

    loadRates();

    // Refetch rates every 10 seconds to stay in sync with admin updates
    const interval = setInterval(loadRates, 10000);

    // Refetch when page becomes visible (tab switched back)
    const handleVisibilityChange = () => {
      if (!document.hidden) {
        loadRates();
      }
    };
    document.addEventListener('visibilitychange', handleVisibilityChange);

    return () => {
      clearInterval(interval);
      document.removeEventListener('visibilitychange', handleVisibilityChange);
    };
  }, []);

  // Calculate distance when route or cities change
  useEffect(() => {
    const calculateDistance = async () => {
      let fromCity = '';
      let toCity = '';

      if (selectedRoute === 'custom') {
        fromCity = customFromCity;
        toCity = customToCity;
      } else {
        const route = popularRoutes.find(r => r.id === selectedRoute);
        if (route) {
          fromCity = route.from;
          toCity = route.to;
        }
      }

      if (!fromCity.trim() || !toCity.trim()) {
        setCalculatedDistance(0);
        setGeocodedFromCoordinates(null);
        setGeocodedToCoordinates(null);
        return;
      }

      try {
        setDistanceLoading(true);

        // Pass pickupCoordinates if available to avoid backend geocoding
        const result = await estimateDistance(
          fromCity.trim(),
          toCity.trim(),
          geocodedFromCoordinates || customFromCoordinates
        );
        if (result && result.distance) {
          setCalculatedDistance(Math.max(result.distance, 10)); // Minimum 10 km for intercity

          // Extract and set geocoded coordinates from response
          if (result.pickupCoords) {
            setGeocodedFromCoordinates({
              latitude: result.pickupCoords.lat,
              longitude: result.pickupCoords.lon,
            });
          }
          if (result.dropCoords) {
            setGeocodedToCoordinates({
              latitude: result.dropCoords.lat,
              longitude: result.dropCoords.lon,
            });
          }
        } else {
          setCalculatedDistance(0);
          setGeocodedFromCoordinates(null);
          setGeocodedToCoordinates(null);
        }
      } catch (error) {
        console.error('Error calculating distance:', error);
        setCalculatedDistance(0);
        setGeocodedFromCoordinates(null);
        setGeocodedToCoordinates(null);
      } finally {
        setDistanceLoading(false);
      }
    };

    calculateDistance();
  }, [selectedRoute, customFromCity, customToCity]);

  const getDisplayCities = () => {
    if (selectedRoute === 'custom') {
      return {
        from: customFromCity,
        to: customToCity,
        fromCoordinates: geocodedFromCoordinates || customFromCoordinates,
        toCoordinates: geocodedToCoordinates || customToCoordinates,
      };
    }
    const route = popularRoutes.find(r => r.id === selectedRoute);
    return route ? {
      from: route.from,
      to: route.to,
      fromCoordinates: geocodedFromCoordinates || { latitude: route.fromLat, longitude: route.fromLng },
      toCoordinates: geocodedToCoordinates || { latitude: route.toLat, longitude: route.toLng },
    } : {
      from: '',
      to: '',
      fromCoordinates: null,
      toCoordinates: null,
    };
  };

  const displayCities = getDisplayCities();
  const selectedCarData = carTypes.find(car => car.id === selectedCar);
  // Ensure we have a fallback distance for intercity (usually longer, e.g. 100km) if locations are entered but distance is 0
  const displayDistance = (displayCities.from && displayCities.to && (!calculatedDistance || calculatedDistance === 0)) ? 100 : calculatedDistance;
  const estimatedDistance = displayDistance || 0;

  // Intercity ride pricing: baseRate is per-km rate. Minimum fare is ₹1500 for intercity.
  const distanceFare = selectedCarData ? selectedCarData.additionalCharge * estimatedDistance : 0;
  const baseFare = Math.max(distanceFare, 1500); // Minimum fare ₹1500 for Intercity

  const totalAmount = baseFare;
  const advancePayment = Math.round(totalAmount * 0.2); // 20% advance
  const remainingAmount = totalAmount - advancePayment;
  const minDate = formatDateValue(now);
  const currentDateTime = new Date();
  const isSameDayBooking = selectedDate === formatDateValue(currentDateTime);
  const minTime = isSameDayBooking ? formatTimeValue(currentDateTime) : '00:00';

  const formatMoney = (value) => `₹${Math.round(value).toLocaleString('en-IN')}`;





  const handleBooking = async () => {
    try {
      if (!selectedRoute) {
        setBookingError('Please select a route');
        return;
      }

      const { from, to, fromCoordinates, toCoordinates } = displayCities;

      if (!from.trim() || !to.trim()) {
        setBookingError('Please select valid cities or enter custom route');
        return;
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

      if (!calculatedDistance && displayDistance <= 0) {
        setBookingError('Unable to calculate distance. Please check your locations and try again');
        return;
      }

      setBookingError('');
      setBookingLoading(true);

      const bookingData = {
        pickupLocation: {
          address: from.trim(),
          coordinates: fromCoordinates || { latitude: 28.7041, longitude: 77.1025 },
        },
        dropLocation: {
          address: to.trim(),
          coordinates: toCoordinates || { latitude: 26.9124, longitude: 75.7873 },
        },
        scheduledDate: selectedDate,
        scheduledTime: selectedTime,
        cabType: selectedCar,
        distance: estimatedDistance,
        passengerDetails: {
          name: user.name || 'Guest',
          phone: user.phone || '',
          email: user.email || '',
        },
        rideType: 'intercity',
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
      // Safety check for payment amount
      if (!advancePayment || advancePayment <= 0) {
        setBookingError('Fare could not be calculated. Please check your car selection and distance.');
        setBookingLoading(false);
        return;
      }

      const paymentPayload = {
        bookingId: booking._id,
        amount: advancePayment, // 20% of total
        rideType: 'intercity',
        pickupLocation: bookingData.pickupLocation.address,
        dropLocation: bookingData.dropLocation.address,
      };
      console.log('📡 Sending Intercity Payment Order Request:', paymentPayload);
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
        { rideType: 'intercity' },
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
                  message: `Intercity ride booked! 20% advance (${formatMoney(advancePayment)}) paid successfully. Remaining ${formatMoney(remainingAmount)} due after ride.`,
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

  return (
    <div className={`min-h-screen font-['Inter',sans-serif] transition-colors duration-300 ${isDark ? 'bg-black' : 'bg-[#fafafa]'}`}>
      <div className="container mx-auto px-4 py-8 md:py-16">
        <div className="mx-auto max-w-6xl">
          {/* Header Section */}
          <div className="mb-10 text-center md:text-left flex flex-col md:flex-row items-center justify-between gap-6">
            <div>
              <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-emerald-100 dark:bg-emerald-900/30 text-emerald-700 dark:text-emerald-300 font-semibold text-xs mb-4">
                <MapPin size={14} />
                <span>100% Electric Intercity Travel</span>
              </div>
              <h1 className={`text-4xl font-black tracking-tight md:text-5xl ${isDark ? 'text-white' : 'text-slate-900'}`}>
                Intercity <span className="text-transparent bg-clip-text bg-gradient-to-r from-emerald-600 to-teal-500">Rides</span>
              </h1>
              <p className={`mt-3 text-base md:text-lg ${isDark ? 'text-slate-400' : 'text-slate-600'}`}>
                Premium, long-distance travel between cities in zero-emission comfort.
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

              <div className="mb-8">
                <label className={`mb-2.5 block text-sm font-bold ${isDark ? 'text-gray-200' : 'text-slate-800'}`}>Choose Route</label>
                <div className="relative group">
                  <Navigation className={`pointer-events-none absolute left-4 top-1/2 h-5 w-5 -translate-y-1/2 transition-colors ${isDark ? 'text-zinc-500 group-focus-within:text-emerald-400' : 'text-slate-400 group-focus-within:text-emerald-600'}`} />
                  <select
                    value={selectedRoute}
                    onChange={(e) => setSelectedRoute(e.target.value)}
                    className={`w-full rounded-xl border py-3.5 pl-12 pr-4 text-sm font-medium transition-all focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500 appearance-none ${isDark ? 'border-zinc-700 bg-zinc-800/50 text-white' : 'border-slate-200 bg-slate-50 text-slate-900'}`}
                  >
                    <option value="">Select a popular route or create custom</option>
                    {popularRoutes.map((route) => (
                      <option key={route.id} value={route.id}>
                        {route.from} → {route.to}
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              {selectedRoute === 'custom' && (
                <div className="mb-8 grid gap-6 md:grid-cols-2">
                  <div>
                    <label className={`mb-2.5 block text-sm font-bold ${isDark ? 'text-gray-200' : 'text-slate-800'}`}>From City</label>
                    <LocationPickerComponent
                      value={customFromCity}
                      onChange={(value) => setCustomFromCity(value)}
                      onSelectLocation={(location) => {
                        if (location && (location.lat || location.latitude)) {
                          setCustomFromCoordinates({
                            lat: location.lat || location.latitude,
                            lng: location.lng || location.longitude,
                          });
                        }
                      }}
                      placeholder="Enter starting city"
                      showMap={false}
                    />
                  </div>
                  <div>
                    <label className={`mb-2.5 block text-sm font-bold ${isDark ? 'text-gray-200' : 'text-slate-800'}`}>To City</label>
                    <LocationPickerComponent
                      value={customToCity}
                      onChange={(value) => setCustomToCity(value)}
                      onSelectLocation={(location) => {
                        if (location && (location.lat || location.latitude)) {
                          setCustomToCoordinates({
                            lat: location.lat || location.latitude,
                            lng: location.lng || location.longitude,
                          });
                        }
                      }}
                      placeholder="Enter destination city"
                      showMap={false}
                    />
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
                        <p className={`text-sm mt-1 font-semibold ${selectedCar === car.id ? 'text-emerald-600 dark:text-emerald-400' : isDark ? 'text-zinc-500' : 'text-slate-500'}`}>
                          ₹{Math.round(car.additionalCharge * estimatedDistance)} / ride
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
                  pickupCoords={geocodedFromCoordinates || displayCities.fromCoordinates}
                  dropCoords={geocodedToCoordinates || displayCities.toCoordinates}
                  isDark={isDark}
                />
              </div>
              <div className={`sticky top-24 rounded-3xl border p-6 md:p-8 shadow-sm ${isDark ? 'border-zinc-800 bg-zinc-900/50' : 'border-slate-200 bg-white'}`}>
                <h2 className={`mb-6 text-xl font-black tracking-tight ${isDark ? 'text-white' : 'text-slate-900'}`}>Fare Summary</h2>

                <div className="space-y-4 text-sm mb-6">
                  <div className="flex items-center justify-between">
                    <span className={`font-medium ${isDark ? 'text-zinc-400' : 'text-slate-500'}`}>From</span>
                    <span className={`max-w-[150px] truncate text-right font-semibold ${isDark ? 'text-white' : 'text-slate-900'}`}>
                      {displayCities.from || 'Not selected'}
                    </span>
                  </div>

                  <div className="flex items-center justify-between">
                    <span className={`font-medium ${isDark ? 'text-zinc-400' : 'text-slate-500'}`}>To</span>
                    <span className={`max-w-[150px] truncate text-right font-semibold ${isDark ? 'text-white' : 'text-slate-900'}`}>
                      {displayCities.to || 'Not selected'}
                    </span>
                  </div>

                  <div className="flex items-center justify-between">
                    <span className={`font-medium ${isDark ? 'text-zinc-400' : 'text-slate-500'}`}>Est. Distance</span>
                    <span className={`font-bold ${isDark ? 'text-white' : 'text-slate-900'}`}>
                      {distanceLoading ? (
                        <span className="flex items-center gap-1.5 text-emerald-500">
                          <Loader2 className="h-3 w-3 animate-spin" />
                          Calc...
                        </span>
                      ) : (
                        `${estimatedDistance} km`
                      )}
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
                      <span className={`font-bold ${isDark ? 'text-zinc-300' : 'text-slate-700'}`}>{formatMoney(remainingAmount)}</span>
                    </div>
                  </div>
                </div>

                <button
                  type="button"
                  onClick={handleBooking}
                  disabled={bookingLoading || (!calculatedDistance && displayDistance <= 0)}
                  className={`w-full rounded-xl py-4 font-bold text-base transition-all flex items-center justify-center gap-2 shadow-sm ${bookingLoading || (!calculatedDistance && displayDistance <= 0)
                    ? 'cursor-not-allowed bg-slate-100 text-slate-400 dark:bg-zinc-800 dark:text-zinc-500 shadow-none'
                    : 'bg-emerald-600 text-white hover:bg-emerald-700 hover:shadow-emerald-500/25 hover:shadow-lg active:scale-[0.98]'
                    }`}
                >
                  {bookingLoading && <Loader2 className="h-5 w-5 animate-spin" />}
                  {bookingLoading ? 'Processing Booking...' : (!calculatedDistance && displayDistance <= 0) ? 'Enter locations to book' : 'Book Ride Now'}
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
  );
}
