import React from 'react';
import { Navigate, useLocation, useParams } from 'react-router-dom';
import { useAuthStore } from '@/store/authStore';
import { useWorkspaceStore } from '@/store/workspaceStore';
import { canAccessRoute } from '@/types/auth';
import { canAccessWorkspace, isUserPlus } from '@/lib/permissions';
import { Loader2 } from 'lucide-react';

interface ProtectedRouteProps {
  children: React.ReactNode;
  requireAuth?: boolean;
  requireAdmin?: boolean;
  requireUserPlus?: boolean;
  requireWorkspace?: boolean;
}

export function ProtectedRoute({
  children,
  requireAuth = true,
  requireAdmin = false,
  requireUserPlus = false,
  requireWorkspace = false,
}: ProtectedRouteProps) {
  const { user, isLoading, isAuthenticated } = useAuthStore();
  const { currentWorkspaceId, workspaces } = useWorkspaceStore();
  const location = useLocation();
  const { workspaceId } = useParams<{ workspaceId?: string }>();

  // Show loading spinner while checking auth
  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-screen">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  // Check authentication
  if (requireAuth && !isAuthenticated) {
    return <Navigate to="/login" state={{ from: location }} replace />;
  }

  // Check admin role
  if (requireAdmin && user?.role !== 'admin') {
    return <Navigate to="/" replace />;
  }

  // Check user+ or admin role
  if (requireUserPlus && !isUserPlus(user)) {
    return <Navigate to="/" replace />;
  }

  // Check workspace access
  if (requireWorkspace && !canAccessWorkspace(user, workspaceId)) {
    return <Navigate to="/" replace />;
  }

  // Check route permissions
  if (user && !canAccessRoute(user.role, location.pathname)) {
    return <Navigate to="/" replace />;
  }

  return <>{children}</>;
}

// HOC for wrapping routes
export function withProtection<P extends object>(
  Component: React.ComponentType<P>,
  options: Omit<ProtectedRouteProps, 'children'> = {}
) {
  return function ProtectedComponent(props: P) {
    return (
      <ProtectedRoute {...options}>
        <Component {...props} />
      </ProtectedRoute>
    );
  };
}
