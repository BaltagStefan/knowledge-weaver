import React, { useState, useCallback, useEffect } from 'react';
import { useParams } from 'react-router-dom';
import { Upload, FileText, Search, Filter, RefreshCw, Trash2, Eye, CheckCircle, XCircle, Clock, Loader2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from '@/components/ui/alert-dialog';
import { Progress } from '@/components/ui/progress';
import { ScrollArea } from '@/components/ui/scroll-area';
import { useFilesStore, type FileWithIndex } from '@/store/filesStore';
import { useAuthStore } from '@/store/authStore';
import { useTranslation } from '@/hooks/useTranslation';
import { toast } from '@/hooks/use-toast';
import { cn } from '@/lib/utils';
import { createFile, upsertIndexState, deleteFile as deleteFileFromDB, getFilesWithIndexState } from '@/db/repo';
import { filesApi } from '@/api/n8nClient';
import { PDFPreviewModal } from '@/components/files/PDFPreviewModal';

export default function FilesPage() {
  const { t } = useTranslation();
  const { workspaceId } = useParams<{ workspaceId: string }>();
  const { user } = useAuthStore();
  const {
    files,
    setFiles,
    addFile,
    removeFile,
    updateIndexState,
    filter,
    setFilter,
    searchQuery,
    setSearchQuery,
    getFilteredFiles,
    isLoading,
    setLoading,
    indexingDocIds,
    setIndexing,
    setIndexingBatch,
    uploadProgress,
    setUploadProgress,
    removeUploadProgress,
  } = useFilesStore();

  const [isDragging, setIsDragging] = useState(false);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [fileToDelete, setFileToDelete] = useState<FileWithIndex | null>(null);
  const [previewFile, setPreviewFile] = useState<FileWithIndex | null>(null);

  // Load files on mount
  useEffect(() => {
    if (workspaceId) {
      loadFiles();
    }
  }, [workspaceId]);

  const loadFiles = async () => {
    if (!workspaceId) return;
    
    setLoading(true);
    try {
      // Load from local DB first
      const localFiles = await getFilesWithIndexState(workspaceId);
      setFiles(localFiles);
      
      // Then sync with server
      if (user) {
        const response = await filesApi.list(workspaceId, {
          userId: user.id,
          username: user.username,
          role: user.role,
        });
        if (response.success && response.data) {
          // Merge server data with local
          // For now, just use server data
        }
      }
    } catch (error) {
      console.error('Failed to load files:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleDragOver = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(true);
  }, []);

  const handleDragLeave = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
  }, []);

  const handleDrop = useCallback(async (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);

    const droppedFiles = Array.from(e.dataTransfer.files).filter(
      (file) => file.type === 'application/pdf'
    );

    if (droppedFiles.length === 0) {
      toast({
        title: 'Format invalid',
        description: 'Doar fișiere PDF sunt acceptate.',
        variant: 'destructive',
      });
      return;
    }

    await uploadFiles(droppedFiles);
  }, [workspaceId]);

  const handleFileSelect = useCallback(async (e: React.ChangeEvent<HTMLInputElement>) => {
    const selectedFiles = Array.from(e.target.files || []).filter(
      (file) => file.type === 'application/pdf'
    );

    if (selectedFiles.length > 0) {
      await uploadFiles(selectedFiles);
    }

    // Reset input
    e.target.value = '';
  }, [workspaceId]);

  const uploadFiles = async (filesToUpload: File[]) => {
    if (!workspaceId || !user) return;

    for (const file of filesToUpload) {
      const tempId = `temp-${Date.now()}-${file.name}`;
      
      setUploadProgress(tempId, {
        docId: tempId,
        filename: file.name,
        progress: 0,
        status: 'uploading',
      });

      try {
        // Create local file entry
        const dbFile = await createFile(
          workspaceId,
          file.name,
          file.size,
          file
        );

        // Update progress
        setUploadProgress(tempId, {
          docId: dbFile.docId,
          filename: file.name,
          progress: 50,
          status: 'processing',
        });

        // Add to store
        addFile({
          ...dbFile,
          indexState: {
            docId: dbFile.docId,
            workspaceId,
            status: 'not_indexed',
          },
        });

        // Try to upload to server
        try {
          await filesApi.upload(
            workspaceId,
            file,
            {
              userId: user.id,
              username: user.username,
              role: user.role,
            },
            (progress) => {
              setUploadProgress(tempId, {
                docId: dbFile.docId,
                filename: file.name,
                progress: 50 + progress * 0.5,
                status: 'uploading',
              });
            }
          );
        } catch (uploadError) {
          console.warn('Server upload failed, file saved locally:', uploadError);
        }

        setUploadProgress(tempId, {
          docId: dbFile.docId,
          filename: file.name,
          progress: 100,
          status: 'complete',
        });

        setTimeout(() => removeUploadProgress(tempId), 2000);
      } catch (error) {
        setUploadProgress(tempId, {
          docId: tempId,
          filename: file.name,
          progress: 0,
          status: 'error',
          errorMessage: 'Eroare la încărcare',
        });

        toast({
          title: 'Eroare',
          description: `Nu s-a putut încărca ${file.name}`,
          variant: 'destructive',
        });
      }
    }
  };

  const handleDelete = async () => {
    if (!fileToDelete || !workspaceId || !user) return;

    try {
      // Delete from local DB
      await deleteFileFromDB(fileToDelete.docId);
      
      // Remove from store
      removeFile(fileToDelete.docId);

      // Try to delete from server
      try {
        await filesApi.delete(workspaceId, fileToDelete.docId, {
          userId: user.id,
          username: user.username,
          role: user.role,
        });
      } catch (serverError) {
        console.warn('Server delete failed:', serverError);
      }

      toast({
        title: 'Fișier șters',
        description: `${fileToDelete.filename} a fost șters.`,
      });
    } catch (error) {
      toast({
        title: 'Eroare',
        description: 'Nu s-a putut șterge fișierul.',
        variant: 'destructive',
      });
    } finally {
      setDeleteDialogOpen(false);
      setFileToDelete(null);
    }
  };

  const handleIndexNew = async () => {
    if (!workspaceId || !user) return;

    const notIndexed = files.filter(
      (f) => !f.indexState || f.indexState.status !== 'ready'
    );

    if (notIndexed.length === 0) {
      toast({
        title: 'Nimic de indexat',
        description: 'Toate fișierele sunt deja indexate.',
      });
      return;
    }

    const docIds = notIndexed.map((f) => f.docId);
    setIndexingBatch(docIds, true);

    // Update local status
    for (const docId of docIds) {
      await upsertIndexState({
        docId,
        workspaceId,
        status: 'indexing',
        lastAttemptAt: Date.now(),
      });
      updateIndexState(docId, { status: 'indexing' });
    }

    try {
      const response = await filesApi.index(workspaceId, docIds, {
        userId: user.id,
        username: user.username,
        role: user.role,
      });

      if (response.success && response.data) {
        // Update successful indexes
        for (const docId of response.data.indexed) {
          await upsertIndexState({
            docId,
            workspaceId,
            status: 'ready',
            indexedAt: Date.now(),
          });
          updateIndexState(docId, { status: 'ready', indexedAt: Date.now() });
        }

        // Update failed indexes
        for (const docId of response.data.failed) {
          await upsertIndexState({
            docId,
            workspaceId,
            status: 'failed',
            lastError: 'Indexare eșuată',
            lastAttemptAt: Date.now(),
          });
          updateIndexState(docId, { status: 'failed' });
        }

        toast({
          title: 'Indexare completă',
          description: `${response.data.indexed.length} fișiere indexate, ${response.data.failed.length} eșuate.`,
        });
      }
    } catch (error) {
      // Mark all as failed
      for (const docId of docIds) {
        await upsertIndexState({
          docId,
          workspaceId,
          status: 'failed',
          lastError: 'Eroare de conexiune',
          lastAttemptAt: Date.now(),
        });
        updateIndexState(docId, { status: 'failed' });
      }

      toast({
        title: 'Eroare',
        description: 'Indexarea a eșuat.',
        variant: 'destructive',
      });
    } finally {
      setIndexingBatch(docIds, false);
    }
  };

  const handleReindex = async (file: FileWithIndex) => {
    if (!workspaceId || !user) return;

    setIndexing(file.docId, true);
    updateIndexState(file.docId, { status: 'indexing' });

    try {
      await filesApi.reindex(workspaceId, file.docId, {
        userId: user.id,
        username: user.username,
        role: user.role,
      });

      await upsertIndexState({
        docId: file.docId,
        workspaceId,
        status: 'ready',
        indexedAt: Date.now(),
      });
      updateIndexState(file.docId, { status: 'ready', indexedAt: Date.now() });

      toast({
        title: 'Reindexare completă',
        description: `${file.filename} a fost reindexat.`,
      });
    } catch (error) {
      await upsertIndexState({
        docId: file.docId,
        workspaceId,
        status: 'failed',
        lastError: 'Reindexare eșuată',
        lastAttemptAt: Date.now(),
      });
      updateIndexState(file.docId, { status: 'failed' });

      toast({
        title: 'Eroare',
        description: 'Reindexarea a eșuat.',
        variant: 'destructive',
      });
    } finally {
      setIndexing(file.docId, false);
    }
  };

  const getStatusBadge = (file: FileWithIndex) => {
    const status = file.indexState?.status || 'not_indexed';
    const isIndexing = indexingDocIds.has(file.docId);

    if (isIndexing) {
      return (
        <Badge variant="secondary" className="gap-1">
          <Loader2 className="h-3 w-3 animate-spin" />
          Se indexează
        </Badge>
      );
    }

    switch (status) {
      case 'ready':
        return (
          <Badge variant="default" className="gap-1 bg-green-600">
            <CheckCircle className="h-3 w-3" />
            Indexat
          </Badge>
        );
      case 'indexing':
        return (
          <Badge variant="secondary" className="gap-1">
            <Loader2 className="h-3 w-3 animate-spin" />
            Se indexează
          </Badge>
        );
      case 'failed':
        return (
          <Badge variant="destructive" className="gap-1">
            <XCircle className="h-3 w-3" />
            Eșuat
          </Badge>
        );
      default:
        return (
          <Badge variant="outline" className="gap-1">
            <Clock className="h-3 w-3" />
            Neindexat
          </Badge>
        );
    }
  };

  const filteredFiles = getFilteredFiles();
  const uploadProgressArray = Array.from(uploadProgress.values());

  return (
    <div className="flex flex-col h-full">
      {/* Header */}
      <header className="flex items-center justify-between h-14 px-4 border-b bg-background/95 backdrop-blur shrink-0">
        <h1 className="font-semibold">Fișiere PDF</h1>
        <Button onClick={handleIndexNew} disabled={isLoading}>
          <RefreshCw className="h-4 w-4 mr-2" />
          Indexează fișiere noi
        </Button>
      </header>

      <div className="flex-1 p-6 overflow-hidden">
        <div className="max-w-6xl mx-auto h-full flex flex-col gap-6">
          {/* Upload Area */}
          <div
            className={cn(
              'border-2 border-dashed rounded-xl p-8 text-center transition-colors cursor-pointer',
              isDragging
                ? 'border-primary bg-primary/5'
                : 'hover:border-accent'
            )}
            onDragOver={handleDragOver}
            onDragLeave={handleDragLeave}
            onDrop={handleDrop}
            onClick={() => document.getElementById('file-input')?.click()}
          >
            <input
              id="file-input"
              type="file"
              accept="application/pdf"
              multiple
              className="hidden"
              onChange={handleFileSelect}
            />
            <Upload className="h-10 w-10 mx-auto text-muted-foreground mb-3" />
            <h3 className="font-medium mb-1">
              {isDragging ? 'Plasează fișierele aici' : 'Încarcă fișiere PDF'}
            </h3>
            <p className="text-sm text-muted-foreground">
              Drag & drop sau click pentru a selecta
            </p>
          </div>

          {/* Upload Progress */}
          {uploadProgressArray.length > 0 && (
            <div className="space-y-2">
              {uploadProgressArray.map((progress) => (
                <div
                  key={progress.docId}
                  className="flex items-center gap-3 p-3 bg-muted/50 rounded-lg"
                >
                  <FileText className="h-5 w-5 text-muted-foreground shrink-0" />
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium truncate">{progress.filename}</p>
                    <Progress value={progress.progress} className="h-1.5 mt-1" />
                  </div>
                  {progress.status === 'complete' && (
                    <CheckCircle className="h-5 w-5 text-green-600 shrink-0" />
                  )}
                  {progress.status === 'error' && (
                    <XCircle className="h-5 w-5 text-destructive shrink-0" />
                  )}
                </div>
              ))}
            </div>
          )}

          {/* Filters */}
          <div className="flex items-center gap-3">
            <div className="relative flex-1 max-w-sm">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Caută fișiere..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-9"
              />
            </div>
            <Select value={filter} onValueChange={(v) => setFilter(v as typeof filter)}>
              <SelectTrigger className="w-[160px]">
                <Filter className="h-4 w-4 mr-2" />
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Toate</SelectItem>
                <SelectItem value="indexed">Indexate</SelectItem>
                <SelectItem value="not_indexed">Neindexate</SelectItem>
              </SelectContent>
            </Select>
          </div>

          {/* Files List */}
          <ScrollArea className="flex-1">
            {isLoading ? (
              <div className="flex items-center justify-center py-12">
                <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
              </div>
            ) : filteredFiles.length === 0 ? (
              <div className="flex flex-col items-center justify-center py-12 text-center">
                <FileText className="h-12 w-12 text-muted-foreground/50 mb-3" />
                <p className="text-muted-foreground">
                  {files.length === 0
                    ? 'Niciun fișier încărcat'
                    : 'Niciun fișier găsit cu filtrele selectate'}
                </p>
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {filteredFiles.map((file) => (
                  <Card key={file.docId} className="group">
                    <CardContent className="p-4">
                      <div className="flex items-start gap-3">
                        <div className="p-2 bg-red-100 dark:bg-red-900/30 rounded-lg shrink-0">
                          <FileText className="h-6 w-6 text-red-600 dark:text-red-400" />
                        </div>
                        <div className="flex-1 min-w-0">
                          <p className="font-medium truncate" title={file.filename}>
                            {file.filename}
                          </p>
                          <p className="text-xs text-muted-foreground mt-1">
                            {(file.size / 1024 / 1024).toFixed(2)} MB •{' '}
                            {new Date(file.uploadedAt).toLocaleDateString('ro-RO')}
                          </p>
                          <div className="mt-2">
                            {getStatusBadge(file)}
                          </div>
                        </div>
                      </div>

                      {/* Actions */}
                      <div className="flex items-center gap-2 mt-4 pt-3 border-t">
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => setPreviewFile(file)}
                        >
                          <Eye className="h-4 w-4 mr-1" />
                          Previzualizare
                        </Button>
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => handleReindex(file)}
                          disabled={indexingDocIds.has(file.docId)}
                        >
                          <RefreshCw className={cn(
                            'h-4 w-4 mr-1',
                            indexingDocIds.has(file.docId) && 'animate-spin'
                          )} />
                          Reindexare
                        </Button>
                        <Button
                          variant="ghost"
                          size="sm"
                          className="text-destructive hover:text-destructive ml-auto"
                          onClick={() => {
                            setFileToDelete(file);
                            setDeleteDialogOpen(true);
                          }}
                        >
                          <Trash2 className="h-4 w-4" />
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

      {/* Delete Confirmation */}
      <AlertDialog open={deleteDialogOpen} onOpenChange={setDeleteDialogOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Șterge fișierul?</AlertDialogTitle>
            <AlertDialogDescription>
              Ești sigur că vrei să ștergi „{fileToDelete?.filename}"? Această acțiune
              nu poate fi anulată.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Anulează</AlertDialogCancel>
            <AlertDialogAction
              onClick={handleDelete}
              className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
            >
              Șterge
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      {/* PDF Preview Modal */}
      {previewFile && (
        <PDFPreviewModal
          file={previewFile}
          onClose={() => setPreviewFile(null)}
        />
      )}
    </div>
  );
}
