import api from './api.js';

// Cache rates with TTL
const RATE_CACHE_TTL = 1 * 60 * 1000; // 1 minute (reduced from 5 for faster updates)
let cachedRates = null;
let cacheTimestamp = null;

/**
 * Get cached rates if still valid
 */
const getCachedRates = () => {
  if (cachedRates && cacheTimestamp && Date.now() - cacheTimestamp < RATE_CACHE_TTL) {
    return cachedRates;
  }
  return null;
};

/**
 * Clear the rate cache (used when admin updates pricing)
 */
export const clearRateCache = () => {
  cachedRates = null;
  cacheTimestamp = null;
  console.log('🗑️ Rate cache cleared');
};

/**
 * Fetch car rates from admin/backend
 * Returns array of car rate objects with pricing
 */
export const fetchCarRates = async (forceRefresh = false) => {
  try {
    // Check cache first
    if (!forceRefresh) {
      const cached = getCachedRates();
      if (cached) {
        console.log('📊 Using cached rates');
        return cached;
      }
    }

    console.log('📡 Fetching rates from server...', forceRefresh ? '(forced refresh)' : '');
    
    // Try to fetch from backend
    try {
      // Add cache-busting parameter when force refreshing
      const params = forceRefresh ? `?t=${Date.now()}` : '';
      const response = await api.get(`/pricing/app/rates${params}`);
      
      if (response.data?.success && response.data?.data) {
        const rates = response.data.data;
        
        // Cache the rates
        cachedRates = rates;
        cacheTimestamp = Date.now();
        
        console.log('✅ Rates fetched from server:', rates);
        return rates;
      }
    } catch (apiError) {
      console.warn('⚠️ Failed to fetch rates from API, using defaults');
    }

    // Return default rates if API fails
    return getDefaultRates();
  } catch (error) {
    console.error('❌ Error fetching rates:', error);
    return getDefaultRates();
  }
};

/**
 * Get default rates (fallback)
 */
export const getDefaultRates = () => {
  return [
    { id: 'economy', name: 'Economy', baseRate: 10, maxPassengers: 4, description: 'Compact and economical' },
    { id: 'premium', name: 'Premium', baseRate: 18, maxPassengers: 6, description: 'Premium and luxurious' },
  ];
};

/**
 * Update (save) car rates in backend
 */
export const updateCarRates = async (rates) => {
  try {
    console.log('💾 Saving rates to server...', rates);
    
    const response = await api.post('/pricing/app/rates', { rates });
    
    if (response.data?.success) {
      // Clear cache to force refresh next time
      cachedRates = null;
      cacheTimestamp = null;
      
      console.log('✅ Rates saved successfully');
      return response.data;
    }
    
    throw new Error(response.data?.message || 'Failed to save rates');
  } catch (error) {
    console.error('❌ Error saving rates:', error);
    throw error;
  }
};

/**
 * Get rate by car ID
 */
export const getRateById = async (carId) => {
  try {
    const rates = await fetchCarRates();
    return rates.find(rate => rate.id === carId);
  } catch (error) {
    console.error('Error getting rate by ID:', error);
    return null;
  }
};

/**
 * Format rate data for display
 */
export const formatRate = (rate) => {
  return {
    ...rate,
    displayRate: `₹${rate.baseRate || 0}/km`,
  };
};

export default {
  fetchCarRates,
  updateCarRates,
  getRateById,
  getDefaultRates,
  clearRateCache,
  formatRate,
};
