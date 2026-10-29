import { useCallback, useEffect, useMemo, useState } from 'react';
import { toMessage } from '@/lib/errors';
import { listRows } from '@/services/admin';
import type { Row } from '@/types/content';
import { PageHeader } from '../components/PageHeader';
import type { FieldDef } from '../forms/types';
import { ResourceManager } from '../ResourceManager';
import { RESOURCES } from '../resources';

export default function SkillsPage() {
  const [categories, setCategories] = useState<Row[] | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [selected, setSelected] = useState<string>('');

  const loadCategories = useCallback(async () => {
    try {
      const rows = await listRows('skill_categories');
      setCategories(rows);
      setError(null);
      setSelected((current) => (rows.some((r) => r.id === current) ? current : (rows[0]?.id ?? '')));
    } catch (err) {
      setError(toMessage(err));
    }
  }, []);

  useEffect(() => {
    void loadCategories();
  }, [loadCategories]);

  const filter = useCallback((row: Row) => row.category_id === selected, [selected]);

  const skillFields = useMemo<FieldDef[]>(
    () => [
      { name: 'name', label: 'Skill name', type: 'text', required: true, maxLength: 60 },
      {
        name: 'category_id',
        label: 'Category',
        type: 'select',
        required: true,
        options: (categories ?? []).map((c) => ({ value: c.id, label: String(c.name) })),
        help: 'Change the category to move this skill.',
      },
    ],
    [categories],
  );

  const skillConfig = useMemo(
    () => ({
      ...RESOURCES.skill_categories,
      table: 'skills' as const,
      title: 'Skills',
      singular: 'skill',
      defaults: undefined,
      fields: skillFields,
      summary: (r: Row) => ({ title: String(r.name) }),
      empty: { title: 'No skills in this category', hint: 'Add the first skill to this category.' },
    }),
    [skillFields],
  );

  return (
    <>
      <PageHeader title="Skills" description="Create categories, then add the skills that belong in each. Only list skills you genuinely use." />

      <h2 className="mb-3 text-lg">Categories</h2>
      <div className="mb-10">
        <ResourceManager config={RESOURCES.skill_categories} onChanged={() => void loadCategories()} compact />
      </div>

      <h2 className="mb-3 text-lg">Skills</h2>
      {error && (
        <p role="alert" className="mb-4 rounded-xl border border-crimson-500/40 bg-crimson-600/10 p-4 text-sm text-red-200">
          {error}
        </p>
      )}
      {categories && categories.length === 0 ? (
        <p className="rounded-xl border border-dashed border-gold-500/25 p-5 text-sm text-muted">Create a category above before adding skills.</p>
      ) : (
        categories && (
          <>
            <div role="tablist" aria-label="Skill category" className="mb-5 flex flex-wrap gap-2">
              {categories.map((c) => (
                <button
                  key={c.id}
                  type="button"
                  role="tab"
                  aria-selected={selected === c.id}
                  onClick={() => setSelected(c.id)}
                  className={`rounded-full border px-4 py-1.5 text-sm transition ${
                    selected === c.id ? 'border-gold-400/70 bg-gold-500/15 text-gold-100' : 'border-white/10 text-parchment-200 hover:border-white/25'
                  }`}
                >
                  {String(c.name)}
                </button>
              ))}
            </div>
            <div role="tabpanel">
              <ResourceManager key={selected} config={skillConfig} fields={skillFields} filter={filter} newDefaults={{ category_id: selected }} compact />
            </div>
          </>
        )
      )}
    </>
  );
}
