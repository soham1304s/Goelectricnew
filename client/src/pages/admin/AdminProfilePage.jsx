import { useState, useEffect, useRef } from 'react';
import { Phone, Camera, Edit2, Check, X, Mail, Lock, LogOut, Home } from 'lucide-react';
import { useAuth } from '../../context/AuthContext.jsx';
import { useNavigate } from 'react-router-dom';
import * as userService from '../../services/userService.js';
import * as authService from '../../services/authService.js';
import AdminLayout from './AdminLayout';

export default function AdminProfilePage() {
  const navigate = useNavigate();
  const { user: authUser, loading: authLoading, logout } = useAuth();
  const [isEditingName, setIsEditingName] = useState(false);
  const [isEditingPhone, setIsEditingPhone] = useState(false);
  const [isChangingPassword, setIsChangingPassword] = useState(false);
  const [name, setName] = useState('');
  const [phone, setPhone] = useState('');
  const [email, setEmail] = useState('');
  const [tempName, setTempName] = useState('');
  const [tempPhone, setTempPhone] = useState('');
  const [profileImage, setProfileImage] = useState('');
  const [passwordData, setPasswordData] = useState({
    currentPassword: '',
    newPassword: '',
    confirmPassword: '',
  });
  const [profileLoading, setProfileLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const hasLoadedRef = useRef(false);

  useEffect(() => {
    if (authUser) {
      setName(authUser.name || '');
      setEmail(authUser.email || '');
      setPhone(authUser.phone ? (authUser.phone.startsWith('+91') ? authUser.phone : `+91 ${authUser.phone}`) : '');
      setTempName(authUser.name || '');
      setTempPhone(authUser.phone ? (authUser.phone.startsWith('+91') ? authUser.phone : `+91 ${authUser.phone}`) : '');
      setProfileImage(authUser.profileImage || '');
    }
  }, [authUser]);

  const loadProfile = async () => {
    setProfileLoading(true);
    try {
      const res = await userService.getProfile();
      if (res.success && res.data) {
        const u = res.data;
        setName(u.name || '');
        setEmail(u.email || '');
        const p = u.phone || '';
        setPhone(p.startsWith('+91') ? p : (p ? `+91 ${p}` : ''));
        setTempName(u.name || '');
        setTempPhone(p.startsWith('+91') ? p : (p ? `+91 ${p}` : ''));
        setProfileImage(u.profileImage || '');
      }
    } catch (_) {
      setError('Failed to load profile');
    } finally {
      setProfileLoading(false);
    }
  };

  useEffect(() => {
    let timeoutId;
    
    if (!hasLoadedRef.current) {
      hasLoadedRef.current = true;
      timeoutId = setTimeout(() => {
        loadProfile();
      }, 0);
    }

    return () => {
      if (timeoutId) clearTimeout(timeoutId);
    };
  }, []);

  const handleImageUpload = async (e) => {
    const file = e.target.files?.[0];
    if (file) {
      const formData = new FormData();
      formData.append('image', file);
      
      setProfileLoading(true);
      try {
        const res = await userService.updateProfileImage(formData);
        if (res.success) {
          setProfileImage(res.data.profileImage);
          setSuccess('Profile photo updated successfully');
        }
      } catch (err) {
        setError(err.response?.data?.message || 'Failed to update photo');
      } finally {
        setProfileLoading(false);
      }
    }
  };

  const handleSaveName = async () => {
    setName(tempName);
    setIsEditingName(false);
    try {
      await userService.updateProfile({ name: tempName });
      setSuccess('Name updated successfully');
    } catch (_) {
      setError('Failed to update name');
    }
  };

  const handleCancelName = () => {
    setTempName(name);
    setIsEditingName(false);
  };

  const handleSavePhone = async () => {
    const raw = tempPhone.replace(/\D/g, '').slice(-10);
    setPhone(raw ? `+91 ${raw}` : '');
    setTempPhone(raw ? `+91 ${raw}` : '');
    setIsEditingPhone(false);
    if (raw) {
      try {
        await userService.updateProfile({ phone: raw });
        setSuccess('Phone updated successfully');
      } catch (_) {
        setError('Failed to update phone');
      }
    }
  };

  const handleCancelPhone = () => {
    setTempPhone(phone);
    setIsEditingPhone(false);
  };

  const handleChangePassword = async () => {
    if (!passwordData.currentPassword || !passwordData.newPassword || !passwordData.confirmPassword) {
      setError('All password fields are required');
      return;
    }

    if (passwordData.newPassword !== passwordData.confirmPassword) {
      setError('New passwords do not match');
      return;
    }

    if (passwordData.newPassword.length < 6) {
      setError('New password must be at least 6 characters');
      return;
    }

    try {
      const res = await userService.changePassword({
        currentPassword: passwordData.currentPassword,
        newPassword: passwordData.newPassword,
      });
      if (res.success) {
        setSuccess('Password changed successfully');
        setPasswordData({
          currentPassword: '',
          newPassword: '',
          confirmPassword: '',
        });
        setIsChangingPassword(false);
      } else {
        setError(res.message || 'Failed to change password');
      }
    } catch (_) {
      setError('Failed to change password');
    }
  };

  const handleLogout = () => {
    logout();
    window.location.href = '/login';
  };

  if (authLoading) {
    return (
      <AdminLayout>
        <div className="flex items-center justify-center h-screen">
          <div className="text-gray-600 dark:text-gray-400">Loading...</div>
        </div>
      </AdminLayout>
    );
  }

  return (
    <AdminLayout>
      <div className="p-4 md:p-8">
        <div className="max-w-4xl">
          {error && (
            <div className="mb-6 p-4 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg">
              <p className="text-red-700 dark:text-red-400">{error}</p>
            </div>
          )}
          {success && (
            <div className="mb-6 p-4 bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-800 rounded-lg">
              <p className="text-green-700 dark:text-green-400">{success}</p>
            </div>
          )}

          <div className="bg-white dark:bg-gray-800 rounded-xl shadow-lg overflow-hidden">
            {/* Header Section */}
            <div className="bg-gradient-to-r from-emerald-600 to-emerald-700 dark:from-emerald-900 dark:to-emerald-800 p-6 md:p-8">
              <div className="flex flex-col md:flex-row items-start md:items-center gap-6">
                {/* Profile Image */}
                <div className="relative group">
                  <img
                    src={profileImage || 'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=400&h=400&fit=crop'}
                    alt="Profile"
                    className="w-24 h-24 md:w-32 md:h-32 rounded-full object-cover border-4 border-white shadow-lg"
                  />
                  <label htmlFor="profile-upload" className="absolute inset-0 flex items-center justify-center bg-black bg-opacity-50 rounded-full opacity-0 group-hover:opacity-100 transition-opacity cursor-pointer">
                    <Camera className="w-8 h-8 text-white" />
                  </label>
                  <input id="profile-upload" type="file" accept="image/*" onChange={handleImageUpload} className="hidden" />
                </div>

                {/* Admin Info */}
                <div className="flex-1 text-white">
                  <div className="mb-3">
                    {!isEditingName ? (
                      <div className="flex items-center gap-3">
                        <h1 className="text-3xl md:text-4xl font-bold">{name || 'Admin'}</h1>
                        <button
                          onClick={() => setIsEditingName(true)}
                          className="p-2 hover:bg-emerald-500 rounded-lg transition-colors"
                        >
                          <Edit2 className="w-5 h-5" />
                        </button>
                      </div>
                    ) : (
                      <div className="flex items-center gap-2">
                        <input
                          type="text"
                          value={tempName}
                          onChange={(e) => setTempName(e.target.value)}
                          className="text-3xl font-bold bg-emerald-500 text-white rounded px-3 py-1 focus:outline-none"
                          autoFocus
                        />
                        <button onClick={handleSaveName} className="p-2 bg-green-500 hover:bg-green-600 rounded-lg transition-colors">
                          <Check className="w-5 h-5 text-white" />
                        </button>
                        <button onClick={handleCancelName} className="p-2 bg-red-500 hover:bg-red-600 rounded-lg transition-colors">
                          <X className="w-5 h-5 text-white" />
                        </button>
                      </div>
                    )}
                  </div>
                  <p className="text-emerald-100 flex items-center gap-2">
                    <Mail className="w-4 h-4" />
                    {email}
                  </p>
                  <p className="text-emerald-100 mt-2 font-semibold">Admin User</p>
                </div>
              </div>
            </div>

            {/* Content Sections */}
            <div className="p-6 md:p-8">
              {/* Contact Information */}
              <section className="mb-8">
                <h2 className="text-xl font-semibold text-gray-900 dark:text-white mb-4">Contact Information</h2>
                <div className="bg-gray-50 dark:bg-gray-700 rounded-lg p-6">
                  <div className="flex items-center justify-between mb-4">
                    <label className="text-gray-700 dark:text-gray-300 font-medium">Phone Number</label>
                  </div>
                  {!isEditingPhone ? (
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2 text-gray-900 dark:text-white">
                        <Phone className="w-5 h-5 text-gray-600 dark:text-gray-400" />
                        <span className="text-lg">{phone || '—'}</span>
                      </div>
                      <button
                        onClick={() => setIsEditingPhone(true)}
                        className="flex items-center gap-1 px-4 py-2 text-emerald-600 dark:text-emerald-400 hover:bg-emerald-50 dark:hover:bg-gray-600 rounded-lg transition-colors"
                      >
                        <Edit2 className="w-4 h-4" /> Edit
                      </button>
                    </div>
                  ) : (
                    <div className="flex items-center gap-2">
                      <input
                        type="tel"
                        value={tempPhone}
                        onChange={(e) => setTempPhone(e.target.value)}
                        className="flex-1 px-3 py-2 border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-600 rounded-lg text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-emerald-500"
                        autoFocus
                      />
                      <button
                        onClick={handleSavePhone}
                        className="px-4 py-2 bg-green-600 hover:bg-green-700 text-white rounded-lg transition-colors"
                      >
                        Save
                      </button>
                      <button
                        onClick={handleCancelPhone}
                        className="px-4 py-2 bg-gray-400 hover:bg-gray-500 text-white rounded-lg transition-colors"
                      >
                        Cancel
                      </button>
                    </div>
                  )}
                </div>
              </section>

              {/* Email Information */}
              <section className="mb-8">
                <h2 className="text-xl font-semibold text-gray-900 dark:text-white mb-4">Email Address</h2>
                <div className="bg-gray-50 dark:bg-gray-700 rounded-lg p-6">
                  <div className="flex items-center gap-2 text-gray-900 dark:text-white">
                    <Mail className="w-5 h-5 text-gray-600 dark:text-gray-400" />
                    <span className="text-lg">{email}</span>
                  </div>
                  <p className="text-sm text-gray-600 dark:text-gray-400 mt-2">Email cannot be changed</p>
                </div>
              </section>

              {/* Password Section */}
              <section className="mb-8">
                <h2 className="text-xl font-semibold text-gray-900 dark:text-white mb-4">Security</h2>
                <div className="bg-gray-50 dark:bg-gray-700 rounded-lg p-6">
                  {!isChangingPassword ? (
                    <button
                      onClick={() => setIsChangingPassword(true)}
                      className="flex items-center gap-2 px-4 py-2 bg-emerald-600 hover:bg-emerald-700 text-white rounded-lg transition-colors"
                    >
                      <Lock className="w-4 h-4" /> Change Password
                    </button>
                  ) : (
                    <div className="space-y-4">
                      <div>
                        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                          Current Password
                        </label>
                        <input
                          type="password"
                          value={passwordData.currentPassword}
                          onChange={(e) => setPasswordData({ ...passwordData, currentPassword: e.target.value })}
                          className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-600 rounded-lg text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
                          placeholder="Enter current password"
                        />
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                          New Password
                        </label>
                        <input
                          type="password"
                          value={passwordData.newPassword}
                          onChange={(e) => setPasswordData({ ...passwordData, newPassword: e.target.value })}
                          className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-600 rounded-lg text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-emerald-500"
                          placeholder="Enter new password"
                        />
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                          Confirm New Password
                        </label>
                        <input
                          type="password"
                          value={passwordData.confirmPassword}
                          onChange={(e) => setPasswordData({ ...passwordData, confirmPassword: e.target.value })}
                          className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-600 rounded-lg text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-emerald-500"
                          placeholder="Confirm new password"
                        />
                      </div>
                      <div className="flex gap-3 pt-2">
                        <button
                          onClick={handleChangePassword}
                          className="flex-1 px-4 py-2 bg-green-600 hover:bg-green-700 text-white rounded-lg transition-colors"
                        >
                          Update Password
                        </button>
                        <button
                          onClick={() => {
                            setIsChangingPassword(false);
                            setPasswordData({
                              currentPassword: '',
                              newPassword: '',
                              confirmPassword: '',
                            });
                          }}
                          className="flex-1 px-4 py-2 bg-gray-400 hover:bg-gray-500 text-white rounded-lg transition-colors"
                        >
                          Cancel
                        </button>
                      </div>
                    </div>
                  )}
                </div>
              </section>

              {/* Navigation Section */}
              <section className="mb-8">
                <h2 className="text-xl font-semibold text-gray-900 dark:text-white mb-4">Navigation</h2>
                <div className="bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-800 rounded-lg p-6">
                  <p className="text-gray-700 dark:text-gray-300 mb-4">
                    Go back to the home page and explore more features.
                  </p>
                  <button
                    onClick={() => navigate('/')}
                    className="flex items-center gap-2 px-6 py-2 bg-green-600 hover:bg-green-700 text-white rounded-lg transition-colors"
                  >
                    <Home className="w-4 h-4" /> Go to Home
                  </button>
                </div>
              </section>

              {/* Danger Zone */}
              <section className="border-t border-gray-200 dark:border-gray-700 pt-8">
                <h2 className="text-xl font-semibold text-gray-900 dark:text-white mb-4">Danger Zone</h2>
                <div className="bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg p-6">
                  <p className="text-gray-700 dark:text-gray-300 mb-4">
                    Sign out from your account. You will need to log in again.
                  </p>
                  <button
                    onClick={handleLogout}
                    className="flex items-center gap-2 px-6 py-2 bg-red-600 hover:bg-red-700 text-white rounded-lg transition-colors"
                  >
                    <LogOut className="w-4 h-4" /> Logout
                  </button>
                </div>
              </section>
            </div>
          </div>
        </div>
      </div>
    </AdminLayout>
  );
}
