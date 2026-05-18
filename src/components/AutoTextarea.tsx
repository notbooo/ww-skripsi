import { useLayoutEffect, useRef } from "react";

interface Props {
  value: string;
  onChange: (v: string) => void;
  placeholder?: string;
  minRows?: number;
  ariaLabel?: string;
}

// Plain textarea = native iOS/Android voice-dictation works with zero effort.
// Auto-grows so a long dictated paragraph never scrolls out from under the
// thumb. No modal, no resize handle, no focus traps.
export default function AutoTextarea({
  value,
  onChange,
  placeholder,
  minRows = 5,
  ariaLabel,
}: Props) {
  const ref = useRef<HTMLTextAreaElement>(null);

  useLayoutEffect(() => {
    const el = ref.current;
    if (!el) return;
    el.style.height = "auto";
    el.style.height = `${el.scrollHeight}px`;
  }, [value]);

  return (
    <textarea
      ref={ref}
      value={value}
      onChange={(e) => onChange(e.target.value)}
      placeholder={placeholder}
      aria-label={ariaLabel}
      rows={minRows}
      autoCapitalize="sentences"
      autoCorrect="on"
      spellCheck
      className="w-full resize-none rounded-xl border border-line bg-panel px-4 py-3.5 text-note text-ink placeholder:text-ink-dim/60 outline-none focus:border-accent"
    />
  );
}
