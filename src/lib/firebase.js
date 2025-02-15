import { initializeApp, getApps, getApp } from 'firebase/app';
import { getAuth } from 'firebase/auth';
import { getFirestore } from 'firebase/firestore';

const firebaseConfig = {
  apiKey: process.env.NEXT_PUBLIC_FIREBASE_API_KEY,
  authDomain: process.env.NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN,
  projectId: process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID,
};

// Singleton Firebase App
const app = !getApps().length ? initializeApp(firebaseConfig) : getApp();

// Firebase Services
const auth = getAuth(app);
const firestore = getFirestore(app);

export { app, auth, firestore };
