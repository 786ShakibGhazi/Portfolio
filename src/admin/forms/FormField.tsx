import { useId, useRef, useState, type KeyboardEvent, type ReactNode } from 'react';
import { ArrowDown, ArrowUp, FileText, ImageIcon, Loader2, Plus, Trash2, Upload, X } from 'lucide-react';
import { prepareImage, preparePdf } from '@/lib/file';
import { toMessage } from '@/lib/errors';
import { cleanText } from '@/lib/text';
import { imageUrl, resumeViewUrl } from '@/lib/url';
import { uploadFile } from '@/services/admin';
import type { FieldDef, Values } from './types';

interface FieldProps {
  def: FieldDef;
  values: Values;
  error?: string;
  onChange: (name: string, value: unknown) => void;
  idPrefix: string;
}

/* ---------- Tags ---------- */
function TagInput({
  id,
  tags,
  onChange,
  invalid,
  describedBy,
  placeholder,
}: {
  id: string;
  tags: string[];
  onChange: (tags: string[]) => void;
  invalid: boolean;
  describedBy?: string;
  placeholder?: string;
}) {
  const [draft, setDraft] = useState('');

  const commit = (raw: string) => {
    const parts = raw
      .split(',')
      .map(cleanText)
      .filter(Boolean)
      .filter((p) => !tags.some((t) => t.toLowerCase() === p.toLowerCase()));
    if (parts.length) onChange([...tags, ...parts]);
    setDraft('');
  };

  const onKeyDown = (e: KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter' || e.key === ',') {
      e.preventDefault();
      commit(draft);
    } else if (e.key === 'Backspace' && !draft && tags.length) {
      onChange(tags.slice(0, -1));
    }
  };

  return (
    <div
      className="flex min-h-[2.75rem] flex-wrap items-center gap-2 rounded-lg border border-white/10 bg-ink-900/80 p-2 focus-within:border-gold-400/70 focus-within:ring-2 focus-within:ring-gold-400/30 aria-[invalid=true]:border-crimson-400/80"
      aria-invalid={invalid}
    >
      {tags.map((tag) => (
        <span key={tag} className="chip gap-1 pr-1">
          {tag}
          <button
            type="button"
            className="rounded-full p-0.5 hover:bg-white/10"
            aria-label={`Remove ${tag}`}
            onClick={() => onChange(tags.filter((t) => t !== tag))}
          >
            <X className="h-3 w-3" />
          </button>
        </span>
      ))}
      <input
        id={id}
        value={draft}
        onChange={(e) => setDraft(e.target.value)}
        onKeyDown={onKeyDown}
        onBlur={() => draft && commit(draft)}
        placeholder={tags.length ? '' : placeholder ?? 'Type and press Enter'}
        className="min-w-[8rem] flex-1 bg-transparent px-1.5 py-1 text-sm text-parchment-50 outline-none placeholder:text-muted/70"
        aria-invalid={invalid}
        aria-describedby={describedBy}
      />
    </div>
  );
}

/* ---------- Pairs (repeater) ---------- */
function PairsEditor({ def, rows, onChange, id }: { def: FieldDef; rows: Record<string, string>[]; onChange: (rows: Record<string, string>[]) => void; id: string }) {
  const cfg = def.pair!;
  const [k1, k2] = cfg.keys;

  const update = (i: number, key: string, value: string) =>
    onChange(rows.map((r, idx) => (idx === i ? { ...r, [key]: value } : r)));
  const move = (i: number, dir: -1 | 1) => {
    const next = [...rows];
    const j = i + dir;
    if (j < 0 || j >= next.length) return;
    [next[i], next[j]] = [next[j], next[i]];
    onChange(next);
  };

  return (
    <div className="space-y-3" id={id}>
      {rows.map((row, i) => (
        <fieldset key={i} className="rounded-xl border border-white/10 bg-white/[0.02] p-3">
          <legend className="px-1 text-xs text-muted">
            {def.label} #{i + 1}
          </legend>
          <div className="grid gap-3 sm:grid-cols-[1fr_auto]">
            <div className="space-y-3">
              <div>
                <label className="label text-xs" htmlFor={`${id}-${i}-a`}>
                  {cfg.labels[0]}
                </label>
                <input
                  id={`${id}-${i}-a`}
                  className="input"
                  value={row[k1] ?? ''}
                  maxLength={cfg.max[0]}
                  onChange={(e) => update(i, k1, e.target.value)}
                />
              </div>
              <div>
                <label className="label text-xs" htmlFor={`${id}-${i}-b`}>
                  {cfg.labels[1]}
                </label>
                {cfg.multiline ? (
                  <textarea
                    id={`${id}-${i}-b`}
                    className="input min-h-[80px] resize-y"
                    rows={3}
                    value={row[k2] ?? ''}
                    maxLength={cfg.max[1]}
                    onChange={(e) => update(i, k2, e.target.value)}
                  />
                ) : (
                  <input
                    id={`${id}-${i}-b`}
                    className="input"
                    value={row[k2] ?? ''}
                    maxLength={cfg.max[1]}
                    onChange={(e) => update(i, k2, e.target.value)}
                  />
                )}
              </div>
            </div>
            <div className="flex gap-2 sm:flex-col">
              <button type="button" className="btn-icon" onClick={() => move(i, -1)} disabled={i === 0} aria-label={`Move ${def.label} ${i + 1} up`}>
                <ArrowUp className="h-4 w-4" />
              </button>
              <button type="button" className="btn-icon" onClick={() => move(i, 1)} disabled={i === rows.length - 1} aria-label={`Move ${def.label} ${i + 1} down`}>
                <ArrowDown className="h-4 w-4" />
              </button>
              <button type="button" className="btn-icon hover:!border-crimson-400 hover:!text-red-300" onClick={() => onChange(rows.filter((_, idx) => idx !== i))} aria-label={`Remove ${def.label} ${i + 1}`}>
                <Trash2 className="h-4 w-4" />
              </button>
            </div>
          </div>
        </fieldset>
      ))}
      <button
        type="button"
        className="btn btn-secondary btn-sm"
        disabled={Boolean(def.maxItems && rows.length >= def.maxItems)}
        onClick={() => onChange([...rows, { [k1]: '', [k2]: '' }])}
      >
        <Plus className="h-3.5 w-3.5" aria-hidden /> Add {def.label.toLowerCase().replace(/s$/, '')}
      </button>
    </div>
  );
}

/* ---------- File upload ---------- */
function FileField({ id, kind, value, onChange }: { id: string; kind: 'image' | 'pdf'; value: string | null; onChange: (path: string | null) => void }) {
  const inputRef = useRef<HTMLInputElement>(null);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState('');

  const pick = async (file: File | undefined) => {
    if (!file) return;
    setBusy(true);
    setError('');
    try {
      const prepared = kind === 'image' ? await prepareImage(file) : await preparePdf(file);
      const path = await uploadFile(kind === 'image' ? 'image' : 'resume', prepared.blob, prepared.contentType, prepared.ext);
      onChange(path);
    } catch (err) {
      setError(toMessage(err));
    } finally {
      setBusy(false);
      if (inputRef.current) inputRef.current.value = '';
    }
  };

  const preview = kind === 'image' ? imageUrl(value) : resumeViewUrl(value);

  return (
    <div className="rounded-xl border border-dashed border-gold-500/30 bg-white/[0.02] p-4">
      <div className="flex flex-wrap items-center gap-4">
        {kind === 'image' ? (
          <div className="flex h-20 w-28 shrink-0 items-center justify-center overflow-hidden rounded-lg border border-white/10 bg-ink-900">
            {preview ? <img src={preview} alt="Current upload" className="h-full w-full object-cover" /> : <ImageIcon className="h-6 w-6 text-muted" aria-hidden />}
          </div>
        ) : (
          <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-lg border border-white/10 bg-ink-900">
            <FileText className="h-6 w-6 text-gold-300" aria-hidden />
          </div>
        )}
        <div className="min-w-0 flex-1 text-sm">
          {value ? (
            <>
              <p className="text-parchment-100">{kind === 'image' ? 'Image uploaded' : 'PDF uploaded'}</p>
              {preview && kind === 'pdf' && (
                <a href={preview} target="_blank" rel="noopener noreferrer" className="text-gold-300 underline-offset-4 hover:underline">
                  Open current file<span className="sr-only"> (opens in a new tab)</span>
                </a>
              )}
              <p className="truncate text-xs text-muted">{value}</p>
            </>
          ) : (
            <p className="text-muted">{kind === 'image' ? 'No image. JPEG, PNG or WebP, optimised automatically.' : 'No file. PDF up to 5 MB.'}</p>
          )}
        </div>
        <div className="flex gap-2">
          <input
            ref={inputRef}
            id={id}
            type="file"
            className="sr-only"
            accept={kind === 'image' ? 'image/jpeg,image/png,image/webp' : 'application/pdf'}
            onChange={(e) => pick(e.target.files?.[0])}
            tabIndex={-1}
          />
          <button type="button" className="btn btn-secondary btn-sm" onClick={() => inputRef.current?.click()} disabled={busy}>
            {busy ? <Loader2 className="h-3.5 w-3.5 animate-spin" aria-hidden /> : <Upload className="h-3.5 w-3.5" aria-hidden />}
            {value ? 'Replace' : 'Upload'}
          </button>
          {value && !busy && (
            <button type="button" className="btn btn-ghost btn-sm" onClick={() => onChange(null)}>
              Remove
            </button>
          )}
        </div>
      </div>
      {error && (
        <p role="alert" className="mt-3 text-sm text-red-300">
          {error}
        </p>
      )}
    </div>
  );
}

/* ---------- Generic field ---------- */
export function FormField({ def, values, error, onChange, idPrefix }: FieldProps) {
  const autoId = useId();
  const id = `${idPrefix}-${def.name}-${autoId.replace(/:/g, '')}`;
  const errorId = `${id}-error`;
  const helpId = `${id}-help`;
  const describedBy = [error ? errorId : null, def.help ? helpId : null].filter(Boolean).join(' ') || undefined;
  const value = values[def.name];
  const invalid = Boolean(error);

  if (def.type === 'section') {
    return (
      <div className="col-span-full border-b border-white/10 pb-2 pt-4 first:pt-0">
        <h3 className="text-sm font-semibold uppercase tracking-widest text-gold-300">{def.label}</h3>
        {def.help && <p className="mt-1 text-sm text-muted">{def.help}</p>}
      </div>
    );
  }

  if (def.type === 'checkbox') {
    return (
      <div className={def.half ? 'sm:col-span-1' : 'col-span-full'}>
        <label className="flex cursor-pointer items-center gap-3 rounded-lg border border-white/10 bg-white/[0.02] px-3.5 py-3 text-sm hover:border-white/20">
          <input
            id={id}
            type="checkbox"
            checked={Boolean(value)}
            onChange={(e) => onChange(def.name, e.target.checked)}
            className="h-4 w-4 accent-[#d4a634]"
          />
          <span>
            <span className="font-medium text-parchment-50">{def.label}</span>
            {def.help && <span className="block text-xs text-muted">{def.help}</span>}
          </span>
        </label>
      </div>
    );
  }

  let control: ReactNode;
  switch (def.type) {
    case 'textarea':
      control = (
        <textarea
          id={id}
          className="input resize-y"
          rows={def.rows ?? 4}
          maxLength={def.maxLength}
          placeholder={def.placeholder}
          value={String(value ?? '')}
          onChange={(e) => onChange(def.name, e.target.value)}
          aria-invalid={invalid}
          aria-describedby={describedBy}
        />
      );
      break;
    case 'lines':
      control = (
        <textarea
          id={id}
          className="input resize-y"
          rows={def.rows ?? 6}
          placeholder={def.placeholder ?? 'One item per line'}
          value={String(value ?? '')}
          onChange={(e) => onChange(def.name, e.target.value)}
          aria-invalid={invalid}
          aria-describedby={describedBy}
        />
      );
      break;
    case 'select':
      control = (
        <select
          id={id}
          className="input"
          value={String(value ?? '')}
          onChange={(e) => onChange(def.name, e.target.value)}
          aria-invalid={invalid}
          aria-describedby={describedBy}
        >
          <option value="">Select…</option>
          {def.options?.map((o) => (
            <option key={o.value} value={o.value}>
              {o.label}
            </option>
          ))}
        </select>
      );
      break;
    case 'tags':
      control = (
        <TagInput
          id={id}
          tags={(value as string[]) ?? []}
          onChange={(t) => onChange(def.name, t)}
          invalid={invalid}
          describedBy={describedBy}
          placeholder={def.placeholder}
        />
      );
      break;
    case 'pairs':
      control = <PairsEditor def={def} rows={(value as Record<string, string>[]) ?? []} onChange={(r) => onChange(def.name, r)} id={id} />;
      break;
    case 'image':
    case 'pdf':
      control = <FileField id={id} kind={def.type} value={(value as string | null) ?? null} onChange={(p) => onChange(def.name, p)} />;
      break;
    default:
      control = (
        <input
          id={id}
          className="input"
          type={def.type === 'email' ? 'email' : def.type === 'date' ? 'date' : def.type === 'url' ? 'url' : def.type === 'number' ? 'number' : 'text'}
          inputMode={def.type === 'number' ? 'numeric' : undefined}
          maxLength={def.maxLength}
          placeholder={def.placeholder}
          value={String(value ?? '')}
          onChange={(e) => onChange(def.name, e.target.value)}
          aria-invalid={invalid}
          aria-describedby={describedBy}
        />
      );
  }

  const labelFor = def.type === 'pairs' || def.type === 'image' || def.type === 'pdf' ? undefined : id;

  return (
    <div className={def.half ? 'sm:col-span-1' : 'col-span-full'}>
      <div className="flex items-baseline justify-between gap-2">
        <label className="label" htmlFor={labelFor}>
          {def.label}
          {def.required && (
            <span className="ml-1 text-crimson-400" aria-hidden>
              *
            </span>
          )}
          {def.required && <span className="sr-only"> (required)</span>}
        </label>
        {(def.type === 'text' || def.type === 'textarea') && def.maxLength && (
          <span className="text-xs text-muted" aria-hidden>
            {String(value ?? '').length}/{def.maxLength}
          </span>
        )}
      </div>
      {control}
      {def.help && (
        <p id={helpId} className="mt-1.5 text-xs text-muted">
          {def.help}
        </p>
      )}
      {error && (
        <p id={errorId} role="alert" className="mt-1.5 text-sm text-red-300">
          {error}
        </p>
      )}
    </div>
  );
}
