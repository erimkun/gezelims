// Routes Sidebar - Rota listesi ve filtreleme
import { useState, useEffect } from 'react';
import { type User } from 'firebase/auth';
import { useAuthStore, useRouteStore, ROUTE_TAGS } from '../../store';
import { type Route } from '../../services/routeService';
import RouteComments from './RouteComments';
import './RoutesSidebar.css';

// Placeholder görseller - tag'lere göre
const PLACEHOLDER_IMAGES = {
  tarihi: 'https://images.unsplash.com/photo-1541432901042-2d8bd64b4a9b?w=200&h=200&fit=crop', // İstanbul tarihi
  romantik: 'https://images.unsplash.com/photo-1502635385003-ee1e6a1a742d?w=200&h=200&fit=crop', // Gün batımı
  lezzet: 'https://images.unsplash.com/photo-1504674900247-0877df9cc836?w=200&h=200&fit=crop', // Yemek
  doga: 'https://images.unsplash.com/photo-1441974231531-c6227db76b6e?w=200&h=200&fit=crop', // Doğa
  kultur: 'https://images.unsplash.com/photo-1582555172866-f73bb12a2ab3?w=200&h=200&fit=crop', // Kültür
  gece: 'https://images.unsplash.com/photo-1519608487953-e999c86e7455?w=200&h=200&fit=crop', // Gece
  default: [
    'https://images.unsplash.com/photo-1524231757912-21f4fe3a7200?w=200&h=200&fit=crop', // İstanbul 1
    'https://images.unsplash.com/photo-1527838832700-5059252407fa?w=200&h=200&fit=crop', // İstanbul 2
    'https://images.unsplash.com/photo-1604941999586-f90d93a4e35e?w=200&h=200&fit=crop', // İstanbul 3
    'https://images.unsplash.com/photo-1558618666-fcd25c85cd64?w=200&h=200&fit=crop', // İstanbul 4
  ]
};

// Rota için thumbnail URL'si belirle
const getRouteThumbnail = (route: Route): string => {
  // 1. Önce kullanıcının eklediği fotoğrafları ara (commentPhoto)
  const pointWithCommentPhoto = route.points.find((p: any) => p.commentPhoto);
  if (pointWithCommentPhoto && (pointWithCommentPhoto as any).commentPhoto) {
    return (pointWithCommentPhoto as any).commentPhoto;
  }

  // 2. POI'lerden görsel ara (eğer varsa)
  const pointWithImage = route.points.find((p: any) => p.poiImage);
  if (pointWithImage && (pointWithImage as any).poiImage) {
    return (pointWithImage as any).poiImage;
  }

  // 3. Tag'e göre placeholder seç
  if (route.tags && route.tags.length > 0) {
    const firstTag = route.tags[0].toLowerCase();
    if (PLACEHOLDER_IMAGES[firstTag as keyof typeof PLACEHOLDER_IMAGES]) {
      const img = PLACEHOLDER_IMAGES[firstTag as keyof typeof PLACEHOLDER_IMAGES];
      if (typeof img === 'string') return img;
    }
  }

  // 4. Varsayılan placeholder'lardan rastgele seç (route id'ye göre sabit)
  const defaultImages = PLACEHOLDER_IMAGES.default;
  const index = route.id ? route.id.charCodeAt(0) % defaultImages.length : 0;
  return defaultImages[index];
};

interface RoutesSidebarProps {

  language: 'tr' | 'en' | 'de' | 'fr' | 'es' | 'it';
  isDesktop: boolean;
  user: User | null;
}

const RoutesSidebar = ({ language, isDesktop, user }: RoutesSidebarProps) => {
  const [isOpen, setIsOpen] = useState(isDesktop);
  const [activeTab, setActiveTab] = useState<'all' | 'popular' | 'mine'>('all');
  const [selectedTag, setSelectedTag] = useState<string | null>(null);
  const [expandedRouteId, setExpandedRouteId] = useState<string | null>(null);
  const [filtersOpen, setFiltersOpen] = useState(false);
  const [commentRouteId, setCommentRouteId] = useState<string | null>(null);
  const [animatingHearts, setAnimatingHearts] = useState<Set<string>>(new Set());
  const [showLoginPrompt, setShowLoginPrompt] = useState(false);

  const { signIn } = useAuthStore();

  const {
    routes,
    popularRoutes,
    userRoutes,
    isLoadingRoutes,
    isCreatingRoute,
    startCreatingRoute,
    vote,
    unvote,
    removeRoute,
    guestId,
    loadRoutes,
    loadPopularRoutes,
    loadUserRoutes
  } = useRouteStore();

  useEffect(() => {
    loadRoutes();
    loadPopularRoutes();
    if (user) {
      loadUserRoutes(user.uid);
    }
  }, [loadRoutes, loadPopularRoutes, loadUserRoutes, user]);

  const translations = {
    tr: {
      routes: 'Rotalar',
      popular: 'Popüler',
      all: 'Tümü',
      mine: 'Benim',
      createRoute: 'Rota Oluştur',
      noRoutes: 'Henüz rota yok',
      loginToCreate: 'Rota oluşturmak için giriş yapın',
      votes: 'oy',
      points: 'NOKTA',
      by: 'tarafından',
      topRated: 'POPÜLER LİDERLİK',
      deleteConfirm: 'Bu rotayı silmek istediğinizden emin misiniz?',
      steps: 'Durak',
      rating: 'Puan',
      comments: 'Yorumlar'
    },
    en: {
      routes: 'Routes',
      popular: 'Popular',
      all: 'All',
      mine: 'Mine',
      createRoute: 'Create Route',
      noRoutes: 'No routes yet',
      loginToCreate: 'Login to create a route',
      votes: 'votes',
      points: 'POINTS',
      by: 'by',
      topRated: 'TOP RANKED',
      deleteConfirm: 'Are you sure you want to delete this route?',
      steps: 'Steps',
      rating: 'Rating',
      comments: 'Comments'
    },
    de: {
      routes: 'Routen',
      popular: 'Beliebt',
      all: 'Alle',
      mine: 'Meine',
      createRoute: 'Route erstellen',
      noRoutes: 'Noch keine Routen',
      loginToCreate: 'Melden Sie sich an',
      votes: 'Stimmen',
      points: 'PUNKTE',
      by: 'von',
      topRated: 'TOP BEWERTET',
      deleteConfirm: 'Möchten Sie diese Route wirklich löschen?',
      steps: 'Schritte',
      rating: 'Bewertung',
      comments: 'Kommentare'
    },
    fr: {
      routes: 'Itinéraires',
      popular: 'Populaire',
      all: 'Tous',
      mine: 'Mes',
      createRoute: 'Créer',
      noRoutes: 'Pas encore d\'itinéraires',
      loginToCreate: 'Connectez-vous',
      votes: 'votes',
      points: 'POINTS',
      by: 'par',
      topRated: 'LES MIEUX CLASSÉS',
      deleteConfirm: 'Êtes-vous sûr de vouloir supprimer cet itinéraire ?',
      steps: 'Étapes',
      rating: 'Note',
      comments: 'Commentaires'
    },
    es: {
      routes: 'Rutas',
      popular: 'Popular',
      all: 'Todas',
      mine: 'Mías',
      createRoute: 'Crear ruta',
      noRoutes: 'Aún no hay rutas',
      loginToCreate: 'Inicia sesión',
      votes: 'votos',
      points: 'PUNTOS',
      by: 'por',
      topRated: 'MEJOR VALORADOS',
      deleteConfirm: '¿Estás seguro de que quieres eliminar esta ruta?',
      steps: 'Pasos',
      rating: 'Clasificación',
      comments: 'Comentarios'
    },
    it: {
      routes: 'Percorsi',
      popular: 'Popolari',
      all: 'Tutti',
      mine: 'Miei',
      createRoute: 'Crea',
      noRoutes: 'Nessun percorso',
      loginToCreate: 'Accedi',
      votes: 'voti',
      points: 'PUNTI',
      by: 'di',
      topRated: 'PIÙ VOTATI',
      deleteConfirm: 'Sei sicuro di voler eliminare questo percorso?',
      steps: 'Passi',
      rating: 'Valutazione',
      comments: 'Commenti'
    }
  };

  const t = translations[language];

  // Filtreleme mantığı
  const getFilteredRoutes = () => {
    let list = [];
    switch (activeTab) {
      case 'popular':
        list = popularRoutes;
        break;
      case 'mine':
        list = userRoutes;
        break;
      case 'all':
      default:
        list = routes;
    }

    if (selectedTag) {
      list = list.filter(r => r.tags?.includes(selectedTag));
    }

    return list;
  };

  const displayRoutes = getFilteredRoutes();

  // Top 3 rotayı al
  const topRatedRoutes = [...routes]
    .sort((a, b) => (b.votes || 0) - (a.votes || 0))
    .slice(0, 3);

  // Oy verme işlevi
  const handleVote = async (e: React.MouseEvent, route: Route) => {
    e.stopPropagation();

    // Giriş yapmamışsa login prompt göster
    if (!user) {
      setShowLoginPrompt(true);
      return;
    }

    const voterId = user.uid;

    // Zaten oy vermiş mi?
    const hasVoted = route.votedBy?.includes(voterId);

    if (hasVoted) {
      await unvote(route.id!, voterId);
    } else {
      // Kalp animasyonu başlat
      setAnimatingHearts(prev => new Set(prev).add(route.id!));
      await vote(route.id!, voterId);
      
      // Animasyon bitince kaldır
      setTimeout(() => {
        setAnimatingHearts(prev => {
          const next = new Set(prev);
          next.delete(route.id!);
          return next;
        });
      }, 600);
    }
  };

  // Yorum butonuna tıklama
  const handleCommentClick = (e: React.MouseEvent, routeId: string) => {
    e.stopPropagation();
    
    // Giriş yapmamışsa login prompt göster
    if (!user) {
      setShowLoginPrompt(true);
      return;
    }
    
    setCommentRouteId(routeId);
  };

  const handleDelete = async (e: React.MouseEvent, routeId: string) => {
    e.stopPropagation();
    if (window.confirm(t.deleteConfirm)) {
      await removeRoute(routeId);
    }
  };

  // Tag emoji'sini bul
  const getTagEmoji = (tagKey: string) => {
    const tag = ROUTE_TAGS.find(t => t.key === tagKey);
    return tag?.emoji || '🏷️';
  };

  return (
    <>
      {/* Toggle button - mobilde */}
      {!isDesktop && (
        <button
          className="routes-sidebar-toggle"
          onClick={() => setIsOpen(!isOpen)}
        >
          {isOpen ? '✕' : '📋'}
        </button>
      )}

      {/* Sidebar */}
      <div className={`routes-sidebar ${isOpen ? 'open' : ''}`}>
        {/* Header */}
        <div className="routes-sidebar-header">
          <h2>
            <span style={{ 
              background: 'linear-gradient(135deg, #10B981, #059669)', 
              borderRadius: '10px', 
              padding: '6px 10px',
              display: 'inline-flex',
              alignItems: 'center',
              justifyContent: 'center'
            }}>
              <span style={{ color: 'white', fontSize: '16px' }}>🗺️</span>
            </span>
            {t.routes}
          </h2>
          {isDesktop && (
            <button
              className="routes-sidebar-close"
              onClick={() => setIsOpen(false)}
            >
              ✕
            </button>
          )}
        </div>

        {/* Toplam İstatistikler / Top Rated */}
        <div className="routes-top-rated">
          <h3>🏆 {t.topRated}</h3>
          <div className="top-rated-list">
            {topRatedRoutes.map((route, index) => (
              <div key={route.id} className="top-rated-item" onClick={() => setExpandedRouteId(expandedRouteId === route.id ? null : route.id!)}>
                <div className="top-rated-rank">#{index + 1}</div>
                <div className="top-rated-info">
                  <span className="top-rated-title">{route.title}</span>
                  <span className="top-rated-votes">⭐ {route.votes || 0}</span>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Tabs */}
        <div className="routes-sidebar-tabs">
          <button
            className={`tab ${activeTab === 'all' ? 'active' : ''}`}
            onClick={() => setActiveTab('all')}
          >
            {t.all}
          </button>
          <button
            className={`tab ${activeTab === 'popular' ? 'active' : ''}`}
            onClick={() => setActiveTab('popular')}
          >
            {t.popular}
          </button>
          {user && (
            <button
              className={`tab ${activeTab === 'mine' ? 'active' : ''}`}
              onClick={() => setActiveTab('mine')}
            >
              {t.mine}
            </button>
          )}
        </div>

        {/* Tags Filter Toggle */}
        <div className="routes-filter-section">
          <button
            className={`filter-toggle-btn ${filtersOpen ? 'open' : ''} ${selectedTag ? 'has-filter' : ''}`}
            onClick={() => setFiltersOpen(!filtersOpen)}
          >
            <span className="filter-icon">🏷️</span>
            <span>Kategori Filtresi</span>
            {selectedTag && <span className="active-filter-badge">1</span>}
            <span className={`chevron ${filtersOpen ? 'open' : ''}`}>▼</span>
          </button>

          {filtersOpen && (
            <div className="routes-tags-container">
              <div className="routes-tags">
                {ROUTE_TAGS.map(tag => (
                  <button
                    key={tag.key}
                    className={`tag-filter-btn ${selectedTag === tag.key ? 'active' : ''}`}
                    onClick={() => setSelectedTag(selectedTag === tag.key ? null : tag.key)}
                  >
                    {tag.emoji} {tag.label}
                  </button>
                ))}
              </div>
            </div>
          )}
        </div>

        {/* Routes List */}
        <div className="routes-sidebar-list">
          {isLoadingRoutes ? (
            <div className="routes-loading">
              <div className="loading-spinner" />
            </div>
          ) : displayRoutes.length === 0 ? (
            <div className="routes-empty">
              <span className="empty-icon">🗺️</span>
              <span>{t.noRoutes}</span>
            </div>
          ) : (
            displayRoutes.map(route => (
              <div key={route.id} className={`route-card ${expandedRouteId === route.id ? 'expanded' : ''}`}>
                {/* Route header */}
                <div
                  className="route-card-header"
                  onClick={() => setExpandedRouteId(expandedRouteId === route.id ? null : route.id!)}
                >
                  {/* Thumbnail */}
                  <div className="route-thumbnail">
                    <img 
                      src={getRouteThumbnail(route)} 
                      alt={route.title}
                      onError={(e) => {
                        // Görsel yüklenemezse varsayılan placeholder kullan
                        (e.target as HTMLImageElement).src = PLACEHOLDER_IMAGES.default[0];
                      }}
                    />
                  </div>

                  <div className="route-main-info">
                    <div className="route-header-top">
                      <div className="route-user">
                        {route.userPhoto ? (
                          <img src={route.userPhoto} alt={route.userName} className="route-user-avatar" />
                        ) : (
                          <div className="route-user-avatar-placeholder">
                            {route.userName?.[0] || '?'}
                          </div>
                        )}
                        <span className="route-user-name">{route.userName}</span>
                      </div>

                      {user?.uid === route.userId && (
                        <button
                          className="delete-route-btn"
                          onClick={(e) => handleDelete(e, route.id!)}
                        >
                          🗑️
                        </button>
                      )}
                    </div>

                    <h3 className="route-title">{route.title}</h3>

                    <div className="route-stat-row">
                      <span className="route-stat route-stat-points">
                        📍 {route.points.length} {t.points}
                      </span>
                      <span className="route-stat route-stat-rating">
                        ⭐ {route.totalRating.toFixed(1)}
                      </span>
                    </div>
                  </div>

                  <div className="route-vote-section">
                    <button
                      className={`route-vote-btn ${route.votedBy?.includes(user?.uid || '') ? 'voted' : ''} ${animatingHearts.has(route.id!) ? 'heart-burst' : ''}`}
                      onClick={(e) => handleVote(e, route)}
                    >
                      <span className="vote-icon">
                        {route.votedBy?.includes(user?.uid || '') ? '❤️' : '🤍'}
                      </span>
                      <span className="vote-count">{route.votes || 0}</span>
                      {animatingHearts.has(route.id!) && (
                        <div className="heart-particles">
                          <span className="particle">❤️</span>
                          <span className="particle">❤️</span>
                          <span className="particle">❤️</span>
                          <span className="particle">❤️</span>
                          <span className="particle">❤️</span>
                          <span className="particle">❤️</span>
                        </div>
                      )}
                    </button>
                    
                    <button
                      className="comment-btn"
                      onClick={(e) => handleCommentClick(e, route.id!)}
                    >
                      <span>💬</span>
                    </button>
                  </div>
                </div>

                {expandedRouteId === route.id && (
                  <div className="route-details">
                    {route.description && (
                      <p className="route-description">{route.description}</p>
                    )}

                    {route.tags && route.tags.length > 0 && (
                      <div className="route-tags">
                        {route.tags.map(tag => (
                          <span key={tag} className="route-tag">
                            {getTagEmoji(tag)}
                          </span>
                        ))}
                      </div>
                    )}

                    <div className="route-points-timeline">
                      {route.points
                        .sort((a, b) => a.order - b.order)
                        .map((point, idx) => (
                          <div key={idx} className="timeline-item">
                            <div className="timeline-marker">{idx + 1}</div>
                            <div className="timeline-content">
                              <h4>{point.poiName}</h4>
                              <div className="point-rating">
                                {'⭐'.repeat(Math.round(point.rating))}
                                <span className="point-rating-val">({point.rating})</span>
                              </div>
                              {point.comment && (
                                <div className="point-comment">
                                  💬 "{point.comment}"
                                </div>
                              )}
                            </div>
                          </div>
                        ))}
                    </div>
                  </div>
                )}
              </div>
            ))
          )}
        </div>

        {/* Create Route Button - Fixed at bottom */}
        <div className="routes-sidebar-create">
          {user ? (
            <button
              className="create-route-btn"
              onClick={startCreatingRoute}
              disabled={isCreatingRoute}
            >
              <span className="btn-icon">➕</span>
              <span>{t.createRoute}</span>
            </button>
          ) : (
            <button
              className="login-prompt"
              onClick={signIn}
            >
              <span>🔐</span>
              <span>{t.loginToCreate}</span>
            </button>
          )}
        </div>
      </div>

      {/* Yorumlar Modalı */}
      {commentRouteId && (
        <RouteComments
          routeId={commentRouteId}
          isOpen={!!commentRouteId}
          onClose={() => setCommentRouteId(null)}
          language={language}
        />
      )}

      {/* Login Prompt Modal */}
      {showLoginPrompt && (
        <div className="login-modal-backdrop" onClick={() => setShowLoginPrompt(false)}>
          <div className="login-modal" onClick={(e) => e.stopPropagation()}>
            <button className="login-modal-close" onClick={() => setShowLoginPrompt(false)}>✕</button>
            <div className="login-modal-icon">🔐</div>
            <h3 className="login-modal-title">
              {language === 'tr' ? 'Giriş Yapın' : 
               language === 'de' ? 'Anmelden' :
               language === 'fr' ? 'Connexion' :
               language === 'es' ? 'Iniciar Sesión' :
               language === 'it' ? 'Accedi' : 'Sign In'}
            </h3>
            <p className="login-modal-text">
              {language === 'tr' ? 'Beğenmek ve yorum yapmak için giriş yapmanız gerekiyor.' :
               language === 'de' ? 'Melden Sie sich an, um zu liken und zu kommentieren.' :
               language === 'fr' ? 'Connectez-vous pour aimer et commenter.' :
               language === 'es' ? 'Inicia sesión para dar me gusta y comentar.' :
               language === 'it' ? 'Accedi per mettere mi piace e commentare.' :
               'Please sign in to like and comment.'}
            </p>
            <button className="login-modal-btn" onClick={() => { setShowLoginPrompt(false); signIn(); }}>
              <span>🚀</span>
              {language === 'tr' ? 'Google ile Giriş Yap' :
               language === 'de' ? 'Mit Google anmelden' :
               language === 'fr' ? 'Se connecter avec Google' :
               language === 'es' ? 'Iniciar con Google' :
               language === 'it' ? 'Accedi con Google' : 'Sign in with Google'}
            </button>
          </div>
        </div>
      )}
    </>
  );
};

export default RoutesSidebar;
