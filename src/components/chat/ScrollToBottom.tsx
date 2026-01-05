import React from 'react';
import { cn } from '@/lib/utils';
import { Button } from '@/components/ui/button';
import { ArrowDown } from 'lucide-react';

interface ScrollToBottomProps {
  visible: boolean;
  onClick: () => void;
  className?: string;
}

export function ScrollToBottom({ visible, onClick, className }: ScrollToBottomProps) {
  if (!visible) return null;

  return (
    <Button
      variant="secondary"
      size="icon"
      onClick={onClick}
      className={cn(
        "fixed bottom-32 right-8 z-50 h-10 w-10 rounded-full shadow-lg",
        "bg-background border border-border hover:bg-muted",
        "animate-scale-in",
        className
      )}
      aria-label="Scroll to bottom"
    >
      <ArrowDown className="h-4 w-4" />
    </Button>
  );
}
