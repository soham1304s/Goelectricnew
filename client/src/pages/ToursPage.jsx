import { ArrowRight, Zap, Loader2 } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { useState, useEffect } from 'react';
import SEO from '../components/SEO';
import TourBookingModal from '../components/TourBookingModal.jsx';
import { getPackages } from '../services/packageService.js';

export default function ToursPage() {
  const navigate = useNavigate();
  const [packages, setPackages] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedPackage, setSelectedPackage] = useState(null);
  const [isModalOpen, setIsModalOpen] = useState(false);

  useEffect(() => {
    fetchPackages();
  }, []);

  const fetchPackages = async () => {
    try {
      setLoading(true);
      const data = await getPackages();
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
          <h1 className="text-4xl md:text-5xl lg:text-6xl font-black text-slate-900 dark:text-white tracking-tight mb-6">
            Electric Tour Packages
          </h1>
          <p className="max-w-2xl mx-auto text-lg md:text-xl text-slate-600 dark:text-slate-400 mb-10">
            Experience premium, whisper-quiet tours in our top-of-the-line electric cabs.
          </p>
        </div>
      </div>

      {/* Tours Grid Section */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pb-24">
        {loading ? (
          <div className="flex justify-center items-center py-20">
            <Loader2 className="w-10 h-10 animate-spin text-emerald-500" />
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8 xl:gap-10">
            {displayPackages.map((pkg) => (
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
                  <div className="bg-slate-50 dark:bg-zinc-800/50 rounded-xl p-4 mb-6">
                    <p className="text-sm font-medium text-slate-700 dark:text-slate-300">
                      <span className="font-bold text-emerald-600 dark:text-emerald-400">Details: </span>
                      {pkg.details || `${pkg.duration || ''} • ${pkg.distanceLimit || ''}`}
                    </p>
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
