"use client";
import { useEffect, useRef } from "react";
import { useUI } from "@/store/ui-store";
import { t } from "@/lib/i18n";

const W = 560,
  H = 620;
const CX = 100,
  CY = 275; // shared origin
const SCALE_Z = 11; // px per ohm
const SCALE_Y = 2400; // px per siemens

// Derived pixel positions (constants for clarity)
// Z1 = 10+j20 Ω  → tip (210, 55)
// Z2 = -j25 Ω   → tip (100, 550)
// Y1 = 0.02-j0.04 S → tip (148, 371)
// Circle center (220, 275), r=120px

// Font sizes
const F_LG = 22; // main vector labels
const F_MD = 18; // component / secondary labels
const F_SM = 16; // minor labels (locus, arc)

function arrow(
  ctx: CanvasRenderingContext2D,
  ox: number,
  oy: number,
  ex: number,
  ey: number,
  color: string,
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
  const hw = 12;
  ctx.beginPath();
  ctx.moveTo(ex, ey);
  ctx.lineTo(
    ex - hw * Math.cos(angle - 0.38),
    ey - hw * Math.sin(angle - 0.38),
  );
  ctx.lineTo(
    ex - hw * Math.cos(angle + 0.38),
    ey - hw * Math.sin(angle + 0.38),
  );
  ctx.closePath();
  ctx.fill();
  ctx.restore();
}

function dashed(
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
  ctx.setLineDash([6, 5]);
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
  flipY = false,
  flipX = false,
) {
  const dy = flipY ? size : -size;
  const dx = flipX ? -size : size;
  ctx.save();
  ctx.strokeStyle = c;
  ctx.lineWidth = 1.5;
  ctx.beginPath();
  ctx.moveTo(x, y + dy);
  ctx.lineTo(x + dx, y + dy);
  ctx.lineTo(x + dx, y);
  ctx.stroke();
  ctx.restore();
}

function lbl(
  ctx: CanvasRenderingContext2D,
  text: string,
  x: number,
  y: number,
  color: string,
  size: number,
  align: CanvasTextAlign = "left",
  bold = false,
) {
  ctx.save();
  ctx.fillStyle = color;
  ctx.font = `${bold ? "bold " : ""}${size}px sans-serif`;
  ctx.textAlign = align;
  ctx.fillText(text, x, y);
  ctx.restore();
}

// Draws text with an inline subscript: main + sub (smaller, lower) + tail
function lblSub(
  ctx: CanvasRenderingContext2D,
  main: string,
  sub: string,
  tail: string,
  x: number,
  y: number,
  color: string,
  size: number,
  bold = false,
) {
  ctx.save();
  ctx.fillStyle = color;
  ctx.font = `${bold ? "bold " : ""}${size}px sans-serif`;
  ctx.textAlign = "left";
  ctx.fillText(main, x, y);
  const mainW = ctx.measureText(main).width;
  const subSize = Math.round(size * 0.62);
  ctx.font = `${subSize}px sans-serif`;
  ctx.fillText(sub, x + mainW, y + size * 0.38);
  const subW = ctx.measureText(sub).width;
  ctx.font = `${bold ? "bold " : ""}${size}px sans-serif`;
  ctx.fillText(tail, x + mainW + subW, y);
  ctx.restore();
}

interface LociDiagramProps {
  step: number;
  showZ: boolean;
  showY: boolean;
  showP: boolean;
}

export function LociDiagram({ step, showZ, showY, showP }: LociDiagramProps) {
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
    const axC = isDark ? "#9FA0A0" : "#888";

    const z1C = isDark ? "#AFA9EC" : "#7F77DD";
    const rC = isDark ? "#F0997B" : "#D85A30";
    const z2C = isDark ? "#5DCAA5" : "#1D9E75";
    const locC = isDark ? "#9FA0A0" : "#888";
    const y1C = isDark ? "#5DCAA5" : "#1D9E75";
    const g1C = isDark ? "#F0997B" : "#D85A30";
    const b1C = isDark ? "#f87171" : "#C0392B";
    const y2C = isDark ? "#85B7EB" : "#378ADD";
    const ytC = isDark ? "#FDBA74" : "#F39C12";

    // ── Axes ─────────────────────────────────────────────────────────────────
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

    lbl(ctx, t(lang, "lociAxisRe"), W - 28, CY - 8, axC, F_LG);
    lbl(ctx, t(lang, "lociAxisIm"), CX - 22, 26, axC, F_LG, "center");
    lbl(ctx, "0", CX - 8, CY + 18, axC, F_MD, "right");

    // ── Pixel positions ───────────────────────────────────────────────────────
    const z1x = CX + 10 * SCALE_Z; // 210
    const z1y = CY - 20 * SCALE_Z; // 55
    const z2y = CY + 25 * SCALE_Z; // 550
    const y1px = CX + 0.02 * SCALE_Y; // 148
    const y1py = CY + 0.04 * SCALE_Y; // 371
    const cirCX = CX + 0.05 * SCALE_Y; // 220
    const cirR = 0.05 * SCALE_Y; // 120

    // ── Z layer ───────────────────────────────────────────────────────────────
    if (showZ && step >= 1) {
      // Dashed components
      dashed(ctx, CX, CY, z1x, CY, rC);
      dashed(ctx, z1x, CY, z1x, z1y, z1C);
      rightAngleMark(ctx, z1x, CY, 10, axC, false, true);

      // Z1 vector
      arrow(ctx, CX, CY, z1x, z1y, z1C);

      // Angle arc (radius 52px, from 0 to -63.4°)
      const arcR = 52;
      ctx.save();
      ctx.strokeStyle = axC;
      ctx.lineWidth = 1.5;
      ctx.beginPath();
      ctx.arc(CX, CY, arcR, -Math.atan2(20 * SCALE_Z, 10 * SCALE_Z), 0);
      ctx.stroke();
      ctx.restore();

      // Labels — explicit positions, no overlaps:
      lbl(ctx, "Z₁", z1x + 10, z1y - 6, z1C, F_LG, "left", true);
      lbl(ctx, "XL", z1x + 12, z1y + 44, z1C, F_MD);
      // φ₁ above and right of arc midpoint, clear of Y₂ label zone
      lbl(ctx, "φ₁", CX + 60, CY - 34, axC, F_SM);
      // R below real axis — row 1, shifted right of midpoint
      lbl(ctx, "R", CX + (z1x - CX) / 2 + 20, CY + 28, rC, F_MD, "center");
    }

    if (showZ && step >= 7) {
      arrow(ctx, CX, CY, CX, z2y, z2C);
      // "Z₂" at tip
      lbl(ctx, "Z₂", CX + 10, z2y + 4, z2C, F_LG, "left", true);
    }

    // ── Y layer ───────────────────────────────────────────────────────────────
    if (showY && step >= 2) {
      // Locus circle
      ctx.save();
      ctx.strokeStyle = locC;
      ctx.lineWidth = 1.5;
      ctx.setLineDash([7, 5]);
      ctx.beginPath();
      ctx.arc(cirCX, CY, cirR, 0, 2 * Math.PI);
      ctx.stroke();
      ctx.setLineDash([]);
      ctx.fillStyle = locC;
      ctx.beginPath();
      ctx.arc(cirCX, CY, 3, 0, 2 * Math.PI);
      ctx.fill();
      ctx.restore();
      // Right-side label column — clear of Z content
      lbl(
        ctx,
        t(lang, "lociDiagGeomLocus"),
        cirCX + cirR + 10,
        CY + 4,
        locC,
        F_SM,
      );
    }

    if (showY && step >= 3) {
      arrow(ctx, CX, CY, y1px, y1py, y1C);
      ctx.save();
      ctx.fillStyle = y1C;
      ctx.beginPath();
      ctx.arc(y1px, y1py, 5, 0, 2 * Math.PI);
      ctx.fill();
      ctx.restore();
      lbl(ctx, "Y₁", y1px + 10, y1py + 6, y1C, F_LG, "left", true);
    }

    if (showY && step >= 4) {
      dashed(ctx, CX, CY, y1px, CY, g1C);
      dashed(ctx, y1px, CY, y1px, y1py, b1C);
      rightAngleMark(ctx, y1px, CY, 10, axC, true, true);
      // G₁ — row 2 below axis; B₁ — row 3
      lbl(ctx, "G₁", CX + 4, CY + 52, g1C, F_MD);
      lbl(ctx, "B₁", y1px + 10, CY + 80, b1C, F_MD);
    }

    if (showY && step >= 5) {
      arrow(ctx, y1px, y1py, y1px, CY, y2C);
      // Y₂ label only at step 5; at step 6 it's replaced by the YT label cluster
      if (step < 6) {
        lbl(ctx, "Y₂", y1px + 10, CY - 14, y2C, F_MD, "left", true);
      }
    }

    if (showY && step >= 6) {
      arrow(ctx, CX, CY, y1px, CY, ytC, 3);
      // YT/Resonancia go in the right-side label column below "Lugar geom."
      lbl(ctx, "YT", cirCX + cirR + 10, CY + 28, ytC, F_MD, "left", true);
      lbl(
        ctx,
        t(lang, "lociDiagResonance"),
        cirCX + cirR + 10,
        CY + 50,
        ytC,
        F_SM,
        "left",
        true,
      );
    }
    // ── P layer (power plane) ─────────────────────────────────────────────────
    // S = Vs²·Y*  →  power plane is Y plane reflected about Re axis, same px scale
    // Vs = 100 V  →  SCALE_P = SCALE_Y / Vs² = 2400/10000 = 0.24 px/W
    // P1 = 200 W, Q1 = 400 VAR, |S1| ≈ 447 VA  →  s1px=148, s1py=179
    const sC = isDark ? "#FDA4AF" : "#BE185D"; // apparent power (rose)
    const s1ppx = y1px; // 148 — same horizontal as Y1 (P1 = Vs²·G1)
    const s1ppy = 2 * CY - y1py; // 179 — correct reflection of Y1 about Re axis

    if (showP && step >= 8) {
      // Power locus circle — upper arc, same center/radius as Y locus
      ctx.save();
      ctx.strokeStyle = sC;
      ctx.lineWidth = 1.5;
      ctx.setLineDash([7, 5]);
      ctx.beginPath();
      ctx.arc(cirCX, CY, cirR, -Math.PI, 0); // upper half
      ctx.stroke();
      ctx.setLineDash([]);
      ctx.restore();
      lbl(
        ctx,
        t(lang, "lociDiagGeomLocus"),
        cirCX + cirR + 10,
        CY - 28,
        sC,
        F_SM,
      );
    }

    if (showP && step >= 9) {
      // S1 vector + power triangle components
      dashed(ctx, CX, CY, s1ppx, CY, rC); // P1 horizontal
      dashed(ctx, s1ppx, CY, s1ppx, s1ppy, y2C); // Q1 vertical (upward)
      rightAngleMark(ctx, s1ppx, CY, 10, axC, false, true); // inside triangle
      arrow(ctx, CX, CY, s1ppx, s1ppy, sC);
      ctx.save();
      ctx.fillStyle = sC;
      ctx.beginPath();
      ctx.arc(s1ppx, s1ppy, 5, 0, 2 * Math.PI);
      ctx.fill();
      ctx.restore();
      lbl(ctx, "S₁", s1ppx + 10, s1ppy - 6, sC, F_LG, "left", true);
      lbl(ctx, "P₁", CX + (s1ppx - CX) / 2 + 4, CY + 28, rC, F_MD, "center");
      lbl(ctx, "Q₁", s1ppx + 10, CY - (CY - s1ppy) / 2 - 16, y2C, F_MD);
    }

    if (showP && step >= 10) {
      // Resonance power — purely active, horizontal vector
      arrow(ctx, CX, CY, s1ppx, CY, sC, 3);
      lblSub(ctx, "S", "res", "", s1ppx + 10, CY - 16, sC, F_MD, true);
    }

    // ── Value legend box (bottom-right) ──────────────────────────────────────
    type LegendEntry = {
      label: string;
      sub?: string;
      tail?: string;
      color: string;
    };
    const valEntries: LegendEntry[] = [];
    if (showZ && step >= 1) {
      valEntries.push({ label: "R = 10 Ω", color: rC });
      valEntries.push({ label: "XL = 20 Ω", color: z1C });
    }
    if (showY && step >= 4) {
      valEntries.push({ label: "G₁ = 0.02 S", color: g1C });
      valEntries.push({ label: "B₁ = −0.04 S", color: b1C });
    }
    if (showY && step >= 5) {
      valEntries.push({ label: "Y₂ = +j0.04 S", color: y2C });
    }
    if (showY && step >= 6) {
      valEntries.push({ label: "YT = 0.02 S", color: ytC });
    }
    if (showZ && step >= 7) {
      valEntries.push({ label: "Z₂ = −j25 Ω", color: z2C });
    }
    if (showP && step >= 8) {
      valEntries.push({ label: "Vs = 100 V", color: sC });
    }
    if (showP && step >= 9) {
      valEntries.push({ label: "P₁ = 200 W", color: rC });
      valEntries.push({ label: "Q₁ = 400 VAR", color: y2C });
      valEntries.push({ label: "|S₁| ≈ 447 VA", color: sC });
    }
    if (showP && step >= 10) {
      valEntries.push({ label: "S", sub: "res", tail: " = 200 W", color: sC });
    }
    if (valEntries.length > 0) {
      const LH = 20;
      const PAD = 7;
      const BOX_W = 172;
      const BOX_H = valEntries.length * LH + PAD * 2;
      const BOX_X = W - BOX_W - 8;
      const BOX_Y = H - BOX_H - 8;
      ctx.save();
      ctx.fillStyle = isDark ? "rgba(15,15,15,0.75)" : "rgba(255,255,255,0.88)";
      ctx.strokeStyle = isDark ? "rgba(255,255,255,0.14)" : "rgba(0,0,0,0.14)";
      ctx.lineWidth = 1;
      ctx.beginPath();
      if (ctx.roundRect) {
        ctx.roundRect(BOX_X, BOX_Y, BOX_W, BOX_H, 6);
      } else {
        ctx.rect(BOX_X, BOX_Y, BOX_W, BOX_H);
      }
      ctx.fill();
      ctx.stroke();
      ctx.restore();
      valEntries.forEach((entry, i) => {
        const ey = BOX_Y + PAD + (i + 0.78) * LH;
        if (entry.sub) {
          lblSub(
            ctx,
            entry.label,
            entry.sub,
            entry.tail ?? "",
            BOX_X + PAD,
            ey,
            entry.color,
            F_SM,
          );
        } else {
          lbl(ctx, entry.label, BOX_X + PAD, ey, entry.color, F_SM);
        }
      });
    }
  }, [step, showZ, showY, showP, lang]);

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
