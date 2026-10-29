import { useEffect, useState } from 'react';
import fallbackJson from '@/content/fallback.json';
import { isSupabaseConfigured } from '@/lib/config';
import { normalizeContent } from '@/lib/content';
import { fetchPublished, readCachedContent, writeCachedContent } from '@/services/portfolio';
import type { PortfolioContent } from '@/types/content';

const fallback = normalizeContent(fallbackJson) as PortfolioContent;

/**
 * Stale-while-revalidate: show the cached snapshot immediately, refresh from the database in the background.
 * If the database is unreachable (e.g. a paused free-tier project) the last known or bundled content is shown.
 */
export function usePortfolio(): { content: PortfolioContent | null; live: boolean } {
  const [content, setContent] = useState<PortfolioContent | null>(() =>
    isSupabaseConfigured ? readCachedContent() : fallback,
  );
  const [live, setLive] = useState(false);

  useEffect(() => {
    if (!isSupabaseConfigured) return;
    let cancelled = false;
    fetchPublished()
      .then((fresh) => {
        if (cancelled) return;
        if (fresh) {
          setContent(fresh);
          setLive(true);
          writeCachedContent(fresh);
        } else {
          setContent((current) => current ?? fallback);
        }
      })
      .catch(() => {
        if (!cancelled) setContent((current) => current ?? fallback);
      });
    return () => {
      cancelled = true;
    };
  }, []);

  return { content, live };
}
