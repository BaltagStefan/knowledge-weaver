import React, { useState, useRef, useCallback, useEffect } from 'react';
import { useTranslation } from '@/hooks/useTranslation';
import { useChatStore, useDocsStore } from '@/store/appStore';
import { validateMessage } from '@/lib/validation';
import { VALIDATION } from '@/types';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
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
} from 'lucide-react';

interface ChatComposerProps {
  onSend: (message: string) => void;
  disabled?: boolean;
  showSuggestions?: boolean;
}

export function ChatComposer({ onSend, disabled = false, showSuggestions = true }: ChatComposerProps) {
  const { t } = useTranslation();
  const textareaRef = useRef<HTMLTextAreaElement>(null);
  const [message, setMessage] = useState('');
  const [validation, setValidation] = useState(validateMessage(''));
  
  const { 
    isStreaming, 
    stopStreaming,
    sourceSettings,
    setSourceSettings,
    selectedDocIds,
    setSelectedDocIds,
    messages,
  } = useChatStore();
  
  const { docs } = useDocsStore();
  const readyDocs = docs.filter(d => d.status === 'ready');
  const showQuickSuggestions = showSuggestions && messages.length === 0 && !message;

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
      if (e.key === 'Escape' && isStreaming) {
        stopStreaming();
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isStreaming, stopStreaming]);

  const handleChange = useCallback((e: React.ChangeEvent<HTMLTextAreaElement>) => {
    const value = e.target.value;
    setMessage(value);
    setValidation(validateMessage(value));
  }, []);

  const handleSend = useCallback(() => {
    if (isStreaming) {
      stopStreaming();
      return;
    }
    
    const trimmed = message.trim();
    if (!trimmed || !validation.isValid || disabled) return;
    
    onSend(trimmed);
    setMessage('');
    setValidation(validateMessage(''));
    textareaRef.current?.focus();
  }, [message, validation.isValid, disabled, isStreaming, stopStreaming, onSend]);

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
                        key={doc.id}
                        className="flex items-center gap-2 p-2 rounded hover:bg-muted cursor-pointer transition-colors"
                        onClick={() => toggleDocSelection(doc.id)}
                      >
                        <Checkbox checked={selectedDocIds.includes(doc.id)} />
                        <span className="text-sm truncate">{doc.filename}</span>
                      </div>
                    ))}
                  </div>
                </ScrollArea>
              </PopoverContent>
            </Popover>
          )}
        </div>

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
          <kbd className="px-1.5 py-0.5 rounded bg-muted text-[10px] font-mono">Enter</kbd> pentru trimitere • 
          <kbd className="px-1.5 py-0.5 rounded bg-muted text-[10px] font-mono ml-1">Shift+Enter</kbd> pentru linie nouă
          {isStreaming && (
            <> • <kbd className="px-1.5 py-0.5 rounded bg-muted text-[10px] font-mono">Esc</kbd> pentru oprire</>
          )}
        </p>
      </div>
    </div>
  );
}
