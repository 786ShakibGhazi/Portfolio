import { useEffect, useState } from 'react';
import { AlertCircle, RefreshCw } from 'lucide-react';
import { Skeleton } from '@/components/ui/primitives';
import { useToast } from '@/components/ui/Toast';
import { toMessage } from '@/lib/errors';
import { getProfileRow, saveProfileRow } from '@/services/admin';
import type { Row } from '@/types/content';
import { useAdmin } from '../AdminContext';
import { PageHeader } from '../components/PageHeader';
import { EntityForm } from '../forms/EntityForm';
import type { FieldDef } from '../forms/types';
import { initialValues } from '../forms/validate';

const FIELDS: FieldDef[] = [
  { name: '_identity', label: 'Identity', type: 'section' },
  { name: 'full_name', label: 'Name', type: 'text', required: true, half: true, maxLength: 100 },
  { name: 'title', label: 'Professional title', type: 'text', required: true, half: true, maxLength: 120 },
  { name: 'headline', label: 'Headline', type: 'text', required: true, maxLength: 200, help: 'The big sentence under your name.' },
  { name: 'intro', label: 'Short introduction', type: 'textarea', required: true, rows: 3, maxLength: 600 },
  { name: 'roles', label: 'Rotating role labels', type: 'tags', maxItems: 10, itemMaxLength: 60, help: 'Shown as "I am a …" in the hero. Press Enter after each.' },
  { name: 'bio', label: 'Biography', type: 'textarea', rows: 9, maxLength: 4000, emptyAs: '', help: 'Separate paragraphs with a blank line.' },

  { name: '_highlights', label: 'Highlights', type: 'section' },
  {
    name: 'stats',
    label: 'Hero statistics',
    type: 'pairs',
    maxItems: 6,
    pair: { keys: ['value', 'label'], labels: ['Value (e.g. 200+)', 'Label'], max: [20, 60] },
    help: 'Only add numbers you can verify. Numeric values animate when scrolled into view.',
  },
  {
    name: 'focus_areas',
    label: 'Strengths & focus areas',
    type: 'pairs',
    maxItems: 8,
    pair: { keys: ['title', 'description'], labels: ['Title', 'Description'], max: [60, 400], multiline: true },
  },

  { name: '_contact', label: 'Contact details', type: 'section' },
  { name: 'email', label: 'Public email', type: 'email', half: true, maxLength: 254 },
  { name: 'phone', label: 'Phone', type: 'text', half: true, maxLength: 30 },
  { name: 'location', label: 'Location', type: 'text', maxLength: 100, help: 'Optional, for example "Noida, India".' },

  { name: '_files', label: 'Files', type: 'section' },
  { name: 'avatar_path', label: 'Profile photo', type: 'image', help: 'Optional. Shown in the About section.' },
  { name: 'resume_path', label: 'Resume (PDF)', type: 'pdf', help: 'Uploading a new file replaces the download after you publish.' },
];

export default function ProfilePage() {
  const toast = useToast();
  const { refresh } = useAdmin();
  const [row, setRow] = useState<Row | null | undefined>(undefined);
  const [error, setError] = useState<string | null>(null);
  const [version, setVersion] = useState(0);

  const load = () => {
    setError(null);
    getProfileRow()
      .then(setRow)
      .catch((err) => setError(toMessage(err)));
  };
  useEffect(load, []);

  const save = async (payload: Record<string, unknown>) => {
    await saveProfileRow(payload);
    toast.success('Profile saved to your draft.');
    await refresh();
    const fresh = await getProfileRow();
    setRow(fresh);
    setVersion((v) => v + 1);
  };

  return (
    <>
      <PageHeader title="Profile & contact" description="Your name, introduction, biography, contact details, photo and resume." />
      {error ? (
        <div role="alert" className="flex flex-wrap items-center gap-3 rounded-xl border border-crimson-500/40 bg-crimson-600/10 p-4 text-sm text-red-200">
          <AlertCircle className="h-4 w-4" aria-hidden /> <span className="flex-1">{error}</span>
          <button type="button" className="btn btn-secondary btn-sm" onClick={load}>
            <RefreshCw className="h-3.5 w-3.5" aria-hidden /> Retry
          </button>
        </div>
      ) : row === undefined ? (
        <div className="space-y-4" aria-busy>
          <Skeleton className="h-12" />
          <Skeleton className="h-32" />
          <Skeleton className="h-48" />
        </div>
      ) : (
        <div className="glass rounded-2xl p-5 sm:p-6">
          {row === null && (
            <p className="mb-5 rounded-lg border border-gold-500/40 bg-gold-500/10 p-3 text-sm text-gold-100">
              No profile exists yet. Fill in the required fields and save to create it.
            </p>
          )}
          <EntityForm key={version} fields={FIELDS} initial={initialValues(FIELDS, row)} onSubmit={save} submitLabel="Save profile" />
        </div>
      )}
    </>
  );
}
