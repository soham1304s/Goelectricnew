let razorpayLoadPromise = null;

export const loadRazorpaySdk = () => {
  if (typeof window === 'undefined') {
    return Promise.reject(new Error('Razorpay SDK can only be loaded in browser'));
  }

  if (window.Razorpay) {
    return Promise.resolve(true);
  }

  if (razorpayLoadPromise) {
    return razorpayLoadPromise;
  }

  razorpayLoadPromise = new Promise((resolve, reject) => {
    const script = document.createElement('script');
    script.src = 'https://checkout.razorpay.com/v1/checkout.js';
    script.async = true;
    
    // Suppress non-critical console warnings from Razorpay SDK
    const originalWarn = console.warn;
    const originalError = console.error;
    
    script.onload = () => {
      // Restore console methods after SDK loads
      if (window.Razorpay) {
        resolve(true);
        return;
      }
      reject(new Error('Razorpay SDK loaded but unavailable'));
    };

    script.onerror = () => {
      reject(new Error('Failed to load Razorpay SDK'));
    };

    document.body.appendChild(script);
  });

  return razorpayLoadPromise;
};
