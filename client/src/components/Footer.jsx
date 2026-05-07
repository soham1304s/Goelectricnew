import React from 'react';
import { Facebook, Instagram, Send, Zap } from 'lucide-react';
import { Link } from 'react-router-dom';
import { useTheme } from '../context/ThemeContext.jsx';
import logoLight from '../assets/logo_light.png';
import logoDark from '../assets/logo_dark.png';

const Footer = ({ darkMode }) => {
  const { theme } = useTheme();
  const isDarkMode = typeof darkMode === 'boolean' ? darkMode : theme === 'dark';

  return (
    <footer
      id="contact"
      className={`relative w-full px-6 md:px-16 py-10 lg:py-20 overflow-hidden transition-colors duration-500 ${
        isDarkMode
          ? 'bg-slate-950 text-white'
          : 'bg-white text-slate-900 border-t border-slate-100'
      }`}
    >
      {/* Glow Background */}
      <div className="absolute inset-0 -z-10 opacity-20 blur-3xl bg-gradient-to-r from-emerald-500 via-teal-500 to-emerald-400"></div>

      <div className="max-w-7xl mx-auto">
        {/* Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8 lg:gap-12 mb-12 text-center sm:text-left">

          {/* Brand */}
          <div className="flex flex-col items-center sm:items-start space-y-4">
            <img 
              src={isDarkMode ? logoDark : logoLight} 
              alt="GoElectriQ" 
              className="h-12 lg:h-16 w-auto object-contain"
            />

            <p className={`text-xs lg:text-sm leading-relaxed max-w-xs ${
              isDarkMode ? 'text-slate-400' : 'text-slate-600'
            }`}>
              Explore Jaipur with eco-friendly EV rides. Smart, affordable &
              sustainable mobility for everyone.
            </p>

            {/* Social */}
            <div className="flex gap-4 pt-2">
              {[
                { Icon: Facebook, url: 'https://www.facebook.com/share/1Dx1cu8G8u/?mibextid=wwXIfr' },
                { Icon: Instagram, url: 'https://www.instagram.com/go_electriq_cabs?igsh=dGh3MWV0NGc2YzZj&utm_source=qr' }
              ].map((item, i) => (
                <a
                  key={i}
                  href={item.url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="p-2.5 rounded-xl bg-slate-100 dark:bg-slate-900 hover:bg-emerald-500 hover:text-white transition-all duration-300"
                >
                  <item.Icon className="w-4 h-4" />
                </a>
              ))}
            </div>
          </div>

          {/* Services */}
          <div>
            <h4 className="font-black text-[10px] uppercase tracking-widest mb-6 text-emerald-500">
              Services
            </h4>

            <ul className={`space-y-3 lg:space-y-4 text-sm font-bold ${
              isDarkMode ? 'text-slate-400' : 'text-slate-600'
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
                    className="hover:text-emerald-500 transition-all duration-300 inline-block"
                  >
                    {item.name}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Links */}
          <div>
            <h4 className="font-black text-[10px] uppercase tracking-widest mb-6 text-emerald-500">
              Company
            </h4>

            <ul className={`space-y-3 lg:space-y-4 text-sm font-bold ${
              isDarkMode ? 'text-slate-400' : 'text-slate-600'
            }`}>
              {[
                { name: 'Refund Policy', path: '/refund-policy' },
                { name: 'Partner Policy', path: '/driver-partner-policy' },
                { name: 'Privacy Policy', path: '/privacy-policy' },
                { name: 'Terms of Service', path: '/terms-and-conditions' },
              ].map((item, i) => (
                <li key={i}>
                  <Link to={item.path} className="hover:text-emerald-500 transition-all duration-300">
                    {item.name}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Contact + Newsletter */}
          <div className="flex flex-col items-center sm:items-start">
            <h4 className="font-black text-[10px] uppercase tracking-widest mb-6 text-emerald-500">
              Stay Connected
            </h4>

            <div className={`space-y-3 text-sm font-bold mb-8 ${
              isDarkMode ? 'text-slate-400' : 'text-slate-600'
            }`}>
              <p className="flex items-center justify-center sm:justify-start gap-2">
                <span className="w-1 h-1 bg-emerald-500 rounded-full" />
                Jaipur, Rajasthan
              </p>
              <a href="tel:+918107649476" className="flex items-center justify-center sm:justify-start gap-2 hover:text-emerald-500 transition">
                <span className="w-1 h-1 bg-emerald-500 rounded-full" />
                +91 81076 49476
              </a>
              <a href="mailto:info@goelectriq.com" className="flex items-center justify-center sm:justify-start gap-2 hover:text-emerald-500 transition">
                <span className="w-1 h-1 bg-emerald-500 rounded-full" />
                info@goelectriq.com
              </a>
            </div>

            {/* Newsletter */}
            <div className="w-full max-w-xs flex items-center p-1 bg-slate-100 dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800">
              <input
                type="email"
                placeholder="Updates via email"
                className="flex-1 px-4 py-2 bg-transparent outline-none text-xs font-bold"
              />
              <button className="p-2.5 bg-emerald-500 text-white rounded-xl hover:bg-emerald-600 transition shadow-lg shadow-emerald-500/20">
                <Send size={14} />
              </button>
            </div>
          </div>
        </div>

        {/* Divider */}
        <div className="h-px bg-slate-200 dark:bg-slate-800 mb-8"></div>

        {/* Bottom */}
        <div className="flex flex-col md:flex-row justify-between items-center gap-6 text-[10px] font-black uppercase tracking-widest">
          <p className={`${isDarkMode ? 'text-slate-500' : 'text-slate-400'}`}>
            © 2026 Goelectriq
          </p>

          <p className={`flex items-center gap-2 ${isDarkMode ? 'text-slate-500' : 'text-slate-400'}`}>
            Made with <Zap size={14} className="text-emerald-500 animate-pulse" /> for Jaipur
          </p>

          <div className="flex gap-6">
            <Link to="/privacy-policy" className="hover:text-emerald-500 transition">
              Privacy
            </Link>
            <Link to="/terms-and-conditions" className="hover:text-emerald-500 transition">
              Terms
            </Link>
          </div>
        </div>
      </div>
    </footer>
  );
};

export default Footer;