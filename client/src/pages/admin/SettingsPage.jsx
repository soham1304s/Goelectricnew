import { useState, useEffect } from 'react';
import { Settings, Lock, Mail, User as UserIcon, Eye, EyeOff, Check, X } from 'lucide-react';
import AdminLayout from './AdminLayout';
import { useAuth } from '../../context/AuthContext';
import { changeAdminPassword, getAdminProfile } from '../../services/adminService';

const SettingsPage = () => {
  const { user } = useAuth();
  const [loading, setLoading] = useState(false);
  const [adminProfile, setAdminProfile] = useState(null);
  const [showPasswords, setShowPasswords] = useState({
    current: false,
    new: false,
    confirm: false,
  });
  const [successMessage, setSuccessMessage] = useState('');
  const [errorMessage, setErrorMessage] = useState('');

  const [passwordForm, setPasswordForm] = useState({
    currentPassword: '',
    newPassword: '',
    confirmPassword: '',
  });

  useEffect(() => {
    fetchAdminProfile();
  }, []);

  const fetchAdminProfile = async () => {
    try {
      setLoading(true);
      // Using the current user data from context
      if (user) {
        setAdminProfile(user);
      }
    } catch (error) {
      console.error('Error fetching profile:', error);
    } finally {
      setLoading(false);
    }
  };

  const togglePasswordVisibility = (field) => {
    setShowPasswords((prev) => ({
      ...prev,
      [field]: !prev[field],
    }));
  };

  const handlePasswordChange = (e) => {
    const { name, value } = e.target;
    setPasswordForm((prev) => ({
      ...prev,
      [name]: value,
    }));
    setErrorMessage('');
  };

  const validatePasswords = () => {
    if (!passwordForm.currentPassword.trim()) {
      setErrorMessage('Current password is required');
      return false;
    }
    if (!passwordForm.newPassword.trim()) {
      setErrorMessage('New password is required');
      return false;
    }
    if (passwordForm.newPassword.length < 6) {
      setErrorMessage('New password must be at least 6 characters');
      return false;
    }
    if (passwordForm.newPassword !== passwordForm.confirmPassword) {
      setErrorMessage('New passwords do not match');
      return false;
    }
    return true;
  };

  const handleSubmitPassword = async (e) => {
    e.preventDefault();
    
    if (!validatePasswords()) {
      return;
    }

    try {
      setLoading(true);
      await changeAdminPassword({
        currentPassword: passwordForm.currentPassword,
        newPassword: passwordForm.newPassword,
      });
      setSuccessMessage('Password changed successfully!');
      setPasswordForm({
        currentPassword: '',
        newPassword: '',
        confirmPassword: '',
      });
      setTimeout(() => setSuccessMessage(''), 3000);
    } catch (error) {
      setErrorMessage(error.response?.data?.message || 'Error changing password');
    } finally {
      setLoading(false);
    }
  };

  return (
    <AdminLayout>
      <div className="space-y-6 sm:space-y-8">
        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-center gap-3 px-4 sm:px-0">
          <Settings className="text-blue-500 flex-shrink-0" size={28} />
          <div className="flex-1">
            <h1 className="text-2xl sm:text-3xl font-bold text-gray-900 dark:text-white">Settings</h1>
            <p className="text-sm sm:text-base text-gray-600 dark:text-gray-400 mt-1">
              Manage your admin account settings and security
            </p>
          </div>
        </div>

        {/* Admin Profile Information */}
        <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-4 sm:p-6 lg:p-8">
          <h2 className="text-lg sm:text-xl font-bold text-gray-900 dark:text-white mb-4 sm:mb-6 flex items-center gap-2">
            <UserIcon size={20} className="text-blue-500 flex-shrink-0" />
            Profile Information
          </h2>
          {adminProfile ? (
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 sm:gap-6">
              <div>
                <label className="block text-xs sm:text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  Name
                </label>
                <div className="px-3 sm:px-4 py-2 sm:py-3 bg-gray-100 dark:bg-gray-700 rounded-lg text-sm sm:text-base text-gray-900 dark:text-white font-medium break-words">
                  {adminProfile.name}
                </div>
              </div>
              <div>
                <label className="block text-xs sm:text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  Email
                </label>
                <div className="flex items-center gap-2 px-3 sm:px-4 py-2 sm:py-3 bg-gray-100 dark:bg-gray-700 rounded-lg text-sm sm:text-base text-gray-900 dark:text-white min-h-[2.75rem] sm:min-h-[3.25rem]">
                  <Mail size={16} className="text-gray-500 flex-shrink-0" />
                  <span className="font-medium break-all">{adminProfile.email}</span>
                </div>
              </div>
              <div>
                <label className="block text-xs sm:text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  Role
                </label>
                <div className="px-3 sm:px-4 py-2 sm:py-3 bg-gray-100 dark:bg-gray-700 rounded-lg min-h-[2.75rem] sm:min-h-[3.25rem] flex items-center">
                  <span className="inline-block px-2 sm:px-3 py-1 bg-blue-100 dark:bg-blue-900 text-blue-700 dark:text-blue-300 rounded-full text-xs sm:text-sm font-semibold uppercase">
                    {adminProfile.role}
                  </span>
                </div>
              </div>
              <div>
                <label className="block text-xs sm:text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  Member Since
                </label>
                <div className="px-3 sm:px-4 py-2 sm:py-3 bg-gray-100 dark:bg-gray-700 rounded-lg text-sm sm:text-base text-gray-900 dark:text-white font-medium">
                  {new Date(adminProfile.createdAt).toLocaleDateString()}
                </div>
              </div>
            </div>
          ) : (
            <p className="text-sm text-gray-500">Loading profile information...</p>
          )}
        </div>

        {/* Change Password Section */}
        <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-4 sm:p-6 lg:p-8">
          <h2 className="text-lg sm:text-xl font-bold text-gray-900 dark:text-white mb-4 sm:mb-6 flex items-center gap-2">
            <Lock size={20} className="text-orange-500 flex-shrink-0" />
            Change Password
          </h2>

          {successMessage && (
            <div className="mb-4 sm:mb-6 p-3 sm:p-4 bg-green-100 dark:bg-green-900/30 border border-green-200 dark:border-green-700 rounded-lg flex items-start gap-3">
              <Check size={18} className="text-green-600 dark:text-green-400 flex-shrink-0 mt-0.5" />
              <span className="text-sm sm:text-base text-green-700 dark:text-green-300 font-medium">{successMessage}</span>
            </div>
          )}

          {errorMessage && (
            <div className="mb-4 sm:mb-6 p-3 sm:p-4 bg-red-100 dark:bg-red-900/30 border border-red-200 dark:border-red-700 rounded-lg flex items-start gap-3">
              <X size={18} className="text-red-600 dark:text-red-400 flex-shrink-0 mt-0.5" />
              <span className="text-sm sm:text-base text-red-700 dark:text-red-300 font-medium">{errorMessage}</span>
            </div>
          )}

          <form onSubmit={handleSubmitPassword} className="space-y-4 sm:space-y-6 max-w-full sm:max-w-md">
            {/* Current Password */}
            <div>
              <label className="block text-xs sm:text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                Current Password
              </label>
              <div className="relative">
                <input
                  type={showPasswords.current ? 'text' : 'password'}
                  name="currentPassword"
                  value={passwordForm.currentPassword}
                  onChange={handlePasswordChange}
                  placeholder="Enter your current password"
                  className="w-full px-3 sm:px-4 py-2.5 sm:py-3 text-sm sm:text-base border border-gray-300 dark:border-gray-600 rounded-lg dark:bg-gray-700 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500 pr-10"
                />
                <button
                  type="button"
                  onClick={() => togglePasswordVisibility('current')}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-500 hover:text-gray-700 dark:hover:text-gray-300 p-1"
                >
                  {showPasswords.current ? <EyeOff size={18} /> : <Eye size={18} />}
                </button>
              </div>
            </div>

            {/* New Password */}
            <div>
              <label className="block text-xs sm:text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                New Password
              </label>
              <div className="relative">
                <input
                  type={showPasswords.new ? 'text' : 'password'}
                  name="newPassword"
                  value={passwordForm.newPassword}
                  onChange={handlePasswordChange}
                  placeholder="Enter your new password"
                  className="w-full px-3 sm:px-4 py-2.5 sm:py-3 text-sm sm:text-base border border-gray-300 dark:border-gray-600 rounded-lg dark:bg-gray-700 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500 pr-10"
                />
                <button
                  type="button"
                  onClick={() => togglePasswordVisibility('new')}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-500 hover:text-gray-700 dark:hover:text-gray-300 p-1"
                >
                  {showPasswords.new ? <EyeOff size={18} /> : <Eye size={18} />}
                </button>
              </div>
            </div>

            {/* Confirm Password */}
            <div>
              <label className="block text-xs sm:text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                Confirm New Password
              </label>
              <div className="relative">
                <input
                  type={showPasswords.confirm ? 'text' : 'password'}
                  name="confirmPassword"
                  value={passwordForm.confirmPassword}
                  onChange={handlePasswordChange}
                  placeholder="Confirm your new password"
                  className="w-full px-3 sm:px-4 py-2.5 sm:py-3 text-sm sm:text-base border border-gray-300 dark:border-gray-600 rounded-lg dark:bg-gray-700 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500 pr-10"
                />
                <button
                  type="button"
                  onClick={() => togglePasswordVisibility('confirm')}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-500 hover:text-gray-700 dark:hover:text-gray-300 p-1"
                >
                  {showPasswords.confirm ? <EyeOff size={18} /> : <Eye size={18} />}
                </button>
              </div>
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full px-4 sm:px-6 py-2.5 sm:py-3 bg-orange-500 hover:bg-orange-600 text-white text-sm sm:text-base rounded-lg transition font-medium disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {loading ? 'Updating Password...' : 'Update Password'}
            </button>
          </form>

          <div className="mt-6 sm:mt-8 p-3 sm:p-4 bg-blue-50 dark:bg-blue-900/20 rounded-lg border border-blue-200 dark:border-blue-700">
            <h3 className="text-xs sm:text-sm font-semibold text-blue-900 dark:text-blue-300 mb-2">
              Password Requirements:
            </h3>
            <ul className="text-xs sm:text-sm text-blue-800 dark:text-blue-400 space-y-1">
              <li>• At least 6 characters long</li>
              <li>• Must be different from your current password</li>
              <li>• Confirm the new password in both fields</li>
            </ul>
          </div>
        </div>

        {/* Security Section */}
        <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-4 sm:p-6 lg:p-8">
          <h2 className="text-lg sm:text-xl font-bold text-gray-900 dark:text-white mb-4">
            Security Settings
          </h2>
          <div className="space-y-4">
            <div className="flex items-start gap-3 sm:gap-4">
              <Lock className="text-green-500 flex-shrink-0 mt-1" size={18} />
              <div className="flex-1 min-w-0">
                <h3 className="text-sm sm:text-base font-semibold text-gray-900 dark:text-white">Two-Factor Authentication</h3>
                <p className="text-xs sm:text-sm text-gray-600 dark:text-gray-400 mt-1">
                  Coming soon! Add extra security to your account
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </AdminLayout>
  );
};

export default SettingsPage;
