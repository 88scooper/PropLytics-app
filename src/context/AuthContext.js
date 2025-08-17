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
  const { user, loading } = useAuth();
  
  if (loading) {
    return (
      <div className="min-h-screen grid place-items-center">
        <div className="text-sm text-gray-600 dark:text-gray-300">Loading...</div>
      </div>
    );
  }
  
  // For development, allow access without authentication if Firebase is not available
  if (!user && typeof window !== "undefined") {
    // Check if we're in development mode and Firebase is not available
    if (process.env.NODE_ENV === 'development' && !auth) {
      console.warn('Development mode: Bypassing authentication requirement');
      return children;
    }
    
    window.location.replace("/login");
    return null;
  }
  
  return children;
}


