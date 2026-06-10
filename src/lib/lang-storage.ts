import type { Lang } from "./types";

const KEY = "lang";

export function readLang(): Lang {
  if (typeof window === "undefined") return "es";
  const v = window.localStorage.getItem(KEY);
  return v === "en" ? "en" : "es";
}

export function writeLang(lang: Lang): void {
  if (typeof window === "undefined") return;
  window.localStorage.setItem(KEY, lang);
}
