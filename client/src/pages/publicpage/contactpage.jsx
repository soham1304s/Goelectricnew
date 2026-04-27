import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  Phone, 
  Mail, 
  MapPin, 
  ChevronDown, 
  MessageSquare, 
  Clock, 
  ArrowRight, 
  Send,
  Zap,
  Globe,
  Headset
} from 'lucide-react';
import Footer from '../../components/Footer.jsx';

const ContactPage = () => {
  const [openFaq, setOpenFaq] = useState(null);
  const [formState, setFormState] = useState('idle'); // idle, sending, success

  const contactMethods = [
    {
      title: 'Voice Support',
      value: '+91 98765 43210',
      subText: 'Available 24/7 for active rides',
      href: 'tel:+919876543210',
      icon: Phone,
      color: 'emerald'
    },
    {
      title: 'Email Queries',
      value: 'support@goelectrq.com',
      subText: 'Response within 12-24 hours',
      href: 'mailto:support@goelectrq.com',
      icon: Mail,
      color: 'blue'
    },
    {
      title: 'Headquarters',
      value: '123 Green Avenue, Jaipur',
      subText: 'Rajasthan, India - 302017',
      href: '#',
      icon: MapPin,
      color: 'purple'
    },
  ];

  const faqs = [
    {
      question: 'How do I track my electric cab?',
      answer: 'Once your booking is confirmed, you will receive a real-time tracking link via SMS and in your dashboard to monitor your driver\'s exact location.'
    },
    {
      question: 'What happens if my flight is delayed?',
      answer: 'For Airport Rides, we monitor your flight status in real-time. Your driver will adjust the pickup time automatically at no extra cost.'
    },
    {
      question: 'How are fares calculated?',
      answer: 'Our pricing is transparent and based on distance, ride type, and time. We do not have hidden surge charges during peak hours.'
    },
    {
      question: 'Can I book for someone else?',
      answer: 'Yes, you can specify the rider\'s name and contact number during the booking process so they receive all ride updates directly.'
    },
  ];

  const handleSubmit = (e) => {
    e.preventDefault();
    setFormState('sending');
    setTimeout(() => setFormState('success'), 1500);
  };

  const fadeIn = {
    initial: { opacity: 0, y: 20 },
    whileInView: { opacity: 1, y: 0 },
    viewport: { once: true },
    transition: { duration: 0.6 }
  };

  return (
    <div className="pt-24 md:pt-32 transition-colors duration-500 dark:bg-[#020617]">
      {/* Header */}
      <section className="max-w-7xl mx-auto px-4 mb-20 md:mb-32">
        <div className="text-center max-w-4xl mx-auto">
          <motion.div 
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            className="inline-flex items-center gap-2 bg-blue-500/10 text-blue-600 px-4 py-2 rounded-full text-[10px] font-black uppercase tracking-[0.2em] mb-6"
          >
            Support Center
          </motion.div>
          <motion.h1 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
            className="text-5xl md:text-7xl font-black text-slate-900 dark:text-white mb-8 tracking-tight"
          >
            We're here to <br />
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-500 to-emerald-500">Help You Move.</span>
          </motion.h1>
          <p className="text-lg md:text-xl text-slate-500 dark:text-gray-400 font-medium leading-relaxed">
            Have a question or need assistance with a ride? Our dedicated team is just a message away.
          </p>
        </div>
      </section>

      {/* Contact Grid */}
      <section className="max-w-7xl mx-auto px-4 mb-32">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          <div className="lg:col-span-2">
            <motion.div 
              {...fadeIn}
              className="p-8 md:p-12 rounded-[3rem] bg-white dark:bg-slate-800 shadow-2xl border border-slate-100 dark:border-slate-700"
            >
              <h2 className="text-3xl font-black text-slate-900 dark:text-white mb-10 tracking-tight">Send a Message</h2>
              
              <form onSubmit={handleSubmit} className="space-y-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="space-y-2">
                    <label className="text-xs font-black uppercase tracking-widest text-slate-400 ml-1">Full Name</label>
                    <input 
                      type="text" 
                      required
                      placeholder="John Doe"
                      className="w-full px-6 py-4 rounded-2xl bg-slate-50 dark:bg-slate-900/50 border border-slate-100 dark:border-slate-700 outline-none focus:border-blue-500/50 transition-all font-bold text-sm"
                    />
                  </div>
                  <div className="space-y-2">
                    <label className="text-xs font-black uppercase tracking-widest text-slate-400 ml-1">Email Address</label>
                    <input 
                      type="email" 
                      required
                      placeholder="john@example.com"
                      className="w-full px-6 py-4 rounded-2xl bg-slate-50 dark:bg-slate-900/50 border border-slate-100 dark:border-slate-700 outline-none focus:border-blue-500/50 transition-all font-bold text-sm"
                    />
                  </div>
                </div>
                <div className="space-y-2">
                  <label className="text-xs font-black uppercase tracking-widest text-slate-400 ml-1">Subject</label>
                  <select className="w-full px-6 py-4 rounded-2xl bg-slate-50 dark:bg-slate-900/50 border border-slate-100 dark:border-slate-700 outline-none focus:border-blue-500/50 transition-all font-bold text-sm appearance-none">
                    <option>General Inquiry</option>
                    <option>Booking Issue</option>
                    <option>Partner with Us</option>
                    <option>Feedback</option>
                  </select>
                </div>
                <div className="space-y-2">
                  <label className="text-xs font-black uppercase tracking-widest text-slate-400 ml-1">Message</label>
                  <textarea 
                    rows="5"
                    required
                    placeholder="How can we help you today?"
                    className="w-full px-6 py-4 rounded-2xl bg-slate-50 dark:bg-slate-900/50 border border-slate-100 dark:border-slate-700 outline-none focus:border-blue-500/50 transition-all font-bold text-sm resize-none"
                  ></textarea>
                </div>

                <button 
                  type="submit"
                  disabled={formState !== 'idle'}
                  className="w-full py-5 bg-gradient-to-r from-blue-600 to-emerald-500 text-white rounded-2xl font-black text-sm uppercase tracking-widest shadow-xl hover:shadow-blue-500/20 transition-all active:scale-95 flex items-center justify-center gap-3 disabled:opacity-70"
                >
                  {formState === 'idle' && <><Send size={18} /> Send Message</>}
                  {formState === 'sending' && <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin" />}
                  {formState === 'success' && <>Message Sent Successfully!</>}
                </button>
              </form>
            </motion.div>
          </div>

          <div className="space-y-8">
            {contactMethods.map((m, i) => {
              const Icon = m.icon;
              return (
                <motion.a
                  key={m.title}
                  href={m.href}
                  {...fadeIn}
                  transition={{ delay: i * 0.1 }}
                  className="block p-8 rounded-[2.5rem] bg-white dark:bg-slate-800 border border-slate-100 dark:border-slate-700 shadow-xl hover:-translate-y-2 transition-all duration-500 group"
                >
                  <div className={`w-14 h-14 rounded-2xl flex items-center justify-center mb-6 ${
                    m.color === 'emerald' ? 'bg-emerald-500/10 text-emerald-500' : 
                    m.color === 'blue' ? 'bg-blue-500/10 text-blue-500' : 'bg-purple-500/10 text-purple-500'
                  }`}>
                    <Icon size={24} />
                  </div>
                  <h3 className="text-sm font-black text-slate-400 uppercase tracking-[0.2em] mb-2">{m.title}</h3>
                  <p className="text-xl font-black text-slate-900 dark:text-white mb-2 tracking-tight group-hover:text-blue-500 transition-colors">{m.value}</p>
                  <p className="text-sm text-slate-500 dark:text-gray-400 font-medium">{m.subText}</p>
                </motion.a>
              );
            })}

            {/* Quick Badge */}
            <motion.div {...fadeIn} transition={{ delay: 0.4 }} className="p-8 rounded-[2.5rem] bg-gradient-to-br from-slate-900 to-slate-800 text-white relative overflow-hidden">
              <div className="absolute top-0 right-0 p-4 opacity-10">
                <Headset size={80} />
              </div>
              <h4 className="text-xl font-black mb-2">Priority Support</h4>
              <p className="text-slate-400 text-sm font-medium leading-relaxed">
                Ride related issues receive automated priority. Our team aims for resolution in under 15 minutes.
              </p>
            </motion.div>
          </div>
        </div>
      </section>

      {/* FAQ Section */}
      <section className="py-24 md:py-32 bg-slate-50 dark:bg-slate-900/50">
        <div className="max-w-4xl mx-auto px-4">
          <div className="text-center mb-16">
            <h2 className="text-3xl md:text-5xl font-black text-slate-900 dark:text-white mb-4 tracking-tight">Common Questions</h2>
            <p className="text-lg text-slate-500 dark:text-gray-400 font-medium leading-relaxed">Everything you need to know about our service.</p>
          </div>

          <div className="space-y-4">
            {faqs.map((faq, index) => {
              const isOpen = openFaq === index;
              return (
                <motion.div
                  key={index}
                  initial={false}
                  className="rounded-3xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 overflow-hidden"
                >
                  <button
                    onClick={() => setOpenFaq(isOpen ? null : index)}
                    className="flex w-full items-center justify-between p-6 text-left"
                  >
                    <span className="text-lg font-bold text-slate-900 dark:text-white">{faq.question}</span>
                    <ChevronDown
                      size={20}
                      className={`text-slate-400 transition-transform duration-300 ${isOpen ? 'rotate-180' : ''}`}
                    />
                  </button>
                  <AnimatePresence>
                    {isOpen && (
                      <motion.div
                        initial={{ height: 0, opacity: 0 }}
                        animate={{ height: 'auto', opacity: 1 }}
                        exit={{ height: 0, opacity: 0 }}
                        transition={{ duration: 0.3 }}
                      >
                        <div className="px-6 pb-6 text-slate-500 dark:text-gray-400 font-medium leading-relaxed border-t border-slate-100 dark:border-slate-700 pt-4">
                          {faq.answer}
                        </div>
                      </motion.div>
                    )}
                  </AnimatePresence>
                </motion.div>
              );
            })}
          </div>
        </div>
      </section>

      {/* Map or Global Coverage */}
      <section className="py-24 md:py-32 overflow-hidden">
        <div className="max-w-7xl mx-auto px-4 text-center">
          <motion.div {...fadeIn} className="flex flex-col items-center">
            <div className="w-20 h-20 bg-emerald-500/10 rounded-full flex items-center justify-center text-emerald-500 mb-8">
              <Globe size={40} className="animate-spin-slow" />
            </div>
            <h2 className="text-3xl md:text-5xl font-black text-slate-900 dark:text-white mb-6">Growing Every Day.</h2>
            <p className="max-w-2xl text-lg text-slate-500 dark:text-gray-400 font-medium mb-12">
              Currently revolutionizing mobility in Rajasthan, with plans to electrify cities across India by 2025.
            </p>
          </motion.div>
        </div>
      </section>

      <Footer />
    </div>
  );
};

export default ContactPage;