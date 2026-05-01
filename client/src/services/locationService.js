import api from './api.js';

const REVERSE_GEOCODE_CACHE_TTL_MS = 5 * 60 * 1000;
const reverseGeocodeCache = new Map();
const reverseGeocodeRequests = new Map();

function getReverseGeocodeCacheKey(lat, lon) {
  return `${Number.parseFloat(lat).toFixed(6)}:${Number.parseFloat(lon).toFixed(6)}`;
}

function getCachedReverseGeocode(cacheKey) {
  const cachedEntry = reverseGeocodeCache.get(cacheKey);
  if (!cachedEntry) {
    return null;
  }

  if (cachedEntry.expiresAt <= Date.now()) {
    reverseGeocodeCache.delete(cacheKey);
    return null;
  }

  return cachedEntry.value;
}

function setCachedReverseGeocode(cacheKey, value) {
  reverseGeocodeCache.set(cacheKey, {
    value,
    expiresAt: Date.now() + REVERSE_GEOCODE_CACHE_TTL_MS,
  });
}

/**
 * Estimate distance between pickup and drop
 * @param {string} pickup - Pickup address
 * @param {string} drop - Drop address
 * @param {{ lat: number, lon: number } | null} pickupCoords - Precise pickup coords when from geolocation
 * @returns {Promise<{ distance: number, duration: number }>}
 */
export async function estimateDistance(pickup, drop, pickupCoords = null) {
  const body = { pickup, drop };
  const lat = pickupCoords?.lat || pickupCoords?.latitude;
  const lon = pickupCoords?.lon || pickupCoords?.longitude || pickupCoords?.lng;
  
  if (typeof lat === 'number' && typeof lon === 'number') {
    body.pickupCoords = { lat, lon };
  }
  try {
    console.log('Estimating distance with:', body);
    const { data } = await api.post('/location/estimate', body);
    console.log('Distance estimate response:', data);
    if (!data?.success || !data?.data) {
      const errorMsg = data?.message || 'Failed to estimate distance';
      throw new Error(errorMsg);
    }
    return data.data;
  } catch (error) {
    // Extract meaningful error message
    console.error('Distance estimate error:', error);
    const errorMsg = error?.response?.data?.message || error?.message || 'Failed to calculate distance';
    throw new Error(errorMsg);
  }
}

/**
 * Reverse geocode: convert lat/lon to human-readable address
 * Uses backend first; falls back to Google Reverse Geocoding if backend fails
 * @returns {Promise<{ address: string, lat: number, lon: number }>}
 */
export async function reverseGeocode(lat, lon) {
  const cacheKey = getReverseGeocodeCacheKey(lat, lon);
  const cachedResult = getCachedReverseGeocode(cacheKey);
  if (cachedResult) {
    return cachedResult;
  }

  const inFlightRequest = reverseGeocodeRequests.get(cacheKey);
  if (inFlightRequest) {
    return inFlightRequest;
  }

  const requestPromise = (async () => {
    try {
      const { data } = await api.get('/location/reverse-geocode', {
        params: { lat, lon },
      });
      if (data?.success && data?.data?.address) {
        setCachedReverseGeocode(cacheKey, data.data);
        return data.data;
      }
    } catch {
      /* Backend failed, use fallback */
    }

    const fallbackResult = await fallbackGoogleReverseGeocode(lat, lon);
    setCachedReverseGeocode(cacheKey, fallbackResult);
    return fallbackResult;
  })().finally(() => {
    reverseGeocodeRequests.delete(cacheKey);
  });

  reverseGeocodeRequests.set(cacheKey, requestPromise);
  return requestPromise;
}

/** Fallback when backend is unavailable - use Google Reverse Geocoding directly */
async function fallbackGoogleReverseGeocode(lat, lon) {
  try {
    const apiKey = import.meta.env.VITE_GOOGLE_MAPS_API_KEY;
    if (!apiKey) {
      throw new Error('Google API key not configured');
    }
    
    const res = await fetch(
      `https://maps.googleapis.com/maps/api/geocode/json?latlng=${lat},${lon}&key=${apiKey}`,
      { headers: { 'Accept-Language': 'en' } }
    );
    if (!res.ok) throw new Error('Geocoding unavailable');
    const data = await res.json();
    
    if (data.status === 'OK' && data.results.length > 0) {
      const address = data.results[0].formatted_address || '';
      return { address: address || `${lat.toFixed(6)}, ${lon.toFixed(6)}`, lat, lon };
    }
    
    throw new Error('No results from Google');
  } catch (error) {
    console.warn('Google Reverse Geocoding fallback failed:', error.message);
    // Return coordinate-based address as last resort
    return { address: `Location (${lat.toFixed(6)}, ${lon.toFixed(6)})`, lat, lon };
  }
}
