import React, { useState } from 'react';
import { useTranslation } from '@/hooks/useTranslation';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Save, MessageSquare, Layers, Loader2 } from 'lucide-react';
import { toast } from '@/hooks/use-toast';

export default function AdminRagPage() {
  const { t } = useTranslation();
  const [isSaving, setIsSaving] = useState(false);
  const [settings, setSettings] = useState({
    chatHistoryCount: 10,
    chunksCount: 5,
  });

  const handleSave = async () => {
    setIsSaving(true);
    try {
      // Simulate save
      await new Promise(resolve => setTimeout(resolve, 500));
      toast({
        title: 'Setări salvate',
        description: 'Configurația RAG globală a fost actualizată.',
      });
    } catch (error) {
      toast({
        title: 'Eroare',
        description: 'Nu s-au putut salva setările.',
        variant: 'destructive',
      });
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <div className="flex flex-col h-full">
      <header className="flex items-center justify-between h-14 px-4 border-b bg-background/95 backdrop-blur shrink-0">
        <h1 className="font-semibold">{t('rag.title')}</h1>
        <Button onClick={handleSave} disabled={isSaving}>
          {isSaving ? (
            <Loader2 className="h-4 w-4 mr-2 animate-spin" />
          ) : (
            <Save className="h-4 w-4 mr-2" />
          )}
          {t('common.save')}
        </Button>
      </header>
      
      <div className="flex-1 p-6">
        <div className="max-w-2xl mx-auto space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <MessageSquare className="h-5 w-5" />
                Setări Chat & Retrieval (Global)
              </CardTitle>
              <CardDescription>
                Configurații globale implicite pentru toate workspace-urile.
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="grid grid-cols-2 gap-6">
                <div className="space-y-2">
                  <Label className="flex items-center gap-2">
                    <MessageSquare className="h-4 w-4" />
                    Istoric Chat (mesaje)
                  </Label>
                  <Input
                    type="number"
                    min={1}
                    max={50}
                    value={settings.chatHistoryCount}
                    onChange={(e) => setSettings(prev => ({ 
                      ...prev, 
                      chatHistoryCount: parseInt(e.target.value) || 10 
                    }))}
                  />
                  <p className="text-xs text-muted-foreground">
                    Numărul de mesaje anterioare incluse în context
                  </p>
                </div>

                <div className="space-y-2">
                  <Label className="flex items-center gap-2">
                    <Layers className="h-4 w-4" />
                    Chunk-uri returnate
                  </Label>
                  <Input
                    type="number"
                    min={1}
                    max={20}
                    value={settings.chunksCount}
                    onChange={(e) => setSettings(prev => ({ 
                      ...prev, 
                      chunksCount: parseInt(e.target.value) || 5 
                    }))}
                  />
                  <p className="text-xs text-muted-foreground">
                    Numărul de chunk-uri relevante incluse în răspuns
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
