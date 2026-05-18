// Domain model for the food-waste data collection matrix.
// 8 lifecycle stages × 4 analytical dimensions = 32 cells; 16 flagged priority.
// Cell id format = `${stageId}:${dimensionId}` (matches deep-link URLs).

export type DimensionId = "praktik" | "penyebab" | "volume" | "pengelolaan";

export interface Dimension {
  id: DimensionId;
  initial: string; // single-letter chip glyph
  name: string;
  hint: string; // what to actually capture, plain language
}

export interface Stage {
  id: string;
  name: string;
  en: string;
  blurb: string;
}

export const DIMENSIONS: Dimension[] = [
  {
    id: "praktik",
    initial: "P",
    name: "Praktik & Prosedur",
    hint: "Apa yang benar-benar dilakukan di tahap ini? SOP, kebiasaan, siapa yang pegang.",
  },
  {
    id: "penyebab",
    initial: "S",
    name: "Penyebab Waste",
    hint: "Dari mana waste muncul di tahap ini? Kenapa bisa terjadi?",
  },
  {
    id: "volume",
    initial: "V",
    name: "Volume & Jenis",
    hint: "Kira-kira seberapa banyak? Avoidable / partially / unavoidable? Estimasi kasar OK.",
  },
  {
    id: "pengelolaan",
    initial: "M",
    name: "Pengelolaan Saat Ini",
    hint: "Sekarang ditangani bagaimana? Dikurangi / dipakai ulang / dibuang ke mana?",
  },
];

export const STAGES: Stage[] = [
  {
    id: "pengadaan",
    name: "Pengadaan",
    en: "Procurement",
    blurb: "Perencanaan & pembelian bahan baku.",
  },
  {
    id: "penerimaan",
    name: "Penerimaan",
    en: "Receiving",
    blurb: "Barang datang, pengecekan kualitas & kuantitas.",
  },
  {
    id: "penyimpanan",
    name: "Penyimpanan",
    en: "Storage",
    blurb: "Chiller, freezer, dry store, rotasi FIFO.",
  },
  {
    id: "persiapan",
    name: "Persiapan",
    en: "Preparation",
    blurb: "Trimming, portioning, mise en place.",
  },
  {
    id: "pengolahan",
    name: "Pengolahan",
    en: "Cooking",
    blurb: "Proses masak / produksi menu.",
  },
  {
    id: "penyajian",
    name: "Penyajian",
    en: "Plating & Service",
    blurb: "Plating, garnish, penyajian ke tamu.",
  },
  {
    id: "konsumsi",
    name: "Konsumsi",
    en: "Consumption",
    blurb: "Sisa di piring tamu (plate waste).",
  },
  {
    id: "pembuangan",
    name: "Pembuangan",
    en: "Disposal",
    blurb: "Jalur pembuangan akhir & pemanfaatan.",
  },
];

// Priority = the 16 cells that carry the thesis argument.
// Disposal has 3 (the whole "current management" half lives there).
const PRIORITY = new Set<string>([
  "pengadaan:penyebab",
  "penerimaan:praktik",
  "penerimaan:penyebab",
  "penyimpanan:praktik",
  "penyimpanan:penyebab",
  "penyimpanan:pengelolaan",
  "persiapan:penyebab",
  "persiapan:volume",
  "pengolahan:penyebab",
  "pengolahan:volume",
  "penyajian:penyebab",
  "konsumsi:volume",
  "konsumsi:pengelolaan",
  "pembuangan:praktik",
  "pembuangan:volume",
  "pembuangan:pengelolaan",
]);

export interface CellMeta {
  id: string;
  stageId: string;
  dimensionId: DimensionId;
  priority: boolean;
}

export const CELLS: CellMeta[] = STAGES.flatMap((s) =>
  DIMENSIONS.map((d) => {
    const id = `${s.id}:${d.id}`;
    return { id, stageId: s.id, dimensionId: d.id, priority: PRIORITY.has(id) };
  })
);

export const CELL_BY_ID: Record<string, CellMeta> = Object.fromEntries(
  CELLS.map((c) => [c.id, c])
);

export const STAGE_BY_ID: Record<string, Stage> = Object.fromEntries(
  STAGES.map((s) => [s.id, s])
);

export const DIM_BY_ID: Record<DimensionId, Dimension> = Object.fromEntries(
  DIMENSIONS.map((d) => [d.id, d])
) as Record<DimensionId, Dimension>;

export const PRIORITY_COUNT = CELLS.filter((c) => c.priority).length; // 16

export function cellTitle(id: string): string {
  const c = CELL_BY_ID[id];
  if (!c) return id;
  return `${STAGE_BY_ID[c.stageId].name} · ${DIM_BY_ID[c.dimensionId].name}`;
}
