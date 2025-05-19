import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import * as authApi from '../api/auth.api';

interface User {
  id: string;
  username: string;
  email: string;
  role: string;
}

interface AuthState {
  user: User | null;
  token: string | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  error: string | null;
  login: (username: string, password: string) => Promise<void>;
  register: (username: string, password: string, email: string, role?: string) => Promise<void>;
  logout: () => Promise<void>;
  checkAuth: () => Promise<void>;
}

export const useAuthStore = create<AuthState>()(
  persist(
    (set, get) => ({
      user: null,
      token: null,
      isAuthenticated: false,
      isLoading: false,
      error: null,
      
      login: async (username: string, password: string) => {
        try {
          set({ isLoading: true, error: null });
          const response = await authApi.login(username, password);
          const { data } = response;
          
          localStorage.setItem('token', data.token);
          
          set({
            user: {
              id: data.id,
              username: data.username,
              email: data.email,
              role: data.role
            },
            token: data.token,
            isAuthenticated: true,
            isLoading: false
          });
        } catch (error: any) {
          set({
            isLoading: false,
            error: error.response?.data?.message || 'Login failed'
          });
          throw error;
        }
      },
      
      register: async (username: string, password: string, email: string, role?: string) => {
        try {
          set({ isLoading: true, error: null });
          const response = await authApi.register(username, password, email, role);
          const { data } = response;
          
          localStorage.setItem('token', data.token);
          
          set({
            user: {
              id: data.id,
              username: data.username,
              email: data.email,
              role: data.role
            },
            token: data.token,
            isAuthenticated: true,
            isLoading: false
          });
        } catch (error: any) {
          set({
            isLoading: false,
            error: error.response?.data?.message || 'Registration failed'
          });
          throw error;
        }
      },
      
      logout: async () => {
        try {
          set({ isLoading: true });
          
          if (get().isAuthenticated) {
            await authApi.logout();
          }
          
          localStorage.removeItem('token');
          
          set({
            user: null,
            token: null,
            isAuthenticated: false,
            isLoading: false
          });
        } catch (error) {
          set({ isLoading: false });
          // Force logout even if API fails
          localStorage.removeItem('token');
          set({
            user: null,
            token: null,
            isAuthenticated: false
          });
        }
      },
      
      checkAuth: async () => {
        const token = localStorage.getItem('token');
        
        if (!token) {
          set({ isAuthenticated: false, user: null, token: null });
          return;
        }
        
        try {
          set({ isLoading: true });
          const response = await authApi.getMe();
          const { data } = response;
          
          set({
            user: {
              id: data.id,
              username: data.username,
              email: data.email,
              role: data.role
            },
            isAuthenticated: true,
            isLoading: false
          });
        } catch (error) {
          localStorage.removeItem('token');
          set({
            user: null,
            token: null,
            isAuthenticated: false,
            isLoading: false
          });
        }
      }
    }),
    {
      name: 'auth-storage',
      partialize: (state) => ({ user: state.user, token: state.token, isAuthenticated: state.isAuthenticated })
    }
  )
);