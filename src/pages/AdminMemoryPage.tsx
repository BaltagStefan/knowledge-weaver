import React from 'react';
import { useTranslation } from '@/hooks/useTranslation';
import { Button } from '@/components/ui/button';
import { Brain, Plus, Download, Upload } from 'lucide-react';

export default function AdminMemoryPage() {
  const { t } = useTranslation();

  return (
    <div className="flex flex-col h-full">
      <header className="flex items-center justify-between h-14 px-4 border-b bg-background/95 backdrop-blur shrink-0">
        <h1 className="font-semibold">{t('memory.title')}</h1>
        <div className="flex gap-2">
          <Button variant="outline" size="sm" className="gap-1">
            <Download className="h-3.5 w-3.5" />
            {t('memory.export')}
          </Button>
          <Button size="sm" className="gap-1">
            <Plus className="h-3.5 w-3.5" />
            {t('memory.addEntry')}
          </Button>
        </div>
      </header>
      
      <div className="flex-1 flex flex-col items-center justify-center p-6 text-center">
        <Brain className="h-16 w-16 text-muted-foreground/50 mb-4" />
        <h2 className="text-lg font-medium mb-2">{t('memory.emptyState')}</h2>
        <p className="text-muted-foreground">{t('memory.emptyStateDescription')}</p>
      </div>
    </div>
  );
}
