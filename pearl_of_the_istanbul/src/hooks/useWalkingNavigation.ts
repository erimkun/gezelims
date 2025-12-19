import { useState, useEffect, useCallback } from 'react';
import { getWalkingRoute, type RouteData, type RouteStep } from '../services/routingService';

interface NavigationState {
  isNavigating: boolean;
  route: RouteData | null;
  currentStep: RouteStep | null;
  currentStepIndex: number;
  progress: number; // 0-100
  distanceToNextStep: number; // metre
  userLocation: [number, number] | null;
}

export const useWalkingNavigation = (destination: [number, number]) => {
  const [state, setState] = useState<NavigationState>({
    isNavigating: false,
    route: null,
    currentStep: null,
    currentStepIndex: 0,
    progress: 0,
    distanceToNextStep: 0,
    userLocation: null,
  });

  // Konum takibi watch ID
  const [watchId, setWatchId] = useState<number | null>(null);

  /**
   * Navigasyonu durdur
   */
  const stopNavigation = useCallback(() => {
    console.log('⏹️ Navigasyon durduruluyor...');

    // Konum takibini durdur
    if (watchId !== null) {
      navigator.geolocation.clearWatch(watchId);
      setWatchId(null);
    }

    // State'i sıfırla
    setState({
      isNavigating: false,
      route: null,
      currentStep: null,
      currentStepIndex: 0,
      progress: 0,
      distanceToNextStep: 0,
      userLocation: null,
    });

    console.log('✅ Navigasyon durduruldu');
  }, [watchId]);

  /**
   * Konum güncellendiğinde (15 saniyede bir)
   */
  const updateLocation = useCallback(
    (newLocation: [number, number]) => {
      setState((prev) => {
        if (!prev.route || !prev.isNavigating) return prev;

        // Hedefe mesafe hesapla
        const distanceToDestination = calculateDistance(newLocation, destination);

        // Hedefe 20m'den yakınsa bitir
        if (distanceToDestination < 0.02) {
          console.log('🎉 Hedefe varıldı!');
          stopNavigation();
          return prev;
        }

        // Şu anki step'e mesafe
        const currentStepLocation = prev.currentStep?.location || destination;
        const distanceToStep = calculateDistance(newLocation, currentStepLocation);

        // Step'e 20m'den yakınsa bir sonraki step'e geç
        if (distanceToStep < 0.02 && prev.currentStepIndex < prev.route.steps.length - 1) {
          const nextIndex = prev.currentStepIndex + 1;
          const nextStep = prev.route.steps[nextIndex];

          console.log('➡️ Sonraki adıma geçiliyor:', nextStep.instruction);

          return {
            ...prev,
            currentStepIndex: nextIndex,
            currentStep: nextStep,
            distanceToNextStep: nextStep.distance,
            userLocation: newLocation,
          };
        }

        // Progress hesapla (toplam mesafeden kat edilen mesafe)
        const totalDistance = prev.route.distance;
        const traveledDistance = prev.route.steps
          .slice(0, prev.currentStepIndex)
          .reduce((sum, step) => sum + step.distance, 0);
        const progress = Math.min(100, (traveledDistance / totalDistance) * 100);

        return {
          ...prev,
          userLocation: newLocation,
          distanceToNextStep: distanceToStep * 1000, // km -> metre
          progress,
        };
      });
    },
    [destination, stopNavigation]
  );

  /**
   * Navigasyonu başlat
   */
  const startNavigation = useCallback(async () => {
    console.log('🚶 Navigasyon başlatılıyor...');

    // Kullanıcı konumunu al
    if (!navigator.geolocation) {
      alert('Tarayıcınız konum servislerini desteklemiyor!');
      return;
    }

    // Sabit başlangıç noktası: Üsküdar Merkezi (Doğancılar Caddesi)
    const USKUDAR_CENTER: [number, number] = [29.0167, 41.0214]; // [lng, lat]

    try {
      const position = await new Promise<GeolocationPosition>((resolve, reject) => {
        navigator.geolocation.getCurrentPosition(resolve, reject, {
          enableHighAccuracy: true,
          timeout: 30000, // 30 saniye timeout (uzun yollar için)
          maximumAge: 60000 // 1 dakika cache (gereksiz istekleri engelle)
        });
      });

      const userLoc: [number, number] = [
        position.coords.longitude,
        position.coords.latitude,
      ];

      console.log('📍 Kullanıcı konumu:', userLoc);

      // Üsküdar sınırlarını kontrol et (kabaca bbox)
      const USKUDAR_BBOX = {
        minLng: 28.95,
        maxLng: 29.10,
        minLat: 40.95,
        maxLat: 41.05
      };

      const isInUskudar = 
        userLoc[0] >= USKUDAR_BBOX.minLng &&
        userLoc[0] <= USKUDAR_BBOX.maxLng &&
        userLoc[1] >= USKUDAR_BBOX.minLat &&
        userLoc[1] <= USKUDAR_BBOX.maxLat;

      // Başlangıç noktasını belirle
      const startPoint = isInUskudar ? userLoc : USKUDAR_CENTER;

      if (!isInUskudar) {
        console.log('⚠️ Konum Üsküdar dışında, sabit noktadan rota oluşturuluyor:', USKUDAR_CENTER);
        alert('Konumunuz Üsküdar dışında. Üsküdar merkezinden rotanız oluşturuluyor.');
      }

      console.log('🗺️ Başlangıç konumu:', startPoint);

      // Rota hesapla
      const routeData = await getWalkingRoute(startPoint, destination);

      if (!routeData) {
        alert('Rota hesaplanamadı. Lütfen tekrar deneyin.');
        return;
      }

      // Konum takibini başlat (15 saniyede bir)
      const id = window.navigator.geolocation.watchPosition(
        (pos) => {
          const newLoc: [number, number] = [pos.coords.longitude, pos.coords.latitude];
          updateLocation(newLoc);
        },
        (error) => {
          console.error('❌ Konum takip hatası:', error);
        },
        {
          enableHighAccuracy: true,
          timeout: 15000,
          maximumAge: 15000, // 15 saniye cache
        }
      );

      setWatchId(id);

      // State'i güncelle
      setState({
        isNavigating: true,
        route: routeData,
        currentStep: routeData.steps[0],
        currentStepIndex: 0,
        progress: 0,
        distanceToNextStep: routeData.steps[0]?.distance || 0,
        userLocation: startPoint, // Başlangıç noktasını kullan
      });

      console.log('✅ Navigasyon başladı!');
    } catch (error) {
      console.error('❌ Konum alınamadı:', error);
      alert('Konum izni gerekli! Lütfen konum servislerini aktif edin.');
    }
  }, [destination, updateLocation]);

  /**
   * Component unmount olduğunda konum takibini durdur
   */
  useEffect(() => {
    return () => {
      if (watchId !== null) {
        navigator.geolocation.clearWatch(watchId);
      }
    };
  }, [watchId]);

  return {
    ...state,
    startNavigation,
    stopNavigation,
  };
};

/**
 * İki koordinat arası mesafe (Haversine - km)
 */
const calculateDistance = (
  coord1: [number, number],
  coord2: [number, number]
): number => {
  const R = 6371; // Dünya yarıçapı (km)
  const dLat = ((coord2[1] - coord1[1]) * Math.PI) / 180;
  const dLon = ((coord2[0] - coord1[0]) * Math.PI) / 180;
  const a =
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos((coord1[1] * Math.PI) / 180) *
      Math.cos((coord2[1] * Math.PI) / 180) *
      Math.sin(dLon / 2) *
      Math.sin(dLon / 2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  return R * c;
};
