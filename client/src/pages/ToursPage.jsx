import { ArrowRight, Zap, Loader2, Search, X, MapPin, Calendar, Clock, Filter } from 'lucide-react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { useState, useEffect, useMemo } from 'react';
import SEO from '../components/SEO';
import TourBookingModal from '../components/TourBookingModal.jsx';
import { getPackages } from '../services/packageService.js';

export default function ToursPage() {
  const navigate = useNavigate();
  const [searchParams, setSearchParams] = useSearchParams();
  const [packages, setPackages] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedPackage, setSelectedPackage] = useState(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  
  const categoryFilter = searchParams.get('type') || 'all';

  useEffect(() => {
    fetchPackages(categoryFilter);
  }, [categoryFilter]);

  const fetchPackages = async (category = '') => {
    try {
      setLoading(true);
      const data = await getPackages(category === 'all' ? '' : category);
      if (data && data.success) {
        setPackages(data.data || []);
      }
    } catch (error) {
      console.error('Error fetching packages:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleBookNow = (pkg) => {
    setSelectedPackage(pkg);
    setIsModalOpen(true);
  };

  const handleCategoryChange = (category) => {
    if (category === 'all') {
      searchParams.delete('type');
    } else {
      searchParams.set('type', category);
    }
    setSearchParams(searchParams);
  };

  // Fallback data if no packages are in database
  const fallbackPackages = [
    {
      _id: '6547a9f8c5d2e1b9a4f3c2d1', // Placeholder valid-looking ID
      title: "City Heritage Tour",
      description: "Explore the rich history and cultural heritage of the city in our whisper-quiet, zero-emission premium electric cabs.",
      basePrice: 1499,
      details: "4 Hours • 40 km limit • Dedicated Guide",
      coverImage: "https://images.unsplash.com/photo-1514222134-b57cbb8ce073?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80",
    },
    {
      _id: '6547a9f8c5d2e1b9a4f3c2d2',
      title: "Eco Nature Trail",
      description: "Escape the hustle. Enjoy a serene, smooth drive through the city's lush green outskirts and national parks.",
      basePrice: 2299,
      details: "6 Hours • 80 km limit • Panoramic Views",
      coverImage: "https://images.unsplash.com/photo-1501785888041-af3ef285b470?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80",
    },
    {
      _id: '6547a9f8c5d2e1b9a4f3c2d3',
      title: "Night Skyline Drive",
      description: "Witness the spectacular city lights come alive in a luxurious, relaxing nighttime tour designed for comfort.",
      basePrice: 1199,
      details: "3 Hours • 30 km limit • Mood Lighting",
      coverImage: "https://images.unsplash.com/photo-1477959858617-67f85cf4f1df?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80",
    }
  ];

  const displayPackages = packages.length > 0 ? packages : fallbackPackages;

  const filteredPackages = useMemo(() => {
    if (!searchTerm.trim()) return displayPackages;
    
    const term = searchTerm.toLowerCase();
    return displayPackages.filter(pkg => 
      pkg.title?.toLowerCase().includes(term) || 
      pkg.description?.toLowerCase().includes(term) ||
      pkg.details?.toLowerCase().includes(term)
    );
  }, [displayPackages, searchTerm]);

  return (
    <div className="min-h-screen bg-[#fafafa] dark:bg-black transition-colors duration-300">
      <SEO 
        title="Eco-Friendly Tour Packages" 
        description="Explore the city with our premium electric cab tour packages. Heritage tours, nature trails, and night skyline drives available."
        url="/tours"
      />
      {/* Hero Section */}
      <div className="relative pt-24 pb-16 md:pt-32 md:pb-24 overflow-hidden">
        <div className="absolute inset-0 z-0">
          <div className="absolute inset-0 bg-emerald-600/5 dark:bg-emerald-500/10 mix-blend-multiply dark:mix-blend-lighten" />
          <div className="absolute -top-24 -right-24 w-96 h-96 bg-emerald-400/20 rounded-full blur-3xl opacity-50" />
        </div>
        
        <div className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <div className="inline-flex items-center gap-2 bg-emerald-100 dark:bg-emerald-900/30 text-emerald-700 dark:text-emerald-300 px-4 py-2 rounded-full text-[10px] font-black uppercase tracking-[0.2em] mb-6 border border-emerald-200 dark:border-emerald-800/50">
            <Zap size={14} className="fill-current" /> Zero Emission Tours
          </div>
          <h1 className="text-4xl md:text-5xl lg:text-7xl font-black text-slate-900 dark:text-white tracking-tight mb-6">
            Electric <span className="text-emerald-600">Tour Packages</span>
          </h1>
          <p className="max-w-2xl mx-auto text-lg md:text-xl text-slate-600 dark:text-slate-400 mb-10 font-medium">
            Experience premium, whisper-quiet tours in our top-of-the-line electric cabs. Heritage, nature, and skyline drives.
          </p>
        </div>
      </div>

      {/* Filter & Search Bar Section */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 -mt-12 mb-12 relative z-20">
        <div className="bg-white dark:bg-zinc-900 rounded-[2.5rem] shadow-2xl shadow-emerald-900/10 border border-slate-100 dark:border-zinc-800 p-4 md:p-6">
          <div className="flex flex-col lg:flex-row gap-6 items-center">
            
            {/* Category Tabs */}
            <div className="flex bg-slate-100 dark:bg-zinc-800 p-1.5 rounded-2xl w-full lg:w-auto overflow-x-auto whitespace-nowrap hide-scrollbar">
              {[
                { id: 'all', label: 'All Tours' },
                { id: 'travel_tour', label: 'Travel Tours' },
                { id: 'temple_tour', label: 'Temple Tours' }
              ].map((cat) => (
                <button
                  key={cat.id}
                  onClick={() => handleCategoryChange(cat.id)}
                  className={`px-6 py-2.5 rounded-xl text-sm font-bold transition-all duration-300 ${
                    categoryFilter === cat.id
                      ? 'bg-white dark:bg-zinc-700 text-emerald-600 dark:text-emerald-400 shadow-md'
                      : 'text-slate-500 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
                  }`}
                >
                  {cat.label}
                </button>
              ))}
            </div>

            {/* Search Input */}
            <div className="flex-1 w-full relative">
              <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                <Search className="h-5 w-5 text-slate-400" />
              </div>
              <input
                type="text"
                placeholder="Search destination, heritage site, or package details..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="block w-full pl-12 pr-12 py-3.5 bg-slate-50 dark:bg-zinc-800/50 border-none rounded-2xl leading-5 text-slate-900 dark:text-white placeholder-slate-400 focus:ring-2 focus:ring-emerald-500 transition-all font-medium"
              />
              {searchTerm && (
                <button
                  onClick={() => setSearchTerm('')}
                  className="absolute inset-y-0 right-0 pr-4 flex items-center text-slate-400 hover:text-emerald-500 transition-colors"
                >
                  <X className="h-5 w-5" />
                </button>
              )}
            </div>
          </div>
        </div>
        
        {searchTerm && (
          <div className="mt-4 flex justify-center">
            <span className="px-4 py-1.5 bg-emerald-50 dark:bg-emerald-900/20 text-emerald-600 dark:text-emerald-400 rounded-full text-xs font-bold border border-emerald-100 dark:border-emerald-800">
              Found {filteredPackages.length} results for "{searchTerm}"
            </span>
          </div>
        )}
      </div>

      {/* Tours Grid Section */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pb-24">
        {loading ? (
          <div className="flex justify-center items-center py-20">
            <Loader2 className="w-10 h-10 animate-spin text-emerald-500" />
          </div>
        ) : filteredPackages.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8 xl:gap-10">
            {filteredPackages.map((pkg) => (
              <div 
                key={pkg._id} 
                className="group bg-white dark:bg-zinc-900 rounded-3xl overflow-hidden shadow-sm hover:shadow-2xl hover:shadow-emerald-900/5 dark:hover:shadow-emerald-900/20 border border-slate-100 dark:border-zinc-800 transition-all duration-500 flex flex-col"
              >
                {/* Image */}
                <div className="relative h-64 overflow-hidden">
                  <div className="absolute inset-0 bg-slate-900/20 group-hover:bg-transparent transition-colors duration-500 z-10" />
                  <img 
                    src={pkg.coverImage || pkg.image} 
                    alt={pkg.title}
                    className="w-full h-full object-cover transform group-hover:scale-110 transition-transform duration-700 ease-in-out"
                  />
                  <div className="absolute top-4 right-4 z-20">
                    <div className="bg-white/90 backdrop-blur-md dark:bg-black/80 px-3 py-1.5 rounded-full text-sm font-bold text-slate-900 dark:text-white shadow-lg flex items-center gap-1.5">
                      <Zap size={14} className="text-emerald-500" />
                      EV Only
                    </div>
                  </div>
                </div>

                {/* Card Body */}
                <div className="p-6 md:p-8 flex flex-col flex-grow">
                  {/* Title */}
                  <h3 className="text-2xl font-black text-slate-900 dark:text-white mb-4 group-hover:text-emerald-600 dark:group-hover:text-emerald-400 transition-colors">
                    {pkg.title}
                  </h3>

                  {/* Description */}
                  <p className="text-slate-600 dark:text-slate-400 text-sm leading-relaxed mb-6 flex-grow">
                    {pkg.description}
                  </p>

                  {/* Details */}
                  <div className="bg-slate-50 dark:bg-zinc-800/50 rounded-2xl p-5 mb-8 space-y-3">
                    <div className="flex items-center gap-3 text-sm font-bold text-slate-700 dark:text-slate-300">
                      <Clock size={16} className="text-emerald-500" />
                      {pkg.duration?.days || 0} Days • {pkg.duration?.hours || 0} Hours
                    </div>
                    <div className="flex items-center gap-3 text-sm font-bold text-slate-700 dark:text-slate-300">
                      <MapPin size={16} className="text-emerald-500" />
                      {pkg.location || 'Multiple Locations'}
                    </div>
                  </div>

                  {/* Price & Action */}
                  <div className="flex items-center justify-between mt-auto pt-2 border-t border-slate-100 dark:border-zinc-800">
                    <div>
                      <p className="text-xs text-slate-500 dark:text-slate-400 font-medium uppercase tracking-wider mb-0.5">Starting From</p>
                      <div className="text-2xl font-black text-slate-900 dark:text-white">
                        ₹{pkg.basePrice || pkg.price}
                      </div>
                    </div>
                    <button 
                      onClick={() => handleBookNow(pkg)}
                      className="flex items-center gap-2 bg-emerald-600 hover:bg-emerald-700 text-white px-6 py-3 rounded-xl font-bold transition-all duration-300 shadow-md hover:shadow-xl active:scale-95 group/btn"
                    >
                      Book Now
                      <ArrowRight size={18} className="group-hover/btn:translate-x-1 transition-transform" />
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="text-center py-20 bg-white dark:bg-zinc-900 rounded-3xl border border-dashed border-slate-200 dark:border-zinc-800">
            <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-slate-100 dark:bg-zinc-800 text-slate-400 mb-4">
              <Search size={24} />
            </div>
            <h3 className="text-xl font-bold text-slate-900 dark:text-white mb-2">No tours found</h3>
            <p className="text-slate-600 dark:text-slate-400 mb-6">We couldn't find any tours matching "{searchTerm}".</p>
            <button
              onClick={() => setSearchTerm('')}
              className="text-emerald-500 font-bold hover:underline"
            >
              Clear search and show all tours
            </button>
          </div>
        )}
      </div>

      {/* Booking Modal */}
      {selectedPackage && (
        <TourBookingModal
          isOpen={isModalOpen}
          onClose={() => setIsModalOpen(false)}
          tourName={selectedPackage.title}
          packageId={selectedPackage._id}
          packagePrice={selectedPackage.basePrice}
          pricing={selectedPackage.pricing}
        />
      )}
    </div>
  );
}
