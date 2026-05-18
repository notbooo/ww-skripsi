/** @type {import('tailwindcss').Config} */
export default {
  darkMode: "class",
  content: ["./index.html", "./src/**/*.{ts,tsx}"],
  theme: {
    extend: {
      colors: {
        // Dark-bar palette (see README §UX). Tuned for a dark-adapted eye.
        bg: "#0B0F14",
        raised: "#161B22",
        panel: "#1C2230",
        line: "#2A313C",
        ink: "#D6DCE5",
        "ink-dim": "#8A93A2",
        accent: "#4B82C4",
        // Status
        "st-empty": "#3A424F",
        "st-progress": "#C9963F",
        "st-done": "#3E9D78",
      },
      fontSize: {
        base: ["17px", "1.5"],
        note: ["18px", "1.55"],
      },
      spacing: {
        safe: "env(safe-area-inset-bottom)",
      },
    },
  },
  plugins: [],
};
