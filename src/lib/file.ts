import { LIMITS } from './config';

export interface PreparedFile {
  blob: Blob;
  contentType: string;
  ext: string;
}

const MAX_INPUT_IMAGE_BYTES = 15 * 1024 * 1024;
const MAX_DIMENSION = 1600;

async function readHead(file: Blob, length = 12): Promise<Uint8Array> {
  return new Uint8Array(await file.slice(0, length).arrayBuffer());
}

function detectImage(head: Uint8Array): 'image/jpeg' | 'image/png' | 'image/webp' | null {
  const ascii = (from: number, to: number) => String.fromCharCode(...head.slice(from, to));
  if (head[0] === 0xff && head[1] === 0xd8 && head[2] === 0xff) return 'image/jpeg';
  if (head[0] === 0x89 && ascii(1, 4) === 'PNG') return 'image/png';
  if (ascii(0, 4) === 'RIFF' && ascii(8, 12) === 'WEBP') return 'image/webp';
  return null;
}

function canvasToBlob(canvas: HTMLCanvasElement, type: string, quality: number): Promise<Blob | null> {
  return new Promise((resolve) => canvas.toBlob(resolve, type, quality));
}

/** Verifies the file really is JPEG/PNG/WebP, downsizes it and re-encodes it as WebP where supported. */
export async function prepareImage(file: File): Promise<PreparedFile> {
  if (file.size > MAX_INPUT_IMAGE_BYTES) throw new Error('Image is too large. Choose a file under 15 MB.');
  const detected = detectImage(await readHead(file));
  if (!detected) throw new Error('Unsupported image. Use a JPEG, PNG or WebP file.');

  let bitmap: ImageBitmap;
  try {
    bitmap = await createImageBitmap(file);
  } catch {
    throw new Error('The image could not be read. It may be corrupted.');
  }

  const scale = Math.min(1, MAX_DIMENSION / Math.max(bitmap.width, bitmap.height));
  const canvas = document.createElement('canvas');
  canvas.width = Math.max(1, Math.round(bitmap.width * scale));
  canvas.height = Math.max(1, Math.round(bitmap.height * scale));
  const ctx = canvas.getContext('2d');
  if (!ctx) throw new Error('Image processing is not supported in this browser.');
  ctx.drawImage(bitmap, 0, 0, canvas.width, canvas.height);
  bitmap.close();

  for (const quality of [0.85, 0.72, 0.6, 0.45]) {
    const blob = await canvasToBlob(canvas, 'image/webp', quality);
    if (!blob) break;
    if (blob.type !== 'image/webp') break;
    if (blob.size <= LIMITS.imageBytes) return { blob, contentType: 'image/webp', ext: 'webp' };
  }

  // Browser without WebP encoding: fall back to JPEG.
  const jpeg = await canvasToBlob(canvas, 'image/jpeg', 0.8);
  if (jpeg && jpeg.size <= LIMITS.imageBytes) return { blob: jpeg, contentType: 'image/jpeg', ext: 'jpg' };
  throw new Error('Image is still larger than 2 MB after optimisation. Choose a smaller image.');
}

export async function preparePdf(file: File): Promise<PreparedFile> {
  if (file.size > LIMITS.resumeBytes) throw new Error('PDF is too large. The limit is 5 MB.');
  const head = await readHead(file, 5);
  if (String.fromCharCode(...head) !== '%PDF-') throw new Error('That file is not a valid PDF.');
  return { blob: file, contentType: 'application/pdf', ext: 'pdf' };
}
