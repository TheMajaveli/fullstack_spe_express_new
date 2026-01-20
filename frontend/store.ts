
import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { AuthState, User, UserRole } from './types';

interface AppStore extends AuthState {
  theme: 'dark' | 'light';
  setAuth: (data: Partial<AuthState>) => void;
  logout: () => void;
  updateUser: (user: Partial<User>) => void;
  toggleTheme: () => void;
}

export const useStore = create<AppStore>()(
  persist(
    (set) => ({
      user: null,
      accessToken: null,
      refreshToken: null,
      isAuthenticated: false,
      theme: 'dark',

      setAuth: (data) => set((state) => ({ 
        ...state, 
        ...data, 
        isAuthenticated: !!data.accessToken || state.isAuthenticated 
      })),
      
      logout: () => set({ user: null, accessToken: null, refreshToken: null, isAuthenticated: false }),
      
      updateUser: (updatedUser) => set((state) => ({
        user: state.user ? { ...state.user, ...updatedUser } : null
      })),

      toggleTheme: () => set((state) => {
        const newTheme = state.theme === 'dark' ? 'light' : 'dark';
        document.documentElement.className = newTheme;
        return { theme: newTheme };
      }),
    }),
    {
      name: 'cinenoir-v2-storage',
    }
  )
);
