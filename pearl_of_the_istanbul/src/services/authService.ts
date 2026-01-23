// Authentication Service
import {
  signInWithPopup,
  signInWithRedirect,
  getRedirectResult,
  signOut as firebaseSignOut,
  onAuthStateChanged,
  type User
} from 'firebase/auth';
import { auth, googleProvider } from '../config/firebase';

// Login işlemi devam ediyor mu kontrolü
let isSigningIn = false;

// Google ile giriş - Önce popup, engellenmişse redirect
export const signInWithGoogle = async (): Promise<User | null> => {
  // Zaten giriş yapılıyorsa tekrar deneme
  if (isSigningIn) {
    console.log('⏳ Giriş işlemi zaten devam ediyor...');
    return null;
  }

  isSigningIn = true;

  try {
    // Önce popup dene
    const result = await signInWithPopup(auth, googleProvider);
    console.log('✅ Google ile giriş başarılı (popup):', result.user.displayName);
    isSigningIn = false;
    return result.user;
  } catch (error: unknown) {
    const firebaseError = error as { code?: string };

    // Popup engellendiyse veya kapatıldıysa redirect dene
    if (firebaseError.code === 'auth/popup-blocked' ||
      firebaseError.code === 'auth/popup-closed-by-user' ||
      firebaseError.code === 'auth/cancelled-popup-request') {
      console.log('🔄 Popup engellendi, redirect ile devam ediliyor...');
      try {
        await signInWithRedirect(auth, googleProvider);
        // Redirect yapılacak, sayfa yenilenecek
        return null;
      } catch (redirectError) {
        console.error('❌ Redirect giriş hatası:', redirectError);
        isSigningIn = false;
        throw redirectError;
      }
    }

    console.error('❌ Google giriş hatası:', error);
    isSigningIn = false;
    throw error;
  }
};

// Redirect sonucunu kontrol et (sayfa yenilendiğinde)
export const checkRedirectResult = async (): Promise<User | null> => {
  try {
    const result = await getRedirectResult(auth);
    if (result?.user) {
      console.log('✅ Google ile giriş başarılı (redirect):', result.user.displayName);
      return result.user;
    }
    return null;
  } catch (error) {
    console.error('❌ Redirect sonuç kontrolü hatası:', error);
    return null;
  }
};

// Çıkış yap
export const signOut = async (): Promise<void> => {
  try {
    await firebaseSignOut(auth);
    console.log('✅ Çıkış yapıldı');
  } catch (error) {
    console.error('❌ Çıkış hatası:', error);
    throw error;
  }
};

// Auth state değişikliklerini dinle
export const onAuthChange = (callback: (user: User | null) => void) => {
  return onAuthStateChanged(auth, callback);
};

// Mevcut kullanıcıyı al
export const getCurrentUser = (): User | null => {
  return auth.currentUser;
};

