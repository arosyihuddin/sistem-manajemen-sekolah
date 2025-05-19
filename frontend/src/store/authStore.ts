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
          const apiResponse = await authApi.login(username, password);
          const data = apiResponse.data; // Ambil data dari apiResponse

          if (data && data.token) {
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
          } else {
            // Log error jika respons tidak sesuai harapan
            console.error('Invalid login response:', apiResponse);
            throw new Error('Login response did not include token or user data');
          }
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
          const apiResponse = await authApi.register(username, password, email, role);
          const data = apiResponse.data; // Ambil data dari apiResponse

          if (data && data.token) {
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
          } else {
            console.error('Invalid registration response:', apiResponse);
            throw new Error('Registration response did not include token or user data');
          }
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
          const apiResponse = await authApi.getMe();
          const data = apiResponse.data; // Ambil data dari apiResponse

          if (data && data.id) { // Check if user data is valid
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
          } else {
            console.error('Invalid getMe response:', apiResponse);
            throw new Error('GetMe response did not include valid user data');
          }
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