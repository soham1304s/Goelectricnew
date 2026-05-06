import { useEffect, useState } from 'react';
import { Star, MessageSquare, User } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { getAllFeedback } from '../../services/feedbackService.js';
import { getImageUrl } from '../../utils/imageUrl';

const renderStars = (rating = 5) =>
  Array.from({ length: 5 }, (_, i) => (
    <Star
      key={i}
      size={16}
      className={i < rating ? 'fill-amber-400 text-amber-400' : 'text-slate-300'}
    />
  ));

const DEFAULT_AVATAR = '/review/image.png';

const ReviewAvatar = ({ profileImage, name }) => {
  const [imageError, setImageError] = useState(false);
  const [showDefault, setShowDefault] = useState(!profileImage);

  return (
    <div className="flex-shrink-0">
      {!showDefault && profileImage ? (
        <img
          src={getImageUrl(profileImage)}
          alt={name}
          className="w-10 h-10 rounded-full object-cover border-2 border-slate-200 dark:border-white/10"
          onError={() => {
            setShowDefault(true);
            setImageError(true);
          }}
        />
      ) : (
        <div className="w-10 h-10 rounded-full bg-gradient-to-br from-emerald-400 to-blue-500 flex items-center justify-center border-2 border-slate-200 dark:border-white/10 overflow-hidden">
          <img
            src={DEFAULT_AVATAR}
            alt="default"
            className="w-full h-full object-cover"
            onError={() => (
              <div className="w-full h-full flex items-center justify-center">
                <User size={18} className="text-white" />
              </div>
            )}
          />
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
        const response = await getAllFeedback({ page: 1, limit: 6 });
        if (mounted) {
          setReviews(response?.data?.feedback || []);
        }
      } catch {
        if (mounted) {
          setReviews([]);
        }
      } finally {
        if (mounted) {
          setLoading(false);
        }
      }
    };

    loadReviews();

    return () => {
      mounted = false;
    };
  }, []);

  return (
    <div className="min-h-screen bg-gradient-to-b from-slate-50 via-blue-50 to-emerald-50 dark:from-gray-950 dark:via-gray-950 dark:to-gray-900">
      <section className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-12 sm:py-16">
        <div className="text-center max-w-3xl mx-auto">
          <p className="inline-flex items-center gap-2 px-4 py-1 rounded-full text-xs sm:text-sm font-semibold bg-amber-100 text-amber-700">
            <MessageSquare size={14} /> Real customer voices
          </p>
          <h1 className="mt-4 text-3xl sm:text-4xl md:text-5xl font-bold text-slate-900 dark:text-white">
            Reviews from our riders
          </h1>
          <p className="mt-4 text-sm sm:text-base text-slate-600 dark:text-slate-300">
            See what people are saying about ride quality, punctuality, and service experience.
          </p>
        </div>

        {loading ? (
          <div className="mt-10 text-center text-slate-500 dark:text-slate-300">Loading reviews...</div>
        ) : reviews.length === 0 ? (
          <div className="mt-10 rounded-2xl border border-dashed border-slate-300 dark:border-white/20 p-8 text-center text-slate-600 dark:text-slate-300">
            No reviews available yet.
          </div>
        ) : (
          <div className="mt-10 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5 sm:gap-6">
            {reviews.map((review) => (
              <article
                key={review._id}
                className="rounded-2xl bg-white/90 dark:bg-gray-900 border border-slate-200 dark:border-white/10 p-5 sm:p-6 shadow-sm hover:shadow-lg transition-shadow"
              >
                <div className="flex items-center gap-1">{renderStars(review.rating || 5)}</div>
                <p className="mt-4 text-sm text-slate-700 dark:text-slate-200 leading-relaxed">
                  "{review.feedback}"
                </p>
                <div className="mt-5 pt-4 border-t border-slate-200 dark:border-white/10">
                  <div className="flex items-center gap-3">
                    <ReviewAvatar profileImage={review.profileImage} name={review.name} />
                    
                    {/* Name and Date */}
                    <div>
                      <p className="font-semibold text-slate-900 dark:text-white">{review.name}</p>
                      <p className="text-xs text-slate-500 dark:text-slate-400">
                        {new Date(review.createdAt).toLocaleDateString()}
                      </p>
                    </div>
                  </div>
                </div>
              </article>
            ))}
          </div>
        )}

        <div className="mt-12 rounded-2xl bg-gradient-to-r from-emerald-500 to-blue-600 p-6 sm:p-8 text-center text-white shadow-lg">
          <h2 className="text-xl sm:text-2xl font-bold">Share your experience</h2>
          <p className="mt-2 text-sm sm:text-base text-white/90">
            Your feedback helps us improve every single ride.
          </p>
          <button
            type="button"
            onClick={() => navigate('/feedback')}
            className="mt-5 bg-white text-emerald-700 px-6 py-3 rounded-lg font-semibold hover:bg-emerald-50 transition"
          >
            Write a review
          </button>
        </div>
      </section>
    </div>
  );
}
