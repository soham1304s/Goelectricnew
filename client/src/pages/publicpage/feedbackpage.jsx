import { Link } from 'react-router-dom';
import { MessageSquare, Star } from 'lucide-react';
import { useState, useEffect } from 'react';
import { submitFeedback, getAllFeedback } from '../../services/feedbackService.js';

export default function FeedbackPage() {
  const [formData, setFormData] = useState({
    name: '',
    mobile: '',
    feedback: ''
  });
  const [rating, setRating] = useState(0);
  const [submitted, setSubmitted] = useState(false);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [feedbackList, setFeedbackList] = useState([]);
  const [feedbackLoading, setFeedbackLoading] = useState(true);
  const [pagination, setPagination] = useState({ page: 1, pages: 1, total: 0 });

  // Fetch feedback on mount and when pagination changes
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
    setError('');
    setLoading(true);
    try {
      await submitFeedback({ ...formData, rating: rating || undefined });
      setSubmitted(true);
      setFormData({ name: '', mobile: '', feedback: '' });
      setRating(0);
      // Refresh feedback list
      fetchFeedback(1);
      setTimeout(() => setSubmitted(false), 3000);
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
  };

  const renderStars = (rating) => {
    return Array(5)
      .fill(0)
      .map((_, i) => (
        <Star
          key={i}
          size={14}
          className={i < rating ? 'fill-amber-400 text-amber-400' : 'text-gray-300'}
        />
      ));
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-emerald-50 dark:bg-gray-950">
      {/* Content */}
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8 sm:py-12">
        {/* Page Title */}
        <div className="text-center mb-8 sm:mb-12">
          <div className="w-16 h-16 sm:w-20 sm:h-20 bg-emerald-100 rounded-full flex items-center justify-center mx-auto mb-6">
            <MessageSquare className="w-8 h-8 sm:w-10 sm:h-10 text-emerald-600" />
          </div>
          <h1 className="text-2xl sm:text-3xl md:text-4xl font-bold text-gray-900 mb-4">Share Your Feedback</h1>
          <p className="text-base sm:text-lg text-[#64748b]">
            Your feedback helps us improve our services and serve you better
          </p>
        </div>

        {/* Feedback Form */}
        <div className="bg-white rounded-2xl shadow-lg p-6 sm:p-8 mb-8 border border-emerald-100">
          {submitted ? (
            <div className="text-center py-12">
              <div className="w-16 h-16 bg-emerald-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <svg className="w-8 h-8 text-emerald-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                </svg>
              </div>
              <h3 className="text-xl sm:text-2xl font-bold text-gray-900 mb-2">Thank You!</h3>
              <p className="text-[#64748b] text-sm sm:text-base">Your feedback has been submitted successfully</p>
            </div>
          ) : (
            <form onSubmit={handleSubmit} className="space-y-6">
              {error && (
                <p className="text-red-500 text-sm">{error}</p>
              )}
              {/* Rating */}
              <div>
                <label className="block text-sm font-semibold text-gray-900 mb-3">
                  Rate Your Experience
                </label>
                <div className="flex gap-2 justify-center sm:justify-start">
                  {[1, 2, 3, 4, 5].map((star) => (
                    <button
                      key={star}
                      type="button"
                      onClick={() => setRating(star)}
                      className="transition-transform hover:scale-110"
                    >
                      <Star
                        className={`w-8 h-8 sm:w-10 sm:h-10 ${
                          star <= rating
                            ? 'fill-amber-400 text-amber-400'
                            : 'text-[#E5E7EB]'
                        }`}
                      />
                    </button>
                  ))}
                </div>
              </div>

              {/* Name */}
              <div>
                <label htmlFor="name" className="block text-sm font-semibold text-gray-900 mb-2">
                  Your Name <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  id="name"
                  name="name"
                  value={formData.name}
                  onChange={handleChange}
                  required
                  className="w-full px-4 py-3 border border-emerald-100 rounded-lg focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-transparent text-sm sm:text-base"
                  placeholder="Enter your full name"
                />
              </div>

              {/* Mobile */}
              <div>
                <label htmlFor="mobile" className="block text-sm font-semibold text-gray-900 mb-2">
                  Mobile Number <span className="text-red-500">*</span>
                </label>
                <input
                  type="tel"
                  id="mobile"
                  name="mobile"
                  value={formData.mobile}
                  onChange={handleChange}
                  required
                  pattern="[0-9]{10}"
                  className="w-full px-4 py-3 border border-emerald-100 rounded-lg focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-transparent text-sm sm:text-base"
                  placeholder="Enter 10-digit mobile number"
                />
              </div>

              {/* Feedback */}
              <div>
                <label htmlFor="feedback" className="block text-sm font-semibold text-gray-900 mb-2">
                  Your Feedback <span className="text-red-500">*</span>
                </label>
                <textarea
                  id="feedback"
                  name="feedback"
                  value={formData.feedback}
                  onChange={handleChange}
                  required
                  rows={6}
                  className="w-full px-4 py-3 border border-emerald-100 rounded-lg focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-transparent resize-none text-sm sm:text-base"
                  placeholder="Share your experience, suggestions, or concerns..."
                />
              </div>

              {/* Submit Button */}
              <button
                type="submit"
                disabled={loading}
                className="w-full bg-gradient-to-r from-emerald-500 to-blue-600 text-white py-3 rounded-lg font-semibold hover:from-emerald-600 hover:to-blue-700 transition-colors text-sm sm:text-base disabled:opacity-70 disabled:cursor-not-allowed"
              >
                {loading ? 'Submitting...' : 'Submit Feedback'}
              </button>
            </form>
          )}
        </div>

        {/* Customer Feedback Section */}
        <div className="mb-8">
          <h2 className="text-2xl sm:text-3xl font-bold text-gray-900 mb-6">Recent Feedback from Customers</h2>
          
          {feedbackLoading ? (
            <div className="bg-white rounded-2xl shadow-lg p-6 sm:p-8 text-center border border-emerald-100">
              <p className="text-[#64748b]">Loading feedback...</p>
            </div>
          ) : feedbackList.length === 0 ? (
            <div className="bg-white rounded-2xl shadow-lg p-6 sm:p-8 text-center border border-emerald-100">
              <p className="text-[#64748b]">No feedback yet. Be the first to share!</p>
            </div>
          ) : (
            <div className="space-y-4">
              {feedbackList.map((item) => (
                <div key={item._id} className="bg-white rounded-xl shadow-lg p-4 sm:p-6 hover:shadow-xl transition border border-blue-100">
                  <div className="flex flex-col sm:flex-row justify-between items-start gap-3 mb-3">
                    <div className="flex-1 min-w-0">
                      <h3 className="font-bold text-gray-900 text-sm sm:text-base break-words">{item.name}</h3>
                      <p className="text-xs sm:text-sm text-[#64748b] break-all">{item.mobile}</p>
                    </div>
                    {item.rating && (
                      <div className="flex items-center gap-1 flex-shrink-0">
                        {renderStars(item.rating)}
                      </div>
                    )}
                  </div>
                  <p className="text-sm sm:text-base text-gray-900 mb-3 break-words">{item.feedback}</p>
                  <p className="text-xs text-[#64748b]">
                    {new Date(item.createdAt).toLocaleDateString()} at {new Date(item.createdAt).toLocaleTimeString()}
                  </p>
                </div>
              ))}
            </div>
          )}

          {/* Pagination */}
          {pagination.pages > 1 && (
            <div className="mt-6 flex flex-col sm:flex-row justify-between items-center gap-4 text-sm sm:text-base">
              <p className="text-[#64748b]">Total: {pagination.total} feedback</p>
              <div className="flex gap-2 flex-wrap justify-center">
                <button
                  disabled={pagination.page === 1}
                  onClick={() => fetchFeedback(pagination.page - 1)}
                  className="px-4 py-2 bg-emerald-500 text-white rounded-lg font-semibold disabled:opacity-50 disabled:cursor-not-allowed hover:bg-emerald-600 transition"
                >
                  Previous
                </button>
                <span className="px-4 py-2 text-gray-900">
                  Page {pagination.page} of {pagination.pages}
                </span>
                <button
                  disabled={pagination.page === pagination.pages}
                  onClick={() => fetchFeedback(pagination.page + 1)}
                  className="px-4 py-2 bg-blue-600 text-white rounded-lg font-semibold disabled:opacity-50 disabled:cursor-not-allowed hover:bg-blue-700 transition"
                >
                  Next
                </button>
              </div>
            </div>
          )}
        </div>

        {/* Info Cards */}
        {!submitted && (
          <div className="mt-6 sm:mt-8 grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="bg-white rounded-xl p-6 shadow-lg border border-emerald-100">
              <h3 className="text-sm sm:text-base font-semibold text-gray-900 mb-2">We Value Your Opinion</h3>
              <p className="text-xs sm:text-sm text-[#64748b]">
                Every piece of feedback helps us enhance our services and create better experiences
              </p>
            </div>

            <div className="bg-white rounded-xl p-6 shadow-lg border border-blue-100">
              <h3 className="text-sm sm:text-base font-semibold text-gray-900 mb-2">Quick Response</h3>
              <p className="text-xs sm:text-sm text-[#64748b]">
                Our team reviews all feedback and responds to concerns within 24-48 hours
              </p>
            </div>
          </div>
        )}

        {/* CTA */}
        <div className="mt-6 sm:mt-8 bg-gradient-to-r from-emerald-500 to-blue-600 rounded-2xl p-6 sm:p-8 text-center text-white shadow-lg">
          <h2 className="text-xl sm:text-2xl font-bold mb-3">Need Immediate Assistance?</h2>
          <p className="mb-6 text-white/90 text-sm sm:text-base">For urgent matters, please contact our support team directly</p>
          <Link
            to="/contact"
            className="inline-block bg-white text-emerald-700 px-6 sm:px-8 py-3 rounded-lg font-semibold hover:bg-emerald-50 transition-colors text-sm sm:text-base"
          >
            Contact Support
          </Link>
        </div>
      </div>
    </div>
  );
}
