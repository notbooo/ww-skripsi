import { createClient, type SupabaseClient } from "@supabase/supabase-js";

// Optional cloud sync, NO AUTH. The app is offline-first; Supabase is just a
// durable backup + cross-device target. Access is gated by an unguessable
// "sync key" (the row id). The table is RLS-locked with no anon policy;
// access happens only through two SECURITY DEFINER functions, so a public
// anon key cannot enumerate or wipe data — only get/set the exact key.

export interface SnapshotPayload {
  cells: unknown;
  answers: unknown;
  syntheses: unknown;
  settings: { model: string; session: number; synthesisPrompt: string };
}

let cached: { url: string; key: string; client: SupabaseClient } | null = null;

export function getClient(
  url: string,
  anonKey: string
): SupabaseClient | null {
  const u = url.trim();
  const k = anonKey.trim();
  if (!u || !k) return null;
  if (cached && cached.url === u && cached.key === k) return cached.client;
  const client = createClient(u, k, {
    auth: { persistSession: false, autoRefreshToken: false },
  });
  cached = { url: u, key: k, client };
  return client;
}

export interface PullResult {
  state: SnapshotPayload | null;
  updatedAt: string | null;
}

export async function pullSnapshot(
  client: SupabaseClient,
  syncKey: string
): Promise<PullResult> {
  const { data, error } = await client.rpc("app_get", { k: syncKey });
  if (error) throw new Error(error.message);
  const row = Array.isArray(data) ? data[0] : data;
  if (!row) return { state: null, updatedAt: null };
  return {
    state: row.state as SnapshotPayload,
    updatedAt: row.updated_at as string,
  };
}

export async function pushSnapshot(
  client: SupabaseClient,
  syncKey: string,
  payload: SnapshotPayload
): Promise<string> {
  const { data, error } = await client.rpc("app_set", {
    k: syncKey,
    s: payload,
  });
  if (error) throw new Error(error.message);
  return (data as string) ?? new Date().toISOString();
}

// One-time setup the user pastes into the Supabase SQL editor. No auth.
export const SETUP_SQL = `create table if not exists public.snapshots (
  key text primary key,
  state jsonb not null default '{}'::jsonb,
  updated_at timestamptz not null default now()
);

-- Lock the table: RLS on, no anon policy → table unreachable directly.
alter table public.snapshots enable row level security;

-- Access only via these definer functions, callable with the exact key.
create or replace function public.app_get(k text)
returns table(state jsonb, updated_at timestamptz)
language sql security definer set search_path = public as $$
  select state, updated_at from public.snapshots where key = k;
$$;

create or replace function public.app_set(k text, s jsonb)
returns timestamptz
language plpgsql security definer set search_path = public as $$
declare ts timestamptz := now();
begin
  insert into public.snapshots(key, state, updated_at)
  values (k, s, ts)
  on conflict (key) do update
    set state = excluded.state, updated_at = excluded.updated_at;
  return ts;
end;
$$;

revoke all on function public.app_get(text) from public;
revoke all on function public.app_set(text, jsonb) from public;
grant execute on function public.app_get(text) to anon;
grant execute on function public.app_set(text, jsonb) to anon;`;
