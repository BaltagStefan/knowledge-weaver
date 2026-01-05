import React, { memo } from 'react';
import { cn } from '@/lib/utils';
import { SafeMarkdown } from './SafeMarkdown';
import { Button } from '@/components/ui/button';
import { useTranslation } from '@/hooks/useTranslation';
import type { Message as MessageType } from '@/types';
import {
  User,
  Bot,
  ChevronDown,
  ChevronUp,
  Clock,
  Cpu,
  Layers,
} from 'lucide-react';

interface ChatMessageProps {
  message: MessageType;
  isStreaming?: boolean;
}

export const ChatMessage = memo(function ChatMessage({
  message,
  isStreaming = false,
}: ChatMessageProps) {
  const { t } = useTranslation();
  const [showMetadata, setShowMetadata] = React.useState(false);
  
  const isUser = message.role === 'user';
  const hasMetadata = message.metadata && (
    message.metadata.model ||
    message.metadata.latencyMs ||
    message.metadata.chunksCount
  );

  return (
    <div
      className={cn(
        "message-enter py-8 px-6",
        isUser ? "bg-background" : "bg-muted/30"
      )}
    >
      <div className="max-w-3xl mx-auto flex gap-4">
        {/* Avatar */}
        <div
          className={cn(
            "flex h-9 w-9 shrink-0 items-center justify-center rounded-full",
            isUser
              ? "bg-primary text-primary-foreground"
              : "bg-primary/10 text-primary"
          )}
        >
          {isUser ? (
            <User className="h-4 w-4" />
          ) : (
            <Bot className="h-5 w-5" />
          )}
        </div>

        {/* Content */}
        <div className="flex-1 min-w-0 space-y-2 pt-1">
          <p className="text-sm font-medium text-foreground mb-2">
            {isUser ? 'Tu' : 'Kotaemon'}
          </p>
          
          <div className="text-foreground leading-relaxed">
            {isUser ? (
              <p className="whitespace-pre-wrap">{message.content}</p>
            ) : (
              <>
                <SafeMarkdown content={message.content} />
                {isStreaming && (
                  <span className="inline-flex ml-1">
                    <span className="animate-pulse text-primary">▊</span>
                  </span>
                )}
              </>
            )}
          </div>

          {!isUser && hasMetadata && !isStreaming && (
            <div className="pt-3">
              <Button
                variant="ghost"
                size="sm"
                className="h-7 text-xs text-muted-foreground hover:text-foreground"
                onClick={() => setShowMetadata(!showMetadata)}
              >
                {showMetadata ? (
                  <ChevronUp className="h-3 w-3 mr-1" />
                ) : (
                  <ChevronDown className="h-3 w-3 mr-1" />
                )}
                {t('chat.metadata')}
              </Button>

              {showMetadata && message.metadata && (
                <div className="mt-2 flex flex-wrap gap-4 text-xs text-muted-foreground">
                  {message.metadata.model && (
                    <div className="flex items-center gap-1">
                      <Cpu className="h-3 w-3" />
                      <span>{t('chat.model')}: {message.metadata.model}</span>
                    </div>
                  )}
                  {message.metadata.latencyMs && (
                    <div className="flex items-center gap-1">
                      <Clock className="h-3 w-3" />
                      <span>{t('chat.latency')}: {message.metadata.latencyMs}ms</span>
                    </div>
                  )}
                  {message.metadata.chunksCount && (
                    <div className="flex items-center gap-1">
                      <Layers className="h-3 w-3" />
                      <span>{t('chat.chunks')}: {message.metadata.chunksCount}</span>
                    </div>
                  )}
                </div>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
});

export function TypingIndicator() {
  return (
    <div className="py-8 px-6 bg-muted/30">
      <div className="max-w-3xl mx-auto flex gap-4">
        <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-primary/10 text-primary">
          <Bot className="h-5 w-5" />
        </div>
        <div className="flex items-center gap-1 py-3">
          <span className="typing-dot" />
          <span className="typing-dot" />
          <span className="typing-dot" />
        </div>
      </div>
    </div>
  );
}
