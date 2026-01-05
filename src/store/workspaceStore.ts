import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import type { DBWorkspace, DBWorkspaceSettings } from '@/types/database';

// ============================================
// Workspace Store State
// ============================================
interface WorkspaceStoreState {
  workspaces: DBWorkspace[];
  currentWorkspaceId: string | null;
  currentWorkspace: DBWorkspace | null;
  workspaceSettings: DBWorkspaceSettings | null;
  isLoading: boolean;
  
  // Actions
  setWorkspaces: (workspaces: DBWorkspace[]) => void;
  addWorkspace: (workspace: DBWorkspace) => void;
  updateWorkspace: (id: string, updates: Partial<DBWorkspace>) => void;
  removeWorkspace: (id: string) => void;
  setCurrentWorkspace: (workspaceId: string | null) => void;
  setWorkspaceSettings: (settings: DBWorkspaceSettings | null) => void;
  setLoading: (loading: boolean) => void;
  
  // Helpers
  getWorkspaceById: (id: string) => DBWorkspace | undefined;
}

export const useWorkspaceStore = create<WorkspaceStoreState>()(
  persist(
    (set, get) => ({
      workspaces: [],
      currentWorkspaceId: null,
      currentWorkspace: null,
      workspaceSettings: null,
      isLoading: false,

      setWorkspaces: (workspaces) => set({ workspaces }),

      addWorkspace: (workspace) =>
        set((state) => ({
          workspaces: [...state.workspaces, workspace],
        })),

      updateWorkspace: (id, updates) =>
        set((state) => ({
          workspaces: state.workspaces.map((w) =>
            w.id === id ? { ...w, ...updates } : w
          ),
          currentWorkspace:
            state.currentWorkspaceId === id
              ? { ...state.currentWorkspace!, ...updates }
              : state.currentWorkspace,
        })),

      removeWorkspace: (id) =>
        set((state) => ({
          workspaces: state.workspaces.filter((w) => w.id !== id),
          currentWorkspaceId:
            state.currentWorkspaceId === id ? null : state.currentWorkspaceId,
          currentWorkspace:
            state.currentWorkspaceId === id ? null : state.currentWorkspace,
        })),

      setCurrentWorkspace: (workspaceId) => {
        const workspace = workspaceId
          ? get().workspaces.find((w) => w.id === workspaceId) || null
          : null;
        set({
          currentWorkspaceId: workspaceId,
          currentWorkspace: workspace,
        });
      },

      setWorkspaceSettings: (settings) => set({ workspaceSettings: settings }),

      setLoading: (loading) => set({ isLoading: loading }),

      getWorkspaceById: (id) => get().workspaces.find((w) => w.id === id),
    }),
    {
      name: 'workspace-storage',
      partialize: (state) => ({
        currentWorkspaceId: state.currentWorkspaceId,
      }),
    }
  )
);
