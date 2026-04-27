import api from './api.js';

const offerService = {
  // Get active offer (public)
  getActiveOffer: async () => {
    try {
      const response = await api.get('/offers/active');
      return response.data.data;
    } catch (error) {
      console.error('Error fetching active offer:', error);
      return null;
    }
  },

  // Admin: Create offer
  createOffer: async (offerData) => {
    const response = await api.post('/offers', offerData);
    return response.data;
  },

  // Admin: Get all offers
  getAllOffers: async () => {
    const response = await api.get('/offers/admin/all');
    return response.data.data;
  },

  // Admin: Update offer
  updateOffer: async (id, offerData) => {
    const response = await api.put(`/offers/${id}`, offerData);
    return response.data;
  },

  // Admin: Delete offer
  deleteOffer: async (id) => {
    const response = await api.delete(`/offers/${id}`);
    return response.data;
  },

  // Admin: Toggle offer status
  toggleOfferStatus: async (id) => {
    const response = await api.patch(`/offers/${id}/toggle`);
    return response.data;
  },
};

export default offerService;
