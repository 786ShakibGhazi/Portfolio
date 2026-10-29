import { useState, type FormEvent } from 'react';
import { CheckCircle2, Loader2 } from 'lucide-react';
import { Link, useNavigate } from 'react-router-dom';
import { Spinner } from '@/components/ui/primitives';
import { useDocumentMeta } from '@/hooks/useDocumentMeta';
import { toMessage } from '@/lib/errors';
import { validatePassword } from '@/lib/password';
import { useAuth } from '../AuthContext';

/** Landing page for the Supabase password-recovery e-mail link. */
export default function ResetPasswordPage() {
  useDocumentMeta('Reset password');
  const { loading, session, updatePassword, signOut } = useAuth();
  const navigate = useNavigate();
  const [password, setPassword] = useState('');
  const [confirm, setConfirm] = useState('');
  const [error, setError] = useState('');
  const [busy, setBusy] = useState(false);
  const [done, setDone] = useState(false);

  if (loading) return <Spinner label="Checking your reset link" />;

  const submit = async (e: FormEvent) => {
    e.preventDefault();
    const problem = validatePassword(password, confirm);
    if (problem) return setError(problem);
    setBusy(true);
    setError('');
    try {
      await updatePassword(password);
      await signOut();
      setDone(true);
      window.setTimeout(() => navigate('/admin/login', { replace: true }), 2500);
    } catch (err) {
      setError(toMessage(err));
    } finally {
      setBusy(false);
    }
  };

  return (
    <main className="flex min-h-screen items-center justify-center px-4 py-12">
      <div className="glass-strong w-full max-w-md rounded-2xl p-7 sm:p-9">
        <h1 className="mb-2 text-center text-2xl">Choose a new password</h1>
        {done ? (
          <p role="status" className="mt-6 flex items-start gap-2 rounded-lg border border-emerald-400/30 bg-emerald-500/10 p-3 text-sm text-emerald-100">
            <CheckCircle2 className="mt-0.5 h-4 w-4 shrink-0" aria-hidden /> Password updated. Redirecting to sign in…
          </p>
        ) : !session ? (
          <div className="mt-6 space-y-4 text-center text-sm text-muted">
            <p>This reset link is invalid or has expired. Request a new one from the sign-in page.</p>
            <Link to="/admin/login" className="btn btn-secondary btn-sm">
              Go to sign in
            </Link>
          </div>
        ) : (
          <form onSubmit={submit} noValidate className="mt-6 space-y-5">
            <div>
              <label htmlFor="new-password" className="label">
                New password
              </label>
              <input id="new-password" type="password" autoComplete="new-password" className="input" value={password} onChange={(e) => setPassword(e.target.value)} />
              <p className="mt-1.5 text-xs text-muted">At least 12 characters with upper-case, lower-case and a number.</p>
            </div>
            <div>
              <label htmlFor="confirm-password" className="label">
                Confirm password
              </label>
              <input id="confirm-password" type="password" autoComplete="new-password" className="input" value={confirm} onChange={(e) => setConfirm(e.target.value)} aria-invalid={Boolean(error)} aria-describedby={error ? 'reset-error' : undefined} />
            </div>
            {error && (
              <p id="reset-error" role="alert" className="text-sm text-red-300">
                {error}
              </p>
            )}
            <button type="submit" className="btn btn-primary w-full" disabled={busy}>
              {busy && <Loader2 className="h-4 w-4 animate-spin" aria-hidden />} Update password
            </button>
          </form>
        )}
      </div>
    </main>
  );
}
