import { useMemo, useState } from "react";
import Layout from "../components/Layout";
import { useStore } from "../store/useStore";
import { OPENROUTER_API_KEY } from "../config";
import {
  CELLS,
  STAGES,
  STAGE_BY_ID,
  cellTitle,
} from "../data/model";
import {
  QUESTIONS_BY_CELL,
  CONTEXT_QUESTIONS,
  INFORMANT_BY_ID,
} from "../data/interviews";
import { buildSynthesisUserContent } from "../data/synthesisPrompt";
import { callOpenRouter } from "../lib/openrouter";

type ScopeKind = "full" | "stage" | "cell";

const PRIORITY_CELLS = CELLS.filter((c) => c.priority);

export default function SynthesisPage() {
  const state = useStore();
  const { model, synthesisPrompt } = state.settings;
  const apiKey = OPENROUTER_API_KEY;

  const [kind, setKind] = useState<ScopeKind>("full");
  const [stageId, setStageId] = useState(STAGES[0].id);
  const [cellId, setCellId] = useState(PRIORITY_CELLS[0].id);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const scopeKey =
    kind === "full" ? "full" : kind === "stage" ? `stage:${stageId}` : cellId;
  const scopeLabel =
    kind === "full"
      ? "BAB IV lengkap (semua tahap)"
      : kind === "stage"
      ? `Tahap: ${STAGE_BY_ID[stageId].name}`
      : `Sel: ${cellTitle(cellId)}`;

  const cached = state.syntheses[scopeKey];

  const blocks = useMemo(() => {
    const cellHasAnswer = (id: string) =>
      (QUESTIONS_BY_CELL[id] ?? []).some((q) => state.answers[q.id]?.trim());

    const targets =
      kind === "full"
        ? CELLS.filter(
            (c) =>
              c.priority ||
              state.cells[c.id]?.notes?.trim() ||
              cellHasAnswer(c.id)
          )
        : kind === "stage"
        ? CELLS.filter((c) => c.stageId === stageId)
        : CELLS.filter((c) => c.id === cellId);

    const cellBlocks = targets.map((c) => {
      const data = state.cells[c.id];
      const interview = (QUESTIONS_BY_CELL[c.id] ?? []).map((q) => ({
        code: INFORMANT_BY_ID[q.informantId].code,
        q: q.text,
        a: state.answers[q.id] ?? "",
      }));
      return {
        heading: cellTitle(c.id),
        priority: c.priority,
        fieldNotes: data?.notes ?? "",
        photoRefs: data?.photoRefs ?? [],
        interview,
      };
    });

    // Profil / persepsi / harapan — only for full or stage scope (informant
    // context informs the whole BAB IV, not a single cell).
    if (kind === "cell") return cellBlocks;
    const ctx = CONTEXT_QUESTIONS.filter((q) =>
      state.answers[q.id]?.trim()
    ).map((q) => ({
      code: INFORMANT_BY_ID[q.informantId].code,
      q: q.text,
      a: state.answers[q.id] ?? "",
    }));
    if (ctx.length === 0) return cellBlocks;
    return [
      {
        heading: "Profil & Konteks Informan (lintas-tahap)",
        priority: false,
        fieldNotes: "",
        photoRefs: [] as string[],
        interview: ctx,
      },
      ...cellBlocks,
    ];
  }, [kind, stageId, cellId, state.cells, state.answers]);

  const hasAnyData = blocks.some(
    (b) => b.fieldNotes.trim() || b.interview.some((i) => i.a.trim())
  );

  async function run() {
    setError(null);
    setBusy(true);
    try {
      const userContent = buildSynthesisUserContent({ scopeLabel, blocks });
      const text = await callOpenRouter(
        apiKey,
        synthesisPrompt,
        userContent,
        model
      );
      state.saveSynthesis(scopeKey, { text, at: Date.now(), model });
    } catch (e) {
      setError(e instanceof Error ? e.message : String(e));
    } finally {
      setBusy(false);
    }
  }

  function download(ext: "md" | "txt") {
    if (!cached) return;
    const blob = new Blob([cached.text], { type: "text/plain" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `BAB4-${scopeKey.replace(/[:]/g, "-")}.${ext}`;
    a.click();
    URL.revokeObjectURL(url);
  }

  const flagCount = cached
    ? (cached.text.match(/⚠️ CATATAN PENGUMPULAN DATA/g) || []).length
    : 0;

  return (
    <Layout title="Sintesis → Draft BAB IV">
      <div className="mb-4 grid grid-cols-3 gap-2">
        {(
          [
            ["full", "BAB IV"],
            ["stage", "Per tahap"],
            ["cell", "Per sel"],
          ] as [ScopeKind, string][]
        ).map(([k, label]) => (
          <button
            key={k}
            onClick={() => setKind(k)}
            className={`h-11 rounded-xl border text-[14px] font-medium ${
              kind === k
                ? "border-accent bg-accent/15 text-ink"
                : "border-line text-ink-dim"
            }`}
          >
            {label}
          </button>
        ))}
      </div>

      {kind === "stage" && (
        <select
          value={stageId}
          onChange={(e) => setStageId(e.target.value)}
          className="mb-4 h-12 w-full rounded-xl border border-line bg-panel px-3 text-[15px] text-ink"
        >
          {STAGES.map((s) => (
            <option key={s.id} value={s.id}>
              {s.name} — {s.en}
            </option>
          ))}
        </select>
      )}
      {kind === "cell" && (
        <select
          value={cellId}
          onChange={(e) => setCellId(e.target.value)}
          className="mb-4 h-12 w-full rounded-xl border border-line bg-panel px-3 text-[15px] text-ink"
        >
          {PRIORITY_CELLS.map((c) => (
            <option key={c.id} value={c.id}>
              {cellTitle(c.id)}
            </option>
          ))}
        </select>
      )}

      <p className="mb-3 text-[13px] text-ink-dim">
        Lingkup: <span className="text-ink">{scopeLabel}</span>
      </p>

      {!apiKey.trim() && (
        <div className="mb-4 rounded-xl border border-st-progress/40 bg-st-progress/10 p-3 text-[13px] text-ink">
          Fitur sintesis AI belum diaktifkan (OpenRouter key belum dipasang
          di build). Pengumpulan data & cadangan cloud tetap berjalan normal.
        </div>
      )}
      {!hasAnyData && (
        <div className="mb-4 rounded-xl border border-line bg-raised p-3 text-[13px] text-ink-dim">
          Belum ada data pada lingkup ini. Sintesis tetap bisa dijalankan —
          hasilnya akan berupa penanda ⚠️ apa yang perlu dikumpulkan.
        </div>
      )}

      <button
        onClick={run}
        disabled={busy || !apiKey.trim()}
        className="h-14 w-full rounded-xl bg-accent text-[16px] font-semibold text-bg disabled:opacity-40"
      >
        {busy ? "Menyusun draft…" : "Susun draft BAB IV"}
      </button>

      {error && (
        <p className="mt-3 rounded-xl border border-red-500/40 bg-red-500/10 p-3 text-[13px] text-red-300">
          {error}
        </p>
      )}

      {cached && (
        <section className="mt-6">
          <div className="mb-2 flex flex-wrap items-center gap-2">
            <span className="text-[12px] text-ink-dim">
              {new Date(cached.at).toLocaleString("id-ID")} · {cached.model}
            </span>
            {flagCount > 0 && (
              <span className="rounded-md bg-st-progress/20 px-2 py-0.5 text-[12px] font-semibold text-st-progress">
                {flagCount} catatan pengumpulan data
              </span>
            )}
            <span className="flex-1" />
            <button
              onClick={() => navigator.clipboard.writeText(cached.text)}
              className="rounded-lg border border-line px-3 py-1.5 text-[13px] text-ink active:bg-panel"
            >
              Salin
            </button>
            <button
              onClick={() => download("md")}
              className="rounded-lg border border-line px-3 py-1.5 text-[13px] text-ink active:bg-panel"
            >
              .md
            </button>
            <button
              onClick={() => download("txt")}
              className="rounded-lg border border-line px-3 py-1.5 text-[13px] text-ink active:bg-panel"
            >
              .txt
            </button>
          </div>
          <article className="whitespace-pre-wrap rounded-xl border border-line bg-raised p-4 text-[15px] leading-relaxed text-ink">
            {cached.text}
          </article>
        </section>
      )}
      <div className="h-6" />
    </Layout>
  );
}
