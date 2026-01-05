import { create } from 'zustand';
import type { DBFile, DBFileIndexState, IndexStatus } from '@/types/database';

// ============================================
// File with Index State
// ============================================
export interface FileWithIndex extends DBFile {
  indexState: DBFileIndexState | null;
}

// ============================================
// Upload Progress
// ============================================
export interface UploadProgress {
  docId: string;
  filename: string;
  progress: number;
  status: 'uploading' | 'processing' | 'complete' | 'error';
  errorMessage?: string;
}

// ============================================
// Files Store State
// ============================================
interface FilesStoreState {
  files: FileWithIndex[];
  selectedDocIds: string[];
  uploadProgress: Map<string, UploadProgress>;
  indexingDocIds: Set<string>;
  isLoading: boolean;
  filter: 'all' | 'indexed' | 'not_indexed';
  searchQuery: string;
  
  // Actions
  setFiles: (files: FileWithIndex[]) => void;
  addFile: (file: FileWithIndex) => void;
  updateFile: (docId: string, updates: Partial<FileWithIndex>) => void;
  removeFile: (docId: string) => void;
  updateIndexState: (docId: string, state: Partial<DBFileIndexState>) => void;
  
  // Selection
  selectFile: (docId: string) => void;
  deselectFile: (docId: string) => void;
  toggleFileSelection: (docId: string) => void;
  selectAllIndexed: () => void;
  clearSelection: () => void;
  setSelectedDocIds: (docIds: string[]) => void;
  
  // Upload Progress
  setUploadProgress: (docId: string, progress: UploadProgress) => void;
  removeUploadProgress: (docId: string) => void;
  clearUploadProgress: () => void;
  
  // Indexing
  setIndexing: (docId: string, isIndexing: boolean) => void;
  setIndexingBatch: (docIds: string[], isIndexing: boolean) => void;
  
  // Filters
  setFilter: (filter: 'all' | 'indexed' | 'not_indexed') => void;
  setSearchQuery: (query: string) => void;
  setLoading: (loading: boolean) => void;
  
  // Helpers
  getFilteredFiles: () => FileWithIndex[];
  getIndexedFiles: () => FileWithIndex[];
  getNotIndexedFiles: () => FileWithIndex[];
  getFileById: (docId: string) => FileWithIndex | undefined;
}

export const useFilesStore = create<FilesStoreState>((set, get) => ({
  files: [],
  selectedDocIds: [],
  uploadProgress: new Map(),
  indexingDocIds: new Set(),
  isLoading: false,
  filter: 'all',
  searchQuery: '',

  setFiles: (files) => set({ files }),

  addFile: (file) =>
    set((state) => ({
      files: [...state.files, file],
    })),

  updateFile: (docId, updates) =>
    set((state) => ({
      files: state.files.map((f) =>
        f.docId === docId ? { ...f, ...updates } : f
      ),
    })),

  removeFile: (docId) =>
    set((state) => ({
      files: state.files.filter((f) => f.docId !== docId),
      selectedDocIds: state.selectedDocIds.filter((id) => id !== docId),
    })),

  updateIndexState: (docId, state) =>
    set((prev) => ({
      files: prev.files.map((f) =>
        f.docId === docId
          ? { ...f, indexState: f.indexState ? { ...f.indexState, ...state } : null }
          : f
      ),
    })),

  // Selection
  selectFile: (docId) =>
    set((state) => ({
      selectedDocIds: state.selectedDocIds.includes(docId)
        ? state.selectedDocIds
        : [...state.selectedDocIds, docId],
    })),

  deselectFile: (docId) =>
    set((state) => ({
      selectedDocIds: state.selectedDocIds.filter((id) => id !== docId),
    })),

  toggleFileSelection: (docId) =>
    set((state) => ({
      selectedDocIds: state.selectedDocIds.includes(docId)
        ? state.selectedDocIds.filter((id) => id !== docId)
        : [...state.selectedDocIds, docId],
    })),

  selectAllIndexed: () => {
    const indexedFiles = get().getIndexedFiles();
    set({ selectedDocIds: indexedFiles.map((f) => f.docId) });
  },

  clearSelection: () => set({ selectedDocIds: [] }),

  setSelectedDocIds: (docIds) => set({ selectedDocIds: docIds }),

  // Upload Progress
  setUploadProgress: (docId, progress) =>
    set((state) => {
      const newProgress = new Map(state.uploadProgress);
      newProgress.set(docId, progress);
      return { uploadProgress: newProgress };
    }),

  removeUploadProgress: (docId) =>
    set((state) => {
      const newProgress = new Map(state.uploadProgress);
      newProgress.delete(docId);
      return { uploadProgress: newProgress };
    }),

  clearUploadProgress: () => set({ uploadProgress: new Map() }),

  // Indexing
  setIndexing: (docId, isIndexing) =>
    set((state) => {
      const newSet = new Set(state.indexingDocIds);
      if (isIndexing) {
        newSet.add(docId);
      } else {
        newSet.delete(docId);
      }
      return { indexingDocIds: newSet };
    }),

  setIndexingBatch: (docIds, isIndexing) =>
    set((state) => {
      const newSet = new Set(state.indexingDocIds);
      docIds.forEach((id) => {
        if (isIndexing) {
          newSet.add(id);
        } else {
          newSet.delete(id);
        }
      });
      return { indexingDocIds: newSet };
    }),

  // Filters
  setFilter: (filter) => set({ filter }),

  setSearchQuery: (query) => set({ searchQuery: query }),

  setLoading: (loading) => set({ isLoading: loading }),

  // Helpers
  getFilteredFiles: () => {
    const { files, filter, searchQuery } = get();
    let filtered = files;

    // Apply status filter
    if (filter === 'indexed') {
      filtered = filtered.filter((f) => f.indexState?.status === 'ready');
    } else if (filter === 'not_indexed') {
      filtered = filtered.filter(
        (f) => !f.indexState || f.indexState.status !== 'ready'
      );
    }

    // Apply search filter
    if (searchQuery) {
      const query = searchQuery.toLowerCase();
      filtered = filtered.filter((f) =>
        f.filename.toLowerCase().includes(query)
      );
    }

    return filtered;
  },

  getIndexedFiles: () => {
    return get().files.filter((f) => f.indexState?.status === 'ready');
  },

  getNotIndexedFiles: () => {
    return get().files.filter(
      (f) => !f.indexState || f.indexState.status !== 'ready'
    );
  },

  getFileById: (docId) => get().files.find((f) => f.docId === docId),
}));
