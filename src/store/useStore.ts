import { create } from "zustand";
import { persist } from "zustand/middleware";
import { QUESTIONS_BY_CELL } from "../data/interviews";
import { DEFAULT_SYNTHESIS_PROMPT } from "../data/synthesisPrompt";
import { DEFAULT_MODEL } from "../lib/openrouter";
import type { SnapshotPayload } from "../lib/supabase";

export type Status = "empty" | "in_progress" | "done";

interface CellData {
  notes: string;
  photoRefs: string[];
  doneOverride: boolean;
}

interface Settings {
  apiKey: string;
  model: string;
  session: number; // 1..3, drives photo-ref naming
  synthesisPrompt: string;
  // Cloud sync (optional, no auth). Not part of the synced snapshot.
  supabaseUrl: string;
  supabaseAnonKey: string;
  syncKey: string; // unguessable secret = the row id; same key across devices
}

interface Synthesis {
  text: string;
  at: number;
  model: string;
}

interface Sync {
  cloudUpdatedAt: string | null; // remote updated_at we last reconciled
  lastLocalEditAt: number | null; // last syncable mutation
  lastPushedAt: number | null; // last successful push/pull
}

interface State {
  cells: Record<string, CellData>;
  answers: Record<string, string>;
  settings: Settings;
  syntheses: Record<string, Synthesis>;
  sync: Sync;

  cell: (id: string) => CellData;
  setNotes: (id: string, notes: string) => void;
  addPhotoRef: (id: string, ref: string) => void;
  updatePhotoRef: (id: string, i: number, ref: string) => void;
  removePhotoRef: (id: string, i: number) => void;
  setAnswer: (qid: string, text: string) => void;
  toggleDone: (id: string) => void;
  setSettings: (patch: Partial<Settings>) => void;
  saveSynthesis: (scopeKey: string, s: Synthesis) => void;

  snapshot: () => SnapshotPayload;
  applyRemote: (p: SnapshotPayload, cloudUpdatedAt: string) => void;
  afterPush: (cloudUpdatedAt: string) => void;
  noteLocalEdit: () => void;
}

const EMPTY_CELL: CellData = { notes: "", photoRefs: [], doneOverride: false };

const DEFAULT_SETTINGS: Settings = {
  apiKey: "",
  model: DEFAULT_MODEL,
  session: 1,
  synthesisPrompt: DEFAULT_SYNTHESIS_PROMPT,
  supabaseUrl: "",
  supabaseAnonKey: "",
  syncKey: "",
};

export const useStore = create<State>()(
  persist(
    (set, get) => ({
      cells: {},
      answers: {},
      syntheses: {},
      settings: { ...DEFAULT_SETTINGS },
      sync: { cloudUpdatedAt: null, lastLocalEditAt: null, lastPushedAt: null },

      cell: (id) => get().cells[id] ?? EMPTY_CELL,

      setNotes: (id, notes) =>
        set((s) => ({
          cells: { ...s.cells, [id]: { ...(s.cells[id] ?? EMPTY_CELL), notes } },
        })),

      addPhotoRef: (id, ref) =>
        set((s) => {
          const c = s.cells[id] ?? EMPTY_CELL;
          return {
            cells: {
              ...s.cells,
              [id]: { ...c, photoRefs: [...c.photoRefs, ref] },
            },
          };
        }),

      updatePhotoRef: (id, i, ref) =>
        set((s) => {
          const c = s.cells[id] ?? EMPTY_CELL;
          const photoRefs = c.photoRefs.slice();
          photoRefs[i] = ref;
          return { cells: { ...s.cells, [id]: { ...c, photoRefs } } };
        }),

      removePhotoRef: (id, i) =>
        set((s) => {
          const c = s.cells[id] ?? EMPTY_CELL;
          return {
            cells: {
              ...s.cells,
              [id]: {
                ...c,
                photoRefs: c.photoRefs.filter((_, idx) => idx !== i),
              },
            },
          };
        }),

      setAnswer: (qid, text) =>
        set((s) => ({ answers: { ...s.answers, [qid]: text } })),

      toggleDone: (id) =>
        set((s) => {
          const c = s.cells[id] ?? EMPTY_CELL;
          return {
            cells: {
              ...s.cells,
              [id]: { ...c, doneOverride: !c.doneOverride },
            },
          };
        }),

      setSettings: (patch) =>
        set((s) => ({ settings: { ...s.settings, ...patch } })),

      saveSynthesis: (scopeKey, sy) =>
        set((s) => ({ syntheses: { ...s.syntheses, [scopeKey]: sy } })),

      snapshot: () => {
        const s = get();
        return {
          cells: s.cells,
          answers: s.answers,
          syntheses: s.syntheses,
          settings: {
            model: s.settings.model,
            session: s.settings.session,
            synthesisPrompt: s.settings.synthesisPrompt,
          },
        };
      },

      applyRemote: (p, cloudUpdatedAt) =>
        set((s) => ({
          cells: (p.cells as State["cells"]) ?? {},
          answers: (p.answers as State["answers"]) ?? {},
          syntheses: (p.syntheses as State["syntheses"]) ?? {},
          settings: {
            ...s.settings, // keep local secrets/creds
            model: p.settings?.model ?? s.settings.model,
            session: p.settings?.session ?? s.settings.session,
            synthesisPrompt:
              p.settings?.synthesisPrompt ?? s.settings.synthesisPrompt,
          },
          sync: {
            cloudUpdatedAt,
            lastPushedAt: Date.now(),
            lastLocalEditAt: null,
          },
        })),

      afterPush: (cloudUpdatedAt) =>
        set((s) => ({
          sync: { ...s.sync, cloudUpdatedAt, lastPushedAt: Date.now() },
        })),

      noteLocalEdit: () =>
        set((s) => ({ sync: { ...s.sync, lastLocalEditAt: Date.now() } })),
    }),
    {
      name: "skripsi-foodwaste-v1",
      version: 1,
      // `merge` runs on every rehydrate regardless of version, so it (not a
      // version bump) handles schema evolution — backfilling new settings/sync
      // fields onto pre-existing data without ever discarding it.
      merge: (persisted, current) => {
        const p = (persisted ?? {}) as Partial<State>;
        return {
          ...current,
          ...p,
          settings: { ...DEFAULT_SETTINGS, ...(p.settings ?? {}) },
          sync: {
            ...current.sync,
            ...(p.sync ?? {}),
          },
        };
      },
    }
  )
);

export function isDirty(s: State): boolean {
  const { lastLocalEditAt, lastPushedAt } = s.sync;
  if (!lastLocalEditAt) return false;
  if (!lastPushedAt) return true;
  return lastLocalEditAt > lastPushedAt;
}

// Status is derived, never stored: a cell counts as touched if it has notes
// or any linked interview answer; explicit "done" overrides.
export function cellStatus(state: State, cellId: string): Status {
  const c = state.cells[cellId];
  if (c?.doneOverride) return "done";
  const hasNotes = !!c?.notes.trim();
  const linked = QUESTIONS_BY_CELL[cellId] ?? [];
  const hasAnswer = linked.some((q) => state.answers[q.id]?.trim());
  return hasNotes || hasAnswer ? "in_progress" : "empty";
}

export function useCellStatus(cellId: string): Status {
  return useStore((s) => cellStatus(s, cellId));
}
