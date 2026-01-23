// Routes Sidebar - Rota listesi ve filtreleme
import { useState, useEffect } from 'react';
import { type User } from 'firebase/auth';
import { useAuthStore, useRouteStore, ROUTE_TAGS } from '../../store';
import { type Route } from '../../services/routeService';
import './RoutesSidebar.css';

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
      points: 'nokta',
      by: 'tarafından',
      topRated: '🏆 En Çok Oy Alanlar',
      deleteConfirm: 'Bu rotayı silmek istediğinizden emin misiniz?',
      steps: 'Durak',
      rating: 'Puan'
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
      points: 'points',
      by: 'by',
      topRated: '🏆 Top Rated',
      deleteConfirm: 'Are you sure you want to delete this route?',
      steps: 'Steps',
      rating: 'Rating'
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
      points: 'Punkte',
      by: 'von',
      topRated: '🏆 Bestbewertet',
      deleteConfirm: 'Möchten Sie diese Route wirklich löschen?',
      steps: 'Schritte',
      rating: 'Bewertung'
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
      points: 'points',
      by: 'par',
      topRated: '🏆 Les Mieux Notés',
      deleteConfirm: 'Êtes-vous sûr de vouloir supprimer cet itinéraire ?',
      steps: 'Étapes',
      rating: 'Note'
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
      points: 'puntos',
      by: 'por',
      topRated: '🏆 Mejor Valorados',
      deleteConfirm: '¿Estás seguro de que quieres eliminar esta ruta?',
      steps: 'Pasos',
      rating: 'Clasificación'
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
      points: 'punti',
      by: 'di',
      topRated: '🏆 Più Votati',
      deleteConfirm: 'Sei sicuro di voler eliminare questo percorso?',
      steps: 'Passi',
      rating: 'Valutazione'
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

    // Guest ID veya User ID kullan
    const voterId = user?.uid || guestId;

    // Zaten oy vermiş mi?
    const hasVoted = route.votedBy?.includes(voterId);

    if (hasVoted) {
      await unvote(route.id!, voterId);
    } else {
      await vote(route.id!, voterId);
    }
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
          <h2>🗺️ {t.routes}</h2>
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
          <h3>{t.topRated}</h3>
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

        {/* Create Route Button */}
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
            🔥 {t.popular}
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
                      <span className="route-stat">
                        📍 {route.points.length} {t.points}
                      </span>
                      <span className="route-stat">
                        ⭐ {route.totalRating.toFixed(1)}
                      </span>
                    </div>
                  </div>

                  <div className="route-vote-section">
                    <button
                      className={`route-vote-btn ${route.votedBy?.includes(user?.uid || guestId) ? 'voted' : ''}`}
                      onClick={(e) => handleVote(e, route)}
                    >
                      <span className="vote-icon">▲</span>
                      <span className="vote-count">{route.votes || 0}</span>
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
      </div>
    </>
  );
};

export default RoutesSidebar;
