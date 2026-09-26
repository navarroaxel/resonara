"use client";
import { useState } from "react";
import { useThreePhase } from "@/store/three-phase-store";
import { useUI } from "@/store/ui-store";
import { t } from "@/lib/i18n";
import { fmt } from "@/lib/utils";

type Branch = "R" | "S" | "T";
const BRANCH_OFFSET: Record<Branch, number> = { R: 0, S: -120, T: 120 };
const BRANCH_COLOR: Record<Branch, string> = {
  R: "text-red-600 dark:text-red-400",
  S: "text-amber-600 dark:text-amber-400",
  T: "text-blue-600 dark:text-blue-400",
};
const CAP_BRANCH_SUB: Record<Branch, string> = { R: "RS", S: "ST", T: "TR" };

function SubLabel({
  prefix,
  base,
  sub,
}: {
  prefix: string;
  base: string;
  sub: string;
}) {
  return (
    <>
      {prefix} {base}
      <sub>{sub}</sub>
    </>
  );
}

function MetricCard({
  label,
  value,
  unit,
  color,
}: {
  label: React.ReactNode;
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

function phaseLabel(mag: number, angDeg: number): string {
  const wrapped = ((angDeg + 180) % 360 + 360) % 360 - 180;
  return `${fmt(mag, 2)} ∠${fmt(wrapped, 1)}°`;
}

// Same as phaseLabel, but wraps the angle to [0, 360) instead of (-180, 180]
function phaseLabel360(mag: number, angDeg: number): string {
  const wrapped = ((angDeg % 360) + 360) % 360;
  return `${fmt(mag, 2)} ∠${fmt(wrapped, 1)}°`;
}

function GroupTitle({ children }: { children: React.ReactNode }) {
  return (
    <p className="col-span-3 mt-2 text-[11px] font-medium tracking-wider text-neutral-400 uppercase first:mt-0 dark:text-neutral-500">
      {children}
    </p>
  );
}

export function ThreePhaseMetricsGrid() {
  const {
    state: { results, params },
  } = useThreePhase();
  const {
    state: { lang },
  } = useUI();
  const {
    P1,
    Q1,
    S1,
    P2,
    Q2,
    S2,
    P_total,
    Q_total,
    S_total,
    fp_total,
    phi_total,
    I_L,
    W_RS,
    W_ST,
    Qc,
    C_uF,
    I_RM,
    I_RL,
    I_RS,
    I_RC,
    Z_motor,
    Z_lamp,
    Z_cap,
  } = results;
  const phi1Deg = (Math.acos(params.cosPhi1) * 180) / Math.PI;
  const phi2Deg = (Math.acos(params.cosPhi2) * 180) / Math.PI;
  const [branch, setBranch] = useState<Branch>("R");
  const offset = BRANCH_OFFSET[branch];
  const branchColor = BRANCH_COLOR[branch];

  return (
    <div className="grid grid-cols-3 gap-2">
      <GroupTitle>{t(lang, "tpMotorsGroup")}</GroupTitle>
      <MetricCard
        label={t(lang, "activePower")}
        value={fmt(P1)}
        unit="W"
        color="text-green-600 dark:text-green-400"
      />
      <MetricCard
        label={t(lang, "reactivePower")}
        value={fmt(Q1)}
        unit="VAr"
        color="text-orange-500 dark:text-orange-400"
      />
      <MetricCard
        label={t(lang, "apparentPower")}
        value={fmt(S1)}
        unit="VA"
        color="text-blue-600 dark:text-blue-400"
      />

      <GroupTitle>{t(lang, "tpLightingGroup")}</GroupTitle>
      <MetricCard
        label={t(lang, "activePower")}
        value={fmt(P2)}
        unit="W"
        color="text-green-600 dark:text-green-400"
      />
      <MetricCard
        label={t(lang, "reactivePower")}
        value={fmt(Q2)}
        unit="VAr"
        color="text-orange-500 dark:text-orange-400"
      />
      <MetricCard
        label={t(lang, "apparentPower")}
        value={fmt(S2)}
        unit="VA"
        color="text-blue-600 dark:text-blue-400"
      />

      <GroupTitle>{t(lang, "tpTotalGroup")}</GroupTitle>
      <MetricCard
        label={t(lang, "activePower")}
        value={fmt(P_total)}
        unit="W"
        color="text-green-600 dark:text-green-400"
      />
      <MetricCard
        label={t(lang, "reactivePower")}
        value={fmt(Q_total)}
        unit="VAr"
        color="text-orange-500 dark:text-orange-400"
      />
      <MetricCard
        label={t(lang, "apparentPower")}
        value={fmt(S_total)}
        unit="VA"
        color="text-blue-600 dark:text-blue-400"
      />
      <MetricCard label={t(lang, "powerFactor")} value={fmt(fp_total, 3)} />
      <MetricCard
        label={t(lang, "phaseAngle")}
        value={fmt(phi_total, 1)}
        unit="°"
        color="text-violet-600 dark:text-violet-400"
      />

      <GroupTitle>{t(lang, "tpWattmetersGroup")}</GroupTitle>
      <MetricCard
        label={
          <SubLabel
            prefix={t(lang, "tpWattmeterLabel")}
            base="W"
            sub="RS"
          />
        }
        value={fmt(W_RS)}
        unit="W"
        color="text-rose-600 dark:text-rose-400"
      />
      <MetricCard
        label={
          <SubLabel
            prefix={t(lang, "tpWattmeterLabel")}
            base="W"
            sub="ST"
          />
        }
        value={fmt(W_ST)}
        unit="W"
        color="text-rose-600 dark:text-rose-400"
      />

      <GroupTitle>{t(lang, "tpCapacitorsGroup")}</GroupTitle>
      <MetricCard
        label={
          <>
            Q<sub>C</sub> {t(lang, "tpQcSuffix")}
          </>
        }
        value={fmt(Qc, 0)}
        unit="VAr"
        color="text-cyan-600 dark:text-cyan-400"
      />
      <MetricCard
        label={t(lang, "tpCuF")}
        value={fmt(C_uF, 1)}
        unit="µF"
        color="text-cyan-600 dark:text-cyan-400"
      />

      <div className="col-span-3 mt-2 flex items-center justify-between first:mt-0">
        <GroupTitle>{t(lang, "tpBranchCurrentsGroup")}</GroupTitle>
        <div className="mb-1 flex gap-1">
          {(["R", "S", "T"] as Branch[]).map((b) => (
            <button
              key={b}
              onClick={() => setBranch(b)}
              className={`h-6 w-6 rounded text-xs font-medium transition-colors ${
                branch === b
                  ? "bg-blue-500 text-white"
                  : "bg-neutral-200 text-neutral-600 dark:bg-neutral-700 dark:text-neutral-300"
              }`}
            >
              {b}
            </button>
          ))}
        </div>
      </div>
      <MetricCard
        label={
          <SubLabel prefix={t(lang, "tpVoltageLabel")} base="U" sub={branch} />
        }
        value={phaseLabel360(params.VL / Math.sqrt(3), 90 + offset)}
        unit="V"
        color={branchColor}
      />
      <MetricCard
        label={
          <SubLabel prefix={t(lang, "tpCurrentLabel")} base="I" sub={branch} />
        }
        value={phaseLabel(I_L, 90 - phi_total + offset)}
        unit="A"
        color={branchColor}
      />
      <MetricCard
        label={
          <SubLabel prefix={t(lang, "tpCurrentLabel")} base="I" sub={`${branch}L`} />
        }
        value={phaseLabel(I_RL, 90 - phi2Deg + offset)}
        unit="A"
        color={branchColor}
      />
      <MetricCard
        label={
          <SubLabel prefix={t(lang, "tpCurrentLabel")} base="I" sub={`${branch}M`} />
        }
        value={phaseLabel(I_RM, 90 - phi1Deg + offset)}
        unit="A"
        color={branchColor}
      />
      <MetricCard
        label={
          <SubLabel
            prefix={t(lang, "tpCurrentLabel")}
            base="I"
            sub={CAP_BRANCH_SUB[branch]}
          />
        }
        value={phaseLabel(I_RS, 210 + offset)}
        unit="A"
        color={branchColor}
      />
      <MetricCard
        label={
          <SubLabel prefix={t(lang, "tpCurrentLabel")} base="I" sub={`${branch}C`} />
        }
        value={phaseLabel(I_RC, 180 + offset)}
        unit="A"
        color={branchColor}
      />
      <MetricCard
        label={
          <SubLabel prefix={t(lang, "tpPowerLabel")} base="P" sub={branch} />
        }
        value={fmt(P_total / 3, 0)}
        unit="W"
        color="text-green-600 dark:text-green-400"
      />
      <MetricCard
        label={
          <SubLabel prefix={t(lang, "tpPowerLabel")} base="Q" sub={branch} />
        }
        value={fmt(Q_total / 3, 0)}
        unit="VAr"
        color="text-orange-500 dark:text-orange-400"
      />
      <MetricCard
        label={
          <SubLabel prefix={t(lang, "tpPowerLabel")} base="S" sub={branch} />
        }
        value={fmt(S_total / 3, 0)}
        unit="VA"
        color="text-blue-600 dark:text-blue-400"
      />

      <GroupTitle>{t(lang, "tpImpedancesGroup")}</GroupTitle>
      <MetricCard
        label={t(lang, "tpZMotor")}
        value={phaseLabel(
          Z_motor,
          (Math.acos(params.cosPhi1) * 180) / Math.PI,
        )}
        unit="Ω"
        color="text-indigo-600 dark:text-indigo-400"
      />
      <MetricCard
        label={t(lang, "tpZLamp")}
        value={phaseLabel(Z_lamp, (Math.acos(params.cosPhi2) * 180) / Math.PI)}
        unit="Ω"
        color="text-indigo-600 dark:text-indigo-400"
      />
      <MetricCard
        label={t(lang, "tpZCap")}
        value={phaseLabel(Z_cap, -90)}
        unit="Ω"
        color="text-indigo-600 dark:text-indigo-400"
      />
    </div>
  );
}
