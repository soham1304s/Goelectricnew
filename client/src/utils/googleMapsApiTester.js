/**
 * Google Maps API Testing & Debugging Guide
 * This file contains functions to verify all Google Maps APIs are working correctly
 */

// ============================================================
// 1. TEST LOCATION AUTOCOMPLETE (Google Places Autocomplete)
// ============================================================

/**
 * Test location search with sample queries
 * Expected: When typing "J", should show all Jaipur locations starting with J
 */
export async function testLocationAutocomplete() {
  console.log('\n🧪 TESTING: Location Autocomplete (Google Places)');
  console.log('=' .repeat(60));

  const testQueries = ['J', 'Ja', 'Jaipur', 'City Palace', 'Airport'];

  for (const query of testQueries) {
    try {
      console.log(`\n🔍 Searching for: "${query}"`);
      
      const params = new URLSearchParams({
        input: query,
        components: 'country:in',
        language: 'en',
        location: '26.9124,75.7873',
        radius: '50000',
      });

      const response = await fetch(
        `/api/location/google-places/autocomplete?${params.toString()}`,
        {
          headers: {
            'Authorization': `Bearer ${localStorage.getItem('token') || ''}`,
          },
        }
      );

      const data = await response.json();

      if (data.success && data.data.predictions) {
        console.log(`✅ Found ${data.data.predictions.length} predictions:`);
        data.data.predictions.slice(0, 5).forEach((pred, idx) => {
          console.log(`   ${idx + 1}. ${pred.main_text} - ${pred.secondary_text}`);
        });
      } else {
        console.warn(`⚠️  No predictions found: ${data.message}`);
      }
    } catch (error) {
      console.error(`❌ Error searching "${query}":`, error.message);
    }
  }
}

// ============================================================
// 2. TEST PLACE DETAILS (Get Coordinates)
// ============================================================

/**
 * Test getting place details including coordinates
 * This is needed to get lat/lng after user selects a location
 */
export async function testPlaceDetails() {
  console.log('\n🧪 TESTING: Place Details (Get Coordinates)');
  console.log('=' .repeat(60));

  try {
    // First, get a place ID by searching
    console.log('\n1️⃣  First, getting a place ID from autocomplete...');
    
    const searchParams = new URLSearchParams({
      input: 'Hawa Mahal, Jaipur',
      components: 'country:in',
    });

    const searchResponse = await fetch(
      `/api/location/google-places/autocomplete?${searchParams.toString()}`,
      {
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('token') || ''}`,
        },
      }
    );

    const searchData = await searchResponse.json();
    
    if (!searchData.success || !searchData.data.predictions?.length) {
      console.error('❌ Could not find place for testing');
      return;
    }

    const placeId = searchData.data.predictions[0].place_id;
    console.log(`✅ Got Place ID: ${placeId}`);

    // Now get details
    console.log(`\n2️⃣  Getting details for place ID: ${placeId}...`);
    
    const detailsParams = new URLSearchParams({
      place_id: placeId,
    });

    const detailsResponse = await fetch(
      `/api/location/google-places/details?${detailsParams.toString()}`,
      {
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('token') || ''}`,
        },
      }
    );

    const detailsData = await detailsResponse.json();

    if (detailsData.success && detailsData.data.result) {
      const result = detailsData.data.result;
      console.log('✅ Place Details:');
      console.log(`   Name: ${result.name}`);
      console.log(`   Address: ${result.formatted_address}`);
      console.log(`   Lat: ${result.geometry?.location?.lat}`);
      console.log(`   Lng: ${result.geometry?.location?.lng}`);
    } else {
      console.error('❌ Failed to get place details:', detailsData.message);
    }
  } catch (error) {
    console.error('❌ Error in place details test:', error.message);
  }
}

// ============================================================
// 3. TEST DISTANCE MATRIX (Distance & Duration Calculation)
// ============================================================

/**
 * Test distance calculation between two locations
 * This is used to show distance and estimated time in booking card
 */
export async function testDistanceCalculation() {
  console.log('\n🧪 TESTING: Distance Matrix (Distance & Duration)');
  console.log('=' .repeat(60));

  const testRoutes = [
    { pickup: 'Hawa Mahal, Jaipur', destination: 'City Palace, Jaipur' },
    { pickup: 'Jaipur City Center', destination: 'Jaipur Airport' },
    { pickup: 'Civil Lines, Jaipur', destination: 'Vaishali Nagar, Jaipur' },
  ];

  for (const route of testRoutes) {
    try {
      console.log(`\n📍 Route: ${route.pickup} → ${route.destination}`);
      
      const response = await fetch('/api/location/estimate', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${localStorage.getItem('token') || ''}`,
        },
        body: JSON.stringify({
          pickup: route.pickup,
          drop: route.destination,
        }),
      });

      const data = await response.json();

      if (data.success && data.data) {
        const result = data.data;
        console.log('✅ Distance Calculated:');
        console.log(`   Distance: ${result.distance} km`);
        console.log(`   Duration: ${result.duration} minutes`);
        console.log(`   Method: ${result.method}`);
        if (result.distanceText) {
          console.log(`   Google Maps: ${result.distanceText} (${result.durationText})`);
        }
      } else {
        console.warn(`⚠️  Failed: ${data.message}`);
      }
    } catch (error) {
      console.error(`❌ Error calculating distance:`, error.message);
    }
  }
}

// ============================================================
// 4. TEST REVERSE GEOCODING (Coordinates to Address)
// ============================================================

/**
 * Test reverse geocoding - convert lat/lng to address
 * This is used when user detects their current location
 */
export async function testReverseGeocoding() {
  console.log('\n🧪 TESTING: Reverse Geocoding (Coordinates → Address)');
  console.log('=' .repeat(60));

  const testCoordinates = [
    { lat: 26.9124, lon: 75.7873, name: 'Jaipur Center' },
    { lat: 26.8118, lon: 75.8051, name: 'Jaipur Airport' },
    { lat: 26.9124, lon: 75.7873, name: 'City Palace Area' },
  ];

  for (const coords of testCoordinates) {
    try {
      console.log(`\n📍 Converting coordinates to address: ${coords.name}`);
      
      const params = new URLSearchParams({
        lat: coords.lat,
        lon: coords.lon,
      });

      const response = await fetch(
        `/api/location/reverse-geocode?${params.toString()}`,
        {
          headers: {
            'Authorization': `Bearer ${localStorage.getItem('token') || ''}`,
          },
        }
      );

      const data = await response.json();

      if (data.success && data.data) {
        console.log('✅ Address found:');
        console.log(`   ${data.data.address}`);
      } else {
        console.warn(`⚠️  Failed: ${data.message}`);
      }
    } catch (error) {
      console.error(`❌ Error reverse geocoding:`, error.message);
    }
  }
}

// ============================================================
// 5. TEST BOOKING FORM INTEGRATION
// ============================================================

/**
 * Simulate the full booking flow to test distance calculation
 */
export async function testBookingFormIntegration() {
  console.log('\n🧪 TESTING: Full Booking Form Integration');
  console.log('=' .repeat(60));

  // Simulate user selecting locations
  const bookingData = {
    rideType: 'City',
    pickupLocation: 'City Palace, Jaipur',
    destination: 'Hawa Mahal, Jaipur',
    bookingDate: new Date().toISOString().split('T')[0],
    bookingTime: new Date().toTimeString().slice(0, 5),
  };

  console.log('\n📋 Booking Data:');
  console.log(`   Ride Type: ${bookingData.rideType}`);
  console.log(`   Pickup: ${bookingData.pickupLocation}`);
  console.log(`   Destination: ${bookingData.destination}`);
  console.log(`   Date: ${bookingData.bookingDate}`);
  console.log(`   Time: ${bookingData.bookingTime}`);

  try {
    // Calculate distance
    console.log('\n⏳ Calculating distance...');
    
    const distanceResponse = await fetch('/api/location/estimate', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${localStorage.getItem('token') || ''}`,
      },
      body: JSON.stringify({
        pickup: bookingData.pickupLocation,
        drop: bookingData.destination,
      }),
    });

    const distanceData = await distanceResponse.json();

    if (distanceData.success && distanceData.data) {
      const result = distanceData.data;
      
      console.log('\n✅ Booking Summary:');
      console.log(`   Distance: ${result.distance} km`);
      console.log(`   Duration: ${result.duration} minutes`);
      
      // Calculate fare (example pricing)
      const baseFare = 50;
      const perKmRate = 15;
      const estimatedFare = baseFare + (result.distance * perKmRate);
      
      console.log(`   Estimated Fare: ₹${Math.round(estimatedFare)}`);
      console.log('\n✅ Booking form is ready!');
    } else {
      console.error('❌ Failed to calculate distance:', distanceData.message);
    }
  } catch (error) {
    console.error('❌ Error in booking integration test:', error.message);
  }
}

// ============================================================
// 6. RUN ALL TESTS
// ============================================================

/**
 * Master test function - run all tests sequentially
 */
export async function runAllTests() {
  console.log('\n\n');
  console.log('🚀 STARTING GOOGLE MAPS API TESTS');
  console.log('═'.repeat(60));
  console.log('API Key Configured:', import.meta.env.VITE_GOOGLE_MAPS_API_KEY ? '✅' : '❌');
  console.log('Backend URL:', import.meta.env.VITE_APP_API_URL || 'Using proxy');
  console.log('═'.repeat(60));

  // Run tests with delays to avoid rate limiting
  console.log('\n⏳ Running tests...');
  
  try {
    await testLocationAutocomplete();
    await new Promise((resolve) => setTimeout(resolve, 2000));
    
    await testPlaceDetails();
    await new Promise((resolve) => setTimeout(resolve, 2000));
    
    await testDistanceCalculation();
    await new Promise((resolve) => setTimeout(resolve, 2000));
    
    await testReverseGeocoding();
    await new Promise((resolve) => setTimeout(resolve, 2000));
    
    await testBookingFormIntegration();

    console.log('\n\n' + '═'.repeat(60));
    console.log('✅ ALL TESTS COMPLETED');
    console.log('═'.repeat(60));
  } catch (error) {
    console.error('\n\n' + '═'.repeat(60));
    console.error('❌ TESTS FAILED');
    console.error(error);
    console.error('═'.repeat(60));
  }
}

// Export for console usage
window.testGoogleMapsAPIs = {
  testLocationAutocomplete,
  testPlaceDetails,
  testDistanceCalculation,
  testReverseGeocoding,
  testBookingFormIntegration,
  runAllTests,
};

console.log('✅ API Testing module loaded! Use window.testGoogleMapsAPIs.runAllTests() to run all tests');
