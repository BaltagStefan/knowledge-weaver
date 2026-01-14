import React from 'react';
import { useChatStore } from '@/store/appStore';
import { useTranslation } from '@/hooks/useTranslation';
import { ScrollArea } from '@/components/ui/scroll-area';
import { cn } from '@/lib/utils';
import { Brain, FileText } from 'lucide-react';

export function ReasoningPanel() {
  const { t } = useTranslation();
  const currentCitations = useChatStore((state) => state.currentCitations);
  const selectedCitationId = useChatStore((state) => state.selectedCitationId);
  const selectCitation = useChatStore((state) => state.selectCitation);

  if (currentCitations.length === 0) {
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
        {currentCitations.map((citation, index) => {
          const citationId =
            citation.docId || citation.memoryEntryId || `citation-${index}`;
          const isSelected = selectedCitationId === citationId;
          const title =
            citation.type === 'memory'
              ? citation.memoryTitle || 'Memory'
              : citation.filename || 'Document';
          const pageLabel =
            citation.type === 'pdf' && citation.page ? `p. ${citation.page}` : null;

          return (
            <button
              key={citationId}
              type="button"
              className={cn(
                'w-full text-left rounded-lg border border-border bg-background p-3 transition-colors',
                'hover:bg-muted/50',
                isSelected && 'border-primary/40 bg-muted/50'
              )}
              onClick={() => selectCitation(isSelected ? null : citationId)}
            >
              <div className="flex items-center gap-2">
                {citation.type === 'memory' ? (
                  <Brain className="h-4 w-4 text-muted-foreground" />
                ) : (
                  <FileText className="h-4 w-4 text-muted-foreground" />
                )}
                <span className="text-sm font-medium text-foreground truncate">
                  {title}
                </span>
                {pageLabel && (
                  <span className="text-xs text-muted-foreground">{pageLabel}</span>
                )}
              </div>
              {citation.snippet && (
                <p className="mt-1 text-xs text-muted-foreground">
                  {citation.snippet}
                </p>
              )}
            </button>
          );
        })}
      </div>
    </ScrollArea>
  );
}
