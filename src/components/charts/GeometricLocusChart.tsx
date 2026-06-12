"use client";
import { useEffect, useRef, useState, useMemo } from "react";
import { useRLC } from "@/store/rlc-store";
import { useUI } from "@/store/ui-store";
import { t } from "@/lib/i18n";
import { calcRLocus, calcCLocus } from "@/lib/rlc-engine";
import type { LocusPoint } from "@/lib/rlc-engine";
import { cn } from "@/lib/utils";

const SIZE = 300;
const MAX_STAGE = 3;
const ANIM_MS = 900;

const C_LOCUS = "#378ADD";
const C_CURRENT = "#C0392B";
const C_MAX_P = "#D85A30";
const C_RESONANCE = "#1D9E75";
const C_ANCHOR = "#6B7280";

function dot(
  ctx: CanvasRenderingContext2D,
  x: number,
  y: number,
  r: number,
  color: string,
) {
  ctx.save();
  ctx.fillStyle = color;
  ctx.beginPath();
  ctx.arc(x, y, r, 0, 2 * Math.PI);
  ctx.fill();
  ctx.restore();
}

function arrow(
  ctx: CanvasRenderingContext2D,
  ox: number,
  oy: number,
  ex: number,
  ey: number,
  color: string,
  lw = 2,
) {
  const len = Math.hypot(ex - ox, ey - oy);
  if (len < 1) return;
  ctx.save();
  ctx.strokeStyle = color;
  ctx.fillStyle = color;
  ctx.lineWidth = lw;
  ctx.beginPath();
  ctx.moveTo(ox, oy);
  ctx.lineTo(ex, ey);
  ctx.stroke();
  if (len > 8) {
    const a = Math.atan2(ey - oy, ex - ox);
    ctx.beginPath();
    ctx.moveTo(ex, ey);
    ctx.lineTo(ex - 9 * Math.cos(a - 0.4), ey - 9 * Math.sin(a - 0.4));
    ctx.lineTo(ex - 9 * Math.cos(a + 0.4), ey - 9 * Math.sin(a + 0.4));
    ctx.closePath();
    ctx.fill();
  }
  ctx.restore();
}

function dashed(
  ctx: CanvasRenderingContext2D,
  x0: number,
  y0: number,
  x1: number,
  y1: number,
  color: string,
) {
  ctx.save();
  ctx.strokeStyle = color;
  ctx.lineWidth = 1;
  ctx.setLineDash([4, 3]);
  ctx.beginPath();
  ctx.moveTo(x0, y0);
  ctx.lineTo(x1, y1);
  ctx.stroke();
  ctx.setLineDash([]);
  ctx.restore();
}

function label(
  ctx: CanvasRenderingContext2D,
  text: string,
  x: number,
  y: number,
  color: string,
  font = "10px sans-serif",
) {
  ctx.save();
  ctx.fillStyle = color;
  ctx.font = font;
  ctx.fillText(text, x, y);
  ctx.restore();
}

export function GeometricLocusChart() {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const rafRef = useRef<number>(0);

  const {
    state: { params, circuitType, flags, results },
  } = useRLC();
  const {
    state: { lang },
  } = useUI();

  const [variable, setVariable] = useState<"R" | "C">("R");
  const [stage, setStage] = useState(0);
  const [animProgress, setAnimProgress] = useState(1);

  // Reset to stage 0 when the circuit changes
  useEffect(() => {
    setStage(0);
    setAnimProgress(1);
  }, [params, circuitType, flags, variable]);

  const locusPoints = useMemo<LocusPoint[]>(() => {
    return variable === "R"
      ? calcRLocus(params, circuitType, flags, 200)
      : calcCLocus(params, circuitType, flags, 200);
  }, [params, circuitType, flags, variable]);

  // Animate locus drawing when entering stage 2
  useEffect(() => {
    if (stage !== 2) return;
    cancelAnimationFrame(rafRef.current);
    setAnimProgress(0);
    const start = performance.now();
    function tick(now: number) {
      const p = Math.min((now - start) / ANIM_MS, 1);
      setAnimProgress(p);
      if (p < 1) rafRef.current = requestAnimationFrame(tick);
    }
    rafRef.current = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(rafRef.current);
  }, [stage]);

  // Canvas draw
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    const isDark = window.matchMedia("(prefers-color-scheme: dark)").matches;
    const axisAlpha = isDark ? "rgba(255,255,255,0.12)" : "rgba(0,0,0,0.1)";
    const labelClr = isDark ? "#9FA0A0" : "#888";
    const cx = SIZE / 2,
      cy = SIZE / 2;

    ctx.clearRect(0, 0, SIZE, SIZE);

    // Current operating point (same formula for both circuit types)
    const phiRad = (results.phi * Math.PI) / 180;
    const curRe = results.I * Math.cos(phiRad);
    const curIm = -results.I * Math.sin(phiRad);

    // Compute scale: fit all locus points + current point around the origin
    let maxAbs = Math.max(Math.abs(curRe), Math.abs(curIm), 1e-10);
    for (const p of locusPoints) {
      maxAbs = Math.max(maxAbs, Math.abs(p.I_re), Math.abs(p.I_im));
    }
    // Include series anchor points in scale if applicable
    if (circuitType === "series" && variable === "R") {
      const X = results.XL - results.XC;
      if (Math.abs(X) > 1e-9) maxAbs = Math.max(maxAbs, Math.abs(params.Vs / X));
    }
    if (circuitType === "series" && variable === "C") {
      maxAbs = Math.max(maxAbs, params.Vs / params.R);
    }
    const scale = (SIZE * 0.40) / maxAbs;
    const toX = (re: number) => cx + re * scale;
    const toY = (im: number) => cy - im * scale;

    // Axes
    ctx.strokeStyle = axisAlpha;
    ctx.lineWidth = 0.5;
    ctx.beginPath();
    ctx.moveTo(0, cy);
    ctx.lineTo(SIZE, cy);
    ctx.stroke();
    ctx.beginPath();
    ctx.moveTo(cx, 0);
    ctx.lineTo(cx, SIZE);
    ctx.stroke();
    label(ctx, "Re(I)", SIZE - 42, cy - 6, labelClr);
    label(ctx, "Im(I)", cx + 4, 12, labelClr);

    // Stage 1+: anchor construction
    if (stage >= 1) {
      if (circuitType === "series") {
        if (variable === "R") {
          const X = results.XL - results.XC;
          if (Math.abs(X) > 1e-9) {
            // Diameter: origin ↔ I(R→0) = (0, −Vs/X)
            const farRe = 0;
            const farIm = -params.Vs / X;
            dashed(ctx, cx, cy, toX(farRe), toY(farIm), C_ANCHOR);
            dot(ctx, cx, cy, 3, C_ANCHOR);
            dot(ctx, toX(farRe), toY(farIm), 3, C_ANCHOR);
            label(ctx, t(lang, "locusOrigin"), cx + 4, cy + 13, labelClr);
            label(ctx, "I(R→0)", toX(farRe) + 4, toY(farIm) - 4, labelClr);
          }
        } else {
          // Diameter: origin ↔ resonance point (Vs/R, 0)
          const resRe = params.Vs / params.R;
          dashed(ctx, cx, cy, toX(resRe), toY(0), C_ANCHOR);
          dot(ctx, cx, cy, 3, C_ANCHOR);
          dot(ctx, toX(resRe), toY(0), 3, C_ANCHOR);
          label(ctx, "C→0", cx + 4, cy + 13, labelClr);
          label(ctx, "Res.", toX(resRe) + 4, toY(0) - 4, labelClr);
        }
      } else {
        // Parallel: fixed component line
        if (variable === "R") {
          // Horizontal line at Im = curIm (= Vs·(BC−BL))
          const y_line = toY(curIm);
          dashed(ctx, 0, y_line, SIZE, y_line, C_ANCHOR);
          label(ctx, "Im(I) = cte", 4, y_line - 4, labelClr);
        } else {
          // Vertical line at Re = curRe (= Vs/R)
          const x_line = toX(curRe);
          dashed(ctx, x_line, 0, x_line, SIZE, C_ANCHOR);
          ctx.save();
          ctx.fillStyle = labelClr;
          ctx.font = "10px sans-serif";
          ctx.translate(x_line + 12, cy + 30);
          ctx.rotate(-Math.PI / 2);
          ctx.fillText("Re(I) = cte", 0, 0);
          ctx.restore();
        }
      }
    }

    // Stage 2+: draw locus (animated)
    if (stage >= 2 && locusPoints.length > 1) {
      const count = Math.max(2, Math.floor(animProgress * locusPoints.length));
      ctx.save();
      ctx.strokeStyle = C_LOCUS;
      ctx.lineWidth = 1.5;
      ctx.beginPath();
      ctx.moveTo(toX(locusPoints[0].I_re), toY(locusPoints[0].I_im));
      for (let i = 1; i < count; i++) {
        ctx.lineTo(toX(locusPoints[i].I_re), toY(locusPoints[i].I_im));
      }
      ctx.stroke();
      ctx.restore();
    }

    // Stage 3+: special points
    if (stage >= 3) {
      if (circuitType === "series") {
        if (variable === "R") {
          const X = results.XL - results.XC;
          if (Math.abs(X) > 1e-9) {
            // Max active power: R = |X|
            const Rmp = Math.abs(X);
            const dmp = Rmp * Rmp + X * X;
            const mpRe = (params.Vs * Rmp) / dmp;
            const mpIm = (-params.Vs * X) / dmp;
            dot(ctx, toX(mpRe), toY(mpIm), 4, C_MAX_P);
            label(ctx, t(lang, "locusMaxP"), toX(mpRe) + 5, toY(mpIm) - 4, C_MAX_P);
          }
        } else if (flags.hasL && flags.hasC) {
          // Resonance: XC = XL → I = Vs/R on real axis
          const resRe = params.Vs / params.R;
          dot(ctx, toX(resRe), toY(0), 4, C_RESONANCE);
          label(
            ctx,
            t(lang, "locusResonance"),
            toX(resRe) + 5,
            toY(0) - 4,
            C_RESONANCE,
          );
        }
      } else if (flags.hasL && flags.hasC) {
        // Parallel resonance: BC = BL → I purely real = Vs/R (minimum |I|)
        const resRe = params.Vs / params.R;
        dot(ctx, toX(resRe), toY(0), 4, C_RESONANCE);
        label(
          ctx,
          t(lang, "locusResonance"),
          toX(resRe) + 5,
          toY(0) - 4,
          C_RESONANCE,
        );
      }
    }

    // Current operating point — always on top
    const cpx = toX(curRe);
    const cpy = toY(curIm);
    arrow(ctx, cx, cy, cpx, cpy, C_CURRENT, 2.5);
    dot(ctx, cpx, cpy, 4, C_CURRENT);
    label(
      ctx,
      t(lang, "locusCurrentOp"),
      cpx + 5,
      cpy - 5,
      C_CURRENT,
      "bold 10px sans-serif",
    );
  }, [locusPoints, stage, animProgress, params, results, circuitType, flags, variable, lang]);

  function stageText(): string {
    if (stage === 0) return t(lang, "locusStage0");
    if (stage === 1) {
      if (circuitType === "series")
        return t(lang, variable === "R" ? "locusStage1_R" : "locusStage1_C");
      return t(
        lang,
        variable === "R" ? "locusStage1_Rpar" : "locusStage1_Cpar",
      );
    }
    if (stage === 2) return t(lang, "locusStage2");
    if (circuitType === "series")
      return t(lang, variable === "R" ? "locusStage3_R" : "locusStage3_C");
    return t(lang, variable === "R" ? "locusStage3_Rpar" : "locusStage3_Cpar");
  }

  const cDisabled = !flags.hasC;

  return (
    <div className="flex flex-col items-center gap-3">
      <div className="flex gap-1">
        {(["R", "C"] as const).map((v) => (
          <button
            key={v}
            onClick={() => setVariable(v)}
            disabled={v === "C" && cDisabled}
            className={cn(
              "rounded px-3 py-1 text-xs font-medium transition-colors",
              variable === v
                ? "bg-blue-500 text-white"
                : "bg-neutral-100 text-neutral-600 hover:bg-neutral-200 dark:bg-neutral-700 dark:text-neutral-300 dark:hover:bg-neutral-600",
              v === "C" && cDisabled && "cursor-not-allowed opacity-40",
            )}
          >
            {t(lang, v === "R" ? "locusVarR" : "locusVarC")}
          </button>
        ))}
      </div>

      <canvas ref={canvasRef} width={SIZE} height={SIZE} className="block" />

      <p className="max-w-xs text-center text-xs text-neutral-500 dark:text-neutral-400">
        {stageText()}
        {variable === "C" && !flags.hasC && (
          <span className="mt-1 block text-amber-600 dark:text-amber-400">
            {t(lang, "locusNoC")}
          </span>
        )}
      </p>

      <div className="flex items-center gap-3">
        <button
          onClick={() => setStage((s) => s - 1)}
          disabled={stage === 0}
          className="rounded px-3 py-1 text-xs font-medium transition-colors disabled:cursor-not-allowed disabled:opacity-40 bg-neutral-100 text-neutral-600 hover:bg-neutral-200 dark:bg-neutral-700 dark:text-neutral-300 dark:hover:bg-neutral-600"
        >
          {t(lang, "locusPrev")}
        </button>
        <span className="text-xs text-neutral-400">
          {stage + 1} / {MAX_STAGE + 1}
        </span>
        <button
          onClick={() => setStage((s) => s + 1)}
          disabled={stage === MAX_STAGE}
          className="rounded px-3 py-1 text-xs font-medium transition-colors disabled:cursor-not-allowed disabled:opacity-40 bg-neutral-100 text-neutral-600 hover:bg-neutral-200 dark:bg-neutral-700 dark:text-neutral-300 dark:hover:bg-neutral-600"
        >
          {t(lang, "locusNext")}
        </button>
      </div>
    </div>
  );
}
