import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import type { Language } from '@/lib/i18n';
import type { AuthUser, ChatSource, RagSettings, Doc, Citation, Conversation, Message, Project } from '@/types';

// ============================================
// Auth Store
// ============================================

interface AuthState {
  user: AuthUser | null;
  token: string | null;
  isLoading: boolean;
  setUser: (user: AuthUser | null) => void;
  setToken: (token: string | null) => void;
  setLoading: (loading: boolean) => void;
  logout: () => void;
  isAdmin: () => boolean;
}

export const useAuthStore = create<AuthState>()((set, get) => ({
  user: null,
  token: null,
  isLoading: true,
  setUser: (user) => set({ user }),
  setToken: (token) => set({ token }),
  setLoading: (isLoading) => set({ isLoading }),
  logout: () => {
    // Clear token from sessionStorage
    if (typeof window !== 'undefined') {
      sessionStorage.removeItem('auth_token');
    }
    set({ user: null, token: null });
  },
  isAdmin: () => get().user?.role === 'admin',
}));

// ============================================
// UI Store (persisted)
// ============================================

interface UIState {
  language: Language;
  theme: 'light' | 'dark' | 'system';
  sidebarOpen: boolean;
  sourcesPanelOpen: boolean;
  setLanguage: (lang: Language) => void;
  setTheme: (theme: 'light' | 'dark' | 'system') => void;
  toggleSidebar: () => void;
  setSidebarOpen: (open: boolean) => void;
  toggleSourcesPanel: () => void;
  setSourcesPanelOpen: (open: boolean) => void;
}

export const useUIStore = create<UIState>()(
  persist(
    (set) => ({
      language: 'ro',
      theme: 'system',
      sidebarOpen: true,
      sourcesPanelOpen: true,
      setLanguage: (language) => set({ language }),
      setTheme: (theme) => set({ theme }),
      toggleSidebar: () => set((state) => ({ sidebarOpen: !state.sidebarOpen })),
      setSidebarOpen: (sidebarOpen) => set({ sidebarOpen }),
      toggleSourcesPanel: () => set((state) => ({ sourcesPanelOpen: !state.sourcesPanelOpen })),
      setSourcesPanelOpen: (sourcesPanelOpen) => set({ sourcesPanelOpen }),
    }),
    {
      name: 'kotaemon-ui',
      partialize: (state) => ({
        language: state.language,
        theme: state.theme,
      }),
    }
  )
);

// ============================================
// Chat Store
// ============================================

interface ChatState {
  // Current conversation
  currentConversationId: string | null;

  // Messages storage per conversation (persisted)
  messagesById: Record<string, Message[]>;

  // Pending request state
  isStreaming: boolean;
  streamingConversationId: string | null;
  abortController: AbortController | null;

  // Citations
  currentCitations: Citation[];
  selectedCitationId: string | null;

  // Source settings
  sourceSettings: ChatSource;
  ragSettings: RagSettings;

  // Selected docs
  selectedDocIds: string[];

  // Actions
  setCurrentConversation: (id: string | null) => void;
  addMessage: (message: Message) => void;

  startStreaming: (controller: AbortController, conversationId: string) => void;
  stopStreaming: (conversationId: string) => void;

  setCitations: (citations: Citation[], conversationId: string) => void;
  selectCitation: (id: string | null) => void;

  setSourceSettings: (settings: Partial<ChatSource>) => void;
  setRagSettings: (settings: Partial<RagSettings>) => void;
  setSelectedDocIds: (ids: string[]) => void;

  clearChat: () => void;
  clearUserData: () => void;
  deleteConversationMessages: (conversationId: string) => void;
}

export const useChatStore = create<ChatState>()(
  persist(
    (set, get) => ({
      currentConversationId: null,
      messagesById: {},

      isStreaming: false,
      streamingConversationId: null,
      abortController: null,

      currentCitations: [],
      selectedCitationId: null,

      sourceSettings: {
        usePdfs: true,
        useMemory: true,
      },
      ragSettings: {
        topK: 5,
        threshold: 0.5,
      },

      selectedDocIds: [],

      setCurrentConversation: (conversationId) => {
        set({
          currentConversationId: conversationId,
          currentCitations: [],
          selectedCitationId: null,
          streamingConversationId: null,
        });
      },

      addMessage: (message) => set((state) => {
        const conversationId = message.conversationId || state.currentConversationId;
        if (!conversationId) {
          return state;
        }
        const updatedMessages = [
          ...(state.messagesById[conversationId] || []),
          message,
        ];

        return {
          messagesById: {
            ...state.messagesById,
            [conversationId]: updatedMessages,
          },
        };
      }),

      startStreaming: (abortController, conversationId) => set({
        isStreaming: true,
        streamingConversationId: conversationId,
        abortController,
      }),
      stopStreaming: (conversationId) => {
        const { abortController, streamingConversationId } = get();
        if (streamingConversationId && streamingConversationId !== conversationId) {
          return;
        }
        if (abortController) {
          abortController.abort();
        }
        set({
          isStreaming: false,
          streamingConversationId: null,
          abortController: null,
        });
      },

      setCitations: (currentCitations, conversationId) => set((state) => (
        state.streamingConversationId === conversationId ? { currentCitations } : {}
      )),
      selectCitation: (selectedCitationId) => set({ selectedCitationId }),

      setSourceSettings: (settings) => set((state) => ({
        sourceSettings: { ...state.sourceSettings, ...settings }
      })),
      setRagSettings: (settings) => set((state) => ({
        ragSettings: { ...state.ragSettings, ...settings }
      })),
      setSelectedDocIds: (selectedDocIds) => set({ selectedDocIds }),

      clearChat: () => set({
        currentConversationId: null,
        currentCitations: [],
        selectedCitationId: null,
        streamingConversationId: null,
        isStreaming: false,
        abortController: null,
      }),

      clearUserData: () => set({
        currentConversationId: null,
        messagesById: {},
        currentCitations: [],
        selectedCitationId: null,
        streamingConversationId: null,
        isStreaming: false,
        abortController: null,
        selectedDocIds: [],
      }),

      deleteConversationMessages: (conversationId) => set((state) => {
        const newMessagesById = { ...state.messagesById };
        delete newMessagesById[conversationId];
        return { messagesById: newMessagesById };
      }),
    }),
    {
      name: 'kotaemon-chat',
      partialize: (state) => ({
        messagesById: state.messagesById,
        sourceSettings: state.sourceSettings,
        ragSettings: state.ragSettings,
      }),
    }
  )
);

// ============================================
// Documents Store
// ============================================

interface DocsState {
  docs: Doc[];
  uploadProgress: Map<string, number>;
  setDocs: (docs: Doc[]) => void;
  addDoc: (doc: Doc) => void;
  updateDoc: (id: string, updates: Partial<Doc>) => void;
  removeDoc: (id: string) => void;
  setUploadProgress: (id: string, progress: number) => void;
  clearUploadProgress: (id: string) => void;
}

export const useDocsStore = create<DocsState>()((set) => ({
  docs: [],
  uploadProgress: new Map(),
  setDocs: (docs) => set({ docs }),
  addDoc: (doc) => set((state) => ({ docs: [...state.docs, doc] })),
  updateDoc: (id, updates) => set((state) => ({
    docs: state.docs.map((d) => d.id === id ? { ...d, ...updates } : d)
  })),
  removeDoc: (id) => set((state) => ({
    docs: state.docs.filter((d) => d.id !== id)
  })),
  setUploadProgress: (id, progress) => set((state) => {
    const newMap = new Map(state.uploadProgress);
    newMap.set(id, progress);
    return { uploadProgress: newMap };
  }),
  clearUploadProgress: (id) => set((state) => {
    const newMap = new Map(state.uploadProgress);
    newMap.delete(id);
    return { uploadProgress: newMap };
  }),
}));

// ============================================
// Conversations Store
// ============================================

interface ConversationsState {
  conversations: Conversation[];
  setConversations: (conversations: Conversation[]) => void;
  addConversation: (conversation: Conversation) => void;
  updateConversation: (id: string, updates: Partial<Conversation>) => void;
  removeConversation: (id: string) => void;
  moveToProject: (conversationId: string, projectId: string | null) => void;
  getConversationsForUser: (userId: string) => Conversation[];
  clearUserData: () => void;
}

export const useConversationsStore = create<ConversationsState>()(
  persist(
    (set, get) => ({
      conversations: [],
      setConversations: (conversations) => set({ conversations }),
      addConversation: (conversation) => set((state) => ({ 
        conversations: [conversation, ...state.conversations] 
      })),
      updateConversation: (id, updates) => set((state) => ({
        conversations: state.conversations.map((c) => c.id === id ? { ...c, ...updates } : c)
      })),
      removeConversation: (id) => set((state) => ({
        conversations: state.conversations.filter((c) => c.id !== id)
      })),
      moveToProject: (conversationId, projectId) => set((state) => ({
        conversations: state.conversations.map((c) => 
          c.id === conversationId ? { ...c, projectId: projectId || undefined } : c
        )
      })),
      getConversationsForUser: (userId) => get().conversations.filter((c) => c.userId === userId),
      clearUserData: () => set({ conversations: [] }),
    }),
    {
      name: 'kotaemon-conversations',
    }
  )
);

// ============================================
// Projects Store
// ============================================

interface ProjectsState {
  projects: Project[];
  currentProjectId: string | null;
  setProjects: (projects: Project[]) => void;
  addProject: (project: Project) => void;
  updateProject: (id: string, updates: Partial<Project>) => void;
  removeProject: (id: string) => void;
  setCurrentProject: (id: string | null) => void;
  getProjectsForUser: (userId: string) => Project[];
  clearUserData: () => void;
}

export const useProjectsStore = create<ProjectsState>()(
  persist(
    (set, get) => ({
      projects: [],
      currentProjectId: null,
      setProjects: (projects) => set({ projects }),
      addProject: (project) => set((state) => ({ 
        projects: [project, ...state.projects] 
      })),
      updateProject: (id, updates) => set((state) => ({
        projects: state.projects.map((p) => p.id === id ? { ...p, ...updates } : p)
      })),
      removeProject: (id) => set((state) => ({
        projects: state.projects.filter((p) => p.id !== id),
        currentProjectId: state.currentProjectId === id ? null : state.currentProjectId
      })),
      setCurrentProject: (currentProjectId) => set({ currentProjectId }),
      getProjectsForUser: (userId) => get().projects.filter((p) => p.userId === userId),
      clearUserData: () => set({ projects: [], currentProjectId: null }),
    }),
    {
      name: 'kotaemon-projects',
    }
  )
);
