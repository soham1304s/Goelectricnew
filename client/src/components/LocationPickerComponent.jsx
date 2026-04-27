import { useState, useEffect, useRef } from 'react';
import { Search, MapPin, Loader2 } from 'lucide-react';
import { getLocationPredictions, getPlaceDetails } from '../services/googlePlacesService.js';

const DEFAULT_SEARCH_OPTIONS = Object.freeze({});

export default function LocationPickerComponent({
  value = '',
  onChange = () => {},
  onSelectLocation = () => {},
  placeholder = 'Search location...',
  showMap = false,
  searchOptions = DEFAULT_SEARCH_OPTIONS,
  darkMode = false,
  inputClassName = '',
}) {
  const [suggestions, setSuggestions] = useState([]);
  const [selectedLocation, setSelectedLocation] = useState(null);
  const [isLoading, setIsLoading] = useState(false);
  const [showSuggestions, setShowSuggestions] = useState(false);
  const [fetchingDetails, setFetchingDetails] = useState(false);
  const searchRef = useRef(null);
  const debounceTimerRef = useRef(null);

  // Debounced search
  useEffect(() => {
    if (debounceTimerRef.current) {
      clearTimeout(debounceTimerRef.current);
    }

    if (!value.trim()) {
      setSuggestions((prev) => (prev.length > 0 ? [] : prev));
      setShowSuggestions((prev) => (prev ? false : prev));
      setIsLoading(false);
      return;
    }

    setIsLoading(true);
    debounceTimerRef.current = setTimeout(async () => {
      try {
        const predictions = await getLocationPredictions(value, searchOptions);
        setSuggestions(predictions);
        setShowSuggestions(true);
      } catch (error) {
        console.error('Error fetching predictions:', error);
        setSuggestions([]);
      } finally {
        setIsLoading(false);
      }
    }, 300);

    return () => {
      if (debounceTimerRef.current) clearTimeout(debounceTimerRef.current);
    };
  }, [value, searchOptions]);

  // Handle suggestion click - Fetch place details to get coordinates
  const handleSelectSuggestion = async (suggestion) => {
    setSelectedLocation(suggestion);
    onChange(suggestion.description);
    setShowSuggestions(false);
    setFetchingDetails(true);
    
    try {
      // Fetch place details to get coordinates
      const details = await getPlaceDetails(suggestion.placeId);
      
      if (details && details.lat && details.lng) {
        console.log('✅ Got coordinates from Google Places:', { lat: details.lat, lng: details.lng });
        onSelectLocation({
          address: details.address || suggestion.description,
          name: details.name || suggestion.mainText,
          latitude: details.lat,
          lng: details.lng,
          lat: details.lat,
          coords: {
            latitude: details.lat,
            longitude: details.lng,
          }
        });
      } else {
        // Fallback: pass only address if coordinates not available
        console.warn('⚠️ Could not get coordinates from Google Places, using address only');
        onSelectLocation({
          address: suggestion.description,
          name: suggestion.mainText,
        });
      }
    } catch (error) {
      console.error('❌ Error fetching place details:', error);
      // Fallback: pass only address
      onSelectLocation({
        address: suggestion.description,
        name: suggestion.mainText,
      });
    } finally {
      setFetchingDetails(false);
    }
  };

  // Close suggestions when clicking outside
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (searchRef.current && !searchRef.current.contains(event.target)) {
        setShowSuggestions(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  return (
    <div className="w-full">
      {/* Search Input */}
      <div ref={searchRef} className="relative">
        <div className="relative flex items-center">
          <Search className={`absolute left-4 w-5 h-5 ${darkMode ? 'text-gray-400' : 'text-[#64748b]'}`} />
          <input
            type="text"
            value={value}
            onChange={(e) => onChange(e.target.value)}
            placeholder={placeholder}
            disabled={fetchingDetails}
            className={`w-full pl-12 pr-4 py-3 border ${darkMode ? 'border-gray-600 bg-gray-700 text-white placeholder-gray-400' : 'border-[#e5e7eb] bg-white text-[#0f172a] placeholder-[#94a3b8]'} rounded-lg focus:outline-none focus:ring-2 focus:ring-[#67fc59] focus:border-transparent transition-colors text-base ${fetchingDetails ? 'opacity-50 cursor-not-allowed' : ''} ${inputClassName}`}
          />
          {(isLoading || fetchingDetails) && (
            <Loader2 className={`absolute right-4 w-5 h-5 ${darkMode ? 'text-emerald-400' : 'text-[#67fc59]'} animate-spin`} />
          )}
        </div>

        {/* Suggestions Dropdown */}
        {showSuggestions && suggestions.length > 0 && (
          <div className={`absolute top-full left-0 right-0 mt-2 border rounded-lg shadow-lg z-50 max-h-60 overflow-y-auto ${darkMode ? 'bg-gray-800 border-gray-600' : 'bg-white border-[#e5e7eb]'}`}>
            {suggestions.map((suggestion, index) => (
              <button
                key={`${suggestion.placeId}-${index}`}
                onClick={() => handleSelectSuggestion(suggestion)}
                disabled={fetchingDetails}
                className={`w-full text-left px-4 py-3 transition-colors ${fetchingDetails ? 'opacity-50 cursor-not-allowed' : ''} ${darkMode ? 'border-gray-700 hover:bg-gray-700 text-white' : 'border-b border-[#e5e7eb] last:border-b-0 hover:bg-[#f1f5f9] text-[#0f172a]'}`}
              >
                <div className="flex items-start gap-3">
                  <MapPin className={`w-5 h-5 flex-shrink-0 mt-0.5 ${darkMode ? 'text-emerald-400' : 'text-[#67fc59]'}`} />
                  <div className="flex-1 min-w-0">
                    <div className={`font-medium truncate ${darkMode ? 'text-white' : 'text-[#0f172a]'}`}>
                      {suggestion.mainText || suggestion.description}
                    </div>
                    {suggestion.secondaryText && (
                      <div className={`text-sm truncate ${darkMode ? 'text-gray-400' : 'text-[#64748b]'}`}>
                        {suggestion.secondaryText}
                      </div>
                    )}
                  </div>
                </div>
              </button>
            ))}
          </div>
        )}

        {/* No results message */}
        {showSuggestions && suggestions.length === 0 && value && !isLoading && (
          <div className={`absolute top-full left-0 right-0 mt-2 border rounded-lg shadow-lg p-4 text-center z-50 ${darkMode ? 'bg-gray-800 border-gray-600 text-gray-400' : 'bg-white border-[#e5e7eb] text-[#64748b]'}`}>
            <p>No locations found</p>
          </div>
        )}
      </div>
    </div>
  );
}
