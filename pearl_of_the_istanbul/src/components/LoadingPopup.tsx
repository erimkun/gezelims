import { useEffect, useState } from 'react';
import './LoadingPopup.css';

const icons = ['🏠', '🍽️', '🌿', '🎭', '🎉', '📍', '☕', '🌳', '🎨', '🏛️'];

const LoadingPopup = () => {
  const [currentIcon, setCurrentIcon] = useState(0);

  useEffect(() => {
    const interval = setInterval(() => {
      setCurrentIcon((prev) => (prev + 1) % icons.length);
    }, 300); // Her 300ms'de bir icon değiştir

    return () => clearInterval(interval);
  }, []);

  return (
    <div className="loading-popup-overlay">
      <div className="loading-popup">
        <div className="loading-icon-container">
          <div className="loading-icon">{icons[currentIcon]}</div>
        </div>
        <p className="loading-text">Yükleniyor...</p>
      </div>
    </div>
  );
};

export default LoadingPopup;
