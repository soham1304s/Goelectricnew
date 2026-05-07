import { useState, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { GoogleLogin } from '@react-oauth/google';
import { 
  Eye, 
  EyeOff, 
  Loader, 
  ArrowRight, 
  ShieldCheck, 
  Lock, 
  Mail,
  User
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import AuthLayout from '../components/auth/AuthLayout';

export default function LoginPage() {
  const navigate = useNavigate();
  const { login: authLogin, loginWithGoogle, user } = useAuth();
  
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
    <AuthLayout 
      title="System Access" 
      subtitle="Enter credentials to establish link"
    >
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
          <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Email or Phone</label>
          <div className="relative group">
            <div className="absolute left-6 top-1/2 -translate-y-1/2 text-slate-400 group-focus-within:text-emerald-500 transition-colors">
              {identifier.includes('@') ? <Mail size={18} /> : <User size={18} />}
            </div>
            <input
              type="text"
              placeholder="Email or Mobile Number"
              value={identifier}
              onChange={(e) => setIdentifier(e.target.value)}
              className="w-full pl-14 pr-8 py-4 lg:py-5 bg-slate-50 rounded-[1.5rem] border-none focus:ring-2 focus:ring-emerald-500 text-sm font-bold transition-all"
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
              className="w-full pl-14 pr-16 py-4 lg:py-5 bg-slate-50 rounded-[1.5rem] border-none focus:ring-2 focus:ring-emerald-500 text-sm font-bold transition-all"
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
        <span className="relative px-6 bg-white text-[10px] font-black text-slate-400 uppercase tracking-widest">Global Auth</span>
      </div>

      <div className="flex justify-center w-full px-4">
        <div className="w-full max-w-[300px]">
          <GoogleLogin
            onSuccess={handleGoogleSuccess}
            onError={() => setError('Google auth protocol failed.')}
            text="continue_with"
            shape="circle"
            width="100%"
          />
        </div>
      </div>

      <p className="mt-12 text-center text-[10px] font-black text-slate-400 uppercase tracking-widest">
        New Entity? <Link to="/register" className="text-emerald-600 hover:text-emerald-700 ml-1">Create Identity Node</Link>
      </p>
    </AuthLayout>
  );
}
