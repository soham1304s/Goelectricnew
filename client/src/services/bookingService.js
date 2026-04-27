import api from './api.js';

export const bookingService = {
  async createBooking(bookingData) {
    const { data } = await api.post('/bookings', bookingData);
    return data;
  },

  async getMyBookings(page = 1, limit = 10, status) {
    const params = { page, limit };
    if (status) params.status = status;
    const { data } = await api.get('/bookings', { params });
    return data;
  },

  async getBookingById(id) {
    const { data } = await api.get(`/bookings/${id}`);
    return data;
  },

  async cancelBooking(id, reason) {
    const { data } = await api.put(`/bookings/${id}/cancel`, { reason });
    return data;
  }
};

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

export default bookingService;