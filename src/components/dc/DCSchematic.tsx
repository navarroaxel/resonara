'use client'
import { useEffect, useRef } from 'react'
import { useDC } from '@/store/dc-store'
import { fmt } from '@/lib/utils'
import { t } from '@/lib/i18n'

const W = 640, H = 320

// Layout constants
const TOP = 70, BOT = 260
const SRC_L = 60, SRC_R = 580, NODE_A_X = 320
const SRC_CY = (TOP + BOT) / 2  // 165
const SRC_R_CIRCLE = 22

function wire(ctx: CanvasRenderingContext2D, x1: number, y1: number, x2: number, y2: number, c: string) {
  ctx.save(); ctx.strokeStyle = c; ctx.lineWidth = 2; ctx.lineCap = 'round'
  ctx.beginPath(); ctx.moveTo(x1, y1); ctx.lineTo(x2, y2); ctx.stroke(); ctx.restore()
}

function resistorH(
  ctx: CanvasRenderingContext2D,
  cx: number, cy: number, hw: number,  // half-width
  c: string, mC: string, lbl: string, valueStr: string,
) {
  const rw = hw * 0.6, rh = 18
  wire(ctx, cx - hw, cy, cx - rw, cy, c)
  ctx.save(); ctx.strokeStyle = c; ctx.lineWidth = 1.8
  ctx.strokeRect(cx - rw, cy - rh / 2, rw * 2, rh); ctx.restore()
  wire(ctx, cx + rw, cy, cx + hw, cy, c)
  ctx.save(); ctx.fillStyle = c; ctx.font = 'bold 11px sans-serif'; ctx.textAlign = 'center'
  ctx.fillText(lbl, cx, cy - rh / 2 - 14)
  ctx.fillStyle = mC; ctx.font = '10px sans-serif'
  ctx.fillText(valueStr, cx, cy - rh / 2 - 4)
  ctx.restore()
}

function resistorV(
  ctx: CanvasRenderingContext2D,
  cx: number, cy: number, hh: number,  // half-height
  c: string, mC: string, lbl: string, valueStr: string,
) {
  const rh = hh * 0.55, rw = 18
  wire(ctx, cx, cy - hh, cx, cy - rh, c)
  ctx.save(); ctx.strokeStyle = c; ctx.lineWidth = 1.8
  ctx.strokeRect(cx - rw / 2, cy - rh, rw, rh * 2); ctx.restore()
  wire(ctx, cx, cy + rh, cx, cy + hh, c)
  ctx.save(); ctx.fillStyle = c; ctx.font = 'bold 11px sans-serif'; ctx.textAlign = 'left'
  ctx.fillText(lbl, cx + rw / 2 + 6, cy - 6)
  ctx.fillStyle = mC; ctx.font = '10px sans-serif'
  ctx.fillText(valueStr, cx + rw / 2 + 6, cy + 10)
  ctx.restore()
}

function sourceDC(
  ctx: CanvasRenderingContext2D, cx: number, cy: number, r: number,
  c: string, lbl: string, voltage: number,
) {
  ctx.save(); ctx.strokeStyle = c; ctx.lineWidth = 1.8
  ctx.beginPath(); ctx.arc(cx, cy, r, 0, 2 * Math.PI); ctx.stroke()
  ctx.fillStyle = c; ctx.font = '11px sans-serif'; ctx.textAlign = 'center'; ctx.textBaseline = 'middle'
  ctx.fillText('+', cx, cy - 8)
  ctx.fillText('−', cx, cy + 9)
  ctx.font = 'bold 11px sans-serif'; ctx.textBaseline = 'alphabetic'; ctx.textAlign = 'right'
  ctx.fillText(lbl, cx - r - 4, cy + 4)
  ctx.font = '10px sans-serif'; ctx.fillText(`${fmt(voltage, 1)}V`, cx - r - 4, cy + 16)
  ctx.restore()
}

function dot(ctx: CanvasRenderingContext2D, x: number, y: number, c: string) {
  ctx.save(); ctx.fillStyle = c
  ctx.beginPath(); ctx.arc(x, y, 4, 0, 2 * Math.PI); ctx.fill(); ctx.restore()
}

function gndSymbol(ctx: CanvasRenderingContext2D, x: number, y: number, c: string) {
  ctx.save(); ctx.strokeStyle = c; ctx.lineWidth = 1.5; ctx.lineCap = 'round'
  const lines = [18, 12, 6]
  lines.forEach((w, i) => {
    const yy = y + i * 5
    ctx.beginPath(); ctx.moveTo(x - w / 2, yy); ctx.lineTo(x + w / 2, yy); ctx.stroke()
  })
  ctx.restore()
}

function arrowHead(
  ctx: CanvasRenderingContext2D, x: number, y: number, angle: number, size: number, c: string,
) {
  ctx.save(); ctx.fillStyle = c; ctx.translate(x, y); ctx.rotate(angle)
  ctx.beginPath(); ctx.moveTo(0, 0); ctx.lineTo(-size, size * 0.4); ctx.lineTo(-size, -size * 0.4)
  ctx.closePath(); ctx.fill(); ctx.restore()
}

function meshLoop(
  ctx: CanvasRenderingContext2D,
  cx: number, cy: number, rx: number, ry: number,
  c: string, label: string,
) {
  const startAngle = 50  * Math.PI / 180
  const endAngle   = 315 * Math.PI / 180
  ctx.save()
  ctx.strokeStyle = c; ctx.lineWidth = 1.5; ctx.setLineDash([5, 3])
  ctx.beginPath()
  // Approximate ellipse using bezier arcs scaled to rx, ry
  ctx.save()
  ctx.translate(cx, cy); ctx.scale(rx / 50, ry / 50)
  ctx.arc(0, 0, 50, startAngle, endAngle)
  ctx.restore()
  ctx.stroke()
  ctx.setLineDash([])
  // Arrowhead at end of arc
  const ex = cx + rx * Math.cos(endAngle)
  const ey = cy + ry * Math.sin(endAngle)
  // Tangent: clockwise → tangent angle = endAngle + PI/2
  arrowHead(ctx, ex, ey, endAngle + Math.PI / 2, 7, c)
  // Label
  ctx.fillStyle = c; ctx.font = 'italic bold 13px sans-serif'
  ctx.textAlign = 'center'; ctx.textBaseline = 'middle'
  ctx.fillText(label, cx, cy)
  ctx.restore()
}

function currentArrowH(
  ctx: CanvasRenderingContext2D,
  x: number, y: number, current: number, c: string, label: string,
) {
  if (!Number.isFinite(current)) return
  const dir = current >= 0 ? 1 : -1
  const size = 7
  arrowHead(ctx, x, y, dir > 0 ? 0 : Math.PI, size, c)
  ctx.save(); ctx.fillStyle = c; ctx.font = '10px sans-serif'
  ctx.textAlign = 'center'; ctx.textBaseline = 'bottom'
  ctx.fillText(label, x, y - size - 2)
  ctx.restore()
}

function currentArrowV(
  ctx: CanvasRenderingContext2D,
  x: number, y: number, current: number, c: string, label: string,
) {
  if (!Number.isFinite(current)) return
  const dir = current >= 0 ? 1 : -1
  const size = 7
  // down = angle PI/2, up = -PI/2
  arrowHead(ctx, x, y, dir > 0 ? Math.PI / 2 : -Math.PI / 2, size, c)
  ctx.save(); ctx.fillStyle = c; ctx.font = '10px sans-serif'
  ctx.textAlign = 'left'; ctx.textBaseline = 'middle'
  ctx.fillText(label, x + size + 4, y)
  ctx.restore()
}

export function DCSchematic() {
  const canvasRef = useRef<HTMLCanvasElement>(null)
  const { state: { params, results, lang } } = useDC()

  useEffect(() => {
    const canvas = canvasRef.current
    if (!canvas) return
    const ctx = canvas.getContext('2d')
    if (!ctx) return

    const isDark = window.matchMedia('(prefers-color-scheme: dark)').matches
    ctx.clearRect(0, 0, W, H)

    const wC  = isDark ? '#85B7EB' : '#378ADD'   // wire
    const nC  = isDark ? '#FAC775' : '#BA7517'   // node dot
    const rC  = isDark ? '#F0997B' : '#D85A30'   // resistor
    const sC  = isDark ? '#AFA9EC' : '#7F77DD'   // source / I1 loop
    const tC  = isDark ? '#5DCAA5' : '#1D9E75'   // I2 loop / teal
    const mC  = isDark ? '#9FA0A0' : '#888'      // meta text / gnd
    const iC  = isDark ? '#60A5FA' : '#2563EB'   // current arrows

    const { V1, V2, R1, R2, R3 } = params
    const { IR1, IR2, IR3, VR1, VR2, VR3 } = results

    // ── Bottom rail (GND bus) ──────────────────────────────────────────────
    wire(ctx, SRC_L, BOT, SRC_R, BOT, wC)

    // ── Left branch (V1 source) ──────────────────────────────────────────
    wire(ctx, SRC_L, TOP, SRC_L, SRC_CY - SRC_R_CIRCLE, wC)
    wire(ctx, SRC_L, SRC_CY + SRC_R_CIRCLE, SRC_L, BOT, wC)
    sourceDC(ctx, SRC_L, SRC_CY, SRC_R_CIRCLE, sC, 'V₁', V1)

    // ── Right branch (V2 source) ─────────────────────────────────────────
    wire(ctx, SRC_R, TOP, SRC_R, SRC_CY - SRC_R_CIRCLE, wC)
    wire(ctx, SRC_R, SRC_CY + SRC_R_CIRCLE, SRC_R, BOT, wC)
    sourceDC(ctx, SRC_R, SRC_CY, SRC_R_CIRCLE, tC, 'V₂', V2)

    // ── Top rail ──────────────────────────────────────────────────────────
    // Left segment: V1 top → R1 left
    wire(ctx, SRC_L, TOP, 130, TOP, wC)
    // R1 (centered at ~190, TOP)
    resistorH(ctx, 190, TOP, 60, rC, mC, 'R₁', `${fmt(R1, 0)}Ω  VR₁=${fmt(VR1, 2)}V`)
    // R1 right → Node A
    wire(ctx, 250, TOP, NODE_A_X, TOP, wC)
    // Node A → R3 left
    wire(ctx, NODE_A_X, TOP, 390, TOP, wC)
    // R3 (centered at ~450, TOP)
    resistorH(ctx, 450, TOP, 60, rC, mC, 'R₃', `${fmt(R3, 0)}Ω  VR₃=${fmt(VR3, 2)}V`)
    // R3 right → V2 top
    wire(ctx, 510, TOP, SRC_R, TOP, wC)

    // ── Middle branch (R2, shared) ────────────────────────────────────────
    // Wire gaps between node A / GND and the R2 component extents
    const r2HH = 75
    wire(ctx, NODE_A_X, TOP,            NODE_A_X, SRC_CY - r2HH, wC)
    wire(ctx, NODE_A_X, SRC_CY + r2HH, NODE_A_X, BOT,            wC)
    resistorV(ctx, NODE_A_X, SRC_CY, r2HH, rC, mC, 'R₂', `${fmt(R2, 0)}Ω  VR₂=${fmt(VR2, 2)}V`)

    // ── Nodes ────────────────────────────────────────────────────────────
    dot(ctx, NODE_A_X, TOP, nC)
    ctx.save(); ctx.fillStyle = nC; ctx.font = 'bold 11px sans-serif'
    ctx.textAlign = 'center'; ctx.textBaseline = 'bottom'
    ctx.fillText('A', NODE_A_X, TOP - 6); ctx.restore()

    gndSymbol(ctx, NODE_A_X, BOT + 2, mC)
    ctx.save(); ctx.fillStyle = mC; ctx.font = '10px sans-serif'
    ctx.textAlign = 'center'; ctx.textBaseline = 'top'
    ctx.fillText('B (GND)', NODE_A_X, BOT + 20); ctx.restore()

    // ── Mesh loop arrows ─────────────────────────────────────────────────
    meshLoop(ctx, 190, SRC_CY, 70, 60, sC, 'I₁')
    meshLoop(ctx, 450, SRC_CY, 70, 60, tC, 'I₂')

    // ── Branch current arrows ─────────────────────────────────────────────
    currentArrowH(ctx, 190, TOP - 28, IR1, iC, `IR₁=${fmt(IR1, 3)}A`)
    currentArrowV(ctx, NODE_A_X + 28, SRC_CY, IR2, iC, `IR₂=${fmt(IR2, 3)}A`)
    currentArrowH(ctx, 450, TOP - 28, IR3, iC, `IR₃=${fmt(IR3, 3)}A`)

  }, [params, results])

  return (
    <canvas
      ref={canvasRef}
      width={W}
      height={H}
      className="w-full"
      aria-label={t(lang, 'dcSchematicAriaLabel')}
    />
  )
}
