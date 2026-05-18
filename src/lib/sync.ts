import { useEffect } from "react";
import { create } from "zustand";
import { useStore, isDirty } from "../store/useStore";
import {
  getClient,
  pullSnapshot,
  pushSnapshot,
  type SnapshotPayload,
} from "./supabase";
import { SUPABASE_URL, SUPABASE_ANON_KEY, SYNC_KEY } from "../config";

type SyncState = "off" | "idle" | "syncing" | "offline" | "error";

interface SyncRuntime {
  state: SyncState;
  message: string | null;
  set: (p: Partial<Omit<SyncRuntime, "set">>) => void;
}

export const useSyncRuntime = create<SyncRuntime>((set) => ({
  state: "off",
  message: null,
  set: (p) => set(p),
}));

const rt = () => useSyncRuntime.getState();
const st = () => useStore.getState();

let applyingRemote = false;
let pushTimer: ReturnType<typeof setTimeout> | null = null;

function ctx() {
  const client = getClient(SUPABASE_URL, SUPABASE_ANON_KEY);
  const key = SYNC_KEY.trim();
  if (!client || !key) return null;
  return { client, key };
}

function fail(e: unknown) {
  const msg = e instanceof Error ? e.message : String(e);
  // Network failures are non-fatal: data is safe in localStorage.
  const offline = /fetch|network|Failed to fetch|ERR_/i.test(msg);
  rt().set({ state: offline ? "offline" : "error", message: msg });
}

async function doPush(force = false): Promise<void> {
  const c = ctx();
  if (!c) return;
  if (!force && !isDirty(st())) return;
  rt().set({ state: "syncing", message: null });
  try {
    const updatedAt = await pushSnapshot(c.client, c.key, st().snapshot());
    st().afterPush(updatedAt);
    rt().set({ state: "idle", message: null });
  } catch (e) {
    fail(e);
  }
}

function applyRemote(p: SnapshotPayload, updatedAt: string) {
  applyingRemote = true;
  st().applyRemote(p, updatedAt);
  applyingRemote = false;
}

async function reconcile(): Promise<void> {
  const c = ctx();
  if (!c) {
    rt().set({ state: "off", message: null });
    return;
  }
  rt().set({ state: "syncing", message: null });
  try {
    const { state: remote, updatedAt } = await pullSnapshot(c.client, c.key);
    const known = st().sync.cloudUpdatedAt;

    if (!remote || !updatedAt) {
      await doPush(true); // first time: seed the cloud row
      return;
    }
    const remoteNewer =
      known == null || new Date(updatedAt) > new Date(known);

    if (!remoteNewer) {
      if (isDirty(st())) await doPush();
      else rt().set({ state: "idle", message: null });
      return;
    }
    if (isDirty(st())) {
      const useCloud = window.confirm(
        "Data di cloud lebih baru, tapi ada perubahan lokal yang belum tersinkron.\n\n" +
          "OK = pakai data cloud (perubahan lokal yang belum tersinkron hilang)\n" +
          "Batal = pertahankan data perangkat ini & timpa cloud"
      );
      if (useCloud) {
        applyRemote(remote, updatedAt);
        rt().set({ state: "idle", message: null });
      } else {
        await doPush(true);
      }
    } else {
      applyRemote(remote, updatedAt);
      rt().set({ state: "idle", message: null });
    }
  } catch (e) {
    fail(e);
  }
}

function schedulePush() {
  if (pushTimer) clearTimeout(pushTimer);
  pushTimer = setTimeout(() => {
    pushTimer = null;
    void doPush();
  }, 4000);
}

// ---- Imperative API used by Settings ----

export async function syncNow(): Promise<void> {
  if (!ctx()) throw new Error("Isi Supabase URL, anon key & sync key dulu.");
  await doPush(true);
}

export async function pullNow(): Promise<void> {
  const c = ctx();
  if (!c) throw new Error("Isi Supabase URL, anon key & sync key dulu.");
  if (
    isDirty(st()) &&
    !window.confirm(
      "Tarik data cloud dan timpa data perangkat ini? Perubahan lokal yang belum tersinkron akan hilang."
    )
  )
    return;
  rt().set({ state: "syncing", message: null });
  try {
    const { state: remote, updatedAt } = await pullSnapshot(c.client, c.key);
    if (remote && updatedAt) {
      applyRemote(remote, updatedAt);
      rt().set({ state: "idle", message: null });
    } else {
      rt().set({ state: "idle", message: "Belum ada data di cloud." });
    }
  } catch (e) {
    fail(e);
  }
}

// ---- Hook mounted once at app root ----

export function useCloudSync(): void {
  useEffect(() => {
    // Config is baked in, so sync always runs — no setup, no gating.
    if (ctx()) void reconcile();
    else rt().set({ state: "off", message: null });
  }, []);

  useEffect(() => {
    const unsub = useStore.subscribe((s, prev) => {
      if (applyingRemote) return;
      const changed =
        s.cells !== prev.cells ||
        s.answers !== prev.answers ||
        s.syntheses !== prev.syntheses ||
        s.settings.model !== prev.settings.model ||
        s.settings.session !== prev.settings.session ||
        s.settings.synthesisPrompt !== prev.settings.synthesisPrompt;
      if (!changed) return;
      st().noteLocalEdit();
      if (ctx()) schedulePush();
    });
    return unsub;
  }, []);

  useEffect(() => {
    const flush = () => {
      if (document.visibilityState === "hidden") {
        if (pushTimer) {
          clearTimeout(pushTimer);
          pushTimer = null;
        }
        void doPush();
      }
    };
    document.addEventListener("visibilitychange", flush);
    window.addEventListener("pagehide", flush);
    return () => {
      document.removeEventListener("visibilitychange", flush);
      window.removeEventListener("pagehide", flush);
    };
  }, []);
}
