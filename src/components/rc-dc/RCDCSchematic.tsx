"use client";
import { useEffect, useRef } from "react";
import { useRCDC } from "@/store/rc-dc-store";
import { useUI } from "@/store/ui-store";
import { fmt } from "@/lib/utils";
import { t } from "@/lib/i18n";
import { drawResistorHBody } from "@/lib/schematic-draw";
import type { ResistorSymbol } from "@/lib/types";

const W = 560,
  H = 220;

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

function arrowHead(
  ctx: CanvasRenderingContext2D,
  x: number,
  y: number,
  angle: number,
  size: number,
  c: string,
) {
  ctx.save();
  ctx.fillStyle = c;
  ctx.translate(x, y);
  ctx.rotate(angle);
  ctx.beginPath();
  ctx.moveTo(0, 0);
  ctx.lineTo(-size, size * 0.4);
  ctx.lineTo(-size, -size * 0.4);
  ctx.closePath();
  ctx.fill();
  ctx.restore();
}

function resistorH(
  ctx: CanvasRenderingContext2D,
  cx: number,
  cy: number,
  hw: number,
  c: string,
  mC: string,
  lbl: string,
  symbol: ResistorSymbol,
) {
  const rw = hw * 0.6,
    rh = 18;
  wire(ctx, cx - hw, cy, cx - rw, cy, c);
  drawResistorHBody(ctx, cx - rw, cy - rh / 2, rw * 2, rh, c, symbol);
  wire(ctx, cx + rw, cy, cx + hw, cy, c);
  ctx.save();
  ctx.fillStyle = c;
  ctx.font = "bold 12px sans-serif";
  ctx.textAlign = "center";
  ctx.textBaseline = "bottom";
  ctx.fillText("R", cx, cy - rh / 2 - 4);
  ctx.fillStyle = mC;
  ctx.font = "11px sans-serif";
  ctx.fillText(lbl, cx, cy - rh / 2 - 16);
  ctx.restore();
}

function capacitorV(
  ctx: CanvasRenderingContext2D,
  cx: number,
  cy: number,
  hh: number,
  c: string,
  mC: string,
  lbl: string,
) {
  const gapY = 8,
    plateW = 28;
  wire(ctx, cx, cy - hh, cx, cy - gapY, c);
  wire(ctx, cx, cy + gapY, cx, cy + hh, c);
  ctx.save();
  ctx.strokeStyle = c;
  ctx.lineWidth = 2.5;
  ctx.lineCap = "round";
  ctx.beginPath();
  ctx.moveTo(cx - plateW / 2, cy - gapY);
  ctx.lineTo(cx + plateW / 2, cy - gapY);
  ctx.stroke();
  ctx.beginPath();
  ctx.moveTo(cx - plateW / 2, cy + gapY);
  ctx.lineTo(cx + plateW / 2, cy + gapY);
  ctx.stroke();
  ctx.restore();
  ctx.save();
  ctx.fillStyle = c;
  ctx.font = "bold 12px sans-serif";
  ctx.textAlign = "left";
  ctx.textBaseline = "middle";
  ctx.fillText("C", cx + plateW / 2 + 6, cy - 8);
  ctx.fillStyle = mC;
  ctx.font = "11px sans-serif";
  ctx.fillText(lbl, cx + plateW / 2 + 6, cy + 8);
  ctx.restore();
}

function sourceDC(
  ctx: CanvasRenderingContext2D,
  cx: number,
  cy: number,
  r: number,
  c: string,
  mC: string,
  voltage: number,
) {
  ctx.save();
  ctx.strokeStyle = c;
  ctx.lineWidth = 1.8;
  ctx.beginPath();
  ctx.arc(cx, cy, r, 0, 2 * Math.PI);
  ctx.stroke();
  ctx.fillStyle = c;
  ctx.font = "12px sans-serif";
  ctx.textAlign = "center";
  ctx.textBaseline = "middle";
  ctx.fillText("+", cx, cy - 9);
  ctx.fillText("−", cx, cy + 10);
  ctx.font = "bold 12px sans-serif";
  ctx.textAlign = "right";
  ctx.textBaseline = "alphabetic";
  ctx.fillText("Vs", cx - r - 6, cy + 4);
  ctx.fillStyle = mC;
  ctx.font = "11px sans-serif";
  ctx.fillText(`${fmt(voltage, 1)} V`, cx - r - 6, cy + 16);
  ctx.restore();
}

export function RCDCSchematic() {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const {
    state: { params, results },
  } = useRCDC();
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

    const wC = isDark ? "#85B7EB" : "#378ADD";
    const sC = isDark ? "#AFA9EC" : "#7F77DD";
    const rC = isDark ? "#F0997B" : "#D85A30";
    const cC = isDark ? "#5DCAA5" : "#1D9E75";
    const mC = isDark ? "#9FA0A0" : "#888";
    const iC = isDark ? "#60A5FA" : "#2563EB";

    const LEFT = 80,
      RIGHT = 480,
      TOP = 40,
      BOT = 180;
    const SRC_CY = (TOP + BOT) / 2; // 110
    const SRC_R = 28;
    const R_CX = (LEFT + RIGHT) / 2; // 280

    // top rail: LEFT → RIGHT
    wire(ctx, LEFT, TOP, R_CX - 55, TOP, wC);
    resistorH(
      ctx,
      R_CX,
      TOP,
      55,
      rC,
      mC,
      `${fmt(params.R, 0)} Ω`,
      resistorSymbol,
    );
    wire(ctx, R_CX + 55, TOP, RIGHT, TOP, wC);

    // right branch: capacitor
    wire(ctx, RIGHT, TOP, RIGHT, SRC_CY - 38, wC);
    capacitorV(ctx, RIGHT, SRC_CY, 38, cC, mC, `${fmt(params.C, 0)} µF`);
    wire(ctx, RIGHT, SRC_CY + 38, RIGHT, BOT, wC);

    // bottom rail
    wire(ctx, LEFT, BOT, RIGHT, BOT, wC);

    // left branch: source
    wire(ctx, LEFT, TOP, LEFT, SRC_CY - SRC_R, wC);
    sourceDC(ctx, LEFT, SRC_CY, SRC_R, sC, mC, params.Vs);
    wire(ctx, LEFT, SRC_CY + SRC_R, LEFT, BOT, wC);

    // current arrow on top rail (direction: left to right = positive I)
    const I = results.I0;
    if (Number.isFinite(I) && I > 0) {
      const arrowX = LEFT + 30;
      arrowHead(ctx, arrowX, TOP, 0, 8, iC);
      ctx.save();
      ctx.fillStyle = iC;
      ctx.font = "10px sans-serif";
      ctx.textAlign = "left";
      ctx.textBaseline = "bottom";
      ctx.fillText(`I₀ = ${fmt(I * 1000, 2)} mA`, arrowX + 10, TOP - 2);
      ctx.restore();
    }

    // Vc label near capacitor
    ctx.save();
    ctx.fillStyle = cC;
    ctx.font = "11px sans-serif";
    ctx.textAlign = "right";
    ctx.textBaseline = "middle";
    ctx.fillText("V_C →", RIGHT - 52, SRC_CY);
    ctx.restore();

    // τ label bottom-centre
    const tau = results.tau;
    const tauStr =
      tau < 1 ? `τ = ${fmt(tau * 1000, 1)} ms` : `τ = ${fmt(tau, 3)} s`;
    ctx.save();
    ctx.fillStyle = mC;
    ctx.font = "11px sans-serif";
    ctx.textAlign = "center";
    ctx.textBaseline = "top";
    ctx.fillText(tauStr, W / 2, BOT + 8);
    ctx.restore();
  }, [params, results, resistorSymbol]);

  return (
    <canvas
      ref={canvasRef}
      width={W}
      height={H}
      className="mx-auto block w-full max-w-xl"
      aria-label={t(lang, "rcDcSchematicAriaLabel")}
    />
  );
}
