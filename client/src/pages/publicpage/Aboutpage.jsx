import React from 'react';
import { motion } from 'framer-motion';
import { Link } from 'react-router-dom';
import { 
  Target, 
  Eye, 
  Zap, 
  Shield, 
  Leaf, 
  Clock, 
  Tag, 
  Headset, 
  Users, 
  MapPin, 
  ChevronRight,
  TrendingUp,
  Globe,
  Award
} from 'lucide-react';
import Footer from '../../components/Footer.jsx';
import SEO from '../../components/SEO.jsx';

const AboutUsPage = () => {
  // We can use the dark mode class from the parent or just use tailwind's dark: prefix
  // Since the body has the transition, we'll use dark: utility classes.

  const stats = [
    { label: "CO2 Saved", value: "450k+", sub: "kg of emissions", icon: <Leaf className="text-emerald-500" /> },
    { label: "Active EVs", value: "200+", sub: "Premium fleet", icon: <Zap className="text-blue-500" /> },
    { label: "Happy Riders", value: "50k+", sub: "Across the city", icon: <Users className="text-purple-500" /> },
    { label: "Availability", value: "24/7", sub: "Support & booking", icon: <Clock className="text-amber-500" /> },
  ];

  const values = [
    {
      title: "Sustainability",
      desc: "Every mile we drive is a mile driven for the planet. Our 100% electric fleet ensures zero tailpipe emissions.",
      icon: <Leaf size={32} />,
      color: "emerald"
    },
    {
      title: "Innovation",
      desc: "We leverage cutting-edge technology to make booking, tracking, and riding as seamless as possible.",
      icon: <TrendingUp size={32} />,
      color: "blue"
    },
    {
      title: "Safety",
      desc: "Your safety is our priority. Verified drivers, GPS-tracked rides, and 24/7 emergency support.",
      icon: <Shield size={32} />,
      color: "red"
    }
  ];

  const fadeIn = {
    initial: { opacity: 0, y: 20 },
    whileInView: { opacity: 1, y: 0 },
    viewport: { once: true },
    transition: { duration: 0.6 }
  };

  return (
    <>
      <SEO 
        title="About Us - Leading the Electric Mobility Revolution"
        description="Learn about GoElectric's mission to redefine urban transportation with a 100% electric fleet. Sustainable, silent, and premium mobility solutions."
        keywords="about GoElectric, electric vehicle company, sustainable transport India, green mobility mission"
        url="/about"
      />
    <div className="pt-24 md:pt-32 overflow-hidden transition-colors duration-500 dark:bg-[#020617]">
      {/* Hero Section */}
      <section className="relative px-4 mb-24 md:mb-32">
        <div className="max-w-7xl mx-auto text-center relative z-10">
          <motion.div 
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            className="inline-flex items-center gap-2 bg-emerald-500/10 text-emerald-600 px-4 py-2 rounded-full text-[10px] font-black uppercase tracking-[0.2em] mb-6"
          >
            Redefining Mobility
          </motion.div>
          <motion.h1 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
            className="text-4xl sm:text-5xl md:text-8xl font-black text-slate-900 dark:text-white mb-8 tracking-tighter"
          >
            Clean Travel. <br />
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-emerald-500 to-blue-600">Smart Future.</span>
          </motion.h1>
          <motion.p 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
            className="max-w-3xl mx-auto text-lg md:text-2xl text-slate-500 dark:text-gray-400 font-medium leading-relaxed"
          >
            Go ElectriQ is more than a cab service. We are a movement towards sustainable, quiet, and premium urban transportation.
          </motion.p>
        </div>

        {/* Decorative elements */}
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-full h-full pointer-events-none -z-10">
          <div className="absolute top-0 left-1/4 w-[500px] h-[500px] bg-emerald-500/10 rounded-full blur-[120px] animate-pulse" />
          <div className="absolute bottom-0 right-1/4 w-[500px] h-[500px] bg-blue-500/10 rounded-full blur-[120px] animate-pulse delay-700" />
        </div>
      </section>

      {/* Story Section */}
      <section className="py-24 md:py-32 relative">
        <div className="max-w-7xl mx-auto px-4">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-16 items-center">
            <motion.div {...fadeIn} className="relative group">
              <div className="relative rounded-[2rem] md:rounded-[3rem] overflow-hidden shadow-2xl">
                <img 
                  src="/car/car1.jpeg" 
                  alt="Our Fleet" 
                  className="w-full h-[300px] sm:h-[400px] md:h-[500px] object-cover transition-transform duration-700 group-hover:scale-110"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-slate-900/60 to-transparent" />
              </div>
              {/* Floating badge */}
              <div className="absolute -bottom-4 -right-4 md:-bottom-8 md:-right-8 bg-white dark:bg-slate-800 p-6 md:p-8 rounded-[1.5rem] md:rounded-[2rem] shadow-2xl border border-slate-100 dark:border-slate-700 max-w-[180px] md:max-w-[240px]">
                <div className="w-12 h-12 bg-emerald-500 rounded-2xl flex items-center justify-center text-white mb-4 shadow-lg shadow-emerald-500/20">
                  <Award size={24} />
                </div>
                <p className="text-sm font-black text-slate-900 dark:text-white leading-tight">Leading the EV Revolution in India</p>
              </div>
            </motion.div>

            <motion.div {...fadeIn} transition={{ delay: 0.2 }} className="space-y-8">
              <div>
                <h2 className="text-3xl sm:text-4xl md:text-5xl font-black text-slate-900 dark:text-white mb-6 tracking-tight">
                  Born to solve <br className="hidden sm:block" /> Urban Challenges.
                </h2>
                <div className="space-y-4 text-lg text-slate-600 dark:text-gray-400 font-medium leading-relaxed">
                  <p>
                    Founded in 2024, Go ElectriQ was born from a simple realization: urban transportation was becoming too loud, too polluted, and too inefficient.
                  </p>
                  <p>
                    We set out to create a mobility solution that doesn't just get you from A to B, but does so with a conscience. By utilizing a 100% electric fleet, we've eliminated the noise and the emissions, leaving only the comfort.
                  </p>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-6">
                <div className="p-6 rounded-3xl bg-slate-50 dark:bg-slate-800/50 border border-slate-100 dark:border-slate-700">
                  <h4 className="text-3xl font-black text-emerald-600 mb-1">0</h4>
                  <p className="text-xs font-bold text-slate-500 uppercase tracking-widest">Emissions</p>
                </div>
                <div className="p-6 rounded-3xl bg-slate-50 dark:bg-slate-800/50 border border-slate-100 dark:border-slate-700">
                  <h4 className="text-3xl font-black text-blue-600 mb-1">100%</h4>
                  <p className="text-xs font-bold text-slate-500 uppercase tracking-widest">Electric</p>
                </div>
              </div>
            </motion.div>
          </div>
        </div>
      </section>

      {/* Mission & Vision */}
      <section className="py-24 md:py-32 bg-slate-50 dark:bg-slate-900/50">
        <div className="max-w-7xl mx-auto px-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            <motion.div 
              {...fadeIn}
              className="p-12 rounded-[3rem] bg-white dark:bg-slate-800 shadow-xl border border-slate-100 dark:border-slate-700 group hover:-translate-y-2 transition-all duration-500"
            >
              <div className="w-16 h-16 bg-blue-500 rounded-2xl flex items-center justify-center text-white mb-8 shadow-lg shadow-blue-500/20 group-hover:rotate-12 transition-transform">
                <Target size={32} />
              </div>
              <h3 className="text-3xl font-black text-slate-900 dark:text-white mb-4">Our Mission</h3>
              <p className="text-lg text-slate-500 dark:text-gray-400 font-medium leading-relaxed">
                To accelerate the transition towards sustainable transportation by making electric mobility accessible, reliable, and more affordable than traditional combustion alternatives.
              </p>
            </motion.div>

            <motion.div 
              {...fadeIn}
              transition={{ delay: 0.2 }}
              className="p-12 rounded-[3rem] bg-white dark:bg-slate-800 shadow-xl border border-slate-100 dark:border-slate-700 group hover:-translate-y-2 transition-all duration-500"
            >
              <div className="w-16 h-16 bg-emerald-500 rounded-2xl flex items-center justify-center text-white mb-8 shadow-lg shadow-emerald-500/20 group-hover:-rotate-12 transition-transform">
                <Eye size={32} />
              </div>
              <h3 className="text-3xl font-black text-slate-900 dark:text-white mb-4">Our Vision</h3>
              <p className="text-lg text-slate-500 dark:text-gray-400 font-medium leading-relaxed">
                To build India's most trusted and technologically advanced electric mobility platform, creating a future where every journey contributes to a greener planet.
              </p>
            </motion.div>
          </div>
        </div>
      </section>

      {/* Core Values */}
      <section className="py-24 md:py-32">
        <div className="max-w-7xl mx-auto px-4">
          <div className="text-center mb-20">
            <h2 className="text-3xl md:text-5xl font-black text-slate-900 dark:text-white mb-6">Built on Values.</h2>
            <p className="text-lg text-slate-500 dark:text-gray-400 font-medium">The principles that guide every ride we provide.</p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {values.map((v, i) => (
              <motion.div
                key={v.title}
                {...fadeIn}
                transition={{ delay: i * 0.1 }}
                className="p-10 rounded-[3rem] glass-card border border-slate-100 dark:border-slate-800"
              >
                <div className={`w-14 h-14 rounded-2xl flex items-center justify-center mb-8 ${
                  v.color === 'emerald' ? 'bg-emerald-500/10 text-emerald-500' : 
                  v.color === 'blue' ? 'bg-blue-500/10 text-blue-500' : 'bg-red-500/10 text-red-500'
                }`}>
                  {v.icon}
                </div>
                <h4 className="text-xl font-black text-slate-900 dark:text-white mb-4">{v.title}</h4>
                <p className="text-slate-500 dark:text-gray-400 font-medium leading-relaxed">
                  {v.desc}
                </p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Stats Section */}
      <section className="py-24 md:py-32 bg-slate-900 relative overflow-hidden">
        <div className="absolute inset-0 opacity-10">
          <div className="absolute top-0 left-0 w-full h-full bg-[radial-gradient(circle_at_50%_50%,#10b981_0%,transparent_50%)]" />
        </div>
        <div className="max-w-7xl mx-auto px-4 relative z-10">
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-12">
            {stats.map((s, i) => (
              <motion.div
                key={s.label}
                initial={{ opacity: 0, scale: 0.8 }}
                whileInView={{ opacity: 1, scale: 1 }}
                viewport={{ once: true }}
                transition={{ delay: i * 0.1 }}
                className="text-center"
              >
                <div className="w-12 h-12 bg-white/10 rounded-xl flex items-center justify-center mx-auto mb-6 text-2xl">
                  {s.icon}
                </div>
                <h4 className="text-4xl md:text-5xl font-black text-white mb-2 tracking-tighter">{s.value}</h4>
                <p className="text-emerald-400 text-xs font-black uppercase tracking-widest mb-1">{s.label}</p>
                <p className="text-slate-400 text-sm font-medium">{s.sub}</p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-24 md:py-32 px-4">
        <motion.div 
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="max-w-5xl mx-auto p-8 sm:p-12 md:p-24 rounded-[3rem] md:rounded-[4rem] bg-gradient-to-br from-emerald-600 to-blue-700 text-center text-white relative overflow-hidden shadow-2xl"
        >
          {/* Shine effect */}
          <div className="absolute top-0 left-0 w-full h-full bg-gradient-to-r from-transparent via-white/10 to-transparent -translate-x-full animate-[shimmer_5s_infinite] pointer-events-none" />
          
          <div className="relative z-10">
            <h2 className="text-3xl sm:text-4xl md:text-6xl font-black mb-8 tracking-tight">Ready to Ride the Future?</h2>
            <p className="text-xl md:text-2xl text-emerald-50 font-medium mb-12 max-w-2xl mx-auto">
              Join thousands of riders who have already switched to a cleaner, quieter travel experience.
            </p>
            <div className="flex flex-col sm:flex-row items-center justify-center gap-6">
              <Link 
                to="/local-ride" 
                className="px-10 py-5 bg-white text-slate-900 rounded-2xl font-black text-sm uppercase tracking-widest shadow-xl hover:bg-slate-50 transition-all hover:-translate-y-1 flex items-center gap-2"
              >
                Book Your First Ride <ChevronRight size={18} />
              </Link>
              <Link 
                to="/contact" 
                className="px-10 py-5 bg-transparent border-2 border-white/30 text-white rounded-2xl font-black text-sm uppercase tracking-widest hover:bg-white/10 transition-all"
              >
                Contact Sales
              </Link>
            </div>
          </div>
        </motion.div>
      </section>

      <Footer />
    </div>
    </>
  );
};

export default AboutUsPage;
