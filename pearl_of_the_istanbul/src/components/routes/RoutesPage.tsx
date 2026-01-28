// RoutesPage - Gezi rotaları sayfası
import { useEffect, useRef, useState, useCallback } from 'react';
import maplibregl from 'maplibre-gl';
import 'maplibre-gl/dist/maplibre-gl.css';
import { useAuthStore, useRouteStore } from '../../store';
import { cacheService } from '../../services/cacheService';
import { getCategoryColor } from '../../config/categories.config';
import { calculateDistance } from '../../utils/geoUtils';
import { throttle } from '../../utils/performanceUtils';
import { APP_CONFIG } from '../../config/app.config';
import RoutesSidebar from './RoutesSidebar';
import RouteCreationPanel from './RouteCreationPanel';
import RoutePointPopup from './RoutePointPopup';
import AuthButton from './AuthButton';
import './RoutesPage.css';

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
  }
};

// Kategori ikonları
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

// Kategori dosya mapping
const CATEGORY_FILES: Record<string, string> = {
  food: 'yemek',
  nature: 'doga',
  culture: 'kultur-sanat',
  entertainment: 'eglence',
  other: 'diger'
};

interface POI {
  id: string;
  name: string;
  category: string;
  subcategory: string;
  address: string;
  description?: string;
  coordinates: [number, number];
  rating?: number;
}

interface RoutesPageProps {
  language: 'tr' | 'en' | 'de' | 'fr' | 'es' | 'it';
  onBack: () => void;
}

// Performans sabitleri
const MAX_VISIBLE_ROUTES = 15; // Haritada aynı anda gösterilecek max rota

const RoutesPage = ({ language, onBack }: RoutesPageProps) => {
  const mapContainer = useRef<HTMLDivElement>(null);
  const map = useRef<maplibregl.Map | null>(null);
  const markersRef = useRef<maplibregl.Marker[]>([]);
  const routeMarkersRef = useRef<maplibregl.Marker[]>([]); // Rota noktaları marker'ları
  const routeLinesRef = useRef<{ sourceId: string; layerId: string }[]>([]); // Rota çizgi layer ID'leri
  const lastLoadCenterRef = useRef<[number, number] | null>(null); // Son POI yükleme merkezi

  const [visiblePOIs, setVisiblePOIs] = useState<POI[]>([]);
  const [isDesktop, setIsDesktop] = useState(false);
  const [selectedCategory, setSelectedCategory] = useState<string>('all'); // Kategori filtresi
  const [visibleRoutes, setVisibleRoutes] = useState<typeof routes>([]); // Viewport'taki rotalar

  // Kategoriye göre filtrele
  const filteredPOIs = selectedCategory === 'all'
    ? visiblePOIs
    : visiblePOIs.filter(poi => poi.category === selectedCategory);

  // Store hooks
  const { user, initialize } = useAuthStore();
  const {
    isCreatingRoute,
    selectedPoints,
    currentPOI,
    routes,
    addPoint,
    setCurrentPOI,
    loadRoutes
  } = useRouteStore();

  // Auth listener
  useEffect(() => {
    const unsubscribe = initialize();
    return () => unsubscribe();
  }, [initialize]);

  // Rotaları yükle
  useEffect(() => {
    loadRoutes();
  }, [loadRoutes]);

  // Desktop detection
  useEffect(() => {
    const checkDesktop = () => setIsDesktop(window.innerWidth >= 769);
    checkDesktop();
    window.addEventListener('resize', checkDesktop);
    return () => window.removeEventListener('resize', checkDesktop);
  }, []);

  // Viewport'taki POI'leri yükle (ana ekrandaki gibi)
  const loadPOIsInViewport = useCallback(async (center: [number, number]) => {
    console.log('🗺️ Routes: Viewport POI yükleniyor:', center);

    // Son yükleme merkezini güncelle
    lastLoadCenterRef.current = center;

    try {
      const allPOIs: POI[] = [];

      // Tüm kategorileri yükle
      const loadPromises = Object.entries(CATEGORY_FILES).map(async ([categoryKey, fileName]) => {
        const cached = await cacheService.getCachedGeoJSON(fileName);
        let data;

        if (cached) {
          data = cached;
        } else {
          const response = await fetch(`/data/${fileName}.geojson`);
          data = await response.json();
          await cacheService.setCachedGeoJSON(fileName, data);
        }

        return data.features.map((feature: {
          geometry: { coordinates: [number, number] };
          properties: {
            id?: string;
            name?: string;
            Name?: string;
            subcategory?: string;
            SubCategory?: string;
            address?: string;
            Address?: string;
            description?: string;
          };
        }) => ({
          id: feature.properties.id || `poi-${Math.random().toString(36).substr(2, 9)}`,
          name: feature.properties.name || feature.properties.Name || 'İsimsiz',
          category: categoryKey,
          subcategory: feature.properties.subcategory || feature.properties.SubCategory || '',
          address: feature.properties.address || feature.properties.Address || '',
          description: feature.properties.description,
          coordinates: feature.geometry.coordinates
        }));
      });

      const results = await Promise.all(loadPromises);
      allPOIs.push(...results.flat());

      // Mesafeye göre sırala ve en yakın 100'ü al
      const poisWithDistance = allPOIs.map(poi => ({
        ...poi,
        distance: calculateDistance(center, poi.coordinates)
      }));

      const nearbyPOIs = poisWithDistance
        .sort((a, b) => a.distance - b.distance)
        .slice(0, 200) // 200 POI'ye kadar göster
        .map(({ distance: _dist, ...poi }) => poi);

      console.log('✅ Routes: Viewport POI yüklendi:', nearbyPOIs.length);

      // Görünür POI'leri güncelle (duplicate'leri önle)
      setVisiblePOIs(prev => {
        const combined = [...prev, ...nearbyPOIs];
        const uniqueMap: { [key: string]: POI } = {};
        combined.forEach(poi => {
          uniqueMap[poi.id] = poi;
        });
        return Object.values(uniqueMap);
      });

    } catch (error) {
      console.error('❌ Routes: POI yükleme hatası:', error);
    }
  }, []);

  // Rota oluşturma modu açıldığında POI'leri yükle
  useEffect(() => {
    if (isCreatingRoute && map.current) {
      const center = map.current.getCenter();
      loadPOIsInViewport([center.lng, center.lat]);
    }
  }, [isCreatingRoute, loadPOIsInViewport]);


  // Harita başlatma
  useEffect(() => {
    if (!mapContainer.current) return;

    const style = MAP_STYLES.voyager;
    map.current = new maplibregl.Map({
      container: mapContainer.current,
      style: {
        version: 8 as const,
        sources: {
          'base-tiles': {
            type: 'raster' as const,
            tiles: style.tiles,
            tileSize: 256,
            attribution: style.attribution
          }
        },
        layers: [{
          id: 'base-tiles',
          type: 'raster' as const,
          source: 'base-tiles',
          minzoom: 0,
          maxzoom: 22
        }]
      },
      center: [29.015295995137393, 41.02678314419098],
      zoom: 13,
      maxZoom: 22,
      minZoom: 10
    });

    // Harita yüklendiğinde - rotalar otomatik yükleniyor, POI'ler sadece rota oluşturma modunda
    map.current.on('load', () => {
      console.log('🗺️ Routes: Harita yüklendi, rotalar aktif');

      // Rotalar varsa viewport'taki rotaları hemen çiz
      if (routes.length > 0) {
        // Kısa bir gecikme ile çağır - harita tam yüklenmesi için
        setTimeout(() => {
          updateVisibleRoutes();
        }, 100);
      }

      // POI yükleme mantığı artık isCreatingRoute'a bağlı olarak handleMapMove içinde tetiklenecek.
      // İlk yüklemede de eğer rota oluşturma modu açıksa POI'leri yükle
      if (isCreatingRoute) {
        const DEFAULT_CENTER: [number, number] = [29.015295995137393, 41.02678314419098];
        if ('geolocation' in navigator) {
          navigator.geolocation.getCurrentPosition(
            (position) => {
              const userCoords: [number, number] = [
                position.coords.longitude,
                position.coords.latitude
              ];
              const isInUskudar =
                userCoords[0] >= 29.0 && userCoords[0] <= 29.12 &&
                userCoords[1] >= 40.98 && userCoords[1] <= 41.08;
              if (isInUskudar) {
                map.current?.flyTo({
                  center: userCoords,
                  zoom: APP_CONFIG.map.NORMAL_ZOOM,
                  duration: APP_CONFIG.ui.MAP_FLY_TO_DURATION_MS
                });
                loadPOIsInViewport(userCoords);
              } else {
                loadPOIsInViewport(DEFAULT_CENTER);
              }
            },
            () => {
              loadPOIsInViewport(DEFAULT_CENTER);
            }
          );
        } else {
          loadPOIsInViewport(DEFAULT_CENTER);
        }
      }
    });

    // Harita kaydırıldığında yeni POI'ler yükle (ana ekrandaki gibi throttle ile)
    const handleMapMove = throttle(() => {
      if (!map.current) return;

      // Sadece rota oluşturma modunda POI yükle
      if (!isCreatingRoute) {
        return;
      }

      const center = map.current.getCenter();
      const centerCoords: [number, number] = [center.lng, center.lat];

      // Son yükleme merkezinden mesafe kontrolü
      if (lastLoadCenterRef.current) {
        const distance = calculateDistance(lastLoadCenterRef.current, centerCoords);

        if (distance < APP_CONFIG.map.POI_RELOAD_DISTANCE_KM) {
          return; // Yeterince kaymadı, yeni POI yükleme
        }
      }

      console.log('🗺️ Routes: Harita taşındı, yeni POI yükleniyor');
      loadPOIsInViewport(centerCoords);
    }, 300);

    map.current?.on('moveend', handleMapMove);

    return () => {
      if (map.current) {
        map.current.off('moveend', handleMapMove);
        map.current.remove();
        map.current = null;
      }
    };
  }, [loadPOIsInViewport, isCreatingRoute]); // Harita init - sadece gerekli bağımlılıklar

  // Viewport içindeki rotaları hesapla
  const updateVisibleRoutes = useCallback(() => {
    if (!map.current) return;

    const bounds = map.current.getBounds();
    const sw = bounds.getSouthWest();
    const ne = bounds.getNorthEast();

    // Rota noktalarından herhangi biri viewport içinde mi kontrol et
    const routesInView = routes.filter(route => {
      return route.points.some(point => {
        const [lng, lat] = point.coordinates;
        return lng >= sw.lng && lng <= ne.lng && lat >= sw.lat && lat <= ne.lat;
      });
    });

    // Performans için limit uygula - en yüksek oylu olanları önceliklendir
    const limitedRoutes = routesInView
      .sort((a, b) => (b.votes || 0) - (a.votes || 0))
      .slice(0, MAX_VISIBLE_ROUTES);

    setVisibleRoutes(limitedRoutes);
    console.log(`🗺️ Viewport'ta ${limitedRoutes.length}/${routesInView.length} rota gösteriliyor`);
  }, [routes]);

  // Harita üzerinde rota çizgilerini ve noktalarını çiz
  const drawRouteLines = useCallback(() => {
    if (!map.current || !map.current.loaded()) return;

    // Eski çizgileri temizle
    routeLinesRef.current.forEach(({ sourceId, layerId }) => {
      if (map.current?.getLayer(layerId)) {
        map.current.removeLayer(layerId);
      }
      if (map.current?.getSource(sourceId)) {
        map.current.removeSource(sourceId);
      }
    });
    routeLinesRef.current = [];

    // Eski rota marker'larını temizle
    routeMarkersRef.current.forEach(m => m.remove());
    routeMarkersRef.current = [];

    // Renk paleti
    const colors = ['#E63946', '#F4A261', '#2A9D8F', '#264653', '#E9C46A', '#9B59B6', '#3498DB', '#1ABC9C'];

    // Viewport'taki rotalar için çizgi ve marker'lar ekle
    visibleRoutes.forEach((route, routeIndex) => {
      if (route.points.length < 1) return;

      const color = colors[routeIndex % colors.length];
      const sourceId = `route-line-${route.id || routeIndex}`;
      const layerId = `route-layer-${route.id || routeIndex}`;

      // Çizgi çiz (en az 2 nokta varsa)
      if (route.points.length >= 2) {
        const coordinates = route.points
          .sort((a, b) => a.order - b.order)
          .map(p => p.coordinates);

        const geojson: GeoJSON.Feature = {
          type: 'Feature',
          properties: { routeId: route.id },
          geometry: {
            type: 'LineString',
            coordinates
          }
        };

        map.current?.addSource(sourceId, {
          type: 'geojson',
          data: geojson
        });

        map.current?.addLayer({
          id: layerId,
          type: 'line',
          source: sourceId,
          layout: {
            'line-join': 'round',
            'line-cap': 'round'
          },
          paint: {
            'line-color': color,
            'line-width': 5,
            'line-opacity': 0.85
          }
        });

        routeLinesRef.current.push({ sourceId, layerId });
      }

      // Rota noktaları için marker'lar ekle
      route.points
        .sort((a, b) => a.order - b.order)
        .forEach((point, pointIndex) => {
          const el = document.createElement('div');
          el.className = 'route-point-marker';
          el.innerHTML = `
            <div class="route-point-pin" style="background: ${color};">
              <span class="route-point-number">${pointIndex + 1}</span>
            </div>
            <div class="route-point-label">${point.poiName}</div>
          `;

          // Marker'a tıklayınca rota ismini göster
          el.addEventListener('click', (e) => {
            e.stopPropagation();
            // Basit bir popup göster
            const popup = new maplibregl.Popup({ closeButton: true, maxWidth: '280px' })
              .setLngLat(point.coordinates)
              .setHTML(`
                <div style="padding: 10px;">
                  <h4 style="margin: 0 0 6px 0; color: ${color};">${route.title}</h4>
                  <p style="margin: 0 0 4px 0; font-size: 13px;"><strong>${pointIndex + 1}. ${point.poiName}</strong></p>
                  ${point.comment ? `<p style="margin: 0; font-size: 12px; color: #666;">"${point.comment}"</p>` : ''}
                  <div style="margin-top: 6px; font-size: 12px; color: #888;">
                    ⭐ ${point.rating}/5 | 👤 ${route.userName}
                  </div>
                </div>
              `)
              .addTo(map.current!);
          });

          const marker = new maplibregl.Marker({
            element: el,
            anchor: 'bottom'
          })
            .setLngLat(point.coordinates)
            .addTo(map.current!);

          routeMarkersRef.current.push(marker);
        });
    });

    console.log(`✅ ${visibleRoutes.length} rota çizildi, ${routeMarkersRef.current.length} marker eklendi`);
  }, [visibleRoutes]);

  // Rotalar yüklendiğinde viewport'taki rotaları hesapla
  useEffect(() => {
    if (routes.length > 0 && map.current?.loaded()) {
      updateVisibleRoutes();
    }
  }, [routes, updateVisibleRoutes]);

  // Harita kaydırıldığında viewport'taki rotaları güncelle
  useEffect(() => {
    if (!map.current) return;

    const handleMoveEnd = throttle(() => {
      if (routes.length > 0) {
        updateVisibleRoutes();
      }
    }, 500);

    map.current.on('moveend', handleMoveEnd);

    return () => {
      map.current?.off('moveend', handleMoveEnd);
    };
  }, [routes, updateVisibleRoutes]);

  // visibleRoutes değişince çizgileri güncelle
  useEffect(() => {
    if (map.current?.loaded()) {
      drawRouteLines();
    } else {
      map.current?.once('load', drawRouteLines);
    }
  }, [visibleRoutes, drawRouteLines]);

  // POI marker'larını ekle - SADECE rota oluşturma modunda
  useEffect(() => {
    if (!map.current) return;

    // Eski marker'ları temizle
    markersRef.current.forEach(m => m.remove());
    markersRef.current = [];

    // Rota oluşturma modu değilse veya hiç POI yoksa gösterme
    if (!isCreatingRoute || visiblePOIs.length === 0) return;

    // Kategoriye göre filtrele
    const poisToShow = selectedCategory === 'all'
      ? visiblePOIs
      : visiblePOIs.filter(poi => poi.category === selectedCategory);

    poisToShow.forEach(poi => {
      const color = getCategoryColor(poi.category);
      const icon = CATEGORY_ICONS[poi.category] || '📍';
      const isSelected = selectedPoints.some(p => p.poiId === poi.id);

      const el = document.createElement('div');
      el.className = `routes-poi-marker ${isCreatingRoute ? 'selectable' : ''} ${isSelected ? 'selected' : ''}`;
      el.innerHTML = `
        <div class="marker-pin" style="background: ${color}; ${isSelected ? 'transform: scale(1.3); box-shadow: 0 0 20px ' + color + ';' : ''}">
          <span class="marker-icon">${icon}</span>
          ${isSelected ? `<span class="marker-order">${selectedPoints.findIndex(p => p.poiId === poi.id) + 1}</span>` : ''}
        </div>
      `;

      el.addEventListener('click', () => {
        if (isCreatingRoute) {
          // Rota oluşturma modunda: noktayı ekle ve popup aç
          addPoint(poi);
        } else {
          // Normal modda: sadece popup göster
          setCurrentPOI(poi);
        }
      });

      const marker = new maplibregl.Marker({
        element: el,
        anchor: 'bottom'
      })
        .setLngLat(poi.coordinates)
        .addTo(map.current!);

      markersRef.current.push(marker);
    });
  }, [visiblePOIs, isCreatingRoute, selectedPoints, addPoint, setCurrentPOI, selectedCategory]);

  // Seçili noktalar arası çizgi (rota oluşturma sırasında)
  useEffect(() => {
    if (!map.current?.loaded()) return;

    const sourceId = 'creating-route-line';
    const layerId = 'creating-route-layer';

    // Eski çizgiyi temizle
    if (map.current.getLayer(layerId)) {
      map.current.removeLayer(layerId);
    }
    if (map.current.getSource(sourceId)) {
      map.current.removeSource(sourceId);
    }

    // Yeni çizgi çiz
    if (isCreatingRoute && selectedPoints.length >= 2) {
      const coordinates = selectedPoints
        .sort((a, b) => a.order - b.order)
        .map(p => p.coordinates);

      map.current.addSource(sourceId, {
        type: 'geojson',
        data: {
          type: 'Feature',
          properties: {},
          geometry: {
            type: 'LineString',
            coordinates
          }
        }
      });

      map.current.addLayer({
        id: layerId,
        type: 'line',
        source: sourceId,
        layout: {
          'line-join': 'round',
          'line-cap': 'round'
        },
        paint: {
          'line-color': '#6366F1',
          'line-width': 5,
          'line-opacity': 0.9,
          'line-dasharray': [2, 1]
        }
      });
    }
  }, [isCreatingRoute, selectedPoints]);

  // Çeviriler
  const translations = {
    tr: { back: 'Geri', routes: 'Gezi Rotaları', createRoute: 'Rota Oluştur' },
    en: { back: 'Back', routes: 'Travel Routes', createRoute: 'Create Route' },
    de: { back: 'Zurück', routes: 'Reiserouten', createRoute: 'Route erstellen' },
    fr: { back: 'Retour', routes: 'Itinéraires', createRoute: 'Créer un itinéraire' },
    es: { back: 'Volver', routes: 'Rutas de viaje', createRoute: 'Crear ruta' },
    it: { back: 'Indietro', routes: 'Percorsi di viaggio', createRoute: 'Crea percorso' }
  };

  const t = translations[language];

  return (
    <div className="routes-page">
      {/* Harita */}
      <div ref={mapContainer} className="routes-map" />

      {/* Üst bar */}
      <div className="routes-header">
        <button className="routes-back-btn" onClick={onBack}>
          <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <path d="M19 12H5M12 19l-7-7 7-7" />
          </svg>
          {isDesktop && <span>{t.back}</span>}
        </button>

        <h1 className="routes-title">
          🗺️ {t.routes}
        </h1>

        <AuthButton language={language} />
      </div>

      {/* Kategori filtreleri - sadece rota oluşturma modunda */}
      {isCreatingRoute && (
        <div className="routes-category-filter">
          <button
            className={`category-filter-btn ${selectedCategory === 'all' ? 'active' : ''}`}
            onClick={() => setSelectedCategory('all')}
          >
            📍 Tümü
          </button>
          <button
            className={`category-filter-btn ${selectedCategory === 'food' ? 'active' : ''}`}
            onClick={() => setSelectedCategory('food')}
          >
            🍽️
          </button>
          <button
            className={`category-filter-btn ${selectedCategory === 'nature' ? 'active' : ''}`}
            onClick={() => setSelectedCategory('nature')}
          >
            🌳
          </button>
          <button
            className={`category-filter-btn ${selectedCategory === 'culture' ? 'active' : ''}`}
            onClick={() => setSelectedCategory('culture')}
          >
            🎭
          </button>
          <button
            className={`category-filter-btn ${selectedCategory === 'entertainment' ? 'active' : ''}`}
            onClick={() => setSelectedCategory('entertainment')}
          >
            🎉
          </button>
          <button
            className={`category-filter-btn ${selectedCategory === 'other' ? 'active' : ''}`}
            onClick={() => setSelectedCategory('other')}
          >
            📌
          </button>
        </div>
      )}

      {/* Rota oluşturma paneli */}
      {isCreatingRoute && (
        <RouteCreationPanel language={language} user={user} />
      )}

      {/* POI Popup - Rota oluşturma sırasında puan/yorum için */}
      {currentPOI && isCreatingRoute && (
        <RoutePointPopup
          poi={currentPOI}
          language={language}
          onClose={() => setCurrentPOI(null)}
        />
      )}

      {/* Sidebar - Rotalar listesi */}
      <RoutesSidebar
        language={language}
        isDesktop={isDesktop}
        user={user}
      />
    </div>
  );
};

export default RoutesPage;
