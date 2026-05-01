import React, { useState } from 'react';
import { Upload, Car, Phone, User, FileText, Calendar, CheckCircle, Zap, Clock, Award, Users } from 'lucide-react';
import api from '../services/api';
import apiConfig from '../config/api.config.json';

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
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleFileUpload = (e) => {
    const file = e.target.files[0];
    if (file) {
      setFormData(prev => ({
        ...prev,
        licenseUpload: file
      }));
      // Preview
      const reader = new FileReader();
      reader.onloadend = () => {
        setFilePreview(reader.result);
      };
      reader.readAsDataURL(file);
    }
  };

  const validateForm = () => {
    if (!formData.name.trim()) {
      setMessage({ type: 'error', text: 'Name is required' });
      return false;
    }
    if (!formData.email.trim()) {
      setMessage({ type: 'error', text: 'Email is required' });
      return false;
    }
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(formData.email)) {
      setMessage({ type: 'error', text: 'Please enter a valid email address' });
      return false;
    }
    if (!formData.phone.trim()) {
      setMessage({ type: 'error', text: 'Phone number is required' });
      return false;
    }
    const phoneRegex = new RegExp(`^[${apiConfig.driver.phoneStartDigits.join('')}]\\d{${apiConfig.driver.maxPhoneLength - 1}}$`);
    if (!phoneRegex.test(formData.phone)) {
      setMessage({ type: 'error', text: 'Please enter a valid 10-digit phone number' });
      return false;
    }
    if (!formData.experience) {
      setMessage({ type: 'error', text: 'Experience is required' });
      return false;
    }
    if (!formData.licenseUpload) {
      setMessage({ type: 'error', text: 'License upload is required' });
      return false;
    }
    return true;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!validateForm()) return;

    setLoading(true);
    setMessage({ type: '', text: '' });

    try {
      const formDataToSend = new FormData();
      formDataToSend.append('name', formData.name);
      formDataToSend.append('email', formData.email);
      formDataToSend.append('phone', formData.phone);
      formDataToSend.append('experience', formData.experience);
      formDataToSend.append('licenseDocument', formData.licenseUpload);

      const response = await api.post(
        apiConfig.endpoints.driver.register,
        formDataToSend
      );

      if (response.data.success) {
        setMessage({ type: 'success', text: 'Registration successful! We will verify your details and contact you soon.' });
        // Reset form
        setTimeout(() => {
          setFormData({
            name: '',
            email: '',
            phone: '',
            experience: '',
            licenseUpload: null,
          });
          setFilePreview(null);
          setShowModal(false);
          setMessage({ type: '', text: '' });
        }, 2000);
      }
    } catch (error) {
      setMessage({ 
        type: 'error', 
        text: error.response?.data?.message || 'Registration failed. Please try again.' 
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-green-50 to-blue-50 dark:from-slate-900 dark:to-slate-800 py-8 px-4">
      <div className="max-w-[1400px] mx-auto">
        
        {/* ===== HERO BANNER ===== */}
        <div className="bg-gradient-to-r from-green-600 to-blue-600 dark:from-green-800 dark:to-blue-800 rounded-3xl shadow-2xl p-12 mb-12 text-white">
          <div className="flex items-start gap-8">
            <div className="flex-1">
              <div className="inline-block bg-white/20 backdrop-blur-sm px-4 py-2 rounded-full mb-4">
                <span className="text-sm font-bold">Now Hiring</span>
              </div>
              <h1 className="text-5xl font-bold mb-4">
                Earn Up To ₹{apiConfig.driver.earningsMonthly.max.toLocaleString()} Monthly as an EV Pilot
              </h1>
              <p className="text-xl text-green-50 mb-8">
                Join Jaipur's premier electric vehicle network. Drive premium EVs, earn consistently, and be part of the green revolution.
              </p>
              <div className="flex flex-wrap gap-4 text-sm font-semibold">
                <div className="flex items-center gap-2 bg-white/20 backdrop-blur-sm px-4 py-2 rounded-lg">
                  <Zap className="w-4 h-4" />
                  Weekly payments
                </div>
                <div className="flex items-center gap-2 bg-white/20 backdrop-blur-sm px-4 py-2 rounded-lg">
                  <Zap className="w-4 h-4" />
                  Zero fuel costs
                </div>
                <div className="flex items-center gap-2 bg-white/20 backdrop-blur-sm px-4 py-2 rounded-lg">
                  <Clock className="w-4 h-4" />
                  Flexible hours
                </div>
                <div className="flex items-center gap-2 bg-white/20 backdrop-blur-sm px-4 py-2 rounded-lg">
                  <Award className="w-4 h-4" />
                  Full training
                </div>
              </div>
              <button
                onClick={() => setShowModal(true)}
                className="mt-8 bg-white text-green-600 font-bold py-3 px-8 rounded-lg hover:bg-gray-100 transition text-lg flex items-center gap-2"
              >
                <Car className="w-5 h-5" />
                Registerd Now
              </button>
            </div>
            <div className="hidden lg:block text-center">
              <div className="inline-block bg-white/10 backdrop-blur-sm px-8 py-6 rounded-2xl">
                <p className="text-sm text-green-100 mb-2">Call for Details</p>
                <p className="text-3xl font-bold">+91 8690366601</p>
              </div>
            </div>
          </div>
        </div>

        {/* ===== EARNING POTENTIAL ===== */}
        <div className="mb-16">
          <h2 className="text-4xl font-bold text-gray-900 dark:text-white mb-8 text-center">Earning Potential</h2>
          <div className="grid md:grid-cols-3 gap-6">
            {/* Daily */}
            <div className="bg-white dark:bg-slate-800 rounded-2xl shadow-lg p-8 text-center">
              <div className="inline-block p-3 bg-green-100 dark:bg-green-900/30 rounded-full mb-4">
                <Calendar className="w-8 h-8 text-green-600" />
              </div>
              <h3 className="text-2xl font-bold text-gray-900 dark:text-white mb-2">Daily</h3>
              <p className="text-4xl font-bold text-green-600 mb-2">₹{apiConfig.driver.earningsDaily.min.toLocaleString()} - ₹{apiConfig.driver.earningsDaily.max.toLocaleString()}</p>
              <p className="text-gray-600 dark:text-gray-400 text-sm">8-10 hours/day</p>
            </div>

            {/* Weekly */}
            <div className="bg-white dark:bg-slate-800 rounded-2xl shadow-lg p-8 text-center border-2 border-green-500">
              <div className="inline-block p-3 bg-green-100 dark:bg-green-900/30 rounded-full mb-4">
                <Zap className="w-8 h-8 text-green-600" />
              </div>
              <h3 className="text-2xl font-bold text-gray-900 dark:text-white mb-2">Weekly</h3>
              <p className="text-4xl font-bold text-green-600 mb-2">₹{apiConfig.driver.earningsWeekly.min.toLocaleString()} - ₹{apiConfig.driver.earningsWeekly.max.toLocaleString()}</p>
              <p className="text-gray-600 dark:text-gray-400 text-sm">5-6 days/week</p>
              <div className="bg-green-100 dark:bg-green-900/20 rounded-lg px-3 py-2 mt-4 text-sm font-semibold text-green-600">Most Popular</div>
            </div>

            {/* Monthly */}
            <div className="bg-white dark:bg-slate-800 rounded-2xl shadow-lg p-8 text-center">
              <div className="inline-block p-3 bg-green-100 dark:bg-green-900/30 rounded-full mb-4">
                <Award className="w-8 h-8 text-green-600" />
              </div>
              <h3 className="text-2xl font-bold text-gray-900 dark:text-white mb-2">Monthly</h3>
              <p className="text-4xl font-bold text-green-600 mb-2">₹{apiConfig.driver.earningsMonthly.min.toLocaleString()} - ₹{apiConfig.driver.earningsMonthly.max.toLocaleString()}</p>
              <p className="text-gray-600 dark:text-gray-400 text-sm">Performance based</p>
            </div>
          </div>
          <p className="text-center text-gray-600 dark:text-gray-400 mt-6 text-sm">
            *Earnings may vary based on hours worked and performance
          </p>
        </div>

        {/* ===== WHY DRIVE WITH US ===== */}
        <div className="mb-16">
          <h2 className="text-4xl font-bold text-gray-900 dark:text-white mb-8 text-center">Why Drive with Us?</h2>
          <div className="grid md:grid-cols-3 gap-6">
            {/* Guaranteed Earnings */}
            <div className="bg-white dark:bg-slate-800 rounded-2xl shadow-lg p-8 hover:shadow-xl transition">
              <div className="inline-block p-3 bg-blue-100 dark:bg-blue-900/30 rounded-full mb-4">
                <Zap className="w-8 h-8 text-blue-600" />
              </div>
              <h3 className="text-xl font-bold text-gray-900 dark:text-white mb-3">Guaranteed Earnings</h3>
              <p className="text-gray-600 dark:text-gray-400 text-sm">
                Earn ₹{apiConfig.driver.earningsWeekly.min.toLocaleString()} - ₹{apiConfig.driver.earningsWeekly.max.toLocaleString()} weekly with bonuses. ₹{apiConfig.driver.earningsMonthly.min.toLocaleString()}-{apiConfig.driver.earningsMonthly.max.toLocaleString()} monthly
              </p>
            </div>

            {/* Flexible Hours */}
            <div className="bg-white dark:bg-slate-800 rounded-2xl shadow-lg p-8 hover:shadow-xl transition">
              <div className="inline-block p-3 bg-purple-100 dark:bg-purple-900/30 rounded-full mb-4">
                <Clock className="w-8 h-8 text-purple-600" />
              </div>
              <h3 className="text-xl font-bold text-gray-900 dark:text-white mb-3">Flexible Hours</h3>
              <p className="text-gray-600 dark:text-gray-400 text-sm">
                Choose your own schedule, full or part-time. Work on your terms
              </p>
            </div>

            {/* Premium EVs */}
            <div className="bg-white dark:bg-slate-800 rounded-2xl shadow-lg p-8 hover:shadow-xl transition">
              <div className="inline-block p-3 bg-green-100 dark:bg-green-900/30 rounded-full mb-4">
                <Car className="w-8 h-8 text-green-600" />
              </div>
              <h3 className="text-xl font-bold text-gray-900 dark:text-white mb-3">Premium EVs</h3>
              <p className="text-gray-600 dark:text-gray-400 text-sm">
                Drive high-end electric vehicles, zero maintenance. No fuel costs
              </p>
            </div>
          </div>
        </div>

        {/* ===== REQUIREMENTS ===== */}
        <div className="mb-16 bg-white dark:bg-slate-800 rounded-2xl shadow-lg p-12">
          <h2 className="text-3xl font-bold text-gray-900 dark:text-white mb-2 text-center">Requirements</h2>
          <p className="text-center text-gray-600 dark:text-gray-400 mb-8">Meet these basic requirements to start your journey as an EV pilot.</p>
          
          <div className="grid md:grid-cols-2 gap-4">
            <div className="flex items-start gap-4">
              <div className="p-2 bg-green-100 dark:bg-green-900/30 rounded-lg flex-shrink-0">
                <CheckCircle className="w-6 h-6 text-green-600" />
              </div>
              <div>
                <h4 className="font-bold text-gray-900 dark:text-white">Valid Driving License</h4>
                <p className="text-sm text-gray-600 dark:text-gray-400">Must be valid and not expired</p>
              </div>
            </div>

            <div className="flex items-start gap-4">
              <div className="p-2 bg-green-100 dark:bg-green-900/30 rounded-lg flex-shrink-0">
                <CheckCircle className="w-6 h-6 text-green-600" />
              </div>
              <div>
                <h4 className="font-bold text-gray-900 dark:text-white">Clean Driving Record</h4>
                <p className="text-sm text-gray-600 dark:text-gray-400">No major traffic violations</p>
              </div>
            </div>

            <div className="flex items-start gap-4">
              <div className="p-2 bg-green-100 dark:bg-green-900/30 rounded-lg flex-shrink-0">
                <CheckCircle className="w-6 h-6 text-green-600" />
              </div>
              <div>
                <h4 className="font-bold text-gray-900 dark:text-white">Age 18 or Above</h4>
                <p className="text-sm text-gray-600 dark:text-gray-400">Minimum age requirement</p>
              </div>
            </div>

            <div className="flex items-start gap-4">
              <div className="p-2 bg-green-100 dark:bg-green-900/30 rounded-lg flex-shrink-0">
                <CheckCircle className="w-6 h-6 text-green-600" />
              </div>
              <div>
                <h4 className="font-bold text-gray-900 dark:text-white">Smartphone with Internet</h4>
                <p className="text-sm text-gray-600 dark:text-gray-400">Required for app and bookings</p>
              </div>
            </div>

            <div className="flex items-start gap-4">
              <div className="p-2 bg-green-100 dark:bg-green-900/30 rounded-lg flex-shrink-0">
                <CheckCircle className="w-6 h-6 text-green-600" />
              </div>
              <div>
                <h4 className="font-bold text-gray-900 dark:text-white">Good Communication Skills</h4>
                <p className="text-sm text-gray-600 dark:text-gray-400">Excellent customer service</p>
              </div>
            </div>
          </div>
        </div>

        {/* ===== REGISTRATION FORM MODAL ===== */}
        {showModal && (
          <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
            <div className="bg-white dark:bg-slate-800 rounded-2xl shadow-2xl max-w-2xl w-full max-h-[90vh] overflow-y-auto">
              {/* Modal Header */}
              <div className="bg-gradient-to-r from-green-600 to-blue-600 dark:from-green-800 dark:to-blue-800 p-8 text-white flex items-start justify-between">
                <div>
                  <h2 className="text-3xl font-bold mb-2">Register as a Driver</h2>
                  <p className="text-green-50">Complete your application to join our network</p>
                </div>
                <button
                  onClick={() => {
                    setShowModal(false);
                    setMessage({ type: '', text: '' });
                  }}
                  className="text-white text-2xl font-bold hover:opacity-80 transition"
                >
                  ✕
                </button>
              </div>

              {/* Modal Body */}
              <div className="p-8">
                {/* Message Display */}
                {message.text && (
                  <div className={`mb-6 p-4 rounded-lg ${
                    message.type === 'success' 
                      ? 'bg-green-100 text-green-800 border border-green-300' 
                      : 'bg-red-100 text-red-800 border border-red-300'
                  }`}>
                    {message.text}
                  </div>
                )}

                <form onSubmit={handleSubmit} className="space-y-6">
                  {/* Name Field */}
                  <div>
                    <label className="block text-sm font-semibold text-gray-700 dark:text-gray-200 mb-2">
                      <User className="inline-block w-4 h-4 mr-2" />
                      Full Name *
                    </label>
                    <input
                      type="text"
                      name="name"
                      value={formData.name}
                      onChange={handleInputChange}
                      placeholder="Enter your full name"
                      className="w-full px-4 py-3 border border-gray-300 dark:border-slate-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500 bg-white dark:bg-slate-700 dark:text-white"
                      disabled={loading}
                    />
                  </div>

                  {/* Email Field */}
                  <div>
                    <label className="block text-sm font-semibold text-gray-700 dark:text-gray-200 mb-2">
                      <User className="inline-block w-4 h-4 mr-2" />
                      Email Address *
                    </label>
                    <input
                      type="email"
                      name="email"
                      value={formData.email}
                      onChange={handleInputChange}
                      placeholder="Enter your email address"
                      className="w-full px-4 py-3 border border-gray-300 dark:border-slate-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500 bg-white dark:bg-slate-700 dark:text-white"
                      disabled={loading}
                    />
                  </div>

                  {/* Phone Field */}
                  <div>
                    <label className="block text-sm font-semibold text-gray-700 dark:text-gray-200 mb-2">
                      <Phone className="inline-block w-4 h-4 mr-2" />
                      Phone Number *
                    </label>
                    <input
                      type="tel"
                      name="phone"
                      value={formData.phone}
                      onChange={handleInputChange}
                      placeholder="10-digit phone number (e.g., 9876543210)"
                      className="w-full px-4 py-3 border border-gray-300 dark:border-slate-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500 bg-white dark:bg-slate-700 dark:text-white"
                      disabled={loading}
                    />
                  </div>

                  {/* Experience Field */}
                  <div>
                    <label className="block text-sm font-semibold text-gray-700 dark:text-gray-200 mb-2">
                      <FileText className="inline-block w-4 h-4 mr-2" />
                      Years of Experience *
                    </label>
                    <select
                      name="experience"
                      value={formData.experience}
                      onChange={handleInputChange}
                      className="w-full px-4 py-3 border border-gray-300 dark:border-slate-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500 bg-white dark:bg-slate-700 dark:text-white"
                      disabled={loading}
                    >
                      <option value="">Select experience</option>
                      <option value="0-1">0-1 years</option>
                      <option value="1-3">1-3 years</option>
                      <option value="3-5">3-5 years</option>
                      <option value="5+">5+ years</option>
                    </select>
                  </div>

                  {/* License Upload */}
                  <div>
                    <label className="block text-sm font-semibold text-gray-700 dark:text-gray-200 mb-2">
                      <Upload className="inline-block w-4 h-4 mr-2" />
                      Driving License Upload *
                    </label>
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
                        className="block w-full px-4 py-8 border-2 border-dashed border-green-300 rounded-lg text-center cursor-pointer hover:border-green-500 hover:bg-green-50 dark:hover:bg-slate-700 transition"
                      >
                        {filePreview ? (
                          <div>
                            <img src={filePreview} alt="License Preview" className="max-h-32 mx-auto mb-2 rounded" />
                            <p className="text-sm text-green-600 dark:text-green-400">File selected</p>
                          </div>
                        ) : (
                          <div>
                            <Upload className="w-8 h-8 mx-auto mb-2 text-gray-400" />
                            <p className="text-sm text-gray-600 dark:text-gray-400">
                              Click to upload or drag and drop
                            </p>
                            <p className="text-xs text-gray-500 dark:text-gray-500">PDF, JPG, PNG (Max 5MB)</p>
                          </div>
                        )}
                      </label>
                    </div>
                    {formData.licenseUpload && (
                      <p className="text-sm text-gray-600 dark:text-gray-400 mt-2">
                        {formData.licenseUpload.name}
                      </p>
                    )}
                  </div>

                  {/* Buttons */}
                  <div className="flex gap-3">
                    <button
                      type="button"
                      onClick={() => {
                        setShowModal(false);
                        setMessage({ type: '', text: '' });
                      }}
                      disabled={loading}
                      className="flex-1 px-4 py-3 border border-gray-300 dark:border-slate-600 rounded-lg text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-slate-700 transition disabled:opacity-50"
                    >
                      Cancel
                    </button>
                    <button
                      type="submit"
                      disabled={loading}
                      className="flex-1 bg-gradient-to-r from-green-600 to-green-700 hover:from-green-700 hover:to-green-800 disabled:from-gray-400 disabled:to-gray-500 text-white font-bold py-3 px-6 rounded-lg transition duration-200 flex items-center justify-center gap-2"
                    >
                      <Car className="w-5 h-5" />
                      {loading ? 'Processing...' : 'Become a Driver'}
                    </button>
                  </div>
                </form>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
