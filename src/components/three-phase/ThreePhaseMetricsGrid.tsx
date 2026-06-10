"use client";
import { useThreePhase } from "@/store/three-phase-store";
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

export function ThreePhaseMetricsGrid() {
  const {
    state: { results },
  } = useThreePhase();
  const {
    state: { lang },
  } = useUI();
  const { V_ph, V_L, I_ph, I_L, Z, phi, XL, XC, fr, Q, P, Qr, S, fp } = results;

  return (
    <div className="grid grid-cols-3 gap-2">
      <MetricCard
        label={t(lang, "phaseAngle")}
        value={fmt(phi, 1)}
        unit="°"
        color="text-violet-600 dark:text-violet-400"
      />
      <MetricCard
        label={t(lang, "phaseCurrent")}
        value={fmt(I_ph, 3)}
        unit="A"
        color="text-teal-600 dark:text-teal-400"
      />
      <MetricCard
        label={t(lang, "lineCurrent")}
        value={fmt(I_L, 3)}
        unit="A"
        color="text-teal-600 dark:text-teal-400"
      />
      <MetricCard
        label={t(lang, "impedance")}
        value={fmt(Z)}
        unit="Ω"
        color="text-blue-600 dark:text-blue-400"
      />
      <MetricCard label={t(lang, "xl")} value={fmt(XL)} unit="Ω" />
      <MetricCard label={t(lang, "xc")} value={fmt(XC)} unit="Ω" />
      <MetricCard
        label={t(lang, "phaseVoltage")}
        value={fmt(V_ph, 1)}
        unit="V"
      />
      <MetricCard label={t(lang, "lineVoltage")} value={fmt(V_L, 1)} unit="V" />
      <MetricCard label={t(lang, "resFreq")} value={fmt(fr, 1)} unit="Hz" />
      <MetricCard
        label={t(lang, "activePower")}
        value={fmt(P)}
        unit="W"
        color="text-green-600 dark:text-green-400"
      />
      <MetricCard
        label={t(lang, "reactivePower")}
        value={fmt(Qr)}
        unit="VAR"
        color="text-orange-500 dark:text-orange-400"
      />
      <MetricCard
        label={t(lang, "apparentPower")}
        value={fmt(S)}
        unit="VA"
        color="text-blue-600 dark:text-blue-400"
      />
      <MetricCard label={t(lang, "qFactor")} value={fmt(Q)} />
      <MetricCard label={t(lang, "powerFactor")} value={fmt(fp, 3)} />
    </div>
  );
}
