import { BrowserRouter, Routes, Route, Outlet, Navigate } from 'react-router-dom';
import Navbar from './components/Navbar'; // High-Fidelity UI Professionalization Heartbeat - Deployment f1ab863+1
import Loader from './components/Loader';
import WhatsAppButton from './components/WhatsAppButton';
import ScrollToTop from './components/ScrollToTop';

import Home from './components/Home/Home';
import AboutPage from './pages/publicpage/Aboutpage.jsx';
import ContactPage from './pages/publicpage/contactpage.jsx';
import ServicesPage from './pages/publicpage/ServicesPage.jsx';
import PublicPricingPage from './pages/publicpage/PublicPricingPage.jsx';
import ReviewsPage from './pages/publicpage/ReviewsPage.jsx';
import FeedbackPage from './pages/publicpage/feedbackpage.jsx';
import LoginPage from './pages/LoginPage';
import RegisterPage from './pages/RegisterPage';
import AdminLoginPage from './pages/admin/AdminLoginPage';
import ForgotPasswordPage from './pages/ForgotPasswordPage';
import ResetPasswordPage from './pages/ResetPasswordPage';
import AirportRidePage from './pages/Airportride';
import IntercityRidePageEU from './pages/IntercityRide';
import LocalRidePage from './pages/LocalRide';
import ToursPage from './pages/ToursPage.jsx';
import PrivacyPolicyPage from './pages/publicpage/PrivacyPolicyPage.jsx';
import RefundPolicyPage from './pages/publicpage/RefundPolicyPage.jsx';
import TermsAndConditionsPage from './pages/publicpage/TermsAndConditionsPage.jsx';
import DriverPartnerPolicyPage from './pages/publicpage/DriverPartnerPolicyPage.jsx';
import DriverPartnerPage from './pages/DriverPartnerPage.jsx';
import CabPartnerPage from './pages/CabPartnerPage.jsx';
import ChargingBookingPage from './pages/ChargingBookingPage.jsx';
import ChargingBookingDashboard from './pages/admin/ChargingBookingDashboard.jsx';
import DriverBookingDashboard from './pages/admin/DriverBookingDashboard.jsx';
import CabPartnerDashboard from './pages/admin/CabPartnerDashboard.jsx';

import UserProfile from './pages/user/UserProfile';
import UserRidesPage from './pages/user/RidesPage';
import UserToursPage from './pages/user/ToursPage';
import BookingConfirmationPage from './pages/user/BookingConfirmationPage';
import DriverStatusPage from './pages/user/DriverStatusPage';

import DashboardPage from './pages/admin/DashboardPage';
import UsersPage from './pages/admin/UsersPage';
import ToursAdminPage from './pages/admin/ToursPage';
import PackagesPage from './pages/admin/PackagesPage';
import PricingPage from './pages/admin/PricingPage';
import FeedbackAdminPage from './pages/admin/FeedbackPage';
import PaymentsPage from './pages/admin/PaymentsPage';
import PendingPaymentsDashboard from './pages/admin/PendingPaymentsDashboard';
import SettingsPage from './pages/admin/SettingsPage';
import AdminProfilePage from './pages/admin/AdminProfilePage';
import RidesPage from './pages/admin/RidesPage';
import OffersPage from './pages/admin/OffersPage';
import AirportRidesPage from './pages/admin/AirportRidesPage';

import { useAuth } from './context/AuthContext.jsx';


// ================= PROTECTED ROUTE =================
function ProtectedRoute({ children }) {
  const { user, loading } = useAuth();

  if (loading)
    return (
      <div className="min-h-screen flex items-center justify-center">
        Loading...
      </div>
    );

  if (!user) return <Navigate to="/login" replace />;

  return children;
}


// ================= ADMIN PROTECTED ROUTE =================
const AdminProtectedRoute = ({ children }) => {
  const { user, loading } = useAuth();

  if (loading)
    return (
      <div className="min-h-screen flex items-center justify-center bg-slate-900">
        <div className="flex flex-col items-center gap-4">
          <div className="w-12 h-12 border-4 border-emerald-500 border-t-transparent rounded-full animate-spin"></div>
          <p className="text-white font-semibold">Loading dashboard...</p>
        </div>
      </div>
    );

  if (!user || user.role !== 'admin') return <Navigate to="/" replace />;

  return children;
};




// ================= LAYOUTS =================

// ✅ PUBLIC LAYOUT (Navbar included)
function PublicLayout() {
  return (
    <>
      <Navbar />

      <main className="pt-14 md:pt-0 min-h-screen pb-16 md:pb-0 bg-[#fafafa] dark:bg-black text-slate-900 dark:text-zinc-100 transition-colors duration-300">
        <Outlet />
      </main>
    </>
  );
}

// ✅ DASHBOARD / ADMIN LAYOUT (NO Navbar)
function DashboardLayout() {
  return (
    <main className="min-h-screen bg-[#fafafa] dark:bg-black text-slate-900 dark:text-zinc-100">
      <Outlet />
    </main>
  );
}


// ================= 404 =================
function NotFound() {
  return (
    <div className="min-h-screen flex items-center justify-center bg-[#fafafa] dark:bg-black px-4 transition-colors duration-300">
      <div className="text-center max-w-md">
        <h1 className="text-6xl sm:text-7xl font-bold text-slate-900 dark:text-white mb-2">
          404
        </h1>
        <p className="text-base sm:text-lg text-slate-500 dark:text-zinc-400 mb-6">
          Page not found
        </p>
        <a
          href="/"
          className="inline-block px-6 py-3 bg-[#FBBF24] text-slate-900 rounded-lg hover:bg-[#F59E0B] font-semibold transition-all duration-200 shadow-lg hover:shadow-xl"
        >
          Go home
        </a>
      </div>
    </div>
  );
}


// ================= APP =================
function App() {
  return (
    <>
      <Loader />
      <WhatsAppButton />
      <BrowserRouter>
        <ScrollToTop />
        <Routes>

          {/* ================= PUBLIC ROUTES ================= */}
          <Route element={<PublicLayout />}>
            <Route path="/" element={<Home />} />
            <Route path="/about" element={<AboutPage />} />
            <Route path="/services" element={<ServicesPage />} />
            <Route path="/pricing" element={<PublicPricingPage />} />
            <Route path="/reviews" element={<ReviewsPage />} />
            <Route path="/contact" element={<ContactPage />} />
            <Route path="/feedback" element={<FeedbackPage />} />

            <Route path="/airport" element={<AirportRidePage />} />
            <Route path="/intercity-ride" element={<IntercityRidePageEU />} />
            <Route path="/local-ride" element={<LocalRidePage />} />
            <Route path="/tours" element={<ToursPage />} />
            <Route path="/privacy-policy" element={<PrivacyPolicyPage />} />
            <Route path="/refund-policy" element={<RefundPolicyPage />} />
            <Route path="/terms-and-conditions" element={<TermsAndConditionsPage />} />
            <Route path="/driver-partner-policy" element={<DriverPartnerPolicyPage />} />
            <Route path="/partner/driver" element={<DriverPartnerPage />} />
            <Route path="/partner/cab" element={<CabPartnerPage />} />
            <Route path="/charging" element={<ChargingBookingPage />} />

            {/* Protected inside public - Redirect to user dashboard */}
            <Route
              path="/profile"
              element={<Navigate to="/user/dashboard" replace />}
            />
          </Route>


          {/* ================= USER DASHBOARD ================= */}
          <Route element={<DashboardLayout />}>
            <Route path="/user" element={<Navigate to="/user/rides" replace />} />
            <Route path="/user/dashboard" element={<Navigate to="/user/rides" replace />} />
            <Route path="/user/rides" element={<ProtectedRoute><UserRidesPage /></ProtectedRoute>} />
            <Route path="/user/tours" element={<ProtectedRoute><UserToursPage /></ProtectedRoute>} />
            <Route path="/user/bookings" element={<ProtectedRoute><BookingConfirmationPage /></ProtectedRoute>} />
            <Route path="/user/bookings/:bookingId" element={<ProtectedRoute><BookingConfirmationPage /></ProtectedRoute>} />
            <Route path="/user/profile" element={<ProtectedRoute><UserProfile /></ProtectedRoute>} />
            <Route path="/user/booking-confirmation" element={<ProtectedRoute><BookingConfirmationPage /></ProtectedRoute>} />
            <Route path="/user/booking-confirmation/:bookingId" element={<ProtectedRoute><BookingConfirmationPage /></ProtectedRoute>} />
            <Route path="/user/application-status" element={<ProtectedRoute><DriverStatusPage /></ProtectedRoute>} />
          </Route>

          {/* ================= AUTH ROUTES (No Navbar) ================= */}
          <Route element={<DashboardLayout />}>
            <Route path="/login" element={<LoginPage />} />
            <Route path="/register" element={<RegisterPage />} />
            <Route path="/forgot-password" element={<ForgotPasswordPage />} />
            <Route path="/reset-password/:token" element={<ResetPasswordPage />} />
            <Route path="/admin/login" element={<AdminLoginPage />} />
          </Route>


          {/* ================= ADMIN ROUTES ================= */}
          <Route element={<DashboardLayout />}>
            <Route path="/admin" element={<AdminProtectedRoute><DashboardPage /></AdminProtectedRoute>} />
            <Route path="/admin/rides" element={<AdminProtectedRoute><RidesPage /></AdminProtectedRoute>} />
            <Route path="/admin/users" element={<AdminProtectedRoute><UsersPage /></AdminProtectedRoute>} />
            <Route path="/admin/tours" element={<AdminProtectedRoute><ToursAdminPage /></AdminProtectedRoute>} />
            <Route path="/admin/packages" element={<AdminProtectedRoute><PackagesPage /></AdminProtectedRoute>} />
            <Route path="/admin/offers" element={<AdminProtectedRoute><OffersPage /></AdminProtectedRoute>} />
            <Route path="/admin/pricing" element={<AdminProtectedRoute><PricingPage /></AdminProtectedRoute>} />
            <Route path="/admin/airport-rides" element={<AdminProtectedRoute><AirportRidesPage /></AdminProtectedRoute>} />
            <Route path="/admin/charging-bookings" element={<AdminProtectedRoute><ChargingBookingDashboard /></AdminProtectedRoute>} />
            <Route path="/admin/driver-bookings" element={<AdminProtectedRoute><DriverBookingDashboard /></AdminProtectedRoute>} />
            <Route path="/admin/cab-partners" element={<AdminProtectedRoute><CabPartnerDashboard /></AdminProtectedRoute>} />
            <Route path="/admin/payments" element={<AdminProtectedRoute><PaymentsPage /></AdminProtectedRoute>} />
            <Route path="/admin/pending-payments" element={<AdminProtectedRoute><PendingPaymentsDashboard /></AdminProtectedRoute>} />
            <Route path="/admin/feedback" element={<AdminProtectedRoute><FeedbackAdminPage /></AdminProtectedRoute>} />
            <Route path="/admin/settings" element={<AdminProtectedRoute><SettingsPage /></AdminProtectedRoute>} />
            <Route path="/admin/profile" element={<AdminProtectedRoute><AdminProfilePage /></AdminProtectedRoute>} />
          </Route>

          {/* ================= 404 ================= */}
          <Route path="*" element={<NotFound />} />

        </Routes>
      </BrowserRouter>
    </>
  );
}

export default App;