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
import SEO from '../../components/SEO.jsx';

const services = [
  {
    icon: Building2,
    title: 'Local City Ride',
    description: 'Effortless urban commuting in whisper-quiet electric comfort. Perfect for your daily office runs or city chores.',
    path: '/local-ride',
    features: ['Instant Booking', 'Zero Surge Pricing', 'Verified Captains']
  },
  {
    icon: Plane,
    title: 'Airport Transfer',
    description: 'Reliable, on-time airport transfers. We track your flight and wait for you, so you never have to worry.',
    path: '/airport',
    features: ['Flight Tracking', 'Free Waiting Time', 'Luggage Assistance']
  },
  {
    icon: Navigation,
    title: 'Intercity Ride',
    description: 'Premium long-distance travel between cities. Safe, sustainable, and surprisingly affordable in our EV fleet.',
    path: '/intercity-ride',
    features: ['Highway Specialists', 'Comfort Seats', 'Flexible Stops']
  },
  {
    icon: Palmtree,
    title: 'Tour Packages',
    description: 'Curated sightseeing experiences. Explore heritage sites and hidden gems in our eco-friendly fleet.',
    path: '/tours',
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
    <>
      <SEO 
        title="Our Services - Comprehensive Electric Mobility Solutions"
        description="Explore GoElectric's range of services including city rides, airport transfers, intercity travel, and curated tour packages. 100% electric, 100% reliable."
        keywords="electric cab services, city ride, intercity electric taxi, airport transfer service, EV tours"
        url="/services"
      />
      <div className="pt-24 md:pt-32 font-['Inter',sans-serif] transition-colors duration-500 bg-[#fafafa] dark:bg-black">
        {/* Header Section */}
        <section className="max-w-7xl mx-auto px-4 mb-16 md:mb-24">
          <div className="text-center max-w-4xl mx-auto">
            <motion.div
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              className="inline-flex items-center gap-2 bg-emerald-100 dark:bg-emerald-900/30 text-emerald-700 dark:text-emerald-300 px-4 py-2 rounded-full text-xs font-bold uppercase tracking-[0.1em] mb-6"
            >
              <MapPin size={14} /> Our Offerings
            </motion.div>
            <motion.h1
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.1 }}
              className="text-4xl md:text-6xl font-black text-slate-900 dark:text-white mb-6 tracking-tight leading-tight"
            >
              Premium Mobility, <br className="hidden md:block" />
              <span className="text-transparent bg-clip-text bg-gradient-to-r from-emerald-600 to-teal-500">100% Electric.</span>
            </motion.h1>
            <motion.p
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.2 }}
              className="text-lg md:text-xl text-slate-500 dark:text-zinc-400 font-medium leading-relaxed max-w-2xl mx-auto"
            >
              From daily commutes to luxury tours, our zero-emission fleet is at your service 24/7.
            </motion.p>
          </div>
        </section>

        {/* Services Grid */}
        <section className="max-w-7xl mx-auto px-4 mb-32">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            {services.map((service, i) => {
              const Icon = service.icon;
              return (
                <motion.div
                  key={service.title}
                  {...fadeIn}
                  transition={{ delay: i * 0.1 }}
                  className="group h-full"
                >
                  <div className="p-8 md:p-10 rounded-[2.5rem] h-full flex flex-col transition-all duration-300 border border-slate-200 dark:border-zinc-800 bg-white dark:bg-zinc-900/50 hover:border-emerald-500/50 hover:shadow-2xl hover:shadow-emerald-500/5 relative overflow-hidden">

                    {/* Background Glow on Hover */}
                    <div className="absolute top-0 right-0 w-32 h-32 bg-gradient-to-br from-emerald-500/10 to-teal-500/5 dark:from-emerald-900/20 dark:to-teal-900/10 rounded-bl-full transition-transform duration-500 translate-x-8 -translate-y-8 group-hover:translate-x-0 group-hover:translate-y-0 opacity-0 group-hover:opacity-100 -z-0"></div>

                    <div className="relative z-10 flex flex-col h-full">
                      <div className="w-16 h-16 rounded-2xl flex items-center justify-center mb-8 bg-emerald-50 dark:bg-emerald-900/20 text-emerald-600 dark:text-emerald-400 transition-transform duration-300 group-hover:scale-110">
                        <Icon size={32} />
                      </div>

                      <h2 className="text-2xl md:text-3xl font-black text-slate-900 dark:text-white mb-4 tracking-tight">
                        {service.title}
                      </h2>
                      <p className="text-base text-slate-500 dark:text-zinc-400 font-medium leading-relaxed mb-8">
                        {service.description}
                      </p>

                      <ul className="space-y-4 mb-10 mt-auto">
                        {service.features.map(f => (
                          <li key={f} className="flex items-center gap-3 text-sm font-bold text-slate-700 dark:text-zinc-300">
                            <div className="flex items-center justify-center w-5 h-5 rounded-full bg-emerald-100 dark:bg-emerald-900/30 text-emerald-600 dark:text-emerald-400">
                              <svg className="w-3 h-3" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={3}>
                                <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
                              </svg>
                            </div>
                            {f}
                          </li>
                        ))}
                      </ul>

                      <button
                        onClick={() => navigate(service.path)}
                        className="w-full inline-flex items-center justify-center gap-2 px-6 py-4 rounded-xl font-bold text-base text-white transition-all bg-emerald-600 hover:bg-emerald-700 active:scale-[0.98] shadow-sm hover:shadow-lg hover:shadow-emerald-500/20"
                      >
                        Book Now <ArrowRight size={18} />
                      </button>
                    </div>
                  </div>
                </motion.div>
              );
            })}
          </div>
        </section>

        {/* Why Go Electric Section */}
        <section className="py-24 md:py-32 bg-emerald-950 relative overflow-hidden">
          <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,rgba(52,211,153,0.08)_0%,transparent_70%)] pointer-events-none" />
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
    </>
  );
};

export default ServicesPage;
