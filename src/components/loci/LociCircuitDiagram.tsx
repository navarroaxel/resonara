"use client";
import { useEffect, useRef } from "react";
import { useUI } from "@/store/ui-store";
import { t } from "@/lib/i18n";
import { drawResistorVBody } from "@/lib/schematic-draw";

const W = 520,
  H = 220;
const TOP = 40,
  BOT = 180;
const SRC_CX = 80;
const Z1_CX = 220;
const Z2_CX = 360;
const MID_Y = (TOP + BOT) / 2; // 110

function wire(
  ctx: CanvasRenderingContext2D,
  x1: number,
  y1: number,
  x2: number,
  y2: number,
  c: string,
) {
  ctx.save();
  ctx.strokeStyle = c;
  ctx.lineWidth = 2;
  ctx.lineCap = "round";
  ctx.beginPath();
  ctx.moveTo(x1, y1);
  ctx.lineTo(x2, y2);
  ctx.stroke();
  ctx.restore();
}

function dot(ctx: CanvasRenderingContext2D, x: number, y: number, c: string) {
  ctx.save();
  ctx.fillStyle = c;
  ctx.beginPath();
  ctx.arc(x, y, 4, 0, 2 * Math.PI);
  ctx.fill();
  ctx.restore();
}

export function LociCircuitDiagram({ step }: { step: number }) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const {
    state: { lang, resistorSymbol },
  } = useUI();

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    const isDark = window.matchMedia("(prefers-color-scheme: dark)").matches;
    ctx.clearRect(0, 0, W, H);

    const wC = isDark ? "#85B7EB" : "#378ADD"; // wire / rails
    const nC = isDark ? "#FAC775" : "#BA7517"; // node dots
    const mC = isDark ? "#9FA0A0" : "#888"; // meta text
    const z1C = isDark ? "#AFA9EC" : "#7F77DD"; // Z1 branch (violet)
    const z2C = isDark ? "#5DCAA5" : "#1D9E75"; // Z2 branch (teal)
    const vsC = isDark ? "#4ade80" : "#16a34a"; // source (green)
    const amberC = isDark ? "#FDBA74" : "#F39C12"; // result reveal

    // ── Rails ──────────────────────────────────────────────────────────────────
    wire(ctx, SRC_CX, TOP, Z2_CX, TOP, wC);
    wire(ctx, SRC_CX, BOT, Z2_CX, BOT, wC);

    // ── AC source (left branch) ────────────────────────────────────────────────
    const srcR = 22;
    wire(ctx, SRC_CX, TOP, SRC_CX, MID_Y - srcR, wC);
    wire(ctx, SRC_CX, MID_Y + srcR, SRC_CX, BOT, wC);
    ctx.save();
    ctx.strokeStyle = vsC;
    ctx.lineWidth = 1.8;
    ctx.beginPath();
    ctx.arc(SRC_CX, MID_Y, srcR, 0, 2 * Math.PI);
    ctx.stroke();
    ctx.strokeStyle = vsC;
    ctx.lineWidth = 1.5;
    ctx.beginPath();
    ctx.moveTo(SRC_CX - 8, MID_Y);
    ctx.bezierCurveTo(
      SRC_CX - 5,
      MID_Y - 6,
      SRC_CX - 3,
      MID_Y - 6,
      SRC_CX,
      MID_Y,
    );
    ctx.bezierCurveTo(
      SRC_CX + 3,
      MID_Y + 6,
      SRC_CX + 5,
      MID_Y + 6,
      SRC_CX + 8,
      MID_Y,
    );
    ctx.stroke();
    ctx.fillStyle = vsC;
    ctx.font = "bold 11px sans-serif";
    ctx.textAlign = "right";
    ctx.textBaseline = "middle";
    ctx.fillText("Vs", SRC_CX - srcR - 6, MID_Y);
    ctx.restore();

    // ── Z1 branch: resistor (upper) + inductor (lower) ─────────────────────────
    // Explicit positions — no overlap:
    // TOP(40)→[16px]→R_START(56)→R(28px)→R_END(84)→[20px gap]→IND_START(104)→L(60px)→IND_END(164)→[16px]→BOT(180)
    const rW = 18,
      rH = 28;
    const R_START = TOP + 16; // 56
    const R_END = R_START + rH; // 84
    const IND_START = R_END + 20; // 104
    const bumpR = 10;
    const BUMPS = 3;
    const IND_END = IND_START + BUMPS * bumpR * 2; // 164

    wire(ctx, Z1_CX, TOP, Z1_CX, R_START, z1C);
    drawResistorVBody(
      ctx,
      Z1_CX - rW / 2,
      R_START,
      rW,
      rH,
      z1C,
      resistorSymbol,
    );
    wire(ctx, Z1_CX, R_END, Z1_CX, IND_START, z1C);

    ctx.save();
    ctx.strokeStyle = z1C;
    ctx.lineWidth = 1.8;
    for (let i = 0; i < BUMPS; i++) {
      const bcy = IND_START + bumpR + i * bumpR * 2;
      ctx.beginPath();
      ctx.arc(Z1_CX, bcy, bumpR, -Math.PI / 2, Math.PI / 2);
      ctx.stroke();
    }
    ctx.restore();

    wire(ctx, Z1_CX, IND_END, Z1_CX, BOT, z1C);

    // Z1 labels
    const rCenterY = R_START + rH / 2; // 70
    const indCenterY = IND_START + (BUMPS * bumpR * 2) / 2; // 134
    ctx.save();
    ctx.fillStyle = z1C;
    ctx.font = "bold 11px sans-serif";
    ctx.textAlign = "left";
    ctx.fillText(t(lang, "lociCircR"), Z1_CX + rW / 2 + 6, rCenterY + 4);
    ctx.fillText(t(lang, "lociCircXL"), Z1_CX + bumpR + 6, indCenterY + 4);
    ctx.font = "bold 11px sans-serif";
    ctx.fillText(t(lang, "lociCircZ1Label"), Z1_CX + 14, TOP + 16);
    ctx.restore();

    // Node dots for Z1 branch
    dot(ctx, Z1_CX, TOP, nC);
    dot(ctx, Z1_CX, BOT, nC);

    // ── Z2 branch: capacitor ───────────────────────────────────────────────────
    const plateW = 28,
      gap = 8;
    wire(ctx, Z2_CX, TOP, Z2_CX, MID_Y - gap / 2, z2C);
    wire(ctx, Z2_CX, MID_Y + gap / 2, Z2_CX, BOT, z2C);
    ctx.save();
    ctx.strokeStyle = z2C;
    ctx.lineWidth = 2.5;
    ctx.lineCap = "round";
    ctx.beginPath();
    ctx.moveTo(Z2_CX - plateW / 2, MID_Y - gap / 2);
    ctx.lineTo(Z2_CX + plateW / 2, MID_Y - gap / 2);
    ctx.stroke();
    ctx.beginPath();
    ctx.moveTo(Z2_CX - plateW / 2, MID_Y + gap / 2);
    ctx.lineTo(Z2_CX + plateW / 2, MID_Y + gap / 2);
    ctx.stroke();
    ctx.restore();

    // Z2 labels
    ctx.save();
    ctx.fillStyle = z2C;
    ctx.font = "bold 11px sans-serif";
    ctx.textAlign = "left";
    ctx.fillText(t(lang, "lociCircZ2Label"), Z2_CX + 20, TOP + 16);
    // Reveal answer at step 7
    if (step >= 7) {
      ctx.fillStyle = amberC;
      ctx.font = "bold 11px sans-serif";
      ctx.fillText(t(lang, "lociCircXcSolved"), Z2_CX + 20, MID_Y + 8);
    } else {
      ctx.fillStyle = mC;
      ctx.font = "11px sans-serif";
      ctx.fillText(t(lang, "lociCircXcUnknown"), Z2_CX + 20, MID_Y + 8);
    }
    ctx.restore();

    // Node dots for Z2 branch
    dot(ctx, Z2_CX, TOP, nC);
    dot(ctx, Z2_CX, BOT, nC);
  }, [step, lang, resistorSymbol]);

  return (
    <canvas
      ref={canvasRef}
      width={W}
      height={H}
      className="mx-auto block w-full"
      aria-label={t(lang, "lociSchematicAriaLabel")}
    />
  );
}
