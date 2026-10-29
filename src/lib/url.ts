import { BUCKETS } from './config';
import { supabase } from './supabase';

/** Only allow http(s), mailto and tel links to be rendered as hrefs. */
export function safeUrl(value?: string | null): string | null {
  if (!value) return null;
  try {
    const url = new URL(value.trim());
    return ['http:', 'https:', 'mailto:', 'tel:'].includes(url.protocol) ? url.toString() : null;
  } catch {
    return null;
  }
}

function storageUrl(bucket: string, path?: string | null, download?: string): string | null {
  if (!path || !supabase) return null;
  return supabase.storage.from(bucket).getPublicUrl(path, download ? { download } : undefined).data.publicUrl;
}

export const imageUrl = (path?: string | null) => storageUrl(BUCKETS.images, path);

export const resumeUrl = (path?: string | null, downloadName = 'Resume.pdf') =>
  storageUrl(BUCKETS.resume, path, downloadName);

export const resumeViewUrl = (path?: string | null) => storageUrl(BUCKETS.resume, path);

export function telHref(phone: string): string {
  return `tel:${phone.replace(/[^\d+]/g, '')}`;
}
