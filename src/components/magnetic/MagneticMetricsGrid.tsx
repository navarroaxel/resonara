"use client";
import { useMagnetic } from "@/store/magnetic-store";
import { useUI } from "@/store/ui-store";
import { t } from "@/lib/i18n";
import { fmt } from "@/lib/utils";

function MetricCard({
  label,
  value,
  unit,
  color,
}: {
  label: string;
  value: string;
  unit?: string;
  color?: string;
}) {
  return (
    <div className="rounded-lg bg-neutral-50 p-3 text-center dark:bg-neutral-800/60">
      <p className="mb-1 text-xs text-neutral-500 dark:text-neutral-400">
        {label}
      </p>
      <p
        className={`text-lg font-medium tabular-nums ${color ?? "text-neutral-900 dark:text-neutral-100"}`}
      >
        {value}
        {unit && <span className="ml-1 text-xs text-neutral-400">{unit}</span>}
      </p>
    </div>
  );
}

export function MagneticMetricsGrid() {
  const {
    state: { results },
  } = useMagnetic();
  const {
    state: { lang },
  } = useUI();
  const { M, XL1, XL2, XM, Zin, phi1, I1, I2, phi2, P1, P2, eta } = results;

  const etaStr = Number.isFinite(eta) ? (eta * 100).toFixed(1) + " %" : "—";

  return (
    <div className="grid grid-cols-3 gap-2">
      <MetricCard
        label={t(lang, "magMutualInductance")}
        value={fmt(M, 2)}
        unit="mH"
      />
      <MetricCard label={t(lang, "magXL1")} value={fmt(XL1)} unit="Ω" />
      <MetricCard label={t(lang, "magXL2")} value={fmt(XL2)} unit="Ω" />
      <MetricCard label={t(lang, "magXM")} value={fmt(XM)} unit="Ω" />
      <MetricCard
        label={t(lang, "magZin")}
        value={fmt(Zin)}
        unit="Ω"
        color="text-blue-600 dark:text-blue-400"
      />
      <MetricCard
        label={t(lang, "magPhi1")}
        value={fmt(phi1, 1)}
        unit="°"
        color="text-violet-600 dark:text-violet-400"
      />
      <MetricCard
        label={t(lang, "magI1")}
        value={fmt(I1, 3)}
        unit="A"
        color="text-teal-600 dark:text-teal-400"
      />
      <MetricCard
        label={t(lang, "magI2")}
        value={fmt(I2, 3)}
        unit="A"
        color="text-orange-500 dark:text-orange-400"
      />
      <MetricCard
        label={t(lang, "magPhi2")}
        value={fmt(phi2, 1)}
        unit="°"
        color="text-violet-600 dark:text-violet-400"
      />
      <MetricCard
        label={t(lang, "magP1")}
        value={fmt(P1)}
        unit="W"
        color="text-green-600 dark:text-green-400"
      />
      <MetricCard
        label={t(lang, "magP2")}
        value={fmt(P2)}
        unit="W"
        color="text-green-600 dark:text-green-400"
      />
      <MetricCard
        label={t(lang, "magEta")}
        value={etaStr}
        color="text-amber-600 dark:text-amber-400"
      />
    </div>
  );
}
