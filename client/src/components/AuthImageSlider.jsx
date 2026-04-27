import { useEffect, useRef, useState } from "react";

const slides = [
  {
    image: "/auth-bg.png",
    title: "The Future of Mobility",
    description: "Join GoElectriQ and lead the transition to sustainable energy with our premium electric vehicle services."
  },
  {
    image: "/auth-bg-2.png",
    title: "Eco-Friendly Travel",
    description: "Experience the quiet power of electric driving. GoElectriQ makes green travel accessible for everyone."
  },
  {
    image: "/auth-bg.png",
    title: "Charge Your Journey",
    description: "From quick city hops to long-distance adventures, GoElectriQ provides the platform you need to thrive."
  }
];

export default function AuthImageSlider() {
  const [current, setCurrent] = useState(0);
  const timeoutRef = useRef(null);

  const nextSlide = () => {
    setCurrent((prev) => (prev + 1) % slides.length);
  };

  useEffect(() => {
    timeoutRef.current = setTimeout(nextSlide, 3000); // Change every 3 seconds
    return () => {
      if (timeoutRef.current) {
        clearTimeout(timeoutRef.current);
      }
    };
  }, [current]);

  return (
    <div className="auth-slider">
      <div className="auth-illustration-container">
        {slides.map((slide, idx) => (
          <img
            key={idx}
            src={slide.image}
            alt={`Slide ${idx}`}
            className={`auth-illustration ${idx === current ? 'active' : ''}`}
            style={{ 
              position: idx === current ? 'relative' : 'absolute',
              opacity: idx === current ? 1 : 0,
              transition: 'opacity 1s ease-in-out',
              top: 0,
              left: 0,
              width: '100%'
            }}
          />
        ))}
      </div>
      <div className="auth-left-copy">
        <h2 className="auth-left-title" style={{ transition: 'all 0.5s' }}>{slides[current].title}</h2>
        <p className="auth-left-description" style={{ transition: 'all 0.5s' }}>{slides[current].description}</p>
      </div>
      <div className="auth-dots">
        {slides.map((_, idx) => (
          <div
            key={idx}
            className={`auth-dot${idx === current ? ' active' : ''}`}
            onClick={() => {
              if (timeoutRef.current) clearTimeout(timeoutRef.current);
              setCurrent(idx);
            }}
          />
        ))}
      </div>
    </div>
  );
}
