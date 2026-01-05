import { useEffect, useState } from 'react';
import { initializeDatabase } from '@/db/dexie';
import { createWorkspace, createUser, assignUserToWorkspace, getCurrentUser, setCurrentUser, listWorkspaces } from '@/db/repo';
import { useAuthStore } from '@/store/authStore';
import { useWorkspaceStore } from '@/store/workspaceStore';
import type { AuthUser } from '@/types/auth';

export function useAppInit() {
  const [isInitialized, setIsInitialized] = useState(false);
  const { setUser, setLoading } = useAuthStore();
  const { setWorkspaces, setCurrentWorkspace } = useWorkspaceStore();

  useEffect(() => {
    async function init() {
      try {
        // Initialize database
        await initializeDatabase();

        // Check for existing user
        let currentUser = await getCurrentUser();

        // If no user, create demo data
        if (!currentUser) {
          // Create default workspace
          const defaultWorkspace = await createWorkspace('Default', 'Workspace implicit');

          // Create demo admin user
          const adminUser = await createUser('admin', 'admin', 'admin@demo.local');
          await assignUserToWorkspace(adminUser.id, defaultWorkspace.id, 'manager');

          // Create demo user+ 
          const userPlus = await createUser('manager', 'user_plus', 'manager@demo.local');
          await assignUserToWorkspace(userPlus.id, defaultWorkspace.id, 'member');

          // Create demo user
          const regularUser = await createUser('user', 'user', 'user@demo.local');
          await assignUserToWorkspace(regularUser.id, defaultWorkspace.id, 'member');

          // Set admin as current user for demo
          await setCurrentUser(adminUser.id);
          currentUser = adminUser;
        }

        // Load workspaces
        const workspaces = await listWorkspaces();
        setWorkspaces(workspaces);

        // Set current workspace if available
        if (workspaces.length > 0) {
          setCurrentWorkspace(workspaces[0].id);
        }

        // Set auth state
        if (currentUser) {
          const authUser: AuthUser = {
            id: currentUser.id,
            username: currentUser.username,
            email: currentUser.email,
            role: currentUser.role,
            workspaceIds: workspaces.map((w) => w.id),
          };
          setUser(authUser);
        }

        setLoading(false);
        setIsInitialized(true);
      } catch (error) {
        console.error('Failed to initialize app:', error);
        setLoading(false);
        setIsInitialized(true);
      }
    }

    init();
  }, [setUser, setLoading, setWorkspaces, setCurrentWorkspace]);

  return { isInitialized };
}
