import { useEffect, useState } from 'react';
import { Star, MessageSquare, User, Quote, ArrowRight, Sparkles } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { getAllFeedback } from '../../services/feedbackService.js';
import { getImageUrl } from '../../utils/imageUrl';
import Footer from '../../components/Footer.jsx';
import SEO from '../../components/SEO.jsx';

const renderStars = (rating = 5) =>
  Array.from({ length: 5 }, (_, i) => (
    <Star
      key={i}
      size={14}
      className={i < rating ? 'fill-emerald-400 text-emerald-400' : 'text-slate-300 dark:text-slate-700'}
    />
  ));

const DEFAULT_AVATAR = '/review/image.png';

const ReviewAvatar = ({ profileImage, name }) => {
  const [showDefault, setShowDefault] = useState(!profileImage);

  return (
    <div className="flex-shrink-0 relative group">
      <div className="absolute -inset-1 bg-gradient-to-tr from-emerald-500 to-blue-500 rounded-full blur opacity-25 group-hover:opacity-50 transition duration-500"></div>
      {!showDefault && profileImage ? (
        <img
          src={getImageUrl(profileImage)}
          alt={name}
          className="relative w-12 h-12 rounded-full object-cover border-2 border-white dark:border-slate-800 shadow-lg"
          onError={() => setShowDefault(true)}
        />
      ) : (
        <div className="relative w-12 h-12 rounded-full bg-slate-100 dark:bg-slate-800 flex items-center justify-center border-2 border-white dark:border-slate-800 overflow-hidden shadow-lg">
          <User size={20} className="text-slate-400 dark:text-slate-500" />
        </div>
      )}
    </div>
  );
};

export default function ReviewsPage() {
  const navigate = useNavigate();
  const [reviews, setReviews] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let mounted = true;
    const loadReviews = async () => {
      setLoading(true);
      try {
        const response = await getAllFeedback({ page: 1, limit: 12 });
        if (mounted) {
          setReviews(response?.data?.feedback || []);
        }
      } catch {
        if (mounted) setReviews([]);
      } finally {
        if (mounted) setLoading(false);
      }
    };
    loadReviews();
    return () => { mounted = false; };
  }, []);

  const container = {
    hidden: { opacity: 0 },
    show: {
      opacity: 1,
      transition: {
        staggerChildren: 0.1
      }
    }
  };

  const item = {
    hidden: { opacity: 0, y: 20 },
    show: { opacity: 1, y: 0, transition: { duration: 0.5, ease: "easeOut" } }
  };

  return (
    <>
      <SEO
        title="Rider Reviews - Real Experiences with GoElectriQ"
        description="Discover what our community says about Jaipur's most premium electric mobility service. Read verified testimonials from GoElectriQ riders."
        keywords="GoElectriQ reviews, electric cab feedback, Jaipur taxi testimonials, premium EV ride reviews"
        url="/reviews"
      />
      <div className="min-h-screen bg-[#fafafa] dark:bg-[#020617] pt-24 md:pt-32 font-['Inter',sans-serif]">
        <section className="max-w-7xl mx-auto px-4 mb-20">
          <div className="text-center max-w-4xl mx-auto">
            <motion.div
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              className="inline-flex items-center gap-2 bg-emerald-100 dark:bg-emerald-900/30 text-emerald-700 dark:text-emerald-300 px-4 py-2 rounded-full text-[10px] font-black uppercase tracking-[0.2em] mb-8"
            >
              <Sparkles size={14} /> The Wall of Love
            </motion.div>
            <motion.h1
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="text-4xl md:text-7xl font-black text-slate-900 dark:text-white mb-8 tracking-tight leading-tight"
            >
              Real Stories. <br />
              <span className="text-transparent bg-clip-text bg-gradient-to-r from-emerald-600 to-blue-500">Exceptional Journeys.</span>
            </motion.h1>
            <motion.p
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.1 }}
              className="text-lg md:text-xl text-slate-500 dark:text-slate-400 font-medium leading-relaxed max-w-2xl mx-auto"
            >
              Join thousands of satisfied riders who have made the switch to premium, zero-emission urban mobility.
            </motion.p>
          </div>
        </section>

        <section className="max-w-7xl mx-auto px-4 pb-32">
          {loading ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
              {[1, 2, 3, 4, 5, 6].map(i => (
                <div key={i} className="h-64 rounded-[2.5rem] bg-slate-100 dark:bg-slate-900 animate-pulse border border-slate-200 dark:border-slate-800" />
              ))}
            </div>
          ) : reviews.length === 0 ? (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              className="text-center py-32 bg-white dark:bg-slate-900/50 rounded-[3.5rem] border border-dashed border-slate-200 dark:border-slate-800"
            >
              <MessageSquare size={48} className="mx-auto text-slate-300 dark:text-slate-700 mb-6" />
              <p className="text-xl font-bold text-slate-400">Our wall is waiting for your story.</p>
              <button
                onClick={() => navigate('/feedback')}
                className="mt-8 px-8 py-4 bg-emerald-600 text-white rounded-2xl font-black text-sm uppercase tracking-widest hover:scale-105 transition-transform"
              >
                Be the First to Review
              </button>
            </motion.div>
          ) : (
            <motion.div
              variants={container}
              initial="hidden"
              animate="show"
              className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8"
            >
              {reviews.map((review) => (
                <motion.article
                  key={review._id}
                  variants={item}
                  className="group relative"
                >
                  <div className="h-full p-8 md:p-10 rounded-[2.5rem] md:rounded-[3rem] bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 transition-all duration-500 hover:border-emerald-500/50 hover:shadow-2xl hover:shadow-emerald-500/5 flex flex-col relative overflow-hidden">
                    {/* Quote Icon Background */}
                    <div className="absolute -right-4 -top-4 text-slate-50 dark:text-slate-800/50 group-hover:text-emerald-50 dark:group-hover:text-emerald-900/10 transition-colors duration-500">
                      <Quote size={120} />
                    </div>

                    <div className="relative z-10">
                      <div className="flex items-center gap-1 mb-8">
                        {renderStars(review.rating || 5)}
                      </div>

                      <p className="text-lg md:text-xl text-slate-700 dark:text-slate-200 font-medium leading-relaxed mb-10 italic">
                        "{review.feedback}"
                      </p>

                      <div className="mt-auto pt-8 border-t border-slate-100 dark:border-slate-800 flex items-center gap-4">
                        <ReviewAvatar profileImage={review.profileImage} name={review.name} />
                        <div>
                          <p className="font-black text-slate-900 dark:text-white tracking-tight">{review.name}</p>
                          <p className="text-xs font-bold text-slate-400 uppercase tracking-widest">
                            Verified Rider • {new Date(review.createdAt).toLocaleDateString(undefined, { month: 'short', year: 'numeric' })}
                          </p>
                        </div>
                      </div>
                    </div>
                  </div>
                </motion.article>
              ))}
            </motion.div>
          )}

          {/* Share Experience CTA */}
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="mt-20 p-10 md:p-20 rounded-[3rem] md:rounded-[4rem] bg-gradient-to-br from-slate-900 to-slate-800 text-center relative overflow-hidden group shadow-2xl"
          >
            <div className="absolute top-0 right-0 w-[500px] h-[500px] bg-emerald-500/10 rounded-full blur-3xl -translate-y-1/2 translate-x-1/2 group-hover:scale-110 transition-transform duration-700"></div>

            <div className="relative z-10 max-w-2xl mx-auto">
              <h2 className="text-3xl md:text-5xl font-black text-white mb-6 tracking-tight">Your Voice Matters.</h2>
              <p className="text-lg md:text-xl text-slate-400 font-medium mb-12">
                Every review helps us refine the future of mobility. Shared your GoElectriQ experience today.
              </p>
              <button
                onClick={() => navigate('/feedback')}
                className="inline-flex items-center gap-3 px-10 py-5 bg-emerald-600 text-white rounded-2xl font-black text-lg transition-all hover:scale-[1.02] active:scale-[0.98] shadow-2xl hover:shadow-emerald-500/20"
              >
                Write Your Review <ArrowRight size={20} />
              </button>
            </div>
          </motion.div>
        </section>

        <Footer />
      </div>
    </>
  );
}

