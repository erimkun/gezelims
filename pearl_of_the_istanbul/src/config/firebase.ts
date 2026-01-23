// Firebase Configuration
import { initializeApp } from 'firebase/app';
import { getAuth, GoogleAuthProvider } from 'firebase/auth';
import { getFirestore } from 'firebase/firestore';
import { getAnalytics, isSupported } from 'firebase/analytics';

// Firebase config - Gezelim uygulaması
const firebaseConfig = {
  apiKey: "AIzaSyAEBshUGGqE_HwDr8QKeWNAOzxeGqK0Btk",
  authDomain: "gezelim-b492b.firebaseapp.com",
  projectId: "gezelim-b492b",
  storageBucket: "gezelim-b492b.firebasestorage.app",
  messagingSenderId: "1056868538314",
  appId: "1:1056868538314:web:d77e4dcec3539fed24a133",
  measurementId: "G-GVNBVG7WHB"
};

// Firebase app instance
const app = initializeApp(firebaseConfig);

// Firebase services
export const auth = getAuth(app);
export const db = getFirestore(app);
export const googleProvider = new GoogleAuthProvider();

// Analytics - sadece tarayıcıda ve destekleniyorsa
let analytics: ReturnType<typeof getAnalytics> | null = null;
isSupported().then(supported => {
  if (supported) {
    analytics = getAnalytics(app);
  }
});

export { analytics };
export default app;

