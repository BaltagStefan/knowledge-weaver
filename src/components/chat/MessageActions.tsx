import React, { useState } from 'react';
import { cn } from '@/lib/utils';
import { useTranslation } from '@/hooks/useTranslation';
import { Button } from '@/components/ui/button';
import { toast } from '@/hooks/use-toast';
import {
  Copy,
  Check,
  ThumbsUp,
  ThumbsDown,
  RefreshCw,
  Pencil,
} from 'lucide-react';

interface MessageActionsProps {
  content: string;
  isUser: boolean;
  messageId: string;
  onRegenerate?: () => void;
  onEdit?: () => void;
  className?: string;
}

export function MessageActions({
  content,
  isUser,
  messageId,
  onRegenerate,
  onEdit,
  className,
}: MessageActionsProps) {
  const { t } = useTranslation();
  const [copied, setCopied] = useState(false);
  const [feedback, setFeedback] = useState<'up' | 'down' | null>(null);

  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(content);
      setCopied(true);
      toast({
        description: t('chat.copied'),
      });
      setTimeout(() => setCopied(false), 2000);
    } catch {
      toast({
        description: t('errors.copyFailed'),
        variant: 'destructive',
      });
    }
  };

  const handleFeedback = (type: 'up' | 'down') => {
    setFeedback(type);
    toast({
      description: t('chat.feedbackThanks'),
    });
  };

  return (
    <div
      className={cn(
        "flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity duration-200",
        className
      )}
    >
      {/* Copy button - for all messages */}
      <Button
        variant="ghost"
        size="icon"
        className="h-7 w-7 text-muted-foreground hover:text-foreground hover:bg-muted"
        onClick={handleCopy}
        aria-label={t('chat.copy')}
      >
        {copied ? (
          <Check className="h-3.5 w-3.5 text-success" />
        ) : (
          <Copy className="h-3.5 w-3.5" />
        )}
      </Button>

      {isUser ? (
        /* Edit button - only for user messages */
        <Button
          variant="ghost"
          size="icon"
          className="h-7 w-7 text-muted-foreground hover:text-foreground hover:bg-muted"
          onClick={onEdit}
          aria-label={t('chat.edit')}
        >
          <Pencil className="h-3.5 w-3.5" />
        </Button>
      ) : (
        <>
          {/* Feedback buttons - only for assistant messages */}
          <Button
            variant="ghost"
            size="icon"
            className={cn(
              "h-7 w-7 hover:bg-muted",
              feedback === 'up'
                ? "text-success"
                : "text-muted-foreground hover:text-foreground"
            )}
            onClick={() => handleFeedback('up')}
            disabled={feedback !== null}
            aria-label={t('chat.helpful')}
          >
            <ThumbsUp className="h-3.5 w-3.5" />
          </Button>
          <Button
            variant="ghost"
            size="icon"
            className={cn(
              "h-7 w-7 hover:bg-muted",
              feedback === 'down'
                ? "text-destructive"
                : "text-muted-foreground hover:text-foreground"
            )}
            onClick={() => handleFeedback('down')}
            disabled={feedback !== null}
            aria-label={t('chat.notHelpful')}
          >
            <ThumbsDown className="h-3.5 w-3.5" />
          </Button>

          {/* Regenerate button - only for assistant messages */}
          <Button
            variant="ghost"
            size="icon"
            className="h-7 w-7 text-muted-foreground hover:text-foreground hover:bg-muted"
            onClick={onRegenerate}
            aria-label={t('chat.regenerate')}
          >
            <RefreshCw className="h-3.5 w-3.5" />
          </Button>
        </>
      )}
    </div>
  );
}
