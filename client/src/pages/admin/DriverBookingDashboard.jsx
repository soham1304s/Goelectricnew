import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { Trash2, Edit2, RefreshCw, AlertCircle, Loader, CheckCircle, XCircle, Clock, Check, X } from 'lucide-react';
import AdminLayout from './AdminLayout';
import apiConfig from '../../config/api.config.json';

const DriverBookingDashboard = () => {
  const [drivers, setDrivers] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [filterStatus, setFilterStatus] = useState('');
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [editingId, setEditingId] = useState(null);
  const [newStatus, setNewStatus] = useState('');
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [selectedDriver, setSelectedDriver] = useState(null);
  const [editForm, setEditForm] = useState({
    name: '',
    email: '',
    phone: '',
    licenseNumber: '',
    vehicleDetails: {
      vehicleNumber: '',
      vehicleModel: '',
      vehicleType: 'economy',
      vehicleColor: ''
    }
  });

  // Fetch drivers
  useEffect(() => {
    fetchDrivers();
  }, [currentPage, filterStatus]);

  const fetchDrivers = async () => {
    try {
      setLoading(true);
      setError('');

      let url = `${apiConfig.api.baseUrl}/admin/drivers?page=${currentPage}&limit=10`;
      if (filterStatus) {
        url += `&status=${filterStatus}`;
      }

      const token = localStorage.getItem('token');
      const response = await axios.get(url, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      console.log('📊 Drivers fetched:', response.data);

      // Handle response format from backend: { success: true, data: { drivers: [...], pagination: {...} } }
      let driversData = [];
      let pages = 1;
      
      if (response.data.success && response.data.data) {
        driversData = response.data.data.drivers || [];
        pages = response.data.data.pagination?.pages || 1;
      } else if (Array.isArray(response.data)) {
        driversData = response.data;
        pages = 1;
      } else if (response.data.data && Array.isArray(response.data.data)) {
        driversData = response.data.data;
        pages = response.data.pagination?.pages || 1;
      }

      console.log('✅ Parsed drivers data:', { count: driversData.length, pages });
      setDrivers(driversData || []);
      setTotalPages(pages || 1);
    } catch (err) {
      console.error('❌ Error fetching drivers:', err);
      setError(err.response?.data?.message || 'Failed to fetch drivers');
      setDrivers([]);
      setTotalPages(1);
    } finally {
      setLoading(false);
    }
  };

  // Delete driver
  const handleDelete = async (driverId) => {
    if (!window.confirm('Are you sure you want to delete this driver?')) {
      return;
    }

    try {
      const token = localStorage.getItem('token');
      await axios.delete(`${apiConfig.api.baseUrl}/admin/drivers/${driverId}`, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      console.log('✅ Driver deleted:', driverId);
      fetchDrivers();
    } catch (err) {
      console.error('❌ Error deleting driver:', err);
      setError('Failed to delete driver');
    }
  };

  // Update status
  const handleUpdateStatus = async (driverId, status) => {
    try {
      const token = localStorage.getItem('token');
      await axios.patch(
        `${apiConfig.api.baseUrl}/admin/drivers/${driverId}/status`,
        { status },
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );

      console.log('✅ Driver status updated:', driverId, status);
      setEditingId(null);
      setNewStatus('');
      fetchDrivers();
    } catch (err) {
      console.error('❌ Error updating driver:', err);
      setError('Failed to update driver');
    }
  };

  const handleEdit = (driver) => {
    setSelectedDriver(driver);
    setEditForm({
      name: driver.name || '',
      email: driver.email || '',
      phone: driver.phone || '',
      licenseNumber: driver.licenseNumber || '',
      vehicleDetails: {
        vehicleNumber: driver.vehicleDetails?.vehicleNumber || '',
        vehicleModel: driver.vehicleDetails?.vehicleModel || '',
        vehicleType: driver.vehicleDetails?.vehicleType || 'economy',
        vehicleColor: driver.vehicleDetails?.vehicleColor || ''
      }
    });
    setIsEditModalOpen(true);
  };

  const handleSubmitEdit = async (e) => {
    e.preventDefault();
    try {
      setLoading(true);
      const token = localStorage.getItem('token');
      await axios.put(
        `${apiConfig.api.baseUrl}/admin/drivers/${selectedDriver._id}`,
        editForm,
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );

      setIsEditModalOpen(false);
      fetchDrivers();
    } catch (err) {
      console.error('❌ Error updating driver:', err);
      setError('Failed to update driver details');
    } finally {
      setLoading(false);
    }
  };

  const getStatusColor = (status) => {
    const colors = {
      pending: 'bg-yellow-100 text-yellow-700 dark:bg-yellow-900 dark:text-yellow-300',
      approved: 'bg-green-100 text-green-700 dark:bg-green-900 dark:text-green-300',
      rejected: 'bg-red-100 text-red-700 dark:bg-red-900 dark:text-red-300',
      active: 'bg-blue-100 text-blue-700 dark:bg-blue-900 dark:text-blue-300',
      inactive: 'bg-gray-100 text-gray-700 dark:bg-gray-700 dark:text-gray-300',
    };
    return colors[status] || 'bg-gray-100 text-gray-700 dark:bg-gray-700 dark:text-gray-300';
  };

  const getStatusIcon = (status) => {
    const icons = {
      pending: <Clock className="w-4 h-4" />,
      approved: <CheckCircle className="w-4 h-4" />,
      rejected: <XCircle className="w-4 h-4" />,
      active: <CheckCircle className="w-4 h-4" />,
      inactive: <AlertCircle className="w-4 h-4" />,
    };
    return icons[status] || <AlertCircle className="w-4 h-4" />;
  };

  return (
    <AdminLayout>
      <div className="space-y-6">
        {/* Header Section */}
        <div className="bg-gradient-to-r from-blue-600 to-blue-700 rounded-lg shadow-lg p-6 md:p-8 text-white">
          <div className="flex flex-col md:flex-row md:justify-between md:items-start gap-4">
            <div className="flex-1">
              <h1 className="text-3xl md:text-4xl font-bold mb-2">Driver Applications</h1>
              <p className="text-sm md:text-base text-blue-100">Manage and review driver partner applications</p>
            </div>
            <button
              onClick={() => fetchDrivers()}
              disabled={loading}
              className="flex items-center justify-center gap-2 bg-white text-blue-600 hover:bg-blue-50 px-4 md:px-6 py-2 md:py-3 rounded-lg font-semibold transition-all disabled:opacity-50 w-full md:w-auto"
            >
              <RefreshCw size={20} className={loading ? 'animate-spin' : ''} />
              <span className="text-sm md:text-base">Refresh</span>
            </button>
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
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
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
                <option value="approved">Approved</option>
                <option value="rejected">Rejected</option>
                <option value="active">Active</option>
                <option value="inactive">Inactive</option>
              </select>
            </div>
            <div className="flex items-end">
              <div className="bg-blue-50 dark:bg-blue-900 px-4 py-2 rounded-lg w-full">
                <p className="text-sm text-gray-600 dark:text-gray-400">Total Applications</p>
                <p className="text-2xl font-bold text-blue-600 dark:text-blue-400">{drivers.length}</p>
              </div>
            </div>
            <div className="flex items-end">
              <div className="bg-green-50 dark:bg-green-900 px-4 py-2 rounded-lg w-full">
                <p className="text-sm text-gray-600 dark:text-gray-400">Approved</p>
                <p className="text-2xl font-bold text-green-600 dark:text-green-400">
                  {drivers.filter(d => d.status === 'approved' || d.status === 'active').length}
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* Loading State */}
        {loading && (
          <div className="bg-white dark:bg-gray-800 rounded-lg shadow-md p-12 text-center">
            <Loader size={48} className="mx-auto text-blue-600 dark:text-blue-400 animate-spin mb-4" />
            <p className="text-gray-600 dark:text-gray-400 text-lg">Loading drivers...</p>
          </div>
        )}

        {/* Table Section */}
        {!loading && drivers.length > 0 && (
          <div className="bg-white dark:bg-gray-800 rounded-lg shadow-md overflow-hidden">
            <div className="w-full overflow-x-auto">
              <table className="w-full min-w-max">
                <thead className="bg-gray-50 dark:bg-gray-700 border-b border-gray-200 dark:border-gray-600 sticky top-0">
                  <tr>
                    <th className="px-3 md:px-6 py-4 text-left text-xs md:text-sm font-semibold text-gray-900 dark:text-white whitespace-nowrap">Name</th>
                    <th className="px-3 md:px-6 py-4 text-left text-xs md:text-sm font-semibold text-gray-900 dark:text-white whitespace-nowrap">Email</th>
                    <th className="px-3 md:px-6 py-4 text-left text-xs md:text-sm font-semibold text-gray-900 dark:text-white whitespace-nowrap">Phone</th>
                    <th className="px-3 md:px-6 py-4 text-left text-xs md:text-sm font-semibold text-gray-900 dark:text-white whitespace-nowrap">License</th>
                    <th className="px-3 md:px-6 py-4 text-left text-xs md:text-sm font-semibold text-gray-900 dark:text-white whitespace-nowrap">Status</th>
                    <th className="px-3 md:px-6 py-4 text-left text-xs md:text-sm font-semibold text-gray-900 dark:text-white whitespace-nowrap">Date</th>
                    <th className="px-3 md:px-6 py-4 text-left text-xs md:text-sm font-semibold text-gray-900 dark:text-white whitespace-nowrap">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-200 dark:divide-gray-600">
                  {drivers.map((driver) => (
                    <tr
                      key={driver._id}
                      className="hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors"
                    >
                      {/* Name */}
                      <td className="px-3 md:px-6 py-4 whitespace-nowrap">
                        <p className="font-semibold text-xs md:text-sm text-gray-900 dark:text-white">{driver.name}</p>
                      </td>

                      {/* Email */}
                      <td className="px-3 md:px-6 py-4 whitespace-nowrap">
                        <a
                          href={`mailto:${driver.email}`}
                          className="text-blue-600 dark:text-blue-400 hover:underline text-xs md:text-sm"
                          title={driver.email}
                        >
                          {driver.email.length > 20 ? driver.email.substring(0, 17) + '...' : driver.email}
                        </a>
                      </td>

                      {/* Phone */}
                      <td className="px-3 md:px-6 py-4 whitespace-nowrap">
                        <a
                          href={`tel:${driver.phone}`}
                          className="text-blue-600 dark:text-blue-400 hover:underline text-xs md:text-sm font-medium"
                        >
                          {driver.phone}
                        </a>
                      </td>

                      {/* License */}
                      <td className="px-3 md:px-6 py-4 whitespace-nowrap">
                        {driver.documents?.licensePhoto ? (
                          <a
                            href={driver.documents.licensePhoto}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="text-blue-600 dark:text-blue-400 hover:underline text-xs md:text-sm font-medium"
                          >
                            View
                          </a>
                        ) : (
                          <span className="text-gray-500 text-xs md:text-sm">-</span>
                        )}
                      </td>

                      {/* Status */}
                      <td className="px-3 md:px-6 py-4 whitespace-nowrap">
                        {editingId === driver._id ? (
                          <div className="flex gap-1 md:gap-2">
                            <select
                              value={newStatus}
                              onChange={(e) => setNewStatus(e.target.value)}
                              className="px-2 py-1 text-xs md:text-sm border border-gray-300 dark:border-gray-600 rounded bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
                            >
                              <option value="">Select</option>
                              <option value="pending">Pending</option>
                              <option value="approved">Approved</option>
                              <option value="rejected">Rejected</option>
                              <option value="active">Active</option>
                              <option value="inactive">Inactive</option>
                            </select>
                            <button
                              onClick={() => handleUpdateStatus(driver._id, newStatus)}
                              className="px-2 py-1 text-xs md:text-sm bg-blue-600 hover:bg-blue-700 text-white rounded font-medium transition"
                            >
                              <Check size={14} />
                            </button>
                            <button
                              onClick={() => setEditingId(null)}
                              className="px-2 py-1 text-xs md:text-sm bg-gray-300 dark:bg-gray-600 text-gray-800 dark:text-white rounded hover:bg-gray-400 dark:hover:bg-gray-500 font-medium transition"
                            >
                              <X size={14} />
                            </button>
                          </div>
                        ) : (
                          <div className="flex items-center gap-1 md:gap-2">
                            <div className="flex items-center gap-0.5 md:gap-1">
                              {getStatusIcon(driver.status)}
                              <span className={`inline-block px-2 md:px-3 py-0.5 md:py-1 rounded-full text-xs font-semibold ${getStatusColor(driver.status)}`}>
                                {driver.status?.substring(0, 3).toUpperCase()}
                              </span>
                            </div>
                            <button
                              onClick={() => {
                                setEditingId(driver._id);
                                setNewStatus(driver.status);
                              }}
                              className="text-blue-600 dark:text-blue-400 hover:bg-blue-50 dark:hover:bg-blue-900 p-1 rounded transition"
                              title="Edit status"
                            >
                              <Edit2 size={14} />
                            </button>
                          </div>
                        )}
                      </td>

                      {/* Date */}
                      <td className="px-3 md:px-6 py-4 text-xs md:text-sm text-gray-700 dark:text-gray-300 whitespace-nowrap">
                        <div>
                          {new Date(driver.createdAt).toLocaleDateString('en-IN', {
                            day: '2-digit',
                            month: 'short',
                            year: '2-digit',
                          })}
                        </div>
                        <div className="text-xs text-gray-500 dark:text-gray-400">
                          {new Date(driver.createdAt).toLocaleTimeString('en-IN', { hour: '2-digit', minute: '2-digit' })}
                        </div>
                      </td>

                      {/* Actions */}
                      <td className="px-3 md:px-6 py-4 whitespace-nowrap">
                        <div className="flex items-center gap-2">
                          <button
                            onClick={() => handleEdit(driver)}
                            className="text-blue-600 dark:text-blue-400 hover:bg-blue-50 dark:hover:bg-blue-900 p-2 rounded transition"
                            title="Edit profile"
                          >
                            <Edit2 size={16} />
                          </button>
                          <button
                            onClick={() => handleDelete(driver._id)}
                            className="text-red-600 dark:text-red-400 hover:bg-red-50 dark:hover:bg-red-900 p-2 rounded transition"
                            title="Delete driver"
                          >
                            <Trash2 size={16} />
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {/* Empty State */}
        {!loading && drivers.length === 0 && (
          <div className="bg-white dark:bg-gray-800 rounded-lg shadow-md p-12 text-center">
            <AlertCircle className="mx-auto text-gray-400 dark:text-gray-600 mb-4" size={48} />
            <p className="text-gray-600 dark:text-gray-400 text-lg font-semibold">No drivers found</p>
            <p className="text-gray-500 dark:text-gray-500 text-sm mt-2">
              {filterStatus ? 'Try changing your filter' : 'No driver applications yet'}
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

        {/* Edit Modal */}
        {isEditModalOpen && (
          <div className="fixed inset-0 z-50 overflow-y-auto bg-black bg-opacity-50 flex items-center justify-center p-4">
            <div className="bg-white dark:bg-gray-800 rounded-xl shadow-2xl w-full max-w-2xl overflow-hidden">
              <div className="px-6 py-4 bg-blue-600 text-white flex justify-between items-center">
                <h3 className="text-xl font-bold">Edit Driver Details</h3>
                <button onClick={() => setIsEditModalOpen(false)}>
                  <X size={24} />
                </button>
              </div>

              <form onSubmit={handleSubmitEdit} className="p-6 space-y-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <label className="text-sm font-bold text-gray-700 dark:text-gray-300">Name</label>
                    <input
                      type="text"
                      value={editForm.name}
                      onChange={(e) => setEditForm({ ...editForm, name: e.target.value })}
                      className="w-full px-4 py-2 rounded-lg border dark:bg-gray-700 dark:border-gray-600 dark:text-white"
                      required
                    />
                  </div>
                  <div className="space-y-2">
                    <label className="text-sm font-bold text-gray-700 dark:text-gray-300">Email</label>
                    <input
                      type="email"
                      value={editForm.email}
                      onChange={(e) => setEditForm({ ...editForm, email: e.target.value })}
                      className="w-full px-4 py-2 rounded-lg border dark:bg-gray-700 dark:border-gray-600 dark:text-white"
                      required
                    />
                  </div>
                  <div className="space-y-2">
                    <label className="text-sm font-bold text-gray-700 dark:text-gray-300">Phone</label>
                    <input
                      type="text"
                      value={editForm.phone}
                      onChange={(e) => setEditForm({ ...editForm, phone: e.target.value })}
                      className="w-full px-4 py-2 rounded-lg border dark:bg-gray-700 dark:border-gray-600 dark:text-white"
                      required
                    />
                  </div>
                  <div className="space-y-2">
                    <label className="text-sm font-bold text-gray-700 dark:text-gray-300">License Number</label>
                    <input
                      type="text"
                      value={editForm.licenseNumber}
                      onChange={(e) => setEditForm({ ...editForm, licenseNumber: e.target.value })}
                      className="w-full px-4 py-2 rounded-lg border dark:bg-gray-700 dark:border-gray-600 dark:text-white"
                      required
                    />
                  </div>
                </div>

                <div className="border-t dark:border-gray-700 pt-6">
                  <h4 className="font-bold text-gray-900 dark:text-white mb-4">Vehicle Assignment</h4>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <label className="text-sm font-bold text-gray-700 dark:text-gray-300">Vehicle Model</label>
                      <input
                        type="text"
                        value={editForm.vehicleDetails.vehicleModel}
                        onChange={(e) => setEditForm({ 
                          ...editForm, 
                          vehicleDetails: { ...editForm.vehicleDetails, vehicleModel: e.target.value } 
                        })}
                        className="w-full px-4 py-2 rounded-lg border dark:bg-gray-700 dark:border-gray-600 dark:text-white"
                        placeholder="e.g. Tata Nexon EV"
                      />
                    </div>
                    <div className="space-y-2">
                      <label className="text-sm font-bold text-gray-700 dark:text-gray-300">Registration Number</label>
                      <input
                        type="text"
                        value={editForm.vehicleDetails.vehicleNumber}
                        onChange={(e) => setEditForm({ 
                          ...editForm, 
                          vehicleDetails: { ...editForm.vehicleDetails, vehicleNumber: e.target.value.toUpperCase() } 
                        })}
                        className="w-full px-4 py-2 rounded-lg border dark:bg-gray-700 dark:border-gray-600 dark:text-white"
                        placeholder="e.g. RJ 14 EV 1234"
                      />
                    </div>
                    <div className="space-y-2">
                      <label className="text-sm font-bold text-gray-700 dark:text-gray-300">Vehicle Type</label>
                      <select
                        value={editForm.vehicleDetails.vehicleType}
                        onChange={(e) => setEditForm({ 
                          ...editForm, 
                          vehicleDetails: { ...editForm.vehicleDetails, vehicleType: e.target.value } 
                        })}
                        className="w-full px-4 py-2 rounded-lg border dark:bg-gray-700 dark:border-gray-600 dark:text-white"
                      >
                        <option value="economy">Economy</option>
                        <option value="premium">Premium</option>
                      </select>
                    </div>
                    <div className="space-y-2">
                      <label className="text-sm font-bold text-gray-700 dark:text-gray-300">Vehicle Color</label>
                      <input
                        type="text"
                        value={editForm.vehicleDetails.vehicleColor}
                        onChange={(e) => setEditForm({ 
                          ...editForm, 
                          vehicleDetails: { ...editForm.vehicleDetails, vehicleColor: e.target.value } 
                        })}
                        className="w-full px-4 py-2 rounded-lg border dark:bg-gray-700 dark:border-gray-600 dark:text-white"
                        placeholder="e.g. White"
                      />
                    </div>
                  </div>
                </div>

                <div className="flex justify-end gap-3 pt-6 border-t dark:border-gray-700">
                  <button
                    type="button"
                    onClick={() => setIsEditModalOpen(false)}
                    className="px-6 py-2 rounded-lg border border-gray-300 dark:border-gray-600 text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700 transition"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    className="px-8 py-2 rounded-lg bg-blue-600 text-white font-bold hover:bg-blue-700 transition shadow-lg shadow-blue-600/20"
                  >
                    Save Changes
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}
      </div>
    </AdminLayout>
  );
};

export default DriverBookingDashboard;
