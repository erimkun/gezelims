import { useEffect, useRef, useState } from 'react';
import maplibregl from 'maplibre-gl';
import 'maplibre-gl/dist/maplibre-gl.css';
import { transformGeoJSON } from '../utils/coordinateTransform';
import { cacheService } from '../services/cacheService';
import { throttle } from '../utils/performanceUtils';
import { calculateDistance } from '../utils/geoUtils';
import { APP_CONFIG } from '../config/app.config';
import { getCategoryColor } from '../config/categories.config';
import FlagIcon from './FlagIcon';
import POIPopup from './POIPopup';
import WalkingNavigation from './WalkingNavigation';

// Harita stilleri
const MAP_STYLES = {
  voyager: {
    name: 'Voyager',
    tiles: [
      'https://a.basemaps.cartocdn.com/rastertiles/voyager/{z}/{x}/{y}.png',
      'https://b.basemaps.cartocdn.com/rastertiles/voyager/{z}/{x}/{y}.png',
      'https://c.basemaps.cartocdn.com/rastertiles/voyager/{z}/{x}/{y}.png',
      'https://d.basemaps.cartocdn.com/rastertiles/voyager/{z}/{x}/{y}.png'
    ],
    attribution: '© CARTO © OpenStreetMap contributors'
  },
  dark: {
    name: 'Dark',
    tiles: [
      'https://a.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}.png',
      'https://b.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}.png',
      'https://c.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}.png',
      'https://d.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}.png'
    ],
    attribution: '© CARTO © OpenStreetMap contributors'
  },
  osmBright: {
    name: 'OSM Bright',
    tiles: [
      'https://a.tile.openstreetmap.org/{z}/{x}/{y}.png',
      'https://b.tile.openstreetmap.org/{z}/{x}/{y}.png',
      'https://c.tile.openstreetmap.org/{z}/{x}/{y}.png'
    ],
    attribution: '© OpenStreetMap contributors'
  }
};

type MapStyleKey = keyof typeof MAP_STYLES;

// Kategori ikonları (fallback)
const CATEGORY_ICONS: Record<string, string> = {
  all: '📍',
  food: '🍽️',
  yemek: '🍽️',
  nature: '🌳',
  doga: '🌳',
  culture: '🎭',
  'kultur-sanat': '🎭',
  entertainment: '🎉',
  eglence: '🎉',
  other: '📌',
  diger: '📌'
};

// Icon seçme fonksiyonu - basitleştirilmiş versiyon
const getIconForPOI = (category: string): string => {
  // Kategori iconunu kullan
  return CATEGORY_ICONS[category] || '📍';
};

// Dil seçenekleri
const LANGUAGES = {
  tr: { name: 'Türkçe', code: 'TR' as const },
  en: { name: 'English', code: 'US' as const },
  de: { name: 'Deutsch', code: 'DE' as const },
  fr: { name: 'Français', code: 'FR' as const },
  es: { name: 'Español', code: 'ES' as const },
  it: { name: 'Italiano', code: 'IT' as const }
};

type LanguageKey = keyof typeof LANGUAGES;

interface POI {
  id: string;
  name: string;
  category: string;
  subcategory: string;
  address: string;
  description?: string;
  coordinates: [number, number];
  rating?: number;
  reviews_count?: number;
  images?: string[];
  phone?: string;
  website?: string;
  workday_timing?: string;
  closed_on?: string[];
}

interface MapProps {
  language: LanguageKey;
  onLanguageChange: (lang: LanguageKey) => void;
  onPOIClick?: (poi: POI) => void;
  selectedCategory: string;
  poiCache: Record<string, POI>;
  onPOIsLoad: (pois: POI[]) => void;
  sidebarPOIs?: POI[]; // Sidebar'dan gelen POI'ler
  onVisiblePOIsChange?: (pois: POI[]) => void; // Haritada görünen POI'leri Sidebar'a gönder
  isWalkingMode: boolean; // Walking navigation aktif mi?
  walkingDestination: POI | null; // Walking hedef POI
  onNavigationStart: (poi: POI) => void; // Navigation başladı
  onNavigationEnd: () => void; // Navigation bitti
  onNavigateToMiniGames?: () => void; // Optional callback to open mini-games
}

const Map = ({ language, onLanguageChange, onPOIClick, selectedCategory, poiCache, onPOIsLoad, sidebarPOIs, onVisiblePOIsChange, isWalkingMode, walkingDestination, onNavigationStart, onNavigationEnd, onNavigateToMiniGames }: MapProps) => {
  const mapContainer = useRef<HTMLDivElement>(null);
  const map = useRef<maplibregl.Map | null>(null);
  const markersMapRef = useRef<Record<string, maplibregl.Marker>>({}); // POI ID -> Marker map
  const userLocationMarkerRef = useRef<maplibregl.Marker | null>(null); // Kullanıcı konumu ikonu
  const routeSourceIdRef = useRef<string>('walking-route'); // Rota source ID
  const turnmarkersMapRef = useRef<maplibregl.Marker[]>([]); // Dönüş noktası marker'ları
  const selectedCategoryRef = useRef<string>(selectedCategory); // selectedCategory'yi güncel tut
  const [showStylePicker, setShowStylePicker] = useState(false);
  const [showLanguagePicker, setShowLanguagePicker] = useState(false);
  const [currentStyle, setCurrentStyle] = useState<MapStyleKey>('voyager');
  const [selectedPOI, setSelectedPOI] = useState<POI | null>(null);
  const [isDesktop, setIsDesktop] = useState(false);
  const [visiblePOIs, setVisiblePOIs] = useState<POI[]>([]);
  const lastLoadCenterRef = useRef<[number, number] | null>(null); // Son POI yükleme merkezi
  const [showWalkingNavigation, setShowWalkingNavigation] = useState(false); // Walking navigation görünürlüğü

  const translations = {
    tr: {
      mapStyle: 'Harita Altlığı',
      voyager: 'Voyager',
      dark: 'Karanlık',
      osmBright: 'OSM Bright'
    },
    en: {
      mapStyle: 'Map Style',
      voyager: 'Voyager',
      dark: 'Dark',
      osmBright: 'OSM Bright'
    },
    de: {
      mapStyle: 'Kartenstil',
      voyager: 'Voyager',
      dark: 'Dunkel',
      osmBright: 'OSM Bright'
    },
    fr: {
      mapStyle: 'Style de Carte',
      voyager: 'Voyager',
      dark: 'Sombre',
      osmBright: 'OSM Bright'
    },
    es: {
      mapStyle: 'Estilo de Mapa',
      voyager: 'Voyager',
      dark: 'Oscuro',
      osmBright: 'OSM Bright'
    },
    it: {
      mapStyle: 'Stile Mappa',
      voyager: 'Voyager',
      dark: 'Scuro',
      osmBright: 'OSM Bright'
    }
  };

  // Haritaya walking route çiz
  const drawRouteOnMap = (
    geometry: { type: string; coordinates: [number, number][] },
    categoryColor: string,
    userLocation: [number, number],
    steps: Array<{ location: [number, number]; instruction: string; maneuver: { modifier?: string } }>
  ) => {
    if (!map.current) return;

    console.log('🎨 Drawing route on map:', { geometry, categoryColor, userLocation });

    // 1. Rota çizgisini ekle
    const sourceId = routeSourceIdRef.current;
    
    // Eski rota varsa sil
    if (map.current.getSource(sourceId)) {
      if (map.current.getLayer(sourceId + '-line')) {
        map.current.removeLayer(sourceId + '-line');
      }
      map.current.removeSource(sourceId);
    }

    // Yeni rota source ekle (lineMetrics: true for gradient)
    map.current.addSource(sourceId, {
      type: 'geojson',
      data: geometry as GeoJSON.Feature | GeoJSON.FeatureCollection | GeoJSON.Geometry,
      lineMetrics: true // GRADIENT için gerekli!
    });

    // Rota çizgisi layer ekle - BASİT ÇİZGİ (gradient sorunlu)
    map.current.addLayer({
      id: sourceId + '-line',
      type: 'line',
      source: sourceId,
      layout: {
        'line-join': 'round',
        'line-cap': 'round'
      },
      paint: {
        'line-color': categoryColor,
        'line-width': 5,
        'line-opacity': 0.85
      }
    });

    // 2. Dönüş noktalarını ekle (sağa/sola dön marker'ları)
    turnmarkersMapRef.current.forEach(marker => marker.remove());
    turnmarkersMapRef.current = [];

    steps.forEach((step, index) => {
      // İlk ve son adımı atla (başlangıç/bitiş zaten var)
      if (index === 0 || index === steps.length - 1) return;

      const modifier = step.maneuver.modifier || '';
      let icon = '⬆️';
      if (modifier.includes('left')) icon = '↰';
      if (modifier.includes('right')) icon = '↱';

      const turnEl = document.createElement('div');
      turnEl.className = 'turn-marker';
      turnEl.innerHTML = `
        <div style="
          background: white;
          border: 3px solid ${categoryColor};
          width: 30px;
          height: 30px;
          border-radius: 50%;
          display: flex;
          align-items: center;
          justify-content: center;
          font-size: 18px;
          box-shadow: 0 4px 12px rgba(0,0,0,0.3);
          animation: pulse 2s infinite;
        ">${icon}</div>
      `;

      const turnMarker = new maplibregl.Marker({ element: turnEl })
        .setLngLat(step.location)
        .addTo(map.current!);

      turnmarkersMapRef.current.push(turnMarker);
    });

    // 3. Kullanıcı konumu ikonu ekle (yürüyen adam)
    if (userLocationMarkerRef.current) {
      userLocationMarkerRef.current.remove();
    }

    const userEl = document.createElement('div');
    userEl.className = 'user-location-marker';
    userEl.innerHTML = `
      <div style="
        background: ${categoryColor};
        border: 4px solid white;
        width: 50px;
        height: 50px;
        border-radius: 50%;
        display: flex;
        align-items: center;
        justify-content: center;
        font-size: 28px;
        box-shadow: 0 6px 16px rgba(0,0,0,0.4);
        animation: walk 1s infinite;
      ">🚶</div>
    `;

    userLocationMarkerRef.current = new maplibregl.Marker({ element: userEl })
      .setLngLat(userLocation)
      .addTo(map.current);

    // 4. Kamera: Yatay açı (pitch) ve kullanıcı merkezde
    const moveCamera = () => {
      if (map.current) {
        console.log('📸 Moving camera to user location:', userLocation);
        map.current.flyTo({
          center: userLocation,
          zoom: APP_CONFIG.map.NAVIGATION_ZOOM,
          pitch: APP_CONFIG.map.NAVIGATION_PITCH, // 3D görünüm
          bearing: 0,
          duration: APP_CONFIG.ui.NAVIGATION_FLY_TO_DURATION_MS
        });
        console.log('✅ Camera flyTo called');
      }
    };

    // Kamera hareketini biraz geciktir (marker eklendikten sonra)
    setTimeout(() => {
      moveCamera();
    }, 100);

    console.log('✅ Route drawn on map with', steps.length, 'turn markers');
  };

  // Walking navigation bittiğinde temizlik
  const clearRouteFromMap = () => {
    if (!map.current) return;

    console.log('🧹 Clearing route from map');

    // Rota çizgisini sil
    const sourceId = routeSourceIdRef.current;
    if (map.current.getLayer(sourceId + '-line')) {
      map.current.removeLayer(sourceId + '-line');
    }
    if (map.current.getSource(sourceId)) {
      map.current.removeSource(sourceId);
    }

    // Dönüş marker'larını sil
    turnmarkersMapRef.current.forEach(marker => marker.remove());
    turnmarkersMapRef.current = [];

    // Kullanıcı ikonu sil
    if (userLocationMarkerRef.current) {
      userLocationMarkerRef.current.remove();
      userLocationMarkerRef.current = null;
    }

    // Kamerayı normal hale getir
    const resetCamera = () => {
      if (map.current) {
        const currentCenter = map.current.getCenter();
        console.log('📸 Resetting camera to normal view');
        map.current.flyTo({
          center: [currentCenter.lng, currentCenter.lat],
          zoom: APP_CONFIG.map.NORMAL_ZOOM, // Normal zoom
          pitch: 0, // Normal görünüm
          bearing: 0,
          duration: APP_CONFIG.ui.RESET_CAMERA_DURATION_MS
        });
        console.log('✅ Camera reset called');
      }
    };

    // Kamera resetini biraz geciktir (cleanup sonrası)
    setTimeout(() => {
      resetCamera();
    }, 100);

    console.log('✅ Route cleared from map');
  };

  // Viewport'taki POI'leri yükle
  const loadPOIsInViewport = async (center: [number, number], category: string) => {
    console.log('🗺️ Viewport POI yükleniyor:', { center, category });

    // Son yükleme merkezini güncelle
    lastLoadCenterRef.current = center;
    
    // Kategori değişimi kontrolü - kategori değiştiyse visiblePOIs'i temizle
    const previousCategory = visiblePOIs.length > 0 ? visiblePOIs[0].category : null;
    const categoryChanged = previousCategory && previousCategory !== category && category !== 'all';
    
    if (categoryChanged) {
      console.log(`🔄 Kategori değişti (${previousCategory} → ${category}), eski POI'ler temizleniyor`);
      setVisiblePOIs([]);
      // Marker'ları da temizle
      Object.values(markersMapRef.current).forEach(marker => marker.remove());
      markersMapRef.current = {};
    }

    // Kategori dosyaları
    const categoryFiles: Record<string, string> = {
      food: 'yemek',
      nature: 'doga',
      culture: 'kultur-sanat',
      entertainment: 'eglence',
      other: 'diger'
    };

    try {
      let allPOIs: POI[] = [];

      // "all" kategorisi için tüm dosyaları yükle
      if (category === 'all') {
        console.log('📚 Tüm kategoriler yükleniyor...');
        
        const loadPromises = Object.entries(categoryFiles).map(async ([categoryKey, fileName]) => {
          // Cache'i kontrol et
          const cached = await cacheService.getCachedGeoJSON(fileName);
          let data;
          
          if (cached) {
            console.log(`✅ ${fileName} cache'ten yüklendi`);
            data = cached;
          } else {
            console.log(`🌐 ${fileName} sunucudan yükleniyor...`);
            const response = await fetch(`/data/${fileName}.geojson`);
            data = await response.json();
            // Cache'e kaydet
            await cacheService.setCachedGeoJSON(fileName, data);
          }
          
          return data.features.map((feature: {
            geometry: { coordinates: [number, number] };
            properties: {
              id?: string;
              name?: string;
              Name?: string;
              category?: string;
              subcategory?: string;
              SubCategory?: string;
              address?: string;
              Address?: string;
              description?: string;
              Description?: string;
            };
          }) => ({
            id: feature.properties.id || `poi-${Math.random().toString(36).substr(2, 9)}`,
            name: feature.properties.name || feature.properties.Name || 'İsimsiz',
            category: categoryKey, // UI category'yi kullan (food, nature, etc.)
            subcategory: feature.properties.subcategory || feature.properties.SubCategory || '',
            address: feature.properties.address || feature.properties.Address || '',
            description: feature.properties.description || feature.properties.Description,
            coordinates: feature.geometry.coordinates
          }));
        });

        const results = await Promise.all(loadPromises);
        allPOIs = results.flat();
        console.log(`📊 Tüm kategorilerden toplam ${allPOIs.length} POI yüklendi`);
        
      } else {
        // Tek kategori yükle
        const fileName = categoryFiles[category];
        if (!fileName) {
          console.warn('⚠️ Bilinmeyen kategori:', category);
          return;
        }

        // Cache'i kontrol et
        const cached = await cacheService.getCachedGeoJSON(fileName);
        let data;
        
        if (cached) {
          console.log(`✅ ${fileName} cache'ten yüklendi`);
          data = cached;
        } else {
          console.log(`🌐 ${fileName} sunucudan yükleniyor...`);
          const response = await fetch(`/data/${fileName}.geojson`);
          data = await response.json();
          // Cache'e kaydet
          await cacheService.setCachedGeoJSON(fileName, data);
        }
        
        // POI'leri dönüştür ve category'yi normalize et
        allPOIs = data.features.map((feature: {
          geometry: { coordinates: [number, number] };
          properties: {
            id?: string;
            name?: string;
            Name?: string;
            category?: string;
            subcategory?: string;
            SubCategory?: string;
            address?: string;
            Address?: string;
            description?: string;
            Description?: string;
          };
        }) => ({
          id: feature.properties.id || `poi-${Math.random().toString(36).substr(2, 9)}`,
          name: feature.properties.name || feature.properties.Name || 'İsimsiz',
          category: category, // UI category'yi kullan (food, nature, etc.)
          subcategory: feature.properties.subcategory || feature.properties.SubCategory || '',
          address: feature.properties.address || feature.properties.Address || '',
          description: feature.properties.description || feature.properties.Description,
          coordinates: feature.geometry.coordinates
        }));

        console.log(`📊 ${fileName}.geojson'dan ${allPOIs.length} POI yüklendi`);
      }

      // Mesafeye göre sırala ve en yakın 100'ü al
      const poisWithDistance = allPOIs.map(poi => ({
        ...poi,
        distance: calculateDistance(center, poi.coordinates)
      }));

      const nearbyPOIs = poisWithDistance
        .sort((a, b) => a.distance - b.distance)
        .slice(0, 100)
        // eslint-disable-next-line @typescript-eslint/no-unused-vars
        .map(({ distance: _dist, ...poi }) => poi);

      console.log(`✅ ${nearbyPOIs.length} POI viewport'a ekleniyor`);

      // Cache'e ekle (sadece cache'de olmayan POI'ler)
      const newPOIs = nearbyPOIs.filter(poi => !poiCache[poi.id]);
      if (newPOIs.length > 0) {
        console.log(`🆕 ${newPOIs.length} yeni POI cache'e ekleniyor`);
        onPOIsLoad(newPOIs);
      }

      // Görünür POI'leri güncelle
      setVisiblePOIs(prev => {
        // Kategori değiştiyse sadece yeni POI'leri göster (eski POI'leri atla)
        const basePOIs = categoryChanged ? [] : prev;
        
        // Yeni POI'lerle birleştir ve duplicate'leri kaldır
        const combined = [...basePOIs, ...nearbyPOIs];
        const uniqueMap: { [key: string]: POI } = {};
        combined.forEach(poi => {
          uniqueMap[poi.id] = poi;
        });
        const unique = Object.values(uniqueMap);
        
        console.log(`🗺️ Görünür POI sayısı: ${prev.length} → ${unique.length} (${nearbyPOIs.length} yeni eklendi, kategori değişimi: ${categoryChanged})`);
        
        return unique;
      });

    } catch (error) {
      console.error('❌ POI yükleme hatası:', error);
    }
  };

  // visiblePOIs değiştiğinde Sidebar'a bildir
  useEffect(() => {
    if (onVisiblePOIsChange && visiblePOIs.length > 0) {
      onVisiblePOIsChange(visiblePOIs);
      console.log('📤 Sidebar\'a POI gönderildi:', visiblePOIs.length);
    }
  }, [visiblePOIs, onVisiblePOIsChange]);

  // Desktop/Mobile detection
  useEffect(() => {
    const checkDesktop = () => {
      setIsDesktop(window.innerWidth >= 769);
    };
    checkDesktop();
    window.addEventListener('resize', checkDesktop);
    return () => window.removeEventListener('resize', checkDesktop);
  }, []);

  // selectedCategory ref'ini güncel tut
  useEffect(() => {
    selectedCategoryRef.current = selectedCategory;
  }, [selectedCategory]);

  const changeMapStyle = (styleKey: MapStyleKey) => {
    if (!map.current) return;

    const style = MAP_STYLES[styleKey];
    const newStyle = {
      version: 8 as const,
      sources: {
        'base-tiles': {
          type: 'raster' as const,
          tiles: style.tiles,
          tileSize: 256,
          attribution: style.attribution
        }
      },
      layers: [
        {
          id: 'base-tiles',
          type: 'raster' as const,
          source: 'base-tiles',
          minzoom: 0,
          maxzoom: 19
        }
      ]
    };

    map.current.setStyle(newStyle);
    setCurrentStyle(styleKey);
    setShowStylePicker(false);

    // Stil değişikliğinden sonra Üsküdar sınırlarını yeniden ekle
    map.current.once('styledata', async () => {
      try {
        const response = await fetch('/src/data/uskudar.geojson');
        const uskudarData = await response.json();
        const transformedData = transformGeoJSON(uskudarData);

        map.current?.addSource('uskudar-boundary', {
          type: 'geojson',
          data: transformedData as GeoJSON.FeatureCollection
        });

        map.current?.addLayer({
          id: 'uskudar-boundary-line',
          type: 'line',
          source: 'uskudar-boundary',
          paint: {
            'line-color': '#E63946',
            'line-width': 3,
            'line-opacity': 0.9,
            'line-dasharray': [2, 2]
          }
        });
      } catch (error) {
        console.error('GeoJSON yükleme hatası:', error);
      }
    });
  };

  useEffect(() => {
    if (!mapContainer.current) return;

    // Harita oluştur
    const initialStyle = MAP_STYLES[currentStyle];
    map.current = new maplibregl.Map({
      container: mapContainer.current,
      style: {
        version: 8 as const,
        sources: {
          'base-tiles': {
            type: 'raster' as const,
            tiles: initialStyle.tiles,
            tileSize: 256,
            attribution: initialStyle.attribution
          }
        },
        layers: [
          {
            id: 'base-tiles',
            type: 'raster' as const,
            source: 'base-tiles',
            minzoom: 0,
            maxzoom: 22
          }
        ]
      },
      center: [29.015295995137393, 41.02678314419098], // Başlangıç merkezi
      zoom: 12, // Tüm Üsküdar'ı görecek zoom seviyesi
      maxZoom: 22,
      minZoom: 10
    });

    // Harita yüklendiğinde
    map.current.on('load', async () => {
      if (!map.current) return;

      try {
        // GeoJSON dosyasını fetch ile yükle
        const response = await fetch('/src/data/uskudar.geojson');
        const uskudarData = await response.json();

        // GeoJSON verisini EPSG:5254'ten WGS84'e dönüştür
        const transformedData = transformGeoJSON(uskudarData);
        
        console.log('Harita yüklendi!');
        console.log('Orijinal GeoJSON:', uskudarData);
        console.log('Dönüştürülmüş GeoJSON:', transformedData);

        // Üsküdar sınırları için source ekle
        map.current?.addSource('uskudar-boundary', {
          type: 'geojson',
          data: transformedData as GeoJSON.FeatureCollection
        });

        // Sınır çizgisi layer'ı - kesikli çizgi
        map.current?.addLayer({
          id: 'uskudar-boundary-line',
          type: 'line',
          source: 'uskudar-boundary',
          paint: {
            'line-color': '#E63946',
            'line-width': 3,
            'line-opacity': 0.9,
            'line-dasharray': [2, 2] // Kesikli çizgi: 2px çizgi, 2px boşluk
          }
        });

        // Kullanıcı konumunu al ve initial POI'leri yükle
        const DEFAULT_CENTER: [number, number] = [29.015295995137393, 41.02678314419098];
        const USKUDAR_BOUNDS = {
          minLng: 29.0,
          maxLng: 29.12,
          minLat: 40.98,
          maxLat: 41.08
        };

        // Konum iznini kontrol et
        if ('geolocation' in navigator) {
          navigator.geolocation.getCurrentPosition(
            (position) => {
              const userCoords: [number, number] = [
                position.coords.longitude,
                position.coords.latitude
              ];
              
              console.log('📍 Kullanıcı konumu:', userCoords);

              // Kullanıcı Üsküdar sınırları içinde mi?
              const isInUskudar =
                userCoords[0] >= USKUDAR_BOUNDS.minLng &&
                userCoords[0] <= USKUDAR_BOUNDS.maxLng &&
                userCoords[1] >= USKUDAR_BOUNDS.minLat &&
                userCoords[1] <= USKUDAR_BOUNDS.maxLat;

              if (isInUskudar) {
                console.log('✅ Kullanıcı Üsküdar içinde, konuma zoom yapılıyor');
                map.current?.flyTo({
                  center: userCoords,
                  zoom: APP_CONFIG.map.NORMAL_ZOOM,
                  duration: APP_CONFIG.ui.MAP_FLY_TO_DURATION_MS
                });
                // Kullanıcı konumu etrafındaki 100 POI'yi yükle
                loadPOIsInViewport(userCoords, selectedCategory);
              } else {
                console.log('⚠️ Kullanıcı Üsküdar dışında, default konuma gidiliyor');
                map.current?.flyTo({
                  center: DEFAULT_CENTER,
                  zoom: APP_CONFIG.map.NORMAL_ZOOM,
                  duration: APP_CONFIG.ui.MAP_FLY_TO_DURATION_MS
                });
                loadPOIsInViewport(DEFAULT_CENTER, selectedCategory);
              }
            },
            (error) => {
              console.warn('⚠️ Konum izni reddedildi:', error);
              // Konum izni yoksa default konuma git
              map.current?.flyTo({
                center: DEFAULT_CENTER,
                zoom: APP_CONFIG.map.NORMAL_ZOOM,
                duration: APP_CONFIG.ui.MAP_FLY_TO_DURATION_MS
              });
              loadPOIsInViewport(DEFAULT_CENTER, selectedCategory);
            }
          );
        } else {
          console.warn('⚠️ Geolocation desteklenmiyor');
          map.current?.flyTo({
            center: DEFAULT_CENTER,
            zoom: APP_CONFIG.map.NORMAL_ZOOM,
            duration: APP_CONFIG.ui.MAP_FLY_TO_DURATION_MS
          });
          loadPOIsInViewport(DEFAULT_CENTER, selectedCategory);
        }

        // Harita sınırlara fit et (arka planda)
        if (transformedData.features && transformedData.features.length > 0) {
          const bounds = new maplibregl.LngLatBounds();
          
          // Tüm koordinatları boundaries'e ekle
          const addCoordinatesToBounds = (coords: unknown) => {
            if (Array.isArray(coords)) {
              if (typeof coords[0] === 'number') {
                bounds.extend([coords[0], coords[1]]);
              } else {
                coords.forEach(coord => addCoordinatesToBounds(coord));
              }
            }
          };

          transformedData.features.forEach((feature: { geometry: { coordinates: unknown } }) => {
            addCoordinatesToBounds(feature.geometry.coordinates);
          });

          // Önce tüm Üsküdar'ı göster (hızlıca)
          map.current?.fitBounds(bounds, { 
            padding: 50,
            duration: 0 // Hemen göster
          });
        }
      } catch (error) {
        console.error('GeoJSON yükleme hatası:', error);
      }
    });

    // moveend event listener - Harita kaydırıldığında/zoom'landığında
    // Throttle ile optimize edildi - 300ms'de bir çalışır
    const handleMapMove = throttle(() => {
      if (!map.current) return;
      
      const center = map.current.getCenter();
      const centerCoords: [number, number] = [center.lng, center.lat];
      
      // Son yükleme merkezinden mesafe kontrolü
      if (lastLoadCenterRef.current) {
        const distance = calculateDistance(lastLoadCenterRef.current, centerCoords);
        
        // Eğer son yüklemeden bu yana çok az hareket ettiyse, yeni POI yükleme
        if (distance < APP_CONFIG.map.POI_RELOAD_DISTANCE_KM) {
          console.log(`⏸️ Harita yeterince kaymadı (${distance.toFixed(2)}km < ${APP_CONFIG.map.POI_RELOAD_DISTANCE_KM}km), POI yüklenmeyecek`);
          return;
        }
        
        console.log(`🗺️ Harita ${distance.toFixed(2)}km kaydı, yeni POI'ler yüklenecek`);
      }
      
      console.log('🗺️ Harita taşındı, yeni merkez:', centerCoords);
      
      // Yeni viewport için POI'leri yükle - ref'ten güncel kategoriyi al
      loadPOIsInViewport(centerCoords, selectedCategoryRef.current);
    }, 300);

    map.current?.on('moveend', handleMapMove);

    // Cleanup
    return () => {
      if (map.current) {
        map.current.off('moveend', handleMapMove);
        map.current.remove();
        map.current = null;
      }
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [currentStyle]);

  // selectedCategory değiştiğinde POI'leri yeniden yükle (harita zaten yüklüyse)
  useEffect(() => {
    if (!map.current || !map.current.loaded()) return;
    
    const center = map.current.getCenter();
    const centerCoords: [number, number] = [center.lng, center.lat];
    
    console.log('🔄 Kategori değişti, POI\'ler yeniden yükleniyor:', selectedCategory);
    
    // Yeni kategori için POI'leri yükle
    loadPOIsInViewport(centerCoords, selectedCategory);
    
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [selectedCategory]);

  // POI marker'larını ekle/güncelle - sidebarPOIs veya visiblePOIs kullan
  useEffect(() => {
    // Sidebar'dan gelen POI'leri önceliklendir
    const poisToShow = sidebarPOIs && sidebarPOIs.length > 0 ? sidebarPOIs : visiblePOIs;
    
    if (!map.current || !poisToShow || poisToShow.length === 0) {
      console.log('⚠️ Marker ekleme atlandı:', {
        hasMap: !!map.current,
        sidebarPOIsCount: sidebarPOIs?.length || 0,
        visiblePOIsCount: visiblePOIs?.length || 0
      });
      return;
    }

    // Harita yüklenmesini bekle
    const addMarkers = () => {
      if (!map.current?.loaded()) {
        console.log('⚠️ Harita henüz yüklenmedi, marker ekleme atlandı');
        // Harita yüklendiğinde tekrar dene
        map.current?.once('load', addMarkers);
        return;
      }

      console.log('🗺️ Marker güncelleniyor, POI sayısı:', poisToShow.length);
      console.log('📊 POI kaynağı:', sidebarPOIs && sidebarPOIs.length > 0 ? 'Sidebar' : 'Viewport');
      
      // Mevcut marker'ların ID'lerini al
      const currentMarkerIds = new Set(Object.keys(markersMapRef.current));
      
      // Yeni POI ID'lerini al
      const newPoiIds = new Set(poisToShow.map(poi => poi.id));
      
      // Eğer marker'lar aynıysa güncelleme yapma (blink önleme)
      const markersAreSame = 
        currentMarkerIds.size === newPoiIds.size &&
        [...currentMarkerIds].every(id => newPoiIds.has(id));
      
      if (markersAreSame && Object.keys(markersMapRef.current).length > 0) {
        console.log('✅ Marker\'lar aynı, güncelleme atlandı (blink önlendi)');
        return;
      }
      
      console.log('🔄 Marker\'lar farklı, güncelleniyor');

      // Önceki marker'ları temizle
      Object.values(markersMapRef.current).forEach(marker => marker.remove());
      markersMapRef.current = {};

      // Walking mode aktifse sadece hedef POI'yi göster
      const markersToShow = isWalkingMode && walkingDestination 
        ? poisToShow.filter(poi => poi.id === walkingDestination.id)
        : poisToShow;

      console.log('🚶 Walking mode:', isWalkingMode, 'Toplam POI:', poisToShow.length, 'Gösterilecek marker:', markersToShow.length);

      // Yeni marker'ları ekle
      markersToShow.forEach((poi) => {
      const color = getCategoryColor(poi.category);
      const icon = getIconForPOI(poi.category);

      // Marker elementi oluştur
      const el = document.createElement('div');
      el.className = 'poi-marker';
      el.innerHTML = `
        <div style="
          background: ${color};
          width: 40px;
          height: 40px;
          border-radius: 50% 50% 50% 0;
          transform: rotate(-45deg);
          border: 3px solid white;
          box-shadow: 0 2px 8px rgba(0,0,0,0.3);
          display: flex;
          align-items: center;
          justify-content: center;
          cursor: pointer;
          transition: all 0.2s ease;
        ">
          <span style="
            transform: rotate(45deg);
            font-size: 20px;
          ">${icon}</span>
        </div>
      `;

      // Hover efekti
      el.addEventListener('mouseenter', () => {
        const markerDiv = el.querySelector('div') as HTMLElement;
        if (markerDiv) {
          markerDiv.style.transform = 'rotate(-45deg) scale(1.2)';
          markerDiv.style.zIndex = '1000';
        }
      });

      el.addEventListener('mouseleave', () => {
        const markerDiv = el.querySelector('div') as HTMLElement;
        if (markerDiv) {
          markerDiv.style.transform = 'rotate(-45deg) scale(1)';
          markerDiv.style.zIndex = '1';
        }
      });

      // Marker'a tıklayınca
      el.addEventListener('click', () => {
        console.log('🖱️ Marker tıklandı:', poi.name);
        
        // Mobilde: Custom popup aç, haritayı pin'e zoom yap (sol alt çeyrek)
        if (!isDesktop) {
          // Pin'i ekranın sol alt çeyreğine getir
          const offsetX = window.innerWidth * 0.25;  // Ekranın %25'i sağa kaydır
          const offsetY = -window.innerHeight * 0.25; // Ekranın %25'i yukarı kaydır
          
          map.current?.flyTo({
            center: poi.coordinates,
            zoom: APP_CONFIG.map.DETAIL_ZOOM,
            duration: APP_CONFIG.ui.POI_FLY_TO_DURATION_MS,
            offset: [offsetX, offsetY]
          });

          // Popup aç
          setSelectedPOI(poi);

          // Sidebar callback'i çağır ama sidebar'ı AÇMA (sadece highlight için)
          // onPOIClick fonksiyonunu ÇAĞIRMA - böylece sidebar açılmaz
        } else {
          // Desktop: Custom popup aç (mobil gibi ama harita üzerinde)
          setSelectedPOI(poi);

          // Haritayı bu konuma zoom yap (desktop için ofset yok)
          map.current?.flyTo({
            center: poi.coordinates,
            zoom: APP_CONFIG.map.DETAIL_ZOOM,
            duration: APP_CONFIG.ui.RESET_CAMERA_DURATION_MS
          });

          // Sidebar callback'i varsa çağır
          if (onPOIClick) {
            onPOIClick(poi);
          }
        }
      });

      // Marker'ı haritaya ekle
      const marker = new maplibregl.Marker({
        element: el,
        anchor: 'bottom'
      })
        .setLngLat(poi.coordinates)
        .addTo(map.current!);

      // Marker referansını POI ID ile sakla
      markersMapRef.current[poi.id] = marker;

      console.log(`✅ Marker DOM'a eklendi:`, {
        element: el,
        hasParent: !!el.parentElement,
        visible: el.offsetWidth > 0
      });
    });

    console.log('✅ Tüm marker\'lar eklendi:', Object.keys(markersMapRef.current).length);
    };

    // addMarkers fonksiyonunu çağır
    addMarkers();
  }, [sidebarPOIs, visiblePOIs, onPOIClick, isDesktop, isWalkingMode, walkingDestination, selectedCategory]);

  // isWalkingMode değiştiğinde showWalkingNavigation'ı senkronize et
  useEffect(() => {
    setShowWalkingNavigation(isWalkingMode);
  }, [isWalkingMode]);

  // Sidebar'dan zoom-to-poi eventi geldiğinde
  useEffect(() => {
    const handleZoomToPOI = (event: Event) => {
      const customEvent = event as CustomEvent<POI>;
      const poi = customEvent.detail;
      
      if (map.current && poi) {
        // Mobilde: Pin'i ekranın sol alt çeyreğine getir ve popup aç
        if (!isDesktop) {
          const offsetX = window.innerWidth * 0.25;
          const offsetY = -window.innerHeight * 0.25;
          
          map.current.flyTo({
            center: poi.coordinates,
            zoom: APP_CONFIG.map.DETAIL_ZOOM,
            duration: APP_CONFIG.ui.POI_FLY_TO_DURATION_MS,
            offset: [offsetX, offsetY]
          });

          // Popup aç
          setSelectedPOI(poi);
        } else {
          // Desktop: Modern popup aç (mobil gibi)
          map.current.flyTo({
            center: poi.coordinates,
            zoom: APP_CONFIG.map.DETAIL_ZOOM,
            duration: APP_CONFIG.ui.RESET_CAMERA_DURATION_MS
          });

          // Modern POIPopup component'ini aç
          setSelectedPOI(poi);
        }
      }
    };

    // Harita merkezi isteme eventi
    const handleGetMapCenter = () => {
      if (map.current) {
        const center = map.current.getCenter();
        const centerCoords: [number, number] = [center.lng, center.lat];
        console.log('📍 Harita merkezi gönderiliyor:', centerCoords);
        window.dispatchEvent(new CustomEvent('map-center-response', { detail: centerCoords }));
      }
    };

    window.addEventListener('zoom-to-poi', handleZoomToPOI);
    window.addEventListener('get-map-center', handleGetMapCenter);
    
    return () => {
      window.removeEventListener('zoom-to-poi', handleZoomToPOI);
      window.removeEventListener('get-map-center', handleGetMapCenter);
    };
  }, [isDesktop]);

  return (
    <div style={{ position: 'relative', width: '100%', height: '100vh' }}>
      <div 
        ref={mapContainer} 
        style={{ 
          width: '100%', 
          height: '100vh' 
        }} 
      />

      {/* POI Popup - Sadece mobilde */}
      {/* POI Popup - Mobilde alttan, Desktop'ta harita üzerinde sağ üstte */}
      {selectedPOI && !isDesktop && (
        <POIPopup 
          poi={selectedPOI}
          onClose={() => setSelectedPOI(null)}
          language={language}
          onNavigationStart={() => {
            setShowWalkingNavigation(true);
            onNavigationStart(selectedPOI);
          }}
        />
      )}

      {/* Desktop POI Popup - Sidebar'ın sağ üst kısmında */}
      {selectedPOI && isDesktop && (
        <div style={{
          position: 'absolute',
          top: '20px',
          right: '420px',
          zIndex: APP_CONFIG.map.POPUP_Z_INDEX,
          maxWidth: '420px'
        }}>
          <POIPopup 
            poi={selectedPOI}
            onClose={() => setSelectedPOI(null)}
            language={language}
            onNavigationStart={() => {
              setShowWalkingNavigation(true);
              onNavigationStart(selectedPOI);
            }}
          />
        </div>
      )}

      {/* Walking Navigation - Mobilde popup dışında render et */}
      {showWalkingNavigation && walkingDestination && !isDesktop && (
        <WalkingNavigation
          destination={walkingDestination.coordinates}
          destinationName={walkingDestination.name}
          categoryColor={getCategoryColor(walkingDestination.category)}
          onClose={() => {
            setShowWalkingNavigation(false);
            clearRouteFromMap();
            onNavigationEnd();
          }}
          onRouteReady={(geometry, userLocation, steps) => {
            // Haritaya rota çizgisi ve kullanıcı ikonu ekle
            if (map.current) {
              console.log('🗺️ Route ready, drawing on map:', geometry);
              drawRouteOnMap(geometry, getCategoryColor(walkingDestination.category), userLocation, steps);
            }
          }}
          onLocationUpdate={(userLocation) => {
            // Kullanıcı konumu güncelle (15 saniyede bir)
            if (userLocationMarkerRef.current) {
              console.log('📍 Updating user location on map:', userLocation);
              userLocationMarkerRef.current.setLngLat(userLocation);
            }
          }}
        />
      )}

      {/* Desktop Walking Navigation - Sidebar'ın üzerinde sağ üstte */}
      {showWalkingNavigation && walkingDestination && isDesktop && (
        <div style={{
          position: 'absolute',
          top: '20px',
          right: '20px',
          zIndex: APP_CONFIG.map.NAVIGATION_Z_INDEX,
          maxWidth: '420px'
        }}>
          <WalkingNavigation
            destination={walkingDestination.coordinates}
            destinationName={walkingDestination.name}
            categoryColor={getCategoryColor(walkingDestination.category)}
            onClose={() => {
              setShowWalkingNavigation(false);
              clearRouteFromMap();
              onNavigationEnd();
            }}
            onRouteReady={(geometry, userLocation, steps) => {
              // Haritaya rota çizgisi ve kullanıcı ikonu ekle
              if (map.current) {
                console.log('🗺️ Route ready, drawing on map:', geometry);
                drawRouteOnMap(geometry, getCategoryColor(walkingDestination.category), userLocation, steps);
              }
            }}
            onLocationUpdate={(userLocation) => {
              // Kullanıcı konumu güncelle (15 saniyede bir)
              if (userLocationMarkerRef.current) {
                console.log('📍 Updating user location on map:', userLocation);
                userLocationMarkerRef.current.setLngLat(userLocation);
              }
            }}
          />
        </div>
      )}
      
      {/* Dil değiştirici - Map butonunun üstünde */}
      <div
        style={{
          position: 'absolute',
          top: 'max(env(safe-area-inset-top), 20px)',
          right: '20px',
          zIndex: APP_CONFIG.map.MARKER_Z_INDEX,
        }}
      >
        {/* Ana dil butonu */}
        <div
          onClick={() => {
            setShowLanguagePicker(!showLanguagePicker);
            setShowStylePicker(false); // Diğerini kapat
          }}
          onKeyDown={(e) => {
            if (e.key === 'Enter' || e.key === ' ') {
              e.preventDefault();
              setShowLanguagePicker(!showLanguagePicker);
              setShowStylePicker(false);
            }
          }}
          style={{
            backgroundColor: 'white',
            borderRadius: '50%',
            width: '50px',
            height: '50px',
            boxShadow: '0 2px 8px rgba(0,0,0,0.15)',
            cursor: 'pointer',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            transition: 'all 0.2s ease',
            marginBottom: '12px',
          }}
          title={LANGUAGES[language].name}
          role="button"
          tabIndex={0}
          aria-label={`Dil seç: ${LANGUAGES[language].name}`}
          aria-expanded={showLanguagePicker}
        >
          <FlagIcon code={LANGUAGES[language].code} size={32} />
        </div>

        {/* Dil seçici popup */}
        {showLanguagePicker && (
          <div
            style={{
              position: 'absolute',
              top: '0',
              right: '60px',
              backgroundColor: 'white',
              borderRadius: '12px',
              padding: '10px',
              boxShadow: '0 4px 12px rgba(0,0,0,0.15)',
              display: 'flex',
              flexDirection: 'row',
              gap: '8px',
            }}
            className="language-picker-popup"
          >
            {(Object.keys(LANGUAGES) as LanguageKey[]).map((lang) => (
              <div
                key={lang}
                onClick={() => {
                  onLanguageChange(lang);
                  setShowLanguagePicker(false);
                }}
                onKeyDown={(e) => {
                  if (e.key === 'Enter' || e.key === ' ') {
                    e.preventDefault();
                    onLanguageChange(lang);
                    setShowLanguagePicker(false);
                  }
                }}
                style={{
                  width: '45px',
                  height: '45px',
                  borderRadius: '50%',
                  backgroundColor: 'white',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  cursor: 'pointer',
                  border: language === lang ? '3px solid #E63946' : '3px solid transparent',
                  transition: 'all 0.2s ease',
                }}
                title={LANGUAGES[lang].name}
                role="button"
                tabIndex={0}
                aria-label={`${LANGUAGES[lang].name} dilini seç`}
                aria-pressed={language === lang}
              >
                <FlagIcon code={LANGUAGES[lang].code} size={28} />
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Sağ üst köşe map kontrolü - Responsive */}
      <div
        style={{
          position: 'absolute',
          top: 'calc(max(env(safe-area-inset-top), 20px) + 62px)',
          right: '20px',
          zIndex: APP_CONFIG.map.MARKER_Z_INDEX,
        }}
      >
        {/* Ana buton */}
        <div
          onClick={() => {
            setShowStylePicker(!showStylePicker);
            setShowLanguagePicker(false); // Diğerini kapat
          }}
          onKeyDown={(e) => {
            if (e.key === 'Enter' || e.key === ' ') {
              e.preventDefault();
              setShowStylePicker(!showStylePicker);
              setShowLanguagePicker(false);
            }
          }}
          style={{
            backgroundColor: 'white',
            borderRadius: '50%',
            width: '50px',
            height: '50px',
            boxShadow: '0 2px 8px rgba(0,0,0,0.15)',
            cursor: 'pointer',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            transition: 'all 0.2s ease',
          }}
          title={translations[language].mapStyle}
          role="button"
          tabIndex={0}
          aria-label={translations[language].mapStyle}
          aria-expanded={showStylePicker}
        >
          <svg
            width="28"
            height="28"
            viewBox="0 0 24 24"
            fill="none"
            stroke="#E63946"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
          >
            <polygon points="1 6 1 22 8 18 16 22 23 18 23 2 16 6 8 2 1 6"></polygon>
            <line x1="8" y1="2" x2="8" y2="18"></line>
            <line x1="16" y1="6" x2="16" y2="22"></line>
          </svg>
        </div>

        {/* Stil seçici popup */}
        {showStylePicker && (
          <div
            style={{
              position: 'absolute',
              top: '60px',
              right: '0',
              backgroundColor: 'white',
              borderRadius: '12px',
              padding: '10px',
              boxShadow: '0 4px 12px rgba(0,0,0,0.15)',
              display: 'flex',
              flexDirection: 'row',
              gap: '8px',
            }}
            className="style-picker-popup"
          >
            {/* Voyager */}
            <div
              onClick={() => changeMapStyle('voyager')}
              onKeyDown={(e) => {
                if (e.key === 'Enter' || e.key === ' ') {
                  e.preventDefault();
                  changeMapStyle('voyager');
                }
              }}
              style={{
                width: '45px',
                height: '45px',
                borderRadius: '50%',
                backgroundColor: '#F4F4F4',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                cursor: 'pointer',
                border: currentStyle === 'voyager' ? '3px solid #E63946' : '3px solid transparent',
                transition: 'all 0.2s ease',
                fontSize: '20px',
              }}
              title={translations[language].voyager}
              role="button"
              tabIndex={0}
              aria-label={translations[language].voyager}
              aria-pressed={currentStyle === 'voyager'}
            >
              🗺️
            </div>

            {/* Dark */}
            <div
              onClick={() => changeMapStyle('dark')}
              onKeyDown={(e) => {
                if (e.key === 'Enter' || e.key === ' ') {
                  e.preventDefault();
                  changeMapStyle('dark');
                }
              }}
              style={{
                width: '45px',
                height: '45px',
                borderRadius: '50%',
                backgroundColor: '#2C2C2C',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                cursor: 'pointer',
                border: currentStyle === 'dark' ? '3px solid #E63946' : '3px solid transparent',
                transition: 'all 0.2s ease',
                fontSize: '20px',
              }}
              title={translations[language].dark}
              role="button"
              tabIndex={0}
              aria-label={translations[language].dark}
              aria-pressed={currentStyle === 'dark'}
            >
              🌙
            </div>

            {/* OSM Bright */}
            <div
              onClick={() => changeMapStyle('osmBright')}
              onKeyDown={(e) => {
                if (e.key === 'Enter' || e.key === ' ') {
                  e.preventDefault();
                  changeMapStyle('osmBright');
                }
              }}
              style={{
                width: '45px',
                height: '45px',
                borderRadius: '50%',
                backgroundColor: '#E8F5E9',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                cursor: 'pointer',
                border: currentStyle === 'osmBright' ? '3px solid #E63946' : '3px solid transparent',
                transition: 'all 0.2s ease',
                fontSize: '20px',
              }}
              title={translations[language].osmBright}
              role="button"
              tabIndex={0}
              aria-label={translations[language].osmBright}
              aria-pressed={currentStyle === 'osmBright'}
            >
              🌍
            </div>
          </div>
        )}
        
        {/* Mini Games Button - harita butonlarının hemen altında */}
        {onNavigateToMiniGames && (
          <div style={{ marginTop: 12 }}>
            <div
              onClick={() => onNavigateToMiniGames && onNavigateToMiniGames()}
              onKeyDown={(e) => {
                if (e.key === 'Enter' || e.key === ' ') {
                  e.preventDefault();
                  onNavigateToMiniGames && onNavigateToMiniGames();
                }
              }}
              style={{
                backgroundColor: 'white',
                borderRadius: '50%',
                width: '50px',
                height: '50px',
                boxShadow: '0 2px 8px rgba(0,0,0,0.15)',
                cursor: 'pointer',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                transition: 'all 0.2s ease',
              }}
              title="Mini Games"
              role="button"
              tabIndex={0}
              aria-label="Mini oyunları aç"
            >
              <span style={{ fontSize: 22 }} aria-hidden="true">🎮</span>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default Map;
