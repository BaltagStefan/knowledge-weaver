import Dexie, { type Table } from 'dexie';
import type {
  DBUser,
  DBWorkspace,
  DBMembership,
  DBFile,
  DBFileIndexState,
  DBWorkspaceSettings,
  DBPromptVersion,
  DBAppCache,
} from '@/types/database';

// ============================================
// Database Class Definition
// ============================================
export class RAGChatDatabase extends Dexie {
  users!: Table<DBUser, string>;
  workspaces!: Table<DBWorkspace, string>;
  memberships!: Table<DBMembership, string>;
  files!: Table<DBFile, string>;
  fileIndexState!: Table<DBFileIndexState, string>;
  workspaceSettings!: Table<DBWorkspaceSettings, string>;
  promptVersions!: Table<DBPromptVersion, string>;
  appCache!: Table<DBAppCache, string>;

  constructor() {
    super('rag_chat_app_db');

    // Version 1: Initial schema
    this.version(1).stores({
      users: 'id, &username, role, isDisabled',
      workspaces: 'id, name',
      memberships: 'id, [userId+workspaceId], userId, workspaceId',
      files: 'docId, workspaceId, [workspaceId+uploadedAt], [workspaceId+filename], sha256',
      fileIndexState: 'docId, workspaceId, [workspaceId+status], [workspaceId+indexedAt]',
      workspaceSettings: 'workspaceId, updatedAt',
      promptVersions: 'id, workspaceId, [workspaceId+createdAt]',
      appCache: 'key, updatedAt',
    });

    // Future migrations example:
    // this.version(2).stores({...}).upgrade(tx => {...});
  }
}

// ============================================
// Database Instance
// ============================================
export const db = new RAGChatDatabase();

// ============================================
// Typed Table Accessors
// ============================================
export const usersTable = db.users;
export const workspacesTable = db.workspaces;
export const membershipsTable = db.memberships;
export const filesTable = db.files;
export const fileIndexStateTable = db.fileIndexState;
export const workspaceSettingsTable = db.workspaceSettings;
export const promptVersionsTable = db.promptVersions;
export const appCacheTable = db.appCache;

// ============================================
// Initialization Check
// ============================================
export async function initializeDatabase(): Promise<void> {
  try {
    await db.open();
    console.log('Database initialized successfully');
  } catch (error) {
    console.error('Failed to initialize database:', error);
    throw error;
  }
}

export default db;
