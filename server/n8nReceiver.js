import http from 'node:http';
import { URL } from 'node:url';
import { appendConversationEvent, ensureMinioConfig, uploadUserFile } from './minioStorage.js';

const PORT = Number.parseInt(process.env.N8N_RECEIVER_PORT || '8787', 10);
const RAW_ALLOWED_ORIGINS = process.env.N8N_RECEIVER_ALLOWED_ORIGINS || 'http://localhost:8080';
const ALLOWED_ORIGINS = RAW_ALLOWED_ORIGINS.split(',').map((origin) => origin.trim()).filter(Boolean);
const ALLOW_ALL_ORIGINS = ALLOWED_ORIGINS.includes('*') || ALLOWED_ORIGINS.length === 0;

const MAX_BODY_BYTES = 1024 * 1024; // 1MB
const MAX_FILE_BYTES = 25 * 1024 * 1024; // 25MB
const RESPONSE_TTL_MS = 10 * 60 * 1000;
const POLL_TIMEOUT_MS_DEFAULT = 25000;
const POLL_TIMEOUT_MS_MAX = 30000;

ensureMinioConfig();

const responses = new Map();
const responsesByConversation = new Map();
const waiters = new Map();
const waitersByConversation = new Map();
const allWaiters = new Set();

const isObject = (value) => Boolean(value && typeof value === 'object' && !Array.isArray(value));
const toString = (value) => (typeof value === 'string' ? value : undefined);

const getCorsHeaders = (origin) => {
  const headers = {
    'Access-Control-Allow-Methods': 'GET,POST,OPTIONS',
    'Access-Control-Allow-Headers': 'Content-Type,Authorization,X-User-Id,X-File-Name',
  };

  if (ALLOW_ALL_ORIGINS) {
    return { ...headers, 'Access-Control-Allow-Origin': '*' };
  }

  if (origin && ALLOWED_ORIGINS.includes(origin)) {
    return { ...headers, 'Access-Control-Allow-Origin': origin, Vary: 'Origin' };
  }

  return { ...headers, 'Access-Control-Allow-Origin': ALLOWED_ORIGINS[0] || '*' };
};

const sendJson = (res, status, payload, corsHeaders = {}) => {
  if (res.writableEnded) return;
  const body = JSON.stringify(payload);
  res.writeHead(status, {
    'Content-Type': 'application/json',
    'Content-Length': Buffer.byteLength(body),
    ...corsHeaders,
  });
  res.end(body);
};

const readJsonBody = (req) => new Promise((resolve, reject) => {
  let raw = '';
  let size = 0;

  req.on('data', (chunk) => {
    size += chunk.length;
    if (size > MAX_BODY_BYTES) {
      reject(new Error('payload_too_large'));
      req.destroy();
      return;
    }
    raw += chunk.toString('utf8');
  });

  req.on('end', () => {
    if (!raw) {
      resolve({});
      return;
    }
    try {
      resolve(JSON.parse(raw));
    } catch (error) {
      reject(error);
    }
  });

  req.on('error', reject);
});

const readBinaryBody = (req, maxBytes) => new Promise((resolve, reject) => {
  const chunks = [];
  let size = 0;

  req.on('data', (chunk) => {
    size += chunk.length;
    if (size > maxBytes) {
      reject(new Error('payload_too_large'));
      req.destroy();
      return;
    }
    chunks.push(chunk);
  });

  req.on('end', () => {
    resolve(Buffer.concat(chunks));
  });

  req.on('error', reject);
});

const getHeaderValue = (value) => {
  if (!value) return undefined;
  if (Array.isArray(value)) return value[0];
  return typeof value === 'string' ? value : undefined;
};

const normalizeIncomingResponse = (body) => {
  if (!isObject(body)) {
    return { ok: false, error: 'invalid_payload' };
  }

  const isEnvelope = 'success' in body || 'data' in body;
  const envelope = isEnvelope ? body : { success: true, data: body };
  const data = isObject(envelope.data) ? envelope.data : {};

  const clientRequestId = toString(data.clientRequestId ?? envelope.clientRequestId);
  if (!clientRequestId) {
    return { ok: false, error: 'missing_clientRequestId' };
  }

  const normalized = {
    success: envelope.success !== false,
    data: {
      content: toString(data.content),
      citations: Array.isArray(data.citations) ? data.citations : undefined,
      conversationId: toString(data.conversationId ?? envelope.conversationId),
      clientRequestId,
    },
    error: toString(envelope.error),
    message: toString(envelope.message),
  };
  
  return { ok: true, clientRequestId, payload: normalized };
};

const registerWaiter = (clientRequestId, conversationId, res, timeoutMs, corsHeaders) => {
  const waiter = {
    clientRequestId,
    conversationId,
    res,
    corsHeaders,
    timer: null,
    cleanup: null,
  };

  const cleanupWaiter = () => {
    if (waiter.timer) clearTimeout(waiter.timer);
    const group = waiters.get(clientRequestId);
    if (group) {
      group.delete(waiter);
      if (group.size === 0) {
        waiters.delete(clientRequestId);
      }
    }
    if (conversationId) {
      const convoGroup = waitersByConversation.get(conversationId);
      if (convoGroup) {
        convoGroup.delete(waiter);
        if (convoGroup.size === 0) {
          waitersByConversation.delete(conversationId);
        }
      }
    }
    allWaiters.delete(waiter);
  };

  waiter.cleanup = cleanupWaiter;

  waiter.timer = setTimeout(() => {
    sendJson(res, 200, { success: false, error: 'timeout', message: 'timeout' }, corsHeaders);
    cleanupWaiter();
  }, timeoutMs);

  res.on('close', cleanupWaiter);

  const group = waiters.get(clientRequestId) || new Set();
  group.add(waiter);
  waiters.set(clientRequestId, group);

  if (conversationId) {
    const convoGroup = waitersByConversation.get(conversationId) || new Set();
    convoGroup.add(waiter);
    waitersByConversation.set(conversationId, convoGroup);
  }

  allWaiters.add(waiter);
};

const resolveWaiters = (clientRequestId, payload) => {
  const group = waiters.get(clientRequestId);
  if (!group) return false;

  for (const waiter of group) {
    if (waiter.timer) clearTimeout(waiter.timer);
    sendJson(waiter.res, 200, payload, waiter.corsHeaders);
    waiter.cleanup?.();
  }

  waiters.delete(clientRequestId);
  return true;
};

const resolveConversationWaiters = (conversationId, payload) => {
  const group = waitersByConversation.get(conversationId);
  if (!group) return false;

  for (const waiter of group) {
    if (waiter.timer) clearTimeout(waiter.timer);
    sendJson(waiter.res, 200, payload, waiter.corsHeaders);
    waiter.cleanup?.();
  }

  waitersByConversation.delete(conversationId);
  return true;
};

const resolveSingleWaiter = (payload) => {
  if (allWaiters.size !== 1) return false;
  const waiter = allWaiters.values().next().value;
  if (!waiter) return false;
  if (waiter.timer) clearTimeout(waiter.timer);
  const payloadWithRequestId = waiter.clientRequestId
    ? {
        ...payload,
        data: {
          ...(payload?.data || {}),
          clientRequestId: waiter.clientRequestId,
        },
      }
    : payload;
  sendJson(waiter.res, 200, payloadWithRequestId, waiter.corsHeaders);
  waiter.cleanup?.();
  return true;
};

const storeResponse = (clientRequestId, payload) => {
  const createdAt = Date.now();
  responses.set(clientRequestId, { payload, createdAt });

  const conversationId = toString(payload?.data?.conversationId);
  if (conversationId) {
    responsesByConversation.set(conversationId, {
      payload,
      createdAt,
      clientRequestId,
    });
  }

  if (resolveWaiters(clientRequestId, payload)) {
    responses.delete(clientRequestId);
    if (conversationId) {
      responsesByConversation.delete(conversationId);
    }
    return;
  }

  if (conversationId && resolveConversationWaiters(conversationId, payload)) {
    responses.delete(clientRequestId);
    responsesByConversation.delete(conversationId);
    return;
  }

  if (resolveSingleWaiter(payload)) {
    responses.delete(clientRequestId);
    if (conversationId) {
      responsesByConversation.delete(conversationId);
    }
  }
};

setInterval(() => {
  const now = Date.now();
  for (const [key, value] of responses.entries()) {
    if (now - value.createdAt > RESPONSE_TTL_MS) {
      responses.delete(key);
    }
  }
  for (const [key, value] of responsesByConversation.entries()) {
    if (now - value.createdAt > RESPONSE_TTL_MS) {
      responsesByConversation.delete(key);
    }
  }
}, 60000).unref?.();

const server = http.createServer(async (req, res) => {
  const origin = req.headers.origin;
  const corsHeaders = getCorsHeaders(origin);

  if (req.method === 'OPTIONS') {
    res.writeHead(204, corsHeaders);
    res.end();
    return;
  }

  const url = new URL(req.url || '/', `http://${req.headers.host || 'localhost'}`);
  const pathname = url.pathname;

  if (req.method === 'GET' && pathname === '/api/n8n/health') {
    sendJson(res, 200, { ok: true }, corsHeaders);
    return;
  }

  if (req.method === 'POST' && pathname === '/api/n8n/chat/append') {
    try {
      const body = await readJsonBody(req);
      const userId = toString(body.userId);
      const conversationId = toString(body.conversationId);
      const role = toString(body.role);
      const text = toString(body.text);

      if (!userId || !conversationId || !role || typeof text !== 'string') {
        sendJson(res, 400, { success: false, error: 'missing_fields' }, corsHeaders);
        return;
      }

      if (role !== 'user' && role !== 'assistant') {
        sendJson(res, 400, { success: false, error: 'invalid_role' }, corsHeaders);
        return;
      }

      await appendConversationEvent(userId, conversationId, role, text);
      sendJson(res, 200, { success: true }, corsHeaders);
      return;
    } catch (error) {
      const message = error instanceof Error ? error.message : 'append_failed';
      sendJson(res, 500, { success: false, error: message }, corsHeaders);
      return;
    }
  }

  if (req.method === 'POST' && pathname === '/api/n8n/user/files/upload') {
    try {
      const userId = getHeaderValue(req.headers['x-user-id']);
      const rawFileName = getHeaderValue(req.headers['x-file-name']);
      const contentType = getHeaderValue(req.headers['content-type']);
      let fileName;

      try {
        fileName = rawFileName ? decodeURIComponent(rawFileName) : undefined;
      } catch {
        sendJson(res, 400, { success: false, error: 'invalid_filename' }, corsHeaders);
        return;
      }

      if (!userId || !fileName) {
        sendJson(res, 400, { success: false, error: 'missing_fields' }, corsHeaders);
        return;
      }

      if (contentType && !contentType.startsWith('application/pdf')) {
        sendJson(res, 400, { success: false, error: 'invalid_content_type' }, corsHeaders);
        return;
      }

      const body = await readBinaryBody(req, MAX_FILE_BYTES);
      if (!body || body.length === 0) {
        sendJson(res, 400, { success: false, error: 'empty_file' }, corsHeaders);
        return;
      }

      const result = await uploadUserFile(userId, fileName, contentType, body);
      sendJson(res, 200, { success: true, key: result.key }, corsHeaders);
      return;
    } catch (error) {
      const message = error instanceof Error ? error.message : 'upload_failed';
      const status = message === 'payload_too_large' ? 413 : 500;
      sendJson(res, status, { success: false, error: message }, corsHeaders);
      return;
    }
  }

  if (req.method === 'POST' && pathname === '/api/n8n/chat/response') {
    try {
      const body = await readJsonBody(req);
      const normalized = normalizeIncomingResponse(body);

      if (!normalized.ok) {
        sendJson(res, 400, { success: false, error: normalized.error }, corsHeaders);
        return;
      }

      storeResponse(normalized.clientRequestId, normalized.payload);
      sendJson(res, 200, { success: true }, corsHeaders);
      return;
    } catch (error) {
      const message = error instanceof Error ? error.message : 'invalid_payload';
      const status = message === 'payload_too_large' ? 413 : 400;
      sendJson(res, status, { success: false, error: message }, corsHeaders);
      return;
    }
  }

  if (req.method === 'POST' && pathname === '/api/n8n/chat/response/poll') {
    try {
      const body = await readJsonBody(req);
      const clientRequestId = toString(body.clientRequestId);
      const conversationId = toString(body.conversationId);

      if (!clientRequestId) {
        sendJson(res, 400, { success: false, error: 'missing_clientRequestId' }, corsHeaders);
        return;
      }

      const existing = responses.get(clientRequestId);
      if (existing) {
        responses.delete(clientRequestId);
        sendJson(res, 200, existing.payload, corsHeaders);
        return;
      }

      if (conversationId) {
        const byConversation = responsesByConversation.get(conversationId);
        if (byConversation) {
          responsesByConversation.delete(conversationId);
          if (byConversation.clientRequestId) {
            responses.delete(byConversation.clientRequestId);
          }
          const payloadWithRequestId = clientRequestId
            ? {
                ...byConversation.payload,
                data: {
                  ...(byConversation.payload?.data || {}),
                  clientRequestId,
                },
              }
            : byConversation.payload;
          sendJson(res, 200, payloadWithRequestId, corsHeaders);
          return;
        }
      }

      if (responses.size === 1) {
        const entry = responses.values().next().value;
        const payloadWithRequestId = clientRequestId
          ? {
              ...entry.payload,
              data: {
                ...(entry.payload?.data || {}),
                clientRequestId,
              },
            }
          : entry.payload;
        const entryConversationId = toString(entry.payload?.data?.conversationId);
        responses.clear();
        if (entryConversationId) {
          responsesByConversation.delete(entryConversationId);
        }
        sendJson(res, 200, payloadWithRequestId, corsHeaders);
        return;
      }

      const parsedTimeout = Number.parseInt(
        String(body.timeoutMs ?? POLL_TIMEOUT_MS_DEFAULT),
        10
      );
      const timeoutMs = Number.isFinite(parsedTimeout)
        ? Math.min(Math.max(parsedTimeout, 1000), POLL_TIMEOUT_MS_MAX)
        : POLL_TIMEOUT_MS_DEFAULT;

      registerWaiter(clientRequestId, conversationId, res, timeoutMs, corsHeaders);
      return;
    } catch (error) {
      const message = error instanceof Error ? error.message : 'invalid_payload';
      sendJson(res, 400, { success: false, error: message }, corsHeaders);
      return;
    }
  }

  sendJson(res, 404, { success: false, error: 'not_found' }, corsHeaders);
});

server.listen(PORT, () => {
  console.log(`[n8n-receiver] listening on http://localhost:${PORT}`);
});
