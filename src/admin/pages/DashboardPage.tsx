import { useEffect, useState } from 'react';
import { ArrowRight, CheckCircle2, CloudUpload, Eye, Inbox, Loader2, TriangleAlert } from 'lucide-react';
import { Link } from 'react-router-dom';
import { ConfirmDialog } from '@/components/ui/ConfirmDialog';
import { Skeleton } from '@/components/ui/primitives';
import { toMessage } from '@/lib/errors';
import { formatDateTime, timeAgo } from '@/lib/format';
import { getCounts, getRecentActivity, type ActivityEntry } from '@/services/admin';
import { useAdmin } from '../AdminContext';
import { PageHeader } from '../components/PageHeader';

const SECTIONS: { key: string; label: string; to: string }[] = [
  { key: 'skills', label: 'Skills', to: '/admin/skills' },
  { key: 'experiences', label: 'Experience', to: '/admin/experience' },
  { key: 'projects', label: 'Projects', to: '/admin/projects' },
  { key: 'education', label: 'Education', to: '/admin/education' },
  { key: 'certifications', label: 'Certifications', to: '/admin/certifications' },
  { key: 'achievements', label: 'Achievements', to: '/admin/achievements' },
  { key: 'social_links', label: 'Social links', to: '/admin/social' },
];

const TABLE_LABELS: Record<string, string> = {
  profile: 'Profile',
  social_links: 'Social link',
  skill_categories: 'Skill category',
  skills: 'Skill',
  experiences: 'Experience',
  projects: 'Project',
  education: 'Education',
  certifications: 'Certification',
  achievements: 'Achievement',
  published_content: 'Website',
};

const ACTION_LABELS: Record<string, string> = {
  INSERT: 'added',
  UPDATE: 'updated',
  DELETE: 'deleted',
  REORDER: 'reordered',
  PUBLISH: 'published',
};

export default function DashboardPage() {
  const { status, statusError, unread, publish, publishing } = useAdmin();
  const [counts, setCounts] = useState<Record<string, number> | null>(null);
  const [activity, setActivity] = useState<ActivityEntry[] | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [confirm, setConfirm] = useState(false);

  useEffect(() => {
    let cancelled = false;
    Promise.all([getCounts(), getRecentActivity(10)])
      .then(([c, a]) => {
        if (cancelled) return;
        setCounts(c);
        setActivity(a);
      })
      .catch((err) => !cancelled && setError(toMessage(err)));
    return () => {
      cancelled = true;
    };
  }, [status?.draftUpdatedAt]);

  const dirty = status?.dirty ?? false;

  return (
    <>
      <PageHeader title="Dashboard" description="Edit your draft in any section, preview it, then publish to update the live website." />

      <section aria-labelledby="publish-heading" className={`glass mb-8 rounded-2xl p-6 ${dirty ? 'border-gold-400/40' : ''}`}>
        <div className="flex flex-col gap-5 sm:flex-row sm:items-center sm:justify-between">
          <div className="flex items-start gap-4">
            <span className={`flex h-12 w-12 shrink-0 items-center justify-center rounded-xl ${dirty ? 'bg-gold-500/15 text-gold-300' : 'bg-emerald-500/15 text-emerald-300'}`}>
              {dirty ? <TriangleAlert className="h-6 w-6" aria-hidden /> : <CheckCircle2 className="h-6 w-6" aria-hidden />}
            </span>
            <div>
              <h2 id="publish-heading" className="text-lg">
                {statusError ? 'Status unavailable' : status ? (dirty ? 'You have unpublished changes' : 'Your live site is up to date') : 'Checking status…'}
              </h2>
              <p className="mt-1 text-sm text-muted">
                {statusError ?? (status?.publishedAt ? `Last published ${formatDateTime(status.publishedAt)} (${timeAgo(status.publishedAt)}).` : 'Nothing has been published yet.')}
              </p>
            </div>
          </div>
          <div className="flex flex-wrap gap-2">
            <Link to="/admin/preview" className="btn btn-secondary btn-sm">
              <Eye className="h-4 w-4" aria-hidden /> Preview draft
            </Link>
            <button type="button" className="btn btn-primary btn-sm" disabled={!dirty || publishing} onClick={() => setConfirm(true)}>
              {publishing ? <Loader2 className="h-4 w-4 animate-spin" aria-hidden /> : <CloudUpload className="h-4 w-4" aria-hidden />} Publish
            </button>
          </div>
        </div>
      </section>

      {error && (
        <p role="alert" className="mb-6 rounded-xl border border-crimson-500/40 bg-crimson-600/10 p-4 text-sm text-red-200">
          {error}
        </p>
      )}

      <div className="grid gap-8 lg:grid-cols-[1.2fr_1fr]">
        <section aria-labelledby="content-heading">
          <h2 id="content-heading" className="mb-4 text-lg">
            Content
          </h2>
          <ul className="grid grid-cols-2 gap-3 sm:grid-cols-3">
            {SECTIONS.map((s) => (
              <li key={s.key}>
                <Link to={s.to} className="glass group flex h-full flex-col rounded-xl p-4 transition hover:-translate-y-0.5 hover:border-gold-400/40">
                  {counts ? <span className="text-3xl font-bold text-gradient">{counts[s.key] ?? 0}</span> : <Skeleton className="h-9 w-12" />}
                  <span className="mt-1 flex items-center justify-between text-sm text-parchment-100">
                    {s.label}
                    <ArrowRight className="h-4 w-4 text-muted transition group-hover:translate-x-0.5 group-hover:text-gold-300" aria-hidden />
                  </span>
                </Link>
              </li>
            ))}
            <li>
              <Link to="/admin/messages" className="glass group flex h-full flex-col rounded-xl p-4 transition hover:-translate-y-0.5 hover:border-gold-400/40">
                <span className="text-3xl font-bold text-gradient">{unread}</span>
                <span className="mt-1 flex items-center justify-between text-sm text-parchment-100">
                  <span className="inline-flex items-center gap-1.5">
                    <Inbox className="h-4 w-4" aria-hidden /> Unread
                  </span>
                  <ArrowRight className="h-4 w-4 text-muted transition group-hover:translate-x-0.5 group-hover:text-gold-300" aria-hidden />
                </span>
              </Link>
            </li>
          </ul>
        </section>

        <section aria-labelledby="activity-heading">
          <h2 id="activity-heading" className="mb-4 text-lg">
            Recent updates
          </h2>
          {!activity ? (
            <div className="space-y-2">
              {[0, 1, 2, 3].map((i) => (
                <Skeleton key={i} className="h-12" />
              ))}
            </div>
          ) : activity.length === 0 ? (
            <p className="rounded-xl border border-dashed border-white/15 p-5 text-sm text-muted">No changes yet. Edits you make will be listed here.</p>
          ) : (
            <ol className="space-y-2">
              {activity.map((a) => (
                <li key={a.id} className="glass flex items-start justify-between gap-3 rounded-xl px-4 py-3 text-sm">
                  <span>
                    <span className="text-parchment-50">{TABLE_LABELS[a.table_name] ?? a.table_name}</span> {ACTION_LABELS[a.action] ?? a.action.toLowerCase()}
                    {a.label && a.action !== 'PUBLISH' && a.action !== 'REORDER' && <span className="block truncate text-xs text-muted">{a.label}</span>}
                  </span>
                  <time dateTime={a.created_at} className="shrink-0 text-xs text-muted">
                    {timeAgo(a.created_at)}
                  </time>
                </li>
              ))}
            </ol>
          )}
        </section>
      </div>

      <ConfirmDialog
        open={confirm}
        title="Publish your changes?"
        tone="primary"
        confirmLabel="Publish"
        busy={publishing}
        message="This replaces the live website content with your current draft."
        onCancel={() => setConfirm(false)}
        onConfirm={() => void publish().then((ok) => ok && setConfirm(false))}
      />
    </>
  );
}
