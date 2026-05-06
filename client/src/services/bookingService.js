import api from './api.js';

export const createBooking = async (bookingData) => {
  const { data } = await api.post('/bookings', bookingData);
  return data;
};

export const getMyBookings = async (page = 1, limit = 10, status) => {
  const params = { page, limit };
  if (status) params.status = status;
  const { data } = await api.get('/bookings', { params });
  return data;
};

export const getBookingById = async (id) => {
  const { data } = await api.get(`/bookings/${id}`);
  return data;
};

export const cancelBooking = async (id, reason) => {
  const { data } = await api.put(`/bookings/${id}/cancel`, { reason });
  return data;
};

export const getDriverBookings = async () => {
  const { data } = await api.get('/driver/my-bookings');
  return data;
};

export const getMyTourBookings = async () => {
  const { data } = await api.get('/tours/my-bookings');
  return data;
};

export const getTourBookingById = async (id) => {
  const { data } = await api.get(`/tours/${id}`);
  return data;
};

// Legacy object support
export const bookingService = {
  createBooking,
  getMyBookings,
  getBookingById,
  cancelBooking,
  getDriverBookings,
  getMyTourBookings,
  getTourBookingById
};

export default bookingService;
