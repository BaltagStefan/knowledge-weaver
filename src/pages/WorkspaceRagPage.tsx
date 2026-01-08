import React, { useState, useEffect } from 'react';
import { useParams } from 'react-router-dom';
import { Settings2, Save, Loader2, MessageSquare, Layers, FileText, Ruler } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { ScrollArea } from '@/components/ui/scroll-area';
import { toast } from '@/hooks/use-toast';
import { getWorkspaceSettings, saveWorkspaceSettings } from '@/db/repo';
import type { RAGSettings } from '@/types/database';
import { DEFAULT_RAG_SETTINGS } from '@/types/database';

export default function WorkspaceRagPage() {
  const { workspaceId } = useParams<{ workspaceId: string }>();
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [settings, setSettings] = useState<RAGSettings>(DEFAULT_RAG_SETTINGS);

  useEffect(() => {
    if (workspaceId) {
      loadSettings();
    }
  }, [workspaceId]);

  const loadSettings = async () => {
    if (!workspaceId) return;

    setIsLoading(true);
    try {
      const wsSettings = await getWorkspaceSettings(workspaceId);
      if (wsSettings?.ragSettings) {
        // Merge with defaults to ensure new fields exist
        setSettings({ ...DEFAULT_RAG_SETTINGS, ...wsSettings.ragSettings });
      }
    } catch (error) {
      console.error('Failed to load settings:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleSave = async () => {
    if (!workspaceId) return;

    setIsSaving(true);
    try {
      await saveWorkspaceSettings(workspaceId, { ragSettings: settings });
      toast({
        title: 'Setări salvate',
        description: 'Configurația RAG a fost actualizată.',
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

  const updateSetting = <K extends keyof RAGSettings>(key: K, value: RAGSettings[K]) => {
    setSettings((prev) => ({ ...prev, [key]: value }));
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-full">
        <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
      </div>
    );
  }

  return (
    <div className="flex flex-col h-full">
      <header className="flex items-center justify-between h-14 px-4 border-b bg-background/95 backdrop-blur shrink-0">
        <div className="flex items-center gap-2">
          <Settings2 className="h-5 w-5" />
          <h1 className="font-semibold">Configurare RAG</h1>
        </div>
        <Button onClick={handleSave} disabled={isSaving}>
          {isSaving ? (
            <Loader2 className="h-4 w-4 mr-2 animate-spin" />
          ) : (
            <Save className="h-4 w-4 mr-2" />
          )}
          Salvează
        </Button>
      </header>

      <ScrollArea className="flex-1">
        <div className="p-6 max-w-3xl mx-auto space-y-6">
          {/* Chat & Retrieval Settings */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <MessageSquare className="h-5 w-5" />
                Setări Chat & Retrieval
              </CardTitle>
              <CardDescription>
                Configurează istoricul conversației și numărul de chunk-uri returnate.
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
                    onChange={(e) => updateSetting('chatHistoryCount', parseInt(e.target.value) || 10)}
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
                    onChange={(e) => updateSetting('chunksCount', parseInt(e.target.value) || 5)}
                  />
                  <p className="text-xs text-muted-foreground">
                    Numărul de chunk-uri relevante incluse în răspuns
                  </p>
                </div>

                <div className="space-y-2">
                  <Label className="flex items-center gap-2">
                    <FileText className="h-4 w-4" />
                    Dimensiune Chunk
                  </Label>
                  <Input
                    type="number"
                    min={100}
                    max={4000}
                    step={50}
                    value={settings.chunkSize}
                    onChange={(e) => updateSetting('chunkSize', parseInt(e.target.value) || 512)}
                  />
                  <p className="text-xs text-muted-foreground">
                    Dimensiunea fiecărui chunk în caractere
                  </p>
                </div>

                <div className="space-y-2">
                  <Label className="flex items-center gap-2">
                    <Ruler className="h-4 w-4" />
                    Chunk Overlap
                  </Label>
                  <Input
                    type="number"
                    min={0}
                    max={500}
                    step={10}
                    value={settings.chunkOverlap}
                    onChange={(e) => updateSetting('chunkOverlap', parseInt(e.target.value) || 50)}
                  />
                  <p className="text-xs text-muted-foreground">
                    Suprapunerea între chunk-uri consecutive
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </ScrollArea>
    </div>
  );
}
