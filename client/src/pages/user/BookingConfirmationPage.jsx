import { useLocation, useNavigate, useParams } from "react-router-dom";
import { useState, useEffect } from "react";
import {
  CheckCircle,
  XCircle,
  Clock,
  Share2,
  Phone,
  MessageSquare,
  HelpCircle,
  Printer,
  ArrowLeft,
  AlertCircle,
  FileText,
} from "lucide-react";
import UserLayout from "./UserLayout.jsx";
import * as bookingService from "../../services/bookingService.js";

/**
 * BookingConfirmationPage - TABLE FORMAT
 *
 * Shows confirmation after booking is created
 * Displays all booking details in an organized table format
 *
 * Can be accessed via:
 * 1. Direct navigation with location.state (contains booking data)
 * 2. URL params with booking ID (fetches from backend)
 * 3. localStorage fallback for last booking
 */
export default function BookingConfirmationPage() {
  const location = useLocation();
  const navigate = useNavigate();
  const params = useParams();

  const [booking, setBooking] = useState(location.state?.booking || null);
  const [message, setMessage] = useState(location.state?.message || "");
  const [loading, setLoading] = useState(!booking);
  const [error, setError] = useState("");
  const [refreshing, setRefreshing] = useState(false);

  // Fetch booking data if not available in location.state
  useEffect(() => {
    if (booking) {
      // Booking data already loaded from navigation
      setLoading(false);
      // Store the booking ID in localStorage for reference
      if (booking._id) {
        localStorage.setItem('lastViewedBookingId', booking._id);
        console.log("✅ Booking stored in localStorage:", booking._id);
      }
      return;
    }

    const fetchBooking = async () => {
      try {
        let bookingId = params.bookingId;
        
        // If no bookingId in params, try to get from query string (?id=...)
        if (!bookingId) {
          const queryParams = new URLSearchParams(location.search);
          bookingId = queryParams.get('id');
          if (bookingId) {
            console.log("📱 Got booking ID from query parameter:", bookingId);
          }
        }

        // If still no bookingId, try to get from localStorage (for page refresh)
        if (!bookingId) {
          bookingId = localStorage.getItem('lastViewedBookingId');
          if (bookingId) {
            console.log("📱 Got booking ID from localStorage:", bookingId);
          }
        }

        if (!bookingId) {
          console.log("⚠️ No booking ID found in params, query, or localStorage");
          setLoading(false);
          return;
        }

        console.log("📱 Fetching booking with ID:", bookingId);
        // Fetch the booking from backend
        const res = await bookingService.getBookingById(bookingId);
        console.log("📱 Response from backend:", res);

        if (res?.data) {
          setBooking(res.data);
          setMessage("Booking loaded successfully");
          // Update localStorage with the successfully loaded booking ID
          localStorage.setItem('lastViewedBookingId', bookingId);
          console.log("✅ Booking loaded and stored successfully");
        } else {
          console.error("⚠️ No data in response:", res);
          setError("Booking not found. It may have been deleted.");
        }
      } catch (err) {
        console.error("❌ Error fetching booking:", err);
        // Don't show error, just show the empty state
      } finally {
        setLoading(false);
      }
    };

    fetchBooking();
  }, [booking, params.bookingId, location.search]);

  // Auto-refresh booking status every 10 seconds to check for cancellations/completions
  useEffect(() => {
    if (!booking?._id) return;

    const interval = setInterval(async () => {
      try {
        setRefreshing(true);
        const res = await bookingService.getBookingById(booking._id);
        if (res?.data) {
          const newStatus = res.data.status?.toLowerCase();

          // If booking is cancelled or completed, show message and redirect after 3 seconds
          if (newStatus === "cancelled" || newStatus === "completed") {
            console.log("📱 Booking status changed to:", newStatus);
            setBooking(res.data);
            setMessage(`Booking ${newStatus}. Redirecting to your bookings...`);

            // Redirect after 3 seconds
            setTimeout(() => {
              navigate("/user/bookings");
            }, 3000);

            // Clear interval to stop refreshing
            clearInterval(interval);
            return;
          }

          // Update booking with latest data
          setBooking(res.data);
          console.log("📱 Booking status refreshed:", res.data.status);
        }
      } catch (err) {
        console.error("Error auto-refreshing booking:", err);
      } finally {
        setRefreshing(false);
      }
    }, 10000); // Refresh every 10 seconds

    return () => clearInterval(interval);
  }, [booking?._id, navigate]);

  if (!booking) {
    if (loading) {
      return (
        <UserLayout>
          <div className="min-h-screen flex items-center justify-center p-4">
            <div className="text-center">
              <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-green-500 mx-auto mb-4"></div>
              <p className="text-gray-600">
                Loading booking details...
              </p>
            </div>
          </div>
        </UserLayout>
      );
    }

    return (
      <UserLayout>
        <div className="min-h-screen flex items-center justify-center p-4">
          <div className="text-center bg-white p-8 rounded-lg shadow-lg max-w-md border border-slate-100">
            <div className="mb-4">
              <FileText size={60} className="text-emerald-500 mx-auto" />
            </div>
            <h1 className="text-2xl font-bold text-gray-900 mb-3">
              Booking not found
            </h1>
            <p className="text-gray-600 mb-6">
              The booking details are not available. This may happen if the page
              was refreshed or the session expired.
            </p>
            <div className="flex flex-col gap-3">
              <button
                onClick={() => navigate("/user/bookings")}
                className="px-6 py-3 bg-green-600 hover:bg-green-700 text-white rounded-lg transition font-semibold"
              >
                View My Bookings
              </button>
              <button
                onClick={() => navigate("/")}
                className="px-6 py-3 bg-gray-200 hover:bg-gray-300 text-gray-900 rounded-lg transition font-semibold"
              >
                Back to Home
              </button>
            </div>
          </div>
        </div>
      </UserLayout>
    );
  }

  const handleShare = () => {
    const text = `I just booked a ${booking.rideType} ride with GoElectriQ! Booking ID: ${booking.bookingId}`;

    // Check if Web Share API is supported
    if (navigator.share && typeof navigator.share === "function") {
      navigator
        .share({
          title: "GoElectriQ Booking",
          text: text,
        })
        .catch((err) => {
          // User cancelled or error occurred
          if (err.name !== "AbortError") {
            console.error("Share error:", err);
            fallbackShare();
          }
        });
    } else {
      fallbackShare();
    }
  };

  const fallbackShare = () => {
    const text = `I just booked a ${booking.rideType} ride with GoElectriQ! Booking ID: ${booking.bookingId}`;
    navigator.clipboard.writeText(text);
    alert("Booking details copied to clipboard!");
  };

  // Get status configuration based on booking status
  const getStatusConfig = () => {
    const status = booking.status?.toLowerCase() || "pending";

    const configs = {
      confirmed: {
        title: "Booking Confirmed",
        icon: CheckCircle,
        bgColor: "from-green-50 to-emerald-50",
        borderColor: "border-green-200",
        badgeColor: "bg-green-600",
        textColor: "text-green-900",
        badgeText: "text-white",
        message: "Your ride is confirmed and ready!",
        iconColor: "text-white",
      },
      completed: {
        title: "Ride Completed",
        icon: CheckCircle,
        bgColor: "from-emerald-50 to-teal-50",
        borderColor: "border-emerald-200",
        badgeColor: "bg-emerald-600",
        textColor: "text-emerald-900",
        badgeText: "text-white",
        message: "Thank you for riding with us!",
        iconColor: "text-white",
      },
      cancelled: {
        title: "Booking Cancelled",
        icon: XCircle,
        bgColor: "from-red-50 to-rose-50",
        borderColor: "border-red-200",
        badgeColor: "bg-red-600",
        textColor: "text-red-900",
        badgeText: "text-white",
        message: "This booking has been cancelled.",
        iconColor: "text-white",
      },
      pending: {
        title: "Booking Pending",
        icon: Clock,
        bgColor: "from-yellow-50 to-amber-50",
        borderColor: "border-yellow-200",
        badgeColor: "bg-yellow-600",
        textColor: "text-yellow-900",
        badgeText: "text-white",
        message: "Your booking is awaiting confirmation.",
        iconColor: "text-white",
      },
      ongoing: {
        title: "Ride in Progress",
        icon: AlertCircle,
        bgColor: "from-purple-50 to-indigo-50",
        borderColor: "border-purple-200",
        badgeColor: "bg-purple-600",
        textColor: "text-purple-900",
        badgeText: "text-white",
        message: "Your ride is currently on the way!",
        iconColor: "text-white",
      },
    };

    return configs[status] || configs.pending;
  };

  const statusConfig = getStatusConfig();

  // Get table header color based on status
  const getTableHeaderColor = () => {
    const status = booking.status?.toLowerCase() || "pending";
    const colors = {
      confirmed: "from-green-600 to-emerald-600",
      completed: "from-emerald-600 to-teal-600",
      cancelled: "from-red-600 to-rose-600",
      pending: "from-yellow-600 to-amber-600",
      ongoing: "from-purple-600 to-indigo-600",
    };
    return colors[status] || colors.pending;
  };

  // Get fare row color based on status
  const getFareRowColor = () => {
    const status = booking.status?.toLowerCase() || "pending";
    const colors = {
      confirmed: "bg-green-50 hover:bg-green-100",
      completed: "bg-emerald-50 hover:bg-emerald-100",
      cancelled: "bg-red-50 hover:bg-red-100",
      pending: "bg-yellow-50 hover:bg-yellow-100",
      ongoing: "bg-purple-50 hover:bg-purple-100",
    };
    return colors[status] || colors.pending;
  };

  // Get fare amount text color based on status
  const getFareTextColor = () => {
    const status = booking.status?.toLowerCase() || "pending";
    const colors = {
      confirmed: "text-green-600",
      completed: "text-emerald-600",
      cancelled: "text-red-600",
      pending: "text-yellow-600",
      ongoing: "text-purple-600",
    };
    return colors[status] || colors.pending;
  };

  return (
    <UserLayout>
      <div className="max-w-6xl mx-auto px-4 py-8">
        {/* Redirect Notification - Show when booking is cancelled or completed */}
        {(booking.status?.toLowerCase() === "cancelled" ||
          booking.status?.toLowerCase() === "completed") &&
          message?.includes("Redirecting") && (
            <div
              className={`mb-6 p-4 rounded-lg border-2 ${booking.status?.toLowerCase() === "cancelled"
                  ? "bg-red-50 border-red-200 text-red-700"
                  : "bg-emerald-50 border-emerald-200 text-emerald-700"
                }`}
            >
              <div className="flex items-center gap-3">
                <div className="animate-spin">
                  <div className="w-5 h-5 border-2 border-current border-t-transparent rounded-full"></div>
                </div>
                <span className="font-semibold">{message}</span>
              </div>
            </div>
          )}

        {/* Back Button */}
        <button
          onClick={() => navigate(-1)}
          className="flex items-center gap-2 mb-6 px-4 py-2 text-green-600 hover:bg-green-50 rounded-lg transition font-medium"
        >
          <ArrowLeft size={20} />
          Go Back
        </button>

        {/* Success Header - Dynamic based on booking status */}
        <div
          className={`text-center mb-8 bg-gradient-to-br ${statusConfig.bgColor} p-8 rounded-2xl border-2 ${statusConfig.borderColor}`}
        >
          <div
            className={`inline-block p-4 ${statusConfig.badgeColor} rounded-full`}
          >
            {(() => {
              const IconComponent = statusConfig.icon;
              return (
                <IconComponent
                  className={`w-16 h-16 ${statusConfig.iconColor}`}
                />
              );
            })()}
          </div>
          <h1
            className={`text-4xl font-bold ${statusConfig.textColor} mt-6 mb-2`}
          >
            {statusConfig.title}
          </h1>
          <p className={`text-lg ${statusConfig.textColor}`}>
            {statusConfig.message}
          </p>
          <p className={`text-lg mt-3`}>
            Booking ID:{" "}
            <span className={`font-bold ${statusConfig.textColor}`}>
              {booking.bookingId}
            </span>
          </p>
        </div>

        {/* Main Table Container */}
        <div className="bg-white rounded-2xl shadow-2xl overflow-hidden border border-slate-100">
          {/* Booking Details Table */}
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr
                  className={`bg-gradient-to-r ${getTableHeaderColor()} text-white`}
                >
                  <th className="px-6 py-4 text-left font-semibold">
                    Property
                  </th>
                  <th className="px-6 py-4 text-left font-semibold">Details</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-200">
                {/* Booking Status Row */}
                <tr className="hover:bg-gray-50 transition">
                  <td className="px-6 py-4 font-semibold text-gray-900">
                    Booking Status
                  </td>
                  <td className="px-6 py-4">
                    <span
                      className={`inline-block px-3 py-1 rounded-full text-sm font-semibold ${booking.status?.toLowerCase() === "confirmed"
                          ? "bg-green-100 text-green-700"
                          : booking.status?.toLowerCase() === "completed"
                            ? "bg-blue-100 text-blue-700"
                            : booking.status?.toLowerCase() === "cancelled"
                              ? "bg-red-100 text-red-700"
                              : booking.status?.toLowerCase() === "pending"
                                ? "bg-yellow-100 text-yellow-700"
                                : booking.status?.toLowerCase() === "ongoing"
                                  ? "bg-purple-100 text-purple-700"
                                  : "bg-gray-100 text-gray-700"
                        }`}
                    >
                      {booking.status?.toLowerCase() === "confirmed" && "●"}
                      {booking.status?.toLowerCase() === "completed" && "●"}
                      {booking.status?.toLowerCase() === "cancelled" && "●"}
                      {booking.status?.toLowerCase() === "pending" && "●"}
                      {booking.status?.toLowerCase() === "ongoing" && "●"}
                      {![
                        "confirmed",
                        "completed",
                        "cancelled",
                        "pending",
                        "ongoing",
                      ].includes(booking.status?.toLowerCase()) && "●"}{" "}
                      {booking.status?.toUpperCase() || "PENDING"}
                    </span>
                  </td>
                </tr>

                {/* Payment Status Row */}
                <tr className="hover:bg-gray-50 transition">
                  <td className="px-6 py-4 font-semibold text-gray-900">
                    Payment Status
                  </td>
                  <td className="px-6 py-4">
                    <span
                      className={`inline-block px-3 py-1 rounded-full text-sm font-semibold ${booking.paymentStatus?.toLowerCase() === "paid"
                          ? "bg-green-100 text-green-700"
                          : "bg-yellow-100 text-yellow-700"
                        }`}
                    >
                      {booking.paymentStatus?.toUpperCase() || "PENDING"}
                    </span>
                  </td>
                </tr>

                {/* Pickup Location Row */}
                <tr className="hover:bg-gray-50 transition">
                  <td className="px-6 py-4 font-semibold text-gray-900">
                    Pickup Location
                  </td>
                  <td className="px-6 py-4 text-gray-700">
                    {booking.pickupLocation?.address || "N/A"}
                  </td>
                </tr>

                {/* Drop Location Row */}
                <tr className="hover:bg-gray-50 dark:hover:bg-gray-700/50 transition">
                  <td className="px-6 py-4 font-semibold text-gray-900 dark:text-white">
                    Drop Location
                  </td>
                  <td className="px-6 py-4 text-gray-700 dark:text-gray-300">
                    {booking.dropLocation?.address || "N/A"}
                  </td>
                </tr>

                {/* Distance Row */}
                <tr className="hover:bg-gray-50 transition">
                  <td className="px-6 py-4 font-semibold text-gray-900">
                    Total Distance
                  </td>
                  <td className="px-6 py-4 text-gray-700">
                    <span className="font-bold text-lg">
                      {booking.distance || 0} km
                    </span>
                  </td>
                </tr>

                {/* Ride Type Row */}
                <tr className="hover:bg-gray-50 transition">
                  <td className="px-6 py-4 font-semibold text-gray-900">
                    Ride Type
                  </td>
                  <td className="px-6 py-4 text-gray-700 capitalize">
                    {booking.rideType || "Local"}
                  </td>
                </tr>

                {/* Vehicle Type Row */}
                <tr className="hover:bg-gray-50 transition">
                  <td className="px-6 py-4 font-semibold text-gray-900">
                    Vehicle Type
                  </td>
                  <td className="px-6 py-4 text-gray-700 capitalize">
                    {booking.cabType || "Sedan"}
                  </td>
                </tr>

                {/* Scheduled Date Row */}
                {booking.scheduledDate && (
                  <tr className="hover:bg-gray-50 transition">
                    <td className="px-6 py-4 font-semibold text-gray-900">
                      Scheduled Date
                    </td>
                    <td className="px-6 py-4 text-gray-700">
                      {new Date(booking.scheduledDate).toLocaleDateString(
                        "en-IN",
                        {
                          weekday: "long",
                          year: "numeric",
                          month: "long",
                          day: "numeric",
                        },
                      )}
                    </td>
                  </tr>
                )}

                {/* Scheduled Time Row */}
                {booking.scheduledTime && (
                  <tr className="hover:bg-gray-50 transition">
                    <td className="px-6 py-4 font-semibold text-gray-900">
                      Scheduled Time
                    </td>
                    <td className="px-6 py-4 text-gray-700 font-semibold">
                      {booking.scheduledTime}
                    </td>
                  </tr>
                )}

                {/* Distance/Pricing Breakdown Row - Dynamic based on ride type */}
                {booking.rideType?.toLowerCase() === 'airport' ? (
                  <>
                    {/* Airport Ride: Fixed Charge */}
                    {booking.pricing?.fixedCharge !== undefined && (
                      <tr className="hover:bg-gray-50 transition">
                        <td className="px-6 py-4 font-semibold text-gray-900">
                          Fixed Charge
                          <br />
                          <span className="text-xs text-gray-600 font-normal">
                            (Airport {booking.airportType || 'pickup'})
                          </span>
                        </td>
                        <td className="px-6 py-4 text-gray-700">
                          <span className="font-bold text-green-600">
                            ₹{booking.pricing.fixedCharge.toFixed(2)}
                          </span>
                        </td>
                      </tr>
                    )}
                    {/* Airport Ride: Parking Charge */}
                    {booking.pricing?.parkingCharge !== undefined && booking.pricing?.parkingCharge > 0 && (
                      <tr className="hover:bg-gray-50 dark:hover:bg-gray-700/50 transition">
                        <td className="px-6 py-4 font-semibold text-gray-900 dark:text-white">
                          Parking Charge
                        </td>
                        <td className="px-6 py-4 text-gray-700">
                          <span className="font-bold text-green-600">
                            ₹{booking.pricing.parkingCharge.toFixed(2)}
                          </span>
                        </td>
                      </tr>
                    )}
                  </>
                ) : booking.rideType?.toLowerCase() === 'tour' ? (
                  <>
                    {/* Tour Booking: Package Price */}
                    <tr className="hover:bg-gray-50 dark:hover:bg-gray-700/50 transition">
                      <td className="px-6 py-4 font-semibold text-gray-900 dark:text-white">
                        Package Price
                      </td>
                      <td className="px-6 py-4 text-gray-700">
                        <span className="font-bold text-green-600">
                          ₹{booking.pricing?.totalFare?.toFixed(2) || '0.00'}
                        </span>
                      </td>
                    </tr>
                  </>
                ) : (
                  <>
                    {/* Local/Regular Ride: Distance Charge */}
                    {booking.pricing?.distanceCharge !== undefined && (
                      <tr className="hover:bg-gray-50 dark:hover:bg-gray-700/50 transition">
                        <td className="px-6 py-4 font-semibold text-gray-900 dark:text-white">
                          Distance Charge
                          {booking.pricing?.perKmRate && (
                            <br />
                          )}
                          {booking.pricing?.perKmRate && (
                            <span className="text-xs text-gray-600 font-normal">
                              ({booking.distance} km × ₹{booking.pricing.perKmRate}/km)
                            </span>
                          )}
                        </td>
                        <td className="px-6 py-4 text-gray-700">
                          <span className="font-bold text-green-600">
                            ₹{booking.pricing.distanceCharge.toFixed(2)}
                          </span>
                        </td>
                      </tr>
                    )}
                  </>
                )}

                {/* Total Fare Row - Highlighted with dynamic color */}
                <tr className={`${getFareRowColor()} transition`}>
                  <td className="px-6 py-4 font-bold text-gray-900 text-lg">
                    {booking.rideType?.toLowerCase() === 'airport' ? 'Total Airport Fare' : booking.rideType?.toLowerCase() === 'tour' ? 'Package Total' : 'Total Estimated Fare'}
                  </td>
                  <td className="px-6 py-4">
                    <span
                      className={`font-bold text-3xl ${getFareTextColor()}`}
                    >
                      ₹{booking.pricing?.totalFare?.toFixed(2) || '0.00'}
                    </span>
                  </td>
                </tr>

                {/* Amount Paid Row */}
                <tr className="bg-green-50 hover:bg-green-100 transition font-semibold">
                  <td className="px-6 py-4 text-gray-900">
                    Amount Paid
                    <br />
                    <span className="text-xs text-green-600 font-normal">
                      (20% Advance)
                    </span>
                  </td>
                  <td className="px-6 py-4">
                    <span className="font-bold text-2xl text-green-600 dark:text-green-400">
                      ₹{(booking.paidAmount || 0).toFixed(2)}
                    </span>
                  </td>
                </tr>

                {/* Amount Remaining Row */}
                {booking.pricing?.totalFare && (
                  <tr className="bg-orange-50 hover:bg-orange-100 transition font-semibold">
                    <td className="px-6 py-4 text-gray-900">
                      Amount Remaining
                      <br />
                      <span className="text-xs text-orange-600 font-normal">
                        (80% on Completion)
                      </span>
                    </td>
                    <td className="px-6 py-4">
                      <span className="font-bold text-2xl text-orange-600 dark:text-orange-400">
                        ₹{(booking.pricing.totalFare - (booking.paidAmount || 0)).toFixed(2)}
                      </span>
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>

          {/* Action Buttons */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 p-6 bg-gray-50 border-t border-gray-200">
            {/* Share button - only show if not cancelled */}
            {booking.status?.toLowerCase() !== "cancelled" && (
              <button
                onClick={handleShare}
                className="flex items-center justify-center gap-2 px-6 py-3 bg-emerald-600 hover:bg-emerald-700 text-white rounded-lg transition font-semibold"
              >
                <Share2 size={18} />
                Share Booking
              </button>
            )}
            <button
              onClick={() => navigate("/user/bookings")}
              className="px-6 py-3 bg-green-600 hover:bg-green-700 text-white rounded-lg transition font-semibold"
            >
              View All Bookings
            </button>
            <button
              onClick={() => navigate("/")}
              className="px-6 py-3 border border-gray-300 text-gray-900 rounded-lg hover:bg-gray-100 transition font-semibold"
            >
              Back to Home
            </button>
          </div>
        </div>

        {/* Footer Info */}
        <div className="mt-8 text-center text-gray-600 text-sm">
          <p>Need help? Contact support at support@goelectriq.com</p>
          <p className="mt-2">
            Booking confirmation has been sent to your email
          </p>
        </div>
      </div>
    </UserLayout>
  );
}