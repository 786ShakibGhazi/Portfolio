// Refreshes src/content/fallback.json from the live published snapshot (read with the public anon key).
// The bundled fallback is only shown if the database is unreachable (e.g. a paused free-tier project).
// Usage: set VITE_SUPABASE_URL and VITE_SUPABASE_ANON_KEY in your shell or .env.local, then `npm run snapshot`.
import { existsSync, readFileSync, writeFileSync } from 'node:fs';

const root = new URL('../', import.meta.url);

function loadEnvFile(name) {
  const file = new URL(name, root);
  if (!existsSync(file)) return;
  for (const line of readFileSync(file, 'utf8').split(/\r?\n/)) {
    const m = line.match(/^\s*([A-Z0-9_]+)\s*=\s*(.*)\s*$/);
    if (m && process.env[m[1]] === undefined) process.env[m[1]] = m[2].replace(/^['"]|['"]$/g, '');
  }
}
loadEnvFile('.env.local');
loadEnvFile('.env');

const url = process.env.VITE_SUPABASE_URL;
const key = process.env.VITE_SUPABASE_ANON_KEY;
if (!url || !key) {
  console.error('VITE_SUPABASE_URL and VITE_SUPABASE_ANON_KEY must be set.');
  process.exit(1);
}

const res = await fetch(`${url.replace(/\/$/, '')}/rest/v1/published_content?id=eq.1&select=content`, {
  headers: { apikey: key, Authorization: `Bearer ${key}` },
});
if (!res.ok) {
  console.error(`Request failed: ${res.status} ${await res.text()}`);
  process.exit(1);
}
const rows = await res.json();
if (!rows.length) {
  console.error('No published content found. Publish from the admin dashboard first.');
  process.exit(1);
}
writeFileSync(new URL('src/content/fallback.json', root), `${JSON.stringify(rows[0].content, null, 2)}\n`, 'utf8');
console.log('Updated src/content/fallback.json');
