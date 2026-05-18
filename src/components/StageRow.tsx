import { useNavigate } from "react-router-dom";
import { Stage, DIMENSIONS, CELL_BY_ID } from "../data/model";
import { useStore, cellStatus } from "../store/useStore";
import StatusChip from "./StatusChip";

const isPriority = (stageId: string, dimId: string): boolean =>
  !!CELL_BY_ID[`${stageId}:${dimId}`]?.priority;

export default function StageRow({
  stage,
  index,
  expanded,
  onToggle,
  priorityOnly,
}: {
  stage: Stage;
  index: number;
  expanded: boolean;
  onToggle: () => void;
  priorityOnly: boolean;
}) {
  const nav = useNavigate();
  const statuses = useStore((s) =>
    DIMENSIONS.map((d) => cellStatus(s, `${stage.id}:${d.id}`))
  );

  return (
    <div className="overflow-hidden rounded-2xl border border-line bg-raised">
      <button
        onClick={onToggle}
        className="flex h-16 w-full items-center gap-2.5 px-3 text-left"
        aria-expanded={expanded}
      >
        <span
          className={`shrink-0 text-ink-dim transition-transform ${
            expanded ? "rotate-90" : ""
          }`}
          aria-hidden
        >
          ▸
        </span>
        <span className="min-w-0 flex-1 text-[18px] font-semibold leading-tight text-ink">
          {index + 1}. {stage.name}
        </span>
        <span className="flex shrink-0 items-center gap-1.5">
          {DIMENSIONS.map((d, i) => (
            <StatusChip
              key={d.id}
              glyph={d.initial}
              status={statuses[i]}
              priority={isPriority(stage.id, d.id)}
            />
          ))}
        </span>
      </button>

      {expanded && (
        <ul className="border-t border-line">
          {DIMENSIONS.map((d, i) => {
            const id = `${stage.id}:${d.id}`;
            const prio = isPriority(stage.id, d.id);
            if (priorityOnly && !prio) return null;
            return (
              <li key={d.id}>
                <button
                  onClick={() => nav(`/cell/${id}`)}
                  className="flex min-h-[56px] w-full items-center gap-3 px-4 py-3 text-left active:bg-panel"
                >
                  <StatusChip
                    glyph={d.initial}
                    status={statuses[i]}
                    priority={prio}
                  />
                  <span className="flex-1">
                    <span className="block text-[16px] text-ink">
                      {d.name}
                      {prio && (
                        <span className="ml-2 align-middle text-[10px] font-semibold text-accent">
                          PRIORITAS
                        </span>
                      )}
                    </span>
                    <span className="block text-[12px] leading-snug text-ink-dim">
                      {d.hint}
                    </span>
                  </span>
                  <span className="text-ink-dim" aria-hidden>
                    ›
                  </span>
                </button>
              </li>
            );
          })}
        </ul>
      )}
    </div>
  );
}
