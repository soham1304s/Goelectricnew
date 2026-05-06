import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
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
  ChevronRight
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
            animate={{ rotate: 360 }}
            transition={{ duration: 1, repeat: Infinity, ease: 'linear' }}
            className="w-12 h-12 border-4 border-blue-500 border-t-transparent rounded-full mb-4"
          />
          <p className="text-slate-500 font-medium animate-pulse">Verifying application status...</p>
        </div>
      </UserLayout>
    );
  }

  if (!driverData && user?.role !== 'driver') {
    return (
      <UserLayout>
        <div className="max-w-3xl mx-auto text-center py-20 px-6">
          <div className="w-20 h-20 bg-slate-100 rounded-full flex items-center justify-center mx-auto mb-6">
            <AlertCircle size={40} className="text-slate-400" />
          </div>
          <h2 className="text-3xl font-black text-slate-900 mb-4">No Driver Profile Found</h2>
          <p className="text-slate-500 mb-8 font-medium">It looks like you haven't registered as a driver partner yet.</p>
          <button
            onClick={() => window.location.href = '/partner/driver'}
            className="px-8 py-4 bg-emerald-600 text-white rounded-2xl font-bold shadow-xl hover:scale-105 transition-all"
          >
            Become a Partner
          </button>
        </div>
      </UserLayout>
    );
  }

  const isApproved = driverData?.isApproved;
  const status = driverData?.status || 'pending';

  return (
    <UserLayout>
      <div className="max-w-5xl mx-auto space-y-8">
        {/* Header Section */}
        <div className="bg-white rounded-[2.5rem] p-8 md:p-12 shadow-xl border border-slate-100 relative overflow-hidden">
          <div className="absolute top-0 right-0 w-64 h-64 bg-blue-500/5 rounded-full -translate-y-1/2 translate-x-1/2 blur-3xl" />

          <div className="relative z-10 flex flex-col md:flex-row items-center gap-8 text-center md:text-left">
            <div className={`w-24 h-24 rounded-3xl flex items-center justify-center text-white shadow-2xl transform rotate-3 ${isApproved ? 'bg-emerald-500' : status === 'rejected' ? 'bg-rose-500' : 'bg-blue-600'
              }`}>
              {isApproved ? <ShieldCheck size={48} /> : status === 'rejected' ? <AlertCircle size={48} /> : <Clock size={48} className="animate-pulse" />}
            </div>

            <div className="flex-1">
              <div className="flex flex-wrap items-center justify-center md:justify-start gap-3 mb-2">
                <h1 className="text-3xl md:text-4xl font-black text-slate-900 tracking-tight">Application Status</h1>
                <span className={`px-4 py-1.5 rounded-full text-[10px] font-black uppercase tracking-[0.2em] ${isApproved ? 'bg-emerald-100 text-emerald-600' : status === 'rejected' ? 'bg-rose-100 text-rose-600' : 'bg-blue-100 text-blue-600'
                  }`}>
                  {isApproved ? 'Approved' : status.toUpperCase()}
                </span>
              </div>
              <p className="text-slate-500 font-medium max-w-xl">
                {isApproved
                  ? 'Congratulations! Your driver account is fully verified and active. You can now start accepting rides.'
                  : status === 'rejected'
                    ? `Unfortunately, your application was not approved. Reason: ${driverData.rejectionReason || 'Details not provided.'}`
                    : 'Your application is currently under review by our administration team. This process typically takes 24-48 hours.'}
              </p>
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Driver Details Card */}
          <div className="lg:col-span-2 space-y-8">
            <div className="bg-white rounded-[2.5rem] p-8 shadow-xl border border-slate-100">
              <h3 className="text-xl font-black text-slate-900 mb-6 flex items-center gap-3">
                <UserIcon size={20} className="text-blue-600" />
                Profile Information
              </h3>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="bg-slate-50 p-6 rounded-3xl space-y-1">
                  <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Full Name</p>
                  <p className="font-bold text-slate-800">{driverData?.name}</p>
                </div>
                <div className="bg-slate-50 p-6 rounded-3xl space-y-1">
                  <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Email Address</p>
                  <p className="font-bold text-slate-800">{driverData?.email}</p>
                </div>
                <div className="bg-slate-50 p-6 rounded-3xl space-y-1">
                  <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Phone Number</p>
                  <p className="font-bold text-slate-800">{driverData?.phone}</p>
                </div>
                <div className="bg-slate-50 p-6 rounded-3xl space-y-1">
                  <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">License Number</p>
                  <p className="font-bold text-slate-800">{driverData?.licenseNumber}</p>
                </div>
              </div>
            </div>

            <div className="bg-white rounded-[2.5rem] p-8 shadow-xl border border-slate-100">
              <h3 className="text-xl font-black text-slate-900 mb-6 flex items-center gap-3">
                <Car size={20} className="text-blue-600" />
                Vehicle Details
              </h3>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="bg-slate-50 p-6 rounded-3xl space-y-1">
                  <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Model</p>
                  <p className="font-bold text-slate-800">{driverData?.vehicleDetails?.vehicleModel}</p>
                </div>
                <div className="bg-slate-50 p-6 rounded-3xl space-y-1">
                  <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Number Plate</p>
                  <p className="font-bold text-slate-800 font-mono">{driverData?.vehicleDetails?.vehicleNumber}</p>
                </div>
                <div className="bg-slate-50 p-6 rounded-3xl space-y-1">
                  <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Vehicle Type</p>
                  <p className="font-bold text-slate-800 capitalize">{driverData?.vehicleDetails?.vehicleType}</p>
                </div>
                <div className="bg-slate-50 p-6 rounded-3xl space-y-1">
                  <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Color</p>
                  <p className="font-bold text-slate-800 capitalize">{driverData?.vehicleDetails?.vehicleColor || 'Not specified'}</p>
                </div>
              </div>
            </div>
          </div>

          {/* Timeline / Next Steps */}
          <div className="space-y-8">
            <div className="bg-slate-900 rounded-[2.5rem] p-8 shadow-2xl text-white relative overflow-hidden group">
              <div className="absolute -right-4 -top-4 w-24 h-24 bg-blue-600/20 rounded-full blur-2xl group-hover:scale-125 transition-transform duration-700" />

              <h3 className="text-lg font-black mb-6 relative z-10">Application Timeline</h3>

              <div className="space-y-8 relative z-10">
                <div className="flex gap-4">
                  <div className="flex flex-col items-center">
                    <div className="w-8 h-8 rounded-full bg-emerald-500 flex items-center justify-center shadow-[0_0_15px_rgba(16,185,129,0.4)]">
                      <CheckCircle size={16} />
                    </div>
                    <div className="w-0.5 h-10 bg-emerald-500/30 my-1" />
                  </div>
                  <div>
                    <p className="text-xs font-black text-emerald-400 uppercase tracking-widest">Submitted</p>
                    <p className="text-sm font-medium text-slate-300">{new Date(driverData?.createdAt).toLocaleDateString()}</p>
                  </div>
                </div>

                <div className="flex gap-4">
                  <div className="flex flex-col items-center">
                    <div className={`w-8 h-8 rounded-full flex items-center justify-center ${isApproved ? 'bg-emerald-500 shadow-[0_0_15px_rgba(16,185,129,0.4)]' : 'bg-blue-600 animate-pulse shadow-[0_0_15px_rgba(37,99,235,0.4)]'}`}>
                      {isApproved ? <CheckCircle size={16} /> : <Clock size={16} />}
                    </div>
                    <div className={`w-0.5 h-10 my-1 ${isApproved ? 'bg-emerald-500/30' : 'bg-slate-700'}`} />
                  </div>
                  <div>
                    <p className={`text-xs font-black uppercase tracking-widest ${isApproved ? 'text-emerald-400' : 'text-blue-400'}`}>Review Process</p>
                    <p className="text-sm font-medium text-slate-400">{isApproved ? 'Verified by Admin' : 'In Progress'}</p>
                  </div>
                </div>

                <div className="flex gap-4">
                  <div className="flex flex-col items-center">
                    <div className={`w-8 h-8 rounded-full flex items-center justify-center ${isApproved ? 'bg-emerald-500 shadow-[0_0_15px_rgba(16,185,129,0.4)]' : 'bg-slate-800 border border-slate-700'}`}>
                      {isApproved ? <CheckCircle size={16} /> : <Car size={16} className="text-slate-500" />}
                    </div>
                  </div>
                  <div>
                    <p className={`text-xs font-black uppercase tracking-widest ${isApproved ? 'text-emerald-400' : 'text-slate-500'}`}>Go Online</p>
                    <p className="text-sm font-medium text-slate-500">{isApproved ? 'Ready to work' : 'Pending Approval'}</p>
                  </div>
                </div>
              </div>
            </div>

            <div className="bg-white rounded-[2.5rem] p-8 shadow-xl border border-slate-100">
              <h3 className="text-lg font-black text-slate-900 mb-4 tracking-tight">Need Help?</h3>
              <p className="text-sm text-slate-500 mb-6 font-medium">If your application is taking longer than expected, feel free to contact our support team.</p>
              <a
                href="tel:+918690366601"
                className="flex items-center justify-between p-4 bg-slate-50 rounded-2xl group hover:bg-blue-600 transition-all duration-300"
              >
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-xl bg-white flex items-center justify-center text-blue-600 group-hover:bg-blue-500 group-hover:text-white transition-colors">
                    <Phone size={18} />
                  </div>
                  <div>
                    <p className="text-[10px] font-black text-slate-400 group-hover:text-blue-100 uppercase tracking-widest transition-colors">Call Support</p>
                    <p className="text-sm font-black text-slate-800 group-hover:text-white transition-colors">+91 86903 66601</p>
                  </div>
                </div>
                <ChevronRight size={18} className="text-slate-300 group-hover:text-white transition-all transform group-hover:translate-x-1" />
              </a>
            </div>
          </div>
        </div>
      </div>
    </UserLayout>
  );
};

export default DriverStatusPage;
