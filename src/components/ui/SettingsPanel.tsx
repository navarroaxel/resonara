"use client";
import { useEffect, useLayoutEffect, useRef, useState } from "react";
import { useUI } from "@/store/ui-store";
import { t } from "@/lib/i18n";
import type { ResistorSymbol, UnitNotation, Lang } from "@/lib/types";

const useIsomorphicLayoutEffect =
  typeof window !== "undefined" ? useLayoutEffect : useEffect;

type ThemeMode = "auto" | "light" | "dark";

function readTheme(): ThemeMode {
  if (typeof window === "undefined") return "auto";
  const v = window.localStorage.getItem("theme");
  return v === "light" || v === "dark" ? v : "auto";
}

function applyTheme(mode: ThemeMode) {
  if (typeof window === "undefined") return;
  const systemDark = window.matchMedia("(prefers-color-scheme: dark)").matches;
  document.documentElement.classList.toggle(
    "dark",
    mode === "dark" || (mode === "auto" && systemDark),
  );
  if (mode === "auto") window.localStorage.removeItem("theme");
  else window.localStorage.setItem("theme", mode);
}

const THEME_ORDER: ThemeMode[] = ["auto", "light", "dark"];
const THEME_ICONS: Record<ThemeMode, string> = {
  auto: "◑",
  light: "☀️",
  dark: "🌙",
};

const segBtn = (active: boolean) =>
  `px-2.5 py-1 text-xs font-medium transition-colors ${
    active
      ? "bg-zinc-800 text-white dark:bg-zinc-200 dark:text-zinc-900"
      : "bg-white text-zinc-600 hover:bg-zinc-50 dark:bg-zinc-900 dark:text-zinc-400 dark:hover:bg-zinc-800"
  }`;

export function SettingsPanel() {
  const [open, setOpen] = useState(false);
  const [themeMode, setThemeMode] = useState<ThemeMode>("auto");
  const [themeMounted, setThemeMounted] = useState(false);
  const panelRef = useRef<HTMLDivElement>(null);
  const { state, dispatch } = useUI();
  const { lang, resistorSymbol, unitNotation } = state;

  useIsomorphicLayoutEffect(() => {
    const stored = readTheme();
    setThemeMode(stored);
    applyTheme(stored);
    setThemeMounted(true);
  }, []);

  useEffect(() => {
    if (themeMode !== "auto") return;
    const mq = window.matchMedia("(prefers-color-scheme: dark)");
    const handler = () => applyTheme("auto");
    mq.addEventListener("change", handler);
    return () => mq.removeEventListener("change", handler);
  }, [themeMode]);

  useEffect(() => {
    if (!open) return;
    function handleOutside(e: MouseEvent) {
      if (panelRef.current && !panelRef.current.contains(e.target as Node))
        setOpen(false);
    }
    document.addEventListener("mousedown", handleOutside);
    return () => document.removeEventListener("mousedown", handleOutside);
  }, [open]);

  const currentTheme = themeMounted ? themeMode : "auto";

  return (
    <div ref={panelRef} className="relative">
      <button
        type="button"
        onClick={() => setOpen((v) => !v)}
        aria-label={t(lang, "settingsAriaOpen")}
        title={t(lang, "settingsAriaOpen")}
        className="inline-flex items-center gap-1.5 rounded-md border border-zinc-300 bg-white px-2.5 py-1 text-xs font-medium text-zinc-700 transition-colors hover:bg-zinc-50 dark:border-zinc-700 dark:bg-zinc-900 dark:text-zinc-200 dark:hover:bg-zinc-800"
      >
        <span>⚙</span>
      </button>

      {open && (
        <div className="absolute top-full right-0 z-50 mt-1 w-60 space-y-3 rounded-lg border border-zinc-200 bg-white p-3 shadow-lg dark:border-zinc-700 dark:bg-zinc-900">
          <div>
            <p className="mb-2 text-[10px] font-semibold tracking-wider text-zinc-400 uppercase dark:text-zinc-500">
              {t(lang, "settingsDisplaySection")}
            </p>

            <div className="mb-2 flex items-center justify-between">
              <span className="text-xs text-zinc-600 dark:text-zinc-300">
                {t(lang, "resistorSymbolLabel")}
              </span>
              <div className="flex overflow-hidden rounded-md border border-zinc-300 dark:border-zinc-700">
                {(["eu", "usa"] as ResistorSymbol[]).map((v) => (
                  <button
                    key={v}
                    type="button"
                    onClick={() =>
                      dispatch({
                        type: "SET_RESISTOR_SYMBOL",
                        resistorSymbol: v,
                      })
                    }
                    className={segBtn(resistorSymbol === v)}
                  >
                    {t(
                      lang,
                      v === "eu" ? "resistorSymbolEU" : "resistorSymbolUSA",
                    )}
                  </button>
                ))}
              </div>
            </div>

            <div className="flex items-center justify-between">
              <span className="flex items-center gap-1 text-xs text-zinc-600 dark:text-zinc-300">
                {t(lang, "unitNotationLabel")}
                <span className="group relative inline-flex h-3.5 w-3.5 cursor-help items-center justify-center rounded-full border border-zinc-400 text-[9px] leading-none text-zinc-400 select-none dark:border-zinc-500 dark:text-zinc-500">
                  i
                  <span className="pointer-events-none absolute top-full left-0 z-[60] mt-1.5 w-52 rounded bg-zinc-800 px-2 py-1.5 text-[10px] leading-snug text-white opacity-0 transition-opacity group-hover:opacity-100 dark:bg-zinc-700">
                    {t(lang, "unitNotationTooltip")}
                  </span>
                </span>
              </span>
              <div className="flex overflow-hidden rounded-md border border-zinc-300 dark:border-zinc-700">
                {(["raw", "si"] as UnitNotation[]).map((v) => (
                  <button
                    key={v}
                    type="button"
                    onClick={() =>
                      dispatch({ type: "SET_UNIT_NOTATION", unitNotation: v })
                    }
                    className={segBtn(unitNotation === v)}
                  >
                    {t(
                      lang,
                      v === "raw" ? "unitNotationRaw" : "unitNotationSI",
                    )}
                  </button>
                ))}
              </div>
            </div>
          </div>

          <div className="border-t border-zinc-200 pt-3 dark:border-zinc-700">
            <p className="mb-2 text-[10px] font-semibold tracking-wider text-zinc-400 uppercase dark:text-zinc-500">
              {t(lang, "settingsInterfaceSection")}
            </p>

            <div className="mb-2 flex items-center justify-between">
              <span className="text-xs text-zinc-600 dark:text-zinc-300">
                {t(lang, "settingsLangLabel")}
              </span>
              <div className="flex overflow-hidden rounded-md border border-zinc-300 dark:border-zinc-700">
                {(["es", "en"] as Lang[]).map((v) => (
                  <button
                    key={v}
                    type="button"
                    onClick={() => dispatch({ type: "SET_LANG", lang: v })}
                    className={`${segBtn(lang === v)} font-mono`}
                  >
                    {v.toUpperCase()}
                  </button>
                ))}
              </div>
            </div>

            <div className="flex items-center justify-between">
              <span className="text-xs text-zinc-600 dark:text-zinc-300">
                {t(lang, "themeLabel")}
              </span>
              <div className="flex overflow-hidden rounded-md border border-zinc-300 dark:border-zinc-700">
                {THEME_ORDER.map((v) => (
                  <button
                    key={v}
                    type="button"
                    onClick={() => {
                      setThemeMode(v);
                      applyTheme(v);
                    }}
                    title={`${t(lang, "themeLabel")} ${v}`}
                    suppressHydrationWarning
                    className={segBtn(currentTheme === v)}
                  >
                    {THEME_ICONS[v]}
                  </button>
                ))}
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
