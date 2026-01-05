import React from 'react';
import { useTranslation } from '@/hooks/useTranslation';
import { Textarea } from '@/components/ui/textarea';
import { Button } from '@/components/ui/button';
import { AlertCircle, Save } from 'lucide-react';

export default function AdminPromptPage() {
  const { t } = useTranslation();

  return (
    <div className="flex flex-col h-full">
      <header className="flex items-center h-14 px-4 border-b bg-background/95 backdrop-blur shrink-0">
        <h1 className="font-semibold">{t('prompt.title')}</h1>
      </header>
      
      <div className="flex-1 p-6">
        <div className="max-w-4xl mx-auto space-y-6">
          <div className="admin-warning">
            <div className="flex items-start gap-3">
              <AlertCircle className="h-5 w-5 shrink-0 mt-0.5" />
              <p className="text-sm">{t('admin.warning.promptInjection')}</p>
            </div>
          </div>
          
          <div className="space-y-4">
            <Textarea
              placeholder={t('prompt.placeholder')}
              className="min-h-[300px] font-mono text-sm"
              defaultValue="You are a helpful assistant..."
            />
            <div className="flex justify-end">
              <Button className="gap-2">
                <Save className="h-4 w-4" />
                {t('prompt.saveNewVersion')}
              </Button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
