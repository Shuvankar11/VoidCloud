import { initializeApp, getApps, getApp, FirebaseApp } from 'firebase/app';
import {
  getAuth,
  Auth,
  GoogleAuthProvider,
  signInWithPopup,
  signInWithEmailAndPassword,
  createUserWithEmailAndPassword,
  signOut as firebaseSignOut,
  onAuthStateChanged,
  User as FirebaseUser,
  updateProfile
} from 'firebase/auth';

// Your web app's Firebase configuration
const firebaseConfig = {
  apiKey: import.meta.env.VITE_FIREBASE_API_KEY || "AIzaSyCiwk_CciueyjLbTMwMTPDgEKqV6ohFb4Y",
  authDomain: import.meta.env.VITE_FIREBASE_AUTH_DOMAIN || "voidcloude.firebaseapp.com",
  projectId: import.meta.env.VITE_FIREBASE_PROJECT_ID || "voidcloude",
  storageBucket: import.meta.env.VITE_FIREBASE_STORAGE_BUCKET || "voidcloude.firebasestorage.app",
  messagingSenderId: import.meta.env.VITE_FIREBASE_MESSAGING_SENDER_ID || "46606010545",
  appId: import.meta.env.VITE_FIREBASE_APP_ID || "1:46606010545:web:3d99b540816edf48677a90"
};

export const isFirebaseConfigured = Boolean(
  firebaseConfig.apiKey &&
  firebaseConfig.apiKey !== '' &&
  firebaseConfig.projectId &&
  firebaseConfig.projectId !== ''
);

let app: FirebaseApp | null = null;
let auth: Auth | null = null;
let googleProvider: GoogleAuthProvider | null = null;

try {
  app = getApps().length > 0 ? getApp() : initializeApp(firebaseConfig);
  auth = getAuth(app);
  googleProvider = new GoogleAuthProvider();
  googleProvider.setCustomParameters({ prompt: 'select_account' });
  console.log('[Firebase] Connected successfully to project "voidcloude"');
} catch (err) {
  console.warn('[Firebase] Initialization warning:', err);
}

export { app, auth, googleProvider };
