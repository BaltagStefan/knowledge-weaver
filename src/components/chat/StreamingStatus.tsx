import React from 'react';
import { useTranslation } from '@/hooks/useTranslation';
import { useChatStore } from '@/store/appStore';
import { cn } from '@/lib/utils';
import { Loader2, Sparkles } from 'lucide-react';

export function StreamingStatus() {
  const { t } = useTranslation();
  const isStreaming = useChatStore((state) => state.isStreaming);

  if (!isStreaming) return null;

  return (
    <div className="flex items-center justify-center py-3 px-4">
      <div className={cn(
        "flex items-center gap-2 px-4 py-2 rounded-full",
        "bg-muted/50 border border-border"
      )}>
        <Loader2 className="h-4 w-4 animate-spin text-accent" />
        <Sparkles className="h-4 w-4 text-accent" />
        <span className="text-sm text-muted-foreground">{t('chat.generating')}</span>
      </div>
    </div>
  );
}
