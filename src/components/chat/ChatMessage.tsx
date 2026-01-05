import React, { memo, useState } from 'react';
import { cn } from '@/lib/utils';
import { SafeMarkdown } from './SafeMarkdown';
import { MessageActions } from './MessageActions';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
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
  Check,
  X,
} from 'lucide-react';

interface ChatMessageProps {
  message: MessageType;
  isStreaming?: boolean;
  onRegenerate?: () => void;
  onEditSubmit?: (newContent: string) => void;
}

export const ChatMessage = memo(function ChatMessage({
  message,
  isStreaming = false,
  onRegenerate,
  onEditSubmit,
}: ChatMessageProps) {
  const { t } = useTranslation();
  const [showMetadata, setShowMetadata] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const [editContent, setEditContent] = useState(message.content);
  
  const isUser = message.role === 'user';
  const hasMetadata = message.metadata && (
    message.metadata.model ||
    message.metadata.latencyMs ||
    message.metadata.chunksCount
  );

  const handleEdit = () => {
    setEditContent(message.content);
    setIsEditing(true);
  };

  const handleEditCancel = () => {
    setIsEditing(false);
    setEditContent(message.content);
  };

  const handleEditSubmit = () => {
    if (editContent.trim() && onEditSubmit) {
      onEditSubmit(editContent.trim());
    }
    setIsEditing(false);
  };

  return (
    <div
      className={cn(
        "group py-6 px-6 animate-fade-in-up",
        isUser ? "bg-background" : "bg-muted/30"
      )}
    >
      <div className="max-w-3xl mx-auto flex gap-4">
        {/* Avatar */}
        <div
          className={cn(
            "flex h-8 w-8 shrink-0 items-center justify-center rounded-full transition-transform duration-200 group-hover:scale-105",
            isUser
              ? "bg-primary text-primary-foreground"
              : "bg-primary/10 text-primary"
          )}
        >
          {isUser ? (
            <User className="h-4 w-4" />
          ) : (
            <Bot className="h-4 w-4" />
          )}
        </div>

        {/* Content */}
        <div className="flex-1 min-w-0 space-y-2">
          <div className="flex items-center justify-between">
            <p className="text-sm font-medium text-foreground">
              {isUser ? 'Tu' : 'Kotaemon'}
            </p>
            
            {/* Message Actions */}
            {!isStreaming && !isEditing && (
              <MessageActions
                content={message.content}
                isUser={isUser}
                messageId={message.id}
                onRegenerate={onRegenerate}
                onEdit={handleEdit}
              />
            )}
          </div>
          
          <div className="text-foreground leading-relaxed">
            {isEditing ? (
              <div className="space-y-2">
                <Textarea
                  value={editContent}
                  onChange={(e) => setEditContent(e.target.value)}
                  className="min-h-[100px] resize-none"
                  autoFocus
                />
                <div className="flex items-center gap-2">
                  <Button size="sm" onClick={handleEditSubmit}>
                    <Check className="h-3 w-3 mr-1" />
                    {t('common.save')}
                  </Button>
                  <Button size="sm" variant="ghost" onClick={handleEditCancel}>
                    <X className="h-3 w-3 mr-1" />
                    {t('common.cancel')}
                  </Button>
                </div>
              </div>
            ) : isUser ? (
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

          {!isUser && hasMetadata && !isStreaming && !isEditing && (
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
                <div className="mt-2 flex flex-wrap gap-4 text-xs text-muted-foreground animate-fade-in">
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
