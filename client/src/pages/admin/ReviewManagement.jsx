import React, { useState, useEffect } from 'react';
import { feedbackService } from '../../services/feedbackService';
import { 
  Star, 
  CheckCircle, 
  XCircle, 
  Trash2, 
  User, 
  Clock, 
  MessageSquare,
  Layout,
  RefreshCw,
  Search,
  Check,
  X,
  Plus,
  Send
} from 'lucide-react';
import { toast } from 'react-hot-toast';
import AdminLayout from './AdminLayout';

const ReviewManagement = () => {
  const [feedbacks, setFeedbacks] = useState([]);
  const [loading, setLoading] = useState(true);
  const [pagination, setPagination] = useState({ page: 1, pages: 1 });
  const [activeTab, setActiveTab] = useState('all'); // all, pending, approved
  
  // Manual Add Modal State
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [newReview, setNewReview] = useState({
    name: '',
    mobile: '',
    feedback: '',
    rating: 5,
    userType: 'customer',
    isApproved: true,
    showOnHome: true
  });

  useEffect(() => {
    fetchFeedbacks();
  }, [pagination.page]);

  const fetchFeedbacks = async () => {
    try {
      setLoading(true);
      const res = await feedbackService.getAllFeedback(pagination.page);
      if (res.success) {
        setFeedbacks(res.data.feedback);
        setPagination(res.data.pagination);
      }
    } catch (error) {
      toast.error('Failed to fetch feedback');
    } finally {
      setLoading(false);
    }
  };

  const handleStatusUpdate = async (id, statusData) => {
    try {
      const res = await feedbackService.updateFeedbackStatus(id, statusData);
      if (res.success) {
        toast.success('Review updated');
        setFeedbacks(feedbacks.map(fb => fb._id === id ? { ...fb, ...statusData } : fb));
      }
    } catch (error) {
      toast.error('Update failed');
    }
  };

  const handleDelete = async (id) => {
    if (!window.confirm('Are you sure you want to delete this review?')) return;
    try {
      const res = await feedbackService.deleteFeedback(id);
      if (res.success) {
        toast.success('Review deleted');
        setFeedbacks(feedbacks.filter(fb => fb._id !== id));
      }
    } catch (error) {
      toast.error('Delete failed');
    }
  };

  const handleManualAdd = async (e) => {
    e.preventDefault();
    try {
      setIsSubmitting(true);
      const res = await feedbackService.submitFeedback(newReview);
      if (res.success) {
        toast.success('Review added successfully');
        setIsModalOpen(false);
        setNewReview({
          name: '',
          mobile: '',
          feedback: '',
          rating: 5,
          userType: 'customer',
          isApproved: true,
          showOnHome: true
        });
        fetchFeedbacks();
      }
    } catch (error) {
      toast.error(error.message || 'Failed to add review');
    } finally {
      setIsSubmitting(false);
    }
  };

  const filteredFeedbacks = feedbacks.filter(fb => {
    if (activeTab === 'pending') return !fb.isApproved;
    if (activeTab === 'approved') return fb.isApproved;
    return true;
  });

  return (
    <AdminLayout>
      <div className="p-4 md:p-8 bg-slate-50 dark:bg-black min-h-screen">
        <div className="max-w-7xl mx-auto">
          {/* Header */}
          <div className="flex flex-col md:flex-row md:items-center justify-between mb-8 gap-4">
            <div>
              <h1 className="text-3xl font-black text-slate-900 dark:text-white flex items-center gap-3">
                <MessageSquare className="text-emerald-500" />
                Review Management
              </h1>
              <p className="text-slate-500 dark:text-slate-400 mt-1">Moderate and manage customer testimonials</p>
            </div>
            
            <div className="flex flex-wrap items-center gap-3">
              <button
                onClick={() => setIsModalOpen(true)}
                className="flex items-center gap-2 bg-emerald-600 hover:bg-emerald-700 text-white px-5 py-2.5 rounded-xl font-bold transition-all shadow-lg shadow-emerald-500/20 active:scale-95"
              >
                <Plus size={20} />
                Add Manual Review
              </button>

              <div className="flex bg-white dark:bg-zinc-900 p-1 rounded-xl border border-slate-200 dark:border-zinc-800 shadow-sm">
                {['all', 'pending', 'approved'].map((tab) => (
                  <button
                    key={tab}
                    onClick={() => setActiveTab(tab)}
                    className={`px-4 py-2 rounded-lg text-sm font-bold transition-all capitalize ${
                      activeTab === tab 
                        ? 'bg-emerald-600 text-white shadow-md' 
                        : 'text-slate-600 dark:text-slate-400 hover:bg-slate-50 dark:hover:bg-zinc-800'
                    }`}
                  >
                    {tab}
                  </button>
                ))}
              </div>
            </div>
          </div>

          {/* Reviews List */}
          {loading ? (
            <div className="flex flex-col items-center justify-center py-20 bg-white dark:bg-zinc-900 rounded-3xl border border-slate-100 dark:border-zinc-800 shadow-sm">
              <RefreshCw className="w-10 h-10 animate-spin text-emerald-500 mb-4" />
              <p className="text-slate-500 font-bold">Loading reviews...</p>
            </div>
          ) : filteredFeedbacks.length === 0 ? (
            <div className="text-center py-20 bg-white dark:bg-zinc-900 rounded-3xl border border-slate-100 dark:border-zinc-800 shadow-sm">
              <div className="w-20 h-20 bg-slate-50 dark:bg-zinc-800 rounded-full flex items-center justify-center mx-auto mb-4">
                <Search className="text-slate-300 dark:text-slate-600" size={32} />
              </div>
              <h3 className="text-xl font-bold text-slate-900 dark:text-white">No reviews found</h3>
              <p className="text-slate-500 mt-2">Try switching filters or check back later</p>
            </div>
          ) : (
            <div className="grid grid-cols-1 gap-6">
              {filteredFeedbacks.map((fb) => (
                <div 
                  key={fb._id}
                  className={`bg-white dark:bg-zinc-900 rounded-3xl border transition-all duration-300 p-6 md:p-8 flex flex-col md:flex-row gap-6 shadow-sm hover:shadow-md ${
                    fb.isApproved ? 'border-emerald-100 dark:border-emerald-900/20' : 'border-slate-200 dark:border-zinc-800'
                  }`}
                >
                  {/* User Info */}
                  <div className="md:w-64 flex-shrink-0 flex md:flex-col gap-4">
                    <div className="w-16 h-16 md:w-20 md:h-20 rounded-2xl bg-slate-100 dark:bg-zinc-800 flex items-center justify-center overflow-hidden ring-4 ring-slate-50 dark:ring-zinc-800/50">
                      {fb.profileImage ? (
                        <img src={fb.profileImage} alt={fb.name} className="w-full h-full object-cover" />
                      ) : (
                        <User className="text-slate-400" size={32} />
                      )}
                    </div>
                    <div>
                      <h3 className="text-lg font-black text-slate-900 dark:text-white leading-tight">{fb.name}</h3>
                      <p className="text-sm text-slate-500 font-medium">{fb.mobile}</p>
                      <div className="flex mt-1">
                        {[...Array(5)].map((_, i) => (
                          <Star 
                            key={i} 
                            size={14} 
                            className={i < fb.rating ? "text-amber-400 fill-amber-400" : "text-slate-200 dark:text-zinc-700"} 
                          />
                        ))}
                      </div>
                    </div>
                  </div>

                  {/* Feedback Content */}
                  <div className="flex-grow">
                    <div className="flex items-center gap-2 mb-3">
                      <span className={`text-[10px] uppercase font-black px-2 py-1 rounded-full ${
                        fb.userType === 'driver' ? 'bg-blue-100 text-blue-600' : 
                        fb.userType === 'partner' ? 'bg-purple-100 text-purple-600' : 
                        'bg-slate-100 text-slate-600'
                      }`}>
                        {fb.userType || 'Customer'}
                      </span>
                      <span className="text-xs text-slate-400 font-medium flex items-center gap-1">
                        <Clock size={12} />
                        {new Date(fb.createdAt).toLocaleDateString()}
                      </span>
                    </div>
                    <p className="text-slate-700 dark:text-slate-300 leading-relaxed italic">
                      "{fb.feedback}"
                    </p>
                  </div>

                  {/* Actions */}
                  <div className="md:w-48 flex-shrink-0 flex flex-row md:flex-col gap-3 justify-center md:justify-start pt-4 md:pt-0 border-t md:border-t-0 md:border-l border-slate-100 dark:border-zinc-800 md:pl-6">
                    <button
                      onClick={() => handleStatusUpdate(fb._id, { isApproved: !fb.isApproved })}
                      className={`flex-1 md:flex-none flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl font-bold text-sm transition-all ${
                        fb.isApproved 
                          ? 'bg-amber-100 text-amber-700 hover:bg-amber-200' 
                          : 'bg-emerald-600 text-white hover:bg-emerald-700 shadow-md shadow-emerald-500/20'
                      }`}
                    >
                      {fb.isApproved ? <><X size={16} /> Unapprove</> : <><Check size={16} /> Approve</>}
                    </button>
                    
                    <button
                      onClick={() => handleStatusUpdate(fb._id, { showOnHome: !fb.showOnHome })}
                      className={`flex-1 md:flex-none flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl font-bold text-sm transition-all ${
                        fb.showOnHome
                          ? 'bg-blue-100 text-blue-700 hover:bg-blue-200'
                          : 'bg-slate-100 dark:bg-zinc-800 text-slate-700 dark:text-slate-300 hover:bg-slate-200 dark:hover:bg-zinc-700'
                      }`}
                    >
                      <Layout size={16} />
                      {fb.showOnHome ? 'Remove Home' : 'Show on Home'}
                    </button>

                    <button
                      onClick={() => handleDelete(fb._id)}
                      className="p-2.5 rounded-xl bg-red-50 text-red-600 hover:bg-red-100 transition-all flex items-center justify-center"
                      title="Delete Review"
                    >
                      <Trash2 size={18} />
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}

          {/* Pagination */}
          {pagination.pages > 1 && (
            <div className="mt-12 flex justify-center items-center gap-4">
              <button
                disabled={pagination.page === 1}
                onClick={() => setPagination({ ...pagination, page: pagination.page - 1 })}
                className="p-3 rounded-xl bg-white dark:bg-zinc-900 border border-slate-200 dark:border-zinc-800 disabled:opacity-50"
              >
                Previous
              </button>
              <span className="font-bold text-slate-900 dark:text-white">
                Page {pagination.page} of {pagination.pages}
              </span>
              <button
                disabled={pagination.page === pagination.pages}
                onClick={() => setPagination({ ...pagination, page: pagination.page + 1 })}
                className="p-3 rounded-xl bg-white dark:bg-zinc-900 border border-slate-200 dark:border-zinc-800 disabled:opacity-50"
              >
                Next
              </button>
            </div>
          )}
        </div>
      </div>

      {/* Manual Add Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm">
          <div className="bg-white dark:bg-zinc-900 w-full max-w-xl rounded-[2.5rem] shadow-2xl border border-slate-200 dark:border-zinc-800 overflow-hidden">
            <div className="p-8 border-b border-slate-100 dark:border-zinc-800 flex justify-between items-center bg-slate-50 dark:bg-zinc-800/50">
              <div>
                <h2 className="text-2xl font-black text-slate-900 dark:text-white">Add Manual Review</h2>
                <p className="text-slate-500 text-sm">Create a verified customer testimonial</p>
              </div>
              <button onClick={() => setIsModalOpen(false)} className="text-slate-400 hover:text-slate-600 transition p-2">
                <X size={24} />
              </button>
            </div>

            <form onSubmit={handleManualAdd} className="p-8 space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-2">
                  <label className="text-xs font-black uppercase text-slate-400 ml-1">Customer Name</label>
                  <input
                    type="text"
                    required
                    value={newReview.name}
                    onChange={(e) => setNewReview({...newReview, name: e.target.value})}
                    placeholder="e.g. Rahul Sharma"
                    className="w-full px-5 py-3.5 rounded-2xl bg-slate-50 dark:bg-zinc-800 border border-slate-200 dark:border-zinc-700 focus:border-emerald-500 outline-none transition-all font-bold text-slate-900 dark:text-white"
                  />
                </div>
                <div className="space-y-2">
                  <label className="text-xs font-black uppercase text-slate-400 ml-1">Phone Number</label>
                  <input
                    type="tel"
                    required
                    value={newReview.mobile}
                    onChange={(e) => setNewReview({...newReview, mobile: e.target.value})}
                    placeholder="91xxxxxxxx"
                    className="w-full px-5 py-3.5 rounded-2xl bg-slate-50 dark:bg-zinc-800 border border-slate-200 dark:border-zinc-700 focus:border-emerald-500 outline-none transition-all font-bold text-slate-900 dark:text-white"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-2">
                  <label className="text-xs font-black uppercase text-slate-400 ml-1">User Type</label>
                  <select
                    value={newReview.userType}
                    onChange={(e) => setNewReview({...newReview, userType: e.target.value})}
                    className="w-full px-5 py-3.5 rounded-2xl bg-slate-50 dark:bg-zinc-800 border border-slate-200 dark:border-zinc-700 focus:border-emerald-500 outline-none transition-all font-bold text-slate-900 dark:text-white appearance-none"
                  >
                    <option value="customer">Customer</option>
                    <option value="driver">Driver</option>
                    <option value="partner">Partner</option>
                    <option value="other">Other</option>
                  </select>
                </div>
                <div className="space-y-2">
                  <label className="text-xs font-black uppercase text-slate-400 ml-1">Star Rating</label>
                  <div className="flex items-center gap-3 bg-slate-50 dark:bg-zinc-800 px-5 py-3 rounded-2xl border border-slate-200 dark:border-zinc-700">
                    {[1, 2, 3, 4, 5].map((star) => (
                      <button
                        key={star}
                        type="button"
                        onClick={() => setNewReview({...newReview, rating: star})}
                        className="transition-transform active:scale-90"
                      >
                        <Star 
                          size={24} 
                          className={star <= newReview.rating ? "text-amber-400 fill-amber-400" : "text-slate-300 dark:text-zinc-600"} 
                        />
                      </button>
                    ))}
                  </div>
                </div>
              </div>

              <div className="space-y-2">
                <label className="text-xs font-black uppercase text-slate-400 ml-1">Testimonial Content</label>
                <textarea
                  required
                  rows={4}
                  value={newReview.feedback}
                  onChange={(e) => setNewReview({...newReview, feedback: e.target.value})}
                  placeholder="Share the customer's experience here..."
                  className="w-full px-5 py-4 rounded-3xl bg-slate-50 dark:bg-zinc-800 border border-slate-200 dark:border-zinc-700 focus:border-emerald-500 outline-none transition-all font-bold text-slate-900 dark:text-white resize-none"
                />
              </div>

              <div className="flex gap-6 p-4 bg-slate-50 dark:bg-zinc-800/30 rounded-3xl border border-slate-100 dark:border-zinc-800">
                <label className="flex items-center gap-3 cursor-pointer group">
                  <div className={`w-6 h-6 rounded-md border-2 flex items-center justify-center transition-all ${newReview.isApproved ? 'bg-emerald-500 border-emerald-500' : 'border-slate-300 dark:border-zinc-600'}`}>
                    {newReview.isApproved && <Check size={14} className="text-white" />}
                  </div>
                  <input type="checkbox" className="hidden" checked={newReview.isApproved} onChange={(e) => setNewReview({...newReview, isApproved: e.target.checked})} />
                  <span className="text-sm font-bold text-slate-600 dark:text-slate-400 group-hover:text-slate-900 dark:group-hover:text-white transition-colors">Approve Immediately</span>
                </label>
                
                <label className="flex items-center gap-3 cursor-pointer group">
                  <div className={`w-6 h-6 rounded-md border-2 flex items-center justify-center transition-all ${newReview.showOnHome ? 'bg-blue-500 border-blue-500' : 'border-slate-300 dark:border-zinc-600'}`}>
                    {newReview.showOnHome && <Check size={14} className="text-white" />}
                  </div>
                  <input type="checkbox" className="hidden" checked={newReview.showOnHome} onChange={(e) => setNewReview({...newReview, showOnHome: e.target.checked})} />
                  <span className="text-sm font-bold text-slate-600 dark:text-slate-400 group-hover:text-slate-900 dark:group-hover:text-white transition-colors">Pin to Home Page</span>
                </label>
              </div>

              <button
                type="submit"
                disabled={isSubmitting}
                className="w-full py-5 bg-emerald-600 text-white rounded-2xl font-black text-lg uppercase tracking-widest shadow-xl shadow-emerald-500/20 hover:bg-emerald-700 transition-all active:scale-[0.98] disabled:opacity-70 flex items-center justify-center gap-3"
              >
                {isSubmitting ? <RefreshCw className="animate-spin" /> : <><Send size={20} /> Publish Review</>}
              </button>
            </form>
          </div>
        </div>
      )}
    </AdminLayout>
  );
};

export default ReviewManagement;
