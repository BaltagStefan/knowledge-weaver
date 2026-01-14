import React, { useState, useRef, useCallback, useEffect, useMemo } from 'react';
import { useTranslation } from '@/hooks/useTranslation';
import { useChatStore } from '@/store/appStore';
import { useFilesStore } from '@/store/filesStore';
import { useAuthStore } from '@/store/authStore';
import { validateMessage } from '@/lib/validation';
import { VALIDATION } from '@/types';
import { createFile, upsertIndexState } from '@/db/repo';
import { filesApi } from '@/api/n8nClient';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Progress } from '@/components/ui/progress';
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from '@/components/ui/popover';
import { Checkbox } from '@/components/ui/checkbox';
import { Label } from '@/components/ui/label';
import { ScrollArea } from '@/components/ui/scroll-area';
import { QuickSuggestions } from './QuickSuggestions';
import { cn } from '@/lib/utils';
import {
  Send,
  Square,
  FileText,
  Brain,
  ChevronDown,
  Upload,
} from 'lucide-react';
import { useParams } from 'react-router-dom';
import { toast } from '@/hooks/use-toast';
import { MaliciousPdfDialog } from '@/components/common/MaliciousPdfDialog';
import { isPdfLikelyMalicious } from '@/lib/pdfSecurity';

interface ChatComposerProps {
  onSend: (message: string) => void;
  disabled?: boolean;
  showSuggestions?: boolean;
}

export function ChatComposer({ onSend, disabled = false, showSuggestions = true }: ChatComposerProps) {
  const { t } = useTranslation();
  const textareaRef = useRef<HTMLTextAreaElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [message, setMessage] = useState('');
  const [validation, setValidation] = useState(validateMessage(''));
  const [maliciousDialogOpen, setMaliciousDialogOpen] = useState(false);
  
  const { 
    isStreaming, 
    streamingConversationId,
    currentConversationId,
    stopStreaming,
    sourceSettings,
    setSourceSettings,
    selectedDocIds,
    setSelectedDocIds,
    messages,
  } = useChatStore();
  
  const { user } = useAuthStore();
  const { workspaceId } = useParams<{ workspaceId?: string }>();
  const {
    files,
    addFile,
    updateIndexState,
    setUploadProgress,
    removeUploadProgress,
    setIndexing,
    uploadProgress,
  } = useFilesStore();
  const readyDocs = useMemo(
    () => files.filter((file) => file.indexState?.status === 'ready'),
    [files]
  );
  const showQuickSuggestions = showSuggestions && messages.length === 0 && !message;
  const activeConversationId = streamingConversationId || currentConversationId;
  const uploadProgressList = useMemo(
    () => Array.from(uploadProgress.values()),
    [uploadProgress]
  );

  useEffect(() => {
    const textarea = textareaRef.current;
    if (textarea) {
      textarea.style.height = 'auto';
      textarea.style.height = `${Math.min(textarea.scrollHeight, 200)}px`;
    }
  }, [message]);

  // Keyboard shortcuts
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      // Escape to stop streaming
      if (e.key === 'Escape' && isStreaming && activeConversationId) {
        stopStreaming(activeConversationId);
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [activeConversationId, isStreaming, stopStreaming]);

  const handleChange = useCallback((e: React.ChangeEvent<HTMLTextAreaElement>) => {
    const value = e.target.value;
    setMessage(value);
    setValidation(validateMessage(value));
  }, []);

  const handleSend = useCallback(() => {
    if (isStreaming) {
      if (activeConversationId) {
        stopStreaming(activeConversationId);
      }
      return;
    }
    
    const trimmed = message.trim();
    if (!trimmed || !validation.isValid || disabled) return;
    
    onSend(trimmed);
    setMessage('');
    setValidation(validateMessage(''));
    textareaRef.current?.focus();
  }, [activeConversationId, message, validation.isValid, disabled, isStreaming, stopStreaming, onSend]);

  const handleKeyDown = useCallback((e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  }, [handleSend]);

  const handleSuggestionSelect = useCallback((suggestion: string) => {
    setMessage(suggestion);
    setValidation(validateMessage(suggestion));
    textareaRef.current?.focus();
  }, []);

  const toggleDocSelection = (docId: string) => {
    setSelectedDocIds(
      selectedDocIds.includes(docId)
        ? selectedDocIds.filter(id => id !== docId)
        : [...selectedDocIds, docId]
    );
  };

  const handleUploadFiles = useCallback(async (filesToUpload: File[]) => {
    if (!workspaceId || !user) return;

    for (const file of filesToUpload) {
      const suspicious = await isPdfLikelyMalicious(file);
      if (suspicious) {
        setMaliciousDialogOpen(true);
        continue;
      }
      if (file.type !== 'application/pdf') {
        toast({
          title: t('files.uploadInvalidTitle'),
          description: t('files.uploadInvalidDescription'),
          variant: 'destructive',
        });
        continue;
      }

      if (file.size > VALIDATION.PDF_MAX_SIZE_BYTES) {
        toast({
          title: t('files.uploadErrorTitle'),
          description: t('library.fileTooLarge'),
          variant: 'destructive',
        });
        continue;
      }

      const tempId = `temp-${Date.now()}-${file.name}`;
      setUploadProgress(tempId, {
        docId: tempId,
        filename: file.name,
        progress: 0,
        status: 'uploading',
      });

      try {
        const dbFile = await createFile(workspaceId, file.name, file.size, file);
        addFile({
          ...dbFile,
          indexState: {
            docId: dbFile.docId,
            workspaceId,
            status: 'not_indexed',
          },
        });
        setSourceSettings({ usePdfs: true });

        let uploadSucceeded = false;
        try {
          await filesApi.upload(
            workspaceId,
            file,
            {
              userId: user.id,
              username: user.username,
              role: user.role,
            },
            (progress) => {
              setUploadProgress(tempId, {
                docId: dbFile.docId,
                filename: file.name,
                progress: Math.min(70, progress * 0.7),
                status: 'uploading',
              });
            }
          );
          uploadSucceeded = true;
        } catch {
          toast({
            title: t('files.uploadErrorTitle'),
            description: t('files.uploadErrorDescription').replace('{filename}', file.name),
            variant: 'destructive',
          });
        }

        if (uploadSucceeded) {
          setIndexing(dbFile.docId, true);
          await upsertIndexState({
            docId: dbFile.docId,
            workspaceId,
            status: 'indexing',
            lastAttemptAt: Date.now(),
          });
          updateIndexState(dbFile.docId, { status: 'indexing' });

          try {
            const response = await filesApi.index(workspaceId, [dbFile.docId], {
              userId: user.id,
              username: user.username,
              role: user.role,
            });
            if (response.success && response.data?.indexed?.includes(dbFile.docId)) {
              await upsertIndexState({
                docId: dbFile.docId,
                workspaceId,
                status: 'ready',
                indexedAt: Date.now(),
              });
              updateIndexState(dbFile.docId, { status: 'ready', indexedAt: Date.now() });
              const currentSelected = useChatStore.getState().selectedDocIds;
              setSelectedDocIds(Array.from(new Set([...currentSelected, dbFile.docId])));
            } else {
              await upsertIndexState({
                docId: dbFile.docId,
                workspaceId,
                status: 'failed',
                lastError: 'Indexare eșuată',
                lastAttemptAt: Date.now(),
              });
              updateIndexState(dbFile.docId, { status: 'failed' });
            }
          } catch {
            await upsertIndexState({
              docId: dbFile.docId,
              workspaceId,
              status: 'failed',
              lastError: 'Indexare eșuată',
              lastAttemptAt: Date.now(),
            });
            updateIndexState(dbFile.docId, { status: 'failed' });
          } finally {
            setIndexing(dbFile.docId, false);
          }
        }

        setUploadProgress(tempId, {
          docId: dbFile.docId,
          filename: file.name,
          progress: 100,
          status: uploadSucceeded ? 'complete' : 'error',
        });
        setTimeout(() => removeUploadProgress(tempId), 1500);
      } catch {
        setUploadProgress(tempId, {
          docId: tempId,
          filename: file.name,
          progress: 0,
          status: 'error',
        });
        toast({
          title: t('files.uploadErrorTitle'),
          description: t('files.uploadErrorDescription').replace('{filename}', file.name),
          variant: 'destructive',
        });
      }
    }
  }, [
    workspaceId,
    user,
    setUploadProgress,
    addFile,
    setSourceSettings,
    setSelectedDocIds,
    updateIndexState,
    setIndexing,
    removeUploadProgress,
    t,
  ]);

  const handleFileSelect = useCallback(async (e: React.ChangeEvent<HTMLInputElement>) => {
    const filesToUpload = Array.from(e.target.files || []);
    if (filesToUpload.length > 0) {
      await handleUploadFiles(filesToUpload);
    }
    e.target.value = '';
  }, [handleUploadFiles]);

  return (
    <div className="border-t bg-background">
      <div className="max-w-3xl mx-auto p-4">
        {/* Quick Suggestions */}
        {showQuickSuggestions && (
          <div className="mb-4">
            <QuickSuggestions onSelect={handleSuggestionSelect} />
          </div>
        )}

        {/* Source settings */}
        <div className="flex items-center gap-4 mb-3 flex-wrap">
          <div className="flex items-center gap-2">
            <Checkbox
              id="use-pdfs"
              checked={sourceSettings.usePdfs}
              onCheckedChange={(checked) => 
                setSourceSettings({ usePdfs: checked === true })
              }
              disabled={disabled}
            />
            <Label 
              htmlFor="use-pdfs" 
              className="text-sm cursor-pointer flex items-center gap-1.5 text-muted-foreground hover:text-foreground transition-colors"
            >
              <FileText className="h-3.5 w-3.5" />
              {t('sources.usePdfs')}
            </Label>
          </div>

          <div className="flex items-center gap-2">
            <Checkbox
              id="use-memory"
              checked={sourceSettings.useMemory}
              onCheckedChange={(checked) => 
                setSourceSettings({ useMemory: checked === true })
              }
              disabled={disabled}
            />
            <Label 
              htmlFor="use-memory" 
              className="text-sm cursor-pointer flex items-center gap-1.5 text-muted-foreground hover:text-foreground transition-colors"
            >
              <Brain className="h-3.5 w-3.5" />
              {t('sources.useMemory')}
            </Label>
          </div>

          {sourceSettings.usePdfs && readyDocs.length > 0 && (
            <Popover>
              <PopoverTrigger asChild>
                <Button 
                  variant="outline" 
                  size="sm" 
                  className="h-8 gap-1.5 text-muted-foreground hover:text-foreground transition-colors"
                >
                  <FileText className="h-3.5 w-3.5" />
                  {selectedDocIds.length > 0 
                    ? `${selectedDocIds.length} ${t('common.selected')}`
                    : t('sources.allDocs')
                  }
                  <ChevronDown className="h-3 w-3" />
                </Button>
              </PopoverTrigger>
              <PopoverContent className="w-64 p-2" align="start">
                <ScrollArea className="max-h-48">
                  <div className="space-y-1">
                    {readyDocs.map((doc) => (
                      <div
                        key={doc.docId}
                        className="flex items-center gap-2 p-2 rounded hover:bg-muted cursor-pointer transition-colors"
                        onClick={() => toggleDocSelection(doc.docId)}
                      >
                        <Checkbox checked={selectedDocIds.includes(doc.docId)} />
                        <span className="text-sm truncate">{doc.filename}</span>
                      </div>
                    ))}
                  </div>
                </ScrollArea>
              </PopoverContent>
            </Popover>
          )}

          <input
            ref={fileInputRef}
            type="file"
            accept="application/pdf"
            multiple
            className="hidden"
            onChange={handleFileSelect}
          />
          <Button
            variant="outline"
            size="sm"
            className="h-8 gap-1.5 text-muted-foreground hover:text-foreground transition-colors"
            onClick={() => fileInputRef.current?.click()}
            disabled={disabled || !workspaceId || !user}
          >
            <Upload className="h-3.5 w-3.5" />
            {t('sources.uploadPdf')}
          </Button>
        </div>

        {uploadProgressList.length > 0 && (
          <div className="mb-4 space-y-2">
            {uploadProgressList.map((progress) => (
              <div key={progress.docId} className="space-y-1">
                <div className="flex items-center justify-between text-xs text-muted-foreground">
                  <span className="truncate">{progress.filename}</span>
                  <span>{Math.round(progress.progress)}%</span>
                </div>
                <Progress value={progress.progress} className="h-1" />
              </div>
            ))}
          </div>
        )}

        {/* Input area */}
        <div className="relative flex items-end gap-2">
          <div className="flex-1 relative">
            <Textarea
              ref={textareaRef}
              value={message}
              onChange={handleChange}
              onKeyDown={handleKeyDown}
              placeholder={t('chat.placeholder')}
              disabled={disabled}
              className={cn(
                "min-h-[52px] max-h-[200px] resize-none pr-16 py-3 rounded-xl border-2",
                "focus-visible:ring-0 focus-visible:border-primary transition-all duration-200",
                !validation.isValid && message.length > 0 && "border-destructive"
              )}
              rows={1}
              aria-label={t('chat.placeholder')}
            />
            
            <div className="absolute bottom-3 right-14 text-xs text-muted-foreground">
              <span className={cn(validation.remaining < 100 && "text-warning")}>
                {validation.charCount}
              </span>
              <span>/{VALIDATION.MESSAGE_MAX_LENGTH}</span>
            </div>
          </div>

          <Button
            onClick={handleSend}
            disabled={!isStreaming && (!validation.isValid || disabled)}
            size="icon"
            className={cn(
              "h-[52px] w-[52px] rounded-xl shrink-0 transition-all duration-200",
              isStreaming 
                ? "bg-destructive hover:bg-destructive/90" 
                : "bg-primary hover:bg-primary/90 hover:scale-105"
            )}
            aria-label={isStreaming ? t('chat.stop') : t('chat.send')}
          >
            {isStreaming ? (
              <Square className="h-5 w-5" />
            ) : (
              <Send className="h-5 w-5" />
            )}
          </Button>
        </div>

        {/* Keyboard hint */}
        <p className="text-xs text-muted-foreground mt-2 text-center">
          <kbd className="px-1.5 py-0.5 rounded bg-muted text-[10px] font-mono">Enter</kbd> {t('chat.hintSend')}
          <span className="mx-1">/</span>
          <kbd className="px-1.5 py-0.5 rounded bg-muted text-[10px] font-mono">Shift+Enter</kbd> {t('chat.hintNewLine')}
          {isStreaming && (
            <>
              <span className="mx-1">/</span>
              <kbd className="px-1.5 py-0.5 rounded bg-muted text-[10px] font-mono">Esc</kbd> {t('chat.hintStop')}
            </>
          )}
        </p>
      </div>

      <MaliciousPdfDialog
        open={maliciousDialogOpen}
        onClose={() => setMaliciousDialogOpen(false)}
      />
    </div>
  );
}
