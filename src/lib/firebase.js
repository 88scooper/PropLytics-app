import { initializeApp, getApps, getApp } from "firebase/app";
import { getAuth } from "firebase/auth";
import { getFirestore } from "firebase/firestore";

// Configure via NEXT_PUBLIC_* env vars in production
const firebaseConfig = {
  apiKey: process.env.NEXT_PUBLIC_FIREBASE_API_KEY || "AIzaSyC8r2mzEen04HvhTt9EWY24rjmUEuKItHw",
  authDomain: process.env.NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN || "proplytics-74c6c.firebaseapp.com",
  projectId: process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID || "proplytics-74c6c",
  storageBucket: process.env.NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET || "proplytics-74c6c.firebasestorage.app",
  messagingSenderId: process.env.NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID || "913155297914",
  appId: process.env.NEXT_PUBLIC_FIREBASE_APP_ID || "1:913155297914:web:ac22152813db57488ee1c3",
};

// Check if we have valid configuration
const isValidConfig = firebaseConfig.apiKey && 
                     firebaseConfig.authDomain && 
                     firebaseConfig.projectId && 
                     firebaseConfig.storageBucket && 
                     firebaseConfig.messagingSenderId && 
                     firebaseConfig.appId;

let app;
let auth;
let db;

if (isValidConfig) {
  try {
    app = getApps().length ? getApp() : initializeApp(firebaseConfig);
    auth = getAuth(app);
    db = getFirestore(app);
  } catch (error) {
    console.error('Firebase initialization error:', error);
    // Create mock objects for development
    app = null;
    auth = null;
    db = null;
  }
} else {
  console.warn('Firebase configuration is incomplete. Using mock objects.');
  app = null;
  auth = null;
  db = null;
}

export { auth, db };
export default app;


