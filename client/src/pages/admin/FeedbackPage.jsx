import { useEffect, useMemo, useState } from 'react';
import { Search, Trash2, Eye, Star } from 'lucide-react';
import AdminLayout from './AdminLayout';
import { getAllFeedback, deleteFeedback } from '../../services/adminService';

const FeedbackPage = () => {
  const [feedback, setFeedback] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [ratingFilter, setRatingFilter] = useState('all');
  const [pagination, setPagination] = useState({ page: 1, pages: 1, total: 0 });
  const [selectedFeedback, setSelectedFeedback] = useState(null);

  const fetchFeedback = async (page = 1) => {
    try {
      const response = await getAllFeedback({ page, limit: 10 });
      setFeedback(response.data?.feedback || []);
      setPagination(response.data?.pagination || {});
    } catch (error) {
      console.error('Error fetching feedback:', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    void fetchFeedback(1);
  }, []);

  const filteredFeedback = useMemo(() => {
    let filtered = feedback.filter(
      (item) =>
        item.name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        item.mobile?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        item.feedback?.toLowerCase().includes(searchTerm.toLowerCase())
    );

    if (ratingFilter !== 'all') {
      filtered = filtered.filter((item) => item.rating === Number.parseInt(ratingFilter, 10));
    }

    return filtered;
  }, [searchTerm, ratingFilter, feedback]);

  const changePage = (page) => {
    setLoading(true);
    void fetchFeedback(page);
  };

  const handleDelete = async (id) => {
    if (window.confirm('Are you sure you want to delete this feedback?')) {
      try {
        await deleteFeedback(id);
        setLoading(true);
        await fetchFeedback(pagination.page);
      } catch (error) {
        console.error('Error deleting feedback:', error);
      }
    }
  };

  const renderStars = (rating) => {
    return Array(5)
      .fill(0)
      .map((_, i) => (
        <Star
          key={i}
          size={16}
          className={i < rating ? 'fill-yellow-400 text-yellow-400' : 'text-gray-300'}
        />
      ));
  };

  return (
    <AdminLayout>
      <div className="space-y-6">
        <h1 className="text-3xl font-bold text-gray-900 dark:text-white">Customer Feedback</h1>

        {/* Filters */}
        <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-4 md:p-6 space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-3 md:gap-4">
            <div className="relative">
              <Search className="absolute left-3 top-3 text-gray-400" size={18} />
              <input
                type="text"
                placeholder="Search by name, email, or message..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-10 pr-4 py-2 text-sm md:text-base border border-gray-300 dark:border-gray-600 rounded-lg dark:bg-gray-700 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>
            <select
              value={ratingFilter}
              onChange={(e) => setRatingFilter(e.target.value)}
              className="px-4 py-2 text-sm md:text-base border border-gray-300 dark:border-gray-600 rounded-lg dark:bg-gray-700 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              <option value="all">All Ratings</option>
              <option value="5">5 Stars</option>
              <option value="4">4 Stars</option>
              <option value="3">3 Stars</option>
              <option value="2">2 Stars</option>
              <option value="1">1 Star</option>
            </select>
          </div>
        </div>

        {/* Feedback List */}
        <div className="space-y-4">
          {loading ? (
            <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-8 text-center text-gray-500">
              Loading feedback...
            </div>
          ) : filteredFeedback.length === 0 ? (
            <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-8 text-center text-gray-500">
              No feedback found
            </div>
          ) : (
            filteredFeedback.map((item) => (
              <div
                key={item._id}
                className="bg-white dark:bg-gray-800 rounded-lg shadow p-4 md:p-6 hover:shadow-lg transition"
              >
                <div className="flex flex-col md:flex-row justify-between items-start gap-3 md:gap-4">
                  <div className="flex-1 w-full min-w-0">
                    <div className="flex flex-col sm:flex-row sm:items-center gap-1 sm:gap-2 mb-2">
                      <p className="font-bold text-gray-900 dark:text-white break-words">
                        {item.name}
                      </p>
                      <span className="text-sm text-gray-500 dark:text-gray-400 break-all">
                        ({item.mobile})
                      </span>
                    </div>
                    <div className="flex flex-wrap items-center gap-1 mb-3">
                      {renderStars(item.rating)}
                      <span className="text-xs sm:text-sm text-gray-600 dark:text-gray-400">
                        {item.rating}/5
                      </span>
                    </div>
                    <p className="text-sm md:text-base text-gray-600 dark:text-gray-300 mb-3 break-words">
                      {item.feedback}
                    </p>
                    <p className="text-xs text-gray-500 dark:text-gray-400">
                      {new Date(item.createdAt).toLocaleString()}
                    </p>
                  </div>
                  <div className="flex gap-2 flex-shrink-0">
                    <button
                      onClick={() => setSelectedFeedback(item)}
                      className="p-2 text-blue-500 hover:text-blue-700 hover:bg-blue-50 dark:hover:bg-gray-700 rounded transition"
                      title="View Details"
                    >
                      <Eye size={18} />
                    </button>
                    <button
                      onClick={() => handleDelete(item._id)}
                      className="p-2 text-red-500 hover:text-red-700 hover:bg-red-50 dark:hover:bg-gray-700 rounded transition"
                      title="Delete"
                    >
                      <Trash2 size={18} />
                    </button>
                  </div>
                </div>
              </div>
            ))
          )}
        </div>

        {/* Feedback Detail Modal */}
        {selectedFeedback && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-3 md:p-4 z-50">
            <div className="bg-white dark:bg-gray-800 rounded-lg max-w-2xl w-full p-4 md:p-6 space-y-4 max-h-[90vh] overflow-y-auto">
              <h2 className="text-xl md:text-2xl font-bold text-gray-900 dark:text-white">
                Feedback Details
              </h2>
              <div className="space-y-3 text-sm md:text-base text-gray-700 dark:text-gray-300">
                <p>
                  <strong>Name:</strong> <span className="break-words">{selectedFeedback.name}</span>
                </p>
                <p>
                  <strong>Mobile:</strong> <span className="break-all text-xs md:text-sm">{selectedFeedback.mobile}</span>
                </p>
                <div>
                  <strong>Rating:</strong>
                  <div className="flex items-center gap-1 mt-1">
                    {renderStars(selectedFeedback.rating)}
                    <span className="ml-2 text-xs md:text-sm text-gray-600 dark:text-gray-400">
                      {selectedFeedback.rating}/5
                    </span>
                  </div>
                </div>
                <div>
                  <strong>Feedback:</strong>
                  <p className="bg-gray-100 dark:bg-gray-700 p-3 rounded mt-2 break-words">
                    {selectedFeedback.feedback}
                  </p>
                </div>
                <p className="text-xs md:text-sm text-gray-500 dark:text-gray-400">
                  <strong>Submitted:</strong> {new Date(selectedFeedback.createdAt).toLocaleString()}
                </p>
              </div>
              <button
                onClick={() => setSelectedFeedback(null)}
                className="w-full bg-blue-500 hover:bg-blue-600 text-white px-4 py-2 rounded-lg transition"
              >
                Close
              </button>
            </div>
          </div>
        )}

        {/* Pagination */}
        {pagination.pages > 1 && (
          <div className="flex flex-col sm:flex-row justify-between items-center gap-3 sm:gap-4">
            <p className="text-sm md:text-base text-gray-600 dark:text-gray-400">
              Total: {pagination.total} feedback
            </p>
            <div className="flex flex-wrap items-center justify-center gap-2">
              <button
                disabled={pagination.page === 1}
                onClick={() => changePage(pagination.page - 1)}
                className="px-3 md:px-4 py-2 text-sm md:text-base bg-gray-200 dark:bg-gray-700 rounded-lg disabled:opacity-50 hover:bg-gray-300 dark:hover:bg-gray-600 transition"
              >
                Previous
              </button>
              <span className="text-xs md:text-sm text-gray-600 dark:text-gray-400 px-2">
                Page {pagination.page} of {pagination.pages}
              </span>
              <button
                disabled={pagination.page === pagination.pages}
                onClick={() => changePage(pagination.page + 1)}
                className="px-3 md:px-4 py-2 text-sm md:text-base bg-gray-200 dark:bg-gray-700 rounded-lg disabled:opacity-50 hover:bg-gray-300 dark:hover:bg-gray-600 transition"
              >
                Next
              </button>
            </div>
          </div>
        )}
      </div>
    </AdminLayout>
  );
};

export default FeedbackPage;
