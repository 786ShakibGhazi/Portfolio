// eslint-disable-next-line no-control-regex
const CONTROL_CHARS = /[\u0000-\u0008\u000B\u000C\u000E-\u001F\u007F]/g;

/** Strips control characters and surrounding whitespace. React escapes output; this keeps stored data tidy. */
export function cleanText(value: string): string {
  return value.replace(CONTROL_CHARS, '').trim();
}

export function paragraphs(text: string): string[] {
  return text
    .split(/\n{2,}/)
    .map((p) => p.trim())
    .filter(Boolean);
}

export function initialOf(name: string): string {
  return (name.trim()[0] ?? 'S').toUpperCase();
}
