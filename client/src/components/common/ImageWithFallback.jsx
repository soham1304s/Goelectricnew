import { useState } from 'react';

export default function ImageWithFallback({ src, alt, className = '' }) {
  const [error, setError] = useState(false);

  if (error || !src) {
    return (
      <div
        className={`bg-[#E5E7EB] flex items-center justify-center text-[#64748b] ${className}`}
        aria-label={alt}
      >
        <span className="text-sm">No image</span>
      </div>
    );
  }

  return (
    <img
      src={src}
      alt={alt}
      className={className}
      onError={() => setError(true)}
      loading="lazy"
    />
  );
}
