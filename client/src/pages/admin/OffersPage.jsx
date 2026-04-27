import { useState, useEffect } from 'react';
import { Gift, Edit2, Trash2, Plus, X, Check, AlertCircle } from 'lucide-react';
import AdminLayout from './AdminLayout';
import offerService from '../../services/offerService';

const OffersPage = () => {
  const [offers, setOffers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingId, setEditingId] = useState(null);
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    discountPercentage: '',
    discountAmount: '',
    endDate: '',
    applicableOn: 'both',
    isActive: false,
  });

  useEffect(() => {
    fetchOffers();
  }, []);

  const fetchOffers = async () => {
    try {
      setLoading(true);
      const data = await offerService.getAllOffers();
      setOffers(data || []);
      setError('');
    } catch (err) {
      setError('Failed to load offers');
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const handleOpenModal = (offer = null) => {
    if (offer) {
      setEditingId(offer._id);
      setFormData({
        title: offer.title,
        description: offer.description,
        discountPercentage: offer.discountPercentage,
        discountAmount: offer.discountAmount || '',
        endDate: offer.endDate ? offer.endDate.split('T')[0] : '',
        applicableOn: offer.applicableOn[0] || 'both',
        isActive: offer.isActive,
      });
    } else {
      setEditingId(null);
      setFormData({
        title: '',
        description: '',
        discountPercentage: '',
        discountAmount: '',
        endDate: '',
        applicableOn: 'both',
        isActive: false,
      });
    }
    setIsModalOpen(true);
  };

  const handleCloseModal = () => {
    setIsModalOpen(false);
    setEditingId(null);
  };

  const handleInputChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value,
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setSuccess('');

    // Validation
    if (!formData.title.trim()) {
      setError('Offer title is required');
      return;
    }
    if (!formData.description.trim()) {
      setError('Offer description is required');
      return;
    }
    if (!formData.discountPercentage || formData.discountPercentage < 0 || formData.discountPercentage > 100) {
      setError('Please enter a valid discount percentage (0-100)');
      return;
    }

    try {
      setLoading(true);
      const payload = {
        ...formData,
        discountPercentage: parseInt(formData.discountPercentage),
        discountAmount: formData.discountAmount ? parseInt(formData.discountAmount) : 0,
        applicableOn: [formData.applicableOn],
      };

      if (editingId) {
        await offerService.updateOffer(editingId, payload);
        setSuccess('Offer updated successfully!');
      } else {
        await offerService.createOffer(payload);
        setSuccess('Offer created successfully!');
      }

      handleCloseModal();
      fetchOffers();
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to save offer');
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (id) => {
    if (!window.confirm('Are you sure you want to delete this offer?')) {
      return;
    }

    try {
      setLoading(true);
      await offerService.deleteOffer(id);
      setSuccess('Offer deleted successfully!');
      fetchOffers();
    } catch (err) {
      setError('Failed to delete offer');
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const handleToggleStatus = async (id) => {
    try {
      setLoading(true);
      await offerService.toggleOfferStatus(id);
      setSuccess('Offer status updated!');
      fetchOffers();
    } catch (err) {
      setError('Failed to update offer status');
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  return (
    <AdminLayout>
      <div className="p-4 md:p-6 space-y-6">
        {/* Header */}
        <div className="flex flex-col md:flex-row md:justify-between md:items-center gap-4">
          <div className="flex-1">
            <h1 className="text-2xl md:text-3xl font-bold text-gray-900 dark:text-white flex items-center gap-2">
              <Gift className="w-6 h-6 md:w-8 md:h-8 text-emerald-600" />
              Manage Offers
            </h1>
            <p className="text-gray-600 dark:text-gray-400 mt-1 text-sm md:text-base">
              Create and manage promotional offers for your customers
            </p>
          </div>
          <button
            onClick={() => handleOpenModal()}
            className="bg-emerald-600 hover:bg-emerald-700 text-white px-4 py-2 rounded-lg flex items-center gap-2 transition-colors whitespace-nowrap w-full md:w-auto justify-center md:justify-start"
          >
            <Plus className="w-5 h-5" />
            New Offer
          </button>
        </div>

        {/* Messages */}
        {error && (
          <div className="bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg p-4 flex items-center gap-3">
            <AlertCircle className="w-5 h-5 text-red-600 flex-shrink-0 mt-0.5" />
            <p className="text-red-800 dark:text-red-200">{error}</p>
          </div>
        )}

        {success && (
          <div className="bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-800 rounded-lg p-4 flex items-center gap-3">
            <Check className="w-5 h-5 text-green-600 flex-shrink-0" />
            <p className="text-green-800 dark:text-green-200">{success}</p>
          </div>
        )}

        {/* Offers Table */}
        <div className="bg-white dark:bg-gray-800 rounded-lg shadow overflow-hidden">
          {loading && offers.length === 0 ? (
            <div className="p-6 md:p-8 text-center">
              <div className="inline-block animate-spin rounded-full h-8 w-8 border-b-2 border-emerald-600"></div>
              <p className="text-gray-600 dark:text-gray-400 mt-2 text-sm md:text-base">Loading offers...</p>
            </div>
          ) : offers.length === 0 ? (
            <div className="p-6 md:p-8 text-center">
              <Gift className="w-10 h-10 md:w-12 md:h-12 text-gray-400 mx-auto mb-3" />
              <p className="text-gray-600 dark:text-gray-400 text-sm md:text-base">No offers yet. Create your first offer!</p>
            </div>
          ) : (
            <div className="overflow-x-auto -mx-4 md:mx-0">
              <table className="w-full min-w-full">
                <thead className="bg-gray-50 dark:bg-gray-700 border-b border-gray-200 dark:border-gray-600">
                  <tr>
                    <th className="px-3 md:px-6 py-3 text-left text-xs md:text-sm font-semibold text-gray-900 dark:text-white">Title</th>
                    <th className="hidden md:table-cell px-6 py-3 text-left text-sm font-semibold text-gray-900 dark:text-white">Description</th>
                    <th className="px-3 md:px-6 py-3 text-left text-xs md:text-sm font-semibold text-gray-900 dark:text-white">Discount</th>
                    <th className="px-3 md:px-6 py-3 text-left text-xs md:text-sm font-semibold text-gray-900 dark:text-white">Status</th>
                    <th className="px-3 md:px-6 py-3 text-left text-xs md:text-sm font-semibold text-gray-900 dark:text-white">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-200 dark:divide-gray-700">
                  {offers.map((offer) => (
                    <tr key={offer._id} className="hover:bg-gray-50 dark:hover:bg-gray-700/50 transition-colors">
                      <td className="px-3 md:px-6 py-3 md:py-4 text-xs md:text-sm font-medium text-gray-900 dark:text-white">{offer.title}</td>
                      <td className="hidden md:table-cell px-6 py-4 text-sm text-gray-600 dark:text-gray-400 max-w-xs truncate">
                        {offer.description}
                      </td>
                      <td className="px-3 md:px-6 py-3 md:py-4 text-xs md:text-sm font-semibold text-emerald-600 dark:text-emerald-400">
                        {offer.discountPercentage}%
                      </td>
                      <td className="px-3 md:px-6 py-3 md:py-4 text-xs md:text-sm">
                        <button
                          onClick={() => handleToggleStatus(offer._id)}
                          className={`px-2 md:px-3 py-1 rounded-full text-xs font-semibold transition-colors ${
                            offer.isActive
                              ? 'bg-green-100 dark:bg-green-900/30 text-green-800 dark:text-green-200'
                              : 'bg-gray-100 dark:bg-gray-700 text-gray-800 dark:text-gray-200'
                          }`}
                        >
                          {offer.isActive ? 'Active' : 'Inactive'}
                        </button>
                      </td>
                      <td className="px-3 md:px-6 py-3 md:py-4 text-sm space-x-1 md:space-x-2 flex">
                        <button
                          onClick={() => handleOpenModal(offer)}
                          className="text-blue-600 hover:text-blue-800 dark:text-blue-400 dark:hover:text-blue-300 transition-colors p-1"
                          title="Edit offer"
                        >
                          <Edit2 className="w-4 h-4 md:w-5 md:h-5" />
                        </button>
                        <button
                          onClick={() => handleDelete(offer._id)}
                          className="text-red-600 hover:text-red-800 dark:text-red-400 dark:hover:text-red-300 transition-colors p-1"
                          title="Delete offer"
                        >
                          <Trash2 className="w-4 h-4 md:w-5 md:h-5" />
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </div>

      {/* Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 bg-black bg-opacity-50 z-50 flex items-center justify-center p-4">
          <div className="bg-white dark:bg-gray-800 rounded-lg shadow-xl max-w-md w-full space-y-4 p-4 md:p-6 max-h-[90vh] overflow-y-auto">
            <div className="flex justify-between items-center">
              <h2 className="text-xl font-bold text-gray-900 dark:text-white">
                {editingId ? 'Edit Offer' : 'Create New Offer'}
              </h2>
              <button
                onClick={handleCloseModal}
                className="text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-300"
              >
                <X className="w-6 h-6" />
              </button>
            </div>

            <form onSubmit={handleSubmit} className="space-y-3">
              <div>
                <label className="block text-xs md:text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                  Offer Title *
                </label>
                <input
                  type="text"
                  name="title"
                  value={formData.title}
                  onChange={handleInputChange}
                  className="w-full px-3 py-2 text-sm border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-emerald-500 outline-none"
                  placeholder="e.g., Summer Discount"
                  required
                />
              </div>

              <div>
                <label className="block text-xs md:text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                  Description *
                </label>
                <textarea
                  name="description"
                  value={formData.description}
                  onChange={handleInputChange}
                  className="w-full px-3 py-2 text-sm border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-emerald-500 outline-none resize-none"
                  placeholder="Describe your offer..."
                  rows="3"
                  required
                />
              </div>

              <div>
                <label className="block text-xs md:text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                  Discount Percentage (%) *
                </label>
                <input
                  type="number"
                  name="discountPercentage"
                  value={formData.discountPercentage}
                  onChange={handleInputChange}
                  className="w-full px-3 py-2 text-sm border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-emerald-500 outline-none"
                  placeholder="e.g., 20"
                  min="0"
                  max="100"
                  required
                />
              </div>

              <div>
                <label className="block text-xs md:text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                  Fixed Discount Amount (Optional)
                </label>
                <input
                  type="number"
                  name="discountAmount"
                  value={formData.discountAmount}
                  onChange={handleInputChange}
                  className="w-full px-3 py-2 text-sm border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-emerald-500 outline-none"
                  placeholder="e.g., 100"
                  min="0"
                />
              </div>

              <div>
                <label className="block text-xs md:text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                  Applicable On
                </label>
                <select
                  name="applicableOn"
                  value={formData.applicableOn}
                  onChange={handleInputChange}
                  className="w-full px-3 py-2 text-sm border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-emerald-500 outline-none"
                >
                  <option value="both">Rides & Tours</option>
                  <option value="rides">Rides Only</option>
                  <option value="tours">Tours Only</option>
                </select>
              </div>

              <div>
                <label className="block text-xs md:text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                  End Date (Optional)
                </label>
                <input
                  type="date"
                  name="endDate"
                  value={formData.endDate}
                  onChange={handleInputChange}
                  className="w-full px-3 py-2 text-sm border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-emerald-500 outline-none"
                />
              </div>

              <div className="flex items-center gap-2">
                <input
                  type="checkbox"
                  id="isActive"
                  name="isActive"
                  checked={formData.isActive}
                  onChange={handleInputChange}
                  className="w-4 h-4 rounded border-gray-300 text-emerald-600 focus:ring-2 focus:ring-emerald-500"
                />
                <label htmlFor="isActive" className="text-xs md:text-sm font-medium text-gray-700 dark:text-gray-300">
                  Activate immediately
                </label>
              </div>

              <div className="flex gap-2 pt-3">
                <button
                  type="button"
                  onClick={handleCloseModal}
                  className="flex-1 bg-gray-200 dark:bg-gray-700 text-gray-900 dark:text-white px-4 py-2 text-sm rounded-lg hover:bg-gray-300 dark:hover:bg-gray-600 transition-colors font-medium"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={loading}
                  className="flex-1 bg-emerald-600 hover:bg-emerald-700 disabled:bg-emerald-400 text-white px-4 py-2 text-sm rounded-lg transition-colors font-medium"
                >
                  {loading ? 'Saving...' : editingId ? 'Update' : 'Create'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </AdminLayout>
  );
};

export default OffersPage;
