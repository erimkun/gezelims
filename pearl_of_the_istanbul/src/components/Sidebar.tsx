import { useState, useEffect, useRef, useMemo, useCallback } from 'react';
import { APP_CONFIG } from '../config/app.config';
import { useTranslation } from '../i18n';
import { getAllCategories, type CategoryKey } from '../config/categories.config';
import { SUBCATEGORY_MAPPING, SUBCATEGORY_KEYWORDS } from '../config/subcategories.config';
import EmptyState from './EmptyState';
import './Sidebar.css';

interface SidebarProps {
  isOpen: boolean;
  onToggle: () => void;
  language: 'tr' | 'en' | 'de' | 'fr' | 'es' | 'it';
  onPOIsChange?: (pois: Array<{
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
  }>) => void;
  onPOICardClick?: (poiId: string) => void;
  onCategoryChange?: (category: string) => void;
  poiListRef?: React.RefObject<HTMLDivElement | null>;
  selectedPOIId?: string | null;
  mapVisiblePOIs?: Array<{
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
  }>;
  onNavigateToMiniGames?: () => void;
}

const Sidebar = ({ isOpen, onToggle, language, onPOIsChange, onPOICardClick, onCategoryChange, poiListRef, selectedPOIId, mapVisiblePOIs, onNavigateToMiniGames }: SidebarProps) => {
  const { t } = useTranslation('sidebar', language);
  const categories = getAllCategories();
  const [dragStartY, setDragStartY] = useState(0);
  const [currentY, setCurrentY] = useState(0);
  const [selectedCategory, setSelectedCategory] = useState<CategoryKey>('all'); // İlk yüklemede Tümü kategorisi
  const [selectedSubcategory, setSelectedSubcategory] = useState<string | null>(null);
  const [isSearching, setIsSearching] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [isDesktop, setIsDesktop] = useState(false);
  const [userLocation, setUserLocation] = useState<[number, number] | null>(null);
  const categoryContainerRef = useRef<HTMLDivElement>(null);
  const subcategoryContainerRef = useRef<HTMLDivElement>(null);
  const [visibleCount, setVisibleCount] = useState<number>(APP_CONFIG.sidebar.INITIAL_VISIBLE_COUNT);
  const [isClosing, setIsClosing] = useState(false);

  // Kategori değiştiğinde parent'a bildir
  useEffect(() => {
    if (onCategoryChange) {
      onCategoryChange(selectedCategory);
    }
  }, [selectedCategory, onCategoryChange]);

  // Alt kategori scroll fonksiyonu
  const scrollSubcategories = (direction: 'left' | 'right') => {
    if (subcategoryContainerRef.current) {
      const container = subcategoryContainerRef.current;
      const scrollAmount = 200; // 2 öğe genişliği yaklaşık
      const newScrollLeft = direction === 'left' 
        ? container.scrollLeft - scrollAmount 
        : container.scrollLeft + scrollAmount;
      
      container.scrollTo({
        left: newScrollLeft,
        behavior: 'smooth'
      });
    }
  };

  // Ana kategori scroll fonksiyonu
  const scrollCategories = (direction: 'left' | 'right') => {
    if (categoryContainerRef.current) {
      const container = categoryContainerRef.current;
      const scrollAmount = 200; // 2 öğe genişliği yaklaşık
      const newScrollLeft = direction === 'left' 
        ? container.scrollLeft - scrollAmount 
        : container.scrollLeft + scrollAmount;
      
      container.scrollTo({
        left: newScrollLeft,
        behavior: 'smooth'
      });
    }
  };

  // Desktop/Mobile detection
  useEffect(() => {
    const checkDesktop = () => {
      setIsDesktop(window.innerWidth >= 769);
    };
    
    checkDesktop();
    window.addEventListener('resize', checkDesktop);
    return () => window.removeEventListener('resize', checkDesktop);
  }, []);

  // Varsayılan konum: Sabit konum (Üsküdar merkez)
  useEffect(() => {
    // Kullanıcı konumunu al
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        (position) => {
          const userCoords: [number, number] = [position.coords.longitude, position.coords.latitude];
          console.log('📍 Kullanıcı konumu alındı:', userCoords);
          setUserLocation(userCoords);
        },
        (error) => {
          console.log('⚠️ Konum izni verilmedi, sabit konum kullanılacak:', error.message);
          // Hata durumunda sabit konumu kullan
          setUserLocation([29.015295995137393, 41.02678314419098]);
        }
      );
    } else {
      console.log('⚠️ Geolocation desteklenmiyor, sabit konum kullanılacak');
      setUserLocation([29.015295995137393, 41.02678314419098]);
    }
  }, []);

  // Mesafe hesaplama fonksiyonu (Haversine)
  const calculateDistance = (coord1: [number, number], coord2: [number, number]): number => {
    const R = 6371; // Dünya yarıçapı (km)
    const dLat = (coord2[1] - coord1[1]) * Math.PI / 180;
    const dLon = (coord2[0] - coord1[0]) * Math.PI / 180;
    const a = 
      Math.sin(dLat/2) * Math.sin(dLat/2) +
      Math.cos(coord1[1] * Math.PI / 180) * Math.cos(coord2[1] * Math.PI / 180) *
      Math.sin(dLon/2) * Math.sin(dLon/2);
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1-a));
    return R * c;
  };

  // Point-in-Polygon kontrolü (Ray Casting algoritması)
  const isPointInUskudar = (point: [number, number]): boolean => {
    // Üsküdar sınırları (yaklaşık bbox)
    // Kuzey: 41.0500, Güney: 41.0000, Doğu: 29.0500, Batı: 28.9800
    const [lon, lat] = point;
    
    // Basit bbox kontrolü
    if (lon < 28.98 || lon > 29.05 || lat < 41.00 || lat > 41.05) {
      console.log('📍 Kullanıcı Üsküdar bbox dışında');
      return false;
    }
    
    console.log('📍 Kullanıcı Üsküdar bbox içinde');
    return true;
  };

  // Kategori değiştiğinde alt kategori seçimini sıfırla
  useEffect(() => {
    setSelectedSubcategory(null);
  }, [selectedCategory]);

  const handleTouchStart = (e: React.TouchEvent) => {
    setDragStartY(e.touches[0].clientY);
  };

  const handleTouchMove = (e: React.TouchEvent) => {
    setCurrentY(e.touches[0].clientY);
  };

  const handleTouchEnd = () => {
    const deltaY = currentY - dragStartY;
    
    if (Math.abs(deltaY) > 100) {
      // Aşağı kaydırma - kapat
      if (deltaY > 100 && isOpen) {
        onToggle();
      }
      // Yukarı kaydırma - aç
      else if (deltaY < -100 && !isOpen) {
        onToggle();
      }
    }
    
    setDragStartY(0);
    setCurrentY(0);
  };

  // Filtrelenmiş POI listesi - useMemo ile optimize
  const filteredPOIs = useMemo(() => {
    console.log('🔍 Filtreleme yapılıyor - mapVisiblePOIs:', mapVisiblePOIs?.length || 0, 'selectedCategory:', selectedCategory, 'searchQuery:', searchQuery, 'selectedSubcategory:', selectedSubcategory);
    
    // Sadece haritadan gelen POI'leri kullan
    const sourceData = mapVisiblePOIs || [];
    
    if (sourceData.length === 0) {
      console.log('⚠️ Haritadan POI gelmedi, boş liste gösteriliyor');
      return [];
    }
    
    const filtered = sourceData.filter(poi => {
      // Ana kategori filtresi (all kategorisi hariç)
      if (selectedCategory !== 'all' && poi.category !== selectedCategory) {
        return false;
      }
      
      // Arama filtresi
      if (searchQuery) {
        const searchLower = searchQuery.toLowerCase();
        const matchName = poi.name.toLowerCase().includes(searchLower);
        const matchAddress = poi.address.toLowerCase().includes(searchLower);
        const matchSubcat = poi.subcategory.toLowerCase().includes(searchLower);
        if (!matchName && !matchAddress && !matchSubcat) return false;
      }

      // Alt kategori filtresi
      if (selectedSubcategory) {
        const subcatKeywords = SUBCATEGORY_KEYWORDS[selectedSubcategory] || [];
        const poiSubcat = poi.subcategory.toLowerCase();
        
        // GeoJSON subcategory içinde mapping'deki keywordlerden biri var mı?
        const matches = subcatKeywords.some((keyword: string) => 
          poiSubcat.includes(keyword.toLowerCase())
        );
        
        if (!matches) return false;
      }

      return true;
    });
    
    // Kullanıcıya olan mesafeye göre sırala (en yakından en uzağa)
    const fixedLocation: [number, number] = [29.015295995137393, 41.02678314419098];
    
    // Kullanıcı konumu varsa ve Üsküdar içindeyse kullanıcı konumuna göre sırala
    let sortLocation: [number, number];
    if (userLocation && isPointInUskudar(userLocation)) {
      sortLocation = userLocation;
      console.log('✅ Kullanıcı Üsküdar içinde, kullanıcı konumuna göre sıralanıyor');
    } else {
      sortLocation = fixedLocation;
      console.log('✅ Kullanıcı Üsküdar dışında veya konum yok, sabit konuma göre sıralanıyor');
    }
    
    const sortedByDistance = filtered
      .map(poi => ({
        poi,
        distance: calculateDistance(sortLocation, poi.coordinates)
      }))
      .sort((a, b) => a.distance - b.distance) // En yakından en uzağa
      .map(item => item.poi);
    
    console.log('✅ Haritadan gelen POI\'ler sıralandı:', sortedByDistance.length, 'POI (En yakından en uzağa)');
    return sortedByDistance;
  }, [mapVisiblePOIs, searchQuery, selectedSubcategory, userLocation, selectedCategory]);

  // Virtual Scrolling - İlk N kartı göster
  const visiblePOIs = useMemo(() => {
    return filteredPOIs.slice(0, visibleCount);
  }, [filteredPOIs, visibleCount]);

  // Scroll event - daha fazla kart yükle
  const handleScroll = useCallback((e: React.UIEvent<HTMLDivElement>) => {
    const element = e.currentTarget;
    const bottom = element.scrollHeight - element.scrollTop <= element.clientHeight + APP_CONFIG.sidebar.SCROLL_THRESHOLD_PX;
    
    if (bottom && visibleCount < filteredPOIs.length) {
      setVisibleCount(prev => Math.min(prev + APP_CONFIG.sidebar.LOAD_MORE_INCREMENT, filteredPOIs.length));
    }
  }, [visibleCount, filteredPOIs.length]);

  // Kategori değişince visible count'u resetle
  useEffect(() => {
    setVisibleCount(APP_CONFIG.sidebar.INITIAL_VISIBLE_COUNT);
  }, [selectedCategory, searchQuery, selectedSubcategory]);

  // Filtrelenmiş POI'leri parent'a gönder (harita için)
  useEffect(() => {
    if (!onPOIsChange) return;
    
    console.log('📍 Sidebar: Haritaya POI gönderiliyor:', filteredPOIs.length);
    
    // filteredPOIs zaten doğru formatta, direkt gönder
    onPOIsChange(filteredPOIs);
    console.log('✅ Sidebar: POI gönderildi');
  }, [filteredPOIs, onPOIsChange]);

  return (
    <>
      {/* Backdrop - sadece mobilde */}
      {isOpen && (
        <div 
          className="sidebar-backdrop"
          onClick={onToggle}
        />
      )}

      {/* Sidebar/Bottom Sheet */}
      <div 
        className={`sidebar ${isOpen ? 'open' : ''} ${isClosing ? 'closing' : ''}`}
        onTouchStart={!isDesktop ? handleTouchStart : undefined}
        onTouchMove={!isDesktop ? handleTouchMove : undefined}
        onTouchEnd={!isDesktop ? handleTouchEnd : undefined}
        role="complementary"
        aria-label={t('welcome')}
        aria-hidden={!isOpen}
      >
        {/* Drag Handle - sadece mobilde görünür */}
        <div className="drag-handle">
          <div className="drag-handle-bar" />
        </div>

        {/* İçerik */}
        <div className="sidebar-content">
          {/* Desktop Close Button */}
          {isDesktop && (
            <button 
              className="sidebar-close-btn"
              onClick={onToggle}
              aria-label="Close sidebar"
            >
              ✕
            </button>
          )}

          {/* Başlık / Arama - Toggle */}
          <div className="header-container">
            {!isSearching ? (
              <>
                <h2>{t('welcome')}</h2>
                <div style={{ display: 'flex', gap: 8, alignItems: 'center' }}>
                  <button 
                    className="search-icon-button"
                    onClick={() => setIsSearching(true)}
                    aria-label="Search"
                  >
                    <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                      <circle cx="11" cy="11" r="8"></circle>
                      <path d="m21 21-4.35-4.35"></path>
                    </svg>
                  </button>

                  {/* Mini Games navigation button */}
                  {onNavigateToMiniGames && (
                    <button
                      className="mini-games-button"
                      onClick={() => onNavigateToMiniGames()}
                      aria-label="Mini Games"
                      title="Mini Games"
                      style={{
                        background: 'transparent',
                        border: 'none',
                        color: '#6B7280',
                        cursor: 'pointer',
                        fontSize: 14
                      }}
                    >
                      🎮
                    </button>
                  )}
                </div>
              </>
            ) : (
              <div className="search-bar">
                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <circle cx="11" cy="11" r="8"></circle>
                  <path d="m21 21-4.35-4.35"></path>
                </svg>
                <input
                  type="text"
                  placeholder={t('search')}
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  autoFocus
                  className="search-input"
                />
                <button 
                  className="search-close-button"
                  onClick={() => {
                    setIsSearching(false);
                    setSearchQuery('');
                  }}
                  aria-label="Close search"
                >
                  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                    <line x1="18" y1="6" x2="6" y2="18"></line>
                    <line x1="6" y1="6" x2="18" y2="18"></line>
                  </svg>
                </button>
              </div>
            )}
          </div>
          
          {/* Kategoriler */}
          <div className="category-wrapper">
            {/* Scroll Butonları - Sadece Desktop */}
            {isDesktop && (
              <>
                <button 
                  className="category-scroll-btn left"
                  onClick={() => scrollCategories('left')}
                  aria-label="Scroll left"
                >
                  &lt;
                </button>
                <button 
                  className="category-scroll-btn right"
                  onClick={() => scrollCategories('right')}
                  aria-label="Scroll right"
                >
                  &gt;
                </button>
              </>
            )}
            
            <div 
              className="categories-container" 
              ref={categoryContainerRef}
              role="tablist"
              aria-label={t('categories') || 'Kategoriler'}
            >
              {categories.map((category) => (
                <button
                  key={category.key}
                  className={`category-button ${selectedCategory === category.key ? 'active' : ''}`}
                  onClick={() => setSelectedCategory(category.key)}
                  style={{
                    borderColor: category.color,
                    backgroundColor: selectedCategory === category.key ? category.color : 'white',
                    color: selectedCategory === category.key ? 'white' : '#333',
                  }}
                  role="tab"
                  aria-selected={selectedCategory === category.key}
                  aria-controls="poi-list"
                >
                  <span className="category-icon">{category.icon}</span>
                  <span className="category-label">{t(category.key)}</span>
                </button>
              ))}
            </div>
          </div>

          {/* Alt Kategoriler */}
          {selectedCategory !== 'all' && SUBCATEGORY_MAPPING[selectedCategory].length > 0 && (
            <div className="subcategory-wrapper">
              {/* Scroll Butonları - Her zaman göster */}
              <button 
                className="subcategory-scroll-btn left"
                onClick={() => scrollSubcategories('left')}
                aria-label="Scroll left"
              >
                &lt;
              </button>
              <button 
                className="subcategory-scroll-btn right"
                onClick={() => scrollSubcategories('right')}
                aria-label="Scroll right"
              >
                &gt;
              </button>
              
              <div className="subcategories-container" ref={subcategoryContainerRef}>
                <button
                  className={`subcategory-chip ${selectedSubcategory === null ? 'active' : ''}`}
                  onClick={() => setSelectedSubcategory(null)}
                >
                  {t('subcatAll')}
                </button>
                {SUBCATEGORY_MAPPING[selectedCategory].map((subcatKey: string) => (
                  <button
                    key={subcatKey}
                    className={`subcategory-chip ${selectedSubcategory === subcatKey ? 'active' : ''}`}
                    onClick={() => setSelectedSubcategory(subcatKey)}
                  >
                    {t(subcatKey)}
                  </button>
                ))}
              </div>
            </div>
          )}

          {/* POI Listesi */}
          <div 
            className="poi-list" 
            ref={poiListRef} 
            onScroll={handleScroll}
            role="list"
            aria-label={t('poiList') || 'Mekan listesi'}
          >
            {filteredPOIs.length === 0 ? (
              <EmptyState
                type={searchQuery ? 'no-results' : 'no-data'}
                language={language}
                action={searchQuery ? {
                  label: t('clearSearch') || 'Aramayı Temizle',
                  onClick: () => setSearchQuery('')
                } : undefined}
              />
            ) : (
              <>
                {visiblePOIs.map((poi) => {
                  const truncateText = (text: string, maxLength: number = 100) => {
                    if (text.length <= maxLength) return text;
                    return text.substring(0, maxLength) + '...';
                  };

                  return (
                    <article 
                      key={poi.id} 
                      id={`poi-card-${poi.id}`}
                      className={`poi-card ${selectedPOIId === poi.id ? 'highlighted' : ''}`}
                      onClick={() => {
                        if (onPOICardClick) {
                          onPOICardClick(poi.id);
                        }
                        
                        // Mobilde: Sidebar'ı kapat
                        if (!isDesktop) {
                          setIsClosing(true);
                          setTimeout(() => {
                            onToggle();
                            setIsClosing(false);
                          }, 300); // Animasyon süresi
                        }
                      }}
                      style={{ cursor: 'pointer' }}
                      role="listitem"
                      tabIndex={0}
                      aria-label={`${poi.name}, ${poi.subcategory}${poi.rating ? `, ${poi.rating.toFixed(1)} puan` : ''}`}
                      onKeyDown={(e) => {
                        if (e.key === 'Enter' || e.key === ' ') {
                          e.preventDefault();
                          if (onPOICardClick) onPOICardClick(poi.id);
                          if (!isDesktop) {
                            setIsClosing(true);
                            setTimeout(() => {
                              onToggle();
                              setIsClosing(false);
                            }, 300);
                          }
                        }
                      }}
                    >
                      {/* Thumbnail (varsa) */}
                      {poi.images && poi.images.length > 0 && (
                        <div className="poi-card-thumbnail">
                          <img src={poi.images[0]} alt={poi.name} />
                          {poi.images.length > 1 && (
                            <div className="poi-card-image-badge">
                              +{poi.images.length - 1}
                            </div>
                          )}
                        </div>
                      )}
                      
                      <div className="poi-card-body">
                        <div className="poi-card-header">
                          <h3 className="poi-name">{poi.name}</h3>
                          <span 
                            className="poi-category-badge"
                            style={{ 
                              backgroundColor: categories.find(c => c.key === selectedCategory)?.color || '#6B7280'
                            }}
                          >
                            {poi.subcategory}
                          </span>
                        </div>
                        
                        {/* Rating (varsa) */}
                        {poi.rating && (
                          <div className="poi-card-rating">
                            <span className="rating-stars">
                              {'⭐'.repeat(Math.round(poi.rating))}
                            </span>
                            <span className="rating-value">{poi.rating.toFixed(1)}</span>
                            {poi.reviews_count && (
                              <span className="rating-count">({poi.reviews_count})</span>
                            )}
                          </div>
                        )}
                        
                        <p className="poi-address">📍 {truncateText(poi.address, 60)}</p>
                        {poi.description && (
                          <p className="poi-description">{truncateText(poi.description)}</p>
                        )}
                      </div>
                    </article>
                  );
                })}
                {visibleCount < filteredPOIs.length && (
                  <div style={{ textAlign: 'center', padding: '10px', color: '#6B7280', fontSize: '13px' }}>
                    {t('moreAvailable', { count: String(filteredPOIs.length - visibleCount) })}
                  </div>
                )}
              </>
            )}
          </div>
        </div>
      </div>
    </>
  );
};

export default Sidebar;
