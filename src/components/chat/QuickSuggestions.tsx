import React from 'react';
import { useTranslation } from '@/hooks/useTranslation';
import { cn } from '@/lib/utils';
import {
  Lightbulb,
  FileSearch,
  HelpCircle,
  Sparkles,
} from 'lucide-react';

interface QuickSuggestionsProps {
  onSelect: (suggestion: string) => void;
  className?: string;
}

const icons = [Lightbulb, FileSearch, HelpCircle, Sparkles];

export function QuickSuggestions({ onSelect, className }: QuickSuggestionsProps) {
  const { t } = useTranslation();

  const suggestions = [
    t('suggestions.summarize'),
    t('suggestions.findInfo'),
    t('suggestions.explain'),
    t('suggestions.compare'),
  ];

  return (
    <div className={cn("flex flex-wrap gap-2", className)}>
      {suggestions.map((suggestion, index) => {
        const Icon = icons[index];
        return (
          <button
            key={index}
            onClick={() => onSelect(suggestion)}
            className={cn(
              "group flex items-center gap-2 px-3 py-2 rounded-xl",
              "bg-muted/50 hover:bg-muted border border-transparent hover:border-border",
              "text-sm text-muted-foreground hover:text-foreground",
              "transition-all duration-200 hover:shadow-sm",
              "animate-fade-in-up"
            )}
            style={{ animationDelay: `${index * 50}ms` }}
          >
            <Icon className="h-4 w-4 text-primary/70 group-hover:text-primary transition-colors" />
            <span>{suggestion}</span>
          </button>
        );
      })}
    </div>
  );
}
