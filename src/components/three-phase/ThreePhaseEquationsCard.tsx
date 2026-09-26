"use client";
import { useThreePhase } from "@/store/three-phase-store";
import { useUI } from "@/store/ui-store";
import { t } from "@/lib/i18n";
import { fmt } from "@/lib/utils";

const SQRT3 = Math.sqrt(3);

function Sub({ base, sub }: { base: string; sub: string }) {
  return (
    <>
      {base}
      <sub>{sub}</sub>
    </>
  );
}

// Turns literal "W_RS"/"W_ST"-style tokens inside prose into real subscripts.
function renderWithSub(text: string): React.ReactNode[] {
  const parts: React.ReactNode[] = [];
  const regex = /([A-Za-zφ])_([A-Za-z0-9]+)/g;
  let lastIndex = 0;
  let match: RegExpExecArray | null;
  let key = 0;
  while ((match = regex.exec(text))) {
    if (match.index > lastIndex) {
      parts.push(text.slice(lastIndex, match.index));
    }
    parts.push(<Sub key={key++} base={match[1]} sub={match[2]} />);
    lastIndex = regex.lastIndex;
  }
  parts.push(text.slice(lastIndex));
  return parts;
}

export function ThreePhaseEquationsCard() {
  const {
    state: { params, results, flags },
  } = useThreePhase();
  const {
    state: { lang },
  } = useUI();
  const {
    Q1,
    S1,
    P2,
    Q2,
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
  } = results;

  // Qc/C are computed from the uncompensated angle regardless of whether
  // the bank is currently connected.
  const Q_uncompensated = Q1 + Q2;
  const phiUncompensatedRad = Math.atan2(Q_uncompensated, P_total);
  const phiUncompensated = (phiUncompensatedRad * 180) / Math.PI;
  const S_uncompensated = Math.sqrt(P_total ** 2 + Q_uncompensated ** 2);
  const I_L_uncompensated = S_uncompensated / (SQRT3 * params.VL);
  const W_RS_uncompensated =
    params.VL * I_L_uncompensated * Math.cos(phiUncompensatedRad - Math.PI / 6);
  const W_ST_uncompensated =
    params.VL * I_L_uncompensated * Math.cos(phiUncompensatedRad + Math.PI / 6);

  // Part c)/d): fixed "after connecting" values, independent of the toggle.
  const Q_compensated = Q_uncompensated - Qc;
  const S_compensated = Math.sqrt(P_total ** 2 + Q_compensated ** 2);
  const I_L_compensated = S_compensated / (SQRT3 * params.VL);
  const phiCompensatedRad = Math.atan2(Q_compensated, P_total);
  const W_RS_compensated =
    params.VL * I_L_compensated * Math.cos(phiCompensatedRad - Math.PI / 6);
  const W_ST_compensated =
    params.VL * I_L_compensated * Math.cos(phiCompensatedRad + Math.PI / 6);

  return (
    <div>
      <div className="mb-4 rounded-lg bg-neutral-50 p-3 text-xs leading-relaxed text-neutral-700 dark:bg-neutral-800/60 dark:text-neutral-300">
        <p className="mb-2 font-medium text-neutral-500 dark:text-neutral-400">
          {t(lang, "tpSummaryTitle")}
        </p>
        <div className="space-y-1">
          <div>
            {t(lang, "tpSummaryA")}
            {": "}
            <span className="text-rose-600 dark:text-rose-400">
              <Sub base="W" sub="RS" />
            </span>
            {` ≈ ${fmt(W_RS_uncompensated, 0)} W, `}
            <span className="text-rose-600 dark:text-rose-400">
              <Sub base="W" sub="ST" />
            </span>
            {` ≈ ${fmt(W_ST_uncompensated, 0)} W, `}
            <span className="text-teal-600 dark:text-teal-400">
              <Sub base="I" sub="L" />
            </span>
            {` ≈ ${fmt(I_L_uncompensated, 2)} A`}
          </div>
          <div>
            {t(lang, "tpSummaryB")}
            {fmt(params.targetFp, 2)}
            {": "}
            <span className="text-cyan-600 dark:text-cyan-400">
              <Sub base="Q" sub="C" />
            </span>
            {` ≈ ${fmt(Qc, 0)} VAr, C ≈ ${fmt(C_uF, 1)} µF`}
          </div>
          <div>
            {t(lang, "tpSummaryC")}
            {": "}
            <span className="text-rose-600 dark:text-rose-400">
              <Sub base="W" sub="RS" />
            </span>
            {` ≈ ${fmt(W_RS_compensated, 0)} W, `}
            <span className="text-rose-600 dark:text-rose-400">
              <Sub base="W" sub="ST" />
            </span>
            {` ≈ ${fmt(W_ST_compensated, 0)} W`}
          </div>
          <div>
            {t(lang, "tpSummaryD")}
            {": "}
            <span className="text-teal-600 dark:text-teal-400">
              <Sub base="I" sub="L" />
            </span>
            {` ≈ ${fmt(I_L_compensated, 2)} A`}
          </div>
        </div>
      </div>

      <div className="mb-4 rounded-lg bg-neutral-50 p-3 text-xs leading-relaxed text-neutral-700 dark:bg-neutral-800/60 dark:text-neutral-300">
        <p className="mb-1 font-medium text-neutral-500 dark:text-neutral-400">
          {t(lang, "tpAronTitle")}
        </p>
        <p>{renderWithSub(t(lang, "tpAronExplain"))}</p>
      </div>

      <p className="mb-2 text-xs text-neutral-500 dark:text-neutral-400">
        {t(lang, "threePhaseGeneralForm")}
      </p>
      <div className="mb-4 space-y-1.5 font-mono text-xs leading-relaxed text-neutral-700 dark:text-neutral-300">
        <div role="img" aria-label={t(lang, "ariaQ1Formula")}>
          <span className="text-orange-500 dark:text-orange-400">Q₁</span>
          {" = P₁ · tan(arccos(cos φ₁))"}
        </div>
        <div role="img" aria-label={t(lang, "ariaQ2Formula")}>
          <span className="text-orange-500 dark:text-orange-400">Q₂</span>
          {" = P₂ · tan(arccos(cos φ₂))"}
        </div>
        <div
          className="mt-1.5 border-t border-neutral-100 pt-1.5 dark:border-neutral-800"
          role="img"
          aria-label={t(lang, "ariaPtotalFormula")}
        >
          <span className="text-green-600 dark:text-green-400">P</span>
          {" = P₁ + P₂"}
        </div>
        <div role="img" aria-label={t(lang, "ariaQtotalFormula")}>
          <span className="text-orange-500 dark:text-orange-400">Q</span>
          {flags.capacitorsOn ? (
            <>
              {" = Q₁ + Q₂ − "}
              <Sub base="Q" sub="C" />
            </>
          ) : (
            " = Q₁ + Q₂"
          )}
        </div>
        <div role="img" aria-label={t(lang, "ariaStotalFormula")}>
          <span className="text-blue-600 dark:text-blue-400">S</span>
          {" = √(P² + Q²)"}
        </div>
        <div role="img" aria-label={t(lang, "ariaFpTotalFormula")}>
          {"cos "}
          <span className="text-violet-600 dark:text-violet-400">φ</span>
          {" = P / S"}
        </div>
        <div
          className="mt-1.5 border-t border-neutral-100 pt-1.5 dark:border-neutral-800"
          role="img"
          aria-label={t(lang, "ariaILFormula")}
        >
          <span className="text-teal-600 dark:text-teal-400">
            <Sub base="I" sub="L" />
          </span>
          {" = S / (√3 · "}
          <Sub base="V" sub="L" />
          {")"}
        </div>
        <div
          className="mt-1.5 border-t border-neutral-100 pt-1.5 dark:border-neutral-800"
          role="img"
          aria-label={t(lang, "ariaWRSFormula")}
        >
          <span className="text-rose-600 dark:text-rose-400">
            <Sub base="W" sub="RS" />
          </span>
          {" = "}
          <Sub base="V" sub="L" />
          {" · "}
          <Sub base="I" sub="L" />
          {" · cos("}
          <span className="text-violet-600 dark:text-violet-400">φ</span>
          {" − 30°)"}
        </div>
        <div role="img" aria-label={t(lang, "ariaWSTFormula")}>
          <span className="text-rose-600 dark:text-rose-400">
            <Sub base="W" sub="ST" />
          </span>
          {" = "}
          <Sub base="V" sub="L" />
          {" · "}
          <Sub base="I" sub="L" />
          {" · cos("}
          <span className="text-violet-600 dark:text-violet-400">φ</span>
          {" + 30°)"}
        </div>
        <div
          className="mt-1.5 border-t border-neutral-100 pt-1.5 dark:border-neutral-800"
          role="img"
          aria-label={t(lang, "ariaQcFormula")}
        >
          <span className="text-cyan-600 dark:text-cyan-400">
            <Sub base="Q" sub="C" />
          </span>
          {" = P · (tan(φ) − tan("}
          <Sub base="φ" sub="t" />
          {"))"}
        </div>
        <div role="img" aria-label={t(lang, "ariaCFormula")}>
          <span className="text-cyan-600 dark:text-cyan-400">C</span>
          {" = "}
          <Sub base="Q" sub="C" />
          {" / (3 · ω · "}
          <Sub base="V" sub="fase" />
          {"²)"}
        </div>
      </div>

      <p className="mb-2 text-xs text-neutral-500 dark:text-neutral-400">
        {t(lang, "threePhaseSubstituted")}
      </p>
      <div className="space-y-1.5 font-mono text-xs leading-relaxed text-neutral-700 dark:text-neutral-300">
        <div>
          {`P₁ = ${fmt(params.P1_kW, 0)} kW   cos φ₁ = ${fmt(params.cosPhi1, 2)}   `}
          <span className="text-orange-500 dark:text-orange-400">Q₁</span>
          {` = ${fmt(Q1, 0)} VAr   `}
          <span className="text-blue-600 dark:text-blue-400">S₁</span>
          {` = ${fmt(S1, 0)} VA`}
        </div>
        <div>
          {`P₂ = ${params.numLamps} × ${fmt(params.wattPerLamp, 0)} W = ${fmt(P2, 0)} W   cos φ₂ = ${fmt(params.cosPhi2, 2)}   `}
          <span className="text-orange-500 dark:text-orange-400">Q₂</span>
          {` = ${fmt(Q2, 0)} VAr`}
        </div>
        <div className="mt-1.5 border-t border-neutral-100 pt-1.5 dark:border-neutral-800">
          <span className="text-green-600 dark:text-green-400">P</span>
          {` = ${fmt(P_total, 0)} W   `}
          <span className="text-orange-500 dark:text-orange-400">Q</span>
          {flags.capacitorsOn ? (
            <>
              {` = ${fmt(Q_uncompensated, 0)} − ${fmt(Qc, 0)} = `}
              <span className="font-medium text-orange-500 dark:text-orange-400">
                {fmt(Q_total, 0)} VAr
              </span>
            </>
          ) : (
            ` = ${fmt(Q_total, 0)} VAr`
          )}
          {"   "}
          <span className="text-blue-600 dark:text-blue-400">S</span>
          {` = ${fmt(S_total, 0)} VA`}
        </div>
        <div>{`cos φ = ${fmt(fp_total, 3)}   φ = ${fmt(phi_total, 2)}°`}</div>
        <div className="mt-1.5 border-t border-neutral-100 pt-1.5 dark:border-neutral-800">
          <span className="text-teal-600 dark:text-teal-400">
            <Sub base="I" sub="L" />
          </span>
          {` = ${fmt(S_total, 0)} / (√3 · ${fmt(params.VL, 0)}) = `}
          <span className="font-medium text-teal-600 dark:text-teal-400">
            {fmt(I_L, 2)} A
          </span>
        </div>
        <div className="mt-1.5 border-t border-neutral-100 pt-1.5 dark:border-neutral-800">
          <span className="text-rose-600 dark:text-rose-400">
            <Sub base="W" sub="RS" />
          </span>
          {` = ${fmt(params.VL, 0)} · ${fmt(I_L, 2)} · cos(${fmt(phi_total, 1)}° − 30°) = `}
          <span className="font-medium text-rose-600 dark:text-rose-400">
            {fmt(W_RS, 0)} W
          </span>
        </div>
        <div>
          <span className="text-rose-600 dark:text-rose-400">
            <Sub base="W" sub="ST" />
          </span>
          {` = ${fmt(params.VL, 0)} · ${fmt(I_L, 2)} · cos(${fmt(phi_total, 1)}° + 30°) = `}
          <span className="font-medium text-rose-600 dark:text-rose-400">
            {fmt(W_ST, 0)} W
          </span>
        </div>
        <div className="mt-1.5 border-t border-neutral-100 pt-1.5 dark:border-neutral-800">
          {"cos "}
          <Sub base="φ" sub="t" />
          {` = ${fmt(params.targetFp, 2)}   `}
          <span className="text-cyan-600 dark:text-cyan-400">
            <Sub base="Q" sub="C" />
          </span>
          {` = ${fmt(P_total, 0)} · (tan(${fmt(phiUncompensated, 1)}°) − tan(${fmt((Math.acos(params.targetFp) * 180) / Math.PI, 1)}°)) = `}
          <span className="font-medium text-cyan-600 dark:text-cyan-400">
            {fmt(Qc, 0)} VAr
          </span>
        </div>
        <div>
          <span className="text-cyan-600 dark:text-cyan-400">C</span>
          {` = ${fmt(Qc, 0)} / (3 · 2π·${fmt(params.f, 0)} · (${fmt(params.VL, 0)}/√3)²) = `}
          <span className="font-medium text-cyan-600 dark:text-cyan-400">
            {fmt(C_uF, 1)} µF
          </span>
        </div>
      </div>
    </div>
  );
}
