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
// Workspace Settings Table
// ============================================
export interface ModelSettings {
  llmModel: string;
  temperature: number;
  maxTokens: number;
  topP: number;
  reasoningMode: ReasoningMode;
  reasoningBudget?: number;
  embeddingsModel: string;
  rerankerEnabled: boolean;
  rerankerModel?: string;
}

export interface RAGSettings {
  chunkSize: number;
  chunkOverlap: number;
  topK: number;
  threshold: number;
  citationsVerbosity: 'minimal' | 'normal' | 'detailed';
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
  llmModel: 'gpt-4o',
  temperature: 0.7,
  maxTokens: 4096,
  topP: 1,
  reasoningMode: 'off',
  reasoningBudget: undefined,
  embeddingsModel: 'text-embedding-3-small',
  rerankerEnabled: false,
  rerankerModel: undefined,
};

export const DEFAULT_RAG_SETTINGS: RAGSettings = {
  chunkSize: 512,
  chunkOverlap: 50,
  topK: 5,
  threshold: 0.7,
  citationsVerbosity: 'normal',
};

export const DEFAULT_SYSTEM_PROMPT = `You are a helpful AI assistant that answers questions based on the provided documents. 
Always cite your sources when referencing information from the documents.
If you don't know the answer or can't find it in the documents, say so honestly.`;
