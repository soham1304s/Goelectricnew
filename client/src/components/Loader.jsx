import { useEffect, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import logoLight from '../assets/logo_light.png';
import logoDark from '../assets/logo_dark.png';
import { useTheme } from '../context/ThemeContext.jsx';

export default function Loader() {
  const [isVisible, setIsVisible] = useState(true);
  const [progress, setProgress] = useState(0);
  const { theme } = useTheme();
  const darkMode = theme === 'dark';

  useEffect(() => {
    // Check if loader has been shown in this session
    const loaderShown = sessionStorage.getItem('loaderShown');
    
    if (loaderShown) {
      setIsVisible(false);
      return;
    }

    // Simulate progress
    const interval = setInterval(() => {
      setProgress(prev => {
        if (prev >= 100) {
          clearInterval(interval);
          setTimeout(() => {
            setIsVisible(false);
            sessionStorage.setItem('loaderShown', 'true');
          }, 800);
          return 100;
        }
        return prev + (Math.random() * 15);
      });
    }, 150);

    return () => clearInterval(interval);
  }, []);

  return (
    <AnimatePresence>
      {isVisible && (
        <motion.div
          initial={{ opacity: 1 }}
          exit={{ 
            opacity: 0,
            scale: 1.1,
            filter: "blur(10px)",
            transition: { duration: 0.8, ease: [0.43, 0.13, 0.23, 0.96] }
          }}
          className="fixed inset-0 z-[9999] flex items-center justify-center bg-[#020617]"
        >
          {/* Background Ambient Glow */}
          <div className="absolute inset-0 overflow-hidden pointer-events-none">
            <motion.div 
              animate={{ 
                scale: [1, 1.2, 1],
                opacity: [0.1, 0.2, 0.1]
              }}
              transition={{ duration: 4, repeat: Infinity, ease: "linear" }}
              className="absolute -top-1/4 -right-1/4 w-full h-full bg-emerald-500/10 rounded-full blur-[120px]"
            />
            <motion.div 
              animate={{ 
                scale: [1.2, 1, 1.2],
                opacity: [0.05, 0.15, 0.05]
              }}
              transition={{ duration: 5, repeat: Infinity, ease: "linear" }}
              className="absolute -bottom-1/4 -left-1/4 w-full h-full bg-blue-500/10 rounded-full blur-[120px]"
            />
          </div>

          <div className="relative z-10 flex flex-col items-center">
            {/* Logo Container */}
            <motion.div
              initial={{ scale: 0.8, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              transition={{ duration: 1, ease: "easeOut" }}
              className="relative mb-12"
            >
              {/* Outer Pulse Rings */}
              {[1, 2].map((i) => (
                <motion.div
                  key={i}
                  animate={{
                    scale: [1, 1.5],
                    opacity: [0.3, 0],
                  }}
                  transition={{
                    duration: 2,
                    repeat: Infinity,
                    delay: i * 0.5,
                    ease: "easeOut",
                  }}
                  className="absolute inset-0 border border-emerald-500/30 rounded-full"
                />
              ))}

              {/* Main Logo */}
              <div className="relative w-32 h-32 md:w-48 md:h-48 flex items-center justify-center">
                <img 
                  src={logoDark} // Using dark logo for the dark intro theme
                  alt="GoElectriQ Logo" 
                  className="w-full h-full object-contain relative z-10 drop-shadow-[0_0_20px_rgba(16,185,129,0.3)]"
                />
                
                {/* Inner Power Core Glow */}
                <motion.div 
                  animate={{ 
                    opacity: [0.4, 0.8, 0.4],
                    scale: [0.8, 1.1, 0.8]
                  }}
                  transition={{ duration: 2, repeat: Infinity }}
                  className="absolute inset-0 bg-emerald-500/20 rounded-full blur-2xl"
                />
              </div>
            </motion.div>

            {/* Loading Protocol */}
            <div className="w-48 md:w-64 space-y-4">
              <div className="flex justify-between items-end">
                <motion.span 
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  className="text-[10px] font-black text-emerald-500 uppercase tracking-[0.3em] ml-1"
                >
                  Initializing Protocol
                </motion.span>
                <span className="text-[10px] font-bold text-slate-500 font-mono">
                  {Math.round(progress)}%
                </span>
              </div>
              
              <div className="h-[2px] w-full bg-slate-800 rounded-full overflow-hidden relative">
                <motion.div 
                  className="absolute top-0 left-0 h-full bg-gradient-to-r from-emerald-500 to-blue-500"
                  initial={{ width: 0 }}
                  animate={{ width: `${progress}%` }}
                  transition={{ type: "spring", stiffness: 50, damping: 15 }}
                />
                
                {/* Scanning Light Effect */}
                <motion.div
                  animate={{ 
                    left: ["-100%", "200%"]
                  }}
                  transition={{ 
                    duration: 1.5, 
                    repeat: Infinity, 
                    ease: "linear" 
                  }}
                  className="absolute top-0 w-20 h-full bg-gradient-to-r from-transparent via-white/30 to-transparent"
                />
              </div>

              <motion.p 
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 0.5 }}
                className="text-center text-[8px] font-bold text-slate-600 uppercase tracking-[0.2em]"
              >
                GoElectriQ Energy Systems &copy; 2026
              </motion.p>
            </div>
          </div>

          {/* Footer Aesthetic */}
          <div className="absolute bottom-12 left-0 w-full flex justify-center">
            <div className="flex gap-4 opacity-20">
              <div className="w-8 h-1 bg-slate-700 rounded-full" />
              <div className="w-1 h-1 bg-emerald-500 rounded-full" />
              <div className="w-1 h-1 bg-slate-700 rounded-full" />
            </div>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
