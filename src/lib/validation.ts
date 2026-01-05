// ============================================
// Validation Utilities
// Input validation with XSS prevention
// ============================================

import { VALIDATION } from '@/types';

// ============================================
// Text Sanitization
// ============================================

// Escape HTML entities to prevent XSS
export function escapeHtml(text: string): string {
  const map: Record<string, string> = {
    '&': '&amp;',
    '<': '&lt;',
    '>': '&gt;',
    '"': '&quot;',
    "'": '&#039;',
  };
  return text.replace(/[&<>"']/g, (char) => map[char]);
}

// Sanitize filename for display (prevent directory traversal and XSS)
export function sanitizeFilename(filename: string): string {
  // Remove path separators and dangerous characters
  const sanitized = filename
    .replace(/[/\\]/g, '_')
    .replace(/[<>:"|?*]/g, '_')
    .replace(/\.\./g, '_')
    .trim();
  
  // Limit length
  if (sanitized.length > VALIDATION.FILENAME_MAX_LENGTH) {
    const ext = sanitized.split('.').pop() || '';
    const name = sanitized.slice(0, VALIDATION.FILENAME_MAX_LENGTH - ext.length - 1);
    return `${name}.${ext}`;
  }
  
  return sanitized || 'unnamed';
}

// ============================================
// URL Validation
// ============================================

// Check if URL is safe (no javascript:, data:, etc.)
export function isSafeUrl(url: string): boolean {
  try {
    const parsed = new URL(url, window.location.origin);
    const allowedProtocols = ['http:', 'https:', 'mailto:'];
    return allowedProtocols.includes(parsed.protocol);
  } catch {
    return false;
  }
}

// Validate external URL and return safe props
export function getSafeLinkProps(url: string): {
  href: string;
  target?: string;
  rel?: string;
} {
  if (!isSafeUrl(url)) {
    return { href: '#' };
  }
  
  try {
    const parsed = new URL(url, window.location.origin);
    const isExternal = parsed.origin !== window.location.origin;
    
    if (isExternal) {
      return {
        href: url,
        target: '_blank',
        rel: 'noopener noreferrer',
      };
    }
    
    return { href: url };
  } catch {
    return { href: '#' };
  }
}

// ============================================
// Message Validation
// ============================================

export interface MessageValidation {
  isValid: boolean;
  error?: string;
  charCount: number;
  remaining: number;
}

export function validateMessage(message: string): MessageValidation {
  const trimmed = message.trim();
  const charCount = trimmed.length;
  const remaining = VALIDATION.MESSAGE_MAX_LENGTH - charCount;
  
  if (charCount < VALIDATION.MESSAGE_MIN_LENGTH) {
    return {
      isValid: false,
      error: 'Message cannot be empty',
      charCount,
      remaining,
    };
  }
  
  if (charCount > VALIDATION.MESSAGE_MAX_LENGTH) {
    return {
      isValid: false,
      error: `Message exceeds maximum length of ${VALIDATION.MESSAGE_MAX_LENGTH} characters`,
      charCount,
      remaining,
    };
  }
  
  return {
    isValid: true,
    charCount,
    remaining,
  };
}

// ============================================
// File Validation
// ============================================

export interface FileValidation {
  isValid: boolean;
  error?: string;
}

export function validatePdfFile(file: File): FileValidation {
  // Check file type
  if (!file.name.toLowerCase().endsWith('.pdf') && file.type !== 'application/pdf') {
    return {
      isValid: false,
      error: 'Only PDF files are allowed',
    };
  }
  
  // Check file size
  if (file.size > VALIDATION.PDF_MAX_SIZE_BYTES) {
    return {
      isValid: false,
      error: `File size exceeds maximum of ${VALIDATION.PDF_MAX_SIZE_MB}MB`,
    };
  }
  
  // Check filename
  if (file.name.includes('..') || file.name.includes('/') || file.name.includes('\\')) {
    return {
      isValid: false,
      error: 'Invalid filename',
    };
  }
  
  return { isValid: true };
}

// ============================================
// Memory Entry Validation
// ============================================

export function validateMemoryEntry(title: string, content: string): {
  isValid: boolean;
  errors: { title?: string; content?: string };
} {
  const errors: { title?: string; content?: string } = {};
  
  if (!title.trim()) {
    errors.title = 'Title is required';
  } else if (title.length > VALIDATION.MEMORY_TITLE_MAX_LENGTH) {
    errors.title = `Title exceeds maximum of ${VALIDATION.MEMORY_TITLE_MAX_LENGTH} characters`;
  }
  
  if (!content.trim()) {
    errors.content = 'Content is required';
  } else if (content.length > VALIDATION.MEMORY_CONTENT_MAX_LENGTH) {
    errors.content = `Content exceeds maximum of ${VALIDATION.MEMORY_CONTENT_MAX_LENGTH} characters`;
  }
  
  return {
    isValid: Object.keys(errors).length === 0,
    errors,
  };
}

// ============================================
// System Prompt Validation
// ============================================

export function validateSystemPrompt(prompt: string): {
  isValid: boolean;
  error?: string;
} {
  if (!prompt.trim()) {
    return {
      isValid: false,
      error: 'System prompt cannot be empty',
    };
  }
  
  if (prompt.length > VALIDATION.SYSTEM_PROMPT_MAX_LENGTH) {
    return {
      isValid: false,
      error: `Prompt exceeds maximum of ${VALIDATION.SYSTEM_PROMPT_MAX_LENGTH} characters`,
    };
  }
  
  return { isValid: true };
}

// ============================================
// Format Utilities
// ============================================

export function formatFileSize(bytes: number): string {
  if (bytes === 0) return '0 B';
  
  const k = 1024;
  const sizes = ['B', 'KB', 'MB', 'GB'];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  
  return `${parseFloat((bytes / Math.pow(k, i)).toFixed(1))} ${sizes[i]}`;
}

export function formatDate(dateString: string, locale: string = 'ro-RO'): string {
  try {
    const date = new Date(dateString);
    return date.toLocaleDateString(locale, {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });
  } catch {
    return dateString;
  }
}

export function formatRelativeTime(dateString: string, locale: string = 'ro-RO'): string {
  try {
    const date = new Date(dateString);
    const now = new Date();
    const diffMs = now.getTime() - date.getTime();
    const diffMins = Math.floor(diffMs / 60000);
    const diffHours = Math.floor(diffMins / 60);
    const diffDays = Math.floor(diffHours / 24);
    
    if (diffMins < 1) return locale === 'ro' ? 'Acum' : 'Just now';
    if (diffMins < 60) return `${diffMins} ${locale === 'ro' ? 'min' : 'min'}`;
    if (diffHours < 24) return `${diffHours} ${locale === 'ro' ? 'ore' : 'hours'}`;
    if (diffDays < 7) return `${diffDays} ${locale === 'ro' ? 'zile' : 'days'}`;
    
    return formatDate(dateString, locale);
  } catch {
    return dateString;
  }
}
