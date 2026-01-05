import React from 'react';
import { useAuthStore } from '@/store/authStore';
import type { Permission } from '@/types/auth';

interface PermissionGateProps {
  children: React.ReactNode;
  permission?: Permission;
  permissions?: Permission[];
  requireAll?: boolean;
  fallback?: React.ReactNode;
  requireAdmin?: boolean;
  requireUserPlus?: boolean;
}

export function PermissionGate({
  children,
  permission,
  permissions = [],
  requireAll = false,
  fallback = null,
  requireAdmin = false,
  requireUserPlus = false,
}: PermissionGateProps) {
  const { hasPermission, isAdmin, isUserPlus } = useAuthStore();

  // Check admin requirement
  if (requireAdmin && !isAdmin()) {
    return <>{fallback}</>;
  }

  // Check user+ requirement
  if (requireUserPlus && !isUserPlus()) {
    return <>{fallback}</>;
  }

  // Check single permission
  if (permission && !hasPermission(permission)) {
    return <>{fallback}</>;
  }

  // Check multiple permissions
  if (permissions.length > 0) {
    const hasRequiredPermissions = requireAll
      ? permissions.every((p) => hasPermission(p))
      : permissions.some((p) => hasPermission(p));

    if (!hasRequiredPermissions) {
      return <>{fallback}</>;
    }
  }

  return <>{children}</>;
}

// Hook for checking permissions
export function usePermissions() {
  const { hasPermission, isAdmin, isUserPlus, user } = useAuthStore();

  return {
    hasPermission,
    isAdmin: isAdmin(),
    isUserPlus: isUserPlus(),
    role: user?.role,
    canAccessFiles: isUserPlus(),
    canAccessSettings: isAdmin(),
    canAccessAdmin: isAdmin(),
    canCreateUsers: isUserPlus(),
  };
}
