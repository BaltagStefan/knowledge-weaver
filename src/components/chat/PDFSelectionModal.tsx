import React, { useState, useEffect, useRef } from 'react';
import { Search, Check, FileText, Loader2, X, Filter } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Checkbox } from '@/components/ui/checkbox';
import { ScrollArea } from '@/components/ui/scroll-area';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { useFilesStore, type FileWithIndex } from '@/store/filesStore';
import { cn } from '@/lib/utils';
import * as pdfjsLib from 'pdfjs-dist';

// Configure PDF.js worker
pdfjsLib.GlobalWorkerOptions.workerSrc = `//cdnjs.cloudflare.com/ajax/libs/pdf.js/${pdfjsLib.version}/pdf.worker.min.js`;

interface PDFSelectionModalProps {
  open: boolean;
  onClose: () => void;
  onConfirm: (docIds: string[]) => void;
  initialSelection?: string[];
}

export function PDFSelectionModal({
  open,
  onClose,
  onConfirm,
  initialSelection = [],
}: PDFSelectionModalProps) {
  const { files, getIndexedFiles, isLoading } = useFilesStore();
  const [searchQuery, setSearchQuery] = useState('');
  const [filter, setFilter] = useState<'all' | 'indexed' | 'not_indexed'>('indexed');
  const [selectedIds, setSelectedIds] = useState<Set<string>>(new Set(initialSelection));
  const [thumbnails, setThumbnails] = useState<Map<string, string>>(new Map());

  useEffect(() => {
    if (open) {
      setSelectedIds(new Set(initialSelection));
      generateThumbnails();
    }
  }, [open, initialSelection]);

  const generateThumbnails = async () => {
    const newThumbnails = new Map<string, string>();

    for (const file of files) {
      if (file.fileBlob && !thumbnails.has(file.docId)) {
        try {
          const thumbnail = await generateThumbnail(file.fileBlob);
          if (thumbnail) {
            newThumbnails.set(file.docId, thumbnail);
          }
        } catch (err) {
          console.error('Failed to generate thumbnail:', err);
        }
      }
    }

    setThumbnails((prev) => new Map([...prev, ...newThumbnails]));
  };

  const generateThumbnail = async (blob: Blob): Promise<string | null> => {
    try {
      const data = await blob.arrayBuffer();
      const pdf = await pdfjsLib.getDocument({ data }).promise;
      const page = await pdf.getPage(1);
      const viewport = page.getViewport({ scale: 0.3 });

      const canvas = document.createElement('canvas');
      const context = canvas.getContext('2d');
      if (!context) return null;

      canvas.height = viewport.height;
      canvas.width = viewport.width;

      await page.render({
        canvasContext: context,
        viewport,
      }).promise;

      const thumbnail = canvas.toDataURL('image/jpeg', 0.7);
      pdf.destroy();
      return thumbnail;
    } catch {
      return null;
    }
  };

  const filteredFiles = files.filter((file) => {
    // Apply search filter
    if (searchQuery && !file.filename.toLowerCase().includes(searchQuery.toLowerCase())) {
      return false;
    }

    // Apply status filter
    if (filter === 'indexed' && file.indexState?.status !== 'ready') {
      return false;
    }
    if (filter === 'not_indexed' && file.indexState?.status === 'ready') {
      return false;
    }

    return true;
  });

  const handleToggle = (docId: string) => {
    setSelectedIds((prev) => {
      const newSet = new Set(prev);
      if (newSet.has(docId)) {
        newSet.delete(docId);
      } else {
        newSet.add(docId);
      }
      return newSet;
    });
  };

  const handleSelectAllIndexed = () => {
    const indexedFiles = getIndexedFiles();
    setSelectedIds(new Set(indexedFiles.map((f) => f.docId)));
  };

  const handleClearSelection = () => {
    setSelectedIds(new Set());
  };

  const handleConfirm = () => {
    onConfirm(Array.from(selectedIds));
    onClose();
  };

  const getStatusBadge = (file: FileWithIndex) => {
    const status = file.indexState?.status || 'not_indexed';

    switch (status) {
      case 'ready':
        return <Badge variant="default" className="text-xs bg-green-600">Indexat</Badge>;
      case 'indexing':
        return <Badge variant="secondary" className="text-xs">Se indexează</Badge>;
      case 'failed':
        return <Badge variant="destructive" className="text-xs">Eșuat</Badge>;
      default:
        return <Badge variant="outline" className="text-xs">Neindexat</Badge>;
    }
  };

  return (
    <Dialog open={open} onOpenChange={() => onClose()}>
      <DialogContent className="max-w-3xl h-[80vh] flex flex-col">
        <DialogHeader>
          <DialogTitle>Selectează fișiere PDF</DialogTitle>
          <DialogDescription>
            Alege documentele în care să se caute răspunsul.
          </DialogDescription>
        </DialogHeader>

        {/* Filters */}
        <div className="flex items-center gap-3 py-2">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Caută fișiere..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-9"
            />
          </div>
          <Select value={filter} onValueChange={(v) => setFilter(v as typeof filter)}>
            <SelectTrigger className="w-[150px]">
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

        {/* Quick Actions */}
        <div className="flex items-center gap-2 text-sm">
          <Button variant="link" size="sm" className="h-auto p-0" onClick={handleSelectAllIndexed}>
            Selectează toate indexate
          </Button>
          <span className="text-muted-foreground">•</span>
          <Button variant="link" size="sm" className="h-auto p-0" onClick={handleClearSelection}>
            Deselectează tot
          </Button>
          <span className="ml-auto text-muted-foreground">
            {selectedIds.size} selectate
          </span>
        </div>

        {/* Files Grid */}
        <ScrollArea className="flex-1 -mx-6 px-6">
          {isLoading ? (
            <div className="flex items-center justify-center py-12">
              <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
            </div>
          ) : filteredFiles.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-12 text-center">
              <FileText className="h-12 w-12 text-muted-foreground/50 mb-3" />
              <p className="text-muted-foreground">Niciun fișier găsit</p>
            </div>
          ) : (
            <div className="grid grid-cols-2 md:grid-cols-3 gap-4 pb-4">
              {filteredFiles.map((file) => {
                const isSelected = selectedIds.has(file.docId);
                const thumbnail = thumbnails.get(file.docId);
                const isIndexed = file.indexState?.status === 'ready';

                return (
                  <div
                    key={file.docId}
                    onClick={() => handleToggle(file.docId)}
                    className={cn(
                      'relative group cursor-pointer rounded-lg border-2 transition-all overflow-hidden',
                      isSelected
                        ? 'border-primary ring-2 ring-primary/20'
                        : 'border-border hover:border-muted-foreground/50'
                    )}
                  >
                    {/* Thumbnail */}
                    <div className="aspect-[3/4] bg-muted flex items-center justify-center">
                      {thumbnail ? (
                        <img
                          src={thumbnail}
                          alt={file.filename}
                          className="w-full h-full object-cover"
                        />
                      ) : (
                        <FileText className="h-12 w-12 text-muted-foreground/50" />
                      )}
                    </div>

                    {/* Selection Indicator */}
                    <div
                      className={cn(
                        'absolute top-2 right-2 h-5 w-5 rounded-full border-2 flex items-center justify-center transition-colors',
                        isSelected
                          ? 'bg-primary border-primary text-primary-foreground'
                          : 'bg-background border-muted-foreground/30'
                      )}
                    >
                      {isSelected && <Check className="h-3 w-3" />}
                    </div>

                    {/* Info */}
                    <div className="p-3 bg-background">
                      <p className="text-sm font-medium truncate" title={file.filename}>
                        {file.filename}
                      </p>
                      <div className="flex items-center justify-between mt-2">
                        <span className="text-xs text-muted-foreground">
                          {new Date(file.uploadedAt).toLocaleDateString('ro-RO')}
                        </span>
                        {getStatusBadge(file)}
                      </div>
                    </div>

                    {/* Disabled Overlay for non-indexed */}
                    {!isIndexed && (
                      <div className="absolute inset-0 bg-background/50 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
                        <span className="text-xs text-muted-foreground bg-background px-2 py-1 rounded">
                          Trebuie indexat
                        </span>
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          )}
        </ScrollArea>

        <DialogFooter className="gap-2">
          <Button variant="outline" onClick={onClose}>
            Anulează
          </Button>
          <Button onClick={handleConfirm} disabled={selectedIds.size === 0}>
            Folosește {selectedIds.size} {selectedIds.size === 1 ? 'fișier' : 'fișiere'}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
