import React, { useState, useEffect } from 'react';
import { useParams } from 'react-router-dom';
import { FileText, Save, Loader2, History, RotateCcw, Plus } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Badge } from '@/components/ui/badge';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from '@/components/ui/accordion';
import { toast } from '@/hooks/use-toast';
import {
  getWorkspaceSettings,
  saveWorkspaceSettings,
  addPromptVersion,
  listPromptVersions,
} from '@/db/repo';
import { useAuthStore } from '@/store/authStore';
import type { DBPromptVersion } from '@/types/database';
import { DEFAULT_SYSTEM_PROMPT } from '@/types/database';

export default function WorkspacePromptPage() {
  const { workspaceId } = useParams<{ workspaceId: string }>();
  const { user } = useAuthStore();
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [prompt, setPrompt] = useState(DEFAULT_SYSTEM_PROMPT);
  const [versions, setVersions] = useState<DBPromptVersion[]>([]);
  const [showSaveDialog, setShowSaveDialog] = useState(false);
  const [versionNote, setVersionNote] = useState('');

  useEffect(() => {
    if (workspaceId) {
      loadData();
    }
  }, [workspaceId]);

  const loadData = async () => {
    if (!workspaceId) return;

    setIsLoading(true);
    try {
      const [settings, promptVersions] = await Promise.all([
        getWorkspaceSettings(workspaceId),
        listPromptVersions(workspaceId),
      ]);

      if (settings?.systemPrompt) {
        setPrompt(settings.systemPrompt);
      }
      setVersions(promptVersions);
    } catch (error) {
      console.error('Failed to load data:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleSave = async () => {
    if (!workspaceId) return;

    setIsSaving(true);
    try {
      // Save the prompt
      await saveWorkspaceSettings(workspaceId, { systemPrompt: prompt });

      // Create a version entry
      const version = await addPromptVersion(
        workspaceId,
        prompt,
        versionNote.trim() || undefined,
        user?.username
      );
      setVersions((prev) => [version, ...prev]);

      setShowSaveDialog(false);
      setVersionNote('');

      toast({
        title: 'Prompt salvat',
        description: 'System prompt-ul a fost actualizat.',
      });
    } catch (error) {
      toast({
        title: 'Eroare',
        description: 'Nu s-a putut salva prompt-ul.',
        variant: 'destructive',
      });
    } finally {
      setIsSaving(false);
    }
  };

  const handleRestoreVersion = (version: DBPromptVersion) => {
    setPrompt(version.prompt);
    toast({
      title: 'Versiune restaurată',
      description: 'Prompt-ul a fost încărcat. Salvează pentru a aplica modificările.',
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
          <FileText className="h-5 w-5" />
          <h1 className="font-semibold">System Prompt</h1>
        </div>
        <Button onClick={() => setShowSaveDialog(true)}>
          <Save className="h-4 w-4 mr-2" />
          Salvează versiune
        </Button>
      </header>

      <div className="flex-1 overflow-hidden flex">
        {/* Main Editor */}
        <div className="flex-1 p-6">
          <div className="max-w-3xl mx-auto h-full flex flex-col gap-4">
            <div className="space-y-2 flex-1 flex flex-col">
              <Label>System Prompt</Label>
              <Textarea
                value={prompt}
                onChange={(e) => setPrompt(e.target.value)}
                placeholder="Introdu instrucțiunile pentru AI..."
                className="flex-1 min-h-[400px] font-mono text-sm resize-none"
              />
              <p className="text-xs text-muted-foreground">
                {prompt.length} caractere • {prompt.split(/\s+/).filter(Boolean).length} cuvinte
              </p>
            </div>

            <Card>
              <CardHeader className="pb-3">
                <CardTitle className="text-sm">Sfaturi pentru un prompt eficient</CardTitle>
              </CardHeader>
              <CardContent className="text-sm text-muted-foreground space-y-2">
                <p>• Definește clar rolul și expertiza asistentului</p>
                <p>• Specifică formatul dorit pentru răspunsuri</p>
                <p>• Include instrucțiuni pentru citarea surselor</p>
                <p>• Stabilește limitele - ce NU trebuie să facă</p>
              </CardContent>
            </Card>
          </div>
        </div>

        {/* Version History Sidebar */}
        <div className="w-80 border-l bg-muted/30 p-4">
          <div className="flex items-center gap-2 mb-4">
            <History className="h-4 w-4" />
            <h2 className="font-medium">Istoric versiuni</h2>
          </div>

          <ScrollArea className="h-[calc(100vh-180px)]">
            {versions.length === 0 ? (
              <p className="text-sm text-muted-foreground text-center py-8">
                Nicio versiune salvată
              </p>
            ) : (
              <div className="space-y-2">
                {versions.map((version, index) => (
                  <Card key={version.id} className="cursor-pointer hover:bg-muted/50">
                    <CardContent className="p-3">
                      <div className="flex items-start justify-between gap-2">
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center gap-2 mb-1">
                            {index === 0 && (
                              <Badge variant="secondary" className="text-xs">
                                Curent
                              </Badge>
                            )}
                            <span className="text-xs text-muted-foreground">
                              {new Date(version.createdAt).toLocaleString('ro-RO')}
                            </span>
                          </div>
                          {version.note && (
                            <p className="text-sm truncate">{version.note}</p>
                          )}
                          <p className="text-xs text-muted-foreground truncate mt-1">
                            {version.prompt.substring(0, 100)}...
                          </p>
                          {version.createdBy && (
                            <p className="text-xs text-muted-foreground mt-1">
                              de {version.createdBy}
                            </p>
                          )}
                        </div>
                        <Button
                          variant="ghost"
                          size="icon"
                          className="shrink-0"
                          onClick={() => handleRestoreVersion(version)}
                        >
                          <RotateCcw className="h-4 w-4" />
                        </Button>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            )}
          </ScrollArea>
        </div>
      </div>

      {/* Save Dialog */}
      <Dialog open={showSaveDialog} onOpenChange={setShowSaveDialog}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Salvează versiune</DialogTitle>
            <DialogDescription>
              Adaugă o notă pentru a identifica această versiune mai târziu.
            </DialogDescription>
          </DialogHeader>

          <div className="py-4">
            <div className="space-y-2">
              <Label htmlFor="note">Notă (opțional)</Label>
              <Input
                id="note"
                value={versionNote}
                onChange={(e) => setVersionNote(e.target.value)}
                placeholder="ex: Adăugat instrucțiuni pentru citări"
              />
            </div>
          </div>

          <DialogFooter>
            <Button variant="outline" onClick={() => setShowSaveDialog(false)}>
              Anulează
            </Button>
            <Button onClick={handleSave} disabled={isSaving}>
              {isSaving ? (
                <Loader2 className="h-4 w-4 mr-2 animate-spin" />
              ) : (
                <Save className="h-4 w-4 mr-2" />
              )}
              Salvează
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
