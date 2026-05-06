import { useState, useEffect, useRef, useCallback } from 'react';
import { Search, MapPin, Loader2, Compass, Star, TrendingUp } from 'lucide-react';
import { getLocationPredictions, getPlaceDetails } from '../services/googlePlacesService.js';
import { motion, AnimatePresence } from 'framer-motion';

const DEFAULT_SEARCH_OPTIONS = Object.freeze({});

// Curated Popular Locations (Baseline for Jaipur) with coordinates to ensure reliability
const POPULAR_LOCATIONS = [
  {
    placeId: 'ChIJ74Iu8A3bs0URkM9-h1-H-Zc',
    description: 'Jaipur International Airport (JAI), Sanganer, Jaipur',
    mainText: 'Jaipur International Airport (JAI)',
    secondaryText: 'Sanganer, Jaipur, Rajasthan',
    latitude: 26.8283,
    longitude: 75.8060,
    isPopular: true
  },
  {
    placeId: 'ChIJ498p-k6cs0URmXW7X1K_K6I',
    description: 'Jaipur Junction Railway Station, Jaipur',
    mainText: 'Jaipur Junction',
    secondaryText: 'Gopalbari, Jaipur, Rajasthan',
    latitude: 26.9189,
    longitude: 75.7863,
    isPopular: true
  },
  {
    placeId: 'ChIJ_zXv69i_b0URyM8XzHhX6_c',
    description: 'City Palace, Gangori Bazaar, J.D.A. Market, Jaipur',
    mainText: 'City Palace',
    secondaryText: 'Old City, Jaipur, Rajasthan',
    latitude: 26.9258,
    longitude: 75.8237,
    isPopular: true
  },
  {
    placeId: 'ChIJ8U_o_Ni_b0UR-mN6XzHhX6_c',
    description: 'Hawa Mahal, Badi Choupad, Jaipur',
    mainText: 'Hawa Mahal',
    secondaryText: 'Badi Choupad, Jaipur, Rajasthan',
    latitude: 26.9239,
    longitude: 75.8267,
    isPopular: true
  },
  {
    placeId: 'ChIJ87Y-9Ei_b0URyM8XzHhX6_c',
    description: 'Sindhi Camp Bus Stand, Jaipur',
    mainText: 'Sindhi Camp',
    secondaryText: 'Station Road, Jaipur, Rajasthan',
    latitude: 26.9272,
    longitude: 75.7958,
    isPopular: true
  }
];

export default function LocationPickerComponent({
  value = '',
  onChange = () => { },
  onSelectLocation = () => { },
  placeholder = 'Search location...',
  showMap = false,
  searchOptions = DEFAULT_SEARCH_OPTIONS,
  darkMode = false,
  inputClassName = '',
  compact = false,
  naked = false,
}) {
  const [suggestions, setSuggestions] = useState([]);
  const [isLoading, setIsLoading] = useState(false);
  const [showSuggestions, setShowSuggestions] = useState(false);
  const [fetchingDetails, setFetchingDetails] = useState(false);
  const [selectedIndex, setSelectedIndex] = useState(-1);
  const searchRef = useRef(null);
  const debounceTimerRef = useRef(null);
  const autocompleteServiceRef = useRef(null);

  // Initialize Native Google Autocomplete Service if available
  useEffect(() => {
    if (window.google && window.google.maps && window.google.maps.places && !autocompleteServiceRef.current) {
      autocompleteServiceRef.current = new window.google.maps.places.AutocompleteService();
    }
  }, []);

  // Professional debounced search with Native + Backend Fallback
  const fetchPredictions = useCallback(async (input) => {
    if (!input.trim() || input.length < 1) {
      setSuggestions(POPULAR_LOCATIONS);
      setShowSuggestions(true);
      return;
    }

    setIsLoading(true);

    // Try Native Service First
    if (autocompleteServiceRef.current) {
      const request = {
        input,
        componentRestrictions: { country: 'in' },
        locationBias: new window.google.maps.LatLng(26.9124, 75.7873),
        radius: 50000,
        ...searchOptions
      };

      autocompleteServiceRef.current.getPlacePredictions(request, (predictions, status) => {
        if (status === window.google.maps.places.PlacesServiceStatus.OK && predictions) {
          const formatted = predictions.map(p => ({
            placeId: p.place_id,
            description: p.description,
            mainText: p.structured_formatting.main_text,
            secondaryText: p.structured_formatting.secondary_text,
          }));
          setSuggestions(formatted);
          setShowSuggestions(true);
          setIsLoading(false);
        } else {
          fallbackToBackend(input);
        }
      });
    } else {
      fallbackToBackend(input);
    }
  }, [searchOptions]);

  const fallbackToBackend = async (input) => {
    try {
      const predictions = await getLocationPredictions(input, searchOptions);
      setSuggestions(predictions);
      setShowSuggestions(predictions.length > 0);
    } catch (error) {
      console.error('Predictions error:', error);
      setSuggestions([]);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    if (debounceTimerRef.current) clearTimeout(debounceTimerRef.current);

    debounceTimerRef.current = setTimeout(() => {
      if (value && value.length >= 2 && !fetchingDetails) {
        fetchPredictions(value);
      } else if (!value && !fetchingDetails && showSuggestions) {
        // If user clears input while focused, show popular locations
        setSuggestions(POPULAR_LOCATIONS);
      }
    }, 300);

    return () => clearTimeout(debounceTimerRef.current);
  }, [value, fetchPredictions, fetchingDetails, showSuggestions]);

  // Handle focus
  const handleFocus = () => {
    if (!value) {
      setSuggestions(POPULAR_LOCATIONS);
      setShowSuggestions(true);
    } else if (value.length >= 2) {
      fetchPredictions(value);
    }
  };

  // Handle keyboard navigation
  const handleKeyDown = (e) => {
    if (!showSuggestions || suggestions.length === 0) return;

    if (e.key === 'ArrowDown') {
      e.preventDefault();
      setSelectedIndex(prev => (prev < suggestions.length - 1 ? prev + 1 : prev));
    } else if (e.key === 'ArrowUp') {
      e.preventDefault();
      setSelectedIndex(prev => (prev > 0 ? prev - 1 : prev));
    } else if (e.key === 'Enter') {
      e.preventDefault();
      if (selectedIndex >= 0) {
        handleSelectSuggestion(suggestions[selectedIndex]);
      }
    } else if (e.key === 'Escape') {
      setShowSuggestions(false);
    }
  };

  const handleSelectSuggestion = async (suggestion) => {
    onChange(suggestion.description);
    setShowSuggestions(false);
    setFetchingDetails(true);
    setSelectedIndex(-1);

    try {
      const details = await getPlaceDetails(suggestion.placeId);

      if (details && details.lat && details.lng) {
        onSelectLocation({
          address: details.address || suggestion.description,
          name: details.name || suggestion.mainText,
          latitude: details.lat || suggestion.latitude,
          longitude: details.lng || suggestion.longitude,
          lat: details.lat || suggestion.latitude,
          lng: details.lng || suggestion.longitude,
          placeId: suggestion.placeId
        });
      } else {
        onSelectLocation({
          address: suggestion.description,
          name: suggestion.mainText,
          placeId: suggestion.placeId
        });
      }
    } catch (error) {
      onSelectLocation({ address: suggestion.description });
    } finally {
      setFetchingDetails(false);
    }
  };

  useEffect(() => {
    const handleClickOutside = (e) => {
      if (searchRef.current && !searchRef.current.contains(e.target)) {
        setShowSuggestions(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  return (
    <div className="w-full" ref={searchRef}>
      <div className="relative">
        <div className={`group flex items-center gap-3 ${naked ? 'px-0 py-0 border-none shadow-none bg-transparent' : `px-4 py-3 rounded-xl border ${darkMode
          ? 'bg-zinc-900/50 border-zinc-800 focus-within:border-emerald-500/50 focus-within:ring-4 focus-within:ring-emerald-500/10'
          : 'bg-white border-slate-200 focus-within:border-emerald-500 focus-within:ring-4 focus-within:ring-emerald-500/5 shadow-sm'
          }`} ${fetchingDetails ? 'opacity-70 grayscale' : ''}`}>
          {!naked && <Search size={18} className={darkMode ? 'text-zinc-500' : 'text-slate-400'} />}
          <input
            type="text"
            value={value}
            onFocus={handleFocus}
            onKeyDown={handleKeyDown}
            onChange={(e) => onChange(e.target.value)}
            placeholder={placeholder}
            disabled={fetchingDetails}
            className={`min-w-0 flex-1 bg-transparent border-none outline-none text-sm font-bold placeholder:font-medium ${darkMode ? 'text-white placeholder:text-zinc-600' : 'text-slate-900 placeholder:text-slate-400'
              } ${inputClassName}`}
          />
          {isLoading || fetchingDetails ? (
            <div className="flex items-center justify-center">
               <Loader2 size={16} className="text-emerald-500 animate-spin" />
            </div>
          ) : (
            !naked && <Compass size={18} className={`${darkMode ? 'text-zinc-700' : 'text-slate-300'} group-focus-within:text-emerald-500 transition-colors`} />
          )}
        </div>

        <AnimatePresence>
          {showSuggestions && suggestions.length > 0 && (
            <motion.div
              initial={{ opacity: 0, y: 10, scale: 0.98 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0, y: 10, scale: 0.98 }}
              className={`absolute top-full z-[100] border backdrop-blur-xl ${compact
                ? 'left-[-38px] right-[-38px] mt-7 max-h-[156px] overflow-y-auto rounded-[1.1rem] p-1.5 shadow-xl'
                : 'left-0 w-full sm:left-1/2 sm:-translate-x-1/2 sm:w-[280px] mt-3 p-2 rounded-2xl shadow-2xl'
                } ${darkMode ? 'bg-zinc-900/95 border-zinc-800' : 'bg-white/95 border-slate-100'
                }`}
            >
              {!value && (
                <div className={`${compact ? 'px-3 py-1.5 text-[8px]' : 'px-4 py-2 text-[10px]'} font-black uppercase tracking-widest flex items-center gap-2 ${darkMode ? 'text-zinc-500' : 'text-slate-400'}`}>
                  <TrendingUp size={12} />
                  Popular Destinations
                </div>
              )}
              {suggestions.map((s, i) => (
                <button
                  key={s.placeId}
                  onClick={() => handleSelectSuggestion(s)}
                  onMouseEnter={() => setSelectedIndex(i)}
                  className={`w-full text-left rounded-xl transition-all flex items-start mb-1 last:mb-0 ${compact ? 'px-3 py-2 gap-2' : 'px-4 py-3 gap-3'} ${selectedIndex === i
                    ? darkMode ? 'bg-emerald-500/10 text-emerald-400' : 'bg-emerald-50 text-emerald-700'
                    : darkMode ? 'text-zinc-300 hover:bg-zinc-800' : 'text-slate-700 hover:bg-slate-50'
                    }`}
                >
                  <div className={`mt-0.5 rounded-lg ${compact ? 'p-1.5' : 'p-1.5'} ${selectedIndex === i ? 'bg-emerald-500/20' : darkMode ? 'bg-zinc-800' : 'bg-slate-100'}`}>
                    {s.isPopular && !value ? <Star size={compact ? 12 : 14} className="text-amber-500 fill-amber-500" /> : <MapPin size={compact ? 12 : 14} className={selectedIndex === i ? 'text-emerald-500' : 'text-slate-400'} />}
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className={`${compact ? 'text-xs' : 'text-sm'} font-bold truncate`}>{s.mainText}</p>
                    <p className={`${compact ? 'text-[10px]' : 'text-xs'} truncate ${selectedIndex === i ? 'opacity-80' : 'opacity-50'}`}>
                      {s.secondaryText}
                    </p>
                  </div>
                </button>
              ))}
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </div>
  );
}
