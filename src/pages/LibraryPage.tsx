import React from 'react';
import { useTranslation } from '@/hooks/useTranslation';
import { FolderOpen, Upload } from 'lucide-react';

export default function LibraryPage() {
  const { t } = useTranslation();

  return (
    <div className="flex flex-col h-full">
      <header className="flex items-center h-14 px-4 border-b bg-background/95 backdrop-blur shrink-0">
        <h1 className="font-semibold">{t('library.title')}</h1>
      </header>
      
      <div className="flex-1 p-6">
        <div className="max-w-4xl mx-auto">
          {/* Upload area */}
          <div className="border-2 border-dashed rounded-xl p-12 text-center hover:border-accent transition-colors cursor-pointer">
            <Upload className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
            <h3 className="font-medium mb-2">{t('library.uploadTitle')}</h3>
            <p className="text-sm text-muted-foreground">{t('library.uploadDescription')}</p>
          </div>
          
          {/* Empty state */}
          <div className="flex flex-col items-center justify-center py-16 text-center">
            <FolderOpen className="h-16 w-16 text-muted-foreground/50 mb-4" />
            <h2 className="text-lg font-medium mb-2">{t('library.emptyState')}</h2>
            <p className="text-muted-foreground">{t('library.emptyStateDescription')}</p>
          </div>
        </div>
      </div>
    </div>
  );
}
