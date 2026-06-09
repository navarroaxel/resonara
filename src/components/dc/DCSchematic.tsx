'use client'
import { useEffect, useRef } from 'react'
import { useDC } from '@/store/dc-store'
import { useUI } from '@/store/ui-store'
import { fmt } from '@/lib/utils'
import { t } from '@/lib/i18n'
import { drawResistorHBody, drawResistorVBody } from '@/lib/schematic-draw'
import type { ResistorSymbol } from '@/lib/types'

const W = 800, H = 320

// Layout constants — three equal mesh windows across the canvas
const TOP = 70, BOT = 260
const SRC_L = 60, NODE_A_X = 290, NODE_B_X = 510, SRC_R = 740
const SRC_CY = (TOP + BOT) / 2  // 165
const SRC_R_CIRCLE = 22

function wire(ctx: CanvasRenderingContext2D, x1: number, y1: number, x2: number, y2: number, c: string) {
  ctx.save(); ctx.strokeStyle = c; ctx.lineWidth = 2; ctx.lineCap = 'round'
  ctx.beginPath(); ctx.moveTo(x1, y1); ctx.lineTo(x2, y2); ctx.stroke(); ctx.restore()
}

function resistorH(
  ctx: CanvasRenderingContext2D,
  cx: number, cy: number, hw: number,
  c: string, mC: string, lbl: string, valueStr: string,
  symbol: ResistorSymbol,
) {
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

function resistorV(
  ctx: CanvasRenderingContext2D,
  cx: number, cy: number, hh: number,
  c: string, mC: string, lbl: string, valueStr: string,
  symbol: ResistorSymbol,
  valueYOff = 0,
) {
  const rh = hh * 0.55, rw = 18
  wire(ctx, cx, cy - hh, cx, cy - rh, c)
  drawResistorVBody(ctx, cx - rw / 2, cy - rh, rw, rh * 2, c, symbol)
  wire(ctx, cx, cy + rh, cx, cy + hh, c)
  ctx.save(); ctx.fillStyle = c; ctx.font = 'bold 11px sans-serif'; ctx.textAlign = 'left'
  ctx.fillText(lbl, cx + rw / 2 + 6, cy - 8)
  ctx.fillStyle = mC; ctx.font = '10px sans-serif'
  ctx.fillText(valueStr, cx + rw / 2 + 6, cy + 8 + valueYOff)
  ctx.restore()
}

function sourceDC(
  ctx: CanvasRenderingContext2D, cx: number, cy: number, r: number,
  c: string, lbl: string, voltage: number, normal = true,
) {
  ctx.save(); ctx.strokeStyle = c; ctx.lineWidth = 1.8
  ctx.beginPath(); ctx.arc(cx, cy, r, 0, 2 * Math.PI); ctx.stroke()
  ctx.fillStyle = c; ctx.font = '11px sans-serif'; ctx.textAlign = 'center'; ctx.textBaseline = 'middle'
  ctx.fillText(normal ? '+' : '−', cx, cy - 8)
  ctx.fillText(normal ? '−' : '+', cx, cy + 9)
  ctx.font = 'bold 11px sans-serif'; ctx.textBaseline = 'alphabetic'; ctx.textAlign = 'right'
  ctx.fillText(lbl, cx - r - 4, cy + 4)
  ctx.font = '10px sans-serif'; ctx.fillText(`${fmt(voltage, 1)}V`, cx - r - 4, cy + 16)
  ctx.restore()
}

// Horizontal DC source — + on the right when normal (in direction of clockwise mesh current)
function sourceDCH(
  ctx: CanvasRenderingContext2D, cx: number, cy: number, r: number,
  c: string, lbl: string, voltage: number, normal = true,
) {
  ctx.save(); ctx.strokeStyle = c; ctx.lineWidth = 1.8
  ctx.beginPath(); ctx.arc(cx, cy, r, 0, 2 * Math.PI); ctx.stroke()
  ctx.fillStyle = c; ctx.font = '11px sans-serif'; ctx.textAlign = 'center'; ctx.textBaseline = 'middle'
  ctx.fillText(normal ? '+' : '−', cx + 8, cy)
  ctx.fillText(normal ? '−' : '+', cx - 9, cy)
  ctx.font = 'bold 11px sans-serif'; ctx.textBaseline = 'alphabetic'; ctx.textAlign = 'center'
  ctx.fillText(lbl, cx, cy - r - 14)
  ctx.font = '10px sans-serif'; ctx.fillText(`${fmt(voltage, 1)}V`, cx, cy - r - 4)
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
  ctx.save()
  ctx.translate(cx, cy); ctx.scale(rx / 50, ry / 50)
  ctx.arc(0, 0, 50, startAngle, endAngle)
  ctx.restore()
  ctx.stroke()
  ctx.setLineDash([])
  const ex = cx + rx * Math.cos(endAngle)
  const ey = cy + ry * Math.sin(endAngle)
  arrowHead(ctx, ex, ey, endAngle + Math.PI / 2, 7, c)
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
  ctx.textAlign = 'left'; ctx.textBaseline = 'middle'
  ctx.fillText(label, x + size, y)
  ctx.restore()
}

function currentArrowV(
  ctx: CanvasRenderingContext2D,
  x: number, y: number, current: number, c: string, label: string,
) {
  if (!Number.isFinite(current)) return
  const dir = current >= 0 ? 1 : -1
  const size = 7
  arrowHead(ctx, x, y, dir > 0 ? Math.PI / 2 : -Math.PI / 2, size, c)
  ctx.save(); ctx.fillStyle = c; ctx.font = '10px sans-serif'
  ctx.textAlign = 'left'; ctx.textBaseline = 'middle'
  ctx.fillText(label, x + size + 4, y)
  ctx.restore()
}

export function DCSchematic() {
  const canvasRef = useRef<HTMLCanvasElement>(null)
  const { state: { params, flags, results } } = useDC()
  const { state: { lang, resistorSymbol } } = useUI()

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
    const sC  = isDark ? '#AFA9EC' : '#7F77DD'   // Mesh 1 (violet)
    const tC  = isDark ? '#5DCAA5' : '#1D9E75'   // Mesh 2 (teal)
    const oC  = isDark ? '#FDBA74' : '#EA580C'   // Mesh 3 (orange)
    const mC  = isDark ? '#9FA0A0' : '#888'      // meta text / gnd
    const iC  = isDark ? '#60A5FA' : '#2563EB'   // current arrows

    const { V1, V2, V3, R1, R2, R3, R4, R5 } = params
    const { polarityV1, polarityV2, polarityV3 } = flags
    const { IR1, IR2, IR3, IR4, IR5, VR1, VR2, VR3, VR4, VR5 } = results
    const dC    = isDark ? '#4B5563' : '#D1D5DB'   // disabled color
    const polG  = isDark ? '#4ADE80' : '#16A34A'   // polarity normal  (green)
    const polR  = isDark ? '#F87171' : '#DC2626'   // polarity inverted (red)
    const v1C = flags.V1 ? (polarityV1 ? polG : polR) : dC
    const v2C = flags.V2 ? (polarityV2 ? polG : polR) : dC
    const v3C = flags.V3 ? (polarityV3 ? polG : polR) : dC
    const r1C = flags.R1 ? rC : dC
    const r2C = flags.R2 ? rC : dC
    const r3C = flags.R3 ? rC : dC
    const r4C = flags.R4 ? rC : dC
    const r5C = flags.R5 ? rC : dC

    const railRight = flags.mesh3 ? SRC_R : NODE_B_X

    // ── Bottom rail (GND bus) ──────────────────────────────────────────────
    wire(ctx, SRC_L, BOT, railRight, BOT, wC)

    // ── Left branch (V1 source) ──────────────────────────────────────────
    if (flags.V1) {
      wire(ctx, SRC_L, TOP, SRC_L, SRC_CY - SRC_R_CIRCLE, wC)
      wire(ctx, SRC_L, SRC_CY + SRC_R_CIRCLE, SRC_L, BOT, wC)
      sourceDC(ctx, SRC_L, SRC_CY, SRC_R_CIRCLE, v1C, 'V₁', V1, polarityV1)
    } else {
      wire(ctx, SRC_L, TOP, SRC_L, BOT, wC)
    }

    // ── Right branch (V3 source) — only when Mesh 3 is active ────────────
    if (flags.mesh3) {
      if (flags.V3) {
        wire(ctx, SRC_R, TOP, SRC_R, SRC_CY - SRC_R_CIRCLE, wC)
        wire(ctx, SRC_R, SRC_CY + SRC_R_CIRCLE, SRC_R, BOT, wC)
        sourceDC(ctx, SRC_R, SRC_CY, SRC_R_CIRCLE, v3C, 'V₃', V3, polarityV3)
      } else {
        wire(ctx, SRC_R, TOP, SRC_R, BOT, wC)
      }
    }

    // ── Top rail ──────────────────────────────────────────────────────────
    const R1_CX = (SRC_L + NODE_A_X) / 2  // 175
    if (flags.R1) {
      wire(ctx, SRC_L, TOP, R1_CX - 50, TOP, wC)
      resistorH(ctx, R1_CX, TOP, 50, r1C, mC, `R₁ = ${fmt(R1, 0)}Ω`, `VR₁=${fmt(VR1, 2)}V`, resistorSymbol)
      wire(ctx, R1_CX + 50, TOP, NODE_A_X, TOP, wC)
    } else {
      wire(ctx, SRC_L, TOP, NODE_A_X, TOP, wC)
    }

    const R3_CX = 355
    const V3_CX = 460
    const V3_R  = 20
    if (flags.R3) {
      wire(ctx, NODE_A_X, TOP, R3_CX - 42, TOP, wC)
      resistorH(ctx, R3_CX, TOP, 42, r3C, mC, `R₃ = ${fmt(R3, 0)}Ω`, `VR₃=${fmt(VR3, 2)}V`, resistorSymbol)
      wire(ctx, R3_CX + 42, TOP, V3_CX - V3_R, TOP, wC)
    } else {
      wire(ctx, NODE_A_X, TOP, V3_CX - V3_R, TOP, wC)
    }
    if (flags.V2) {
      sourceDCH(ctx, V3_CX, TOP, V3_R, v2C, 'V₂', V2, polarityV2)
      wire(ctx, V3_CX + V3_R, TOP, NODE_B_X, TOP, wC)
    } else {
      wire(ctx, V3_CX - V3_R, TOP, NODE_B_X, TOP, wC)
    }

    const R5_CX = (NODE_B_X + SRC_R) / 2  // 625
    if (flags.mesh3) {
      if (flags.R5) {
        wire(ctx, NODE_B_X, TOP, R5_CX - 50, TOP, wC)
        resistorH(ctx, R5_CX, TOP, 50, r5C, mC, `R₅ = ${fmt(R5, 0)}Ω`, `VR₅=${fmt(VR5, 2)}V`, resistorSymbol)
        wire(ctx, R5_CX + 50, TOP, SRC_R, TOP, wC)
      } else {
        wire(ctx, NODE_B_X, TOP, SRC_R, TOP, wC)
      }
    }

    // ── Left shared branch (R2, Mesh 1–2 boundary at Node A) ─────────────
    const r2HH = 75
    if (flags.R2) {
      wire(ctx, NODE_A_X, TOP,            NODE_A_X, SRC_CY - r2HH, wC)
      wire(ctx, NODE_A_X, SRC_CY + r2HH, NODE_A_X, BOT,            wC)
      resistorV(ctx, NODE_A_X, SRC_CY, r2HH, r2C, mC, `R₂ = ${fmt(R2, 0)}Ω`, `VR₂=${fmt(VR2, 2)}V`, resistorSymbol, 14)
    } else {
      wire(ctx, NODE_A_X, TOP, NODE_A_X, BOT, wC)
    }

    // ── Right shared branch (R4, Mesh 2–3 boundary at Node B) ────────────
    if (flags.R4) {
      wire(ctx, NODE_B_X, TOP,            NODE_B_X, SRC_CY - r2HH, wC)
      wire(ctx, NODE_B_X, SRC_CY + r2HH, NODE_B_X, BOT,            wC)
      resistorV(ctx, NODE_B_X, SRC_CY, r2HH, r4C, mC, `R₄ = ${fmt(R4, 0)}Ω`, `VR₄=${fmt(VR4, 2)}V`, resistorSymbol)
    } else {
      wire(ctx, NODE_B_X, TOP, NODE_B_X, BOT, wC)
    }

    // ── Nodes ────────────────────────────────────────────────────────────
    dot(ctx, NODE_A_X, TOP, nC)
    ctx.save(); ctx.fillStyle = nC; ctx.font = 'bold 11px sans-serif'
    ctx.textAlign = 'center'; ctx.textBaseline = 'bottom'
    ctx.fillText('A', NODE_A_X, TOP - 6); ctx.restore()

    dot(ctx, NODE_B_X, TOP, nC)
    ctx.save(); ctx.fillStyle = nC; ctx.font = 'bold 11px sans-serif'
    ctx.textAlign = 'center'; ctx.textBaseline = 'bottom'
    ctx.fillText('B', NODE_B_X, TOP - 6); ctx.restore()

    wire(ctx, NODE_A_X, BOT, NODE_A_X, BOT + 10, wC)
    gndSymbol(ctx, NODE_A_X, BOT + 10, mC)
    ctx.save(); ctx.fillStyle = mC; ctx.font = '10px sans-serif'
    ctx.textAlign = 'center'; ctx.textBaseline = 'top'
    ctx.fillText('GND', NODE_A_X, BOT + 28)
    ctx.restore()

    // ── Mesh loop arrows ─────────────────────────────────────────────────
    meshLoop(ctx, R1_CX,                        SRC_CY, 50, 42, sC, 'I₁')
    meshLoop(ctx, (NODE_A_X + NODE_B_X) / 2,    SRC_CY, 50, 42, tC, 'I₂')
    if (flags.mesh3) meshLoop(ctx, R5_CX,        SRC_CY, 50, 42, oC, 'I₃')

    // ── Branch current arrows ─────────────────────────────────────────────
    currentArrowH(ctx, R1_CX, TOP + 22, IR1, iC, `IR₁=${fmt(IR1, 3)}A`)
    currentArrowV(ctx, NODE_A_X + 28, SRC_CY + 50, IR2, iC, `IR₂=${fmt(IR2, 3)}A`)
    currentArrowH(ctx, R3_CX, TOP + 22, IR3, iC, `IR₃=${fmt(IR3, 3)}A`)
    currentArrowV(ctx, NODE_B_X + 28, SRC_CY + 50, IR4, iC, `IR₄=${fmt(IR4, 3)}A`)
    if (flags.mesh3) currentArrowH(ctx, R5_CX, TOP + 22, IR5, iC, `IR₅=${fmt(IR5, 3)}A`)

  }, [params, flags, results, resistorSymbol])

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
