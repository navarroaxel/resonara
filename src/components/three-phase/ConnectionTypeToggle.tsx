"use client";
import { useThreePhase } from "@/store/three-phase-store";
import { useUI } from "@/store/ui-store";
import { t } from "@/lib/i18n";
import { cn } from "@/lib/utils";
import type { ConnectionType } from "@/lib/types";

const OPTIONS: {
  value: ConnectionType;
  labelKey: "starConnection" | "deltaConnection";
}[] = [
  { value: "star", labelKey: "starConnection" },
  { value: "delta", labelKey: "deltaConnection" },
];

export function ConnectionTypeToggle() {
  const { state, dispatch } = useThreePhase();
  const {
    state: { lang },
  } = useUI();

  return (
    <div className="mb-4 flex gap-2">
      {OPTIONS.map(({ value, labelKey }) => (
        <button
          key={value}
          onClick={() =>
            dispatch({ type: "SET_CONNECTION", connection: value })
          }
          className={cn(
            "flex-1 rounded-lg border px-4 py-2 text-sm font-medium transition-colors",
            state.connection === value
              ? "border-neutral-300 bg-neutral-100 text-neutral-900 dark:border-neutral-600 dark:bg-neutral-800 dark:text-neutral-100"
              : "border-neutral-200 text-neutral-500 hover:bg-neutral-50 dark:border-neutral-700 dark:text-neutral-400 dark:hover:bg-neutral-800/50",
          )}
        >
          {t(lang, labelKey)}
        </button>
      ))}
    </div>
  );
}
