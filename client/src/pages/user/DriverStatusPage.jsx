import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  ShieldCheck,
  Clock,
  AlertCircle,
  CheckCircle,
  FileText,
  Car,
  Phone,
  User as UserIcon,
  Mail,
  Calendar,
  ChevronRight,
  Zap,
  Sparkles,
  ArrowRight,
  Activity
} from 'lucide-react';
import UserLayout from './UserLayout.jsx';
import { useAuth } from '../../context/AuthContext.jsx';
import * as authService from '../../services/authService.js';

const DriverStatusPage = () => {
  const { user } = useAuth();
  const [driverData, setDriverData] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchDriverDetails = async () => {
      try {
        const res = await authService.getDriverStatus();
        if (res.success) {
          setDriverData(res.data);
        }
      } catch (error) {
        console.error('Error fetching driver details:', error);
      } finally {
        setLoading(false);
      }
    };

    if (user) {
      fetchDriverDetails();
    } else {
      setLoading(false);
    }
  }, [user]);

  if (loading) {
    return (
      <UserLayout>
        <div className="flex flex-col items-center justify-center h-[60vh]">
          <motion.div
            animate={{ 
              rotate: 360,
              scale: [1, 1.2, 1],
              borderColor: ['#10b981', '#3b82f6', '#10b981']
            }}
            transition={{ duration: 2, repeat: Infinity, ease: 'easeInOut' }}
            className="w-16 h-16 border-4 border-emerald-500 border-t-transparent rounded-full mb-6"
          />
          <p className="text-slate-500 font-black uppercase tracking-[0.2em] text-[10px] animate-pulse">Syncing Protocol Status...</p>
        </div>
      </UserLayout>
    );
  }

  if (!driverData && user?.role !== 'driver') {
    return (
      <UserLayout>
        <div className="max-w-4xl mx-auto text-center py-24 px-6 bg-white dark:bg-slate-900 rounded-[3.5rem] border border-slate-100 dark:border-slate-800 shadow-2xl relative overflow-hidden">
          <div className="absolute top-0 right-0 w-64 h-64 bg-emerald-500/5 rounded-full -translate-y-1/2 translate-x-1/2 blur-3xl" />
          
          <div className="relative z-10">
            <div className="w-24 h-24 bg-slate-50 dark:bg-slate-800 rounded-3xl flex items-center justify-center mx-auto mb-10 shadow-inner">
              <Activity size={48} className="text-slate-300 dark:text-slate-600" />
            </div>
            <h2 className="text-4xl md:text-5xl font-black text-slate-900 dark:text-white mb-6 tracking-tight">No Pilot Profile Found.</h2>
            <p className="text-lg text-slate-500 dark:text-slate-400 mb-12 font-medium max-w-md mx-auto leading-relaxed">
              It appears you haven't initiated the driver partner onboarding protocol yet. Join Jaipur's premium EV fleet today.
            </p>
            <button
              onClick={() => window.location.href = '/partner/driver'}
              className="group inline-flex items-center gap-3 px-10 py-5 bg-emerald-600 text-white rounded-2xl font-black text-sm uppercase tracking-widest shadow-2xl hover:scale-[1.02] active:scale-[0.98] transition-all"
            >
              Initiate Onboarding <ArrowRight size={18} className="transition-transform group-hover:translate-x-2" />
            </button>
          </div>
        </div>
      </UserLayout>
    );
  }

  const isApproved = driverData?.isApproved;
  const status = driverData?.status || 'pending';

  return (
    <UserLayout>
      <div className="max-w-6xl mx-auto space-y-10">
        
        {/* Header Protocol Card */}
        <div className="bg-white dark:bg-slate-900 rounded-[3rem] md:rounded-[4rem] p-8 md:p-16 shadow-2xl border border-slate-100 dark:border-slate-800 relative overflow-hidden group">
          <div className="absolute top-0 right-0 w-[600px] h-[600px] bg-emerald-500/5 rounded-full -translate-y-1/2 translate-x-1/2 blur-[100px] pointer-events-none" />
          
          <div className="relative z-10 flex flex-col md:flex-row items-center gap-12 text-center md:text-left">
            <motion.div 
              initial={{ scale: 0.9, rotate: -5 }}
              animate={{ scale: 1, rotate: 3 }}
              className={`w-32 h-32 rounded-[2.5rem] flex items-center justify-center text-white shadow-2xl shrink-0 ${
                isApproved ? 'bg-emerald-500 shadow-emerald-500/20' : 
                status === 'rejected' ? 'bg-rose-500 shadow-rose-500/20' : 
                'bg-blue-600 shadow-blue-500/20'
              }`}
            >
              {isApproved ? <ShieldCheck size={64} /> : 
               status === 'rejected' ? <AlertCircle size={64} /> : 
               <Clock size={64} className="animate-pulse" />}
            </motion.div>

            <div className="flex-1">
              <div className="flex flex-wrap items-center justify-center md:justify-start gap-4 mb-6">
                <h1 className="text-3xl md:text-5xl font-black text-slate-900 dark:text-white tracking-tight">Onboarding Status</h1>
                <span className={`px-5 py-2 rounded-full text-[10px] font-black uppercase tracking-[0.2em] border ${
                  isApproved ? 'bg-emerald-50 dark:bg-emerald-900/20 text-emerald-600 dark:text-emerald-400 border-emerald-100 dark:border-emerald-800' : 
                  status === 'rejected' ? 'bg-rose-50 dark:bg-rose-900/20 text-rose-600 dark:text-rose-400 border-rose-100 dark:border-rose-800' : 
                  'bg-blue-50 dark:bg-blue-900/20 text-blue-600 dark:text-blue-400 border-blue-100 dark:border-blue-800'
                }`}>
                  {isApproved ? 'Verified & Active' : status.toUpperCase()}
                </span>
              </div>
              <p className="text-lg md:text-xl text-slate-500 dark:text-slate-400 font-medium max-w-2xl leading-relaxed">
                {isApproved
                  ? 'Protocol complete. Your pilot credentials have been verified. You are now authorized to accept fleet assignments.'
                  : status === 'rejected'
                    ? `Verification failed. Reason: ${driverData.rejectionReason || 'Incomplete documentation.'} Please contact support for remediation.`
                    : 'Your application is currently undergoing secure document verification. Our team will finalize the audit within 24-48 hours.'}
              </p>
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-10">
          
          {/* Detailed Protocol Cards */}
          <div className="lg:col-span-2 space-y-10">
            <div className="bg-white dark:bg-slate-900 rounded-[3rem] p-10 shadow-2xl border border-slate-100 dark:border-slate-800">
              <h3 className="text-xl font-black text-slate-900 dark:text-white mb-8 flex items-center gap-3">
                <UserIcon size={22} className="text-emerald-600 dark:text-emerald-400" />
                Pilot Profile Protocol
              </h3>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {[
                  { label: "Designation", value: driverData?.name },
                  { label: "Digital Mail", value: driverData?.email },
                  { label: "Secure Line", value: driverData?.phone },
                  { label: "License Auth", value: driverData?.licenseNumber }
                ].map((item, i) => (
                  <div key={i} className="bg-slate-50 dark:bg-slate-800/50 p-6 rounded-[2rem] border border-slate-100 dark:border-slate-800">
                    <p className="text-[10px] font-black text-slate-400 dark:text-slate-500 uppercase tracking-widest mb-1">{item.label}</p>
                    <p className="font-bold text-slate-800 dark:text-slate-200">{item.value}</p>
                  </div>
                ))}
              </div>
            </div>

            <div className="bg-white dark:bg-slate-900 rounded-[3rem] p-10 shadow-2xl border border-slate-100 dark:border-slate-800">
              <h3 className="text-xl font-black text-slate-900 dark:text-white mb-8 flex items-center gap-3">
                <Car size={22} className="text-emerald-600 dark:text-emerald-400" />
                Hardware Assignment
              </h3>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {[
                  { label: "Vechicle Class", value: driverData?.vehicleDetails?.vehicleModel },
                  { label: "Identification Plate", value: driverData?.vehicleDetails?.vehicleNumber },
                  { label: "Drive Protocol", value: driverData?.vehicleDetails?.vehicleType },
                  { label: "Visual Spectrum", value: driverData?.vehicleDetails?.vehicleColor || 'Not specified' }
                ].map((item, i) => (
                  <div key={i} className="bg-slate-50 dark:bg-slate-800/50 p-6 rounded-[2rem] border border-slate-100 dark:border-slate-800">
                    <p className="text-[10px] font-black text-slate-400 dark:text-slate-500 uppercase tracking-widest mb-1">{item.label}</p>
                    <p className="font-bold text-slate-800 dark:text-slate-200 capitalize">{item.value}</p>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* Sidebar / Timeline */}
          <div className="space-y-10">
            <div className="bg-slate-900 rounded-[3rem] p-10 shadow-2xl text-white relative overflow-hidden group">
              <div className="absolute -right-4 -top-4 w-32 h-32 bg-emerald-600/20 rounded-full blur-3xl group-hover:scale-125 transition-transform duration-700" />

              <h3 className="text-lg font-black mb-10 relative z-10 flex items-center gap-3">
                <Activity size={18} className="text-emerald-400" />
                Audit Timeline
              </h3>

              <div className="space-y-10 relative z-10">
                {[
                  { 
                    label: "Transmission", 
                    status: "Completed", 
                    date: new Date(driverData?.createdAt).toLocaleDateString(),
                    active: true,
                    completed: true
                  },
                  { 
                    label: "Verification", 
                    status: isApproved ? "Authorized" : "In Progress", 
                    date: isApproved ? "System Verified" : "Review Stage",
                    active: true,
                    completed: isApproved
                  },
                  { 
                    label: "Deployment", 
                    status: isApproved ? "Ready" : "Pending", 
                    date: isApproved ? "Authorized for Fleet" : "Awaiting Audit",
                    active: isApproved,
                    completed: false
                  }
                ].map((step, i) => (
                  <div key={i} className="flex gap-6">
                    <div className="flex flex-col items-center">
                      <div className={`w-10 h-10 rounded-2xl flex items-center justify-center transition-all duration-500 ${
                        step.completed ? 'bg-emerald-500 shadow-[0_0_20px_rgba(16,185,129,0.4)]' : 
                        step.active ? 'bg-blue-600 animate-pulse shadow-[0_0_20px_rgba(37,99,235,0.4)]' : 
                        'bg-slate-800 border border-slate-700'
                      }`}>
                        {step.completed ? <CheckCircle size={20} /> : <Clock size={20} className={step.active ? '' : 'text-slate-600'} />}
                      </div>
                      {i < 2 && <div className={`w-0.5 h-12 my-2 rounded-full ${step.completed ? 'bg-emerald-500/30' : 'bg-slate-800'}`} />}
                    </div>
                    <div>
                      <p className={`text-[10px] font-black uppercase tracking-[0.2em] mb-1 ${step.completed ? 'text-emerald-400' : step.active ? 'text-blue-400' : 'text-slate-600'}`}>
                        {step.label}
                      </p>
                      <p className={`text-sm font-black tracking-tight mb-0.5 ${step.active ? 'text-slate-100' : 'text-slate-500'}`}>{step.status}</p>
                      <p className="text-[10px] font-bold text-slate-500">{step.date}</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            <div className="bg-white dark:bg-slate-900 rounded-[3rem] p-10 shadow-2xl border border-slate-100 dark:border-slate-800 relative overflow-hidden group">
              <div className="absolute bottom-0 left-0 w-full h-1 bg-gradient-to-r from-emerald-500 to-blue-500 transform scale-x-0 group-hover:scale-x-100 transition-transform duration-500" />
              <h3 className="text-xl font-black text-slate-900 dark:text-white mb-6 tracking-tight">Technical Support</h3>
              <p className="text-sm text-slate-500 dark:text-slate-400 mb-10 font-medium leading-relaxed">If your verification protocol exceeds 72 hours, initiate a priority support request.</p>
              
              <a
                href="tel:+918690366601"
                className="flex items-center justify-between p-6 bg-slate-50 dark:bg-slate-800/50 rounded-[2rem] group/btn hover:bg-emerald-600 transition-all duration-300"
              >
                <div className="flex items-center gap-4">
                  <div className="w-12 h-12 rounded-2xl bg-white dark:bg-slate-800 flex items-center justify-center text-emerald-600 group-hover/btn:bg-emerald-500 group-hover/btn:text-white transition-all shadow-sm">
                    <Phone size={20} />
                  </div>
                  <div>
                    <p className="text-[10px] font-black text-slate-400 group-hover/btn:text-emerald-100 uppercase tracking-widest mb-0.5">Priority Support</p>
                    <p className="text-sm font-black text-slate-900 dark:text-white group-hover/btn:text-white">+91 86903 66601</p>
                  </div>
                </div>
                <ChevronRight size={20} className="text-slate-300 group-hover/btn:text-white transition-all transform group-hover/btn:translate-x-1" />
              </a>
            </div>
          </div>
        </div>
      </div>
    </UserLayout>
  );
};

export default DriverStatusPage;

