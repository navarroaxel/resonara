'use client'
import { useEffect, useRef } from 'react'
import { useKirchhoffAC } from '@/store/kirchhoff-ac-store'
import { useUI } from '@/store/ui-store'
import { fmt } from '@/lib/utils'
import { t } from '@/lib/i18n'
import { drawResistorHBody, drawResistorVBody } from '@/lib/schematic-draw'
import type { ComplexDisplay, ResistorSymbol } from '@/lib/types'

const W = 800, H = 340

// Layout constants
const TOP     = 70
const BOT     = 280
const SRC_L   = 60   // left branch (AC source)
const NODE_A  = 290  // first shared branch (R load)
const NODE_B  = 510  // second shared branch (motor Zm)
const NODE_C  = 730  // right branch (capacitor)
const SRC_CY  = (TOP + BOT) / 2  // 175

// ── Helpers ──────────────────────────────────────────────────────────────────

function wire(ctx: CanvasRenderingContext2D, x1: number, y1: number, x2: number, y2: number, c: string) {
  ctx.save(); ctx.strokeStyle = c; ctx.lineWidth = 2; ctx.lineCap = 'round'
  ctx.beginPath(); ctx.moveTo(x1, y1); ctx.lineTo(x2, y2); ctx.stroke(); ctx.restore()
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

function arrowHead(ctx: CanvasRenderingContext2D, x: number, y: number, angle: number, size: number, c: string) {
  ctx.save(); ctx.fillStyle = c; ctx.translate(x, y); ctx.rotate(angle)
  ctx.beginPath(); ctx.moveTo(0, 0); ctx.lineTo(-size, size * 0.4); ctx.lineTo(-size, -size * 0.4)
  ctx.closePath(); ctx.fill(); ctx.restore()
}

function meshLoop(ctx: CanvasRenderingContext2D, cx: number, cy: number, rx: number, ry: number, c: string, label: string) {
  const startAngle = 50  * Math.PI / 180
  const endAngle   = 315 * Math.PI / 180
  ctx.save()
  ctx.strokeStyle = c; ctx.lineWidth = 1.5; ctx.setLineDash([5, 3])
  ctx.beginPath()
  ctx.save()
  ctx.translate(cx, cy); ctx.scale(rx / 50, ry / 50)
  ctx.arc(0, 0, 50, startAngle, endAngle)
  ctx.restore()
  ctx.stroke(); ctx.setLineDash([])
  const ex = cx + rx * Math.cos(endAngle)
  const ey = cy + ry * Math.sin(endAngle)
  arrowHead(ctx, ex, ey, endAngle + Math.PI / 2, 7, c)
  ctx.fillStyle = c; ctx.font = 'italic bold 13px sans-serif'
  ctx.textAlign = 'center'; ctx.textBaseline = 'middle'
  ctx.fillText(label, cx, cy)
  ctx.restore()
}

// AC source — circle with ~ glyph
function sourceAC(ctx: CanvasRenderingContext2D, cx: number, cy: number, r: number, c: string, lbl: string, Vs: number, f: number) {
  ctx.save(); ctx.strokeStyle = c; ctx.lineWidth = 1.8
  ctx.beginPath(); ctx.arc(cx, cy, r, 0, 2 * Math.PI); ctx.stroke()
  // ~ glyph
  ctx.strokeStyle = c; ctx.lineWidth = 1.5
  ctx.beginPath()
  ctx.moveTo(cx - 8, cy)
  ctx.bezierCurveTo(cx - 5, cy - 6, cx - 3, cy - 6, cx, cy)
  ctx.bezierCurveTo(cx + 3, cy + 6, cx + 5, cy + 6, cx + 8, cy)
  ctx.stroke()
  ctx.fillStyle = c; ctx.font = 'bold 11px sans-serif'; ctx.textAlign = 'right'; ctx.textBaseline = 'alphabetic'
  ctx.fillText(lbl, cx - r - 4, cy + 4)
  ctx.font = '10px sans-serif'
  ctx.fillText(`${fmt(Vs, 0)}V`, cx - r - 4, cy + 16)
  ctx.fillText(`${fmt(f, 0)}Hz`, cx - r - 4, cy + 28)
  ctx.restore()
}

// Vertical resistor
function resistorV(ctx: CanvasRenderingContext2D, cx: number, cy: number, hh: number, c: string, mC: string, lbl: string, valueStr: string, symbol: ResistorSymbol) {
  const rh = hh * 0.55, rw = 18
  wire(ctx, cx, cy - hh, cx, cy - rh, c)
  drawResistorVBody(ctx, cx - rw / 2, cy - rh, rw, rh * 2, c, symbol)
  wire(ctx, cx, cy + rh, cx, cy + hh, c)
  ctx.save(); ctx.fillStyle = c; ctx.font = 'bold 11px sans-serif'; ctx.textAlign = 'left'
  ctx.fillText(lbl, cx + rw / 2 + 6, cy - 8)
  ctx.fillStyle = mC; ctx.font = '10px sans-serif'
  ctx.fillText(valueStr, cx + rw / 2 + 6, cy + 8)
  ctx.restore()
}

// Horizontal resistor (for R1 in top rail)
function resistorH(ctx: CanvasRenderingContext2D, cx: number, cy: number, hw: number, c: string, mC: string, lbl: string, valueStr: string, symbol: ResistorSymbol) {
  const rw = hw * 0.6, rh = 18
  wire(ctx, cx - hw, cy, cx - rw, cy, c)
  drawResistorHBody(ctx, cx - rw, cy - rh / 2, rw * 2, rh, c, symbol)
  wire(ctx, cx + rw, cy, cx + hw, cy, c)
  ctx.save(); ctx.fillStyle = mC; ctx.font = '10px sans-serif'; ctx.textAlign = 'center'
  ctx.fillText(valueStr, cx, cy - rh / 2 - 18)
  ctx.fillStyle = c; ctx.font = 'bold 11px sans-serif'
  ctx.fillText(lbl, cx, cy - rh / 2 - 4)
  ctx.restore()
}

// Vertical coil (inductor bumps)
function inductorV(ctx: CanvasRenderingContext2D, cx: number, cy: number, hh: number, c: string, mC: string, lbl: string, valueStr: string) {
  const bumps = 4
  const bumpR = hh / (bumps * 1.5)
  const totalH = bumps * bumpR * 2
  const startY = cy - totalH / 2
  wire(ctx, cx, cy - hh, cx, startY, c)
  wire(ctx, cx, startY + totalH, cx, cy + hh, c)
  ctx.save(); ctx.strokeStyle = c; ctx.lineWidth = 1.8
  for (let i = 0; i < bumps; i++) {
    const bCY = startY + bumpR + i * bumpR * 2
    ctx.beginPath()
    ctx.arc(cx, bCY, bumpR, -Math.PI / 2, Math.PI / 2)
    ctx.stroke()
  }
  ctx.fillStyle = c; ctx.font = 'bold 11px sans-serif'; ctx.textAlign = 'left'
  ctx.fillText(lbl, cx + bumpR + 10, cy - 8)
  ctx.fillStyle = mC; ctx.font = '10px sans-serif'
  ctx.fillText(valueStr, cx + bumpR + 10, cy + 8)
  ctx.restore()
}

// Vertical capacitor symbol (two plates)
function capacitorV(ctx: CanvasRenderingContext2D, cx: number, cy: number, hh: number, c: string, mC: string, lbl: string, valueStr: string) {
  const plateW = 28
  const gap    = 8
  wire(ctx, cx, cy - hh, cx, cy - gap / 2, c)
  wire(ctx, cx, cy + gap / 2, cx, cy + hh, c)
  ctx.save(); ctx.strokeStyle = c; ctx.lineWidth = 2.5; ctx.lineCap = 'round'
  ctx.beginPath(); ctx.moveTo(cx - plateW / 2, cy - gap / 2); ctx.lineTo(cx + plateW / 2, cy - gap / 2); ctx.stroke()
  ctx.beginPath(); ctx.moveTo(cx - plateW / 2, cy + gap / 2); ctx.lineTo(cx + plateW / 2, cy + gap / 2); ctx.stroke()
  ctx.fillStyle = c; ctx.font = 'bold 11px sans-serif'; ctx.textAlign = 'left'
  ctx.fillText(lbl, cx + plateW / 2 + 6, cy - 8)
  ctx.fillStyle = mC; ctx.font = '10px sans-serif'
  ctx.fillText(valueStr, cx + plateW / 2 + 6, cy + 8)
  ctx.restore()
}

// Horizontal switch symbol (open or closed)
function switchH(ctx: CanvasRenderingContext2D, x1: number, x2: number, y: number, isOpen: boolean, c: string) {
  const sw = 22
  const cx = (x1 + x2) / 2
  wire(ctx, x1, y, cx - sw, y, c)
  wire(ctx, cx + sw, y, x2, y, c)
  ctx.save(); ctx.fillStyle = c
  ctx.beginPath(); ctx.arc(cx - sw, y, 3, 0, 2 * Math.PI); ctx.fill()
  ctx.beginPath(); ctx.arc(cx + sw, y, 3, 0, 2 * Math.PI); ctx.fill()
  ctx.strokeStyle = c; ctx.lineWidth = 2; ctx.lineCap = 'round'
  ctx.beginPath(); ctx.moveTo(cx - sw, y)
  if (isOpen) ctx.lineTo(cx + sw * 0.6, y - 18)
  else        ctx.lineTo(cx + sw, y)
  ctx.stroke(); ctx.restore()
}

// Phasor annotation: |I|∠φ°
function phasorAnnotation(ctx: CanvasRenderingContext2D, x: number, y: number, cd: ComplexDisplay, c: string) {
  if (!Number.isFinite(cd.mag)) return
  ctx.save(); ctx.fillStyle = c; ctx.font = '10px monospace'; ctx.textAlign = 'left'
  ctx.fillText(`${fmt(cd.mag, 3)}A`, x, y)
  ctx.fillText(`∠${fmt(cd.ang, 1)}°`, x, y + 12)
  ctx.restore()
}

export function KirchhoffACSchematic() {
  const canvasRef = useRef<HTMLCanvasElement>(null)
  const { state: { params, flags, results } } = useKirchhoffAC()
  const { state: { lang, resistorSymbol } } = useUI()

  useEffect(() => {
    const canvas = canvasRef.current
    if (!canvas) return
    const ctx = canvas.getContext('2d')
    if (!ctx) return

    const isDark = window.matchMedia('(prefers-color-scheme: dark)').matches
    ctx.clearRect(0, 0, W, H)

    const wC = isDark ? '#85B7EB' : '#378ADD'   // wire
    const nC = isDark ? '#FAC775' : '#BA7517'   // node dot
    const rC = isDark ? '#F0997B' : '#D85A30'   // resistor
    const vsC = isDark ? '#4ade80' : '#16a34a'  // voltage source (green)
    const sC = isDark ? '#AFA9EC' : '#7F77DD'   // Mesh 1 (violet)
    const tC = isDark ? '#5DCAA5' : '#1D9E75'   // Mesh 2 (teal)
    const oC = isDark ? '#FDBA74' : '#EA580C'   // Mesh 3 (orange)
    const mC = isDark ? '#9FA0A0' : '#888'      // meta text / gnd
    const iC = isDark ? '#60A5FA' : '#2563EB'   // current arrows

    const { Vs, f, R1, R, Rm, Lm, C } = params
    const { I1, I2, I3, IR, IZm } = results
    const { mesh3 } = flags

    // ── Bottom rail ──────────────────────────────────────────────────────────
    wire(ctx, SRC_L, BOT, NODE_B, BOT, wC)
    wire(ctx, NODE_B, BOT, NODE_C, BOT, mesh3 ? wC : mC)

    // ── Left branch: AC source ───────────────────────────────────────────────
    wire(ctx, SRC_L, TOP, SRC_L, SRC_CY - 24, wC)
    wire(ctx, SRC_L, SRC_CY + 24, SRC_L, BOT, wC)
    sourceAC(ctx, SRC_L, SRC_CY, 24, vsC, 'Vs', Vs, f)

    // ── Top rail: R1 resistor from source to Node A ──────────────────────────
    const R1_CX = (SRC_L + NODE_A) / 2  // 175
    if (R1 > 0) {
      wire(ctx, SRC_L, TOP, R1_CX - 50, TOP, wC)
      resistorH(ctx, R1_CX, TOP, 50, rC, mC, `R₁`, `${fmt(R1, 1)}Ω`, resistorSymbol)
      wire(ctx, R1_CX + 50, TOP, NODE_A, TOP, wC)
    } else {
      wire(ctx, SRC_L, TOP, NODE_A, TOP, wC)
    }

    // ── Top rail: wire from Node A to Node B ─────────────────────────────────
    wire(ctx, NODE_A, TOP, NODE_B, TOP, wC)

    // ── Top rail: switch from Node B to Node C (open when mesh3 off) ────────
    switchH(ctx, NODE_B, NODE_C, TOP, !mesh3, mesh3 ? wC : mC)

    // ── First shared branch: R (load) at Node A ──────────────────────────────
    // brHH = (BOT-TOP)/2 = 105 so resistorV spans exactly TOP to BOT
    const brHH = (BOT - TOP) / 2
    resistorV(ctx, NODE_A, SRC_CY, brHH, rC, mC, `R`, `${fmt(R, 0)}Ω`, resistorSymbol)

    // ── Second shared branch: Motor Zm at Node B — Rm (top) + Lm (bottom) ───
    const motorHH  = brHH / 2
    const rmCY     = (TOP + SRC_CY) / 2   // 122.5 — centre of upper half
    const lmCY     = (SRC_CY + BOT) / 2   // 227.5 — centre of lower half
    resistorV(ctx, NODE_B, rmCY, motorHH, rC, mC, `Rm`, `${fmt(Rm, 1)}Ω`, resistorSymbol)
    inductorV(ctx, NODE_B,  lmCY, motorHH, rC, mC, `Lm`, `${fmt(Lm, 0)}mH`)

    // ── Third branch: Capacitor Zc at Node C ────────────────────────────────
    capacitorV(ctx, NODE_C, SRC_CY, brHH, mesh3 ? oC : mC, mC, `C`, `${fmt(C, 1)}µF`)

    // ── GND symbol at Node A ─────────────────────────────────────────────────
    wire(ctx, NODE_A, BOT, NODE_A, BOT + 10, wC)
    gndSymbol(ctx, NODE_A, BOT + 10, mC)
    ctx.save(); ctx.fillStyle = mC; ctx.font = '10px sans-serif'
    ctx.textAlign = 'center'; ctx.textBaseline = 'top'
    ctx.fillText('GND', NODE_A, BOT + 28); ctx.restore()

    // ── Node labels ──────────────────────────────────────────────────────────
    dot(ctx, NODE_A, TOP, nC)
    ctx.save(); ctx.fillStyle = nC; ctx.font = 'bold 11px sans-serif'
    ctx.textAlign = 'center'; ctx.textBaseline = 'bottom'
    ctx.fillText('A', NODE_A, TOP - 6); ctx.restore()

    dot(ctx, NODE_B, TOP, nC)
    ctx.save(); ctx.fillStyle = nC; ctx.font = 'bold 11px sans-serif'
    ctx.textAlign = 'center'; ctx.textBaseline = 'bottom'
    ctx.fillText('B', NODE_B, TOP - 6); ctx.restore()

    dot(ctx, NODE_C, TOP, nC)
    ctx.save(); ctx.fillStyle = nC; ctx.font = 'bold 11px sans-serif'
    ctx.textAlign = 'center'; ctx.textBaseline = 'bottom'
    ctx.fillText('C', NODE_C, TOP - 6); ctx.restore()

    // ── Mesh loop arrows ─────────────────────────────────────────────────────
    meshLoop(ctx, R1_CX,                      SRC_CY, 50, 42, sC, 'I₁')
    meshLoop(ctx, (NODE_A + NODE_B) / 2,      SRC_CY, 50, 42, tC, 'I₂')
    meshLoop(ctx, (NODE_B + NODE_C) / 2,      SRC_CY, 50, 42, oC, 'I₃')

    // ── Branch current annotations ───────────────────────────────────────────
    phasorAnnotation(ctx, R1_CX - 20, SRC_CY + 60, I1, sC)
    phasorAnnotation(ctx, (NODE_A + NODE_B) / 2 - 20, SRC_CY + 60, I2, tC)
    phasorAnnotation(ctx, (NODE_B + NODE_C) / 2 - 20, SRC_CY + 60, I3, oC)
    phasorAnnotation(ctx, NODE_A + 22, SRC_CY - 60, IR, iC)
    // Motor annotation goes to the left to avoid overlapping the Rm/Lm labels
    phasorAnnotation(ctx, NODE_B - 65, SRC_CY - 60, IZm, iC)

  }, [params, flags, results, resistorSymbol])

  return (
    <canvas
      ref={canvasRef}
      width={W}
      height={H}
      className="w-full"
      aria-label={t(lang, 'kacSchematicAria')}
    />
  )
}
