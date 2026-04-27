import React from 'react';
import { motion } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import { 
  Building2, 
  Plane, 
  MapPin, 
  Palmtree, 
  ArrowRight, 
  Zap, 
  Shield, 
  Clock,
  ChevronRight,
  Monitor,
  Navigation
} from 'lucide-react';
import Footer from '../../components/Footer.jsx';

const services = [
  {
    icon: Building2,
    title: 'City Ride',
    description: 'Effortless urban commuting in whisper-quiet electric comfort. Perfect for your daily office runs or city chores.',
    path: '/local-ride',
    accent: 'emerald',
    features: ['Instant Booking', 'Zero Surge Pricing', 'Verified Captains']
  },
  {
    icon: Plane,
    title: 'Airport Ride',
    description: 'Reliable, on-time airport transfers. We track your flight and wait for you, so you never have to worry.',
    path: '/airport',
    accent: 'blue',
    features: ['Flight Tracking', 'Free Waiting Time', 'Luggage Assistance']
  },
  {
    icon: Navigation,
    title: 'Intercity Ride',
    description: 'Premium long-distance travel between cities. Safe, sustainable, and surprisingly affordable.',
    path: '/intercity-ride',
    accent: 'purple',
    features: ['Highway Specialists', 'Comfort Seats', 'Flexible Stops']
  },
  {
    icon: Palmtree,
    title: 'Tour Packages',
    description: 'Curated sightseeing experiences. Explore heritage sites and hidden gems in our eco-friendly fleet.',
    path: '/tours',
    accent: 'amber',
    features: ['Guided Tours', 'Half/Full Day', 'Custom Itinerary']
  },
];

const ServicesPage = () => {
  const navigate = useNavigate();

  const fadeIn = {
    initial: { opacity: 0, y: 20 },
    whileInView: { opacity: 1, y: 0 },
    viewport: { once: true },
    transition: { duration: 0.6 }
  };

  return (
    <div className="pt-24 md:pt-32 transition-colors duration-500 dark:bg-[#020617]">
      {/* Header Section */}
      <section className="max-w-7xl mx-auto px-4 mb-20 md:mb-32">
        <div className="text-center max-w-4xl mx-auto">
          <motion.div 
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            className="inline-flex items-center gap-2 bg-emerald-500/10 text-emerald-600 px-4 py-2 rounded-full text-[10px] font-black uppercase tracking-[0.2em] mb-6"
          >
            Our Offerings
          </motion.div>
          <motion.h1 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
            className="text-5xl md:text-7xl font-black text-slate-900 dark:text-white mb-8 tracking-tight"
          >
            Premium Mobility <br />
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-emerald-500 to-blue-600">Tailored For You.</span>
          </motion.h1>
          <motion.p 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
            className="text-lg md:text-xl text-slate-500 dark:text-gray-400 font-medium leading-relaxed"
          >
            From daily commutes to luxury tours, our 100% electric fleet is at your service 24/7.
          </motion.p>
        </div>
      </section>

      {/* Services Grid */}
      <section className="max-w-7xl mx-auto px-4 mb-32">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8 lg:gap-12">
          {services.map((service, i) => {
            const Icon = service.icon;
            return (
              <motion.div
                key={service.title}
                {...fadeIn}
                transition={{ delay: i * 0.1 }}
                className="group relative"
              >
                <div className={`p-10 rounded-[3rem] h-full flex flex-col transition-all duration-500 border ${
                  service.accent === 'emerald' ? 'hover:border-emerald-500/30' : 
                  service.accent === 'blue' ? 'hover:border-blue-500/30' : 
                  service.accent === 'purple' ? 'hover:border-purple-500/30' : 'hover:border-amber-500/30'
                } bg-white dark:bg-slate-800 shadow-xl shadow-slate-200/40 dark:shadow-black/20 hover:-translate-y-2`}
              >
                  <div className={`w-16 h-16 rounded-2xl flex items-center justify-center mb-8 transition-transform duration-500 group-hover:rotate-12 ${
                    service.accent === 'emerald' ? 'bg-emerald-500/10 text-emerald-500' : 
                    service.accent === 'blue' ? 'bg-blue-500/10 text-blue-500' : 
                    service.accent === 'purple' ? 'bg-purple-500/10 text-purple-500' : 'bg-amber-500/10 text-amber-500'
                  }`}>
                    <Icon size={32} />
                  </div>

                  <h2 className="text-3xl font-black text-slate-900 dark:text-white mb-4 tracking-tight">
                    {service.title}
                  </h2>
                  <p className="text-lg text-slate-500 dark:text-gray-400 font-medium leading-relaxed mb-8">
                    {service.description}
                  </p>

                  <ul className="space-y-3 mb-10">
                    {service.features.map(f => (
                      <li key={f} className="flex items-center gap-3 text-sm font-bold text-slate-600 dark:text-slate-300">
                        <div className={`w-1.5 h-1.5 rounded-full ${
                          service.accent === 'emerald' ? 'bg-emerald-500' : 
                          service.accent === 'blue' ? 'bg-blue-500' : 
                          service.accent === 'purple' ? 'bg-purple-500' : 'bg-amber-500'
                        }`} />
                        {f}
                      </li>
                    ))}
                  </ul>

                  <button
                    onClick={() => navigate(service.path)}
                    className={`mt-auto inline-flex items-center gap-3 px-8 py-4 rounded-2xl font-black text-sm uppercase tracking-widest text-white transition-all shadow-lg ${
                      service.accent === 'emerald' ? 'bg-emerald-500 shadow-emerald-500/20' : 
                      service.accent === 'blue' ? 'bg-blue-500 shadow-blue-500/20' : 
                      service.accent === 'purple' ? 'bg-purple-500 shadow-purple-500/20' : 'bg-amber-500 shadow-amber-500/20'
                    }`}
                  >
                    Book Now <ArrowRight size={18} />
                  </button>
                </div>
              </motion.div>
            );
          })}
        </div>
      </section>

      {/* Why Go Electric Section */}
      <section className="py-24 md:py-32 bg-slate-900 relative overflow-hidden">
        <div className="max-w-7xl mx-auto px-4 relative z-10 text-center text-white">
          <motion.h2 {...fadeIn} className="text-3xl md:text-5xl font-black mb-16 tracking-tight">
            The Go ElectriQ Advantage
          </motion.h2>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-12">
            {[
              { icon: <Shield size={32} />, title: "Safety First", desc: "SOS features, verified drivers, and AI-monitored routes." },
              { icon: <Clock size={32} />, title: "On-Time Arrival", desc: "Smart dispatching ensuring a 99% punctuality rate." },
              { icon: <Zap size={32} />, title: "Zero Noise", desc: "A quiet, stress-free cabin for your thoughts or calls." }
            ].map((adv, i) => (
              <motion.div 
                key={i} 
                {...fadeIn} 
                transition={{ delay: i * 0.1 }}
                className="flex flex-col items-center"
              >
                <div className="w-16 h-16 bg-white/10 rounded-2xl flex items-center justify-center mb-6 text-emerald-400">
                  {adv.icon}
                </div>
                <h4 className="text-xl font-bold mb-3">{adv.title}</h4>
                <p className="text-slate-400 font-medium max-w-xs">{adv.desc}</p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="py-24 md:py-32 px-4">
        <motion.div 
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="max-w-5xl mx-auto p-12 md:p-24 rounded-[4rem] bg-gradient-to-br from-slate-100 to-slate-200 dark:from-slate-800 dark:to-slate-900 text-center border border-slate-200 dark:border-slate-700 shadow-2xl"
        >
          <h2 className="text-4xl md:text-6xl font-black text-slate-900 dark:text-white mb-8 tracking-tight">Need a Custom Plan?</h2>
          <p className="text-xl md:text-2xl text-slate-500 dark:text-gray-400 font-medium mb-12 max-w-2xl mx-auto">
            Contact our corporate team for bulk bookings, employee commuting, or recurring travel needs.
          </p>
          <div className="flex flex-col sm:flex-row items-center justify-center gap-6">
            <button 
              onClick={() => navigate('/contact')}
              className="px-10 py-5 bg-gradient-to-r from-emerald-500 to-blue-600 text-white rounded-2xl font-black text-sm uppercase tracking-widest shadow-xl hover:shadow-emerald-500/20 transition-all hover:-translate-y-1 flex items-center gap-2"
            >
              Contact Sales <ChevronRight size={18} />
            </button>
          </div>
        </motion.div>
      </section>

      <Footer />
    </div>
  );
};

export default ServicesPage;
