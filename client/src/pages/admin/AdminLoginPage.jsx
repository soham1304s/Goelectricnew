import { useState, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { useTheme } from '../../context/ThemeContext';
import { Mail, Lock, Eye, EyeOff, Shield, Loader } from 'lucide-react';
import { motion } from 'framer-motion';

export default function AdminLoginPage() {
  const navigate = useNavigate();
  const { adminLogin, user } = useAuth();
  const { theme } = useTheme();

  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  // Redirect if already logged in
  useEffect(() => {
    if (user?.role === 'admin') {
      navigate('/admin');
    }
  }, [user, navigate]);

  const validateForm = () => {
    if (!email.trim()) {
      setError('Email is required');
      return false;
    }
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
      setError('Please enter a valid email');
      return false;
    }
    if (!password) {
      setError('Password is required');
      return false;
    }
    return true;
  };

  const handleLogin = async (e) => {
    e.preventDefault();
    setError('');
    setSuccess('');

    if (!validateForm()) return;

    setLoading(true);
    try {
      const result = await adminLogin(email, password);
      if (result.success) {
        // Admin login successful - redirect to admin dashboard
        navigate('/admin', { replace: true });
      } else {
        setLoading(false);
        setError(result.message || 'Login failed. Please try again.');
      }
    } catch (err) {
      setLoading(false);
      setError('An unexpected error occurred. Please try again.');
      console.error('Login error:', err);
    }
  };

  const containerVariants = {
    hidden: { opacity: 0, y: 20 },
    visible: {
      opacity: 1,
      y: 0,
      transition: { duration: 0.6, staggerChildren: 0.1 },
    },
  };

  const itemVariants = {
    hidden: { opacity: 0, y: 10 },
    visible: { opacity: 1, y: 0 },
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 px-4 py-12 relative overflow-hidden">
      {/* Background Grid Pattern */}
      <div className="absolute inset-0 opacity-10">
        <div className="absolute inset-0 bg-gradient-to-br from-slate-400 to-slate-600 opacity-5" />
        <svg className="w-full h-full" width="60" height="60">
          <defs>
            <pattern id="grid" width="60" height="60" patternUnits="userSpaceOnUse">
              <path d="M 60 0 L 0 0 0 60" fill="none" stroke="currentColor" strokeWidth="0.5" />
            </pattern>
          </defs>
          <rect width="100%" height="100%" fill="url(#grid)" />
        </svg>
      </div>

      {/* Animated Background Glows */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <motion.div
          className="absolute top-20 right-40 w-96 h-96 bg-slate-500 rounded-full opacity-20 blur-3xl"
          animate={{
            scale: [1, 1.2, 1],
            opacity: [0.2, 0.3, 0.2],
          }}
          transition={{ duration: 8, repeat: Infinity }}
        />
        <motion.div
          className="absolute bottom-32 left-32 w-80 h-80 bg-slate-600 rounded-full opacity-15 blur-3xl"
          animate={{
            scale: [1, 1.1, 1],
            opacity: [0.15, 0.25, 0.15],
          }}
          transition={{ duration: 10, repeat: Infinity, delay: 1 }}
        />
        <motion.div
          className="absolute top-1/2 right-1/3 w-72 h-72 bg-slate-700 rounded-full opacity-10 blur-3xl"
          animate={{
            scale: [1, 1.15, 1],
            opacity: [0.1, 0.15, 0.1],
          }}
          transition={{ duration: 12, repeat: Infinity, delay: 2 }}
        />
      </div>

      {/* Card Content */}
      <motion.div
        initial={{ opacity: 0, y: 40 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className={`w-full max-w-md rounded-2xl sm:rounded-3xl shadow-lg sm:shadow-2xl p-6 sm:p-8 glass-card relative z-10 ${theme === 'dark' ? 'bg-gray-800/90 border border-gray-700' : 'bg-white/90 border border-gray-100'}`}
      >
        {/* Header with Shield Icon */}
        <div className="text-center mb-6 sm:mb-8">
          <motion.div
            className="inline-block mb-3 sm:mb-4 p-3 sm:p-3 bg-gradient-to-br from-orange-500 to-yellow-500 rounded-lg sm:rounded-2xl"
            whileHover={{ scale: 1.05 }}
            transition={{ type: 'spring', stiffness: 400, damping: 10 }}
          >
            <Shield className="text-white w-7 h-7 sm:w-8 sm:h-8" size={28} />
          </motion.div>
          <h1 className={`text-2xl sm:text-3xl font-bold ${theme === 'dark' ? 'text-white' : 'text-gray-900'}`}>
            Admin Portal
          </h1>
          <p className={`text-xs sm:text-sm mt-2 ${theme === 'dark' ? 'text-gray-400' : 'text-gray-600'}`}>
            Secure access for administrators
          </p>
        </div>

        {/* Security Notice */}
        <motion.div
          className={`mb-5 sm:mb-6 p-3 sm:p-4 rounded-lg sm:rounded-xl flex items-start gap-2 sm:gap-3 text-xs sm:text-sm ${theme === 'dark' ? 'bg-blue-900/20 border border-blue-800 text-blue-300' : 'bg-blue-50 border border-blue-200 text-blue-700'}`}
          variants={itemVariants}
        >
          <Shield className="flex-shrink-0 mt-0.5 w-4 h-4 sm:w-5 sm:h-5" size={16} />
          <p>
            This is a secure admin login. Unauthorized access is prohibited.
          </p>
        </motion.div>

        {/* Error Alert */}
        {error && (
          <motion.div
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            className={`p-3 rounded-lg mb-4 text-xs sm:text-sm ${theme === 'dark' ? 'bg-red-900/20 text-red-400 border border-red-800' : 'bg-red-50 text-red-600 border border-red-200'}`}
          >
            {error}
          </motion.div>
        )}

        {/* Success Alert */}
        {success && (
          <motion.div
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            className={`p-3 rounded-lg mb-4 text-sm ${theme === 'dark' ? 'bg-green-900/20 text-green-400 border border-green-800' : 'bg-green-50 text-green-600 border border-green-200'}`}
          >
            {success}
          </motion.div>
        )}

        {/* Login Form */}
        <form onSubmit={handleLogin} className="space-y-3 sm:space-y-4">
          {/* Email Input */}
          <div className="relative">
            <div className={`absolute left-3 sm:left-4 top-1/2 -translate-y-1/2 ${theme === 'dark' ? 'text-gray-500' : 'text-gray-400'}`}>
              <Mail size={18} />
            </div>
            <input
              type="email"
              placeholder="Admin Email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              disabled={loading}
              className={`w-full pl-10 sm:pl-12 py-3 sm:py-3 border rounded-lg sm:rounded-xl focus:ring-2 focus:ring-orange-500 outline-none transition-colors duration-300 text-sm sm:text-base ${theme === 'dark' ? 'bg-gray-700 border-gray-600 text-white placeholder-gray-400' : 'bg-white border-gray-300 text-gray-900 placeholder-gray-500'}`}
            />
          </div>

          {/* Password Input */}
          <div className="relative">
            <div className={`absolute left-3 sm:left-4 top-1/2 -translate-y-1/2 ${theme === 'dark' ? 'text-gray-500' : 'text-gray-400'}`}>
              <Lock size={18} />
            </div>
            <input
              type={showPassword ? "text" : "password"}
              placeholder="Password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              disabled={loading}
              className={`w-full pl-10 sm:pl-12 pr-10 sm:pr-12 py-3 sm:py-3 border rounded-lg sm:rounded-xl focus:ring-2 focus:ring-orange-500 outline-none transition-colors duration-300 text-sm sm:text-base ${theme === 'dark' ? 'bg-gray-700 border-gray-600 text-white placeholder-gray-400' : 'bg-white border-gray-300 text-gray-900 placeholder-gray-500'}`}
            />
            <button
              type="button"
              className={`absolute right-3 sm:right-4 top-1/2 -translate-y-1/2 ${theme === 'dark' ? 'text-gray-500' : 'text-gray-600'}`}
              onClick={() => setShowPassword(!showPassword)}
            >
              {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
            </button>
          </div>

          {/* Admin Login Button */}
          <button
            type="submit"
            disabled={loading}
            className="w-full py-3 sm:py-3 rounded-lg sm:rounded-xl bg-gradient-to-r from-orange-500 to-yellow-500 text-white font-semibold text-sm sm:text-base hover:shadow-lg hover:scale-[1.02] transition active:scale-95 disabled:opacity-70"
          >
            {loading ? <Loader className="animate-spin mx-auto" /> : "Admin Login"}
          </button>
        </form>

        {/* Divider */}
        <div className={`text-center my-5 sm:my-6 text-xs sm:text-sm ${theme === 'dark' ? 'text-gray-500' : 'text-gray-400'}`}>
          ━━━━━━━━━━━
        </div>

        {/* Additional Links */}
        <div className="space-y-2 sm:space-y-3 text-center">
          <p className={`text-xs sm:text-sm ${theme === 'dark' ? 'text-gray-400' : 'text-gray-600'}`}>
            <Link to="/login" className={`hover:text-orange-500 font-medium transition-colors ${theme === 'dark' ? 'text-gray-300' : 'text-gray-700'}`}>
              ← Back to User Login
            </Link>
          </p>
          <p className={`text-xs ${theme === 'dark' ? 'text-gray-500' : 'text-gray-500'}`}>
            For security issues, contact{' '}
            <span className={theme === 'dark' ? 'text-gray-400' : 'text-gray-700'}>support@goelectriq.com</span>
          </p>
        </div>
      </motion.div>
    </div>
  );
}
