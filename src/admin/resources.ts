import type { ReactNode } from 'react';
import type { ResourceTable } from '@/services/admin';
import { SOCIAL_OPTIONS, CATEGORY_ICONS } from '@/lib/icons';
import { formatMonthYear, formatRange } from '@/lib/format';
import type { Row } from '@/types/content';
import type { FieldDef, Values } from './forms/types';

export interface RowSummary {
  title: string;
  subtitle?: string;
  meta?: string[];
  badge?: string;
  muted?: boolean;
}

export interface ResourceConfig {
  table: ResourceTable;
  title: string;
  singular: string;
  description: string;
  fields: FieldDef[];
  defaults?: Values;
  summary: (row: Row) => RowSummary;
  empty: { title: string; hint: string };
  /** Extra sentence shown in the delete confirmation. */
  deleteNote?: string;
  icon?: ReactNode;
}

const str = (v: unknown): string => (typeof v === 'string' ? v : '');
const arr = (v: unknown): string[] => (Array.isArray(v) ? (v as string[]) : []);

export const ICON_OPTIONS = Object.keys(CATEGORY_ICONS).map((key) => ({
  value: key,
  label: key.charAt(0).toUpperCase() + key.slice(1),
}));

export const RESOURCES = {
  social_links: {
    table: 'social_links',
    title: 'Social links',
    singular: 'link',
    description: 'Profiles shown in the hero, contact section and footer.',
    defaults: { platform: 'github', is_visible: true },
    fields: [
      { name: 'platform', label: 'Platform', type: 'select', required: true, half: true, options: SOCIAL_OPTIONS },
      { name: 'label', label: 'Label', type: 'text', required: true, half: true, maxLength: 60, placeholder: 'e.g. GitHub' },
      { name: 'url', label: 'URL', type: 'url', required: true, maxLength: 500, placeholder: 'https://github.com/your-username' },
      { name: 'is_visible', label: 'Show on the public site', type: 'checkbox' },
    ],
    summary: (r) => ({
      title: str(r.label),
      subtitle: str(r.url),
      badge: SOCIAL_OPTIONS.find((o) => o.value === r.platform)?.label,
      muted: r.is_visible === false,
      meta: r.is_visible === false ? ['Hidden'] : [],
    }),
    empty: { title: 'No social links yet', hint: 'Add your LinkedIn, GitHub, GeeksforGeeks and other profiles.' },
  },
  experiences: {
    table: 'experiences',
    title: 'Experience',
    singular: 'role',
    description: 'Work history shown on the timeline, newest first (reorder as you like).',
    defaults: { is_current: false },
    fields: [
      { name: 'role', label: 'Job title', type: 'text', required: true, half: true, maxLength: 120 },
      { name: 'company', label: 'Company', type: 'text', required: true, half: true, maxLength: 120 },
      { name: 'location', label: 'Location', type: 'text', half: true, maxLength: 100 },
      { name: 'is_current', label: 'I currently work here', type: 'checkbox', half: true },
      { name: 'start_date', label: 'Start date', type: 'date', required: true, half: true },
      { name: 'end_date', label: 'End date', type: 'date', half: true, required: true, showWhen: (v) => !v.is_current },
      { name: 'summary', label: 'Summary', type: 'textarea', rows: 3, maxLength: 600, help: 'Optional short overview shown above the bullet points.' },
      { name: 'highlights', label: 'Responsibilities & achievements', type: 'lines', rows: 7, maxItems: 12, itemMaxLength: 500, help: 'One bullet point per line.' },
      { name: 'tech', label: 'Technologies', type: 'tags', maxItems: 20, itemMaxLength: 40, help: 'Press Enter or comma after each item.' },
    ],
    summary: (r) => ({
      title: str(r.role),
      subtitle: str(r.company),
      meta: [formatRange(str(r.start_date), (r.end_date as string) ?? null, Boolean(r.is_current))],
      badge: r.is_current ? 'Current' : undefined,
    }),
    empty: { title: 'No experience yet', hint: 'Add your first role to start the timeline.' },
  },
  projects: {
    table: 'projects',
    title: 'Projects',
    singular: 'project',
    description: 'Showcase projects. Featured projects are shown first and larger.',
    defaults: { is_featured: false },
    fields: [
      { name: 'title', label: 'Title', type: 'text', required: true, half: true, maxLength: 120 },
      { name: 'period', label: 'Period', type: 'text', half: true, maxLength: 60, placeholder: 'e.g. Apr 2024 – May 2025' },
      { name: 'description', label: 'Description', type: 'textarea', required: true, rows: 5, maxLength: 1200 },
      { name: 'tech', label: 'Technology stack', type: 'tags', maxItems: 20, itemMaxLength: 40 },
      { name: 'image_path', label: 'Screenshot / thumbnail', type: 'image', help: 'Optional. A generated cover is shown when empty.' },
      { name: 'live_url', label: 'Live demo URL', type: 'url', maxLength: 500, half: true, placeholder: 'https://…' },
      { name: 'repo_url', label: 'Source code URL', type: 'url', maxLength: 500, half: true, placeholder: 'https://github.com/…' },
      { name: 'is_featured', label: 'Featured project', type: 'checkbox', help: 'Featured projects appear first with a larger layout.' },
    ],
    summary: (r) => ({
      title: str(r.title),
      subtitle: str(r.period) || undefined,
      meta: arr(r.tech).slice(0, 5),
      badge: r.is_featured ? 'Featured' : undefined,
    }),
    empty: { title: 'No projects yet', hint: 'Add a project to display it in the Projects section.' },
  },
  education: {
    table: 'education',
    title: 'Education',
    singular: 'qualification',
    description: 'Degrees and schooling shown in the Education section.',
    fields: [
      { name: 'institution', label: 'Institution', type: 'text', required: true, maxLength: 160 },
      { name: 'qualification', label: 'Qualification', type: 'text', required: true, maxLength: 160 },
      { name: 'period', label: 'Period', type: 'text', half: true, maxLength: 60, placeholder: 'e.g. 2021 – 2025' },
      { name: 'grade_label', label: 'Grade label', type: 'text', half: true, maxLength: 30, placeholder: 'CGPA, Percentage…' },
      { name: 'grade_value', label: 'Grade value', type: 'text', half: true, maxLength: 30, placeholder: '8.6' },
    ],
    summary: (r) => ({
      title: str(r.institution),
      subtitle: str(r.qualification),
      meta: [str(r.period), r.grade_value ? `${str(r.grade_label)} ${str(r.grade_value)}`.trim() : ''].filter(Boolean),
    }),
    empty: { title: 'No education yet', hint: 'Add your degree or school.' },
  },
  certifications: {
    table: 'certifications',
    title: 'Certifications',
    singular: 'certification',
    description: 'Certificates shown beside your education.',
    fields: [
      { name: 'title', label: 'Title', type: 'text', required: true, maxLength: 160 },
      { name: 'issuer', label: 'Issuer', type: 'text', required: true, half: true, maxLength: 120 },
      { name: 'issued_on', label: 'Issued on', type: 'date', half: true },
      { name: 'credential_url', label: 'Credential URL', type: 'url', maxLength: 500, placeholder: 'https://…' },
    ],
    summary: (r) => ({
      title: str(r.title),
      subtitle: str(r.issuer),
      meta: r.issued_on ? [formatMonthYear(str(r.issued_on))] : [],
    }),
    empty: { title: 'No certifications yet', hint: 'Add a certificate to display it beside your education.' },
  },
  achievements: {
    table: 'achievements',
    title: 'Achievements',
    singular: 'achievement',
    description: 'Verified highlights. Only add accomplishments you can back up.',
    fields: [
      { name: 'title', label: 'Title', type: 'text', required: true, maxLength: 120 },
      { name: 'description', label: 'Description', type: 'textarea', required: true, rows: 3, maxLength: 400 },
      { name: 'metric', label: 'Headline metric', type: 'text', half: true, maxLength: 20, placeholder: 'e.g. 200+', help: 'Optional big number or label.' },
      { name: 'platform', label: 'Platform', type: 'text', half: true, maxLength: 40, placeholder: 'LeetCode, HackerRank…' },
      { name: 'url', label: 'Link', type: 'url', maxLength: 500, placeholder: 'https://…' },
    ],
    summary: (r) => ({
      title: str(r.title),
      subtitle: str(r.description),
      badge: str(r.metric) || undefined,
      meta: r.platform ? [str(r.platform)] : [],
    }),
    empty: { title: 'No achievements yet', hint: 'Add a milestone or result.' },
  },
  skill_categories: {
    table: 'skill_categories',
    title: 'Skill categories',
    singular: 'category',
    description: 'Groups that organise your skills.',
    defaults: { icon: 'code' },
    fields: [
      { name: 'name', label: 'Category name', type: 'text', required: true, half: true, maxLength: 60 },
      { name: 'icon', label: 'Icon', type: 'select', required: true, half: true, options: ICON_OPTIONS },
    ],
    summary: (r) => ({ title: str(r.name), badge: str(r.icon) }),
    empty: { title: 'No categories yet', hint: 'Create a category such as "Programming Languages".' },
    deleteNote: 'All skills inside this category will be deleted too.',
  },
} satisfies Record<string, ResourceConfig>;

export type ResourceKey = keyof typeof RESOURCES;
