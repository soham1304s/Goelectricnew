import api from './api.js';

export const pricingService = {
  async getAllPricing() {
    const { data } = await api.get('/pricing');
    return data;
  },

  async getPricingByCabType(cabType) {
    const { data } = await api.get(`/pricing/${cabType}`);
    return data;
  },
};

export default pricingService;
