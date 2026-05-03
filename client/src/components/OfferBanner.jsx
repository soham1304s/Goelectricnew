import React, { useState, useEffect } from 'react';
import { X, Gift, Sparkles, ArrowRight, Zap, User, Mail, Phone, MessageCircle, Check } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import offerService from '../services/offerService';
import { useTheme } from '../context/ThemeContext';

const OfferBanner = () => {
  const [offer, setOffer] = useState(null);
  const [isVisible, setIsVisible] = useState(false);
  const [showForm, setShowForm] = useState(false);
  const [formData, setFormData] = useState({ name: '', email: '', phone: '' });
  const [formError, setFormError] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [isSuccess, setIsSuccess] = useState(false);
  const { theme } = useTheme();
  const isDark = theme === 'dark';

  useEffect(() => {
    const fetchOffer = async () => {
      try {
        const lastShown = sessionStorage.getItem('offerBannerShown');
        const activeOffer = await offerService.getActiveOffer();
        
        if (activeOffer) {
          setOffer(activeOffer);
          if (!lastShown) {
            setTimeout(() => {
              setIsVisible(true);
              sessionStorage.setItem('offerBannerShown', 'true');
            }, 1000);
          }
        }
      } catch (error) {
        console.error('Error fetching offer:', error);
      }
    };
    fetchOffer();
  }, []);

  const handleClose = () => {
    setIsVisible(false);
    setShowForm(false);
    setFormData({ name: '', email: '', phone: '' });
    setFormError('');
    setIsSuccess(false);
    setIsLoading(false);
  };

  const handleFormChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
    setFormError('');
  };

  const validateForm = () => {
    if (!formData.name.trim()) {
      setFormError('Name is required');
      return false;
    }
    if (!formData.email.trim() || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email)) {
      setFormError('Valid email is required');
      return false;
    }
    if (!formData.phone.trim() || !/^[6-9]\d{9}$/.test(formData.phone)) {
      setFormError('Valid 10-digit phone number is required');
      return false;
    }
    return true;
  };

  const sendViaWhatsApp = () => {
    if (!validateForm()) return;

    setIsLoading(true);
    
    // Simulate API call for 1 second
    setTimeout(() => {
      const whatsappNumber = '919876543210';
      const message = `Hello! I'm interested in your offer: *${offer.title}* (${offer.discountPercentage}% OFF)%0A%0AName: ${formData.name}%0AEmail: ${formData.email}%0APhone: ${formData.phone}`;
      const whatsappUrl = `https://wa.me/${whatsappNumber}?text=${message}`;
      
      setIsLoading(false);
      setIsSuccess(true);
      
      setTimeout(() => {
        window.open(whatsappUrl, '_blank');
        handleClose();
      }, 1500);
    }, 1000);
  };

  if (!offer) return null;

  return (
    <AnimatePresence>
      {isVisible && (
        <div className="fixed inset-0 z-[999] flex items-center justify-center p-4 sm:p-6 overflow-hidden">
          
          {/* Backdrop with Glassmorphism */}
          <motion.div 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={handleClose}
            className="absolute inset-0 bg-black/60 backdrop-blur-sm"
          />

          {/* Main Modal Card */}
          <AnimatePresence mode="wait">
            {!showForm ? (
              <motion.div
                key="offer-card"
                initial={{ scale: 0.8, opacity: 0, y: 50 }}
                animate={{ scale: 1, opacity: 1, y: 0 }}
                exit={{ scale: 0.8, opacity: 0, y: 50 }}
                transition={{ type: 'spring', damping: 20, stiffness: 200 }}
                className={`relative w-full max-w-md overflow-hidden rounded-[2rem] shadow-[0_25px_60px_-15px_rgba(0,0,0,0.5)] ${
                  isDark 
                    ? 'bg-[#0f172a] border border-white/10' 
                    : 'bg-white border border-slate-200'
                }`}
              >
                {/* Background Accent Gradients */}
                <div className="absolute top-0 left-0 w-32 h-32 bg-emerald-500/20 blur-[60px] rounded-full -translate-x-1/2 -translate-y-1/2" />
                <div className="absolute bottom-0 right-0 w-32 h-32 bg-emerald-500/10 blur-[60px] rounded-full translate-x-1/2 translate-y-1/2" />

                {/* Header */}
                <div className="relative h-32 bg-gradient-to-br from-emerald-500 to-teal-600 flex items-center justify-center overflow-hidden">
                  <motion.div 
                    animate={{ rotate: [0, 10, -10, 0] }}
                    transition={{ duration: 4, repeat: Infinity }}
                    className="absolute opacity-20"
                  >
                    <Gift size={120} color="white" />
                  </motion.div>
                  
                  <div className="relative flex flex-col items-center gap-1">
                    <div className="bg-white/20 backdrop-blur-md px-4 py-1 rounded-full border border-white/30 flex items-center gap-2">
                      <Sparkles className="w-4 h-4 text-yellow-300" />
                      <span className="text-[10px] font-bold text-white uppercase tracking-[0.2em]">Limited Time Offer</span>
                    </div>
                    <h2 className="text-3xl font-black text-white drop-shadow-md">
                      {offer.discountPercentage}% OFF
                    </h2>
                  </div>

                  <button
                    onClick={handleClose}
                    className="absolute top-4 right-4 p-2 rounded-full bg-black/20 text-white hover:bg-black/40 transition-colors"
                  >
                    <X size={20} />
                  </button>
                </div>

                {/* Content Section */}
                <div className="px-8 pt-8 pb-8 space-y-6">
                  <div className="space-y-2">
                    <h3 className={`text-xl font-bold leading-tight ${isDark ? 'text-white' : 'text-slate-900'}`}>
                      {offer.title}
                    </h3>
                    <p className={`text-sm leading-relaxed ${isDark ? 'text-slate-400' : 'text-slate-600'}`}>
                      {offer.description}
                    </p>
                  </div>

                  {/* Offer Details Box */}
                  <div className="grid grid-cols-2 gap-3">
                    <div className={`p-4 rounded-2xl flex flex-col justify-center ${isDark ? 'bg-slate-800/50' : 'bg-slate-50'}`}>
                      <span className="text-[10px] font-bold text-emerald-500 uppercase tracking-wider mb-1">Max Savings</span>
                      <div className={`text-xl font-bold ${isDark ? 'text-white' : 'text-slate-800'}`}>
                        ₹{offer.discountAmount > 0 ? offer.discountAmount : 'Extra'}
                      </div>
                    </div>
                    
                    <div className={`p-4 rounded-2xl flex flex-col justify-center ${isDark ? 'bg-slate-800/50' : 'bg-slate-50'}`}>
                      <span className="text-[10px] font-bold text-teal-500 uppercase tracking-wider mb-1">Valid On</span>
                      <div className={`text-xs font-bold leading-tight ${isDark ? 'text-white' : 'text-slate-800'}`}>
                        {offer.applicableOn?.[0] === 'both' ? 'Rides & Tours' : offer.applicableOn?.[0] || 'All Services'}
                      </div>
                    </div>
                  </div>

                  {/* CTA Button */}
                  <motion.button
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.98 }}
                    onClick={() => setShowForm(true)}
                    className="w-full bg-emerald-600 hover:bg-emerald-700 text-white font-extrabold py-4 rounded-2xl shadow-[0_10px_25px_-5px_rgba(16,185,129,0.4)] flex items-center justify-center gap-2 group transition-all"
                  >
                    Claim Offer Now
                    <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
                  </motion.button>

                  {/* Expiry Text */}
                  {offer.endDate && (
                    <div className="flex items-center justify-center gap-2 opacity-60">
                      <Zap className="w-3 h-3 text-amber-500 fill-amber-500" />
                      <span className="text-[10px] font-medium uppercase tracking-tighter">
                        Expires on {new Date(offer.endDate).toLocaleDateString('en-IN', { day: 'numeric', month: 'long' })}
                      </span>
                    </div>
                  )}
                </div>
              </motion.div>
            ) : (
              /* Form Modal */
              <motion.div
                key="form-card"
                initial={{ scale: 0.8, opacity: 0, y: 50 }}
                animate={{ scale: 1, opacity: 1, y: 0 }}
                exit={{ scale: 0.8, opacity: 0, y: 50 }}
                transition={{ type: 'spring', damping: 20, stiffness: 200 }}
                className={`relative w-full max-w-sm overflow-hidden rounded-[2rem] shadow-[0_25px_60px_-15px_rgba(0,0,0,0.5)] ${
                  isDark 
                    ? 'bg-[#0f172a] border border-white/10' 
                    : 'bg-white border border-slate-200'
                }`}
              >
                <AnimatePresence mode="wait">
                  {!isSuccess ? (
                    <motion.div
                      key="form-content"
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 1 }}
                      exit={{ opacity: 0 }}
                      className="px-8 py-8 space-y-6"
                    >
                      {/* Header with Gradient Background */}
                      <div className="flex items-center justify-between mb-2">
                        <div>
                          <h3 className={`text-2xl font-bold ${isDark ? 'text-white' : 'text-slate-900'}`}>
                            Get Your Offer
                          </h3>
                          <p className={`text-xs mt-1 ${isDark ? 'text-slate-400' : 'text-slate-600'}`}>
                            Enter details to claim
                          </p>
                        </div>
                        <button
                          onClick={handleClose}
                          className={`p-2 rounded-full transition-colors ${
                            isDark 
                              ? 'hover:bg-slate-800' 
                              : 'hover:bg-slate-100'
                          }`}
                        >
                          <X size={20} className={isDark ? 'text-slate-400' : 'text-slate-600'} />
                        </button>
                      </div>

                      {/* Progress Indicator */}
                      <div className="flex gap-2 mb-4">
                        <div className="h-1 flex-1 bg-emerald-500 rounded-full"></div>
                        <div className="h-1 flex-1 bg-emerald-500 rounded-full"></div>
                        <div className={`h-1 flex-1 rounded-full ${isDark ? 'bg-slate-700' : 'bg-slate-300'}`}></div>
                      </div>

                      {/* Error Message */}
                      <AnimatePresence>
                        {formError && (
                          <motion.div
                            initial={{ opacity: 0, y: -10 }}
                            animate={{ opacity: 1, y: 0 }}
                            exit={{ opacity: 0, y: -10 }}
                            className="p-4 rounded-xl bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800"
                          >
                            <p className="text-sm font-medium text-red-700 dark:text-red-300">{formError}</p>
                          </motion.div>
                        )}
                      </AnimatePresence>

                      {/* Form Fields */}
                      <div className="space-y-4">
                        {/* Name Field */}
                        <motion.div
                          initial={{ opacity: 0, y: 10 }}
                          animate={{ opacity: 1, y: 0 }}
                          transition={{ delay: 0.1 }}
                        >
                          <label className={`block text-sm font-semibold mb-2 flex items-center gap-2 ${isDark ? 'text-slate-300' : 'text-slate-700'}`}>
                            <User size={16} className="text-emerald-500" />
                            Full Name
                          </label>
                          <input
                            type="text"
                            name="name"
                            value={formData.name}
                            onChange={handleFormChange}
                            placeholder="John Doe"
                            className={`w-full px-4 py-3.5 rounded-xl border-2 transition-all ${
                              isDark 
                                ? 'bg-slate-800 border-slate-700 text-white placeholder-slate-500 focus:border-emerald-500 focus:ring-2 focus:ring-emerald-500/20' 
                                : 'bg-slate-50 border-slate-200 text-slate-900 placeholder-slate-400 focus:border-emerald-500 focus:ring-2 focus:ring-emerald-500/20'
                            } outline-none`}
                          />
                        </motion.div>

                        {/* Email Field */}
                        <motion.div
                          initial={{ opacity: 0, y: 10 }}
                          animate={{ opacity: 1, y: 0 }}
                          transition={{ delay: 0.15 }}
                        >
                          <label className={`block text-sm font-semibold mb-2 flex items-center gap-2 ${isDark ? 'text-slate-300' : 'text-slate-700'}`}>
                            <Mail size={16} className="text-emerald-500" />
                            Email Address
                          </label>
                          <input
                            type="email"
                            name="email"
                            value={formData.email}
                            onChange={handleFormChange}
                            placeholder="john@example.com"
                            className={`w-full px-4 py-3.5 rounded-xl border-2 transition-all ${
                              isDark 
                                ? 'bg-slate-800 border-slate-700 text-white placeholder-slate-500 focus:border-emerald-500 focus:ring-2 focus:ring-emerald-500/20' 
                                : 'bg-slate-50 border-slate-200 text-slate-900 placeholder-slate-400 focus:border-emerald-500 focus:ring-2 focus:ring-emerald-500/20'
                            } outline-none`}
                          />
                        </motion.div>

                        {/* Phone Field */}
                        <motion.div
                          initial={{ opacity: 0, y: 10 }}
                          animate={{ opacity: 1, y: 0 }}
                          transition={{ delay: 0.2 }}
                        >
                          <label className={`block text-sm font-semibold mb-2 flex items-center gap-2 ${isDark ? 'text-slate-300' : 'text-slate-700'}`}>
                            <Phone size={16} className="text-teal-500" />
                            Phone Number
                          </label>
                          <div className="flex gap-2">
                            <div className={`flex items-center px-3 py-3.5 rounded-xl border-2 ${isDark ? 'bg-slate-800 border-slate-700' : 'bg-slate-50 border-slate-200'}`}>
                              <span className={`font-semibold ${isDark ? 'text-slate-400' : 'text-slate-600'}`}>+91</span>
                            </div>
                            <input
                              type="tel"
                              name="phone"
                              value={formData.phone}
                              onChange={handleFormChange}
                              placeholder="98765 43210"
                              maxLength="10"
                              className={`flex-1 px-4 py-3.5 rounded-xl border-2 transition-all ${
                                isDark 
                                  ? 'bg-slate-800 border-slate-700 text-white placeholder-slate-500 focus:border-teal-500 focus:ring-2 focus:ring-teal-500/20' 
                                  : 'bg-slate-50 border-slate-200 text-slate-900 placeholder-slate-400 focus:border-teal-500 focus:ring-2 focus:ring-teal-500/20'
                              } outline-none`}
                            />
                          </div>
                        </motion.div>
                      </div>

                      {/* Buttons */}
                      <div className="grid grid-cols-2 gap-3 pt-4">
                        <motion.button
                          whileHover={{ scale: 1.02 }}
                          whileTap={{ scale: 0.98 }}
                          onClick={() => {
                            setShowForm(false);
                            setFormError('');
                          }}
                          disabled={isLoading}
                          className={`py-3.5 rounded-xl font-bold transition-colors ${
                            isDark 
                              ? 'bg-slate-800 hover:bg-slate-700 text-white' 
                              : 'bg-slate-200 hover:bg-slate-300 text-slate-900'
                          } disabled:opacity-50`}
                        >
                          Cancel
                        </motion.button>
                        <motion.button
                          whileHover={{ scale: 1.02 }}
                          whileTap={{ scale: 0.98 }}
                          onClick={sendViaWhatsApp}
                          disabled={isLoading}
                          className="py-3.5 rounded-xl font-bold bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-700 hover:to-teal-700 text-white transition-all disabled:opacity-50 flex items-center justify-center gap-2"
                        >
                          {isLoading ? (
                            <>
                              <motion.div
                                animate={{ rotate: 360 }}
                                transition={{ duration: 1, repeat: Infinity }}
                                className="w-4 h-4 border-2 border-white border-t-transparent rounded-full"
                              />
                              Sending...
                            </>
                          ) : (
                            <>
                              <MessageCircle size={18} />
                              Send
                            </>
                          )}
                        </motion.button>
                      </div>
                    </motion.div>
                  ) : (
                    /* Success State */
                    <motion.div
                      key="success-content"
                      initial={{ opacity: 0, scale: 0.8 }}
                      animate={{ opacity: 1, scale: 1 }}
                      exit={{ opacity: 0, scale: 0.8 }}
                      className="px-8 py-12 flex flex-col items-center justify-center text-center space-y-4"
                    >
                      <motion.div
                        animate={{ scale: [0, 1.2, 1] }}
                        transition={{ duration: 0.6, delay: 0.2 }}
                        className="w-16 h-16 bg-gradient-to-br from-emerald-400 to-teal-500 rounded-full flex items-center justify-center"
                      >
                        <Check size={32} className="text-white" />
                      </motion.div>

                      <motion.div
                        initial={{ opacity: 0, y: 10 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: 0.4 }}
                        className="space-y-1"
                      >
                        <h4 className={`text-2xl font-bold ${isDark ? 'text-white' : 'text-slate-900'}`}>
                          Perfect!
                        </h4>
                        <p className={`text-sm ${isDark ? 'text-slate-400' : 'text-slate-600'}`}>
                          Opening WhatsApp with your details
                        </p>
                      </motion.div>

                      <motion.p
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        transition={{ delay: 0.6 }}
                        className={`text-xs ${isDark ? 'text-slate-500' : 'text-slate-500'}`}
                      >
                        You'll be redirected in a moment...
                      </motion.p>
                    </motion.div>
                  )}
                </AnimatePresence>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      )}
    </AnimatePresence>
  );
};

export default OfferBanner;
