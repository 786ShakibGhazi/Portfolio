import { useId, useRef, useState, type FormEvent } from 'react';
import { AlertCircle, Loader2 } from 'lucide-react';
import { toMessage } from '@/lib/errors';
import { FormField } from './FormField';
import type { FieldDef, Values } from './types';
import { toPayload, validateAll } from './validate';

interface EntityFormProps {
  fields: FieldDef[];
  initial: Values;
  onSubmit: (payload: Record<string, unknown>) => Promise<void>;
  submitLabel?: string;
  onCancel?: () => void;
}

export function EntityForm({ fields, initial, onSubmit, submitLabel = 'Save', onCancel }: EntityFormProps) {
  const [values, setValues] = useState<Values>(initial);
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [busy, setBusy] = useState(false);
  const [formError, setFormError] = useState('');
  const formRef = useRef<HTMLFormElement>(null);
  const prefix = useId().replace(/:/g, '');

  const change = (name: string, value: unknown) => {
    setValues((v) => ({ ...v, [name]: value }));
    setErrors((e) => {
      if (!e[name]) return e;
      const { [name]: _removed, ...rest } = e;
      return rest;
    });
  };

  const submit = async (e: FormEvent) => {
    e.preventDefault();
    if (busy) return;
    const found = validateAll(fields, values);
    setErrors(found);
    setFormError('');
    if (Object.keys(found).length) {
      // Wait for aria-invalid to render, then focus the first problem.
      requestAnimationFrame(() => formRef.current?.querySelector<HTMLElement>('[aria-invalid="true"]')?.focus());
      return;
    }
    setBusy(true);
    try {
      await onSubmit(toPayload(fields, values));
    } catch (err) {
      setFormError(toMessage(err));
    } finally {
      setBusy(false);
    }
  };

  return (
    <form ref={formRef} onSubmit={submit} noValidate aria-busy={busy}>
      <div className="grid gap-x-4 gap-y-5 sm:grid-cols-2">
        {fields.map((def) => {
          if (def.showWhen && !def.showWhen(values)) return null;
          return <FormField key={def.name} def={def} values={values} error={errors[def.name]} onChange={change} idPrefix={prefix} />;
        })}
      </div>

      {formError && (
        <p role="alert" className="mt-5 flex items-start gap-2 rounded-lg border border-crimson-500/40 bg-crimson-600/10 px-3 py-2.5 text-sm text-red-200">
          <AlertCircle className="mt-0.5 h-4 w-4 shrink-0" aria-hidden /> {formError}
        </p>
      )}
      {Object.keys(errors).length > 0 && (
        <p role="alert" className="mt-5 text-sm text-red-300">
          Please fix the highlighted fields.
        </p>
      )}

      <div className="sticky bottom-0 -mx-5 mt-6 flex flex-col-reverse gap-2 border-t border-white/10 bg-ink-900/95 px-5 py-3 backdrop-blur sm:-mx-6 sm:flex-row sm:justify-end sm:px-6">
        {onCancel && (
          <button type="button" className="btn btn-ghost btn-sm" onClick={onCancel} disabled={busy}>
            Cancel
          </button>
        )}
        <button type="submit" className="btn btn-primary btn-sm" disabled={busy}>
          {busy && <Loader2 className="h-4 w-4 animate-spin" aria-hidden />}
          {busy ? 'Saving…' : submitLabel}
        </button>
      </div>
    </form>
  );
}
