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
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { useFilesStore, type FileWithIndex } from '@/store/filesStore';
import { useAuthStore } from '@/store/authStore';
import { useTranslation } from '@/hooks/useTranslation';
import { toast } from '@/hooks/use-toast';
import { cn } from '@/lib/utils';
import { formatTranslation } from '@/lib/i18n';
import { createFile, upsertIndexState, deleteFile as deleteFileFromDB, getFilesWithIndexState } from '@/db/repo';
import { filesApi } from '@/api/n8nClient';
import { PDFPreviewModal } from '@/components/files/PDFPreviewModal';
import { MaliciousPdfDialog } from '@/components/common/MaliciousPdfDialog';
import { isPdfLikelyMalicious } from '@/lib/pdfSecurity';

export default function FilesPage() {
  const { t } = useTranslation();
  const format = useCallback(
    (key: string, params: Record<string, string | number>) =>
      formatTranslation(t(key), params),
    [t]
  );
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
    clearUploadProgress,
  } = useFilesStore();

  const [isDragging, setIsDragging] = useState(false);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [fileToDelete, setFileToDelete] = useState<FileWithIndex | null>(null);
  const [previewFile, setPreviewFile] = useState<FileWithIndex | null>(null);
  const [loadError, setLoadError] = useState(false);
  const [deleteAllDialogOpen, setDeleteAllDialogOpen] = useState(false);
  const [isDeletingAll, setIsDeletingAll] = useState(false);
  const [maliciousDialogOpen, setMaliciousDialogOpen] = useState(false);

  // Load files on mount
  useEffect(() => {
    if (workspaceId) {
      loadFiles();
    }
  }, [workspaceId]);

  const loadFiles = async () => {
    if (!workspaceId) return;
    
    setLoading(true);
    setLoadError(false);
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
      setLoadError(true);
      toast({
        title: t('files.loadErrorTitle'),
        description: t('files.loadErrorDescription'),
        variant: 'destructive',
      });
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
        title: t('files.uploadInvalidTitle'),
        description: t('files.uploadInvalidDescription'),
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
      const suspicious = await isPdfLikelyMalicious(file);
      if (suspicious) {
        setMaliciousDialogOpen(true);
        continue;
      }
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
          errorMessage: t('files.uploadErrorTitle'),
        });

        toast({
          title: t('files.uploadErrorTitle'),
          description: format('files.uploadErrorDescription', { filename: file.name }),
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
        title: t('files.deleteSuccessTitle'),
        description: format('files.deleteSuccessDescription', { filename: fileToDelete.filename }),
      });
    } catch (error) {
      toast({
        title: t('common.error'),
        description: t('files.deleteErrorDescription'),
        variant: 'destructive',
      });
    } finally {
      setDeleteDialogOpen(false);
      setFileToDelete(null);
    }
  };

  const handleDeleteAll = async () => {
    if (!workspaceId || !user || files.length === 0) return;
    setIsDeletingAll(true);
    const docIds = files.map((file) => file.docId);

    try {
      for (const docId of docIds) {
        await deleteFileFromDB(docId);
        removeFile(docId);
      }
      clearUploadProgress();

      for (const docId of docIds) {
        try {
          await filesApi.delete(workspaceId, docId, {
            userId: user.id,
            username: user.username,
            role: user.role,
          });
        } catch (serverError) {
          console.warn('Server delete failed:', serverError);
        }
      }

      toast({
        title: t('files.deleteAllSuccessTitle'),
        description: t('files.deleteAllSuccessDescription'),
      });
    } catch (error) {
      toast({
        title: t('common.error'),
        description: t('files.deleteAllErrorDescription'),
        variant: 'destructive',
      });
    } finally {
      setIsDeletingAll(false);
      setDeleteAllDialogOpen(false);
    }
  };

  const handleIndexNew = async () => {
    if (!workspaceId || !user) return;

    const notIndexed = files.filter(
      (f) => !f.indexState || f.indexState.status !== 'ready'
    );

    if (notIndexed.length === 0) {
      toast({
        title: t('files.indexNothingTitle'),
        description: t('files.indexNothingDescription'),
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
          title: t('files.indexCompleteTitle'),
          description: format('files.indexCompleteDescription', {
            indexed: response.data.indexed.length,
            failed: response.data.failed.length,
          }),
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
        title: t('common.error'),
        description: t('files.indexErrorDescription'),
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
        title: t('files.reindexCompleteTitle'),
        description: format('files.reindexCompleteDescription', { filename: file.filename }),
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
        title: t('common.error'),
        description: t('files.reindexErrorDescription'),
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
          {t('files.statusIndexing')}
        </Badge>
      );
    }

    switch (status) {
      case 'ready':
        return (
          <Badge variant="default" className="gap-1 bg-green-600">
            <CheckCircle className="h-3 w-3" />
            {t('files.statusReady')}
          </Badge>
        );
      case 'indexing':
        return (
          <Badge variant="secondary" className="gap-1">
            <Loader2 className="h-3 w-3 animate-spin" />
            {t('files.statusIndexing')}
          </Badge>
        );
      case 'failed':
        return (
          <Badge variant="destructive" className="gap-1">
            <XCircle className="h-3 w-3" />
            {t('files.statusFailed')}
          </Badge>
        );
      default:
        return (
          <Badge variant="outline" className="gap-1">
            <Clock className="h-3 w-3" />
            {t('files.statusNotIndexed')}
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
        <h1 className="font-semibold">{t('files.title')}</h1>
        <div className="flex items-center gap-2">
          <Button onClick={handleIndexNew} disabled={isLoading || isDeletingAll}>
            <RefreshCw className="h-4 w-4 mr-2" />
            {t('files.indexNew')}
          </Button>
          <Button
            variant="destructive"
            onClick={() => setDeleteAllDialogOpen(true)}
            disabled={isLoading || isDeletingAll || files.length === 0}
          >
            <Trash2 className="h-4 w-4 mr-2" />
            {t('files.deleteAll')}
          </Button>
        </div>
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
              {isDragging ? t('files.uploadDrop') : t('files.uploadTitle')}
            </h3>
            <p className="text-sm text-muted-foreground">
              {t('files.uploadHint')}
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
                placeholder={t('files.searchPlaceholder')}
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
                <SelectItem value="all">{t('files.filterAll')}</SelectItem>
                <SelectItem value="indexed">{t('files.filterIndexed')}</SelectItem>
                <SelectItem value="not_indexed">{t('files.filterNotIndexed')}</SelectItem>
              </SelectContent>
            </Select>
          </div>

          {loadError && (
            <Alert variant="destructive">
              <AlertTitle>{t('files.loadErrorTitle')}</AlertTitle>
              <AlertDescription className="flex items-center justify-between gap-4">
                <span>{t('files.loadErrorDescription')}</span>
                <Button variant="outline" size="sm" onClick={loadFiles}>
                  {t('common.retry')}
                </Button>
              </AlertDescription>
            </Alert>
          )}

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
                  {files.length === 0 ? t('files.emptyNone') : t('files.emptyFiltered')}
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
                          {t('files.preview')}
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
                          {t('files.reindex')}
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
            <AlertDialogTitle>{t('files.deleteConfirmTitle')}</AlertDialogTitle>
            <AlertDialogDescription>
              {format('files.deleteConfirmDescription', {
                filename: fileToDelete?.filename ?? '',
              })}
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>{t('common.cancel')}</AlertDialogCancel>
            <AlertDialogAction
              onClick={handleDelete}
              className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
            >
              {t('common.delete')}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      {/* Delete All Confirmation */}
      <AlertDialog open={deleteAllDialogOpen} onOpenChange={setDeleteAllDialogOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>{t('files.deleteAllTitle')}</AlertDialogTitle>
            <AlertDialogDescription>
              {t('files.deleteAllDescription')}
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>{t('common.cancel')}</AlertDialogCancel>
            <AlertDialogAction
              onClick={handleDeleteAll}
              className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
              disabled={isDeletingAll}
            >
              {isDeletingAll ? t('common.loading') : t('files.deleteAllConfirm')}
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

      <MaliciousPdfDialog
        open={maliciousDialogOpen}
        onClose={() => setMaliciousDialogOpen(false)}
      />
    </div>
  );
}
