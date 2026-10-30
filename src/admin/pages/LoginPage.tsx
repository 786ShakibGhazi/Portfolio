import { useState, type FormEvent, type ReactNode } from 'react';
import { AlertCircle, ArrowLeft, CheckCircle2, Loader2, LogIn, ShieldAlert } from 'lucide-react';
import { Link, Navigate, useLocation, useNavigate } from 'react-router-dom';
import { useDocumentMeta } from '@/hooks/useDocumentMeta';
import { toMessage } from '@/lib/errors';
import { useAuth } from '../AuthContext';

const EMAIL_RE = /^[^@\s]+@[^@\s]+\.[^@\s]{2,}$/;

function Shell({ title, subtitle, children }: { title: string; subtitle: string; children: ReactNode }) {
  return (
    <main className="relative flex min-h-screen items-center justify-center overflow-hidden px-4 py-12">
      <div className="bg-grid absolute inset-0" aria-hidden />
      <div className="glass-strong relative z-10 w-full max-w-md rounded-2xl p-7 shadow-2xl sm:p-9">
        <div className="mb-7 text-center">
          <span className="mx-auto mb-4 flex h-12 w-12 items-center justify-center rounded-xl bg-gold-500 text-xl font-bold text-white shadow-glow-sm">S</span>
          <h1 className="text-2xl font-bold">{title}</h1>
          <p className="mt-2 text-sm text-muted">{subtitle}</p>
        </div>
        {children}
        <p className="mt-7 text-center text-sm">
          <Link to="/" className="inline-flex items-center gap-1.5 text-muted hover:text-gold-200">
            <ArrowLeft className="h-3.5 w-3.5" aria-hidden /> Back to the portfolio
          </Link>
        </p>
      </div>
    </main>
  );
}

export default function LoginPage() {
  useDocumentMeta('Admin sign in');
  const { configured, loading, session, isAdmin, signIn, signOut, sendPasswordReset } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const from = (location.state as { from?: string } | null)?.from ?? '/admin/dashboard';

  const [mode, setMode] = useState<'login' | 'reset'>('login');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [fieldErrors, setFieldErrors] = useState<{ email?: string; password?: string }>({});
  const [busy, setBusy] = useState(false);
  const [resetSent, setResetSent] = useState(false);

  if (!loading && session && isAdmin) return <Navigate to={from} replace />;

  if (!configured) {
    return (
      <Shell title="Backend not configured" subtitle="The admin dashboard needs Supabase.">
        <p role="alert" className="flex items-start gap-2 rounded-lg border border-gold-500/40 bg-gold-500/10 p-3 text-sm text-gold-100">
          <AlertCircle className="mt-0.5 h-4 w-4 shrink-0" aria-hidden />
          Set VITE_SUPABASE_URL and VITE_SUPABASE_ANON_KEY (see the README), then restart the app.
        </p>
      </Shell>
    );
  }

  if (!loading && session && isAdmin === false) {
    return (
      <Shell title="Not authorised" subtitle="This account cannot manage the portfolio.">
        <p role="alert" className="mb-5 flex items-start gap-2 rounded-lg border border-crimson-500/40 bg-crimson-600/10 p-3 text-sm text-red-200">
          <ShieldAlert className="mt-0.5 h-4 w-4 shrink-0" aria-hidden />
          You are signed in as {session.user.email}, which is not on the administrator list.
        </p>
        <button type="button" className="btn btn-secondary w-full" onClick={() => void signOut()}>
          Sign out
        </button>
      </Shell>
    );
  }

  const submit = async (e: FormEvent) => {
    e.preventDefault();
    if (busy) return;
    const errs: typeof fieldErrors = {};
    if (!EMAIL_RE.test(email.trim())) errs.email = 'Enter a valid email address.';
    if (mode === 'login' && !password) errs.password = 'Enter your password.';
    setFieldErrors(errs);
    setError('');
    if (Object.keys(errs).length) return;

    setBusy(true);
    try {
      if (mode === 'login') {
        await signIn(email.trim(), password);
        navigate(from, { replace: true });
      } else {
        await sendPasswordReset(email.trim());
        setResetSent(true);
      }
    } catch (err) {
      setError(mode === 'login' ? toMessage(err) : 'Could not send the reset email. Please try again shortly.');
    } finally {
      setBusy(false);
    }
  };

  return (
    <Shell
      title={mode === 'login' ? 'Admin sign in' : 'Reset password'}
      subtitle={mode === 'login' ? 'Sign in to manage your portfolio content.' : 'We will email you a secure reset link.'}
    >
      {resetSent ? (
        <p role="status" className="flex items-start gap-2 rounded-lg border border-emerald-400/30 bg-emerald-500/10 p-3 text-sm text-emerald-100">
          <CheckCircle2 className="mt-0.5 h-4 w-4 shrink-0" aria-hidden />
          If that address belongs to an administrator, a reset link is on its way.
        </p>
      ) : (
        <form onSubmit={submit} noValidate className="space-y-5">
          <div>
            <label htmlFor="admin-email" className="label">
              Email
            </label>
            <input
              id="admin-email"
              type="email"
              autoComplete="username"
              className="input"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              aria-invalid={Boolean(fieldErrors.email)}
              aria-describedby={fieldErrors.email ? 'admin-email-error' : undefined}
              autoFocus
            />
            {fieldErrors.email && (
              <p id="admin-email-error" role="alert" className="mt-1.5 text-sm text-red-300">
                {fieldErrors.email}
              </p>
            )}
          </div>
          {mode === 'login' && (
            <div>
              <label htmlFor="admin-password" className="label">
                Password
              </label>
              <input
                id="admin-password"
                type="password"
                autoComplete="current-password"
                className="input"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                aria-invalid={Boolean(fieldErrors.password)}
                aria-describedby={fieldErrors.password ? 'admin-password-error' : undefined}
              />
              {fieldErrors.password && (
                <p id="admin-password-error" role="alert" className="mt-1.5 text-sm text-red-300">
                  {fieldErrors.password}
                </p>
              )}
            </div>
          )}
          {error && (
            <p role="alert" className="flex items-start gap-2 rounded-lg border border-crimson-500/40 bg-crimson-600/10 px-3 py-2.5 text-sm text-red-200">
              <AlertCircle className="mt-0.5 h-4 w-4 shrink-0" aria-hidden /> {error}
            </p>
          )}
          <button type="submit" className="btn btn-primary w-full" disabled={busy}>
            {busy ? <Loader2 className="h-4 w-4 animate-spin" aria-hidden /> : <LogIn className="h-4 w-4" aria-hidden />}
            {mode === 'login' ? 'Sign in' : 'Send reset link'}
          </button>
        </form>
      )}
      <p className="mt-5 text-center text-sm">
        <button
          type="button"
          className="text-gold-300 underline-offset-4 hover:underline"
          onClick={() => {
            setMode(mode === 'login' ? 'reset' : 'login');
            setError('');
            setResetSent(false);
            setFieldErrors({});
          }}
        >
          {mode === 'login' ? 'Forgot your password?' : 'Back to sign in'}
        </button>
      </p>
    </Shell>
  );
}
