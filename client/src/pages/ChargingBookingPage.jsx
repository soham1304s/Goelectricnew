import React, { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  Star,
  ChevronDown,
  CheckCircle,
  AlertCircle,
  Zap,
  Shield,
  Banknote,
  ArrowRight,
  Sparkles,
  Search,
  MapPin,
  Clock,
  ShieldCheck,
  Building2,
  Home as HomeIcon,
  HardHat,
  Send
} from "lucide-react";
import { useTheme } from "../context/ThemeContext";
import Footer from '../components/Footer.jsx';
import SEO from '../components/SEO.jsx';

const ChargingBookingPage = () => {
  const { theme } = useTheme();
  const isDarkMode = theme === "dark";

  const [isModalOpen, setIsModalOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState({
    name: "",
    phone: "",
    email: "",
    city: "",
    address: "",
    enquiryType: "installation",
  });
  const [errors, setErrors] = useState({});
  const [expandedFAQ, setExpandedFAQ] = useState(null);

  const API_BASE_URL = import.meta.env.VITE_API_URL || '';

  const toggleModal = () => setIsModalOpen(!isModalOpen);

  const validateForm = () => {
    const newErrors = {};
    if (!formData.name.trim()) newErrors.name = "Name is required";
    if (!formData.phone.match(/^[6-9]\d{9}$/))
      newErrors.phone = "Valid 10-digit phone required";
    if (!formData.email.match(/^[^\s@]+@[^\s@]+\.[^\s@]+$/))
      newErrors.email = "Valid email is required";
    if (!formData.city.trim()) newErrors.city = "City is required";
    if (!formData.address.trim()) newErrors.address = "Address is required";
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.id]: e.target.value });
    if (errors[e.target.id]) {
      setErrors({ ...errors, [e.target.id]: "" });
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!validateForm()) return;

    try {
      setLoading(true);
      const enquiryData = {
        name: formData.name.trim(),
        phone: formData.phone,
        email: formData.email.toLowerCase(),
        city: formData.city.trim(),
        enquiryType: formData.enquiryType,
        message: formData.address,
        status: 'pending'
      };

      const token = localStorage.getItem('token');
      const response = await fetch(`${API_BASE_URL}/api/charging-enquiries`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          ...(token && { 'Authorization': `Bearer ${token}` })
        },
        body: JSON.stringify(enquiryData)
      });

      const result = await response.json();
      if (!response.ok) throw new Error(result.message || 'Failed to submit enquiry');

      alert('✅ Thank you! Your EV Charging enquiry has been received. Our team will contact you within 1 hour.');
      setFormData({
        name: "",
        phone: "",
        email: "",
        city: "",
        address: "",
        enquiryType: "installation",
      });
      setIsModalOpen(false);
    } catch (error) {
      alert('Error: ' + error.message);
    } finally {
      setLoading(false);
    }
  };

  const services = [
    {
      id: "home-charging",
      name: "Home Charging Protocol",
      price: "₹15,000",
      desc: "Smart 7.2kW AC infrastructure designed for residential seamless integration.",
      time: "4-6 hours",
      icon: HomeIcon,
      features: ["Smart Load Balancing", "App Integration", "Safety Fuse System"]
    },
    {
      id: "commercial",
      name: "Commercial Infrastructure",
      price: "₹85,000",
      desc: "High-capacity DC fast charging systems for enterprise and business fleets.",
      time: "2-3 days",
      icon: Building2,
      features: ["Dual-Gun Charging", "CMS Integration", "Revenue Management"]
    },
    {
      id: "maintenance",
      name: "Protocol Maintenance",
      price: "₹4,999",
      desc: "Continuous health monitoring and regular preventative software updates.",
      time: "Per Year",
      icon: ShieldCheck,
      features: ["24/7 Monitoring", "Remote Diagnostics", "Hardware Health Checks"]
    },
  ];

  const processSteps = [
    { step: "01", title: "Site Audit", desc: "Technical load evaluation and feasibility study.", icon: MapPin },
    { step: "02", title: "Custom Quote", desc: "Hardware selection and infrastructure planning.", icon: Banknote },
    { step: "03", title: "Deployment", desc: "Expert installation by certified EV engineers.", icon: HardHat },
    { step: "04", title: "Activation", desc: "Protocol testing, handover, and training.", icon: Zap },
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
        title="EV Charging Infrastructure - GoElectriQ Power Hub"
        description="Jaipur's leading EV charging installation service. Professional AC/DC charger setup for homes, societies, and businesses."
        keywords="EV charger installation Jaipur, electric vehicle charging station, home EV charger, commercial charging infrastructure"
        url="/charging"
      />
      <div className="min-h-screen bg-[#fafafa] dark:bg-[#020617] pt-24 md:pt-32 font-['Inter',sans-serif] overflow-hidden">
        
        {/* Hero Section */}
        <section className="max-w-7xl mx-auto px-4 mb-24 md:mb-32">
          <div className="relative rounded-[3rem] md:rounded-[4rem] overflow-hidden bg-slate-900 p-8 md:p-20 text-center text-white">
            <div className="absolute top-0 right-0 w-full h-full opacity-20 pointer-events-none">
              <div className="absolute top-0 right-0 w-[800px] h-[800px] bg-emerald-500/30 rounded-full blur-[120px] -translate-y-1/2 translate-x-1/2"></div>
              <div className="absolute bottom-0 left-0 w-[600px] h-[600px] bg-blue-500/20 rounded-full blur-[100px] translate-y-1/2 -translate-x-1/2"></div>
            </div>

            <div className="relative z-10 max-w-4xl mx-auto">
              <motion.div
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                className="inline-flex items-center gap-2 bg-emerald-500/10 text-emerald-400 px-4 py-2 rounded-full text-[10px] font-black uppercase tracking-[0.2em] mb-8 border border-emerald-500/20"
              >
                <Sparkles size={14} /> Power Infrastructure
              </motion.div>
              <motion.h1
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                className="text-4xl md:text-7xl font-black mb-8 tracking-tight leading-tight"
              >
                Electrifying the <br />
                <span className="text-transparent bg-clip-text bg-gradient-to-r from-emerald-400 to-blue-400">Future of Energy.</span>
              </motion.h1>
              <motion.p
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.1 }}
                className="text-lg md:text-xl text-slate-400 font-medium leading-relaxed max-w-2xl mx-auto mb-12"
              >
                Comprehensive EV charging solutions for residential and commercial spaces. Engineered for performance, safety, and reliability.
              </motion.p>
              
              <div className="flex flex-col sm:flex-row gap-4 justify-center items-center">
                <button
                  onClick={toggleModal}
                  className="px-10 py-5 bg-emerald-600 text-white rounded-2xl font-black text-lg transition-all hover:scale-[1.02] active:scale-[0.98] shadow-2xl shadow-emerald-500/20 flex items-center gap-3"
                >
                  Request Consultation <ArrowRight size={20} />
                </button>
                <a href="#services" className="px-10 py-5 bg-white/10 text-white rounded-2xl font-black text-lg transition-all hover:bg-white/20">
                  Explore Solutions
                </a>
              </div>
            </div>
          </div>
        </section>

        {/* Deployment Process */}
        <section className="max-w-7xl mx-auto px-4 mb-32">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
            {processSteps.map((s, i) => (
              <motion.div
                key={i}
                {...fadeIn}
                transition={{ delay: i * 0.1 }}
                className="p-8 rounded-[2.5rem] bg-white dark:bg-slate-900 border border-slate-100 dark:border-slate-800 shadow-sm relative group"
              >
                <div className="text-4xl font-black text-slate-100 dark:text-slate-800 absolute right-8 top-8 transition-colors group-hover:text-emerald-500/10">
                  {s.step}
                </div>
                <div className="w-14 h-14 rounded-2xl bg-emerald-50 dark:bg-emerald-900/20 flex items-center justify-center text-emerald-600 dark:text-emerald-400 mb-8 transition-transform group-hover:scale-110">
                  <s.icon size={28} />
                </div>
                <h3 className="text-xl font-black text-slate-900 dark:text-white mb-4 tracking-tight">{s.title}</h3>
                <p className="text-sm text-slate-500 dark:text-slate-400 font-medium leading-relaxed">{s.desc}</p>
              </motion.div>
            ))}
          </div>
        </section>

        {/* Solutions Grid */}
        <section id="services" className="max-w-7xl mx-auto px-4 mb-32">
          <div className="text-center mb-16">
            <h2 className="text-3xl md:text-5xl font-black text-slate-900 dark:text-white mb-6 tracking-tight">Deployment Protocols</h2>
            <p className="text-lg text-slate-500 dark:text-slate-400 font-medium max-w-2xl mx-auto">Standardized infrastructure packages tailored for every environment.</p>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            {services.map((s, i) => (
              <motion.div
                key={s.id}
                {...fadeIn}
                transition={{ delay: i * 0.1 }}
                className="group p-8 md:p-12 rounded-[3rem] bg-white dark:bg-slate-900 border border-slate-100 dark:border-slate-800 hover:border-emerald-500/30 transition-all duration-500 shadow-xl hover:shadow-2xl hover:shadow-emerald-500/5 flex flex-col h-full"
              >
                <div className="w-16 h-16 rounded-2xl bg-slate-50 dark:bg-slate-800 flex items-center justify-center text-emerald-600 dark:text-emerald-400 mb-10 group-hover:scale-110 transition-transform">
                  <s.icon size={32} />
                </div>
                <h3 className="text-2xl font-black text-slate-900 dark:text-white mb-4 tracking-tight">{s.name}</h3>
                <p className="text-slate-500 dark:text-slate-400 font-medium mb-10 leading-relaxed">{s.desc}</p>
                
                <ul className="space-y-4 mb-12 flex-grow">
                  {s.features.map(f => (
                    <li key={f} className="flex items-center gap-3 text-sm font-bold text-slate-700 dark:text-slate-300">
                      <div className="w-5 h-5 rounded-full bg-emerald-100 dark:bg-emerald-900/30 text-emerald-600 dark:text-emerald-400 flex items-center justify-center shrink-0">
                        <CheckCircle size={12} strokeWidth={3} />
                      </div>
                      {f}
                    </li>
                  ))}
                </ul>

                <div className="pt-8 border-t border-slate-100 dark:border-slate-800 flex flex-col gap-6">
                  <div className="flex items-center justify-between">
                    <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Protocol Cost</span>
                    <span className="text-2xl font-black text-emerald-600 dark:text-emerald-400">{s.price}</span>
                  </div>
                  <button
                    onClick={toggleModal}
                    className="w-full py-4 bg-slate-900 dark:bg-white text-white dark:text-slate-900 rounded-2xl font-black text-sm uppercase tracking-widest hover:scale-[1.02] active:scale-[0.98] transition-all"
                  >
                    Initiate Setup
                  </button>
                </div>
              </motion.div>
            ))}
          </div>
        </section>

        {/* Safety Protocol Info */}
        <section className="max-w-5xl mx-auto px-4 mb-32">
          <motion.div 
            {...fadeIn}
            className="p-8 md:p-12 rounded-[2.5rem] bg-emerald-50 dark:bg-emerald-900/10 border border-emerald-100 dark:border-emerald-500/20 flex flex-col md:flex-row gap-8 items-center"
          >
            <div className="w-20 h-20 rounded-3xl bg-emerald-600 text-white flex items-center justify-center shadow-xl shadow-emerald-500/20 shrink-0">
              <Shield size={40} />
            </div>
            <div>
              <h3 className="text-2xl font-black text-slate-900 dark:text-white mb-2 tracking-tight">The Safety Standard</h3>
              <p className="text-slate-600 dark:text-emerald-200/60 font-medium leading-relaxed">
                Professional installation is non-negotiable for high-load EV systems. Our certified engineers ensure every deployment meets IP66 standards with integrated surge protection and dedicated grounding protocols.
              </p>
            </div>
          </motion.div>
        </section>

        {/* FAQ Section */}
        <section className="max-w-4xl mx-auto px-4 mb-32">
          <div className="text-center mb-16">
            <h2 className="text-3xl font-black text-slate-900 dark:text-white mb-4 tracking-tight">Technical Intelligence</h2>
            <p className="text-slate-500 font-medium">Common queries regarding our power infrastructure.</p>
          </div>

          <div className="space-y-4">
            {[
              { q: "Standard deployment time?", a: "Residential setups are completed within 4-6 hours. Enterprise/Society deployments typically range from 48-72 hours based on civil requirements." },
              { q: "Hardware Compatibility?", a: "Our protocols support all major CCS2 and Type 2 vehicles including Tata, MG, BYD, and Hyundai fleets." },
              { q: "Weatherproof Standards?", a: "All GoElectriQ infrastructure is IP66 rated for complete outdoor resilience against rain and dust." },
              { q: "Post-Deployment Support?", a: "We provide 24/7 remote diagnostics and 24-hour on-site resolution guarantees for all maintenance protocol subscribers." }
            ].map((faq, idx) => (
              <div
                key={idx}
                className="rounded-3xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 overflow-hidden transition-all hover:border-emerald-500/30"
              >
                <button
                  onClick={() => setExpandedFAQ(expandedFAQ === idx ? null : idx)}
                  className="w-full flex items-center justify-between p-6 text-left"
                >
                  <span className="font-bold text-slate-900 dark:text-white">{faq.q}</span>
                  <ChevronDown
                    size={20}
                    className={`text-slate-400 transition-transform duration-300 ${expandedFAQ === idx ? "rotate-180" : ""}`}
                  />
                </button>
                <AnimatePresence>
                  {expandedFAQ === idx && (
                    <motion.div
                      initial={{ height: 0, opacity: 0 }}
                      animate={{ height: "auto", opacity: 1 }}
                      exit={{ height: 0, opacity: 0 }}
                      className="px-6 pb-6 text-slate-500 dark:text-slate-400 font-medium leading-relaxed border-t border-slate-50 dark:border-slate-800 pt-4"
                    >
                      {faq.a}
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>
            ))}
          </div>
        </section>

        {/* Modal / Request Form */}
        <AnimatePresence>
          {isModalOpen && (
            <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                className="absolute inset-0 bg-slate-900/60 backdrop-blur-sm"
                onClick={toggleModal}
              ></motion.div>
              <motion.div
                initial={{ opacity: 0, scale: 0.9, y: 20 }}
                animate={{ opacity: 1, scale: 1, y: 0 }}
                exit={{ opacity: 0, scale: 0.9, y: 20 }}
                className="bg-white dark:bg-slate-900 w-full max-w-lg rounded-[3rem] shadow-2xl relative z-10 overflow-hidden"
              >
                <div className="bg-slate-900 p-8 md:p-10 text-white relative">
                  <div className="absolute top-0 right-0 p-4">
                    <button onClick={toggleModal} className="w-10 h-10 rounded-full bg-white/10 flex items-center justify-center hover:bg-white/20 transition-colors">
                      <ChevronDown size={24} className="rotate-90" />
                    </button>
                  </div>
                  <h2 className="text-3xl font-black mb-2 tracking-tight">Initiate Inquiry</h2>
                  <p className="text-slate-400 font-medium">An EV expert will contact you within 60 minutes.</p>
                </div>

                <form onSubmit={handleSubmit} className="p-8 md:p-10 space-y-6 max-h-[70vh] overflow-y-auto custom-scrollbar">
                  <div className="space-y-4">
                    <div className="space-y-2">
                      <label className="text-[10px] font-black uppercase tracking-widest text-slate-400 ml-1">Full Name</label>
                      <input
                        type="text"
                        id="name"
                        value={formData.name}
                        onChange={handleChange}
                        placeholder="John Doe"
                        className="w-full px-6 py-4 rounded-2xl bg-slate-50 dark:bg-slate-800 border border-slate-100 dark:border-slate-800 outline-none focus:border-emerald-500/50 transition-all font-bold text-slate-900 dark:text-white"
                      />
                      {errors.name && <p className="text-rose-500 text-[10px] font-bold ml-1">{errors.name}</p>}
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div className="space-y-2">
                        <label className="text-[10px] font-black uppercase tracking-widest text-slate-400 ml-1">Phone</label>
                        <input
                          type="tel"
                          id="phone"
                          value={formData.phone}
                          onChange={handleChange}
                          placeholder="9876543210"
                          className="w-full px-6 py-4 rounded-2xl bg-slate-50 dark:bg-slate-800 border border-slate-100 dark:border-slate-800 outline-none focus:border-emerald-500/50 transition-all font-bold text-slate-900 dark:text-white"
                        />
                      </div>
                      <div className="space-y-2">
                        <label className="text-[10px] font-black uppercase tracking-widest text-slate-400 ml-1">Email</label>
                        <input
                          type="email"
                          id="email"
                          value={formData.email}
                          onChange={handleChange}
                          placeholder="john@example.com"
                          className="w-full px-6 py-4 rounded-2xl bg-slate-50 dark:bg-slate-800 border border-slate-100 dark:border-slate-800 outline-none focus:border-emerald-500/50 transition-all font-bold text-slate-900 dark:text-white"
                        />
                      </div>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div className="space-y-2">
                        <label className="text-[10px] font-black uppercase tracking-widest text-slate-400 ml-1">City</label>
                        <input
                          type="text"
                          id="city"
                          value={formData.city}
                          onChange={handleChange}
                          placeholder="Jaipur"
                          className="w-full px-6 py-4 rounded-2xl bg-slate-50 dark:bg-slate-800 border border-slate-100 dark:border-slate-800 outline-none focus:border-emerald-500/50 transition-all font-bold text-slate-900 dark:text-white"
                        />
                      </div>
                      <div className="space-y-2">
                        <label className="text-[10px] font-black uppercase tracking-widest text-slate-400 ml-1">Protocol Type</label>
                        <select
                          id="enquiryType"
                          value={formData.enquiryType}
                          onChange={handleChange}
                          className="w-full px-6 py-4 rounded-2xl bg-slate-50 dark:bg-slate-800 border border-slate-100 dark:border-slate-800 outline-none focus:border-emerald-500/50 transition-all font-bold text-slate-900 dark:text-white appearance-none"
                        >
                          <option value="installation">Home Installation</option>
                          <option value="commercial">Commercial/Enterprise</option>
                          <option value="maintenance">Maintenance Service</option>
                        </select>
                      </div>
                    </div>

                    <div className="space-y-2">
                      <label className="text-[10px] font-black uppercase tracking-widest text-slate-400 ml-1">Requirement Details</label>
                      <textarea
                        id="address"
                        rows="3"
                        value={formData.address}
                        onChange={handleChange}
                        placeholder="Tell us about your property type and vehicle..."
                        className="w-full px-6 py-4 rounded-2xl bg-slate-50 dark:bg-slate-800 border border-slate-100 dark:border-slate-800 outline-none focus:border-emerald-500/50 transition-all font-bold text-slate-900 dark:text-white resize-none"
                      ></textarea>
                    </div>
                  </div>

                  <button
                    type="submit"
                    disabled={loading}
                    className="w-full py-5 bg-emerald-600 text-white rounded-2xl font-black text-lg uppercase tracking-widest shadow-2xl shadow-emerald-500/20 hover:scale-[1.02] active:scale-[0.98] transition-all flex items-center justify-center gap-3"
                  >
                    {loading ? <div className="w-6 h-6 border-4 border-white/30 border-t-white rounded-full animate-spin" /> : <>Submit Protocol <Send size={18} /></>}
                  </button>
                </form>
              </motion.div>
            </div>
          )}
        </AnimatePresence>

        <Footer />
      </div>
    </>
  );
};

export default ChargingBookingPage;
