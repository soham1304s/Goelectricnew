import React, { useState, useEffect } from "react";
import {
  Menu,
  X,
  Phone,
  ChevronDown,
  User,
  LogOut,
  LayoutDashboard
} from "lucide-react";
import { useLocation, useNavigate, Link } from "react-router-dom";
import { useAuth } from "../context/AuthContext.jsx";
import logo from "../assets/logo-bull.png";

const Navbar = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const { user, isAuthenticated, logout } = useAuth();
  const [showMobileMenu, setShowMobileMenu] = useState(false);
  const [isScrolled, setIsScrolled] = useState(false);

  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 20);
    };
    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  const navLinks = [
    { name: "Home", path: "/" },
    { name: "About Us", path: "/about" },
    { name: "Services", path: "/services" },
    { name: "Contact Us", path: "/contact" },
  ];

  const isActive = (path) => location.pathname === path;

  return (
    <nav className={`fixed top-0 left-0 right-0 z-50 transition-all duration-500 ${isScrolled
      ? "bg-white/80 backdrop-blur-xl shadow-lg shadow-slate-200/20 py-3"
      : "bg-transparent py-6"
      }`}>
      <div className="max-w-7xl mx-auto px-4 md:px-8 flex items-center justify-between">
        {/* Logo */}
        <Link to="/" className="flex items-center">
          <img src={logo} alt="GoElectric Cabs" className="h-10 md:h-12 w-auto object-contain" />
        </Link>

        {/* Desktop Nav Links */}
        <div className="hidden lg:flex items-center space-x-10">
          {navLinks.map((link) => (
            <Link
              key={link.name}
              to={link.path}
              className={`text-sm font-black uppercase tracking-widest transition-all hover:text-emerald-600 ${isActive(link.path)
                  ? "text-emerald-600"
                  : isScrolled ? "text-slate-600" : "text-slate-900"
                }`}
            >
              {link.name}
            </Link>
          ))}
        </div>

        {/* Right Side Actions */}
        <div className="hidden lg:flex items-center space-x-5">
          <a
            href="tel:18001234567"
            className={`flex items-center gap-2 px-5 py-2.5 rounded-xl text-sm font-black transition-all ${isScrolled
                ? "bg-slate-50 text-slate-700 hover:bg-slate-100"
                : "bg-white/10 text-slate-900 backdrop-blur-md border border-slate-200/50 hover:bg-white/20"
              }`}
          >
            <Phone size={16} />
            1800 123 4567
          </a>

          {isAuthenticated ? (
            <div className="flex items-center space-x-3">
              <button
                onClick={() => navigate(user?.role === 'admin' ? '/admin' : '/user/dashboard')}
                className="flex items-center gap-2 px-6 py-2.5 bg-emerald-600 text-white rounded-xl text-sm font-black hover:bg-emerald-700 transition-all shadow-lg shadow-emerald-600/20"
              >
                <LayoutDashboard size={16} />
                Dashboard
              </button>
              <button
                onClick={logout}
                className="p-2.5 text-slate-400 hover:text-rose-500 transition-colors bg-slate-50 rounded-xl"
                title="Logout"
              >
                <LogOut size={20} />
              </button>
            </div>
          ) : (
            <button
              onClick={() => navigate("/local-ride")}
              className="px-8 py-2.5 bg-emerald-600 text-white rounded-xl text-sm font-black hover:bg-emerald-700 transition-all shadow-lg shadow-emerald-600/20 hover:-translate-y-0.5 active:scale-95"
            >
              Book Now
            </button>
          )}
        </div>

        {/* Mobile Menu Toggle */}
        <button
          onClick={() => setShowMobileMenu(!showMobileMenu)}
          className="lg:hidden p-2 text-gray-700 hover:text-emerald-600"
        >
          {showMobileMenu ? <X size={28} /> : <Menu size={28} />}
        </button>
      </div>

      {/* Mobile Menu Overlay */}
      {showMobileMenu && (
        <div className="lg:hidden absolute top-full left-0 right-0 bg-white shadow-xl border-t border-gray-100 animate-fadeIn">
          <div className="flex flex-col p-6 space-y-4">
            {navLinks.map((link) => (
              <Link
                key={link.name}
                to={link.path}
                onClick={() => setShowMobileMenu(false)}
                className={`text-lg font-semibold ${isActive(link.path) ? "text-emerald-600" : "text-gray-800"
                  }`}
              >
                {link.name}
              </Link>
            ))}
            <div className="pt-4 border-t border-gray-100 flex flex-col space-y-3">
              <a
                href="tel:18001234567"
                className="flex items-center justify-center gap-2 px-4 py-3 border border-emerald-600 text-emerald-600 rounded-lg font-bold"
              >
                <Phone size={18} />
                1800 123 4567
              </a>
              <button
                onClick={() => {
                  navigate("/local-ride");
                  setShowMobileMenu(false);
                }}
                className="px-4 py-3 bg-emerald-600 text-white rounded-lg font-bold shadow-lg"
              >
                Book Now
              </button>
            </div>
          </div>
        </div>
      )}
    </nav>
  );
};

export default Navbar;
