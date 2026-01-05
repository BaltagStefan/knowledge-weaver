import React from 'react';
import { useTranslation } from '@/hooks/useTranslation';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Slider } from '@/components/ui/slider';
import { Switch } from '@/components/ui/switch';
import { Label } from '@/components/ui/label';
import { Button } from '@/components/ui/button';
import { Save } from 'lucide-react';

export default function AdminRagPage() {
  const { t } = useTranslation();

  return (
    <div className="flex flex-col h-full">
      <header className="flex items-center h-14 px-4 border-b bg-background/95 backdrop-blur shrink-0">
        <h1 className="font-semibold">{t('rag.title')}</h1>
      </header>
      
      <div className="flex-1 p-6">
        <div className="max-w-2xl mx-auto space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="text-base">{t('rag.topK')}</CardTitle>
            </CardHeader>
            <CardContent>
              <Slider defaultValue={[5]} max={20} step={1} />
              <p className="text-sm text-muted-foreground mt-2">{t('rag.topKHelp')}</p>
            </CardContent>
          </Card>
          
          <Card>
            <CardHeader>
              <CardTitle className="text-base">{t('rag.threshold')}</CardTitle>
            </CardHeader>
            <CardContent>
              <Slider defaultValue={[0.5]} max={1} step={0.05} />
              <p className="text-sm text-muted-foreground mt-2">{t('rag.thresholdHelp')}</p>
            </CardContent>
          </Card>
          
          <Card>
            <CardHeader>
              <CardTitle className="text-base">{t('rag.reranker')}</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="flex items-center gap-3">
                <Switch id="reranker" />
                <Label htmlFor="reranker">{t('rag.rerankerHelp')}</Label>
              </div>
            </CardContent>
          </Card>
          
          <div className="flex justify-end">
            <Button className="gap-2">
              <Save className="h-4 w-4" />
              {t('common.save')}
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
}
