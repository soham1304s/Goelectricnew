import { useEffect, useState } from 'react';
import '../styles/Loader.css';

export default function Loader() {
  const [showLoader, setShowLoader] = useState(false);

  useEffect(() => {
    // Check if loader has been shown in this session
    const loaderShown = sessionStorage.getItem('loaderShown');
    
    if (!loaderShown) {
      const startTimer = setTimeout(() => {
        setShowLoader(true);
      }, 0);
      sessionStorage.setItem('loaderShown', 'true');
      
      // Auto-hide loader after 3 seconds
      const timer = setTimeout(() => {
        setShowLoader(false);
      }, 3000);

      return () => {
        clearTimeout(startTimer);
        clearTimeout(timer);
      };
    }
  }, []);

  if (!showLoader) return null;

  return (
    <div className="loader-overlay">
      <div className="loader-container">
        <div className="loader-content">
          {/* Logo Image */}
          <img 
            src="/Logo_black.jpeg" 
            alt="GoElectriQ Logo" 
            className="loader-logo"
          />
          
          {/* Light glow effect */}
          <div className="light-glow"></div>
          
          {/* Additional shimmer effect */}
          <div className="shimmer-effect"></div>
        </div>
      </div>
    </div>
  );
}
