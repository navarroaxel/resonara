"use client";
import { useEffect, useRef } from "react";
import { useThreePhase } from "@/store/three-phase-store";
import { useUI } from "@/store/ui-store";
import { t } from "@/lib/i18n";

const SIZE = 320;
const TWO_PI = 2 * Math.PI;

const PHASE_COLORS = ["#E53E3E", "#D69E2E", "#3182CE"] as const;
const PHASE_LABELS = ["R", "S", "T"] as const;
// Relative spacing between phases; U_R sits at ROT (90°, per the course
// guide) and the rest of the diagram is built from that reference.
const PHASE_ANGLES = [0, -TWO_PI / 3, TWO_PI / 3] as const;
const ROT = Math.PI / 2;

function fillPiece(
  ctx: CanvasRenderingContext2D,
  x: number,
  y: number,
  text: string,
  font: string,
) {
  ctx.font = font;
  ctx.fillText(text, x, y);
  return x + ctx.measureText(text).width;
}

function fillSubscript(
  ctx: CanvasRenderingContext2D,
  x: number,
  y: number,
  base: string,
  sub: string,
) {
  const afterBase = fillPiece(ctx, x, y, base, "bold 12px sans-serif");
  return fillPiece(ctx, afterBase, y + 3, sub, "bold 9px sans-serif");
}

function drawArrow(
  ctx: CanvasRenderingContext2D,
  ox: number,
  oy: number,
  ex: number,
  ey: number,
  color: string,
  base: string,
  sub: string,
  dashed = false,
  labelDx = 6,
  labelDy = -4,
) {
  ctx.save();
  ctx.strokeStyle = color;
  ctx.fillStyle = color;
  ctx.lineWidth = dashed ? 1.5 : 2;
  if (dashed) ctx.setLineDash([5, 3]);
  ctx.beginPath();
  ctx.moveTo(ox, oy);
  ctx.lineTo(ex, ey);
  ctx.stroke();
  ctx.setLineDash([]);
  const angle = Math.atan2(ey - oy, ex - ox);
  ctx.beginPath();
  ctx.moveTo(ex, ey);
  ctx.lineTo(ex - 10 * Math.cos(angle - 0.4), ey - 10 * Math.sin(angle - 0.4));
  ctx.lineTo(ex - 10 * Math.cos(angle + 0.4), ey - 10 * Math.sin(angle + 0.4));
  ctx.closePath();
  ctx.fill();
  fillSubscript(ctx, ex + labelDx, ey + labelDy, base, sub);
  ctx.restore();
}

export function ThreePhasePhasorDiagram() {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const {
    state: { results, params, flags },
  } = useThreePhase();
  const {
    state: { lang },
  } = useUI();

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    const isDark = document.documentElement.classList.contains("dark");
    const cx = SIZE / 2,
      cy = SIZE / 2;

    ctx.clearRect(0, 0, SIZE, SIZE);

    ctx.strokeStyle = isDark ? "rgba(255,255,255,0.12)" : "rgba(0,0,0,0.1)";
    ctx.lineWidth = 0.5;
    ctx.beginPath();
    ctx.moveTo(0, cy);
    ctx.lineTo(SIZE, cy);
    ctx.stroke();
    ctx.beginPath();
    ctx.moveTo(cx, 0);
    ctx.lineTo(cx, SIZE);
    ctx.stroke();

    ctx.fillStyle = isDark ? "#E5E5E5" : "#1A1A1A";
    ctx.font = "11px sans-serif";
    ctx.fillText("Re", SIZE - 18, cy - 6);
    ctx.fillText("Im", cx + 4, 12);

    const { I_L, phi_total, I_RC } = results;
    const V_ph = params.VL / Math.sqrt(3);
    const phiRad = (phi_total * Math.PI) / 180;

    const vScale = (SIZE * 0.38) / (V_ph || 1);
    const iScale = (SIZE * 0.3) / (I_L || 1);

    const phaseTips = PHASE_ANGLES.map((baseAngle) => {
      const angle = baseAngle + ROT;
      return {
        x: cx + V_ph * vScale * Math.cos(angle),
        y: cy - V_ph * vScale * Math.sin(angle),
      };
    });

    const PHASE_VOLTAGE_LABEL_DX = [-24, 6, 6]; // R, S, T — pull R left
    const PHASE_VOLTAGE_LABEL_DY = [-4, 14, 14]; // R, S, T — push S/T down
    PHASE_ANGLES.forEach((_baseAngle, i) => {
      const color = PHASE_COLORS[i];
      const label = PHASE_LABELS[i];
      drawArrow(
        ctx,
        cx,
        cy,
        phaseTips[i].x,
        phaseTips[i].y,
        color,
        "U",
        label,
        false,
        PHASE_VOLTAGE_LABEL_DX[i],
        PHASE_VOLTAGE_LABEL_DY[i],
      );
    });

    PHASE_ANGLES.forEach((baseAngle, i) => {
      const angle = baseAngle + ROT;
      const color = PHASE_COLORS[i];
      const label = PHASE_LABELS[i];
      const iAngle = angle - phiRad;
      const ex = cx + I_L * iScale * Math.cos(iAngle);
      const ey = cy - I_L * iScale * Math.sin(iAngle);
      drawArrow(ctx, cx, cy, ex, ey, color, "I", label, true);
    });

    // Line-to-line voltages U_RS, U_ST, U_TR — drawn the way the professor
    // does it: as the segment joining the tip of one phase voltage to the
    // tip of the next (U_RS = U_R − U_S, i.e. from U_S's tip to U_R's tip).
    const LINE_PAIRS: [number, number, string, string, number][] = [
      [1, 0, "RS", PHASE_COLORS[0], 6],
      [2, 1, "ST", PHASE_COLORS[1], 6],
      [0, 2, "TR", PHASE_COLORS[2], -34],
    ];
    LINE_PAIRS.forEach(([fromIdx, toIdx, sub, color, labelDx]) => {
      const from = phaseTips[fromIdx];
      const to = phaseTips[toIdx];
      drawArrow(
        ctx,
        from.x,
        from.y,
        to.x,
        to.y,
        color,
        "U",
        sub,
        false,
        labelDx,
      );
    });

    // Capacitor bank line currents I_RC, I_SC, I_TC — fixed 90° ahead of
    // the associated line-to-line voltage's own 30° lead (see engine),
    // so their angle is independent of the load's phi. Only shown while
    // the bank is actually connected.
    if (flags.capacitorsOn) {
      const CAP_SUBS = ["RC", "SC", "TC"];
      PHASE_ANGLES.forEach((baseAngle, i) => {
        const angle = baseAngle + ROT + Math.PI / 2;
        const color = PHASE_COLORS[i];
        const ex = cx + I_RC * iScale * Math.cos(angle);
        const ey = cy - I_RC * iScale * Math.sin(angle);
        drawArrow(ctx, cx, cy, ex, ey, color, "I", CAP_SUBS[i], true);
      });
    }

    PHASE_LABELS.forEach((label, i) => {
      const y = 18 + i * 16;
      ctx.fillStyle = PHASE_COLORS[i];
      ctx.fillRect(8, 8 + i * 16, 10, 10);
      ctx.fillStyle = isDark ? "#E5E5E5" : "#1A1A1A";
      let x = fillSubscript(ctx, 22, y, "U", label);
      x = fillPiece(ctx, x, y, " / ", "11px sans-serif");
      fillSubscript(ctx, x, y, "I", label);
    });
    ctx.fillStyle = isDark ? "#E5E5E5" : "#1A1A1A";
    ctx.font = "10px sans-serif";
    ctx.fillText("— U  ╌╌ I", 8, 8 + 3 * 16 + 10);
  }, [results, params, flags.capacitorsOn]);

  return (
    <canvas
      ref={canvasRef}
      width={SIZE}
      height={SIZE}
      className="mx-auto block"
      aria-label={t(lang, "threePhasePhasorAriaLabel")}
    />
  );
}
