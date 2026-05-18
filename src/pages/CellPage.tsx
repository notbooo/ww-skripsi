import { useMemo, useState } from "react";
import { useNavigate, useParams, Link } from "react-router-dom";
import Layout from "../components/Layout";
import AutoTextarea from "../components/AutoTextarea";
import {
  CELL_BY_ID,
  STAGE_BY_ID,
  DIM_BY_ID,
  CELLS,
  cellTitle,
} from "../data/model";
import { QUESTIONS_BY_CELL, INFORMANT_BY_ID } from "../data/interviews";
import { useStore, useCellStatus } from "../store/useStore";

const PRIORITY_ORDER = CELLS.filter((c) => c.priority).map((c) => c.id);

function nowHM() {
  return new Date().toLocaleTimeString("id-ID", {
    hour: "2-digit",
    minute: "2-digit",
  });
}

export default function CellPage() {
  const { cellId = "" } = useParams();
  const nav = useNavigate();
  const meta = CELL_BY_ID[cellId];

  const cell = useStore((s) => s.cell(cellId));
  const setNotes = useStore((s) => s.setNotes);
  const addPhotoRef = useStore((s) => s.addPhotoRef);
  const updatePhotoRef = useStore((s) => s.updatePhotoRef);
  const removePhotoRef = useStore((s) => s.removePhotoRef);
  const toggleDone = useStore((s) => s.toggleDone);
  const session = useStore((s) => s.settings.session);
  const answers = useStore((s) => s.answers);
  const status = useCellStatus(cellId);

  const [savedAt, setSavedAt] = useState<string | null>(null);

  const idx = useMemo(() => PRIORITY_ORDER.indexOf(cellId), [cellId]);
  const prevId = idx > 0 ? PRIORITY_ORDER[idx - 1] : null;
  const nextId =
    idx >= 0 && idx < PRIORITY_ORDER.length - 1
      ? PRIORITY_ORDER[idx + 1]
      : null;

  if (!meta) {
    return (
      <Layout title="Sel tidak ditemukan">
        <p className="text-ink-dim">
          Sel ini tidak ada.{" "}
          <Link to="/" className="text-accent underline">
            Kembali ke matriks
          </Link>
        </p>
      </Layout>
    );
  }

  const stage = STAGE_BY_ID[meta.stageId];
  const dim = DIM_BY_ID[meta.dimensionId];
  const linked = QUESTIONS_BY_CELL[cellId] ?? [];
  const safeId = cellId.replace(/:/g, "-");

  return (
    <Layout
      title={cellTitle(cellId)}
      back={
        <button
          onClick={() => nav("/")}
          className="-ml-1 flex h-9 w-9 items-center justify-center rounded-lg text-ink-dim active:bg-panel"
          aria-label="Kembali"
        >
          ‹
        </button>
      }
    >
      <div className="mb-4">
        <div className="flex flex-wrap items-center gap-2">
          <span className="rounded-md bg-panel px-2 py-0.5 text-[12px] text-ink-dim">
            {stage.name} · {stage.en}
          </span>
          {meta.priority && (
            <span className="rounded-md bg-accent/15 px-2 py-0.5 text-[12px] font-semibold text-accent">
              PRIORITAS
            </span>
          )}
          <span
            className={`rounded-md px-2 py-0.5 text-[12px] ${
              status === "done"
                ? "bg-st-done/20 text-st-done"
                : status === "in_progress"
                ? "bg-st-progress/20 text-st-progress"
                : "bg-line/40 text-ink-dim"
            }`}
          >
            {status === "done"
              ? "Selesai"
              : status === "in_progress"
              ? "Sedang diisi"
              : "Belum ada data"}
          </span>
        </div>
        <h2 className="mt-3 text-[20px] font-semibold text-ink">{dim.name}</h2>
        <p className="mt-1 text-[14px] leading-snug text-ink-dim">{dim.hint}</p>
      </div>

      <label className="mb-1.5 flex items-center justify-between text-[13px] text-ink-dim">
        <span>Catatan lapangan / observasi</span>
        <span className="text-[12px]">
          {savedAt ? `Tersimpan ${savedAt}` : "Tersimpan otomatis"}
        </span>
      </label>
      <AutoTextarea
        value={cell.notes}
        onChange={(v) => {
          setNotes(cellId, v);
          setSavedAt(nowHM());
        }}
        minRows={7}
        ariaLabel="Catatan lapangan"
        placeholder="Dikte saja, campur Indonesia/Inggris nggak apa-apa. Mis: chef bilang ayam 3-5 hari di freezer kadang lebih kalau booking sepi…"
      />

      <section className="mt-6">
        <div className="mb-2 flex items-center justify-between">
          <h3 className="text-[14px] font-semibold text-ink">
            Dokumentasi foto
          </h3>
          <button
            onClick={() =>
              addPhotoRef(
                cellId,
                `S${session}-${safeId}-${cell.photoRefs.length + 1}`
              )
            }
            className="rounded-lg border border-line px-3 py-1.5 text-[13px] text-ink active:bg-panel"
          >
            + Tambah ref
          </button>
        </div>
        <p className="mb-2 text-[12px] text-ink-dim">
          Foto tetap di HP. Simpan nama filenya saja (auto: sesi {session}).
        </p>
        {cell.photoRefs.length === 0 && (
          <p className="text-[13px] text-ink-dim/70">Belum ada referensi foto.</p>
        )}
        <ul className="space-y-2">
          {cell.photoRefs.map((ref, i) => (
            <li key={i} className="flex items-center gap-2">
              <input
                value={ref}
                onChange={(e) => updatePhotoRef(cellId, i, e.target.value)}
                className="min-h-[44px] flex-1 rounded-lg border border-line bg-panel px-3 text-[15px] text-ink outline-none focus:border-accent"
              />
              <button
                onClick={() => removePhotoRef(cellId, i)}
                className="flex h-11 w-11 items-center justify-center rounded-lg text-ink-dim active:bg-panel"
                aria-label="Hapus"
              >
                ✕
              </button>
            </li>
          ))}
        </ul>
      </section>

      {linked.length > 0 && (
        <section className="mt-6">
          <h3 className="mb-2 text-[14px] font-semibold text-ink">
            Wawancara terkait sel ini
          </h3>
          <ul className="space-y-2">
            {linked.map((q) => {
              const inf = INFORMANT_BY_ID[q.informantId];
              const a = answers[q.id]?.trim();
              return (
                <li
                  key={q.id}
                  className="rounded-xl border border-line bg-raised p-3"
                >
                  <div className="mb-1 flex items-center justify-between">
                    <span className="text-[12px] font-semibold text-accent">
                      {inf.code}
                    </span>
                    <Link
                      to={`/interview/${q.informantId}`}
                      className="text-[12px] text-ink-dim underline"
                    >
                      {a ? "Ubah jawaban" : "Jawab di Wawancara"}
                    </Link>
                  </div>
                  <p className="text-[14px] text-ink">{q.text}</p>
                  {a && (
                    <p className="mt-2 border-l-2 border-line pl-3 text-[14px] text-ink-dim">
                      {a}
                    </p>
                  )}
                </li>
              );
            })}
          </ul>
        </section>
      )}

      <div className="h-24" />

      <div
        className="fixed inset-x-0 z-20 border-t border-line bg-bg/95 backdrop-blur"
        style={{ bottom: "calc(64px + env(safe-area-inset-bottom))" }}
      >
        <div className="mx-auto flex w-full max-w-3xl items-center gap-2 px-4 py-3">
          <button
            disabled={!prevId}
            onClick={() => prevId && nav(`/cell/${prevId}`)}
            className="h-12 rounded-xl border border-line px-4 text-[14px] text-ink disabled:opacity-30"
          >
            ‹ Prev
          </button>
          <button
            onClick={() => toggleDone(cellId)}
            className={`h-12 flex-1 rounded-xl text-[15px] font-semibold ${
              cell.doneOverride
                ? "border border-st-done bg-st-done/15 text-st-done"
                : "bg-st-done text-bg"
            }`}
          >
            {cell.doneOverride ? "✓ Selesai (ketuk batal)" : "Tandai selesai"}
          </button>
          <button
            disabled={!nextId}
            onClick={() => nextId && nav(`/cell/${nextId}`)}
            className="h-12 rounded-xl border border-line px-4 text-[14px] text-ink disabled:opacity-30"
          >
            Next ›
          </button>
        </div>
      </div>
    </Layout>
  );
}
