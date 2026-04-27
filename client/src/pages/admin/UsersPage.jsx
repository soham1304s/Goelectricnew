import { useState, useEffect, useRef } from 'react';
import { Search, Filter, Download, Trash2, Eye } from 'lucide-react';
import AdminLayout from './AdminLayout';
import { getAllUsers, deleteUser, updateUserStatus } from '../../services/adminService';

const UsersPage = () => {
  const [users, setUsers] = useState([]);
  const [filteredUsers, setFilteredUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [roleFilter, setRoleFilter] = useState('all');
  const [statusFilter, setStatusFilter] = useState('all');
  const [pagination, setPagination] = useState({ page: 1, pages: 1, total: 0 });
  const [selectedUser, setSelectedUser] = useState(null);
  const [autoRefresh, setAutoRefresh] = useState(false);
  const [lastUpdated, setLastUpdated] = useState(null);
  const hasLoadedRef = useRef(false);
  const requestCountRef = useRef(0);

  const fetchUsers = async (page = 1) => {
    // Prevent excessive requests
    if (requestCountRef.current > 3) {
      console.warn('Too many requests in short time. Skipping...');
      return;
    }
    
    requestCountRef.current++;
    setLoading(true);
    try {
      const response = await getAllUsers({ page, limit: 10, role: roleFilter === 'all' ? undefined : roleFilter, status: statusFilter === 'all' ? undefined : statusFilter });
      console.log('Users response:', response);
      setUsers(response.data.users || []);
      setPagination(response.data.pagination || {});
      setLastUpdated(new Date());
    } catch (error) {
      console.error('Error fetching users:', error);
      // Don't show alert for rate limiting - silently fail
      if (error.response?.status !== 429) {
        alert('Error loading users: ' + error.message);
      }
    } finally {
      setLoading(false);
      // Reset counter after 5 seconds
      setTimeout(() => {
        requestCountRef.current = 0;
      }, 5000);
    }
  };

  // Initial fetch only
  useEffect(() => {
    if (hasLoadedRef.current) return;
    hasLoadedRef.current = true;
    
    fetchUsers(1);
  }, []);

  // Auto-refresh only if manually enabled
  useEffect(() => {
    if (!autoRefresh) return;
    
    let intervalId;
    intervalId = setInterval(() => {
      fetchUsers(pagination.page);
    }, 30000); // 30 seconds to avoid rate limiting
    
    return () => {
      if (intervalId) clearInterval(intervalId);
    };
  }, [autoRefresh, pagination.page]);

  // Handle filter changes with debounce to prevent too many requests
  useEffect(() => {
    const timeoutId = setTimeout(() => {
      if (hasLoadedRef.current) {
        fetchUsers(1);
      }
    }, 1000); // Wait 1 second after filter change before fetching
    
    return () => clearTimeout(timeoutId);
  }, [roleFilter, statusFilter]);

  // Client-side search filtering (no API call)
  useEffect(() => {
    const filtered = users.filter(
      (user) =>
        user.name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        user.email?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        user.phone?.includes(searchTerm)
    );
    setFilteredUsers(filtered);
  }, [searchTerm, users]);

  const handleDelete = async (id) => {
    if (window.confirm('Are you sure you want to delete this user?')) {
      try {
        await deleteUser(id);
        fetchUsers(pagination.page);
      } catch (error) {
        console.error('Error deleting user:', error);
      }
    }
  };

  const handleStatusChange = async (id, newStatus) => {
    try {
      await updateUserStatus(id, newStatus);
      fetchUsers(pagination.page);
    } catch (error) {
      console.error('Error updating user status:', error);
    }
  };

  const downloadCSV = () => {
    const headers = ['Name', 'Email', 'Phone', 'Role', 'Status', 'Joined Date'];
    const rows = users.map((user) => [
      user.name,
      user.email,
      user.phone,
      user.role,
      user.isActive ? 'Active' : 'Inactive',
      new Date(user.createdAt).toLocaleDateString(),
    ]);

    const csv = [headers, ...rows].map((row) => row.join(',')).join('\n');
    const blob = new Blob([csv], { type: 'text/csv' });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'users.csv';
    a.click();
  };

  return (
    <AdminLayout>
      <div className="space-y-4 md:space-y-6">
        {/* Header */}
        <div className="flex flex-col md:flex-row md:justify-between md:items-start gap-4">
          <div className="flex-1 min-w-0">
            <h1 className="text-2xl md:text-3xl font-bold text-gray-900 dark:text-white">
              Users Management
            </h1>
            <p className="text-xs md:text-sm text-gray-600 dark:text-gray-400 mt-1">
              Total Users: <span className="font-bold text-blue-600">{pagination.total}</span>
              {lastUpdated && (
                <span className="block md:inline md:ml-3 text-xs text-gray-500 mt-1 md:mt-0">
                  (Last updated: {lastUpdated.toLocaleTimeString()})
                </span>
              )}
            </p>
          </div>
          <div className="flex items-center gap-2 md:gap-3">
            <button
              onClick={() => setAutoRefresh(!autoRefresh)}
              className={`flex items-center gap-2 px-3 md:px-4 py-2 rounded-lg transition text-sm md:text-base ${
                autoRefresh
                  ? 'bg-green-500 hover:bg-green-600 text-white'
                  : 'bg-gray-500 hover:bg-gray-600 text-white'
              }`}
              title={autoRefresh ? 'Auto-refresh ON' : 'Auto-refresh OFF'}
            >
              <span className="text-xs md:text-sm font-medium">{autoRefresh ? '● Live' : '○ Off'}</span>
            </button>
            <button
              onClick={downloadCSV}
              className="flex items-center gap-2 bg-blue-500 hover:bg-blue-600 text-white px-3 md:px-4 py-2 rounded-lg transition text-sm md:text-base"
            >
              <Download size={16} className="md:w-4 md:h-4" />
              <span className="hidden md:inline">Export CSV</span>
            </button>
          </div>
        </div>

        {/* Filters */}
        <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-4 md:p-6 space-y-4">
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3 md:gap-4">
            {/* Search */}
            <div className="relative sm:col-span-2 lg:col-span-1">
              <Search className="absolute left-3 top-2.5 md:top-3 text-gray-400 md:w-4 md:h-4" size={16} />
              <input
                type="text"
                placeholder="Search by name, email, phone..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-9 md:pl-10 pr-4 py-2 text-sm md:text-base border border-gray-300 dark:border-gray-600 rounded-lg dark:bg-gray-700 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>

            {/* Role Filter */}
            <select
              value={roleFilter}
              onChange={(e) => setRoleFilter(e.target.value)}
              className="px-3 md:px-4 py-2 text-sm md:text-base border border-gray-300 dark:border-gray-600 rounded-lg dark:bg-gray-700 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              <option value="all">All Roles</option>
              <option value="user">User</option>
              <option value="driver">Driver</option>
              <option value="admin">Admin</option>
            </select>

            {/* Status Filter */}
            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              className="px-3 md:px-4 py-2 text-sm md:text-base border border-gray-300 dark:border-gray-600 rounded-lg dark:bg-gray-700 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              <option value="all">All Status</option>
              <option value="active">Active</option>
              <option value="inactive">Inactive</option>
            </select>
          </div>
        </div>

        {/* Users Table */}
        <div className="bg-white dark:bg-gray-800 rounded-lg shadow overflow-hidden">
          {loading ? (
            <div className="p-6 md:p-8 text-center text-gray-500 text-sm md:text-base">Loading users...</div>
          ) : filteredUsers.length === 0 ? (
            <div className="p-6 md:p-8 text-center text-gray-500 text-sm md:text-base">No users found</div>
          ) : (
            <div className="overflow-x-auto">
              {/* Desktop Table View */}
              <table className="w-full hidden md:table">
                <thead className="bg-gray-100 dark:bg-gray-700 border-b border-gray-200 dark:border-gray-600">
                  <tr>
                    <th className="px-4 md:px-6 py-3 md:py-4 text-left text-xs md:text-sm font-semibold text-gray-900 dark:text-white">
                      Name
                    </th>
                    <th className="px-4 md:px-6 py-3 md:py-4 text-left text-xs md:text-sm font-semibold text-gray-900 dark:text-white">
                      Email
                    </th>
                    <th className="px-4 md:px-6 py-3 md:py-4 text-left text-xs md:text-sm font-semibold text-gray-900 dark:text-white">
                      Phone
                    </th>
                    <th className="px-4 md:px-6 py-3 md:py-4 text-left text-xs md:text-sm font-semibold text-gray-900 dark:text-white">
                      Role
                    </th>
                    <th className="px-4 md:px-6 py-3 md:py-4 text-left text-xs md:text-sm font-semibold text-gray-900 dark:text-white">
                      Status
                    </th>
                    <th className="px-4 md:px-6 py-3 md:py-4 text-left text-xs md:text-sm font-semibold text-gray-900 dark:text-white">
                      Joined
                    </th>
                    <th className="px-4 md:px-6 py-3 md:py-4 text-center text-xs md:text-sm font-semibold text-gray-900 dark:text-white">
                      Actions
                    </th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-200 dark:divide-gray-600">
                  {filteredUsers.map((user) => (
                    <tr
                      key={user._id}
                      className="hover:bg-gray-50 dark:hover:bg-gray-700 transition"
                    >
                      <td className="px-4 md:px-6 py-3 md:py-4 text-xs md:text-sm text-gray-900 dark:text-white font-medium">
                        {user.name}
                      </td>
                      <td className="px-4 md:px-6 py-3 md:py-4 text-xs md:text-sm text-gray-600 dark:text-gray-400">{user.email}</td>
                      <td className="px-4 md:px-6 py-3 md:py-4 text-xs md:text-sm text-gray-600 dark:text-gray-400">{user.phone}</td>
                      <td className="px-4 md:px-6 py-3 md:py-4">
                        <span className="px-2 md:px-3 py-1 rounded-full text-xs font-semibold bg-blue-100 text-blue-700 dark:bg-blue-900 dark:text-blue-300">
                          {user.role}
                        </span>
                      </td>
                      <td className="px-4 md:px-6 py-3 md:py-4">
                        <select
                          value={user.isActive ? 'active' : 'inactive'}
                          onChange={(e) =>
                            handleStatusChange(user._id, e.target.value === 'active')
                          }
                          className="px-2 md:px-3 py-1 rounded border border-gray-300 dark:border-gray-600 dark:bg-gray-700 dark:text-white text-xs md:text-sm"
                        >
                          <option value="active">Active</option>
                          <option value="inactive">Inactive</option>
                        </select>
                      </td>
                      <td className="px-4 md:px-6 py-3 md:py-4 text-xs md:text-sm text-gray-600 dark:text-gray-400">
                        <div>
                          {new Date(user.createdAt).toLocaleDateString()}
                        </div>
                        <div className="text-xs text-gray-500 dark:text-gray-500">
                          {new Date(user.createdAt).toLocaleTimeString('en-IN', { hour: '2-digit', minute: '2-digit' })}
                        </div>
                      </td>
                      <td className="px-4 md:px-6 py-3 md:py-4 text-center space-x-1 md:space-x-2">
                        <button
                          onClick={() => setSelectedUser(user)}
                          className="text-blue-500 hover:text-blue-700 transition inline-block"
                        >
                          <Eye size={16} className="md:w-4 md:h-4" />
                        </button>
                        <button
                          onClick={() => handleDelete(user._id)}
                          className="text-red-500 hover:text-red-700 transition inline-block"
                        >
                          <Trash2 size={16} className="md:w-4 md:h-4" />
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>

              {/* Mobile Table View */}
              <div className="md:hidden overflow-x-auto">
                <table className="w-full text-xs">
                  <thead className="bg-gray-100 dark:bg-gray-700 border-b border-gray-200 dark:border-gray-600">
                    <tr>
                      <th className="px-2 py-2 text-left font-semibold text-gray-900 dark:text-white">
                        Name
                      </th>
                      <th className="px-2 py-2 text-left font-semibold text-gray-900 dark:text-white">
                        Email
                      </th>
                      <th className="px-2 py-2 text-left font-semibold text-gray-900 dark:text-white">
                        Role
                      </th>
                      <th className="px-2 py-2 text-left font-semibold text-gray-900 dark:text-white">
                        Status
                      </th>
                      <th className="px-2 py-2 text-center font-semibold text-gray-900 dark:text-white">
                        Actions
                      </th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-200 dark:divide-gray-600">
                    {filteredUsers.map((user) => (
                      <tr
                        key={user._id}
                        className="hover:bg-gray-50 dark:hover:bg-gray-700 transition"
                      >
                        <td className="px-2 py-2 text-xs text-gray-900 dark:text-white font-medium truncate max-w-xs">
                          {user.name}
                        </td>
                        <td className="px-2 py-2 text-xs text-gray-600 dark:text-gray-400 truncate max-w-xs">
                          {user.email}
                        </td>
                        <td className="px-2 py-2">
                          <span className="px-1.5 py-0.5 rounded text-xs font-semibold bg-blue-100 text-blue-700 dark:bg-blue-900 dark:text-blue-300 whitespace-nowrap">
                            {user.role}
                          </span>
                        </td>
                        <td className="px-2 py-2">
                          <select
                            value={user.isActive ? 'active' : 'inactive'}
                            onChange={(e) =>
                              handleStatusChange(user._id, e.target.value === 'active')
                            }
                            className="px-1.5 py-0.5 rounded border border-gray-300 dark:border-gray-600 dark:bg-gray-700 dark:text-white text-xs"
                          >
                            <option value="active">Active</option>
                            <option value="inactive">Inactive</option>
                          </select>
                        </td>
                        <td className="px-2 py-2 text-center space-x-1">
                          <button
                            onClick={() => setSelectedUser(user)}
                            className="text-blue-500 hover:text-blue-700 transition inline-block"
                            title="View"
                          >
                            <Eye size={14} />
                          </button>
                          <button
                            onClick={() => handleDelete(user._id)}
                            className="text-red-500 hover:text-red-700 transition inline-block"
                            title="Delete"
                          >
                            <Trash2 size={14} />
                          </button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}
        </div>

        {/* Pagination */}
        <div className="flex flex-col md:flex-row md:justify-between md:items-center gap-4">
          <p className="text-xs md:text-sm text-gray-600 dark:text-gray-400">
            Total: {pagination.total} users
          </p>
          <div className="flex flex-wrap items-center justify-center gap-2">
            <button
              disabled={pagination.page === 1}
              onClick={() => fetchUsers(pagination.page - 1)}
              className="px-3 md:px-4 py-2 text-sm md:text-base bg-gray-200 dark:bg-gray-700 rounded-lg disabled:opacity-50 transition"
            >
              Previous
            </button>
            <span className="text-xs md:text-sm text-gray-600 dark:text-gray-400 px-2">
              Page {pagination.page} of {pagination.pages}
            </span>
            <button
              disabled={pagination.page === pagination.pages}
              onClick={() => fetchUsers(pagination.page + 1)}
              className="px-3 md:px-4 py-2 text-sm md:text-base bg-gray-200 dark:bg-gray-700 rounded-lg disabled:opacity-50 transition"
            >
              Next
            </button>
          </div>
        </div>

        {/* User Detail Modal */}
        {selectedUser && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
            <div className="bg-white dark:bg-gray-800 rounded-lg max-w-md w-full p-4 md:p-6 space-y-4">
              <h2 className="text-xl md:text-2xl font-bold text-gray-900 dark:text-white">User Details</h2>
              <div className="space-y-3 text-sm md:text-base text-gray-700 dark:text-gray-300">
                <p>
                  <strong>Name:</strong> <span className="block md:inline ml-0 md:ml-2">{selectedUser.name}</span>
                </p>
                <p>
                  <strong>Email:</strong> <span className="block md:inline ml-0 md:ml-2 break-all">{selectedUser.email}</span>
                </p>
                <p>
                  <strong>Phone:</strong> <span className="block md:inline ml-0 md:ml-2">{selectedUser.phone}</span>
                </p>
                <p>
                  <strong>Role:</strong> <span className="block md:inline ml-0 md:ml-2">{selectedUser.role}</span>
                </p>
                <p>
                  <strong>Joined:</strong> <span className="block md:inline ml-0 md:ml-2">{new Date(selectedUser.createdAt).toLocaleString()}</span>
                </p>
              </div>
              <button
                onClick={() => setSelectedUser(null)}
                className="w-full bg-blue-500 hover:bg-blue-600 text-white px-4 py-2 md:py-3 rounded-lg transition text-sm md:text-base font-medium"
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

export default UsersPage;
