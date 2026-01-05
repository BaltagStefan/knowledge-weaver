// ============================================
// Kotaemon API Types - Typed Contract Layer
// ============================================

// User roles
export type UserRole = 'user' | 'admin';

// Document statuses
export type DocStatus = 'uploading' | 'indexing' | 'ready' | 'failed';

// Source types for citations
export type SourceType = 'pdf' | 'memory';

// ============================================
// Auth Types
// ============================================

export interface AuthUser {
  id: string;
  role: UserRole;
  email?: string;
  name?: string;
}

export interface AdminLoginRequest {
  password: string;
}

export interface AdminLoginResponse {
  token?: string;
  success: boolean;
}

// ============================================
// Document Types
// ============================================

export interface Doc {
  id: string;
  filename: string;
  status: DocStatus;
  size: number;
  uploadedAt: string;
  indexedAt?: string;
  pageCount?: number;
  errorMessage?: string;
}

export interface DocDetails extends Doc {
  metadata?: Record<string, unknown>;
  chunksCount?: number;
}

export interface DocUploadResponse {
  docId: string;
  filename: string;
  status: DocStatus;
}

// ============================================
// Project Types
// ============================================

export interface Project {
  id: string;
  name: string;
  description?: string;
  color?: string;
  icon?: string;
  createdAt: string;
  updatedAt: string;
  conversationIds: string[];
}

export interface ProjectCreate {
  name: string;
  description?: string;
  color?: string;
  icon?: string;
}

// ============================================
// Conversation Types
// ============================================

export interface Conversation {
  id: string;
  title: string;
  createdAt: string;
  updatedAt: string;
  messageCount: number;
  preview?: string;
  projectId?: string;
}

export interface Message {
  id: string;
  conversationId: string;
  role: 'user' | 'assistant';
  content: string;
  createdAt: string;
  metadata?: MessageMetadata;
  citations?: Citation[];
}

export interface MessageMetadata {
  model?: string;
  latencyMs?: number;
  chunksCount?: number;
  tokensUsed?: number;
}

// ============================================
// Citation Types
// ============================================

export interface Citation {
  type: SourceType;
  docId?: string;
  filename?: string;
  page?: number;
  score?: number;
  snippet: string;
  memoryEntryId?: string;
  memoryTitle?: string;
}

// ============================================
// Chat Streaming Types
// ============================================

export interface ChatSource {
  usePdfs: boolean;
  useMemory: boolean;
  docIds?: string[];
}

export interface RagSettings {
  topK?: number;
  threshold?: number;
  chunkSize?: number;
  overlap?: number;
}

export interface ModelSettings {
  name?: string;
  temperature?: number;
  maxTokens?: number;
}

export interface ChatStreamRequest {
  conversationId?: string;
  message: string;
  source: ChatSource;
  rag?: RagSettings;
  model?: ModelSettings;
  systemPromptOverride?: string;
}

// SSE Event types
export interface SSETokenEvent {
  type: 'token';
  textChunk: string;
}

export interface SSECitationsEvent {
  type: 'citations';
  items: Citation[];
}

export interface SSEDoneEvent {
  type: 'done';
  messageId: string;
  finalText: string;
}

export interface SSEErrorEvent {
  type: 'error';
  message: string;
  code?: string;
}

export interface SSEStatusEvent {
  type: 'status';
  status: 'searching_pdfs' | 'searching_memory' | 'generating';
}

export type SSEEvent = SSETokenEvent | SSECitationsEvent | SSEDoneEvent | SSEErrorEvent | SSEStatusEvent;

// ============================================
// Admin Settings Types
// ============================================

export interface RagDefaults {
  topK: number;
  threshold: number;
  chunkSize: number;
  overlap: number;
  reranker: boolean;
  defaultSources: ChatSource;
  citationVerbosity: 'minimal' | 'normal' | 'detailed';
}

export interface ModelDefaults {
  name: string;
  temperature: number;
  maxTokens: number;
}

export interface UIDefaults {
  language: 'ro' | 'en';
  theme: 'light' | 'dark' | 'system';
}

export interface AdminSettings {
  ragDefaults: RagDefaults;
  modelDefaults: ModelDefaults;
  uiDefaults: UIDefaults;
}

export interface SystemPrompt {
  prompt: string;
  version: number;
  updatedAt: string;
  notes?: string;
}

export interface SystemPromptHistory {
  versions: SystemPromptVersion[];
}

export interface SystemPromptVersion {
  version: number;
  prompt: string;
  notes?: string;
  createdAt: string;
}

// ============================================
// Memory Types
// ============================================

export interface MemoryEntry {
  id: string;
  title: string;
  content: string;
  tags: string[];
  createdAt: string;
  updatedAt: string;
  indexed: boolean;
}

export interface MemoryEntryCreate {
  title: string;
  content: string;
  tags: string[];
}

export interface MemoryEntryUpdate {
  title?: string;
  content?: string;
  tags?: string[];
}

// ============================================
// API Response Wrappers
// ============================================

export interface ApiResponse<T> {
  data?: T;
  error?: ApiError;
}

export interface ApiError {
  message: string;
  code: string;
  status: number;
  retryAfter?: number; // For rate limiting
}

// Pagination
export interface PaginatedResponse<T> {
  items: T[];
  total: number;
  page: number;
  pageSize: number;
  hasMore: boolean;
}

// ============================================
// Validation Constants
// ============================================

export const VALIDATION = {
  MESSAGE_MIN_LENGTH: 1,
  MESSAGE_MAX_LENGTH: 8000,
  PDF_MAX_SIZE_MB: 25,
  PDF_MAX_SIZE_BYTES: 25 * 1024 * 1024,
  FILENAME_MAX_LENGTH: 255,
  MEMORY_TITLE_MAX_LENGTH: 200,
  MEMORY_CONTENT_MAX_LENGTH: 50000,
  SYSTEM_PROMPT_MAX_LENGTH: 10000,
} as const;

// ============================================
// Helper type guards
// ============================================

export function isSSETokenEvent(event: SSEEvent): event is SSETokenEvent {
  return event.type === 'token';
}

export function isSSECitationsEvent(event: SSEEvent): event is SSECitationsEvent {
  return event.type === 'citations';
}

export function isSSEDoneEvent(event: SSEEvent): event is SSEDoneEvent {
  return event.type === 'done';
}

export function isSSEErrorEvent(event: SSEEvent): event is SSEErrorEvent {
  return event.type === 'error';
}

export function isSSEStatusEvent(event: SSEEvent): event is SSEStatusEvent {
  return event.type === 'status';
}
