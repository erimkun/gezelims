// Route Store - Zustand ile rota state yönetimi
import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { 
  type Route, 
  type RoutePoint,
  createRoute,
  getAllRoutes,
  getPopularRoutes,
  getUserRoutes,
  voteRoute,
  unvoteRoute,
  deleteRoute
} from '../services/routeService';

// POI tipi (haritadaki mekanlar)
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
}

// Rota etiketi seçenekleri
export const ROUTE_TAGS = [
  { key: 'romantic', label: 'Romantik', emoji: '💕' },
  { key: 'historical', label: 'Tarihi', emoji: '🏛️' },
  { key: 'food', label: 'Lezzet Turu', emoji: '🍽️' },
  { key: 'nature', label: 'Doğa', emoji: '🌳' },
  { key: 'art', label: 'Sanat', emoji: '🎨' },
  { key: 'adventure', label: 'Macera', emoji: '🎒' },
  { key: 'family', label: 'Aile', emoji: '👨‍👩‍👧‍👦' },
  { key: 'night', label: 'Gece Turu', emoji: '🌙' }
];

interface RouteState {
  // Rota oluşturma modu
  isCreatingRoute: boolean;
  selectedPoints: RoutePoint[];
  currentPOI: POI | null; // Şu an popup açık olan POI
  routeTitle: string;
  routeDescription: string;
  selectedTags: string[];
  
  // Anonim işlem için
  guestId: string;

  // Rotalar listesi
  routes: Route[];
  popularRoutes: Route[];
  userRoutes: Route[];
  isLoadingRoutes: boolean;
  
  // Actions - Rota oluşturma
  startCreatingRoute: () => void;
  cancelCreatingRoute: () => void;
  addPoint: (poi: POI) => void;
  removePoint: (poiId: string) => void;
  updatePointRating: (poiId: string, rating: number) => void;
  updatePointComment: (poiId: string, comment: string) => void;
  reorderPoints: (fromIndex: number, toIndex: number) => void;
  setCurrentPOI: (poi: POI | null) => void;
  setRouteTitle: (title: string) => void;
  setRouteDescription: (description: string) => void;
  toggleTag: (tag: string) => void;
  
  // Actions - Rota kaydetme/yükleme
  saveRoute: (userId: string, userName: string, userPhoto?: string) => Promise<string>;
  loadRoutes: () => Promise<void>;
  loadPopularRoutes: () => Promise<void>;
  loadUserRoutes: (userId: string) => Promise<void>;
  vote: (routeId: string, userId?: string) => Promise<boolean>;
  unvote: (routeId: string, userId?: string) => Promise<boolean>;
  removeRoute: (routeId: string) => Promise<void>;
}

export const useRouteStore = create<RouteState>()(
  persist(
    (set, get) => ({
      // Initial state
      isCreatingRoute: false,
      selectedPoints: [],
      currentPOI: null,
      routeTitle: '',
      routeDescription: '',
      selectedTags: [],
      guestId: '', // initialize'da doldurulacak
      routes: [],
      popularRoutes: [],
      userRoutes: [],
      isLoadingRoutes: false,

      // Rota oluşturma başlat
      startCreatingRoute: () => {
        set({ 
          isCreatingRoute: true, 
          selectedPoints: [],
          routeTitle: '',
          routeDescription: '',
          selectedTags: []
        });
      },

      // Rota oluşturmayı iptal et
      cancelCreatingRoute: () => {
        set({ 
          isCreatingRoute: false, 
          selectedPoints: [],
          currentPOI: null,
          routeTitle: '',
          routeDescription: '',
          selectedTags: []
        });
      },

      // Noktayı ekle (max 8)
      addPoint: (poi: POI) => {
        const { selectedPoints } = get();
        
        // Maksimum 8 nokta
        if (selectedPoints.length >= 8) {
          console.warn('⚠️ Maksimum 8 nokta eklenebilir');
          return;
        }

        // Aynı POI zaten var mı?
        if (selectedPoints.some(p => p.poiId === poi.id)) {
          console.warn('⚠️ Bu nokta zaten eklendi');
          return;
        }

        const newPoint: RoutePoint = {
          poiId: poi.id,
          poiName: poi.name,
          coordinates: poi.coordinates,
          rating: 5, // Varsayılan mutluluk skoru
          comment: '',
          order: selectedPoints.length
        };

        set({ 
          selectedPoints: [...selectedPoints, newPoint],
          currentPOI: poi // Popup aç
        });
      },

      // Noktayı kaldır
      removePoint: (poiId: string) => {
        const { selectedPoints } = get();
        const filtered = selectedPoints
          .filter(p => p.poiId !== poiId)
          .map((p, index) => ({ ...p, order: index }));
        set({ selectedPoints: filtered });
      },

      // Nokta puanını güncelle
      updatePointRating: (poiId: string, rating: number) => {
        const { selectedPoints } = get();
        set({
          selectedPoints: selectedPoints.map(p => 
            p.poiId === poiId ? { ...p, rating } : p
          )
        });
      },

      // Nokta yorumunu güncelle
      updatePointComment: (poiId: string, comment: string) => {
        const { selectedPoints } = get();
        set({
          selectedPoints: selectedPoints.map(p => 
            p.poiId === poiId ? { ...p, comment } : p
          )
        });
      },

      // Noktaları yeniden sırala
      reorderPoints: (fromIndex: number, toIndex: number) => {
        const { selectedPoints } = get();
        const newPoints = [...selectedPoints];
        const [removed] = newPoints.splice(fromIndex, 1);
        newPoints.splice(toIndex, 0, removed);
        set({
          selectedPoints: newPoints.map((p, index) => ({ ...p, order: index }))
        });
      },

      // Mevcut POI'yi set et (popup için)
      setCurrentPOI: (poi) => set({ currentPOI: poi }),

      // Rota başlığını set et
      setRouteTitle: (title) => set({ routeTitle: title }),

      // Rota açıklamasını set et
      setRouteDescription: (description) => set({ routeDescription: description }),

      // Tag toggle
      toggleTag: (tag) => {
        const { selectedTags } = get();
        if (selectedTags.includes(tag)) {
          set({ selectedTags: selectedTags.filter(t => t !== tag) });
        } else {
          set({ selectedTags: [...selectedTags, tag] });
        }
      },

      // Rotayı kaydet
      saveRoute: async (userId, userName, userPhoto) => {
        const { selectedPoints, routeTitle, routeDescription, selectedTags } = get();
        
        if (selectedPoints.length < 2) {
          throw new Error('En az 2 nokta seçmelisiniz');
        }

        if (!routeTitle.trim()) {
          throw new Error('Rota başlığı gerekli');
        }

        // Ortalama mutluluk skoru
        const totalRating = selectedPoints.reduce((sum, p) => sum + p.rating, 0) / selectedPoints.length;

        const routeData = {
          userId,
          userName,
          userPhoto,
          title: routeTitle.trim(),
          description: routeDescription.trim() || undefined,
          points: selectedPoints,
          tags: selectedTags,
          totalRating,
          votes: 0,
          votedBy: []
        };

        const routeId = await createRoute(routeData);
        
        // State'i temizle
        set({
          isCreatingRoute: false,
          selectedPoints: [],
          currentPOI: null,
          routeTitle: '',
          routeDescription: '',
          selectedTags: []
        });

        // Rotaları yeniden yükle
        await get().loadRoutes();

        return routeId;
      },

      // Tüm rotaları yükle
      loadRoutes: async () => {
        set({ isLoadingRoutes: true });
        try {
          const routes = await getAllRoutes();
          set({ routes, isLoadingRoutes: false });
        } catch (error) {
          console.error('❌ Rotalar yüklenemedi:', error);
          set({ isLoadingRoutes: false });
        }
      },

      // Popüler rotaları yükle
      loadPopularRoutes: async () => {
        set({ isLoadingRoutes: true });
        try {
          const popularRoutes = await getPopularRoutes();
          set({ popularRoutes, isLoadingRoutes: false });
        } catch (error) {
          console.error('❌ Popüler rotalar yüklenemedi:', error);
          set({ isLoadingRoutes: false });
        }
      },

      // Kullanıcı rotalarını yükle
      loadUserRoutes: async (userId) => {
        try {
          const userRoutes = await getUserRoutes(userId);
          set({ userRoutes });
        } catch (error) {
          console.error('❌ Kullanıcı rotaları yüklenemedi:', error);
        }
      },

      // Oy ver
      vote: async (routeId, userId) => {
        // userId yoksa guestId kullan
        const voterId = userId || get().guestId;
        
        if (!voterId) {
          // Guest ID yoksa oluştur
          const newGuestId = `guest-${Math.random().toString(36).substr(2, 9)}`;
          set({ guestId: newGuestId });
          return get().vote(routeId, newGuestId);
        }

        const success = await voteRoute(routeId, voterId);
        if (success) {
          // Rotaları yeniden yükle
          await get().loadRoutes();
        }
        return success;
      },

      // Oyu geri çek
      unvote: async (routeId, userId) => {
        const voterId = userId || get().guestId;
        if (!voterId) return false;

        const success = await unvoteRoute(routeId, voterId);
        if (success) {
          await get().loadRoutes();
        }
        return success;
      },

      // Rotayı sil
      removeRoute: async (routeId) => {
        await deleteRoute(routeId);
        await get().loadRoutes();
      }
    }),
    {
      name: 'route-storage',
      partialize: (state) => ({
        // Bu alanlar kalıcı olacak
        isCreatingRoute: state.isCreatingRoute,
        selectedPoints: state.selectedPoints,
        routeTitle: state.routeTitle,
        routeDescription: state.routeDescription,
        selectedTags: state.selectedTags,
        guestId: state.guestId
      }),
      // Rehydrate bittiğinde guestID kontrolü yap
      onRehydrateStorage: () => (state) => {
        if (state && !state.guestId) {
          state.guestId = `guest-${Math.random().toString(36).substr(2, 9)}`;
        }
      }
    }
  )
);

