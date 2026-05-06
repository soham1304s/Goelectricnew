import { useEffect, useMemo, useState } from 'react';
import { Search, Trash2, Edit2, Plus, Eye, Image as ImageIcon } from 'lucide-react';
import AdminLayout from './AdminLayout';
import { getAllPackages, deletePackage, createPackage, updatePackage } from '../../services/adminService';
import ImageUpload from '../../components/ImageUpload';
import api from '../../services/api';
import { getImageUrl } from '../../utils/imageUrl';

const PackagesPage = () => {
  const [packages, setPackages] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [categoryFilter, setCategoryFilter] = useState('all');
  const [showForm, setShowForm] = useState(false);
  const [editingId, setEditingId] = useState(null);
  const [selectedPackage, setSelectedPackage] = useState(null);
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    shortDescription: '',
    tourCategory: 'travel_tour',
    location: '',
    duration: {
      days: '1',
      hours: '0',
    },
    discount: {
      percentage: '0',
    },
    coverImage: '',
    pricing: {
      economy: '',
      premium: '',
    },
  });
  const [uploadError, setUploadError] = useState('');

  const uploadImage = async (file) => {
    const formDataObj = new FormData();
    formDataObj.append('image', file);
    const response = await api.post('/admin/upload-image', formDataObj, {
      headers: { 'Content-Type': 'multipart/form-data' },
    });
    // Return the data object which contains { success, url, filename }
    return response.data;
  };

  const fetchPackages = async () => {
    try {
      const params = categoryFilter !== 'all' ? { tourCategory: categoryFilter } : {};
      const response = await getAllPackages(params);
      console.log('Packages response:', response);
      if (response.data && response.data.length > 0) {
        console.log('First package:', response.data[0]);
        console.log('Cover image:', response.data[0].coverImage);
      }
      setPackages(response.data || []);
    } catch (error) {
      console.error('Error fetching packages:', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    void fetchPackages();
  }, [categoryFilter]);

  const filteredPackages = useMemo(() => (
    packages.filter(
      (pkg) =>
        pkg.title?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        pkg.location?.toLowerCase().includes(searchTerm.toLowerCase())
    )
  ), [searchTerm, packages]);

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      // Build pricing object - only economy and premium
      const pricing = {
        economy: Number(formData.pricing?.economy || 0),
        premium: Number(formData.pricing?.premium || 0),
      };
      
      const dataToSend = {
        title: formData.title,
        description: formData.description,
        shortDescription: formData.shortDescription,
        tourCategory: formData.tourCategory,
        location: formData.location,
        durationDays: formData.duration?.days || '1',
        durationHours: formData.duration?.hours || '0',
        coverImage: formData.coverImage,
        discountPercent: formData.discount?.percentage || '0',
        pricing,
      };
      
      console.log('Submitting package data:', dataToSend);

      if (editingId) {
        await updatePackage(editingId, dataToSend);
      } else {
        await createPackage(dataToSend);
      }
      setLoading(true);
      await fetchPackages();
      setShowForm(false);
      setEditingId(null);
      setUploadError('');
      setFormData({
        title: '',
        description: '',
        shortDescription: '',
        tourCategory: 'travel_tour',
        location: '',
        duration: {
          days: '1',
          hours: '0',
        },
        discount: {
          percentage: '0',
        },
        coverImage: '',
        pricing: {
          economy: '',
          premium: '',
        },
      });
    } catch (error) {
      console.error('Error saving package:', error);
    }
  };

  const handleEdit = (pkg) => {
    // Ensure duration is properly structured
    // Map schema fields to form fields: economy→economy, premium→premium
    const formattedPkg = {
      ...pkg,
      duration: {
        days: pkg.duration?.days || pkg.durationDays || '1',
        hours: pkg.duration?.hours || pkg.durationHours || '0',
      },
      discount: {
        percentage: pkg.discount?.percentage || '0',
      },
      pricing: {
        economy: String(pkg.pricing?.economy || ''),
        premium: String(pkg.pricing?.premium || ''),
      },
    };
    setFormData(formattedPkg);
    setEditingId(pkg._id);
    setShowForm(true);
  };

  const handleDelete = async (id) => {
    if (window.confirm('Are you sure you want to delete this package?')) {
      try {
        await deletePackage(id);
        setLoading(true);
        await fetchPackages();
      } catch (error) {
        console.error('Error deleting package:', error);
      }
    }
  };

  return (
    <AdminLayout>
      <div className="space-y-4 sm:space-y-6 px-2 sm:px-4 lg:px-6">
        <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center gap-3 sm:gap-0">
          <h1 className="text-2xl sm:text-3xl font-bold text-gray-900 dark:text-white">Packages Management</h1>
          <button
            onClick={() => {
              setShowForm(true);
              setEditingId(null);
              setUploadError('');
              setFormData({
                title: '',
                description: '',
                shortDescription: '',
                tourCategory: 'travel_tour',
                location: '',
                duration: {
                  days: '1',
                  hours: '0',
                },
                discount: {
                  percentage: '0',
                },
                coverImage: '',
                pricing: {
                  economy: '',
                  premium: '',
                },
              });
            }}
            className="flex items-center justify-center gap-2 bg-green-500 hover:bg-green-600 text-white px-3 sm:px-4 py-2 rounded-lg transition flex-shrink-0 text-sm sm:text-base"
          >
            <Plus size={16} />
            Add Package
          </button>
        </div>

        {/* Filters */}
        <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-3 sm:p-6 space-y-3 sm:space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-3 sm:gap-4">
            <div className="relative">
              <Search className="absolute left-3 top-3 text-gray-400" size={16} />
              <input
                type="text"
                placeholder="Search by title or location..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-9 sm:pl-10 pr-3 sm:pr-4 py-2 text-xs sm:text-sm border border-gray-300 dark:border-gray-600 rounded-lg dark:bg-gray-700 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>
            <select
              value={categoryFilter}
              onChange={(e) => setCategoryFilter(e.target.value)}
              className="px-3 sm:px-4 py-2 text-xs sm:text-sm border border-gray-300 dark:border-gray-600 rounded-lg dark:bg-gray-700 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              <option value="all">All Categories</option>
              <option value="travel_tour">Travel Tour</option>
              <option value="temple_tour">Temple Tour</option>
              <option value="adventure">Adventure</option>
            </select>
          </div>
        </div>

        {/* Packages Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3 sm:gap-4 lg:gap-6">
          {loading ? (
            <div className="col-span-full text-center text-gray-500 text-sm sm:text-base">Loading packages...</div>
          ) : filteredPackages.length === 0 ? (
            <div className="col-span-full text-center text-gray-500 text-sm sm:text-base">No packages found</div>
          ) : (
            filteredPackages.map((pkg) => (
              <div
                key={pkg._id}
                className="bg-white dark:bg-gray-800 rounded-lg shadow hover:shadow-lg transition overflow-hidden cursor-pointer active:shadow-xl"
              >
                {pkg.coverImage ? (
                  <img
                    src={getImageUrl(pkg.coverImage)}
                    alt={pkg.title}
                    className="w-full h-40 sm:h-48 lg:h-52 object-cover"
                  />
                ) : (
                  <div className="w-full h-40 sm:h-48 lg:h-52 bg-gradient-to-br from-gray-300 to-gray-400 dark:from-gray-700 dark:to-gray-600 flex items-center justify-center">
                    <ImageIcon size={48} className="text-gray-500 dark:text-gray-400" />
                  </div>
                )}
                <div className="p-3 sm:p-4 space-y-2 sm:space-y-3">
                  <h3 className="text-base sm:text-lg lg:text-xl font-bold text-gray-900 dark:text-white line-clamp-2">
                    {pkg.title}
                  </h3>
                  <p className="text-xs sm:text-sm text-gray-600 dark:text-gray-400 line-clamp-2">
                    {pkg.shortDescription}
                  </p>
                  <div className="flex justify-between items-center text-xs sm:text-sm lg:text-base">
                    <span className="text-gray-600 dark:text-gray-400 font-medium">
                      {(typeof pkg.duration === 'object' ? (pkg.duration?.days || 1) : pkg.durationDays) || 1}d {(typeof pkg.duration === 'object' ? (pkg.duration?.hours || 0) : pkg.durationHours) || 0}h
                    </span>
                    <div className="flex flex-col items-end gap-1">
                      <span className="text-gray-500 dark:text-gray-400 text-xs">from</span>
                      <span className="font-bold text-blue-500 text-base sm:text-lg lg:text-xl">₹{Math.min(pkg.pricing?.economy || 0, pkg.pricing?.premium || 0)}</span>
                    </div>
                  </div>
                  {/* Car Type Pricing */}
                  <div className="grid grid-cols-2 gap-2 pt-2 border-t border-gray-200 dark:border-gray-700">
                    <div className="text-center">
                      <p className="text-gray-600 dark:text-gray-400 text-xs font-semibold">Economy</p>
                      <p className="font-bold text-blue-600 dark:text-blue-400 text-sm">₹{pkg.pricing?.economy || 0}</p>
                    </div>
                    <div className="text-center">
                      <p className="text-gray-600 dark:text-gray-400 text-xs font-semibold">Premium</p>
                      <p className="font-bold text-blue-600 dark:text-blue-400 text-sm">₹{pkg.pricing?.premium || 0}</p>
                    </div>
                  </div>
                  {pkg.discount?.percentage > 0 && (
                    <div className="text-red-500 text-xs sm:text-sm font-semibold bg-red-50 dark:bg-red-900/20 px-2 sm:px-3 py-1 rounded inline-block">
                      {pkg.discount.percentage}% Off
                    </div>
                  )}
                  <div className="flex gap-2 pt-2 flex-wrap">
                    <button
                      onClick={() => setSelectedPackage(pkg)}
                      className="flex-1 min-w-16 text-blue-500 hover:text-blue-700 dark:hover:text-blue-400 transition flex items-center justify-center gap-1 py-1.5 sm:py-2 font-medium text-xs sm:text-sm rounded hover:bg-blue-50 dark:hover:bg-blue-900/20"
                    >
                      <Eye size={14} className="sm:w-4 sm:h-4" />
                      <span className="hidden sm:inline">View</span>
                    </button>
                    <button
                      onClick={() => handleEdit(pkg)}
                      className="flex-1 min-w-16 text-amber-500 hover:text-amber-700 dark:hover:text-amber-400 transition flex items-center justify-center gap-1 py-1.5 sm:py-2 font-medium text-xs sm:text-sm rounded hover:bg-amber-50 dark:hover:bg-amber-900/20"
                    >
                      <Edit2 size={14} className="sm:w-4 sm:h-4" />
                      <span className="hidden sm:inline">Edit</span>
                    </button>
                    <button
                      onClick={() => handleDelete(pkg._id)}
                      className="flex-1 min-w-16 text-red-500 hover:text-red-700 dark:hover:text-red-400 transition flex items-center justify-center gap-1 py-1.5 sm:py-2 font-medium text-xs sm:text-sm rounded hover:bg-red-50 dark:hover:bg-red-900/20"
                    >
                      <Trash2 size={14} className="sm:w-4 sm:h-4" />
                      <span className="hidden sm:inline">Delete</span>
                    </button>
                  </div>
                </div>
              </div>
            ))
          )}
        </div>

        {/* Package Form Modal */}
        {showForm && (
          <div className="fixed inset-0 bg-black bg-opacity-60 flex items-end sm:items-center justify-center p-0 sm:p-4 z-50">
            <div className="bg-white dark:bg-gray-800 rounded-t-2xl sm:rounded-lg w-full sm:max-w-3xl max-h-[95vh] sm:max-h-[90vh] overflow-y-auto p-4 sm:p-6 lg:p-8 space-y-4 sm:space-y-6 border border-gray-200 dark:border-gray-700">
              <div className="flex justify-between items-center">
                <h2 className="text-xl sm:text-2xl lg:text-3xl font-bold text-gray-900 dark:text-white">
                  {editingId ? 'Edit Package' : 'Create Package'}
                </h2>
                <button onClick={() => setShowForm(false)} className="text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-300 text-xl">✕</button>
              </div>
              <form onSubmit={handleSubmit} className="space-y-4 sm:space-y-6">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 sm:gap-4 lg:gap-6">
                  <div>
                    <label className="block text-xs sm:text-sm font-semibold text-gray-700 dark:text-gray-300 mb-2">Package Title *</label>
                    <input
                      type="text"
                      name="title"
                      placeholder="Enter package title"
                      value={formData.title}
                      onChange={handleInputChange}
                      className="w-full px-3 sm:px-4 py-2 text-xs sm:text-sm border border-gray-300 dark:border-gray-600 rounded-lg dark:bg-gray-700 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
                      required
                    />
                  </div>
                  <div>
                    <label className="block text-xs sm:text-sm font-semibold text-gray-700 dark:text-gray-300 mb-2">Location *</label>
                    <input
                      type="text"
                      name="location"
                      placeholder="Enter location"
                      value={formData.location}
                      onChange={handleInputChange}
                      className="w-full px-3 sm:px-4 py-2 text-xs sm:text-sm border border-gray-300 dark:border-gray-600 rounded-lg dark:bg-gray-700 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
                      required
                    />
                  </div>
                  <div>
                    <label className="block text-xs sm:text-sm font-semibold text-gray-700 dark:text-gray-300 mb-2">Tour Category</label>
                    <select
                      name="tourCategory"
                      value={formData.tourCategory}
                      onChange={handleInputChange}
                      className="w-full px-3 sm:px-4 py-2 text-xs sm:text-sm border border-gray-300 dark:border-gray-600 rounded-lg dark:bg-gray-700 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
                    >
                      <option value="travel_tour">Travel Tour</option>
                      <option value="temple_tour">Temple Tour</option>
                      <option value="adventure">Adventure</option>
                    </select>
                  </div>
                  <div>
                    <label className="block text-xs sm:text-sm font-semibold text-gray-700 dark:text-gray-300 mb-2">Duration (Days)</label>
                    <input
                      type="number"
                      name="durationDays"
                      placeholder="Number of days"
                      value={formData.duration?.days || '1'}
                      onChange={(e) => setFormData((prev) => ({
                        ...prev,
                        duration: { ...prev.duration, days: e.target.value }
                      }))}
                      className="w-full px-3 sm:px-4 py-2 text-xs sm:text-sm border border-gray-300 dark:border-gray-600 rounded-lg dark:bg-gray-700 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
                    />
                  </div>
                  <div>
                    <label className="block text-xs sm:text-sm font-semibold text-gray-700 dark:text-gray-300 mb-2">Duration (Hours)</label>
                    <input
                      type="number"
                      name="durationHours"
                      placeholder="Number of hours"
                      value={formData.duration?.hours || '0'}
                      onChange={(e) => setFormData((prev) => ({
                        ...prev,
                        duration: { ...prev.duration, hours: e.target.value }
                      }))}
                      className="w-full px-3 sm:px-4 py-2 text-xs sm:text-sm border border-gray-300 dark:border-gray-600 rounded-lg dark:bg-gray-700 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
                    />
                  </div>
                  <div>
                    <label className="block text-xs sm:text-sm font-semibold text-gray-700 dark:text-gray-300 mb-2">Discount Percentage (%)</label>
                    <input
                      type="number"
                      name="discountPercentage"
                      placeholder="Enter discount %"
                      value={formData.discount?.percentage || '0'}
                      onChange={(e) => setFormData((prev) => ({
                        ...prev,
                        discount: { ...prev.discount, percentage: e.target.value }
                      }))}
                      className="w-full px-3 sm:px-4 py-2 text-xs sm:text-sm border border-gray-300 dark:border-gray-600 rounded-lg dark:bg-gray-700 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
                    />
                  </div>
                  <div>
                    <label className="block text-xs sm:text-sm font-semibold text-gray-700 dark:text-gray-300 mb-2">Economy Price (₹)</label>
                    <input
                      type="number"
                      placeholder="Price for economy cars"
                      value={formData.pricing?.economy || ''}
                      onChange={(e) => setFormData((prev) => ({
                        ...prev,
                        pricing: { ...prev.pricing, economy: e.target.value }
                      }))}
                      className="w-full px-3 sm:px-4 py-2 text-xs sm:text-sm border border-gray-300 dark:border-gray-600 rounded-lg dark:bg-gray-700 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
                    />
                  </div>
                  <div>
                    <label className="block text-xs sm:text-sm font-semibold text-gray-700 dark:text-gray-300 mb-2">Premium Price (₹)</label>
                    <input
                      type="number"
                      placeholder="Price for premium cars"
                      value={formData.pricing?.premium || ''}
                      onChange={(e) => setFormData((prev) => ({
                        ...prev,
                        pricing: { ...prev.pricing, premium: e.target.value }
                      }))}
                      className="w-full px-3 sm:px-4 py-2 text-xs sm:text-sm border border-gray-300 dark:border-gray-600 rounded-lg dark:bg-gray-700 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
                    />
                  </div>
                </div>
                <div>
                  <ImageUpload
                    value={formData.coverImage}
                    onChange={(url) => setFormData((prev) => ({ ...prev, coverImage: url }))}
                    onError={setUploadError}
                    label="Package Cover Image"
                    uploadFn={uploadImage}
                  />
                  {uploadError && <p className="text-red-500 text-xs sm:text-sm mt-2">{uploadError}</p>}
                </div>
                <div>
                  <label className="block text-xs sm:text-sm font-semibold text-gray-700 dark:text-gray-300 mb-2">Short Description</label>
                  <input
                    type="text"
                    name="shortDescription"
                    placeholder="Enter a short description (shown in package cards)"
                    value={formData.shortDescription}
                    onChange={handleInputChange}
                    className="w-full px-3 sm:px-4 py-2 text-xs sm:text-sm border border-gray-300 dark:border-gray-600 rounded-lg dark:bg-gray-700 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </div>
                <div>
                  <label className="block text-xs sm:text-sm font-semibold text-gray-700 dark:text-gray-300 mb-2">Full Description</label>
                  <textarea
                    name="description"
                    placeholder="Enter detailed description about the package"
                    value={formData.description}
                    onChange={handleInputChange}
                    rows="3"
                    className="w-full px-3 sm:px-4 py-2 text-xs sm:text-sm border border-gray-300 dark:border-gray-600 rounded-lg dark:bg-gray-700 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500 resize-none"
                  />
                </div>
                <div className="flex gap-2 sm:gap-4 pt-2 sm:pt-4 flex-col sm:flex-row">
                  <button
                    type="submit"
                    className="flex-1 bg-gradient-to-r from-blue-500 to-blue-600 hover:from-blue-600 hover:to-blue-700 text-white px-4 sm:px-6 py-2.5 sm:py-3 rounded-lg transition font-semibold shadow-lg text-sm sm:text-base"
                  >
                    {editingId ? 'Update Package' : 'Create Package'}
                  </button>
                  <button
                    type="button"
                    onClick={() => setShowForm(false)}
                    className="flex-1 bg-gray-300 hover:bg-gray-400 dark:bg-gray-700 dark:hover:bg-gray-600 text-gray-800 dark:text-white px-4 sm:px-6 py-2.5 sm:py-3 rounded-lg transition font-semibold text-sm sm:text-base"
                  >
                    Cancel
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}

        {/* Package Detail Modal */}
        {selectedPackage && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-end sm:items-center justify-center p-0 sm:p-4 z-50">
            <div className="bg-white dark:bg-gray-800 rounded-t-2xl sm:rounded-lg w-full sm:max-w-2xl max-h-[90vh] sm:max-h-[90vh] overflow-y-auto p-4 sm:p-6 space-y-3 sm:space-y-4">
              <div className="flex justify-between items-start gap-2">
                <h2 className="text-lg sm:text-2xl lg:text-3xl font-bold text-gray-900 dark:text-white flex-1 break-words">
                  {selectedPackage.title}
                </h2>
                <button onClick={() => setSelectedPackage(null)} className="text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-300 text-xl flex-shrink-0">✕</button>
              </div>
              {selectedPackage.coverImage && (
                <img
                  src={getImageUrl(selectedPackage.coverImage)}
                  alt={selectedPackage.title}
                  className="w-full h-40 sm:h-56 object-cover rounded-lg"
                />
              )}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 sm:gap-4 text-gray-700 dark:text-gray-300 text-xs sm:text-sm">
                <div>
                  <p className="font-semibold text-gray-600 dark:text-gray-400">Location</p>
                  <p>{selectedPackage.location}</p>
                </div>
                <div>
                  <p className="font-semibold text-gray-600 dark:text-gray-400">Category</p>
                  <p>{selectedPackage.tourCategory}</p>
                </div>
                <div>
                  <p className="font-semibold text-gray-600 dark:text-gray-400">Duration</p>
                  <p>{(typeof selectedPackage.duration === 'object' ? (selectedPackage.duration?.days || 1) : selectedPackage.durationDays) || 1}d {(typeof selectedPackage.duration === 'object' ? (selectedPackage.duration?.hours || 0) : selectedPackage.durationHours) || 0}h</p>
                </div>
              </div>
              <div className="border-t border-gray-200 dark:border-gray-700 pt-3 sm:pt-4 mt-3">
                <p className="font-semibold text-gray-600 dark:text-gray-400 text-xs sm:text-sm mb-3">Car Type Pricing</p>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div className="bg-gray-50 dark:bg-gray-700/30 p-3 rounded-lg">
                    <p className="text-gray-600 dark:text-gray-400 text-xs">Economy</p>
                    <p className="font-bold text-blue-600 dark:text-blue-400 text-lg">₹{selectedPackage.pricing?.economy || 0}</p>
                  </div>
                  <div className="bg-gray-50 dark:bg-gray-700/30 p-3 rounded-lg">
                    <p className="text-gray-600 dark:text-gray-400 text-xs">Premium</p>
                    <p className="font-bold text-blue-600 dark:text-blue-400 text-lg">₹{selectedPackage.pricing?.premium || 0}</p>
                  </div>
                </div>
              </div>
              <div className="border-t border-gray-200 dark:border-gray-700 pt-3 sm:pt-4">
                <p className="font-semibold text-gray-600 dark:text-gray-400 text-xs sm:text-sm mb-2">Description</p>
                <p className="text-xs sm:text-sm text-gray-700 dark:text-gray-300">{selectedPackage.description}</p>
              </div>
              <button
                onClick={() => setSelectedPackage(null)}
                className="w-full bg-blue-500 hover:bg-blue-600 text-white px-4 py-2.5 sm:py-3 rounded-lg transition font-semibold text-sm sm:text-base"
              >
                Close
              </button>
            </div>
          </div>
        )}
      </div>
    </AdminLayout>
  );
};

export default PackagesPage;
