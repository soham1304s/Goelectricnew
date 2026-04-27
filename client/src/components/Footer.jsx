import React from 'react';
import { Facebook, Instagram, Send } from 'lucide-react';
import { Link } from 'react-router-dom';
import { useTheme } from '../context/ThemeContext.jsx';
import logoDark from '../assets/logo-bull.png';
import logoLight from '../assets/logo-bull.png';

const Footer = ({ darkMode }) => {
  const { theme } = useTheme();
  const isDarkMode = typeof darkMode === 'boolean' ? darkMode : theme === 'dark';

  return (
    <footer
      id="contact"
      className={`relative w-full px-6 md:px-16 py-14 overflow-hidden ${
        isDarkMode
          ? 'bg-black text-white'
          : 'bg-white text-slate-900'
      }`}
    >
      {/* Glow Background */}
      <div className="absolute inset-0 -z-10 opacity-20 blur-3xl bg-gradient-to-r from-emerald-500 via-blue-500 to-purple-500"></div>

      <div className="max-w-7xl mx-auto">
        {/* Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-10 mb-12">

          {/* Brand */}
          <div className="space-y-4">
            <img 
              src={isDarkMode ? logoDark : logoLight} 
              alt="GoElectriQ" 
              className="h-16 w-auto object-contain"
            />

            <p className={`text-sm leading-relaxed ${
              isDarkMode ? 'text-gray-400' : 'text-slate-600'
            }`}>
              Explore Jaipur with eco-friendly EV rides. Smart, affordable &
              sustainable mobility for everyone.
            </p>

            {/* Social */}
            <div className="flex gap-4 pt-3">
              {[
                { Icon: Facebook, url: 'https://www.facebook.com/share/1Dx1cu8G8u/?mibextid=wwXIfr' },
                { Icon: Instagram, url: 'https://www.instagram.com/go_electriq_cabs?igsh=dGh3MWV0NGc2YzZj&utm_source=qr' }
              ].map((item, i) => (
                <a
                  key={i}
                  href={item.url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="p-2 rounded-full bg-gradient-to-r from-emerald-500/10 to-blue-500/10 backdrop-blur-md border border-white/10 hover:scale-110 transition"
                >
                  <item.Icon className="text-lg text-emerald-400" />
                </a>
              ))}
            </div>
          </div>

          {/* Services */}
          <div>
            <h4 className="font-semibold text-lg mb-5 text-emerald-400">
              Services
            </h4>

            <ul className={`space-y-3 text-sm ${
              isDarkMode ? 'text-gray-400' : 'text-slate-600'
            }`}>
              {[
                { name: 'City Rides', link: '/local-ride' },
                { name: 'Airport Ride', link: '/airport' },
                { name: 'Tour Packages', link: '/tours' },
                { name: 'Intercity Rides', link: '/intercity-ride' },
              ].map((item, i) => (
                <li key={i}>
                  <Link
                    to={item.link}
                    className="hover:text-emerald-400 transition-all duration-300 hover:translate-x-1 inline-block"
                  >
                    {item.name}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Links */}
          <div>
            <h4 className="font-semibold text-lg mb-5 text-blue-400">
              Quick Links
            </h4>

            <ul className={`space-y-3 text-sm ${
              isDarkMode ? 'text-gray-400' : 'text-slate-600'
            }`}>
              {[
                { name: 'Refund Policy', path: '/refund-policy' },
                { name: 'Driver Partner Policy', path: '/driver-partner-policy' },
                { name: 'Privacy Policy', path: '/privacy-policy' },
                { name: 'Terms of Service', path: '/terms-and-conditions' },
              ].map((item, i) => (
                <li key={i} className="hover:text-blue-400 transition hover:translate-x-1">
                  <Link to={item.path}>
                    {item.name}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Contact + Newsletter */}
          <div>
            <h4 className="font-semibold text-lg mb-5 text-purple-400">
              Stay Connected
            </h4>

            <div className={`space-y-2 text-sm mb-6 ${
              isDarkMode ? 'text-gray-400' : 'text-slate-600'
            }`}>
              <p>Jaipur, Rajasthan</p>
              <a 
                href="tel:+919876543210"
                className={`block hover:text-emerald-400 transition ${
                  isDarkMode ? 'text-gray-400 hover:text-emerald-400' : 'text-slate-600 hover:text-emerald-600'
                }`}
              >
                +91 81076 49476
              </a>
              <a 
                href="mailto:support@goelectriq.com"
                className={`block hover:text-emerald-400 transition ${
                  isDarkMode ? 'text-gray-400 hover:text-emerald-400' : 'text-slate-600 hover:text-emerald-600'
                }`}
              >
                info@goelectriq.com
              </a>
            </div>

            {/* Newsletter */}
            <div className="flex items-center rounded-xl overflow-hidden border bg-white/5 backdrop-blur-md border-white/10">
              <input
                type="email"
                placeholder="Enter email"
                className="flex-1 px-3 py-2 bg-transparent outline-none text-sm"
              />
              <button className="px-4 py-2 bg-gradient-to-r from-emerald-500 to-blue-500 hover:opacity-90 transition">
                <Send size={16} />
              </button>
            </div>
          </div>
        </div>

        {/* Divider */}
        <div className="h-px bg-gradient-to-r from-transparent via-gray-500/30 to-transparent mb-6"></div>

        {/* Bottom */}
        <div className="flex flex-col md:flex-row justify-between items-center gap-3 text-xs">
          <p className={`${isDarkMode ? 'text-gray-500' : 'text-slate-500'}`}>
            © 2026 Goelectriq. All rights reserved.
          </p>

          <p className={`${isDarkMode ? 'text-gray-500' : 'text-slate-500'}`}>
            Made with ⚡ for Jaipur
          </p>

          <div className="flex gap-4">
            <Link to="/privacy-policy" className="hover:text-emerald-400 transition">
              Privacy
            </Link>
            <Link to="/terms-and-conditions" className="hover:text-emerald-400 transition">
              Terms
            </Link>
          </div>
        </div>
      </div>
    </footer>
  );
};

export default Footer;