import React, { useState } from 'react';
import { MessageCircle, X } from 'lucide-react';

const WhatsAppButton = () => {
  const [isOpen, setIsOpen] = useState(false);
  const phoneNumber = '+919876543210'; // Update with your WhatsApp number
  const message = 'Hello! I would like to know more about GoElectriQ services.';

  const handleWhatsAppClick = () => {
    const whatsappUrl = `https://wa.me/${phoneNumber.replace(/\D/g, '')}?text=${encodeURIComponent(message)}`;
    window.open(whatsappUrl, '_blank');
  };

  return (
    <>
      {/* Fixed WhatsApp Button */}
      <div className="fixed right-6 bottom-20 z-50 flex flex-col items-end gap-3">
        {/* Info Box - Slides in when open */}
        <div
          className={`transform transition-all duration-300 origin-right ${
            isOpen
              ? 'opacity-100 translate-x-0 scale-100'
              : 'opacity-0 translate-x-4 scale-95 pointer-events-none'
          }`}
        >
          <div className="bg-white dark:bg-slate-800 rounded-lg shadow-lg p-4 max-w-xs">
            <p className="text-sm font-semibold text-slate-900 dark:text-white mb-2">
              Chat with us!
            </p>
            <p className="text-xs text-slate-600 dark:text-slate-300 mb-3">
              We typically reply within minutes
            </p>
            <button
              onClick={handleWhatsAppClick}
              className="w-full bg-green-500 hover:bg-green-600 text-white font-semibold py-2 px-4 rounded-lg transition-all duration-200 flex items-center justify-center gap-2"
            >
              <MessageCircle size={18} />
              Start Chat
            </button>
          </div>
        </div>

        {/* Main Button */}
        <button
          onClick={() => setIsOpen(!isOpen)}
          className="relative w-14 h-14 bg-gradient-to-r from-green-400 to-green-600 hover:from-green-500 hover:to-green-700 text-white rounded-full shadow-lg hover:shadow-xl transition-all duration-300 flex items-center justify-center group"
          aria-label="WhatsApp"
        >
          {isOpen ? (
            <X size={24} className="transition-transform duration-300" />
          ) : (
            <MessageCircle size={24} className="transition-transform duration-300 group-hover:scale-110" />
          )}

          {/* Pulse animation when closed */}
          {!isOpen && (
            <div className="absolute inset-0 rounded-full bg-green-500 animate-pulse opacity-20"></div>
          )}
        </button>
      </div>

      {/* Backdrop - Click to close */}
      {isOpen && (
        <div
          className="fixed inset-0 z-40"
          onClick={() => setIsOpen(false)}
        ></div>
      )}
    </>
  );
};

export default WhatsAppButton;
