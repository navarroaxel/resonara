"use client";
import { useEffect, useRef } from "react";
import { useRLC } from "@/store/rlc-store";
import { useUI } from "@/store/ui-store";
import { t } from "@/lib/i18n";
import { fmt } from "@/lib/utils";

const W = 360;
const H = 260;
const ML = 50; // margin left
const MB = 40; // margin bottom
const MR = 20; // margin right
const MT = 30; // margin top
const PLOT_W = W - ML - MR;
const PLOT_H = H - MT - MB;

function drawArrow(
  ctx: CanvasRenderingContext2D,
  x1: number,
  y1: number,
  x2: number,
  y2: number,
  color: string,
) {
  const angle = Math.atan2(y2 - y1, x2 - x1);
  ctx.save();
  ctx.strokeStyle = color;
  ctx.fillStyle = color;
  ctx.lineWidth = 2.5;
  ctx.beginPath();
  ctx.moveTo(x1, y1);
  ctx.lineTo(x2, y2);
  ctx.stroke();
  ctx.beginPath();
  ctx.moveTo(x2, y2);
  ctx.lineTo(x2 - 10 * Math.cos(angle - 0.4), y2 - 10 * Math.sin(angle - 0.4));
  ctx.lineTo(x2 - 10 * Math.cos(angle + 0.4), y2 - 10 * Math.sin(angle + 0.4));
  ctx.closePath();
  ctx.fill();
  ctx.restore();
}

export function PowerChart() {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const {
    state: { results },
  } = useRLC();
  const {
    state: { lang },
  } = useUI();

  useEffect(() => {
    const { P, Qp, S, fp } = results;
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    const isDark = window.matchMedia("(prefers-color-scheme: dark)").matches;
    const textColor = isDark ? "#9FA0A0" : "#555";
    const gridColor = isDark ? "rgba(255,255,255,0.1)" : "rgba(0,0,0,0.08)";

    ctx.clearRect(0, 0, W, H);

    const ox = ML;
    const oy = MT + PLOT_H;

    const scale =
      S > 0 ? Math.min(PLOT_W / (S * 1.05), PLOT_H / (S * 1.05)) : 1;

    const px = ox + P * scale;
    const py = oy;
    const qx = px;
    const qy = oy - Qp * scale;
    const sx = ox + P * scale;
    const sy = oy - Qp * scale;

    // grid lines
    ctx.strokeStyle = gridColor;
    ctx.lineWidth = 0.5;
    ctx.beginPath();
    ctx.moveTo(ox, MT);
    ctx.lineTo(ox, oy);
    ctx.stroke();
    ctx.beginPath();
    ctx.moveTo(ox, oy);
    ctx.lineTo(ox + PLOT_W, oy);
    ctx.stroke();

    // angle arc at origin
    if (S > 0 && P > 0) {
      const arcR = Math.min(40, P * scale * 0.4);
      const phiRad = Math.atan2(Qp, P);
      ctx.save();
      ctx.strokeStyle = "#7F77DD";
      ctx.lineWidth = 1.5;
      ctx.beginPath();
      ctx.arc(ox, oy, arcR, -phiRad, 0);
      ctx.stroke();
      ctx.fillStyle = "#7F77DD";
      ctx.font = "11px sans-serif";
      ctx.fillText("φ", ox + arcR * 0.65, oy - arcR * 0.4);
      ctx.restore();
    }

    // S — apparent (hypotenuse) drawn first so others render on top
    if (S > 0) {
      drawArrow(ctx, ox, oy, sx, sy, "#378ADD");
      // label midpoint of S
      const midSx = ox + (sx - ox) * 0.5 - 16;
      const midSy = oy + (sy - oy) * 0.5 - 8;
      ctx.save();
      ctx.fillStyle = "#378ADD";
      ctx.font = "bold 11px sans-serif";
      ctx.fillText(`S=${fmt(S)} VA`, midSx, midSy);
      ctx.restore();
    }

    // P — active (horizontal)
    if (P > 0) {
      drawArrow(ctx, ox, oy, px, py, "#1D9E75");
      ctx.save();
      ctx.fillStyle = "#1D9E75";
      ctx.font = "bold 11px sans-serif";
      ctx.fillText(`P=${fmt(P)} W`, ox + (px - ox) * 0.5 - 16, oy + 20);
      ctx.restore();
    }

    // Qp — reactive (vertical)
    if (Qp > 0) {
      drawArrow(ctx, px, py, qx, qy, "#D85A30");
      ctx.save();
      ctx.fillStyle = "#D85A30";
      ctx.font = "bold 11px sans-serif";
      ctx.fillText(`Q=${fmt(Qp)} VAR`, qx + 6, oy - Qp * scale * 0.5);
      ctx.restore();
    }

    // axis labels
    ctx.fillStyle = textColor;
    ctx.font = "11px sans-serif";
    ctx.textAlign = "center";
    ctx.fillText("P (W)", ox + PLOT_W / 2, oy + 36);
    ctx.save();
    ctx.translate(14, MT + PLOT_H / 2);
    ctx.rotate(-Math.PI / 2);
    ctx.fillText("Q (VAR)", 0, 0);
    ctx.restore();
    ctx.textAlign = "left";

    // legend
    const legend: [string, string][] = [
      ["#1D9E75", t(lang, "legendActive")],
      ["#D85A30", t(lang, "legendReactive")],
      ["#378ADD", t(lang, "legendApparent")],
    ];
    ctx.font = "11px sans-serif";
    legend.forEach(([c, l], i) => {
      ctx.fillStyle = c;
      ctx.fillRect(W - MR - 90, MT + i * 17, 10, 10);
      ctx.fillStyle = textColor;
      ctx.fillText(l, W - MR - 76, MT + 9 + i * 17);
    });

    // fp label
    ctx.fillStyle = textColor;
    ctx.font = "12px sans-serif";
    ctx.fillText(`fp = ${fmt(fp, 3)}`, ox, MT + 16);
  }, [results, lang]);

  return (
    <canvas
      ref={canvasRef}
      width={W}
      height={H}
      className="mx-auto block"
      aria-label={t(lang, "powerTriangle")}
    />
  );
}
