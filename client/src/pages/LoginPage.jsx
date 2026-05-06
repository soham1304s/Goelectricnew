import { useState, useEffect, useRef } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { useTheme } from '../context/ThemeContext';
import { GoogleLogin } from '@react-oauth/google';
import { 
  Eye, 
  EyeOff, 
  Loader, 
  ArrowRight, 
  ShieldCheck, 
  Zap, 
  Globe, 
  Lock, 
  Mail,
  Fingerprint,
  ChevronRight
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import AuthImageSlider from '../components/AuthImageSlider';
import logo from '../assets/logo_light.png';
import logoWhite from '../assets/logo_dark.png';

export default function LoginPage() {
  const navigate = useNavigate();
  const { login: authLogin, loginWithGoogle, user } = useAuth();
  const { theme } = useTheme();
  const darkMode = theme === 'dark';
  
  const [identifier, setIdentifier] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  useEffect(() => {
    if (user) navigate('/user/dashboard');
  }, [user, navigate]);

  const handleLogin = async (e) => {
    e.preventDefault();
    setError(''); 
    setSuccess('');
    setLoading(true);
    try {
      const result = await authLogin(identifier, password);
      if (result.success) {
        setSuccess('Authentication successful. Initializing session...');
        setTimeout(() => navigate('/user/dashboard'), 1500);
      } else {
        if (result.message && result.message.includes('admin login page')) {
          setError('Administrative credentials detected. Redirecting...');
          setTimeout(() => navigate('/admin/login', { replace: true }), 2000);
        } else {
          setError(result.message || 'Invalid credentials. Please verify your identity.');
        }
      }
    } catch (err) {
      setError('Neural link synchronization failed. Try again.');
    } finally {
      setLoading(false);
    }
  };

  const handleGoogleSuccess = async (credentialResponse) => {
    setLoading(true);
    setError('');
    try {
      const idToken = credentialResponse?.credential;
      if (!idToken) {
        setError('Federated authentication failed.');
        setLoading(false);
        return;
      }
      
      const result = await loginWithGoogle(idToken);
      if (result.success) {
        setSuccess('Federated link established. Initializing...');
        setTimeout(() => navigate('/user/dashboard'), 1500);
      } else {
        setError(result.message || 'Federated login sequence terminated.');
      }
    } catch (err) {
      setError('Neural link error. Resetting protocol.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-slate-50 flex items-center justify-center p-4 md:p-8 overflow-hidden">
      {/* Background Decorative Elements */}
      <div className="absolute top-0 right-0 w-[800px] h-[800px] bg-emerald-500/5 rounded-full blur-[120px] -mr-96 -mt-96 pointer-events-none" />
      <div className="absolute bottom-0 left-0 w-[600px] h-[600px] bg-blue-500/5 rounded-full blur-[100px] -ml-48 -mb-48 pointer-events-none" />

      <motion.div 
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.8, ease: "easeOut" }}
        className="w-full max-w-[1200px] bg-white rounded-[3.5rem] shadow-[0_50px_100px_-20px_rgba(0,0,0,0.15)] overflow-hidden flex flex-col lg:flex-row relative z-10 border border-slate-100"
      >
        {/* Visual Showcase - Left Side */}
        <div className="hidden lg:block lg:w-1/2 relative overflow-hidden bg-slate-900">
          <AuthImageSlider />
          <div className="absolute inset-0 bg-gradient-to-t from-slate-900 via-transparent to-transparent opacity-60" />
          <div className="absolute bottom-16 left-16 right-16">
            <motion.div 
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.5 }}
              className="flex items-center gap-3 mb-4"
            >
              <div className="w-12 h-0.5 bg-emerald-500 rounded-full" />
              <span className="text-emerald-400 text-[10px] font-black uppercase tracking-[0.3em]">Future Ready</span>
            </motion.div>
            <h2 className="text-4xl font-black text-white tracking-tighter mb-4 leading-tight">
              Synchronizing Jaipur with <span className="text-emerald-500">Sustainable</span> Mobility.
            </h2>
            <p className="text-slate-400 text-sm font-medium leading-relaxed max-w-sm">
              Enter the ecosystem and manage your zero-emission journeys with precision and style.
            </p>
          </div>
        </div>

        {/* Authentication Form - Right Side */}
        <div className="w-full lg:w-1/2 p-10 md:p-16 lg:p-20 flex flex-col justify-center">
          <div className="mb-12">
            <motion.img 
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              src={darkMode ? logoWhite : logo} 
              alt="GoElectriQ" 
              className="h-12 w-auto mb-10 object-contain"
            />
            <h1 className="text-4xl font-black text-slate-900 tracking-tighter mb-3">System Access</h1>
            <p className="text-slate-500 font-bold text-xs uppercase tracking-widest">Enter credentials to establish link</p>
          </div>

          <AnimatePresence mode="wait">
            {error && (
              <motion.div 
                initial={{ opacity: 0, height: 0 }}
                animate={{ opacity: 1, height: 'auto' }}
                exit={{ opacity: 0, height: 0 }}
                className="bg-rose-50 border border-rose-100 p-4 rounded-2xl flex items-center gap-3 mb-8"
              >
                <div className="p-2 bg-rose-100 text-rose-500 rounded-xl">
                  <Lock size={16} />
                </div>
                <p className="text-xs font-black text-rose-600">{error}</p>
              </motion.div>
            )}
            {success && (
              <motion.div 
                initial={{ opacity: 0, height: 0 }}
                animate={{ opacity: 1, height: 'auto' }}
                exit={{ opacity: 0, height: 0 }}
                className="bg-emerald-50 border border-emerald-100 p-4 rounded-2xl flex items-center gap-3 mb-8"
              >
                <div className="p-2 bg-emerald-100 text-emerald-500 rounded-xl">
                  <ShieldCheck size={16} />
                </div>
                <p className="text-xs font-black text-emerald-600">{success}</p>
              </motion.div>
            )}
          </AnimatePresence>

          <form onSubmit={handleLogin} className="space-y-6">
            <div className="space-y-2">
              <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Email Node</label>
              <div className="relative group">
                <div className="absolute left-6 top-1/2 -translate-y-1/2 text-slate-400 group-focus-within:text-emerald-500 transition-colors">
                  <Mail size={18} />
                </div>
                <input
                  type="email"
                  placeholder="name@nexus.com"
                  value={identifier}
                  onChange={(e) => setIdentifier(e.target.value)}
                  className="w-full pl-14 pr-8 py-5 bg-slate-50 rounded-[1.5rem] border-none focus:ring-2 focus:ring-emerald-500 text-sm font-bold transition-all"
                  required
                />
              </div>
            </div>

            <div className="space-y-2">
              <div className="flex justify-between items-center px-1">
                <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Secret Key</label>
                <Link to="/forgot-password" title="Initiate Protocol Recovery" className="text-[10px] font-black text-emerald-600 uppercase tracking-widest hover:text-emerald-700">Lost Key?</Link>
              </div>
              <div className="relative group">
                <div className="absolute left-6 top-1/2 -translate-y-1/2 text-slate-400 group-focus-within:text-emerald-500 transition-colors">
                  <Lock size={18} />
                </div>
                <input
                  type={showPassword ? "text" : "password"}
                  placeholder="••••••••"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="w-full pl-14 pr-16 py-5 bg-slate-50 rounded-[1.5rem] border-none focus:ring-2 focus:ring-emerald-500 text-sm font-bold transition-all"
                  required
                />
                <button 
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-6 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-900 transition-colors"
                >
                  {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                </button>
              </div>
            </div>

            <button 
              type="submit" 
              disabled={loading} 
              className="w-full py-5 bg-slate-900 text-white rounded-[1.5rem] font-black text-xs uppercase tracking-[0.2em] hover:bg-black transition-all shadow-2xl active:scale-[0.98] flex items-center justify-center gap-3"
            >
              {loading ? (
                <div className="flex items-center gap-3">
                  <Loader className="animate-spin" size={18} />
                  <span>Synchronizing...</span>
                </div>
              ) : (
                <>
                  Establish Connection
                  <ArrowRight size={18} />
                </>
              )}
            </button>
          </form>

          <div className="relative my-10 text-center">
            <div className="absolute inset-0 flex items-center">
              <div className="w-full border-t border-slate-100" />
            </div>
            <span className="relative px-6 bg-white text-[10px] font-black text-slate-300 uppercase tracking-widest">Global Auth</span>
          </div>

          <div className="flex justify-center">
            <GoogleLogin
              onSuccess={handleGoogleSuccess}
              onError={() => setError('Google auth protocol failed.')}
              text="continue_with"
              shape="circle"
              width="100%"
            />
          </div>

          <p className="mt-12 text-center text-[10px] font-black text-slate-400 uppercase tracking-widest">
            New Entity? <Link to="/register" className="text-emerald-600 hover:text-emerald-700 ml-1">Create Identity Node</Link>
          </p>
        </div>
      </motion.div>

      {/* Modern Badge */}
      <motion.div 
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 1 }}
        className="fixed bottom-10 left-10 hidden xl:flex items-center gap-3 px-6 py-3 bg-white/50 backdrop-blur-md rounded-2xl border border-white/20 shadow-xl"
      >
        <div className="w-2 h-2 bg-emerald-500 rounded-full" />
        <span className="text-[10px] font-black text-slate-900 uppercase tracking-widest">Encryption Level: 256-BIT AES</span>
      </motion.div>
    </div>
  );
}
