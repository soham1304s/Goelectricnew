import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { X, Calendar, Clock, MapPin, AlertCircle, CheckCircle, Info, Loader2 } from 'lucide-react';
import { useAuth } from '../context/AuthContext.jsx';
import { bookingService } from '../services/bookingService.js';
import { ridePaymentService } from '../services/ridePaymentService.js';
import googleMapsService from '../services/googleMapsService.js';
import bookingValidator from '../utils/bookingValidator.js';

/**
 * RideBookingModal - NEW VERSION (No Payment at Booking)
 * 
 * Flow:
 * 1. User enters all details
 * 2. System shows ESTIMATED fare (NOT charged)
 * 3. User confirms booking
 * 4. Booking created with paymentStatus: "pending"
 * 5. Payment collected AFTER ride completion
 */
export default function RideBookingModal({
  isOpen,
  onClose,
  rideType,
  pickupLocation,
  pickupCoordinates,
  destination,
  destinationCoordinates,
  distance,
  duration,
  bookingDate,
  bookingTime,
  carTypes = [],
}) {
  const navigate = useNavigate();
  const { isAuthenticated, user } = useAuth();
  const [selectedCar, setSelectedCar] = useState('economy');
  const [selectedTime, setSelectedTime] = useState(bookingTime || '');
  const [selectedDate, setSelectedDate] = useState(bookingDate || '');
  const [passengers, setPassengers] = useState(4);

  // Distance & Validation State
  const [calculatedDistance, setCalculatedDistance] = useState(distance || 0);
  const [calculatedDuration, setCalculatedDuration] = useState(duration || 0);
  const [isCalculatingDistance, setIsCalculatingDistance] = useState(false);
  const [distanceError, setDistanceError] = useState('');
  const [validationStatus, setValidationStatus] = useState(null);

  // Submission State
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState('');
  const [estimatedFare, setEstimatedFare] = useState(0);

  useEffect(() => {
    if (isOpen) {
      validateAndCalculateDistance();
    }
  }, [isOpen, pickupLocation, destination, pickupCoordinates, destinationCoordinates]);

  // Auto-update selected car when carTypes loads
  useEffect(() => {
    if (carTypes.length > 0) {
      // Check if currently selected car exists in carTypes
      const carExists = carTypes.some((car) => car.id === selectedCar);
      // If not, default to first available car
      if (!carExists) {
        setSelectedCar(carTypes[0].id);
      }
    }
  }, [carTypes]);

  // Auto-retry distance calculation if it fails
  useEffect(() => {
    if (distanceError && !isCalculatingDistance && calculatedDistance === 0) {
      const retryTimer = setTimeout(() => {
        console.log('🔄 Auto-retrying distance calculation...');
        calculateDistanceViaGoogleMaps();
      }, 3000);

      return () => clearTimeout(retryTimer);
    }
  }, [distanceError, isCalculatingDistance, calculatedDistance]);

  const validateAndCalculateDistance = async () => {
    if (calculatedDistance === 0 && pickupLocation && destination) {
      console.log('🔄 Auto-calculating distance...');
      await calculateDistanceViaGoogleMaps();
      return;
    }

    const bookingData = {
      pickupLocation,
      pickupCoordinates,
      dropLocation: destination,
      dropCoordinates: destinationCoordinates,
      distance: calculatedDistance,
      duration: calculatedDuration,
      cabType: selectedCar,
      selectedDate,
      selectedTime,
    };

    const validation = bookingValidator.validateBooking(bookingData);
    setValidationStatus(validation);
  };

  const calculateDistanceViaGoogleMaps = async () => {
    if (!pickupLocation || !destination) {
      setDistanceError('Locations are required');
      return;
    }

    setIsCalculatingDistance(true);
    setDistanceError('');

    try {
      const result = await googleMapsService.estimateDistance(
        pickupLocation,
        destination,
        pickupCoordinates
      );

      setCalculatedDistance(result.distance);
      setCalculatedDuration(result.duration);
      setDistanceError('');

      // Calculate estimated fare
      const selectedCarData = carTypes.find((car) => car.id === selectedCar);
      if (selectedCarData && result.distance > 0) {
        const fare = selectedCarData.additionalCharge * result.distance;
        setEstimatedFare(fare);
      }
    } catch (err) {
      console.error('❌ Distance calculation failed:', err.message);
      setDistanceError('Unable to calculate distance. Retrying...');
    } finally {
      setIsCalculatingDistance(false);
    }
  };

  const handleCreateBooking = async () => {
    if (!isAuthenticated) {
      onClose();
      navigate('/login', { state: { from: '/', message: 'Please login to book a ride' } });
      return;
    }

    // Validate before submission
    const bookingData = {
      pickupLocation,
      pickupCoordinates,
      dropLocation: destination,
      dropCoordinates: destinationCoordinates,
      distance: calculatedDistance,
      duration: calculatedDuration,
      cabType: selectedCar,
      selectedDate,
      selectedTime,
    };

    const validation = bookingValidator.validateBooking(bookingData);

    if (!validation.isComplete) {
      const errorMsg = validation.errors.join('\n');
      setError(`⚠️ ${errorMsg}`);
      return;
    }

    if (calculatedDistance === 0) {
      setError('❌ Distance is 0 km. Please check locations.');
      return;
    }

    setError('');
    setSubmitting(true);

    try {
      const frozenDistance = calculatedDistance;
      const frozenDuration = calculatedDuration;
      const frozenPickupCoords = pickupCoordinates;
      const frozenDropCoords = destinationCoordinates;

      // Parse date
      const [year, month, day] = selectedDate.split('-');
      const [hours, mins] = selectedTime.split(':');
      const scheduledDateTime = new Date(year, month - 1, day, hours, mins);

      // Create booking payload - NO payment info
      const normalizeRideType = (type) => {
        if (!type) return 'local';
        return type.toLowerCase().replace(/\s+ride$/i, '').trim();
      };

      const bookingPayload = {
        pickupLocation: {
          address: pickupLocation.trim(),
          ...(frozenPickupCoords && {
            coordinates: {
              latitude: frozenPickupCoords?.lat ?? frozenPickupCoords?.latitude,
              longitude: frozenPickupCoords?.lng ?? frozenPickupCoords?.longitude,
            },
          }),
        },
        dropLocation: {
          address: destination.trim(),
          ...(frozenDropCoords && {
            coordinates: {
              latitude: frozenDropCoords?.lat ?? frozenDropCoords?.latitude,
              longitude: frozenDropCoords?.lng ?? frozenDropCoords?.longitude,
            },
          }),
        },
        cabType: selectedCar,
        rideType: normalizeRideType(rideType), // ✅ FIXED: Normalize to lowercase enum value
        scheduledDate: scheduledDateTime.toISOString(),
        scheduledTime: selectedTime,
        distance: frozenDistance,
        duration: frozenDuration,
        passengerDetails: {
          count: passengers,
        },
      };

      console.log('📤 Creating booking (NO PAYMENT AT THIS STAGE):', bookingPayload);

      // Create booking
      const bookingRes = await bookingService.createBooking(bookingPayload);

      if (bookingRes?.success && bookingRes?.data) {
        const booking = bookingRes.data;
        console.log('✅ Booking created successfully!', booking);

        // Calculate 20% advance payment
        const totalFare = estimatedFare || 0;
        const advancePayment = Math.round(totalFare * 0.2);
        const remainingAmount = totalFare - advancePayment;

        // Safety check for payment amount
        if (!advancePayment || advancePayment <= 0) {
          setError('Fare could not be calculated. Please check your car selection and locations.');
          setSubmitting(false);
          return;
        }

        console.log('💰 Payment Details:', { totalFare, advancePayment, remainingAmount });

        // Create payment order for 20% advance
        const paymentOrderRes = await ridePaymentService.createRidePaymentOrder({
          bookingId: booking._id || booking.bookingId,
          amount: advancePayment,
          rideType: normalizeRideType(rideType),
          pickupLocation: pickupLocation.trim(),
          dropLocation: destination.trim(),
        });

        if (!paymentOrderRes?.success) {
          setError('Failed to create payment order');
          setSubmitting(false);
          return;
        }

        console.log('💳 Payment order created:', paymentOrderRes.data);

        // Initiate Razorpay payment
        await ridePaymentService.initiateRazorpayPayment(
          paymentOrderRes.data,
          {
            name: user?.name || 'Guest',
            email: user?.email || '',
            phone: user?.phone || '',
          },
          { rideType: normalizeRideType(rideType) },
          async (paymentData) => {
            // Payment success callback
            try {
              console.log('✅ Payment successful, verifying...', paymentData);
              const verifyRes = await ridePaymentService.verifyRidePayment(paymentData);

              if (verifyRes?.success) {
                console.log('✅ Payment verified successfully!');
                setSubmitting(false);
                onClose();

                navigate('/booking-confirmation', {
                  state: {
                    bookingId: booking._id || booking.bookingId,
                    booking: booking,
                    paymentVerified: true,
                    advancePaymentDone: true,
                    advanceAmount: advancePayment,
                    remainingAmount: remainingAmount,
                    totalFare: totalFare,
                    message: `✅ Ride booked! 20% advance (₹${advancePayment.toLocaleString('en-IN')}) paid. Balance ₹${remainingAmount.toLocaleString('en-IN')} due after ride.`,
                  },
                });
              } else {
                setError('Payment verification failed');
                setSubmitting(false);
              }
            } catch (err) {
              console.error('❌ Payment verification error:', err);
              setError('Payment verification failed: ' + err.message);
              setSubmitting(false);
            }
          },
          (error) => {
            // Payment failure callback
            console.error('❌ Payment failed:', error);
            setError('Payment failed: ' + error);
            setSubmitting(false);
          }
        );
      } else {
        setError(bookingRes?.message || 'Booking failed');
        setSubmitting(false);
      }
    } catch (err) {
      console.error('❌ Error creating booking:', err);
      const errorMessage = err.response?.data?.message || err.message || 'Failed to create booking';
      setError(errorMessage);
      setSubmitting(false);
    }
  };

  if (!isOpen) return null;

  const selectedCarData = carTypes.find((car) => car.id === selectedCar);
  const isReadyForBooking = calculatedDistance > 0 && calculatedDuration > 0;

  return (
    <div className="fixed inset-0 bg-black/40 backdrop-blur-md z-50 flex items-center justify-center p-4 overflow-y-auto">
      <div className="bg-white rounded-2xl max-w-2xl w-full my-8 relative max-h-[90vh] overflow-y-auto dark:bg-gray-800">
        {/* Header */}
        <div className="sticky top-0 bg-white dark:bg-gray-800 border-b border-gray-200 dark:border-gray-700 p-6 flex justify-between items-start rounded-t-2xl z-10">
          <div>
            <h2 className="text-2xl font-semibold text-gray-900 dark:text-white">
              Book Your {rideType === 'intercity' ? 'Intercity' : rideType} Ride
            </h2>
            <p className="text-gray-600 dark:text-gray-400 mt-1">
              Pay 20% advance now, balance after ride completion.
            </p>
          </div>
          <button
            onClick={onClose}
            className="text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white transition-colors"
          >
            <X className="w-6 h-6" />
          </button>
        </div>

        {/* Content */}
        <div className="p-6 space-y-6">
          {/* Route Summary */}
          <div className="bg-gradient-to-r from-blue-50 to-emerald-50 dark:from-gray-700 dark:to-gray-600 rounded-lg p-4 space-y-3">
            <div className="flex gap-3">
              <MapPin className="w-5 h-5 text-blue-600 dark:text-blue-400 flex-shrink-0 mt-0.5" />
              <div className="flex-1">
                <p className="text-sm text-gray-600 dark:text-gray-400">Pickup</p>
                <p className="font-semibold text-gray-900 dark:text-white">{pickupLocation}</p>
              </div>
            </div>
            <div className="flex gap-3">
              <MapPin className="w-5 h-5 text-emerald-600 dark:text-emerald-400 flex-shrink-0 mt-0.5" />
              <div className="flex-1">
                <p className="text-sm text-gray-600 dark:text-gray-400">Destination</p>
                <p className="font-semibold text-gray-900 dark:text-white">{destination}</p>
              </div>
            </div>
          </div>

          {/* Error Messages */}
          {error && (
            <div className="bg-red-50 dark:bg-red-900/30 border border-red-300 dark:border-red-700 rounded-lg p-4">
              <div className="flex gap-3">
                <AlertCircle className="w-5 h-5 text-red-600 dark:text-red-400 flex-shrink-0 mt-0.5" />
                <p className="text-sm text-red-600 dark:text-red-400">{error}</p>
              </div>
            </div>
          )}

          {/* Distance & Duration Calculation Status */}
          <div className="grid grid-cols-2 gap-4">
            <div className={`rounded-lg p-4 border-2 transition-all ${calculatedDistance > 0
              ? 'bg-green-50 dark:bg-green-900/30 border-green-300 dark:border-green-700'
              : 'bg-blue-50 dark:bg-blue-900/30 border-blue-300 dark:border-blue-700'
              }`}>
              <div className="flex items-start justify-between">
                <div>
                  <p className="text-xs text-gray-600 dark:text-gray-400 mb-2">Distance</p>
                  <p className="text-2xl font-bold text-gray-900 dark:text-white">
                    {calculatedDistance > 0 ? calculatedDistance.toFixed(1) : '...'} km
                  </p>
                </div>
                {calculatedDistance > 0 && (
                  <CheckCircle className="w-5 h-5 text-green-600 dark:text-green-400 flex-shrink-0" />
                )}
              </div>
            </div>

            <div className={`rounded-lg p-4 border-2 transition-all ${calculatedDuration > 0
              ? 'bg-green-50 dark:bg-green-900/30 border-green-300 dark:border-green-700'
              : 'bg-blue-50 dark:bg-blue-900/30 border-blue-300 dark:border-blue-700'
              }`}>
              <div className="flex items-start justify-between">
                <div>
                  <p className="text-xs text-gray-600 dark:text-gray-400 mb-2">Duration</p>
                  <p className="text-2xl font-bold text-gray-900 dark:text-white">
                    {calculatedDuration > 0 ? Math.ceil(calculatedDuration) : '...'} min
                  </p>
                </div>
                {calculatedDuration > 0 && (
                  <CheckCircle className="w-5 h-5 text-green-600 dark:text-green-400 flex-shrink-0" />
                )}
              </div>
            </div>
          </div>

          {/* Car Type Selection */}
          <div>
            <label className="block text-sm font-semibold text-gray-900 dark:text-white mb-3">
              Select Car Type
            </label>
            {carTypes && carTypes.length > 0 ? (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                {carTypes.map((car) => {
                  const totalFare = calculatedDistance > 0 ? Number(car.additionalCharge) * calculatedDistance : 0;
                  return (
                    <button
                      key={car.id}
                      onClick={() => setSelectedCar(car.id)}
                      className={`p-4 rounded-lg border-2 text-left transition-all ${selectedCar === car.id
                        ? 'bg-green-50 dark:bg-green-900/30 border-green-500 dark:border-green-400'
                        : 'bg-white dark:bg-gray-700 border-gray-200 dark:border-gray-600 hover:border-green-500'
                        }`}
                    >
                      <div className="font-semibold text-gray-900 dark:text-white">{car.name}</div>
                      <div className="text-sm text-gray-600 dark:text-gray-400 mt-2">
                        {calculatedDistance > 0 ? `₹${totalFare.toFixed(0)}` : 'N/A'}
                      </div>
                    </button>
                  );
                })}
              </div>
            ) : (
              <div className="bg-blue-50 dark:bg-blue-900/30 border border-blue-200 dark:border-blue-700 rounded-lg p-4">
                <p className="text-sm text-blue-800 dark:text-blue-400">
                  ⏳ Loading car types... Please wait.
                </p>
              </div>
            )}
          </div>

          {/* Date & Time Selection */}
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-semibold text-gray-900 dark:text-white mb-2">
                Booking Date
              </label>
              <div className="relative">
                <Calendar className="absolute left-3 top-3 w-5 h-5 text-gray-400 pointer-events-none" />
                <input
                  type="date"
                  value={selectedDate}
                  onChange={(e) => setSelectedDate(e.target.value)}
                  className="w-full pl-12 pr-4 py-3 border border-gray-200 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                />
              </div>
            </div>

            <div>
              <label className="block text-sm font-semibold text-gray-900 dark:text-white mb-2">
                Booking Time
              </label>
              <div className="relative">
                <Clock className="absolute left-3 top-3 w-5 h-5 text-gray-400 pointer-events-none" />
                <input
                  type="time"
                  value={selectedTime}
                  onChange={(e) => setSelectedTime(e.target.value)}
                  className="w-full pl-12 pr-4 py-3 border border-gray-200 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                />
              </div>
            </div>
          </div>

          {/* Estimated Fare with 20% Advance Payment Breakdown */}
          <div className="bg-emerald-50 dark:bg-emerald-900/30 border border-emerald-200 dark:border-emerald-700 rounded-lg p-4">
            <div className="flex gap-3 mb-3">
              <Info className="w-5 h-5 text-emerald-600 dark:text-emerald-400 flex-shrink-0 mt-0.5" />
              <div>
                <p className="font-semibold text-emerald-900 dark:text-emerald-300">Fare Breakdown</p>
                <p className="text-sm text-emerald-800 dark:text-emerald-400 mt-1">
                  Pay 20% advance now, balance after ride completion.
                </p>
              </div>
            </div>

            <div className="bg-white dark:bg-gray-800 rounded-lg p-4 space-y-3">
              <div className="flex justify-between">
                <span className="text-gray-600 dark:text-gray-400">Distance</span>
                <span className="text-gray-900 dark:text-white font-medium">
                  {calculatedDistance > 0 ? `${calculatedDistance.toFixed(1)} km` : 'N/A'}
                </span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-600 dark:text-gray-400">Car Type</span>
                <span className="text-gray-900 dark:text-white font-medium">
                  {selectedCarData?.name || 'Loading...'}
                </span>
              </div>
              <div className="border-t border-gray-200 dark:border-gray-700 pt-3 space-y-2">
                <div className="flex justify-between items-center">
                  <span className="font-semibold text-gray-900 dark:text-white">Total Fare</span>
                  <span className="text-xl font-bold text-orange-600 dark:text-orange-400">
                    {calculatedDistance > 0 && selectedCarData ? `₹${(Number(selectedCarData.additionalCharge) * calculatedDistance).toFixed(0)}` : 'N/A'}
                  </span>
                </div>
                <div className="flex justify-between items-center bg-green-50/50 dark:bg-green-900/20 p-2 rounded">
                  <span className="font-semibold text-green-700 dark:text-green-300">20% Advance (Pay Now)</span>
                  <span className="text-lg font-bold text-green-600 dark:text-green-400">
                    {calculatedDistance > 0 && selectedCarData ? `₹${Math.round(Number(selectedCarData.additionalCharge) * calculatedDistance * 0.2)}` : 'N/A'}
                  </span>
                </div>
                <div className="flex justify-between items-center text-gray-600 dark:text-gray-400">
                  <span className="text-sm">Balance Due After Ride</span>
                  <span className="text-sm font-semibold text-gray-900 dark:text-gray-100">
                    {calculatedDistance > 0 && selectedCarData ? `₹${Math.round(Number(selectedCarData.additionalCharge) * calculatedDistance * 0.8)}` : 'N/A'}
                  </span>
                </div>
              </div>
            </div>
          </div>



          {/* Action Buttons */}
          <div className="flex gap-3 pt-4">
            <button
              onClick={onClose}
              className="flex-1 px-6 py-3 border border-gray-300 dark:border-gray-600 text-gray-900 dark:text-white rounded-lg hover:bg-gray-50 dark:hover:bg-gray-700 transition font-semibold"
            >
              Cancel
            </button>
            <button
              onClick={handleCreateBooking}
              disabled={submitting || !isReadyForBooking}
              className="flex-1 px-6 py-3 bg-emerald-600 hover:bg-emerald-700 disabled:bg-gray-400 text-white rounded-lg transition font-semibold flex items-center justify-center gap-2"
            >
              {submitting ? (
                <><Loader2 className="w-4 h-4 animate-spin" /> Processing...</>
              ) : (
                '✓ Pay 20% Advance'
              )}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
