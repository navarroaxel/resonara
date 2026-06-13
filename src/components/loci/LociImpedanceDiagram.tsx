"use client";
import { useEffect, useRef } from "react";
import { useUI } from "@/store/ui-store";
import { t } from "@/lib/i18n";

const W = 300,
  H = 360;
// Origin positioned to fit both Z1 (110px up) and Z2 (138px down)
const CX = 60,
  CY = 170;
const SCALE = 5.5; // px per ohm

// Z1 = 10 + j20 Ω  → tip at (CX+55, CY-110) = (115, 60)
// Z2 = -j25 Ω      → tip at (CX, CY+137.5) = (60, 307.5)

function drawArrow(
  ctx: CanvasRenderingContext2D,
  ox: number,
  oy: number,
  ex: number,
  ey: number,
  color: string,
  label: string,
  labelDx = 6,
  labelDy = -4,
) {
  ctx.save();
  ctx.strokeStyle = color;
  ctx.fillStyle = color;
  ctx.lineWidth = 2;
  ctx.beginPath();
  ctx.moveTo(ox, oy);
  ctx.lineTo(ex, ey);
  ctx.stroke();
  const angle = Math.atan2(ey - oy, ex - ox);
  ctx.beginPath();
  ctx.moveTo(ex, ey);
  ctx.lineTo(ex - 10 * Math.cos(angle - 0.4), ey - 10 * Math.sin(angle - 0.4));
  ctx.lineTo(ex - 10 * Math.cos(angle + 0.4), ey - 10 * Math.sin(angle + 0.4));
  ctx.closePath();
  ctx.fill();
  ctx.font = "bold 12px sans-serif";
  ctx.fillText(label, ex + labelDx, ey + labelDy);
  ctx.restore();
}

function drawDashed(
  ctx: CanvasRenderingContext2D,
  x1: number,
  y1: number,
  x2: number,
  y2: number,
  color: string,
) {
  ctx.save();
  ctx.strokeStyle = color;
  ctx.lineWidth = 1.5;
  ctx.setLineDash([5, 4]);
  ctx.beginPath();
  ctx.moveTo(x1, y1);
  ctx.lineTo(x2, y2);
  ctx.stroke();
  ctx.setLineDash([]);
  ctx.restore();
}

function rightAngleMark(
  ctx: CanvasRenderingContext2D,
  x: number,
  y: number,
  size: number,
  c: string,
) {
  ctx.save();
  ctx.strokeStyle = c;
  ctx.lineWidth = 1;
  ctx.beginPath();
  ctx.moveTo(x, y - size);
  ctx.lineTo(x + size, y - size);
  ctx.lineTo(x + size, y);
  ctx.stroke();
  ctx.restore();
}

export function LociImpedanceDiagram({ step }: { step: number }) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const {
    state: { lang },
  } = useUI();

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    const isDark = window.matchMedia("(prefers-color-scheme: dark)").matches;
    ctx.clearRect(0, 0, W, H);

    const gridC = isDark ? "rgba(255,255,255,0.12)" : "rgba(0,0,0,0.1)";
    const axisLblC = isDark ? "#9FA0A0" : "#888";
    const z1C = isDark ? "#AFA9EC" : "#7F77DD"; // Z1 vector (violet)
    const rC = isDark ? "#F0997B" : "#D85A30"; // R component (orange)
    const z2C = isDark ? "#5DCAA5" : "#1D9E75"; // Z2 (teal)

    // ── Axes ───────────────────────────────────────────────────────────────────
    ctx.strokeStyle = gridC;
    ctx.lineWidth = 0.5;
    ctx.beginPath();
    ctx.moveTo(0, CY);
    ctx.lineTo(W, CY);
    ctx.stroke();
    ctx.beginPath();
    ctx.moveTo(CX, 0);
    ctx.lineTo(CX, H);
    ctx.stroke();

    ctx.fillStyle = axisLblC;
    ctx.font = "11px sans-serif";
    ctx.textAlign = "left";
    ctx.fillText("Re(Z)", W - 46, CY - 6);
    ctx.textAlign = "center";
    ctx.fillText("jX", CX, 12);

    // Title
    ctx.fillStyle = isDark ? "#D4D4D4" : "#404040";
    ctx.font = "bold 11px sans-serif";
    ctx.textAlign = "right";
    ctx.fillText(t(lang, "lociZPlaneAriaLabel"), W - 6, 14);

    // Origin label
    ctx.fillStyle = axisLblC;
    ctx.font = "10px sans-serif";
    ctx.textAlign = "right";
    ctx.fillText("0", CX - 4, CY + 12);

    // ── Step 1+: Z1 vector and components ─────────────────────────────────────
    if (step >= 1) {
      const z1x = CX + 10 * SCALE; // R=10Ω → 55px right
      const z1y = CY - 20 * SCALE; // X=20Ω → 110px up

      // Dashed components
      drawDashed(ctx, CX, CY, z1x, CY, rC); // R=10 horizontal
      drawDashed(ctx, z1x, CY, z1x, z1y, z1C); // X=20 vertical

      // Right-angle mark at (z1x, CY)
      rightAngleMark(ctx, z1x, CY, 7, axisLblC);

      // Component labels
      ctx.save();
      ctx.fillStyle = rC;
      ctx.font = "10px sans-serif";
      ctx.textAlign = "center";
      ctx.fillText("R=10Ω", CX + (z1x - CX) / 2, CY + 14);
      ctx.fillStyle = z1C;
      ctx.textAlign = "left";
      ctx.fillText("XL=20Ω", z1x + 4, CY - (CY - z1y) / 2);
      ctx.restore();

      // Angle arc
      const arcR = 28;
      const endAngle = -Math.atan2(20 * SCALE, 10 * SCALE);
      ctx.save();
      ctx.strokeStyle = axisLblC;
      ctx.lineWidth = 1;
      ctx.beginPath();
      ctx.arc(CX, CY, arcR, endAngle, 0);
      ctx.stroke();
      ctx.fillStyle = axisLblC;
      ctx.font = "10px sans-serif";
      ctx.textAlign = "left";
      ctx.fillText("φ₁≈63°", CX + arcR + 4, CY - 6);
      ctx.restore();

      // Z1 vector
      drawArrow(ctx, CX, CY, z1x, z1y, z1C, "Z₁", 6, -6);

      // |Z1| label near midpoint
      ctx.save();
      ctx.fillStyle = z1C;
      ctx.font = "10px sans-serif";
      ctx.textAlign = "right";
      ctx.fillText("|Z₁|≈22.4Ω", z1x - 6, z1y + (CY - z1y) / 2 - 4);
      ctx.restore();
    }

    // ── Step 7+: Z2 vector downward ────────────────────────────────────────────
    if (step >= 7) {
      const z2y = CY + 25 * SCALE; // Xc=25 → 137.5px down
      drawArrow(ctx, CX, CY, CX, z2y, z2C, "Z₂", 6, 0);
      ctx.save();
      ctx.fillStyle = z2C;
      ctx.font = "10px sans-serif";
      ctx.textAlign = "left";
      ctx.fillText("−j25Ω", CX + 6, CY + (z2y - CY) / 2 + 4);
      ctx.restore();
    }
  }, [step, lang]);

  return (
    <canvas
      ref={canvasRef}
      width={W}
      height={H}
      className="mx-auto block"
      aria-label={t(lang, "lociZPlaneAriaLabel")}
    />
  );
}
