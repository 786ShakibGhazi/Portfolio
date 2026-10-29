# Sakiv Portfolio

A responsive, wizard-inspired portfolio and content dashboard for Sakiv. The public site is built with React, Vite, TypeScript, Tailwind CSS and Motion. Supabase provides authentication, PostgreSQL content, private admin authorization, public published snapshots, storage and contact-message handling.

## Requirements

- Node.js 20 or newer and npm
- A Supabase project for persistent content and administrator access
- Git and a GitHub repository for the optional GitHub Pages deployment

## Local Development

```powershell
npm ci
Copy-Item .env.example .env.local
```

Set `VITE_SUPABASE_URL` and `VITE_SUPABASE_ANON_KEY` in `.env.local` using the project URL and publishable/anon key from Supabase Project Settings > API. These are public client values; never use a service-role key in the frontend. `VITE_SITE_URL` can remain `http://localhost:5173/` locally. Set `VITE_BASE_PATH=/` for local development.

```powershell
npm run dev
```

The app also renders resume-derived fallback content when Supabase is not configured, but authentication, persistence, uploads and contact submissions require a configured Supabase project.

## Supabase Setup

1. Create a Supabase project and open its SQL Editor.
2. Run [`supabase/migrations/0001_init.sql`](supabase/migrations/0001_init.sql) to create the schema, RLS policies, RPC functions and public storage buckets.
3. Run [`supabase/seed.sql`](supabase/seed.sql) to seed the editable draft and its initial published snapshot. It skips if a profile already exists. The source content is [`src/content/fallback.json`](src/content/fallback.json); regenerate the SQL after changing seed data with `npm run seed:generate`.
4. In Supabase Authentication settings, disable public sign-ups. Add the first user yourself under Authentication > Users > Add user, then copy that user's UUID and run this in the SQL Editor:

   ```sql
   insert into public.admins (user_id) values ('<AUTH_USER_UUID>');
   ```

5. In Authentication > URL Configuration, set the local Site URL to `http://localhost:5173/` and add `http://localhost:5173/admin/reset-password` to Redirect URLs. Add the production base URL and its `/admin/reset-password` URL after deployment. Use the exact project base path when deploying to a repository subpath.
6. Add the same project URL and publishable/anon key to `.env.local`, then start the app. Sign in at `/admin/login` with the account created above.

The SQL gives anonymous visitors read access only to the single published snapshot and public media. Draft tables and all writes require an authenticated user in `public.admins`; contact submissions go through a validating, rate-limited database function. The browser-side route guard is not the authorization boundary: RLS and function checks are.

## Content Management

Use `/admin` to sign in, edit profile and portfolio sections, reorder items, manage media, and preview draft content. Saving updates the draft; choose Publish to replace the public snapshot. The public page refreshes its published data on load and caches it locally as a fallback. Create a resume PDF and upload it from the profile editor; no resume file is included because the attached resume was provided as parsed text.

The resume did not include direct social-profile URLs or project demo/repository URLs. Those links are intentionally left blank until supplied in the dashboard.

## Production Build

```powershell
npm run typecheck
npm run build
npm run preview
```

Vite emits `robots.txt`, `sitemap.xml`, a favicon, Open Graph image and a `404.html` fallback for GitHub Pages SPA routes. The Content Security Policy is injected at build time and allows the configured Supabase origin.

## GitHub Pages Deployment

A workflow at [`.github/workflows/deploy.yml`](.github/workflows/deploy.yml) builds and deploys `dist/` on pushes to `main`. In GitHub, enable Pages with **GitHub Actions** as the build source. Add the following repository Actions variables in Settings > Secrets and variables > Actions > Variables:

- `VITE_SUPABASE_URL`: Supabase project URL
- `VITE_SUPABASE_ANON_KEY`: Supabase publishable/anon key (public by design)

The workflow derives the project-pages base path and URL from the repository name. For a custom domain or the special `username.github.io` repository, adjust `VITE_BASE_PATH` and `VITE_SITE_URL` in the workflow to `/` and the canonical domain before deployment. Add the resulting production URLs to Supabase Authentication > URL Configuration. GitHub Pages hosts only the static frontend; Supabase remains the backend.

```powershell
git init
git add .
git commit -m "Build Sakiv portfolio"
git branch -M main
git remote add origin https://github.com/<github-user>/<repository>.git
git push -u origin main
```

For later application-code changes, push to `main` and the workflow redeploys. For portfolio text, projects, experience, skills, media and resume changes, use the admin dashboard and publish; those edits do not require a Git commit or frontend deployment.

## Free-Tier Notes

The frontend is static and can be served by GitHub Pages without a server process. Supabase free-plan limits, storage/bandwidth quotas, and inactivity behavior can change; consult the current [Supabase pricing](https://supabase.com/pricing) and [GitHub Pages limits](https://docs.github.com/pages/getting-started-with-github-pages/github-pages-limits) before relying on the free tier. Free database projects may pause after prolonged inactivity, so check project status if the site stops loading live content. Keep independent backups of the database and uploaded files.

## Verification Checklist

- [ ] Public site loads without authentication and displays the published resume-derived content.
- [ ] Admin login works only for the user explicitly added to `public.admins`; sign-out and password reset work.
- [ ] Draft edits persist after refresh and remain private until published.
- [ ] Publishing updates the public page without a code deployment.
- [ ] Anonymous direct writes to draft tables and storage are rejected by RLS.
- [ ] Contact validation, honeypot and database rate limits reject invalid/spam submissions.
- [ ] Resume and image uploads respect type and size limits.
- [ ] Public and admin layouts are keyboard usable and responsive at mobile widths.
- [ ] GitHub Actions completes and the production URL and Supabase redirect URLs are correct.

## Security and Operations

Do not commit `.env.local` or privileged Supabase credentials. `.gitignore` excludes local environment files. The anon key is expected to be visible in the frontend; security depends on RLS, restricted Auth sign-up and the database authorization checks. Back up the database and storage separately before significant updates.
