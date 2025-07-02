import { pdfjs } from 'react-pdf';
import worker from 'pdfjs-dist/build/pdf.worker.entry';

pdfjs.GlobalWorkerOptions.workerSrc = worker;