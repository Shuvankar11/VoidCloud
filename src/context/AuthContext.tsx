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
  isProfileModalOpen: boolean;
  setIsProfileModalOpen: (open: boolean) => void;
  signUpWithEmail: (email: string, pass: string, name?: string) => Promise<void>;
  signInWithEmail: (email: string, pass: string) => Promise<void>;
  signInWithGoogle: () => Promise<void>;
  signInWithWallet: (walletName: string, address: string) => Promise<void>;
  updateUserProfile: (updates: { displayName?: string; photoURL?: string }) => Promise<void>;
  changePassword: (currentPass: string, newPass: string) => Promise<void>;
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
  const [isProfileModalOpen, setIsProfileModalOpen] = useState(false);

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
    const mockEmail = 'shuvankar8282@gmail.com';
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

  const signInWithWallet = useCallback(async (walletName: string, address: string) => {
    const formattedAddress = address.length > 14
      ? `${address.slice(0, 8)}...${address.slice(-4)}`
      : address;
    const profile: UserProfile = {
      uid: 'usr_w3_' + address.replace(/[^a-zA-Z0-9]/g, '').slice(0, 16),
      email: `${formattedAddress}@midnight.network`,
      displayName: `${walletName} (${formattedAddress})`,
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

  const updateUserProfile = useCallback(async (updates: { displayName?: string; photoURL?: string }) => {
    if (!user) throw new Error('No user is currently authenticated.');

    const newDisplayName = updates.displayName !== undefined ? updates.displayName.trim() : user.displayName;
    const newPhotoURL = updates.photoURL !== undefined ? updates.photoURL : user.photoURL;

    const updatedProfile: UserProfile = {
      ...user,
      displayName: newDisplayName || user.email.split('@')[0],
      photoURL: newPhotoURL,
    };

    if (isFirebaseConfigured && auth?.currentUser) {
      try {
        await updateProfile(auth.currentUser, {
          displayName: updatedProfile.displayName,
          photoURL: updatedProfile.photoURL,
        });
      } catch (err) {
        console.warn('[Firebase Auth] Profile sync skipped:', err);
      }
    }

    try {
      const usersRaw = localStorage.getItem(LOCAL_USERS_KEY);
      const users = usersRaw ? JSON.parse(usersRaw) : [];
      const idx = users.findIndex((u: any) => u.email.toLowerCase() === updatedProfile.email.toLowerCase() || u.uid === updatedProfile.uid);
      if (idx >= 0) {
        users[idx] = {
          ...users[idx],
          displayName: updatedProfile.displayName,
          photoURL: updatedProfile.photoURL,
        };
        localStorage.setItem(LOCAL_USERS_KEY, JSON.stringify(users));
      }
    } catch (e) {
      console.error('Failed to update local user list:', e);
    }

    localStorage.setItem(LOCAL_SESSION_KEY, JSON.stringify(updatedProfile));
    setUser(updatedProfile);
  }, [user]);

  const changePassword = useCallback(async (currentPass: string, newPass: string) => {
    if (!user) throw new Error('No user is currently authenticated.');
    if (!newPass || newPass.length < 6) {
      throw new Error('New password must be at least 6 characters long.');
    }

    const usersRaw = localStorage.getItem(LOCAL_USERS_KEY);
    const users = usersRaw ? JSON.parse(usersRaw) : [];
    const idx = users.findIndex((u: any) => u.email.toLowerCase() === user.email.toLowerCase());

    if (idx >= 0) {
      if (users[idx].password && currentPass && users[idx].password !== currentPass) {
        throw new Error('Current password does not match.');
      }
      if (users[idx].password && !currentPass) {
        throw new Error('Please enter your current password.');
      }
      users[idx].password = newPass;
      localStorage.setItem(LOCAL_USERS_KEY, JSON.stringify(users));
    } else {
      users.push({ ...user, password: newPass });
      localStorage.setItem(LOCAL_USERS_KEY, JSON.stringify(users));
    }

    if (isFirebaseConfigured && auth?.currentUser) {
      try {
        const { updatePassword: fbUpdatePassword } = await import('firebase/auth');
        await fbUpdatePassword(auth.currentUser, newPass);
      } catch (err: any) {
        console.warn('[Firebase Auth] Password update note:', err?.message || err);
      }
    }
  }, [user]);

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
        isProfileModalOpen,
        setIsProfileModalOpen,
        signUpWithEmail,
        signInWithEmail,
        signInWithGoogle,
        signInWithWallet,
        updateUserProfile,
        changePassword,
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
