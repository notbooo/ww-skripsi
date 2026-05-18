// Baked-in configuration. The whole app self-configures from this file —
// there are NO setup fields in the UI. Open the site on any device and it
// is already cloud-synced to the same dataset.
//
// NOTE: everything here ships inside the public client bundle (unavoidable
// for a no-backend app). The Supabase anon key is public by design. The
// SYNC_KEY is therefore NOT secret — access is gated only by the obscure
// URL. Accepted tradeoff for a single-purpose personal thesis tool.

export const SUPABASE_URL = "https://xdeysyfubvrgkbzdbpgv.supabase.co";

export const SUPABASE_ANON_KEY =
  "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InhkZXlzeWZ1YnZyZ2tiemRicGd2Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzkxMTkzMjYsImV4cCI6MjA5NDY5NTMyNn0.2IUPyuEGTxeudinH6wFc89mfcxs6xYdHBEBnzS7Dpu4";

// Fixed shared row id. Same on every device → one shared dataset, zero setup.
export const SYNC_KEY = "skripsi-foodwaste-9b3e7d2a6c414f08a5d91e8f2c7b40a6";

// OpenRouter key for AI synthesis (BAB IV). Sourced from a build-time env
// var so the secret never enters git history. Set VITE_OPENROUTER_API_KEY in
// Vercel → Project Settings → Environment Variables (and .env.local for local
// dev). Empty = synthesis disabled; rest of the app is unaffected. It still
// gets inlined into the public bundle — keep the key's spend cap low.
export const OPENROUTER_API_KEY: string =
  import.meta.env.VITE_OPENROUTER_API_KEY ?? "";
