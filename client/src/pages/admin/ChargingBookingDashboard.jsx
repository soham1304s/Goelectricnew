import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { Trash2, Edit2, RefreshCw, AlertCircle, Loader, Plus, X } from 'lucide-react';
import AdminLayout from './AdminLayout';

const ChargingBookingDashboard = () => {
  const [enquiries, setEnquiries] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [filterStatus, setFilterStatus] = useState('');
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingId, setEditingId] = useState(null);
  const [formData, setFormData] = useState({
    name: '',
    phone: '',
    email: '',
    city: '',
    enquiryType: 'general',
    message: '',
    status: 'pending',
  });
  const [errors, setErrors] = useState({});

  const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000';

  // Fetch enquiries
  useEffect(() => {
    fetchEnquiries();
  }, [currentPage, filterStatus]);

  const fetchEnquiries = async () => {
    try {
      setLoading(true);
      setError('');

      let url = `${API_BASE_URL}/api/charging-enquiries?page=${currentPage}&limit=10`;
      if (filterStatus) {
        url += `&status=${filterStatus}`;
      }

      const token = localStorage.getItem('token');
      const response = await axios.get(url, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      console.log('📊 Enquiries fetched:', response.data);

      setEnquiries(response.data.enquiries || []);
      setTotalPages(response.data.totalPages || 1);
    } catch (err) {
      console.error('❌ Error fetching enquiries:', err);
      setError(err.response?.data?.message || 'Failed to fetch enquiries');
    } finally {
      setLoading(false);
    }
  };

  // Validate form
  const validateForm = () => {
    const newErrors = {};
    if (!formData.name.trim()) newErrors.name = 'Name is required';
    if (!formData.phone.match(/^[6-9]\d{9}$/)) newErrors.phone = 'Valid 10-digit phone required';
    if (!formData.email.match(/^[^\s@]+@[^\s@]+\.[^\s@]+$/)) newErrors.email = 'Valid email is required';
    if (!formData.city.trim()) newErrors.city = 'City is required';
    if (!formData.message.trim()) newErrors.message = 'Message is required';
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  // Handle form change
  const handleChange = (e) => {
    const { id, value } = e.target;
    setFormData({ ...formData, [id]: value });
    if (errors[id]) {
      setErrors({ ...errors, [id]: '' });
    }
  };

  // Submit enquiry
  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!validateForm()) return;

    try {
      const token = localStorage.getItem('token');
      const url = editingId
        ? `${API_BASE_URL}/api/charging-enquiries/${editingId}`
        : `${API_BASE_URL}/api/charging-enquiries`;

      const method = editingId ? 'put' : 'post';

      await axios({
        method,
        url,
        data: formData,
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      console.log('✅ Enquiry submitted successfully');
      alert(editingId ? 'Enquiry updated successfully!' : 'Enquiry submitted successfully!');
      resetForm();
      fetchEnquiries();
      setIsModalOpen(false);
    } catch (err) {
      console.error('❌ Error submitting enquiry:', err);
      alert(err.response?.data?.message || 'Failed to submit enquiry');
    }
  };

  // Reset form
  const resetForm = () => {
    setFormData({
      name: '',
      phone: '',
      email: '',
      city: '',
      enquiryType: 'general',
      message: '',
      status: 'pending',
    });
    setErrors({});
    setEditingId(null);
  };

  // Edit enquiry
  const handleEdit = (enquiry) => {
    setFormData({
      name: enquiry.name || '',
      phone: enquiry.phone || '',
      email: enquiry.email || '',
      city: enquiry.city || '',
      enquiryType: enquiry.enquiryType || 'general',
      message: enquiry.message || '',
      status: enquiry.status || 'pending',
    });
    setEditingId(enquiry._id);
    setIsModalOpen(true);
  };

  // Delete enquiry
  const handleDelete = async (enquiryId) => {
    if (!window.confirm('Are you sure you want to delete this enquiry?')) {
      return;
    }

    try {
      const token = localStorage.getItem('token');
      await axios.delete(`${API_BASE_URL}/api/charging-enquiries/${enquiryId}`, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      console.log('✅ Enquiry deleted:', enquiryId);
      fetchEnquiries();
    } catch (err) {
      console.error('❌ Error deleting enquiry:', err);
      setError('Failed to delete enquiry');
    }
  };

  // Toggle modal
  const toggleModal = () => {
    if (!isModalOpen) {
      resetForm();
    }
    setIsModalOpen(!isModalOpen);
  };

  const getStatusColor = (status) => {
    const colors = {
      pending: 'bg-yellow-100 text-yellow-700 dark:bg-yellow-900 dark:text-yellow-300',
      contacted: 'bg-blue-100 text-blue-700 dark:bg-blue-900 dark:text-blue-300',
      resolved: 'bg-green-100 text-green-700 dark:bg-green-900 dark:text-green-300',
      cancelled: 'bg-red-100 text-red-700 dark:bg-red-900 dark:text-red-300',
    };
    return colors[status] || 'bg-gray-100 text-gray-700 dark:bg-gray-700 dark:text-gray-300';
  };

  return (
    <AdminLayout>
      <div className="space-y-6">
        {/* Header Section */}
        <div className="bg-gradient-to-r from-blue-600 to-blue-700 rounded-lg shadow-lg p-8 text-white">
          <div className="flex justify-between items-start">
            <div>
              <h1 className="text-4xl font-bold mb-2">Charging Station Enquiries</h1>
              <p className="text-blue-100">Manage and respond to customer enquiries</p>
            </div>
            <div className="flex gap-3">
              <button
                onClick={() => toggleModal()}
                className="flex items-center gap-2 bg-emerald-500 hover:bg-emerald-600 text-white px-6 py-3 rounded-lg font-semibold transition-all"
              >
                <Plus size={20} />
                New Enquiry
              </button>
              <button
                onClick={() => fetchEnquiries()}
                disabled={loading}
                className="flex items-center gap-2 bg-white text-blue-600 hover:bg-blue-50 px-6 py-3 rounded-lg font-semibold transition-all disabled:opacity-50"
              >
                <RefreshCw size={20} className={loading ? 'animate-spin' : ''} />
                Refresh
              </button>
            </div>
          </div>
        </div>

        {/* Error Alert */}
        {error && (
          <div className="bg-red-50 border-l-4 border-red-500 rounded-lg p-4 flex items-center gap-3">
            <AlertCircle className="text-red-600 flex-shrink-0" size={20} />
            <div>
              <p className="font-semibold text-red-800">Error</p>
              <p className="text-red-700">{error}</p>
            </div>
          </div>
        )}

        {/* Filter & Control Section */}
        <div className="bg-white dark:bg-gray-800 rounded-lg shadow-md p-6">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <div>
              <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-3">Filter by Status</label>
              <select
                value={filterStatus}
                onChange={(e) => {
                  setFilterStatus(e.target.value);
                  setCurrentPage(1);
                }}
                className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500 transition"
              >
                <option value="">All Status</option>
                <option value="pending">Pending</option>
                <option value="contacted">Contacted</option>
                <option value="resolved">Resolved</option>
                <option value="cancelled">Cancelled</option>
              </select>
            </div>
            <div className="flex items-end">
              <div className="bg-blue-50 dark:bg-blue-900 px-4 py-2 rounded-lg w-full">
                <p className="text-sm text-gray-600 dark:text-gray-400">Total Enquiries</p>
                <p className="text-2xl font-bold text-blue-600 dark:text-blue-400">{enquiries.length}</p>
              </div>
            </div>
            <div className="flex items-end">
              <div className="bg-yellow-50 dark:bg-yellow-900 px-4 py-2 rounded-lg w-full">
                <p className="text-sm text-gray-600 dark:text-gray-400">Pending</p>
                <p className="text-2xl font-bold text-yellow-600 dark:text-yellow-400">
                  {enquiries.filter(e => e.status === 'pending').length}
                </p>
              </div>
            </div>
            <div className="flex items-end">
              <div className="bg-green-50 dark:bg-green-900 px-4 py-2 rounded-lg w-full">
                <p className="text-sm text-gray-600 dark:text-gray-400">Resolved</p>
                <p className="text-2xl font-bold text-green-600 dark:text-green-400">
                  {enquiries.filter(e => e.status === 'resolved').length}
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* Loading State */}
        {loading && (
          <div className="bg-white dark:bg-gray-800 rounded-lg shadow-md p-12 text-center">
            <Loader size={48} className="mx-auto text-blue-600 dark:text-blue-400 animate-spin mb-4" />
            <p className="text-gray-600 dark:text-gray-400 text-lg">Loading enquiries...</p>
          </div>
        )}

        {/* Table Section */}
        {!loading && enquiries.length > 0 && (
          <div className="bg-white dark:bg-gray-800 rounded-lg shadow-md overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead className="bg-gray-50 dark:bg-gray-700 border-b border-gray-200 dark:border-gray-600">
                  <tr>
                    <th className="px-6 py-4 text-left text-sm font-semibold text-gray-900 dark:text-white">Name</th>
                    <th className="px-6 py-4 text-left text-sm font-semibold text-gray-900 dark:text-white">Contact</th>
                    <th className="px-6 py-4 text-left text-sm font-semibold text-gray-900 dark:text-white">City</th>
                    <th className="px-6 py-4 text-left text-sm font-semibold text-gray-900 dark:text-white">Type</th>
                    <th className="px-6 py-4 text-left text-sm font-semibold text-gray-900 dark:text-white">Message</th>
                    <th className="px-6 py-4 text-left text-sm font-semibold text-gray-900 dark:text-white">Status</th>
                    <th className="px-6 py-4 text-left text-sm font-semibold text-gray-900 dark:text-white">Date</th>
                    <th className="px-6 py-4 text-left text-sm font-semibold text-gray-900 dark:text-white">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-200 dark:divide-gray-600">
                  {enquiries.map((enquiry) => (
                    <tr
                      key={enquiry._id}
                      className="hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors"
                    >
                      {/* Name */}
                      <td className="px-6 py-4">
                        <p className="font-semibold text-gray-900 dark:text-white">{enquiry.name}</p>
                      </td>

                      {/* Contact */}
                      <td className="px-6 py-4">
                        <div>
                          <p className="text-sm text-gray-700 dark:text-gray-300">{enquiry.phone}</p>
                          <p className="text-sm text-gray-500 dark:text-gray-400">{enquiry.email}</p>
                        </div>
                      </td>

                      {/* City */}
                      <td className="px-6 py-4">
                        <span className="text-sm text-gray-700 dark:text-gray-300">{enquiry.city}</span>
                      </td>

                      {/* Enquiry Type */}
                      <td className="px-6 py-4">
                        <span className="inline-block px-3 py-1 text-xs font-semibold bg-blue-100 text-blue-700 dark:bg-blue-900 dark:text-blue-300 rounded-full capitalize">
                          {enquiry.enquiryType}
                        </span>
                      </td>

                      {/* Message */}
                      <td className="px-6 py-4">
                        <p className="text-sm text-gray-600 dark:text-gray-300 line-clamp-2">{enquiry.message}</p>
                      </td>

                      {/* Status */}
                      <td className="px-6 py-4">
                        <span className={`inline-block px-3 py-1 rounded-full text-xs font-semibold ${getStatusColor(enquiry.status)}`}>
                          {enquiry.status.charAt(0).toUpperCase() + enquiry.status.slice(1)}
                        </span>
                      </td>

                      {/* Date */}
                      <td className="px-6 py-4 text-sm text-gray-700 dark:text-gray-300">
                        {new Date(enquiry.createdAt).toLocaleDateString('en-IN', {
                          day: '2-digit',
                          month: 'short',
                          year: 'numeric',
                        })}
                      </td>

                      {/* Actions */}
                      <td className="px-6 py-4 flex gap-2">
                        <button
                          onClick={() => handleEdit(enquiry)}
                          className="text-blue-600 dark:text-blue-400 hover:bg-blue-50 dark:hover:bg-blue-900 p-2 rounded transition"
                          title="Edit enquiry"
                        >
                          <Edit2 size={18} />
                        </button>
                        <button
                          onClick={() => handleDelete(enquiry._id)}
                          className="text-red-600 dark:text-red-400 hover:bg-red-50 dark:hover:bg-red-900 p-2 rounded transition"
                          title="Delete enquiry"
                        >
                          <Trash2 size={18} />
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {/* Empty State */}
        {!loading && enquiries.length === 0 && (
          <div className="bg-white dark:bg-gray-800 rounded-lg shadow-md p-12 text-center">
            <AlertCircle className="mx-auto text-gray-400 dark:text-gray-600 mb-4" size={48} />
            <p className="text-gray-600 dark:text-gray-400 text-lg font-semibold">No enquiries found</p>
            <p className="text-gray-500 dark:text-gray-500 text-sm mt-2">
              {filterStatus ? 'Try changing your filter' : 'No enquiries yet. Click "New Enquiry" to create one.'}
            </p>
          </div>
        )}

        {/* Pagination */}
        {!loading && totalPages > 1 && (
          <div className="flex justify-center gap-2 mt-8">
            <button
              onClick={() => setCurrentPage(Math.max(1, currentPage - 1))}
              disabled={currentPage === 1}
              className="px-4 py-2 bg-white dark:bg-gray-800 border border-gray-300 dark:border-gray-600 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-700 disabled:opacity-50 disabled:cursor-not-allowed font-medium text-gray-900 dark:text-white transition"
            >
              Previous
            </button>
            {Array.from({ length: totalPages }, (_, i) => i + 1).map((page) => (
              <button
                key={page}
                onClick={() => setCurrentPage(page)}
                className={`px-4 py-2 rounded-lg font-medium transition ${
                  currentPage === page
                    ? 'bg-blue-600 text-white shadow-md'
                    : 'bg-white dark:bg-gray-800 border border-gray-300 dark:border-gray-600 text-gray-900 dark:text-white hover:bg-gray-50 dark:hover:bg-gray-700'
                }`}
              >
                {page}
              </button>
            ))}
            <button
              onClick={() => setCurrentPage(Math.min(totalPages, currentPage + 1))}
              disabled={currentPage === totalPages}
              className="px-4 py-2 bg-white dark:bg-gray-800 border border-gray-300 dark:border-gray-600 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-700 disabled:opacity-50 disabled:cursor-not-allowed font-medium text-gray-900 dark:text-white transition"
            >
              Next
            </button>
          </div>
        )}

        {/* Modal Form */}
        {isModalOpen && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
            <div className="absolute inset-0 bg-slate-900/60 backdrop-blur-sm" onClick={toggleModal}></div>
            <div className="bg-white dark:bg-slate-800 w-full max-w-2xl rounded-2xl shadow-2xl relative z-10 overflow-hidden">
              {/* Modal Header */}
              <div className="bg-gradient-to-r from-blue-600 to-blue-700 p-6 text-white flex justify-between items-center">
                <h2 className="text-2xl font-bold">
                  {editingId ? 'Edit Enquiry' : 'New Enquiry'}
                </h2>
                <button
                  onClick={toggleModal}
                  className="hover:bg-white/20 p-2 rounded transition"
                >
                  <X size={24} />
                </button>
              </div>

              {/* Modal Content */}
              <form onSubmit={handleSubmit} className="p-8 space-y-5">
                <div className="grid md:grid-cols-2 gap-5">
                  {/* Name */}
                  <div>
                    <label className="block text-sm font-semibold mb-2">Name *</label>
                    <input
                      type="text"
                      id="name"
                      value={formData.name}
                      onChange={handleChange}
                      placeholder="Full name"
                      className={`w-full border p-3 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none transition ${
                        errors.name ? 'border-red-500' : 'border-slate-300'
                      }`}
                    />
                    {errors.name && <p className="text-red-500 text-sm mt-1">{errors.name}</p>}
                  </div>

                  {/* Phone */}
                  <div>
                    <label className="block text-sm font-semibold mb-2">Phone *</label>
                    <input
                      type="tel"
                      id="phone"
                      value={formData.phone}
                      onChange={handleChange}
                      placeholder="10-digit number"
                      className={`w-full border p-3 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none transition ${
                        errors.phone ? 'border-red-500' : 'border-slate-300'
                      }`}
                    />
                    {errors.phone && <p className="text-red-500 text-sm mt-1">{errors.phone}</p>}
                  </div>

                  {/* Email */}
                  <div>
                    <label className="block text-sm font-semibold mb-2">Email *</label>
                    <input
                      type="email"
                      id="email"
                      value={formData.email}
                      onChange={handleChange}
                      placeholder="email@example.com"
                      className={`w-full border p-3 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none transition ${
                        errors.email ? 'border-red-500' : 'border-slate-300'
                      }`}
                    />
                    {errors.email && <p className="text-red-500 text-sm mt-1">{errors.email}</p>}
                  </div>

                  {/* City */}
                  <div>
                    <label className="block text-sm font-semibold mb-2">City *</label>
                    <input
                      type="text"
                      id="city"
                      value={formData.city}
                      onChange={handleChange}
                      placeholder="City name"
                      className={`w-full border p-3 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none transition ${
                        errors.city ? 'border-red-500' : 'border-slate-300'
                      }`}
                    />
                    {errors.city && <p className="text-red-500 text-sm mt-1">{errors.city}</p>}
                  </div>

                  {/* Enquiry Type */}
                  <div>
                    <label className="block text-sm font-semibold mb-2">Enquiry Type</label>
                    <select
                      id="enquiryType"
                      value={formData.enquiryType}
                      onChange={handleChange}
                      className="w-full border border-slate-300 p-3 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none transition"
                    >
                      <option value="general">General</option>
                      <option value="installation">Installation</option>
                      <option value="maintenance">Maintenance</option>
                      <option value="pricing">Pricing</option>
                      <option value="other">Other</option>
                    </select>
                  </div>

                  {/* Status (Admin only) */}
                  <div>
                    <label className="block text-sm font-semibold mb-2">Status</label>
                    <select
                      id="status"
                      value={formData.status}
                      onChange={handleChange}
                      className="w-full border border-slate-300 p-3 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none transition"
                    >
                      <option value="pending">Pending</option>
                      <option value="contacted">Contacted</option>
                      <option value="resolved">Resolved</option>
                      <option value="cancelled">Cancelled</option>
                    </select>
                  </div>

                  {/* Message */}
                  <div className="md:col-span-2">
                    <label className="block text-sm font-semibold mb-2">Message *</label>
                    <textarea
                      id="message"
                      rows="4"
                      value={formData.message}
                      onChange={handleChange}
                      placeholder="Enter your enquiry message"
                      className={`w-full border p-3 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none transition ${
                        errors.message ? 'border-red-500' : 'border-slate-300'
                      }`}
                    ></textarea>
                    {errors.message && <p className="text-red-500 text-sm mt-1">{errors.message}</p>}
                  </div>
                </div>

                {/* Buttons */}
                <div className="flex gap-4 pt-4">
                  <button
                    type="submit"
                    className="flex-1 bg-blue-600 hover:bg-blue-700 text-white font-bold py-3 rounded-lg shadow-lg transition"
                  >
                    {editingId ? 'Update Enquiry' : 'Submit Enquiry'}
                  </button>
                  <button
                    type="button"
                    onClick={toggleModal}
                    className="flex-1 bg-slate-300 hover:bg-slate-400 text-slate-700 font-bold py-3 rounded-lg transition"
                  >
                    Cancel
                  </button>
                </div>

                <p className="text-center text-sm text-slate-600 dark:text-slate-400">
                  Fields marked with * are required
                </p>
              </form>
            </div>
          </div>
        )}
      </div>
    </AdminLayout>
  );
};

export default ChargingBookingDashboard;
