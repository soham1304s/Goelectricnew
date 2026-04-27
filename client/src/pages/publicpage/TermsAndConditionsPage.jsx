import { Link } from 'react-router-dom';
import { ScrollText, FileText, ArrowLeft } from 'lucide-react';
import { useTheme } from '../../context/ThemeContext.jsx';

export default function TermsAndConditionsPage() {
  const { theme } = useTheme();
  const isDark = theme === 'dark';

  return (
    <div className={`min-h-screen ${isDark ? 'bg-gradient-to-br from-gray-900 via-gray-800 to-gray-900' : 'bg-gradient-to-br from-slate-50 via-blue-50 to-emerald-50'}`}>
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8 sm:py-12">
   

        {/* Page Title */}
        <div className="text-center mb-8 sm:mb-12">
          <div className="w-16 h-16 sm:w-20 sm:h-20 bg-emerald-100 rounded-full flex items-center justify-center mx-auto mb-6">
            <ScrollText className="w-8 h-8 sm:w-10 sm:h-10 text-emerald-600" />
          </div>
          <h1 className={`text-2xl sm:text-3xl md:text-4xl font-bold mb-4 ${isDark ? 'text-white' : 'text-[#212121]'}`}>
            Terms & Conditions
          </h1>
          <p className={`text-base sm:text-lg ${isDark ? 'text-zinc-400' : 'text-[#64748b]'}`}>
            Please read these terms carefully before using our services
          </p>
        </div>

        {/* Terms Content */}
        <div className={`rounded-2xl shadow-lg p-6 sm:p-8 mb-8 border ${isDark ? 'bg-gray-800 border-gray-700' : 'bg-white border-emerald-100'}`}>
          <div className="flex items-center gap-3 mb-6">
            <div className="w-10 h-10 bg-blue-100 rounded-full flex items-center justify-center">
              <FileText className="w-5 h-5 text-blue-600" />
            </div>
            <h2 className={`text-xl sm:text-2xl font-bold ${isDark ? 'text-white' : 'text-[#212121]'}`}>Terms and Conditions</h2>
          </div>

          <div className={`space-y-4 leading-relaxed text-sm sm:text-base ${isDark ? 'text-gray-300' : 'text-[#64748b]'}`}>
            <p>
              By using Go ElectrQ services, you agree to comply with these terms and conditions. Please read them carefully before using our platform.
            </p>

            <h3 className={`text-base sm:text-lg font-semibold mt-6 mb-3 ${isDark ? 'text-white' : 'text-[#212121]'}`}>User Eligibility</h3>
            <p>
              You must be at least 18 years old to use our services. By registering, you confirm that all information provided is accurate and up-to-date. You are responsible for maintaining the confidentiality of your account credentials and for all activities that occur under your account.
            </p>

            <h3 className={`text-base sm:text-lg font-semibold mt-6 mb-3 ${isDark ? 'text-white' : 'text-[#212121]'}`}>Booking and Payment</h3>
            <p>
              All bookings are subject to availability and confirmation. Fares are calculated based on distance, time, and service type selected. We accept multiple payment methods including cash, UPI, cards, and digital wallets. Payment is due immediately upon completion of the ride unless otherwise agreed.
            </p>
            <p>
              In case of payment disputes, please contact our customer support within 24 hours. We reserve the right to cancel bookings or suspend accounts for non-payment or fraudulent activities.
            </p>

            <h3 className={`text-base sm:text-lg font-semibold mt-6 mb-3 ${isDark ? 'text-white' : 'text-[#212121]'}`}>Cancellation Policy</h3>
            <p>
              You may cancel your booking within 5 minutes of placing it without any charges. Cancellations made after 5 minutes or after the driver has arrived at the pickup location will incur cancellation fees. Repeated cancellations may result in temporary account suspension.
            </p>

            <h3 className={`text-base sm:text-lg font-semibold mt-6 mb-3 ${isDark ? 'text-white' : 'text-[#212121]'}`}>User Conduct</h3>
            <p>
              Users must treat drivers with respect and courtesy. Any form of harassment, abuse, or misconduct will result in immediate account termination. Smoking, consumption of alcohol, or illegal activities in the vehicle are strictly prohibited. Users are responsible for any damage caused to the vehicle during the ride.
            </p>
            <p>
              We reserve the right to refuse service to anyone who violates these terms or engages in inappropriate behavior. Safety is our top priority, and we maintain zero tolerance for any actions that compromise the well-being of our drivers or other users.
            </p>
          </div>
        </div>

        {/* Contact Section */}
        <div className="bg-gradient-to-r from-emerald-500 to-blue-600 rounded-2xl p-6 sm:p-8 text-center shadow-lg">
          <h2 className="text-xl sm:text-2xl font-bold mb-3 text-white">Questions About Our Terms?</h2>
          <p className="mb-6 text-white/90 text-sm sm:text-base">
            If you have any questions about our terms and conditions, feel free to reach out.
          </p>
          <Link
            to="/contact"
            className="inline-block bg-white text-emerald-700 px-6 sm:px-8 py-3 rounded-lg font-semibold hover:bg-emerald-50 transition-colors text-sm sm:text-base"
          >
            Contact Us
          </Link>
        </div>

        <p className={`text-center text-xs sm:text-sm mt-6 sm:mt-8 ${isDark ? 'text-gray-500' : 'text-[#64748b]'}`}>
          Last Updated: March 13, 2026
        </p>
      </div>
    </div>
  );
}
