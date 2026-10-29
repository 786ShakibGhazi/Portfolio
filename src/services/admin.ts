import { LIMITS, BUCKETS } from '@/lib/config';
import { getClient } from '@/lib/supabase';
import type { Row } from '@/types/content';

export const RESOURCE_TABLES = [
  'social_links',
  'skill_categories',
  'skills',
  'experiences',
  'projects',
  'education',
  'certifications',
  'achievements',
] as const;
export type ResourceTable = (typeof RESOURCE_TABLES)[number];

export async function listRows(table: ResourceTable): Promise<Row[]> {
  const { data, error } = await getClient()
    .from(table)
    .select('*')
    .order('sort_order', { ascending: true })
    .order('created_at', { ascending: true });
  if (error) throw error;
  return (data ?? []) as Row[];
}

export async function insertRow(table: ResourceTable, values: Record<string, unknown>): Promise<Row> {
  const { data, error } = await getClient().from(table).insert(values).select().single();
  if (error) throw error;
  return data as Row;
}

export async function updateRow(table: ResourceTable, id: string, values: Record<string, unknown>): Promise<void> {
  const { error } = await getClient().from(table).update(values).eq('id', id);
  if (error) throw error;
}

export async function deleteRow(table: ResourceTable, id: string): Promise<void> {
  const { error } = await getClient().from(table).delete().eq('id', id);
  if (error) throw error;
}

export async function reorderRows(table: ResourceTable, ids: string[]): Promise<void> {
  const { error } = await getClient().rpc('reorder_rows', { p_table: table, p_ids: ids });
  if (error) throw error;
}

export async function getProfileRow(): Promise<Row | null> {
  const { data, error } = await getClient().from('profile').select('*').eq('id', 1).maybeSingle();
  if (error) throw error;
  return data ? ({ ...data, id: String(data.id) } as Row) : null;
}

export async function saveProfileRow(values: Record<string, unknown>): Promise<void> {
  const { error } = await getClient().from('profile').upsert({ ...values, id: 1 });
  if (error) throw error;
}

export interface PublishStatus {
  draftUpdatedAt: string | null;
  publishedAt: string | null;
  dirty: boolean;
}

export async function getPublishStatus(): Promise<PublishStatus> {
  const client = getClient();
  const [state, published] = await Promise.all([
    client.from('site_state').select('draft_updated_at').eq('id', 1).maybeSingle(),
    client.from('published_content').select('published_at').eq('id', 1).maybeSingle(),
  ]);
  if (state.error) throw state.error;
  if (published.error) throw published.error;
  const draftUpdatedAt = (state.data?.draft_updated_at as string | undefined) ?? null;
  const publishedAt = (published.data?.published_at as string | undefined) ?? null;
  const dirty = !publishedAt || (draftUpdatedAt !== null && new Date(draftUpdatedAt) > new Date(publishedAt));
  return { draftUpdatedAt, publishedAt, dirty };
}

export async function publishPortfolio(): Promise<void> {
  const { error } = await getClient().rpc('publish_portfolio');
  if (error) throw error;
}

export interface ActivityEntry {
  id: number;
  table_name: string;
  action: string;
  label: string | null;
  created_at: string;
}

export async function getRecentActivity(limit = 10): Promise<ActivityEntry[]> {
  const { data, error } = await getClient()
    .from('activity_log')
    .select('id, table_name, action, label, created_at')
    .order('created_at', { ascending: false })
    .limit(limit);
  if (error) throw error;
  return (data ?? []) as ActivityEntry[];
}

export async function getCounts(): Promise<Record<string, number>> {
  const client = getClient();
  const tables = ['skills', 'experiences', 'projects', 'education', 'certifications', 'achievements', 'social_links'];
  const results = await Promise.all(
    tables.map((t) => client.from(t).select('id', { count: 'exact', head: true })),
  );
  const counts: Record<string, number> = {};
  results.forEach((res, i) => {
    if (res.error) throw res.error;
    counts[tables[i]] = res.count ?? 0;
  });
  return counts;
}

export interface ContactMessage {
  id: string;
  name: string;
  email: string;
  message: string;
  is_read: boolean;
  created_at: string;
}

export async function listMessages(): Promise<ContactMessage[]> {
  const { data, error } = await getClient()
    .from('contact_messages')
    .select('id, name, email, message, is_read, created_at')
    .order('created_at', { ascending: false })
    .limit(200);
  if (error) throw error;
  return (data ?? []) as ContactMessage[];
}

export async function countUnreadMessages(): Promise<number> {
  const { count, error } = await getClient()
    .from('contact_messages')
    .select('id', { count: 'exact', head: true })
    .eq('is_read', false);
  if (error) throw error;
  return count ?? 0;
}

export async function setMessageRead(id: string, isRead: boolean): Promise<void> {
  const { error } = await getClient().from('contact_messages').update({ is_read: isRead }).eq('id', id);
  if (error) throw error;
}

export async function deleteMessage(id: string): Promise<void> {
  const { error } = await getClient().from('contact_messages').delete().eq('id', id);
  if (error) throw error;
}

export type UploadKind = 'image' | 'resume';

/** Uploads under a random, server-safe file name; the original name is never used. */
export async function uploadFile(kind: UploadKind, blob: Blob, contentType: string, ext: string): Promise<string> {
  const bucket = kind === 'image' ? BUCKETS.images : BUCKETS.resume;
  const limit = kind === 'image' ? LIMITS.imageBytes : LIMITS.resumeBytes;
  if (blob.size > limit) throw new Error('File is larger than the allowed size.');
  const folder = kind === 'image' ? 'images' : 'resume';
  const path = `${folder}/${crypto.randomUUID()}.${ext}`;
  const { error } = await getClient().storage.from(bucket).upload(path, blob, {
    contentType,
    cacheControl: '31536000',
    upsert: false,
  });
  if (error) throw error;
  return path;
}
