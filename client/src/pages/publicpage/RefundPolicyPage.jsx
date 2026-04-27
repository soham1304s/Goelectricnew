import { Link } from 'react-router-dom';
import { RotateCcw, FileText, ArrowLeft } from 'lucide-react';
import { useTheme } from '../../context/ThemeContext.jsx';

export default function RefundPolicyPage() {
  const { theme } = useTheme();
  const isDark = theme === 'dark';

  return (
    <div className={`min-h-screen ${isDark ? 'bg-gradient-to-br from-gray-900 via-gray-800 to-gray-900' : 'bg-gradient-to-br from-slate-50 via-blue-50 to-emerald-50'}`}>
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8 sm:py-12">
    

        {/* Page Title */}
        <div className="text-center mb-8 sm:mb-12">
          <div className="w-16 h-16 sm:w-20 sm:h-20 bg-emerald-100 rounded-full flex items-center justify-center mx-auto mb-6">
            <RotateCcw className="w-8 h-8 sm:w-10 sm:h-10 text-emerald-600" />
          </div>
          <h1 className={`text-2xl sm:text-3xl md:text-4xl font-bold mb-4 ${isDark ? 'text-white' : 'text-[#212121]'}`}>
            Refund Policy
          </h1>
          <p className={`text-base sm:text-lg ${isDark ? 'text-zinc-400' : 'text-[#64748b]'}`}>
            Our commitment to fair refunds and dispute resolution
          </p>
        </div>

        {/* Refund Policy Content */}
        <div className={`rounded-2xl shadow-lg p-6 sm:p-8 mb-8 border ${isDark ? 'bg-gray-800 border-gray-700' : 'bg-white border-emerald-100'}`}>
          <div className="flex items-center gap-3 mb-6">
            <div className="w-10 h-10 bg-blue-100 rounded-full flex items-center justify-center">
              <FileText className="w-5 h-5 text-blue-600" />
            </div>
            <h2 className={`text-xl sm:text-2xl font-bold ${isDark ? 'text-white' : 'text-[#212121]'}`}>Refund Policy</h2>
          </div>

          <div className={`space-y-4 leading-relaxed text-sm sm:text-base ${isDark ? 'text-gray-300' : 'text-[#64748b]'}`}>
            <p>
              We strive to provide excellent service, but we understand that issues may arise. This refund policy outlines the circumstances under which refunds are applicable.
            </p>

            <h3 className={`text-base sm:text-lg font-semibold mt-6 mb-3 ${isDark ? 'text-white' : 'text-[#212121]'}`}>Eligible Refunds</h3>
            <p>
              Refunds are processed for ride cancellations by drivers, significant service failures, overcharging or billing errors, technical issues preventing ride completion, and rides not provided as booked. Refund requests must be submitted within 48 hours of the ride through our customer support channels.
            </p>

            <h3 className={`text-base sm:text-lg font-semibold mt-6 mb-3 ${isDark ? 'text-white' : 'text-[#212121]'}`}>Refund Process</h3>
            <p>
              Once a refund request is approved, the amount will be credited to your original payment method within 5–7 business days. For cash payments, refunds will be credited to your Go ElectrQ wallet for future use. We reserve the right to investigate refund requests and may require additional information or evidence.
            </p>
            <p>
              Partial refunds may be issued in cases where the service was partially completed or if only a portion of the charges were incorrect. Final decisions on refund requests rest with Go ElectrQ management.
            </p>
          </div>
        </div>

        {/* Contact Section */}
        <div className="bg-gradient-to-r from-emerald-500 to-blue-600 rounded-2xl p-6 sm:p-8 text-center shadow-lg">
          <h2 className="text-xl sm:text-2xl font-bold mb-3 text-white">Need Help with a Refund?</h2>
          <p className="mb-6 text-white/90 text-sm sm:text-base">
            Our support team is ready to assist you with any refund queries.
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
