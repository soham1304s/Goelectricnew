import api from './api.js';

/**
 * Public: get packages for home page (optional filter by tourCategory: travel_tour | temple_tour)
 */
export function getPackages(tourCategory = '') {
  const params = tourCategory ? { tourCategory } : {};
  return api
    .get('/packages', { params })
    .then((res) => res.data)
    .catch((error) => {
      if (error.code === 'ERR_NETWORK') {
        throw new Error('Cannot reach server. Ensure backend is running on port 5000.');
      }
      throw error;
    });
}

/**
 * Admin: list all tour packages (optional filter)
 */
export function getAdminPackages(tourCategory = '') {
  const params = tourCategory ? { tourCategory } : {};
  return api.get('/admin/packages', { params }).then((res) => res.data);
}

/**
 * Admin: create a tour package (Travel Tour or Temple Tour)
 */
export function createPackage(data) {
  return api.post('/admin/packages', data).then((res) => res.data);
}

/**
 * Admin: update a tour package
 */
export function updatePackage(id, data) {
  return api.put(`/admin/packages/${id}`, data).then((res) => res.data);
}

/**
 * Admin: delete a tour package
 */
export function deletePackage(id) {
  return api.delete(`/admin/packages/${id}`).then((res) => res.data);
}

/**
 * Create tour booking (user)
 */
export function createTourBooking(data) {
  return api.post('/tour-bookings', data).then((res) => res.data);
}

/**
 * Get user's tour bookings
 */
export function getMyTourBookings(page = 1, limit = 10, status) {
  const params = { page, limit };
  if (status) params.status = status;
  return api.get('/tour-bookings/my-bookings', { params }).then((res) => res.data);
}

/**
 * Get a specific tour booking by ID
 */
export function getTourBookingById(bookingId) {
  return api.get(`/tour-bookings/${bookingId}`).then((res) => res.data);
}

/**
 * Admin: upload package cover image
 */
export async function uploadPackageImage(file) {
  const formData = new FormData();
  formData.append('image', file);
  const { data } = await api.post('/admin/upload-image', formData);
  return data;
}
