import React, { useState, useRef, useCallback, useEffect } from 'react';
import { useTranslation } from '@/hooks/useTranslation';
import { useChatStore, useDocsStore } from '@/store/appStore';
import { validateMessage } from '@/lib/validation';
import { VALIDATION } from '@/types';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Badge } from '@/components/ui/badge';
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from '@/components/ui/popover';
import { Checkbox } from '@/components/ui/checkbox';
import { Label } from '@/components/ui/label';
import { ScrollArea } from '@/components/ui/scroll-area';
import { cn } from '@/lib/utils';
import {
  Send,
  Square,
  Settings2,
  FileText,
  Brain,
  ChevronDown,
  AlertCircle,
} from 'lucide-react';

interface ChatComposerProps {
  onSend: (message: string) => void;
  disabled?: boolean;
}

export function ChatComposer({ onSend, disabled = false }: ChatComposerProps) {
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
  } = useChatStore();
  
  const { docs } = useDocsStore();
  const readyDocs = docs.filter(d => d.status === 'ready');

  // Auto-resize textarea
  useEffect(() => {
    const textarea = textareaRef.current;
    if (textarea) {
      textarea.style.height = 'auto';
      textarea.style.height = `${Math.min(textarea.scrollHeight, 200)}px`;
    }
  }, [message]);

  // Handle message change with validation
  const handleChange = useCallback((e: React.ChangeEvent<HTMLTextAreaElement>) => {
    const value = e.target.value;
    setMessage(value);
    setValidation(validateMessage(value));
  }, []);

  // Handle send
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
    
    // Focus textarea after sending
    textareaRef.current?.focus();
  }, [message, validation.isValid, disabled, isStreaming, stopStreaming, onSend]);

  // Handle keyboard shortcuts
  const handleKeyDown = useCallback((e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  }, [handleSend]);

  const toggleDocSelection = (docId: string) => {
    setSelectedDocIds(
      selectedDocIds.includes(docId)
        ? selectedDocIds.filter(id => id !== docId)
        : [...selectedDocIds, docId]
    );
  };

  return (
    <div className="border-t bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
      <div className="max-w-3xl mx-auto p-4">
        {/* Source settings bar */}
        <div className="flex items-center gap-2 mb-3 flex-wrap">
          {/* PDF toggle */}
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
              className="text-sm cursor-pointer flex items-center gap-1"
            >
              <FileText className="h-3.5 w-3.5" />
              {t('sources.usePdfs')}
            </Label>
          </div>

          {/* Memory toggle */}
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
              className="text-sm cursor-pointer flex items-center gap-1"
            >
              <Brain className="h-3.5 w-3.5" />
              {t('sources.useMemory')}
            </Label>
          </div>

          {/* Document selector */}
          {sourceSettings.usePdfs && readyDocs.length > 0 && (
            <Popover>
              <PopoverTrigger asChild>
                <Button variant="outline" size="sm" className="h-8 gap-1">
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
                        className="flex items-center gap-2 p-2 rounded hover:bg-muted cursor-pointer"
                        onClick={() => toggleDocSelection(doc.id)}
                      >
                        <Checkbox
                          checked={selectedDocIds.includes(doc.id)}
                          onCheckedChange={() => toggleDocSelection(doc.id)}
                        />
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
        <div className="relative">
          <Textarea
            ref={textareaRef}
            value={message}
            onChange={handleChange}
            onKeyDown={handleKeyDown}
            placeholder={t('chat.placeholder')}
            disabled={disabled}
            className={cn(
              "min-h-[52px] max-h-[200px] resize-none pr-24 py-3",
              "focus-visible:ring-accent",
              !validation.isValid && message.length > 0 && "border-destructive"
            )}
            rows={1}
            aria-label={t('chat.placeholder')}
          />

          {/* Character counter */}
          <div className="absolute bottom-3 right-16 text-xs text-muted-foreground">
            <span className={cn(validation.remaining < 100 && "text-warning")}>
              {validation.charCount}
            </span>
            <span>/{VALIDATION.MESSAGE_MAX_LENGTH}</span>
          </div>

          {/* Send/Stop button */}
          <Button
            onClick={handleSend}
            disabled={!isStreaming && (!validation.isValid || disabled)}
            size="icon"
            className={cn(
              "absolute bottom-2 right-2 h-9 w-9",
              isStreaming 
                ? "bg-destructive hover:bg-destructive/90" 
                : "bg-accent hover:bg-accent/90"
            )}
            aria-label={isStreaming ? t('chat.stop') : t('chat.send')}
          >
            {isStreaming ? (
              <Square className="h-4 w-4" />
            ) : (
              <Send className="h-4 w-4" />
            )}
          </Button>
        </div>

        {/* Validation error */}
        {!validation.isValid && message.length > 0 && (
          <div className="flex items-center gap-1 mt-2 text-xs text-destructive">
            <AlertCircle className="h-3 w-3" />
            <span>{validation.error}</span>
          </div>
        )}
      </div>
    </div>
  );
}
