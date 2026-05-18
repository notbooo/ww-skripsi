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

// Paste an OpenRouter key here to enable AI synthesis (BAB IV). Leave "" to
// disable synthesis. Anyone with the site can spend this key — set a hard
// monthly spend limit on it in the OpenRouter dashboard.
export const OPENROUTER_API_KEY = "";
