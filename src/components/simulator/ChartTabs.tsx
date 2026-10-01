"use client";
import { useRLC } from "@/store/rlc-store";
import { useUI } from "@/store/ui-store";
import { t } from "@/lib/i18n";
import { cn } from "@/lib/utils";
import { BodeChart } from "@/components/charts/BodeChart";
import { PhasorDiagram } from "@/components/charts/PhasorDiagram";
import { TimeDomainChart } from "@/components/charts/TimeDomainChart";
import { PowerChart } from "@/components/charts/PowerChart";
import { HarmonicSpectrum } from "@/components/charts/HarmonicSpectrum";
import { GeometricLocusChart } from "@/components/charts/GeometricLocusChart";
import { WaveformEquations } from "@/components/simulator/WaveformEquations";
import type { ActiveTab } from "@/lib/types";

const BASE_TABS: {
  value: ActiveTab;
  labelKey:
    | "freqResponseTab"
    | "phasorTab"
    | "timeDomainTab"
    | "powerTab"
    | "spectrumTab"
    | "locusTab";
}[] = [
  { value: "phasor", labelKey: "phasorTab" },
  { value: "time", labelKey: "timeDomainTab" },
  { value: "power", labelKey: "powerTab" },
  { value: "bode", labelKey: "freqResponseTab" },
  { value: "locus", labelKey: "locusTab" },
];

export function ChartTabs() {
  const {
    state: { activeTab, polyMode },
    dispatch,
  } = useRLC();
  const {
    state: { lang },
  } = useUI();

  const tabs = polyMode
    ? [
        ...BASE_TABS,
        { value: "spectrum" as ActiveTab, labelKey: "spectrumTab" as const },
      ]
    : BASE_TABS;

  return (
    <div>
      <div className="mb-4 flex gap-1 border-b border-neutral-200 dark:border-neutral-700">
        {tabs.map(({ value, labelKey }) => (
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
      {activeTab === "bode" && <BodeChart />}
      {activeTab === "phasor" && <PhasorDiagram />}
      {activeTab === "time" && (
        <>
          {!polyMode && <WaveformEquations />}
          <TimeDomainChart />
        </>
      )}
      {activeTab === "power" && <PowerChart />}
      {activeTab === "spectrum" && <HarmonicSpectrum />}
      {activeTab === "locus" && <GeometricLocusChart />}
    </div>
  );
}
