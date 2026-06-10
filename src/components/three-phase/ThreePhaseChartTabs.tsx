"use client";
import { useThreePhase } from "@/store/three-phase-store";
import { useUI } from "@/store/ui-store";
import { t } from "@/lib/i18n";
import { cn } from "@/lib/utils";
import { ThreePhasePhasorDiagram } from "./ThreePhasePhasorDiagram";
import { ThreePhaseTimeDomain } from "./ThreePhaseTimeDomain";
import { ThreePhasePowerChart } from "./ThreePhasePowerChart";
import { ThreePhaseEquationsCard } from "./ThreePhaseEquationsCard";
import type { ThreePhaseActiveTab } from "@/lib/types";

const TABS: {
  value: ThreePhaseActiveTab;
  labelKey:
    | "phasorTab"
    | "timeDomainTab"
    | "powerTab"
    | "threePhaseEquationsTab";
}[] = [
  { value: "phasor", labelKey: "phasorTab" },
  { value: "time", labelKey: "timeDomainTab" },
  { value: "power", labelKey: "powerTab" },
  { value: "equations", labelKey: "threePhaseEquationsTab" },
];

export function ThreePhaseChartTabs() {
  const {
    state: { activeTab },
    dispatch,
  } = useThreePhase();
  const {
    state: { lang },
  } = useUI();

  return (
    <div>
      <div className="mb-4 flex gap-1 border-b border-neutral-200 dark:border-neutral-700">
        {TABS.map(({ value, labelKey }) => (
          <button
            key={value}
            onClick={() => dispatch({ type: "SET_TAB", activeTab: value })}
            className={cn(
              "-mb-px border-b-2 px-3 py-2 text-xs font-medium transition-colors",
              activeTab === value
                ? "border-blue-500 text-blue-600 dark:text-blue-400"
                : "border-transparent text-neutral-500 hover:text-neutral-700 dark:text-neutral-400 dark:hover:text-neutral-300",
            )}
          >
            {t(lang, labelKey)}
          </button>
        ))}
      </div>
      {activeTab === "phasor" && <ThreePhasePhasorDiagram />}
      {activeTab === "time" && <ThreePhaseTimeDomain />}
      {activeTab === "power" && <ThreePhasePowerChart />}
      {activeTab === "equations" && <ThreePhaseEquationsCard />}
    </div>
  );
}
