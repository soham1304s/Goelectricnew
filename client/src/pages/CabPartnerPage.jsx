import React, { useState } from 'react';
import { 
  Upload, 
  Zap, 
  Phone, 
  User, 
  FileText, 
  Car, 
  DollarSign, 
  Clock, 
  Shield, 
  TrendingUp, 
  ChevronRight,
  ShieldCheck,
  Globe,
  Briefcase,
  AlertCircle,
  X,
  Plus,
  Mail,
  Box,
  Loader,
  CheckCircle
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

export default function CabPartnerPage() {
  const [formData, setFormData] = useState({
    ownerName: '',
    phone: '',
    vehicleModel: '',
    evType: '',
    rcUpload: null,
    insuranceUpload: null,
  });
  
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState({ type: '', text: '' });
  const [filePreview, setFilePreview] = useState({ rc: null, insurance: null });
  const [showModal, setShowModal] = useState(false);

  const evTypes = apiConfig.cab.evTypes;

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleFileUpload = (e, fileType) => {
    const file = e.target.files[0];
    if (file) {
      setFormData(prev => ({ ...prev, [fileType === 'rc' ? 'rcUpload' : 'insuranceUpload']: file }));
      const reader = new FileReader();
      reader.onloadend = () => setFilePreview(prev => ({ ...prev, [fileType]: reader.result }));
      reader.readAsDataURL(file);
    }
  };

  const validateForm = () => {
    if (!formData.ownerName.trim()) return { ok: false, text: 'Fleet owner identity required.' };
    if (!formData.phone.trim()) return { ok: false, text: 'Contact matrix required.' };
    const phoneRegex = new RegExp(`^[${apiConfig.cab.phoneStartDigits.join('')}]\\d{${apiConfig.cab.maxPhoneLength - 1}}$`);
    if (!phoneRegex.test(formData.phone)) return { ok: false, text: 'Invalid communication channel.' };
    if (!formData.vehicleModel.trim()) return { ok: false, text: 'Vehicle telemetry required.' };
    if (!formData.evType) return { ok: false, text: 'EV node type required.' };
    if (!formData.rcUpload) return { ok: false, text: 'RC authorization document required.' };
    if (!formData.insuranceUpload) return { ok: false, text: 'Insurance verification required.' };
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
      formDataToSend.append('ownerName', formData.ownerName);
      formDataToSend.append('phone', formData.phone);
      formDataToSend.append('vehicleModel', formData.vehicleModel);
      formDataToSend.append('evType', formData.evType);
      formDataToSend.append('rcDocument', formData.rcUpload);
      formDataToSend.append('insuranceDocument', formData.insuranceUpload);

      const response = await api.post(apiConfig.endpoints.cab.register, formDataToSend);

      if (response.data.success) {
        setMessage({ type: 'success', text: 'Partnership protocol initiated. Vehicle verification in progress.' });
        setTimeout(() => {
          setFormData({ ownerName: '', phone: '', vehicleModel: '', evType: '', rcUpload: null, insuranceUpload: null });
          setFilePreview({ rc: null, insurance: null });
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
          <div className="absolute top-0 right-0 w-[600px] h-[600px] bg-teal-500/10 rounded-full blur-[120px] -mr-48 -mt-48" />
          <div className="absolute bottom-0 left-0 w-[400px] h-[400px] bg-emerald-500/10 rounded-full blur-[100px] -ml-48 -mb-48" />
          
          <div className="relative z-10 grid lg:grid-cols-2 gap-16 items-center">
            <div>
              <div className="flex items-center gap-3 mb-6">
                <div className="w-2 h-2 bg-teal-500 rounded-full animate-pulse" />
                <span className="text-[10px] font-black uppercase tracking-[0.3em] text-slate-400">Fleet Partnership</span>
              </div>
              <h1 className="text-5xl md:text-7xl font-black tracking-tighter mb-8 leading-[0.9]">
                Monetize Your <span className="text-teal-400">EV Asset</span>.
              </h1>
              <p className="text-xl text-slate-400 font-medium leading-relaxed max-w-xl mb-12">
                Integrate your electric vehicle into जयपुर's premium mobility grid. Achieve up to <span className="text-white font-black">{apiConfig.cab.earningsMonthly.text}</span> ROI with guaranteed volume.
              </p>
              
              <div className="flex flex-wrap gap-4 mb-12">
                <StatusBadge type="teal">Zero Commission Gap</StatusBadge>
                <StatusBadge type="emerald">Weekly Settlement</StatusBadge>
                <StatusBadge type="violet">Asset Security</StatusBadge>
              </div>

              <button
                onClick={() => setShowModal(true)}
                className="group px-12 py-6 bg-teal-600 text-white rounded-3xl font-black text-xs uppercase tracking-[0.2em] hover:bg-teal-700 transition-all shadow-xl shadow-teal-500/20 active:scale-[0.98] flex items-center gap-4"
              >
                Register Fleet Node
                <ChevronRight size={18} className="group-hover:translate-x-1 transition-transform" />
              </button>
            </div>

            <div className="hidden lg:block relative">
              <div className="bg-white/5 backdrop-blur-3xl rounded-[3rem] p-10 border border-white/10">
                <div className="flex items-center gap-4 mb-10">
                  <div className="p-4 bg-teal-500/20 text-teal-400 rounded-2xl">
                    <ShieldCheck size={32} />
                  </div>
                  <div>
                    <h3 className="text-lg font-black tracking-tight">Enterprise Protocol</h3>
                    <p className="text-[10px] font-black text-slate-500 uppercase tracking-widest">Partner Tier: PLATINUM</p>
                  </div>
                </div>
                
                <div className="space-y-6">
                  {[
                    { label: 'Asset Insurance', value: 'Full Coverage', icon: Shield },
                    { label: 'Payout Cycle', value: '7-Day Settlement', icon: Clock },
                    { label: 'Node Support', value: 'Priority Link', icon: Phone }
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
              title: 'Asset Yield', 
              value: `₹${apiConfig.cab.earningsPerRide.min} - ₹${apiConfig.cab.earningsPerRide.max}`, 
              sub: 'Per Successful Dispatch',
              icon: TrendingUp,
              color: 'text-teal-500',
              bg: 'bg-teal-50'
            },
            { 
              title: 'Monthly Trajectory', 
              value: apiConfig.cab.earningsMonthly.text, 
              sub: 'Full Network Utilization',
              icon: DollarSign,
              color: 'text-emerald-500',
              bg: 'bg-emerald-50',
              popular: true
            },
            { 
              title: 'Daily Average', 
              value: `₹${apiConfig.cab.earningsDailyAverage.min.toLocaleString()} - ₹${apiConfig.cab.earningsDailyAverage.max.toLocaleString()}`, 
              sub: '8-Hour Activity Node',
              icon: Clock,
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
              className={`relative bg-white rounded-[3rem] p-10 shadow-sm border border-slate-100 overflow-hidden ${stat.popular ? 'ring-2 ring-teal-500/20' : ''}`}
            >
              {stat.popular && (
                <div className="absolute top-8 right-8">
                  <StatusBadge type="teal">Peak ROI</StatusBadge>
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

        {/* ===== COMMISSION STRUCTURE GRID ===== */}
        <div className="grid lg:grid-cols-2 gap-8">
          <div className="bg-white rounded-[4rem] p-12 shadow-sm border border-slate-100">
            <h3 className="text-2xl font-black text-slate-900 tracking-tighter mb-10 flex items-center gap-4">
              <div className="p-3 bg-teal-50 text-teal-600 rounded-2xl"><Zap size={24}/></div>
              Commission Protocol
            </h3>
            <div className="space-y-6">
              {[
                { label: apiConfig.cab.commission.firstRides.label, value: `${apiConfig.cab.commission.firstRides.percentage}%`, sub: 'Initial Onboarding Period' },
                { label: apiConfig.cab.commission.standardCommission.label, value: `${apiConfig.cab.commission.standardCommission.percentage}%`, sub: 'Enterprise Standard' },
                { label: apiConfig.cab.commission.bonus.label, value: `+₹${apiConfig.cab.commission.bonus.max}`, sub: 'Peak Network Performance' }
              ].map((item, idx) => (
                <div key={idx} className="flex items-center justify-between p-6 bg-slate-50 rounded-3xl border border-slate-100">
                  <div>
                    <p className="text-sm font-black text-slate-900 mb-1">{item.label}</p>
                    <p className="text-[10px] font-bold text-slate-500 uppercase tracking-widest">{item.sub}</p>
                  </div>
                  <div className="text-xl font-black text-teal-600">{item.value}</div>
                </div>
              ))}
            </div>
          </div>

          <div className="bg-white rounded-[4rem] p-12 shadow-sm border border-slate-100">
            <h3 className="text-2xl font-black text-slate-900 tracking-tighter mb-10 flex items-center gap-4">
              <div className="p-3 bg-emerald-50 text-emerald-600 rounded-2xl"><Clock size={24}/></div>
              Settlement Protocol
            </h3>
            <div className="space-y-6">
              {[
                { label: 'Payment Frequency', value: apiConfig.cab.payment.frequency, sub: `Every ${apiConfig.cab.payment.day}` },
                { label: 'Processing Window', value: apiConfig.cab.payment.processingHours, sub: 'Network Reconciliation Time' },
                { label: 'Withdrawal Access', value: apiConfig.cab.payment.withdrawalPolicy, sub: 'On-demand Liquidity' }
              ].map((item, idx) => (
                <div key={idx} className="flex items-center justify-between p-6 bg-slate-50 rounded-3xl border border-slate-100">
                  <div>
                    <p className="text-sm font-black text-slate-900 mb-1">{item.label}</p>
                    <p className="text-[10px] font-bold text-slate-500 uppercase tracking-widest">{item.sub}</p>
                  </div>
                  <div className="text-sm font-black text-emerald-600 uppercase tracking-widest">{item.value}</div>
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
                  <div className="absolute top-0 right-0 w-64 h-64 bg-teal-500/10 rounded-full blur-[80px] -mr-32 -mt-32" />
                  <div className="relative z-10">
                    <div className="flex justify-between items-start mb-6">
                      <div className="flex items-center gap-3">
                        <div className="w-2 h-2 bg-teal-500 rounded-full" />
                        <span className="text-[10px] font-black uppercase tracking-[0.2em] text-slate-400">Partnership Initiation</span>
                      </div>
                      <button onClick={() => setShowModal(false)} className="p-2 hover:bg-white/10 rounded-xl transition-colors">
                        <X size={24} />
                      </button>
                    </div>
                    <h2 className="text-4xl font-black tracking-tighter">Cab Registration</h2>
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
                        <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Fleet Owner Identity</label>
                        <div className="relative group">
                          <div className="absolute left-6 top-1/2 -translate-y-1/2 text-slate-400 group-focus-within:text-teal-500 transition-colors">
                            <User size={18} />
                          </div>
                          <input
                            type="text"
                            name="ownerName"
                            value={formData.ownerName}
                            onChange={handleInputChange}
                            placeholder="Full Name"
                            className="w-full pl-14 pr-6 py-5 bg-slate-50 rounded-2xl border-none focus:ring-2 focus:ring-teal-500 text-sm font-bold transition-all"
                            disabled={loading}
                          />
                        </div>
                      </div>

                      <div className="space-y-2">
                        <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Contact Matrix</label>
                        <div className="relative group">
                          <div className="absolute left-6 top-1/2 -translate-y-1/2 text-slate-400 group-focus-within:text-teal-500 transition-colors">
                            <Phone size={18} />
                          </div>
                          <input
                            type="tel"
                            name="phone"
                            value={formData.phone}
                            onChange={handleInputChange}
                            placeholder="10-digit Phone"
                            className="w-full pl-14 pr-6 py-5 bg-slate-50 rounded-2xl border-none focus:ring-2 focus:ring-teal-500 text-sm font-bold transition-all"
                            disabled={loading}
                          />
                        </div>
                      </div>
                    </div>

                    <div className="grid md:grid-cols-2 gap-8">
                      <div className="space-y-2">
                        <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">EV Node Type</label>
                        <div className="relative group">
                          <div className="absolute left-6 top-1/2 -translate-y-1/2 text-slate-400 group-focus-within:text-teal-500 transition-colors">
                            <Zap size={18} />
                          </div>
                          <select
                            name="evType"
                            value={formData.evType}
                            onChange={handleInputChange}
                            className="w-full pl-14 pr-6 py-5 bg-slate-50 rounded-2xl border-none focus:ring-2 focus:ring-teal-500 text-sm font-bold transition-all appearance-none"
                            disabled={loading}
                          >
                            <option value="">Select EV Tier</option>
                            {evTypes.map(ev => (
                              <option key={ev.value} value={ev.value}>{ev.label}</option>
                            ))}
                          </select>
                        </div>
                      </div>

                      <div className="space-y-2">
                        <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Vehicle Telemetry</label>
                        <div className="relative group">
                          <div className="absolute left-6 top-1/2 -translate-y-1/2 text-slate-400 group-focus-within:text-teal-500 transition-colors">
                            <Car size={18} />
                          </div>
                          <input
                            type="text"
                            name="vehicleModel"
                            value={formData.vehicleModel}
                            onChange={handleInputChange}
                            placeholder="Model / Year (e.g. Nexon EV 2024)"
                            className="w-full pl-14 pr-6 py-5 bg-slate-50 rounded-2xl border-none focus:ring-2 focus:ring-teal-500 text-sm font-bold transition-all"
                            disabled={loading}
                          />
                        </div>
                      </div>
                    </div>

                    <div className="grid md:grid-cols-2 gap-8">
                      <div className="space-y-2">
                        <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">RC Authorization</label>
                        <div className="relative">
                          <input
                            type="file"
                            accept={apiConfig.cab.allowedFileTypes.join(',')}
                            onChange={(e) => handleFileUpload(e, 'rc')}
                            className="hidden"
                            id="rcInput"
                            disabled={loading}
                          />
                          <label
                            htmlFor="rcInput"
                            className="flex flex-col items-center justify-center w-full py-10 bg-slate-50 border-2 border-dashed border-slate-200 rounded-[2rem] cursor-pointer hover:border-teal-500 hover:bg-teal-50 transition-all group"
                          >
                            {filePreview.rc ? (
                              <motion.div initial={{ opacity: 0, scale: 0.9 }} animate={{ opacity: 1, scale: 1 }} className="text-center">
                                <img src={filePreview.rc} alt="RC Preview" className="max-h-32 mx-auto mb-4 rounded-2xl shadow-lg" />
                                <p className="text-[10px] font-black text-teal-600 uppercase tracking-widest">RC Secured</p>
                              </motion.div>
                            ) : (
                              <div className="text-center">
                                <Upload size={20} className="mx-auto mb-3 text-slate-400" />
                                <p className="text-xs font-black text-slate-900 mb-1">Upload RC</p>
                                <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">MAX 5MB</p>
                              </div>
                            )}
                          </label>
                        </div>
                      </div>

                      <div className="space-y-2">
                        <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Insurance Protocol</label>
                        <div className="relative">
                          <input
                            type="file"
                            accept={apiConfig.cab.allowedFileTypes.join(',')}
                            onChange={(e) => handleFileUpload(e, 'insurance')}
                            className="hidden"
                            id="insuranceInput"
                            disabled={loading}
                          />
                          <label
                            htmlFor="insuranceInput"
                            className="flex flex-col items-center justify-center w-full py-10 bg-slate-50 border-2 border-dashed border-slate-200 rounded-[2rem] cursor-pointer hover:border-teal-500 hover:bg-teal-50 transition-all group"
                          >
                            {filePreview.insurance ? (
                              <motion.div initial={{ opacity: 0, scale: 0.9 }} animate={{ opacity: 1, scale: 1 }} className="text-center">
                                <img src={filePreview.insurance} alt="Insurance Preview" className="max-h-32 mx-auto mb-4 rounded-2xl shadow-lg" />
                                <p className="text-[10px] font-black text-teal-600 uppercase tracking-widest">Policy Secured</p>
                              </motion.div>
                            ) : (
                              <div className="text-center">
                                <Upload size={20} className="mx-auto mb-3 text-slate-400" />
                                <p className="text-xs font-black text-slate-900 mb-1">Upload Policy</p>
                                <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">MAX 5MB</p>
                              </div>
                            )}
                          </label>
                        </div>
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
                        {loading ? 'Processing...' : 'Establish Partnership'}
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