// Re-export all API types
export * from './api';

// ============================================
// UI-specific Types
// ============================================

export interface SidebarState {
  isOpen: boolean;
  isMobile: boolean;
}

export interface SourcesPanelState {
  isOpen: boolean;
  selectedCitation?: string;
}

export interface ChatState {
  isStreaming: boolean;
  streamingStatus?: 'searching_pdfs' | 'searching_memory' | 'generating';
  abortController?: AbortController;
}

export interface ThemeMode {
  mode: 'light' | 'dark' | 'system';
  resolved: 'light' | 'dark';
}

export interface UploadProgress {
  docId: string;
  filename: string;
  progress: number;
  status: 'uploading' | 'processing' | 'complete' | 'error';
  errorMessage?: string;
}

// ============================================
// Form Types
// ============================================

export interface ChatComposerForm {
  message: string;
  source: {
    usePdfs: boolean;
    useMemory: boolean;
    docIds?: string[];
  };
}

export interface AdminPromptForm {
  prompt: string;
  notes?: string;
}

export interface AdminRagForm {
  topK: number;
  threshold: number;
  chunkSize: number;
  overlap: number;
  reranker: boolean;
  citationVerbosity: 'minimal' | 'normal' | 'detailed';
}

export interface MemoryEntryForm {
  title: string;
  content: string;
  tags: string;
}

// ============================================
// Navigation Types
// ============================================

export interface NavItem {
  labelKey: string;
  path: string;
  icon: string;
  adminOnly?: boolean;
}

export interface BreadcrumbItem {
  labelKey: string;
  path?: string;
}
