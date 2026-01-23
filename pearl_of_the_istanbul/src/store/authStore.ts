// Auth Store - Zustand ile kullanıcı state yönetimi
import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { type User } from 'firebase/auth';
import { signInWithGoogle, signOut, onAuthChange, checkRedirectResult } from '../services/authService';

interface AuthState {
  user: User | null;
  isLoading: boolean;
  error: string | null;
  isInitialized: boolean;

  // Actions
  signIn: () => Promise<void>;
  logout: () => Promise<void>;
  setUser: (user: User | null) => void;
  setLoading: (loading: boolean) => void;
  setError: (error: string | null) => void;
  initialize: () => () => void;
}

export const useAuthStore = create<AuthState>()(
  persist(
    (set) => ({
      user: null,
      isLoading: false,
      error: null,
      isInitialized: false,

      signIn: async () => {
        set({ isLoading: true, error: null });
        try {
          // Popup veya redirect ile giriş yap
          const user = await signInWithGoogle();
          if (user) {
            set({ user, isLoading: false });
          }
          // user null ise redirect yapılmış olabilir, sayfa yenilenecek
        } catch (error) {
          const message = error instanceof Error ? error.message : 'Giriş başarısız';
          set({ error: message, isLoading: false });
        }
      },

      logout: async () => {
        set({ isLoading: true, error: null });
        try {
          await signOut();
          set({ user: null, isLoading: false });
        } catch (error) {
          const message = error instanceof Error ? error.message : 'Çıkış başarısız';
          set({ error: message, isLoading: false });
        }
      },

      setUser: (user) => set({ user }),
      setLoading: (isLoading) => set({ isLoading }),
      setError: (error) => set({ error }),

      initialize: () => {
        // Redirect sonucunu kontrol et (popup engellendiyse redirect ile giriş yapılmış olabilir)
        checkRedirectResult().then((user) => {
          if (user) {
            set({ user, isInitialized: true, isLoading: false });
          }
        });

        // Auth state değişikliklerini dinle
        const unsubscribe = onAuthChange((user) => {
          set({ user, isInitialized: true, isLoading: false });
        });
        return unsubscribe;
      }
    }),
    {
      name: 'auth-storage',
      partialize: (state) => ({
        // Sadece temel bilgileri persist et
        user: state.user ? {
          uid: state.user.uid,
          displayName: state.user.displayName,
          email: state.user.email,
          photoURL: state.user.photoURL
        } : null
      })
    }
  )
);
