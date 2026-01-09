import type { AuthUser } from '@/types/auth';

export function isAdmin(user?: AuthUser | null): boolean {
  return user?.role === 'admin';
}

export function isUserPlus(user?: AuthUser | null): boolean {
  return user?.role === 'user_plus' || user?.role === 'admin';
}

export function canAccessWorkspace(user: AuthUser | null | undefined, workspaceId?: string): boolean {
  if (!workspaceId) return true;
  if (!user) return false;
  return isAdmin(user) || user.workspaceIds.includes(workspaceId);
}
