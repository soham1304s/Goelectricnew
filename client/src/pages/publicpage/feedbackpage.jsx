import { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  MessageSquare, 
  Star, 
  Send, 
  CheckCircle, 
  ArrowLeft, 
  Shield, 
  Zap, 
  Clock,
  Sparkles,
  ChevronRight
} from 'lucide-react';
import { submitFeedback, getAllFeedback } from '../../services/feedbackService.js';
import Footer from '../../components/Footer.jsx';
import SEO from '../../components/SEO.jsx';

export default function FeedbackPage() {
  const navigate = useNavigate();
  const [formData, setFormData] = useState({
    name: '',
    mobile: '',
    feedback: ''
  });
  const [rating, setRating] = useState(0);
  const [hoverRating, setHoverRating] = useState(0);
  const [submitted, setSubmitted] = useState(false);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [feedbackList, setFeedbackList] = useState([]);
  const [feedbackLoading, setFeedbackLoading] = useState(true);
  const [pagination, setPagination] = useState({ page: 1, pages: 1, total: 0 });

  useEffect(() => {
    fetchFeedback(pagination.page);
  }, []);

  const fetchFeedback = async (page = 1) => {
    setFeedbackLoading(true);
    try {
      const response = await getAllFeedback({ page, limit: 10 });
      setFeedbackList(response.data?.feedback || []);
      setPagination(response.data?.pagination || {});
    } catch (err) {
      console.error('Error fetching feedback:', err);
    }
    setFeedbackLoading(false);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (rating === 0) {
      setError('Please provide a star rating');
      return;
    }
    setError('');
    setLoading(true);
    try {
      await submitFeedback({ ...formData, rating: rating || undefined });
      setSubmitted(true);
      setFormData({ name: '', mobile: '', feedback: '' });
      setRating(0);
      fetchFeedback(1);
    } catch (err) {
      setError(err?.response?.data?.message || 'Failed to submit feedback. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    });
    if (error) setError('');
  };

  const renderStars = (rating) => {
    return Array(5)
      .fill(0)
      .map((_, i) => (
        <Star
          key={i}
          size={14}
          className={i < rating ? 'fill-emerald-400 text-emerald-400' : 'text-slate-300 dark:text-slate-700'}
        />
      ));
  };

  return (
    <>
      <SEO 
        title="Share Your Feedback - GoElectriQ"
        description="Help us shape the future of electric mobility. Share your thoughts, suggestions, or concerns with the GoElectriQ team."
        keywords="GoElectriQ feedback, customer review, ride experience, electric taxi suggestions"
        url="/feedback"
      />
      <div className="min-h-screen bg-[#fafafa] dark:bg-[#020617] pt-24 md:pt-32 font-['Inter',sans-serif]">
        <div className="max-w-7xl mx-auto px-4 pb-32">
          
          <div className="grid lg:grid-cols-5 gap-16 items-start">
            
            {/* Left Column: Info & Context */}
            <div className="lg:col-span-2 space-y-12">
              <div>
                <motion.div
                  initial={{ opacity: 0, scale: 0.9 }}
                  animate={{ opacity: 1, scale: 1 }}
                  className="inline-flex items-center gap-2 bg-emerald-100 dark:bg-emerald-900/30 text-emerald-700 dark:text-emerald-300 px-4 py-2 rounded-full text-[10px] font-black uppercase tracking-[0.2em] mb-8"
                >
                  <Sparkles size={14} /> Feedback Protocol
                </motion.div>
                <motion.h1 
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="text-4xl md:text-6xl font-black text-slate-900 dark:text-white mb-8 tracking-tight leading-tight"
                >
                  Help Us <br />
                  <span className="text-transparent bg-clip-text bg-gradient-to-r from-emerald-600 to-blue-500">Refine the Future.</span>
                </motion.h1>
                <motion.p 
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.1 }}
                  className="text-lg text-slate-500 dark:text-slate-400 font-medium leading-relaxed"
                >
                  Your insights are the primary driver of our evolution. Every piece of feedback is reviewed by our core team to ensure we maintain the highest standards of excellence.
                </motion.p>
              </div>

              <div className="space-y-6">
                {[
                  { icon: Shield, title: "Verified Protocols", desc: "Every submission is authenticated to maintain community trust." },
                  { icon: Zap, title: "Rapid Response", desc: "Urgent concerns are flagged and addressed within 15 minutes." },
                  { icon: Clock, title: "Continuous Evolution", desc: "We deploy weekly updates based on aggregated user insights." }
                ].map((item, i) => (
                  <motion.div 
                    key={i}
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: 0.2 + (i * 0.1) }}
                    className="flex gap-6 p-6 rounded-3xl bg-white dark:bg-slate-900/50 border border-slate-100 dark:border-slate-800 shadow-sm"
                  >
                    <div className="w-12 h-12 rounded-2xl bg-emerald-50 dark:bg-emerald-900/20 flex items-center justify-center text-emerald-600 dark:text-emerald-400 shrink-0">
                      <item.icon size={24} />
                    </div>
                    <div>
                      <h3 className="font-black text-slate-900 dark:text-white mb-1 tracking-tight">{item.title}</h3>
                      <p className="text-sm text-slate-500 dark:text-slate-400 font-medium leading-relaxed">{item.desc}</p>
                    </div>
                  </motion.div>
                ))}
              </div>

              <motion.div 
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 0.5 }}
                className="p-8 rounded-[2.5rem] bg-slate-900 text-white relative overflow-hidden group shadow-2xl"
              >
                <div className="absolute -right-4 -top-4 w-24 h-24 bg-blue-600/20 rounded-full blur-2xl group-hover:scale-125 transition-transform duration-700" />
                <h4 className="text-xl font-black mb-4 relative z-10">Direct Priority Line</h4>
                <p className="text-slate-400 text-sm font-medium mb-6 relative z-10">For immediate assistance with an active ride, use our 24/7 hotline.</p>
                <a href="tel:+918690366601" className="inline-flex items-center gap-2 font-black text-emerald-400 hover:text-emerald-300 transition-colors relative z-10">
                  +91 86903 66601 <ChevronRight size={16} />
                </a>
              </motion.div>
            </div>

            {/* Right Column: Submission Form */}
            <div className="lg:col-span-3">
              <motion.div 
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                className="bg-white dark:bg-slate-900 rounded-[3rem] md:rounded-[4rem] p-8 md:p-16 border border-slate-200 dark:border-slate-800 shadow-2xl relative"
              >
                <AnimatePresence mode="wait">
                  {submitted ? (
                    <motion.div 
                      key="success"
                      initial={{ opacity: 0, scale: 0.9 }}
                      animate={{ opacity: 1, scale: 1 }}
                      exit={{ opacity: 0, scale: 0.9 }}
                      className="text-center py-20"
                    >
                      <div className="w-24 h-24 bg-emerald-100 dark:bg-emerald-900/30 rounded-full flex items-center justify-center mx-auto mb-8 shadow-inner shadow-emerald-500/20">
                        <CheckCircle size={48} className="text-emerald-600 dark:text-emerald-400" />
                      </div>
                      <h2 className="text-3xl md:text-5xl font-black text-slate-900 dark:text-white mb-6 tracking-tight">Transmission Received.</h2>
                      <p className="text-xl text-slate-500 dark:text-slate-400 font-medium mb-12 max-w-md mx-auto">
                        Thank you for your valuable insights. Your feedback has been prioritized for review.
                      </p>
                      <button 
                        onClick={() => setSubmitted(false)}
                        className="px-10 py-5 bg-slate-900 dark:bg-white text-white dark:text-slate-900 rounded-2xl font-black text-sm uppercase tracking-widest hover:scale-[1.02] active:scale-[0.98] transition-all"
                      >
                        Submit Another Entry
                      </button>
                    </motion.div>
                  ) : (
                    <motion.form 
                      key="form"
                      onSubmit={handleSubmit}
                      className="space-y-10"
                    >
                      {/* Rating Protocol */}
                      <div className="space-y-6">
                        <label className="block text-[10px] font-black uppercase tracking-[0.2em] text-slate-400 ml-1">
                          Performance Rating
                        </label>
                        <div className="flex gap-4">
                          {[1, 2, 3, 4, 5].map((star) => (
                            <button
                              key={star}
                              type="button"
                              onMouseEnter={() => setHoverRating(star)}
                              onMouseLeave={() => setHoverRating(0)}
                              onClick={() => setRating(star)}
                              className="relative group transition-transform active:scale-90"
                            >
                              <Star
                                size={40}
                                className={`transition-all duration-300 ${
                                  star <= (hoverRating || rating)
                                    ? 'fill-emerald-400 text-emerald-400 scale-110 drop-shadow-[0_0_8px_rgba(52,211,153,0.5)]'
                                    : 'text-slate-200 dark:text-slate-800'
                                }`}
                              />
                            </button>
                          ))}
                        </div>
                      </div>

                      <div className="grid md:grid-cols-2 gap-8">
                        <div className="space-y-3">
                          <label className="block text-[10px] font-black uppercase tracking-[0.2em] text-slate-400 ml-1">Full Name</label>
                          <input
                            type="text"
                            name="name"
                            value={formData.name}
                            onChange={handleChange}
                            required
                            className="w-full px-8 py-5 rounded-2xl bg-slate-50 dark:bg-slate-800/50 border border-slate-100 dark:border-slate-800 outline-none focus:border-emerald-500/50 transition-all font-bold text-slate-900 dark:text-white"
                            placeholder="John Doe"
                          />
                        </div>
                        <div className="space-y-3">
                          <label className="block text-[10px] font-black uppercase tracking-[0.2em] text-slate-400 ml-1">Mobile Access</label>
                          <input
                            type="tel"
                            name="mobile"
                            value={formData.mobile}
                            onChange={handleChange}
                            required
                            pattern="[0-9]{10}"
                            className="w-full px-8 py-5 rounded-2xl bg-slate-50 dark:bg-slate-800/50 border border-slate-100 dark:border-slate-800 outline-none focus:border-emerald-500/50 transition-all font-bold text-slate-900 dark:text-white"
                            placeholder="9876543210"
                          />
                        </div>
                      </div>

                      <div className="space-y-3">
                        <label className="block text-[10px] font-black uppercase tracking-[0.2em] text-slate-400 ml-1">Your Insights</label>
                        <textarea
                          name="feedback"
                          value={formData.feedback}
                          onChange={handleChange}
                          required
                          rows={6}
                          className="w-full px-8 py-6 rounded-[2rem] bg-slate-50 dark:bg-slate-800/50 border border-slate-100 dark:border-slate-800 outline-none focus:border-emerald-500/50 transition-all font-bold text-slate-900 dark:text-white resize-none"
                          placeholder="Tell us about your experience..."
                        />
                      </div>

                      {error && (
                        <motion.p 
                          initial={{ opacity: 0, y: -10 }}
                          animate={{ opacity: 1, y: 0 }}
                          className="text-rose-500 text-sm font-black uppercase tracking-wider flex items-center gap-2"
                        >
                          <Zap size={14} /> {error}
                        </motion.p>
                      )}

                      <button
                        type="submit"
                        disabled={loading}
                        className="group w-full py-6 bg-emerald-600 text-white rounded-2xl font-black text-lg uppercase tracking-widest shadow-2xl hover:shadow-emerald-500/30 transition-all active:scale-[0.98] disabled:opacity-70 flex items-center justify-center gap-3"
                      >
                        {loading ? (
                          <div className="w-6 h-6 border-4 border-white/30 border-t-white rounded-full animate-spin" />
                        ) : (
                          <>
                            Initialize Submission <Send size={20} className="transition-transform group-hover:translate-x-2 group-hover:-translate-y-1" />
                          </>
                        )}
                      </button>
                    </motion.form>
                  )}
                </AnimatePresence>
              </motion.div>
            </div>
          </div>

          {/* Recent Transmissions */}
          <div className="mt-32">
            <div className="flex flex-col md:flex-row items-center justify-between gap-6 mb-16">
              <h2 className="text-3xl md:text-5xl font-black text-slate-900 dark:text-white tracking-tight">Recent Transmissions</h2>
              <Link to="/reviews" className="inline-flex items-center gap-2 text-emerald-600 font-black uppercase tracking-widest text-sm hover:gap-4 transition-all">
                View All Reviews <ChevronRight size={18} />
              </Link>
            </div>
            
            {feedbackLoading ? (
              <div className="grid md:grid-cols-2 gap-8">
                {[1, 2].map(i => (
                  <div key={i} className="h-48 rounded-[2.5rem] bg-slate-100 dark:bg-slate-900 animate-pulse" />
                ))}
              </div>
            ) : (
              <div className="grid md:grid-cols-2 gap-8">
                {feedbackList.slice(0, 4).map((item) => (
                  <motion.div 
                    key={item._id}
                    initial={{ opacity: 0, y: 20 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    viewport={{ once: true }}
                    className="p-8 rounded-[2.5rem] bg-white dark:bg-slate-900 border border-slate-100 dark:border-slate-800 shadow-xl group hover:border-emerald-500/30 transition-all"
                  >
                    <div className="flex justify-between items-start mb-6">
                      <div className="flex items-center gap-4">
                        <div className="w-12 h-12 rounded-2xl bg-slate-50 dark:bg-slate-800 flex items-center justify-center font-black text-emerald-600 dark:text-emerald-400">
                          {item.name.charAt(0)}
                        </div>
                        <div>
                          <h3 className="font-black text-slate-900 dark:text-white tracking-tight">{item.name}</h3>
                          <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">{new Date(item.createdAt).toLocaleDateString()}</p>
                        </div>
                      </div>
                      <div className="flex gap-1">
                        {renderStars(item.rating || 5)}
                      </div>
                    </div>
                    <p className="text-slate-600 dark:text-slate-300 font-medium leading-relaxed italic">
                      "{item.feedback}"
                    </p>
                  </motion.div>
                ))}
              </div>
            )}
          </div>
        </div>
        <Footer />
      </div>
    </>
  );
}

