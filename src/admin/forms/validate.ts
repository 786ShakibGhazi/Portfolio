import { cleanText } from '@/lib/text';
import type { FieldDef, Values } from './types';

const EMAIL_RE = /^[^@\s]+@[^@\s]+\.[^@\s]{2,}$/;
const URL_RE = /^https?:\/\/[^\s]+$/i;
const DATE_RE = /^\d{4}-\d{2}-\d{2}$/;

const isVisible = (def: FieldDef, values: Values) => !def.showWhen || def.showWhen(values);

function asString(value: unknown): string {
  return typeof value === 'string' ? cleanText(value) : '';
}

export function splitLines(value: unknown): string[] {
  return asString(typeof value === 'string' ? value : '')
    .split(/\r?\n/)
    .map((l) => cleanText(l))
    .filter(Boolean);
}

export function initialValues(fields: FieldDef[], row: Record<string, unknown> | null, defaults: Values = {}): Values {
  const out: Values = {};
  for (const f of fields) {
    if (f.type === 'section') continue;
    const source = row ? row[f.name] : defaults[f.name];
    switch (f.type) {
      case 'checkbox':
        out[f.name] = Boolean(source ?? false);
        break;
      case 'tags':
        out[f.name] = Array.isArray(source) ? [...(source as string[])] : [];
        break;
      case 'lines':
        out[f.name] = Array.isArray(source) ? (source as string[]).join('\n') : '';
        break;
      case 'pairs':
        out[f.name] = Array.isArray(source)
          ? (source as Record<string, string>[]).map((p) => ({ ...p }))
          : [];
        break;
      case 'image':
      case 'pdf':
        out[f.name] = typeof source === 'string' ? source : null;
        break;
      default:
        out[f.name] = source == null ? '' : String(source);
    }
  }
  return out;
}

export function validateField(def: FieldDef, value: unknown): string | null {
  switch (def.type) {
    case 'section':
    case 'checkbox':
      return null;
    case 'tags': {
      const items = (value as string[]) ?? [];
      if (def.required && !items.length) return 'Add at least one item.';
      if (def.maxItems && items.length > def.maxItems) return `No more than ${def.maxItems} items.`;
      if (def.itemMaxLength && items.some((i) => i.length > def.itemMaxLength!))
        return `Each item must be ${def.itemMaxLength} characters or fewer.`;
      return null;
    }
    case 'lines': {
      const items = splitLines(value);
      if (def.required && !items.length) return 'Add at least one line.';
      if (def.maxItems && items.length > def.maxItems) return `No more than ${def.maxItems} lines.`;
      if (def.itemMaxLength && items.some((i) => i.length > def.itemMaxLength!))
        return `Each line must be ${def.itemMaxLength} characters or fewer.`;
      return null;
    }
    case 'pairs': {
      const rows = (value as Record<string, string>[]) ?? [];
      const cfg = def.pair;
      if (!cfg) return null;
      if (def.maxItems && rows.length > def.maxItems) return `No more than ${def.maxItems} entries.`;
      for (const row of rows) {
        const a = asString(row[cfg.keys[0]]);
        const b = asString(row[cfg.keys[1]]);
        if (!a && !b) continue;
        if (!a || !b) return `Fill in both "${cfg.labels[0]}" and "${cfg.labels[1]}" for every entry.`;
        if (a.length > cfg.max[0]) return `"${cfg.labels[0]}" must be ${cfg.max[0]} characters or fewer.`;
        if (b.length > cfg.max[1]) return `"${cfg.labels[1]}" must be ${cfg.max[1]} characters or fewer.`;
      }
      return null;
    }
    case 'image':
    case 'pdf':
      return def.required && !value ? 'Please upload a file.' : null;
    default: {
      const text = asString(value);
      if (!text) return def.required ? `${def.label} is required.` : null;
      if (def.maxLength && text.length > def.maxLength) return `Must be ${def.maxLength} characters or fewer.`;
      if (def.type === 'email' && !EMAIL_RE.test(text)) return 'Enter a valid email address.';
      if (def.type === 'url' && !URL_RE.test(text)) return 'Enter a full link starting with http:// or https://';
      if (def.type === 'date' && !DATE_RE.test(text)) return 'Enter a valid date.';
      if (def.type === 'number' && !/^\d+$/.test(text)) return 'Enter a whole number.';
      return null;
    }
  }
}

export function validateAll(fields: FieldDef[], values: Values): Record<string, string> {
  const errors: Record<string, string> = {};
  for (const f of fields) {
    if (f.type === 'section' || !isVisible(f, values)) continue;
    const message = validateField(f, values[f.name]);
    if (message) errors[f.name] = message;
  }
  return errors;
}

/** Converts form state to a clean database payload (trimmed, nulls for empty optionals). */
export function toPayload(fields: FieldDef[], values: Values): Record<string, unknown> {
  const payload: Record<string, unknown> = {};
  for (const f of fields) {
    if (f.type === 'section') continue;
    const value = values[f.name];
    if (!isVisible(f, values)) {
      payload[f.name] = f.type === 'checkbox' ? false : (f.emptyAs ?? null);
      continue;
    }
    switch (f.type) {
      case 'checkbox':
        payload[f.name] = Boolean(value);
        break;
      case 'tags':
        payload[f.name] = ((value as string[]) ?? []).map(cleanText).filter(Boolean);
        break;
      case 'lines':
        payload[f.name] = splitLines(value);
        break;
      case 'pairs': {
        const cfg = f.pair!;
        payload[f.name] = ((value as Record<string, string>[]) ?? [])
          .map((row) => ({
            [cfg.keys[0]]: asString(row[cfg.keys[0]]),
            [cfg.keys[1]]: asString(row[cfg.keys[1]]),
          }))
          .filter((row) => row[cfg.keys[0]] && row[cfg.keys[1]]);
        break;
      }
      case 'image':
      case 'pdf':
        payload[f.name] = value || null;
        break;
      case 'number': {
        const text = asString(value);
        payload[f.name] = text ? parseInt(text, 10) : null;
        break;
      }
      default: {
        const text = asString(value);
        payload[f.name] = text || (f.emptyAs ?? null);
      }
    }
  }
  return payload;
}
