import { create } from 'zustand';
import { persist } from 'zustand/middleware';

const useUserStore = create(
  persist(
    (set) => ({
      user: null,
      hooks: [],
      
      setUser: (userData) => set({ user: userData }),
      clearUser: () => set({ user: null, hooks: [] }),
      
      addHook: (hook) => set((state) => ({
        hooks: [...state.hooks, hook]
      })),
      
      removeHook: (hookId) => set((state) => ({
        hooks: state.hooks.filter(hook => hook.id !== hookId)
      }))
    }),
    {
      name: 'adspark-user-storage',
      getStorage: () => localStorage
    }
  )
);

export default useUserStore;
