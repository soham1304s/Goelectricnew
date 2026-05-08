import api from './api.js';
import { retryWithBackoff } from './retryUtils.js';

// ============ USERS ============
export async function getAllUsers(params = {}) {
  const { data } = await retryWithBackoff(() => api.get('/admin/users', { params }));
  return data;
}

export async function deleteUser(id) {
  const { data } = await api.delete(`/admin/users/${id}`);
  return data;
}

export async function updateUserStatus(id, isActive) {
  const { data } = await api.patch(`/admin/users/${id}/status`, { isActive });
  return data;
}

// ============ DRIVERS ============
export async function getAllDrivers(params = {}) {
  const { data } = await retryWithBackoff(() => api.get('/admin/drivers', { params }));
  return data;
}

export async function deleteDriver(id) {
  const { data } = await api.delete(`/admin/drivers/${id}`);
  return data;
}

export async function updateDriverStatus(id, status) {
  const { data } = await api.patch(`/admin/drivers/${id}/status`, { status });
  return data;
}

// ============ RIDE BOOKINGS ============
export async function getAdminBookings(params = {}) {
  const { data } = await api.get('/admin/bookings', { params });
  return data;
}

export async function getAllRideBookings(params = {}) {
  const { data } = await retryWithBackoff(() => api.get('/admin/bookings', { params }));
  return data;
}

export async function deleteBooking(id) {
  const { data } = await api.delete(`/admin/bookings/${id}`);
  return data;
}

export async function updateBookingStatus(id, status) {
  const { data } = await api.patch(`/admin/bookings/${id}/status`, { status });
  return data;
}

export async function getAllBookings(params = {}) {
  const { data } = await retryWithBackoff(() => api.get('/admin/bookings', { params }));
  return data;
}

export async function confirmBooking(id) {
  const { data } = await api.put(`/bookings/${id}/confirm`, {});
  return data;
}

export async function completeBooking(id) {
  const { data } = await api.put(`/bookings/${id}/complete`, {});
  return data;
}

export async function collectPayment(id, paymentData = {}) {
  const { data } = await api.post(`/bookings/${id}/collect-payment`, paymentData);
  return data;
}

// ============ TOUR BOOKINGS ============
export async function getAdminTourBookings(params = {}) {
  const { data } = await retryWithBackoff(() => api.get('/admin/tour-bookings', { params }));
  return data;
}

export async function getAllTourBookings(params = {}) {
  const { data } = await retryWithBackoff(() => api.get('/admin/tour-bookings', { params }));
  return data;
}

export async function getTourPaymentHistory(tourBookingId) {
  const { data } = await api.get(`/admin/tour-bookings/${tourBookingId}/payments`);
  return data;
}

export async function deleteTourBooking(id) {
  const { data } = await api.delete(`/admin/tour-bookings/${id}`);
  return data;
}

export async function updateTourBookingStatus(id, body) {
  const { data } = await api.patch(`/admin/tour-bookings/${id}`, body);
  return data;
}

export async function collectTourPayment(id, paymentData = {}) {
  const { data } = await api.post(`/admin/tour-bookings/${id}/collect-payment`, paymentData);
  return data;
}

// ============ PACKAGES ============
export async function getAllPackages(params = {}) {
  const { data } = await retryWithBackoff(() => api.get('/admin/packages', { params }));
  return data;
}

export async function createPackage(data) {
  const response = await api.post('/admin/packages', data);
  return response.data;
}

export async function updatePackage(id, data) {
  const { data: responseData } = await api.put(`/admin/packages/${id}`, data);
  return responseData;
}

export async function deletePackage(id) {
  const { data } = await api.delete(`/admin/packages/${id}`);
  return data;
}

// ============ ANALYTICS ============
export async function getAdminAnalytics() {
  const { data } = await api.get('/admin/analytics');
  return data;
}

export async function getAnalytics() {
  const { data } = await api.get('/admin/analytics');
  return data;
}

// ============ FEEDBACK ============
export async function getAdminFeedback(params = {}) {
  const { data } = await api.get('/admin/feedback', { params });
  return data;
}

export async function getAllFeedback(params = {}) {
  const { data } = await api.get('/admin/feedback', { params });
  return data;
}

export async function deleteFeedback(id) {
  const { data } = await api.delete(`/admin/feedback/${id}`);
  return data;
}

export async function createFeedbackAdmin(feedbackData) {
  const { data } = await api.post('/admin/feedback', feedbackData);
  return data;
}

// ============ ADMIN SETTINGS ============
export async function getAdminProfile() {
  const { data } = await api.get('/admin/profile');
  return data;
}

export async function changeAdminPassword(passwordData) {
  const { data } = await api.post('/admin/change-password', passwordData);
  return data;
}

// ============ PAYMENTS ============
export async function getAllPayments(params = {}) {
  const { data } = await api.get('/admin/payments', { params });
  return data;
}

// ============ PRICING & RATES ============
export async function getCarRates() {
  try {
    const { data } = await api.get('/admin/pricing/rates');
    return data;
  } catch (error) {
    console.error('Error fetching car rates:', error);
    // Return default rates if API fails
    return {
      success: true,
      data: [
        { id: 'economy', name: 'Economy', baseRate: 10, maxPassengers: 4, description: 'Compact and economical' },
        { id: 'premium', name: 'Premium', baseRate: 18, maxPassengers: 6, description: 'Premium and luxurious' },
      ]
    };
  }
}

export async function updateCarRate(rateId, rateData) {
  try {
    const { data } = await api.patch(`/admin/pricing/rates/${rateId}`, rateData);
    return data;
  } catch (error) {
    console.error('Error updating car rate:', error);
    return { success: false, message: 'Failed to update rate' };
  }
}

export async function updateAllCarRates(ratesData) {
  try {
    const { data } = await api.post('/admin/pricing/rates/bulk', { rates: ratesData });
    return data;
  } catch (error) {
    console.error('Error updating all car rates:', error);
    return { success: false, message: 'Failed to update rates' };
  }
}
