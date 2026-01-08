// ============================================
// Database Types for Dexie/IndexedDB
// ============================================

export type UserRole = 'user' | 'user_plus' | 'admin';
export type WorkspaceRole = 'member' | 'manager';
export type IndexStatus = 'not_indexed' | 'indexing' | 'ready' | 'failed';
export type FileSource = 'local' | 'remote';
export type ReasoningMode = 'off' | 'low' | 'medium' | 'high';

// ============================================
// User Table
// ============================================
export interface DBUser {
  id: string; // uuid
  username: string;
  email?: string;
  role: UserRole;
  passwordHash?: string;
  isDisabled: boolean;
  createdAt: number; // epoch ms
  updatedAt: number;
}

// ============================================
// Workspace Table
// ============================================
export interface DBWorkspace {
  id: string; // uuid
  name: string;
  description?: string;
  createdAt: number;
  updatedAt: number;
}

// ============================================
// Membership Table (User <-> Workspace)
// ============================================
export interface DBMembership {
  id: string; // `${userId}:${workspaceId}`
  userId: string;
  workspaceId: string;
  roleInWorkspace?: WorkspaceRole;
  createdAt: number;
}

// ============================================
// File Table
// ============================================
export interface DBFile {
  docId: string; // uuid, primary key
  workspaceId: string;
  filename: string;
  mimeType: 'application/pdf';
  size: number;
  sha256?: string;
  uploadedAt: number;
  updatedAt: number;
  blobKey?: string;
  fileBlob?: Blob;
  source: FileSource;
}

// ============================================
// File Index State Table
// ============================================
export interface DBFileIndexState {
  docId: string; // same as files.docId
  workspaceId: string;
  status: IndexStatus;
  indexedAt?: number;
  indexVersion?: string;
  lastError?: string;
  lastAttemptAt?: number;
}

// ============================================
// Custom Endpoint Configuration
// ============================================
export interface EndpointConfig {
  id: string;
  name: string;
  endpoint: string;
  apiKey?: string;
  contextWindow?: number;
  temperature?: number;
  maxTokens?: number;
}

// ============================================
// Workspace Settings Table
// ============================================
export interface ModelSettings {
  // LLM Configuration
  llmEndpoints: EndpointConfig[];
  selectedLlmId?: string;
  
  // Vector Database Configuration
  vectorDbEndpoints: EndpointConfig[];
  selectedVectorDbId?: string;
  
  // Reranker Configuration
  rerankerEnabled: boolean;
  rerankerEndpoints: EndpointConfig[];
  selectedRerankerId?: string;
  
  // Reasoning settings
  reasoningMode: ReasoningMode;
  reasoningBudget?: number;
}

export interface RAGSettings {
  chatHistoryCount: number;
  chunksCount: number;
  chunkSize: number;
  chunkOverlap: number;
}

export interface DBWorkspaceSettings {
  workspaceId: string; // primary key
  systemPrompt: string;
  systemPromptVersion?: string;
  modelSettings: ModelSettings;
  ragSettings: RAGSettings;
  updatedAt: number;
}

// ============================================
// Prompt Versions Table
// ============================================
export interface DBPromptVersion {
  id: string; // uuid
  workspaceId: string;
  prompt: string;
  note?: string;
  createdAt: number;
  createdBy?: string;
}

// ============================================
// App Cache Table (KV Store)
// ============================================
export interface DBAppCache {
  key: string; // primary key
  value: unknown;
  updatedAt: number;
}

// ============================================
// Default Values
// ============================================
export const DEFAULT_MODEL_SETTINGS: ModelSettings = {
  llmEndpoints: [],
  selectedLlmId: undefined,
  vectorDbEndpoints: [],
  selectedVectorDbId: undefined,
  rerankerEnabled: false,
  rerankerEndpoints: [],
  selectedRerankerId: undefined,
  reasoningMode: 'off',
  reasoningBudget: undefined,
};

export const DEFAULT_RAG_SETTINGS: RAGSettings = {
  chatHistoryCount: 10,
  chunksCount: 5,
  chunkSize: 512,
  chunkOverlap: 50,
};

export const DEFAULT_SYSTEM_PROMPT = `You are a helpful AI assistant that answers questions based on the provided documents. 
Always cite your sources when referencing information from the documents.
If you don't know the answer or can't find it in the documents, say so honestly.`;
