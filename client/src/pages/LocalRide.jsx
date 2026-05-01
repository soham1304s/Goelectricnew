import { useMemo, useState, useEffect } from 'react';
import { Calendar, CarTaxiFront, Clock3, Loader2, MapPin, Navigation, Zap, CheckCircle2, AlertCircle, Locate, Leaf } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext.jsx';
import { useTheme } from '../context/ThemeContext.jsx';
import LocationPickerComponent from '../components/LocationPickerComponent.jsx';
import { bookingService } from '../services/bookingService.js';
import { estimateDistance } from '../services/locationService.js';
import { fetchCarRates } from '../services/rateService.js';
import { ridePaymentService } from '../services/ridePaymentService.js';
import GoogleMapComponent from '../components/GoogleMapComponent.jsx';

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

export default function LocalRidePage() {
  const navigate = useNavigate();
  const { user } = useAuth();
  const { theme } = useTheme();
  const isDark = theme === 'dark';

  // Fetch rates from admin
  const [carTypes, setCarTypes] = useState([]);
  const [ratesLoading, setRatesLoading] = useState(true);

  const now = useMemo(() => new Date(), []);
  const defaultRideTime = useMemo(() => {
    const time = new Date();
    time.setMinutes(time.getMinutes() + 30);
    return time;
  }, []);

  const [pickupLocation, setPickupLocation] = useState('');
  const [pickupCoordinates, setPickupCoordinates] = useState(null);
  const [dropLocation, setDropLocation] = useState('');
  const [dropCoordinates, setDropCoordinates] = useState(null);
  const [selectedDate, setSelectedDate] = useState(formatDateValue(defaultRideTime));
  const [selectedTime, setSelectedTime] = useState(formatTimeValue(defaultRideTime));
  const [selectedCar, setSelectedCar] = useState('economy');
  const [bookingLoading, setBookingLoading] = useState(false);
  const [bookingError, setBookingError] = useState('');
  const [calculatedDistance, setCalculatedDistance] = useState(0);
  const [distanceLoading, setDistanceLoading] = useState(false);
  const [isDetectingPickup, setIsDetectingPickup] = useState(false);
  const [isDetectingDrop, setIsDetectingDrop] = useState(false);

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

  // Calculate distance when pickup or drop location changes
  useEffect(() => {
    const calculateDistanceFromPickup = async () => {
      if (!pickupLocation.trim() || !dropLocation.trim()) {
        setCalculatedDistance(0);
        // Don't clear coordinates here as they might be set by the picker
        return;
      }

      try {
        setDistanceLoading(true);

        // Pass pickupCoordinates if available to avoid backend geocoding
        const result = await estimateDistance(
          pickupLocation.trim(),
          dropLocation.trim(),
          pickupCoordinates
        );
        if (result && result.distance) {
          setCalculatedDistance(Math.max(result.distance, 2)); // Minimum 2 km

          // Extract and set coordinates from response
          if (result.pickupCoords) {
            setPickupCoordinates({
              latitude: result.pickupCoords.lat,
              longitude: result.pickupCoords.lon,
            });
          }
          if (result.dropCoords) {
            setDropCoordinates({
              latitude: result.dropCoords.lat,
              longitude: result.dropCoords.lon,
            });
          }
        } else {
          setCalculatedDistance(0);
          setPickupCoordinates(null);
          setDropCoordinates(null);
        }
      } catch (error) {
        console.error('Error calculating distance:', error);
        setCalculatedDistance(0);
        setPickupCoordinates(null);
        setDropCoordinates(null);
      } finally {
        setDistanceLoading(false);
      }
    };

    calculateDistanceFromPickup();
  }, [pickupLocation, dropLocation]);

  const selectedCarData = carTypes.find(car => car.id === selectedCar);
  // Ensure we have at least 5km for display/calculation if locations are entered but distance is 0
  const displayDistance = (pickupLocation && dropLocation && (!calculatedDistance || calculatedDistance === 0)) ? 5 : calculatedDistance;
  const estimatedDistance = displayDistance || 0;
  
  // Local ride pricing: baseRate is per-km rate. Minimum fare is ₹50.
  const distanceFare = selectedCarData ? selectedCarData.additionalCharge * estimatedDistance : 0;
  const baseFare = Math.max(distanceFare, 50); // Minimum fare ₹50
  
  const totalAmount = baseFare;
  const advancePayment = Math.round(totalAmount * 0.2); // 20% advance
  const remainingAmount = totalAmount - advancePayment;
  const minDate = formatDateValue(now);
  const currentDateTime = new Date();
  const isSameDayBooking = selectedDate === formatDateValue(currentDateTime);
  const minTime = isSameDayBooking ? formatTimeValue(currentDateTime) : '00:00';

  const formatMoney = (value) => `₹${Math.round(value).toLocaleString('en-IN')}`;

  const detectPickupLocation = () => {
    if (!navigator.geolocation) {
      setBookingError("Geolocation is not supported by your browser");
      return;
    }

    setIsDetectingPickup(true);
    navigator.geolocation.getCurrentPosition(
      async (position) => {
        const { latitude, longitude } = position.coords;
        try {
          const { getReverseGeocodedAddress } = await import('../services/googleMapsService.js');
          const address = await getReverseGeocodedAddress(latitude, longitude);
          setPickupLocation(address);
          setPickupCoordinates({
            latitude: latitude,
            longitude: longitude,
          });
        } catch (error) {
          console.error('Location detection error:', error);
          setPickupLocation(`${latitude.toFixed(4)}, ${longitude.toFixed(4)}`);
          setPickupCoordinates({
            latitude: latitude,
            longitude: longitude,
          });
        } finally {
          setIsDetectingPickup(false);
        }
      },
      (error) => {
        console.error("Error getting location:", error);
        let errorMessage = "Unable to detect location";
        if (error.code === error.PERMISSION_DENIED) {
          errorMessage = "Please allow location access in your browser settings";
        } else if (error.code === error.POSITION_UNAVAILABLE) {
          errorMessage = "Location information is unavailable";
        } else if (error.code === error.TIMEOUT) {
          errorMessage = "Location request timed out";
        }
        setBookingError(errorMessage);
        setIsDetectingPickup(false);
      },
    );
  };

  const handleBooking = async () => {
    try {
      if (!pickupLocation.trim()) {
        setBookingError('Please enter pickup location');
        return;
      }

      if (!dropLocation.trim()) {
        setBookingError('Please enter drop location');
        return;
      }

      if (distanceLoading) {
        setBookingError('Please wait for distance calculation to complete');
        return;
      }

      if (!calculatedDistance && displayDistance <= 0) {
        setBookingError('Unable to calculate distance. Please check your locations and try again');
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
          address: pickupLocation.trim(),
          coordinates: pickupCoordinates || { latitude: 26.9124, longitude: 75.7873 },
        },
        dropLocation: {
          address: dropLocation.trim(),
          coordinates: dropCoordinates || { latitude: 26.9124, longitude: 75.7873 },
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
        rideType: 'local',
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
        rideType: 'local',
        pickupLocation: pickupLocation,
        dropLocation: dropLocation,
      };
      console.log('📡 Sending Local Payment Order Request:', paymentPayload);
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
        { rideType: 'local' },
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
                  message: `Local ride booked! 20% advance (${formatMoney(advancePayment)}) paid successfully. Remaining ${formatMoney(remainingAmount)} due after ride.`,
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
                <Leaf size={14} />
                <span>100% Electric Fleet</span>
              </div>
              <h1 className={`text-4xl font-black tracking-tight md:text-5xl ${isDark ? 'text-white' : 'text-slate-900'}`}>
                Local Ride <span className="text-transparent bg-clip-text bg-gradient-to-r from-emerald-600 to-teal-500">Booking</span>
              </h1>
              <p className={`mt-3 text-base md:text-lg ${isDark ? 'text-slate-400' : 'text-slate-600'}`}>
                Quick, convenient, and zero-emission rides within your city.
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

              {/* Locations Section */}
              <div className="space-y-6 mb-8">
                <div>
                  <label className={`mb-2.5 block text-sm font-bold ${isDark ? 'text-gray-200' : 'text-slate-800'}`}>Pickup Location</label>
                  <div className="flex gap-3 items-start">
                    <div className="flex-1">
                      <LocationPickerComponent
                        value={pickupLocation}
                        onChange={(value) => setPickupLocation(value)}
                        onSelectLocation={(location) => {
                          if (location && (location.lat || location.latitude)) {
                            setPickupCoordinates({
                              lat: location.lat || location.latitude,
                              lng: location.lng || location.longitude,
                            });
                          }
                        }}
                        placeholder="Search pickup area..."
                        showMap={false}
                      />
                    </div>
                    <button
                      type="button"
                      onClick={detectPickupLocation}
                      disabled={isDetectingPickup}
                      className={`rounded-xl p-3.5 flex-shrink-0 transition-all border ${isDetectingPickup ? 'bg-slate-100 border-slate-200 cursor-not-allowed text-slate-400' : isDark ? 'border-zinc-700 bg-zinc-800 hover:bg-zinc-700 text-emerald-400' : 'border-slate-200 bg-slate-50 hover:bg-slate-100 text-emerald-600'}`}
                      title="Use current location"
                    >
                      {isDetectingPickup ? (
                        <Loader2 className="h-5 w-5 animate-spin" />
                      ) : (
                        <Locate className="h-5 w-5" />
                      )}
                    </button>
                  </div>
                </div>

                <div>
                  <label className={`mb-2.5 block text-sm font-bold ${isDark ? 'text-gray-200' : 'text-slate-800'}`}>Drop Location</label>
                  <div className="flex gap-3 items-start">
                    <div className="flex-1">
                      <LocationPickerComponent
                        value={dropLocation}
                        onChange={(value) => setDropLocation(value)}
                        onSelectLocation={(location) => {
                          if (location && (location.lat || location.latitude)) {
                            setDropCoordinates({
                              latitude: location.lat || location.latitude,
                              longitude: location.lng || location.longitude,
                            });
                          }
                        }}
                        placeholder="Search destination..."
                        showMap={false}
                      />
                    </div>
                  </div>
                </div>
              </div>

              {/* Time Section */}
              <div className="mb-8 grid gap-6 md:grid-cols-2">
                <div>
                  <label className={`mb-2.5 block text-sm font-bold ${isDark ? 'text-gray-200' : 'text-slate-800'}`}>Date</label>
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
                  <label className={`mb-2.5 block text-sm font-bold ${isDark ? 'text-gray-200' : 'text-slate-800'}`}>Time</label>
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
                <div className="flex items-center justify-between mb-4">
                  <label className={`block text-sm font-bold ${isDark ? 'text-gray-200' : 'text-slate-800'}`}>Choose Vehicle</label>
                  {ratesLoading && <span className="text-xs text-emerald-600 flex items-center gap-1"><Loader2 className="w-3 h-3 animate-spin" /> Updating rates</span>}
                </div>

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
                        <div className="mt-1 flex items-baseline gap-1">
                          <p className={`text-xl font-black ${selectedCar === car.id ? 'text-emerald-600 dark:text-emerald-400' : isDark ? 'text-zinc-300' : 'text-slate-700'}`}>
                            ₹{Math.round(car.additionalCharge * estimatedDistance).toLocaleString('en-IN')}
                          </p>
                          <span className={`text-xs font-medium ${isDark ? 'text-zinc-500' : 'text-slate-400'}`}>est. total</span>
                        </div>
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
                  pickupCoords={pickupCoordinates}
                  dropCoords={dropCoordinates}
                  isDark={isDark}
                />
              </div>
              <div className={`sticky top-24 rounded-3xl border p-6 md:p-8 shadow-sm ${isDark ? 'border-zinc-800 bg-zinc-900/50' : 'border-slate-200 bg-white'}`}>
                <h2 className={`mb-6 text-xl font-black tracking-tight ${isDark ? 'text-white' : 'text-slate-900'}`}>Fare Summary</h2>

                <div className="space-y-4 text-sm mb-6">
                  <div className="flex items-start justify-between gap-4">
                    <span className={`font-medium ${isDark ? 'text-zinc-400' : 'text-slate-500'}`}>Pickup</span>
                    <span className={`text-right font-semibold leading-snug ${isDark ? 'text-white' : 'text-slate-900'}`}>
                      {pickupLocation ? (
                        <span className="line-clamp-2" title={pickupLocation}>{pickupLocation}</span>
                      ) : (
                        <span className="text-slate-400 italic font-normal">Not selected</span>
                      )}
                    </span>
                  </div>
                  <div className="flex items-start justify-between gap-4">
                    <span className={`font-medium ${isDark ? 'text-zinc-400' : 'text-slate-500'}`}>Drop</span>
                    <span className={`text-right font-semibold leading-snug ${isDark ? 'text-white' : 'text-slate-900'}`}>
                      {dropLocation ? (
                        <span className="line-clamp-2" title={dropLocation}>{dropLocation}</span>
                      ) : (
                        <span className="text-slate-400 italic font-normal">Not selected</span>
                      )}
                    </span>
                  </div>
                  <div className="flex items-center justify-between pt-2">
                    <span className={`font-medium ${isDark ? 'text-zinc-400' : 'text-slate-500'}`}>Est. Distance</span>
                    <span className={`font-bold px-2 py-1 rounded-md ${isDark ? 'bg-zinc-800 text-white' : 'bg-slate-100 text-slate-900'}`}>
                      {distanceLoading ? (
                        <span className="flex items-center gap-2">
                          <Loader2 className="h-3 w-3 animate-spin text-emerald-500" />
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
                  {bookingLoading ? 'Processing...' : (!calculatedDistance && displayDistance <= 0) ? 'Enter locations to book' : 'Book Ride Now'}
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