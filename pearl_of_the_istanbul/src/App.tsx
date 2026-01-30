import { useState, useEffect, useRef, useCallback, lazy, Suspense } from 'react'
import { Analytics } from '@vercel/analytics/react'
import LoadingSpinner from './components/LoadingSpinner'
import ErrorBoundary from './components/ErrorBoundary'
import { ToastProvider } from './components/Toast'
import { APP_CONFIG } from './config/app.config'
import { useAuthStore } from './store/authStore'
import './App.css'

// Lazy load heavy components
const Map = lazy(() => import('./components/Map'))
const Sidebar = lazy(() => import('./components/Sidebar'))
const MiniGames = lazy(() => import('./components/MiniGames'))
const RoutesPage = lazy(() => import('./components/routes/RoutesPage'))

type LanguageKey = 'tr' | 'en' | 'de' | 'fr' | 'es' | 'it';

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

function App() {
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const [language, setLanguage] = useState<LanguageKey>('tr');
  const [filteredPOIs, setFilteredPOIs] = useState<POI[]>([]);
  const [selectedPOIId, setSelectedPOIId] = useState<string | null>(null);
  const [selectedCategory, setSelectedCategory] = useState<string>('all');
  const [poiCache, setPOICache] = useState<Record<string, POI>>({}); // Global POI cache
  const [mapVisiblePOIs, setMapVisiblePOIs] = useState<POI[]>([]); // Haritada görünen POI'ler
  const [isWalkingMode, setIsWalkingMode] = useState(false); // Walking navigation active


  // Sayfa durumunu localStorage'dan al
  const [currentPage, setCurrentPage] = useState<'map' | 'mini-games' | 'routes'>(() => {
    const savedPage = localStorage.getItem('current_page');
    return (savedPage as 'map' | 'mini-games' | 'routes') || 'map';
  });

  const [walkingDestination, setWalkingDestination] = useState<POI | null>(null); // Walking hedef POI
  const poiListRef = useRef<HTMLDivElement | null>(null);

  // Sayfa değişince kaydet
  useEffect(() => {
    localStorage.setItem('current_page', currentPage);
  }, [currentPage]);

  // Auth initialization
  useEffect(() => {
    const unsub = useAuthStore.getState().initialize();
    return () => unsub();
  }, []);

  // Desktop'ta sidebar varsayılan açık
  useEffect(() => {
    const handleResize = () => {
      if (window.innerWidth >= 769) {
        setIsSidebarOpen(true);
      } else {
        setIsSidebarOpen(false);
      }
    };

    // İlk yükleme
    handleResize();

    // Window resize dinle
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  // useCallback ile stable reference
  const handlePOIsChange = useCallback((pois: POI[]) => {
    setFilteredPOIs(pois);
  }, []);

  // Cache'e POI ekle
  const addPOIsToCache = useCallback((pois: POI[]) => {
    setPOICache(prev => {
      const newCache = { ...prev };
      pois.forEach(poi => {
        newCache[poi.id] = poi;
      });
      return newCache;
    });
  }, []);

  // Haritadan POI tıklandığında sidebar'da ilgili karta scroll yap
  const handlePOIClickFromMap = useCallback((poi: POI) => {
    // Pin'e tıklayınca sidebar AÇILMASIN - sadece seçili POI'yi set et
    setSelectedPOIId(poi.id);

    // Eğer sidebar zaten açıksa, scroll yap
    if (isSidebarOpen) {
      setTimeout(() => {
        const poiCard = document.getElementById(`poi-card-${poi.id}`);
        if (poiCard) {
          poiCard.scrollIntoView({ behavior: 'smooth', block: 'center' });
        }
      }, APP_CONFIG.ui.SCROLL_INTO_VIEW_DELAY_MS);
    }

    // Highlight'ı kaldır
    setTimeout(() => {
      setSelectedPOIId(null);
    }, APP_CONFIG.ui.HIGHLIGHT_DURATION_MS);
  }, [isSidebarOpen]);

  return (
    <ErrorBoundary language={language}>
      <ToastProvider>
        <div style={{ width: '100%', height: '100vh', margin: 0, padding: 0, position: 'relative' }}>
          <Suspense fallback={<LoadingSpinner size="large" message="Harita yükleniyor..." />}>
            {currentPage === 'map' ? (
              <>
                <Map
                  language={language}
                  onLanguageChange={setLanguage}
                  onPOIClick={handlePOIClickFromMap}
                  selectedCategory={selectedCategory}
                  poiCache={poiCache}
                  onPOIsLoad={addPOIsToCache}
                  sidebarPOIs={filteredPOIs}
                  onVisiblePOIsChange={setMapVisiblePOIs}
                  isWalkingMode={isWalkingMode}
                  walkingDestination={walkingDestination}
                  onNavigationStart={(poi: POI) => {
                    setIsWalkingMode(true);
                    setWalkingDestination(poi);
                  }}
                  onNavigationEnd={() => {
                    setIsWalkingMode(false);
                    setWalkingDestination(null);
                  }}
                  onNavigateToMiniGames={() => setCurrentPage('mini-games')}
                  onNavigateToRoutes={() => setCurrentPage('routes')}
                />

                {/* Desktop Sidebar Toggle Button - Sadece kapalıyken göster */}
                {!isSidebarOpen && (
                  <button
                    className="sidebar-toggle-btn"
                    onClick={() => setIsSidebarOpen(true)}
                    aria-label="Open sidebar"
                  >
                    <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
                      <line x1="3" y1="12" x2="21" y2="12"></line>
                      <line x1="3" y1="6" x2="21" y2="6"></line>
                      <line x1="3" y1="18" x2="21" y2="18"></line>
                    </svg>
                  </button>
                )}

                <Sidebar
                  isOpen={isSidebarOpen}
                  onToggle={() => setIsSidebarOpen(!isSidebarOpen)}
                  language={language}
                  onPOIsChange={handlePOIsChange}
                  onPOICardClick={(poiId: string) => {
                    const poi = filteredPOIs.find(p => p.id === poiId);
                    if (poi) {
                      // Haritayı POI'ye zoom yap
                      window.dispatchEvent(new CustomEvent('zoom-to-poi', { detail: poi }));
                    }
                  }}
                  onCategoryChange={setSelectedCategory}
                  poiListRef={poiListRef}
                  selectedPOIId={selectedPOIId}
                  mapVisiblePOIs={mapVisiblePOIs}
                  onNavigateToMiniGames={() => setCurrentPage('mini-games')}
                />
              </>
            ) : currentPage === 'routes' ? (
              <RoutesPage
                language={language}
                onBack={() => setCurrentPage('map')}
              />
            ) : (
              <MiniGames
                language={language}
                onBack={() => setCurrentPage('map')}
              />
            )}
          </Suspense>
          <Analytics />
        </div>
      </ToastProvider>
    </ErrorBoundary>
  )
}

export default App
