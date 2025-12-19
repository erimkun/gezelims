import { useEffect, useState, useRef } from 'react';
import './DirectionsModal.css';
import LoadingSpinner from './LoadingSpinner';
import { useFocusTrap } from '../hooks/useFocusTrap';

type TravelMode = 'driving' | 'transit';

interface DirectionsModalProps {
  poi: {
    id: string;
    name: string;
    coordinates: [number, number];
  };
  onClose: () => void;
  language: 'tr' | 'en' | 'de' | 'fr' | 'es' | 'it';
}

const translations = {
  tr: {
    title: 'Yol Tarifi',
    openInMaps: 'Google Maps\'te Aç',
    loading: 'Yükleniyor...',
    locationError: 'Konum alınamadı',
    locationMessage: 'Lütfen tarayıcınızda konum izni verin.',
    driving: 'Araç',
    transit: 'Toplu Taşıma',
  },
  en: {
    title: 'Directions',
    openInMaps: 'Open in Google Maps',
    loading: 'Loading...',
    locationError: 'Location unavailable',
    locationMessage: 'Please allow location access in your browser.',
    driving: 'Driving',
    transit: 'Transit',
  },
  de: {
    title: 'Wegbeschreibung',
    openInMaps: 'In Google Maps öffnen',
    loading: 'Wird geladen...',
    locationError: 'Standort nicht verfügbar',
    locationMessage: 'Bitte erlauben Sie den Standortzugriff in Ihrem Browser.',
    driving: 'Auto',
    transit: 'ÖPNV',
  },
  fr: {
    title: 'Itinéraire',
    openInMaps: 'Ouvrir dans Google Maps',
    loading: 'Chargement...',
    locationError: 'Position indisponible',
    locationMessage: 'Veuillez autoriser l\'accès à la localisation dans votre navigateur.',
    driving: 'Voiture',
    transit: 'Transports',
  },
  es: {
    title: 'Direcciones',
    openInMaps: 'Abrir en Google Maps',
    loading: 'Cargando...',
    locationError: 'Ubicación no disponible',
    locationMessage: 'Por favor, permita el acceso a la ubicación en su navegador.',
    driving: 'Coche',
    transit: 'Transporte',
  },
  it: {
    title: 'Indicazioni',
    openInMaps: 'Apri in Google Maps',
    loading: 'Caricamento...',
    locationError: 'Posizione non disponibile',
    locationMessage: 'Si prega di consentire l\'accesso alla posizione nel browser.',
    driving: 'Auto',
    transit: 'Trasporti',
  },
};

const DirectionsModal = ({ poi, onClose, language }: DirectionsModalProps) => {
  const [userLocation, setUserLocation] = useState<{ lat: number; lng: number } | null>(null);
  const [locationError, setLocationError] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [travelMode, setTravelMode] = useState<TravelMode>('driving');
  const containerRef = useRef<HTMLDivElement>(null);
  const t = translations[language];

  // Focus trap - modal içinde focus'u tut
  useFocusTrap(true, containerRef, onClose);

  // Kullanıcının konumunu al
  useEffect(() => {
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        (position) => {
          setUserLocation({
            lat: position.coords.latitude,
            lng: position.coords.longitude,
          });
          setIsLoading(false);
        },
        (error) => {
          console.error('Konum alınamadı:', error);
          setLocationError(true);
          setIsLoading(false);
        }
      );
    } else {
      setLocationError(true);
      setIsLoading(false);
    }
  }, []);

  // ESC artık useFocusTrap tarafından yönetiliyor

  // Backdrop'a tıklayınca kapatma
  const handleBackdropClick = (e: React.MouseEvent) => {
    if (e.target === e.currentTarget) {
      onClose();
    }
  };

  // Google Maps URL'i oluştur
  const getGoogleMapsUrl = () => {
    const destination = `${poi.coordinates[1]},${poi.coordinates[0]}`;
    if (userLocation) {
      const origin = `${userLocation.lat},${userLocation.lng}`;
      return `https://www.google.com/maps/dir/?api=1&origin=${origin}&destination=${destination}&travelmode=${travelMode}`;
    }
    return `https://www.google.com/maps/dir/?api=1&destination=${destination}&travelmode=${travelMode}`;
  };

  // Google Maps'te aç
  const openInGoogleMaps = () => {
    window.open(getGoogleMapsUrl(), '_blank');
  };

  // Google Maps Embed URL'i oluştur
  const getEmbedUrl = () => {
    const destination = `${poi.coordinates[1]},${poi.coordinates[0]}`;
    
    // Yol tarifi modu mapping (Google Maps iframe için)
    const modeMap: Record<TravelMode, string> = {
      driving: 'd',
      transit: 'r',
    };
    
    if (userLocation) {
      const origin = `${userLocation.lat},${userLocation.lng}`;
      // API key olmadan: Google Maps directions iframe (zoom=12 ile daha geniş görünüm)
      return `https://maps.google.com/maps?saddr=${origin}&daddr=${destination}&dirflg=${modeMap[travelMode]}&z=12&output=embed`;
    }
    // Sadece hedef konumu göster
    return `https://maps.google.com/maps?q=${poi.coordinates[1]},${poi.coordinates[0]}&z=14&output=embed`;
  };

  return (
    <div 
      className="directions-modal-backdrop" 
      onClick={handleBackdropClick}
      role="dialog"
      aria-modal="true"
      aria-labelledby="directions-modal-title"
    >
      <div 
        className="directions-modal-container"
        role="document"
        ref={containerRef}
      >
        {/* Başlık */}
        <div className="directions-modal-header">
          <div className="directions-modal-title">
            <span className="directions-modal-icon" aria-hidden="true">🧭</span>
            <h3 id="directions-modal-title">{t.title}</h3>
          </div>
          <button 
            className="directions-modal-close"
            onClick={onClose}
            aria-label="Close"
          >
            ✕
          </button>
        </div>

        {/* İçerik */}
        <div className="directions-modal-content">
          {isLoading ? (
            <div className="directions-loading">
              <LoadingSpinner size="medium" message={t.loading} />
            </div>
          ) : locationError ? (
            <div className="directions-error">
              <span className="directions-error-icon">📍</span>
              <p className="directions-error-title">{t.locationError}</p>
              <p className="directions-error-message">{t.locationMessage}</p>
            </div>
          ) : (
            <>
              {/* POI İsmi */}
              <div className="directions-destination">
                <span className="directions-destination-icon">📍</span>
                <span className="directions-destination-name">{poi.name}</span>
              </div>

              {/* Ulaşım Modu Seçimi */}
              <div className="directions-mode-selector">
                <button
                  className={`directions-mode-btn ${travelMode === 'driving' ? 'active' : ''}`}
                  onClick={() => setTravelMode('driving')}
                  title={t.driving}
                >
                  <span className="directions-mode-icon">🚗</span>
                  <span className="directions-mode-label">{t.driving}</span>
                </button>
                <button
                  className={`directions-mode-btn ${travelMode === 'transit' ? 'active' : ''}`}
                  onClick={() => setTravelMode('transit')}
                  title={t.transit}
                >
                  <span className="directions-mode-icon">🚌</span>
                  <span className="directions-mode-label">{t.transit}</span>
                </button>
              </div>

              {/* Google Maps iframe */}
              <div className="directions-map-container">
                <iframe
                  key={travelMode}
                  src={getEmbedUrl()}
                  width="100%"
                  height="100%"
                  style={{ border: 0 }}
                  allowFullScreen
                  loading="lazy"
                  referrerPolicy="no-referrer-when-downgrade"
                  title="Google Maps Directions"
                ></iframe>
                
                {/* Google Maps Badge */}
                <div className="directions-maps-badge" onClick={openInGoogleMaps}>
                  <span className="directions-maps-icon">
                    <svg width="20" height="20" viewBox="0 0 24 24" fill="currentColor">
                      <path d="M12 2C8.13 2 5 5.13 5 9c0 5.25 7 13 7 13s7-7.75 7-13c0-3.87-3.13-7-7-7zm0 9.5c-1.38 0-2.5-1.12-2.5-2.5s1.12-2.5 2.5-2.5 2.5 1.12 2.5 2.5-1.12 2.5-2.5 2.5z"/>
                    </svg>
                  </span>
                  <span>maps.google</span>
                </div>
              </div>
            </>
          )}
        </div>

        {/* Aksiyon Butonu */}
        {!isLoading && !locationError && (
          <div className="directions-modal-actions">
            <button 
              className="directions-modal-btn"
              onClick={openInGoogleMaps}
            >
              <span className="directions-btn-icon">🗺️</span>
              {t.openInMaps}
            </button>
          </div>
        )}
      </div>
    </div>
  );
};

export default DirectionsModal;
