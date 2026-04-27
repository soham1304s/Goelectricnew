/**
 * Google Maps Service
 * Handles all Google Maps API interactions - Places, Distance Matrix, Geocoding, Directions
 */

import api from './api.js';

const JAIPUR_CENTER = {
  lat: 26.9124,
  lng: 75.7873,
};

/**
 * Get location predictions using Google Places Autocomplete
 * Searches for places matching user input
 */
export async function getLocationPredictions(input, options = {}) {
  if (!input.trim() || input.length < 1) {
    return [];
  }

  const {
    locationBias = JAIPUR_CENTER,
    radius = 50000,
    components = 'country:in',
    language = 'en',
    strictbounds = false,
  } = options;

  try {
    console.log(`🔍 Searching locations for: "${input}"`);
    
    const response = await api.get('/location/google-places/autocomplete', {
      params: {
        input,
        components,
        language,
        location: `${locationBias.lat},${locationBias.lng}`,
        radius,
        strictbounds,
      },
    });

    if (
      response.data.success &&
      response.data.data.status === 'OK' &&
      response.data.data.predictions
    ) {
      console.log(
        `✅ Found ${response.data.data.predictions.length} predictions for "${input}"`
      );
      return response.data.data.predictions.map((pred) => ({
        placeId: pred.place_id,
        description: pred.description,
        mainText: pred.main_text,
        secondaryText: pred.secondary_text,
      }));
    }

    console.warn('No predictions found from Google Places');
    return [];
  } catch (error) {
    console.error('❌ Location prediction error:', error.message);
    return [];
  }
}

/**
 * Get detailed information about a place including coordinates
 */
export async function getPlaceDetails(placeId) {
  if (!placeId) {
    return null;
  }

  try {
    console.log(`📍 Fetching details for place ID: ${placeId}`);
    
    const response = await api.get('/location/google-places/details', {
      params: {
        place_id: placeId,
      },
    });

    if (
      response.data.success &&
      response.data.data.status === 'OK' &&
      response.data.data.result
    ) {
      const result = response.data.data.result;
      
      const details = {
        address: result.formatted_address || result.name,
        name: result.name,
        lat: result.geometry?.location?.lat,
        lng: result.geometry?.location?.lng,
        placeId: placeId,
      };
      
      console.log(`✅ Got place details:`, details);
      return details;
    }

    console.warn('Failed to get place details from API');
    return null;
  } catch (error) {
    console.error('❌ Place details error:', error.message);
    return null;
  }
}

/**
 * Estimate distance and duration between two locations
 * Uses Google Maps Distance Matrix API via backend proxy
 */
export async function estimateDistance(pickup, drop, pickupCoords = null) {
  if (!pickup.trim() || !drop.trim()) {
    throw new Error('Pickup and drop locations are required');
  }

  try {
    console.log('📏 Calculating distance:', {
      pickup: pickup.trim(),
      drop: drop.trim(),
      pickupCoords,
    });

    const body = {
      pickup: pickup.trim(),
      drop: drop.trim(),
    };

    if (
      pickupCoords &&
      typeof pickupCoords.lat === 'number' &&
      typeof pickupCoords.lng === 'number'
    ) {
      body.pickupCoords = {
        lat: pickupCoords.lat,
        lon: pickupCoords.lng,
      };
    }

    const response = await api.post('/location/estimate', body);

    if (response.data.success && response.data.data) {
      const result = response.data.data;
      
      console.log('✅ Distance calculated:', {
        distance: result.distance,
        duration: result.duration,
        method: result.method,
        distanceText: result.distanceText,
        durationText: result.durationText,
      });

      return {
        distance: result.distance, // in km
        duration: result.duration, // in minutes
        method: result.method,
        distanceText: result.distanceText,
        durationText: result.durationText,
        pickupCoords: result.pickupCoords,
        dropCoords: result.dropCoords,
      };
    }

    throw new Error(response.data.message || 'Failed to calculate distance');
  } catch (error) {
    console.error('❌ Distance estimation error:', error.message);
    throw error;
  }
}

/**
 * Get directions between two locations (for future use)
 */
export async function getDirections(origin, destination) {
  if (!origin || !destination) {
    throw new Error('Origin and destination are required');
  }

  try {
    const apiKey = import.meta.env.VITE_GOOGLE_MAPS_API_KEY;
    if (!apiKey) {
      throw new Error('Google Maps API key not configured');
    }

    const url = 'https://maps.googleapis.com/maps/api/directions/json';
    const params = new URLSearchParams({
      origin,
      destination,
      key: apiKey,
      mode: 'driving',
    });

    // Note: This call is made from frontend, so it goes directly to Google
    // For production, it's better to route through backend to avoid CORS issues
    const response = await fetch(`${url}?${params.toString()}`);
    const data = await response.json();

    if (data.status === 'OK' && data.routes.length > 0) {
      return data.routes[0];
    }

    throw new Error(`Directions API error: ${data.status}`);
  } catch (error) {
    console.error('❌ Directions error:', error.message);
    throw error;
  }
}

/**
 * Format distance for display
 */
export function formatDistance(km) {
  if (km < 1) {
    return `${Math.round(km * 1000)}m`;
  }
  return `${parseFloat(km.toFixed(2))}km`;
}

/**
 * Format duration for display
 */
export function formatDuration(minutes) {
  if (minutes < 60) {
    return `${Math.round(minutes)}min`;
  }

  const hours = Math.floor(minutes / 60);
  const mins = Math.round(minutes % 60);

  if (mins === 0) {
    return `${hours}h`;
  }

  return `${hours}h ${mins}min`;
}

/**
 * Get address from coordinates using Google Geocoding API
 * Reverse geocoding: Lat/Lng -> Address
 */
export async function getReverseGeocodedAddress(latitude, longitude) {
  if (!latitude || !longitude) {
    throw new Error('Latitude and longitude are required');
  }

  try {
    console.log(`📍 Reverse geocoding: ${latitude}, ${longitude}`);
    
    const response = await api.get('/location/reverse-geocode', {
      params: {
        lat: latitude,
        lon: longitude,
      },
    });

    if (response.data.success && response.data.data) {
      const address = response.data.data.address || '';
      console.log(`✅ Reverse geocoding successful: ${address}`);
      return address;
    }

    console.warn('Reverse geocoding returned no address');
    return `${latitude.toFixed(4)}, ${longitude.toFixed(4)}`;
  } catch (error) {
    console.error('❌ Reverse geocoding error:', error.message);
    // Fallback to coordinates string
    return `${latitude.toFixed(4)}, ${longitude.toFixed(4)}`;
  }
}

/**
 * Calculate fare based on distance (example pricing model)
 */
export function calculateFare(distance, rideType = 'City') {
  const baseFare = {
    City: 50,
    AirportRide: 100,
    InterCity: 200,
  };

  const perKmRate = {
    City: 15,
    AirportRide: 20,
    InterCity: 12,
  };

  const base = baseFare[rideType] || baseFare['City'];
  const rate = perKmRate[rideType] || perKmRate['City'];

  const distanceFare = Math.round(distance * rate);
  const totalFare = base + distanceFare;

  return {
    baseFare: base,
    perKmRate: rate,
    distanceFare: distanceFare,
    totalFare: totalFare,
    currency: '₹',
  };
}

export default {
  getLocationPredictions,
  getPlaceDetails,
  estimateDistance,
  getDirections,
  formatDistance,
  formatDuration,
  calculateFare,
};
