// Route Service - Firestore işlemleri
import { 
  collection, 
  doc,
  addDoc, 
  updateDoc, 
  deleteDoc,
  getDoc,
  getDocs, 
  query, 
  where, 
  orderBy, 
  limit,
  increment,
  serverTimestamp,
  type Timestamp
} from 'firebase/firestore';
import { db } from '../config/firebase';

// Route tipi
export interface RoutePoint {
  poiId: string;
  poiName: string;
  poiImage?: string; // POI görseli (varsa)
  commentPhoto?: string; // Kullanıcının eklediği fotoğraf (base64 veya URL)
  coordinates: [number, number];
  rating: number; // 1-5 mutluluk skoru
  comment: string;
  order: number;
}

export interface Route {
  id?: string;
  userId: string;
  userName: string;
  userPhoto?: string;
  title: string;
  description?: string;
  points: RoutePoint[];
  tags: string[]; // Romantik, Tarihi, Lezzet vs.
  totalRating: number; // Ortalama mutluluk skoru
  votes: number; // Toplam oy sayısı
  votedBy: string[]; // Oy veren kullanıcı ID'leri
  createdAt?: Timestamp;
  updatedAt?: Timestamp;
}

// Routes collection referansı
const routesRef = collection(db, 'routes');

// Yardımcı fonksiyon: Undefined değerleri temizle (recursive)
const cleanData = (data: any): any => {
  if (data === null || data === undefined) {
    return undefined;
  }
  
  if (Array.isArray(data)) {
    return data.map(item => cleanData(item)).filter(item => item !== undefined);
  }
  
  if (typeof data === 'object') {
    return Object.entries(data).reduce((acc, [key, value]) => {
      const cleanedValue = cleanData(value);
      if (cleanedValue !== undefined) {
        acc[key] = cleanedValue;
      }
      return acc;
    }, {} as any);
  }
  
  return data;
};

// Yeni rota oluştur
export const createRoute = async (route: Omit<Route, 'id' | 'createdAt' | 'updatedAt'>): Promise<string> => {
  try {
    const cleanedRoute = cleanData(route);
    const docRef = await addDoc(routesRef, {
      ...cleanedRoute,
      votes: 0,
      votedBy: [],
      createdAt: serverTimestamp(),
      updatedAt: serverTimestamp()
    });
    console.log('✅ Rota oluşturuldu:', docRef.id);
    return docRef.id;
  } catch (error) {
    console.error('❌ Rota oluşturma hatası:', error);
    throw error;
  }
};

// Rota güncelle
export const updateRoute = async (routeId: string, data: Partial<Route>): Promise<void> => {
  try {
    const cleanedData = cleanData(data);
    const routeDoc = doc(db, 'routes', routeId);
    await updateDoc(routeDoc, {
      ...cleanedData,
      updatedAt: serverTimestamp()
    });
    console.log('✅ Rota güncellendi:', routeId);
  } catch (error) {
    console.error('❌ Rota güncelleme hatası:', error);
    throw error;
  }
};

// Rota sil
export const deleteRoute = async (routeId: string): Promise<void> => {
  try {
    const routeDoc = doc(db, 'routes', routeId);
    await deleteDoc(routeDoc);
    console.log('✅ Rota silindi:', routeId);
  } catch (error) {
    console.error('❌ Rota silme hatası:', error);
    throw error;
  }
};

// Tek rota getir
export const getRoute = async (routeId: string): Promise<Route | null> => {
  try {
    const routeDoc = doc(db, 'routes', routeId);
    const snapshot = await getDoc(routeDoc);
    if (snapshot.exists()) {
      return { id: snapshot.id, ...snapshot.data() } as Route;
    }
    return null;
  } catch (error) {
    console.error('❌ Rota getirme hatası:', error);
    throw error;
  }
};

// Popüler rotaları getir (en fazla 100 oy alanlar)
export const getPopularRoutes = async (maxVotes: number = 100): Promise<Route[]> => {
  try {
    const q = query(
      routesRef,
      where('votes', '<=', maxVotes),
      orderBy('votes', 'desc'),
      limit(50)
    );
    const snapshot = await getDocs(q);
    return snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as Route));
  } catch (error) {
    console.error('❌ Popüler rotalar getirme hatası:', error);
    throw error;
  }
};

// Tüm rotaları getir (son eklenenler)
export const getAllRoutes = async (limitCount: number = 50): Promise<Route[]> => {
  try {
    const q = query(
      routesRef,
      orderBy('createdAt', 'desc'),
      limit(limitCount)
    );
    const snapshot = await getDocs(q);
    return snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as Route));
  } catch (error) {
    console.error('❌ Rotalar getirme hatası:', error);
    throw error;
  }
};

// Kullanıcının rotalarını getir
export const getUserRoutes = async (userId: string): Promise<Route[]> => {
  try {
    const q = query(
      routesRef,
      where('userId', '==', userId),
      orderBy('createdAt', 'desc')
    );
    const snapshot = await getDocs(q);
    return snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as Route));
  } catch (error) {
    console.error('❌ Kullanıcı rotaları getirme hatası:', error);
    throw error;
  }
};

// Rotaya oy ver
export const voteRoute = async (routeId: string, userId: string): Promise<boolean> => {
  try {
    const routeDoc = doc(db, 'routes', routeId);
    const snapshot = await getDoc(routeDoc);
    
    if (!snapshot.exists()) {
      console.warn('⚠️ Rota bulunamadı');
      return false;
    }

    const route = snapshot.data() as Route;
    
    // Kullanıcı daha önce oy vermiş mi?
    if (route.votedBy?.includes(userId)) {
      console.warn('⚠️ Kullanıcı zaten oy vermiş');
      return false;
    }

    // Maksimum 100 oy kontrolü
    if ((route.votes || 0) >= 100) {
      console.warn('⚠️ Rota maksimum oya ulaştı');
      return false;
    }

    await updateDoc(routeDoc, {
      votes: increment(1),
      votedBy: [...(route.votedBy || []), userId],
      updatedAt: serverTimestamp()
    });

    console.log('✅ Oy verildi:', routeId);
    return true;
  } catch (error) {
    console.error('❌ Oy verme hatası:', error);
    throw error;
  }
};

// Oyu geri çek
export const unvoteRoute = async (routeId: string, userId: string): Promise<boolean> => {
  try {
    const routeDoc = doc(db, 'routes', routeId);
    const snapshot = await getDoc(routeDoc);
    
    if (!snapshot.exists()) {
      return false;
    }

    const route = snapshot.data() as Route;
    
    // Kullanıcı oy vermemiş mi?
    if (!route.votedBy?.includes(userId)) {
      return false;
    }

    await updateDoc(routeDoc, {
      votes: increment(-1),
      votedBy: route.votedBy.filter(id => id !== userId),
      updatedAt: serverTimestamp()
    });

    console.log('✅ Oy geri çekildi:', routeId);
    return true;
  } catch (error) {
    console.error('❌ Oy geri çekme hatası:', error);
    throw error;
  }
};

// Tag'e göre rota ara
export const searchRoutesByTag = async (tag: string): Promise<Route[]> => {
  try {
    const q = query(
      routesRef,
      where('tags', 'array-contains', tag),
      orderBy('votes', 'desc'),
      limit(30)
    );
    const snapshot = await getDocs(q);
    return snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as Route));
  } catch (error) {
    console.error('❌ Tag araması hatası:', error);
    throw error;
  }
};

// --- Yorum Sistemi (Comments) ---

export interface RouteComment {
  id?: string;
  routeId: string;
  userId: string;
  userName: string;
  userPhoto?: string;
  text: string;
  createdAt?: Timestamp;
}

// Yorum ekle
export const addComment = async (routeId: string, comment: Omit<RouteComment, 'id' | 'createdAt'>): Promise<string> => {
  try {
    const commentsRef = collection(db, 'routes', routeId, 'comments');
    const docRef = await addDoc(commentsRef, {
      ...comment,
      createdAt: serverTimestamp()
    });
    console.log('✅ Yorum eklendi:', docRef.id);
    return docRef.id;
  } catch (error) {
    console.error('❌ Yorum ekleme hatası:', error);
    throw error;
  }
};

// Yorumları getir
export const getComments = async (routeId: string): Promise<RouteComment[]> => {
  try {
    const commentsRef = collection(db, 'routes', routeId, 'comments');
    const q = query(commentsRef, orderBy('createdAt', 'desc'));
    const snapshot = await getDocs(q);
    return snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as RouteComment));
  } catch (error) {
    console.error('❌ Yorumları getirme hatası:', error);
    throw error;
  }
};

// Yorum sil (Sadece kendi yorumunu silebilir - UI tarafında kontrol edilecek)
export const deleteComment = async (routeId: string, commentId: string): Promise<void> => {
  try {
    const commentDoc = doc(db, 'routes', routeId, 'comments', commentId);
    await deleteDoc(commentDoc);
    console.log('✅ Yorum silindi:', commentId);
  } catch (error) {
    console.error('❌ Yorum silme hatası:', error);
    throw error;
  }
};


