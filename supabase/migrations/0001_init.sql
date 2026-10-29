-- =====================================================================
-- Portfolio CMS schema, authorization (RLS), publishing and storage.
-- Run once in the Supabase SQL Editor (or `supabase db push`).
-- Safe to re-run: objects are created idempotently where possible.
--
-- Model:
--   * Admin-only "draft" tables hold the working copy of all content.
--   * `publish_portfolio()` snapshots the draft into `published_content`.
--   * The public site only ever reads `published_content` (one row).
-- =====================================================================

-- ---------------------------------------------------------------------
-- 1. Helpers
-- ---------------------------------------------------------------------
create or replace function public.set_updated_at()
returns trigger language plpgsql set search_path = '' as $$
begin
  new.updated_at := now();
  return new;
end;
$$;

create or replace function public.text_array_valid(arr text[], max_items int, max_len int)
returns boolean language sql immutable set search_path = '' as $$
  select cardinality(arr) <= max_items
     and not exists (select 1 from unnest(arr) a where a is null or char_length(a) not between 1 and max_len);
$$;

create or replace function public.pairs_valid(j jsonb, k1 text, k2 text, max1 int, max2 int, max_items int)
returns boolean language sql immutable set search_path = '' as $$
  select jsonb_typeof(j) = 'array'
     and jsonb_array_length(j) <= max_items
     and not exists (
       select 1 from jsonb_array_elements(j) e
       where jsonb_typeof(e) <> 'object'
          or jsonb_typeof(e -> k1) is distinct from 'string'
          or jsonb_typeof(e -> k2) is distinct from 'string'
          or char_length(e ->> k1) not between 1 and max1
          or char_length(e ->> k2) not between 1 and max2
     );
$$;

-- ---------------------------------------------------------------------
-- 2. Administrators (controlled setup: rows are inserted manually, see README)
-- ---------------------------------------------------------------------
create table if not exists public.admins (
  user_id    uuid primary key references auth.users (id) on delete cascade,
  created_at timestamptz not null default now()
);

alter table public.admins enable row level security;
revoke all on table public.admins from anon, authenticated;
grant select on table public.admins to authenticated;

drop policy if exists "admins can read their own row" on public.admins;
create policy "admins can read their own row" on public.admins
  for select to authenticated using (user_id = (select auth.uid()));

create or replace function public.is_admin()
returns boolean language sql stable security definer set search_path = '' as $$
  select exists (select 1 from public.admins where user_id = (select auth.uid()));
$$;

revoke execute on function public.is_admin() from public, anon;
grant execute on function public.is_admin() to authenticated;

-- ---------------------------------------------------------------------
-- 3. Content tables (draft / working copy)
-- ---------------------------------------------------------------------
create table if not exists public.profile (
  id           smallint primary key default 1 check (id = 1),
  full_name    text not null check (char_length(full_name) between 1 and 100),
  title        text not null check (char_length(title) between 1 and 120),
  headline     text not null check (char_length(headline) between 1 and 200),
  intro        text not null check (char_length(intro) between 1 and 600),
  bio          text not null default '' check (char_length(bio) <= 4000),
  roles        text[] not null default '{}' check (public.text_array_valid(roles, 10, 60)),
  stats        jsonb not null default '[]' check (public.pairs_valid(stats, 'value', 'label', 20, 60, 6)),
  focus_areas  jsonb not null default '[]' check (public.pairs_valid(focus_areas, 'title', 'description', 60, 400, 8)),
  email        text check (email is null or (char_length(email) <= 254 and email ~* '^[^@\s]+@[^@\s]+\.[^@\s]{2,}$')),
  phone        text check (phone is null or char_length(phone) <= 30),
  location     text check (location is null or char_length(location) <= 100),
  resume_path  text check (resume_path is null or resume_path ~ '^[A-Za-z0-9/_.-]{1,200}\.pdf$'),
  avatar_path  text check (avatar_path is null or avatar_path ~* '^[A-Za-z0-9/_.-]{1,200}\.(webp|jpe?g|png)$'),
  created_at   timestamptz not null default now(),
  updated_at   timestamptz not null default now()
);

create table if not exists public.social_links (
  id          uuid primary key default gen_random_uuid(),
  platform    text not null check (platform in ('github','linkedin','geeksforgeeks','leetcode','hackerrank','twitter','instagram','website','other')),
  label       text not null check (char_length(label) between 1 and 60),
  url         text not null check (char_length(url) <= 500 and url ~* '^https?://'),
  is_visible  boolean not null default true,
  sort_order  integer not null default 0,
  created_at  timestamptz not null default now(),
  updated_at  timestamptz not null default now()
);

create table if not exists public.skill_categories (
  id          uuid primary key default gen_random_uuid(),
  name        text not null check (char_length(name) between 1 and 60),
  icon        text not null default 'code' check (icon ~ '^[a-z0-9-]{1,30}$'),
  sort_order  integer not null default 0,
  created_at  timestamptz not null default now(),
  updated_at  timestamptz not null default now()
);

create table if not exists public.skills (
  id           uuid primary key default gen_random_uuid(),
  category_id  uuid not null references public.skill_categories (id) on delete cascade,
  name         text not null check (char_length(name) between 1 and 60),
  sort_order   integer not null default 0,
  created_at   timestamptz not null default now(),
  updated_at   timestamptz not null default now(),
  unique (category_id, name)
);
create index if not exists skills_category_idx on public.skills (category_id, sort_order);

create table if not exists public.experiences (
  id          uuid primary key default gen_random_uuid(),
  company     text not null check (char_length(company) between 1 and 120),
  role        text not null check (char_length(role) between 1 and 120),
  location    text check (location is null or char_length(location) <= 100),
  start_date  date not null,
  end_date    date,
  is_current  boolean not null default false,
  summary     text check (summary is null or char_length(summary) <= 600),
  highlights  text[] not null default '{}' check (public.text_array_valid(highlights, 12, 500)),
  tech        text[] not null default '{}' check (public.text_array_valid(tech, 20, 40)),
  sort_order  integer not null default 0,
  created_at  timestamptz not null default now(),
  updated_at  timestamptz not null default now(),
  check (end_date is null or end_date >= start_date),
  check (not is_current or end_date is null)
);

create table if not exists public.projects (
  id           uuid primary key default gen_random_uuid(),
  title        text not null check (char_length(title) between 1 and 120),
  description  text not null check (char_length(description) between 1 and 1200),
  period       text check (period is null or char_length(period) <= 60),
  tech         text[] not null default '{}' check (public.text_array_valid(tech, 20, 40)),
  image_path   text check (image_path is null or image_path ~* '^[A-Za-z0-9/_.-]{1,200}\.(webp|jpe?g|png)$'),
  live_url     text check (live_url is null or (char_length(live_url) <= 500 and live_url ~* '^https?://')),
  repo_url     text check (repo_url is null or (char_length(repo_url) <= 500 and repo_url ~* '^https?://')),
  is_featured  boolean not null default false,
  sort_order   integer not null default 0,
  created_at   timestamptz not null default now(),
  updated_at   timestamptz not null default now()
);

create table if not exists public.education (
  id            uuid primary key default gen_random_uuid(),
  institution   text not null check (char_length(institution) between 1 and 160),
  qualification text not null check (char_length(qualification) between 1 and 160),
  period        text check (period is null or char_length(period) <= 60),
  grade_label   text check (grade_label is null or char_length(grade_label) <= 30),
  grade_value   text check (grade_value is null or char_length(grade_value) <= 30),
  sort_order    integer not null default 0,
  created_at    timestamptz not null default now(),
  updated_at    timestamptz not null default now()
);

create table if not exists public.certifications (
  id              uuid primary key default gen_random_uuid(),
  title           text not null check (char_length(title) between 1 and 160),
  issuer          text not null check (char_length(issuer) between 1 and 120),
  issued_on       date,
  credential_url  text check (credential_url is null or (char_length(credential_url) <= 500 and credential_url ~* '^https?://')),
  sort_order      integer not null default 0,
  created_at      timestamptz not null default now(),
  updated_at      timestamptz not null default now()
);

create table if not exists public.achievements (
  id           uuid primary key default gen_random_uuid(),
  title        text not null check (char_length(title) between 1 and 120),
  description  text not null check (char_length(description) between 1 and 400),
  metric       text check (metric is null or char_length(metric) <= 20),
  platform     text check (platform is null or char_length(platform) <= 40),
  url          text check (url is null or (char_length(url) <= 500 and url ~* '^https?://')),
  sort_order   integer not null default 0,
  created_at   timestamptz not null default now(),
  updated_at   timestamptz not null default now()
);

-- ---------------------------------------------------------------------
-- 4. Published snapshot, change tracking, contact inbox
-- ---------------------------------------------------------------------
create table if not exists public.published_content (
  id            smallint primary key default 1 check (id = 1),
  content       jsonb not null,
  published_at  timestamptz not null default now(),
  published_by  uuid references auth.users (id) on delete set null
);

create table if not exists public.site_state (
  id                smallint primary key default 1 check (id = 1),
  draft_updated_at  timestamptz not null default now()
);
insert into public.site_state (id) values (1) on conflict (id) do nothing;

create table if not exists public.activity_log (
  id          bigint generated always as identity primary key,
  table_name  text not null,
  action      text not null,
  label       text,
  actor       uuid,
  created_at  timestamptz not null default now()
);
create index if not exists activity_log_created_idx on public.activity_log (created_at desc);

create table if not exists public.contact_messages (
  id           uuid primary key default gen_random_uuid(),
  name         text not null check (char_length(name) between 2 and 100),
  email        text not null check (char_length(email) between 5 and 254),
  message      text not null check (char_length(message) between 10 and 2000),
  client_hash  text,
  is_read      boolean not null default false,
  created_at   timestamptz not null default now()
);
create index if not exists contact_messages_created_idx on public.contact_messages (created_at desc);

-- ---------------------------------------------------------------------
-- 5. Change tracking trigger (draft state + recent activity)
-- ---------------------------------------------------------------------
create or replace function public.track_change()
returns trigger language plpgsql security definer set search_path = '' as $$
declare
  r jsonb;
  lbl text;
begin
  update public.site_state set draft_updated_at = now() where id = 1;

  if coalesce(current_setting('app.skip_log', true), '') = 'on' then
    return null;
  end if;

  if tg_op = 'DELETE' then r := to_jsonb(old); else r := to_jsonb(new); end if;
  lbl := coalesce(r ->> 'name', r ->> 'title', r ->> 'company', r ->> 'institution', r ->> 'label', r ->> 'full_name', 'item');

  insert into public.activity_log (table_name, action, label, actor)
  values (tg_table_name, tg_op, left(lbl, 120), (select auth.uid()));
  return null;
end;
$$;
revoke execute on function public.track_change() from public, anon, authenticated;

-- ---------------------------------------------------------------------
-- 6. Row Level Security
-- ---------------------------------------------------------------------
do $$
declare t text;
begin
  foreach t in array array[
    'profile','social_links','skill_categories','skills','experiences',
    'projects','education','certifications','achievements'
  ] loop
    execute format('alter table public.%I enable row level security', t);
    execute format('revoke all on table public.%I from anon', t);
    execute format('grant select, insert, update, delete on table public.%I to authenticated', t);
    execute format('drop policy if exists "admin full access" on public.%I', t);
    execute format(
      'create policy "admin full access" on public.%I for all to authenticated using (public.is_admin()) with check (public.is_admin())', t);
    execute format('drop trigger if exists trg_updated_at on public.%I', t);
    execute format('create trigger trg_updated_at before update on public.%I for each row execute function public.set_updated_at()', t);
    execute format('drop trigger if exists trg_track on public.%I', t);
    execute format('create trigger trg_track after insert or update or delete on public.%I for each row execute function public.track_change()', t);
  end loop;
end $$;

-- Published snapshot: world-readable, writable only through publish_portfolio().
alter table public.published_content enable row level security;
revoke all on table public.published_content from anon, authenticated;
grant select on table public.published_content to anon, authenticated;
drop policy if exists "public can read published content" on public.published_content;
create policy "public can read published content" on public.published_content
  for select to anon, authenticated using (true);

-- Admin-only bookkeeping tables.
alter table public.site_state enable row level security;
revoke all on table public.site_state from anon, authenticated;
grant select on table public.site_state to authenticated;
drop policy if exists "admin reads site state" on public.site_state;
create policy "admin reads site state" on public.site_state
  for select to authenticated using (public.is_admin());

alter table public.activity_log enable row level security;
revoke all on table public.activity_log from anon, authenticated;
grant select on table public.activity_log to authenticated;
drop policy if exists "admin reads activity" on public.activity_log;
create policy "admin reads activity" on public.activity_log
  for select to authenticated using (public.is_admin());

-- Contact inbox: nobody can insert directly; visitors use submit_contact_message().
alter table public.contact_messages enable row level security;
revoke all on table public.contact_messages from anon, authenticated;
grant select, update, delete on table public.contact_messages to authenticated;
drop policy if exists "admin manages messages" on public.contact_messages;
create policy "admin manages messages" on public.contact_messages
  for all to authenticated using (public.is_admin()) with check (public.is_admin());

-- ---------------------------------------------------------------------
-- 7. Snapshot builder, preview, publish, reorder
-- ---------------------------------------------------------------------
create or replace function public._build_portfolio()
returns jsonb language sql stable security definer set search_path = '' as $$
  select jsonb_build_object(
    'profile', (select to_jsonb(p) - 'id' - 'created_at' - 'updated_at' from public.profile p where p.id = 1),
    'social_links', coalesce((
      select jsonb_agg(jsonb_build_object('id', s.id, 'platform', s.platform, 'label', s.label, 'url', s.url)
                       order by s.sort_order, s.created_at)
      from public.social_links s where s.is_visible), '[]'::jsonb),
    'skill_categories', coalesce((
      select jsonb_agg(jsonb_build_object(
               'id', c.id, 'name', c.name, 'icon', c.icon,
               'skills', coalesce((
                 select jsonb_agg(jsonb_build_object('id', k.id, 'name', k.name) order by k.sort_order, k.created_at)
                 from public.skills k where k.category_id = c.id), '[]'::jsonb))
             order by c.sort_order, c.created_at)
      from public.skill_categories c), '[]'::jsonb),
    'experiences', coalesce((
      select jsonb_agg(jsonb_build_object(
               'id', e.id, 'company', e.company, 'role', e.role, 'location', e.location,
               'start_date', e.start_date, 'end_date', e.end_date, 'is_current', e.is_current,
               'summary', e.summary, 'highlights', e.highlights, 'tech', e.tech)
             order by e.sort_order, e.created_at)
      from public.experiences e), '[]'::jsonb),
    'projects', coalesce((
      select jsonb_agg(jsonb_build_object(
               'id', pr.id, 'title', pr.title, 'description', pr.description, 'period', pr.period,
               'tech', pr.tech, 'image_path', pr.image_path, 'live_url', pr.live_url,
               'repo_url', pr.repo_url, 'is_featured', pr.is_featured)
             order by pr.sort_order, pr.created_at)
      from public.projects pr), '[]'::jsonb),
    'education', coalesce((
      select jsonb_agg(jsonb_build_object(
               'id', ed.id, 'institution', ed.institution, 'qualification', ed.qualification,
               'period', ed.period, 'grade_label', ed.grade_label, 'grade_value', ed.grade_value)
             order by ed.sort_order, ed.created_at)
      from public.education ed), '[]'::jsonb),
    'certifications', coalesce((
      select jsonb_agg(jsonb_build_object(
               'id', ce.id, 'title', ce.title, 'issuer', ce.issuer,
               'issued_on', ce.issued_on, 'credential_url', ce.credential_url)
             order by ce.sort_order, ce.created_at)
      from public.certifications ce), '[]'::jsonb),
    'achievements', coalesce((
      select jsonb_agg(jsonb_build_object(
               'id', a.id, 'title', a.title, 'description', a.description,
               'metric', a.metric, 'platform', a.platform, 'url', a.url)
             order by a.sort_order, a.created_at)
      from public.achievements a), '[]'::jsonb)
  );
$$;
revoke execute on function public._build_portfolio() from public, anon, authenticated;

create or replace function public.get_draft_portfolio()
returns jsonb language plpgsql stable security definer set search_path = '' as $$
begin
  if not public.is_admin() then
    raise exception 'not_authorized' using errcode = '42501';
  end if;
  return public._build_portfolio();
end;
$$;
revoke execute on function public.get_draft_portfolio() from public, anon;
grant execute on function public.get_draft_portfolio() to authenticated;

create or replace function public.publish_portfolio()
returns timestamptz language plpgsql security definer set search_path = '' as $$
declare
  v_now timestamptz := now();
  v_snapshot jsonb;
begin
  if not public.is_admin() then
    raise exception 'not_authorized' using errcode = '42501';
  end if;

  v_snapshot := public._build_portfolio();
  if coalesce(v_snapshot -> 'profile', 'null'::jsonb) = 'null'::jsonb then
    raise exception 'profile_missing' using errcode = 'P0001';
  end if;

  insert into public.published_content (id, content, published_at, published_by)
  values (1, v_snapshot, v_now, (select auth.uid()))
  on conflict (id) do update
    set content = excluded.content, published_at = excluded.published_at, published_by = excluded.published_by;

  update public.site_state set draft_updated_at = v_now where id = 1;

  insert into public.activity_log (table_name, action, label, actor)
  values ('published_content', 'PUBLISH', 'Published changes', (select auth.uid()));
  delete from public.activity_log where created_at < now() - interval '90 days';

  return v_now;
end;
$$;
revoke execute on function public.publish_portfolio() from public, anon;
grant execute on function public.publish_portfolio() to authenticated;

create or replace function public.reorder_rows(p_table text, p_ids uuid[])
returns void language plpgsql security definer set search_path = '' as $$
begin
  if not public.is_admin() then
    raise exception 'not_authorized' using errcode = '42501';
  end if;
  if p_table not in ('skill_categories','skills','experiences','projects','education','certifications','achievements','social_links') then
    raise exception 'invalid_table' using errcode = 'P0001';
  end if;

  perform set_config('app.skip_log', 'on', true);
  execute format(
    'update public.%I t set sort_order = o.idx::integer from unnest($1) with ordinality as o(id, idx) where t.id = o.id', p_table)
    using p_ids;

  insert into public.activity_log (table_name, action, label, actor)
  values (p_table, 'REORDER', 'Changed order', (select auth.uid()));
end;
$$;
revoke execute on function public.reorder_rows(text, uuid[]) from public, anon;
grant execute on function public.reorder_rows(text, uuid[]) to authenticated;

-- ---------------------------------------------------------------------
-- 8. Public contact form (server-side validation + spam protection)
-- ---------------------------------------------------------------------
create or replace function public.submit_contact_message(
  p_name text,
  p_email text,
  p_message text,
  p_website text default '',
  p_elapsed_ms integer default 0
)
returns void language plpgsql security definer set search_path = '' as $$
declare
  v_name    text := regexp_replace(btrim(coalesce(p_name, '')),    '[\x01-\x08\x0B\x0C\x0E-\x1F\x7F]', '', 'g');
  v_email   text := lower(regexp_replace(btrim(coalesce(p_email, '')), '[\x01-\x08\x0B\x0C\x0E-\x1F\x7F]', '', 'g'));
  v_message text := regexp_replace(btrim(coalesce(p_message, '')), '[\x01-\x08\x0B\x0C\x0E-\x1F\x7F]', '', 'g');
  v_headers json;
  v_ip      text;
  v_hash    text;
begin
  -- Honeypot: bots fill the hidden field. Pretend success, store nothing.
  if btrim(coalesce(p_website, '')) <> '' then
    return;
  end if;

  if p_elapsed_ms is null or p_elapsed_ms < 2500 then
    raise exception 'too_fast' using errcode = 'P0001';
  end if;

  if char_length(v_name) not between 2 and 100
     or char_length(v_message) not between 10 and 2000
     or char_length(v_email) not between 5 and 254
     or v_email !~* '^[^@\s]+@[^@\s]+\.[^@\s]{2,}$' then
    raise exception 'invalid_input' using errcode = 'P0001';
  end if;

  begin
    v_headers := nullif(current_setting('request.headers', true), '')::json;
  exception when others then
    v_headers := null;
  end;
  v_ip := split_part(coalesce(v_headers ->> 'x-forwarded-for', ''), ',', 1);
  v_hash := case when btrim(v_ip) <> '' then md5(btrim(v_ip)) end;

  if (select count(*) from public.contact_messages
        where created_at > now() - interval '1 hour'
          and (email = v_email or (v_hash is not null and client_hash = v_hash))) >= 3
     or (select count(*) from public.contact_messages where created_at > now() - interval '1 hour') >= 30 then
    raise exception 'rate_limited' using errcode = 'P0001';
  end if;

  insert into public.contact_messages (name, email, message, client_hash)
  values (v_name, v_email, v_message, v_hash);
end;
$$;
revoke execute on function public.submit_contact_message(text, text, text, text, integer) from public;
grant execute on function public.submit_contact_message(text, text, text, text, integer) to anon, authenticated;

-- ---------------------------------------------------------------------
-- 9. Storage buckets (public read by URL, admin-only write) and policies
-- ---------------------------------------------------------------------
insert into storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
values
  ('portfolio-images', 'portfolio-images', true, 2097152, array['image/webp','image/jpeg','image/png']),
  ('portfolio-resume', 'portfolio-resume', true, 5242880, array['application/pdf'])
on conflict (id) do update
  set public = excluded.public,
      file_size_limit = excluded.file_size_limit,
      allowed_mime_types = excluded.allowed_mime_types;

drop policy if exists "admins manage portfolio files" on storage.objects;
create policy "admins manage portfolio files" on storage.objects
  for all to authenticated
  using (bucket_id in ('portfolio-images', 'portfolio-resume') and public.is_admin())
  with check (bucket_id in ('portfolio-images', 'portfolio-resume') and public.is_admin());
