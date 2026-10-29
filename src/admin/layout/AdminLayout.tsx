import { useEffect, useState } from 'react';
import { AnimatePresence, m } from 'framer-motion';
import {
  BadgeCheck,
  Briefcase,
  CloudUpload,
  ExternalLink,
  FolderKanban,
  GraduationCap,
  Inbox,
  KeyRound,
  LayoutDashboard,
  Link2,
  Loader2,
  LogOut,
  Menu,
  Sparkles,
  Trophy,
  UserRound,
  X,
  Eye,
  type LucideIcon,
} from 'lucide-react';
import { Link, NavLink, Outlet, useLocation } from 'react-router-dom';
import { ConfirmDialog } from '@/components/ui/ConfirmDialog';
import { useDocumentMeta } from '@/hooks/useDocumentMeta';
import { useAdmin } from '../AdminContext';
import { useAuth } from '../AuthContext';

interface NavEntry {
  to: string;
  label: string;
  icon: LucideIcon;
}

const NAV: NavEntry[] = [
  { to: '/admin/dashboard', label: 'Dashboard', icon: LayoutDashboard },
  { to: '/admin/profile', label: 'Profile & contact', icon: UserRound },
  { to: '/admin/social', label: 'Social links', icon: Link2 },
  { to: '/admin/skills', label: 'Skills', icon: Sparkles },
  { to: '/admin/experience', label: 'Experience', icon: Briefcase },
  { to: '/admin/projects', label: 'Projects', icon: FolderKanban },
  { to: '/admin/education', label: 'Education', icon: GraduationCap },
  { to: '/admin/certifications', label: 'Certifications', icon: BadgeCheck },
  { to: '/admin/achievements', label: 'Achievements', icon: Trophy },
  { to: '/admin/messages', label: 'Messages', icon: Inbox },
  { to: '/admin/account', label: 'Account', icon: KeyRound },
];

function SidebarNav({ onNavigate, unread }: { onNavigate?: () => void; unread: number }) {
  return (
    <nav aria-label="Admin" className="flex-1 space-y-1 overflow-y-auto px-3 py-4">
      {NAV.map(({ to, label, icon: Icon }) => (
        <NavLink
          key={to}
          to={to}
          onClick={onNavigate}
          className={({ isActive }) =>
            `flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm transition ${
              isActive
                ? 'bg-gold-500/15 text-gold-100 shadow-[inset_2px_0_0_theme(colors.gold.400)]'
                : 'text-parchment-200 hover:bg-white/5 hover:text-parchment-50'
            }`
          }
        >
          <Icon className="h-4 w-4 shrink-0" aria-hidden />
          <span className="flex-1">{label}</span>
          {to === '/admin/messages' && unread > 0 && (
            <span className="rounded-full bg-crimson-500 px-2 py-0.5 text-[0.7rem] font-semibold text-white" aria-label={`${unread} unread`}>
              {unread}
            </span>
          )}
        </NavLink>
      ))}
    </nav>
  );
}

export function AdminLayout() {
  useDocumentMeta('Admin | Portfolio dashboard');
  const { signOut, session } = useAuth();
  const { status, statusError, publish, publishing, unread } = useAdmin();
  const location = useLocation();
  const [drawer, setDrawer] = useState(false);
  const [confirmPublish, setConfirmPublish] = useState(false);

  useEffect(() => setDrawer(false), [location.pathname]);
  useEffect(() => {
    if (!drawer) return;
    const onKey = (e: KeyboardEvent) => e.key === 'Escape' && setDrawer(false);
    document.addEventListener('keydown', onKey);
    return () => document.removeEventListener('keydown', onKey);
  }, [drawer]);

  const dirty = status?.dirty ?? false;

  return (
    <div className="min-h-screen lg:grid lg:grid-cols-[260px_1fr]">
      <aside className="glass-strong sticky top-0 hidden h-screen flex-col border-y-0 border-l-0 lg:flex">
        <div className="flex items-center gap-3 border-b border-white/10 px-5 py-5">
          <span className="flex h-9 w-9 items-center justify-center rounded-full border border-gold-400/60 bg-ink-800 font-display font-bold text-gold-200">S</span>
          <div>
            <p className="font-display text-sm tracking-widest">Portfolio CMS</p>
            <p className="max-w-[170px] truncate text-xs text-muted">{session?.user.email}</p>
          </div>
        </div>
        <SidebarNav unread={unread} />
        <div className="border-t border-white/10 p-3">
          <button type="button" className="btn btn-ghost btn-sm w-full justify-start" onClick={() => void signOut()}>
            <LogOut className="h-4 w-4" aria-hidden /> Sign out
          </button>
        </div>
      </aside>

      <div className="flex min-w-0 flex-col">
        <header className="glass-strong sticky top-0 z-40 flex items-center gap-3 border-x-0 border-t-0 px-4 py-3 sm:px-6">
          <button type="button" className="btn-icon lg:hidden" aria-label="Open navigation" aria-expanded={drawer} onClick={() => setDrawer(true)}>
            <Menu className="h-5 w-5" />
          </button>

          <div className="flex min-w-0 flex-1 items-center gap-2 text-sm" role="status" aria-live="polite">
            {statusError ? (
              <span className="truncate text-red-300">{statusError}</span>
            ) : status ? (
              <span className={`inline-flex items-center gap-2 rounded-full border px-3 py-1 text-xs ${dirty ? 'border-gold-400/50 bg-gold-500/10 text-gold-100' : 'border-emerald-400/30 bg-emerald-500/10 text-emerald-200'}`}>
                <span className={`h-2 w-2 rounded-full ${dirty ? 'bg-gold-300' : 'bg-emerald-400'}`} aria-hidden />
                {dirty ? 'Unpublished changes' : 'Live site is up to date'}
              </span>
            ) : (
              <span className="text-muted">Checking status…</span>
            )}
          </div>

          <a href={import.meta.env.BASE_URL} target="_blank" rel="noopener" className="btn btn-ghost btn-sm hidden sm:inline-flex">
            <ExternalLink className="h-4 w-4" aria-hidden /> View site
          </a>
          <Link to="/admin/preview" className="btn btn-secondary btn-sm">
            <Eye className="h-4 w-4" aria-hidden /> <span className="hidden sm:inline">Preview</span>
            <span className="sr-only sm:hidden">Preview draft</span>
          </Link>
          <button type="button" className="btn btn-primary btn-sm" disabled={!dirty || publishing} onClick={() => setConfirmPublish(true)}>
            {publishing ? <Loader2 className="h-4 w-4 animate-spin" aria-hidden /> : <CloudUpload className="h-4 w-4" aria-hidden />}
            Publish
          </button>
        </header>

        <main id="main" className="mx-auto w-full max-w-5xl flex-1 px-4 py-8 sm:px-6 sm:py-10">
          <m.div key={location.pathname} initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.25 }}>
            <Outlet />
          </m.div>
        </main>
      </div>

      <AnimatePresence>
        {drawer && (
          <div className="fixed inset-0 z-50 lg:hidden">
            <m.div className="absolute inset-0 bg-ink-950/80" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} onClick={() => setDrawer(false)} aria-hidden />
            <m.aside
              className="glass-strong absolute inset-y-0 left-0 flex w-72 max-w-[85vw] flex-col"
              initial={{ x: '-100%' }}
              animate={{ x: 0 }}
              exit={{ x: '-100%' }}
              transition={{ duration: 0.25, ease: [0.22, 1, 0.36, 1] }}
              role="dialog"
              aria-modal="true"
              aria-label="Navigation"
            >
              <div className="flex items-center justify-between border-b border-white/10 px-4 py-4">
                <p className="font-display text-sm tracking-widest">Portfolio CMS</p>
                <button type="button" className="btn-icon" aria-label="Close navigation" onClick={() => setDrawer(false)}>
                  <X className="h-4 w-4" />
                </button>
              </div>
              <SidebarNav unread={unread} onNavigate={() => setDrawer(false)} />
              <div className="border-t border-white/10 p-3">
                <p className="mb-2 truncate px-3 text-xs text-muted">{session?.user.email}</p>
                <button type="button" className="btn btn-ghost btn-sm w-full justify-start" onClick={() => void signOut()}>
                  <LogOut className="h-4 w-4" aria-hidden /> Sign out
                </button>
              </div>
            </m.aside>
          </div>
        )}
      </AnimatePresence>

      <ConfirmDialog
        open={confirmPublish}
        title="Publish your changes?"
        tone="primary"
        confirmLabel="Publish"
        busy={publishing}
        message="This replaces the live website content with your current draft. Visitors will see the changes immediately."
        onCancel={() => setConfirmPublish(false)}
        onConfirm={() => {
          void publish().then((ok) => ok && setConfirmPublish(false));
        }}
      />
    </div>
  );
}
