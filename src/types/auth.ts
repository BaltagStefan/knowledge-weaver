import type { UserRole } from './database';

// ============================================
// Auth Types
// ============================================
export interface AuthState {
  isAuthenticated: boolean;
  isLoading: boolean;
  user: AuthUser | null;
  isKeycloakAuth: boolean;
}

export interface AuthUser {
  id: string;
  username: string;
  email?: string;
  role: UserRole;
  workspaceIds: string[];
}

// ============================================
// Permission Types
// ============================================
export type Permission =
  | 'chat'
  | 'files:view'
  | 'files:upload'
  | 'files:delete'
  | 'files:index'
  | 'settings:rag'
  | 'settings:prompt'
  | 'settings:models'
  | 'admin:workspaces'
  | 'admin:users'
  | 'users:create_user';

// ============================================
// Role Permissions Map
// ============================================
export const ROLE_PERMISSIONS: Record<UserRole, Permission[]> = {
  user: ['chat'],
  user_plus: [
    'chat',
    'files:view',
    'files:upload',
    'files:delete',
    'files:index',
    'settings:prompt',
    'users:create_user',
  ],
  admin: [
    'chat',
    'files:view',
    'files:upload',
    'files:delete',
    'files:index',
    'settings:rag',
    'settings:prompt',
    'settings:models',
    'admin:workspaces',
    'admin:users',
    'users:create_user',
  ],
};

// ============================================
// Permission Checking
// ============================================
export function hasPermission(role: UserRole, permission: Permission): boolean {
  return ROLE_PERMISSIONS[role]?.includes(permission) ?? false;
}

export function canAccessRoute(role: UserRole, route: string): boolean {
  // Prompt settings - Admin + User+
  if (route.includes('/settings/prompt')) {
    return role === 'admin' || role === 'user_plus';
  }
  
  // Other workspace settings - Admin only
  if (route.includes('/settings/')) {
    return role === 'admin';
  }
  
  // Workspace users page - Admin + User+
  if (route.includes('/workspace-users')) {
    return role === 'admin' || role === 'user_plus';
  }
  
  if (route.startsWith('/admin')) {
    return role === 'admin';
  }
  
  // Files routes - Admin + User+
  if (route.includes('/files')) {
    return role === 'admin' || role === 'user_plus';
  }
  
  // Default routes accessible to all
  return true;
}

// ============================================
// Route Guards Config
// ============================================
export const ROUTE_PERMISSIONS: Record<string, Permission[]> = {
  '/w/:workspaceId/chat': ['chat'],
  '/w/:workspaceId/files': ['files:view'],
  '/w/:workspaceId/conversations': ['chat'],
  '/w/:workspaceId/settings/models': ['settings:models'],
  '/w/:workspaceId/settings/prompt': ['settings:prompt'],
  '/w/:workspaceId/settings/rag': ['settings:rag'],
  '/admin/workspaces': ['admin:workspaces'],
  '/admin/users': ['admin:users'],
};
