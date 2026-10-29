import { useCallback, useEffect, useState } from 'react';
import { AlertCircle, Mail, MailOpen, RefreshCw, Trash2 } from 'lucide-react';
import { ConfirmDialog } from '@/components/ui/ConfirmDialog';
import { EmptyState, Skeleton } from '@/components/ui/primitives';
import { useToast } from '@/components/ui/Toast';
import { toMessage } from '@/lib/errors';
import { formatDateTime } from '@/lib/format';
import { deleteMessage, listMessages, setMessageRead, type ContactMessage } from '@/services/admin';
import { useAdmin } from '../AdminContext';
import { PageHeader } from '../components/PageHeader';

export default function MessagesPage() {
  const toast = useToast();
  const { refresh } = useAdmin();
  const [messages, setMessages] = useState<ContactMessage[] | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [deleting, setDeleting] = useState<ContactMessage | null>(null);
  const [busy, setBusy] = useState(false);

  const load = useCallback(async () => {
    try {
      setMessages(await listMessages());
      setError(null);
    } catch (err) {
      setError(toMessage(err));
    }
  }, []);

  useEffect(() => {
    void load();
  }, [load]);

  const toggleRead = async (msg: ContactMessage) => {
    try {
      await setMessageRead(msg.id, !msg.is_read);
      setMessages((list) => list?.map((m) => (m.id === msg.id ? { ...m, is_read: !m.is_read } : m)) ?? null);
      await refresh();
    } catch (err) {
      toast.error(toMessage(err));
    }
  };

  const remove = async () => {
    if (!deleting) return;
    setBusy(true);
    try {
      await deleteMessage(deleting.id);
      toast.success('Message deleted.');
      setDeleting(null);
      await load();
      await refresh();
    } catch (err) {
      toast.error(toMessage(err));
    } finally {
      setBusy(false);
    }
  };

  return (
    <>
      <PageHeader title="Messages" description="Submissions from the public contact form. Only administrators can read these." />

      {error && (
        <div role="alert" className="mb-4 flex flex-wrap items-center gap-3 rounded-xl border border-crimson-500/40 bg-crimson-600/10 p-4 text-sm text-red-200">
          <AlertCircle className="h-4 w-4" aria-hidden /> <span className="flex-1">{error}</span>
          <button type="button" className="btn btn-secondary btn-sm" onClick={() => void load()}>
            <RefreshCw className="h-3.5 w-3.5" aria-hidden /> Retry
          </button>
        </div>
      )}

      {!messages && !error && (
        <div className="space-y-3" aria-busy>
          {[0, 1, 2].map((i) => (
            <Skeleton key={i} className="h-28" />
          ))}
        </div>
      )}

      {messages && messages.length === 0 && <EmptyState icon={<Mail className="h-8 w-8" />} title="No messages yet" hint="Messages sent through the contact form will appear here." />}

      <ul className="space-y-3">
        {messages?.map((msg) => (
          <li key={msg.id} className={`glass rounded-xl p-5 ${msg.is_read ? '' : 'border-gold-400/50'}`}>
            <div className="flex flex-wrap items-start justify-between gap-3">
              <div className="min-w-0">
                <p className="flex items-center gap-2 font-medium text-parchment-50">
                  {!msg.is_read && <span className="h-2 w-2 rounded-full bg-gold-300" aria-label="Unread" />}
                  {msg.name}
                </p>
                <a href={`mailto:${msg.email}`} className="text-sm text-gold-300 underline-offset-4 hover:underline">
                  {msg.email}
                </a>
              </div>
              <time dateTime={msg.created_at} className="text-xs text-muted">
                {formatDateTime(msg.created_at)}
              </time>
            </div>
            {/* Rendered as plain text: React escapes it, so user content can never execute. */}
            <p className="mt-3 whitespace-pre-wrap break-words text-sm leading-relaxed text-parchment-100">{msg.message}</p>
            <div className="mt-4 flex flex-wrap gap-2">
              <a href={`mailto:${msg.email}?subject=${encodeURIComponent('Re: your message')}`} className="btn btn-secondary btn-sm">
                <Mail className="h-3.5 w-3.5" aria-hidden /> Reply
              </a>
              <button type="button" className="btn btn-ghost btn-sm" onClick={() => void toggleRead(msg)}>
                <MailOpen className="h-3.5 w-3.5" aria-hidden /> Mark as {msg.is_read ? 'unread' : 'read'}
              </button>
              <button type="button" className="btn btn-ghost btn-sm text-red-300" onClick={() => setDeleting(msg)}>
                <Trash2 className="h-3.5 w-3.5" aria-hidden /> Delete
              </button>
            </div>
          </li>
        ))}
      </ul>

      <ConfirmDialog
        open={deleting !== null}
        title="Delete this message?"
        message={`The message from ${deleting?.name ?? ''} will be permanently deleted.`}
        confirmLabel="Delete"
        busy={busy}
        onConfirm={() => void remove()}
        onCancel={() => setDeleting(null)}
      />
    </>
  );
}
