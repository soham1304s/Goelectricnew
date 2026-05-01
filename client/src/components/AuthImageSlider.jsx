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
    image: "/auth-bg-3.png",
    title: "Smart Journey Planning",
    description: "From intelligent routing to real-time energy tracking, we provide the tools you need for a seamless journey."
  }
];

export default function AuthImageSlider() {
  const [current, setCurrent] = useState(0);
  const timeoutRef = useRef(null);

  const nextSlide = () => {
    setCurrent((prev) => (prev + 1) % slides.length);
  };

  useEffect(() => {
    timeoutRef.current = setTimeout(nextSlide, 5000); // Change every 5 seconds for better readability
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
          <div
            key={idx}
            className={`auth-slide-wrapper ${idx === current ? 'active' : ''}`}
            style={{
              position: 'absolute',
              top: 0,
              left: 0,
              width: '100%',
              height: '100%',
              opacity: idx === current ? 1 : 0,
              transition: 'opacity 1.5s ease-in-out, transform 1.5s ease-in-out',
              transform: idx === current ? 'scale(1)' : 'scale(1.1)',
              zIndex: idx === current ? 2 : 1
            }}
          >
            <img
              src={slide.image}
              alt={slide.title}
              className="auth-illustration"
              style={{
                width: '100%',
                height: '100%',
                objectFit: 'cover'
              }}
            />
            {/* Gradient Overlay for better text readability */}
            <div className="auth-slide-overlay" />
          </div>
        ))}
      </div>

      <div className="auth-left-content">
        <div className="auth-left-copy">
          <h2 className="auth-left-title">{slides[current].title}</h2>
          <p className="auth-left-description">{slides[current].description}</p>
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
    </div>
  );
}
