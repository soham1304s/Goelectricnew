import React, { useState, useEffect } from "react";
import {
  Menu,
  X,
  Phone,
  ChevronDown,
  User,
  LogOut,
  LayoutDashboard,
  Sun,
  Moon
} from "lucide-react";
import { useLocation, useNavigate, Link } from "react-router-dom";
import { useAuth } from "../context/AuthContext.jsx";
import { useTheme } from "../context/ThemeContext.jsx";
import logo from "../assets/logo_light.png";
import logoWhite from "../assets/logo_dark.png";

const Navbar = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const { user, isAuthenticated, logout } = useAuth();
  const { theme, toggleTheme } = useTheme();
  const darkMode = theme === "dark";
  const [showMobileMenu, setShowMobileMenu] = useState(false);
  const [isScrolled, setIsScrolled] = useState(false);

  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 20);
    };
    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  const guestLinks = [
    { name: "Home", path: "/" },
    { name: "Services", path: "/services" },
    { name: "About", path: "/about" },
    { name: "Contact", path: "/contact" },
  ];

  const loggedInLinks = [
    { name: "Home", path: "/" },
    { name: "Services", path: "/services" },
    { name: "My Bookings", path: user?.role === 'admin' ? "/admin/rides" : "/user/rides" },
    { name: "Profile", path: user?.role === 'admin' ? "/admin/profile" : "/user/profile" },
    { name: "Contact", path: "/contact" },
    { name: "Logout", action: logout },
  ];

  const currentNavLinks = isAuthenticated ? loggedInLinks : guestLinks;

  const isActive = (path) => location.pathname === path;

  return (
    <nav className={`fixed top-0 left-0 right-0 z-50 transition-all duration-500 ${isScrolled
      ? "bg-white/80 dark:bg-black/80 backdrop-blur-xl shadow-lg shadow-slate-200/20 dark:shadow-none py-3"
      : "bg-transparent py-6"
      }`}>
      <div className="max-w-7xl mx-auto px-4 md:px-8 flex items-center justify-between">
        {/* Logo */}
        <Link to="/" className="flex items-center">
          <img src={darkMode ? logoWhite : logo} alt="GoElectric" className="h-32 md:h-40 w-auto object-contain" />
        </Link>

        {/* Desktop Nav Links */}
        <div className="hidden lg:flex items-center space-x-8 xl:space-x-10">
          {currentNavLinks.map((link) => (
            link.action ? (
              <button
                key={link.name}
                onClick={link.action}
                className={`text-sm font-black uppercase tracking-widest transition-all hover:text-emerald-600 ${
                  isScrolled ? "text-slate-600 dark:text-zinc-400" : "text-slate-900 dark:text-white"
                }`}
              >
                {link.name}
              </button>
            ) : (
              <Link
                key={link.name}
                to={link.path}
                className={`text-sm font-black uppercase tracking-widest transition-all hover:text-emerald-600 ${isActive(link.path)
                    ? "text-emerald-600"
                    : isScrolled ? "text-slate-600 dark:text-zinc-400" : "text-slate-900 dark:text-white"
                  }`}
              >
                {link.name}
              </Link>
            )
          ))}
        </div>

        {/* Right Side Actions */}
        <div className="hidden lg:flex items-center space-x-4">
          {!isAuthenticated ? (
            <>
              <button
                onClick={() => navigate("/login")}
                className={`px-6 py-2.5 rounded-xl text-sm font-black transition-all border ${
                  isScrolled 
                    ? "border-emerald-600 text-emerald-600 hover:bg-emerald-50" 
                    : "border-slate-300 text-slate-800 bg-white/10 backdrop-blur-md hover:bg-white/20"
                }`}
              >
                Login
              </button>
              <button
                onClick={() => navigate("/register")}
                className="px-6 py-2.5 bg-emerald-600 text-white rounded-xl text-sm font-black hover:bg-emerald-700 transition-all shadow-lg shadow-emerald-600/20 hover:-translate-y-0.5 active:scale-95"
              >
                Register
              </button>
            </>
          ) : (
            <div className="flex items-center space-x-3">
              <button
                onClick={() => navigate(user?.role === 'admin' ? '/admin' : '/user/dashboard')}
                className="flex items-center gap-2 px-6 py-2.5 bg-emerald-600 text-white rounded-xl text-sm font-black hover:bg-emerald-700 transition-all shadow-lg shadow-emerald-600/20"
              >
                <LayoutDashboard size={16} />
                Dashboard
              </button>
            </div>
          )}

          {/* Theme Toggle (Always Visible) */}
          <button
            onClick={toggleTheme}
            className={`p-2.5 rounded-xl transition-all border ${
              isScrolled
                ? "border-emerald-200 dark:border-zinc-800 text-emerald-600 dark:text-emerald-400 bg-emerald-50 dark:bg-zinc-900"
                : "border-slate-300 dark:border-white/20 text-slate-800 dark:text-white bg-white/10 backdrop-blur-md"
            }`}
          >
            {darkMode ? <Sun size={20} /> : <Moon size={20} />}
          </button>
        </div>

        {/* Mobile Menu Toggle & Theme Toggle */}
        <div className="lg:hidden flex items-center space-x-2">
          <button
            onClick={toggleTheme}
            className="p-2 text-slate-700 dark:text-white"
          >
            {darkMode ? <Sun size={24} /> : <Moon size={24} />}
          </button>
          <button
            onClick={() => setShowMobileMenu(!showMobileMenu)}
            className="p-2 text-gray-700 dark:text-white hover:text-emerald-600"
          >
            {showMobileMenu ? <X size={28} /> : <Menu size={28} />}
          </button>
        </div>
      </div>

      {/* Mobile Menu Overlay */}
      {showMobileMenu && (
        <div className="lg:hidden absolute top-full left-0 right-0 bg-white dark:bg-slate-900 shadow-xl border-t border-gray-100 dark:border-white/10 animate-fadeIn">
          <div className="flex flex-col p-6 space-y-4">
            {currentNavLinks.map((link) => (
              link.action ? (
                <button
                  key={link.name}
                  onClick={() => {
                    link.action();
                    setShowMobileMenu(false);
                  }}
                  className="text-lg font-semibold text-gray-800 dark:text-white text-left hover:text-emerald-600"
                >
                  {link.name}
                </button>
              ) : (
                <Link
                  key={link.name}
                  to={link.path}
                  onClick={() => setShowMobileMenu(false)}
                  className={`text-lg font-semibold ${isActive(link.path) ? "text-emerald-600" : "text-gray-800 dark:text-white"
                    }`}
                >
                  {link.name}
                </Link>
              )
            ))}
            <div className="pt-4 border-t border-gray-100 flex flex-col space-y-3">
              {!isAuthenticated ? (
                <>
                  <button
                    onClick={() => {
                      navigate("/login");
                      setShowMobileMenu(false);
                    }}
                    className="flex items-center justify-center w-full px-4 py-3 border border-emerald-600 text-emerald-600 rounded-lg font-bold"
                  >
                    Login
                  </button>
                  <button
                    onClick={() => {
                      navigate("/register");
                      setShowMobileMenu(false);
                    }}
                    className="w-full px-4 py-3 bg-emerald-600 text-white rounded-lg font-bold shadow-lg"
                  >
                    Register
                  </button>
                </>
              ) : (
                <button
                  onClick={() => {
                    navigate(user?.role === 'admin' ? '/admin' : '/user/dashboard');
                    setShowMobileMenu(false);
                  }}
                  className="flex items-center justify-center w-full gap-2 px-4 py-3 bg-emerald-600 text-white rounded-lg font-bold shadow-lg"
                >
                  <LayoutDashboard size={18} />
                  Dashboard
                </button>
              )}
            </div>
          </div>
        </div>
      )}
    </nav>
  );
};

export default Navbar;

