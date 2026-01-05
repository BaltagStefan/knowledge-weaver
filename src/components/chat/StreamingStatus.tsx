import React from 'react';
import { useTranslation } from '@/hooks/useTranslation';
import { useChatStore } from '@/store/appStore';
import { cn } from '@/lib/utils';
import { Loader2, Search, FileText, Brain, Sparkles } from 'lucide-react';

export function StreamingStatus() {
  const { t } = useTranslation();
  const { isStreaming, streamingStatus } = useChatStore();

  if (!isStreaming || streamingStatus === 'idle') return null;

  const statusConfig = {
    searching_pdfs: {
      icon: FileText,
      text: t('chat.searchingPdfs'),
      color: 'text-blue-500',
    },
    searching_memory: {
      icon: Brain,
      text: t('chat.searchingMemory'),
      color: 'text-purple-500',
    },
    generating: {
      icon: Sparkles,
      text: t('chat.generating'),
      color: 'text-accent',
    },
  };

  const config = statusConfig[streamingStatus];
  if (!config) return null;

  const Icon = config.icon;

  return (
    <div className="flex items-center justify-center py-3 px-4">
      <div className={cn(
        "flex items-center gap-2 px-4 py-2 rounded-full",
        "bg-muted/50 border border-border"
      )}>
        <Loader2 className={cn("h-4 w-4 animate-spin", config.color)} />
        <Icon className={cn("h-4 w-4", config.color)} />
        <span className="text-sm text-muted-foreground">{config.text}</span>
      </div>
    </div>
  );
}
