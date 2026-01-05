import { useEffect, useState } from 'react';
import { initializeDatabase } from '@/db/dexie';
import { createWorkspace, createUser, assignUserToWorkspace, getCurrentUser, getUserWorkspaces, listWorkspaces, getUserByUsername } from '@/db/repo';
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

        // Check if demo users exist, if not create them
        const existingAdmin = await getUserByUsername('admin');
        
        if (!existingAdmin) {
          // Create default workspace
          const defaultWorkspace = await createWorkspace('Default', 'Default workspace');

          // Create demo admin user (password = username for demo)
          const adminUser = await createUser('admin', 'admin', 'admin@demo.local', 'admin');
          await assignUserToWorkspace(adminUser.id, defaultWorkspace.id, 'manager');

          // Create demo user+ 
          const userPlus = await createUser('user+', 'user_plus', 'userplus@demo.local', 'user+');
          await assignUserToWorkspace(userPlus.id, defaultWorkspace.id, 'manager');

          // Create demo user
          const regularUser = await createUser('user', 'user', 'user@demo.local', 'user');
          await assignUserToWorkspace(regularUser.id, defaultWorkspace.id, 'member');
        }

        // Check for existing logged in user
        const currentUser = await getCurrentUser();

        // Load workspaces
        const workspaces = await listWorkspaces();
        setWorkspaces(workspaces);

        // If user is logged in, restore session
        if (currentUser) {
          const workspaceIds = await getUserWorkspaces(currentUser.id);
          
          const authUser: AuthUser = {
            id: currentUser.id,
            username: currentUser.username,
            email: currentUser.email,
            role: currentUser.role,
            workspaceIds,
          };
          setUser(authUser);

          // Set current workspace if available
          if (workspaceIds.length > 0) {
            setCurrentWorkspace(workspaceIds[0]);
          }
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