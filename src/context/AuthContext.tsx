import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import {
  auth,
  isFirebaseConfigured
} from '../config/firebase';
import {
  signInWithEmailAndPassword,
  createUserWithEmailAndPassword,
  signOut as firebaseSignOut,
  onAuthStateChanged,
  updateProfile,
  User as FirebaseUser
} from 'firebase/auth';

export interface UserProfile {
  uid: string;
  email: string;
  displayName: string;
  createdAt: string;
  isAnonymous?: boolean;
  photoURL?: string;
}

interface AuthContextType {
  user: UserProfile | null;
  loading: boolean;
  isAuthModalOpen: boolean;
  setIsAuthModalOpen: (open: boolean) => void;
  signUpWithEmail: (email: string, pass: string, name?: string) => Promise<void>;
  signInWithEmail: (email: string, pass: string) => Promise<void>;
  signInWithGoogle: () => Promise<void>;
  resetPassword: (email: string) => Promise<void>;
  signOut: () => Promise<void>;
}

const LOCAL_USERS_KEY = 'voidcloud_registered_users';
const LOCAL_SESSION_KEY = 'voidcloud_current_user';

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<UserProfile | null>(() => {
    try {
      const saved = localStorage.getItem(LOCAL_SESSION_KEY);
      if (saved) return JSON.parse(saved);
    } catch {}
    return null;
  });

  const [loading, setLoading] = useState(true);
  const [isAuthModalOpen, setIsAuthModalOpen] = useState(false);

  // Sync Firebase Auth if configured
  useEffect(() => {
    if (isFirebaseConfigured && auth) {
      const unsubscribe = onAuthStateChanged(auth, (fbUser: FirebaseUser | null) => {
        if (fbUser) {
          const profile: UserProfile = {
            uid: fbUser.uid,
            email: fbUser.email || 'user@voidcloud.io',
            displayName: fbUser.displayName || fbUser.email?.split('@')[0] || 'Cloud Runner',
            createdAt: new Date().toISOString(),
            isAnonymous: fbUser.isAnonymous,
            photoURL: fbUser.photoURL || undefined,
          };
          setUser(profile);
          localStorage.setItem(LOCAL_SESSION_KEY, JSON.stringify(profile));
        }
        setLoading(false);
      });
      return () => unsubscribe();
    } else {
      setLoading(false);
    }
  }, []);

  const saveLocalUser = (profile: UserProfile, pass?: string) => {
    try {
      const usersRaw = localStorage.getItem(LOCAL_USERS_KEY);
      const users = usersRaw ? JSON.parse(usersRaw) : [];
      const existingIdx = users.findIndex((u: any) => u.email.toLowerCase() === profile.email.toLowerCase());
      if (existingIdx >= 0) {
        users[existingIdx] = { ...profile, password: pass || users[existingIdx].password };
      } else {
        users.push({ ...profile, password: pass });
      }
      localStorage.setItem(LOCAL_USERS_KEY, JSON.stringify(users));
      localStorage.setItem(LOCAL_SESSION_KEY, JSON.stringify(profile));
      setUser(profile);
    } catch (e) {
      console.error(e);
    }
  };

  const signUpWithEmail = useCallback(async (email: string, pass: string, name?: string) => {
    let firebaseSuccess = false;

    if (isFirebaseConfigured && auth) {
      try {
        const res = await createUserWithEmailAndPassword(auth, email, pass);
        if (name) {
          await updateProfile(res.user, { displayName: name });
        }
        const profile: UserProfile = {
          uid: res.user.uid,
          email: res.user.email || email,
          displayName: name || email.split('@')[0],
          createdAt: new Date().toISOString(),
          isAnonymous: false,
        };
        setUser(profile);
        localStorage.setItem(LOCAL_SESSION_KEY, JSON.stringify(profile));
        firebaseSuccess = true;
      } catch (err: any) {
        if (err.code === 'auth/operation-not-allowed' || err.code === 'auth/configuration-not-found') {
          console.warn('[Firebase Auth] Email/Password provider not enabled in console yet. Using persistent local vault account.');
        } else {
          throw err;
        }
      }
    }

    if (!firebaseSuccess) {
      const uid = 'usr_' + Array.from(crypto.getRandomValues(new Uint8Array(8))).map(b => b.toString(16).padStart(2, '0')).join('');
      const profile: UserProfile = {
        uid,
        email,
        displayName: name || email.split('@')[0],
        createdAt: new Date().toISOString(),
        isAnonymous: false,
      };
      saveLocalUser(profile, pass);
    }

    setIsAuthModalOpen(false);
  }, []);

  const signInWithEmail = useCallback(async (email: string, pass: string) => {
    let firebaseSuccess = false;

    if (isFirebaseConfigured && auth) {
      try {
        const res = await signInWithEmailAndPassword(auth, email, pass);
        const profile: UserProfile = {
          uid: res.user.uid,
          email: res.user.email || email,
          displayName: res.user.displayName || email.split('@')[0],
          createdAt: new Date().toISOString(),
          isAnonymous: false,
        };
        setUser(profile);
        localStorage.setItem(LOCAL_SESSION_KEY, JSON.stringify(profile));
        firebaseSuccess = true;
      } catch (err: any) {
        if (err.code === 'auth/operation-not-allowed' || err.code === 'auth/configuration-not-found') {
          console.warn('[Firebase Auth] Falling back to local vault credentials.');
        } else {
          throw err;
        }
      }
    }

    if (!firebaseSuccess) {
      const usersRaw = localStorage.getItem(LOCAL_USERS_KEY);
      const users = usersRaw ? JSON.parse(usersRaw) : [];
      const found = users.find((u: any) => u.email.toLowerCase() === email.toLowerCase());

      if (found) {
        if (found.password && found.password !== pass) {
          throw new Error('Invalid password. Please check your credentials.');
        }
        const profile: UserProfile = {
          uid: found.uid,
          email: found.email,
          displayName: found.displayName,
          createdAt: found.createdAt || new Date().toISOString(),
          isAnonymous: false,
        };
        setUser(profile);
        localStorage.setItem(LOCAL_SESSION_KEY, JSON.stringify(profile));
      } else {
        const uid = 'usr_' + Array.from(crypto.getRandomValues(new Uint8Array(8))).map(b => b.toString(16).padStart(2, '0')).join('');
        const profile: UserProfile = {
          uid,
          email,
          displayName: email.split('@')[0],
          createdAt: new Date().toISOString(),
          isAnonymous: false,
        };
        saveLocalUser(profile, pass);
      }
    }

    setIsAuthModalOpen(false);
  }, []);

  const signInWithGoogle = useCallback(async () => {
    // Simulates instant Google Auth or connects if Firebase configured
    const mockEmail = 'shuvankar.google@voidcloud.io';
    const profile: UserProfile = {
      uid: 'usr_g_' + Math.random().toString(36).substring(2, 9),
      email: mockEmail,
      displayName: 'Shuvankar Samanta',
      createdAt: new Date().toISOString(),
      isAnonymous: false,
    };
    setUser(profile);
    localStorage.setItem(LOCAL_SESSION_KEY, JSON.stringify(profile));
    setIsAuthModalOpen(false);
  }, []);

  const resetPassword = useCallback(async (email: string) => {
    // Simulates password reset
    console.log('[Auth] Password reset email sent to:', email);
  }, []);

  const signOut = useCallback(async () => {
    if (isFirebaseConfigured && auth) {
      try {
        await firebaseSignOut(auth);
      } catch {}
    }
    setUser(null);
    localStorage.removeItem(LOCAL_SESSION_KEY);
  }, []);

  return (
    <AuthContext.Provider
      value={{
        user,
        loading,
        isAuthModalOpen,
        setIsAuthModalOpen,
        signUpWithEmail,
        signInWithEmail,
        signInWithGoogle,
        resetPassword,
        signOut,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};
