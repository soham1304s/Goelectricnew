import { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext.jsx';
import { motion, AnimatePresence } from 'framer-motion';
import UserLayout from './UserLayout.jsx';
import * as userService from '../../services/userService.js';
import { 
  User, 
  Mail, 
  Phone, 
  MapPin, 
  Calendar, 
  Edit2, 
  Save, 
  X, 
  Upload, 
  ShieldCheck, 
  ChevronRight,
  Camera,
  CheckCircle2,
  AlertCircle
} from 'lucide-react';
import { getImageUrl } from '../../utils/imageUrl';

export default function UserProfile() {
  const { user: authUser, isAuthenticated, loading: authLoading, loadUser } = useAuth();
  const navigate = useNavigate();
  const [isEditing, setIsEditing] = useState(false);
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [successMessage, setSuccessMessage] = useState('');
  const [formData, setFormData] = useState({});
  const [profileImage, setProfileImage] = useState(null);
  const fileInputRef = useRef(null);
  const hasLoadedRef = useRef(false);

  useEffect(() => {
    if (!authLoading && !isAuthenticated) {
      navigate('/login');
    }
  }, [authLoading, isAuthenticated, navigate]);

  useEffect(() => {
    if (hasLoadedRef.current) return;
    if (!isAuthenticated) return;

    hasLoadedRef.current = true;
    let isMounted = true;

    const loadUserData = async () => {
      if (!isMounted) return;
      setLoading(true);
      setError('');
      try {
        const res = await userService.getProfile();
        if (isMounted && res.success) {
          setUser(res.data);
          setFormData(res.data);
        }
      } catch (err) {
        if (isMounted) {
          setError('Failed to load profile. Please try again.');
        }
      } finally {
        if (isMounted) {
          setLoading(false);
        }
      }
    };

    loadUserData();

    return () => {
      isMounted = false;
    };
  }, [isAuthenticated]);

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleImageUpload = async (e) => {
    const file = e.target.files?.[0];
    if (file) {
      try {
        setError('');
        setSuccessMessage('Uploading image...');
        
        const formData = new FormData();
        formData.append('image', file);
        
        const res = await userService.updateProfileImage(formData);
        
        if (res.success) {
          setUser(res.data);
          setFormData(res.data);
          setSuccessMessage('Profile picture updated successfully!');
          setTimeout(() => setSuccessMessage(''), 3000);
          if (loadUser) await loadUser();
        } else {
          setError(res.message || 'Failed to upload image');
        }
      } catch (err) {
        setError('Failed to upload image. Please try again.');
      }
    }
  };

  const handleSave = async () => {
    try {
      setError('');
      setSuccessMessage('');
      const updateData = { ...formData };
      const res = await userService.updateProfile(updateData);
      
      if (res.success) {
        setUser(res.data);
        setFormData(res.data);
        if (loadUser) await loadUser();
        
        setIsEditing(false);
        setSuccessMessage('Profile updated successfully!');
        setTimeout(() => setSuccessMessage(''), 3000);
      } else {
        setError(res.message || 'Failed to update profile. Please try again.');
      }
    } catch (err) {
      setError('Failed to update profile. Please try again.');
    }
  };

  const handleCancel = () => {
    setFormData(user);
    setIsEditing(false);
  };

  if (authLoading || loading) {
    return (
      <UserLayout>
        <div className="flex flex-col items-center justify-center h-[60vh]">
          <motion.div
            animate={{ rotate: 360 }}
            transition={{ duration: 1, repeat: Infinity, ease: 'linear' }}
            className="w-12 h-12 border-4 border-emerald-500 border-t-transparent rounded-full mb-4"
          />
          <p className="text-slate-500 font-medium animate-pulse">Synchronizing your profile...</p>
        </div>
      </UserLayout>
    );
  }

  return (
    <UserLayout>
      <div className="max-w-5xl mx-auto space-y-10">
        {/* Premium Header Section */}
        <div className="relative rounded-[2.5rem] overflow-hidden bg-white text-slate-900 p-8 md:p-12 shadow-xl border border-slate-100 mb-8">
          <div className="absolute top-0 right-0 w-1/3 h-full bg-gradient-to-l from-emerald-500/10 to-transparent pointer-events-none" />
          <div className="relative z-10 flex flex-col md:flex-row items-center gap-10">
            {/* Profile Avatar */}
            <div className="relative group">
              <motion.div 
                whileHover={{ scale: 1.05 }}
                className="w-40 h-40 rounded-[3rem] bg-gradient-to-br from-emerald-400 to-teal-500 p-1.5 shadow-2xl overflow-hidden"
              >
                <div className="w-full h-full rounded-[2.7rem] bg-white overflow-hidden flex items-center justify-center text-5xl font-black text-emerald-500">
                  {user?.profileImage ? (
                    <img src={getImageUrl(user.profileImage)} alt="Profile" className="w-full h-full object-cover" />
                  ) : (
                    (user?.firstName?.charAt(0) || user?.lastName?.charAt(0) || 'U')
                  )}
                </div>
              </motion.div>
              <button 
                onClick={() => fileInputRef.current?.click()}
                className="absolute -bottom-2 -right-2 w-12 h-12 bg-white rounded-2xl shadow-xl flex items-center justify-center text-slate-700 hover:text-emerald-500 transition-colors border border-slate-100"
              >
                <Camera size={20} />
              </button>
              <input ref={fileInputRef} type="file" accept="image/*" onChange={handleImageUpload} className="hidden" />
            </div>

            <div className="text-center md:text-left space-y-3">
              <h1 className="text-4xl md:text-5xl font-black tracking-tight text-slate-900">
                {user?.firstName} <span className="text-emerald-500">{user?.lastName}</span>
              </h1>
              <div className="flex flex-wrap justify-center md:justify-start gap-4">
                <div className="flex items-center gap-2 px-4 py-1.5 bg-slate-50 rounded-full border border-slate-100 text-slate-500 text-xs font-bold uppercase tracking-widest">
                  <Mail size={14} className="text-emerald-500" />
                  {user?.email}
                </div>
                <div className="flex items-center gap-2 px-4 py-1.5 bg-emerald-50 rounded-full border border-emerald-100 text-emerald-600 text-xs font-bold uppercase tracking-widest">
                  <ShieldCheck size={14} />
                  Verified Partner
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Notifications */}
        <AnimatePresence>
          {successMessage && (
            <motion.div
              initial={{ opacity: 0, y: -20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              className="bg-emerald-50 border border-emerald-100 p-4 rounded-3xl flex items-center gap-4 text-emerald-600 shadow-sm"
            >
              <CheckCircle2 size={20} />
              <p className="font-bold text-sm">{successMessage}</p>
            </motion.div>
          )}
          {error && (
            <motion.div
              initial={{ opacity: 0, y: -20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              className="bg-rose-50 border border-rose-100 p-4 rounded-3xl flex items-center gap-4 text-rose-600 shadow-sm"
            >
              <AlertCircle size={20} />
              <p className="font-bold text-sm">{error}</p>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Profile Content */}
        <div className="bg-white rounded-[2.5rem] shadow-xl border border-slate-100 overflow-hidden">
          <div className="p-8 md:p-12">
            <div className="flex justify-between items-center mb-10 pb-6 border-b border-slate-100">
              <div>
                <h3 className="text-2xl font-black text-slate-900">Personal Information</h3>
                <p className="text-slate-500 font-medium">Update your profile details and preferences.</p>
              </div>
              {!isEditing && (
                <button
                  onClick={() => setIsEditing(true)}
                  className="px-6 py-3 bg-slate-900 text-white rounded-2xl text-xs font-black hover:bg-black transition-all flex items-center gap-2 shadow-lg"
                >
                  <Edit2 size={14} />
                  Edit Profile
                </button>
              )}
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
              {/* Field Groups */}
              <div className="space-y-6">
                <div className="group">
                  <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1 mb-2 block">First Name</label>
                  {isEditing ? (
                    <div className="relative">
                      <User className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
                      <input
                        type="text"
                        name="firstName"
                        value={formData.firstName || ''}
                        onChange={handleInputChange}
                        className="w-full pl-12 pr-6 py-4 bg-slate-50 rounded-2xl border-none focus:ring-2 focus:ring-emerald-500 font-bold transition-all"
                      />
                    </div>
                  ) : (
                    <div className="px-6 py-4 bg-slate-50/50 rounded-2xl font-black text-slate-700">{user?.firstName}</div>
                  )}
                </div>

                <div className="group">
                  <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1 mb-2 block">Last Name</label>
                  {isEditing ? (
                    <div className="relative">
                      <User className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
                      <input
                        type="text"
                        name="lastName"
                        value={formData.lastName || ''}
                        onChange={handleInputChange}
                        className="w-full pl-12 pr-6 py-4 bg-slate-50 rounded-2xl border-none focus:ring-2 focus:ring-emerald-500 font-bold transition-all"
                      />
                    </div>
                  ) : (
                    <div className="px-6 py-4 bg-slate-50/50 rounded-2xl font-black text-slate-700">{user?.lastName}</div>
                  )}
                </div>

                <div className="group">
                  <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1 mb-2 block">Phone Number</label>
                  {isEditing ? (
                    <div className="relative">
                      <Phone className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
                      <input
                        type="tel"
                        name="phone"
                        value={formData.phone || ''}
                        onChange={handleInputChange}
                        className="w-full pl-12 pr-6 py-4 bg-slate-50 rounded-2xl border-none focus:ring-2 focus:ring-emerald-500 font-bold transition-all"
                      />
                    </div>
                  ) : (
                    <div className="px-6 py-4 bg-slate-50/50 rounded-2xl font-black text-slate-700">{user?.phone || 'Not provided'}</div>
                  )}
                </div>
              </div>

              <div className="space-y-6">
                <div className="group">
                  <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1 mb-2 block">Date of Birth</label>
                  {isEditing ? (
                    <div className="relative">
                      <Calendar className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
                      <input
                        type="date"
                        name="dateOfBirth"
                        value={formData.dateOfBirth?.split('T')[0] || ''}
                        onChange={handleInputChange}
                        className="w-full pl-12 pr-6 py-4 bg-slate-50 rounded-2xl border-none focus:ring-2 focus:ring-emerald-500 font-bold transition-all"
                      />
                    </div>
                  ) : (
                    <div className="px-6 py-4 bg-slate-50/50 rounded-2xl font-black text-slate-700">
                      {user?.dateOfBirth ? new Date(user.dateOfBirth).toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' }) : 'Not provided'}
                    </div>
                  )}
                </div>

                <div className="group">
                  <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1 mb-2 block">Gender</label>
                  {isEditing ? (
                    <select
                      name="gender"
                      value={formData.gender || ''}
                      onChange={handleInputChange}
                      className="w-full px-6 py-4 bg-slate-50 rounded-2xl border-none focus:ring-2 focus:ring-emerald-500 font-bold transition-all appearance-none"
                    >
                      <option value="">Select Gender</option>
                      <option value="Male">Male</option>
                      <option value="Female">Female</option>
                      <option value="Other">Other</option>
                    </select>
                  ) : (
                    <div className="px-6 py-4 bg-slate-50/50 rounded-2xl font-black text-slate-700">{user?.gender || 'Not provided'}</div>
                  )}
                </div>

                <div className="group">
                  <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1 mb-2 block">Address</label>
                  {isEditing ? (
                    <div className="relative">
                      <MapPin className="absolute left-4 top-4 text-slate-400" size={18} />
                      <textarea
                        name="address"
                        value={formData.address || ''}
                        onChange={handleInputChange}
                        rows="1"
                        className="w-full pl-12 pr-6 py-4 bg-slate-50 rounded-2xl border-none focus:ring-2 focus:ring-emerald-500 font-bold transition-all resize-none"
                      />
                    </div>
                  ) : (
                    <div className="px-6 py-4 bg-slate-50/50 rounded-2xl font-black text-slate-700">{user?.address || 'Not provided'}</div>
                  )}
                </div>
              </div>
            </div>

            {/* Editing Controls */}
            {isEditing && (
              <motion.div 
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                className="mt-12 flex gap-4 pt-10 border-t border-slate-100"
              >
                <button
                  onClick={handleSave}
                  className="flex-1 md:flex-none px-10 py-4 bg-emerald-600 text-white rounded-[1.5rem] font-black hover:bg-emerald-700 transition-all flex items-center justify-center gap-3 shadow-xl shadow-emerald-500/20"
                >
                  <Save size={18} />
                  Save Changes
                </button>
                <button
                  onClick={handleCancel}
                  className="flex-1 md:flex-none px-10 py-4 bg-slate-100 text-slate-500 rounded-[1.5rem] font-black hover:bg-slate-200 transition-all flex items-center justify-center gap-3"
                >
                  <X size={18} />
                  Cancel
                </button>
              </motion.div>
            )}
          </div>
        </div>

        {/* Security Summary Footer */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="bg-white p-6 rounded-[2rem] border border-slate-100 flex items-center gap-5">
            <div className="w-12 h-12 bg-emerald-50 rounded-2xl flex items-center justify-center text-emerald-500 shrink-0">
              <ShieldCheck size={24} />
            </div>
            <div>
              <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1">Account Status</p>
              <p className="text-sm font-black text-slate-800 uppercase tracking-tight">Active & Secure</p>
            </div>
          </div>
          <div className="bg-white p-6 rounded-[2rem] border border-slate-100 flex items-center gap-5">
            <div className="w-12 h-12 bg-blue-50 rounded-2xl flex items-center justify-center text-blue-500 shrink-0">
              <Calendar size={24} />
            </div>
            <div>
              <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1">Member Since</p>
              <p className="text-sm font-black text-slate-800 uppercase tracking-tight">
                {user?.createdAt ? new Date(user.createdAt).toLocaleDateString('en-IN', { month: 'short', year: 'numeric' }) : 'N/A'}
              </p>
            </div>
          </div>
          <div className="bg-white p-6 rounded-[2rem] border border-slate-100 flex items-center gap-5">
            <div className="w-12 h-12 bg-purple-50 rounded-2xl flex items-center justify-center text-purple-500 shrink-0">
              <User size={24} />
            </div>
            <div>
              <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1">Profile Completeness</p>
              <div className="flex items-center gap-3">
                <div className="flex-1 h-1.5 bg-slate-100 rounded-full overflow-hidden">
                  <div className="h-full bg-emerald-500 rounded-full" style={{ width: '85%' }} />
                </div>
                <p className="text-xs font-black text-slate-800 uppercase tracking-tight">85%</p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </UserLayout>
  );
}
