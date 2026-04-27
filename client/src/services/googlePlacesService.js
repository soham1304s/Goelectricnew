/**
 * Google Places Autocomplete Service
 * Uses backend proxy to avoid CORS issues with Google Maps API
 */

import api from './api.js';

// Jaipur city center for search bias
const JAIPUR_CENTER = {
  lat: 26.9124,
  lng: 75.7873,
};

/**
 * Get autocomplete predictions for a location query
 * @param {string} input - User input
 * @param {Object} options - Search options
 * @returns {Promise<Array>} Array of location suggestions
 */
export async function getLocationPredictions(input, options = {}) {
  // ✅ INPUT VALIDATION: Require at least 2 characters to avoid too many API calls
  if (!input || input.trim().length < 2) {
    console.log(`⚠️ Input too short: "${input}" - returning empty suggestions`);
    return [];
  }

  const {
    locationBias = JAIPUR_CENTER,
    radius = 50000,
    components = 'country:in',
    language = 'en',
    strictbounds = true, // ✅ Force India boundaries
  } = options;

  try {
    console.log(`🔍 Searching for: "${input}" (location bias: ${locationBias.lat}, ${locationBias.lng})`);
    
    const response = await api.get('/location/google-places/autocomplete', {
      params: {
        input: input.trim(),
        components,
        language,
        location: `${locationBias.lat},${locationBias.lng}`,
        radius,
        strictbounds,
      },
    });

    if (response.data.success) {
      const predictions = response.data.data?.predictions || [];
      console.log(`✅ Got ${predictions.length} predictions from Google Places API for "${input}"`);
      
      if (predictions.length > 0) {
        return predictions.map((pred) => ({
          placeId: pred.place_id,
          description: pred.description,
          mainText: pred.main_text,
          secondaryText: pred.secondary_text,
        }));
      }
    }

    console.log(`ℹ️ Google Places returned no results for "${input}"`);
    return [];
  } catch (error) {
    console.warn(`⚠️ Google Places API error: ${error.message}`);
    return [];
  }
}

/**
 * Get details of a specific place including coordinates
 * @param {string} placeId - Google Place ID
 * @returns {Promise<Object>} Place details with coordinates
 */
export async function getPlaceDetails(placeId) {
  // Handle fallback locations
  if (placeId.startsWith('fallback_')) {
    return null;
  }

  try {
    // Use backend proxy to avoid CORS issues
    const response = await api.get('/location/google-places/details', {
      params: {
        place_id: placeId,
      },
    });

    if (response.data.success && response.data.data.status === 'OK' && response.data.data.result) {
      const result = response.data.data.result;
      return {
        address: result.formatted_address || result.name,
        name: result.name,
        lat: result.geometry?.location?.lat,
        lng: result.geometry?.location?.lng,
        placeId: placeId,
      };
    }

    return null;
  } catch (error) {
    console.error('Error fetching place details:', error);
    return null;
  }
}


