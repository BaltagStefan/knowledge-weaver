import React from 'react';
import { useTranslation } from '@/hooks/useTranslation';
import { History } from 'lucide-react';

export default function ConversationsPage() {
  const { t } = useTranslation();

  return (
    <div className="flex flex-col h-full">
      <header className="flex items-center h-14 px-4 border-b bg-background/95 backdrop-blur shrink-0">
        <h1 className="font-semibold">{t('conversations.title')}</h1>
      </header>
      
      <div className="flex-1 flex flex-col items-center justify-center p-6 text-center">
        <History className="h-16 w-16 text-muted-foreground/50 mb-4" />
        <h2 className="text-lg font-medium mb-2">{t('conversations.noConversations')}</h2>
        <p className="text-muted-foreground">{t('conversations.noConversationsDescription')}</p>
      </div>
    </div>
  );
}
