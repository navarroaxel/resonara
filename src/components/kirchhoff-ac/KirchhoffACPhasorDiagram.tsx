"use client";
import { useEffect, useRef } from "react";
import { useKirchhoffAC } from "@/store/kirchhoff-ac-store";
import { useUI } from "@/store/ui-store";
import { t } from "@/lib/i18n";

const SIZE = 320;

function drawArrow(
  ctx: CanvasRenderingContext2D,
  fromX: number,
  fromY: number,
  toX: number,
  toY: number,
  color: string,
  dashed = false,
) {
  const headLen = 8;
  const angle = Math.atan2(toY - fromY, toX - fromX);
  ctx.strokeStyle = color;
  ctx.fillStyle = color;
  ctx.lineWidth = 2;
  if (dashed) ctx.setLineDash([4, 3]);
  ctx.beginPath();
  ctx.moveTo(fromX, fromY);
  ctx.lineTo(toX, toY);
  ctx.stroke();
  ctx.setLineDash([]);
  ctx.beginPath();
  ctx.moveTo(toX, toY);
  ctx.lineTo(
    toX - headLen * Math.cos(angle - Math.PI / 6),
    toY - headLen * Math.sin(angle - Math.PI / 6),
  );
  ctx.lineTo(
    toX - headLen * Math.cos(angle + Math.PI / 6),
    toY - headLen * Math.sin(angle + Math.PI / 6),
  );
  ctx.closePath();
  ctx.fill();
}

export function KirchhoffACPhasorDiagram() {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const {
    state: { results, params, flags },
  } = useKirchhoffAC();
  const {
    state: { lang },
  } = useUI();

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;
    const isDark = window.matchMedia("(prefers-color-scheme: dark)").matches;

    ctx.clearRect(0, 0, SIZE, SIZE);
    const cx = SIZE / 2;
    const cy = SIZE / 2;

    const axisColor = isDark ? "#404040" : "#d4d4d4";
    const labelColor = isDark ? "#a3a3a3" : "#737373";

    // Axes
    ctx.strokeStyle = axisColor;
    ctx.lineWidth = 1;
    ctx.beginPath();
    ctx.moveTo(10, cy);
    ctx.lineTo(SIZE - 10, cy);
    ctx.moveTo(cx, 10);
    ctx.lineTo(cx, SIZE - 10);
    ctx.stroke();
    ctx.fillStyle = labelColor;
    ctx.font = "11px monospace";
    ctx.textAlign = "left";
    ctx.fillText("Re", SIZE - 24, cy - 6);
    ctx.textAlign = "center";
    ctx.fillText("Im", cx, 16);

    const { I1, I2, I3 } = results;
    const { Vs } = params;
    const mesh3 = flags.mesh3;

    const c1 = isDark ? "#AFA9EC" : "#7F77DD"; // violet — I1
    const c2 = isDark ? "#5DCAA5" : "#1D9E75"; // teal   — I2
    const c3 = isDark ? "#FDBA74" : "#EA580C"; // orange — I3
    const cR = isDark ? "#f87171" : "#dc2626"; // red    — resultant I

    // Vs uses a fixed visual length; currents use their own auto-scale
    const VS_LEN = SIZE * 0.38;

    // Compute tip-to-tail positions in unit-current space
    const ux = (mag: number, angDeg: number) =>
      mag * Math.cos((angDeg * Math.PI) / 180);
    const uy = (mag: number, angDeg: number) =>
      -mag * Math.sin((angDeg * Math.PI) / 180); // y flipped

    const p0 = { x: 0, y: 0 };
    const p1u = { x: p0.x + ux(I1.mag, I1.ang), y: p0.y + uy(I1.mag, I1.ang) };
    const p2u = {
      x: p1u.x + ux(I2.mag, I2.ang),
      y: p1u.y + uy(I2.mag, I2.ang),
    };
    const p3u = mesh3
      ? { x: p2u.x + ux(I3.mag, I3.ang), y: p2u.y + uy(I3.mag, I3.ang) }
      : p2u;

    // Auto-scale the current chain to fit the left half of the canvas
    const chainPoints = [p0, p1u, p2u, p3u];
    const maxExtent = Math.max(
      ...chainPoints.flatMap((p) => [Math.abs(p.x), Math.abs(p.y)]),
      1e-9,
    );
    const iScale = (SIZE * 0.38) / maxExtent;

    // Place current chain origin at canvas center
    const O = { x: cx, y: cy };
    const toC = (p: { x: number; y: number }) => ({
      x: O.x + p.x * iScale,
      y: O.y + p.y * iScale,
    });

    const T1 = toC(p1u);
    const T2 = toC(p2u);
    const T3 = toC(p3u);

    // Vs — horizontal reference (blue), drawn below center for clarity
    drawArrow(ctx, O.x, O.y, O.x + VS_LEN, O.y, isDark ? "#60a5fa" : "#2563eb");

    // Tip-to-tail current chain
    if (I1.mag > 1e-9) drawArrow(ctx, O.x, O.y, T1.x, T1.y, c1, true);
    if (I2.mag > 1e-9) drawArrow(ctx, T1.x, T1.y, T2.x, T2.y, c2, true);
    if (mesh3 && I3.mag > 1e-9)
      drawArrow(ctx, T2.x, T2.y, T3.x, T3.y, c3, true);

    // Resultant I — solid bold arrow from origin to final tip
    const Isum = mesh3
      ? { re: I1.re + I2.re + I3.re, im: I1.im + I2.im + I3.im }
      : { re: I1.re + I2.re, im: I1.im + I2.im };
    const Imag = Math.hypot(Isum.re, Isum.im);
    const Iang = (Math.atan2(Isum.im, Isum.re) * 180) / Math.PI;
    const Tend = mesh3 ? T3 : T2;
    ctx.lineWidth = 2.5;
    drawArrow(ctx, O.x, O.y, Tend.x, Tend.y, cR);
    ctx.lineWidth = 2;

    // Legend
    const lx = 10;
    let ly = 18;
    const rows: { color: string; label: string }[] = [
      {
        color: isDark ? "#60a5fa" : "#2563eb",
        label: `Vs = ${Vs.toFixed(0)} V`,
      },
    ];
    if (I1.mag > 1e-9)
      rows.push({
        color: c1,
        label: `I₁ = ${I1.mag.toFixed(3)} A ∠${I1.ang.toFixed(1)}°`,
      });
    if (I2.mag > 1e-9)
      rows.push({
        color: c2,
        label: `I₂ = ${I2.mag.toFixed(3)} A ∠${I2.ang.toFixed(1)}°`,
      });
    if (mesh3 && I3.mag > 1e-9)
      rows.push({
        color: c3,
        label: `I₃ = ${I3.mag.toFixed(3)} A ∠${I3.ang.toFixed(1)}°`,
      });
    if (Imag > 1e-9)
      rows.push({
        color: cR,
        label: `I  = ${Imag.toFixed(3)} A ∠${Iang.toFixed(1)}°`,
      });

    ctx.font = "10px monospace";
    for (const { color, label } of rows) {
      ctx.fillStyle = color;
      ctx.fillRect(lx, ly - 8, 10, 10);
      ctx.fillStyle = labelColor;
      ctx.textAlign = "left";
      ctx.fillText(label, lx + 14, ly);
      ly += 16;
    }
  }, [results, params, flags]);

  return (
    <canvas
      ref={canvasRef}
      width={SIZE}
      height={SIZE}
      className="w-full"
      aria-label={t(lang, "kacPhasorAria")}
    />
  );
}
