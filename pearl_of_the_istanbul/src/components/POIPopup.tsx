import { useState, memo, useRef } from 'react';
import './POIPopup.css';
import DirectionsModal from './DirectionsModal';
import { getCategoryColor, getCategoryIcon } from '../config/categories.config';
import { useTranslation } from '../i18n';
import { useFocusTrap } from '../hooks/useFocusTrap';

// Basit icon helper - subcategory'den icon çıkar
const getIconForSubcategory = (subcategory: string): string => {
  const subLower = subcategory.toLowerCase();
  
  // Yemek
  if (subLower.includes('kafe') || subLower.includes('cafe') || subLower.includes('kahve')) return '☕';
  if (subLower.includes('restoran') || subLower.includes('restaurant') || subLower.includes('lokanta')) return '🍽️';
  if (subLower.includes('fırın') || subLower.includes('pastane') || subLower.includes('bakery')) return '🥖';
  
  // Doğa
  if (subLower.includes('park') || subLower.includes('bahçe') || subLower.includes('garden')) return '🌳';
  
  // Kültür
  if (subLower.includes('müze') || subLower.includes('museum')) return '🏛️';
  if (subLower.includes('galeri')) return '🖼️';
  if (subLower.includes('tiyatro') || subLower.includes('theater')) return '🎭';
  if (subLower.includes('sinema')) return '🎬';
  
  // Eğlence
  if (subLower.includes('alışveriş') || subLower.includes('shopping') || subLower.includes('avm')) return '🛍️';
  
  // Diğer
  if (subLower.includes('hastane') || subLower.includes('hospital') || subLower.includes('sağlık')) return '🏥';
  if (subLower.includes('cami') || subLower.includes('mosque')) return '🕌';
  if (subLower.includes('kilise')) return '⛪';
  
  return '📍';
};

const getIconForPOI = (category: string, subcategory: string): string => {
  const subcatIcon = getIconForSubcategory(subcategory);
  if (subcatIcon !== '📍') return subcatIcon;
  return getCategoryIcon(category);
};

interface POIPopupProps {
  poi: {
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
  };
  onClose: () => void;
  language: 'tr' | 'en' | 'de' | 'fr' | 'es' | 'it';
  onNavigationStart?: () => void; // Navigation başladığında çağrılır
}

const POIPopup = ({ poi, onClose, language, onNavigationStart }: POIPopupProps) => {
  const { t } = useTranslation('poi', language);
  const color = getCategoryColor(poi.category);
  const icon = getIconForPOI(poi.category, poi.subcategory);
  const [showDirections, setShowDirections] = useState(false);
  const [expandedDescription, setExpandedDescription] = useState(false);
  const [selectedImage, setSelectedImage] = useState<string | null>(null);
  const containerRef = useRef<HTMLDivElement>(null);

  // Focus trap - modal içinde focus'u tut
  useFocusTrap(!showDirections && !selectedImage, containerRef, onClose);

  const MAX_DESCRIPTION_LENGTH = 100;
  const shouldTruncateDescription = poi.description && poi.description.length > MAX_DESCRIPTION_LENGTH;
  const displayDescription = shouldTruncateDescription && !expandedDescription
    ? poi.description!.substring(0, MAX_DESCRIPTION_LENGTH) + '...'
    : poi.description;

  // Eski ESC handler artık useFocusTrap tarafından yönetiliyor

  // Backdrop'a tıklayınca kapatma
  const handleBackdropClick = (e: React.MouseEvent) => {
    if (e.target === e.currentTarget) {
      onClose();
    }
  };

  return (
    <div 
      className="poi-popup-backdrop" 
      onClick={handleBackdropClick}
      role="dialog"
      aria-modal="true"
      aria-labelledby="poi-popup-title"
    >
      <div 
        className="poi-popup-container"
        role="document"
        ref={containerRef}
      >
        {/* Başlık - Kategori rengine uyumlu */}
        <div 
          className="poi-popup-header"
          style={{ 
            background: `linear-gradient(135deg, ${color} 0%, ${color}dd 100%)` 
          }}
        >
          <div className="poi-popup-title">
            <span className="poi-popup-icon" aria-hidden="true">{icon}</span>
            <div>
              <h3 id="poi-popup-title">{poi.name}</h3>
              {/* Kategori badge - başlığın altında küçük */}
              <div 
                className="poi-popup-category-small"
                style={{ 
                  backgroundColor: 'rgba(255, 255, 255, 0.25)',
                  backdropFilter: 'blur(10px)'
                }}
              >
                {poi.subcategory}
              </div>
            </div>
          </div>
          <button 
            className="poi-popup-close"
            onClick={onClose}
            aria-label="Close"
          >
            ✕
          </button>
        </div>

        {/* İçerik */}
        <div className="poi-popup-content">

          {/* Görsel Galerisi (varsa) */}
          {poi.images && poi.images.length > 0 && (
            <div className="poi-popup-section">
              <div className="poi-popup-images">
                <img 
                  src={poi.images[0]} 
                  alt={poi.name}
                  className="poi-popup-main-image"
                  onClick={() => setSelectedImage(poi.images![0])}
                />
                {poi.images.length > 1 && (
                  <div className="poi-popup-image-count">
                    🖼️ +{poi.images.length - 1}
                  </div>
                )}
              </div>
            </div>
          )}

          {/* Rating (varsa) */}
          {poi.rating && (
            <div className="poi-popup-section">
              <div className="poi-popup-rating">
                <span className="rating-stars">
                  {'⭐'.repeat(Math.round(poi.rating))}
                </span>
                <span className="rating-value">{poi.rating.toFixed(1)}</span>
                {poi.reviews_count && (
                  <span className="rating-count">({poi.reviews_count} {t('reviews')})</span>
                )}
              </div>
            </div>
          )}

          {/* Adres */}
          <div className="poi-popup-section">
            <div className="poi-popup-label">{t('address')}</div>
            <div className="poi-popup-text">
              📍 {poi.address}
            </div>
          </div>

          {/* Telefon (varsa) */}
          {poi.phone && (
            <div className="poi-popup-section">
              <div className="poi-popup-label">{t('phone')}</div>
              <div className="poi-popup-text">
                📞 <a href={`tel:${poi.phone}`}>{poi.phone}</a>
              </div>
            </div>
          )}

          {/* Website (varsa) */}
          {poi.website && (
            <div className="poi-popup-section">
              <div className="poi-popup-label">{t('website')}</div>
              <div className="poi-popup-text">
                🔗 <a href={poi.website} target="_blank" rel="noopener noreferrer">
                  {poi.website.length > 40 ? poi.website.substring(0, 40) + '...' : poi.website}
                </a>
              </div>
            </div>
          )}

          {/* Çalışma Saatleri (varsa) */}
          {poi.workday_timing && (
            <div className="poi-popup-section">
              <div className="poi-popup-label">{t('hours')}</div>
              <div className="poi-popup-text">
                🕒 {poi.workday_timing}
              </div>
            </div>
          )}

          {/* Kapalı Günler (varsa) */}
          {poi.closed_on && poi.closed_on.length > 0 && (
            <div className="poi-popup-section">
              <div className="poi-popup-label">{t('closedOn')}</div>
              <div className="poi-popup-text">
                🚫 {poi.closed_on.join(', ')}
              </div>
            </div>
          )}

          {/* Açıklama (varsa) */}
          {poi.description && (
            <div className="poi-popup-section">
              <div className="poi-popup-label">{t('description')}</div>
              <div className="poi-popup-text">
                {displayDescription}
                {shouldTruncateDescription && (
                  <button 
                    className="poi-popup-expand-btn"
                    onClick={() => setExpandedDescription(!expandedDescription)}
                  >
                    {expandedDescription ? t('showLess') : t('showMore')}
                  </button>
                )}
              </div>
            </div>
          )}
        </div>

        {/* Aksiyon Butonları */}
        <div className="poi-popup-actions">
          <button 
            className="poi-popup-action-btn primary"
            onClick={() => setShowDirections(true)}
          >
            🧭 {t('route')}
          </button>
          <button 
            className="poi-popup-action-btn secondary"
            onClick={() => {
              onNavigationStart?.(); // Navigation başladı callback'i
              onClose(); // Popup'ı kapat, navigasyon başlasın
            }}
          >
            🚶 {t('walking')}
          </button>
        </div>
      </div>

      {/* Directions Modal */}
      {showDirections && (
        <DirectionsModal
          poi={poi}
          onClose={() => setShowDirections(false)}
          language={language}
        />
      )}

      {/* Image Modal */}
      {selectedImage && (
        <div className="image-modal-backdrop" onClick={() => setSelectedImage(null)}>
          <div className="image-modal-content" onClick={(e) => e.stopPropagation()}>
            <button 
              className="image-modal-close"
              onClick={() => setSelectedImage(null)}
              aria-label="Close"
            >
              ✕
            </button>
            <img src={selectedImage} alt={poi.name} />
            {poi.images && poi.images.length > 1 && (
              <div className="image-modal-gallery">
                {poi.images.map((img, idx) => (
                  <img
                    key={idx}
                    src={img}
                    alt={`${poi.name} ${idx + 1}`}
                    className={selectedImage === img ? 'active' : ''}
                    onClick={() => setSelectedImage(img)}
                  />
                ))}
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
};

export default memo(POIPopup, (prevProps, nextProps) => {
  // Re-render sadece poi.id değişirse
  return prevProps.poi.id === nextProps.poi.id && 
         prevProps.language === nextProps.language;
});
