'use client';

import { useState, useEffect } from 'react';
import { 
  createUserWithEmailAndPassword,
  signInWithEmailAndPassword,
  signOut,
  updateProfile,
  GoogleAuthProvider,
  signInWithPopup,
  sendPasswordResetEmail,
  onAuthStateChanged
} from 'firebase/auth';
import { doc, setDoc } from 'firebase/firestore';
import { auth, db } from '../lib/firebaseConfig';
import useUserStore from '../stores/userStore';
import { useRouter } from 'next/navigation';
import { createUserProfile, updateUserLastLogin } from '../lib/firebaseService';

export function useAuth() {
  const [authLoading, setAuthLoading] = useState(true);
  const [error, setError] = useState(null);
  const { setUser, clearUser, logout: logoutStore } = useUserStore();
  const router = useRouter();

  const createUserDocument = async (user) => {
    try {
      const userRef = doc(db, 'users', user.uid);
      
      const userData = {
        email: user.email,
        displayName: user.displayName,
        photoURL: user.photoURL,
        createdAt: new Date(),
        lastLogin: new Date(),
        tokens: 50, // Initial free tokens
        role: 'user'
      };

      await setDoc(userRef, userData, { merge: true });
    } catch (error) {
      console.error('Error creating user document:', error);
      throw error;
    }
  };

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (currentUser) => {
      try {
        if (currentUser) {
          await updateUserLastLogin(currentUser.uid);
          await createUserDocument(currentUser);
          
          const userData = {
            uid: currentUser.uid,
            email: currentUser.email,
            displayName: currentUser.displayName,
            photoURL: currentUser.photoURL
          };
          
          setUser(userData);
        } else {
          logoutStore();
        }
      } catch (error) {
        console.error('Auth state change error:', error);
      } finally {
        setAuthLoading(false);
      }
    });

    return () => unsubscribe();
  }, []);

  const signup = async (email, password, displayName) => {
    setAuthLoading(true);
    setError(null);

    try {
      const userCredential = await createUserWithEmailAndPassword(auth, email, password);
      
      await updateProfile(userCredential.user, {
        displayName: displayName
      });

      router.push('/dashboard');
      return userCredential.user;
    } catch (err) {
      let errorMessage = 'Signup failed. Please try again.';

      switch (err.code) {
        case 'auth/email-already-in-use':
          errorMessage = 'This email is already registered. Please login or use a different email.';
          break;
        case 'auth/invalid-email':
          errorMessage = 'Invalid email address format.';
          break;
        case 'auth/weak-password':
          errorMessage = 'Password is too weak. Please use a stronger password.';
          break;
        default:
          errorMessage = err.message;
      }

      setError(errorMessage);
      throw new Error(errorMessage);
    } finally {
      setAuthLoading(false);
    }
  };

  const login = async (email, password) => {
    setAuthLoading(true);
    setError(null);

    try {
      if (!email || !password) {
        throw new Error('Email and password are required');
      }

      const userCredential = await signInWithEmailAndPassword(auth, email, password);
      
      setUser({
        uid: userCredential.user.uid,
        email: userCredential.user.email,
        displayName: userCredential.user.displayName || 'AdSpark User'
      });

      router.push('/dashboard');
      return userCredential.user;
    } catch (err) {
      let errorMessage = 'Login failed. Please try again.';

      switch (err.code) {
        case 'auth/invalid-credential':
          errorMessage = 'Invalid email or password. Please check and try again.';
          break;
        case 'auth/user-not-found':
          errorMessage = 'No account found with this email. Please sign up.';
          break;
        case 'auth/wrong-password':
          errorMessage = 'Incorrect password. Please try again.';
          break;
        case 'auth/too-many-requests':
          errorMessage = 'Too many login attempts. Please try again later.';
          break;
        default:
          errorMessage = err.message;
      }

      setError(errorMessage);
      throw new Error(errorMessage);
    } finally {
      setAuthLoading(false);
    }
  };

  const signInWithGoogle = async () => {
    setAuthLoading(true);
    setError(null);
    
    try {
      const provider = new GoogleAuthProvider();
      const result = await signInWithPopup(auth, provider);
      const user = result.user;
      
      console.log('Google Sign-In successful:', user.uid);
      
      // Ensure user document is created
      await createUserDocument(user);
      
      const userData = {
        uid: user.uid,
        email: user.email,
        displayName: user.displayName,
        photoURL: user.photoURL
      };
      
      setUser(userData);
      router.push('/dashboard');
      return userData;
    } catch (error) {
      console.error('Google Sign-In Error:', error);
      setError(error.message);
      throw error;
    } finally {
      setAuthLoading(false);
    }
  };

  const signOutUser = async () => {
    setAuthLoading(true);
    setError(null);
    
    try {
      await signOut(auth);
      logoutStore();
      router.push('/auth/login');
    } catch (error) {
      console.error('Sign Out Error:', error);
      setError(error.message);
    } finally {
      setAuthLoading(false);
    }
  };

  // Password Reset Method
  const resetPassword = async (email) => {
    setAuthLoading(true);
    setError(null);

    try {
      await sendPasswordResetEmail(auth, email);
      return 'Password reset email sent. Please check your inbox.';
    } catch (err) {
      let errorMessage = 'Password reset failed.';

      switch (err.code) {
        case 'auth/user-not-found':
          errorMessage = 'No account found with this email.';
          break;
        case 'auth/invalid-email':
          errorMessage = 'Invalid email address.';
          break;
        default:
          errorMessage = err.message;
      }

      setError(errorMessage);
      throw new Error(errorMessage);
    } finally {
      setAuthLoading(false);
    }
  };

  return { 
    signup, 
    login, 
    signOutUser, 
    signInWithGoogle,
    resetPassword,
    isLoading: authLoading, 
    error,
  };
}