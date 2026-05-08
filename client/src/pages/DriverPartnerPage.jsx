import React, { useState } from 'react';
import { 
  Upload, 
  Car, 
  Phone, 
  User, 
  FileText, 
  Calendar, 
  CheckCircle, 
  Zap, 
  Clock, 
  Award, 
  Users,
  ChevronRight,
  ShieldCheck,
  Globe,
  Briefcase,
  AlertCircle,
  X,
  Plus,
  Loader,
  Mail
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import api from '../services/api';
import apiConfig from '../config/api.config.json';

const StatusBadge = ({ children, type = 'emerald' }) => {
  const colors = {
    emerald: 'bg-emerald-50 text-emerald-600 border-emerald-100',
    teal: 'bg-teal-50 text-teal-600 border-teal-100',
    violet: 'bg-violet-50 text-violet-600 border-violet-100',
    amber: 'bg-amber-50 text-amber-600 border-amber-100',
  };
  return (
    <div className={`px-4 py-2 rounded-xl text-[10px] font-black uppercase tracking-widest border ${colors[type]}`}>
      {children}
    </div>
  );
};

export default function DriverPartnerPage() {
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    phone: '',
    experience: '',
    licenseUpload: null,
  });
  
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState({ type: '', text: '' });
  const [filePreview, setFilePreview] = useState(null);
  const [showModal, setShowModal] = useState(false);

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleFileUpload = (e) => {
    const file = e.target.files[0];
    if (file) {
      setFormData(prev => ({ ...prev, licenseUpload: file }));
      const reader = new FileReader();
      reader.onloadend = () => setFilePreview(reader.result);
      reader.readAsDataURL(file);
    }
  };

  const validateForm = () => {
    if (!formData.name.trim()) return { ok: false, text: 'Operator identity required.' };
    if (!formData.email.trim()) return { ok: false, text: 'Communication node required.' };
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(formData.email)) return { ok: false, text: 'Invalid email node address.' };
    if (!formData.phone.trim()) return { ok: false, text: 'Contact matrix required.' };
    const phoneRegex = new RegExp(`^[${apiConfig.driver.phoneStartDigits.join('')}]\\d{${apiConfig.driver.maxPhoneLength - 1}}$`);
    if (!phoneRegex.test(formData.phone)) return { ok: false, text: 'Invalid communication channel.' };
    if (!formData.experience) return { ok: false, text: 'Experience telemetry required.' };
    if (!formData.licenseUpload) return { ok: false, text: 'Legal authorization document required.' };
    return { ok: true };
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    const validation = validateForm();
    if (!validation.ok) {
      setMessage({ type: 'error', text: validation.text });
      return;
    }

    setLoading(true);
    setMessage({ type: '', text: '' });

    try {
      const formDataToSend = new FormData();
      formDataToSend.append('name', formData.name);
      formDataToSend.append('email', formData.email);
      formDataToSend.append('phone', formData.phone);
      formDataToSend.append('experience', formData.experience);
      formDataToSend.append('licenseDocument', formData.licenseUpload);

      const response = await api.post(apiConfig.endpoints.driver.register, formDataToSend);

      if (response.data.success) {
        setMessage({ type: 'success', text: 'Registration protocol initiated. Verification in progress.' });
        setTimeout(() => {
          setFormData({ name: '', email: '', phone: '', experience: '', licenseUpload: null });
          setFilePreview(null);
          setShowModal(false);
          setMessage({ type: '', text: '' });
        }, 3000);
      }
    } catch (error) {
      setMessage({ 
        type: 'error', 
        text: error.response?.data?.message || 'Synchronization failed. System reset required.' 
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-slate-50 pt-32 pb-24 px-4 md:px-8">
      <div className="max-w-[1400px] mx-auto space-y-16">
        
        {/* ===== HERO SECTION ===== */}
        <div className="relative bg-slate-900 rounded-[4rem] p-12 md:p-20 text-white overflow-hidden shadow-2xl">
          <div className="absolute top-0 right-0 w-[600px] h-[600px] bg-emerald-500/10 rounded-full blur-[120px] -mr-48 -mt-48" />
          <div className="absolute bottom-0 left-0 w-[400px] h-[400px] bg-teal-500/10 rounded-full blur-[100px] -ml-48 -mb-48" />
          
          <div className="relative z-10 grid lg:grid-cols-2 gap-16 items-center">
            <div>
              <div className="flex items-center gap-3 mb-6">
                <div className="w-2 h-2 bg-emerald-500 rounded-full animate-pulse" />
                <span className="text-[10px] font-black uppercase tracking-[0.3em] text-slate-400">Node Expansion</span>
              </div>
              <h1 className="text-5xl md:text-7xl font-black tracking-tighter mb-8 leading-[0.9]">
                Become an <span className="text-emerald-400">EV Pilot</span>.
              </h1>
              <p className="text-xl text-slate-400 font-medium leading-relaxed max-w-xl mb-12">
                Join Jaipur's premier zero-emission network. Earn up to <span className="text-white font-black">₹{apiConfig.driver.earningsMonthly.max.toLocaleString()}</span> monthly managing the fleet of tomorrow.
              </p>
              
              <div className="flex flex-wrap gap-4 mb-12">
                <StatusBadge type="emerald">Weekly Payouts</StatusBadge>
                <StatusBadge type="teal">Zero Fuel Cost</StatusBadge>
                <StatusBadge type="violet">Flexible Grid</StatusBadge>
              </div>

              <button
                onClick={() => setShowModal(true)}
                className="group px-12 py-6 bg-emerald-500 text-white rounded-3xl font-black text-xs uppercase tracking-[0.2em] hover:bg-emerald-600 transition-all shadow-xl shadow-emerald-500/20 active:scale-[0.98] flex items-center gap-4"
              >
                Initiate Onboarding
                <ChevronRight size={18} className="group-hover:translate-x-1 transition-transform" />
              </button>
            </div>

            <div className="hidden lg:block relative">
              <div className="bg-white/5 backdrop-blur-3xl rounded-[3rem] p-10 border border-white/10">
                <div className="flex items-center gap-4 mb-10">
                  <div className="p-4 bg-emerald-500/20 text-emerald-400 rounded-2xl">
                    <ShieldCheck size={32} />
                  </div>
                  <div>
                    <h3 className="text-lg font-black tracking-tight">Verified Protocol</h3>
                    <p className="text-[10px] font-black text-slate-500 uppercase tracking-widest">System Security Level: MAX</p>
                  </div>
                </div>
                
                <div className="space-y-6">
                  {[
                    { label: 'Pilot Support', value: '24/7 Real-time', icon: Phone },
                    { label: 'Network Reach', value: 'Greater Jaipur', icon: Globe },
                    { label: 'Training Node', value: 'Full Induction', icon: Award }
                  ].map((item, idx) => (
                    <div key={idx} className="flex items-center justify-between p-5 bg-white/5 rounded-2xl border border-white/5">
                      <div className="flex items-center gap-4">
                        <item.icon size={18} className="text-slate-400" />
                        <span className="text-sm font-bold text-slate-300">{item.label}</span>
                      </div>
                      <span className="text-sm font-black text-white">{item.value}</span>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* ===== ANALYTICS / EARNINGS ===== */}
        <div className="grid md:grid-cols-3 gap-8">
          {[
            { 
              title: 'Daily Trajectory', 
              value: `₹${apiConfig.driver.earningsDaily.min} - ₹${apiConfig.driver.earningsDaily.max}`, 
              sub: '8-10 Hours Operational',
              icon: Calendar,
              color: 'text-emerald-500',
              bg: 'bg-emerald-50'
            },
            { 
              title: 'Weekly Cycle', 
              value: `₹${apiConfig.driver.earningsWeekly.min.toLocaleString()} - ₹${apiConfig.driver.earningsWeekly.max.toLocaleString()}`, 
              sub: '5-6 Days Active',
              icon: Zap,
              color: 'text-teal-500',
              bg: 'bg-teal-50',
              popular: true
            },
            { 
              title: 'Monthly Volume', 
              value: `₹${apiConfig.driver.earningsMonthly.min.toLocaleString()} - ₹${apiConfig.driver.earningsMonthly.max.toLocaleString()}`, 
              sub: 'Performance Optimized',
              icon: Award,
              color: 'text-violet-500',
              bg: 'bg-violet-50'
            }
          ].map((stat, idx) => (
            <motion.div
              key={idx}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: idx * 0.1 }}
              className={`relative bg-white rounded-[3rem] p-10 shadow-sm border border-slate-100 overflow-hidden ${stat.popular ? 'ring-2 ring-emerald-500/20' : ''}`}
            >
              {stat.popular && (
                <div className="absolute top-8 right-8">
                  <StatusBadge type="emerald">Optimal</StatusBadge>
                </div>
              )}
              <div className={`p-5 ${stat.bg} ${stat.color} rounded-2xl w-fit mb-8`}>
                <stat.icon size={28} />
              </div>
              <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-2">{stat.title}</p>
              <h3 className="text-3xl font-black text-slate-900 mb-2">{stat.value}</h3>
              <p className="text-xs font-bold text-slate-500">{stat.sub}</p>
            </motion.div>
          ))}
        </div>

        {/* ===== REQUIREMENTS GRID ===== */}
        <div className="bg-white rounded-[4rem] p-12 md:p-20 shadow-sm border border-slate-100">
          <div className="max-w-4xl mx-auto">
            <div className="text-center mb-16">
              <h2 className="text-4xl font-black text-slate-900 tracking-tighter mb-4">Pilot Requirements</h2>
              <p className="text-slate-500 font-bold text-xs uppercase tracking-widest">Verify your credentials against our protocol</p>
            </div>
            
            <div className="grid md:grid-cols-2 gap-10">
              {[
                { title: 'Authorized License', desc: 'Valid legal documentation for motor operation.', icon: FileText },
                { title: 'Operational Integrity', desc: 'Maintain a clean synchronization record.', icon: ShieldCheck },
                { title: 'Maturity Threshold', desc: 'Operator must be 18+ biological years.', icon: User },
                { title: 'Digital Interface', desc: 'Modern smartphone with persistent link.', icon: Phone },
                { title: 'Communication Node', desc: 'High-level customer interaction capacity.', icon: Briefcase }
              ].map((req, idx) => (
                <div key={idx} className="flex gap-6">
                  <div className="p-4 bg-slate-50 text-slate-900 rounded-2xl h-fit">
                    <req.icon size={20} />
                  </div>
                  <div>
                    <h4 className="text-lg font-black text-slate-900 tracking-tight mb-1">{req.title}</h4>
                    <p className="text-sm font-medium text-slate-500 leading-relaxed">{req.desc}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* ===== INTEGRATED REGISTRATION MODAL ===== */}
        <AnimatePresence>
          {showModal && (
            <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                onClick={() => setShowModal(false)}
                className="absolute inset-0 bg-slate-900/60 backdrop-blur-xl"
              />
              
              <motion.div
                initial={{ opacity: 0, scale: 0.95, y: 20 }}
                animate={{ opacity: 1, scale: 1, y: 0 }}
                exit={{ opacity: 0, scale: 0.95, y: 20 }}
                className="relative w-full max-w-3xl bg-white rounded-[3.5rem] shadow-2xl overflow-hidden"
              >
                {/* Modal Header */}
                <div className="bg-slate-900 p-10 md:p-14 text-white relative">
                  <div className="absolute top-0 right-0 w-64 h-64 bg-emerald-500/10 rounded-full blur-[80px] -mr-32 -mt-32" />
                  <div className="relative z-10">
                    <div className="flex justify-between items-start mb-6">
                      <div className="flex items-center gap-3">
                        <div className="w-2 h-2 bg-emerald-500 rounded-full" />
                        <span className="text-[10px] font-black uppercase tracking-[0.2em] text-slate-400">Onboarding Initiation</span>
                      </div>
                      <button onClick={() => setShowModal(false)} className="p-2 hover:bg-white/10 rounded-xl transition-colors">
                        <X size={24} />
                      </button>
                    </div>
                    <h2 className="text-4xl font-black tracking-tighter">Pilot Registration</h2>
                  </div>
                </div>

                <div className="p-10 md:p-14 overflow-y-auto max-h-[60vh]">
                  <AnimatePresence mode="wait">
                    {message.text && (
                      <motion.div
                        initial={{ opacity: 0, height: 0 }}
                        animate={{ opacity: 1, height: 'auto' }}
                        exit={{ opacity: 0, height: 0 }}
                        className={`mb-10 p-5 rounded-2xl flex items-center gap-4 ${
                          message.type === 'success' ? 'bg-emerald-50 text-emerald-600 border border-emerald-100' : 'bg-rose-50 text-rose-600 border border-rose-100'
                        }`}
                      >
                        {message.type === 'success' ? <CheckCircle size={20} /> : <AlertCircle size={20} />}
                        <p className="text-xs font-black uppercase tracking-widest">{message.text}</p>
                      </motion.div>
                    )}
                  </AnimatePresence>

                  <form onSubmit={handleSubmit} className="space-y-8">
                    <div className="grid md:grid-cols-2 gap-8">
                      <div className="space-y-2">
                        <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Pilot Identity</label>
                        <div className="relative group">
                          <div className="absolute left-6 top-1/2 -translate-y-1/2 text-slate-400 group-focus-within:text-emerald-500 transition-colors">
                            <User size={18} />
                          </div>
                          <input
                            type="text"
                            name="name"
                            value={formData.name}
                            onChange={handleInputChange}
                            placeholder="Full Name"
                            className="w-full pl-14 pr-6 py-5 bg-slate-50 rounded-2xl border-none focus:ring-2 focus:ring-emerald-500 text-sm font-bold transition-all"
                            disabled={loading}
                          />
                        </div>
                      </div>

                      <div className="space-y-2">
                        <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Communication Node</label>
                        <div className="relative group">
                          <div className="absolute left-6 top-1/2 -translate-y-1/2 text-slate-400 group-focus-within:text-emerald-500 transition-colors">
                            <Mail size={18} />
                          </div>
                          <input
                            type="email"
                            name="email"
                            value={formData.email}
                            onChange={handleInputChange}
                            placeholder="Email Address"
                            className="w-full pl-14 pr-6 py-5 bg-slate-50 rounded-2xl border-none focus:ring-2 focus:ring-emerald-500 text-sm font-bold transition-all"
                            disabled={loading}
                          />
                        </div>
                      </div>
                    </div>

                    <div className="grid md:grid-cols-2 gap-8">
                      <div className="space-y-2">
                        <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Contact Matrix</label>
                        <div className="relative group">
                          <div className="absolute left-6 top-1/2 -translate-y-1/2 text-slate-400 group-focus-within:text-emerald-500 transition-colors">
                            <Phone size={18} />
                          </div>
                          <input
                            type="tel"
                            name="phone"
                            value={formData.phone}
                            onChange={handleInputChange}
                            placeholder="10-digit Phone"
                            className="w-full pl-14 pr-6 py-5 bg-slate-50 rounded-2xl border-none focus:ring-2 focus:ring-emerald-500 text-sm font-bold transition-all"
                            disabled={loading}
                          />
                        </div>
                      </div>

                      <div className="space-y-2">
                        <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Experience Telemetry</label>
                        <div className="relative group">
                          <div className="absolute left-6 top-1/2 -translate-y-1/2 text-slate-400 group-focus-within:text-emerald-500 transition-colors">
                            <Briefcase size={18} />
                          </div>
                          <select
                            name="experience"
                            value={formData.experience}
                            onChange={handleInputChange}
                            className="w-full pl-14 pr-6 py-5 bg-slate-50 rounded-2xl border-none focus:ring-2 focus:ring-emerald-500 text-sm font-bold transition-all appearance-none"
                            disabled={loading}
                          >
                            <option value="">Select telemetry</option>
                            <option value="0-1">0-1 Cycles</option>
                            <option value="1-3">1-3 Cycles</option>
                            <option value="3-5">3-5 Cycles</option>
                            <option value="5+">5+ Senior Pilot</option>
                          </select>
                        </div>
                      </div>
                    </div>

                    <div className="space-y-2">
                      <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Authorization Document (License)</label>
                      <div className="relative">
                        <input
                          type="file"
                          accept={apiConfig.driver.allowedFileTypes.join(',')}
                          onChange={handleFileUpload}
                          className="hidden"
                          id="licenseInput"
                          disabled={loading}
                        />
                        <label
                          htmlFor="licenseInput"
                          className="flex flex-col items-center justify-center w-full py-12 bg-slate-50 border-2 border-dashed border-slate-200 rounded-[2rem] cursor-pointer hover:border-emerald-500 hover:bg-emerald-50 transition-all group"
                        >
                          {filePreview ? (
                            <motion.div initial={{ opacity: 0, scale: 0.9 }} animate={{ opacity: 1, scale: 1 }} className="text-center">
                              <img src={filePreview} alt="Auth Preview" className="max-h-40 mx-auto mb-6 rounded-2xl shadow-xl" />
                              <p className="text-[10px] font-black text-emerald-600 uppercase tracking-widest">Document Secured</p>
                            </motion.div>
                          ) : (
                            <div className="text-center">
                              <div className="p-5 bg-white text-slate-400 rounded-2xl shadow-sm mb-4 inline-block group-hover:scale-110 transition-transform">
                                <Upload size={24} />
                              </div>
                              <p className="text-sm font-black text-slate-900 mb-1">Click to Upload Entity ID</p>
                              <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">PDF, JPG, PNG (MAX 5MB)</p>
                            </div>
                          )}
                        </label>
                      </div>
                    </div>

                    <div className="flex gap-4 pt-4">
                      <button
                        type="button"
                        onClick={() => setShowModal(false)}
                        className="flex-1 py-5 bg-slate-50 text-slate-500 rounded-2xl font-black text-[10px] uppercase tracking-widest hover:bg-slate-100 transition-all"
                      >
                        Abort
                      </button>
                      <button
                        type="submit"
                        disabled={loading}
                        className="flex-[2] py-5 bg-slate-900 text-white rounded-2xl font-black text-[10px] uppercase tracking-[0.2em] hover:bg-black transition-all shadow-2xl disabled:opacity-50 flex items-center justify-center gap-3"
                      >
                        {loading ? <Loader className="animate-spin" size={16} /> : <Zap size={16} />}
                        {loading ? 'Processing...' : 'Establish Link'}
                      </button>
                    </div>
                  </form>
                </div>
              </motion.div>
            </div>
          )}
        </AnimatePresence>
      </div>
    </div>
  );
}
