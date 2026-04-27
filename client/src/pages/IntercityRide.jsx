import { useMemo, useState, useEffect } from 'react';
import { Calendar, CarTaxiFront, ChevronLeft, Clock3, Loader2, Navigation } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext.jsx';
import { useTheme } from '../context/ThemeContext.jsx';
import LocationPickerComponent from '../components/LocationPickerComponent.jsx';
import { bookingService } from '../services/bookingService.js';
import { estimateDistance } from '../services/locationService.js';
import { fetchCarRates } from '../services/rateService.js';
import { ridePaymentService } from '../services/ridePaymentService.js';

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

        // Use backend API for accurate distance calculation
        const result = await estimateDistance(fromCity, toCity);
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

  const selectedCarData = carTypes.find(car => car.id === selectedCar);
  const estimatedDistance = calculatedDistance || 0;
  const baseFare = selectedCarData ? selectedCarData.additionalCharge * estimatedDistance : 0;
  const totalAmount = baseFare;
  const advancePayment = Math.round(totalAmount * 0.2); // 20% advance
  const remainingAmount = totalAmount - advancePayment;
  const minDate = formatDateValue(now);
  const currentDateTime = new Date();
  const isSameDayBooking = selectedDate === formatDateValue(currentDateTime);
  const minTime = isSameDayBooking ? formatTimeValue(currentDateTime) : '00:00';

  const formatMoney = (value) => `₹${Math.round(value).toLocaleString('en-IN')}`;

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
      const paymentOrderResponse = await ridePaymentService.createRidePaymentOrder({
        bookingId: booking._id || booking.bookingId,
        amount: advancePayment, // 20% of total
        rideType: 'intercity',
        pickupLocation: from,
        dropLocation: to,
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
    <div className={`min-h-screen font-['Poppins'] transition-colors duration-300 ${isDark ? 'bg-gradient-to-b from-black via-[#05120a] to-black' : 'bg-gradient-to-br from-orange-50 via-yellow-50 to-red-50'}`}>
      <div className="container mx-auto px-4 py-8 md:py-12">
        <div className="mx-auto max-w-5xl">
          <div className="mb-6 flex flex-wrap items-center justify-between gap-4">
            <div>
            
              <h1 className={`text-2xl font-bold md:text-4xl ${isDark ? 'text-white' : 'text-slate-900'}`}>Intercity Ride Booking</h1>
              <p className={`mt-2 text-sm md:text-base ${isDark ? 'text-gray-300' : 'text-slate-600'}`}>
                Comfortable long-distance travel between cities.
              </p>
            </div>
          </div>

          <div className="grid gap-6 lg:grid-cols-3">
            <div className={`rounded-3xl p-6 shadow-2xl lg:col-span-2 ${isDark ? 'border border-gray-800 bg-gray-900/90' : 'border border-orange-100 bg-white/95'}`}>
              {bookingError && (
                <div className="mb-6 rounded-xl border border-red-400/50 bg-red-500/10 p-4 text-red-500">
                  <p className="text-sm font-medium">{bookingError}</p>
                </div>
              )}

              <div className="mb-5">
                <label className={`mb-2 block text-sm font-semibold ${isDark ? 'text-gray-100' : 'text-slate-900'}`}>Choose Route</label>
                <div className="relative">
                  <Navigation className={`pointer-events-none absolute left-4 top-1/2 h-5 w-5 -translate-y-1/2 ${isDark ? 'text-gray-400' : 'text-slate-500'}`} />
                  <select
                    value={selectedRoute}
                    onChange={(e) => setSelectedRoute(e.target.value)}
                    className={`w-full rounded-xl border py-3 pl-12 pr-4 transition-all focus:outline-none focus:ring-2 focus:ring-orange-500 ${isDark ? 'border-gray-700 bg-black/40 text-white' : 'border-slate-200 bg-white text-slate-900'}`}
                  >
                    <option value="">Select route</option>
                    {popularRoutes.map((route) => (
                      <option key={route.id} value={route.id}>
                        {route.from} → {route.to}
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              {selectedRoute === 'custom' && (
                <>
                  <div className="mb-5 grid gap-4 md:grid-cols-2">
                    <div>
                      <label className={`mb-2 block text-sm font-semibold ${isDark ? 'text-gray-100' : 'text-slate-900'}`}>From City</label>
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
                      <label className={`mb-2 block text-sm font-semibold ${isDark ? 'text-gray-100' : 'text-slate-900'}`}>To City</label>
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
                </>
              )}

              <div className="mb-5 grid gap-4 md:grid-cols-2">
                <div>
                  <label className={`mb-2 block text-sm font-semibold ${isDark ? 'text-gray-100' : 'text-slate-900'}`}>Travel Date</label>
                  <div className="relative">
                    <Calendar className={`pointer-events-none absolute left-4 top-1/2 h-5 w-5 -translate-y-1/2 ${isDark ? 'text-gray-400' : 'text-slate-500'}`} />
                    <input
                      type="date"
                      min={minDate}
                      value={selectedDate}
                      onChange={(e) => setSelectedDate(e.target.value)}
                      className={`w-full rounded-xl border py-3 pl-12 pr-4 focus:outline-none focus:ring-2 focus:ring-orange-500 ${isDark ? 'border-gray-700 bg-black/40 text-white' : 'border-slate-200 bg-white text-slate-900'}`}
                    />
                  </div>
                </div>
                <div>
                  <label className={`mb-2 block text-sm font-semibold ${isDark ? 'text-gray-100' : 'text-slate-900'}`}>Departure Time</label>
                  <div className="relative">
                    <Clock3 className={`pointer-events-none absolute left-4 top-1/2 h-5 w-5 -translate-y-1/2 ${isDark ? 'text-gray-400' : 'text-slate-500'}`} />
                    <input
                      type="time"
                      value={selectedTime}
                      min={minTime}
                      onChange={(e) => setSelectedTime(e.target.value)}
                      className={`w-full rounded-xl border py-3 pl-12 pr-4 focus:outline-none focus:ring-2 focus:ring-orange-500 ${isDark ? 'border-gray-700 bg-black/40 text-white' : 'border-slate-200 bg-white text-slate-900'}`}
                    />
                  </div>
                </div>
              </div>

              <div className="mb-5">
                <label className={`mb-2 block text-sm font-semibold ${isDark ? 'text-gray-100' : 'text-slate-900'}`}>Choose Vehicle</label>
                <div className="grid gap-3 md:grid-cols-2">
                  {carTypes.map((car) => (
                    <button
                      key={car.id}
                      type="button"
                      onClick={() => setSelectedCar(car.id)}
                      className={`rounded-2xl border p-4 text-left transition-all ${selectedCar === car.id ? 'border-orange-500 bg-orange-500/10' : isDark ? 'border-gray-700 bg-black/20 hover:border-orange-500/50' : 'border-slate-200 bg-white hover:border-orange-400'}`}
                    >
                      <div className="mb-3 flex items-center justify-between">
                        <CarTaxiFront className={`h-6 w-6 ${selectedCar === car.id ? 'text-orange-500' : isDark ? 'text-gray-400' : 'text-slate-500'}`} />
                        <span className={`rounded-full px-2 py-1 text-xs font-semibold ${selectedCar === car.id ? 'bg-orange-500 text-white' : isDark ? 'bg-gray-700 text-gray-200' : 'bg-slate-100 text-slate-700'}`}>
                          {car.passengers} seats
                        </span>
                      </div>
                      <p className={`font-semibold ${isDark ? 'text-white' : 'text-slate-900'}`}>{car.name}</p>
                      <p className="mt-1 text-sm font-semibold text-orange-500">₹{Math.round(car.additionalCharge * estimatedDistance)}</p>
                    </button>
                  ))}
                </div>
              </div>
            </div>

            <div className="lg:sticky lg:top-24 lg:self-start">
              <div className={`rounded-3xl border p-6 shadow-2xl ${isDark ? 'border-gray-800 bg-gray-900/90' : 'border-orange-100 bg-white/95'}`}>
                <h2 className={`mb-4 text-lg font-bold ${isDark ? 'text-white' : 'text-slate-900'}`}>Fare Summary</h2>

                <div className="space-y-3 text-sm">
                  <div className="flex items-center justify-between">
                    <span className={isDark ? 'text-gray-400' : 'text-slate-600'}>From</span>
                    <span className={`max-w-[170px] truncate text-right font-medium ${isDark ? 'text-white' : 'text-slate-900'}`}>{displayCities.from || 'Not selected'}</span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className={isDark ? 'text-gray-400' : 'text-slate-600'}>To</span>
                    <span className={`max-w-[170px] truncate text-right font-medium ${isDark ? 'text-white' : 'text-slate-900'}`}>{displayCities.to || 'Not selected'}</span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className={isDark ? 'text-gray-400' : 'text-slate-600'}>Distance</span>
                    <span className={`font-medium ${isDark ? 'text-white' : 'text-slate-900'}`}>
                      {distanceLoading ? (
                        <span className="flex items-center gap-2">
                          <Loader2 className="h-3 w-3 animate-spin" />
                          Calculating...
                        </span>
                      ) : (
                        `${estimatedDistance} km`
                      )}
                    </span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className={isDark ? 'text-gray-400' : 'text-slate-600'}>Rate</span>
                    <span className={`font-medium ${isDark ? 'text-white' : 'text-slate-900'}`}>₹{Math.round((selectedCarData?.additionalCharge || 0) * estimatedDistance)}</span>
                  </div>
                </div>

                <div className={`my-4 h-px ${isDark ? 'bg-gray-700' : 'bg-slate-200'}`} />

                <div className="space-y-2 mb-4">
                  <div className="flex items-center justify-between">
                    <span className={`font-semibold ${isDark ? 'text-white' : 'text-slate-900'}`}>Total Fare</span>
                    <span className="text-lg font-bold text-orange-500">{formatMoney(totalAmount)}</span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className={`font-semibold text-green-500 ${isDark ? 'text-green-400' : ''}`}>20% Advance (Pay Now)</span>
                    <span className="text-xl font-bold text-green-500">{formatMoney(advancePayment)}</span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className={`font-semibold ${isDark ? 'text-gray-300' : 'text-slate-600'}`}>Balance Due After Ride</span>
                    <span className="font-semibold text-orange-500">{formatMoney(remainingAmount)}</span>
                  </div>
                </div>

                <div className={`mb-5 rounded-xl border p-3 text-sm ${isDark ? 'border-green-700 bg-green-900/20' : 'border-green-200 bg-green-50'}`}>
                  <p className={isDark ? 'text-green-300' : 'text-green-700'}>
                    ✓ 20% advance payment required to confirm booking. Pay the balance {formatMoney(remainingAmount)} after ride completion.
                  </p>
                </div>

                <button
                  type="button"
                  onClick={handleBooking}
                  disabled={bookingLoading}
                  className={`w-full rounded-xl py-4 font-semibold transition-all ${bookingLoading ? 'cursor-not-allowed bg-gray-400 text-gray-200' : 'bg-orange-500 text-white hover:bg-orange-400'}`}
                >
                  <span className="inline-flex items-center gap-2">
                    {bookingLoading && <Loader2 className="h-5 w-5 animate-spin" />}
                    {bookingLoading ? 'Processing...' : 'Book Now'}
                  </span>
                </button>

                <p className={`mt-3 text-xs ${isDark ? 'text-gray-400' : 'text-slate-500'}`}>
                  Your selected date and time are live validated against current time.
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
