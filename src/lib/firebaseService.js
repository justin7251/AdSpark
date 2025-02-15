import { getFirestore, collection, addDoc, query, where, getDocs, orderBy, limit, doc, updateDoc, setDoc, serverTimestamp, getDoc } from 'firebase/firestore';
import { app } from './firebaseConfig';

const db = getFirestore(app);

// User Profile Management

// Fetch User Profile
export const getUserProfile = async (userId) => {
  try {
    const userRef = doc(db, 'users', userId);
    const userDoc = await getDoc(userRef);

    if (!userDoc.exists()) {
      return null;
    }

    return {
      id: userDoc.id,
      ...userDoc.data(),
      createdAt: userDoc.data().createdAt?.toDate(),
      lastLogin: userDoc.data().lastLogin?.toDate()
    };
  } catch (error) {
    console.error('Error fetching user profile:', error);
    throw error;
  }
};

// Update User Profile
export const updateUserProfile = async (userId, profileData) => {
  try {
    const userRef = doc(db, 'users', userId);
    
    // Validate and sanitize input
    const updateData = {
      ...(profileData.displayName && { displayName: profileData.displayName }),
      ...(profileData.email && { email: profileData.email }),
      ...(profileData.photoURL && { photoURL: profileData.photoURL }),
      ...(profileData.bio && { bio: profileData.bio }),
      updatedAt: serverTimestamp()
    };

    await updateDoc(userRef, updateData);

    return await getUserProfile(userId);
  } catch (error) {
    console.error('Error updating user profile:', error);
    throw error;
  }
};

// Create Detailed User Profile
export const createDetailedUserProfile = async (userId, userData) => {
  try {
    const userRef = doc(db, 'users', userId);
    
    const profileData = {
      // Basic user information
      displayName: userData.displayName || '',
      email: userData.email || '',
      photoURL: userData.photoURL || '',
      
      // Additional profile details
      bio: userData.bio || '',
      location: userData.location || '',
      
      // Account metadata
      createdAt: serverTimestamp(),
      lastLogin: serverTimestamp(),
      
      // Initial account settings
      accountType: 'free',
      tokens: 50, // Initial free tokens
      
      // Marketing preferences
      marketingOptIn: userData.marketingOptIn || false,
      
      // Social links (optional)
      socialLinks: {
        twitter: userData.twitter || '',
        linkedin: userData.linkedin || '',
        website: userData.website || ''
      },
      
      // Tracking and analytics
      signupSource: userData.signupSource || 'direct',
      referralCode: userData.referralCode || null
    };

    await setDoc(userRef, profileData, { merge: true });

    return await getUserProfile(userId);
  } catch (error) {
    console.error('Error creating detailed user profile:', error);
    throw error;
  }
};

// Update User Preferences
export const updateUserPreferences = async (userId, preferences) => {
  try {
    const userRef = doc(db, 'users', userId);
    
    const updateData = {
      ...(preferences.marketingOptIn !== undefined && { marketingOptIn: preferences.marketingOptIn }),
      ...(preferences.accountType && { accountType: preferences.accountType }),
      ...(preferences.socialLinks && { socialLinks: preferences.socialLinks }),
      preferencesUpdatedAt: serverTimestamp()
    };

    await updateDoc(userRef, updateData);

    return await getUserProfile(userId);
  } catch (error) {
    console.error('Error updating user preferences:', error);
    throw error;
  }
};

// Check Username Availability
export const checkUsernameAvailability = async (username) => {
  try {
    // This would require a cloud function or additional logic
    // to check username uniqueness across the database
    const usernamesRef = collection(db, 'usernames');
    const usernameDoc = doc(usernamesRef, username);
    const docSnap = await getDoc(usernameDoc);

    return !docSnap.exists();
  } catch (error) {
    console.error('Error checking username availability:', error);
    throw error;
  }
};

// Fetch User Token Balance
export const fetchUserTokenBalance = async (userId) => {
  try {
    const userRef = doc(db, 'users', userId);
    const userDoc = await getDoc(userRef);
    
    if (userDoc.exists()) {
      const tokens = userDoc.data().tokens || 0;
      return tokens;
    }
    return 0;
  } catch (error) {
    console.error('Error fetching token balance:', error);
    throw error;
  }
};

// Update User Tokens
export const updateUserTokens = async (userId, tokenChange) => {
  try {
    const userRef = doc(db, 'users', userId);
    
    // Fetch current tokens first
    const userDoc = await getDoc(userRef);
    if (!userDoc.exists()) {
      throw new Error('User not found');
    }
    
    const currentTokens = userDoc.data().tokens || 0;
    const newTokenBalance = Math.max(0, currentTokens + tokenChange);
    
    await updateDoc(userRef, {
      tokens: newTokenBalance,
      lastTokenUpdate: serverTimestamp()
    });
    
    return newTokenBalance;
  } catch (error) {
    console.error('Error updating user tokens:', error);
    throw error;
  }
};

// Update User Last Login
export const updateUserLastLogin = async (userId) => {
  try {
    const userRef = doc(db, 'users', userId);
    await updateDoc(userRef, {
      lastLogin: serverTimestamp()
    });
  } catch (error) {
    console.error('Error updating last login:', error);
  }
};

// Log Generated Hooks
export const logGeneratedHook = async (userId, hookData) => {
  try {
    const hooksCollection = collection(db, 'generated_hooks');
    return await addDoc(hooksCollection, {
      userId,
      ...hookData,
      timestamp: serverTimestamp()
    });
  } catch (error) {
    console.error('Error logging generated hook:', error);
    throw error;
  }
};

// Log User Searches
export const logUserSearch = async (userId, searchData) => {
  try {
    const searchCollection = collection(db, 'user_searches');
    return await addDoc(searchCollection, {
      userId,
      ...searchData,
      timestamp: serverTimestamp()
    });
  } catch (error) {
    console.error('Error logging user search:', error);
    throw error;
  }
};

// Log User Purchases
export const logUserPurchase = async (userId, purchaseData) => {
  try {
    const purchasesCollection = collection(db, 'user_purchases');
    return await addDoc(purchasesCollection, {
      userId,
      ...purchaseData,
      timestamp: serverTimestamp(),
      status: 'completed'
    });
  } catch (error) {
    console.error('Error logging user purchase:', error);
    throw error;
  }
};

export const saveUserSearch = async (userId, searchData) => {
  try {
    if (!userId) {
      console.error('No user ID provided');
      throw new Error('User ID is required');
    }

    const searchCollection = collection(db, 'user_searches');
    return await addDoc(searchCollection, {
      userId,
      ...searchData,
      timestamp: new Date()
    });
  } catch (error) {
    console.error('Error saving search:', error);
    throw error;
  }
};

export const savePurchase = async (userId, purchaseDetails) => {
  try {
    if (!userId) {
      console.error('No user ID provided');
      throw new Error('User ID is required');
    }

    const purchaseCollection = collection(db, 'user_purchases');
    return await addDoc(purchaseCollection, {
      userId,
      ...purchaseDetails,
      timestamp: new Date()
    });
  } catch (error) {
    console.error('Error saving purchase:', error);
    throw error;
  }
};

export const getUserSearchHistory = async (userId, limitCount = 50) => {
  try {
    const searchCollection = collection(db, 'user_searches');
    const q = query(
      searchCollection, 
      where('userId', '==', userId),
      orderBy('timestamp', 'desc'),
      limit(limitCount)
    );

    const querySnapshot = await getDocs(q);
    return querySnapshot.docs.map(doc => {
      const data = doc.data();
      
      // Handle different timestamp formats
      let timestamp;
      if (data.timestamp?.toDate) {
        timestamp = data.timestamp.toDate();
      } else if (data.timestamp instanceof Date) {
        timestamp = data.timestamp;
      } else if (typeof data.timestamp === 'string') {
        timestamp = new Date(data.timestamp);
      } else if (typeof data.timestamp === 'number') {
        timestamp = new Date(data.timestamp);
      } else {
        timestamp = new Date();
      }

      return {
        id: doc.id,
        ...data,
        timestamp: timestamp
      };
    });
  } catch (error) {
    console.error('Error fetching search history:', error);
    throw error;
  }
};

export const getUserPurchaseHistory = async (userId, limitCount = 50) => {
  try {
    const purchaseCollection = collection(db, 'user_purchases');
    const q = query(
      purchaseCollection, 
      where('userId', '==', userId),
      orderBy('timestamp', 'desc'),
      limit(limitCount)
    );

    const querySnapshot = await getDocs(q);
    return querySnapshot.docs.map(doc => ({
      id: doc.id,
      ...doc.data(),
      timestamp: doc.data().timestamp?.toDate()
    }));
  } catch (error) {
    console.error('Error fetching purchase history:', error);
    throw error;
  }
};

export const getUserGeneratedHooks = async (userId, limitCount = 50) => {
  try {
    const hooksCollection = collection(db, 'generated_hooks');
    const q = query(
      hooksCollection, 
      where('userId', '==', userId),
      orderBy('timestamp', 'desc'),
      limit(limitCount)
    );

    const querySnapshot = await getDocs(q);
    return querySnapshot.docs.map(doc => {
      const data = doc.data();
      
      console.log('Raw Hook Data:', {
        id: doc.id,
        timestamp: data.timestamp,
        timestampType: typeof data.timestamp,
        timestampConstructor: data.timestamp?.constructor?.name
      });

      // Comprehensive timestamp handling
      let timestamp;
      try {
        if (data.timestamp?.toDate && typeof data.timestamp.toDate === 'function') {
          // Firestore Timestamp
          timestamp = data.timestamp.toDate();
        } else if (data.timestamp instanceof Date) {
          // Already a Date object
          timestamp = data.timestamp;
        } else if (typeof data.timestamp === 'string') {
          // Try parsing string timestamp
          timestamp = new Date(data.timestamp);
        } else if (typeof data.timestamp === 'number') {
          // Timestamp as milliseconds
          timestamp = new Date(data.timestamp);
        } else if (data.timestamp && data.timestamp.seconds) {
          // Handle Firestore timestamp-like object
          timestamp = new Date(data.timestamp.seconds * 1000);
        } else {
          // Fallback to current time
          timestamp = new Date();
          console.warn('Fallback timestamp used', { originalTimestamp: data.timestamp });
        }
      } catch (timestampError) {
        console.error('Timestamp conversion error:', {
          error: timestampError,
          originalTimestamp: data.timestamp
        });
        timestamp = new Date();
      }

      return {
        id: doc.id,
        ...data,
        timestamp: timestamp
      };
    });
  } catch (error) {
    console.error('Error fetching generated hooks:', error);
    
    // Enhanced error logging
    if (error.code === 'failed-precondition') {
      console.error('Index is still building. Please wait and retry.');
    }
    
    throw error;
  }
};
