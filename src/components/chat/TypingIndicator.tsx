import React from 'react';
import { cn } from '@/lib/utils';
import { Bot } from 'lucide-react';

interface TypingIndicatorProps {
  className?: string;
}

export function TypingIndicator({ className }: TypingIndicatorProps) {
  return (
    <div className={cn("py-8 px-6 bg-muted/30 animate-fade-in", className)}>
      <div className="max-w-3xl mx-auto flex gap-4">
        <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-primary/10 text-primary">
          <Bot className="h-5 w-5" />
        </div>
        <div className="flex items-center gap-1.5 py-3">
          <span className="h-2 w-2 rounded-full bg-primary/60 animate-pulse-dot" />
          <span 
            className="h-2 w-2 rounded-full bg-primary/60 animate-pulse-dot" 
            style={{ animationDelay: '0.2s' }}
          />
          <span 
            className="h-2 w-2 rounded-full bg-primary/60 animate-pulse-dot" 
            style={{ animationDelay: '0.4s' }}
          />
        </div>
      </div>
    </div>
  );
}
