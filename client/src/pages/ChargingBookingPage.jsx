import React, { useState, useEffect } from "react";
import {
  Star,
  ChevronDown,
  CheckCircle,
  AlertCircle,
  Moon,
  Sun,
  Zap,
  Shield,
  Banknote,
} from "lucide-react";
import { useTheme } from "../context/ThemeContext";

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

  const API_BASE_URL = import.meta.env.VITE_API_URL || '';
  const [expandedFAQ, setExpandedFAQ] = useState(null);

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

      // Prepare data for API
      const enquiryData = {
        name: formData.name.trim(),
        phone: formData.phone,
        email: formData.email.toLowerCase(),
        city: formData.city.trim(),
        enquiryType: formData.enquiryType,
        message: formData.address,
        status: 'pending'
      };

      console.log('📤 Sending enquiry to backend:', enquiryData);

      // Get token from localStorage
      const token = localStorage.getItem('token');

      // Send to backend - using guest token or allowing unauthenticated requests
      const response = await fetch(`${API_BASE_URL}/api/charging-enquiries`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          ...(token && { 'Authorization': `Bearer ${token}` })
        },
        body: JSON.stringify(enquiryData)
      });

      const result = await response.json();

      if (!response.ok) {
        throw new Error(result.message || 'Failed to submit enquiry');
      }

      console.log('✅ Enquiry submitted successfully:', result);
      alert('✅ Thank you! Your EV Charging enquiry has been received. Our team will contact you within 1 hour.');
      
      // Reset form
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
      console.error('❌ Error submitting enquiry:', error);
      alert('Error: ' + error.message + '. Please try again or call us directly.');
    } finally {
      setLoading(false);
    }
  };

  const services = [
    {
      id: "home-charging",
      name: "Home Charging Setup",
      price: "₹15,000",
      desc: "Smart 7.2kW AC charger installation for your home",
      time: "4-6 hours",
    },
    {
      id: "commercial",
      name: "Commercial Charging",
      price: "₹85,000",
      desc: "Dual-gun DC fast charging for businesses",
      time: "2-3 days",
    },
    {
      id: "maintenance",
      name: "Annual Maintenance",
      price: "₹4,999",
      desc: "Regular health checks and software updates",
      time: "Per Year",
    },
  ];

  const faqs = [
    {
      q: "What type of EV chargers do you install?",
      a: "We install AC Slow Chargers (3.3kW to 7.2kW) for homes and DC Fast Chargers (15kW to 120kW) for commercial spaces, supporting all major EV brands in India.",
    },
    {
      q: "Is my home electrical setup compatible?",
      a: "Our technicians perform a feasibility study of your existing load. We may suggest a load upgrade if you're installing a fast charger.",
    },
    {
      q: "How long does installation take?",
      a: "Home installations are typically completed within 4-6 hours. Commercial setups may take 2-3 days depending on civil work required.",
    },
    {
      q: "Do you provide government subsidy assistance?",
      a: "Yes, we help our customers with documentation required for state and central EV subsidies where applicable.",
    },
    {
      q: "Are the chargers weatherproof?",
      a: "Yes, all chargers we install are IP65/IP66 rated, making them safe for outdoor installation in all weather conditions.",
    },
  ];

  const testimonials = [
    {
      name: "Vikram Mehta",
      rating: 5,
      text: "GoElectric made my home charging setup so easy. The installation was neat and the app integration is seamless.",
      location: "Jaipur",
    },
    {
      name: "Sunita Rao",
      rating: 5,
      text: "We installed two chargers at our apartment complex. The team handled everything from wiring to society approvals.",
      location: "Delhi NCR",
    },
    {
      name: "Rahul Sharma",
      rating: 5,
      text: "Top-notch service for my hotel's guest charging station. Reliable hardware and great support.",
      location: "Udaipur",
    },
  ];

  const features = [
    {
      icon: <Zap size={32} className="text-yellow-500" />,
      title: "Fast Charging",
      desc: "Cutting-edge technology for minimum charging time",
    },
    {
      icon: <Shield size={32} className="text-emerald-500" />,
      title: "Certified Safety",
      desc: "Standard-compliant installations with surge protection",
    },
    {
      icon: <Banknote size={32} className="text-blue-500" />,
      title: "Transparent Pricing",
      desc: "No hidden costs. Detailed quotes provided upfront",
    },
    {
      icon: <CheckCircle size={32} className="text-emerald-600" />,
      title: "3-Year Warranty",
      desc: "Extended warranty on hardware and installation",
    },
  ];

  return (
    <div
      className={`${isDarkMode ? "bg-gradient-to-b from-slate-900 to-slate-800" : "bg-gradient-to-b from-slate-50 to-white"} font-sans ${isDarkMode ? "text-slate-100" : "text-slate-900"} transition-colors duration-300`}
    >
      {/* Hero Section */}
      <header
        className={`relative py-20 px-6 overflow-hidden ${isDarkMode ? "bg-gradient-to-br from-emerald-900 via-emerald-800 to-emerald-900" : "bg-gradient-to-br from-emerald-600 via-emerald-500 to-emerald-700"}`}
      >
        <div className="max-w-6xl mx-auto text-center relative z-10">
          <span
            className={`${isDarkMode ? "bg-emerald-900/60 text-emerald-200" : "bg-white/40 text-slate-900"} px-4 py-2 rounded-full text-sm font-bold uppercase tracking-wider inline-block`}
          >
            Sustainable Energy Solutions
          </span>
          <h1 className="mt-8 text-5xl md:text-6xl font-extrabold text-white leading-tight">
            Powering Your <br />Electric Journey
          </h1>
          <p
            className={`mt-6 text-xl max-w-2xl mx-auto leading-relaxed ${isDarkMode ? "text-emerald-200" : "text-emerald-100"}`}
          >
            Expert EV charging infrastructure for homes, societies, and businesses. 
            Join the green revolution with Jaipur's most trusted EV partner.
          </p>
          <div className="mt-10 flex flex-col sm:flex-row gap-4 justify-center">
            <button
              onClick={toggleModal}
              className="bg-orange-500 hover:bg-orange-600 text-white px-8 py-4 rounded-xl text-lg font-bold shadow-lg hover:shadow-2xl hover:-translate-y-1 transition-all"
            >
              Get Free Consultation
            </button>
            <button className="border-2 border-white text-white px-8 py-4 rounded-xl text-lg font-bold hover:bg-white hover:bg-opacity-10 transition-all">
              View Solutions
            </button>
          </div>
        </div>
        {/* Decorative Elements */}
        <div className="absolute top-0 right-0 w-96 h-96 bg-white opacity-5 rounded-full -mr-48 -mt-48"></div>
        <div className="absolute bottom-0 left-0 w-72 h-72 bg-white opacity-5 rounded-full -ml-36 -mb-36"></div>
      </header>

      {/* Features Section */}
      <section className="py-16 px-6 max-w-6xl mx-auto">
        <div className="grid md:grid-cols-4 gap-6">
          {features.map((feature, idx) => (
            <div
              key={idx}
              className={`${isDarkMode ? "bg-slate-800 border-slate-700 hover:border-emerald-500" : "bg-white border-slate-100 hover:border-emerald-200"} p-6 rounded-2xl shadow-md border hover:shadow-xl transition-all`}
            >
              <div className="mb-4">{feature.icon}</div>
              <h3 className="text-lg font-bold mb-2">{feature.title}</h3>
              <p className={isDarkMode ? "text-slate-400" : "text-slate-600"}>
                {feature.desc}
              </p>
            </div>
          ))}
        </div>
      </section>

      {/* How It Works */}
      <section
        className={`py-20 px-6 ${isDarkMode ? "bg-slate-700" : "bg-slate-100"}`}
      >
        <div className="max-w-6xl mx-auto">
          <h2 className="text-4xl font-bold text-center mb-16">Our Installation Process</h2>
          <div className="grid md:grid-cols-4 gap-8">
            {[
              {
                step: "1",
                title: "Site Audit",
                desc: "Technical evaluation of your electrical load",
              },
              {
                step: "2",
                title: "Quotation",
                desc: "Custom plan based on your vehicle & needs",
              },
              {
                step: "3",
                title: "Setup",
                desc: "Professional installation by certified experts",
              },
              {
                step: "4",
                title: "Handover",
                desc: "Testing, training & support documentation",
              },
            ].map((item, idx) => (
              <div key={idx} className="text-center">
                <div className="bg-emerald-600 text-white w-16 h-16 rounded-full flex items-center justify-center text-2xl font-bold mx-auto mb-4">
                  {item.step}
                </div>
                <h3 className="font-bold text-lg mb-2">{item.title}</h3>
                <p className={isDarkMode ? "text-slate-300" : "text-slate-600"}>
                  {item.desc}
                </p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Solutions & Pricing */}
      <section id="services" className="py-20 px-6 max-w-6xl mx-auto">
        <h2 className="text-4xl font-bold text-center mb-16">Tailored Charging Solutions</h2>
        <div className="grid md:grid-cols-3 gap-8">
          {services.map((service) => (
            <div
              key={service.id}
              className={`${isDarkMode ? "bg-slate-800 border-slate-600 hover:border-emerald-400" : "bg-white border-slate-200 hover:border-emerald-500"} border-2 rounded-2xl p-8 hover:shadow-xl transition-all`}
            >
              <h3 className="text-2xl font-bold mb-2">{service.name}</h3>
              <p className={isDarkMode ? "text-slate-400" : "text-slate-600"}>
                {service.desc}
              </p>
              <div
                className={`flex justify-between items-center py-4 border-y ${isDarkMode ? "border-slate-700" : "border-slate-200"} mb-4`}
              >
                <span
                  className={isDarkMode ? "text-slate-400" : "text-slate-600"}
                >
                  Typical Time:
                </span>
                <span className="font-bold">{service.time}</span>
              </div>
              <p className="text-3xl font-bold text-emerald-600 mb-6">
                Starting {service.price}
              </p>
              <button
                onClick={toggleModal}
                className="w-full bg-emerald-600 hover:bg-emerald-700 text-white font-bold py-3 rounded-xl transition-all"
              >
                Inquire Now
              </button>
            </div>
          ))}
        </div>
        <div
          className={`mt-12 ${isDarkMode ? "bg-emerald-900/30 border-emerald-700" : "bg-emerald-50 border-emerald-200"} border-2 rounded-2xl p-8`}
        >
          <div className="flex items-start gap-4">
            <AlertCircle
              className={isDarkMode ? "text-emerald-400" : "text-emerald-600"}
              size={24}
            />
            <div>
              <h3 className="font-bold text-lg mb-2">
                Why Professional Installation Matters?
              </h3>
              <p className={isDarkMode ? "text-slate-300" : "text-slate-700"}>
                EV charging involves high electrical loads. Improper wiring can lead to fire hazards or battery damage. Our certified technicians ensure 100% safety and compliance with international standards.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Testimonials */}
      <section
        id="testimonials"
        className={`py-20 px-6 ${isDarkMode ? "bg-gradient-to-br from-slate-800 to-slate-700" : "bg-gradient-to-br from-emerald-50 to-slate-50"}`}
      >
        <div className="max-w-6xl mx-auto">
          <h2 className="text-4xl font-bold text-center mb-16">
            Trusted by EV Owners
          </h2>
          <div className="grid md:grid-cols-3 gap-8">
            {testimonials.map((testimonial, idx) => (
              <div
                key={idx}
                className={`${isDarkMode ? "bg-slate-800 border-slate-700" : "bg-white border-slate-100"} rounded-2xl p-8 shadow-md border`}
              >
                <div className="flex gap-1 mb-4">
                  {[...Array(testimonial.rating)].map((_, i) => (
                    <Star
                      key={i}
                      size={20}
                      className="fill-yellow-400 text-yellow-400"
                    />
                  ))}
                </div>
                <p
                  className={`mb-4 italic ${isDarkMode ? "text-slate-300" : "text-slate-700"}`}
                >
                  "{testimonial.text}"
                </p>
                <div
                  className={`border-t ${isDarkMode ? "border-slate-700" : "border-slate-200"} pt-4`}
                >
                  <p className="font-bold">{testimonial.name}</p>
                  <p
                    className={`text-sm ${isDarkMode ? "text-slate-400" : "text-slate-600"}`}
                  >
                    {testimonial.location}
                  </p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* FAQ Section */}
      <section
        id="faq"
        className={`py-20 px-6 max-w-4xl mx-auto ${isDarkMode ? "bg-slate-800" : ""}`}
      >
        <h2 className="text-4xl font-bold text-center mb-16">
          Common Questions
        </h2>
        <div className="space-y-4">
          {faqs.map((faq, idx) => (
            <div
              key={idx}
              className={`${isDarkMode ? "bg-slate-700 border-slate-600 hover:border-emerald-400" : "bg-white border-slate-200 hover:border-emerald-300"} border rounded-xl overflow-hidden transition-all`}
            >
              <button
                onClick={() => setExpandedFAQ(expandedFAQ === idx ? null : idx)}
                className={`w-full flex items-center justify-between p-6 hover:${isDarkMode ? "bg-slate-600" : "bg-slate-50"} transition-all`}
              >
                <span className="font-bold text-lg text-left">{faq.q}</span>
                <ChevronDown
                  size={24}
                  className={`text-emerald-600 flex-shrink-0 transition-transform ${expandedFAQ === idx ? "rotate-180" : ""}`}
                />
              </button>
              {expandedFAQ === idx && (
                <div
                  className={`px-6 pb-6 ${isDarkMode ? "text-slate-300 border-slate-600" : "text-slate-600 border-slate-200"} border-t`}
                >
                  {faq.a}
                </div>
              )}
            </div>
          ))}
        </div>
      </section>

      {/* Final CTA */}
      <section
        className={`py-16 px-6 ${isDarkMode ? "bg-gradient-to-r from-emerald-900 to-emerald-800" : "bg-gradient-to-r from-emerald-600 to-emerald-700"}`}
      >
        <div className="max-w-4xl mx-auto text-center">
          <h2 className="text-3xl md:text-4xl font-bold text-white mb-6">
            Ready to Electrify Your Space?
          </h2>
          <p className={isDarkMode ? "text-emerald-200" : "text-emerald-100"}>
            Get a customized EV charging plan for your property. 
            Professional service, high-quality hardware, and 24/7 support.
          </p>
          <button
            onClick={toggleModal}
            className="mt-8 bg-orange-500 hover:bg-orange-600 text-white px-10 py-4 rounded-xl text-xl font-bold shadow-lg hover:shadow-2xl transition-all"
          >
            Start Your EV Journey
          </button>
        </div>
      </section>

      {/* Modal / Popup Form */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <div
            className="absolute inset-0 bg-slate-900/60 backdrop-blur-sm"
            onClick={toggleModal}
          ></div>
          <div
            className={`${isDarkMode ? "bg-slate-800" : "bg-white"} w-full max-w-lg rounded-3xl shadow-2xl relative z-10 overflow-hidden transform transition-all`}
          >
            <div className="bg-gradient-to-r from-emerald-600 to-emerald-700 p-8 text-white">
              <h2 className="text-3xl font-bold">Request a Quote</h2>
              <p className="opacity-90 mt-2">
                Our EV expert will contact you within 1 hour
              </p>
            </div>

            <form
              onSubmit={handleSubmit}
              className={`${isDarkMode ? "bg-slate-800" : "bg-white"} p-8 space-y-5`}
            >
              <div>
                <label className="block text-sm font-semibold mb-2">
                  Full Name *
                </label>
                <input
                  type="text"
                  id="name"
                  required
                  value={formData.name}
                  onChange={handleChange}
                  placeholder="Enter your name"
                  className={`w-full ${isDarkMode ? "bg-slate-700 border-slate-600 text-white" : "bg-slate-50 border-slate-200"} border p-3 rounded-xl focus:ring-2 focus:ring-emerald-500 outline-none transition ${errors.name ? "border-red-500" : ""}`}
                />
                {errors.name && (
                  <p className="text-red-500 text-sm mt-1">{errors.name}</p>
                )}
              </div>

              <div>
                <label className="block text-sm font-semibold mb-2">
                  Phone Number *
                </label>
                <input
                  type="tel"
                  id="phone"
                  required
                  value={formData.phone}
                  onChange={handleChange}
                  placeholder="Your 10-digit number"
                  className={`w-full ${isDarkMode ? "bg-slate-700 border-slate-600 text-white" : "bg-slate-50 border-slate-200"} border p-3 rounded-xl focus:ring-2 focus:ring-emerald-500 outline-none transition ${errors.phone ? "border-red-500" : ""}`}
                />
                {errors.phone && (
                  <p className="text-red-500 text-sm mt-1">{errors.phone}</p>
                )}
              </div>

              <div>
                <label className="block text-sm font-semibold mb-2">
                  Email Address *
                </label>
                <input
                  type="email"
                  id="email"
                  required
                  value={formData.email}
                  onChange={handleChange}
                  placeholder="your.email@example.com"
                  className={`w-full ${isDarkMode ? "bg-slate-700 border-slate-600 text-white" : "bg-slate-50 border-slate-200"} border p-3 rounded-xl focus:ring-2 focus:ring-emerald-500 outline-none transition ${errors.email ? "border-red-500" : ""}`}
                />
                {errors.email && (
                  <p className="text-red-500 text-sm mt-1">{errors.email}</p>
                )}
              </div>

              <div>
                <label className="block text-sm font-semibold mb-2">
                  City *
                </label>
                <input
                  type="text"
                  id="city"
                  required
                  value={formData.city}
                  onChange={handleChange}
                  placeholder="Your city"
                  className={`w-full ${isDarkMode ? "bg-slate-700 border-slate-600 text-white" : "bg-slate-50 border-slate-200"} border p-3 rounded-xl focus:ring-2 focus:ring-emerald-500 outline-none transition ${errors.city ? "border-red-500" : ""}`}
                />
                {errors.city && (
                  <p className="text-red-500 text-sm mt-1">{errors.city}</p>
                )}
              </div>

              <div>
                <label className="block text-sm font-semibold mb-2">
                  Enquiry Type
                </label>
                <select
                  id="enquiryType"
                  value={formData.enquiryType}
                  onChange={handleChange}
                  className={`w-full ${isDarkMode ? "bg-slate-700 border-slate-600 text-white" : "bg-slate-50 border-slate-200"} border p-3 rounded-xl focus:ring-2 focus:ring-emerald-500 outline-none transition`}
                >
                  <option value="installation">Home Installation</option>
                  <option value="commercial">Commercial/Society</option>
                  <option value="maintenance">Maintenance</option>
                  <option value="pricing">Pricing Query</option>
                  <option value="other">Other</option>
                </select>
              </div>

              <div>
                <label className="block text-sm font-semibold mb-2">
                  Requirement Details *
                </label>
                <textarea
                  id="address"
                  rows="3"
                  value={formData.address}
                  onChange={handleChange}
                  placeholder="Tell us about your vehicle model and property type"
                  className={`w-full ${isDarkMode ? "bg-slate-700 border-slate-600 text-white" : "bg-slate-50 border-slate-200"} border p-3 rounded-xl focus:ring-2 focus:ring-emerald-500 outline-none transition ${errors.address ? "border-red-500" : ""}`}
                ></textarea>
                {errors.address && (
                  <p className="text-red-500 text-sm mt-1">{errors.address}</p>
                )}
              </div>

              <button
                type="submit"
                disabled={loading}
                className="w-full bg-orange-500 hover:bg-orange-600 disabled:opacity-50 text-white font-bold py-4 rounded-xl shadow-lg shadow-orange-200 transition-all active:scale-95"
              >
                {loading ? "Submitting..." : "Send Request"}
              </button>
              <p
                className={`text-center text-sm ${isDarkMode ? "text-slate-400" : "text-slate-600"}`}
              >
                Zero-commitment consultation. We respect your privacy.
              </p>
            </form>
            <button
              onClick={toggleModal}
              className="absolute top-4 right-4 bg-white bg-opacity-20 hover:bg-opacity-30 text-white w-10 h-10 rounded-full flex items-center justify-center transition"
            >
              ✕
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

export default ChargingBookingPage;
