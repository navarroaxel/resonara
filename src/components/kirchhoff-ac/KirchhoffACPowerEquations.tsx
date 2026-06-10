"use client";
import { useKirchhoffAC } from "@/store/kirchhoff-ac-store";
import { useUI } from "@/store/ui-store";
import { t } from "@/lib/i18n";
import { fmt } from "@/lib/utils";

function PowerRow({
  color,
  name,
  formula,
  value,
  unit,
}: {
  color: string;
  name: string;
  formula: string;
  value: number;
  unit: string;
}) {
  return (
    <div className="flex flex-wrap items-baseline gap-1.5">
      <span className={`font-semibold ${color}`}>{name}</span>
      <span className="text-neutral-400">=</span>
      <span className="text-xs text-neutral-500 dark:text-neutral-400">
        {formula}
      </span>
      <span className="text-neutral-400">=</span>
      <span className="text-neutral-700 dark:text-neutral-300">
        {fmt(value, 2)}
      </span>
      <span className="text-xs text-neutral-400">{unit}</span>
    </div>
  );
}

export function KirchhoffACPowerEquations() {
  const {
    state: { results },
  } = useKirchhoffAC();
  const {
    state: { lang },
  } = useUI();
  const { Zm_re, Zm_im, Zm_mag, P_m, Q_m, S_m, P, Q, S, I1 } = results;

  return (
    <div className="mt-3 space-y-2">
      <div className="rounded-lg bg-neutral-50 p-3 dark:bg-neutral-800/50">
        <p className="mb-2 text-xs font-medium tracking-wider text-neutral-400 uppercase">
          {t(lang, "kacMotorPowerSection")}
        </p>
        <div className="space-y-1.5 font-mono text-sm">
          <PowerRow
            color="text-green-600 dark:text-green-400"
            name="Pm"
            formula={`|IZm|²·Rm  (${fmt(Zm_re, 2)} Ω)`}
            value={P_m}
            unit="W"
          />
          <PowerRow
            color="text-orange-500"
            name="Qm"
            formula={`|IZm|²·XLm (${fmt(Zm_im, 2)} Ω)`}
            value={Q_m}
            unit="VAR"
          />
          <PowerRow
            color="text-neutral-600 dark:text-neutral-300"
            name="Sm"
            formula={`|IZm|²·|Zm| (${fmt(Zm_mag, 2)} Ω)`}
            value={S_m}
            unit="VA"
          />
        </div>
      </div>

      <div className="rounded-lg bg-neutral-50 p-3 dark:bg-neutral-800/50">
        <p className="mb-2 text-xs font-medium tracking-wider text-neutral-400 uppercase">
          {t(lang, "kacCircuitPowerSection")}
        </p>
        <div className="space-y-1.5 font-mono text-sm">
          <PowerRow
            color="text-green-600 dark:text-green-400"
            name="P"
            formula={`Vs·I₁·cos φ  (I₁ = ${fmt(I1.mag, 3)} A)`}
            value={P}
            unit="W"
          />
          <PowerRow
            color="text-orange-500"
            name="Q"
            formula={`Vs·I₁·sin φ`}
            value={Q}
            unit="VAR"
          />
          <PowerRow
            color="text-neutral-600 dark:text-neutral-300"
            name="S"
            formula={`Vs·I₁`}
            value={S}
            unit="VA"
          />
        </div>
      </div>
    </div>
  );
}
