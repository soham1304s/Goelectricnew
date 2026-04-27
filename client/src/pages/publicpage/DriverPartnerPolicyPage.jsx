import { Link } from 'react-router-dom';
import { Car, FileText, ArrowLeft } from 'lucide-react';
import { useTheme } from '../../context/ThemeContext.jsx';

export default function DriverPartnerPolicyPage() {
  const { theme } = useTheme();
  const isDark = theme === 'dark';

  return (
    <div className={`min-h-screen ${isDark ? 'bg-gradient-to-br from-gray-900 via-gray-800 to-gray-900' : 'bg-gradient-to-br from-slate-50 via-blue-50 to-emerald-50'}`}>
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8 sm:py-12">
        {/* Back Button */}
        <Link
          to="/"
          className={`inline-flex items-center gap-2 mb-6 text-sm font-medium hover:text-emerald-500 transition-colors ${isDark ? 'text-gray-400' : 'text-slate-500'}`}
        >
          <ArrowLeft className="w-4 h-4" />
          Back to Home
        </Link>

        {/* Page Title */}
        <div className="text-center mb-8 sm:mb-12">
          <div className="w-16 h-16 sm:w-20 sm:h-20 bg-emerald-100 rounded-full flex items-center justify-center mx-auto mb-6">
            <Car className="w-8 h-8 sm:w-10 sm:h-10 text-emerald-600" />
          </div>
          <h1 className={`text-2xl sm:text-3xl md:text-4xl font-bold mb-4 ${isDark ? 'text-white' : 'text-[#212121]'}`}>
            Driver Partner Policy
          </h1>
          <p className={`text-base sm:text-lg ${isDark ? 'text-zinc-400' : 'text-[#64748b]'}`}>
            Guidelines and expectations for our valued driver partners
          </p>
        </div>

        {/* Driver Partner Policy Content */}
        <div className={`rounded-2xl shadow-lg p-6 sm:p-8 mb-8 border ${isDark ? 'bg-gray-800 border-gray-700' : 'bg-white border-emerald-100'}`}>
          <div className="flex items-center gap-3 mb-6">
            <div className="w-10 h-10 bg-blue-100 rounded-full flex items-center justify-center">
              <FileText className="w-5 h-5 text-blue-600" />
            </div>
            <h2 className={`text-xl sm:text-2xl font-bold ${isDark ? 'text-white' : 'text-[#212121]'}`}>Driver Partner Policy</h2>
          </div>

          <div className={`space-y-4 leading-relaxed text-sm sm:text-base ${isDark ? 'text-gray-300' : 'text-[#64748b]'}`}>
            <p>
              Our driver partners are the backbone of our service. This policy outlines the expectations and guidelines for all driver partners on the Go ElectrQ platform.
            </p>

            <h3 className={`text-base sm:text-lg font-semibold mt-6 mb-3 ${isDark ? 'text-white' : 'text-[#212121]'}`}>Partner Requirements</h3>
            <p>
              All driver partners must possess a valid driving license, vehicle registration, and insurance. Electric vehicles must meet our safety and quality standards. Drivers must undergo background verification and training before onboarding. Regular vehicle inspections and document renewals are mandatory.
            </p>

            <h3 className={`text-base sm:text-lg font-semibold mt-6 mb-3 ${isDark ? 'text-white' : 'text-[#212121]'}`}>Professional Standards</h3>
            <p>
              Drivers are expected to maintain professionalism at all times, ensure vehicle cleanliness, follow traffic rules, provide courteous service, and respect customer privacy. Drivers must be punctual for pickups and follow the designated route unless requested otherwise by the customer.
            </p>
            <p>
              Any complaints regarding driver behavior or service quality will be investigated, and appropriate action will be taken. Repeated violations may result in partnership termination.
            </p>

            <h3 className={`text-base sm:text-lg font-semibold mt-6 mb-3 ${isDark ? 'text-white' : 'text-[#212121]'}`}>Vehicle Standards</h3>
            <p>
              All vehicles must be electric and meet the minimum quality standards set by Go ElectrQ. Vehicles must be kept clean, well-maintained, and in roadworthy condition at all times. Air conditioning must be functional, and the vehicle must be free from unpleasant odors.
            </p>
            <p>
              Drivers are responsible for timely charging of the vehicle to ensure no ride is cancelled due to low battery. Go ElectrQ may assist in identifying nearby charging stations when needed.
            </p>

            <h3 className={`text-base sm:text-lg font-semibold mt-6 mb-3 ${isDark ? 'text-white' : 'text-[#212121]'}`}>Earnings and Payments</h3>
            <p>
              Driver partners earn a percentage of each fare as agreed upon during onboarding. Earnings are disbursed weekly to the registered bank account. Go ElectrQ retains a service commission as detailed in the partnership agreement. Incentives and bonuses are available for high-performing drivers.
            </p>

            <h3 className={`text-base sm:text-lg font-semibold mt-6 mb-3 ${isDark ? 'text-white' : 'text-[#212121]'}`}>Safety Protocols</h3>
            <p>
              Safety is our highest priority. Drivers must not use mobile phones while driving, must wear seatbelts, and must not drive under the influence of alcohol or any substance. In case of an emergency, drivers must follow our emergency response protocols and contact our support team immediately.
            </p>

            <h3 className={`text-base sm:text-lg font-semibold mt-6 mb-3 ${isDark ? 'text-white' : 'text-[#212121]'}`}>Account Suspension & Termination</h3>
            <p>
              Failure to comply with these policies may result in temporary suspension or permanent termination of the driver partnership. Grounds for termination include fraudulent activity, repeated customer complaints, safety violations, or document non-compliance. Drivers may appeal decisions within 7 days of notification.
            </p>

            <h3 className={`text-base sm:text-lg font-semibold mt-6 mb-3 ${isDark ? 'text-white' : 'text-[#212121]'}`}>Support for Driver Partners</h3>
            <p>
              Go ElectrQ is committed to supporting its driver partners. We provide 24/7 driver support, training resources, access to preferred charging stations, and assistance with vehicle-related queries. We value our drivers and strive to create a fair and rewarding work environment.
            </p>
          </div>
        </div>

        {/* Partner CTA Section */}
        <div className="bg-gradient-to-r from-emerald-500 to-blue-600 rounded-2xl p-6 sm:p-8 text-center shadow-lg">
          <h2 className="text-xl sm:text-2xl font-bold mb-3 text-white">Interested in Becoming a Driver Partner?</h2>
          <p className="mb-6 text-white/90 text-sm sm:text-base">
            Join our growing fleet of eco-friendly driver partners and earn with Go ElectrQ.
          </p>
          <Link
            to="/partner"
            className="inline-block bg-white text-emerald-700 px-6 sm:px-8 py-3 rounded-lg font-semibold hover:bg-emerald-50 transition-colors text-sm sm:text-base"
          >
            Partner With Us
          </Link>
        </div>

        <p className={`text-center text-xs sm:text-sm mt-6 sm:mt-8 ${isDark ? 'text-gray-500' : 'text-[#64748b]'}`}>
          Last Updated: March 13, 2026
        </p>
      </div>
    </div>
  );
}
