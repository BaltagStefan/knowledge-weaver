import React, { useState, useEffect } from 'react';
import { useParams } from 'react-router-dom';
import { Settings, Save, Loader2, Cpu, Thermometer, Hash, Brain, Sparkles } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Slider } from '@/components/ui/slider';
import { Switch } from '@/components/ui/switch';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { ScrollArea } from '@/components/ui/scroll-area';
import { toast } from '@/hooks/use-toast';
import { getWorkspaceSettings, saveWorkspaceSettings } from '@/db/repo';
import type { ModelSettings, ReasoningMode } from '@/types/database';
import { DEFAULT_MODEL_SETTINGS } from '@/types/database';

const LLM_MODELS = [
  { value: 'gpt-4o', label: 'GPT-4o' },
  { value: 'gpt-4o-mini', label: 'GPT-4o Mini' },
  { value: 'gpt-4-turbo', label: 'GPT-4 Turbo' },
  { value: 'claude-sonnet-4-5', label: 'Claude Sonnet 4.5' },
  { value: 'claude-opus-4-5-20251101', label: 'Claude Opus 4.5' },
  { value: 'claude-3-5-haiku-20241022', label: 'Claude 3.5 Haiku' },
];

const EMBEDDING_MODELS = [
  { value: 'text-embedding-3-small', label: 'OpenAI Embedding Small' },
  { value: 'text-embedding-3-large', label: 'OpenAI Embedding Large' },
  { value: 'text-embedding-ada-002', label: 'OpenAI Ada 002' },
];

const RERANKER_MODELS = [
  { value: 'cohere-rerank-v3', label: 'Cohere Rerank v3' },
  { value: 'bge-reranker-large', label: 'BGE Reranker Large' },
  { value: 'cross-encoder', label: 'Cross-Encoder' },
];

const REASONING_MODES: { value: ReasoningMode; label: string; description: string }[] = [
  { value: 'off', label: 'Dezactivat', description: 'Fără raționament extins' },
  { value: 'low', label: 'Scăzut', description: 'Raționament minimal' },
  { value: 'medium', label: 'Mediu', description: 'Raționament echilibrat' },
  { value: 'high', label: 'Înalt', description: 'Raționament detaliat' },
];

export default function WorkspaceModelsPage() {
  const { workspaceId } = useParams<{ workspaceId: string }>();
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [settings, setSettings] = useState<ModelSettings>(DEFAULT_MODEL_SETTINGS);

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
      if (wsSettings?.modelSettings) {
        setSettings(wsSettings.modelSettings);
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
      await saveWorkspaceSettings(workspaceId, { modelSettings: settings });
      toast({
        title: 'Setări salvate',
        description: 'Configurația modelelor a fost actualizată.',
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

  const updateSetting = <K extends keyof ModelSettings>(key: K, value: ModelSettings[K]) => {
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
          <Cpu className="h-5 w-5" />
          <h1 className="font-semibold">Configurare Modele</h1>
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
          {/* LLM Settings */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Sparkles className="h-5 w-5" />
                Model LLM
              </CardTitle>
              <CardDescription>
                Configurează modelul de limbaj pentru generarea răspunsurilor.
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="space-y-2">
                <Label>Model</Label>
                <Select
                  value={settings.llmModel}
                  onValueChange={(v) => updateSetting('llmModel', v)}
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {LLM_MODELS.map((model) => (
                      <SelectItem key={model.value} value={model.value}>
                        {model.label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-4">
                <div className="space-y-2">
                  <div className="flex items-center justify-between">
                    <Label className="flex items-center gap-2">
                      <Thermometer className="h-4 w-4" />
                      Temperatură
                    </Label>
                    <span className="text-sm text-muted-foreground">{settings.temperature}</span>
                  </div>
                  <Slider
                    value={[settings.temperature]}
                    onValueChange={([v]) => updateSetting('temperature', v)}
                    min={0}
                    max={2}
                    step={0.1}
                  />
                  <p className="text-xs text-muted-foreground">
                    Valori mai mici = răspunsuri mai precise, mai mari = mai creative
                  </p>
                </div>

                <div className="space-y-2">
                  <div className="flex items-center justify-between">
                    <Label className="flex items-center gap-2">
                      <Hash className="h-4 w-4" />
                      Max Tokens
                    </Label>
                    <span className="text-sm text-muted-foreground">{settings.maxTokens}</span>
                  </div>
                  <Slider
                    value={[settings.maxTokens]}
                    onValueChange={([v]) => updateSetting('maxTokens', v)}
                    min={256}
                    max={16384}
                    step={256}
                  />
                </div>

                <div className="space-y-2">
                  <div className="flex items-center justify-between">
                    <Label>Top P</Label>
                    <span className="text-sm text-muted-foreground">{settings.topP}</span>
                  </div>
                  <Slider
                    value={[settings.topP]}
                    onValueChange={([v]) => updateSetting('topP', v)}
                    min={0}
                    max={1}
                    step={0.05}
                  />
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Reasoning Settings */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Brain className="h-5 w-5" />
                Raționament
              </CardTitle>
              <CardDescription>
                Configurează modul de raționament extins al modelului.
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <Label>Mod raționament</Label>
                <Select
                  value={settings.reasoningMode}
                  onValueChange={(v) => updateSetting('reasoningMode', v as ReasoningMode)}
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {REASONING_MODES.map((mode) => (
                      <SelectItem key={mode.value} value={mode.value}>
                        <div>
                          <span>{mode.label}</span>
                          <span className="text-xs text-muted-foreground ml-2">
                            - {mode.description}
                          </span>
                        </div>
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              {settings.reasoningMode !== 'off' && (
                <div className="space-y-2">
                  <Label>Buget raționament (tokens)</Label>
                  <Input
                    type="number"
                    value={settings.reasoningBudget || ''}
                    onChange={(e) =>
                      updateSetting('reasoningBudget', e.target.value ? parseInt(e.target.value) : undefined)
                    }
                    placeholder="Auto"
                  />
                  <p className="text-xs text-muted-foreground">
                    Lasă gol pentru auto-detectare
                  </p>
                </div>
              )}
            </CardContent>
          </Card>

          {/* Embeddings Settings */}
          <Card>
            <CardHeader>
              <CardTitle>Embeddings</CardTitle>
              <CardDescription>
                Modelul pentru generarea reprezentărilor vectoriale.
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-2">
                <Label>Model Embeddings</Label>
                <Select
                  value={settings.embeddingsModel}
                  onValueChange={(v) => updateSetting('embeddingsModel', v)}
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {EMBEDDING_MODELS.map((model) => (
                      <SelectItem key={model.value} value={model.value}>
                        {model.label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </CardContent>
          </Card>

          {/* Reranker Settings */}
          <Card>
            <CardHeader>
              <CardTitle>Reranker</CardTitle>
              <CardDescription>
                Reordonează rezultatele căutării pentru relevanță mai bună.
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex items-center justify-between">
                <div>
                  <Label>Activează Reranker</Label>
                  <p className="text-xs text-muted-foreground">
                    Îmbunătățește calitatea rezultatelor, dar încetinește răspunsul
                  </p>
                </div>
                <Switch
                  checked={settings.rerankerEnabled}
                  onCheckedChange={(v) => updateSetting('rerankerEnabled', v)}
                />
              </div>

              {settings.rerankerEnabled && (
                <div className="space-y-2">
                  <Label>Model Reranker</Label>
                  <Select
                    value={settings.rerankerModel || RERANKER_MODELS[0].value}
                    onValueChange={(v) => updateSetting('rerankerModel', v)}
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      {RERANKER_MODELS.map((model) => (
                        <SelectItem key={model.value} value={model.value}>
                          {model.label}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              )}
            </CardContent>
          </Card>
        </div>
      </ScrollArea>
    </div>
  );
}
