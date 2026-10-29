export type FieldType =
  | 'section'
  | 'text'
  | 'textarea'
  | 'email'
  | 'url'
  | 'date'
  | 'number'
  | 'checkbox'
  | 'select'
  | 'tags'
  | 'lines'
  | 'pairs'
  | 'image'
  | 'pdf';

export type Values = Record<string, unknown>;

export interface PairConfig {
  keys: [string, string];
  labels: [string, string];
  max: [number, number];
  /** Render the second input as a textarea. */
  multiline?: boolean;
}

export interface FieldDef {
  name: string;
  label: string;
  type: FieldType;
  required?: boolean;
  maxLength?: number;
  maxItems?: number;
  itemMaxLength?: number;
  rows?: number;
  placeholder?: string;
  help?: string;
  /** Occupy half the row on wide screens. */
  half?: boolean;
  options?: { value: string; label: string }[];
  pair?: PairConfig;
  /** Value stored when an optional text field is left empty. Defaults to null. */
  emptyAs?: '' | null;
  showWhen?: (values: Values) => boolean;
}
