import React, { useState, useEffect, useRef } from 'react';
import { X, ChevronLeft, ChevronRight, ZoomIn, ZoomOut, Download, Loader2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import type { FileWithIndex } from '@/store/filesStore';
import { getPdfjs } from '@/lib/pdfjs';

interface PDFPreviewModalProps {
  file: FileWithIndex;
  onClose: () => void;
}

type PDFDocumentProxy = Awaited<ReturnType<ReturnType<typeof getPdfjs>['getDocument']>['promise']>;
type RenderTask = ReturnType<Awaited<ReturnType<PDFDocumentProxy['getPage']>>['render']>;

export function PDFPreviewModal({ file, onClose }: PDFPreviewModalProps) {
  const pdfjsLib = getPdfjs();
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(0);
  const [scale, setScale] = useState(1.2);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const pdfDocRef = useRef<PDFDocumentProxy | null>(null);
  const renderTaskRef = useRef<RenderTask | null>(null);

  useEffect(() => {
    setCurrentPage(1);
    setScale(1.2);
    loadPDF();
    return () => {
      renderTaskRef.current?.cancel();
      pdfDocRef.current?.destroy();
    };
  }, [file]);

  useEffect(() => {
    if (!isLoading && pdfDocRef.current) {
      renderPage(currentPage);
    }
  }, [isLoading, currentPage, scale]);

  const loadPDF = async () => {
    setIsLoading(true);
    setError(null);

    try {
      let pdfData: ArrayBuffer;

      if (file.fileBlob) {
        pdfData = await file.fileBlob.arrayBuffer();
      } else if (file.blobKey) {
        // TODO: Load from blob storage
        throw new Error('Fișierul nu este disponibil local');
      } else {
        throw new Error('Fișierul nu este disponibil');
      }

      const pdf = await pdfjsLib.getDocument({ data: pdfData }).promise;
      pdfDocRef.current = pdf;
      setTotalPages(pdf.numPages);
    } catch (err) {
      console.error('Failed to load PDF:', err);
      setError(err instanceof Error ? err.message : 'Nu s-a putut încărca PDF-ul');
    } finally {
      setIsLoading(false);
    }
  };

  const renderPage = async (pageNumber: number) => {
    if (!pdfDocRef.current || !canvasRef.current) return;

    try {
      const page = await pdfDocRef.current.getPage(pageNumber);
      const viewport = page.getViewport({ scale });
      const canvas = canvasRef.current;
      const context = canvas.getContext('2d');

      if (!context) return;

      renderTaskRef.current?.cancel();
      canvas.height = viewport.height;
      canvas.width = viewport.width;

      context.setTransform(1, 0, 0, 1, 0, 0);
      context.fillStyle = '#ffffff';
      context.fillRect(0, 0, canvas.width, canvas.height);

      renderTaskRef.current = page.render({
        canvasContext: context,
        viewport,
        background: '#ffffff',
      });
      await renderTaskRef.current.promise;
    } catch (err) {
      if (err instanceof Error && err.name === 'RenderingCancelledException') {
        return;
      }
      console.error('Failed to render page:', err);
      setError(err instanceof Error ? err.message : 'Nu s-a putut afișa pagina');
    }
  };

  const handlePrevPage = () => {
    if (currentPage > 1) {
      setCurrentPage((prev) => prev - 1);
    }
  };

  const handleNextPage = () => {
    if (currentPage < totalPages) {
      setCurrentPage((prev) => prev + 1);
    }
  };

  const handleZoomIn = () => {
    setScale((prev) => Math.min(prev + 0.2, 3));
  };

  const handleZoomOut = () => {
    setScale((prev) => Math.max(prev - 0.2, 0.5));
  };

  const handleDownload = () => {
    if (file.fileBlob) {
      const url = URL.createObjectURL(file.fileBlob);
      const a = document.createElement('a');
      a.href = url;
      a.download = file.filename;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      URL.revokeObjectURL(url);
    }
  };

  return (
    <Dialog open onOpenChange={() => onClose()}>
      <DialogContent className="max-w-4xl h-[90vh] flex flex-col p-0">
        <DialogHeader className="p-4 border-b shrink-0">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <DialogTitle className="truncate max-w-md">{file.filename}</DialogTitle>
              <Badge variant={file.indexState?.status === 'ready' ? 'default' : 'secondary'}>
                {file.indexState?.status === 'ready' ? 'Indexat' : 'Neindexat'}
              </Badge>
            </div>
            <div className="flex items-center gap-2">
              <Button variant="ghost" size="icon" onClick={handleZoomOut}>
                <ZoomOut className="h-4 w-4" />
              </Button>
              <span className="text-sm text-muted-foreground w-16 text-center">
                {Math.round(scale * 100)}%
              </span>
              <Button variant="ghost" size="icon" onClick={handleZoomIn}>
                <ZoomIn className="h-4 w-4" />
              </Button>
              <Button variant="ghost" size="icon" onClick={handleDownload} disabled={!file.fileBlob}>
                <Download className="h-4 w-4" />
              </Button>
            </div>
          </div>
        </DialogHeader>

        <div className="flex-1 overflow-auto bg-muted/30 p-4">
          {isLoading ? (
            <div className="flex items-center justify-center h-full">
              <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
            </div>
          ) : error ? (
            <div className="flex items-center justify-center h-full text-muted-foreground">
              {error}
            </div>
          ) : (
            <div className="flex justify-center">
              <canvas ref={canvasRef} className="shadow-lg" />
            </div>
          )}
        </div>

        {/* Page Navigation */}
        {totalPages > 0 && (
          <div className="flex items-center justify-center gap-4 p-4 border-t shrink-0">
            <Button
              variant="outline"
              size="icon"
              onClick={handlePrevPage}
              disabled={currentPage <= 1}
            >
              <ChevronLeft className="h-4 w-4" />
            </Button>
            <span className="text-sm">
              Pagina {currentPage} din {totalPages}
            </span>
            <Button
              variant="outline"
              size="icon"
              onClick={handleNextPage}
              disabled={currentPage >= totalPages}
            >
              <ChevronRight className="h-4 w-4" />
            </Button>
          </div>
        )}

        {/* File Info */}
        <div className="px-4 pb-4 text-xs text-muted-foreground">
          {file.indexState?.indexedAt && (
            <span>
              Ultima indexare:{' '}
              {new Date(file.indexState.indexedAt).toLocaleString('ro-RO')}
            </span>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
}
