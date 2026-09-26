"use client";
import { useEffect, useRef } from "react";
import { useThreePhase } from "@/store/three-phase-store";
import { useUI } from "@/store/ui-store";
import { fmt } from "@/lib/utils";
import { t } from "@/lib/i18n";

const W = 620;
const H = 500;
const Y_SHIFT = 30; // shifts the whole diagram up, tightening the top margin
const TWO_PI = 2 * Math.PI;

const PHASE_COLORS_LIGHT = ["#C53030", "#B7791F", "#2B6CB0"] as const;
const PHASE_COLORS_DARK = ["#FC8181", "#F6AD55", "#63B3ED"] as const;
const PHASE_LABELS = ["R", "S", "T"] as const;

function wire(
  ctx: CanvasRenderingContext2D,
  x1: number,
  y1: number,
  x2: number,
  y2: number,
  c: string,
  dashed = false,
) {
  ctx.save();
  ctx.strokeStyle = c;
  ctx.lineWidth = 2;
  ctx.lineCap = "round";
  if (dashed) ctx.setLineDash([4, 3]);
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
  ctx.arc(x, y, 4, 0, TWO_PI);
  ctx.fill();
  ctx.restore();
}

function splitWire(
  ctx: CanvasRenderingContext2D,
  x1: number,
  y1: number,
  x2: number,
  y2: number,
  c: string,
  gap: number,
) {
  const dx = x2 - x1;
  const dy = y2 - y1;
  const len = Math.hypot(dx, dy);
  const ux = dx / len;
  const uy = dy / len;
  const mx = (x1 + x2) / 2;
  const my = (y1 + y2) / 2;
  wire(ctx, x1, y1, mx - ux * gap, my - uy * gap, c);
  wire(ctx, mx + ux * gap, my + uy * gap, x2, y2, c);
  return { x: mx, y: my };
}

function drawCurrentText(
  ctx: CanvasRenderingContext2D,
  x: number,
  y: number,
  sub: string,
  color: string,
) {
  ctx.save();
  ctx.fillStyle = color;
  ctx.textAlign = "left";
  ctx.textBaseline = "middle";
  ctx.font = "italic bold 11px sans-serif";
  ctx.fillText("I", x, y);
  const w = ctx.measureText("I").width;
  ctx.font = "italic bold 8px sans-serif";
  ctx.fillText(sub, x + w, y + 2);
  ctx.restore();
}

function currentLabel(
  ctx: CanvasRenderingContext2D,
  midx: number,
  midy: number,
  centroidX: number,
  centroidY: number,
  dist: number,
  sub: string,
  color: string,
) {
  let dx = midx - centroidX;
  let dy = midy - centroidY;
  const len = Math.hypot(dx, dy) || 1;
  dx /= len;
  dy /= len;
  drawCurrentText(ctx, midx + dx * dist, midy + dy * dist, sub, color);
}

// For radial spokes where the far endpoint is colinear with the segment
// (so a centroid-relative offset would just slide along the wire): offset
// perpendicular to the segment instead.
function currentLabelOnSegment(
  ctx: CanvasRenderingContext2D,
  x1: number,
  y1: number,
  x2: number,
  y2: number,
  offset: number,
  sub: string,
  color: string,
) {
  const dx = x2 - x1;
  const dy = y2 - y1;
  const len = Math.hypot(dx, dy) || 1;
  const ux = dx / len;
  const uy = dy / len;
  const nx = -uy;
  const ny = ux;
  const mx = (x1 + x2) / 2;
  const my = (y1 + y2) / 2;
  drawCurrentText(ctx, mx + nx * offset, my + ny * offset, sub, color);
}

function capacitorOnLine(
  ctx: CanvasRenderingContext2D,
  x1: number,
  y1: number,
  x2: number,
  y2: number,
  color: string,
  dashed: boolean,
) {
  const dx = x2 - x1;
  const dy = y2 - y1;
  const len = Math.hypot(dx, dy);
  const ux = dx / len;
  const uy = dy / len;
  const nx = -uy;
  const ny = ux;
  const mx = (x1 + x2) / 2;
  const my = (y1 + y2) / 2;
  const gap = 7;
  wire(ctx, x1, y1, mx - ux * gap, my - uy * gap, color, dashed);
  wire(ctx, mx + ux * gap, my + uy * gap, x2, y2, color, dashed);
  const barHalf = 8;
  const barGap = 3;
  ctx.save();
  ctx.strokeStyle = color;
  ctx.lineWidth = 2;
  ctx.beginPath();
  ctx.moveTo(mx - ux * barGap - nx * barHalf, my - uy * barGap - ny * barHalf);
  ctx.lineTo(mx - ux * barGap + nx * barHalf, my - uy * barGap + ny * barHalf);
  ctx.moveTo(mx + ux * barGap - nx * barHalf, my + uy * barGap - ny * barHalf);
  ctx.lineTo(mx + ux * barGap + nx * barHalf, my + uy * barGap + ny * barHalf);
  ctx.stroke();
  ctx.restore();
}

function shortenTo(
  x1: number,
  y1: number,
  x2: number,
  y2: number,
  dist: number,
) {
  const dx = x2 - x1;
  const dy = y2 - y1;
  const len = Math.hypot(dx, dy);
  return { x: x2 - (dx / len) * dist, y: y2 - (dy / len) * dist };
}

function lampSymbol(
  ctx: CanvasRenderingContext2D,
  x: number,
  y: number,
  color: string,
) {
  const r = 9;
  ctx.save();
  ctx.strokeStyle = color;
  ctx.lineWidth = 1.5;
  ctx.beginPath();
  ctx.arc(x, y, r, 0, TWO_PI);
  ctx.stroke();
  const d = r * 0.6;
  ctx.beginPath();
  ctx.moveTo(x - d, y - d);
  ctx.lineTo(x + d, y + d);
  ctx.moveTo(x + d, y - d);
  ctx.lineTo(x - d, y + d);
  ctx.stroke();
  ctx.restore();
}

function labeledCircle(
  ctx: CanvasRenderingContext2D,
  x: number,
  y: number,
  letter: string,
  color: string,
  isDark: boolean,
) {
  const r = 11;
  ctx.save();
  ctx.strokeStyle = color;
  ctx.lineWidth = 1.5;
  ctx.beginPath();
  ctx.arc(x, y, r, 0, TWO_PI);
  ctx.stroke();
  ctx.fillStyle = isDark ? "#E5E5E5" : "#1A1A1A";
  ctx.font = "bold 11px sans-serif";
  ctx.textAlign = "center";
  ctx.textBaseline = "middle";
  ctx.fillText(letter, x, y);
  ctx.restore();
}

function wattmeter(
  ctx: CanvasRenderingContext2D,
  x: number,
  y: number,
  sub: string,
  color: string,
  isDark: boolean,
) {
  const r = 16;
  ctx.save();
  ctx.strokeStyle = color;
  ctx.lineWidth = 2;
  ctx.beginPath();
  ctx.arc(x, y, r, 0, TWO_PI);
  ctx.stroke();
  ctx.fillStyle = isDark ? "#E5E5E5" : "#1A1A1A";
  ctx.font = "bold 12px sans-serif";
  ctx.textAlign = "center";
  ctx.textBaseline = "middle";
  ctx.fillText("W", x, y);
  ctx.restore();

  ctx.save();
  ctx.fillStyle = color;
  const labelY = y + r + 14;
  ctx.font = "bold 11px sans-serif";
  const wWidth = ctx.measureText("W").width;
  ctx.font = "bold 8px sans-serif";
  const subWidth = ctx.measureText(sub).width;
  let px = x - (wWidth + subWidth) / 2;
  ctx.textAlign = "left";
  ctx.textBaseline = "middle";
  ctx.font = "bold 11px sans-serif";
  ctx.fillText("W", px, labelY);
  px += wWidth;
  ctx.font = "bold 8px sans-serif";
  ctx.fillText(sub, px, labelY + 3);
  ctx.restore();
}

export function ThreePhaseSchematic() {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const {
    state: { params, flags, results },
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
    ctx.setTransform(1, 0, 0, 1, 0, 0);
    ctx.clearRect(0, 0, W, H);
    ctx.translate(0, -Y_SHIFT);

    const phaseColors = isDark ? PHASE_COLORS_DARK : PHASE_COLORS_LIGHT;
    const mC = isDark ? "#9FA0A0" : "#888";
    const nodeC = isDark ? "#D4D4D4" : "#525252";

    const xStart = 42; // terminals are born on the left edge
    const yR = 120;
    const yS = 230;
    const yT = 340;
    const busYs = [yR, yS, yT];

    // Source dots + labels (R/S/T) on the left, each phase kept in its own
    // horizontal row for the whole diagram so no wire ever has to jog past
    // another phase's row.
    busYs.forEach((y, i) => {
      dot(ctx, xStart, y, phaseColors[i]);
      ctx.save();
      ctx.fillStyle = phaseColors[i];
      ctx.font = "bold 13px sans-serif";
      ctx.textAlign = "right";
      ctx.textBaseline = "middle";
      ctx.fillText(PHASE_LABELS[i], xStart - 12, y);
      ctx.restore();
    });

    const wmX = 112; // wattmeter center x

    // R and T rows: run through the wattmeter current coils
    wire(ctx, xStart, yR, wmX - 16, yR, phaseColors[0]);
    wattmeter(ctx, wmX, yR, "RS", phaseColors[0], isDark);
    wire(ctx, xStart, yT, wmX - 16, yT, phaseColors[2]);
    wattmeter(ctx, wmX, yT, "ST", phaseColors[2], isDark);
    dot(ctx, wmX, yS, phaseColors[1]);

    // Wattmeter voltage coils reference the S row (dashed)
    wire(ctx, wmX, yR + 16, wmX, yS, mC, true);
    wire(ctx, wmX, yT - 16, wmX, yS, mC, true);

    // Capacitor bank (Δ) — part b), sits to the left of the motor. Each
    // phase drops in to its own vertex (U on R, P on S, Q on T); the three
    // vertices are wired directly to each other, forming the actual delta
    // triangle — one capacitor per side. Shown dashed/muted while the
    // toggle has it disconnected.
    const capColor = (i: number) => (flags.capacitorsOn ? phaseColors[i] : mC);
    const capDashed = !flags.capacitorsOn;
    const capTapR = { x: 210, y: yR };
    const capTapS = { x: 280, y: yS };
    const capTapT = { x: 140, y: yT };
    const shelfY = 360; // R's vertex height — taller triangle
    const baseY = 420; // S/T's vertex height — the triangle's base

    const nodeU = { x: capTapR.x, y: shelfY };
    const nodeP = { x: capTapS.x, y: baseY };
    const nodeQ = { x: capTapT.x, y: baseY };

    wire(ctx, capTapR.x, capTapR.y, nodeU.x, nodeU.y, capColor(0), capDashed);
    wire(ctx, capTapS.x, capTapS.y, nodeP.x, nodeP.y, capColor(1), capDashed);
    wire(ctx, capTapT.x, capTapT.y, nodeQ.x, nodeQ.y, capColor(2), capDashed);

    const capCentroid = {
      x: (nodeU.x + nodeP.x + nodeQ.x) / 3,
      y: (nodeU.y + nodeP.y + nodeQ.y) / 3,
    };

    // Line currents feeding the bank from each phase
    drawCurrentText(
      ctx,
      (capTapR.x + nodeU.x) / 2 + 14,
      (capTapR.y + nodeU.y) / 2 - 24,
      "RC",
      capColor(0),
    );
    currentLabel(
      ctx,
      (capTapS.x + nodeP.x) / 2,
      (capTapS.y + nodeP.y) / 2,
      capCentroid.x,
      capCentroid.y,
      14,
      "SC",
      capColor(1),
    );
    drawCurrentText(
      ctx,
      (capTapT.x + nodeQ.x) / 2 - 24,
      (capTapT.y + nodeQ.y) / 2 + 14,
      "TC",
      capColor(2),
    );

    // Triangle sides — one capacitor each: U–P, P–Q, Q–U
    capacitorOnLine(
      ctx,
      nodeU.x,
      nodeU.y,
      nodeP.x,
      nodeP.y,
      capColor(0),
      capDashed,
    );
    capacitorOnLine(
      ctx,
      nodeP.x,
      nodeP.y,
      nodeQ.x,
      nodeQ.y,
      capColor(1),
      capDashed,
    );
    capacitorOnLine(
      ctx,
      nodeQ.x,
      nodeQ.y,
      nodeU.x,
      nodeU.y,
      capColor(2),
      capDashed,
    );

    // Capacitor branch currents (Δ side currents)
    currentLabel(
      ctx,
      (nodeU.x + nodeP.x) / 2,
      (nodeU.y + nodeP.y) / 2,
      capCentroid.x,
      capCentroid.y,
      14,
      "RS",
      capColor(0),
    );
    currentLabel(
      ctx,
      (nodeP.x + nodeQ.x) / 2,
      (nodeP.y + nodeQ.y) / 2,
      capCentroid.x,
      capCentroid.y,
      14,
      "ST",
      capColor(1),
    );
    drawCurrentText(
      ctx,
      (nodeQ.x + nodeU.x) / 2 - 6,
      (nodeQ.y + nodeU.y) / 2 - 20,
      "TR",
      capColor(2),
    );

    dot(ctx, nodeU.x, nodeU.y, capColor(0));
    dot(ctx, nodeP.x, nodeP.y, capColor(1));
    dot(ctx, nodeQ.x, nodeQ.y, capColor(2));

    ctx.save();
    ctx.fillStyle = mC;
    ctx.font = "bold 12px sans-serif";
    ctx.textAlign = "center";
    ctx.fillText(t(lang, "tpCapacitorsGroup"), capCentroid.x, baseY + 32);
    ctx.font = "11px sans-serif";
    ctx.fillText(`C = ${fmt(results.C_uF, 0)} µF`, capCentroid.x, baseY + 48);
    ctx.restore();

    // Motor bank (Δ) — one single 3-phase motor, fed by all three lines,
    // to the right of the capacitor bank. M sits directly below the T row:
    // all three phases drop in parallel (90°) down to a shared shelf
    // height, then bend to reach M — T is already aligned with M so its
    // drop is the straight R–T–M line.
    const motorTapR = { x: 320, y: yR };
    const motorTapS = { x: 380, y: yS };
    const motorTapT = { x: 350, y: yT };
    const motorM = { x: 350, y: 420 };
    const motorShelfY = (motorTapT.y + motorM.y) / 2;
    {
      const tap = motorTapR;
      const color = phaseColors[0];
      dot(ctx, tap.x, tap.y, color);
      const bend = { x: tap.x, y: motorShelfY };
      wire(ctx, tap.x, tap.y, bend.x, bend.y, color); // parallel vertical drop
      const end = shortenTo(bend.x, bend.y, motorM.x, motorM.y, 14);
      wire(ctx, bend.x, bend.y, end.x, end.y, color); // diagonal into M
      drawCurrentText(
        ctx,
        (bend.x + end.x) / 2 - 34,
        (bend.y + end.y) / 2,
        "RM",
        color,
      );
    }
    {
      const tap = motorTapS;
      const color = phaseColors[1];
      dot(ctx, tap.x, tap.y, color);
      const bend = { x: tap.x, y: motorShelfY };
      wire(ctx, tap.x, tap.y, bend.x, bend.y, color); // parallel vertical drop
      const end = shortenTo(bend.x, bend.y, motorM.x, motorM.y, 14);
      wire(ctx, bend.x, bend.y, end.x, end.y, color); // diagonal into M
      drawCurrentText(
        ctx,
        (bend.x + end.x) / 2 - 10,
        (bend.y + end.y) / 2 - 22,
        "SM",
        color,
      );
    }
    dot(ctx, motorTapT.x, motorTapT.y, phaseColors[2]);
    const tEnd = shortenTo(motorTapT.x, motorTapT.y, motorM.x, motorM.y, 14);
    wire(ctx, motorTapT.x, motorTapT.y, tEnd.x, tEnd.y, phaseColors[2]);
    currentLabelOnSegment(
      ctx,
      motorTapT.x,
      motorTapT.y,
      tEnd.x,
      tEnd.y,
      22,
      "TM",
      phaseColors[2],
    );
    labeledCircle(ctx, motorM.x, motorM.y, "M", mC, isDark);

    ctx.save();
    ctx.fillStyle = mC;
    ctx.font = "bold 12px sans-serif";
    ctx.textAlign = "center";
    ctx.fillText(t(lang, "tpMotorsGroup"), motorM.x, motorM.y + 32);
    ctx.font = "11px sans-serif";
    ctx.fillText(
      `P₁ = ${fmt(results.P1 / 1000, 0)} kW`,
      motorM.x,
      motorM.y + 48,
    );
    ctx.restore();

    // Rows continue straight across, past the capacitor and motor taps,
    // toward the star load
    const busX2 = 420;
    wire(ctx, wmX + 16, yR, capTapR.x, yR, phaseColors[0]);
    wire(ctx, capTapR.x, yR, motorTapR.x, yR, phaseColors[0]);
    wire(ctx, motorTapR.x, yR, busX2, yR, phaseColors[0]);
    wire(ctx, wmX + 16, yT, capTapT.x, yT, phaseColors[2]);
    wire(ctx, capTapT.x, yT, motorTapT.x, yT, phaseColors[2]);
    wire(ctx, motorTapT.x, yT, busX2, yT, phaseColors[2]);
    wire(ctx, xStart, yS, capTapS.x, yS, phaseColors[1]);
    wire(ctx, capTapS.x, yS, motorTapS.x, yS, phaseColors[1]);
    wire(ctx, motorTapS.x, yS, busX2, yS, phaseColors[1]);
    busYs.forEach((y, i) => dot(ctx, busX2, y, phaseColors[i]));

    // Star load — lighting (Y), neutral point centered on the S row.
    // Balanced load: one lamp symbol per phase stands in for the N/3 lamps
    // wired to that phase (all three spokes still land on the neutral N).
    const starN = { x: 500, y: yS };
    const lampsPerPhase = params.numLamps;
    const starSubs = ["RL", "SL", "TL"];
    [phaseColors[0], phaseColors[1], phaseColors[2]].forEach((color, i) => {
      const from = [
        { x: busX2, y: yR },
        { x: busX2, y: yS },
        { x: busX2, y: yT },
      ][i];
      const mid = splitWire(ctx, from.x, from.y, starN.x, starN.y, color, 12);
      lampSymbol(ctx, mid.x, mid.y, color);
      currentLabelOnSegment(
        ctx,
        from.x,
        from.y,
        mid.x,
        mid.y,
        12,
        starSubs[i],
        color,
      );
    });
    ctx.save();
    ctx.fillStyle = mC;
    ctx.font = "10px sans-serif";
    ctx.textAlign = "center";
    ctx.fillText(`×${fmt(lampsPerPhase, 0)}`, (busX2 + starN.x) / 2, yS - 16);
    ctx.restore();
    dot(ctx, starN.x, starN.y, nodeC);
    ctx.save();
    ctx.fillStyle = nodeC;
    ctx.font = "bold 11px sans-serif";
    ctx.textAlign = "left";
    ctx.textBaseline = "middle";
    ctx.fillText("N", starN.x + 12, starN.y);
    ctx.restore();
    ctx.save();
    ctx.fillStyle = mC;
    ctx.font = "bold 12px sans-serif";
    ctx.textAlign = "center";
    ctx.fillText(t(lang, "tpLightingGroup"), (busX2 + starN.x) / 2, yT + 42);
    ctx.font = "11px sans-serif";
    ctx.fillText(
      `P₂ = ${fmt(results.P2 / 1000, 2)} kW`,
      (busX2 + starN.x) / 2,
      yT + 58,
    );
    ctx.restore();

    // Footer — I_L, W_RS, W_ST with real subscripts, centered as a group
    {
      const footerY = H - 14;
      const bigFont = "11px sans-serif";
      const subFont = "8px sans-serif";
      const pieces: { text: string; font: string; dy: number }[] = [
        { text: "I", font: bigFont, dy: 0 },
        { text: "L", font: subFont, dy: 2 },
        { text: `  = ${fmt(results.I_L, 2)} A    `, font: bigFont, dy: 0 },
        { text: "W", font: bigFont, dy: 0 },
        { text: "RS", font: subFont, dy: 2 },
        { text: `  = ${fmt(results.W_RS, 0)} W    `, font: bigFont, dy: 0 },
        { text: "W", font: bigFont, dy: 0 },
        { text: "ST", font: subFont, dy: 2 },
        { text: `  = ${fmt(results.W_ST, 0)} W`, font: bigFont, dy: 0 },
      ];
      ctx.fillStyle = mC;
      ctx.textAlign = "left";
      ctx.textBaseline = "alphabetic";
      let totalWidth = 0;
      pieces.forEach((p) => {
        ctx.font = p.font;
        totalWidth += ctx.measureText(p.text).width;
      });
      let px = W / 2 - totalWidth / 2;
      pieces.forEach((p) => {
        ctx.font = p.font;
        ctx.fillText(p.text, px, footerY + p.dy);
        px += ctx.measureText(p.text).width;
      });
    }
  }, [results, lang, params.numLamps, flags.capacitorsOn]);

  return (
    <canvas
      ref={canvasRef}
      width={W}
      height={H}
      className="w-full"
      aria-label={t(lang, "threePhaseSchematicAriaLabel")}
    />
  );
}
