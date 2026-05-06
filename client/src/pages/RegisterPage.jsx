import { useState, useEffect } from "react";
import { useNavigate, Link } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import { useTheme } from "../context/ThemeContext";
import { GoogleLogin } from "@react-oauth/google";
import { 
  Eye, 
  EyeOff, 
  Loader, 
  ArrowRight, 
  User, 
  Mail, 
  Phone, 
  Lock, 
  ShieldCheck, 
  ChevronRight,
  Zap,
  CheckCircle2
} from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import AuthImageSlider from '../components/AuthImageSlider';
import logo from '../assets/logo_light.png';
import logoWhite from '../assets/logo_dark.png';

export default function RegisterPage() {
  const navigate = useNavigate();
  const { register: authRegister, loginWithGoogle, user } = useAuth();
  const { theme } = useTheme();
  const darkMode = theme === 'dark';

  const [formData, setFormData] = useState({
    firstName: "",
    lastName: "",
    email: "",
    phone: "",
    password: "",
    confirmPassword: "",
  });

  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [agreeTerms, setAgreeTerms] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  useEffect(() => {
    if (user) navigate("/user/dashboard");
  }, [user, navigate]);

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleRegister = async (e) => {
    e.preventDefault();
    setError("");
    setSuccess("");

    if (!agreeTerms) return setError("Protocol requires agreement to terms.");

    if (formData.password !== formData.confirmPassword) {
      return setError("Cryptographic keys do not match.");
    }

    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email)) {
      return setError("Invalid email node address.");
    }

    if (!/^[6-9]\d{9}$/.test(formData.phone.replace(/\D/g, '').slice(-10))) {
      return setError("Invalid communication channel (phone).");
    }

    setLoading(true);

    try {
      const res = await authRegister(
        formData.firstName,
        formData.lastName,
        formData.email,
        formData.phone,
        formData.password
      );

      if (res.success) {
        setSuccess("Identity node created. Initializing dashboard...");
        setTimeout(() => navigate("/user/dashboard"), 1500);
      } else {
        setError(res.message);
      }
    } catch {
      setError("Registration sequence interrupted.");
    } finally {
      setLoading(false);
    }
  };

  const handleGoogleSuccess = async (credentialResponse) => {
    setLoading(true);
    setError("");
    setSuccess("");
    try {
      const idToken = credentialResponse?.credential;
      if (!idToken) {
        setError("Federated auth failure.");
        setLoading(false);
        return;
      }
      
      const result = await loginWithGoogle(idToken);
      if (result.success) {
        setSuccess("Federated identity verified. Initializing...");
        setTimeout(() => navigate("/user/dashboard"), 1500);
      } else {
        setError(result.message || "Federated registration failed");
      }
    } catch (err) {
      setError("Neural link error during onboarding.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-slate-50 flex items-center justify-center p-4 md:p-8 overflow-hidden">
      {/* Decorative background */}
      <div className="absolute top-0 left-0 w-[800px] h-[800px] bg-emerald-500/5 rounded-full blur-[120px] -ml-96 -mt-96 pointer-events-none" />
      <div className="absolute bottom-0 right-0 w-[600px] h-[600px] bg-blue-500/5 rounded-full blur-[100px] -mr-48 -mb-48 pointer-events-none" />

      <motion.div 
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="w-full max-w-[1200px] bg-white rounded-[3.5rem] shadow-[0_50px_100px_-20px_rgba(0,0,0,0.15)] overflow-hidden flex flex-col lg:flex-row relative z-10 border border-slate-100"
      >
        {/* Left Side Showcase */}
        <div className="hidden lg:block lg:w-5/12 relative overflow-hidden bg-slate-900">
          <AuthImageSlider />
          <div className="absolute inset-0 bg-gradient-to-t from-slate-900 via-transparent to-transparent opacity-60" />
          <div className="absolute bottom-16 left-16 right-16">
            <div className="flex items-center gap-3 mb-4">
              <div className="w-12 h-0.5 bg-emerald-500 rounded-full" />
              <span className="text-emerald-400 text-[10px] font-black uppercase tracking-[0.3em]">Join the Fleet</span>
            </div>
            <h2 className="text-4xl font-black text-white tracking-tighter mb-4 leading-tight">
              Start Your <span className="text-emerald-500">Emission-Free</span> Legacy.
            </h2>
            <p className="text-slate-400 text-sm font-medium leading-relaxed">
              Create your global GoElectriQ identity and unlock the full potential of Jaipur's premier EV network.
            </p>
          </div>
        </div>

        {/* Right Side Form */}
        <div className="w-full lg:w-7/12 p-10 md:p-16 lg:p-20 overflow-y-auto max-h-[90vh] lg:max-h-none">
          <div className="mb-12">
            <motion.img 
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              src={darkMode ? logoWhite : logo} 
              alt="GoElectriQ" 
              className="h-10 w-auto mb-8 object-contain"
            />
            <h1 className="text-4xl font-black text-slate-900 tracking-tighter mb-3">Initialize Identity</h1>
            <p className="text-slate-500 font-bold text-xs uppercase tracking-widest">Onboarding Protocol 1.0.4</p>
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
                  <ShieldCheck size={16} />
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
                  <CheckCircle2 size={16} />
                </div>
                <p className="text-xs font-black text-emerald-600">{success}</p>
              </motion.div>
            )}
          </AnimatePresence>

          <form onSubmit={handleRegister} className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="space-y-2">
                <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">First Name</label>
                <div className="relative group">
                  <div className="absolute left-6 top-1/2 -translate-y-1/2 text-slate-400 group-focus-within:text-emerald-500 transition-colors">
                    <User size={18} />
                  </div>
                  <input type="text" name="firstName" placeholder="John" onChange={handleChange} className="w-full pl-14 pr-6 py-4 bg-slate-50 rounded-2xl border-none focus:ring-2 focus:ring-emerald-500 text-sm font-bold transition-all" required />
                </div>
              </div>
              <div className="space-y-2">
                <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Last Name</label>
                <div className="relative group">
                  <div className="absolute left-6 top-1/2 -translate-y-1/2 text-slate-400 group-focus-within:text-emerald-500 transition-colors">
                    <User size={18} />
                  </div>
                  <input type="text" name="lastName" placeholder="Doe" onChange={handleChange} className="w-full pl-14 pr-6 py-4 bg-slate-50 rounded-2xl border-none focus:ring-2 focus:ring-emerald-500 text-sm font-bold transition-all" required />
                </div>
              </div>
            </div>

            <div className="space-y-2">
              <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Communication Email</label>
              <div className="relative group">
                <div className="absolute left-6 top-1/2 -translate-y-1/2 text-slate-400 group-focus-within:text-emerald-500 transition-colors">
                  <Mail size={18} />
                </div>
                <input type="email" name="email" placeholder="name@domain.com" onChange={handleChange} className="w-full pl-14 pr-6 py-4 bg-slate-50 rounded-2xl border-none focus:ring-2 focus:ring-emerald-500 text-sm font-bold transition-all" required />
              </div>
            </div>

            <div className="space-y-2">
              <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Contact Matrix (Phone)</label>
              <div className="relative group">
                <div className="absolute left-6 top-1/2 -translate-y-1/2 text-slate-400 group-focus-within:text-emerald-500 transition-colors">
                  <Phone size={18} />
                </div>
                <input type="tel" name="phone" placeholder="+91 XXXXX XXXXX" onChange={handleChange} className="w-full pl-14 pr-6 py-4 bg-slate-50 rounded-2xl border-none focus:ring-2 focus:ring-emerald-500 text-sm font-bold transition-all" required />
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="space-y-2">
                <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Security Key</label>
                <div className="relative group">
                  <div className="absolute left-6 top-1/2 -translate-y-1/2 text-slate-400 group-focus-within:text-emerald-500 transition-colors">
                    <Lock size={18} />
                  </div>
                  <input
                    type={showPassword ? "text" : "password"}
                    name="password"
                    placeholder="••••••••"
                    onChange={handleChange}
                    className="w-full pl-14 pr-14 py-4 bg-slate-50 rounded-2xl border-none focus:ring-2 focus:ring-emerald-500 text-sm font-bold transition-all"
                    required
                  />
                  <button type="button" onClick={() => setShowPassword(!showPassword)} className="absolute right-6 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-900 transition-colors">
                    {showPassword ? <EyeOff size={16} /> : <Eye size={16} />}
                  </button>
                </div>
              </div>
              <div className="space-y-2">
                <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Key Validation</label>
                <input type="password" name="confirmPassword" placeholder="••••••••" onChange={handleChange} className="w-full px-8 py-4 bg-slate-50 rounded-2xl border-none focus:ring-2 focus:ring-emerald-500 text-sm font-bold transition-all" required />
              </div>
            </div>

            <div className="flex items-center gap-3 px-1">
              <div className="relative">
                <input 
                  type="checkbox" 
                  id="terms" 
                  onChange={(e) => setAgreeTerms(e.target.checked)} 
                  className="w-5 h-5 rounded-lg border-2 border-slate-200 text-emerald-500 focus:ring-emerald-500 transition-all cursor-pointer appearance-none checked:bg-emerald-500 checked:border-emerald-500"
                />
                <CheckCircle2 className="absolute top-1 left-1 text-white w-3 h-3 opacity-0 peer-checked:opacity-100 pointer-events-none" />
              </div>
              <label htmlFor="terms" className="text-[10px] font-black text-slate-500 uppercase tracking-widest cursor-pointer select-none">
                Accept <span className="text-emerald-600">Onboarding Protocol</span> & <span className="text-emerald-600">Privacy Nodes</span>
              </label>
            </div>

            <button 
              type="submit" 
              disabled={loading} 
              className="w-full py-5 bg-slate-900 text-white rounded-[1.5rem] font-black text-xs uppercase tracking-[0.2em] hover:bg-black transition-all shadow-2xl active:scale-[0.98] flex items-center justify-center gap-3"
            >
              {loading ? (
                <div className="flex items-center gap-3">
                  <Loader className="animate-spin" size={18} />
                  <span>Syncing Identity...</span>
                </div>
              ) : (
                <>
                  Initialize Account
                  <ArrowRight size={18} />
                </>
              )}
            </button>
          </form>

          <div className="relative my-10 text-center">
            <div className="absolute inset-0 flex items-center">
              <div className="w-full border-t border-slate-100" />
            </div>
            <span className="relative px-6 bg-white text-[10px] font-black text-slate-300 uppercase tracking-widest">Federated Sync</span>
          </div>

          <div className="flex justify-center">
            <GoogleLogin
              onSuccess={handleGoogleSuccess}
              onError={() => setError('Google auth protocol failed.')}
              text="signup_with"
              shape="circle"
              width="100%"
            />
          </div>

          <p className="mt-12 text-center text-[10px] font-black text-slate-400 uppercase tracking-widest">
            Existing Identity? <Link to="/login" className="text-emerald-600 hover:text-emerald-700 ml-1">Establish Link</Link>
          </p>
        </div>
      </motion.div>
    </div>
  );
}
