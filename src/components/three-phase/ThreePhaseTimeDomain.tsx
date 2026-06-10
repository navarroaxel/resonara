"use client";
import { useEffect, useRef } from "react";
import { useThreePhase } from "@/store/three-phase-store";
import { useUI } from "@/store/ui-store";
import { t } from "@/lib/i18n";
import { fmt } from "@/lib/utils";

const TWO_PI_OVER_3 = (2 * Math.PI) / 3;

function offsetStr(subtractRad: number): string {
  if (Math.abs(subtractRad) < 1e-4) return "";
  const sign = subtractRad > 0 ? " − " : " + ";
  return `${sign}${fmt(Math.abs(subtractRad), 3)}`;
}

const W = 580;
const H = 260;
const TWO_PI = 2 * Math.PI;
const SAMPLES = 200;
const CYCLES = 2;

const PHASE_COLORS = ["#E53E3E", "#D69E2E", "#3182CE"] as const;

export function ThreePhaseTimeDomain() {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const {
    state: { results, params },
  } = useThreePhase();
  const {
    state: { lang },
  } = useUI();

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    const isDark = window.matchMedia("(prefers-color-scheme: dark)").matches;
    const textC = isDark ? "#9FA0A0" : "#888";
    const gridC = isDark ? "rgba(255,255,255,0.07)" : "rgba(0,0,0,0.07)";

    ctx.clearRect(0, 0, W, H);

    const { V_ph, I_ph, phi } = results;
    const { f } = params;
    const pad = { top: 28, right: 52, bottom: 36, left: 52 };
    const plotW = W - pad.left - pad.right;
    const plotH = H - pad.top - pad.bottom;

    const w = TWO_PI * f;
    const T = 1 / f;
    const phiRad = (phi * Math.PI) / 180;
    const V_peak = V_ph * Math.SQRT2;
    const I_peak = I_ph * Math.SQRT2;
    const vMax = V_peak || 1;
    const iMax = I_peak || 1;

    const toX = (idx: number) => pad.left + (idx / SAMPLES) * plotW;
    const toYv = (v: number) => pad.top + (1 - (v + vMax) / (2 * vMax)) * plotH;
    const toYi = (i: number) => pad.top + (1 - (i + iMax) / (2 * iMax)) * plotH;

    // Grid
    for (let i = 0; i <= 4; i++) {
      const y = pad.top + (i / 4) * plotH;
      ctx.strokeStyle = gridC;
      ctx.lineWidth = 0.5;
      ctx.beginPath();
      ctx.moveTo(pad.left, y);
      ctx.lineTo(W - pad.right, y);
      ctx.stroke();
    }

    ctx.strokeStyle = isDark ? "rgba(255,255,255,0.15)" : "rgba(0,0,0,0.12)";
    ctx.lineWidth = 0.5;
    ctx.beginPath();
    ctx.moveTo(pad.left, toYv(0));
    ctx.lineTo(W - pad.right, toYv(0));
    ctx.stroke();

    // X axis ticks
    ctx.font = "10px sans-serif";
    ctx.textAlign = "center";
    ctx.fillStyle = textC;
    for (let i = 0; i <= 4; i++) {
      const tMs = (CYCLES * T * 1000 * i) / 4;
      ctx.fillText(tMs.toFixed(1), toX((i * SAMPLES) / 4), H - pad.bottom + 14);
    }
    ctx.fillText(t(lang, "timeAxisLabel"), W / 2, H - 4);

    // Y axis labels (voltage left, current right)
    ctx.textAlign = "right";
    ctx.fillStyle = "#9FA0A0";
    ctx.fillText(`${vMax.toFixed(1)}`, pad.left - 6, pad.top + 4);
    ctx.fillText("0", pad.left - 6, toYv(0) + 4);
    ctx.fillText(`-${vMax.toFixed(1)}`, pad.left - 6, H - pad.bottom);
    ctx.save();
    ctx.translate(12, H / 2);
    ctx.rotate(-Math.PI / 2);
    ctx.textAlign = "center";
    ctx.fillText("V", 0, 0);
    ctx.restore();

    ctx.textAlign = "left";
    ctx.fillStyle = "#9FA0A0";
    ctx.fillText(`${iMax.toFixed(3)}`, W - pad.right + 6, pad.top + 4);
    ctx.fillText("0", W - pad.right + 6, toYi(0) + 4);
    ctx.fillText(`-${iMax.toFixed(3)}`, W - pad.right + 6, H - pad.bottom);
    ctx.save();
    ctx.translate(W - 12, H / 2);
    ctx.rotate(Math.PI / 2);
    ctx.textAlign = "center";
    ctx.fillText("A", 0, 0);
    ctx.restore();

    const phaseOffsets = [0, -TWO_PI / 3, TWO_PI / 3];

    // Voltage curves (solid)
    phaseOffsets.forEach((offset, i) => {
      ctx.strokeStyle = PHASE_COLORS[i];
      ctx.lineWidth = 2;
      ctx.lineJoin = "round";
      ctx.setLineDash([]);
      ctx.beginPath();
      for (let s = 0; s <= SAMPLES; s++) {
        const t = (CYCLES * T * s) / SAMPLES;
        const v = V_peak * Math.sin(w * t + offset);
        if (s === 0) ctx.moveTo(toX(s), toYv(v));
        else ctx.lineTo(toX(s), toYv(v));
      }
      ctx.stroke();
    });

    // Current curves (dashed)
    phaseOffsets.forEach((offset, i) => {
      ctx.strokeStyle = PHASE_COLORS[i];
      ctx.lineWidth = 1.5;
      ctx.setLineDash([5, 3]);
      ctx.beginPath();
      for (let s = 0; s <= SAMPLES; s++) {
        const t = (CYCLES * T * s) / SAMPLES;
        const v = I_peak * Math.sin(w * t + offset - phiRad);
        if (s === 0) ctx.moveTo(toX(s), toYi(v));
        else ctx.lineTo(toX(s), toYi(v));
      }
      ctx.stroke();
    });
    ctx.setLineDash([]);

    // Legend
    const legendItems: [string, string, boolean][] = [
      [PHASE_COLORS[0], "vR(t)", false],
      [PHASE_COLORS[1], "vS(t)", false],
      [PHASE_COLORS[2], "vT(t)", false],
      [PHASE_COLORS[0], "iR(t)", true],
      [PHASE_COLORS[1], "iS(t)", true],
      [PHASE_COLORS[2], "iT(t)", true],
    ];
    ctx.font = "10px sans-serif";
    ctx.textAlign = "left";
    legendItems.forEach(([color, label, dashed], i) => {
      const row = Math.floor(i / 3);
      const col = i % 3;
      const lx = pad.left + col * 84;
      const ly = pad.top - 14 + row * 14;
      ctx.strokeStyle = color;
      ctx.lineWidth = dashed ? 1.5 : 2;
      if (dashed) ctx.setLineDash([4, 2]);
      ctx.beginPath();
      ctx.moveTo(lx, ly);
      ctx.lineTo(lx + 18, ly);
      ctx.stroke();
      ctx.setLineDash([]);
      ctx.fillStyle = color;
      ctx.fillText(label, lx + 22, ly + 4);
    });
  }, [results, params, lang]);

  const { V_ph, I_ph, phi } = results;
  const w = 2 * Math.PI * params.f;
  const fmtW = fmt(w, 2);
  const phiRad = (phi * Math.PI) / 180;
  const V_peak = V_ph * Math.SQRT2;
  const I_peak = I_ph * Math.SQRT2;

  return (
    <div>
      <canvas
        ref={canvasRef}
        width={W}
        height={H}
        className="w-full"
        aria-label={t(lang, "timeDomainTab")}
      />

      <div className="mt-4 border-t border-neutral-100 pt-4 dark:border-neutral-800">
        <p className="mb-2 text-xs text-neutral-500 dark:text-neutral-400">
          {t(lang, "threePhaseGeneralForm")}
        </p>
        <div className="mb-4 space-y-1.5 font-mono text-xs leading-relaxed text-neutral-700 dark:text-neutral-300">
          <div role="img" aria-label={t(lang, "ariaVRFormula")}>
            <span className="font-semibold text-red-500">v_R(t)</span>
            {" = V̂ · sin(ωt)"}
            <span className="ml-1 text-neutral-400 dark:text-neutral-500">
              V
            </span>
          </div>
          <div role="img" aria-label={t(lang, "ariaVSFormula")}>
            <span className="font-semibold text-amber-500">v_S(t)</span>
            {" = V̂ · sin(ωt − 2π/3)"}
            <span className="ml-1 text-neutral-400 dark:text-neutral-500">
              V
            </span>
          </div>
          <div role="img" aria-label={t(lang, "ariaVTFormula")}>
            <span className="font-semibold text-blue-500">v_T(t)</span>
            {" = V̂ · sin(ωt + 2π/3)"}
            <span className="ml-1 text-neutral-400 dark:text-neutral-500">
              V
            </span>
          </div>
          <div
            className="mt-1.5 border-t border-neutral-100 pt-1.5 dark:border-neutral-800"
            role="img"
            aria-label={t(lang, "ariaIRFormula")}
          >
            <span className="font-semibold text-red-500">i_R(t)</span>
            {" = Î · sin(ωt − φ)"}
            <span className="ml-1 text-neutral-400 dark:text-neutral-500">
              A
            </span>
          </div>
          <div role="img" aria-label={t(lang, "ariaISFormula")}>
            <span className="font-semibold text-amber-500">i_S(t)</span>
            {" = Î · sin(ωt − φ − 2π/3)"}
            <span className="ml-1 text-neutral-400 dark:text-neutral-500">
              A
            </span>
          </div>
          <div role="img" aria-label={t(lang, "ariaITFormula")}>
            <span className="font-semibold text-blue-500">i_T(t)</span>
            {" = Î · sin(ωt − φ + 2π/3)"}
            <span className="ml-1 text-neutral-400 dark:text-neutral-500">
              A
            </span>
          </div>
        </div>

        <p className="mb-2 text-xs text-neutral-500 dark:text-neutral-400">
          {t(lang, "threePhaseSubstituted")}
        </p>
        <div className="space-y-1.5 font-mono text-xs leading-relaxed text-neutral-700 dark:text-neutral-300">
          <div>{`ω = ${fmtW} rad/s   V̂ = ${fmt(V_peak, 2)} V   Î = ${fmt(I_peak, 3)} A`}</div>
          <div>
            <span className="font-semibold text-red-500">v_R(t)</span>
            {` = ${fmt(V_peak, 2)} · sin(${fmtW}·t)`}
            <span className="ml-1 text-neutral-400 dark:text-neutral-500">
              V
            </span>
          </div>
          <div>
            <span className="font-semibold text-amber-500">v_S(t)</span>
            {` = ${fmt(V_peak, 2)} · sin(${fmtW}·t − ${fmt(TWO_PI_OVER_3, 3)})`}
            <span className="ml-1 text-neutral-400 dark:text-neutral-500">
              V
            </span>
          </div>
          <div>
            <span className="font-semibold text-blue-500">v_T(t)</span>
            {` = ${fmt(V_peak, 2)} · sin(${fmtW}·t + ${fmt(TWO_PI_OVER_3, 3)})`}
            <span className="ml-1 text-neutral-400 dark:text-neutral-500">
              V
            </span>
          </div>
          <div className="mt-1.5 border-t border-neutral-100 pt-1.5 dark:border-neutral-800">
            <span className="font-semibold text-red-500">i_R(t)</span>
            {` = ${fmt(I_peak, 3)} · sin(${fmtW}·t${offsetStr(phiRad)})`}
            <span className="ml-1 text-neutral-400 dark:text-neutral-500">
              A
            </span>
          </div>
          <div>
            <span className="font-semibold text-amber-500">i_S(t)</span>
            {` = ${fmt(I_peak, 3)} · sin(${fmtW}·t${offsetStr(phiRad + TWO_PI_OVER_3)})`}
            <span className="ml-1 text-neutral-400 dark:text-neutral-500">
              A
            </span>
          </div>
          <div>
            <span className="font-semibold text-blue-500">i_T(t)</span>
            {` = ${fmt(I_peak, 3)} · sin(${fmtW}·t${offsetStr(phiRad - TWO_PI_OVER_3)})`}
            <span className="ml-1 text-neutral-400 dark:text-neutral-500">
              A
            </span>
          </div>
        </div>
      </div>
    </div>
  );
}
