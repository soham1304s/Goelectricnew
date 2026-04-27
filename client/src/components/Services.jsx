import { Palmtree, Church, Building2, Plane, MapPin } from 'lucide-react';
import { useNavigate, useLocation } from 'react-router-dom';
import { useEffect } from 'react';
import { motion } from 'framer-motion';

const services = [
  {
    icon: Palmtree,
    title: 'Travel Tours Packages',
    description: 'Explore scenic destinations with comfortable electric rides',
    link: '/',
    scrollTo: 'travel-tours'
  },
  {
    icon: Church,
    title: 'Temple Tours Packages',
    description: 'Visit spiritual places with eco-friendly transportation',
    link: '/',
    scrollTo: 'temple-tours'
  },
  {
    icon: Building2,
    title: 'City Ride',
    description: 'Quick and comfortable rides across the city',
    link: '/cityride'
  },
  {
    icon: Plane,
    title: 'Airport Ride',
    description: 'Reliable airport transfers at affordable prices',
    link: '/airport'
  },
  {
    icon: MapPin,
    title: 'Intercity Ride',
    description: 'Safe and comfortable long-distance travel',
    link: '/intercityride'
  }
];

const cardVariants = {
  hidden: { opacity: 0, y: 24 },
  visible: (i) => ({
    opacity: 1,
    y: 0,
    transition: { delay: i * 0.1, duration: 0.4, ease: 'easeOut' },
  }),
  hover: { scale: 1.03, y: -4, transition: { duration: 0.2 } },
};

const titleVariants = {
  hidden: { opacity: 0, y: 20 },
  visible: {
    opacity: 1,
    y: 0,
    transition: { duration: 0.5, ease: 'easeOut' },
  },
};

export default function Services() {
  const navigate = useNavigate();
  const location = useLocation();

  useEffect(() => {
    // Handle scrolling to section after navigation
    if (location.hash) {
      const id = location.hash.replace('#', '');
      setTimeout(() => {
        const element = document.getElementById(id);
        if (element) {
          element.scrollIntoView({ behavior: 'smooth', block: 'start' });
        }
      }, 100);
    }
  }, [location]);

  const handleServiceClick = (service) => {
    if (service.scrollTo) {
      // If on home page, scroll directly
      if (location.pathname === '/') {
        const element = document.getElementById(service.scrollTo);
        if (element) {
          element.scrollIntoView({ behavior: 'smooth', block: 'start' });
        }
      } else {
        // Navigate to home page with hash
        navigate(`/#${service.scrollTo}`);
      }
    } else {
      // Navigate to the page
      navigate(service.link);
    }
  };

  return (
    <section className="pt-16 pb-8 sm:pb-10 px-4 sm:px-6 lg:px-8 bg-white dark:bg-black overflow-hidden transition-colors duration-300">
      <div className="max-w-7xl mx-auto">
        <motion.h2
          variants={titleVariants}
          initial="hidden"
          animate="visible"
          className="text-3xl sm:text-4xl font-bold text-slate-900 dark:text-white text-center mb-6 sm:mb-8"
        >
          Our Services
        </motion.h2>

        <div className="grid grid-cols-2 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-5 gap-4 sm:gap-6">
          {services.map((service, index) => {
            const Icon = service.icon;
            return (
              <motion.button
                key={index}
                variants={cardVariants}
                initial="hidden"
                animate="visible"
                custom={index}
                whileHover="hover"
                onClick={() => handleServiceClick(service)}
                className="bg-white dark:bg-zinc-900/80 border border-slate-200 dark:border-zinc-800 rounded-xl p-4 sm:p-6 hover:shadow-xl hover:shadow-[#5CE65C]/10 dark:hover:shadow-[#5CE65C]/20 hover:border-[#5CE65C] dark:hover:border-[#5CE65C] transition-all duration-300 cursor-pointer group block text-left w-full shadow-sm dark:shadow-none"
              >
                <motion.div
                  className="w-10 h-10 sm:w-14 sm:h-14 flex items-center justify-center mb-2 sm:mb-4 rounded-full bg-slate-100 dark:bg-zinc-800 group-hover:bg-[#5CE65C] transition-colors duration-200"
                  whileHover={{ rotate: 5, scale: 1.05 }}
                >
                  <Icon className="w-5 h-5 sm:w-7 sm:h-7 text-slate-700 dark:text-zinc-200 group-hover:text-white transition-colors" />
                </motion.div>
                <h3 className="font-semibold text-slate-900 dark:text-white mb-1 sm:mb-2 text-sm sm:text-base">
                  {service.title}
                </h3>
                <p className="text-xs sm:text-sm text-slate-500 dark:text-zinc-400 line-clamp-2 sm:line-clamp-none">
                  {service.description}
                </p>
              </motion.button>
            );
          })}
        </div>
      </div>
    </section>
  );
}