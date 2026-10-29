import { useCallback, useEffect, useMemo, useState } from 'react';
import { AnimatePresence, m } from 'framer-motion';
import { AlertCircle, ArrowDown, ArrowUp, Pencil, Plus, RefreshCw, Trash2 } from 'lucide-react';
import { ConfirmDialog } from '@/components/ui/ConfirmDialog';
import { Modal } from '@/components/ui/Modal';
import { EmptyState, Skeleton } from '@/components/ui/primitives';
import { useToast } from '@/components/ui/Toast';
import { toMessage } from '@/lib/errors';
import { deleteRow, insertRow, listRows, reorderRows, updateRow } from '@/services/admin';
import type { Row } from '@/types/content';
import { useAdmin } from './AdminContext';
import { EntityForm } from './forms/EntityForm';
import type { FieldDef } from './forms/types';
import { initialValues } from './forms/validate';
import type { ResourceConfig } from './resources';

interface Props {
  config: ResourceConfig;
  /** Restricts the visible rows (e.g. skills of one category). Reordering then applies to that subset. */
  filter?: (row: Row) => boolean;
  /** Replaces config.fields (e.g. to inject dynamic select options). */
  fields?: FieldDef[];
  /** Merged into new rows (e.g. the selected category). */
  newDefaults?: Record<string, unknown>;
  /** Called after any successful change. */
  onChanged?: () => void;
  compact?: boolean;
}

export function ResourceManager({ config, filter, fields, newDefaults, onChanged, compact = false }: Props) {
  const toast = useToast();
  const { refresh } = useAdmin();
  const { table, singular } = config;
  const activeFields = fields ?? config.fields;

  const [rows, setRows] = useState<Row[] | null>(null);
  const [loadError, setLoadError] = useState<string | null>(null);
  const [editing, setEditing] = useState<Row | 'new' | null>(null);
  const [deleting, setDeleting] = useState<Row | null>(null);
  const [busyId, setBusyId] = useState<string | null>(null);

  const load = useCallback(async () => {
    try {
      setRows(await listRows(table));
      setLoadError(null);
    } catch (err) {
      setLoadError(toMessage(err));
    }
  }, [table]);

  useEffect(() => {
    void load();
  }, [load]);

  const visible = useMemo(() => (rows ?? []).filter(filter ?? (() => true)), [rows, filter]);

  const afterChange = async () => {
    await load();
    await refresh();
    onChanged?.();
  };

  const save = async (payload: Record<string, unknown>) => {
    if (editing === 'new') {
      const nextOrder = visible.reduce((max, r) => Math.max(max, r.sort_order ?? 0), 0) + 1;
      await insertRow(table, { ...config.defaults, ...newDefaults, ...payload, sort_order: nextOrder });
      toast.success(`Saved. The new ${singular} is in your draft.`);
    } else if (editing) {
      await updateRow(table, editing.id, payload);
      toast.success('Changes saved to your draft.');
    }
    setEditing(null);
    await afterChange();
  };

  const confirmDelete = async () => {
    if (!deleting) return;
    setBusyId(deleting.id);
    try {
      await deleteRow(table, deleting.id);
      toast.success(`The ${singular} was deleted from your draft.`);
      setDeleting(null);
      await afterChange();
    } catch (err) {
      toast.error(toMessage(err));
    } finally {
      setBusyId(null);
    }
  };

  const move = async (index: number, dir: -1 | 1) => {
    const target = index + dir;
    if (target < 0 || target >= visible.length) return;
    const ids = visible.map((r) => r.id);
    [ids[index], ids[target]] = [ids[target], ids[index]];
    setBusyId(visible[index].id);
    try {
      await reorderRows(table, ids);
      await afterChange();
    } catch (err) {
      toast.error(toMessage(err));
    } finally {
      setBusyId(null);
    }
  };

  const modalTitle = editing === 'new' ? `Add ${singular}` : `Edit ${singular}`;

  return (
    <div>
      <div className="mb-4 flex items-center justify-between gap-3">
        <p className="text-sm text-muted" aria-live="polite">
          {rows ? `${visible.length} ${visible.length === 1 ? 'item' : 'items'}` : 'Loading…'}
        </p>
        <button type="button" className="btn btn-primary btn-sm" onClick={() => setEditing('new')} disabled={!rows}>
          <Plus className="h-4 w-4" aria-hidden /> Add {singular}
        </button>
      </div>

      {loadError && (
        <div role="alert" className="mb-4 flex flex-wrap items-center gap-3 rounded-xl border border-crimson-500/40 bg-crimson-600/10 p-4 text-sm text-red-200">
          <AlertCircle className="h-4 w-4 shrink-0" aria-hidden />
          <span className="flex-1">{loadError}</span>
          <button type="button" className="btn btn-secondary btn-sm" onClick={() => void load()}>
            <RefreshCw className="h-3.5 w-3.5" aria-hidden /> Retry
          </button>
        </div>
      )}

      {!rows && !loadError && (
        <div className="space-y-3" aria-busy>
          {[0, 1, 2].map((i) => (
            <Skeleton key={i} className="h-[72px]" />
          ))}
        </div>
      )}

      {rows && visible.length === 0 && !loadError && (
        <EmptyState
          title={config.empty.title}
          hint={config.empty.hint}
          action={
            <button type="button" className="btn btn-secondary btn-sm mt-2" onClick={() => setEditing('new')}>
              <Plus className="h-4 w-4" aria-hidden /> Add {singular}
            </button>
          }
        />
      )}

      <ul className="space-y-3">
        <AnimatePresence initial={false}>
          {visible.map((row, i) => {
            const s = config.summary(row);
            const busy = busyId === row.id;
            return (
              <m.li
                key={row.id}
                initial={{ opacity: 0, y: 8 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, height: 0, marginTop: 0 }}
                transition={{ duration: 0.2 }}
                className={`glass flex flex-wrap items-center gap-x-3 gap-y-2 rounded-xl ${compact ? 'p-3' : 'p-4'} ${s.muted ? 'opacity-60' : ''}`}
              >
                <div className="min-w-[12rem] flex-1">
                  <div className="flex flex-wrap items-center gap-2">
                    <p className="break-words font-medium text-parchment-50">{s.title || '(untitled)'}</p>
                    {s.badge && <span className="chip py-0.5 text-[0.7rem]">{s.badge}</span>}
                  </div>
                  {s.subtitle && <p className="mt-0.5 line-clamp-2 break-words text-sm text-muted">{s.subtitle}</p>}
                  {s.meta && s.meta.length > 0 && (
                    <p className="mt-1 flex flex-wrap gap-x-3 text-xs text-muted/90">
                      {s.meta.map((mItem, idx) => (
                        <span key={`${mItem}-${idx}`}>{mItem}</span>
                      ))}
                    </p>
                  )}
                </div>
                <div className="ml-auto flex shrink-0 items-center gap-1.5">
                  <button type="button" className="btn-icon" onClick={() => move(i, -1)} disabled={i === 0 || busy} aria-label={`Move ${s.title} up`}>
                    <ArrowUp className="h-4 w-4" />
                  </button>
                  <button type="button" className="btn-icon" onClick={() => move(i, 1)} disabled={i === visible.length - 1 || busy} aria-label={`Move ${s.title} down`}>
                    <ArrowDown className="h-4 w-4" />
                  </button>
                  <button type="button" className="btn-icon" onClick={() => setEditing(row)} disabled={busy} aria-label={`Edit ${s.title}`}>
                    <Pencil className="h-4 w-4" />
                  </button>
                  <button type="button" className="btn-icon hover:!border-crimson-400 hover:!text-red-300" onClick={() => setDeleting(row)} disabled={busy} aria-label={`Delete ${s.title}`}>
                    <Trash2 className="h-4 w-4" />
                  </button>
                </div>
              </m.li>
            );
          })}
        </AnimatePresence>
      </ul>

      <Modal open={editing !== null} onClose={() => setEditing(null)} title={modalTitle} description="Changes are saved to your draft. Publish to make them live." size="md">
        {editing !== null && (
          <EntityForm
            key={editing === 'new' ? 'new' : editing.id}
            fields={activeFields}
            initial={initialValues(activeFields, editing === 'new' ? null : editing, { ...config.defaults, ...newDefaults })}
            onSubmit={save}
            submitLabel={editing === 'new' ? `Add ${singular}` : 'Save changes'}
            onCancel={() => setEditing(null)}
          />
        )}
      </Modal>

      <ConfirmDialog
        open={deleting !== null}
        title={`Delete this ${singular}?`}
        message={
          <>
            <strong className="text-parchment-50">{deleting ? config.summary(deleting).title : ''}</strong> will be removed from your draft.
            The live site keeps showing it until you publish. This cannot be undone.
            {config.deleteNote && <span className="mt-2 block text-gold-200">{config.deleteNote}</span>}
          </>
        }
        confirmLabel="Delete"
        busy={busyId !== null && deleting?.id === busyId}
        onConfirm={() => void confirmDelete()}
        onCancel={() => setDeleting(null)}
      />
    </div>
  );
}
