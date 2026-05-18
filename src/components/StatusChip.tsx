import type { Status } from "../store/useStore";

// 28×28 rounded chip. Distinguished by hue AND fill/shape so it reads at a
// glance in a dark bar, even with night vision or red–green CVD.
export default function StatusChip({
  glyph,
  status,
  priority,
  size = 28,
}: {
  glyph: string;
  status: Status;
  priority: boolean;
  size?: number;
}) {
  const base =
    "relative inline-flex items-center justify-center rounded-md font-semibold select-none";
  const cls =
    status === "done"
      ? "bg-st-done text-bg border border-st-done"
      : status === "in_progress"
      ? "bg-st-progress text-bg border border-st-progress"
      : "bg-transparent text-st-empty border border-st-empty";

  return (
    <span
      className={`${base} ${cls}`}
      style={{ width: size, height: size, fontSize: 12 }}
      aria-label={`${glyph} ${status}`}
    >
      {priority && (
        <span
          className="absolute left-0 top-1/2 -translate-y-1/2 rounded-l bg-accent"
          style={{ width: 2, height: size - 8 }}
          aria-hidden
        />
      )}
      {glyph}
    </span>
  );
}
