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
import { doc, setDoc, getFirestore } from 'firebase/firestore';
import { auth, db } from '../lib/firebaseConfig';
import useUserStore from '../stores/userStore';
import { useRouter } from 'next/navigation';
import { createUserProfile, updateUserLastLogin } from '../lib/firebaseService';

export function useAuth() {
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);
  const { setUser, clearUser, logout: logoutStore } = useUserStore();
  const router = useRouter();

  const createUserDocument = async (user) => {
    try {
      console.log('Creating user document for:', user.uid);
      console.log('Firestore DB:', db);

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

      console.log('User data to be saved:', userData);

      await setDoc(userRef, userData, { merge: true });
      
      console.log('User document created successfully');
    } catch (error) {
      console.error('Error creating user document:', error);
      throw error;
    }
  };

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (currentUser) => {
      try {
        if (currentUser) {
          // Update last login timestamp
          await updateUserLastLogin(currentUser.uid);
          
          console.log('Auth state changed, user found:', currentUser.uid);
          
          // Create or update user document
          await createUserDocument(currentUser);
          
          const userData = {
            uid: currentUser.uid,
            email: currentUser.email,
            displayName: currentUser.displayName,
            photoURL: currentUser.photoURL
          };
          
          setUser(userData);
        } else {
          console.log('No user logged in');
          logoutStore();
        }
      } catch (error) {
        console.error('Auth state change error:', error);
      } finally {
        setIsLoading(false);
      }
    });

    return () => unsubscribe();
  }, []);

  const signup = async (email, password, displayName) => {
    setIsLoading(true);
    setError(null);  // Reset previous errors

    try {
      const userCredential = await createUserWithEmailAndPassword(auth, email, password);
      
      await updateProfile(userCredential.user, {
        displayName: displayName
      });

      router.push('/dashboard');
      return userCredential.user;
    } catch (err) {
      // Detailed error handling
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

      console.error('Signup Error:', {
        message: errorMessage,
        code: err.code
      });

      setError(errorMessage);
      throw new Error(errorMessage);
    } finally {
      setIsLoading(false);
    }
  };

  const login = async (email, password) => {
    setIsLoading(true);
    setError(null);  // Reset previous errors

    try {
      // Validate input
      if (!email || !password) {
        throw new Error('Email and password are required');
      }

      const userCredential = await signInWithEmailAndPassword(auth, email, password);
      
      // Additional user data setting
      setUser({
        uid: userCredential.user.uid,
        email: userCredential.user.email,
        displayName: userCredential.user.displayName || 'AdSpark User'
      });

      router.push('/dashboard');
      return userCredential.user;
    } catch (err) {
      // Detailed error handling
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

      console.error('Login Error:', {
        message: errorMessage,
        code: err.code
      });

      setError(errorMessage);
      throw new Error(errorMessage);
    } finally {
      setIsLoading(false);
    }
  };

  const signInWithGoogle = async () => {
    setIsLoading(true);
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
      setIsLoading(false);
    }
  };

  const signOutUser = async () => {
    setIsLoading(true);
    setError(null);
    
    try {
      await signOut(auth);
      logoutStore();
      router.push('/login');
    } catch (error) {
      console.error('Sign Out Error:', error);
      setError(error.message);
    } finally {
      setIsLoading(false);
    }
  };

  // Password Reset Method
  const resetPassword = async (email) => {
    setIsLoading(true);
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
      setIsLoading(false);
    }
  };

  return { 
    signup, 
    login, 
    signOutUser, 
    signInWithGoogle,
    resetPassword,
    isLoading, 
    error,
    setIsLoading 
  };
}