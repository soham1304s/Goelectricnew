import { useState } from 'react';
import { motion, useScroll, useTransform } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import {
  Shield,
  Zap,
  Clock,
  MapPin,
  Plane,
  Navigation,
  Search,
  LocateFixed,
  Calendar,
  Car,
  TrendingUp
} from 'lucide-react';
import LocationPickerComponent from '../LocationPickerComponent.jsx';

const MacBookShowcase = ({ darkMode, isHero = false }) => {
  const navigate = useNavigate();
  const { scrollYProgress } = useScroll();
  const [activeTab, setActiveTab] = useState('Local Ride');
  const [pickup, setPickup] = useState({ address: "" });
  const [dest, setDest] = useState({ address: "" });
  const [bookingDate, setBookingDate] = useState(new Date().toISOString().split('T')[0]);
  const [bookingTime, setBookingTime] = useState(`${String(new Date().getHours()).padStart(2, '0')}:${String(new Date().getMinutes()).padStart(2, '0')}`);
  const [isSearching, setIsSearching] = useState(false);

  const handleSearch = () => {
    setIsSearching(true);
    const searchData = {
      pickup: pickup.address,
      destination: dest.address,
      date: bookingDate,
      time: bookingTime,
      pickupData: pickup,
      destData: dest
    };

    setTimeout(() => {
      setIsSearching(false);
      const options = { state: searchData };

      if (activeTab === 'Local Ride' || activeTab === 'Local') navigate('/local-ride', options);
      else if (activeTab === 'Intercity Ride' || activeTab === 'Intercity') navigate('/intercity-ride', options);
      else if (activeTab === 'Airport') navigate('/airport', options);
      else navigate('/tours', options);
    }, 1500);
  };

  // Dynamic 3D rotation and scale based on scroll for a premium feel
  const rotateX = useTransform(scrollYProgress, [0, 0.2], [15, 0]);
  const scale = useTransform(scrollYProgress, [0, 0.2], isHero ? [1.0, 1.1] : [0.9, 1]);
  // Use a constant opacity of 1 if in hero mode, otherwise fade in on scroll
  const opacity = useTransform(scrollYProgress, [0, 0.1], isHero ? [1, 1] : [0, 1]);

  const features = [
    { icon: <Zap size={20} className="text-emerald-500" />, title: "Instant Booking", desc: "Get a ride in seconds" },
    { icon: <Shield size={20} className="text-blue-500" />, title: "Secure Travel", desc: "Verified drivers only" },
    { icon: <Clock size={20} className="text-purple-500" />, title: "24/7 Support", desc: "We are always here" },
  ];

  const content = (
    <>
      <style>
        {`
          @keyframes floatMac {
            0% { transform: translateY(0px) rotateX(0deg); }
            50% { transform: translateY(-15px) rotateX(2deg); }
            100% { transform: translateY(0px) rotateX(0deg); }
          }
          @keyframes floatPhone {
            0% { transform: translateY(0px); }
            50% { transform: translateY(-10px); }
            100% { transform: translateY(0px); }
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
      {!isHero && (
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-full h-full max-w-7xl pointer-events-none">
          <div className={`absolute top-0 left-1/4 w-96 h-96 rounded-full blur-[120px] ${darkMode ? 'bg-emerald-500/10' : 'bg-emerald-500/5'}`} />
          <div className={`absolute bottom-0 right-1/4 w-96 h-96 rounded-full blur-[120px] ${darkMode ? 'bg-blue-500/10' : 'bg-blue-500/5'}`} />
        </div>
      )}

      <div className={`${isHero ? 'w-full' : 'max-w-7xl mx-auto px-4'} relative z-10`}>
        {!isHero && (
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
        )}

        {/* Device Showcase Container */}
        <motion.div
          style={{ rotateX, scale, opacity }}
          className="relative perspective-2000"
        >
          {/* MacBook Frame - Desktop Only */}
          <div className={`hidden md:block relative mx-auto ${isHero ? 'max-w-none w-full' : 'max-w-[900px]'} group animate-float-mac`}>
            {/* The Screen / Chassis */}
            <div className={`relative rounded-t-[2.5rem] p-2 md:p-3 shadow-2xl transition-all duration-700 ${darkMode ? 'bg-slate-800 border-slate-700' : 'bg-slate-300 border-slate-400'} border-x-4 border-t-4`}>
              {/* Screen Content */}
              <div className={`relative aspect-[4/3] rounded-[1.2rem] md:rounded-[1.5rem] overflow-hidden ${darkMode ? 'bg-slate-900' : 'bg-white shadow-inner'}`}>
                {/* Simulated UI Navbar */}
                <div className={`h-10 border-b flex items-center px-4 justify-between ${darkMode ? 'bg-slate-800/50 border-slate-700' : 'bg-slate-50 border-slate-200'}`}>
                  <div className="flex gap-1.5">
                    <div className="w-2.5 h-2.5 rounded-full bg-red-400" />
                    <div className="w-2.5 h-2.5 rounded-full bg-amber-400" />
                    <div className="w-2.5 h-2.5 rounded-full bg-emerald-400" />
                  </div>
                  <div className={`text-[9px] font-bold px-3 py-0.5 rounded-full ${darkMode ? 'bg-slate-700 text-slate-300' : 'bg-white text-slate-500 shadow-sm'}`}>
                    goelectriq.com
                  </div>
                  <div className="w-8" />
                </div>

                {/* Smart Booking UI Content */}
                <div className={`p-5 md:p-6 h-full flex flex-col ${darkMode ? 'text-white' : 'text-slate-900'}`}>
                  {/* Header */}
                  <div className="mb-4">
                    <div className={`inline-flex items-center gap-1.5 ${darkMode ? 'bg-emerald-500/10 text-emerald-400' : 'bg-emerald-50 text-emerald-600'} px-2.5 py-0.5 rounded-full text-[8px] font-black uppercase tracking-widest mb-2`}>
                      <Zap size={10} className="fill-current animate-pulse" /> Smart Booking
                    </div>
                    <h3 className="text-xl md:text-2xl font-black tracking-tight mb-0.5">Plan Your Perfect Ride</h3>
                    <p className={`text-[10px] md:text-xs font-medium ${darkMode ? 'text-slate-400' : 'text-slate-500'}`}>Choose route, date, and time for a seamless electric journey.</p>
                  </div>

                  {/* Service Toggle */}
                  <div className={`flex p-1 rounded-xl mb-4 max-w-sm ${darkMode ? 'bg-slate-800' : 'bg-slate-100'}`}>
                    {['Local Ride', 'Intercity Ride', 'Airport'].map((type) => (
                      <button
                        key={type}
                        onClick={() => setActiveTab(type === 'Intercity Ride' ? 'Intercity' : type)}
                        className={`flex-1 py-2 rounded-lg text-[10px] font-black transition-all ${(activeTab === type || (activeTab === 'Intercity' && type === 'Intercity Ride'))
                          ? 'bg-gradient-to-r from-emerald-500 to-blue-600 text-white shadow-md scale-105'
                          : 'text-slate-500 hover:text-slate-700 hover:scale-105'
                          }`}
                      >
                        {type}
                      </button>
                    ))}
                  </div>

                  {/* Input Fields */}
                  <div className="space-y-3 mb-4 relative z-[60]">
                    <div className="flex flex-col gap-3">
                      <LocationPickerComponent
                        value={pickup.address}
                        onChange={(val) => setPickup({ ...pickup, address: val })}
                        onSelectLocation={(loc) => setPickup(loc)}
                        placeholder="Pickup location"
                        darkMode={darkMode}
                        inputClassName="!py-3 !rounded-xl !text-[11px] !font-bold"
                      />
                      <LocationPickerComponent
                        value={dest.address}
                        onChange={(val) => setDest({ ...dest, address: val })}
                        onSelectLocation={(loc) => setDest(loc)}
                        placeholder="Destination"
                        darkMode={darkMode}
                        inputClassName="!py-3 !rounded-xl !text-[11px] !font-bold"
                      />
                    </div>
                  </div>

                  {/* Date & Time */}
                  <div className="grid grid-cols-2 gap-3 mb-5 relative z-[50]">
                    <div className={`relative flex items-center gap-2 p-3 rounded-xl border transition-all ${darkMode ? 'bg-slate-800/50 border-slate-700' : 'bg-slate-50 border-slate-100 shadow-sm'}`}>
                      <Calendar size={16} className="text-purple-500" />
                      <input
                        type="date"
                        value={bookingDate}
                        onChange={(e) => setBookingDate(e.target.value)}
                        className="bg-transparent border-none outline-none text-[10px] font-bold text-slate-900 dark:text-white w-full cursor-pointer [color-scheme:light]"
                      />
                    </div>
                    <div className={`relative flex items-center gap-2 p-3 rounded-xl border transition-all ${darkMode ? 'bg-slate-800/50 border-slate-700' : 'bg-slate-50 border-slate-100 shadow-sm'}`}>
                      <Clock size={16} className="text-blue-500" />
                      <input
                        type="time"
                        value={bookingTime}
                        onChange={(e) => setBookingTime(e.target.value)}
                        className="bg-transparent border-none outline-none text-[10px] font-bold text-slate-900 dark:text-white w-full cursor-pointer [color-scheme:light]"
                      />
                    </div>
                  </div>

                  {/* Action Button */}
                  <button
                    onClick={handleSearch}
                    disabled={isSearching}
                    className="w-full py-4 md:py-4 rounded-[1.2rem] bg-gradient-to-r from-emerald-500 to-teal-500 text-white font-black text-xs md:text-sm shadow-lg shadow-emerald-500/20 hover:scale-[1.01] active:scale-95 transition-all flex items-center justify-center gap-2 disabled:opacity-70 mt-auto"
                  >
                    {isSearching ? (
                      <div className="flex items-center gap-2">
                        <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                        Routing...
                      </div>
                    ) : (
                      <>
                        <Car size={16} /> Search Rides Now
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
            className="md:hidden relative mx-auto w-[270px] max-w-[82vw] sm:w-[310px] z-20 group animate-float-phone"
          >
            <div className={`relative rounded-[2.35rem] p-2 shadow-[0_30px_90px_rgba(15,23,42,0.25)] border-[7px] ${darkMode ? 'bg-slate-950 border-slate-800' : 'bg-slate-950 border-slate-800'}`}>
              <div className="absolute -left-[10px] top-24 h-12 w-1.5 rounded-l-full bg-slate-800" />
              <div className="absolute -right-[10px] top-32 h-16 w-1.5 rounded-r-full bg-slate-800" />
              {/* Speaker / Notch */}
              <div className="absolute top-4 left-1/2 -translate-x-1/2 w-20 h-5 bg-slate-950 rounded-full border border-white/5 z-30" />

              {/* Screen Content */}
              <div className="aspect-[9/19.25] rounded-[1.85rem] overflow-hidden bg-slate-50 relative">
                {/* Mobile UI - Full Smart Booking Form */}
                <div className="flex h-full flex-col overflow-y-auto scrollbar-hide bg-[radial-gradient(circle_at_20%_0%,rgba(16,185,129,0.14),transparent_30%),linear-gradient(180deg,#f8fafc_0%,#ffffff_56%,#f8fafc_100%)] px-4 pb-4 pt-5">
                  {/* Status Bar */}
                  <div className="mb-3 flex h-6 items-center justify-between px-1">
                    <span className="text-[10px] font-black leading-none text-slate-900">9:41</span>
                    <div className="flex items-center gap-1.5 text-slate-900">
                      <TrendingUp size={10} strokeWidth={3} />
                      <div className="flex items-center gap-0.5">
                        <div className="h-1.5 w-3 rounded-[2px] bg-slate-900" />
                        <div className="h-1.5 w-1.5 rounded-full bg-slate-900" />
                      </div>
                    </div>
                  </div>

                  {/* Header */}
                  <div className="mb-3 shrink-0 overflow-hidden rounded-[1.35rem] bg-slate-950 p-3 text-white shadow-xl shadow-slate-900/15">
                    <div className="flex items-center gap-2.5">
                      <div className="min-w-0 flex-1">
                        <div className="mb-1.5 inline-flex items-center gap-1.5 rounded-full bg-emerald-400/15 px-2 py-0.5 text-[7px] font-black uppercase tracking-wider text-emerald-200">
                          <Zap size={9} className="fill-current" /> Smart Booking
                        </div>
                        <h4 className="text-[19px] font-black leading-[1.05] tracking-tight">
                          Plan Your Ride
                        </h4>
                        <p className="mt-1.5 max-w-[120px] text-[8.5px] font-medium leading-relaxed text-slate-300">
                          Choose route, date, and time in one clean flow.
                        </p>
                      </div>
                      <img
                        src="https://images.unsplash.com/photo-1593941707882-a5bba14938c7?q=80&w=400&auto=format&fit=crop"
                        alt="EV Car"
                        className="h-16 w-16 flex-shrink-0 rounded-[1rem] object-cover shadow-lg shadow-black/30"
                      />
                    </div>
                  </div>

                  {/* Integrated Service Toggle */}
                  <div className="mb-3 grid shrink-0 grid-cols-3 gap-1.5 rounded-[1.25rem] border border-slate-200 bg-white p-1.5 shadow-sm shadow-slate-200/70">
                    {[
                      { id: 'Local', icon: <MapPin size={13} />, label: 'Local' },
                      { id: 'Intercity', icon: <Navigation size={13} />, label: 'Intercity' },
                      { id: 'Airport', icon: <Plane size={13} />, label: 'Airport' }
                    ].map((type) => (
                      <button
                        key={type.id}
                        onClick={() => setActiveTab(type.id)}
                        className={`flex min-h-[38px] min-w-0 items-center justify-center gap-1.5 rounded-2xl px-1.5 text-[8.5px] font-extrabold transition-all ${activeTab === type.id
                            ? 'bg-slate-950 text-white shadow-md shadow-slate-900/20'
                            : 'text-slate-500 hover:bg-slate-50 hover:text-emerald-600'
                          }`}
                      >
                        <span className={`flex-shrink-0 ${activeTab === type.id ? 'text-emerald-300' : 'text-slate-400'}`}>
                          {type.icon}
                        </span>
                        <span className="truncate">{type.label}</span>
                      </button>
                    ))}
                  </div>

                  {/* Route Inputs */}
                  <div className="relative z-[60] mb-3 shrink-0 rounded-[1.35rem] border border-slate-200 bg-white p-2.5 shadow-sm shadow-slate-200/70">
                    {/* Connection Line */}
                    <div className="pointer-events-none absolute left-[24px] top-[50px] bottom-[50px] w-px border-l border-dashed border-emerald-300" />
                    
                    <div className="relative flex min-h-[52px] items-center gap-2.5">
                      <div className="flex h-7 w-7 flex-shrink-0 items-center justify-center rounded-full bg-emerald-50 text-emerald-600">
                        <div className="h-3 w-3 rounded-full border-[2.5px] border-emerald-500" />
                      </div>
                      <div className="min-w-0 flex-1">
                        <p className="mb-1 text-[8px] font-black uppercase tracking-wider text-slate-500">Pickup</p>
                        <LocationPickerComponent
                          value={pickup.address}
                          onChange={(val) => setPickup({ ...pickup, address: val })}
                          onSelectLocation={(loc) => setPickup(loc)}
                          placeholder="Enter pickup location"
                          darkMode={false}
                          compact={true}
                          naked={true}
                          inputClassName="!p-0 !h-auto !bg-transparent !text-[11px] !font-bold !text-slate-900 placeholder:!text-slate-400 border-none ring-0 focus:ring-0"
                        />
                      </div>
                      <button type="button" className="flex h-7 w-7 flex-shrink-0 items-center justify-center rounded-xl bg-slate-50 text-emerald-600 transition-colors hover:bg-emerald-50">
                        <LocateFixed size={14} />
                      </button>
                    </div>

                    <div className="relative mt-2 flex min-h-[52px] items-center gap-2.5 border-t border-slate-100 pt-2">
                      <div className="flex h-7 w-7 flex-shrink-0 items-center justify-center rounded-full bg-teal-50 text-teal-600">
                        <MapPin size={14} className="fill-current" />
                      </div>
                      <div className="min-w-0 flex-1">
                        <p className="mb-1 text-[8px] font-black uppercase tracking-wider text-slate-500">Destination</p>
                        <LocationPickerComponent
                          value={dest.address}
                          onChange={(val) => setDest({ ...dest, address: val })}
                          onSelectLocation={(loc) => setDest(loc)}
                          placeholder="Enter destination"
                          darkMode={false}
                          compact={true}
                          naked={true}
                          inputClassName="!p-0 !h-auto !bg-transparent !text-[11px] !font-bold !text-slate-900 placeholder:!text-slate-400 border-none ring-0 focus:ring-0"
                        />
                      </div>
                      <button type="button" className="flex h-7 w-7 flex-shrink-0 items-center justify-center rounded-xl bg-slate-50 text-emerald-600 transition-colors hover:bg-emerald-50">
                        <LocateFixed size={14} />
                      </button>
                    </div>
                  </div>

                  {/* Unified Date/Time Card */}
                  <div className="mb-3 grid shrink-0 grid-cols-2 gap-1.5">
                    <label className="rounded-[1rem] border border-slate-200 bg-white px-2.5 py-2 shadow-sm shadow-slate-200/70">
                      <span className="mb-1.5 flex items-center justify-between text-[7.5px] font-black uppercase tracking-wider text-slate-500">
                        Date
                        <Calendar size={12} className="text-emerald-600" />
                      </span>
                      <input
                        type="date"
                        value={bookingDate}
                        onChange={(e) => setBookingDate(e.target.value)}
                        className="w-full min-w-0 bg-transparent text-[8.5px] font-bold text-slate-900 outline-none [color-scheme:light]"
                      />
                    </label>
                    <label className="rounded-[1rem] border border-slate-200 bg-white px-2.5 py-2 shadow-sm shadow-slate-200/70">
                      <span className="mb-1.5 flex items-center justify-between text-[7.5px] font-black uppercase tracking-wider text-slate-500">
                        Time
                        <Clock size={12} className="text-emerald-600" />
                      </span>
                      <input
                        type="time"
                        value={bookingTime}
                        onChange={(e) => setBookingTime(e.target.value)}
                        className="w-full min-w-0 bg-transparent text-[8.5px] font-bold text-slate-900 outline-none [color-scheme:light]"
                      />
                    </label>
                  </div>

                  {/* Search Button */}
                  <button
                    onClick={handleSearch}
                    disabled={isSearching}
                    className="mt-auto flex w-full shrink-0 items-center justify-center gap-2 rounded-[1rem] bg-emerald-600 px-4 py-3.5 text-[11px] font-black text-white shadow-lg shadow-emerald-600/25 transition-all hover:bg-emerald-700 active:scale-[0.98] disabled:cursor-not-allowed disabled:opacity-60"
                  >
                    {isSearching ? (
                      <div className="h-3.5 w-3.5 rounded-full border-2 border-white border-t-transparent animate-spin" />
                    ) : (
                      <>
                        <Search size={16} strokeWidth={2.75} />
                        Search Rides Now
                      </>
                    )}
                  </button>
                </div>
              </div>
            </div>
          </motion.div>
        </motion.div>

        {/* Value Props Grid - Hidden in Hero Mode */}
        {!isHero && (
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
        )}
      </div>
    </>
  );

  if (isHero) return content;

  return (
    <section id="booking-section" className={`py-32 overflow-hidden relative ${darkMode ? 'bg-[#020617]' : 'bg-slate-50'}`}>
      {content}
    </section>
  );
};

export default MacBookShowcase;
