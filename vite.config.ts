import { defineConfig, loadEnv, type Plugin } from 'vite';
import react from '@vitejs/plugin-react';
import { readFileSync } from 'node:fs';
import { fileURLToPath, URL } from 'node:url';

function normaliseBase(raw?: string): string {
  let base = raw?.trim() || '/';
  if (!base.startsWith('/')) base = `/${base}`;
  if (!base.endsWith('/')) base = `${base}/`;
  return base;
}

/** Injects the site URL + CSP and emits robots.txt, sitemap.xml and the GitHub Pages SPA 404 fallback. */
function siteAssets(env: Record<string, string>, base: string): Plugin {
  const siteUrl = (env.VITE_SITE_URL || 'http://localhost:5173/').replace(/\/*$/, '/');

  let connect = 'https://*.supabase.co wss://*.supabase.co';
  let img = 'https://*.supabase.co';
  try {
    if (env.VITE_SUPABASE_URL) {
      const origin = new URL(env.VITE_SUPABASE_URL).origin;
      connect = `${origin} ${origin.replace(/^https/, 'wss')}`;
      img = origin;
    }
  } catch {
    /* keep wildcard defaults */
  }

  const csp = [
    "default-src 'self'",
    "script-src 'self'",
    "style-src 'self' 'unsafe-inline'",
    `img-src 'self' data: blob: ${img}`,
    "font-src 'self' data:",
    `connect-src 'self' ${connect}`,
    "object-src 'none'",
    "base-uri 'self'",
    "form-action 'self'",
  ].join('; ');

  return {
    name: 'site-assets',
    transformIndexHtml: {
      order: 'pre',
      handler(html, ctx) {
        let out = html.replaceAll('__SITE_URL__', siteUrl);
        out = ctx.server
          ? out.replace('<!--CSP-->', '')
          : out.replace('<!--CSP-->', `<meta http-equiv="Content-Security-Policy" content="${csp}" />`);
        return out;
      },
    },
    generateBundle() {
      this.emitFile({
        type: 'asset',
        fileName: 'robots.txt',
        source: `User-agent: *\nAllow: /\nDisallow: /admin\n\nSitemap: ${siteUrl}sitemap.xml\n`,
      });
      this.emitFile({
        type: 'asset',
        fileName: 'sitemap.xml',
        source: `<?xml version="1.0" encoding="UTF-8"?>\n<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">\n  <url><loc>${siteUrl}</loc><changefreq>monthly</changefreq><priority>1.0</priority></url>\n</urlset>\n`,
      });
      const segments = base.split('/').filter(Boolean).length;
      const template = readFileSync(fileURLToPath(new URL('./scripts/spa-404.html', import.meta.url)), 'utf8');
      this.emitFile({
        type: 'asset',
        fileName: '404.html',
        source: template.replace('__SEGMENTS__', String(segments)),
      });
    },
  };
}

export default defineConfig(({ mode }) => {
  const env = loadEnv(mode, process.cwd(), 'VITE_');
  const base = normaliseBase(env.VITE_BASE_PATH);
  return {
    base,
    plugins: [react(), siteAssets(env, base)],
    resolve: { alias: { '@': fileURLToPath(new URL('./src', import.meta.url)) } },
    build: {
      target: 'es2020',
      rollupOptions: {
        output: {
          manualChunks: {
            react: ['react', 'react-dom', 'react-router-dom'],
            motion: ['framer-motion'],
            supabase: ['@supabase/supabase-js'],
          },
        },
      },
    },
  };
});
