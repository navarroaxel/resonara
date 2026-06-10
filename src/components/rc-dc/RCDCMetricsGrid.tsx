"use client";
import { useRCDC } from "@/store/rc-dc-store";
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

function fmtTime(s: number): { value: string; unit: string } {
  if (s < 0.001) return { value: fmt(s * 1e6, 2), unit: "µs" };
  if (s < 1) return { value: fmt(s * 1e3, 2), unit: "ms" };
  return { value: fmt(s, 3), unit: "s" };
}

function fmtEnergy(j: number): { value: string; unit: string } {
  if (j < 1e-6) return { value: fmt(j * 1e9, 2), unit: "nJ" };
  if (j < 1e-3) return { value: fmt(j * 1e6, 2), unit: "µJ" };
  if (j < 1) return { value: fmt(j * 1e3, 2), unit: "mJ" };
  return { value: fmt(j, 3), unit: "J" };
}

function fmtCurrent(a: number): { value: string; unit: string } {
  if (a < 1e-3) return { value: fmt(a * 1e6, 2), unit: "µA" };
  if (a < 1) return { value: fmt(a * 1e3, 2), unit: "mA" };
  return { value: fmt(a, 4), unit: "A" };
}

export function RCDCMetricsGrid() {
  const {
    state: { results },
  } = useRCDC();
  const {
    state: { lang },
  } = useUI();
  const { tau, I0, Vc_tau, t5tau, E_final } = results;

  const tauFmt = fmtTime(tau);
  const t5Fmt = fmtTime(t5tau);
  const i0Fmt = fmtCurrent(I0);
  const eFmt = fmtEnergy(E_final);

  return (
    <div>
      <h2 className="mb-3 text-xs font-medium tracking-wider text-neutral-400 uppercase">
        {t(lang, "rcDcMetricsTitle")}
      </h2>
      <div className="grid grid-cols-2 gap-2">
        <MetricCard
          label={t(lang, "rcDcTau")}
          value={tauFmt.value}
          unit={tauFmt.unit}
          color="text-blue-600 dark:text-blue-400"
        />
        <MetricCard
          label={t(lang, "rcDcI0")}
          value={i0Fmt.value}
          unit={i0Fmt.unit}
          color="text-green-600 dark:text-green-400"
        />
        <MetricCard
          label={t(lang, "rcDcVcAtTau")}
          value={fmt(Vc_tau, 3)}
          unit="V"
          color="text-violet-600 dark:text-violet-400"
        />
        <MetricCard
          label={t(lang, "rcDcT5tau")}
          value={t5Fmt.value}
          unit={t5Fmt.unit}
        />
        <MetricCard
          label={t(lang, "rcDcEfinal")}
          value={eFmt.value}
          unit={eFmt.unit}
          color="text-orange-600 dark:text-orange-400"
        />
      </div>
    </div>
  );
}
