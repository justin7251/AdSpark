import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { onAuthStateChanged } from 'firebase/auth';
import { auth } from '../lib/firebaseConfig';
import { fetchUserTokenBalance, updateUserTokens } from '../lib/firebaseService';

const useUserStore = create(
  persist(
    (set, get) => ({
      user: null,
      tokens: null,
      profile: null,
      isLoading: true,

      initializeAuth: () => {
        const unsubscribe = onAuthStateChanged(auth, async (firebaseUser) => {
          if (firebaseUser) {
            try {
              // Always fetch the latest token balance from Firebase
              const currentTokens = await fetchUserTokenBalance(firebaseUser.uid);
              set({ 
                user: firebaseUser,
                tokens: currentTokens, // Use the fetched token value
                isLoading: false 
              });
            } catch (error) {
              console.error('Error fetching tokens:', error);
              set({ 
                user: firebaseUser,
                tokens: 0, // Default to 0 if fetch fails
                isLoading: false 
              });
            }
          } else {
            // Clear everything when logged out
            set({ 
              user: null,
              tokens: null,
              profile: null,
              isLoading: false 
            });
          }
        });
        return unsubscribe;
      },

      setTokens: async (newTokens) => {
        const state = get();
        if (state.user?.uid) {
          try {
            // Update tokens in Firebase first
            await updateUserTokens(state.user.uid, newTokens);
            // Only update local state after successful Firebase update
            set({ tokens: newTokens });
          } catch (error) {
            console.error('Error updating tokens:', error);
            // Revert to the actual token balance from Firebase if update fails
            const currentTokens = await fetchUserTokenBalance(state.user.uid);
            set({ tokens: currentTokens });
          }
        }
      },

      logout: async () => {
        try {
          await auth.signOut();
          // Clear all state
          set({
            user: null,
            tokens: null,
            profile: null,
            isLoading: false
          });
          // Clear local storage
          if (typeof window !== 'undefined') {
            localStorage.removeItem('user-storage');
          }
        } catch (error) {
          console.error('Logout error:', error);
        }
      },

      setUser: async (userData) => {
        set({ user: userData });
        if (userData?.uid) {
          try {
            const tokens = await fetchUserTokenBalance(userData.uid);
            set({ tokens });
          } catch (error) {
            console.error('Error fetching initial token balance:', error);
            set({ tokens: 0 });
          }
        }
      },

      fetchTokenBalance: async (userId) => {
        try {
          const tokens = await fetchUserTokenBalance(userId);
          set({ tokens });
          return tokens;
        } catch (error) {
          console.error('Error fetching token balance:', error);
          return 0;
        }
      },

      updateTokens: async (amount) => {
        const { user } = get();
        if (!user || !user.uid) {
          console.error('No user found to update tokens');
          return;
        }

        try {
          const newBalance = await updateUserTokens(user.uid, amount);
          set({ tokens: newBalance });
          return newBalance;
        } catch (error) {
          console.error('Failed to update tokens:', error);
        }
      },

      hasEnoughTokens: (requiredTokens) => {
        const currentTokens = get().tokens;
        return currentTokens >= requiredTokens;
      },

      login: async (email, password) => {
        try {
          // Your login logic here
          // Make sure to properly set the user data
          set({ user: userData });
        } catch (error) {
          throw error;
        }
      },

      isAuthenticated: () => {
        const state = get();
        return !!state.user;
      },
    }),
    {
      name: 'user-storage',
      getStorage: () => localStorage,
      // Only persist necessary fields
      partialize: (state) => ({
        user: state.user,
        tokens: state.tokens,
        profile: state.profile,
      }),
    }
  )
);

export default useUserStore;
