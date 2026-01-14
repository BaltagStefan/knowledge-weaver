import { v4 as uuidv4 } from 'uuid';
import { ensureTokenValid } from '@/auth/keycloak';
import type {
  DBUser,
  DBWorkspace,
  DBFile,
  DBFileIndexState,
  DBWorkspaceSettings,
} from '@/types/database';
import type { ModelSettings } from '@/types';

// ============================================
// Configuration
// ============================================
const N8N_BASE_URL = import.meta.env.VITE_N8N_WEBHOOK_BASE_URL || '/api';
const N8N_CHAT_WEBHOOK_URL = import.meta.env.VITE_N8N_CHAT_WEBHOOK_URL || '';
const N8N_RECEIVER_BASE_URL = import.meta.env.VITE_N8N_RECEIVER_BASE_URL || '/api/n8n';

const N8N_WEBHOOK_PREFIX = /^\/webhook(-test)?(\/|$)/;

const normalizeBaseUrl = (value: string): string =>
  value.trim().replace(/\/+$/, '');

const toDevProxyPath = (value: string): string => {
  if (!import.meta.env.DEV) return value;
  try {
    const url = new URL(value);
    const pathname = url.pathname || '/';
    if (N8N_WEBHOOK_PREFIX.test(pathname)) {
      return pathname;
    }
  } catch {
    // Keep relative paths as-is.
  }
  return value;
};

const isFullWebhookUrl = (value: string): boolean => {
  const normalized = normalizeBaseUrl(value);
  let path = normalized;
  try {
    path = new URL(normalized).pathname;
  } catch {
    // Relative path.
  }
  path = path.replace(/\/+$/, '');
  const match = path.match(/\/webhook(-test)?(\/.+)?$/);
  return Boolean(match && match[2]);
};

const resolveN8nBaseUrl = (value: string): string =>
  toDevProxyPath(normalizeBaseUrl(value));

// n8n webhook base URL
function getN8nApiBaseUrl(): string {
  return resolveN8nBaseUrl(N8N_BASE_URL);
}

function getN8nChatBaseUrl(): string {
  if (N8N_CHAT_WEBHOOK_URL) {
    return resolveN8nBaseUrl(N8N_CHAT_WEBHOOK_URL);
  }
  return getN8nApiBaseUrl();
}

function getN8nRequestUrl(endpoint: string): string {
  if (/^https?:\/\//i.test(endpoint)) {
    return endpoint;
  }
  const isChatEndpoint = endpoint.startsWith('/chat');
  const baseUrl = isChatEndpoint ? getN8nChatBaseUrl() : getN8nApiBaseUrl();
  if (isChatEndpoint && isFullWebhookUrl(baseUrl)) {
    return baseUrl;
  }
  return `${baseUrl}${endpoint}`;
}

function getN8nReceiverBaseUrl(): string {
  return resolveN8nBaseUrl(N8N_RECEIVER_BASE_URL);
}

function getN8nReceiverUrl(endpoint: string): string {
  if (/^https?:\/\//i.test(endpoint)) {
    return endpoint;
  }
  return `${getN8nReceiverBaseUrl()}${endpoint}`;
}

// ============================================
// Types
// ============================================
export interface N8NRequestPayload {
  workspaceId?: string;
  actor: {
    userId: string;
    username: string;
    role: string;
  };
  keycloakToken?: string;
  clientRequestId: string;
  [key: string]: unknown;
}

export interface N8NResponse<T = unknown> {
  success: boolean;
  data?: T;
  error?: string;
  message?: string;
}

export interface StreamMeta {
  clientRequestId: string;
  conversationId?: string;
  messageId?: string;
}

export interface StreamCallbacks {
  onMeta?: (meta: StreamMeta) => void;
  onToken?: (token: string) => void;
  onCitations?: (citations: Citation[]) => void;
  onStatus?: (status: string) => void;
  onReasoning?: (reasoning: string) => void;
  onError?: (error: string) => void;
  onDone?: (meta?: StreamMeta) => void;
}

export interface Citation {
  docId: string;
  filename: string;
  page?: number;
  text: string;
  score?: number;
}

export type StreamEvent = {
  type?: string;
  content?: string;
  citations?: Citation[];
  status?: string;
  message?: string;
  clientRequestId?: string;
  conversationId?: string;
  messageId?: string;
  [key: string]: unknown;
};

export interface ChatRequest {
  message: string;
  conversationId?: string;
  clientRequestId?: string;
  workspaceId: string;
  docIds?: string[];
  usePdfs?: boolean;
  useMemory?: boolean;
  model?: ModelSettings;
}

export interface ChatResponseData {
  content: string;
  citations?: Citation[];
  conversationId?: string;
  clientRequestId?: string;
}

// ============================================
// Error Handling
// ============================================
export class N8NError extends Error {
  constructor(
    message: string,
    public statusCode?: number,
    public responseBody?: unknown
  ) {
    super(message);
    this.name = 'N8NError';
  }
}

// ============================================
// Base Request Function
// ============================================
async function n8nPostToUrl<T>(
  url: string,
  payload: Partial<N8NRequestPayload>,
  actor: { userId: string; username: string; role: string },
  workspaceId?: string,
  signal?: AbortSignal
): Promise<N8NResponse<T>> {
  const keycloakToken = await ensureTokenValid();
  
  const fullPayload: N8NRequestPayload = {
    ...payload,
    workspaceId,
    actor,
    clientRequestId: payload.clientRequestId || uuidv4(),
    ...(keycloakToken && { keycloakToken }),
  };

  const response = await fetch(url, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      ...(keycloakToken && { Authorization: `Bearer ${keycloakToken}` }),
    },
    body: JSON.stringify(fullPayload),
    signal,
  });

  if (!response.ok) {
    const errorText = await response.text();
    throw new N8NError(
      `Request failed: ${response.statusText}`,
      response.status,
      errorText
    );
  }

  return response.json();
}

async function n8nPost<T>(
  endpoint: string,
  payload: Partial<N8NRequestPayload>,
  actor: { userId: string; username: string; role: string },
  workspaceId?: string,
  signal?: AbortSignal
): Promise<N8NResponse<T>> {
  return n8nPostToUrl<T>(
    getN8nRequestUrl(endpoint),
    payload,
    actor,
    workspaceId,
    signal
  );
}

// ============================================
// Auth Endpoints
// ============================================
export const authApi = {
  async me(actor: { userId: string; username: string; role: string }): Promise<N8NResponse<DBUser>> {
    return n8nPost<DBUser>('/auth/me', {}, actor);
  },

  async login(
    username: string,
    password: string
  ): Promise<N8NResponse<{ user: DBUser; token?: string }>> {
    return n8nPost<{ user: DBUser; token?: string }>(
      '/auth/login',
      { username, password },
      { userId: '', username, role: 'user' }
    );
  },
};

// ============================================
// Workspace Endpoints
// ============================================
export const workspacesApi = {
  async list(
    actor: { userId: string; username: string; role: string }
  ): Promise<N8NResponse<DBWorkspace[]>> {
    return n8nPost<DBWorkspace[]>('/workspaces/list', {}, actor);
  },

  async create(
    name: string,
    description: string | undefined,
    actor: { userId: string; username: string; role: string }
  ): Promise<N8NResponse<DBWorkspace>> {
    return n8nPost<DBWorkspace>('/workspaces/create', { name, description }, actor);
  },

  async update(
    workspaceId: string,
    updates: Partial<DBWorkspace>,
    actor: { userId: string; username: string; role: string }
  ): Promise<N8NResponse<DBWorkspace>> {
    return n8nPost<DBWorkspace>('/workspaces/update', { updates }, actor, workspaceId);
  },

  async delete(
    workspaceId: string,
    actor: { userId: string; username: string; role: string }
  ): Promise<N8NResponse<void>> {
    return n8nPost<void>('/workspaces/delete', {}, actor, workspaceId);
  },

  async getMembers(
    workspaceId: string,
    actor: { userId: string; username: string; role: string }
  ): Promise<N8NResponse<DBUser[]>> {
    return n8nPost<DBUser[]>('/workspaces/members', {}, actor, workspaceId);
  },

  async assignUser(
    workspaceId: string,
    userId: string,
    actor: { userId: string; username: string; role: string }
  ): Promise<N8NResponse<void>> {
    return n8nPost<void>('/workspaces/assign-user', { userId }, actor, workspaceId);
  },

  async removeUser(
    workspaceId: string,
    userId: string,
    actor: { userId: string; username: string; role: string }
  ): Promise<N8NResponse<void>> {
    return n8nPost<void>('/workspaces/remove-user', { userId }, actor, workspaceId);
  },
};

// ============================================
// User Endpoints
// ============================================
export const usersApi = {
  async list(
    actor: { userId: string; username: string; role: string }
  ): Promise<N8NResponse<DBUser[]>> {
    return n8nPost<DBUser[]>('/users/list', {}, actor);
  },

  async create(
    username: string,
    role: 'user' | 'user_plus',
    workspaceIds: string[],
    email?: string,
    actor?: { userId: string; username: string; role: string }
  ): Promise<N8NResponse<DBUser>> {
    return n8nPost<DBUser>(
      '/users/create',
      { username, role, workspaceIds, email },
      actor || { userId: '', username: '', role: 'admin' }
    );
  },

  async update(
    userId: string,
    updates: Partial<DBUser>,
    actor: { userId: string; username: string; role: string }
  ): Promise<N8NResponse<DBUser>> {
    return n8nPost<DBUser>('/users/update', { userId, updates }, actor);
  },

  async disable(
    userId: string,
    actor: { userId: string; username: string; role: string }
  ): Promise<N8NResponse<void>> {
    return n8nPost<void>('/users/disable', { userId }, actor);
  },

  async resetPassword(
    userId: string,
    actor: { userId: string; username: string; role: string }
  ): Promise<N8NResponse<{ tempPassword: string }>> {
    return n8nPost<{ tempPassword: string }>('/users/reset-password', { userId }, actor);
  },

  async assignWorkspaces(
    userId: string,
    workspaceIds: string[],
    actor: { userId: string; username: string; role: string }
  ): Promise<N8NResponse<void>> {
    return n8nPost<void>('/users/assign-workspaces', { userId, workspaceIds }, actor);
  },
};

// ============================================
// Files Endpoints
// ============================================
export const filesApi = {
  async list(
    workspaceId: string,
    actor: { userId: string; username: string; role: string }
  ): Promise<N8NResponse<Array<DBFile & { indexState?: DBFileIndexState }>>> {
    return n8nPost<Array<DBFile & { indexState?: DBFileIndexState }>>(
      '/files/list',
      {},
      actor,
      workspaceId
    );
  },

  async upload(
    workspaceId: string,
    file: File,
    actor: { userId: string; username: string; role: string },
    onProgress?: (progress: number) => void
  ): Promise<N8NResponse<DBFile>> {
    const keycloakToken = await ensureTokenValid();
    
    const formData = new FormData();
    formData.append('file', file);
    formData.append('workspaceId', workspaceId);
    formData.append('actor', JSON.stringify(actor));
    formData.append('clientRequestId', uuidv4());
    if (keycloakToken) {
      formData.append('keycloakToken', keycloakToken);
    }

    return new Promise((resolve, reject) => {
      const xhr = new XMLHttpRequest();
      
      xhr.upload.onprogress = (e) => {
        if (e.lengthComputable && onProgress) {
          onProgress((e.loaded / e.total) * 100);
        }
      };

      xhr.onload = () => {
        if (xhr.status >= 200 && xhr.status < 300) {
          try {
            resolve(JSON.parse(xhr.responseText));
          } catch {
            resolve({ success: true, data: JSON.parse(xhr.responseText) });
          }
        } else {
          reject(new N8NError('Upload failed', xhr.status, xhr.responseText));
        }
      };

      xhr.onerror = () => reject(new N8NError('Upload failed'));

      xhr.open('POST', getN8nRequestUrl('/files/upload'));
      if (keycloakToken) {
        xhr.setRequestHeader('Authorization', `Bearer ${keycloakToken}`);
      }
      xhr.send(formData);
    });
  },

  async delete(
    workspaceId: string,
    docId: string,
    actor: { userId: string; username: string; role: string }
  ): Promise<N8NResponse<void>> {
    return n8nPost<void>('/files/delete', { docId }, actor, workspaceId);
  },

  async index(
    workspaceId: string,
    docIds: string[],
    actor: { userId: string; username: string; role: string }
  ): Promise<N8NResponse<{ indexed: string[]; failed: string[] }>> {
    return n8nPost<{ indexed: string[]; failed: string[] }>(
      '/files/index',
      { docIds },
      actor,
      workspaceId
    );
  },

  async reindex(
    workspaceId: string,
    docId: string,
    actor: { userId: string; username: string; role: string }
  ): Promise<N8NResponse<void>> {
    return n8nPost<void>('/files/reindex', { docId }, actor, workspaceId);
  },
};

// ============================================
// Settings Endpoints
// ============================================
export const settingsApi = {
  async get(
    workspaceId: string,
    actor: { userId: string; username: string; role: string }
  ): Promise<N8NResponse<DBWorkspaceSettings>> {
    return n8nPost<DBWorkspaceSettings>('/settings/get', {}, actor, workspaceId);
  },

  async save(
    workspaceId: string,
    settings: Partial<DBWorkspaceSettings>,
    actor: { userId: string; username: string; role: string }
  ): Promise<N8NResponse<void>> {
    return n8nPost<void>('/settings/save', { settings }, actor, workspaceId);
  },
};

// ============================================
// Chat Streaming
// ============================================
export async function streamChat(
  request: ChatRequest,
  actor: { userId: string; username: string; role: string },
  callbacks: StreamCallbacks,
  signal?: AbortSignal
): Promise<void> {
  const keycloakToken = await ensureTokenValid();
  
  const conversationId = request.conversationId;
  const clientRequestId = request.clientRequestId || uuidv4();

  const baseMeta: StreamMeta = {
    clientRequestId,
    conversationId,
  };

  const payload = {
    context: 'message',
    message: request.message,
    conversationId,
    docIds: request.docIds,
    usePdfs: request.usePdfs,
    useMemory: request.useMemory,
    workspaceId: request.workspaceId,
    actor,
    clientRequestId,
    ...(keycloakToken && { keycloakToken }),
    ...(request.model && { model: request.model }),
  };

  const isMatchingEvent = (event: StreamEvent): boolean => {
    const eventRequestId =
      typeof event.clientRequestId === 'string' ? event.clientRequestId : undefined;
    if (eventRequestId && eventRequestId !== clientRequestId) return false;

    const eventConversationId =
      typeof event.conversationId === 'string' ? event.conversationId : undefined;
    if (eventConversationId && conversationId && eventConversationId !== conversationId) {
      return false;
    }

    return true;
  };

  const getEventMeta = (event: StreamEvent): StreamMeta => ({
    clientRequestId:
      typeof event.clientRequestId === 'string' ? event.clientRequestId : clientRequestId,
    conversationId:
      typeof event.conversationId === 'string' ? event.conversationId : conversationId,
    messageId: typeof event.messageId === 'string' ? event.messageId : undefined,
  });

  callbacks.onMeta?.(baseMeta);

  try {
    const response = await fetch(getN8nRequestUrl('/chat/stream'), {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Accept: 'text/event-stream',
        ...(keycloakToken && { Authorization: `Bearer ${keycloakToken}` }),
      },
      body: JSON.stringify(payload),
      signal,
    });

    if (!response.ok) {
      throw new N8NError('Stream request failed', response.status);
    }

    const reader = response.body?.getReader();
    if (!reader) {
      throw new N8NError('No response body');
    }

    const decoder = new TextDecoder();
    let buffer = '';

    while (true) {
      const { done, value } = await reader.read();
      if (done) break;

      buffer += decoder.decode(value, { stream: true });
      const lines = buffer.split('\n');
      buffer = lines.pop() || '';

      for (const line of lines) {
        if (line.startsWith('data: ')) {
          const data = line.slice(6).trim();
          if (data === '[DONE]') {
            callbacks.onDone?.(baseMeta);
            return;
          }

          try {
            const event = JSON.parse(data) as StreamEvent;
            if (!isMatchingEvent(event)) {
              continue;
            }
            const eventMeta = getEventMeta(event);
            
            switch (event.type) {
              case 'meta':
                callbacks.onMeta?.(eventMeta);
                break;
              case 'token':
                if (typeof event.content === 'string') {
                  callbacks.onToken?.(event.content);
                }
                break;
              case 'citations':
                if (Array.isArray(event.citations)) {
                  callbacks.onCitations?.(event.citations);
                }
                break;
              case 'status':
                if (typeof event.status === 'string') {
                  callbacks.onStatus?.(event.status);
                }
                break;
              case 'reasoning':
                if (typeof event.content === 'string') {
                  callbacks.onReasoning?.(event.content);
                }
                break;
              case 'error':
                if (typeof event.message === 'string') {
                  callbacks.onError?.(event.message);
                }
                break;
              case 'done':
                callbacks.onDone?.(eventMeta);
                return;
            }
          } catch {
            // Ignore parse errors for incomplete JSON
          }
        }
      }
    }

    callbacks.onDone?.(baseMeta);
  } catch (error) {
    if (error instanceof Error && error.name === 'AbortError') {
      return;
    }
    callbacks.onError?.(error instanceof Error ? error.message : 'Stream failed');
  }
}

// ============================================
// Non-streaming Chat Fallback
// ============================================
const RESPONSE_POLL_TIMEOUT_MS = 25000;
const RESPONSE_MAX_WAIT_MS = 120000;

async function waitForChatResponse(
  clientRequestId: string,
  conversationId: string | undefined,
  workspaceId: string,
  signal?: AbortSignal
): Promise<N8NResponse<ChatResponseData>> {
  const startedAt = Date.now();

  while (Date.now() - startedAt < RESPONSE_MAX_WAIT_MS) {
    if (signal?.aborted) {
      throw new DOMException('Aborted', 'AbortError');
    }

    const response = await fetch(getN8nReceiverUrl('/chat/response/poll'), {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        clientRequestId,
        conversationId,
        workspaceId,
        timeoutMs: RESPONSE_POLL_TIMEOUT_MS,
      }),
      signal,
    });

    if (!response.ok) {
      const errorText = await response.text().catch(() => '');
      throw new N8NError(
        errorText || 'Response poll failed',
        response.status,
        errorText
      );
    }

    const payload = (await response.json()) as N8NResponse<ChatResponseData>;
    if (payload.success) {
      return payload;
    }

    if (payload.error === 'timeout' || payload.message === 'timeout') {
      continue;
    }

    return payload;
  }

  return {
    success: false,
    error: 'timeout',
    message: 'Timed out waiting for chat response.',
  };
}

export async function sendChat(
  request: ChatRequest,
  actor: { userId: string; username: string; role: string },
  signal?: AbortSignal
): Promise<N8NResponse<ChatResponseData>> {
  const clientRequestId = request.clientRequestId || uuidv4();
  const initialResponse = await n8nPost<ChatResponseData>(
    '/chat',
    {
      context: 'message',
      message: request.message,
      conversationId: request.conversationId,
      clientRequestId,
      docIds: request.docIds,
      usePdfs: request.usePdfs,
      useMemory: request.useMemory,
      ...(request.model && { model: request.model }),
    },
    actor,
    request.workspaceId,
    signal
  );

  if (!initialResponse.success) {
    return initialResponse;
  }

  if (initialResponse.data?.content) {
    return initialResponse;
  }

  return waitForChatResponse(
    clientRequestId,
    request.conversationId,
    request.workspaceId,
    signal
  );
}
