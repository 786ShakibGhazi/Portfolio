const url = import.meta.env.VITE_SUPABASE_URL?.trim();
const anonKey = import.meta.env.VITE_SUPABASE_ANON_KEY?.trim();

export const env = { supabaseUrl: url, supabaseAnonKey: anonKey };

export const isSupabaseConfigured = Boolean(url && anonKey && !url.includes('YOUR-PROJECT-REF'));

export const BUCKETS = {
  images: 'portfolio-images',
  resume: 'portfolio-resume',
} as const;

export const LIMITS = {
  imageBytes: 2 * 1024 * 1024,
  resumeBytes: 5 * 1024 * 1024,
} as const;

export const SITE = {
  name: 'Sakiv',
  contentCacheKey: 'portfolio-content-v1',
} as const;
