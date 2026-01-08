import React, { useState, useEffect } from 'react';
import { useParams } from 'react-router-dom';
import { Save, Loader2, Cpu, Plus, Trash2, Database, Zap, ChevronDown, ChevronUp, Brain, CheckCircle2, XCircle, Play } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Switch } from '@/components/ui/switch';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from '@/components/ui/collapsible';
import { ScrollArea } from '@/components/ui/scroll-area';
import { toast } from '@/hooks/use-toast';
import { getWorkspaceSettings, saveWorkspaceSettings } from '@/db/repo';
import type { ModelSettings, EndpointConfig, ReasoningMode } from '@/types/database';
import { DEFAULT_MODEL_SETTINGS } from '@/types/database';
import { v4 as uuidv4 } from 'uuid';

const REASONING_MODES: { value: ReasoningMode; label: string; description: string }[] = [
  { value: 'off', label: 'Dezactivat', description: 'Fără raționament extins' },
  { value: 'low', label: 'Scăzut', description: 'Raționament minimal' },
  { value: 'medium', label: 'Mediu', description: 'Raționament echilibrat' },
  { value: 'high', label: 'Înalt', description: 'Raționament detaliat' },
];

type TestStatus = 'idle' | 'testing' | 'success' | 'error';

const testLlmConnection = async (endpoint: EndpointConfig): Promise<{ success: boolean; message: string }> => {
  if (!endpoint.endpoint) {
    return { success: false, message: 'Endpoint-ul nu este configurat' };
  }
  
  try {
    const response = await fetch(endpoint.endpoint, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        ...(endpoint.apiKey ? { 'Authorization': `Bearer ${endpoint.apiKey}` } : {}),
      },
      body: JSON.stringify({
        model: endpoint.name || 'test',
        messages: [{ role: 'user', content: 'Hello' }],
        max_tokens: 5,
      }),
    });
    
    if (response.ok) {
      return { success: true, message: 'Conexiune reușită!' };
    } else if (response.status === 401) {
      return { success: false, message: 'API Key invalid sau lipsă' };
    } else if (response.status === 404) {
      return { success: false, message: 'Endpoint nu a fost găsit' };
    } else {
      return { success: false, message: `Eroare: ${response.status} ${response.statusText}` };
    }
  } catch (error) {
    if (error instanceof TypeError && error.message.includes('Failed to fetch')) {
      return { success: false, message: 'Nu se poate conecta la endpoint (CORS sau rețea)' };
    }
    return { success: false, message: `Eroare: ${error instanceof Error ? error.message : 'Necunoscută'}` };
  }
};

const testVectorDbConnection = async (endpoint: EndpointConfig): Promise<{ success: boolean; message: string }> => {
  if (!endpoint.endpoint) {
    return { success: false, message: 'Endpoint-ul nu este configurat' };
  }
  
  try {
    const response = await fetch(endpoint.endpoint, {
      method: 'GET',
      headers: {
        ...(endpoint.apiKey ? { 'api-key': endpoint.apiKey } : {}),
      },
    });
    
    if (response.ok) {
      return { success: true, message: 'Conexiune reușită!' };
    } else if (response.status === 401 || response.status === 403) {
      return { success: false, message: 'API Key invalid sau lipsă' };
    } else {
      return { success: false, message: `Eroare: ${response.status} ${response.statusText}` };
    }
  } catch (error) {
    if (error instanceof TypeError && error.message.includes('Failed to fetch')) {
      return { success: false, message: 'Nu se poate conecta la endpoint (CORS sau rețea)' };
    }
    return { success: false, message: `Eroare: ${error instanceof Error ? error.message : 'Necunoscută'}` };
  }
};

interface EndpointFormProps {
  endpoint: EndpointConfig;
  onChange: (endpoint: EndpointConfig) => void;
  onDelete: () => void;
  onTest: (endpoint: EndpointConfig) => Promise<{ success: boolean; message: string }>;
  showContextWindow?: boolean;
  showTemperature?: boolean;
  showMaxTokens?: boolean;
}

function EndpointForm({ endpoint, onChange, onDelete, onTest, showContextWindow, showTemperature, showMaxTokens }: EndpointFormProps) {
  const [isOpen, setIsOpen] = useState(true);
  const [testStatus, setTestStatus] = useState<TestStatus>('idle');
  const [testMessage, setTestMessage] = useState('');

  const handleTest = async (e: React.MouseEvent) => {
    e.stopPropagation();
    setTestStatus('testing');
    setTestMessage('');
    
    const result = await onTest(endpoint);
    setTestStatus(result.success ? 'success' : 'error');
    setTestMessage(result.message);
    
    // Reset status after 5 seconds
    setTimeout(() => {
      setTestStatus('idle');
      setTestMessage('');
    }, 5000);
  };

  return (
    <Collapsible open={isOpen} onOpenChange={setIsOpen} className="border rounded-lg bg-muted/20">
      <CollapsibleTrigger asChild>
        <div className="flex items-center justify-between p-4 cursor-pointer hover:bg-muted/40 transition-colors">
          <div className="flex items-center gap-3">
            <div className="h-10 w-10 rounded-lg bg-primary/10 flex items-center justify-center">
              <Cpu className="h-5 w-5 text-primary" />
            </div>
            <div>
              <p className="font-medium">{endpoint.name || 'Model nou'}</p>
              <p className="text-sm text-muted-foreground truncate max-w-[300px]">
                {endpoint.endpoint || 'Configurează endpoint-ul'}
              </p>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <Button
              variant="ghost"
              size="icon"
              onClick={(e) => {
                e.stopPropagation();
                onDelete();
              }}
              className="text-destructive hover:text-destructive"
            >
              <Trash2 className="h-4 w-4" />
            </Button>
            {isOpen ? <ChevronUp className="h-4 w-4" /> : <ChevronDown className="h-4 w-4" />}
          </div>
        </div>
      </CollapsibleTrigger>
      <CollapsibleContent>
        <div className="p-4 pt-0 space-y-4 border-t">
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label>Nume Model</Label>
              <Input
                value={endpoint.name}
                onChange={(e) => onChange({ ...endpoint, name: e.target.value })}
                placeholder="ex: GPT-4o, Claude Sonnet"
              />
            </div>
            <div className="space-y-2">
              <Label>API Key</Label>
              <Input
                type="password"
                value={endpoint.apiKey || ''}
                onChange={(e) => onChange({ ...endpoint, apiKey: e.target.value })}
                placeholder="sk-..."
              />
            </div>
          </div>
          
          <div className="space-y-2">
            <Label>Endpoint URL</Label>
            <Input
              value={endpoint.endpoint}
              onChange={(e) => onChange({ ...endpoint, endpoint: e.target.value })}
              placeholder="https://api.example.com/v1/chat/completions"
            />
          </div>

          <div className="grid grid-cols-3 gap-4">
            {showContextWindow && (
              <div className="space-y-2">
                <Label>Context Window</Label>
                <Input
                  type="number"
                  value={endpoint.contextWindow || ''}
                  onChange={(e) => onChange({ ...endpoint, contextWindow: e.target.value ? parseInt(e.target.value) : undefined })}
                  placeholder="128000"
                />
              </div>
            )}
            {showTemperature && (
              <div className="space-y-2">
                <Label>Temperature</Label>
                <Input
                  type="number"
                  step="0.1"
                  min="0"
                  max="2"
                  value={endpoint.temperature ?? ''}
                  onChange={(e) => onChange({ ...endpoint, temperature: e.target.value ? parseFloat(e.target.value) : undefined })}
                  placeholder="0.7"
                />
              </div>
            )}
            {showMaxTokens && (
              <div className="space-y-2">
                <Label>Max Tokens</Label>
                <Input
                  type="number"
                  value={endpoint.maxTokens || ''}
                  onChange={(e) => onChange({ ...endpoint, maxTokens: e.target.value ? parseInt(e.target.value) : undefined })}
                  placeholder="4096"
                />
              </div>
            )}
          </div>

          {/* Test Connection Button */}
          <div className="flex items-center gap-3 pt-2 border-t">
            <Button
              variant="outline"
              size="sm"
              onClick={handleTest}
              disabled={testStatus === 'testing' || !endpoint.endpoint}
              className="gap-2"
            >
              {testStatus === 'testing' ? (
                <Loader2 className="h-4 w-4 animate-spin" />
              ) : testStatus === 'success' ? (
                <CheckCircle2 className="h-4 w-4 text-green-500" />
              ) : testStatus === 'error' ? (
                <XCircle className="h-4 w-4 text-destructive" />
              ) : (
                <Play className="h-4 w-4" />
              )}
              {testStatus === 'testing' ? 'Se testează...' : 'Test conexiune'}
            </Button>
            {testMessage && (
              <span className={`text-sm ${testStatus === 'success' ? 'text-green-600' : 'text-destructive'}`}>
                {testMessage}
              </span>
            )}
          </div>
        </div>
      </CollapsibleContent>
    </Collapsible>
  );
}

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
        // Merge with defaults to ensure new fields exist
        setSettings({ ...DEFAULT_MODEL_SETTINGS, ...wsSettings.modelSettings });
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

  const addLlmEndpoint = () => {
    const newEndpoint: EndpointConfig = {
      id: uuidv4(),
      name: '',
      endpoint: '',
    };
    setSettings(prev => ({
      ...prev,
      llmEndpoints: [...prev.llmEndpoints, newEndpoint],
      selectedLlmId: prev.llmEndpoints.length === 0 ? newEndpoint.id : prev.selectedLlmId,
    }));
  };

  const updateLlmEndpoint = (index: number, endpoint: EndpointConfig) => {
    setSettings(prev => ({
      ...prev,
      llmEndpoints: prev.llmEndpoints.map((e, i) => i === index ? endpoint : e),
    }));
  };

  const deleteLlmEndpoint = (index: number) => {
    const endpoint = settings.llmEndpoints[index];
    setSettings(prev => {
      const newEndpoints = prev.llmEndpoints.filter((_, i) => i !== index);
      return {
        ...prev,
        llmEndpoints: newEndpoints,
        selectedLlmId: prev.selectedLlmId === endpoint.id 
          ? (newEndpoints[0]?.id || undefined)
          : prev.selectedLlmId,
      };
    });
  };

  const addVectorDbEndpoint = () => {
    const newEndpoint: EndpointConfig = {
      id: uuidv4(),
      name: '',
      endpoint: '',
    };
    setSettings(prev => ({
      ...prev,
      vectorDbEndpoints: [...prev.vectorDbEndpoints, newEndpoint],
      selectedVectorDbId: prev.vectorDbEndpoints.length === 0 ? newEndpoint.id : prev.selectedVectorDbId,
    }));
  };

  const updateVectorDbEndpoint = (index: number, endpoint: EndpointConfig) => {
    setSettings(prev => ({
      ...prev,
      vectorDbEndpoints: prev.vectorDbEndpoints.map((e, i) => i === index ? endpoint : e),
    }));
  };

  const deleteVectorDbEndpoint = (index: number) => {
    const endpoint = settings.vectorDbEndpoints[index];
    setSettings(prev => {
      const newEndpoints = prev.vectorDbEndpoints.filter((_, i) => i !== index);
      return {
        ...prev,
        vectorDbEndpoints: newEndpoints,
        selectedVectorDbId: prev.selectedVectorDbId === endpoint.id 
          ? (newEndpoints[0]?.id || undefined)
          : prev.selectedVectorDbId,
      };
    });
  };

  const addRerankerEndpoint = () => {
    const newEndpoint: EndpointConfig = {
      id: uuidv4(),
      name: '',
      endpoint: '',
    };
    setSettings(prev => ({
      ...prev,
      rerankerEndpoints: [...prev.rerankerEndpoints, newEndpoint],
      selectedRerankerId: prev.rerankerEndpoints.length === 0 ? newEndpoint.id : prev.selectedRerankerId,
    }));
  };

  const updateRerankerEndpoint = (index: number, endpoint: EndpointConfig) => {
    setSettings(prev => ({
      ...prev,
      rerankerEndpoints: prev.rerankerEndpoints.map((e, i) => i === index ? endpoint : e),
    }));
  };

  const deleteRerankerEndpoint = (index: number) => {
    const endpoint = settings.rerankerEndpoints[index];
    setSettings(prev => {
      const newEndpoints = prev.rerankerEndpoints.filter((_, i) => i !== index);
      return {
        ...prev,
        rerankerEndpoints: newEndpoints,
        selectedRerankerId: prev.selectedRerankerId === endpoint.id 
          ? (newEndpoints[0]?.id || undefined)
          : prev.selectedRerankerId,
      };
    });
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
                <Cpu className="h-5 w-5" />
                LLM Provider
              </CardTitle>
              <CardDescription>
                Configurează endpoint-urile pentru modelele LLM.
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              {settings.llmEndpoints.length > 0 && (
                <div className="space-y-2">
                  <Label>Model activ</Label>
                  <Select
                    value={settings.selectedLlmId || ''}
                    onValueChange={(v) => setSettings(prev => ({ ...prev, selectedLlmId: v }))}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Selectează un model" />
                    </SelectTrigger>
                    <SelectContent>
                      {settings.llmEndpoints.map((endpoint) => (
                        <SelectItem key={endpoint.id} value={endpoint.id}>
                          {endpoint.name || 'Model fără nume'}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              )}

              <div className="space-y-3">
                {settings.llmEndpoints.map((endpoint, index) => (
                  <EndpointForm
                    key={endpoint.id}
                    endpoint={endpoint}
                    onChange={(e) => updateLlmEndpoint(index, e)}
                    onDelete={() => deleteLlmEndpoint(index)}
                    onTest={testLlmConnection}
                    showContextWindow
                    showTemperature
                    showMaxTokens
                  />
                ))}
              </div>

              <Button variant="outline" onClick={addLlmEndpoint} className="w-full">
                <Plus className="h-4 w-4 mr-2" />
                Adaugă model LLM
              </Button>
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
                  onValueChange={(v) => setSettings(prev => ({ ...prev, reasoningMode: v as ReasoningMode }))}
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
                      setSettings(prev => ({ 
                        ...prev, 
                        reasoningBudget: e.target.value ? parseInt(e.target.value) : undefined 
                      }))
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

          {/* Vector Database Settings */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Database className="h-5 w-5" />
                Vector Database Provider
              </CardTitle>
              <CardDescription>
                Configurează endpoint-ul pentru baza de date vectorială.
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              {settings.vectorDbEndpoints.length > 0 && (
                <div className="space-y-2">
                  <Label>Database activ</Label>
                  <Select
                    value={settings.selectedVectorDbId || ''}
                    onValueChange={(v) => setSettings(prev => ({ ...prev, selectedVectorDbId: v }))}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Selectează o bază de date" />
                    </SelectTrigger>
                    <SelectContent>
                      {settings.vectorDbEndpoints.map((endpoint) => (
                        <SelectItem key={endpoint.id} value={endpoint.id}>
                          {endpoint.name || 'Database fără nume'}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              )}

              <div className="space-y-3">
                {settings.vectorDbEndpoints.map((endpoint, index) => (
                  <EndpointForm
                    key={endpoint.id}
                    endpoint={endpoint}
                    onChange={(e) => updateVectorDbEndpoint(index, e)}
                    onDelete={() => deleteVectorDbEndpoint(index)}
                    onTest={testVectorDbConnection}
                  />
                ))}
              </div>

              <Button variant="outline" onClick={addVectorDbEndpoint} className="w-full">
                <Plus className="h-4 w-4 mr-2" />
                Adaugă Vector Database
              </Button>
            </CardContent>
          </Card>

          {/* Reranker Settings */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Zap className="h-5 w-5" />
                Reranker
              </CardTitle>
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
                  onCheckedChange={(v) => setSettings(prev => ({ ...prev, rerankerEnabled: v }))}
                />
              </div>

              {settings.rerankerEnabled && (
                <>
                  {settings.rerankerEndpoints.length > 0 && (
                    <div className="space-y-2">
                      <Label>Reranker activ</Label>
                      <Select
                        value={settings.selectedRerankerId || ''}
                        onValueChange={(v) => setSettings(prev => ({ ...prev, selectedRerankerId: v }))}
                      >
                        <SelectTrigger>
                          <SelectValue placeholder="Selectează un reranker" />
                        </SelectTrigger>
                        <SelectContent>
                          {settings.rerankerEndpoints.map((endpoint) => (
                            <SelectItem key={endpoint.id} value={endpoint.id}>
                              {endpoint.name || 'Reranker fără nume'}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>
                  )}

                  <div className="space-y-3">
                    {settings.rerankerEndpoints.map((endpoint, index) => (
                      <EndpointForm
                        key={endpoint.id}
                        endpoint={endpoint}
                        onChange={(e) => updateRerankerEndpoint(index, e)}
                        onDelete={() => deleteRerankerEndpoint(index)}
                        onTest={testLlmConnection}
                      />
                    ))}
                  </div>

                  <Button variant="outline" onClick={addRerankerEndpoint} className="w-full">
                    <Plus className="h-4 w-4 mr-2" />
                    Adaugă Reranker
                  </Button>
                </>
              )}
            </CardContent>
          </Card>
        </div>
      </ScrollArea>
    </div>
  );
}
