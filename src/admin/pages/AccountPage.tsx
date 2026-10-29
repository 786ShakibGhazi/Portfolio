import { useState, type FormEvent } from 'react';
import { Loader2 } from 'lucide-react';
import { useToast } from '@/components/ui/Toast';
import { toMessage } from '@/lib/errors';
import { validatePassword } from '@/lib/password';
import { useAuth } from '../AuthContext';
import { PageHeader } from '../components/PageHeader';

export default function AccountPage() {
  const toast = useToast();
  const { session, updatePassword } = useAuth();
  const [password, setPassword] = useState('');
  const [confirm, setConfirm] = useState('');
  const [error, setError] = useState('');
  const [busy, setBusy] = useState(false);

  const submit = async (e: FormEvent) => {
    e.preventDefault();
    const problem = validatePassword(password, confirm);
    if (problem) return setError(problem);
    setBusy(true);
    setError('');
    try {
      await updatePassword(password);
      toast.success('Password updated.');
      setPassword('');
      setConfirm('');
    } catch (err) {
      setError(toMessage(err));
    } finally {
      setBusy(false);
    }
  };

  return (
    <>
      <PageHeader title="Account" description="Signed in as the portfolio administrator." />
      <div className="glass max-w-xl rounded-2xl p-6">
        <p className="mb-6 text-sm text-muted">
          Email: <span className="text-parchment-50">{session?.user.email}</span>
        </p>
        <h2 className="mb-4 text-lg">Change password</h2>
        <form onSubmit={submit} noValidate className="space-y-5">
          <div>
            <label htmlFor="acct-password" className="label">
              New password
            </label>
            <input id="acct-password" type="password" autoComplete="new-password" className="input" value={password} onChange={(e) => setPassword(e.target.value)} />
            <p className="mt-1.5 text-xs text-muted">At least 12 characters with upper-case, lower-case and a number.</p>
          </div>
          <div>
            <label htmlFor="acct-confirm" className="label">
              Confirm new password
            </label>
            <input id="acct-confirm" type="password" autoComplete="new-password" className="input" value={confirm} onChange={(e) => setConfirm(e.target.value)} aria-invalid={Boolean(error)} aria-describedby={error ? 'acct-error' : undefined} />
          </div>
          {error && (
            <p id="acct-error" role="alert" className="text-sm text-red-300">
              {error}
            </p>
          )}
          <button type="submit" className="btn btn-primary btn-sm" disabled={busy}>
            {busy && <Loader2 className="h-4 w-4 animate-spin" aria-hidden />} Update password
          </button>
        </form>
      </div>
    </>
  );
}
