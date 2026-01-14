export const databaseTables = [
  {
    name: 'users',
    description: 'Utilizatorii aplicației',
    schema: `interface DBUser {
  id: string;
  username: string;
  email?: string;
  role: 'user' | 'user_plus' | 'admin';
  isDisabled: boolean;
  createdAt: number;
  updatedAt: number;
}`,
  },
  {
    name: 'workspaces',
    description: 'Container pentru documente și setări',
    schema: `interface DBWorkspace {
  id: string;
  name: string;
  description?: string;
  createdAt: number;
  updatedAt: number;
}`,
  },
  {
    name: 'files',
    description: 'Fișierele PDF încărcate',
    schema: `interface DBFile {
  docId: string;
  workspaceId: string;
  filename: string;
  mimeType: 'application/pdf';
  size: number;
  uploadedAt: number;
}`,
  },
  {
    name: 'workspaceSettings',
    description: 'Setări per workspace',
    schema: `interface DBWorkspaceSettings {
  workspaceId: string;
  systemPrompt: string;
  modelSettings: ModelSettings;
  ragSettings: RAGSettings;
  updatedAt: number;
}`,
  },
];

export const apiEndpoints = [
  { path: '/auth/me', description: 'Info user curent', role: 'any' },
  { path: '/auth/login', description: 'Login', role: 'any' },
  { path: '/workspaces/list', description: 'Lista workspace-uri', role: 'user' },
  { path: '/workspaces/create', description: 'Creare workspace', role: 'admin' },
  { path: '/users/list', description: 'Lista utilizatori', role: 'admin' },
  { path: '/users/create', description: 'Creare utilizator', role: 'admin' },
  { path: '/files/list', description: 'Lista fișiere', role: 'user' },
  { path: '/files/upload', description: 'Upload PDF', role: 'user_plus' },
  { path: '/files/index', description: 'Indexare documente', role: 'user_plus' },
  { path: '/settings/get', description: 'Obține setări', role: 'user' },
  { path: '/settings/save', description: 'Salvează setări', role: 'admin' },
  { path: '/chat', description: 'Chat JSON (non-stream)', role: 'user' },
  { path: '/chat/stream', description: 'Chat SSE streaming', role: 'user' },
  { path: '/api/n8n/chat/response', description: 'Receiver webhook din n8n (callback)', role: 'any' },
  { path: '/api/n8n/chat/response/poll', description: 'Long-poll pentru raspuns', role: 'user' },
];

export const stores = [
  {
    name: 'useAuthStore',
    file: 'src/store/authStore.ts',
    description: 'Starea de autentificare și permisiuni',
    persisted: false,
    code: `interface AuthState {
  user: DBUser | null;
  isAuthenticated: boolean;
  hasPermission: (p: Permission) => boolean;
  login: (user: DBUser) => void;
  logout: () => void;
}`,
  },
  {
    name: 'useWorkspaceStore',
    file: 'src/store/workspaceStore.ts',
    description: 'Workspace-uri și setări',
    persisted: true,
    code: `interface WorkspaceState {
  workspaces: DBWorkspace[];
  currentWorkspaceId: string | null;
  workspaceSettings: DBWorkspaceSettings | null;
  setCurrentWorkspace: (id: string) => void;
}`,
  },
  {
    name: 'useChatStore',
    file: 'src/store/appStore.ts',
    description: 'Mesaje, streaming, citări',
    persisted: true,
    code: `interface ChatState {
  currentConversationId: string | null;
  messagesById: Record<string, Message[]>;
  isStreaming: boolean;
  streamingConversationId: string | null;
  currentCitations: Citation[];
  addMessage: (message: Message) => void;
}`,
  },
];

export const components = [
  { name: 'MainLayout', path: 'src/components/layout/MainLayout.tsx', description: 'Layout principal cu sidebar și navigare' },
  { name: 'ChatPage', path: 'src/pages/ChatPage.tsx', description: 'Pagina principală de chat cu streaming' },
  { name: 'ChatComposer', path: 'src/components/chat/ChatComposer.tsx', description: 'Input pentru mesaje' },
  { name: 'ChatMessage', path: 'src/components/chat/ChatMessage.tsx', description: 'Afișare mesaj cu markdown' },
  { name: 'ProtectedRoute', path: 'src/components/auth/ProtectedRoute.tsx', description: 'Wrapper pentru rute protejate' },
  { name: 'WorkspaceSwitcher', path: 'src/components/workspace/WorkspaceSwitcher.tsx', description: 'Selector workspace' },
  { name: 'ReasoningPanel', path: 'src/components/layout/ReasoningPanel.tsx', description: 'Panel pentru reasoning și citări' },
  { name: 'PDFPreviewModal', path: 'src/components/files/PDFPreviewModal.tsx', description: 'Vizualizare PDF' },
];
