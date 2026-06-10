"use client";
import { useRLC } from "@/store/rlc-store";
import { useUI } from "@/store/ui-store";
import { t } from "@/lib/i18n";
import { fmt } from "@/lib/utils";

export function WaveformEquations() {
  const {
    state: { params, results, circuitType },
  } = useRLC();
  const {
    state: { lang },
  } = useUI();
  const { Vs, R, f } = params;
  const { I, phi } = results;

  const omega = 2 * Math.PI * f;
  const Vpeak = Vs * Math.SQRT2;
  const Ipeak = I * Math.SQRT2;
  const VRpeak = I * R * Math.SQRT2;
  const phiRad = (phi * Math.PI) / 180;
  const absPhiRad = Math.abs(phiRad);
  const phiSign = phiRad >= 0 ? " − " : " + ";
  const phiStr = absPhiRad < 0.001 ? "" : `${phiSign}${fmt(absPhiRad, 3)}`;

  return (
    <div className="mb-3 rounded-lg bg-neutral-50 p-3 dark:bg-neutral-800/50">
      <p className="mb-2 text-xs font-medium tracking-wider text-neutral-400 uppercase">
        {t(lang, "waveformEqsTitle")}
      </p>
      <div className="space-y-1.5 font-mono text-sm">
        <div className="flex flex-wrap items-baseline gap-1.5">
          <span className="font-semibold text-blue-500">u(t)</span>
          <span className="text-neutral-400">=</span>
          <span className="text-neutral-700 dark:text-neutral-300">
            {fmt(Vpeak, 2)} · sin({fmt(omega, 1)}·t)
          </span>
          <span className="text-xs text-neutral-400">V</span>
        </div>
        <div className="flex flex-wrap items-baseline gap-1.5">
          <span className="font-semibold text-teal-500">i(t)</span>
          <span className="text-neutral-400">=</span>
          <span className="text-neutral-700 dark:text-neutral-300">
            {fmt(Ipeak, 3)} · sin({fmt(omega, 1)}·t{phiStr})
          </span>
          <span className="text-xs text-neutral-400">A</span>
        </div>
        {circuitType === "series" && (
          <div className="flex flex-wrap items-baseline gap-1.5">
            <span className="font-semibold text-orange-500">v&#8336;(t)</span>
            <span className="text-neutral-400">=</span>
            <span className="text-neutral-700 dark:text-neutral-300">
              {fmt(VRpeak, 2)} · sin({fmt(omega, 1)}·t{phiStr})
            </span>
            <span className="text-xs text-neutral-400">V</span>
          </div>
        )}
      </div>
    </div>
  );
}
