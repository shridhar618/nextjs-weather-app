"use client";

import { useEffect, useState } from "react";
import { load, save } from "@/lib/storage";

export const THEME_KEY = "weather:theme";

// "auto" follows the device setting (handled in CSS by prefers-color-scheme);
// "light" / "dark" are forced by setting data-theme on <html>.
export function applyTheme(theme) {
  const root = document.documentElement;
  if (theme === "light" || theme === "dark") root.dataset.theme = theme;
  else delete root.dataset.theme;
}

const OPTIONS = [
  {
    value: "auto",
    label: "Auto (match device)",
    icon: (
      <>
        <circle cx="12" cy="12" r="8" fill="none" stroke="currentColor" strokeWidth="2" />
        <path d="M12 4a8 8 0 0 1 0 16z" fill="currentColor" />
      </>
    ),
  },
  {
    value: "light",
    label: "Light",
    icon: (
      <>
        <circle cx="12" cy="12" r="4" fill="currentColor" />
        <path
          d="M12 2v2M12 20v2M2 12h2M20 12h2M4.9 4.9l1.4 1.4M17.7 17.7l1.4 1.4M4.9 19.1l1.4-1.4M17.7 6.3l1.4-1.4"
          stroke="currentColor"
          strokeWidth="2"
          strokeLinecap="round"
        />
      </>
    ),
  },
  {
    value: "dark",
    label: "Dark",
    icon: <path d="M20 14.5A8 8 0 0 1 9.5 4a8 8 0 1 0 10.5 10.5z" fill="currentColor" />,
  },
];

export default function ThemeToggle() {
  const [theme, setTheme] = useState("auto");

  // The inline script in layout.js already applied the saved theme; just sync the buttons
  useEffect(() => {
    const saved = load(THEME_KEY, "auto");
    setTheme(saved === "light" || saved === "dark" ? saved : "auto");
  }, []);

  function choose(value) {
    setTheme(value);
    save(THEME_KEY, value);
    applyTheme(value);
  }

  return (
    <div className="theme-toggle" role="group" aria-label="Color theme">
      {OPTIONS.map((o) => (
        <button
          key={o.value}
          type="button"
          aria-pressed={theme === o.value}
          aria-label={o.label}
          title={o.label}
          onClick={() => choose(o.value)}
        >
          <svg viewBox="0 0 24 24" width="18" height="18" aria-hidden="true">
            {o.icon}
          </svg>
        </button>
      ))}
    </div>
  );
}
