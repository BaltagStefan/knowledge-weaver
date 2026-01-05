import React, { memo } from 'react';
import { cn } from '@/lib/utils';
import { SafeMarkdown } from './SafeMarkdown';
import { Button } from '@/components/ui/button';
import { useTranslation } from '@/hooks/useTranslation';
import { useChatStore } from '@/store/appStore';
import type { Message as MessageType } from '@/types';
import {
  User,
  Sparkles,
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
        "message-enter py-6 px-4 md:px-8",
        isUser ? "bg-chat-user-bg" : "bg-chat-assistant-bg"
      )}
    >
      <div className="max-w-3xl mx-auto flex gap-4">
        {/* Avatar */}
        <div
          className={cn(
            "flex h-8 w-8 shrink-0 items-center justify-center rounded-lg",
            isUser
              ? "bg-primary text-primary-foreground"
              : "bg-accent text-accent-foreground"
          )}
        >
          {isUser ? (
            <User className="h-4 w-4" />
          ) : (
            <Sparkles className="h-4 w-4" />
          )}
        </div>

        {/* Content */}
        <div className="flex-1 min-w-0 space-y-2">
          {/* Message content */}
          <div
            className={cn(
              "text-sm leading-relaxed",
              isUser ? "text-chat-user-fg" : "text-chat-assistant-fg"
            )}
          >
            {isUser ? (
              // User messages are plain text
              <p className="whitespace-pre-wrap">{message.content}</p>
            ) : (
              // Assistant messages rendered as Markdown
              <>
                <SafeMarkdown content={message.content} />
                {isStreaming && (
                  <span className="inline-flex ml-1">
                    <span className="animate-pulse">▊</span>
                  </span>
                )}
              </>
            )}
          </div>

          {/* Metadata toggle (assistant only) */}
          {!isUser && hasMetadata && !isStreaming && (
            <div className="pt-2">
              <Button
                variant="ghost"
                size="sm"
                className="h-7 text-xs text-muted-foreground"
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

// Typing indicator component
export function TypingIndicator() {
  return (
    <div className="py-6 px-4 md:px-8 bg-chat-assistant-bg">
      <div className="max-w-3xl mx-auto flex gap-4">
        <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-accent text-accent-foreground">
          <Sparkles className="h-4 w-4" />
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
