import { create } from 'zustand';
import { persist } from 'zustand/middleware';

interface AuthState {
  isAuthenticated: boolean;
  user: { username: string } | null;
  login: (username: string, pass: string) => boolean;
  logout: () => void;
}

// Simple Static Credentials - Load from environment variables
const ADMIN_CREDENTIALS = {
  username: import.meta.env.VITE_ADMIN_USERNAME || 'ADMIN',
  password: import.meta.env.VITE_ADMIN_PASSWORD || ''
};

export const useAuthStore = create<AuthState>()(
  persist(
    (set) => ({
      isAuthenticated: false,
      user: null,
      login: (username, pass) => {
        if (username === ADMIN_CREDENTIALS.username && pass === ADMIN_CREDENTIALS.password) {
          set({ isAuthenticated: true, user: { username } });
          return true;
        }
        return false;
      },
      logout: () => set({ isAuthenticated: false, user: null }),
    }),
    {
      name: 'sd-studios-auth',
    }
  )
);

export const loginWithEmail = async (username: string, pass: string) => {
  const success = useAuthStore.getState().login(username, pass);
  if (success) return true;
  throw new Error('Invalid Credentials');
};

export const registerDefaultAdmins = async () => {
  // Not needed for simple static auth
  return true;
};

export const logout = () => {
  useAuthStore.getState().logout();
};
