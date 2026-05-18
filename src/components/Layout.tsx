import { ReactNode } from "react";
import { NavLink, useLocation } from "react-router-dom";
import { useStore, cellStatus } from "../store/useStore";
import { CELLS, PRIORITY_COUNT } from "../data/model";

const NAV = [
  { to: "/", label: "Matriks", end: true },
  { to: "/interview", label: "Wawancara", end: false },
  { to: "/synthesis", label: "Sintesis", end: false },
  { to: "/settings", label: "Atur", end: false },
];

export default function Layout({
  title,
  children,
  back,
}: {
  title: string;
  children: ReactNode;
  back?: ReactNode;
}) {
  const { pathname } = useLocation();
  const { done, inProg } = useStore((s) => {
    let done = 0;
    let inProg = 0;
    for (const c of CELLS) {
      if (!c.priority) continue;
      const st = cellStatus(s, c.id);
      if (st === "done") done++;
      else if (st === "in_progress") inProg++;
    }
    return { done, inProg };
  });

  const donePct = (done / PRIORITY_COUNT) * 100;
  const progPct = (inProg / PRIORITY_COUNT) * 100;

  return (
    <div className="flex min-h-full flex-col bg-bg">
      <header className="sticky top-0 z-10 border-b border-line bg-bg/95 backdrop-blur">
        <div className="mx-auto flex w-full max-w-3xl items-center gap-3 px-4 pt-3 pb-2">
          {back}
          <h1 className="flex-1 truncate text-base font-semibold text-ink">
            {title}
          </h1>
        </div>
        <div className="mx-auto w-full max-w-3xl px-4 pb-3">
          <div className="h-1 w-full overflow-hidden rounded-full bg-line">
            <div className="flex h-full">
              <div
                className="bar-fill h-full bg-st-done"
                style={{ width: `${donePct}%` }}
              />
              <div
                className="bar-fill h-full bg-st-progress/60"
                style={{ width: `${progPct}%` }}
              />
            </div>
          </div>
          <p className="mt-1.5 text-[13px] text-ink-dim">
            {done} dari {PRIORITY_COUNT} sel prioritas selesai
            {inProg > 0 && ` · ${inProg} sedang dikerjakan`}
          </p>
        </div>
      </header>

      <main className="mx-auto w-full max-w-3xl flex-1 px-4 pt-4 pb-28">
        {children}
      </main>

      <nav
        className="fixed inset-x-0 bottom-0 z-20 border-t border-line bg-raised"
        style={{ paddingBottom: "env(safe-area-inset-bottom)" }}
      >
        <div className="mx-auto flex w-full max-w-3xl">
          {NAV.map((n) => {
            const active = n.end
              ? pathname === "/" || pathname.startsWith("/cell")
              : pathname.startsWith(n.to);
            return (
              <NavLink
                key={n.to}
                to={n.to}
                end={n.end}
                className="flex h-16 flex-1 flex-col items-center justify-center gap-1"
              >
                <span
                  className={`h-1.5 w-1.5 rounded-full ${
                    active ? "bg-accent" : "bg-transparent"
                  }`}
                />
                <span
                  className={`text-[13px] ${
                    active ? "font-semibold text-ink" : "text-ink-dim"
                  }`}
                >
                  {n.label}
                </span>
              </NavLink>
            );
          })}
        </div>
      </nav>
    </div>
  );
}
