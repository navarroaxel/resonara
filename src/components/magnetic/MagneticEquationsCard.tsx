"use client";
import { useMagnetic } from "@/store/magnetic-store";
import { useUI } from "@/store/ui-store";
import { t } from "@/lib/i18n";
import { fmt } from "@/lib/utils";

function phaseStr(phi_deg: number): string {
  const absRad = (Math.abs(phi_deg) * Math.PI) / 180;
  if (absRad < 0.001) return "";
  // positive phi = lagging → subtract; negative phi = leading → add
  const sign = phi_deg >= 0 ? " − " : " + ";
  return `${sign}${fmt(absRad, 3)}`;
}

export function MagneticEquationsCard() {
  const {
    state: { params, results },
  } = useMagnetic();
  const {
    state: { lang },
  } = useUI();
  const { Vs, f, L1, R2, L2, k } = params;
  const { M, XL1, XL2, XM, Zin, Z2, phi1, I1, I2, phi2, P1, P2, eta } = results;

  const w = 2 * Math.PI * f;
  const fmtW = fmt(w, 2);
  const etaStr = Number.isFinite(eta) ? (eta * 100).toFixed(1) + " %" : "—";

  return (
    <div className="rounded-xl border border-neutral-200 bg-white p-4 dark:border-neutral-800 dark:bg-neutral-900">
      <h2 className="mb-3 text-xs font-medium tracking-wider text-neutral-400 uppercase">
        {t(lang, "magEquationsTitle")}
      </h2>

      {/* ── General form ── */}
      <p className="mb-2 text-xs text-neutral-500 dark:text-neutral-400">
        {t(lang, "magGeneralForm")}
      </p>
      <div className="mb-4 space-y-1.5 font-mono text-xs leading-relaxed text-neutral-700 dark:text-neutral-300">
        <div>
          {"Vs = "}
          <span className="text-teal-600 dark:text-teal-400">I₁</span>
          {"·(R₁ + jωL₁) − jωM·"}
          <span className="text-orange-500 dark:text-orange-400">I₂</span>
        </div>
        <div>
          {"jωM·"}
          <span className="text-teal-600 dark:text-teal-400">I₁</span>
          {" = "}
          <span className="text-orange-500 dark:text-orange-400">I₂</span>
          {"·(R₂ + jωL₂)"}
        </div>
        <div className="mt-1.5 border-t border-neutral-100 pt-1.5 dark:border-neutral-800">
          <span className="text-violet-600 dark:text-violet-400">M</span>
          {" = k · √(L₁ · L₂)"}
        </div>
        <div>
          <span className="text-blue-600 dark:text-blue-400">Zrefl</span>
          {" = (ωM)² / Z₂"}
        </div>
        <div>
          <span className="text-blue-600 dark:text-blue-400">Zin</span>
          {" = Z₁ + "}
          <span className="text-blue-600 dark:text-blue-400">Zrefl</span>
        </div>
        <div>
          <span className="text-teal-600 dark:text-teal-400">I₁</span>
          {" = Vs / |"}
          <span className="text-blue-600 dark:text-blue-400">Zin</span>
          {"|"}
        </div>
        <div>
          <span className="text-orange-500 dark:text-orange-400">I₂</span>
          {" = ωM · "}
          <span className="text-teal-600 dark:text-teal-400">I₁</span>
          {" / |Z₂|"}
        </div>
        <div>
          <span className="text-amber-600 dark:text-amber-400">η</span>
          {" = P₂ / P₁ = I₂²·R₂ / (I₁²·Re(Zin))"}
        </div>
      </div>

      {/* ── Substituted values ── */}
      <p className="mb-2 text-xs text-neutral-500 dark:text-neutral-400">
        {t(lang, "magSubstituted")}
      </p>
      <div className="mb-4 space-y-1.5 font-mono text-xs leading-relaxed text-neutral-700 dark:text-neutral-300">
        <div>
          {"ω = 2π · "}
          {fmt(f)}
          {" = "}
          <span className="font-medium">{fmtW}</span>
          {" rad/s"}
        </div>
        <div>
          <span className="text-violet-600 dark:text-violet-400">M</span>
          {` = ${k.toFixed(2)} · √(${fmt(L1)} · ${fmt(L2)}) = `}
          <span className="font-medium text-violet-600 dark:text-violet-400">
            {fmt(M, 2)} mH
          </span>
        </div>
        <div>{`XL₁ = ${fmtW} · ${fmt(L1 / 1000, 3)} = ${fmt(XL1, 2)} Ω`}</div>
        <div>{`XL₂ = ${fmtW} · ${fmt(L2 / 1000, 3)} = ${fmt(XL2, 2)} Ω`}</div>
        <div>{`XM  = ${fmtW} · ${fmt(M / 1000, 4)} = ${fmt(XM, 2)} Ω`}</div>
        <div>{`|Z₂| = √(${fmt(R2)}² + ${fmt(XL2, 2)}²) = ${fmt(Z2, 2)} Ω`}</div>
        <div>
          {"|"}
          <span className="text-blue-600 dark:text-blue-400">Zin</span>
          {`| = ${fmt(Zin, 2)} Ω   φ₁ = ${fmt(phi1, 1)}°`}
        </div>
        <div>
          <span className="text-teal-600 dark:text-teal-400">I₁</span>
          {` = ${fmt(Vs)} / ${fmt(Zin, 2)} = `}
          <span className="font-medium text-teal-600 dark:text-teal-400">
            {fmt(I1, 3)} A
          </span>
        </div>
        <div>
          <span className="text-orange-500 dark:text-orange-400">I₂</span>
          {` = ${fmt(XM, 2)} · ${fmt(I1, 3)} / ${fmt(Z2, 2)} = `}
          <span className="font-medium text-orange-500 dark:text-orange-400">
            {fmt(I2, 3)} A
          </span>
        </div>
        <div>
          <span className="text-amber-600 dark:text-amber-400">η</span>
          {` = ${fmt(P2, 2)} / ${fmt(P1, 2)} = `}
          <span className="font-medium text-amber-600 dark:text-amber-400">
            {etaStr}
          </span>
        </div>
      </div>

      {/* ── Waveforms ── */}
      <p className="mb-2 text-xs text-neutral-500 dark:text-neutral-400">
        {t(lang, "magWaveformsTitle")}
      </p>
      <div className="space-y-1.5 font-mono text-xs leading-relaxed text-neutral-700 dark:text-neutral-300">
        <div>
          <span className="font-semibold text-blue-500">vs(t)</span>
          {` = ${fmt(Vs * Math.SQRT2, 2)} · sin(${fmtW}·t)`}
          <span className="ml-1 text-neutral-400 dark:text-neutral-500">V</span>
        </div>
        {I1 > 1e-9 && (
          <div>
            <span className="font-semibold text-teal-500">i₁(t)</span>
            {` = ${fmt(I1 * Math.SQRT2, 3)} · sin(${fmtW}·t${phaseStr(phi1)})`}
            <span className="ml-1 text-neutral-400 dark:text-neutral-500">
              A
            </span>
          </div>
        )}
        {I2 > 1e-9 && (
          <div>
            <span className="font-semibold text-orange-500">i₂(t)</span>
            {` = ${fmt(I2 * Math.SQRT2, 3)} · sin(${fmtW}·t${phaseStr(phi2)})`}
            <span className="ml-1 text-neutral-400 dark:text-neutral-500">
              A
            </span>
          </div>
        )}
      </div>
    </div>
  );
}
