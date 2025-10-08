import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { GoogleUser } from '../services/googleAuthService';

export interface User {
  id: string;
  email: string;
  name: string;
  photoUrl?: string;
  provider?: 'email' | 'google';
}

interface UserState {
  user: User | null;
  isLoggedIn: boolean;
  isGuest: boolean;
  isLoading: boolean;
  error: string | null;
  
  // Auth methods
  login: (email: string, password: string) => Promise<void>;
  register: (name: string, email: string, password: string) => Promise<void>;
  logout: () => void;
  continueAsGuest: () => void;
  resetPassword: (email: string) => Promise<void>;
  clearError: () => void;
  
  // Social login methods
  loginWithGoogle: (googleUser: GoogleUser) => void;
}

export const useUserStore = create<UserState>()(
  persist(
    (set) => ({
      user: null,
      isLoggedIn: false,
      isGuest: false,
      isLoading: false,
      error: null,
      
      login: async (email: string, password: string) => {
        set({ isLoading: true, error: null });
        
        try {
          // Simulating API call
          await new Promise(resolve => setTimeout(resolve, 1000));
          
          // Demo authentication - in a real app, this would call your backend
          if (email === 'demo@example.com' && password === 'password') {
            set({ 
              isLoggedIn: true,
              user: {
                id: '1',
                email: 'demo@example.com',
                name: 'Demo User',
                provider: 'email'
              },
              isLoading: false
            });
          } else {
            set({ 
              error: 'Invalid email or password',
              isLoading: false
            });
          }
        } catch (error) {
          set({ 
            error: error instanceof Error ? error.message : 'An error occurred during login',
            isLoading: false
          });
        }
      },
      
      register: async (name: string, email: string, _password: string) => {
        set({ isLoading: true, error: null });
        
        try {
          // Simulating API call
          await new Promise(resolve => setTimeout(resolve, 1000));
          
          // Demo registration - in a real app, this would call your backend
          set({ 
            isLoggedIn: true,
            user: {
              id: '1',
              email,
              name,
              provider: 'email'
            },
            isLoading: false
          });
        } catch (error) {
          set({ 
            error: error instanceof Error ? error.message : 'An error occurred during registration',
            isLoading: false
          });
        }
      },
      
      // Google login
      loginWithGoogle: (googleUser: GoogleUser) => {
        set({ isLoading: true, error: null });
        
        try {
          // Convert Google user to our app user format
          set({ 
            isLoggedIn: true,
            isGuest: false,
            user: {
              id: googleUser.id,
              email: googleUser.email,
              name: googleUser.name || `${googleUser.givenName || ''} ${googleUser.familyName || ''}`.trim(),
              photoUrl: googleUser.photoUrl,
              provider: 'google'
            },
            isLoading: false
          });
        } catch (error) {
          set({ 
            error: error instanceof Error ? error.message : 'An error occurred during Google login',
            isLoading: false
          });
        }
      },
      
      logout: () => {
        set({ 
          isLoggedIn: false,
          isGuest: false,
          user: null
        });
      },
      
      continueAsGuest: () => {
        set({
          isGuest: true,
          isLoggedIn: false,
          user: null
        });
      },
      
      resetPassword: async (_email: string) => {
        set({ isLoading: true, error: null });
        
        try {
          // Simulating API call
          await new Promise(resolve => setTimeout(resolve, 1000));
          
          // Demo password reset - in a real app, this would call your backend
          set({ isLoading: false });
        } catch (error) {
          set({ 
            error: error instanceof Error ? error.message : 'An error occurred during password reset',
            isLoading: false
          });
        }
      },
      
      clearError: () => set({ error: null })
    }),
    {
      name: 'user-storage',
      storage: createJSONStorage(() => AsyncStorage),
    }
  )
); 