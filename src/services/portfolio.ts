import { SITE } from '@/lib/config';
import { normalizeContent } from '@/lib/content';
import { getClient } from '@/lib/supabase';
import type { PortfolioContent } from '@/types/content';

/** Reads the single published snapshot. Anonymous visitors can only read this row (see RLS). */
export async function fetchPublished(): Promise<PortfolioContent | null> {
  const { data, error } = await getClient().from('published_content').select('content').eq('id', 1).maybeSingle();
  if (error) throw error;
  return data ? normalizeContent(data.content) : null;
}

export function readCachedContent(): PortfolioContent | null {
  try {
    const raw = localStorage.getItem(SITE.contentCacheKey);
    return raw ? normalizeContent(JSON.parse(raw)) : null;
  } catch {
    return null;
  }
}

export function writeCachedContent(content: PortfolioContent): void {
  try {
    localStorage.setItem(SITE.contentCacheKey, JSON.stringify(content));
  } catch {
    /* storage may be full or unavailable; caching is best-effort */
  }
}

export async function fetchDraft(): Promise<PortfolioContent> {
  const { data, error } = await getClient().rpc('get_draft_portfolio');
  if (error) throw error;
  const content = normalizeContent(data);
  if (!content) throw new Error('Add your profile details first, then preview.');
  return content;
}
