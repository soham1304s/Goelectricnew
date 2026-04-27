import { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext.jsx';
import UserLayout from './UserLayout.jsx';
import * as userService from '../../services/userService.js';
import { User, Mail, Phone, MapPin, Calendar, Edit2, Save, X, Upload } from 'lucide-react';

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
    // Only load once when component mounts and user is authenticated
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
        console.log('📥 Profile loaded from server:', res);
        if (isMounted && res.success) {
          console.log('✅ Setting user and formData:', res.data);
          setUser(res.data);
          setFormData(res.data);
        }
      } catch (err) {
        if (isMounted) {
          setError('Failed to load profile. Please try again.');
          console.error('❌ Load error:', err);
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
  }, []);

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleImageUpload = (e) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = (event) => {
        setProfileImage(event.target.result);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleSave = async () => {
    try {
      setError('');
      setSuccessMessage('');
      const updateData = { ...formData };
      if (profileImage) {
        updateData.profileImage = profileImage;
      }
      console.log('📝 Saving profile with data:', updateData);
      const res = await userService.updateProfile(updateData);
      console.log('✅ Update response:', res);
      
      if (res.success) {
        // Update both user and formData with the response
        setUser(res.data);
        setFormData(res.data);
        
        // Also refetch to ensure latest data from server
        const profileRes = await userService.getProfile();
        if (profileRes.success) {
          setUser(profileRes.data);
          setFormData(profileRes.data);
          console.log('🔄 Profile refetched:', profileRes.data);
        }
        
        // Update global auth context with latest user data
        if (loadUser) {
          await loadUser();
          console.log('✅ Auth context updated with latest profile data');
        }
        
        setIsEditing(false);
        setProfileImage(null);
        setSuccessMessage('Profile updated successfully!');
        setTimeout(() => setSuccessMessage(''), 3000);
      } else {
        setError(res.message || 'Failed to update profile. Please try again.');
      }
    } catch (err) {
      setError('Failed to update profile. Please try again.');
      console.error('❌ Save error:', err);
    }
  };

  const handleCancel = () => {
    setFormData(user);
    setIsEditing(false);
    setProfileImage(null);
  };

  if (authLoading || loading) {
    return (
      <UserLayout>
        <div className="flex items-center justify-center min-h-screen">
          <div className="text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-green-500 mx-auto mb-4"></div>
            <p className="text-gray-600 dark:text-gray-300">Loading profile...</p>
          </div>
        </div>
      </UserLayout>
    );
  }

  console.log('👤 Current user state:', user);
  console.log('📝 Current formData state:', formData);

  return (
    <UserLayout>
      <div className="space-y-8">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-2xl sm:text-3xl font-bold text-gray-900 dark:text-white mb-2">My Profile</h1>
          <p className="text-sm sm:text-base text-gray-600 dark:text-gray-400">Manage your personal information</p>
        </div>

        {/* Messages */}
        {error && (
          <div className="mb-6 p-4 bg-red-100 dark:bg-red-900 border border-red-400 dark:border-red-700 text-red-700 dark:text-red-200 rounded-lg text-sm sm:text-base">
            {error}
          </div>
        )}
        {successMessage && (
          <div className="mb-6 p-4 bg-green-100 dark:bg-green-900 border border-green-400 dark:border-green-700 text-green-700 dark:text-green-200 rounded-lg text-sm sm:text-base">
            {successMessage}
          </div>
        )}

        {/* Profile Card */}
        <div className="bg-white dark:bg-gray-800 rounded-lg shadow-md p-4 sm:p-8">
          {/* Profile Image Section */}
          <div className="mb-8 flex flex-col items-center">
            <div className="relative mb-4">
              <div className="w-24 sm:w-32 h-24 sm:h-32 bg-gradient-to-br from-green-400 to-blue-500 rounded-full flex items-center justify-center text-white text-3xl sm:text-5xl font-bold overflow-hidden">
                {profileImage ? (
                  <img src={profileImage} alt="Profile" className="w-full h-full object-cover" />
                ) : user?.profileImage ? (
                  <img src={user.profileImage} alt="Profile" className="w-full h-full object-cover" />
                ) : (
                  (user?.firstName?.charAt(0) || user?.lastName?.charAt(0) || 'U')
                )}
              </div>
              {isEditing && (
                <button
                  onClick={() => fileInputRef.current?.click()}
                  className="absolute bottom-0 right-0 bg-green-500 hover:bg-green-600 text-white p-2 rounded-full transition"
                >
                  <Upload size={16} className="sm:w-[18px] sm:h-[18px]" />
                </button>
              )}
            </div>
            <input
              ref={fileInputRef}
              type="file"
              accept="image/*"
              onChange={handleImageUpload}
              className="hidden"
            />
            {isEditing && (
              <button
                onClick={() => fileInputRef.current?.click()}
                className="text-xs sm:text-sm text-green-600 dark:text-green-400 hover:underline"
              >
                Change Profile Picture
              </button>
            )}
          </div>

          {/* Profile Information */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 sm:gap-6 mb-8">
            {/* First Name */}
            <div>
              <label className="block text-xs sm:text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                <User size={14} className="sm:w-4 sm:h-4 inline mr-2" />
                First Name
              </label>
              {isEditing ? (
                <input
                  type="text"
                  name="firstName"
                  value={formData.firstName || ''}
                  onChange={handleInputChange}
                  className="w-full px-3 sm:px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-green-500 text-sm"
                />
              ) : (
                <p className="text-gray-900 dark:text-white font-semibold text-sm sm:text-base">{user?.firstName}</p>
              )}
            </div>

            {/* Last Name */}
            <div>
              <label className="block text-xs sm:text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                Last Name
              </label>
              {isEditing ? (
                <input
                  type="text"
                  name="lastName"
                  value={formData.lastName || ''}
                  onChange={handleInputChange}
                  className="w-full px-3 sm:px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-green-500 text-sm"
                />
              ) : (
                <p className="text-gray-900 dark:text-white font-semibold text-sm sm:text-base">{user?.lastName}</p>
              )}
            </div>

            {/* Email */}
            <div>
              <label className="block text-xs sm:text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                <Mail size={14} className="sm:w-4 sm:h-4 inline mr-2" />
                Email
              </label>
              <p className="text-gray-900 dark:text-white font-semibold text-sm sm:text-base break-all">{user?.email}</p>
              <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">Email cannot be changed</p>
            </div>

            {/* Phone */}
            <div>
              <label className="block text-xs sm:text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                <Phone size={14} className="sm:w-4 sm:h-4 inline mr-2" />
                Phone Number
              </label>
              {isEditing ? (
                <input
                  type="tel"
                  name="phone"
                  value={formData.phone || ''}
                  onChange={handleInputChange}
                  className="w-full px-3 sm:px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-green-500 text-sm"
                />
              ) : (
                <p className="text-gray-900 dark:text-white font-semibold text-sm sm:text-base">{user?.phone || 'Not provided'}</p>
              )}
            </div>

            {/* Date of Birth */}
            <div>
              <label className="block text-xs sm:text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                <Calendar size={14} className="sm:w-4 sm:h-4 inline mr-2" />
                Date of Birth
              </label>
              {isEditing ? (
                <input
                  type="date"
                  name="dateOfBirth"
                  value={formData.dateOfBirth?.split('T')[0] || ''}
                  onChange={handleInputChange}
                  className="w-full px-3 sm:px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-green-500 text-sm"
                />
              ) : (
                <p className="text-gray-900 dark:text-white font-semibold text-sm sm:text-base">
                  {user?.dateOfBirth ? new Date(user.dateOfBirth).toLocaleDateString() : 'Not provided'}
                </p>
              )}
            </div>

            {/* Gender */}
            <div>
              <label className="block text-xs sm:text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                Gender
              </label>
              {isEditing ? (
                <select
                  name="gender"
                  value={formData.gender || ''}
                  onChange={handleInputChange}
                  className="w-full px-3 sm:px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-green-500 text-sm"
                >
                  <option value="">Select Gender</option>
                  <option value="Male">Male</option>
                  <option value="Female">Female</option>
                  <option value="Other">Other</option>
                </select>
              ) : (
                <p className="text-gray-900 dark:text-white font-semibold text-sm sm:text-base">{user?.gender || 'Not provided'}</p>
              )}
            </div>

            {/* Account Created */}
            <div>
              <label className="block text-xs sm:text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                Member Since
              </label>
              <p className="text-gray-900 dark:text-white font-semibold text-sm sm:text-base">
                {user?.createdAt ? new Date(user.createdAt).toLocaleDateString() : 'N/A'}
              </p>
            </div>
          </div>

          {/* Address */}
          <div className="mb-8 pb-8 border-b border-gray-200 dark:border-gray-700">
            <label className="block text-xs sm:text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
              <MapPin size={14} className="sm:w-4 sm:h-4 inline mr-2" />
              Address
            </label>
            {isEditing ? (
              <textarea
                name="address"
                value={formData.address || ''}
                onChange={handleInputChange}
                rows="3"
                className="w-full px-3 sm:px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-green-500 text-sm"
              />
            ) : (
              <p className="text-gray-900 dark:text-white font-semibold text-sm sm:text-base">{user?.address || 'Not provided'}</p>
            )}
          </div>

          {/* Action Buttons */}
          <div className="flex flex-col sm:flex-row gap-3 sm:gap-4">
            {isEditing ? (
              <>
                <button
                  onClick={handleSave}
                  className="flex items-center justify-center gap-2 px-4 sm:px-6 py-2 sm:py-3 bg-green-500 hover:bg-green-600 text-white rounded-lg transition font-semibold text-sm sm:text-base"
                >
                  <Save size={16} className="sm:w-[18px] sm:h-[18px]" />
                  Save Changes
                </button>
                <button
                  onClick={handleCancel}
                  className="flex items-center justify-center gap-2 px-4 sm:px-6 py-2 sm:py-3 bg-gray-300 dark:bg-gray-600 hover:bg-gray-400 dark:hover:bg-gray-700 text-gray-900 dark:text-white rounded-lg transition font-semibold text-sm sm:text-base"
                >
                  <X size={16} className="sm:w-[18px] sm:h-[18px]" />
                  Cancel
                </button>
              </>
            ) : (
              <button
                onClick={() => setIsEditing(true)}
                className="flex items-center justify-center gap-2 px-4 sm:px-6 py-2 sm:py-3 bg-blue-500 hover:bg-blue-600 text-white rounded-lg transition font-semibold text-sm sm:text-base"
              >
                <Edit2 size={16} className="sm:w-[18px] sm:h-[18px]" />
                Edit Profile
              </button>
            )}
          </div>
        </div>
      </div>
    </UserLayout>
  );
}
