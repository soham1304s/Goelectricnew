import React, { useState, useEffect } from 'react';
import { Edit, Trash2, Eye, Filter, Users, CheckCircle, Clock } from 'lucide-react';
import axios from 'axios';
import apiConfig from '../../config/api.config.json';
import AdminLayout from './AdminLayout';

const API_BASE_URL = import.meta.env.VITE_API_URL || apiConfig.api.baseUrl;

export default function CabPartnerDashboard() {
  const [partners, setPartners] = useState([]);
  const [filteredPartners, setFilteredPartners] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filterStatus, setFilterStatus] = useState('all');
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [editingId, setEditingId] = useState(null);
  const [editStatus, setEditStatus] = useState('');
  const [message, setMessage] = useState({ type: '', text: '' });
  const itemsPerPage = 10;

  const statusOptions = ['pending', 'approved', 'rejected', 'active', 'inactive'];
  const statusColors = {
    pending: 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900/30 dark:text-yellow-200',
    approved: 'bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-200',
    rejected: 'bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-200',
    active: 'bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-200',
    inactive: 'bg-gray-100 text-gray-800 dark:bg-gray-900/30 dark:text-gray-200',
  };

  const statusIcons = {
    pending: <Clock className="w-4 h-4" />,
    approved: <CheckCircle className="w-4 h-4" />,
    rejected: <span className="text-lg">✕</span>,
    active: <CheckCircle className="w-4 h-4" />,
    inactive: <span className="text-lg">◯</span>,
  };

  // Fetch cab partners
  const fetchPartners = async () => {
    try {
      setLoading(true);
      const token = localStorage.getItem('token');
      
      // Check if token exists
      if (!token) {
        setMessage({ 
          type: 'error', 
          text: 'Authentication required. Please login to access this page.' 
        });
        setPartners([]);
        setTotalPages(1);
        setLoading(false);
        return;
      }

      const response = await axios.get(`${API_BASE_URL}/api/admin/cab-partners`, {
        headers: { Authorization: `Bearer ${token}` }
      });

      console.log('📊 Cab Partners Response:', response.data);

      let partnersData = [];
      let pages = 1;

      if (Array.isArray(response.data)) {
        partnersData = response.data;
        pages = 1;
      } else if (response.data.data && Array.isArray(response.data.data)) {
        partnersData = response.data.data;
        pages = response.data.totalPages || response.data.pages || 1;
      } else if (response.data.partners && Array.isArray(response.data.partners)) {
        partnersData = response.data.partners;
        pages = response.data.totalPages || response.data.pages || 1;
      } else if (response.data.success === false) {
        partnersData = [];
        pages = 1;
      }

      setPartners(partnersData || []);
      setTotalPages(pages || 1);
      setFilterStatus('all');
      setCurrentPage(1);
    } catch (error) {
      console.log('❌ Error fetching cab partners:', error.message);
      
      // Handle specific error codes
      if (error.response?.status === 401) {
        setMessage({ 
          type: 'error', 
          text: 'Unauthorized. Your session may have expired. Please login again.' 
        });
        // Optionally clear token and redirect to login
        localStorage.removeItem('token');
        localStorage.removeItem('user');
      } else if (error.response?.status === 403) {
        setMessage({ 
          type: 'error', 
          text: 'You do not have permission to access this resource.' 
        });
      } else {
        setMessage({ 
          type: 'error', 
          text: 'Failed to load cab partners. Please try again.' 
        });
      }
      
      setPartners([]);
      setTotalPages(1);
    } finally {
      setLoading(false);
    }
  };

  // Filter partners based on status
  useEffect(() => {
    if (filterStatus === 'all') {
      setFilteredPartners(partners);
    } else {
      setFilteredPartners(partners.filter(p => p.status === filterStatus));
    }
    setCurrentPage(1);
  }, [filterStatus, partners]);

  // Paginate filtered partners
  const paginatedPartners = filteredPartners.slice(
    (currentPage - 1) * itemsPerPage,
    currentPage * itemsPerPage
  );

  const totalFilteredPages = Math.ceil(filteredPartners.length / itemsPerPage);

  useEffect(() => {
    fetchPartners();
  }, []);

  // Handle status update
  const handleStatusUpdate = async (partnerId, newStatus) => {
    try {
      const token = localStorage.getItem('token');
      await axios.put(
        `${API_BASE_URL}/api/admin/cab-partners/${partnerId}`,
        { status: newStatus },
        { headers: { Authorization: `Bearer ${token}` } }
      );

      setPartners(partners.map(p =>
        p._id === partnerId ? { ...p, status: newStatus } : p
      ));
      setEditingId(null);
      setMessage({ type: 'success', text: 'Status updated successfully' });
      setTimeout(() => setMessage({ type: '', text: '' }), 3000);
    } catch (error) {
      setMessage({ type: 'error', text: 'Failed to update status' });
    }
  };

  // Handle delete
  const handleDelete = async (partnerId) => {
    if (!window.confirm('Are you sure you want to delete this cab partner?')) return;

    try {
      const token = localStorage.getItem('token');
      await axios.delete(`${API_BASE_URL}/api/admin/cab-partners/${partnerId}`, {
        headers: { Authorization: `Bearer ${token}` }
      });

      setPartners(partners.filter(p => p._id !== partnerId));
      setMessage({ type: 'success', text: 'Cab partner deleted successfully' });
      setTimeout(() => setMessage({ type: '', text: '' }), 3000);
    } catch (error) {
      setMessage({ type: 'error', text: 'Failed to delete cab partner' });
    }
  };

  if (loading) {
    return (
      <AdminLayout>
        <div className="flex items-center justify-center h-screen">
          <div className="text-center">
            <div className="w-12 h-12 border-4 border-blue-200 border-t-blue-600 rounded-full animate-spin mx-auto mb-4"></div>
            <p className="text-gray-600 dark:text-gray-400">Loading cab partners...</p>
          </div>
        </div>
      </AdminLayout>
    );
  }

  return (
    <AdminLayout>
      <div className="space-y-6">
        {/* Header */}
        <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
          <div>
            <h1 className="text-2xl md:text-3xl font-bold text-gray-900 dark:text-white">
              Cab Partner Applications
            </h1>
            <p className="text-gray-600 dark:text-gray-400 mt-1">
              Manage and review cab partner registrations
            </p>
          </div>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="bg-white dark:bg-slate-800 rounded-lg p-4 shadow">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600 dark:text-gray-400">Total Applications</p>
                <p className="text-2xl font-bold text-gray-900 dark:text-white">{partners.length}</p>
              </div>
              <Users className="w-8 h-8 text-blue-600" />
            </div>
          </div>
          <div className="bg-white dark:bg-slate-800 rounded-lg p-4 shadow">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600 dark:text-gray-400">Approved</p>
                <p className="text-2xl font-bold text-green-600">
                  {partners.filter(p => p.status === 'approved' || p.status === 'active').length}
                </p>
              </div>
              <CheckCircle className="w-8 h-8 text-green-600" />
            </div>
          </div>
          <div className="bg-white dark:bg-slate-800 rounded-lg p-4 shadow">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600 dark:text-gray-400">Pending Review</p>
                <p className="text-2xl font-bold text-yellow-600">
                  {partners.filter(p => p.status === 'pending').length}
                </p>
              </div>
              <Clock className="w-8 h-8 text-yellow-600" />
            </div>
          </div>
        </div>

        {/* Message */}
        {message.text && (
          <div className={`p-4 rounded-lg font-semibold flex justify-between items-center ${
            message.type === 'success'
              ? 'bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-200'
              : 'bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-200'
          }`}>
            <span>{message.text}</span>
            {message.type === 'error' && (
              <button
                onClick={() => setMessage({ type: '', text: '' })}
                className="text-lg font-bold hover:opacity-75"
              >
                ✕
              </button>
            )}
          </div>
        )}

        {/* Filter */}
        <div className="bg-white dark:bg-slate-800 rounded-lg p-4 shadow flex flex-wrap items-center gap-2">
          <Filter className="w-5 h-5 text-gray-600 dark:text-gray-400" />
          <span className="text-sm font-semibold text-gray-700 dark:text-gray-300">Filter by Status:</span>
          <div className="flex flex-wrap gap-2">
            {['all', ...statusOptions].map(status => (
              <button
                key={status}
                onClick={() => setFilterStatus(status)}
                className={`px-4 py-2 rounded-lg text-sm font-semibold transition ${
                  filterStatus === status
                    ? 'bg-blue-600 text-white'
                    : 'bg-gray-200 dark:bg-slate-700 text-gray-700 dark:text-gray-300 hover:bg-gray-300 dark:hover:bg-slate-600'
                }`}
              >
                {status.charAt(0).toUpperCase() + status.slice(1)}
              </button>
            ))}
          </div>
        </div>

        {/* Table */}
        <div className="bg-white dark:bg-slate-800 rounded-lg shadow overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead className="bg-gray-100 dark:bg-slate-700 sticky top-0">
                <tr className="border-b dark:border-slate-600">
                  <th className="px-4 py-3 text-left font-semibold text-gray-900 dark:text-white">Partner Name</th>
                  <th className="px-4 py-3 text-left font-semibold text-gray-900 dark:text-white">Phone</th>
                  <th className="px-4 py-3 text-left font-semibold text-gray-900 dark:text-white">Vehicle</th>
                  <th className="px-4 py-3 text-left font-semibold text-gray-900 dark:text-white">EV Type</th>
                  <th className="px-4 py-3 text-left font-semibold text-gray-900 dark:text-white">Status</th>
                  <th className="px-4 py-3 text-left font-semibold text-gray-900 dark:text-white">Date</th>
                  <th className="px-4 py-3 text-center font-semibold text-gray-900 dark:text-white">Actions</th>
                </tr>
              </thead>
              <tbody>
                {paginatedPartners.length > 0 ? (
                  paginatedPartners.map((partner, index) => (
                    <tr key={partner._id || index} className="border-b dark:border-slate-700 hover:bg-gray-50 dark:hover:bg-slate-700/50 transition">
                      <td className="px-4 py-3 text-gray-900 dark:text-white font-semibold">
                        {partner.ownerName}
                      </td>
                      <td className="px-4 py-3 text-gray-600 dark:text-gray-400">
                        {partner.phone}
                      </td>
                      <td className="px-4 py-3 text-gray-600 dark:text-gray-400">
                        {partner.vehicleDetails?.model || 'N/A'}
                      </td>
                      <td className="px-4 py-3 text-gray-600 dark:text-gray-400">
                        <span className="bg-blue-100 dark:bg-blue-900/30 text-blue-800 dark:text-blue-200 px-2 py-1 rounded text-xs">
                          {partner.vehicleDetails?.evType || 'N/A'}
                        </span>
                      </td>
                      <td className="px-4 py-3">
                        {editingId === partner._id ? (
                          <select
                            value={editStatus}
                            onChange={(e) => {
                              setEditStatus(e.target.value);
                              handleStatusUpdate(partner._id, e.target.value);
                            }}
                            className="px-2 py-1 rounded border dark:bg-slate-700 dark:border-slate-600 dark:text-white text-xs"
                          >
                            {statusOptions.map(status => (
                              <option key={status} value={status}>
                                {status.charAt(0).toUpperCase() + status.slice(1)}
                              </option>
                            ))}
                          </select>
                        ) : (
                          <span className={`inline-flex items-center gap-1 px-3 py-1 rounded-full text-xs font-semibold ${statusColors[partner.status] || statusColors.pending}`}>
                            {statusIcons[partner.status]}
                            {partner.status.charAt(0).toUpperCase() + partner.status.slice(1)}
                          </span>
                        )}
                      </td>
                      <td className="px-4 py-3 text-gray-600 dark:text-gray-400 text-xs">
                        <div>
                          {new Date(partner.createdAt).toLocaleDateString()}
                        </div>
                        <div className="text-xs text-gray-500 dark:text-gray-500">
                          {new Date(partner.createdAt).toLocaleTimeString('en-IN', { hour: '2-digit', minute: '2-digit' })}
                        </div>
                      </td>
                      <td className="px-4 py-3">
                        <div className="flex items-center justify-center gap-2">
                          <button
                            onClick={() => {
                              setEditingId(partner._id);
                              setEditStatus(partner.status);
                            }}
                            className="p-1 hover:bg-blue-100 dark:hover:bg-blue-900/30 rounded transition text-blue-600"
                            title="Edit status"
                          >
                            <Edit className="w-4 h-4" />
                          </button>
                          <button
                            onClick={() => handleDelete(partner._id)}
                            className="p-1 hover:bg-red-100 dark:hover:bg-red-900/30 rounded transition text-red-600"
                            title="Delete"
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                          {partner.documents?.rcDocumentUrl && (
                            <a
                              href={partner.documents.rcDocumentUrl}
                              target="_blank"
                              rel="noopener noreferrer"
                              className="p-1 hover:bg-green-100 dark:hover:bg-green-900/30 rounded transition text-green-600"
                              title="View RC"
                            >
                              <Eye className="w-4 h-4" />
                            </a>
                          )}
                        </div>
                      </td>
                    </tr>
                  ))
                ) : (
                  <tr>
                    <td colSpan="7" className="px-4 py-8 text-center text-gray-600 dark:text-gray-400">
                      <div className="text-center">
                        <Users className="w-12 h-12 text-gray-400 dark:text-gray-600 mx-auto mb-2 opacity-50" />
                        <p className="text-sm">No cab partners found</p>
                      </div>
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>

        {/* Pagination */}
        {totalFilteredPages > 1 && (
          <div className="flex items-center justify-center gap-2">
            <button
              onClick={() => setCurrentPage(prev => Math.max(1, prev - 1))}
              disabled={currentPage === 1}
              className="px-3 py-2 rounded bg-gray-200 dark:bg-slate-700 text-gray-900 dark:text-white disabled:opacity-50 transition"
            >
              Previous
            </button>
            <span className="text-gray-600 dark:text-gray-400 text-sm">
              Page {currentPage} of {totalFilteredPages}
            </span>
            <button
              onClick={() => setCurrentPage(prev => Math.min(totalFilteredPages, prev + 1))}
              disabled={currentPage === totalFilteredPages}
              className="px-3 py-2 rounded bg-gray-200 dark:bg-slate-700 text-gray-900 dark:text-white disabled:opacity-50 transition"
            >
              Next
            </button>
          </div>
        )}
      </div>
    </AdminLayout>
  );
}
