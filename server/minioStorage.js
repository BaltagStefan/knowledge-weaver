import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { S3Client, GetObjectCommand, PutObjectCommand } from '@aws-sdk/client-s3';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const ENV_PATH = path.resolve(__dirname, '..', '.env');
const REQUIRED_ENV_KEYS = [
  'MINIO_ENDPOINT',
  'MINIO_BUCKET',
  'MINIO_ACCESS_KEY',
  'MINIO_SECRET_KEY',
];
const MAX_APPEND_ATTEMPTS = 3;

let cachedConfig;
let cachedClient;

const parseEnvFile = (contents) => {
  const env = {};
  const lines = contents.split(/\r?\n/);

  for (const rawLine of lines) {
    const trimmed = rawLine.trim();
    if (!trimmed || trimmed.startsWith('#')) continue;
    const line = trimmed.startsWith('export ') ? trimmed.slice(7).trim() : trimmed;
    const idx = line.indexOf('=');
    if (idx === -1) continue;

    const key = line.slice(0, idx).trim();
    let value = line.slice(idx + 1).trim();

    if (
      (value.startsWith('"') && value.endsWith('"')) ||
      (value.startsWith("'") && value.endsWith("'"))
    ) {
      value = value.slice(1, -1);
    }

    env[key] = value;
  }

  return env;
};

const loadMinioConfig = () => {
  if (cachedConfig) return cachedConfig;

  if (!fs.existsSync(ENV_PATH)) {
    throw new Error(`Missing .env file at ${ENV_PATH}`);
  }

  const env = parseEnvFile(fs.readFileSync(ENV_PATH, 'utf8'));
  const missing = REQUIRED_ENV_KEYS.filter((key) => !env[key]);

  if (missing.length > 0) {
    throw new Error(`Missing ${missing.join(', ')} in .env`);
  }

  let endpoint;
  try {
    endpoint = new URL(env.MINIO_ENDPOINT.trim()).toString();
  } catch (error) {
    throw new Error('MINIO_ENDPOINT must be a valid URL');
  }

  cachedConfig = {
    endpoint,
    bucket: env.MINIO_BUCKET.trim(),
    accessKey: env.MINIO_ACCESS_KEY.trim(),
    secretKey: env.MINIO_SECRET_KEY.trim(),
  };

  return cachedConfig;
};

const getMinioClient = () => {
  if (cachedClient) return cachedClient;
  const config = loadMinioConfig();

  cachedClient = new S3Client({
    endpoint: config.endpoint,
    region: 'us-east-1',
    credentials: {
      accessKeyId: config.accessKey,
      secretAccessKey: config.secretKey,
    },
    forcePathStyle: true,
  });

  return cachedClient;
};

const streamToString = async (stream) => {
  const chunks = [];
  for await (const chunk of stream) {
    chunks.push(Buffer.isBuffer(chunk) ? chunk : Buffer.from(chunk));
  }
  return Buffer.concat(chunks).toString('utf8');
};

const isNotFoundError = (error) =>
  error?.$metadata?.httpStatusCode === 404 ||
  error?.name === 'NoSuchKey' ||
  error?.code === 'NoSuchKey' ||
  error?.name === 'NotFound';

const isPreconditionFailed = (error) =>
  error?.$metadata?.httpStatusCode === 412 ||
  error?.name === 'PreconditionFailed' ||
  error?.code === 'PreconditionFailed';

const readObject = async (client, bucket, key) => {
  try {
    const response = await client.send(
      new GetObjectCommand({
        Bucket: bucket,
        Key: key,
      })
    );
    const body = response.Body ? await streamToString(response.Body) : '';
    return {
      exists: true,
      text: body,
      etag: response.ETag,
    };
  } catch (error) {
    if (isNotFoundError(error)) {
      return {
        exists: false,
        text: '',
        etag: undefined,
      };
    }
    throw error;
  }
};

export const ensureMinioConfig = () => {
  loadMinioConfig();
};

export async function appendConversationEvent(userId, conversationId, role, text) {
  if (!userId) {
    throw new Error('appendConversationEvent requires userId');
  }
  if (!conversationId) {
    throw new Error('appendConversationEvent requires conversationId');
  }
  if (role !== 'user' && role !== 'assistant') {
    throw new Error('appendConversationEvent requires role to be user or assistant');
  }
  if (typeof text !== 'string') {
    throw new Error('appendConversationEvent requires text string');
  }

  const config = loadMinioConfig();
  const client = getMinioClient();
  const key = `Users/${userId}/conversations/${conversationId}.txt`;
  const line = `${JSON.stringify({ ts: new Date().toISOString(), role, text })}\n`;

  for (let attempt = 1; attempt <= MAX_APPEND_ATTEMPTS; attempt += 1) {
    const existing = await readObject(client, config.bucket, key);
    const prefix =
      existing.text && !existing.text.endsWith('\n') ? `${existing.text}\n` : existing.text;
    const body = Buffer.from(`${prefix}${line}`, 'utf8');

    if (existing.exists && !existing.etag) {
      throw new Error('Missing ETag for existing MinIO object');
    }

    try {
      await client.send(
        new PutObjectCommand({
          Bucket: config.bucket,
          Key: key,
          Body: body,
          ContentType: 'text/plain; charset=utf-8',
          ...(existing.exists && existing.etag
            ? { IfMatch: existing.etag }
            : { IfNoneMatch: '*' }),
        })
      );
      return;
    } catch (error) {
      if (isPreconditionFailed(error) && attempt < MAX_APPEND_ATTEMPTS) {
        continue;
      }
      throw error;
    }
  }

  throw new Error('Failed to append conversation event after retries');
}

export async function uploadUserFile(userId, filename, contentType, body) {
  if (!userId) {
    throw new Error('uploadUserFile requires userId');
  }
  if (!filename) {
    throw new Error('uploadUserFile requires filename');
  }
  if (!body) {
    throw new Error('uploadUserFile requires body');
  }

  const safeName = path.basename(filename);
  if (!safeName) {
    throw new Error('uploadUserFile requires valid filename');
  }

  const config = loadMinioConfig();
  const client = getMinioClient();
  const key = `Users/${userId}/files/${safeName}`;

  await client.send(
    new PutObjectCommand({
      Bucket: config.bucket,
      Key: key,
      Body: body,
      ContentType: contentType || 'application/pdf',
    })
  );

  return { key };
}
