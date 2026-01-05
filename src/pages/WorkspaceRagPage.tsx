import React, { useState, useEffect } from 'react';
import { useParams } from 'react-router-dom';
import { Settings2, Save, Loader2, Layers, Target, Quote } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Slider } from '@/components/ui/slider';
import { Switch } from '@/components/ui/switch';
import { ScrollArea } from '@/components/ui/scroll-area';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { toast } from '@/hooks/use-toast';
import { getWorkspaceSettings, saveWorkspaceSettings } from '@/db/repo';
import type { RAGSettings } from '@/types/database';
import { DEFAULT_RAG_SETTINGS } from '@/types/database';

const PRESETS: { name: string; description: string; settings: RAGSettings }[] = [
  {
    name: 'Precizie',
    description: 'Mai puține rezultate, dar mai relevante',
    settings: {
      chunkSize: 256,
      chunkOverlap: 30,
      topK: 3,
      threshold: 0.8,
      citationsVerbosity: 'detailed',
    },
  },
  {
    name: 'Echilibrat',
    description: 'Setări recomandate pentru majoritatea cazurilor',
    settings: DEFAULT_RAG_SETTINGS,
  },
  {
    name: 'Acoperire',
    description: 'Mai multe rezultate pentru răspunsuri comprehensive',
    settings: {
      chunkSize: 1024,
      chunkOverlap: 100,
      topK: 10,
      threshold: 0.5,
      citationsVerbosity: 'minimal',
    },
  },
];

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
        setSettings(wsSettings.ragSettings);
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

  const applyPreset = (preset: typeof PRESETS[number]) => {
    setSettings(preset.settings);
    toast({
      title: `Preset aplicat: ${preset.name}`,
      description: preset.description,
    });
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
          {/* Presets */}
          <Card>
            <CardHeader>
              <CardTitle>Preset-uri rapide</CardTitle>
              <CardDescription>
                Configurații pre-definite pentru diferite scenarii.
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-3 gap-3">
                {PRESETS.map((preset) => (
                  <Button
                    key={preset.name}
                    variant="outline"
                    className="h-auto py-4 flex flex-col items-start"
                    onClick={() => applyPreset(preset)}
                  >
                    <span className="font-medium">{preset.name}</span>
                    <span className="text-xs text-muted-foreground font-normal">
                      {preset.description}
                    </span>
                  </Button>
                ))}
              </div>
            </CardContent>
          </Card>

          {/* Chunking Settings */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Layers className="h-5 w-5" />
                Chunking
              </CardTitle>
              <CardDescription>
                Controlează cum sunt împărțite documentele pentru indexare.
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <Label>Dimensiune chunk (caractere)</Label>
                  <span className="text-sm text-muted-foreground">{settings.chunkSize}</span>
                </div>
                <Slider
                  value={[settings.chunkSize]}
                  onValueChange={([v]) => updateSetting('chunkSize', v)}
                  min={128}
                  max={2048}
                  step={64}
                />
                <p className="text-xs text-muted-foreground">
                  Chunk-uri mai mici = precizie mai mare, mai mari = context mai bogat
                </p>
              </div>

              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <Label>Suprapunere (overlap)</Label>
                  <span className="text-sm text-muted-foreground">{settings.chunkOverlap}</span>
                </div>
                <Slider
                  value={[settings.chunkOverlap]}
                  onValueChange={([v]) => updateSetting('chunkOverlap', v)}
                  min={0}
                  max={200}
                  step={10}
                />
                <p className="text-xs text-muted-foreground">
                  Suprapunerea previne pierderea contextului la granițele chunk-urilor
                </p>
              </div>
            </CardContent>
          </Card>

          {/* Retrieval Settings */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Target className="h-5 w-5" />
                Retrieval
              </CardTitle>
              <CardDescription>
                Controlează căutarea și selecția documentelor relevante.
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <Label>Top K (rezultate)</Label>
                  <span className="text-sm text-muted-foreground">{settings.topK}</span>
                </div>
                <Slider
                  value={[settings.topK]}
                  onValueChange={([v]) => updateSetting('topK', v)}
                  min={1}
                  max={20}
                  step={1}
                />
                <p className="text-xs text-muted-foreground">
                  Numărul de chunk-uri relevante incluse în context
                </p>
              </div>

              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <Label>Prag similaritate</Label>
                  <span className="text-sm text-muted-foreground">{settings.threshold}</span>
                </div>
                <Slider
                  value={[settings.threshold]}
                  onValueChange={([v]) => updateSetting('threshold', v)}
                  min={0}
                  max={1}
                  step={0.05}
                />
                <p className="text-xs text-muted-foreground">
                  Chunk-urile sub acest prag sunt ignorate
                </p>
              </div>
            </CardContent>
          </Card>

          {/* Citations Settings */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Quote className="h-5 w-5" />
                Citări
              </CardTitle>
              <CardDescription>
                Configurează afișarea referințelor în răspunsuri.
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-2">
                <Label>Nivel de detaliu</Label>
                <Select
                  value={settings.citationsVerbosity}
                  onValueChange={(v) =>
                    updateSetting('citationsVerbosity', v as RAGSettings['citationsVerbosity'])
                  }
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="minimal">
                      <div>
                        <span>Minimal</span>
                        <span className="text-xs text-muted-foreground ml-2">
                          - Doar numele fișierului
                        </span>
                      </div>
                    </SelectItem>
                    <SelectItem value="normal">
                      <div>
                        <span>Normal</span>
                        <span className="text-xs text-muted-foreground ml-2">
                          - Fișier + pagină
                        </span>
                      </div>
                    </SelectItem>
                    <SelectItem value="detailed">
                      <div>
                        <span>Detaliat</span>
                        <span className="text-xs text-muted-foreground ml-2">
                          - Include extras din text
                        </span>
                      </div>
                    </SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </CardContent>
          </Card>
        </div>
      </ScrollArea>
    </div>
  );
}
