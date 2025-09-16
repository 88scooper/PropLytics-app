"use client";

import { createContext, useCallback, useContext, useEffect, useMemo, useState } from "react";
import { auth } from "@/lib/firebase";
import {
  onAuthStateChanged,
  signInWithEmailAndPassword,
  createUserWithEmailAndPassword,
  signOut,
} from "firebase/auth";

const AuthContext = createContext({
  user: null,
  loading: true,
  signUp: async () => {},
  logIn: async () => {},
  logOut: async () => {},
});

export function useAuth() {
  return useContext(AuthContext);
}

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Temporarily provide a mock user for demo access
    const mockUser = {
      uid: 'demo-user',
      email: 'demo@proplytics.com',
      displayName: 'Demo User'
    };
    
    setUser(mockUser);
    setLoading(false);
    
    // Keep original Firebase logic commented for later restoration
    /*
    // Check if Firebase auth is available
    if (!auth) {
      console.warn('Firebase auth not available. Using mock authentication.');
      setLoading(false);
      return;
    }

    const unsub = onAuthStateChanged(auth, (nextUser) => {
      setUser(nextUser);
      setLoading(false);
    });
    return () => unsub();
    */
  }, []);

  const signUp = useCallback(async (email, password) => {
    if (!auth) {
      throw new Error('Firebase auth not available');
    }
    const cred = await createUserWithEmailAndPassword(auth, email, password);
    return cred.user;
  }, []);

  const logIn = useCallback(async (email, password) => {
    if (!auth) {
      throw new Error('Firebase auth not available');
    }
    const cred = await signInWithEmailAndPassword(auth, email, password);
    return cred.user;
  }, []);

  const logOut = useCallback(async () => {
    if (!auth) {
      throw new Error('Firebase auth not available');
    }
    await signOut(auth);
  }, []);

  const value = useMemo(() => ({ user, loading, signUp, logIn, logOut }), [user, loading, signUp, logIn, logOut]);

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function RequireAuth({ children }) {
  // Temporarily allow access without authentication
  return children;
}


