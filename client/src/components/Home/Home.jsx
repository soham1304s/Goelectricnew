import React, { useState, useEffect, useMemo, useRef } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import {
  Home,
  MapPin,
  Briefcase,
  Calendar,
  Clock,
  ChevronRight,
  Star,
  Zap,
  Leaf,
  Wallet,
  UserCheck,
  Check,
  Facebook,
  Twitter,
  Instagram,
  Plane,
  Moon,
  Sun,
  User,
  Loader,
  Locate,
  X,
  MessageSquare,
  Building,
  Navigation,
  Landmark,
  Car,
  Users,
  Sparkles,
  FileText,
  Map,
  XCircle,
  CheckCircle,
} from "lucide-react"; import { useTheme } from "../../context/ThemeContext.jsx";
import { useAuth } from "../../context/AuthContext.jsx";
import { getPackages } from "../../services/packageService.js";
import { getAllFeedback } from "../../services/feedbackService.js";
import { fetchCarRates } from "../../services/rateService.js";
import { bookingService } from "../../services/bookingService.js";
import { ridePaymentService } from "../../services/ridePaymentService.js";
import TourBookingModal from "../TourBookingModal.jsx";
import RideBookingModal from "../RideBookingModal_NEW.jsx";
import LocationPickerComponent from "../LocationPickerComponent.jsx";
import Footer from "../Footer.jsx";
import { estimateDistance, formatDistance, formatDuration, calculateFare } from "../../services/googleMapsService.js";
import OfferBanner from "../OfferBanner.jsx";
import MacBookShowcase from "./MacBookShowcase.jsx";
import SEO from "../SEO.jsx";


const DEFAULT_AVATAR = '/review/image.png';

const ReviewAvatar = ({ profileImage, name, darkMode }) => {
  const [imageError, setImageError] = useState(false);
  const [showDefault, setShowDefault] = useState(!profileImage);

  return (
    <div className="flex-shrink-0">
      {!showDefault && profileImage ? (
        <img
          src={profileImage}
          alt={name}
          className="w-12 h-12 rounded-full object-cover border-2 border-emerald-200 dark:border-emerald-400/30"
          onError={() => {
            setShowDefault(true);
            setImageError(true);
          }}
        />
      ) : (
        <div className="w-12 h-12 rounded-full bg-gradient-to-br from-emerald-400 to-teal-600 flex items-center justify-center border-2 border-emerald-200 dark:border-emerald-400/30 overflow-hidden">
          <img
            src={DEFAULT_AVATAR}
            alt="default"
            className="w-full h-full object-cover"
            onError={(e) => {
              e.target.style.display = 'none';
              e.target.parentElement.innerHTML = '<User size={16} className="text-white" />';
            }}
          />
        </div>
      )}
    </div>
  );
};

const GoelectriqLanding = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const { theme, toggleTheme } = useTheme();
  const { user } = useAuth();
  const darkMode = theme === "dark";

  const locationSearchOptions = useMemo(
    () => ({
      locationBias: { lat: 26.9124, lng: 75.7873 },
      radius: 50000,
      components: "country:in",
      language: "en",
    }),
    [],
  );

  const [templateTours, setTemplateTours] = useState([]);
  const [travelTours, setTravelTours] = useState([]);
  const [reviews, setReviews] = useState([]);
  const [loadingTours, setLoadingTours] = useState(true);
  const [loadingTravelTours, setLoadingTravelTours] = useState(true);
  const [loadingReviews, setLoadingReviews] = useState(true);
  const [toursError, setToursError] = useState(null);
  const [travelToursError, setTravelToursError] = useState(null);
  const [reviewsError, setReviewsError] = useState(null);
  const [templeMobileIndex, setTempleMobileIndex] = useState(0);
  const [travelMobileIndex, setTravelMobileIndex] = useState(0);

  // Booking Form State
  const [rideType, setRideType] = useState("Local Ride");
  const [airportRideType, setAirportRideType] = useState("pickup"); // For airport: pickup or drop
  const [pickupLocation, setPickupLocation] = useState("");
  const [destination, setDestination] = useState("");
  const [bookingDate, setBookingDate] = useState("");
  const [bookingTime, setBookingTime] = useState("");
  const [isSearching, setIsSearching] = useState(false);
  const [isDetectingLocation, setIsDetectingLocation] = useState(false);
  const [isDetectingDestination, setIsDetectingDestination] = useState(false);

  // Airport Booking Form State
  const [showAirportForm, setShowAirportForm] = useState(false);
  const [airportLocation, setAirportLocation] = useState("");
  const [airportDate, setAirportDate] = useState("");
  const [airportTime, setAirportTime] = useState("");
  const [selectedCarType, setSelectedCarType] = useState("");
  const [availableCarTypes, setAvailableCarTypes] = useState([]);
  const [carsLoading, setCarsLoading] = useState(false);
  const [airportBookingError, setAirportBookingError] = useState("");
  const [airportPricing, setAirportPricing] = useState({});
  const [airportPaymentLoading, setAirportPaymentLoading] = useState(false);

  // Distance & Fare Calculation State
  const [distance, setDistance] = useState(null);
  const [duration, setDuration] = useState(null);
  const [estimatedFare, setEstimatedFare] = useState(null);
  const [isCalculatingDistance, setIsCalculatingDistance] = useState(false);
  const [distanceError, setDistanceError] = useState(null);

  // Tour Booking Modal State
  const [isTourModalOpen, setIsTourModalOpen] = useState(false);
  const [selectedTour, setSelectedTour] = useState({
    name: "",
    price: 0,
    id: null,
  });
  const [isTourDetailsModalOpen, setIsTourDetailsModalOpen] = useState(false);
  const [selectedTourDetails, setSelectedTourDetails] = useState(null);

  // Ride Booking Modal State
  const [isRideBookingModalOpen, setIsRideBookingModalOpen] = useState(false);
  const [showBookNowPopup, setShowBookNowPopup] = useState(true);

  // Car types and rates from admin
  const [carTypes, setCarTypes] = useState([]);
  const [carTypesLoading, setCarTypesLoading] = useState(true);

  const templeToursSliderRef = useRef(null);
  const travelToursSliderRef = useRef(null);
  const templeTouchStartXRef = useRef(null);
  const travelTouchStartXRef = useRef(null);

  const scrollToSection = (sectionId) => {
    const section = document.getElementById(sectionId);
    if (section) {
      section.scrollIntoView({ behavior: "smooth", block: "start" });
    }
  };

  useEffect(() => {
    const hashSection = location.hash ? location.hash.slice(1) : "";
    const storedSection =
      sessionStorage.getItem("goelectriq-scroll-target") || "";
    const targetSection =
      hashSection || location.state?.scrollTo || storedSection;
    if (!targetSection) {
      return;
    }

    const timer = setTimeout(() => {
      const section = document.getElementById(targetSection);
      if (section) {
        section.scrollIntoView({ behavior: "smooth", block: "start" });
      }

      sessionStorage.removeItem("goelectriq-scroll-target");

      // Clean old state-based navigation while preserving hash-based deep links.
      if (location.state?.scrollTo && !hashSection) {
        navigate(location.pathname, { replace: true, state: {} });
      }
    }, 100);

    return () => clearTimeout(timer);
  }, [location.hash, location.pathname, location.state, navigate]);

  // Handle Book Tour button click
  const handleBookTourClick = (tour) => {
    setSelectedTour({
      name: tour.title,
      price: tour.basePrice || tour.pricing?.premium || 0,
      id: tour._id || tour.id,
      pricing: tour.pricing,
      fullTour: tour,
    });
    setIsTourModalOpen(true);
  };

  const handleTourDetailsClick = (tour) => {
    setSelectedTourDetails(tour);
    setIsTourDetailsModalOpen(true);
  };

  const handleCloseTourDetailsModal = () => {
    setIsTourDetailsModalOpen(false);
    setSelectedTourDetails(null);
  };

  const handleBookFromDetails = () => {
    if (!selectedTourDetails) {
      return;
    }
    handleBookTourClick(selectedTourDetails);
    handleCloseTourDetailsModal();
  };

  // Close tour booking modal
  const handleCloseTourModal = () => {
    setIsTourModalOpen(false);
    setSelectedTour({ name: "", price: 0, id: null });
  };

  // Fetch temple tour packages
  useEffect(() => {
    const fetchTempleTours = async () => {
      try {
        setLoadingTours(true);
        const response = await getPackages("temple_tour");
        if (response.success && response.data) {
          setTemplateTours(response.data);
        }
      } catch (error) {
        console.warn("Temple tours fetch failed:", error.message);
        setToursError(error.message || "Failed to load temple tours");
      } finally {
        setLoadingTours(false);
      }
    };
    fetchTempleTours();
  }, []);

  // Fetch travel tour packages
  useEffect(() => {
    const fetchTravelTours = async () => {
      try {
        setLoadingTravelTours(true);
        const response = await getPackages("travel_tour");
        if (response.success && response.data) {
          setTravelTours(response.data);
        }
      } catch (error) {
        console.warn("Travel tours fetch failed:", error.message);
        setTravelToursError(error.message || "Failed to load travel tours");
      } finally {
        setLoadingTravelTours(false);
      }
    };
    fetchTravelTours();
  }, []);

  // Load car types and airport pricing when airport form is opened
  useEffect(() => {
    if (showAirportForm && availableCarTypes.length === 0) {
      const loadCarTypesAndPricing = async () => {
        try {
          setCarsLoading(true);
          const rates = await fetchCarRates(true);
          if (rates && Array.isArray(rates)) {
            const filteredRates = rates.filter(rate =>
              rate.id === 'premium' || rate.id === 'economy'
            );
            setAvailableCarTypes(
              filteredRates.map((rate) => ({
                id: rate.id,
                name: rate.name,
                baseRate: rate.baseRate,
                passengers: rate.maxPassengers,
              }))
            );

            // Extract airport pricing from filtered car rates
            const pricing = {};
            filteredRates.forEach((rate) => {
              if (rate.airportCharges && rate.airportCharges[airportRideType]) {
                pricing[rate.id] = rate.airportCharges[airportRideType];
              } else {
                // Fallback to legacy format
                pricing[rate.id] = {
                  fixedCharge: rate.fixedCharge || 0,
                  parkingCharge: rate.parkingCharge || 0,
                };
              }
            });

            console.log(`💰 Airport ${airportRideType.toUpperCase()} Pricing Loaded:`, pricing);
            setAirportPricing(pricing);

            if (filteredRates.length > 0) {
              setSelectedCarType(filteredRates[0].id);
            }
          }
        } catch (error) {
          console.error('Error loading car types and pricing:', error);
        } finally {
          setCarsLoading(false);
        }
      };
      loadCarTypesAndPricing();
    }
  }, [showAirportForm, availableCarTypes.length, airportRideType]);
  useEffect(() => {
    const loadCarRates = async () => {
      try {
        setCarTypesLoading(true);
        const rates = await fetchCarRates();
        console.log('📊 Raw rates from API:', rates);

        // Set fallback immediately to ensure cars always show
        const defaultCars = [
          { id: 'economy', name: 'Economy', additionalCharge: 10, passengers: 4 },
          { id: 'premium', name: 'Premium', additionalCharge: 18, passengers: 6 },
        ];

        // If rates is empty or invalid, use defaults
        if (!rates || rates.length === 0) {
          console.log('⚠️ No rates returned from API, using defaults');
          setCarTypes(defaultCars);
          return;
        }

        // Filter OUT mini, sedan, suv, hatchback, luxury - ONLY keep economy and premium
        const filtered = rates.filter(rate => {
          const id = (rate.id || '').toLowerCase();
          const name = (rate.name || '').toLowerCase();

          // Exclude these types
          if (id.includes('mini') || name.includes('mini')) return false;
          if (id.includes('sedan') || name.includes('sedan')) return false;
          if (id.includes('suv') || name.includes('suv')) return false;
          if (id.includes('hatchback') || name.includes('hatchback')) return false;
          if (id.includes('luxury') || name.includes('luxury')) return false;

          // Only include economy and premium
          if (id === 'economy' || name === 'economy') return true;
          if (id === 'premium' || name === 'premium') return true;

          return false;
        });

        console.log('🔍 Filtered rates (removed mini/sedan/suv/hatchback/luxury):', filtered);

        // If filtered returns nothing, use defaults
        if (filtered.length === 0) {
          console.log('⚠️ No economy/premium found after filtering, using defaults');
          setCarTypes(defaultCars);
          return;
        }

        // Try to map rates to car types
        const mappedRates = filtered.map(rate => ({
          id: (rate.id || '').toLowerCase(),
          name: rate.name || rate.id || 'Car',
          additionalCharge: Number(rate.baseRate) || 0,
          passengers: Number(rate.maxPassengers) || 4,
        }));

        console.log('✅ Final mapped rates:', mappedRates);
        setCarTypes(mappedRates);

      } catch (error) {
        console.error('❌ Error loading car rates:', error);
        // Set default car types on error
        setCarTypes([
          { id: 'economy', name: 'Economy', additionalCharge: 10, passengers: 4 },
          { id: 'premium', name: 'Premium', additionalCharge: 18, passengers: 6 },
        ]);
      } finally {
        setCarTypesLoading(false);
      }
    };
    loadCarRates();
  }, []);

  useEffect(() => {
    const slider = templeToursSliderRef.current;
    if (!slider || templateTours.length < 2) {
      return;
    }

    let frameId;
    let lastTimestamp;
    let isPaused = false;
    const speedPxPerSecond = 35;

    const animate = (timestamp) => {
      if (lastTimestamp === undefined) {
        lastTimestamp = timestamp;
      }

      const deltaSeconds = (timestamp - lastTimestamp) / 1000;
      lastTimestamp = timestamp;

      if (window.innerWidth >= 768 && !isPaused) {
        const maxLoopWidth = slider.scrollWidth / 2;
        slider.scrollLeft += speedPxPerSecond * deltaSeconds;

        if (slider.scrollLeft >= maxLoopWidth) {
          slider.scrollLeft -= maxLoopWidth;
        }
      }

      frameId = window.requestAnimationFrame(animate);
    };

    const onMouseEnter = () => {
      isPaused = true;
    };

    const onMouseLeave = () => {
      isPaused = false;
    };

    slider.addEventListener("mouseenter", onMouseEnter);
    slider.addEventListener("mouseleave", onMouseLeave);
    frameId = window.requestAnimationFrame(animate);

    return () => {
      window.cancelAnimationFrame(frameId);
      slider.removeEventListener("mouseenter", onMouseEnter);
      slider.removeEventListener("mouseleave", onMouseLeave);
    };
  }, [templateTours]);

  useEffect(() => {
    if (templateTours.length === 0) {
      setTempleMobileIndex(0);
      return;
    }

    setTempleMobileIndex((prev) =>
      prev >= templateTours.length ? 0 : prev,
    );
  }, [templateTours]);

  useEffect(() => {
    if (templateTours.length < 2 || window.innerWidth >= 768) {
      return;
    }

    const intervalId = setInterval(() => {
      setTempleMobileIndex((prev) => (prev + 1) % templateTours.length);
    }, 3000);

    return () => clearInterval(intervalId);
  }, [templateTours]);

  // Auto-scroll temple tours on desktop
  useEffect(() => {
    const slider = templeToursSliderRef.current;
    if (!slider || templateTours.length < 2) {
      return;
    }

    const autoSlideTempleTours = () => {
      if (window.innerWidth < 768) {
        return;
      }

      const maxLoopWidth = slider.scrollWidth / 2;
      const slideStep = 230;

      if (slider.scrollLeft >= maxLoopWidth - slideStep) {
        slider.scrollTo({ left: 0, behavior: "auto" });
      }

      slider.scrollBy({ left: slideStep, behavior: "smooth" });
    };

    const intervalId = setInterval(autoSlideTempleTours, 4000);

    return () => clearInterval(intervalId);
  }, [templateTours]);

  useEffect(() => {
    const slider = travelToursSliderRef.current;
    if (!slider || travelTours.length < 2) {
      return;
    }

    const autoSlideTravelTours = () => {
      if (window.innerWidth < 768) {
        return;
      }

      const maxLoopWidth = slider.scrollWidth / 2;
      const slideStep = 150;

      if (slider.scrollLeft >= maxLoopWidth - slideStep) {
        slider.scrollTo({ left: 0, behavior: "auto" });
      }

      slider.scrollBy({ left: slideStep, behavior: "smooth" });
    };

    const intervalId = setInterval(autoSlideTravelTours, 5000);

    return () => clearInterval(intervalId);
  }, [travelTours]);

  // Fetch traveler reviews
  useEffect(() => {
    const fetchReviews = async () => {
      try {
        setLoadingReviews(true);
        const response = await getAllFeedback({ page: 1, limit: 3 });
        if (response.success && response.data?.feedback) {
          // Filter feedback that has ratings
          const ratedFeedback = response.data.feedback.filter(
            (fb) => fb.rating,
          );
          setReviews(ratedFeedback.slice(0, 3)); // Limit to 3 reviews
        }
      } catch (error) {
        console.warn("Reviews fetch failed:", error.message);
        setReviewsError(error.message || "Failed to load reviews");
      } finally {
        setLoadingReviews(false);
      }
    };
    fetchReviews();
  }, []);

  // Initialize default date and time
  useEffect(() => {
    const today = new Date().toISOString().split("T")[0];
    const now = new Date().toTimeString().slice(0, 5);
    setBookingDate(today);
    setBookingTime(now);
    setAirportDate(today);
    setAirportTime(now);
  }, []);

  // Calculate distance when pickup or destination changes
  useEffect(() => {
    const calculateDistance = async () => {
      // Skip for airport rides (they use flat rate pricing)
      if (rideType === "Airport") {
        setDistance(null);
        setDuration(null);
        setEstimatedFare(null);
        setDistanceError(null);
        return;
      }

      // Don't calculate if either location is too short
      if (!pickupLocation.trim() || pickupLocation.trim().length < 3) {
        setDistance(null);
        setDuration(null);
        setEstimatedFare(null);
        setDistanceError(null);
        return;
      }

      if (!destination.trim() || destination.trim().length < 3) {
        setDistance(null);
        setDuration(null);
        setEstimatedFare(null);
        setDistanceError(null);
        return;
      }

      try {
        setIsCalculatingDistance(true);
        setDistanceError(null);
        console.log("📏 Calculating distance between:", pickupLocation, "and", destination);

        const result = await estimateDistance(pickupLocation, destination);

        setDistance(result.distance);
        setDuration(result.duration);

        // Calculate fare based on distance and ride type
        // Map display names to fare calculator types
        const getRideTypeForCalculation = (displayType) => {
          const typeMap = {
            "Local Ride": "City",
            "Intercity Ride": "InterCity",
            "Airport": "AirportRide",
            "Temple Tour": "City",
          };
          return typeMap[displayType] || "City";
        };
        const fare = calculateFare(result.distance, getRideTypeForCalculation(rideType));
        setEstimatedFare(fare);

        console.log("✅ Distance calculated successfully:", {
          distance: result.distance,
          duration: result.duration,
          fare: fare.totalFare,
        });
      } catch (error) {
        console.error("❌ Distance calculation failed:", error.message);
        setDistanceError(error.message);
        setDistance(null);
        setDuration(null);
        setEstimatedFare(null);
      } finally {
        setIsCalculatingDistance(false);
      }
    };

    // Debounce the distance calculation
    const debounceTimer = setTimeout(() => {
      calculateDistance();
    }, 800);

    return () => clearTimeout(debounceTimer);
  }, [pickupLocation, destination, rideType]);

  // Handle airport booking and payment
  const handleAirportPayment = async () => {
    try {
      if (!selectedCarType) {
        setAirportBookingError("Please select a vehicle");
        return;
      }

      if (!user) {
        setAirportBookingError("Please login to book a ride");
        navigate("/login");
        return;
      }

      if (!airportDate || !airportTime) {
        setAirportBookingError("Please select both travel date and time");
        return;
      }

      const selectedDateTime = new Date(`${airportDate}T${airportTime}:00`);
      if (Number.isNaN(selectedDateTime.getTime())) {
        setAirportBookingError("Please select a valid date and time");
        return;
      }

      // Allow 10 minutes buffer for booking processing on TODAY's bookings only
      const now = new Date();
      const today = new Date(now.getFullYear(), now.getMonth(), now.getDate());
      const selectedDate = new Date(airportDate);
      const selectedDateNormalized = new Date(selectedDate.getFullYear(), selectedDate.getMonth(), selectedDate.getDate());

      // Only enforce 10-minute minimum if booking is for TODAY
      if (selectedDateNormalized.getTime() === today.getTime()) {
        const minBookingTime = new Date(now.getTime() + 10 * 60000); // 10 minutes from now
        if (selectedDateTime < minBookingTime) {
          const formattedTime = minBookingTime.toLocaleTimeString('en-IN', {
            hour: '2-digit',
            minute: '2-digit',
            hour12: true
          });
          setAirportBookingError(`Please select a time at least 10 minutes from now (minimum ${formattedTime})`);
          return;
        }
      } else if (selectedDateNormalized < today) {
        // Don't allow past dates
        setAirportBookingError("Please select a future date for your booking");
        return;
      }

      setAirportBookingError("");
      setAirportPaymentLoading(true);

      // Calculate total fare
      const carPricing = airportPricing[selectedCarType] || { fixedCharge: 0, parkingCharge: 0 };
      const totalAmount = (carPricing.fixedCharge || 0) + (carPricing.parkingCharge || 0);
      const advancePayment = Math.round(totalAmount * 0.2);
      const remainingAmount = totalAmount - advancePayment;

      // Set pickup and drop locations based on ride type
      const pickupLocationData =
        airportRideType === "pickup"
          ? {
            address: "Jaipur International Airport (JAI)",
            coordinates: { latitude: 26.8283, longitude: 75.8060 },
          }
          : {
            address: airportLocation,
            coordinates: { latitude: 26.9124, longitude: 75.7873 },
          };

      const dropLocationData =
        airportRideType === "pickup"
          ? {
            address: airportLocation,
            coordinates: { latitude: 26.9124, longitude: 75.7873 },
          }
          : {
            address: "Jaipur International Airport (JAI)",
            coordinates: { latitude: 26.8283, longitude: 75.8060 },
          };

      // Calculate distance between coordinates
      let distanceValue = 1;
      if (pickupLocationData.coordinates && dropLocationData.coordinates) {
        try {
          const lat1 = pickupLocationData.coordinates.latitude;
          const lon1 = pickupLocationData.coordinates.longitude;
          const lat2 = dropLocationData.coordinates.latitude;
          const lon2 = dropLocationData.coordinates.longitude;

          const R = 6371;
          const dLat = (lat2 - lat1) * Math.PI / 180;
          const dLon = (lon2 - lon1) * Math.PI / 180;
          const a =
            Math.sin(dLat / 2) * Math.sin(dLat / 2) +
            Math.cos(lat1 * Math.PI / 180) * Math.cos(lat2 * Math.PI / 180) *
            Math.sin(dLon / 2) * Math.sin(dLon / 2);
          const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
          distanceValue = Math.round((R * c) * 10) / 10;
        } catch (error) {
          console.warn('Distance calculation failed:', error);
        }
      }

      // Create booking
      const bookingData = {
        pickupLocation: pickupLocationData,
        dropLocation: dropLocationData,
        scheduledDate: airportDate,
        scheduledTime: airportTime,
        cabType: selectedCarType,
        distance: distanceValue,
        rideType: "airport",
        airportType: airportRideType,
        passengerDetails: {
          name: user.name || "Guest",
          phone: user.phone || "",
          email: user.email || "",
        },
      };

      const bookingResponse = await bookingService.createBooking(bookingData);

      if (!bookingResponse.success || !bookingResponse.data) {
        setAirportBookingError(bookingResponse.message || "Failed to create booking");
        setAirportPaymentLoading(false);
        return;
      }

      const booking = bookingResponse.data;

      // Create payment order
      const paymentOrderResponse = await ridePaymentService.createRidePaymentOrder({
        bookingId: booking._id || booking.bookingId,
        amount: advancePayment,
        rideType: "airport",
        pickupLocation: pickupLocationData.address,
        dropLocation: dropLocationData.address,
      });

      if (!paymentOrderResponse.success) {
        setAirportBookingError("Failed to create payment order");
        setAirportPaymentLoading(false);
        return;
      }

      // Initiate Razorpay payment (don't await - it will call callbacks)
      try {
        ridePaymentService.initiateRazorpayPayment(
          paymentOrderResponse.data,
          {
            name: user.name || "Guest",
            email: user.email || "",
            phone: user.phone || "",
          },
          { rideType: "airport" },
          async (paymentData) => {
            // Payment success callback
            try {
              console.log("✅ Payment successful, verifying...", paymentData);
              const verifyResponse = await ridePaymentService.verifyRidePayment(paymentData);
              if (verifyResponse.success) {
                console.log("✅ Payment verified successfully");
                setAirportPaymentLoading(false);
                setShowAirportForm(false);
                // Reset form
                setAirportLocation("");
                setAirportDate("");
                setAirportTime("");
                setSelectedCarType("");

                // Show success message and navigate
                navigate("/user/booking-confirmation", {
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
                console.error("❌ Payment verification failed:", verifyResponse.message);
                setAirportBookingError("Payment verification failed: " + (verifyResponse.message || "Unknown error"));
                setAirportPaymentLoading(false);
              }
            } catch (error) {
              console.error("❌ Payment verification error:", error);
              setAirportBookingError("Payment verification failed: " + error.message);
              setAirportPaymentLoading(false);
            }
          },
          (error) => {
            // Payment failure callback
            console.error("Payment failed:", error);
            setAirportBookingError("Payment failed: " + error);
            setAirportPaymentLoading(false);
          }
        );
      } catch (razorpayError) {
        console.error("❌ Razorpay initiation error:", razorpayError);
        setAirportBookingError("Failed to open payment gateway: " + razorpayError.message);
        setAirportPaymentLoading(false);
      }
    } catch (error) {
      console.error("Airport booking error:", error);
      setAirportBookingError(error.message || "An error occurred while booking");
      setAirportPaymentLoading(false);
    }
  };

  // Handle search rides
  const handleSearchRides = () => {
    // Validation for Airport rides
    if (rideType === "Airport") {
      if (airportRideType === "pickup") {
        if (!destination.trim()) {
          alert("Please enter your destination city");
          return;
        }
        setAirportLocation(destination);
      } else {
        if (!pickupLocation.trim()) {
          alert("Please enter your current location");
          return;
        }
        setAirportLocation(pickupLocation);
      }

      // Show airport form instead of navigating
      setAirportBookingError("");
      setShowAirportForm(true);
      return;
    }

    // Validation for Local/Intercity rides
    if (!pickupLocation.trim() || !destination.trim()) {
      alert("Please enter both pickup location and destination");
      return;
    }

    if (!distance || !duration) {
      alert("Please wait for distance calculation to complete");
      return;
    }

    setIsSearching(true);
    console.log("🚗 Searching rides with:", {
      rideType,
      pickupLocation,
      destination,
      bookingDate,
      bookingTime,
      distance,
      duration,
      estimatedFare: estimatedFare?.totalFare,
    });

    // Simulate search delay and open booking modal
    setTimeout(() => {
      setIsSearching(false);
      setIsRideBookingModalOpen(true);
    }, 500);
  };

  // Get today's date formatted
  const getTodayFormatted = () => {
    const today = new Date();
    return today.toLocaleDateString("en-US", {
      month: "short",
      day: "numeric",
      year: "numeric",
    });
  };

  // Get current time formatted
  const getCurrentTimeFormatted = () => {
    const now = new Date();
    return now.toLocaleTimeString("en-US", {
      hour: "2-digit",
      minute: "2-digit",
      hour12: true,
    });
  };


  const howItWorksSteps = [
    {
      step: "01",
      title: "Add Pickup & Drop",
      description:
        "Set your pickup and destination using search or quick location detect.",
      icon: MapPin,
    },
    {
      step: "02",
      title: "Schedule Your Ride",
      description:
        "Pick ride type, date, and time that works best for your journey.",
      icon: Calendar,
    },
    {
      step: "03",
      title: "Confirm & Go",
      description:
        "Confirm booking, meet your captain, and enjoy a smooth electric ride.",
      icon: UserCheck,
    },
  ];

  const desktopTempleTours =
    templateTours.length > 1 ? [...templateTours, ...templateTours] : templateTours;
  const desktopTravelTours =
    travelTours.length > 1 ? [...travelTours, ...travelTours] : travelTours;

  const renderTempleTourCard = (tour, key, className) => (
    <div
      key={key}
      className={`${className} h-[320px] md:h-[340px] snap-start rounded-3xl overflow-hidden ${darkMode ? "bg-gray-800 border-gray-700" : "bg-white border-slate-100"} border shadow-xl hover:shadow-2xl transition-all duration-500 hover:-translate-y-2 group cursor-pointer flex flex-col`}
    >
      <div className="relative h-28 md:h-32 overflow-hidden">
        <img
          src={
            tour.coverImage ||
            "https://images.unsplash.com/photo-1600100397608-f010e423b971?auto=format&fit=crop&q=80&w=400"
          }
          alt={tour.title}
          className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-110"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-black/20 to-transparent" />
        <div className="absolute top-4 right-4 bg-white/90 backdrop-blur-md text-slate-900 px-3 py-1 rounded-full text-[10px] font-black shadow-lg">
          ₹{Math.min(tour.pricing?.premium || tour.basePrice || 0, tour.pricing?.economy || tour.basePrice || 0)}
        </div>
      </div>
      <div className="p-5 flex-1 flex flex-col">
        <div className="flex items-center gap-2 mb-3">
          <span className={`flex items-center gap-1 px-2 py-0.5 rounded-md text-[9px] font-bold uppercase tracking-wider ${darkMode ? "bg-emerald-500/20 text-emerald-400" : "bg-emerald-50 text-emerald-600"}`}>
            <Clock size={10} />
            {typeof tour.duration === "object" ? `${tour.duration.days || 1}d` : "4h"}
          </span>
          <span className={`flex items-center gap-1 px-2 py-0.5 rounded-md text-[9px] font-bold uppercase tracking-wider ${darkMode ? "bg-emerald-500/20 text-emerald-400" : "bg-emerald-50 text-emerald-600"}`}>
            <Zap size={10} /> EV
          </span>
        </div>
        <h4 className={`font-bold text-base mb-2 line-clamp-1 ${darkMode ? "text-white" : "text-slate-900"}`}>
          {tour.title}
        </h4>
        <p className={`text-[12px] leading-relaxed mb-4 line-clamp-2 ${darkMode ? "text-gray-400" : "text-slate-500"}`}>
          {tour.shortDescription || "Explore heritage in premium electric comfort"}
        </p>
        <div className="mt-auto flex gap-2">
          <button
            type="button"
            onClick={() => handleTourDetailsClick(tour)}
            className={`flex-1 py-2 rounded-xl text-[11px] font-black border transition-all duration-300 ${darkMode
              ? "border-gray-700 text-gray-300 hover:bg-gray-700"
              : "border-slate-200 text-slate-600 hover:bg-slate-50"
              }`}
          >
            Details
          </button>
          <button
            type="button"
            onClick={() => handleBookTourClick(tour)}
            className="flex-1 py-2 bg-gradient-to-r from-emerald-500 to-blue-600 text-white rounded-xl text-[11px] font-black hover:shadow-lg hover:shadow-emerald-500/20 transition-all duration-300"
          >
            Book
          </button>
        </div>
      </div>
    </div>
  );

  const renderTravelTourCard = (tour, key, className) => (
    <div
      key={key}
      className={`${className} h-[380px] md:h-[400px] snap-start rounded-[2.5rem] overflow-hidden ${darkMode ? "bg-gray-800 border-gray-700" : "bg-white border-slate-100"} border shadow-2xl hover:shadow-emerald-500/10 transition-all duration-500 hover:-translate-y-3 group cursor-pointer flex flex-col`}
    >
      <div className="relative h-40 md:h-44 overflow-hidden">
        <img
          src={
            tour.coverImage ||
            "https://images.unsplash.com/photo-1488646953014-85cb44e25828?auto=format&fit=crop&q=80&w=400"
          }
          alt={tour.title}
          className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-110"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent" />
        <div className="absolute bottom-4 left-4 flex flex-col">
          <span className="text-[10px] font-black text-emerald-400 uppercase tracking-widest mb-1">Starting from</span>
          <span className="text-2xl font-black text-white">₹{Math.min(tour.pricing?.premium || tour.basePrice || 0, tour.pricing?.economy || tour.basePrice || 0)}</span>
        </div>
      </div>
      <div className="p-6 flex-1 flex flex-col">
        <div className="flex flex-wrap gap-2 mb-4">
          <span className={`flex items-center gap-1.5 px-3 py-1 rounded-full text-[10px] font-black uppercase tracking-wider ${darkMode ? "bg-gray-700 text-emerald-400" : "bg-emerald-50 text-emerald-700"}`}>
            <Clock size={12} />
            {typeof tour.duration === "object" && (tour.duration?.days !== undefined || tour.duration?.hours !== undefined)
              ? `${tour.duration.days || 1}d ${tour.duration.hours || 0}h`
              : typeof tour.duration === "string" ? tour.duration : "2 Days"}
          </span>
          <span className={`flex items-center gap-1.5 px-3 py-1 rounded-full text-[10px] font-black uppercase tracking-wider ${darkMode ? "bg-gray-700 text-blue-400" : "bg-blue-50 text-blue-700"}`}>
            <UserCheck size={12} /> Group Tour
          </span>
        </div>
        <h4 className={`font-black text-xl mb-3 line-clamp-1 ${darkMode ? "text-white" : "text-slate-900"}`}>
          {tour.title}
        </h4>
        <p className={`text-sm leading-relaxed mb-6 line-clamp-2 font-medium ${darkMode ? "text-gray-400" : "text-slate-500"}`}>
          {tour.shortDescription || "Experience the best destinations with sustainable electric mobility."}
        </p>
        <div className="mt-auto grid grid-cols-2 gap-3">
          <button
            type="button"
            onClick={() => handleTourDetailsClick(tour)}
            className={`py-3 rounded-2xl font-black text-[11px] uppercase tracking-widest border transition-all duration-300 ${darkMode
              ? "border-gray-700 text-gray-300 hover:bg-gray-700"
              : "border-slate-200 text-slate-600 hover:bg-slate-50"
              }`}
          >
            Details
          </button>
          <button
            type="button"
            onClick={() => handleBookTourClick(tour)}
            className="py-3 bg-gradient-to-r from-blue-600 to-emerald-500 text-white rounded-2xl font-black text-[11px] uppercase tracking-widest hover:shadow-xl hover:shadow-blue-500/20 transition-all duration-300"
          >
            Book Now
          </button>
        </div>
      </div>
    </div>
  );

  const showNextTempleMobileCard = () => {
    if (templateTours.length < 2) {
      return;
    }
    setTempleMobileIndex((prev) => (prev + 1) % templateTours.length);
  };

  const showPrevTempleMobileCard = () => {
    if (templateTours.length < 2) {
      return;
    }
    setTempleMobileIndex(
      (prev) => (prev - 1 + templateTours.length) % templateTours.length,
    );
  };

  const showNextTravelMobileCard = () => {
    if (travelTours.length < 2) {
      return;
    }
    setTravelMobileIndex((prev) => (prev + 1) % travelTours.length);
  };

  const showPrevTravelMobileCard = () => {
    if (travelTours.length < 2) {
      return;
    }
    setTravelMobileIndex(
      (prev) => (prev - 1 + travelTours.length) % travelTours.length,
    );
  };

  const handleTempleTouchStart = (event) => {
    templeTouchStartXRef.current = event.touches[0]?.clientX ?? null;
  };

  const handleTempleTouchEnd = (event) => {
    if (templeTouchStartXRef.current === null) {
      return;
    }

    const touchEndX = event.changedTouches[0]?.clientX ?? templeTouchStartXRef.current;
    const deltaX = touchEndX - templeTouchStartXRef.current;
    const swipeThreshold = 40;

    if (deltaX > swipeThreshold) {
      showPrevTempleMobileCard();
    } else if (deltaX < -swipeThreshold) {
      showNextTempleMobileCard();
    }

    templeTouchStartXRef.current = null;
  };

  const handleTravelTouchStart = (event) => {
    travelTouchStartXRef.current = event.touches[0]?.clientX ?? null;
  };

  const handleTravelTouchEnd = (event) => {
    if (travelTouchStartXRef.current === null) {
      return;
    }

    const touchEndX = event.changedTouches[0]?.clientX ?? travelTouchStartXRef.current;
    const deltaX = touchEndX - travelTouchStartXRef.current;
    const swipeThreshold = 40;

    if (deltaX > swipeThreshold) {
      showPrevTravelMobileCard();
    } else if (deltaX < -swipeThreshold) {
      showNextTravelMobileCard();
    }

    travelTouchStartXRef.current = null;
  };

  const detectCurrentLocation = () => {
    if (!navigator.geolocation) {
      alert("Geolocation is not supported by your browser");
      return;
    }

    setIsDetectingLocation(true);
    navigator.geolocation.getCurrentPosition(
      async (position) => {
        const { latitude, longitude } = position.coords;
        try {
          const { getReverseGeocodedAddress } = await import('../../services/googleMapsService.js');
          const address = await getReverseGeocodedAddress(latitude, longitude);
          setPickupLocation(address);
        } catch (error) {
          console.error('Location detection error:', error);
          setPickupLocation(`${latitude.toFixed(4)}, ${longitude.toFixed(4)}`);
        } finally {
          setIsDetectingLocation(false);
        }
      },
      (error) => {
        console.error("Error getting location:", error);
        let errorMessage = "Unable to detect location";
        if (error.code === error.PERMISSION_DENIED) {
          errorMessage =
            "Please allow location access in your browser settings";
        } else if (error.code === error.POSITION_UNAVAILABLE) {
          errorMessage = "Location information is unavailable";
        } else if (error.code === error.TIMEOUT) {
          errorMessage = "Location request timed out";
        }
        alert(errorMessage);
        setIsDetectingLocation(false);
      },
    );
  };

  const detectDestinationLocation = () => {
    if (!navigator.geolocation) {
      alert("Geolocation is not supported by your browser");
      return;
    }

    setIsDetectingDestination(true);
    navigator.geolocation.getCurrentPosition(
      async (position) => {
        const { latitude, longitude } = position.coords;
        try {
          const { getReverseGeocodedAddress } = await import('../../services/googleMapsService.js');
          const address = await getReverseGeocodedAddress(latitude, longitude);
          setDestination(address);
        } catch (error) {
          console.error('Location detection error:', error);
          setDestination(`${latitude.toFixed(4)}, ${longitude.toFixed(4)}`);
        } finally {
          setIsDetectingDestination(false);
        }
      },
      (error) => {
        console.error("Error getting location:", error);
        let errorMessage = "Unable to detect location";
        if (error.code === error.PERMISSION_DENIED) {
          errorMessage =
            "Please allow location access in your browser settings";
        } else if (error.code === error.POSITION_UNAVAILABLE) {
          errorMessage = "Location information is unavailable";
        } else if (error.code === error.TIMEOUT) {
          errorMessage = "Location request timed out";
        }
        alert(errorMessage);
        setIsDetectingDestination(false);
      },
    );
  };
  const styles = `
    @keyframes slideUpFade {
      from { opacity: 0; transform: translateY(40px); }
      to { opacity: 1; transform: translateY(0); }
    }

    @keyframes fadeIn {
      from { opacity: 0; }
      to { opacity: 1; }
    }

    @keyframes float {
      0%, 100% { transform: translateY(0px); }
      50% { transform: translateY(-20px); }
    }

    .animate-slideUpFade {
      animation: slideUpFade 0.8s cubic-bezier(0.16, 1, 0.3, 1) forwards;
    }

    .animate-fadeIn {
      animation: fadeIn 1s ease forwards;
    }

    .animate-float {
      animation: float 5s ease-in-out infinite;
    }

    .service-card-glow {
      transition: all 0.5s ease;
    }

    .service-card-glow:hover {
      box-shadow: 0 20px 40px -15px rgba(16, 185, 129, 0.15);
    }
  `;

  return (
    <>
      <SEO 
        title="Eco-Friendly Premium Electric Cab Service"
        description="Book India's most reliable electric cab service for airport rides, local travel and intercity tours. Sustainable, quiet and premium travel experience."
        keywords="electric cab, airport transfer, green travel, eco-friendly taxi, Jaipur electric taxi"
        url="/"
      />
    <div
      className={`min-h-screen ${darkMode ? "bg-[#020617] text-gray-100" : "bg-white text-slate-900"} transition-colors duration-300 font-sans`}
    >
      <style>{styles}</style>

      {/* Offer Banner */}
      <OfferBanner />

      {/* Hero Section */}
      {/* Hero Section Redesigned */}
      <header
        id="home"
        className={`relative overflow-hidden pt-28 pb-16 md:pt-40 md:pb-32 ${darkMode ? "bg-[#020617]" : "bg-white"}`}
      >
        {/* Background Decorative Elements */}
        <div className="absolute top-0 right-0 w-1/2 h-full bg-gradient-to-l from-emerald-500/5 to-transparent pointer-events-none" />
        <div className="absolute -top-24 -left-24 w-96 h-96 bg-blue-500/5 rounded-full blur-3xl pointer-events-none" />

        <div className="max-w-7xl mx-auto px-4 md:px-12 grid grid-cols-1 lg:grid-cols-2 gap-12 items-center relative z-10">
          <div className="space-y-8 text-left animate-slideUpFade">
            <div
              className={`inline-flex items-center ${darkMode ? "bg-emerald-900/30 text-emerald-400 border-emerald-800/50" : "bg-emerald-50 text-emerald-700 border-emerald-100"} px-4 py-2 rounded-full text-xs font-black tracking-widest border shadow-sm transition-all`}
            >
              <Zap size={14} className="mr-2 fill-current" /> 100% ELECTRIC. 0% EMISSION.
            </div>

            <h1 className="text-5xl md:text-7xl lg:text-8xl font-black leading-[1.1] tracking-tight">
              Ride <span className="text-emerald-600">Green.</span> <br />
              Ride <span className="bg-gradient-to-r from-blue-600 to-cyan-500 bg-clip-text text-transparent">Smart.</span>
            </h1>

            <p
              className={`${darkMode ? "text-gray-400" : "text-slate-600"} max-w-xl text-lg md:text-xl font-medium leading-relaxed`}
            >
              Go Electric Cabs is your premium eco-friendly ride partner in the Pink City.
              Experience comfortable, reliable, and sustainable transport for the modern traveler.
            </p>

            <div className="flex flex-wrap gap-4 pt-4">
              <button
                onClick={() => navigate('/services')}
                className="group flex items-center gap-3 bg-emerald-600 hover:bg-emerald-700 text-white px-8 py-4 rounded-2xl font-black text-lg shadow-xl shadow-emerald-600/20 transition-all hover:-translate-y-1 active:scale-95"
              >
                Book a Ride
                <ChevronRight size={20} className="group-hover:translate-x-1 transition-transform" />
              </button>
              <button
                onClick={() => navigate('/about')}
                className={`px-8 py-4 rounded-2xl font-black text-lg border-2 ${darkMode ? "border-gray-700 text-gray-300 hover:bg-gray-800" : "border-slate-200 text-slate-700 hover:bg-slate-50"} transition-all`}
              >
                Learn More
              </button>
            </div>

            <div className="flex flex-wrap gap-6 pt-6">
              {[
                { label: "Safe & Secure", icon: <Leaf size={16} />, color: "emerald" },
                { label: "Eco-Friendly", icon: <Zap size={16} />, color: "blue" },
                { label: "Affordable Rates", icon: <Wallet size={16} />, color: "purple" }
              ].map((item, i) => (
                <div key={i} className="flex items-center gap-2">
                  <div className={`w-8 h-8 rounded-full bg-${item.color}-500/10 flex items-center justify-center text-${item.color}-600`}>
                    {item.icon}
                  </div>
                  <span className={`text-sm font-bold ${darkMode ? "text-gray-400" : "text-slate-500"}`}>{item.label}</span>
                </div>
              ))}
            </div>
          </div>

          <div className="relative lg:h-[600px] flex items-center justify-center animate-fadeIn">
            {/* Image Glow */}
            <div className="absolute inset-0 bg-emerald-500/10 blur-[120px] rounded-full scale-75" />

            <div className="relative w-full rounded-[3rem] overflow-hidden shadow-2xl border-4 border-white/10 group">
              <img
                src="/home-hero-new.png"
                alt="Premium Electric Car"
                className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-105"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-black/40 via-transparent to-transparent" />

              {/* Floating Badge */}
              <div className="absolute bottom-8 left-8 bg-white/10 backdrop-blur-md p-4 rounded-2xl border border-white/20 text-white animate-float">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 bg-emerald-500 rounded-xl flex items-center justify-center shadow-lg shadow-emerald-500/40">
                    <Zap size={20} className="fill-current" />
                  </div>
                  <div>
                    <p className="text-[10px] font-black opacity-80 uppercase tracking-widest">Active Fleet</p>
                    <p className="text-xl font-black leading-tight">12 Vehicles</p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </header>

      {/* MacBook Showcase Section */}
      <MacBookShowcase darkMode={darkMode} />
      {/* Services Categories Redesigned */}
      {/* Services Categories Redesigned */}
      <section className={`px-4 md:px-12 py-20 md:py-32 relative overflow-hidden ${darkMode ? "bg-[#0f172a]" : "bg-slate-50/50"}`}>
        <div className="max-w-7xl mx-auto relative z-10">
          <div className="flex flex-col items-center text-center mb-20">
            <div className="inline-flex items-center gap-2 bg-emerald-500/10 text-emerald-600 px-4 py-2 rounded-full text-[10px] font-black uppercase tracking-[0.2em] mb-4">
              Our Expertise
            </div>
            <h2 className={`text-4xl md:text-6xl font-black ${darkMode ? "text-white" : "text-slate-900"} mb-6`}>
              Premium <span className="text-emerald-600">Electric</span> Mobility
            </h2>
            <div className="w-24 h-1.5 bg-gradient-to-r from-emerald-500 to-blue-600 rounded-full mb-8" />
            <p className={`max-w-2xl text-lg font-medium ${darkMode ? "text-gray-400" : "text-slate-500"}`}>
              Choose from our curated range of sustainable transport services designed for the modern traveler in Jaipur.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
            {[
              {
                icon: <Plane className="rotate-45" size={32} />,
                title: "Airport Ride",
                sub: "Reliable airport transfers to and from Jaipur International Airport.",
                color: "emerald",
                path: "/airport",
                gradient: "from-emerald-500 to-teal-500"
              },
              {
                icon: <Landmark size={32} />,
                title: "Tour Package",
                sub: "Immersive guided tours through the heritage of the Pink City.",
                color: "blue",
                path: "/tours",
                gradient: "from-blue-500 to-indigo-500"
              },
              {
                icon: <MapPin size={32} />,
                title: "Local Ride",
                sub: "Silent, zero-emission city travel at your fingertips.",
                color: "indigo",
                path: "/local-ride",
                gradient: "from-indigo-500 to-purple-500"
              },
              {
                icon: <Navigation size={32} />,
                title: "Intercity Ride",
                sub: "Long-distance electric travel without the carbon footprint.",
                color: "cyan",
                path: "/intercity-ride",
                gradient: "from-cyan-500 to-blue-500"
              },
            ].map((item, i) => (
              <div
                key={i}
                onClick={() => navigate(item.path)}
                className={`group relative p-10 rounded-[3rem] cursor-pointer transition-all duration-500 ${darkMode
                  ? "bg-slate-800/40 border-slate-700/50 hover:bg-slate-800 hover:border-emerald-500/30"
                  : "bg-white border-slate-100 hover:border-emerald-200 shadow-2xl shadow-slate-200/40 hover:shadow-emerald-200/20"
                  } border`}
              >
                <div className={`w-20 h-20 rounded-[1.8rem] mb-8 flex items-center justify-center transition-all duration-500 group-hover:scale-110 group-hover:-rotate-6 bg-gradient-to-br ${item.gradient} text-white shadow-lg`}>
                  {item.icon}
                </div>
                <h3 className={`text-2xl font-black mb-4 ${darkMode ? "text-white" : "text-slate-900"}`}>
                  {item.title}
                </h3>
                <p className={`text-base font-medium leading-relaxed mb-8 ${darkMode ? "text-gray-400" : "text-slate-500"}`}>
                  {item.sub}
                </p>
                <div className="flex items-center text-sm font-black text-emerald-600 group-hover:gap-4 transition-all duration-300">
                  Book Now <ChevronRight size={20} className="group-hover:translate-x-1 transition-transform" />
                </div>

                {/* Hover Glow Effect */}
                <div className={`absolute -inset-2 bg-gradient-to-br ${item.gradient} opacity-0 group-hover:opacity-[0.03] blur-2xl rounded-[4rem] transition-opacity duration-500`} />
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Touring Packages */}
      <section
        id="tours"
        className={`px-4 md:px-12 py-16 md:py-20 ${darkMode ? "bg-gray-900" : "bg-white"} transition-colors duration-300`}
      >
        <div className="flex flex-col md:flex-row md:justify-between md:items-end mb-10 gap-4">
          <div>
            <div className="inline-flex items-center gap-2 bg-emerald-500/10 text-emerald-600 px-3 py-1.5 rounded-full text-[10px] font-black uppercase tracking-widest mb-4">
              Spiritual Journeys
            </div>
            <h2 className="text-4xl md:text-5xl font-black text-slate-900 dark:text-white">
              Temple Tour <span className="text-emerald-600">Packages</span>
            </h2>
            <p
              className={`${darkMode ? "text-gray-400" : "text-gray-500"} mt-2 text-sm md:text-base transition-colors duration-300`}
            >
              Discover the heritage of Jaipur with our curated electric tours.
            </p>
          </div>
          <button
            type="button"
            onClick={() => navigate('/tours?type=temple_tour')}
            className="flex items-center text-sm font-bold text-emerald-600 hover:text-blue-600 transition gap-2 cursor-pointer"
          >
            View all packages <ChevronRight size={18} />
          </button>
        </div>

        {loadingTours ? (
          <div className="flex items-center justify-center min-h-64">
            <Loader size={40} className="animate-spin text-emerald-600" />
          </div>
        ) : toursError ? (
          <div
            className={`text-center py-12 ${darkMode ? "text-gray-400" : "text-gray-600"}`}
          >
            <p>{toursError}</p>
          </div>
        ) : templateTours.length === 0 ? (
          <div
            className={`text-center py-12 ${darkMode ? "text-gray-400" : "text-gray-600"}`}
          >
            <p>No temple tour packages available</p>
          </div>
        ) : (
          <>
            <div className="md:hidden relative pb-2">
              <div className="overflow-hidden">
                <div
                  className="flex transition-transform duration-500 ease-out"
                  style={{ transform: `translateX(-${templeMobileIndex * 100}%)` }}
                  onTouchStart={handleTempleTouchStart}
                  onTouchEnd={handleTempleTouchEnd}
                >
                  {templateTours.map((tour, i) =>
                    renderTempleTourCard(
                      tour,
                      `${tour._id || tour.id || tour.title}-${i}`,
                      "min-w-full",
                    ),
                  )}
                </div>
              </div>

              {templateTours.length > 1 && (
                <>
                  <button
                    type="button"
                    onClick={showPrevTempleMobileCard}
                    className={`absolute left-2 top-1/2 -translate-y-1/2 w-9 h-9 rounded-full border flex items-center justify-center shadow-md transition ${darkMode
                      ? "bg-gray-800/90 border-gray-600 text-gray-100 hover:bg-gray-700"
                      : "bg-white/90 border-gray-300 text-gray-800 hover:bg-gray-100"
                      }`}
                    aria-label="Previous temple package"
                  >
                    <ChevronRight size={18} className="rotate-180" />
                  </button>
                  <button
                    type="button"
                    onClick={showNextTempleMobileCard}
                    className={`absolute right-2 top-1/2 -translate-y-1/2 w-9 h-9 rounded-full border flex items-center justify-center shadow-md transition ${darkMode
                      ? "bg-gray-800/90 border-gray-600 text-gray-100 hover:bg-gray-700"
                      : "bg-white/90 border-gray-300 text-gray-800 hover:bg-gray-100"
                      }`}
                    aria-label="Next temple package"
                  >
                    <ChevronRight size={18} />
                  </button>
                </>
              )}
            </div>

            <div
              ref={templeToursSliderRef}
              className="hidden md:flex gap-4 overflow-x-hidden pb-2"
            >
              {desktopTempleTours.map((tour, i) =>
                renderTempleTourCard(
                  tour,
                  `${tour._id || tour.id || tour.title}-desktop-${i}`,
                  "w-[260px] min-w-[260px] max-w-[260px]",
                ),
              )}
            </div>
          </>
        )}
      </section>

      {/* Travel Tour Packages */}
      <section
        className={`px-4 md:px-12 py-16 md:py-20 ${darkMode ? "bg-gray-800" : "bg-gray-50"} transition-colors duration-300`}
      >
        <div className="flex flex-col md:flex-row md:justify-between md:items-end mb-10 gap-4">
          <div>
            <div className="inline-flex items-center gap-2 bg-blue-500/10 text-blue-600 px-3 py-1.5 rounded-full text-[10px] font-black uppercase tracking-widest mb-4">
              Discover Rajasthan
            </div>
            <h2 className="text-4xl md:text-5xl font-black text-slate-900 dark:text-white">
              Travel Tour <span className="text-blue-600">Packages</span>
            </h2>
            <p
              className={`${darkMode ? "text-gray-400" : "text-gray-500"} mt-2 text-sm md:text-base transition-colors duration-300`}
            >
              Explore exciting destinations with our premium electric tour
              packages.
            </p>
          </div>
          <button
            type="button"
            onClick={() => navigate('/tours?type=travel_tour')}
            className="flex items-center text-sm font-bold text-blue-600 hover:text-purple-600 transition gap-2 cursor-pointer"
          >
            View all packages <ChevronRight size={18} />
          </button>
        </div>

        {loadingTravelTours ? (
          <div className="flex items-center justify-center min-h-64">
            <Loader size={40} className="animate-spin text-blue-600" />
          </div>
        ) : travelToursError ? (
          <div
            className={`text-center py-12 ${darkMode ? "text-gray-400" : "text-gray-600"}`}
          >
            <p>{travelToursError}</p>
          </div>
        ) : travelTours.length === 0 ? (
          <div
            className={`text-center py-12 ${darkMode ? "text-gray-400" : "text-gray-600"}`}
          >
            <p>No travel tour packages available</p>
          </div>
        ) : (
          <>
            <div className="md:hidden relative pb-2">
              <div className="overflow-hidden">
                <div
                  className="flex transition-transform duration-500 ease-out"
                  style={{ transform: `translateX(-${travelMobileIndex * 100}%)` }}
                  onTouchStart={handleTravelTouchStart}
                  onTouchEnd={handleTravelTouchEnd}
                >
                  {travelTours.map((tour, i) =>
                    renderTravelTourCard(
                      tour,
                      `${tour._id || tour.id || tour.title}-travel-${i}`,
                      "min-w-full",
                    ),
                  )}
                </div>
              </div>

              {travelTours.length > 1 && (
                <>
                  <button
                    type="button"
                    onClick={showPrevTravelMobileCard}
                    className={`absolute left-2 top-1/2 -translate-y-1/2 w-9 h-9 rounded-full border flex items-center justify-center shadow-md transition ${darkMode
                      ? "bg-gray-800/90 border-gray-600 text-gray-100 hover:bg-gray-700"
                      : "bg-white/90 border-gray-300 text-gray-800 hover:bg-gray-100"
                      }`}
                    aria-label="Previous travel package"
                  >
                    <ChevronRight size={18} className="rotate-180" />
                  </button>
                  <button
                    type="button"
                    onClick={showNextTravelMobileCard}
                    className={`absolute right-2 top-1/2 -translate-y-1/2 w-9 h-9 rounded-full border flex items-center justify-center shadow-md transition ${darkMode
                      ? "bg-gray-800/90 border-gray-600 text-gray-100 hover:bg-gray-700"
                      : "bg-white/90 border-gray-300 text-gray-800 hover:bg-gray-100"
                      }`}
                    aria-label="Next travel package"
                  >
                    <ChevronRight size={18} />
                  </button>
                </>
              )}
            </div>

            <div
              ref={travelToursSliderRef}
              className="hidden md:flex gap-5 overflow-x-hidden pb-2"
            >
              {desktopTravelTours.map((tour, i) =>
                renderTravelTourCard(
                  tour,
                  `${tour._id || tour.id || tour.title}-travel-desktop-${i}`,
                  "w-[320px] min-w-[320px] max-w-[320px]",
                ),
              )}
            </div>
          </>
        )}
      </section>


      {isTourDetailsModalOpen && selectedTourDetails && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50"
          onClick={handleCloseTourDetailsModal}
        >
          <div
            className={`${darkMode ? "bg-gray-900 border-gray-700" : "bg-white border-gray-200"} w-full max-w-2xl max-h-[80vh] rounded-2xl border shadow-2xl overflow-y-auto`}
            onClick={(event) => event.stopPropagation()}
          >
            {/* Header with Image */}
            <div className="relative h-40 md:h-48">
              <img
                src={
                  selectedTourDetails.coverImage ||
                  "https://images.unsplash.com/photo-1600100397608-f010e423b971?auto=format&fit=crop&q=80&w=1000"
                }
                alt={selectedTourDetails.title}
                className="w-full h-full object-cover"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-black/70 to-transparent" />
              <button
                type="button"
                onClick={handleCloseTourDetailsModal}
                className="absolute right-3 top-3 w-9 h-9 rounded-full bg-black/55 text-white flex items-center justify-center hover:bg-black/75 transition"
                aria-label="Close details"
              >
                <X size={18} />
              </button>
              <div className="absolute bottom-4 left-4 right-4 flex items-end justify-between gap-4 flex-wrap">
                <div>
                  <h3 className="text-2xl md:text-3xl font-extrabold text-white">
                    {selectedTourDetails.title}
                  </h3>
                  {selectedTourDetails.location && (
                    <p className="text-emerald-200 text-sm font-semibold mt-1">
                      <MapPin size={14} className="inline mr-1" />
                      {selectedTourDetails.location}
                    </p>
                  )}
                </div>
                <span className="shrink-0 px-4 py-2 rounded-full bg-gradient-to-r from-blue-500 to-emerald-600 text-white font-bold text-lg">
                  From ₹{Math.min(selectedTourDetails.pricing?.premium || selectedTourDetails.basePrice || 0, selectedTourDetails.pricing?.economy || selectedTourDetails.basePrice || 0)}
                </span>
              </div>
            </div>

            {/* Content */}
            <div className="p-5 md:p-8 space-y-6">
              {/* Quick Info */}
              <div className={`flex flex-wrap gap-3 text-sm font-semibold ${darkMode ? "text-gray-300" : "text-gray-700"}`}>
                <span className={`${darkMode ? "bg-gray-800" : "bg-gray-100"} px-4 py-2 rounded-full flex items-center gap-2`}>
                  <Clock size={16} className="text-emerald-500" />
                  <Clock size={16} />
                  {typeof selectedTourDetails.duration === "object" && (selectedTourDetails.duration?.days !== undefined || selectedTourDetails.duration?.hours !== undefined)
                    ? `${selectedTourDetails.duration.days || 1}d ${selectedTourDetails.duration.hours || 0}h`
                    : typeof selectedTourDetails.duration === "string" ? selectedTourDetails.duration : "1 Day"}
                </span>
                <span className={`${darkMode ? "bg-gray-800" : "bg-gray-100"} px-4 py-2 rounded-full flex items-center gap-2`}>
                  <UserCheck size={16} className="text-blue-500" />
                  {selectedTourDetails.tourCategory === "travel_tour" ? <><Users size={16} /> Group Tour</> : <><Car size={16} /> 4 Seater</>}
                </span>
                {selectedTourDetails.distance && (
                  <span className={`${darkMode ? "bg-gray-800" : "bg-gray-100"} px-4 py-2 rounded-full flex items-center gap-2`}>
                    <Navigation size={16} className="text-purple-500" />
                    <MapPin size={14} /> {selectedTourDetails.distance} km
                  </span>
                )}
                {selectedTourDetails.rating?.average > 0 && (
                  <span className={`${darkMode ? "bg-gray-800" : "bg-gray-100"} px-4 py-2 rounded-full flex items-center gap-2`}>
                    <Star size={16} className="text-yellow-500 fill-yellow-500" />
                    <Star size={14} className="fill-yellow-400 text-yellow-400" /> {selectedTourDetails.rating.average.toFixed(1)} ({selectedTourDetails.rating.count} reviews)
                  </span>
                )}
              </div>

              {/* Pricing Details - Compact */}
              <div className={`p-3 rounded-lg border-2 ${darkMode ? "bg-gray-800/40 border-emerald-500/30" : "bg-emerald-50 border-emerald-200"}`}>
                <div className="grid grid-cols-2 gap-2">
                  <div className={`text-center p-3 rounded-lg ${darkMode ? "bg-emerald-900/30" : "bg-white"} border ${darkMode ? "border-emerald-500/40" : "border-emerald-300"}`}>
                    <p className={`text-xs font-semibold ${darkMode ? "text-emerald-300" : "text-emerald-700"} mb-1 flex items-center gap-1`}><Car size={12} /> Economy</p>
                    <p className="font-bold text-emerald-600 dark:text-emerald-400 text-lg">
                      ₹{selectedTourDetails.pricing?.economy || selectedTourDetails.basePrice || 0}
                    </p>
                  </div>
                  <div className={`text-center p-3 rounded-lg ${darkMode ? "bg-blue-900/30" : "bg-white"} border ${darkMode ? "border-blue-500/40" : "border-blue-300"}`}>
                    <p className={`text-xs font-semibold ${darkMode ? "text-blue-300" : "text-blue-700"} mb-1 flex items-center gap-1`}><Sparkles size={12} /> Premium</p>
                    <p className="font-bold text-blue-600 dark:text-blue-400 text-lg">
                      ₹{selectedTourDetails.pricing?.premium || selectedTourDetails.basePrice || 0}
                    </p>
                  </div>
                </div>
              </div>

              {/* Short Description */}
              {selectedTourDetails.shortDescription && (
                <div className={`p-5 rounded-xl ${darkMode ? "bg-blue-900/20" : "bg-blue-50"}`}>
                  <h4 className={`font-bold text-base mb-3 ${darkMode ? "text-blue-300" : "text-blue-700"} flex items-center gap-2`}><Sparkles size={18} /> Overview</h4>
                  <p className={`${darkMode ? "text-gray-300" : "text-gray-700"} text-sm leading-relaxed italic`}>
                    {selectedTourDetails.shortDescription}
                  </p>
                </div>
              )}

              {/* Full Description */}
              {selectedTourDetails.description && (
                <div className={`p-5 rounded-xl ${darkMode ? "bg-gray-800/60" : "bg-gray-50"}`}>
                  <h4 className={`font-bold text-base mb-3 ${darkMode ? "text-gray-200" : "text-gray-900"} flex items-center gap-2`}><FileText size={18} /> Full Details</h4>
                  <p className={`${darkMode ? "text-gray-300" : "text-gray-700"} text-sm md:text-base leading-relaxed whitespace-pre-wrap`}>
                    {selectedTourDetails.description}
                  </p>
                </div>
              )}

              {/* Destinations */}
              {selectedTourDetails.destinations && selectedTourDetails.destinations.length > 0 && (
                <div className={`p-5 rounded-xl ${darkMode ? "bg-gray-800/60" : "bg-gray-50"}`}>
                  <h4 className={`font-bold text-base mb-4 ${darkMode ? "text-gray-200" : "text-gray-900"} flex items-center gap-2`}><Map size={18} /> Destinations</h4>
                  <div className="space-y-3">
                    {selectedTourDetails.destinations.map((dest, idx) => (
                      <div key={idx} className={`p-3 rounded-lg ${darkMode ? "bg-gray-700/50" : "bg-white"} border ${darkMode ? "border-gray-600" : "border-gray-300"}`}>
                        <div className="flex items-start gap-3">
                          <Landmark size={20} className="text-emerald-500 mt-1 flex-shrink-0" />
                          <div>
                            <h5 className={`font-semibold ${darkMode ? "text-gray-100" : "text-gray-900"}`}>{dest.name}</h5>
                            {dest.duration && <p className={`text-xs ${darkMode ? "text-gray-400" : "text-gray-600"} mt-1`}>Duration: {dest.duration}</p>}
                            {dest.description && <p className={`text-sm mt-1 ${darkMode ? "text-gray-300" : "text-gray-700"}`}>{dest.description}</p>}
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Itinerary */}
              {selectedTourDetails.itinerary && selectedTourDetails.itinerary.length > 0 && (
                <div className={`p-5 rounded-xl ${darkMode ? "bg-gray-800/60" : "bg-gray-50"}`}>
                  <h4 className={`font-bold text-base mb-4 ${darkMode ? "text-gray-200" : "text-gray-900"} flex items-center gap-2`}><Calendar size={18} /> Day-by-Day Itinerary</h4>
                  <div className="space-y-3">
                    {selectedTourDetails.itinerary.map((item, idx) => (
                      <div key={idx} className={`p-4 rounded-lg ${darkMode ? "bg-gray-700/50" : "bg-white"} border-l-4 border-emerald-500`}>
                        <div className="flex justify-between items-start gap-2">
                          <h5 className={`font-semibold text-sm ${darkMode ? "text-emerald-300" : "text-emerald-700"}`}>Day {item.day}</h5>
                          <span className={`text-xs px-2 py-1 rounded ${darkMode ? "bg-gray-600" : "bg-gray-200"}`}>{item.title}</span>
                        </div>
                        {item.description && (
                          <p className={`text-sm mt-2 ${darkMode ? "text-gray-300" : "text-gray-700"}`}>{item.description}</p>
                        )}
                        {item.activities && item.activities.length > 0 && (
                          <div className="mt-2 flex flex-wrap gap-2">
                            {item.activities.map((activity, aidx) => (
                              <span key={aidx} className={`text-xs px-2 py-1 rounded-full ${darkMode ? "bg-blue-900/40 text-blue-300" : "bg-blue-100 text-blue-700"}`}>
                                {activity}
                              </span>
                            ))}
                          </div>
                        )}
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Features */}
              {selectedTourDetails.features && selectedTourDetails.features.length > 0 && (
                <div className={`p-5 rounded-xl ${darkMode ? "bg-purple-900/20" : "bg-purple-50"}`}>
                  <h4 className={`font-bold text-base mb-4 text-purple-600 dark:text-purple-400 flex items-center gap-2`}><Star size={18} /> Special Features</h4>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
                    {selectedTourDetails.features.map((feature, idx) => (
                      <div key={idx} className="flex items-center gap-2">
                        <Check size={18} className="text-purple-500 flex-shrink-0" />
                        <span className={`text-sm ${darkMode ? "text-gray-300" : "text-gray-700"}`}>{feature}</span>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Inclusions & Exclusions */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {selectedTourDetails.inclusions && selectedTourDetails.inclusions.length > 0 && (
                  <div className={`p-5 rounded-xl ${darkMode ? "bg-emerald-900/20" : "bg-emerald-50"}`}>
                    <h4 className={`font-bold text-base mb-3 text-emerald-600 dark:text-emerald-400 flex items-center gap-2`}><CheckCircle size={18} /> Inclusions</h4>
                    <ul className="space-y-2">
                      {selectedTourDetails.inclusions.map((item, idx) => (
                        <li key={idx} className="flex items-start gap-2">
                          <Check size={16} className="text-emerald-500 mt-0.5 flex-shrink-0" />
                          <span className={`text-sm ${darkMode ? "text-gray-300" : "text-gray-700"}`}>{item}</span>
                        </li>
                      ))}
                    </ul>
                  </div>
                )}
                {selectedTourDetails.exclusions && selectedTourDetails.exclusions.length > 0 && (
                  <div className={`p-5 rounded-xl ${darkMode ? "bg-red-900/20" : "bg-red-50"}`}>
                    <h4 className={`font-bold text-base mb-3 text-red-600 dark:text-red-400 flex items-center gap-2`}><XCircle size={18} /> Exclusions</h4>
                    <ul className="space-y-2">
                      {selectedTourDetails.exclusions.map((item, idx) => (
                        <li key={idx} className="flex items-start gap-2">
                          <X size={16} className="text-red-500 mt-0.5 flex-shrink-0" />
                          <span className={`text-sm ${darkMode ? "text-gray-300" : "text-gray-700"}`}>{item}</span>
                        </li>
                      ))}
                    </ul>
                  </div>
                )}
              </div>

              {/* Pickup & Drop Locations */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {selectedTourDetails.pickupLocations && selectedTourDetails.pickupLocations.length > 0 && (
                  <div className={`p-5 rounded-xl ${darkMode ? "bg-gray-800/60" : "bg-gray-50"}`}>
                    <h4 className={`font-bold text-base mb-3 ${darkMode ? "text-blue-300" : "text-blue-700"}`}>Pickup Locations</h4>
                    <ul className="space-y-2">
                      {selectedTourDetails.pickupLocations.map((location, idx) => (
                        <li key={idx} className="flex items-center gap-2">
                          <MapPin size={16} className="text-blue-500 flex-shrink-0" />
                          <span className={`text-sm ${darkMode ? "text-gray-300" : "text-gray-700"}`}>{location}</span>
                        </li>
                      ))}
                    </ul>
                  </div>
                )}
                {selectedTourDetails.dropLocations && selectedTourDetails.dropLocations.length > 0 && (
                  <div className={`p-5 rounded-xl ${darkMode ? "bg-gray-800/60" : "bg-gray-50"}`}>
                    <h4 className={`font-bold text-base mb-3 ${darkMode ? "text-orange-300" : "text-orange-700"}`}>Drop Locations</h4>
                    <ul className="space-y-2">
                      {selectedTourDetails.dropLocations.map((location, idx) => (
                        <li key={idx} className="flex items-center gap-2">
                          <MapPin size={16} className="text-orange-500 flex-shrink-0" />
                          <span className={`text-sm ${darkMode ? "text-gray-300" : "text-gray-700"}`}>{location}</span>
                        </li>
                      ))}
                    </ul>
                  </div>
                )}
              </div>

              {/* Cancellation Policy */}
              {selectedTourDetails.cancellationPolicy && (
                <div className={`p-5 rounded-xl ${darkMode ? "bg-gray-800/60" : "bg-gray-50"}`}>
                  <h4 className={`font-bold text-base mb-3 ${darkMode ? "text-red-300" : "text-red-700"}`}>Cancellation Policy</h4>
                  <p className={`text-sm leading-relaxed ${darkMode ? "text-gray-300" : "text-gray-700"}`}>{selectedTourDetails.cancellationPolicy}</p>
                </div>
              )}

              {/* Terms & Conditions */}
              {selectedTourDetails.termsAndConditions && selectedTourDetails.termsAndConditions.length > 0 && (
                <div className={`p-5 rounded-xl ${darkMode ? "bg-gray-800/60" : "bg-gray-50"}`}>
                  <h4 className={`font-bold text-base mb-3 ${darkMode ? "text-gray-200" : "text-gray-900"}`}>Terms & Conditions</h4>
                  <ul className="space-y-2">
                    {selectedTourDetails.termsAndConditions.map((term, idx) => (
                      <li key={idx} className={`text-sm flex items-start gap-2 ${darkMode ? "text-gray-300" : "text-gray-700"}`}>
                        <span className="text-emerald-500 flex-shrink-0 mt-1">•</span>
                        <span>{term}</span>
                      </li>
                    ))}
                  </ul>
                </div>
              )}

              {/* Gallery */}
              {selectedTourDetails.images && selectedTourDetails.images.length > 0 && (
                <div className={`p-5 rounded-xl ${darkMode ? "bg-gray-800/60" : "bg-gray-50"}`}>
                  <h4 className={`font-bold text-base mb-4 ${darkMode ? "text-gray-200" : "text-gray-900"}`}>Gallery</h4>
                  <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
                    {selectedTourDetails.images.map((img, idx) => (
                      <div key={idx} className="rounded-lg overflow-hidden aspect-square">
                        <img
                          src={img}
                          alt={`Gallery ${idx + 1}`}
                          className="w-full h-full object-cover hover:scale-110 transition transform duration-300"
                          onError={(e) => {
                            e.target.src = 'https://images.unsplash.com/photo-1600100397608-f010e423b971?auto=format&fit=crop&q=80&w=400';
                          }}
                        />
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Action Buttons */}
              <div className="sticky bottom-0 pt-4 pb-4 grid grid-cols-2 gap-3 bg-inherit">
                <button
                  type="button"
                  onClick={handleCloseTourDetailsModal}
                  className={`py-3 rounded-lg border font-bold text-sm transition ${darkMode
                    ? "border-gray-600 text-gray-100 hover:bg-gray-800"
                    : "border-gray-300 text-gray-800 hover:bg-gray-100"
                    }`}
                >
                  Close
                </button>
                <button
                  type="button"
                  onClick={handleBookFromDetails}
                  className="py-3 rounded-lg bg-gradient-to-r from-blue-500 to-emerald-600 text-white font-bold text-sm hover:shadow-lg transition"
                >
                  Book Now
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Tour Booking Modal */}
      <TourBookingModal
        isOpen={isTourModalOpen}
        onClose={handleCloseTourModal}
        tourName={selectedTour.name}
        packagePrice={selectedTour.price}
        packageId={selectedTour.id}
        carTypes={carTypes}
        pricing={selectedTour.pricing}
      />

      {/* Ride Booking Modal */}
      <RideBookingModal
        isOpen={isRideBookingModalOpen}
        onClose={() => setIsRideBookingModalOpen(false)}
        rideType={rideType}
        pickupLocation={pickupLocation}
        destination={destination}
        distance={distance}
        duration={duration}
        estimatedFare={estimatedFare}
        bookingDate={bookingDate}
        bookingTime={bookingTime}
        carTypes={carTypes}
      />

      {/* Airport Booking Form Modal */}
      {showAirportForm && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm">
          <div className={`${darkMode ? "bg-gray-900 border-gray-800" : "bg-white border-slate-200"} w-full max-w-2xl rounded-2xl border shadow-2xl overflow-y-auto max-h-[90vh]`}>
            {/* Header */}
            <div className={`sticky top-0 px-6 py-4 flex items-center justify-between border-b ${darkMode ? "bg-gray-800 border-gray-700" : "bg-slate-50 border-slate-200"}`}>
              <div className="flex items-center gap-3">
                <Plane className={`${darkMode ? "text-emerald-400" : "text-emerald-600"}`} size={28} />
                <div>
                  <h2 className={`text-xl font-bold ${darkMode ? "text-white" : "text-slate-900"}`}>
                    Complete Airport Booking
                  </h2>
                  <p className={`text-sm ${darkMode ? "text-gray-400" : "text-slate-600"}`}>
                    {airportRideType === "pickup" ? "Pickup from Airport" : "Drop to Airport"}
                  </p>
                </div>
              </div>
              <button
                onClick={() => setShowAirportForm(false)}
                className={`p-2 rounded-lg transition ${darkMode ? "hover:bg-gray-700 text-gray-400" : "hover:bg-slate-100 text-slate-600"}`}
              >
                <X size={24} />
              </button>
            </div>

            {/* Content */}
            <div className="p-6 space-y-5">
              {airportBookingError && (
                <div className="p-4 rounded-lg bg-red-500/10 border border-red-500/50 text-red-500 text-sm">
                  {airportBookingError}
                </div>
              )}

              {/* Location Info */}
              <div className={`p-4 rounded-xl border ${darkMode ? "bg-slate-800/50 border-slate-700" : "bg-slate-50 border-slate-200"}`}>
                <p className={`text-sm font-semibold mb-2 ${darkMode ? "text-gray-300" : "text-slate-700"}`}>
                  {airportRideType === "pickup" ? <><MapPin size={16} /> Pickup from Airport → Destination:</> : <><MapPin size={16} /> Pickup Location → Airport:</>}
                </p>
                <p className={`text-lg font-bold ${darkMode ? "text-emerald-400" : "text-emerald-600"}`}>
                  {airportLocation}
                </p>
              </div>

              {/* Date and Time */}
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className={`block text-sm font-semibold mb-2 ${darkMode ? "text-gray-200" : "text-slate-900"}`}>
                    Travel Date
                  </label>
                  <input
                    type="date"
                    value={airportDate}
                    onChange={(e) => setAirportDate(e.target.value)}
                    className={`w-full px-4 py-2.5 rounded-lg border font-medium ${darkMode ? "bg-slate-800 border-slate-700 text-white" : "bg-white border-slate-300 text-slate-900"}`}
                  />
                </div>
                <div>
                  <label className={`block text-sm font-semibold mb-2 ${darkMode ? "text-gray-200" : "text-slate-900"}`}>
                    Departure Time
                  </label>
                  <input
                    type="time"
                    value={airportTime}
                    onChange={(e) => setAirportTime(e.target.value)}
                    className={`w-full px-4 py-2.5 rounded-lg border font-medium ${darkMode ? "bg-slate-800 border-slate-700 text-white" : "bg-white border-slate-300 text-slate-900"}`}
                  />
                </div>
              </div>

              {/* Vehicle Selection */}
              <div>
                <label className={`block text-sm font-semibold mb-3 ${darkMode ? "text-gray-200" : "text-slate-900"}`}>
                  Select Vehicle
                </label>
                {carsLoading ? (
                  <div className="flex items-center justify-center py-8">
                    <Loader size={32} className={`animate-spin ${darkMode ? "text-emerald-400" : "text-emerald-600"}`} />
                  </div>
                ) : availableCarTypes.length === 0 ? (
                  <div className={`text-center py-6 ${darkMode ? "text-gray-400" : "text-slate-600"}`}>
                    No vehicles available
                  </div>
                ) : (
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                    {availableCarTypes.map((car) => {
                      const carPricing = airportPricing[car.id] || { fixedCharge: 0, parkingCharge: 0 };
                      const totalFare = (carPricing.fixedCharge || 0) + (carPricing.parkingCharge || 0);

                      return (
                        <button
                          key={car.id}
                          onClick={() => setSelectedCarType(car.id)}
                          className={`p-5 rounded-xl border-2 text-left transition ${selectedCarType === car.id
                            ? darkMode
                              ? "border-emerald-500 bg-emerald-500/15"
                              : "border-emerald-400 bg-emerald-50"
                            : darkMode
                              ? "border-slate-700 bg-slate-800/50 hover:border-slate-600"
                              : "border-slate-300 bg-white hover:border-slate-400"
                            }`}
                        >
                          <div className="flex justify-between items-start mb-3 gap-2">
                            <div className="flex-1">
                              <p className={`font-bold text-base ${selectedCarType === car.id ? (darkMode ? "text-emerald-300" : "text-emerald-700") : (darkMode ? "text-white" : "text-slate-900")}`}>
                                {car.name}
                              </p>
                              {car.description && (
                                <p className={`text-xs mt-1 ${darkMode ? "text-gray-400" : "text-slate-500"}`}>
                                  {car.description}
                                </p>
                              )}
                            </div>
                            <span className={`text-sm font-bold px-3 py-1.5 rounded-lg whitespace-nowrap ${selectedCarType === car.id
                              ? darkMode
                                ? "bg-emerald-400/30 text-emerald-200"
                                : "bg-emerald-200 text-emerald-800"
                              : darkMode
                                ? "bg-slate-700 text-slate-300"
                                : "bg-slate-200 text-slate-700"
                              }`}>
                              ₹{totalFare.toLocaleString('en-IN')}
                            </span>
                          </div>
                          <div className="flex items-center gap-3 text-sm">
                            <span className={`flex items-center gap-1 ${selectedCarType === car.id ? (darkMode ? "text-emerald-300/80" : "text-emerald-600/80") : (darkMode ? "text-gray-400" : "text-slate-600")}`}>
                              <Users size={16} /> {car.passengers} Passengers
                            </span>
                            {car.capacity && (
                              <span className={`flex items-center gap-1 ${selectedCarType === car.id ? (darkMode ? "text-emerald-300/80" : "text-emerald-600/80") : (darkMode ? "text-gray-400" : "text-slate-600")}`}>
                                <Briefcase size={16} /> {car.capacity}
                              </span>
                            )}
                          </div>
                          {car.features && car.features.length > 0 && (
                            <div className="mt-3 flex flex-wrap gap-1">
                              {car.features.map((feature, idx) => (
                                <span key={idx} className={`text-xs px-2 py-1 rounded-lg ${selectedCarType === car.id
                                  ? darkMode
                                    ? "bg-emerald-400/20 text-emerald-300"
                                    : "bg-emerald-100 text-emerald-700"
                                  : darkMode
                                    ? "bg-slate-700/50 text-slate-300"
                                    : "bg-slate-100 text-slate-600"
                                  }`}>
                                  {feature}
                                </span>
                              ))}
                            </div>
                          )}
                        </button>
                      );
                    })}
                  </div>
                )}
              </div>

              {/* Fare Summary */}
              {selectedCarType && airportPricing[selectedCarType] && (
                <div className={`p-5 rounded-xl border ${darkMode ? "bg-slate-800/50 border-slate-700" : "bg-slate-50 border-slate-300"}`}>
                  <h3 className={`text-base font-bold mb-4 ${darkMode ? "text-emerald-300" : "text-emerald-700"}`}>
                    <Wallet size={18} /> Fare Breakdown
                  </h3>
                  <div className="space-y-3 text-sm">
                    <div className="flex justify-between items-center">
                      <span className={darkMode ? "text-gray-300" : "text-slate-700"}>Base Fare (Flat Rate)</span>
                      <span className={`font-semibold ${darkMode ? "text-white" : "text-slate-900"}`}>
                        ₹{Math.round(airportPricing[selectedCarType].fixedCharge || 0).toLocaleString('en-IN')}
                      </span>
                    </div>

                    {(airportPricing[selectedCarType].parkingCharge || 0) > 0 && (
                      <div className="flex justify-between items-center">
                        <span className={darkMode ? "text-gray-300" : "text-slate-700"}>Parking Fee</span>
                        <span className={`font-semibold ${darkMode ? "text-white" : "text-slate-900"}`}>
                          ₹{Math.round(airportPricing[selectedCarType].parkingCharge || 0).toLocaleString('en-IN')}
                        </span>
                      </div>
                    )}

                    <div className={`my-2 h-px ${darkMode ? "bg-slate-700" : "bg-slate-300"}`} />

                    {(() => {
                      const totalFare = (airportPricing[selectedCarType].fixedCharge || 0) + (airportPricing[selectedCarType].parkingCharge || 0);
                      const advancePayment = Math.round(totalFare * 0.2);
                      const remainingPayment = totalFare - advancePayment;

                      return (
                        <>
                          <div className="flex justify-between items-center">
                            <span className={`font-bold ${darkMode ? "text-white" : "text-slate-900"}`}>Total Fare</span>
                            <span className={`text-lg font-bold ${darkMode ? "text-emerald-400" : "text-emerald-600"}`}>
                              ₹{totalFare.toLocaleString('en-IN')}
                            </span>
                          </div>

                          <div className={`mt-3 p-3 rounded-lg ${darkMode ? "bg-emerald-500/10 border border-emerald-500/30" : "bg-emerald-50 border border-emerald-200"}`}>
                            <p className={`text-xs font-semibold mb-2 ${darkMode ? "text-emerald-300" : "text-emerald-700"}`}>
                              20% Advance Payment Model
                            </p>
                            <div className="flex justify-between text-xs">
                              <span className={darkMode ? "text-gray-300" : "text-slate-700"}>Pay Now:</span>
                              <span className={`font-bold ${darkMode ? "text-green-400" : "text-green-600"}`}>
                                ₹{advancePayment.toLocaleString('en-IN')}
                              </span>
                            </div>
                            <div className="flex justify-between text-xs mt-2">
                              <span className={darkMode ? "text-gray-300" : "text-slate-700"}>Pay After Ride:</span>
                              <span className={`font-bold ${darkMode ? "text-orange-400" : "text-orange-600"}`}>
                                ₹{remainingPayment.toLocaleString('en-IN')}
                              </span>
                            </div>
                          </div>
                        </>
                      );
                    })()}
                  </div>
                </div>
              )}

              {/* Booking Buttons */}
              <div className="flex gap-3 pt-4">
                <button
                  onClick={() => setShowAirportForm(false)}
                  className={`flex-1 py-3 rounded-lg font-bold transition ${darkMode
                    ? "bg-slate-800 text-gray-200 hover:bg-slate-700"
                    : "bg-slate-200 text-slate-900 hover:bg-slate-300"
                    }`}
                >
                  Back
                </button>
                <button
                  onClick={handleAirportPayment}
                  disabled={airportPaymentLoading}
                  className={`flex-1 py-3 rounded-lg font-bold bg-gradient-to-r from-emerald-500 to-blue-600 text-white hover:shadow-lg transition ${airportPaymentLoading ? "opacity-50 cursor-not-allowed" : ""
                    }`}
                >
                  {airportPaymentLoading ? (
                    <span className="flex items-center justify-center gap-2">
                      <svg className="animate-spin h-5 w-5" viewBox="0 0 24 24">
                        <circle
                          className="opacity-25"
                          cx="12"
                          cy="12"
                          r="10"
                          stroke="currentColor"
                          strokeWidth="4"
                          fill="none"
                        />
                        <path
                          className="opacity-75"
                          fill="currentColor"
                          d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                        />
                      </svg>
                      Processing...
                    </span>
                  ) : (
                    "Continue to Payment"
                  )}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}



      {/* How It Works Redesigned */}
      <section
        id="how-it-works"
        className={`py-24 md:py-32 px-4 md:px-12 ${darkMode ? "bg-gray-800" : "bg-slate-50"} relative overflow-hidden`}
      >
        <div className="max-w-7xl mx-auto">
          <div className="flex flex-col items-center text-center mb-20">
            <h2 className="text-3xl md:text-5xl font-black text-slate-900 dark:text-white mb-4">
              Your Journey in <span className="text-emerald-600">3 Simple Steps</span>
            </h2>
            <p className={`max-w-2xl ${darkMode ? "text-gray-400" : "text-slate-500"} font-medium`}>
              We've streamlined the booking process to ensure you can get on the road in under 2 minutes.
            </p>
          </div>

          <div className="grid md:grid-cols-3 gap-12 relative">
            {/* Connection Line */}
            <div className="hidden md:block absolute top-1/3 left-0 w-full h-px border-t-2 border-dashed border-emerald-500/20 -z-0" />

            {howItWorksSteps.map((item, i) => {
              const Icon = item.icon;
              return (
                <div key={i} className="relative z-10 flex flex-col items-center text-center group">
                  <div className={`w-24 h-24 rounded-full ${darkMode ? "bg-gray-700" : "bg-white"} shadow-2xl flex items-center justify-center mb-8 border-4 ${darkMode ? "border-emerald-500/20" : "border-emerald-50"} transition-all duration-500 group-hover:scale-110 group-hover:border-emerald-500`}>
                    <Icon size={40} className="text-emerald-600" />
                    <div className="absolute -top-2 -right-2 w-10 h-10 bg-gradient-to-br from-emerald-500 to-blue-600 text-white rounded-full flex items-center justify-center font-black text-sm shadow-lg">
                      {item.step}
                    </div>
                  </div>
                  <h3 className={`text-xl font-bold mb-4 ${darkMode ? "text-white" : "text-slate-900"}`}>{item.title}</h3>
                  <p className={`text-sm leading-relaxed ${darkMode ? "text-gray-400" : "text-slate-500"} font-medium px-6`}>
                    {item.description}
                  </p>
                </div>
              );
            })}
          </div>
        </div>
      </section>

      {/* Traveler Reviews */}
      <section
        id="reviews"
        className={`py-16 md:py-20 px-4 md:px-12 ${darkMode ? "bg-gradient-to-br from-gray-800 to-gray-900" : "bg-gradient-to-br from-emerald-50 via-blue-50 to-purple-50"} transition-colors duration-300`}
      >
        <h2 className="text-3xl md:text-4xl font-extrabold text-center mb-12 md:mb-16 text-emerald-600">
          Traveler Reviews
        </h2>

        {loadingReviews ? (
          <div className="flex items-center justify-center min-h-64">
            <Loader size={40} className="animate-spin text-emerald-600" />
          </div>
        ) : reviewsError ? (
          <div
            className={`text-center py-12 ${darkMode ? "text-gray-400" : "text-gray-600"}`}
          >
            <p>{reviewsError}</p>
          </div>
        ) : reviews.length === 0 ? (
          <div
            className={`text-center py-12 ${darkMode ? "text-gray-400" : "text-gray-600"}`}
          >
            <p>No reviews available yet</p>
          </div>
        ) : (
          <div className="grid md:grid-cols-3 gap-6 md:gap-8">
            {reviews.map((review, i) => (
              <div
                key={i}
                className={`${darkMode ? "bg-gray-800 border-gray-700" : "bg-white border-gray-100"} p-6 md:p-8 rounded-2xl md:rounded-3xl shadow-md hover:shadow-xl hover:scale-105 transition transform border relative duration-300`}
              >
                <div className={`flex gap-1 mb-4`}>
                  {[...Array(review.rating || 5)].map((_, idx) => (
                    <Star
                      key={idx}
                      size={18}
                      fill="#fbbf24"
                      className="text-amber-400"
                    />
                  ))}
                </div>
                <p
                  className={`${darkMode ? "text-gray-300" : "text-gray-700"} text-sm md:text-base mb-6 leading-relaxed transition-colors duration-300`}
                >
                  "{review.feedback}"
                </p>
                <div className="flex items-center gap-3">
                  <ReviewAvatar profileImage={review.profileImage} name={review.name} darkMode={darkMode} />
                  <div>
                    <h5
                      className={`font-bold text-sm md:text-base ${darkMode ? "text-gray-100" : ""} transition-colors duration-300`}
                    >
                      {review.name}
                    </h5>
                    <p
                      className={`text-xs md:text-sm ${darkMode ? "text-gray-400" : "text-gray-500"} transition-colors duration-300`}
                    >
                      {new Date(review.createdAt).toLocaleDateString()}
                    </p>
                  </div>
                </div>
                <div
                  className={`absolute top-6 right-6 opacity-30 ${darkMode ? "text-gray-600" : "text-gray-100"} transition-colors duration-300`}
                >
                  <MessageSquare size={24} />
                </div>
              </div>
            ))}
          </div>
        )}
      </section>

      <Footer darkMode={darkMode} />
    </div>
    </>
  );
};
export default GoelectriqLanding;