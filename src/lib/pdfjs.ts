import * as pdfjsLib from 'pdfjs-dist';
import workerSrc from 'pdfjs-dist/build/pdf.worker.min.mjs?url';

let worker: Worker | null = null;

export function getPdfjs() {
  if (!worker) {
    worker = new Worker(workerSrc, { type: 'module' });
    pdfjsLib.GlobalWorkerOptions.workerPort = worker;
    pdfjsLib.GlobalWorkerOptions.workerSrc = workerSrc;
  }
  return pdfjsLib;
}
