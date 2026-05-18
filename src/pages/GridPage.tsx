import { useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import Layout from "../components/Layout";
import StageRow from "../components/StageRow";
import StatusChip from "../components/StatusChip";
import { STAGES, DIMENSIONS, CELL_BY_ID } from "../data/model";
import { useStore, cellStatus } from "../store/useStore";

export default function GridPage() {
  const nav = useNavigate();
  const [priorityOnly, setPriorityOnly] = useState(true);

  const firstIncomplete = useStore((s) => {
    for (const st of STAGES) {
      const incomplete = DIMENSIONS.some((d) => {
        const id = `${st.id}:${d.id}`;
        return (
          CELL_BY_ID[id].priority && cellStatus(s, id) !== "done"
        );
      });
      if (incomplete) return st.id;
    }
    return STAGES[0].id;
  });

  const [expanded, setExpanded] = useState<string | null>(firstIncomplete);

  const deskStatuses = useStore((s) =>
    STAGES.map((st) => DIMENSIONS.map((d) => cellStatus(s, `${st.id}:${d.id}`)))
  );

  const stages = useMemo(() => STAGES, []);

  return (
    <Layout title="Pengumpulan Data Food Waste">
      <div className="mb-4 flex items-center justify-between">
        <p className="text-[13px] text-ink-dim">
          Ketuk tahap untuk membuka. Isi sel <span className="text-accent">prioritas</span> dulu.
        </p>
        <button
          onClick={() => setPriorityOnly((v) => !v)}
          className={`shrink-0 rounded-full border px-3 py-1.5 text-[12px] font-medium ${
            priorityOnly
              ? "border-accent bg-accent/15 text-ink"
              : "border-line text-ink-dim"
          }`}
        >
          {priorityOnly ? "Prioritas saja ✓" : "Semua sel"}
        </button>
      </div>

      {/* Mobile: vertical stack of collapsible stage rows */}
      <div className="space-y-3 lg:hidden">
        {stages.map((st, i) => (
          <StageRow
            key={st.id}
            stage={st}
            index={i}
            expanded={expanded === st.id}
            onToggle={() => setExpanded(expanded === st.id ? null : st.id)}
            priorityOnly={priorityOnly}
          />
        ))}
      </div>

      {/* Desktop: full 2D matrix */}
      <div className="hidden lg:block">
        <table className="w-full border-separate border-spacing-2">
          <thead>
            <tr>
              <th className="w-40" />
              {DIMENSIONS.map((d) => (
                <th
                  key={d.id}
                  className="px-2 pb-1 text-left text-[13px] font-semibold text-ink-dim"
                >
                  {d.name}
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {stages.map((st, si) => (
              <tr key={st.id}>
                <td className="pr-2 align-top">
                  <div className="text-[15px] font-semibold text-ink">
                    {si + 1}. {st.name}
                  </div>
                  <div className="text-[12px] text-ink-dim">{st.blurb}</div>
                </td>
                {DIMENSIONS.map((d, di) => {
                  const id = `${st.id}:${d.id}`;
                  const meta = CELL_BY_ID[id];
                  const status = deskStatuses[si][di];
                  if (priorityOnly && !meta.priority) {
                    return (
                      <td key={d.id}>
                        <div className="h-full min-h-[64px] rounded-xl border border-dashed border-line/50" />
                      </td>
                    );
                  }
                  return (
                    <td key={d.id}>
                      <button
                        onClick={() => nav(`/cell/${id}`)}
                        className="flex h-full min-h-[64px] w-full items-start gap-2 rounded-xl border border-line bg-raised p-3 text-left hover:border-accent"
                      >
                        <StatusChip
                          glyph={d.initial}
                          status={status}
                          priority={meta.priority}
                        />
                        <span className="text-[12px] leading-snug text-ink-dim">
                          {meta.priority && (
                            <span className="font-semibold text-accent">
                              PRIORITAS ·{" "}
                            </span>
                          )}
                          {status === "done"
                            ? "Selesai"
                            : status === "in_progress"
                            ? "Sedang diisi"
                            : "Belum ada data"}
                        </span>
                      </button>
                    </td>
                  );
                })}
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </Layout>
  );
}
