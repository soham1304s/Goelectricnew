import { useMemo, useState, useEffect } from 'react';
import { Calendar, CarTaxiFront, Clock3, Loader2, MapPin, Navigation, Zap, CheckCircle2, AlertCircle, Locate } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext.jsx';
import { useTheme } from '../context/ThemeContext.jsx';
import LocationPickerComponent from '../components/LocationPickerComponent.jsx';
import { bookingService } from '../services/bookingService.js';
import { estimateDistance } from '../services/locationService.js';
import { fetchCarRates } from '../services/rateService.js';
import { ridePaymentService } from '../services/ridePaymentService.js';

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
        setPickupCoordinates(null);
        setDropCoordinates(null);
        return;
      }

      try {
        setDistanceLoading(true);

        // Use backend API for accurate distance calculation
        const result = await estimateDistance(pickupLocation.trim(), dropLocation.trim());
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

  const detectDropLocation = () => {
    if (!navigator.geolocation) {
      setBookingError("Geolocation is not supported by your browser");
      return;
    }

    setIsDetectingDrop(true);
    navigator.geolocation.getCurrentPosition(
      async (position) => {
        const { latitude, longitude } = position.coords;
        try {
          const { getReverseGeocodedAddress } = await import('../services/googleMapsService.js');
          const address = await getReverseGeocodedAddress(latitude, longitude);
          setDropLocation(address);
          setDropCoordinates({
            latitude: latitude,
            longitude: longitude,
          });
        } catch (error) {
          console.error('Location detection error:', error);
          setDropLocation(`${latitude.toFixed(4)}, ${longitude.toFixed(4)}`);
          setDropCoordinates({
            latitude: latitude,
            longitude: longitude,
          });
        } finally {
          setIsDetectingDrop(false);
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
        setIsDetectingDrop(false);
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

      if (!calculatedDistance || calculatedDistance === 0) {
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
      const paymentOrderResponse = await ridePaymentService.createRidePaymentOrder({
        bookingId: booking._id || booking.bookingId,
        amount: advancePayment, // 20% of total
        rideType: 'local',
        pickupLocation: pickupLocation,
        dropLocation: dropLocation,
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
    <div className={`min-h-screen font-['Poppins'] transition-colors duration-300 ${isDark ? 'bg-gradient-to-b from-black via-[#05120a] to-black' : 'bg-gradient-to-br from-pink-50 via-rose-50 to-red-50'}`}>
      <div className="container mx-auto px-4 py-8 md:py-12">
        <div className="mx-auto max-w-5xl">
          <div className="mb-6 flex flex-wrap items-center justify-between gap-4">
            <div>
           
              <h1 className={`text-2xl font-bold md:text-4xl ${isDark ? 'text-white' : 'text-slate-900'}`}>Local Ride Booking</h1>
              <p className={`mt-2 text-sm md:text-base ${isDark ? 'text-gray-300' : 'text-slate-600'}`}>
                Quick and convenient rides within your city.
              </p>
            </div>
          </div>

          <div className="grid gap-6 lg:grid-cols-3">
            <div className={`rounded-3xl p-6 shadow-2xl lg:col-span-2 ${isDark ? 'border border-gray-800 bg-gray-900/90' : 'border border-pink-100 bg-white/95'}`}>
              {bookingError && (
                <div className="mb-6 rounded-xl border border-red-400/50 bg-red-500/10 p-4 text-red-500">
                  <p className="text-sm font-medium">{bookingError}</p>
                </div>
              )}

              <div className="mb-5">
                <label className={`mb-2 block text-sm font-semibold ${isDark ? 'text-gray-100' : 'text-slate-900'}`}>Pickup Location</label>
                <div className="flex gap-2 items-end">
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
                      placeholder="Enter pickup location"
                      showMap={false}
                    />
                  </div>
                  <button
                    type="button"
                    onClick={detectPickupLocation}
                    disabled={isDetectingPickup}
                    className={`rounded-xl p-3 transition-all ${isDetectingPickup ? 'bg-gray-400 cursor-not-allowed' : isDark ? 'bg-gray-700 hover:bg-gray-600 text-white' : 'bg-slate-200 hover:bg-slate-300 text-slate-900'}`}
                    title="Detect current location"
                  >
                    {isDetectingPickup ? (
                      <Loader2 className="h-5 w-5 animate-spin" />
                    ) : (
                      <Locate className="h-5 w-5" />
                    )}
                  </button>
                </div>
              </div>

              <div className="mb-5">
                <label className={`mb-2 block text-sm font-semibold ${isDark ? 'text-gray-100' : 'text-slate-900'}`}>Drop Location</label>
                <div className="flex gap-2 items-end">
                  <div className="flex-1">
                    <LocationPickerComponent
                      value={dropLocation}
                      onChange={(value) => setDropLocation(value)}
                      onSelectLocation={(location) => {
                        if (location && (location.lat || location.latitude)) {
                          setDropCoordinates({
                            lat: location.lat || location.latitude,
                            lng: location.lng || location.longitude,
                          });
                        }
                      }}
                      placeholder="Enter drop location"
                      showMap={false}
                    />
                  </div>
                  <button
                    type="button"
                    onClick={detectDropLocation}
                    disabled={isDetectingDrop}
                    className={`rounded-xl p-3 transition-all ${isDetectingDrop ? 'bg-gray-400 cursor-not-allowed' : isDark ? 'bg-gray-700 hover:bg-gray-600 text-white' : 'bg-slate-200 hover:bg-slate-300 text-slate-900'}`}
                    title="Detect current location"
                  >
                    {isDetectingDrop ? (
                      <Loader2 className="h-5 w-5 animate-spin" />
                    ) : (
                      <Locate className="h-5 w-5" />
                    )}
                  </button>
                </div>
              </div>

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
                      className={`w-full rounded-xl border py-3 pl-12 pr-4 focus:outline-none focus:ring-2 focus:ring-pink-500 ${isDark ? 'border-gray-700 bg-black/40 text-white' : 'border-slate-200 bg-white text-slate-900'}`}
                    />
                  </div>
                </div>
                <div>
                  <label className={`mb-2 block text-sm font-semibold ${isDark ? 'text-gray-100' : 'text-slate-900'}`}>Pickup Time</label>
                  <div className="relative">
                    <Clock3 className={`pointer-events-none absolute left-4 top-1/2 h-5 w-5 -translate-y-1/2 ${isDark ? 'text-gray-400' : 'text-slate-500'}`} />
                    <input
                      type="time"
                      value={selectedTime}
                      min={minTime}
                      onChange={(e) => setSelectedTime(e.target.value)}
                      className={`w-full rounded-xl border py-3 pl-12 pr-4 focus:outline-none focus:ring-2 focus:ring-pink-500 ${isDark ? 'border-gray-700 bg-black/40 text-white' : 'border-slate-200 bg-white text-slate-900'}`}
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
                      className={`rounded-2xl border p-4 text-left transition-all ${selectedCar === car.id ? 'border-pink-500 bg-pink-500/10' : isDark ? 'border-gray-700 bg-black/20 hover:border-pink-500/50' : 'border-slate-200 bg-white hover:border-pink-400'}`}
                    >
                      <div className="mb-3 flex items-center justify-between">
                        <CarTaxiFront className={`h-6 w-6 ${selectedCar === car.id ? 'text-pink-500' : isDark ? 'text-gray-400' : 'text-slate-500'}`} />
                        <span className={`rounded-full px-2 py-1 text-xs font-semibold ${selectedCar === car.id ? 'bg-pink-500 text-white' : isDark ? 'bg-gray-700 text-gray-200' : 'bg-slate-100 text-slate-700'}`}>
                          {car.passengers} seats
                        </span>
                      </div>
                      <p className={`font-semibold ${isDark ? 'text-white' : 'text-slate-900'}`}>{car.name}</p>
                      <p className="mt-2 text-lg font-bold text-pink-500">₹{Math.round(car.additionalCharge * estimatedDistance).toLocaleString('en-IN')}</p>
                    </button>
                  ))}
                </div>
              </div>
            </div>

            <div className="lg:sticky lg:top-24 lg:self-start">
              <div className={`rounded-3xl border p-6 shadow-2xl ${isDark ? 'border-gray-800 bg-gray-900/90' : 'border-pink-100 bg-white/95'}`}>
                <h2 className={`mb-4 text-lg font-bold ${isDark ? 'text-white' : 'text-slate-900'}`}>Fare Summary</h2>

                <div className="space-y-3 text-sm">
                  <div className="flex items-center justify-between">
                    <span className={isDark ? 'text-gray-400' : 'text-slate-600'}>Pickup</span>
                    <span className={`max-w-[170px] truncate text-right font-medium ${isDark ? 'text-white' : 'text-slate-900'}`}>{pickupLocation || 'Not selected'}</span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className={isDark ? 'text-gray-400' : 'text-slate-600'}>Drop</span>
                    <span className={`max-w-[170px] truncate text-right font-medium ${isDark ? 'text-white' : 'text-slate-900'}`}>
                      {dropLocation || 'Not selected'}
                    </span>
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

                </div>

                <div className={`my-4 h-px ${isDark ? 'bg-gray-700' : 'bg-slate-200'}`} />

                <div className="space-y-2 mb-4">
                  <div className="flex items-center justify-between">
                    <span className={`font-semibold ${isDark ? 'text-white' : 'text-slate-900'}`}>Total Fare</span>
                    <span className="text-lg font-bold text-pink-500">{formatMoney(totalAmount)}</span>
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
                  disabled={bookingLoading || distanceLoading || !calculatedDistance}
                  className={`w-full rounded-xl py-4 font-semibold transition-all ${bookingLoading || distanceLoading || !calculatedDistance ? 'cursor-not-allowed bg-gray-400 text-gray-200' : 'bg-pink-500 text-white hover:bg-pink-400'}`}
                >
                  <span className="inline-flex items-center gap-2">
                    {(bookingLoading || distanceLoading) && <Loader2 className="h-5 w-5 animate-spin" />}
                    {bookingLoading ? 'Processing...' : distanceLoading ? 'Calculating fare...' : !calculatedDistance ? 'Enter locations to book' : 'Book Now'}
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