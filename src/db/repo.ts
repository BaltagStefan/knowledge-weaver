import { v4 as uuidv4 } from 'uuid';
import {
  db,
  usersTable,
  workspacesTable,
  membershipsTable,
  filesTable,
  fileIndexStateTable,
  workspaceSettingsTable,
  promptVersionsTable,
  appCacheTable,
} from './dexie';
import type {
  DBUser,
  DBWorkspace,
  DBMembership,
  DBFile,
  DBFileIndexState,
  DBWorkspaceSettings,
  DBPromptVersion,
  ModelSettings,
  RAGSettings,
  UserRole,
} from '@/types/database';
import {
  DEFAULT_MODEL_SETTINGS,
  DEFAULT_RAG_SETTINGS,
  DEFAULT_SYSTEM_PROMPT,
} from '@/types/database';

// ============================================
// Cache Keys
// ============================================
const CACHE_KEYS = {
  CURRENT_USER_ID: 'current_user_id',
  LAST_WORKSPACE_ID: 'last_workspace_id',
  KEYCLOAK_TOKEN: 'keycloak_token',
} as const;

// ============================================
// User Functions
// ============================================
export async function getCurrentUser(): Promise<DBUser | null> {
  const cached = await appCacheTable.get(CACHE_KEYS.CURRENT_USER_ID);
  if (!cached?.value) return null;
  return usersTable.get(cached.value as string) || null;
}

export async function setCurrentUser(userId: string): Promise<void> {
  await appCacheTable.put({
    key: CACHE_KEYS.CURRENT_USER_ID,
    value: userId,
    updatedAt: Date.now(),
  });
}

export async function logout(): Promise<void> {
  await appCacheTable.delete(CACHE_KEYS.CURRENT_USER_ID);
  await appCacheTable.delete(CACHE_KEYS.KEYCLOAK_TOKEN);
}

export async function createUser(
  username: string,
  role: UserRole,
  email?: string,
  passwordHash?: string
): Promise<DBUser> {
  const existing = await getUserByUsername(username);
  if (existing) {
    throw new Error('USERNAME_EXISTS');
  }
  const now = Date.now();
  const user: DBUser = {
    id: uuidv4(),
    username,
    email,
    role,
    passwordHash,
    isDisabled: false,
    createdAt: now,
    updatedAt: now,
  };
  await usersTable.add(user);
  return user;
}

export async function getUserByUsername(username: string): Promise<DBUser | null> {
  return (await usersTable.where('username').equals(username).first()) || null;
}

export async function getUserById(id: string): Promise<DBUser | null> {
  return (await usersTable.get(id)) || null;
}

export async function listUsers(): Promise<DBUser[]> {
  return usersTable.toArray();
}

export async function updateUser(id: string, updates: Partial<DBUser>): Promise<void> {
  await usersTable.update(id, { ...updates, updatedAt: Date.now() });
}

export async function disableUser(id: string): Promise<void> {
  await usersTable.update(id, { isDisabled: true, updatedAt: Date.now() });
}

// ============================================
// Workspace Functions
// ============================================
export async function createWorkspace(name: string, description?: string): Promise<DBWorkspace> {
  const now = Date.now();
  const workspace: DBWorkspace = {
    id: uuidv4(),
    name,
    description,
    createdAt: now,
    updatedAt: now,
  };
  await workspacesTable.add(workspace);
  
  // Create default settings for the workspace
  await saveWorkspaceSettings(workspace.id, {
    systemPrompt: DEFAULT_SYSTEM_PROMPT,
    modelSettings: DEFAULT_MODEL_SETTINGS,
    ragSettings: DEFAULT_RAG_SETTINGS,
  });
  
  return workspace;
}

export async function getWorkspace(id: string): Promise<DBWorkspace | null> {
  return (await workspacesTable.get(id)) || null;
}

export async function listWorkspaces(): Promise<DBWorkspace[]> {
  return workspacesTable.toArray();
}

export async function listWorkspacesForUser(userId: string): Promise<DBWorkspace[]> {
  const memberships = await membershipsTable.where('userId').equals(userId).toArray();
  const workspaceIds = memberships.map((m) => m.workspaceId);
  if (workspaceIds.length === 0) return [];
  return workspacesTable.where('id').anyOf(workspaceIds).toArray();
}

export async function updateWorkspace(id: string, updates: Partial<DBWorkspace>): Promise<void> {
  await workspacesTable.update(id, { ...updates, updatedAt: Date.now() });
}

export async function deleteWorkspace(id: string): Promise<void> {
  await db.transaction('rw', [workspacesTable, membershipsTable, filesTable, fileIndexStateTable, workspaceSettingsTable, promptVersionsTable], async () => {
    await workspacesTable.delete(id);
    await membershipsTable.where('workspaceId').equals(id).delete();
    const files = await filesTable.where('workspaceId').equals(id).toArray();
    const docIds = files.map(f => f.docId);
    await filesTable.where('workspaceId').equals(id).delete();
    await fileIndexStateTable.where('docId').anyOf(docIds).delete();
    await workspaceSettingsTable.delete(id);
    await promptVersionsTable.where('workspaceId').equals(id).delete();
  });
}

// ============================================
// Membership Functions
// ============================================
export async function assignUserToWorkspace(
  userId: string,
  workspaceId: string,
  roleInWorkspace?: 'member' | 'manager'
): Promise<DBMembership> {
  const id = `${userId}:${workspaceId}`;
  const existing = await membershipsTable.get(id);
  if (existing) return existing;

  const membership: DBMembership = {
    id,
    userId,
    workspaceId,
    roleInWorkspace,
    createdAt: Date.now(),
  };
  await membershipsTable.add(membership);
  return membership;
}

export async function removeUserFromWorkspace(userId: string, workspaceId: string): Promise<void> {
  const id = `${userId}:${workspaceId}`;
  await membershipsTable.delete(id);
}

export async function getUserWorkspaces(userId: string): Promise<string[]> {
  const memberships = await membershipsTable.where('userId').equals(userId).toArray();
  return memberships.map((m) => m.workspaceId);
}

export async function getWorkspaceMembers(workspaceId: string): Promise<DBUser[]> {
  const memberships = await membershipsTable.where('workspaceId').equals(workspaceId).toArray();
  const userIds = memberships.map((m) => m.userId);
  if (userIds.length === 0) return [];
  return usersTable.where('id').anyOf(userIds).toArray();
}

// ============================================
// Last Workspace Functions
// ============================================
export async function getLastWorkspaceId(): Promise<string | null> {
  const cached = await appCacheTable.get(CACHE_KEYS.LAST_WORKSPACE_ID);
  return (cached?.value as string) || null;
}

export async function setLastWorkspace(workspaceId: string): Promise<void> {
  await appCacheTable.put({
    key: CACHE_KEYS.LAST_WORKSPACE_ID,
    value: workspaceId,
    updatedAt: Date.now(),
  });
}

// ============================================
// File Functions
// ============================================
export async function listFiles(workspaceId: string): Promise<DBFile[]> {
  return filesTable.where('workspaceId').equals(workspaceId).toArray();
}

export async function getFile(docId: string): Promise<DBFile | null> {
  return (await filesTable.get(docId)) || null;
}

export async function upsertFile(file: DBFile): Promise<void> {
  await filesTable.put(file);
}

export async function deleteFile(docId: string): Promise<void> {
  await db.transaction('rw', [filesTable, fileIndexStateTable], async () => {
    await filesTable.delete(docId);
    await fileIndexStateTable.delete(docId);
  });
}

export async function createFile(
  workspaceId: string,
  filename: string,
  size: number,
  fileBlob?: Blob,
  sha256?: string
): Promise<DBFile> {
  const now = Date.now();
  const file: DBFile = {
    docId: uuidv4(),
    workspaceId,
    filename,
    mimeType: 'application/pdf',
    size,
    sha256,
    uploadedAt: now,
    updatedAt: now,
    fileBlob,
    source: fileBlob ? 'local' : 'remote',
  };
  await filesTable.add(file);
  
  // Initialize index state
  await upsertIndexState({
    docId: file.docId,
    workspaceId,
    status: 'not_indexed',
  });
  
  return file;
}

// ============================================
// File Index State Functions
// ============================================
export async function getIndexState(docId: string): Promise<DBFileIndexState | null> {
  return (await fileIndexStateTable.get(docId)) || null;
}

export async function upsertIndexState(state: DBFileIndexState): Promise<void> {
  await fileIndexStateTable.put(state);
}

export async function listNotIndexed(workspaceId: string): Promise<DBFileIndexState[]> {
  return fileIndexStateTable
    .where('[workspaceId+status]')
    .anyOf([
      [workspaceId, 'not_indexed'],
      [workspaceId, 'failed'],
    ])
    .toArray();
}

export async function listIndexedFiles(workspaceId: string): Promise<DBFileIndexState[]> {
  return fileIndexStateTable
    .where('[workspaceId+status]')
    .equals([workspaceId, 'ready'])
    .toArray();
}

export async function getFilesWithIndexState(workspaceId: string): Promise<Array<DBFile & { indexState: DBFileIndexState | null }>> {
  const files = await listFiles(workspaceId);
  const result: Array<DBFile & { indexState: DBFileIndexState | null }> = [];
  
  for (const file of files) {
    const indexState = await getIndexState(file.docId);
    result.push({ ...file, indexState });
  }
  
  return result;
}

// ============================================
// Workspace Settings Functions
// ============================================
export async function getWorkspaceSettings(workspaceId: string): Promise<DBWorkspaceSettings | null> {
  return (await workspaceSettingsTable.get(workspaceId)) || null;
}

export async function saveWorkspaceSettings(
  workspaceId: string,
  settings: {
    systemPrompt?: string;
    systemPromptVersion?: string;
    modelSettings?: ModelSettings;
    ragSettings?: RAGSettings;
  }
): Promise<void> {
  const existing = await getWorkspaceSettings(workspaceId);
  const now = Date.now();

  const updated: DBWorkspaceSettings = {
    workspaceId,
    systemPrompt: settings.systemPrompt ?? existing?.systemPrompt ?? DEFAULT_SYSTEM_PROMPT,
    systemPromptVersion: settings.systemPromptVersion ?? existing?.systemPromptVersion,
    modelSettings: settings.modelSettings ?? existing?.modelSettings ?? DEFAULT_MODEL_SETTINGS,
    ragSettings: settings.ragSettings ?? existing?.ragSettings ?? DEFAULT_RAG_SETTINGS,
    updatedAt: now,
  };

  await workspaceSettingsTable.put(updated);
}

// ============================================
// Prompt Version Functions
// ============================================
export async function addPromptVersion(
  workspaceId: string,
  prompt: string,
  note?: string,
  createdBy?: string
): Promise<DBPromptVersion> {
  const version: DBPromptVersion = {
    id: uuidv4(),
    workspaceId,
    prompt,
    note,
    createdAt: Date.now(),
    createdBy,
  };
  await promptVersionsTable.add(version);
  return version;
}

export async function listPromptVersions(workspaceId: string): Promise<DBPromptVersion[]> {
  return promptVersionsTable
    .where('workspaceId')
    .equals(workspaceId)
    .reverse()
    .sortBy('createdAt');
}

export async function getPromptVersion(id: string): Promise<DBPromptVersion | null> {
  return (await promptVersionsTable.get(id)) || null;
}

// ============================================
// App Cache Functions
// ============================================
export async function getCacheValue<T>(key: string): Promise<T | null> {
  const cached = await appCacheTable.get(key);
  return (cached?.value as T) ?? null;
}

export async function setCacheValue(key: string, value: unknown): Promise<void> {
  await appCacheTable.put({
    key,
    value,
    updatedAt: Date.now(),
  });
}

export async function deleteCacheValue(key: string): Promise<void> {
  await appCacheTable.delete(key);
}

// ============================================
// Keycloak Token Functions
// ============================================
export async function getKeycloakToken(): Promise<string | null> {
  return getCacheValue<string>(CACHE_KEYS.KEYCLOAK_TOKEN);
}

export async function setKeycloakToken(token: string): Promise<void> {
  await setCacheValue(CACHE_KEYS.KEYCLOAK_TOKEN, token);
}

export async function clearKeycloakToken(): Promise<void> {
  await deleteCacheValue(CACHE_KEYS.KEYCLOAK_TOKEN);
}
