import { useRef, useState } from "react";
import Layout from "../components/Layout";
import { useStore, isDirty } from "../store/useStore";
import { DEFAULT_SYNTHESIS_PROMPT } from "../data/synthesisPrompt";
import { DEFAULT_MODEL, FALLBACK_MODEL } from "../lib/openrouter";
import { SETUP_SQL } from "../lib/supabase";
import { useSyncRuntime, syncNow, pullNow } from "../lib/sync";

export default function SettingsPage() {
  const settings = useStore((s) => s.settings);
  const setSettings = useStore((s) => s.setSettings);
  const fileRef = useRef<HTMLInputElement>(null);
  const [msg, setMsg] = useState<string | null>(null);

  function exportData() {
    const { cells, answers, syntheses } = useStore.getState();
    const payload = {
      v: 1,
      exportedAt: new Date().toISOString(),
      cells,
      answers,
      syntheses,
      settings: { ...settings, apiKey: "" }, // never export the key
    };
    const blob = new Blob([JSON.stringify(payload, null, 2)], {
      type: "application/json",
    });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `skripsi-foodwaste-backup-${Date.now()}.json`;
    a.click();
    URL.revokeObjectURL(url);
  }

  function importData(file: File) {
    file.text().then((t) => {
      try {
        const d = JSON.parse(t);
        useStore.setState((s) => ({
          cells: d.cells ?? s.cells,
          answers: d.answers ?? s.answers,
          syntheses: d.syntheses ?? s.syntheses,
          settings: {
            ...s.settings,
            ...(d.settings ?? {}),
            apiKey: s.settings.apiKey, // keep current key
          },
        }));
        setMsg("Data berhasil dipulihkan.");
      } catch {
        setMsg("File tidak valid.");
      }
    });
  }

  return (
    <Layout title="Pengaturan">
      <div className="space-y-7">
        <section>
          <label className="mb-1.5 block text-[14px] font-semibold text-ink">
            OpenRouter API Key
          </label>
          <input
            type="password"
            value={settings.apiKey}
            onChange={(e) => setSettings({ apiKey: e.target.value })}
            placeholder="sk-or-..."
            className="h-12 w-full rounded-xl border border-line bg-panel px-3 text-[15px] text-ink outline-none focus:border-accent"
          />
          <p className="mt-1.5 text-[12px] text-ink-dim">
            Disimpan hanya di browser ini (localStorage). Pakai key berlimit
            kecil — key terlihat di sisi klien.
          </p>
        </section>

        <section>
          <label className="mb-1.5 block text-[14px] font-semibold text-ink">
            Model
          </label>
          <div className="mb-2 flex gap-2">
            <button
              onClick={() => setSettings({ model: DEFAULT_MODEL })}
              className={`flex-1 rounded-xl border px-3 py-2 text-[13px] ${
                settings.model === DEFAULT_MODEL
                  ? "border-accent bg-accent/15 text-ink"
                  : "border-line text-ink-dim"
              }`}
            >
              Flash Lite (murah)
            </button>
            <button
              onClick={() => setSettings({ model: FALLBACK_MODEL })}
              className={`flex-1 rounded-xl border px-3 py-2 text-[13px] ${
                settings.model === FALLBACK_MODEL
                  ? "border-accent bg-accent/15 text-ink"
                  : "border-line text-ink-dim"
              }`}
            >
              Flash (lebih kuat)
            </button>
          </div>
          <input
            value={settings.model}
            onChange={(e) => setSettings({ model: e.target.value })}
            className="h-11 w-full rounded-xl border border-line bg-panel px-3 text-[14px] text-ink outline-none focus:border-accent"
          />
        </section>

        <section>
          <label className="mb-1.5 block text-[14px] font-semibold text-ink">
            Sesi observasi (untuk penamaan foto)
          </label>
          <div className="flex gap-2">
            {[1, 2, 3].map((n) => (
              <button
                key={n}
                onClick={() => setSettings({ session: n })}
                className={`h-12 flex-1 rounded-xl border text-[15px] font-semibold ${
                  settings.session === n
                    ? "border-accent bg-accent/15 text-ink"
                    : "border-line text-ink-dim"
                }`}
              >
                Sesi {n}
              </button>
            ))}
          </div>
          <p className="mt-1.5 text-[12px] text-ink-dim">
            Nama foto otomatis: <code>S{settings.session}-tahap-dimensi-n</code>
          </p>
        </section>

        <section>
          <div className="mb-1.5 flex items-center justify-between">
            <label className="text-[14px] font-semibold text-ink">
              Prompt Sintesis (inti kualitas)
            </label>
            <button
              onClick={() =>
                setSettings({ synthesisPrompt: DEFAULT_SYNTHESIS_PROMPT })
              }
              className="text-[12px] text-accent underline"
            >
              Reset default
            </button>
          </div>
          <textarea
            value={settings.synthesisPrompt}
            onChange={(e) => setSettings({ synthesisPrompt: e.target.value })}
            rows={10}
            className="w-full resize-y rounded-xl border border-line bg-panel px-3 py-3 text-[13px] leading-relaxed text-ink outline-none focus:border-accent"
          />
          <p className="mt-1.5 text-[12px] text-ink-dim">
            Sesuaikan kalau dosen pembimbing minta gaya tertentu. Aturan
            anti-mengarang & penanda ⚠️ sebaiknya dipertahankan.
          </p>
        </section>

        <SupabaseSection />

        <section>
          <label className="mb-2 block text-[14px] font-semibold text-ink">
            Cadangan data
          </label>
          <div className="flex flex-wrap gap-2">
            <button
              onClick={exportData}
              className="h-12 flex-1 rounded-xl border border-line text-[14px] text-ink active:bg-panel"
            >
              Export .json
            </button>
            <button
              onClick={() => fileRef.current?.click()}
              className="h-12 flex-1 rounded-xl border border-line text-[14px] text-ink active:bg-panel"
            >
              Import .json
            </button>
            <input
              ref={fileRef}
              type="file"
              accept="application/json"
              hidden
              onChange={(e) => {
                const f = e.target.files?.[0];
                if (f) importData(f);
                e.target.value = "";
              }}
            />
          </div>
          {msg && (
            <p className="mt-2 text-[13px] text-st-done">{msg}</p>
          )}
          <p className="mt-2 text-[12px] text-ink-dim">
            Backup tiap selesai sesi. Data tersimpan di browser — jangan andalkan
            satu device saja untuk data skripsi.
          </p>
        </section>
      </div>
      <div className="h-6" />
    </Layout>
  );
}

function SupabaseSection() {
  const settings = useStore((s) => s.settings);
  const setSettings = useStore((s) => s.setSettings);
  const dirty = useStore(isDirty);
  const lastPushedAt = useStore((s) => s.sync.lastPushedAt);
  const { state, message } = useSyncRuntime();

  const [busy, setBusy] = useState(false);
  const [note, setNote] = useState<string | null>(null);
  const [showSql, setShowSql] = useState(false);

  const configured =
    !!settings.supabaseUrl.trim() &&
    !!settings.supabaseAnonKey.trim() &&
    !!settings.syncKey.trim();

  async function guard(fn: () => Promise<unknown>) {
    setBusy(true);
    setNote(null);
    try {
      const r = await fn();
      if (typeof r === "string") setNote(r);
    } catch (e) {
      setNote(e instanceof Error ? e.message : String(e));
    } finally {
      setBusy(false);
    }
  }

  const status = !configured
    ? "Belum dikonfigurasi"
    : state === "syncing"
    ? "Menyinkronkan…"
    : state === "offline"
    ? "Offline — data aman di perangkat, sinkron otomatis saat online"
    : state === "error"
    ? `Gagal: ${message ?? "tidak diketahui"}`
    : dirty
    ? "Ada perubahan belum tersinkron"
    : lastPushedAt
    ? `Tersinkron ${new Date(lastPushedAt).toLocaleString("id-ID")}`
    : "Siap (belum ada perubahan)";

  const statusColor =
    state === "error"
      ? "text-red-300"
      : state === "offline" || dirty
      ? "text-st-progress"
      : configured
      ? "text-st-done"
      : "text-ink-dim";

  return (
    <section>
      <label className="mb-1.5 block text-[14px] font-semibold text-ink">
        Sinkronisasi Cloud (Supabase)
      </label>
      <p className="mb-3 text-[12px] text-ink-dim">
        Opsional. Cadangan otomatis + akses dari beberapa perangkat. Tetap
        jalan offline — data lokal yang utama.
      </p>

      <p className={`mb-3 text-[13px] font-medium ${statusColor}`}>
        ● {status}
      </p>

      <input
        value={settings.supabaseUrl}
        onChange={(e) => setSettings({ supabaseUrl: e.target.value })}
        placeholder="https://xxxx.supabase.co"
        className="mb-2 h-12 w-full rounded-xl border border-line bg-panel px-3 text-[15px] text-ink outline-none focus:border-accent"
      />
      <input
        type="password"
        value={settings.supabaseAnonKey}
        onChange={(e) => setSettings({ supabaseAnonKey: e.target.value })}
        placeholder="anon public key"
        className="mb-2 h-12 w-full rounded-xl border border-line bg-panel px-3 text-[15px] text-ink outline-none focus:border-accent"
      />
      <p className="mb-3 text-[12px] text-ink-dim">
        Anon key memang dirancang aman di sisi klien. Ambil dari Supabase →
        Project Settings → API.
      </p>

      <label className="mb-1.5 block text-[13px] font-medium text-ink">
        Sync key (rahasia — pakai key yang sama di semua perangkat)
      </label>
      <input
        value={settings.syncKey}
        onChange={(e) => setSettings({ syncKey: e.target.value })}
        placeholder="rahasia panjang & sulit ditebak"
        autoCapitalize="off"
        autoCorrect="off"
        spellCheck={false}
        className="mb-2 h-12 w-full rounded-xl border border-line bg-panel px-3 text-[15px] text-ink outline-none focus:border-accent"
      />
      <div className="mb-3 flex gap-2">
        <button
          onClick={() => setSettings({ syncKey: crypto.randomUUID() })}
          className="h-11 flex-1 rounded-lg border border-line text-[13px] text-ink active:bg-panel"
        >
          Buat key baru
        </button>
        <button
          disabled={!settings.syncKey.trim()}
          onClick={() => {
            navigator.clipboard.writeText(settings.syncKey);
            setNote("Sync key disalin. Tempel di perangkat lain.");
          }}
          className="h-11 flex-1 rounded-lg border border-line text-[13px] text-ink disabled:opacity-40 active:bg-panel"
        >
          Salin key
        </button>
      </div>
      <p className="mb-3 text-[12px] text-ink-dim">
        Siapa pun yang tahu key ini bisa baca/tulis data — perlakukan seperti
        password. Datanya hanya bisa diakses lewat key persis ini (tabel
        terkunci RLS, tanpa login).
      </p>

      <button
        onClick={() => setShowSql((v) => !v)}
        className="mb-2 text-[13px] text-accent underline"
      >
        {showSql
          ? "Sembunyikan"
          : "Setup sekali: SQL (tabel + fungsi, tanpa auth)"}
      </button>
      {showSql && (
        <div className="mb-3">
          <p className="mb-2 text-[12px] text-ink-dim">
            Buka Supabase → SQL Editor → tempel & Run. Tidak perlu setting
            Auth apa pun.
          </p>
          <pre className="max-h-56 overflow-auto rounded-xl border border-line bg-panel p-3 text-[12px] leading-relaxed text-ink">
            {SETUP_SQL}
          </pre>
          <button
            onClick={() => navigator.clipboard.writeText(SETUP_SQL)}
            className="mt-2 rounded-lg border border-line px-3 py-1.5 text-[13px] text-ink active:bg-panel"
          >
            Salin SQL
          </button>
        </div>
      )}

      <div className="flex flex-wrap gap-2">
        <button
          disabled={busy || !configured}
          onClick={() => guard(syncNow)}
          className="h-12 flex-1 rounded-xl bg-accent text-[14px] font-semibold text-bg disabled:opacity-40"
        >
          Sinkron sekarang
        </button>
        <button
          disabled={busy || !configured}
          onClick={() => guard(pullNow)}
          className="h-12 flex-1 rounded-xl border border-line text-[14px] text-ink disabled:opacity-40"
        >
          Tarik dari cloud
        </button>
      </div>
      {note && <p className="mt-2 text-[13px] text-st-progress">{note}</p>}
    </section>
  );
}
