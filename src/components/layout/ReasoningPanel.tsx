import React from 'react';
import { useChatStore } from '@/store/appStore';
import { useTranslation } from '@/hooks/useTranslation';
import { ScrollArea } from '@/components/ui/scroll-area';
import { cn } from '@/lib/utils';
import { 
  Brain, 
  Search, 
  FileText, 
  Sparkles, 
  CheckCircle2,
  Loader2 
} from 'lucide-react';

const statusIcons: Record<string, React.ReactNode> = {
  searching_pdfs: <Search className="h-4 w-4" />,
  searching_memory: <Brain className="h-4 w-4" />,
  generating: <Sparkles className="h-4 w-4" />,
};

export function ReasoningPanel() {
  const { t } = useTranslation();
  const { reasoningSteps, isReasoning, streamingStatus } = useChatStore();

  const getStatusLabel = () => {
    switch (streamingStatus) {
      case 'searching_pdfs':
        return t('reasoning.searching');
      case 'searching_memory':
        return t('reasoning.processing');
      case 'generating':
        return t('reasoning.generating');
      default:
        return t('reasoning.thinking');
    }
  };

  if (!isReasoning && reasoningSteps.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center h-[calc(100%-4rem)] p-6 text-center">
        <div className="w-12 h-12 rounded-full bg-muted flex items-center justify-center mb-4">
          <Brain className="h-6 w-6 text-muted-foreground" />
        </div>
        <p className="text-sm font-medium text-muted-foreground">
          {t('reasoning.noActivity')}
        </p>
        <p className="text-xs text-muted-foreground mt-1">
          {t('reasoning.noActivityDescription')}
        </p>
      </div>
    );
  }

  return (
    <ScrollArea className="h-[calc(100vh-4rem)]">
      <div className="p-4 space-y-3">
        {/* Current status indicator */}
        {isReasoning && (
          <div className="flex items-center gap-3 p-3 rounded-lg bg-primary/5 border border-primary/10">
            <div className="relative">
              <Loader2 className="h-5 w-5 text-primary animate-spin" />
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-sm font-medium text-primary">
                {getStatusLabel()}
              </p>
            </div>
          </div>
        )}

        {/* Reasoning steps */}
        {reasoningSteps.map((step, index) => (
          <div
            key={index}
            className={cn(
              "flex items-start gap-3 p-3 rounded-lg transition-all",
              index === reasoningSteps.length - 1 && isReasoning
                ? "bg-muted/50"
                : "bg-background"
            )}
          >
            <div className="mt-0.5">
              {index === reasoningSteps.length - 1 && isReasoning ? (
                <Loader2 className="h-4 w-4 text-primary animate-spin" />
              ) : (
                <CheckCircle2 className="h-4 w-4 text-green-500" />
              )}
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-sm text-foreground leading-relaxed">
                {step}
              </p>
            </div>
          </div>
        ))}

        {/* Completion indicator */}
        {!isReasoning && reasoningSteps.length > 0 && (
          <div className="flex items-center gap-2 pt-2 text-xs text-muted-foreground">
            <CheckCircle2 className="h-3.5 w-3.5 text-green-500" />
            <span>{t('reasoning.complete')}</span>
          </div>
        )}
      </div>
    </ScrollArea>
  );
}
