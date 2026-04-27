import React, { useState } from 'react';
import { X, User, Phone, Mail, CreditCard, Car, FileText, Calendar } from 'lucide-react';
import partnerPaymentService from '../services/partnerPaymentService.js';

export default function PartnerRegistrationModal({ isOpen, onClose, partnerType }) {
  const [step, setStep] = useState(1);
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    phone: '',
    password: '',
    confirmPassword: '',
    licenseNumber: '',
    licenseExpiry: '',
    vehicleDetails: {
      vehicleNumber: '',
      vehicleModel: '',
      vehicleType: 'electric_car',
      capacity: 4,
      color: '',
      manufacturingYear: new Date().getFullYear()
    },
    address: {
      street: '',
      city: '',
      state: '',
      pincode: ''
    },
    emergencyContact: {
      name: '',
      phone: '',
      relation: ''
    }
  });

  const registrationFees = {
    'driver': { amount: 2000, description: 'Driver Registration Fee' },
    'car-owner': { amount: 5000, description: 'Car Owner Registration Fee' },
    'ev-charger': { amount: 10000, description: 'EV Charger Partner Registration Fee' }
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    if (name.includes('.')) {
      const [parent, child] = name.split('.');
      setFormData(prev => ({
        ...prev,
        [parent]: {
          ...prev[parent],
          [child]: value
        }
      }));
    } else {
      setFormData(prev => ({
        ...prev,
        [name]: value
      }));
    }
  };

  const validateForm = () => {
    const { name, email, phone, password, confirmPassword, licenseNumber, licenseExpiry } = formData;
    
    if (!name || !email || !phone || !password || !licenseNumber || !licenseExpiry) {
      alert('Please fill all required fields');
      return false;
    }
    
    if (password !== confirmPassword) {
      alert('Passwords do not match');
      return false;
    }
    
    if (password.length < 6) {
      alert('Password must be at least 6 characters');
      return false;
    }
    
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      alert('Please enter a valid email');
      return false;
    }
    
    const phoneRegex = /^[6-9]\d{9}$/;
    if (!phoneRegex.test(phone)) {
      alert('Please enter a valid 10-digit phone number');
      return false;
    }
    
    return true;
  };

  const handlePayment = async () => {
    if (!validateForm()) return;
    
    setLoading(true);
    
    try {
      // Create payment order
      const orderResponse = await partnerPaymentService.createRegistrationPayment(
        partnerType,
        registrationFees[partnerType].amount,
        formData
      );
      
      if (orderResponse.success) {
        // Initiate Razorpay payment
        await partnerPaymentService.initiateRazorpayPayment(
          orderResponse.data,
          {
            name: formData.name,
            email: formData.email,
            phone: formData.phone
          },
          async (paymentData) => {
            // Payment successful, verify it
            try {
              const verifyResponse = await partnerPaymentService.verifyPayment(paymentData);
              
              if (verifyResponse.success) {
                setStep(3); // Success step
                // Auto close after 3 seconds
                setTimeout(() => {
                  onClose();
                  setStep(1);
                  setFormData({
                    name: '', email: '', phone: '', password: '', confirmPassword: '',
                    licenseNumber: '', licenseExpiry: '',
                    vehicleDetails: {
                      vehicleNumber: '', vehicleModel: '', vehicleType: 'electric_car',
                      capacity: 4, color: '', manufacturingYear: new Date().getFullYear()
                    },
                    address: { street: '', city: '', state: '', pincode: '' },
                    emergencyContact: { name: '', phone: '', relation: '' }
                  });
                }, 3000);
              } else {
                alert('Payment verification failed. Please contact support.');
              }
            } catch (error) {
              alert('Payment verification failed: ' + error.message);
            }
            setLoading(false);
          },
          (error) => {
            alert('Payment failed: ' + error);
            setLoading(false);
          }
        );
      } else {
        alert('Failed to create payment order');
        setLoading(false);
      }
    } catch (error) {
      alert('Payment initiation failed: ' + error.message);
      setLoading(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-2xl max-w-2xl w-full max-h-[90vh] overflow-y-auto">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b">
          <h2 className="text-xl font-bold text-[#212121]">
            {partnerType === 'driver' ? 'Driver' : 
             partnerType === 'car-owner' ? 'Car Owner' : 
             'EV Charger'} Partner Registration
          </h2>
          <button onClick={onClose} className="text-gray-500 hover:text-gray-700">
            <X className="w-6 h-6" />
          </button>
        </div>

        {/* Step Indicator */}
        <div className="flex items-center justify-center space-x-4 p-4 bg-gray-50">
          <div className={`flex items-center ${step >= 1 ? 'text-[#00FF00]' : 'text-gray-400'}`}>
            <div className={`w-8 h-8 rounded-full flex items-center justify-center ${step >= 1 ? 'bg-[#00FF00] text-white' : 'bg-gray-200'}`}>1</div>
            <span className="ml-2 text-sm">Details</span>
          </div>
          <div className="w-8 h-0.5 bg-gray-300"></div>
          <div className={`flex items-center ${step >= 2 ? 'text-[#00FF00]' : 'text-gray-400'}`}>
            <div className={`w-8 h-8 rounded-full flex items-center justify-center ${step >= 2 ? 'bg-[#00FF00] text-white' : 'bg-gray-200'}`}>2</div>
            <span className="ml-2 text-sm">Payment</span>
          </div>
          <div className="w-8 h-0.5 bg-gray-300"></div>
          <div className={`flex items-center ${step >= 3 ? 'text-[#00FF00]' : 'text-gray-400'}`}>
            <div className={`w-8 h-8 rounded-full flex items-center justify-center ${step >= 3 ? 'bg-[#00FF00] text-white' : 'bg-gray-200'}`}>3</div>
            <span className="ml-2 text-sm">Success</span>
          </div>
        </div>

        <div className="p-6">
          {/* Step 1: Registration Form */}
          {step === 1 && (
            <form className="space-y-4">
              {/* Personal Information */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    <User className="inline w-4 h-4 mr-2" />
                    Full Name *
                  </label>
                  <input
                    type="text"
                    name="name"
                    value={formData.name}
                    onChange={handleInputChange}
                    className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#00FF00] focus:border-transparent"
                    placeholder="Enter your full name"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    <Mail className="inline w-4 h-4 mr-2" />
                    Email *
                  </label>
                  <input
                    type="email"
                    name="email"
                    value={formData.email}
                    onChange={handleInputChange}
                    className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#00FF00] focus:border-transparent"
                    placeholder="Enter your email"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    <Phone className="inline w-4 h-4 mr-2" />
                    Phone Number *
                  </label>
                  <input
                    type="tel"
                    name="phone"
                    value={formData.phone}
                    onChange={handleInputChange}
                    className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#00FF00] focus:border-transparent"
                    placeholder="Enter 10-digit phone number"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    <FileText className="inline w-4 h-4 mr-2" />
                    License Number *
                  </label>
                  <input
                    type="text"
                    name="licenseNumber"
                    value={formData.licenseNumber}
                    onChange={handleInputChange}
                    className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#00FF00] focus:border-transparent"
                    placeholder="Enter license number"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    <Calendar className="inline w-4 h-4 mr-2" />
                    License Expiry *
                  </label>
                  <input
                    type="date"
                    name="licenseExpiry"
                    value={formData.licenseExpiry}
                    onChange={handleInputChange}
                    className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#00FF00] focus:border-transparent"
                  />
                </div>
              </div>

              {/* Vehicle Information */}
              <div className="border-t pt-4 mt-6">
                <h3 className="text-lg font-semibold text-[#212121] mb-4">
                  <Car className="inline w-5 h-5 mr-2" />
                  Vehicle Information
                </h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Vehicle Number</label>
                    <input
                      type="text"
                      name="vehicleDetails.vehicleNumber"
                      value={formData.vehicleDetails.vehicleNumber}
                      onChange={handleInputChange}
                      className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#00FF00] focus:border-transparent"
                      placeholder="HR01AB1234"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Vehicle Model</label>
                    <input
                      type="text"
                      name="vehicleDetails.vehicleModel"
                      value={formData.vehicleDetails.vehicleModel}
                      onChange={handleInputChange}
                      className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#00FF00] focus:border-transparent"
                      placeholder="Tata Nexon EV"
                    />
                  </div>
                </div>
              </div>

              {/* Password */}
              <div className="border-t pt-4 mt-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Password *</label>
                    <input
                      type="password"
                      name="password"
                      value={formData.password}
                      onChange={handleInputChange}
                      className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#00FF00] focus:border-transparent"
                      placeholder="Enter password (min 6 chars)"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Confirm Password *</label>
                    <input
                      type="password"
                      name="confirmPassword"
                      value={formData.confirmPassword}
                      onChange={handleInputChange}
                      className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#00FF00] focus:border-transparent"
                      placeholder="Confirm password"
                    />
                  </div>
                </div>
              </div>

              <div className="flex justify-between items-center pt-4">
                <div>
                  <p className="text-sm text-gray-600">Registration Fee: 
                    <span className="font-bold text-[#008000]"> ₹{registrationFees[partnerType]?.amount}</span>
                  </p>
                </div>
                <button
                  type="button"
                  onClick={() => setStep(2)}
                  className="bg-[#00FF00] text-[#212121] px-6 py-2 rounded-lg font-semibold hover:bg-[#00FF00]/90 transition-colors"
                >
                  Proceed to Payment
                </button>
              </div>
            </form>
          )}

          {/* Step 2: Payment */}
          {step === 2 && (
            <div className="text-center">
              <div className="mb-6">
                <CreditCard className="w-16 h-16 text-[#00FF00] mx-auto mb-4" />
                <h3 className="text-xl font-bold text-[#212121] mb-2">Complete Payment</h3>
                <p className="text-gray-600">Registration fee for {partnerType} partner</p>
              </div>

              <div className="bg-gray-50 rounded-lg p-4 mb-6">
                <div className="flex justify-between items-center">
                  <span className="text-gray-700">Registration Fee:</span>
                  <span className="text-xl font-bold text-[#008000]">₹{registrationFees[partnerType]?.amount}</span>
                </div>
              </div>

              <div className="space-y-3">
                <button
                  onClick={handlePayment}
                  disabled={loading}
                  className="w-full bg-[#FFFF00] text-[#212121] py-3 rounded-lg font-semibold hover:bg-[#FFFF00]/90 transition-colors disabled:opacity-50"
                >
                  {loading ? 'Processing...' : `Pay ₹${registrationFees[partnerType]?.amount} Now`}
                </button>
                <button
                  onClick={() => setStep(1)}
                  className="w-full text-gray-600 hover:text-gray-800 transition-colors"
                >
                  Back to Details
                </button>
              </div>
            </div>
          )}

          {/* Step 3: Success */}
          {step === 3 && (
            <div className="text-center">
              <div className="w-16 h-16 bg-[#00FF00] rounded-full flex items-center justify-center mx-auto mb-6">
                <svg className="w-8 h-8 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7" />
                </svg>
              </div>
              <h3 className="text-xl font-bold text-[#212121] mb-2">Registration Successful!</h3>
              <p className="text-gray-600 mb-4">
                Your partner registration is complete. You will receive a confirmation email shortly.
              </p>
              <p className="text-sm text-gray-500">
                Your application will be reviewed within 24-48 hours.
              </p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}