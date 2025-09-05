"use client";
import { useState, useEffect } from "react";

const themes = [
  "light","dark","cupcake","bumblebee","emerald","corporate",
  "synthwave","retro","cyberpunk","valentine","halloween",
  "garden","forest","aqua","lofi","pastel","fantasy",
  "wireframe","black","luxury","dracula","cmyk","autumn",
  "business","acid","lemonade","night","coffee","winter"
];

export function ThemeSwitcher() {
  const [theme, setTheme] = useState("light");

  useEffect(() => {
    document.querySelector("html")?.setAttribute("data-theme", theme);
  }, [theme]);

  return (
    <div className="dropdown dropdown-end">
      <label tabIndex={0} className="btn btn-sm m-1">
        Theme
      </label>
      <ul
        tabIndex={0}
        className="dropdown-content z-[1] p-2 shadow bg-base-100 rounded-box w-40 max-h-60 overflow-y-auto"
      >
        {themes.map((t) => (
          <li key={t}>
            <button
              onClick={() => setTheme(t)}
              className={`capitalize w-full text-left px-2 py-1 rounded ${
                theme === t ? "bg-primary text-primary-content" : ""
              }`}
            >
              {t}
            </button>
          </li>
        ))}
      </ul>
    </div>
  );
}
