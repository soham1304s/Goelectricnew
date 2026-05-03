import React, { useState, useEffect } from 'react';
import { motion, useScroll, useTransform } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import {
  Smartphone,
  Monitor,
  Shield,
  Zap,
  Clock,
  MapPin,
  Check,
  Plane,
  Navigation,
  Landmark,
  ChevronRight,
  Star,
  Search,
  LocateFixed,
  Calendar,
  Car
} from 'lucide-react';
import LocationPickerComponent from '../LocationPickerComponent.jsx';

const MacBookShowcase = ({ darkMode }) => {
  const navigate = useNavigate();
  const { scrollYProgress } = useScroll();
  const [activeTab, setActiveTab] = useState('Local Ride');
  const [pickup, setPickup] = useState("Jaipur International Airport");
  const [dest, setDest] = useState("City Palace, Jaipur");
  const [bookingDate, setBookingDate] = useState(new Date().toISOString().split('T')[0]);
  const [bookingTime, setBookingTime] = useState(`${String(new Date().getHours()).padStart(2, '0')}:${String(new Date().getMinutes()).padStart(2, '0')}`);
  const [isSearching, setIsSearching] = useState(false);



  const handleSearch = () => {
    setIsSearching(true);
    setTimeout(() => {
      setIsSearching(false);
      // Working perfectly: Redirect to the corresponding service page
      if (activeTab === 'Local Ride' || activeTab === 'Local') navigate('/local-ride');
      else if (activeTab === 'Intercity Ride' || activeTab === 'Intercity') navigate('/intercity-ride');
      else if (activeTab === 'Airport') navigate('/airport');
      else navigate('/tours');
    }, 1500);
  };

  // Dynamic 3D rotation and scale based on scroll for a premium feel
  const rotateX = useTransform(scrollYProgress, [0, 0.2], [15, 0]);
  const scale = useTransform(scrollYProgress, [0, 0.2], [0.9, 1]);
  const opacity = useTransform(scrollYProgress, [0, 0.1], [0, 1]);

  const features = [
    { icon: <Zap size={20} className="text-emerald-500" />, title: "Instant Booking", desc: "Get a ride in seconds" },
    { icon: <Shield size={20} className="text-blue-500" />, title: "Secure Travel", desc: "Verified drivers only" },
    { icon: <Clock size={20} className="text-purple-500" />, title: "24/7 Support", desc: "We are always here" },
  ];

  return (
    <section id="booking-section" className={`py-32 overflow-hidden relative ${darkMode ? 'bg-[#020617]' : 'bg-slate-50'}`}>
      <style>
        {`
          @keyframes floatMac {
            0% { transform: translateY(0px) rotateX(0deg); }
            50% { transform: translateY(-15px) rotateX(2deg); }
            100% { transform: translateY(0px) rotateX(0deg); }
          }
          @keyframes floatPhone {
            0% { transform: translateY(0px) rotate(-2deg); }
            50% { transform: translateY(-20px) rotate(0deg); }
            100% { transform: translateY(0px) rotate(-2deg); }
          }
          .animate-float-mac {
            animation: floatMac 6s ease-in-out infinite;
          }
          .animate-float-phone {
            animation: floatPhone 5s ease-in-out infinite;
          }
        `}
      </style>

      {/* Background Decor */}
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-full h-full max-w-7xl pointer-events-none">
        <div className={`absolute top-0 left-1/4 w-96 h-96 rounded-full blur-[120px] ${darkMode ? 'bg-emerald-500/10' : 'bg-emerald-500/5'}`} />
        <div className={`absolute bottom-0 right-1/4 w-96 h-96 rounded-full blur-[120px] ${darkMode ? 'bg-blue-500/10' : 'bg-blue-500/5'}`} />
      </div>

      <div className="max-w-7xl mx-auto px-4 relative z-10">
        <div className="text-center mb-16 md:mb-24">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="inline-flex items-center gap-2 bg-emerald-500/10 text-emerald-600 px-4 py-2 rounded-full text-[10px] font-black uppercase tracking-[0.2em] mb-4"
          >
            Digital Ecosystem
          </motion.div>
          <motion.h2
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ delay: 0.1 }}
            className={`text-4xl md:text-6xl font-black ${darkMode ? 'text-white' : 'text-slate-900'} mb-6 tracking-tight`}
          >
            Manage Your Journey <br />
            On <span className="text-emerald-600">Any Device.</span>
          </motion.h2>
          <motion.p
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ delay: 0.2 }}
            className={`max-w-2xl mx-auto text-lg md:text-xl font-medium ${darkMode ? 'text-gray-400' : 'text-slate-500'}`}
          >
            Our seamless multi-platform experience allows you to book, track, and manage your electric rides from your desktop or mobile with absolute ease.
          </motion.p>
        </div>

        {/* Device Showcase Container */}
        <motion.div
          style={{ rotateX, scale, opacity }}
          className="relative perspective-2000"
        >
          {/* MacBook Frame - Desktop Only */}
          <div className="hidden md:block relative mx-auto max-w-[900px] group animate-float-mac">
            {/* The Screen / Chassis */}
            <div className={`relative rounded-t-[2.5rem] p-3 shadow-2xl transition-all duration-700 ${darkMode ? 'bg-slate-800 border-slate-700' : 'bg-slate-300 border-slate-400'} border-x-4 border-t-4`}>
              {/* Screen Content */}
              <div className={`relative aspect-[16/10] rounded-[1.5rem] overflow-hidden ${darkMode ? 'bg-slate-900' : 'bg-white shadow-inner'}`}>
                {/* Simulated UI Navbar */}
                <div className={`h-12 border-b flex items-center px-6 justify-between ${darkMode ? 'bg-slate-800/50 border-slate-700' : 'bg-slate-50 border-slate-200'}`}>
                  <div className="flex gap-2">
                    <div className="w-3 h-3 rounded-full bg-red-400" />
                    <div className="w-3 h-3 rounded-full bg-amber-400" />
                    <div className="w-3 h-3 rounded-full bg-emerald-400" />
                  </div>
                  <div className={`text-[10px] font-bold px-3 py-1 rounded-full ${darkMode ? 'bg-slate-700 text-slate-300' : 'bg-white text-slate-500 shadow-sm'}`}>
                    goelectriq.com
                  </div>
                  <div className="w-10" />
                </div>

                {/* Smart Booking UI Content */}
                <div className={`p-8 h-full flex flex-col ${darkMode ? 'text-white' : 'text-slate-900'}`}>
                  {/* Header */}
                  <div className="mb-6">
                    <div className={`inline-flex items-center gap-1.5 ${darkMode ? 'bg-emerald-500/10 text-emerald-400' : 'bg-emerald-50 text-emerald-600'} px-3 py-1 rounded-full text-[9px] font-black uppercase tracking-widest mb-3`}>
                      <Zap size={10} className="fill-current animate-pulse" /> Smart Booking
                    </div>
                    <h3 className="text-2xl font-black tracking-tight mb-1">Plan Your Perfect Ride</h3>
                    <p className={`text-xs font-medium ${darkMode ? 'text-slate-400' : 'text-slate-500'}`}>Choose route, date, and time for a seamless electric journey.</p>
                  </div>

                  {/* Service Toggle */}
                  <div className={`flex p-1 rounded-2xl mb-6 max-w-sm ${darkMode ? 'bg-slate-800' : 'bg-slate-100'}`}>
                    {['Local Ride', 'Intercity Ride', 'Airport'].map((type) => (
                      <button
                        key={type}
                        onClick={() => setActiveTab(type === 'Intercity Ride' ? 'Intercity' : type)}
                        className={`flex-1 py-2.5 rounded-xl text-[11px] font-black transition-all ${(activeTab === type || (activeTab === 'Intercity' && type === 'Intercity Ride'))
                            ? 'bg-gradient-to-r from-emerald-500 to-blue-600 text-white shadow-lg scale-105'
                            : 'text-slate-500 hover:text-slate-700 hover:scale-105'
                          }`}
                      >
                        {type}
                      </button>
                    ))}
                  </div>

                  {/* Input Fields */}
                  <div className="space-y-4 mb-6">
                    <div className="flex flex-col gap-4">
                      <LocationPickerComponent
                        value={pickup}
                        onChange={(val) => setPickup(val)}
                        placeholder="Pickup location"
                        darkMode={darkMode}
                        inputClassName="!py-4 !rounded-2xl !text-xs !font-bold"
                      />
                      <LocationPickerComponent
                        value={dest}
                        onChange={(val) => setDest(val)}
                        placeholder="Destination"
                        darkMode={darkMode}
                        inputClassName="!py-4 !rounded-2xl !text-xs !font-bold"
                      />
                    </div>
                  </div>

                  {/* Date & Time */}
                  <div className="grid grid-cols-2 gap-4 mb-8">
                    <div className={`relative flex items-center gap-3 p-4 rounded-2xl border transition-all ${darkMode ? 'bg-slate-800/50 border-slate-700' : 'bg-slate-50 border-slate-100 shadow-sm'}`}>
                      <Calendar size={18} className="text-purple-500" />
                      <input
                        type="date"
                        value={bookingDate}
                        onChange={(e) => setBookingDate(e.target.value)}
                        className="bg-transparent border-none outline-none text-xs font-bold text-slate-900 dark:text-white w-full cursor-pointer [color-scheme:light]"
                      />
                      <div className="pointer-events-none ml-auto w-4 h-4 border border-slate-400 rounded-sm" />
                    </div>
                    <div className={`relative flex items-center gap-3 p-4 rounded-2xl border transition-all ${darkMode ? 'bg-slate-800/50 border-slate-700' : 'bg-slate-50 border-slate-100 shadow-sm'}`}>
                      <Clock size={18} className="text-blue-500" />
                      <input
                        type="time"
                        value={bookingTime}
                        onChange={(e) => setBookingTime(e.target.value)}
                        className="bg-transparent border-none outline-none text-xs font-bold text-slate-900 dark:text-white w-full cursor-pointer [color-scheme:light]"
                      />
                      <div className="pointer-events-none ml-auto w-4 h-4 border-2 border-slate-400 rounded-full flex items-center justify-center">
                        <div className="w-0.5 h-1.5 bg-slate-400 rounded-full rotate-45" />
                      </div>
                    </div>
                  </div>

                  {/* Action Button */}
                  <button
                    onClick={handleSearch}
                    disabled={isSearching}
                    className="w-full py-5 rounded-[1.5rem] bg-gradient-to-r from-emerald-500 to-teal-500 text-white font-black text-sm shadow-xl shadow-emerald-500/20 hover:scale-[1.02] active:scale-95 transition-all flex items-center justify-center gap-3 disabled:opacity-70"
                  >
                    {isSearching ? (
                      <div className="flex items-center gap-2">
                        <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                        Routing perfectly...
                      </div>
                    ) : (
                      <>
                        <Car size={18} /> Search Rides Now
                      </>
                    )}
                  </button>
                </div>
              </div>
            </div>

            {/* Laptop Base (Trackpad area) */}
            <div className={`relative h-5 rounded-b-xl mx-[-2%] shadow-xl ${darkMode ? 'bg-slate-700 border-slate-600' : 'bg-slate-400 border-slate-500'} border-x-4 border-b-4`}>
              <div className={`absolute top-0 left-1/2 -translate-x-1/2 w-32 h-2 rounded-b-lg ${darkMode ? 'bg-slate-800' : 'bg-slate-300'}`} />
            </div>
          </div>

          {/* Floating iPhone Frame - Mobile Only */}
          <motion.div
            initial={{ y: 50, opacity: 0 }}
            whileInView={{ y: 0, opacity: 1 }}
            transition={{ delay: 0.2, duration: 0.8 }}
            className="md:hidden relative mx-auto w-[280px] z-20 group animate-float-phone"
          >
            <div className={`relative rounded-[2.5rem] p-2 shadow-2xl border-[6px] ${darkMode ? 'bg-slate-900 border-slate-800' : 'bg-slate-900 border-slate-800'}`}>
              {/* Speaker / Notch */}
              <div className="absolute top-4 left-1/2 -translate-x-1/2 w-16 h-4 bg-slate-900 rounded-full z-30" />

              {/* Screen Content */}
              <div className="aspect-[9/19.5] rounded-[2rem] overflow-hidden bg-white relative">
                {/* Mobile UI - Full Smart Booking Form */}
                <div className="p-5 flex flex-col h-full bg-white overflow-y-auto scrollbar-hide">
                  {/* Status Bar */}
                  <div className="flex items-center justify-between mb-4 mt-2">
                    <span className="text-[10px] font-black text-slate-900">9:41</span>
                    <div className="flex gap-1">
                      <div className="w-3 h-2 bg-slate-900 rounded-[2px]" />
                      <div className="w-1.5 h-1.5 bg-slate-900 rounded-full" />
                    </div>
                  </div>

                  {/* Header */}
                  <div className="mb-5">
                    <div className="inline-flex items-center gap-1 bg-emerald-50 text-emerald-600 px-2 py-0.5 rounded-full text-[8px] font-black uppercase tracking-widest mb-2">
                      <Zap size={8} className="fill-current animate-pulse" /> Smart Booking
                    </div>
                    <h4 className="text-xl font-black text-slate-900 leading-tight">Plan Your Ride</h4>
                  </div>

                  {/* Service Toggle */}
                  <div className="flex p-1 rounded-xl mb-5 bg-slate-100">
                    {['Local', 'Intercity', 'Airport'].map((type) => (
                      <button
                        key={type}
                        onClick={() => setActiveTab(type === 'Intercity' ? 'Intercity' : type)}
                        className={`flex-1 py-2 rounded-lg text-[9px] font-black transition-all ${(activeTab === type || (activeTab === 'Intercity' && type === 'Intercity Ride'))
                            ? 'bg-gradient-to-r from-emerald-500 to-teal-500 text-white shadow-md scale-105'
                            : 'text-slate-500 hover:scale-105'
                          }`}
                      >
                        {type}
                      </button>
                    ))}
                  </div>

                  {/* Inputs */}
                  <div className="space-y-3 mb-5">
                    <LocationPickerComponent
                      value={pickup}
                      onChange={(val) => setPickup(val)}
                      placeholder="Pickup location"
                      darkMode={false} // iPhone content is white
                      inputClassName="!py-3 !rounded-xl !text-[10px] !font-bold"
                    />
                    <LocationPickerComponent
                      value={dest}
                      onChange={(val) => setDest(val)}
                      placeholder="Destination"
                      darkMode={false}
                      inputClassName="!py-3 !rounded-xl !text-[10px] !font-bold"
                    />
                  </div>

                  {/* Date & Time */}
                  <div className="grid grid-cols-2 gap-3 mb-6">
                    <div className="flex items-center gap-2 p-3 rounded-xl border border-slate-100 bg-slate-50">
                      <Calendar size={14} className="text-purple-500" />
                      <input
                        type="date"
                        value={bookingDate}
                        onChange={(e) => setBookingDate(e.target.value)}
                        className="bg-transparent border-none outline-none text-[9px] font-bold text-slate-900 w-full [color-scheme:light]"
                      />
                    </div>
                    <div className="flex items-center gap-2 p-3 rounded-xl border border-slate-100 bg-slate-50">
                      <Clock size={14} className="text-blue-500" />
                      <input
                        type="time"
                        value={bookingTime}
                        onChange={(e) => setBookingTime(e.target.value)}
                        className="bg-transparent border-none outline-none text-[9px] font-bold text-slate-900 w-full [color-scheme:light]"
                      />
                    </div>
                  </div>

                  {/* Action Button */}
                  <button
                    onClick={handleSearch}
                    disabled={isSearching}
                    className="w-full mt-auto bg-gradient-to-r from-emerald-500 to-teal-500 text-white py-4 rounded-2xl font-black text-[11px] shadow-lg shadow-emerald-500/20 active:scale-95 transition-all disabled:opacity-70"
                  >
                    {isSearching ? (
                      <div className="flex items-center justify-center gap-2">
                        <div className="w-3 h-3 border-2 border-white border-t-transparent rounded-full animate-spin" />
                        Routing...
                      </div>
                    ) : "Search Rides Now"}
                  </button>
                </div>
              </div>
            </div>
          </motion.div>
        </motion.div>

        {/* Value Props Grid */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mt-24 md:mt-32">
          {features.map((feature, i) => (
            <motion.div
              key={i}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: i * 0.1 }}
              className={`p-8 rounded-[2rem] border transition-all hover:-translate-y-2 ${darkMode
                  ? 'bg-slate-800/40 border-slate-700/50 hover:bg-slate-800'
                  : 'bg-white border-slate-100 shadow-xl shadow-slate-200/40 hover:shadow-emerald-200/20'
                }`}
            >
              <div className={`w-14 h-14 rounded-2xl flex items-center justify-center mb-6 ${darkMode ? 'bg-slate-900' : 'bg-slate-50'}`}>
                {feature.icon}
              </div>
              <h3 className={`text-xl font-black mb-2 ${darkMode ? 'text-white' : 'text-slate-900'}`}>{feature.title}</h3>
              <p className={`font-medium ${darkMode ? 'text-gray-400' : 'text-slate-500'}`}>{feature.desc}</p>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
};

export default MacBookShowcase;
