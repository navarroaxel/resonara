"use client";
import { useRLC } from "@/store/rlc-store";
import { useUI } from "@/store/ui-store";
import { fmt, fmtWithUnit } from "@/lib/utils";
import { t } from "@/lib/i18n";
import type { UnitNotation } from "@/lib/types";

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

function u(n: number, unit: string, notation: UnitNotation, dec = 2) {
  return fmtWithUnit(n, unit, notation, dec);
}

export function MetricsGrid() {
  const {
    state: { results, polyResults, polyMode },
  } = useRLC();
  const {
    state: { lang, unitNotation },
  } = useUI();
  const { Z, phi, I, XL, XC, fr, Q } = results;

  if (polyMode && polyResults) {
    const { I_rms, THD_I, P_total, Qp_total, S_total } = polyResults;
    const fp_total = S_total > 0 ? P_total / S_total : 0;
    return (
      <div className="grid grid-cols-3 gap-2">
        <MetricCard
          label={t(lang, "phaseAngle")}
          value={fmt(phi, 1)}
          unit="°"
          color="text-violet-600 dark:text-violet-400"
        />
        <MetricCard
          label={t(lang, "iRms")}
          {...u(I_rms, "A", unitNotation, 3)}
          color="text-teal-600 dark:text-teal-400"
        />
        <MetricCard label={t(lang, "resFreq")} value={fmt(fr, 1)} unit="Hz" />
        <MetricCard
          label={t(lang, "impedance")}
          {...u(Z, "Ω", unitNotation)}
          color="text-blue-600 dark:text-blue-400"
        />
        <MetricCard label={t(lang, "xl")} {...u(XL, "Ω", unitNotation)} />
        <MetricCard label={t(lang, "xc")} {...u(XC, "Ω", unitNotation)} />
        <MetricCard
          label={t(lang, "activePower")}
          {...u(P_total, "W", unitNotation)}
          color="text-green-600 dark:text-green-400"
        />
        <MetricCard
          label={t(lang, "reactivePower")}
          {...u(Qp_total, "VAR", unitNotation)}
          color="text-orange-500 dark:text-orange-400"
        />
        <MetricCard
          label={t(lang, "apparentPower")}
          {...u(S_total, "VA", unitNotation)}
          color="text-blue-600 dark:text-blue-400"
        />
        <MetricCard label={t(lang, "qFactor")} value={fmt(Q)} />
        <MetricCard label={t(lang, "powerFactor")} value={fmt(fp_total, 3)} />
        <MetricCard
          label={t(lang, "thdCurrent")}
          value={fmt(THD_I, 1)}
          unit="%"
          color="text-amber-600 dark:text-amber-400"
        />
      </div>
    );
  }

  const { P, Qp, S, fp } = results;
  return (
    <div className="grid grid-cols-3 gap-2">
      <MetricCard
        label={t(lang, "phaseAngle")}
        value={fmt(phi, 1)}
        unit="°"
        color="text-violet-600 dark:text-violet-400"
      />
      <MetricCard
        label={t(lang, "current")}
        {...u(I, "A", unitNotation, 3)}
        color="text-teal-600 dark:text-teal-400"
      />
      <MetricCard label={t(lang, "resFreq")} value={fmt(fr, 1)} unit="Hz" />
      <MetricCard
        label={t(lang, "impedance")}
        {...u(Z, "Ω", unitNotation)}
        color="text-blue-600 dark:text-blue-400"
      />
      <MetricCard label={t(lang, "xl")} {...u(XL, "Ω", unitNotation)} />
      <MetricCard label={t(lang, "xc")} {...u(XC, "Ω", unitNotation)} />
      <MetricCard
        label={t(lang, "activePower")}
        {...u(P, "W", unitNotation)}
        color="text-green-600 dark:text-green-400"
      />
      <MetricCard
        label={t(lang, "reactivePower")}
        {...u(Qp, "VAR", unitNotation)}
        color="text-orange-500 dark:text-orange-400"
      />
      <MetricCard
        label={t(lang, "apparentPower")}
        {...u(S, "VA", unitNotation)}
        color="text-blue-600 dark:text-blue-400"
      />
      <MetricCard label={t(lang, "qFactor")} value={fmt(Q)} />
      <MetricCard label={t(lang, "powerFactor")} value={fmt(fp, 3)} />
    </div>
  );
}
