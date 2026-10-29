import { useEffect, useState } from 'react';
import { AlertCircle, ArrowLeft, CloudUpload, Loader2 } from 'lucide-react';
import { Link } from 'react-router-dom';
import { ConfirmDialog } from '@/components/ui/ConfirmDialog';
import { Spinner } from '@/components/ui/primitives';
import { useDocumentMeta } from '@/hooks/useDocumentMeta';
import { PortfolioLayout } from '@/layouts/PortfolioLayout';
import { toMessage } from '@/lib/errors';
import { fetchDraft } from '@/services/portfolio';
import type { PortfolioContent } from '@/types/content';
import { useAdmin } from '../AdminContext';

/** Renders the real public layout with the unpublished draft (admin-only RPC). */
export default function PreviewPage() {
  useDocumentMeta('Draft preview');
  const { status, publish, publishing } = useAdmin();
  const [content, setContent] = useState<PortfolioContent | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [confirm, setConfirm] = useState(false);

  useEffect(() => {
    let cancelled = false;
    fetchDraft()
      .then((c) => !cancelled && setContent(c))
      .catch((err) => !cancelled && setError(toMessage(err)));
    return () => {
      cancelled = true;
    };
  }, []);

  if (error) {
    return (
      <div className="mx-auto flex min-h-screen max-w-md flex-col items-center justify-center gap-4 px-6 text-center">
        <AlertCircle className="h-10 w-10 text-red-300" aria-hidden />
        <p role="alert" className="text-parchment-100">
          {error}
        </p>
        <Link to="/admin/dashboard" className="btn btn-secondary btn-sm">
          <ArrowLeft className="h-4 w-4" aria-hidden /> Back to dashboard
        </Link>
      </div>
    );
  }
  if (!content) {
    return (
      <div className="flex min-h-screen items-center justify-center">
        <Spinner label="Loading draft preview" />
      </div>
    );
  }

  const dirty = status?.dirty ?? false;

  return (
    <>
      <PortfolioLayout content={content} preview />
      <div className="glass-strong fixed bottom-4 left-1/2 z-[70] flex w-[calc(100%-2rem)] max-w-xl -translate-x-1/2 flex-wrap items-center justify-between gap-3 rounded-2xl px-4 py-3 shadow-2xl" role="region" aria-label="Preview controls">
        <p className="text-sm text-gold-100">
          <strong className="font-semibold">Draft preview</strong>
          <span className="ml-2 text-muted">{dirty ? 'Not published yet' : 'Matches the live site'}</span>
        </p>
        <div className="flex gap-2">
          <Link to="/admin/dashboard" className="btn btn-ghost btn-sm">
            <ArrowLeft className="h-4 w-4" aria-hidden /> Dashboard
          </Link>
          <button type="button" className="btn btn-primary btn-sm" disabled={!dirty || publishing} onClick={() => setConfirm(true)}>
            {publishing ? <Loader2 className="h-4 w-4 animate-spin" aria-hidden /> : <CloudUpload className="h-4 w-4" aria-hidden />} Publish
          </button>
        </div>
      </div>
      <ConfirmDialog
        open={confirm}
        title="Publish this draft?"
        tone="primary"
        confirmLabel="Publish"
        busy={publishing}
        message="The live website will be replaced with what you see in this preview."
        onCancel={() => setConfirm(false)}
        onConfirm={() => void publish().then((ok) => ok && setConfirm(false))}
      />
    </>
  );
}
