// OSRM Routing Service (API Key gerektirmez)

export interface RouteStep {
  distance: number; // metre
  duration: number; // saniye
  instruction: string; // "Sola dön", "Sağa dön" etc.
  maneuver: {
    type: string; // "turn", "arrive", "depart"
    modifier?: string; // "left", "right", "straight"
  };
  location: [number, number]; // [lon, lat]
}

export interface RouteData {
  distance: number; // toplam metre
  duration: number; // toplam saniye
  geometry: {
    type: string;
    coordinates: [number, number][];
  };
  steps: RouteStep[];
}

/**
 * OSRM ile yürüme rotası hesapla
 */
export const getWalkingRoute = async (
  start: [number, number], // [lon, lat]
  end: [number, number]    // [lon, lat]
): Promise<RouteData | null> => {
  try {
    const url = `https://router.project-osrm.org/route/v1/foot/${start[0]},${start[1]};${end[0]},${end[1]}?steps=true&geometries=geojson&overview=full`;
    
    console.log('🛣️ OSRM rota isteği:', url);
    
    const response = await fetch(url);
    
    if (!response.ok) {
      console.error('❌ OSRM API hatası:', response.status);
      return null;
    }
    
    const data = await response.json();
    
    if (!data.routes || data.routes.length === 0) {
      console.error('❌ Rota bulunamadı');
      return null;
    }
    
    const route = data.routes[0];
    const leg = route.legs[0];
    
    // Steps'i Türkçe instruction'lara çevir
    const steps: RouteStep[] = leg.steps.map((step: { distance: number; duration: number; maneuver: { type: string; modifier?: string; location: [number, number] }; name?: string }) => ({
      distance: step.distance,
      duration: step.duration,
      instruction: formatInstruction(step.maneuver, step.name),
      maneuver: {
        type: step.maneuver.type,
        modifier: step.maneuver.modifier,
      },
      location: step.maneuver.location,
    }));
    
    console.log('✅ Rota hesaplandı:', {
      distance: route.distance,
      duration: route.duration,
      steps: steps.length,
    });
    
    return {
      distance: route.distance,
      duration: route.duration,
      geometry: route.geometry,
      steps,
    };
  } catch (error) {
    console.error('❌ Rota hesaplama hatası:', error);
    return null;
  }
};

/**
 * Manevra tipini Türkçe instruction'a çevir
 */
const formatInstruction = (maneuver: { type: string; modifier?: string }, streetName?: string): string => {
  const { type, modifier } = maneuver;
  const street = streetName && streetName !== '' ? ` (${streetName})` : '';
  
  switch (type) {
    case 'depart':
      return `Başlangıç${street}`;
    
    case 'arrive':
      return 'Hedefe vardınız!';
    
    case 'turn':
      if (modifier === 'left') return `Sola dön${street}`;
      if (modifier === 'right') return `Sağa dön${street}`;
      if (modifier === 'slight left') return `Hafif sola kıvrıl${street}`;
      if (modifier === 'slight right') return `Hafif sağa kıvrıl${street}`;
      if (modifier === 'sharp left') return `Keskin sola dön${street}`;
      if (modifier === 'sharp right') return `Keskin sağa dön${street}`;
      return `Devam et${street}`;
    
    case 'new name':
      return `Yola devam et${street}`;
    
    case 'continue':
      return `Düz git${street}`;
    
    case 'roundabout':
      return `Dönel kavşaktan çık${street}`;
    
    default:
      return `Devam et${street}`;
  }
};

/**
 * Mesafeyi okunabilir formata çevir
 */
export const formatDistance = (meters: number): string => {
  if (meters < 1000) {
    return `${Math.round(meters)}m`;
  } else {
    return `${(meters / 1000).toFixed(1)}km`;
  }
};

/**
 * Süreyi okunabilir formata çevir
 */
export const formatDuration = (seconds: number): string => {
  const minutes = Math.round(seconds / 60);
  if (minutes < 60) {
    return `${minutes} dakika`;
  } else {
    const hours = Math.floor(minutes / 60);
    const mins = minutes % 60;
    return `${hours} saat ${mins} dakika`;
  }
};
