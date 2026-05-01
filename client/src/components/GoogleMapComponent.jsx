import { useEffect, useRef } from 'react';

const GoogleMapComponent = ({ 
  pickupCoords, 
  dropCoords, 
  isDark = false,
  className = "" 
}) => {
  const mapRef = useRef(null);
  const mapInstanceRef = useRef(null);
  const markersRef = useRef([]);
  const directionsRendererRef = useRef(null);

  // Custom premium map styles
  const darkMapStyle = [
    { elementType: "geometry", stylers: [{ color: "#242f3e" }] },
    { elementType: "labels.text.stroke", stylers: [{ color: "#242f3e" }] },
    { elementType: "labels.text.fill", stylers: [{ color: "#746855" }] },
    {
      featureType: "administrative.locality",
      elementType: "labels.text.fill",
      stylers: [{ color: "#d59563" }],
    },
    {
      featureType: "poi",
      elementType: "labels.text.fill",
      stylers: [{ color: "#d59563" }],
    },
    {
      featureType: "poi.park",
      elementType: "geometry",
      stylers: [{ color: "#263c3f" }],
    },
    {
      featureType: "poi.park",
      elementType: "labels.text.fill",
      stylers: [{ color: "#6b9a76" }],
    },
    {
      featureType: "road",
      elementType: "geometry",
      stylers: [{ color: "#38414e" }],
    },
    {
      featureType: "road",
      elementType: "geometry.stroke",
      stylers: [{ color: "#212a37" }],
    },
    {
      featureType: "road",
      elementType: "labels.text.fill",
      stylers: [{ color: "#9ca5b3" }],
    },
    {
      featureType: "road.highway",
      elementType: "geometry",
      stylers: [{ color: "#746855" }],
    },
    {
      featureType: "road.highway",
      elementType: "geometry.stroke",
      stylers: [{ color: "#1f2835" }],
    },
    {
      featureType: "road.highway",
      elementType: "labels.text.fill",
      stylers: [{ color: "#f3d19c" }],
    },
    {
      featureType: "transit",
      elementType: "geometry",
      stylers: [{ color: "#2f3948" }],
    },
    {
      featureType: "transit.station",
      elementType: "labels.text.fill",
      stylers: [{ color: "#d59563" }],
    },
    {
      featureType: "water",
      elementType: "geometry",
      stylers: [{ color: "#17263c" }],
    },
    {
      featureType: "water",
      elementType: "labels.text.fill",
      stylers: [{ color: "#515c6d" }],
    },
    {
      featureType: "water",
      elementType: "labels.text.stroke",
      stylers: [{ color: "#17263c" }],
    },
  ];

  const lightMapStyle = [
    {
      "featureType": "administrative",
      "elementType": "labels.text.fill",
      "stylers": [{ "color": "#444444" }]
    },
    {
      "featureType": "landscape",
      "elementType": "all",
      "stylers": [{ "color": "#f2f2f2" }]
    },
    {
      "featureType": "poi",
      "elementType": "all",
      "stylers": [{ "visibility": "off" }]
    },
    {
      "featureType": "road",
      "elementType": "all",
      "stylers": [{ "saturation": -100 }, { "lightness": 45 }]
    },
    {
      "featureType": "road.highway",
      "elementType": "all",
      "stylers": [{ "visibility": "simplified" }]
    },
    {
      "featureType": "road.arterial",
      "elementType": "labels.icon",
      "stylers": [{ "visibility": "off" }]
    },
    {
      "featureType": "transit",
      "elementType": "all",
      "stylers": [{ "visibility": "off" }]
    },
    {
      "featureType": "water",
      "elementType": "all",
      "stylers": [{ "color": "#d6e2e6" }, { "visibility": "on" }]
    }
  ];

  useEffect(() => {
    if (!window.google || !mapRef.current) return;

    // Initialize Map
    const mapOptions = {
      center: { lat: 26.9124, lng: 75.7873 }, // Jaipur
      zoom: 12,
      styles: isDark ? darkMapStyle : lightMapStyle,
      disableDefaultUI: true,
      zoomControl: true,
      mapTypeControl: false,
      streetViewControl: false,
      fullscreenControl: false,
    };

    const map = new window.google.maps.Map(mapRef.current, mapOptions);
    mapInstanceRef.current = map;

    // Initialize Directions Service
    directionsRendererRef.current = new window.google.maps.DirectionsRenderer({
      map,
      suppressMarkers: true,
      polylineOptions: {
        strokeColor: isDark ? "#10b981" : "#059669",
        strokeWeight: 5,
        strokeOpacity: 0.8
      }
    });

    return () => {
      // Cleanup
      if (markersRef.current) {
        markersRef.current.forEach(m => m.setMap(null));
      }
    };
  }, [isDark]);

  useEffect(() => {
    if (!mapInstanceRef.current || !window.google) return;

    const google = window.google;
    const map = mapInstanceRef.current;

    // Clear existing markers
    markersRef.current.forEach(m => m.setMap(null));
    markersRef.current = [];

    const bounds = new google.maps.LatLngBounds();
    let hasPickup = false;
    let hasDrop = false;

    // Add Pickup Marker
    if (pickupCoords && (pickupCoords.lat || pickupCoords.latitude)) {
      const pos = {
        lat: Number(pickupCoords.lat || pickupCoords.latitude),
        lng: Number(pickupCoords.lng || pickupCoords.longitude)
      };
      
      const marker = new google.maps.Marker({
        position: pos,
        map,
        title: "Pickup",
        icon: {
          path: google.maps.SymbolPath.CIRCLE,
          fillColor: '#3b82f6',
          fillOpacity: 1,
          strokeColor: '#ffffff',
          strokeWeight: 2,
          scale: 8
        }
      });
      markersRef.current.push(marker);
      bounds.extend(pos);
      hasPickup = true;
    }

    // Add Drop Marker
    if (dropCoords && (dropCoords.lat || dropCoords.latitude)) {
      const pos = {
        lat: Number(dropCoords.lat || dropCoords.latitude),
        lng: Number(dropCoords.lng || dropCoords.longitude)
      };
      
      const marker = new google.maps.Marker({
        position: pos,
        map,
        title: "Drop",
        icon: {
          path: google.maps.SymbolPath.CIRCLE,
          fillColor: '#10b981',
          fillOpacity: 1,
          strokeColor: '#ffffff',
          strokeWeight: 2,
          scale: 8
        }
      });
      markersRef.current.push(marker);
      bounds.extend(pos);
      hasDrop = true;
    }

    // Handle Route Display
    if (hasPickup && hasDrop) {
      const directionsService = new google.maps.DirectionsService();
      
      const request = {
        origin: {
          lat: Number(pickupCoords.lat || pickupCoords.latitude),
          lng: Number(pickupCoords.lng || pickupCoords.longitude)
        },
        destination: {
          lat: Number(dropCoords.lat || dropCoords.latitude),
          lng: Number(dropCoords.lng || dropCoords.longitude)
        },
        travelMode: google.maps.TravelMode.DRIVING
      };

      directionsService.route(request, (result, status) => {
        if (status === 'OK') {
          directionsRendererRef.current.setDirections(result);
        } else {
          console.warn('Directions request failed due to ' + status);
          // If directions fail, just fit bounds to markers
          map.fitBounds(bounds);
        }
      });
    } else if (hasPickup || hasDrop) {
      map.setCenter(bounds.getCenter());
      map.setZoom(14);
    }

  }, [pickupCoords, dropCoords]);

  return (
    <div 
      ref={mapRef} 
      className={`w-full h-full rounded-2xl overflow-hidden shadow-inner ${className}`}
      style={{ minHeight: '300px' }}
    />
  );
};

export default GoogleMapComponent;
