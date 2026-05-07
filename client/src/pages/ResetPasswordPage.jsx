import { useState } from 'react';
import { useNavigate, useParams, Link } from 'react-router-dom';
import { Lock, Eye, EyeOff, Loader, ShieldCheck, ArrowRight, CheckCircle } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import * as authService from '../services/authService';
import AuthLayout from '../components/auth/AuthLayout';

export default function ResetPasswordPage() {
  const navigate = useNavigate();
  const { token } = useParams();
  
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    
    if (password.length < 6) {
      setError('New secret key must be at least 6 characters.');
      return;
    }

    if (password !== confirmPassword) {
      setError('Secret keys do not match.');
      return;
    }

    setLoading(true);
    try {
      const result = await authService.resetPassword(token, password);
      if (result.success) {
        setSuccess(true);
        setTimeout(() => navigate('/login'), 3000);
      } else {
        setError(result.message || 'Protocol failure. Link may be expired.');
      }
    } catch (err) {
      setError('Neural link synchronization failed. Try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <AuthLayout 
      title={success ? "Access Restored" : "Reset Secret Key"} 
      subtitle={success ? "System access re-established" : "Define your new security credential"}
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
              <ShieldCheck size={16} />
            </div>
            <p className="text-xs font-black text-rose-600">{error}</p>
          </motion.div>
        )}
      </AnimatePresence>

      {!success ? (
        <form onSubmit={handleSubmit} className="space-y-6">
          <div className="space-y-2">
            <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">New Secret Key</label>
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

          <div className="space-y-2">
            <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Confirm Secret Key</label>
            <div className="relative group">
              <div className="absolute left-6 top-1/2 -translate-y-1/2 text-slate-400 group-focus-within:text-emerald-500 transition-colors">
                <Lock size={18} />
              </div>
              <input
                type="password"
                placeholder="••••••••"
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                className="w-full pl-14 pr-8 py-5 bg-slate-50 rounded-[1.5rem] border-none focus:ring-2 focus:ring-emerald-500 text-sm font-bold transition-all"
                required
              />
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
                Initialize New Key
                <ArrowRight size={18} />
              </>
            )}
          </button>
        </form>
      ) : (
        <div className="space-y-8 text-center">
          <motion.div 
            initial={{ scale: 0.9, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            className="flex justify-center"
          >
            <div className="p-6 bg-emerald-50 text-emerald-500 rounded-[2rem] border border-emerald-100">
              <CheckCircle size={48} />
            </div>
          </motion.div>
          
          <div className="space-y-4">
            <p className="text-sm font-bold text-slate-600 leading-relaxed">
              Your security credentials have been updated successfully. 
              Redirecting to system access...
            </p>
          </div>

          <Link 
            to="/login"
            className="w-full py-5 bg-slate-900 text-white rounded-[1.5rem] font-black text-xs uppercase tracking-[0.2em] hover:bg-black transition-all flex items-center justify-center gap-3"
          >
            Go to Login
            <ArrowRight size={18} />
          </Link>
        </div>
      )}
    </AuthLayout>
  );
}
