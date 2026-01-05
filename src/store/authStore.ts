import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import type { UserRole } from '@/types/database';
import type { AuthUser, Permission } from '@/types/auth';
import { hasPermission } from '@/types/auth';

// ============================================
// Auth Store State
// ============================================
interface AuthStoreState {
  user: AuthUser | null;
  isLoading: boolean;
  isAuthenticated: boolean;
  isKeycloakAuth: boolean;
  
  // Actions
  setUser: (user: AuthUser | null) => void;
  setLoading: (loading: boolean) => void;
  setKeycloakAuth: (isKeycloak: boolean) => void;
  logout: () => void;
  
  // Helpers
  getRole: () => UserRole | null;
  hasPermission: (permission: Permission) => boolean;
  isAdmin: () => boolean;
  isUserPlus: () => boolean;
}

export const useAuthStore = create<AuthStoreState>()(
  persist(
    (set, get) => ({
      user: null,
      isLoading: true,
      isAuthenticated: false,
      isKeycloakAuth: false,

      setUser: (user) =>
        set({
          user,
          isAuthenticated: !!user,
          isLoading: false,
        }),

      setLoading: (loading) => set({ isLoading: loading }),

      setKeycloakAuth: (isKeycloak) => set({ isKeycloakAuth: isKeycloak }),

      logout: () =>
        set({
          user: null,
          isAuthenticated: false,
          isKeycloakAuth: false,
        }),

      getRole: () => get().user?.role ?? null,

      hasPermission: (permission) => {
        const role = get().user?.role;
        if (!role) return false;
        return hasPermission(role, permission);
      },

      isAdmin: () => get().user?.role === 'admin',

      isUserPlus: () => {
        const role = get().user?.role;
        return role === 'admin' || role === 'user_plus';
      },
    }),
    {
      name: 'auth-storage',
      partialize: (state) => ({
        // Don't persist sensitive data
        isKeycloakAuth: state.isKeycloakAuth,
      }),
    }
  )
);
