import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { fetchUserTokenBalance, updateUserTokens } from '../lib/firebaseService';

const useUserStore = create(persist(
  (set, get) => ({
    user: null,
    tokens: 50,
    profile: null,

    setUser: (userData) => set({
      user: userData,
      tokens: 50
    }),

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

    logout: () => set({ 
      user: null, 
      tokens: 0, 
      profile: null 
    })
  }),
  {
    name: 'user-storage',
    getStorage: () => localStorage
  }
));

export default useUserStore;
