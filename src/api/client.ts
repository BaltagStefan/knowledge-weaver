// ============================================
// Kotaemon API Client
// Secure, typed HTTP client with error handling
// ============================================

import type {
  AuthUser,
  AdminLoginRequest,
  AdminLoginResponse,
  Doc,
  DocDetails,
  DocUploadResponse,
  Conversation,
  Message,
  ChatStreamRequest,
  SSEEvent,
  AdminSettings,
  SystemPrompt,
  SystemPromptHistory,
  MemoryEntry,
  MemoryEntryCreate,
  MemoryEntryUpdate,
  ApiError,
} from '@/types';

// ============================================
// Configuration
// ============================================

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || '/api';
const SSE_TIMEOUT = 120000; // 2 minutes

// Debug logger - disabled in production
const debugLog = (...args: unknown[]) => {
  if (import.meta.env.DEV) {
    // Never log sensitive content
    console.log('[API]', ...args);
  }
};

// ============================================
// Error Handling
// ============================================

export class ApiException extends Error {
  public readonly status: number;
  public readonly code: string;
  public readonly retryAfter?: number;

  constructor(error: ApiError) {
    super(error.message);
    this.name = 'ApiException';
    this.status = error.status;
    this.code = error.code;
    this.retryAfter = error.retryAfter;
  }
}

async function handleResponse<T>(response: Response): Promise<T> {
  if (!response.ok) {
    let errorData: ApiError;
    
    try {
      errorData = await response.json();
    } catch {
      errorData = {
        message: getDefaultErrorMessage(response.status),
        code: `HTTP_${response.status}`,
        status: response.status,
      };
    }

    // Handle rate limiting
    if (response.status === 429) {
      const retryAfter = response.headers.get('Retry-After');
      errorData.retryAfter = retryAfter ? parseInt(retryAfter, 10) : 60;
    }

    throw new ApiException(errorData);
  }

  // Handle empty responses
  const contentType = response.headers.get('Content-Type');
  if (!contentType || !contentType.includes('application/json')) {
    return {} as T;
  }

  return response.json();
}

function getDefaultErrorMessage(status: number): string {
  switch (status) {
    case 401: return 'Authentication required';
    case 403: return 'Access forbidden';
    case 404: return 'Resource not found';
    case 413: return 'Payload too large';
    case 429: return 'Too many requests';
    case 500: return 'Internal server error';
    case 502: return 'Bad gateway';
    case 503: return 'Service unavailable';
    default: return 'An unexpected error occurred';
  }
}

// ============================================
// Token Management (Session Storage - not localStorage)
// ============================================

function getAuthToken(): string | null {
  if (typeof window === 'undefined') return null;
  return sessionStorage.getItem('auth_token');
}

function setAuthToken(token: string): void {
  if (typeof window !== 'undefined') {
    sessionStorage.setItem('auth_token', token);
  }
}

function clearAuthToken(): void {
  if (typeof window !== 'undefined') {
    sessionStorage.removeItem('auth_token');
  }
}

// ============================================
// Fetch Wrapper with Auth & CSRF
// ============================================

interface FetchOptions extends RequestInit {
  skipAuth?: boolean;
}

async function fetchWithAuth<T>(
  endpoint: string,
  options: FetchOptions = {}
): Promise<T> {
  const { skipAuth = false, ...fetchOptions } = options;
  
  const headers = new Headers(fetchOptions.headers);
  
  // Add auth token if available
  if (!skipAuth) {
    const token = getAuthToken();
    if (token) {
      headers.set('Authorization', `Bearer ${token}`);
    }
  }
  
  // Add content type for JSON
  if (fetchOptions.body && typeof fetchOptions.body === 'string') {
    headers.set('Content-Type', 'application/json');
  }
  
  // Include credentials for cookie-based auth
  const response = await fetch(`${API_BASE_URL}${endpoint}`, {
    ...fetchOptions,
    headers,
    credentials: 'include', // For HttpOnly cookie support
  });
  
  return handleResponse<T>(response);
}

// ============================================
// Auth API
// ============================================

export const authApi = {
  async login(request: AdminLoginRequest): Promise<AdminLoginResponse> {
    const response = await fetchWithAuth<AdminLoginResponse>('/auth/admin-login', {
      method: 'POST',
      body: JSON.stringify(request),
      skipAuth: true,
    });
    
    if (response.token) {
      setAuthToken(response.token);
    }
    
    return response;
  },
  
  async me(): Promise<AuthUser> {
    return fetchWithAuth<AuthUser>('/auth/me');
  },
  
  logout(): void {
    clearAuthToken();
  },
};

// ============================================
// Documents API
// ============================================

export const docsApi = {
  async list(): Promise<Doc[]> {
    return fetchWithAuth<Doc[]>('/docs');
  },
  
  async get(docId: string): Promise<DocDetails> {
    return fetchWithAuth<DocDetails>(`/docs/${encodeURIComponent(docId)}`);
  },
  
  async upload(
    file: File,
    onProgress?: (progress: number) => void
  ): Promise<DocUploadResponse> {
    const formData = new FormData();
    formData.append('file', file);
    
    // Use XMLHttpRequest for progress tracking
    return new Promise((resolve, reject) => {
      const xhr = new XMLHttpRequest();
      
      xhr.upload.addEventListener('progress', (event) => {
        if (event.lengthComputable && onProgress) {
          const progress = Math.round((event.loaded / event.total) * 100);
          onProgress(progress);
        }
      });
      
      xhr.addEventListener('load', () => {
        if (xhr.status >= 200 && xhr.status < 300) {
          try {
            resolve(JSON.parse(xhr.responseText));
          } catch {
            reject(new ApiException({
              message: 'Invalid response',
              code: 'PARSE_ERROR',
              status: xhr.status,
            }));
          }
        } else {
          reject(new ApiException({
            message: getDefaultErrorMessage(xhr.status),
            code: `HTTP_${xhr.status}`,
            status: xhr.status,
          }));
        }
      });
      
      xhr.addEventListener('error', () => {
        reject(new ApiException({
          message: 'Network error',
          code: 'NETWORK_ERROR',
          status: 0,
        }));
      });
      
      xhr.open('POST', `${API_BASE_URL}/docs/upload`);
      
      const token = getAuthToken();
      if (token) {
        xhr.setRequestHeader('Authorization', `Bearer ${token}`);
      }
      
      xhr.withCredentials = true;
      xhr.send(formData);
    });
  },
  
  async delete(docId: string): Promise<void> {
    await fetchWithAuth<void>(`/docs/${encodeURIComponent(docId)}`, {
      method: 'DELETE',
    });
  },
  
  async reindex(docId: string): Promise<void> {
    await fetchWithAuth<void>(`/docs/${encodeURIComponent(docId)}/reindex`, {
      method: 'POST',
    });
  },
};

// ============================================
// Conversations API
// ============================================

export const conversationsApi = {
  async list(): Promise<Conversation[]> {
    return fetchWithAuth<Conversation[]>('/conversations');
  },
  
  async create(): Promise<{ conversationId: string }> {
    return fetchWithAuth<{ conversationId: string }>('/conversations', {
      method: 'POST',
    });
  },
  
  async get(id: string): Promise<{ conversation: Conversation; messages: Message[] }> {
    return fetchWithAuth<{ conversation: Conversation; messages: Message[] }>(
      `/conversations/${encodeURIComponent(id)}`
    );
  },
  
  async update(id: string, title: string): Promise<void> {
    await fetchWithAuth<void>(`/conversations/${encodeURIComponent(id)}`, {
      method: 'PATCH',
      body: JSON.stringify({ title }),
    });
  },
  
  async delete(id: string): Promise<void> {
    await fetchWithAuth<void>(`/conversations/${encodeURIComponent(id)}`, {
      method: 'DELETE',
    });
  },
};

// ============================================
// Chat Streaming API (SSE)
// ============================================

export interface ChatStreamCallbacks {
  onToken: (text: string) => void;
  onCitations: (citations: SSEEvent & { type: 'citations' }) => void;
  onStatus: (status: 'searching_pdfs' | 'searching_memory' | 'generating') => void;
  onDone: (messageId: string, finalText: string) => void;
  onError: (error: ApiException) => void;
}

export function streamChat(
  request: ChatStreamRequest,
  callbacks: ChatStreamCallbacks,
  abortController: AbortController
): void {
  const { signal } = abortController;
  
  // Use fetch with ReadableStream for SSE
  fetch(`${API_BASE_URL}/chat/stream`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Accept': 'text/event-stream',
      ...(getAuthToken() ? { 'Authorization': `Bearer ${getAuthToken()}` } : {}),
    },
    body: JSON.stringify(request),
    credentials: 'include',
    signal,
  })
    .then(async (response) => {
      if (!response.ok) {
        const error = await response.json().catch(() => ({
          message: getDefaultErrorMessage(response.status),
          code: `HTTP_${response.status}`,
          status: response.status,
        }));
        throw new ApiException(error);
      }
      
      const reader = response.body?.getReader();
      if (!reader) {
        throw new ApiException({
          message: 'No response body',
          code: 'NO_BODY',
          status: 500,
        });
      }
      
      const decoder = new TextDecoder();
      let buffer = '';
      
      // Throttle UI updates
      let pendingTokens = '';
      let tokenTimeout: ReturnType<typeof setTimeout> | null = null;
      
      const flushTokens = () => {
        if (pendingTokens) {
          callbacks.onToken(pendingTokens);
          pendingTokens = '';
        }
        tokenTimeout = null;
      };
      
      const processLine = (line: string) => {
        if (!line.startsWith('data: ')) return;
        
        const data = line.slice(6);
        if (data === '[DONE]') return;
        
        try {
          const event: SSEEvent = JSON.parse(data);
          
          switch (event.type) {
            case 'token':
              // Throttle token updates to avoid DOM churn
              pendingTokens += event.textChunk;
              if (!tokenTimeout) {
                tokenTimeout = setTimeout(flushTokens, 16); // ~60fps
              }
              break;
            case 'citations':
              callbacks.onCitations(event);
              break;
            case 'status':
              callbacks.onStatus(event.status);
              break;
            case 'done':
              flushTokens();
              callbacks.onDone(event.messageId, event.finalText);
              break;
            case 'error':
              callbacks.onError(new ApiException({
                message: event.message,
                code: event.code || 'STREAM_ERROR',
                status: 500,
              }));
              break;
          }
        } catch (e) {
          debugLog('Failed to parse SSE event:', e);
        }
      };
      
      while (true) {
        const { done, value } = await reader.read();
        if (done) break;
        
        buffer += decoder.decode(value, { stream: true });
        
        const lines = buffer.split('\n');
        buffer = lines.pop() || '';
        
        for (const line of lines) {
          processLine(line.trim());
        }
      }
      
      // Process remaining buffer
      if (buffer.trim()) {
        processLine(buffer.trim());
      }
      
      // Flush any remaining tokens
      flushTokens();
    })
    .catch((error) => {
      if (error.name === 'AbortError') {
        debugLog('Stream aborted by user');
        return;
      }
      
      if (error instanceof ApiException) {
        callbacks.onError(error);
      } else {
        callbacks.onError(new ApiException({
          message: error.message || 'Network error',
          code: 'NETWORK_ERROR',
          status: 0,
        }));
      }
    });
}

// ============================================
// Admin API
// ============================================

export const adminApi = {
  async getSettings(): Promise<AdminSettings> {
    return fetchWithAuth<AdminSettings>('/admin/settings');
  },
  
  async updateSettings(settings: Partial<AdminSettings>): Promise<void> {
    await fetchWithAuth<void>('/admin/settings', {
      method: 'PUT',
      body: JSON.stringify(settings),
    });
  },
  
  async getSystemPrompt(): Promise<SystemPrompt> {
    return fetchWithAuth<SystemPrompt>('/admin/system-prompt');
  },
  
  async updateSystemPrompt(prompt: string, notes?: string): Promise<void> {
    await fetchWithAuth<void>('/admin/system-prompt', {
      method: 'PUT',
      body: JSON.stringify({ prompt, notes }),
    });
  },
  
  async getSystemPromptHistory(): Promise<SystemPromptHistory> {
    return fetchWithAuth<SystemPromptHistory>('/admin/system-prompt/history');
  },
  
  // Memory CRUD
  async listMemory(): Promise<MemoryEntry[]> {
    return fetchWithAuth<MemoryEntry[]>('/admin/memory');
  },
  
  async createMemory(entry: MemoryEntryCreate): Promise<MemoryEntry> {
    return fetchWithAuth<MemoryEntry>('/admin/memory', {
      method: 'POST',
      body: JSON.stringify(entry),
    });
  },
  
  async updateMemory(id: string, entry: MemoryEntryUpdate): Promise<void> {
    await fetchWithAuth<void>(`/admin/memory/${encodeURIComponent(id)}`, {
      method: 'PUT',
      body: JSON.stringify(entry),
    });
  },
  
  async deleteMemory(id: string): Promise<void> {
    await fetchWithAuth<void>(`/admin/memory/${encodeURIComponent(id)}`, {
      method: 'DELETE',
    });
  },
  
  async reindexMemory(id: string): Promise<void> {
    await fetchWithAuth<void>(`/admin/memory/${encodeURIComponent(id)}/reindex`, {
      method: 'POST',
    });
  },
  
  async exportMemory(): Promise<MemoryEntry[]> {
    return fetchWithAuth<MemoryEntry[]>('/admin/memory/export');
  },
  
  async importMemory(entries: MemoryEntryCreate[]): Promise<void> {
    await fetchWithAuth<void>('/admin/memory/import', {
      method: 'POST',
      body: JSON.stringify({ entries }),
    });
  },
};

// ============================================
// Health Check
// ============================================

export async function checkBackendHealth(): Promise<boolean> {
  try {
    const response = await fetch(`${API_BASE_URL}/health`, {
      method: 'GET',
      credentials: 'include',
    });
    return response.ok;
  } catch {
    return false;
  }
}
