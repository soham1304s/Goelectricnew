import { Link } from 'react-router-dom';
import { Shield, FileText, ArrowLeft } from 'lucide-react';
import { useTheme } from '../../context/ThemeContext.jsx';

export default function PrivacyPolicyPage() {
  const { theme } = useTheme();
  const isDark = theme === 'dark';

  return (
    <div className={`min-h-screen ${isDark ? 'bg-gradient-to-br from-gray-900 via-gray-800 to-gray-900' : 'bg-gradient-to-br from-slate-50 via-blue-50 to-emerald-50'}`}>
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8 sm:py-12">
 

        {/* Page Title */}
        <div className="text-center mb-8 sm:mb-12">
          <div className="w-16 h-16 sm:w-20 sm:h-20 bg-emerald-100 rounded-full flex items-center justify-center mx-auto mb-6">
            <Shield className="w-8 h-8 sm:w-10 sm:h-10 text-emerald-600" />
          </div>
          <h1 className={`text-2xl sm:text-3xl md:text-4xl font-bold mb-4 ${isDark ? 'text-white' : 'text-[#212121]'}`}>
            Privacy Policy
          </h1>
          <p className={`text-base sm:text-lg ${isDark ? 'text-zinc-400' : 'text-[#64748b]'}`}>
            How we collect, use, and protect your information
          </p>
        </div>

        {/* Privacy Policy Content */}
        <div className={`rounded-2xl shadow-lg p-6 sm:p-8 mb-8 border ${isDark ? 'bg-gray-800 border-gray-700' : 'bg-white border-emerald-100'}`}>
          <div className="flex items-center gap-3 mb-6">
            <div className="w-10 h-10 bg-blue-100 rounded-full flex items-center justify-center">
              <FileText className="w-5 h-5 text-blue-600" />
            </div>
            <h2 className={`text-xl sm:text-2xl font-bold ${isDark ? 'text-white' : 'text-[#212121]'}`}>Privacy Policy</h2>
          </div>

          <div className={`space-y-4 leading-relaxed text-sm sm:text-base ${isDark ? 'text-gray-300' : 'text-[#64748b]'}`}>
            <p>
              At Go ElectrQ, we are committed to protecting your privacy and ensuring the security of your personal information. This Privacy Policy outlines how we collect, use, store, and protect your data when you use our electric cab booking services.
            </p>

            <h3 className={`text-base sm:text-lg font-semibold mt-6 mb-3 ${isDark ? 'text-white' : 'text-[#212121]'}`}>Information We Collect</h3>
            <p>
              We collect personal information including your name, mobile number, email address, location data, payment information, and ride history. This information is collected when you register on our platform, book rides, or interact with our services. Location data is collected only when you use our app to ensure accurate pickup and drop-off services.
            </p>
            <p>
              We also collect device information such as IP address, browser type, operating system, and app version to improve our services and ensure platform security. This data helps us optimize user experience and prevent fraudulent activities.
            </p>

            <h3 className={`text-base sm:text-lg font-semibold mt-6 mb-3 ${isDark ? 'text-white' : 'text-[#212121]'}`}>How We Use Your Information</h3>
            <p>
              Your personal information is used to provide and improve our services, process bookings, facilitate payments, communicate updates about your rides, send promotional offers (with your consent), and ensure safety and security. We analyze usage patterns to enhance user experience and optimize our operations.
            </p>
            <p>
              We may use your contact information to send important service updates, booking confirmations, payment receipts, and customer support communications. Marketing communications are sent only to users who have opted in, and you can unsubscribe at any time.
            </p>

            <h3 className={`text-base sm:text-lg font-semibold mt-6 mb-3 ${isDark ? 'text-white' : 'text-[#212121]'}`}>Data Security</h3>
            <p>
              We implement industry-standard security measures including encryption, secure servers, regular security audits, and access controls to protect your personal information. Payment information is processed through PCI-DSS compliant payment gateways. However, no method of transmission over the internet is 100% secure, and we cannot guarantee absolute security.
            </p>

            <h3 className={`text-base sm:text-lg font-semibold mt-6 mb-3 ${isDark ? 'text-white' : 'text-[#212121]'}`}>Data Sharing</h3>
            <p>
              We do not sell your personal information to third parties. We may share necessary information with our driver partners to facilitate ride services, payment processors for transaction processing, and law enforcement when required by law. All third-party service providers are bound by confidentiality agreements.
            </p>
          </div>
        </div>

        {/* Contact Section */}
        <div className="bg-gradient-to-r from-emerald-500 to-blue-600 rounded-2xl p-6 sm:p-8 text-center shadow-lg">
          <h2 className="text-xl sm:text-2xl font-bold mb-3 text-white">Questions About Our Privacy Policy?</h2>
          <p className="mb-6 text-white/90 text-sm sm:text-base">
            If you have any concerns about how we handle your data, please contact us.
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
