import React, { useState } from 'react';
import { Upload, Zap, Phone, User, FileText, Car, DollarSign, Clock, Shield, TrendingUp, ChevronDown } from 'lucide-react';
import axios from 'axios';
import apiConfig from '../config/api.config.json';

const API_BASE_URL = (import.meta.env.VITE_API_URL || apiConfig.api.baseUrl).replace(/\/api$/, '');
const API_ENDPOINT = `${API_BASE_URL}/api`;

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
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleFileUpload = (e, fileType) => {
    const file = e.target.files[0];
    if (file) {
      setFormData(prev => ({
        ...prev,
        [fileType === 'rc' ? 'rcUpload' : 'insuranceUpload']: file
      }));
      // Preview
      const reader = new FileReader();
      reader.onloadend = () => {
        setFilePreview(prev => ({
          ...prev,
          [fileType]: reader.result
        }));
      };
      reader.readAsDataURL(file);
    }
  };

  const validateForm = () => {
    if (!formData.ownerName.trim()) {
      setMessage({ type: 'error', text: 'Owner name is required' });
      return false;
    }
    if (!formData.phone.trim()) {
      setMessage({ type: 'error', text: 'Phone number is required' });
      return false;
    }
    const phoneRegex = new RegExp(`^[${apiConfig.cab.phoneStartDigits.join('')}]\\d{${apiConfig.cab.maxPhoneLength - 1}}$`);
    if (!phoneRegex.test(formData.phone)) {
      setMessage({ type: 'error', text: 'Please enter a valid 10-digit phone number' });
      return false;
    }
    if (!formData.vehicleModel.trim()) {
      setMessage({ type: 'error', text: 'Vehicle model is required' });
      return false;
    }
    if (!formData.evType) {
      setMessage({ type: 'error', text: 'EV type is required' });
      return false;
    }
    if (!formData.rcUpload) {
      setMessage({ type: 'error', text: 'RC document upload is required' });
      return false;
    }
    if (!formData.insuranceUpload) {
      setMessage({ type: 'error', text: 'Insurance document upload is required' });
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
      formDataToSend.append('ownerName', formData.ownerName);
      formDataToSend.append('phone', formData.phone);
      formDataToSend.append('vehicleModel', formData.vehicleModel);
      formDataToSend.append('evType', formData.evType);
      formDataToSend.append('rcDocument', formData.rcUpload);
      formDataToSend.append('insuranceDocument', formData.insuranceUpload);

      const response = await axios.post(
        `${API_ENDPOINT}${apiConfig.endpoints.cab.register}`,
        formDataToSend,
        {
          headers: {
            'Content-Type': 'multipart/form-data',
          },
        }
      );

      if (response.data.success) {
        setMessage({ type: 'success', text: 'Registration successful! We will verify your vehicle details and contact you soon.' });
        // Reset form
        setTimeout(() => {
          setFormData({
            ownerName: '',
            phone: '',
            vehicleModel: '',
            evType: '',
            rcUpload: null,
            insuranceUpload: null,
          });
          setFilePreview({ rc: null, insurance: null });
        }, 1500);
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
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-purple-50 dark:from-slate-900 dark:to-slate-800 py-8 px-4">
      <div className="max-w-[1400px] mx-auto">
        
        {/* ===== HERO BANNER ===== */}
        <div className="bg-gradient-to-r from-blue-600 to-purple-600 dark:from-blue-800 dark:to-purple-800 rounded-3xl shadow-2xl p-6 md:p-12 mb-12 text-white">
          <div className="flex flex-col lg:flex-row items-start gap-8">
            <div className="flex-1">
              <div className="inline-block bg-white/20 backdrop-blur-sm px-4 py-2 rounded-full mb-4">
                <span className="text-sm font-bold">Now Accepting Partners</span>
              </div>
              <h1 className="text-3xl md:text-5xl font-bold mb-4">
                Earn Steady Income with Your EV
              </h1>
              <p className="text-lg md:text-xl text-blue-50 mb-8">
                Join GoElectriQ's premium fleet. Zero fuel costs, guaranteed bookings, and consistent earnings. Partner with us today!
              </p>
              <button
                onClick={() => setShowModal(true)}
                className="bg-white text-blue-600 font-bold py-3 px-8 rounded-lg hover:bg-gray-100 transition text-base md:text-lg flex items-center gap-2"
              >
                <Car className="w-5 h-5" />
                Register Your Cab Now
              </button>
            </div>
            <div className="hidden lg:block text-center">
              <div className="inline-block bg-white/10 backdrop-blur-sm px-8 py-6 rounded-2xl">
                <p className="text-sm text-blue-100 mb-2">Support Team</p>
                <p className="text-3xl font-bold">+91 8690366601</p>
              </div>
            </div>
          </div>
        </div>

        {/* ===== EARNINGS & COMMISSION ===== */}
        <div className="mb-16">
          <h2 className="text-2xl md:text-4xl font-bold text-gray-900 dark:text-white mb-8 text-center">How Much Can You Earn?</h2>
          
          <div className="grid md:grid-cols-3 gap-4 md:gap-6 mb-8">
            {/* Monthly Earnings */}
            <div className="bg-white dark:bg-slate-800 rounded-2xl shadow-lg p-6 md:p-8 text-center">
              <div className="inline-block p-3 bg-blue-100 dark:bg-blue-900/30 rounded-full mb-4">
                <DollarSign className="w-6 md:w-8 h-6 md:h-8 text-blue-600" />
              </div>
              <h3 className="text-lg md:text-2xl font-bold text-gray-900 dark:text-white mb-2">Monthly Earnings</h3>
              <p className="text-3xl md:text-5xl font-bold text-blue-600 mb-2">{apiConfig.cab.earningsMonthly.text}</p>
              <p className="text-gray-600 dark:text-gray-400 text-xs md:text-sm">Based on rides completed</p>
            </div>

            {/* Per Ride */}
            <div className="bg-white dark:bg-slate-800 rounded-2xl shadow-lg p-6 md:p-8 text-center border-2 border-blue-500">
              <div className="inline-block p-3 bg-blue-100 dark:bg-blue-900/30 rounded-full mb-4">
                <TrendingUp className="w-6 md:w-8 h-6 md:h-8 text-blue-600" />
              </div>
              <h3 className="text-lg md:text-2xl font-bold text-gray-900 dark:text-white mb-2">Per Ride</h3>
              <p className="text-3xl md:text-5xl font-bold text-blue-600 mb-2">₹{apiConfig.cab.earningsPerRide.min}-{apiConfig.cab.earningsPerRide.max}</p>
              <p className="text-gray-600 dark:text-gray-400 text-xs md:text-sm">Average per completed ride</p>
              <div className="bg-blue-100 dark:bg-blue-900/20 rounded-lg px-3 py-2 mt-4 text-xs md:text-sm font-semibold text-blue-600">Highest Potential</div>
            </div>

            {/* Daily Potential */}
            <div className="bg-white dark:bg-slate-800 rounded-2xl shadow-lg p-6 md:p-8 text-center">
              <div className="inline-block p-3 bg-blue-100 dark:bg-blue-900/30 rounded-full mb-4">
                <Clock className="w-6 md:w-8 h-6 md:h-8 text-blue-600" />
              </div>
              <h3 className="text-lg md:text-2xl font-bold text-gray-900 dark:text-white mb-2">Daily Average</h3>
              <p className="text-3xl md:text-5xl font-bold text-blue-600 mb-2">₹{apiConfig.cab.earningsDailyAverage.min.toLocaleString()}-{apiConfig.cab.earningsDailyAverage.max.toLocaleString()}</p>
              <p className="text-gray-600 dark:text-gray-400 text-xs md:text-sm">6-8 hours work</p>
            </div>
          </div>

          <p className="text-center text-gray-600 dark:text-gray-400 text-xs md:text-sm">
            *Earnings vary based on ride demand, distance, and time spent online
          </p>
        </div>

        {/* ===== COMMISSION & PAYMENT ===== */}
        <div className="mb-16 bg-white dark:bg-slate-800 rounded-2xl shadow-lg p-6 md:p-12">
          <h2 className="text-2xl md:text-3xl font-bold text-gray-900 dark:text-white mb-8 text-center">Payment & Commission Structure</h2>
          
          <div className="grid md:grid-cols-2 gap-6 md:gap-8">
            {/* Commission Details */}
            <div className="space-y-4">
              <h3 className="text-lg md:text-xl font-bold text-gray-900 dark:text-white flex items-center gap-2 mb-4">
                <DollarSign className="w-5 md:w-6 h-5 md:h-6 text-blue-600" />
                Commission Details
              </h3>
              
              <div className="bg-blue-50 dark:bg-slate-700 p-3 md:p-4 rounded-lg">
                <div className="flex justify-between items-center mb-2 flex-wrap gap-2">
                  <span className="font-semibold text-xs md:text-base text-gray-900 dark:text-white">{apiConfig.cab.commission.firstRides.label}</span>
                  <span className="text-base md:text-lg font-bold text-green-600">{apiConfig.cab.commission.firstRides.percentage}% Commission</span>
                </div>
                <p className="text-xs md:text-sm text-gray-600 dark:text-gray-400">Complete bonus rides free</p>
              </div>

              <div className="bg-blue-50 dark:bg-slate-700 p-3 md:p-4 rounded-lg">
                <div className="flex justify-between items-center mb-2 flex-wrap gap-2">
                  <span className="font-semibold text-xs md:text-base text-gray-900 dark:text-white">{apiConfig.cab.commission.standardCommission.label}</span>
                  <span className="text-base md:text-lg font-bold text-blue-600">{apiConfig.cab.commission.standardCommission.percentage}% Commission</span>
                </div>
                <p className="text-xs md:text-sm text-gray-600 dark:text-gray-400">Competitive industry standard</p>
              </div>

              <div className="bg-blue-50 dark:bg-slate-700 p-3 md:p-4 rounded-lg">
                <div className="flex justify-between items-center mb-2 flex-wrap gap-2">
                  <span className="font-semibold text-xs md:text-base text-gray-900 dark:text-white">{apiConfig.cab.commission.bonus.label}</span>
                  <span className="text-base md:text-lg font-bold text-green-600">Extra ₹{apiConfig.cab.commission.bonus.min}-{apiConfig.cab.commission.bonus.max}</span>
                </div>
                <p className="text-xs md:text-sm text-gray-600 dark:text-gray-400">Peak hour and surge rewards</p>
              </div>
            </div>

            {/* Payment Details */}
            <div className="space-y-4">
              <h3 className="text-lg md:text-xl font-bold text-gray-900 dark:text-white flex items-center gap-2 mb-4">
                <Clock className="w-5 md:w-6 h-5 md:h-6 text-green-600" />
                Payment Schedule
              </h3>
              
              <div className="bg-green-50 dark:bg-slate-700 p-3 md:p-4 rounded-lg">
                <div className="flex justify-between items-center mb-2 flex-wrap gap-2">
                  <span className="font-semibold text-xs md:text-base text-gray-900 dark:text-white">Payment Frequency</span>
                  <span className="text-base md:text-lg font-bold text-green-600">{apiConfig.cab.payment.frequency}</span>
                </div>
                <p className="text-xs md:text-sm text-gray-600 dark:text-gray-400">Every {apiConfig.cab.payment.day} to your bank account</p>
              </div>

              <div className="bg-green-50 dark:bg-slate-700 p-3 md:p-4 rounded-lg">
                <div className="flex justify-between items-center mb-2 flex-wrap gap-2">
                  <span className="font-semibold text-xs md:text-base text-gray-900 dark:text-white">Processing Time</span>
                  <span className="text-base md:text-lg font-bold text-green-600">{apiConfig.cab.payment.processingHours}</span>
                </div>
                <p className="text-xs md:text-sm text-gray-600 dark:text-gray-400">From week end to your account</p>
              </div>

              <div className="bg-green-50 dark:bg-slate-700 p-3 md:p-4 rounded-lg">
                <div className="flex justify-between items-center mb-2 flex-wrap gap-2">
                  <span className="font-semibold text-xs md:text-base text-gray-900 dark:text-white">Withdrawal</span>
                  <span className="text-base md:text-lg font-bold text-green-600">{apiConfig.cab.payment.withdrawalPolicy}</span>
                </div>
                <p className="text-xs md:text-sm text-gray-600 dark:text-gray-400">Withdraw your earnings whenever needed</p>
              </div>
            </div>
          </div>
        </div>

        {/* ===== WHY PARTNER WITH US ===== */}
        <div className="mb-16">
          <h2 className="text-2xl md:text-3xl font-bold text-gray-900 dark:text-white mb-8 text-center">Why Join GoElectriQ?</h2>
          <div className="grid md:grid-cols-3 gap-4 md:gap-6">
            <div className="bg-white dark:bg-slate-800 rounded-2xl shadow-lg p-6 md:p-8 hover:shadow-xl transition">
              <div className="inline-block p-3 bg-blue-100 dark:bg-blue-900/30 rounded-full mb-4">
                <Zap className="w-6 md:w-8 h-6 md:h-8 text-blue-600" />
              </div>
              <h3 className="text-lg md:text-xl font-bold text-gray-900 dark:text-white mb-3">Zero Fuel Costs</h3>
              <p className="text-gray-600 dark:text-gray-400 text-xs md:text-sm">
                We provide premium EVs. No fuel expenses, just charge at our stations
              </p>
            </div>

            <div className="bg-white dark:bg-slate-800 rounded-2xl shadow-lg p-6 md:p-8 hover:shadow-xl transition">
              <div className="inline-block p-3 bg-blue-100 dark:bg-blue-900/30 rounded-full mb-4">
                <Shield className="w-6 md:w-8 h-6 md:h-8 text-blue-600" />
              </div>
              <h3 className="text-lg md:text-xl font-bold text-gray-900 dark:text-white mb-3">Full Insurance</h3>
              <p className="text-gray-600 dark:text-gray-400 text-xs md:text-sm">
                Complete coverage for vehicle and passengers. Protection included
              </p>
            </div>

            <div className="bg-white dark:bg-slate-800 rounded-2xl shadow-lg p-6 md:p-8 hover:shadow-xl transition">
              <div className="inline-block p-3 bg-blue-100 dark:bg-blue-900/30 rounded-full mb-4">
                <TrendingUp className="w-6 md:w-8 h-6 md:h-8 text-blue-600" />
              </div>
              <h3 className="text-lg md:text-xl font-bold text-gray-900 dark:text-white mb-3">Guaranteed Bookings</h3>
              <p className="text-gray-600 dark:text-gray-400 text-xs md:text-sm">
                Consistent ride requests via our app. No waiting periods
              </p>
            </div>
          </div>
        </div>

        {/* ===== CTA BUTTON ===== */}
        <div className="text-center mb-8">
          <button
            onClick={() => setShowModal(true)}
            className="inline-flex items-center gap-2 md:gap-3 bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white font-bold py-3 md:py-4 px-6 md:px-12 rounded-xl transition duration-200 text-sm md:text-lg shadow-lg"
          >
            <Car className="w-5 md:w-6 h-5 md:h-6" />
            Register Your Cab & Start Earning
            <ChevronDown className="w-5 md:w-6 h-5 md:h-6" />
          </button>
        </div>

        {/* ===== REGISTRATION MODAL ===== */}
        {showModal && (
          <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-3 md:p-4">
            <div className="bg-white dark:bg-slate-800 rounded-2xl shadow-2xl w-full max-w-2xl max-h-[95vh] overflow-y-auto">
              {/* Modal Header */}
              <div className="bg-gradient-to-r from-blue-600 to-purple-600 dark:from-blue-800 dark:to-purple-800 p-6 md:p-8 text-white flex items-start justify-between sticky top-0">
                <div>
                  <h2 className="text-2xl md:text-3xl font-bold mb-2">Register Your EV Cab</h2>
                  <p className="text-sm md:text-base text-blue-50">Complete your application to start earning</p>
                </div>
                <button
                  onClick={() => {
                    setShowModal(false);
                    setMessage({ type: '', text: '' });
                  }}
                  className="text-white text-2xl font-bold hover:opacity-80 transition flex-shrink-0 ml-4"
                >
                  ✕
                </button>
              </div>

              {/* Modal Body */}
              <div className="p-4 md:p-8">
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

                <form onSubmit={handleSubmit} className="space-y-4 md:space-y-6">
                  {/* Owner Name Field */}
                  <div>
                    <label className="block text-xs md:text-sm font-semibold text-gray-700 dark:text-gray-200 mb-2">
                      <User className="inline-block w-4 h-4 mr-2" />
                      Owner Name *
                    </label>
                    <input
                      type="text"
                      name="ownerName"
                      value={formData.ownerName}
                      onChange={handleInputChange}
                      placeholder="Enter your full name"
                      className="w-full px-4 py-2 md:py-3 border border-gray-300 dark:border-slate-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white dark:bg-slate-700 dark:text-white text-sm"
                      disabled={loading}
                    />
                  </div>

                  {/* Phone Field */}
                  <div>
                    <label className="block text-xs md:text-sm font-semibold text-gray-700 dark:text-gray-200 mb-2">
                      <Phone className="inline-block w-4 h-4 mr-2" />
                      Phone Number *
                    </label>
                    <input
                      type="tel"
                      name="phone"
                      value={formData.phone}
                      onChange={handleInputChange}
                      placeholder="10-digit phone number (e.g., 9876543210)"
                      className="w-full px-4 py-2 md:py-3 border border-gray-300 dark:border-slate-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white dark:bg-slate-700 dark:text-white text-sm"
                      disabled={loading}
                    />
                  </div>

                  {/* EV Type Field */}
                  <div>
                    <label className="block text-xs md:text-sm font-semibold text-gray-700 dark:text-gray-200 mb-2">
                      <Zap className="inline-block w-4 h-4 mr-2" />
                      EV Type *
                    </label>
                    <select
                      name="evType"
                      value={formData.evType}
                      onChange={handleInputChange}
                      className="w-full px-4 py-2 md:py-3 border border-gray-300 dark:border-slate-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white dark:bg-slate-700 dark:text-white text-sm"
                      disabled={loading}
                    >
                      <option value="">Select EV type</option>
                      {evTypes.map(ev => (
                        <option key={ev.value} value={ev.value}>{ev.label}</option>
                      ))}
                    </select>
                  </div>

                  {/* Vehicle Model Field */}
                  <div>
                    <label className="block text-xs md:text-sm font-semibold text-gray-700 dark:text-gray-200 mb-2">
                      <Car className="inline-block w-4 h-4 mr-2" />
                      Vehicle Model / Year *
                    </label>
                    <input
                      type="text"
                      name="vehicleModel"
                      value={formData.vehicleModel}
                      onChange={handleInputChange}
                      placeholder="e.g., Tesla Model 3 2023"
                      className="w-full px-4 py-2 md:py-3 border border-gray-300 dark:border-slate-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white dark:bg-slate-700 dark:text-white text-sm"
                      disabled={loading}
                    />
                  </div>

                  {/* RC Upload */}
                  <div>
                    <label className="block text-xs md:text-sm font-semibold text-gray-700 dark:text-gray-200 mb-2">
                      <FileText className="inline-block w-4 h-4 mr-2" />
                      RC (Registration Certificate) *
                    </label>
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
                        className="block w-full px-4 py-6 md:py-8 border-2 border-dashed border-blue-300 rounded-lg text-center cursor-pointer hover:border-blue-500 hover:bg-blue-50 dark:hover:bg-slate-700 transition"
                      >
                        {filePreview.rc ? (
                          <div>
                            <img src={filePreview.rc} alt="RC Preview" className="max-h-24 md:max-h-32 mx-auto mb-2 rounded" />
                            <p className="text-xs md:text-sm text-blue-600 dark:text-blue-400">File selected</p>
                          </div>
                        ) : (
                          <div>
                            <Upload className="w-6 md:w-8 h-6 md:h-8 mx-auto mb-2 text-gray-400" />
                            <p className="text-xs md:text-sm text-gray-600 dark:text-gray-400">
                              Click to upload or drag and drop
                            </p>
                            <p className="text-xs text-gray-500 dark:text-gray-500">PDF, JPG, PNG (Max 5MB)</p>
                          </div>
                        )}
                      </label>
                    </div>
                    {formData.rcUpload && (
                      <p className="text-xs md:text-sm text-gray-600 dark:text-gray-400 mt-2 break-all">
                        {formData.rcUpload.name}
                      </p>
                    )}
                  </div>

                  {/* Insurance Upload */}
                  <div>
                    <label className="block text-xs md:text-sm font-semibold text-gray-700 dark:text-gray-200 mb-2">
                      <FileText className="inline-block w-4 h-4 mr-2" />
                      Insurance Documents *
                    </label>
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
                        className="block w-full px-4 py-6 md:py-8 border-2 border-dashed border-blue-300 rounded-lg text-center cursor-pointer hover:border-blue-500 hover:bg-blue-50 dark:hover:bg-slate-700 transition"
                      >
                        {filePreview.insurance ? (
                          <div>
                            <img src={filePreview.insurance} alt="Insurance Preview" className="max-h-24 md:max-h-32 mx-auto mb-2 rounded" />
                            <p className="text-xs md:text-sm text-blue-600 dark:text-blue-400">File selected</p>
                          </div>
                        ) : (
                          <div>
                            <Upload className="w-6 md:w-8 h-6 md:h-8 mx-auto mb-2 text-gray-400" />
                            <p className="text-xs md:text-sm text-gray-600 dark:text-gray-400">
                              Click to upload or drag and drop
                            </p>
                            <p className="text-xs text-gray-500 dark:text-gray-500">PDF, JPG, PNG (Max 5MB)</p>
                          </div>
                        )}
                      </label>
                    </div>
                    {formData.insuranceUpload && (
                      <p className="text-xs md:text-sm text-gray-600 dark:text-gray-400 mt-2 break-all">
                        {formData.insuranceUpload.name}
                      </p>
                    )}
                  </div>

                  {/* Buttons */}
                  <div className="flex gap-2 md:gap-3 pt-4">
                    <button
                      type="button"
                      onClick={() => {
                        setShowModal(false);
                        setMessage({ type: '', text: '' });
                      }}
                      disabled={loading}
                      className="flex-1 px-4 py-2 md:py-3 border border-gray-300 dark:border-slate-600 rounded-lg text-xs md:text-sm text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-slate-700 transition disabled:opacity-50"
                    >
                      Cancel
                    </button>
                    <button
                      type="submit"
                      disabled={loading}
                      className="flex-1 bg-gradient-to-r from-blue-600 to-blue-700 hover:from-blue-700 hover:to-blue-800 disabled:from-gray-400 disabled:to-gray-500 text-white font-bold py-2 md:py-3 px-6 rounded-lg transition duration-200 flex items-center justify-center gap-2 text-xs md:text-sm"
                    >
                      <Zap className="w-4 md:w-5 h-4 md:h-5" />
                      {loading ? 'Processing...' : 'Register Your Cab'}
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