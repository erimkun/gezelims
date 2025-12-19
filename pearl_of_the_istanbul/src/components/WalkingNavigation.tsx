import { useEffect, useRef } from 'react';
import { useWalkingNavigation } from '../hooks/useWalkingNavigation';
import { formatDistance, formatDuration, type RouteStep } from '../services/routingService';
import LoadingSpinner from './LoadingSpinner';
import './WalkingNavigation.css';

interface WalkingNavigationProps {
  destination: [number, number];
  destinationName: string;
  categoryColor: string;
  onClose: () => void;
  onRouteReady?: (
    geometry: { type: string; coordinates: [number, number][] },
    userLocation: [number, number],
    steps: RouteStep[]
  ) => void;
  onLocationUpdate?: (userLocation: [number, number]) => void; // Konum her güncellendiğinde
}

const WalkingNavigation = ({
  destination,
  destinationName,
  categoryColor,
  onClose,
  onRouteReady,
  onLocationUpdate,
}: WalkingNavigationProps) => {
  const {
    isNavigating,
    route,
    currentStep,
    progress,
    distanceToNextStep,
    userLocation,
    startNavigation,
    stopNavigation,
  } = useWalkingNavigation(destination);

  // Callback'leri ref ile stable tut (sonsuz loop önleme)
  const routeSentRef = useRef(false);
  const lastLocationRef = useRef<[number, number] | null>(null);

  // Navigasyon başlatıldığında (SADECE BİR KEZ!)
  useEffect(() => {
    console.log('🚶‍♂️ WalkingNavigation mounted, destination:', destination);
    let mounted = true;

    const initNavigation = async () => {
      if (mounted) {
        await startNavigation();
      }
    };

    initNavigation();

    return () => {
      mounted = false;
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []); // BOŞ ARRAY - Sadece mount'ta çalış!

  // Rota hazır olduğunda haritaya gönder (SADECE BİR KEZ!)
  useEffect(() => {
    if (route && onRouteReady && userLocation && !routeSentRef.current) {
      console.log('🗺️ Route ready, sending to map:', { geometry: route.geometry, userLocation, steps: route.steps.length });
      onRouteReady(route.geometry, userLocation, route.steps);
      routeSentRef.current = true; // Bir kez gönder
    }
  }, [route, onRouteReady, userLocation]);

  // Kullanıcı konumu güncellendiğinde haritaya bildir (konum değiştiyse)
  useEffect(() => {
    if (userLocation && onLocationUpdate) {
      const lastLoc = lastLocationRef.current;
      // Konum değiştiyse güncelle
      if (!lastLoc || lastLoc[0] !== userLocation[0] || lastLoc[1] !== userLocation[1]) {
        console.log('📍 Location changed, updating map:', userLocation);
        onLocationUpdate(userLocation);
        lastLocationRef.current = userLocation;
      }
    }
  }, [userLocation, onLocationUpdate]);

  // Navigasyon bittiğinde kapat
  useEffect(() => {
    if (!isNavigating && route !== null) {
      // Kullanıcı hedefe vardı
      setTimeout(() => {
        onClose();
      }, 2000);
    }
  }, [isNavigating, route, onClose]);

  if (!isNavigating || !route || !currentStep) {
    console.log('⏳ Navigation loading...', { isNavigating, route: !!route, currentStep: !!currentStep });
    return (
      <div className="walking-nav-loading" role="status" aria-label="Rota hesaplanıyor">
        <LoadingSpinner size="medium" message="Rota hesaplanıyor..." />
      </div>
    );
  }

  console.log('✅ Navigation rendering with route:', { 
    distance: route.distance, 
    duration: route.duration, 
    currentStep: currentStep.instruction 
  });

  // Sonraki dönüş ikonunu belirle
  const getDirectionIcon = () => {
    const modifier = currentStep.maneuver.modifier;
    if (!modifier) return '⬆️';
    if (modifier.includes('left')) return '↖️';
    if (modifier.includes('right')) return '↗️';
    return '⬆️';
  };

  return (
    <div className="walking-nav-container" role="region" aria-label="Yürüyüş navigasyonu">
      <div
        className="walking-nav-box"
        style={{
          background: `linear-gradient(135deg, ${categoryColor}dd 0%, ${categoryColor}aa 100%)`,
          borderColor: categoryColor,
        }}
        role="status"
        aria-live="polite"
      >
        {/* Üst Bilgi: Hedef */}
        <div className="walking-nav-header">
          <div className="walking-nav-destination">
            <span className="walking-nav-icon">🚶</span>
            <div>
              <div className="walking-nav-destination-name">{destinationName}</div>
              <div className="walking-nav-destination-info">
                {formatDistance(route.distance)} · {formatDuration(route.duration)}
              </div>
            </div>
          </div>
        </div>

        {/* Ana İçerik: Sonraki Adım */}
        <div className="walking-nav-instruction">
          <div className="walking-nav-direction-icon">{getDirectionIcon()}</div>
          <div className="walking-nav-instruction-text">
            <div className="walking-nav-distance">{formatDistance(distanceToNextStep)}</div>
            <div className="walking-nav-action">{currentStep.instruction}</div>
          </div>
        </div>

        {/* Progress Bar */}
        <div className="walking-nav-progress-container">
          <div
            className="walking-nav-progress-bar"
            style={{
              width: `${progress}%`,
              background: `linear-gradient(90deg, ${categoryColor} 0%, ${categoryColor}cc 100%)`,
            }}
          />
        </div>
        <div className="walking-nav-progress-text">{Math.round(progress)}% tamamlandı</div>

        {/* Kapat Butonu */}
        <button 
          className="walking-nav-close-btn" 
          onClick={() => {
            stopNavigation();
            onClose(); // Map'e bildir - temizlik yap
          }}
          aria-label="Navigasyonu bitir"
        >
          ❌ Navigasyonu Bitir
        </button>
      </div>
    </div>
  );
};

export default WalkingNavigation;
