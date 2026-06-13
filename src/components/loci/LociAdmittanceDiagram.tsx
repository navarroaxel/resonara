"use client";
import { useEffect, useRef } from "react";
import { useUI } from "@/store/ui-store";
import { t } from "@/lib/i18n";

const W = 320,
  H = 320;
// Origin: G=0, B=0 — positioned upper-left so circle fits to the right and Y1 below
const CX = 70,
  CY = 170;
const SCALE = 1200; // px per siemens

// Y1 = 0.02 - j0.04 S  → tip at (CX+24, CY+48)
// Locus circle center (G=0.05, B=0) → (CX+60, CY), radius=60px
// YT = (0.02, 0)        → tip at (CX+24, CY)

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
  lineWidth = 2,
) {
  ctx.save();
  ctx.strokeStyle = color;
  ctx.fillStyle = color;
  ctx.lineWidth = lineWidth;
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
  ctx.font = lineWidth > 2 ? "bold 11px sans-serif" : "bold 11px sans-serif";
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
  label?: string,
  lblDx = 6,
  lblDy = -4,
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
  if (label) {
    ctx.fillStyle = color;
    ctx.font = "10px sans-serif";
    const mx = (x1 + x2) / 2;
    const my = (y1 + y2) / 2;
    ctx.fillText(label, mx + lblDx, my + lblDy);
  }
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

export function LociAdmittanceDiagram({ step }: { step: number }) {
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
    const locusC = isDark ? "#9FA0A0" : "#888"; // locus circle (gray)
    const y1C = isDark ? "#5DCAA5" : "#1D9E75"; // Y1 (teal)
    const g1C = isDark ? "#F0997B" : "#D85A30"; // G1 component (orange)
    const b1C = isDark ? "#f87171" : "#C0392B"; // B1 component (red)
    const y2C = isDark ? "#85B7EB" : "#378ADD"; // Y2 (blue)
    const ytC = isDark ? "#FDBA74" : "#F39C12"; // YT resultant (amber)

    // Pixel positions
    const y1px = CX + 0.02 * SCALE; // 24px right
    const y1py = CY + 0.04 * SCALE; // 48px down  (B1 = -0.04 → downward)
    const circleCX = CX + 0.05 * SCALE; // 60px right
    const circleR = 0.05 * SCALE; // 60px

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
    ctx.fillText("G (S)", W - 44, CY - 6);
    ctx.textAlign = "center";
    ctx.fillText("jB (S)", CX, 12);
    ctx.fillText("+B", CX, 24);
    ctx.fillText("−B", CX, CY + 60);

    // Title
    ctx.fillStyle = isDark ? "#D4D4D4" : "#404040";
    ctx.font = "bold 11px sans-serif";
    ctx.textAlign = "right";
    ctx.fillText(t(lang, "lociYPlaneAriaLabel"), W - 6, 14);

    // Origin label
    ctx.fillStyle = axisLblC;
    ctx.font = "10px sans-serif";
    ctx.textAlign = "right";
    ctx.fillText("0", CX - 4, CY + 12);

    // ── Step 2+: Locus circle ──────────────────────────────────────────────────
    if (step >= 2) {
      ctx.save();
      ctx.strokeStyle = locusC;
      ctx.lineWidth = 1.5;
      ctx.setLineDash([6, 4]);
      ctx.beginPath();
      ctx.arc(circleCX, CY, circleR, 0, 2 * Math.PI);
      ctx.stroke();
      ctx.setLineDash([]);
      // Locus label
      ctx.fillStyle = locusC;
      ctx.font = "9px sans-serif";
      ctx.textAlign = "center";
      ctx.fillText("Lugar geom. (R=10Ω)", circleCX, CY - circleR - 6);
      // Mark circle center
      ctx.fillStyle = locusC;
      ctx.beginPath();
      ctx.arc(circleCX, CY, 2.5, 0, 2 * Math.PI);
      ctx.fill();
      // Diameter label
      ctx.fillStyle = locusC;
      ctx.font = "9px sans-serif";
      ctx.textAlign = "center";
      ctx.fillText("⌀=1/R=0.1 S", circleCX, CY + 8);
      ctx.restore();
    }

    // ── Step 3+: Y1 vector ─────────────────────────────────────────────────────
    if (step >= 3) {
      drawArrow(ctx, CX, CY, y1px, y1py, y1C, "Y₁", 6, 10);
      // Dot on circle
      ctx.save();
      ctx.fillStyle = y1C;
      ctx.beginPath();
      ctx.arc(y1px, y1py, 4, 0, 2 * Math.PI);
      ctx.fill();
      ctx.restore();
      // |Y1| label near midpoint of vector
      ctx.save();
      ctx.fillStyle = y1C;
      ctx.font = "9px sans-serif";
      ctx.textAlign = "right";
      ctx.fillText("|Y₁|≈0.045 S", y1px - 4, CY + (y1py - CY) / 2 - 2);
      ctx.restore();
    }

    // ── Step 4+: G1 and B1 components ─────────────────────────────────────────
    if (step >= 4) {
      // G1 horizontal dashed
      drawDashed(ctx, CX, CY, y1px, CY, g1C, "G₁=0.02 S", 4, -12);
      // B1 vertical dashed (downward = negative imaginary)
      drawDashed(ctx, y1px, CY, y1px, y1py, b1C, "B₁=−0.04 S", 6, 0);
      // Right-angle mark at (y1px, CY)
      rightAngleMark(ctx, y1px, CY, 6, axisLblC);
    }

    // ── Step 5+: Y2 vector (upward from Y1 tip to recover imaginary axis) ──────
    if (step >= 5) {
      drawArrow(ctx, y1px, y1py, y1px, CY, y2C, "Y₂=+j0.04 S", 6, -6);
    }

    // ── Step 6+: YT resultant ──────────────────────────────────────────────────
    if (step >= 6) {
      drawArrow(ctx, CX, CY, y1px, CY, ytC, "", 0, 0, 2.5);
      // Label separately to avoid arrowhead overlap
      ctx.save();
      ctx.fillStyle = ytC;
      ctx.font = "bold 10px sans-serif";
      ctx.textAlign = "center";
      ctx.fillText("YT=0.02 S (real pura)", CX + (y1px - CX) / 2, CY - 14);
      ctx.fillText("→ Resonancia", CX + (y1px - CX) / 2, CY - 4);
      ctx.restore();
    }
  }, [step, lang]);

  return (
    <canvas
      ref={canvasRef}
      width={W}
      height={H}
      className="mx-auto block"
      aria-label={t(lang, "lociYPlaneAriaLabel")}
    />
  );
}
