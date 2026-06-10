"use client";
import { useUI } from "@/store/ui-store";
import { t } from "@/lib/i18n";

export function KirchhoffACHeaderSubtitle() {
  const {
    state: { lang },
  } = useUI();
  return (
    <p className="text-xs text-neutral-500 dark:text-neutral-400">
      {t(lang, "kacPageSubtitle")}
    </p>
  );
}
