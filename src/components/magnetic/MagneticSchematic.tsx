'use client'
import { useEffect, useRef } from 'react'
import { useMagnetic } from '@/store/magnetic-store'
import { fmt } from '@/lib/utils'
import { t } from '@/lib/i18n'

const W    = 580
const H    = 240
const topY = 50
const botY = 190
const midY = (topY + botY) / 2  // 120

// Vertical coil: spine at x, bumps protrude right (facingRight=true) or left (false)
function verticalCoil(
  ctx: CanvasRenderingContext2D,
  x: number,
  bumps: number,
  r: number,
  color: string,
  facingRight: boolean,
) {
  const coilH = bumps * 2 * r
  const cTop  = midY - coilH / 2
  const cBot  = midY + coilH / 2

  ctx.strokeStyle = color
  ctx.lineWidth   = 2.5

  // Lead wires from rails to coil extent
  ctx.beginPath()
  ctx.moveTo(x, topY); ctx.lineTo(x, cTop)
  ctx.stroke()
  ctx.beginPath()
  ctx.moveTo(x, cBot); ctx.lineTo(x, botY)
  ctx.stroke()

  // Bumps
  for (let i = 0; i < bumps; i++) {
    const cy = cTop + r + i * 2 * r
    ctx.beginPath()
    // Right: clockwise from 3π/2→π/2 sweeps through 0 (right side)
    // Left:  counterclockwise from 3π/2→π/2 sweeps through π (left side)
    ctx.arc(x, cy, r, 3 * Math.PI / 2, Math.PI / 2, !facingRight)
    ctx.stroke()
  }
}

function horizResistor(
  ctx: CanvasRenderingContext2D,
  cx: number,
  cy: number,
  label: string,
  isDark: boolean,
  rColor: string,
  labelColor: string,
) {
  const bw = 36, bh = 16
  ctx.fillStyle = isDark ? '#171717' : '#ffffff'
  ctx.fillRect(cx - bw / 2, cy - bh / 2, bw, bh)
  ctx.strokeStyle = rColor
  ctx.lineWidth   = 1.5
  ctx.strokeRect(cx - bw / 2, cy - bh / 2, bw, bh)
  ctx.fillStyle    = labelColor
  ctx.font         = '10px monospace'
  ctx.textAlign    = 'center'
  ctx.textBaseline = 'middle'
  ctx.fillText(label, cx, cy)
  ctx.textBaseline = 'alphabetic'
}

function vertResistor(
  ctx: CanvasRenderingContext2D,
  cx: number,
  cy: number,
  label: string,
  isDark: boolean,
  rColor: string,
  labelColor: string,
) {
  const bw = 16, bh = 36
  ctx.fillStyle = isDark ? '#171717' : '#ffffff'
  ctx.fillRect(cx - bw / 2, cy - bh / 2, bw, bh)
  ctx.strokeStyle = rColor
  ctx.lineWidth   = 1.5
  ctx.strokeRect(cx - bw / 2, cy - bh / 2, bw, bh)
  ctx.fillStyle    = labelColor
  ctx.font         = '10px monospace'
  ctx.textAlign    = 'left'
  ctx.textBaseline = 'middle'
  ctx.fillText(label, cx + bw / 2 + 4, cy)
  ctx.textBaseline = 'alphabetic'
}

function acSource(
  ctx: CanvasRenderingContext2D,
  cx: number,
  cy: number,
  color: string,
  labelColor: string,
) {
  ctx.strokeStyle = color
  ctx.lineWidth   = 2
  ctx.beginPath(); ctx.arc(cx, cy, 16, 0, Math.PI * 2); ctx.stroke()
  ctx.font         = '14px serif'
  ctx.fillStyle    = labelColor
  ctx.textAlign    = 'center'
  ctx.textBaseline = 'middle'
  ctx.fillText('~', cx, cy)
  ctx.textBaseline = 'alphabetic'
}

export function MagneticSchematic() {
  const canvasRef = useRef<HTMLCanvasElement>(null)
  const { state: { results, params, lang } } = useMagnetic()

  useEffect(() => {
    const canvas = canvasRef.current
    if (!canvas) return
    const ctx = canvas.getContext('2d')
    if (!ctx) return
    const isDark = window.matchMedia('(prefers-color-scheme: dark)').matches

    ctx.clearRect(0, 0, W, H)

    const wireP    = isDark ? '#60a5fa' : '#2563eb'   // primary wire
    const wireS    = isDark ? '#2dd4bf' : '#0d9488'   // secondary wire
    const coupleC  = isDark ? '#c084fc' : '#7c3aed'   // coupling channel
    const rColor   = isDark ? '#fb923c' : '#ea580c'   // resistors
    const labelC   = isDark ? '#d4d4d4' : '#404040'
    const dimC     = isDark ? '#525252' : '#d4d4d4'

    const BUMPS = 5
    const BUMP_R = 14  // 5 × 2 × 14 = 140px = botY − topY ✓

    // Coil spine x positions
    const xL1 = 240   // primary coil (right wall of primary loop)
    const xL2 = 340   // secondary coil (left wall of secondary loop)

    // ── PRIMARY CIRCUIT ────────────────────────────────────────────
    const xVs  = 32   // Vs source center x
    const xR1  = 136  // R1 box center x

    ctx.strokeStyle = wireP
    ctx.lineWidth   = 2
    // Top rail: Vs → R1 → L1 top
    ctx.beginPath()
    ctx.moveTo(xVs, topY)
    ctx.lineTo(xR1 - 18, topY)
    ctx.stroke()
    horizResistor(ctx, xR1, topY, 'R₁', isDark, rColor, labelC)
    ctx.strokeStyle = wireP
    ctx.lineWidth   = 2
    ctx.beginPath()
    ctx.moveTo(xR1 + 18, topY); ctx.lineTo(xL1, topY)
    ctx.stroke()
    // Bottom rail: Vs → L1 bottom
    ctx.beginPath()
    ctx.moveTo(xVs, botY); ctx.lineTo(xL1, botY)
    ctx.stroke()
    // Vs left vertical wire
    ctx.beginPath()
    ctx.moveTo(xVs, topY); ctx.lineTo(xVs, midY - 16)
    ctx.stroke()
    ctx.beginPath()
    ctx.moveTo(xVs, midY + 16); ctx.lineTo(xVs, botY)
    ctx.stroke()

    acSource(ctx, xVs, midY, wireP, labelC)

    // L1 coil — vertical, facing RIGHT (toward channel)
    verticalCoil(ctx, xL1, BUMPS, BUMP_R, wireP, true)

    // Vs label
    ctx.fillStyle    = labelC
    ctx.font         = '10px monospace'
    ctx.textAlign    = 'left'
    ctx.textBaseline = 'alphabetic'
    ctx.fillText('Vs', xVs + 20, midY + 4)

    // L1 label (inside primary loop, to the left of the coil)
    ctx.fillStyle  = wireP
    ctx.font       = '10px monospace'
    ctx.textAlign  = 'right'
    ctx.fillText('L₁', xL1 - 6, topY - 6)

    // ── SECONDARY CIRCUIT ──────────────────────────────────────────
    const xEnd = 548  // right wall x

    ctx.strokeStyle = wireS
    ctx.lineWidth   = 2
    // Top rail: clean wire L2 top → right wall
    ctx.beginPath()
    ctx.moveTo(xL2, topY); ctx.lineTo(xEnd, topY)
    ctx.stroke()
    // Right vertical wall with R₂ centered on it
    ctx.beginPath()
    ctx.moveTo(xEnd, topY); ctx.lineTo(xEnd, midY - 18)
    ctx.stroke()
    vertResistor(ctx, xEnd, midY, 'R₂', isDark, rColor, labelC)
    ctx.strokeStyle = wireS
    ctx.lineWidth   = 2
    ctx.beginPath()
    ctx.moveTo(xEnd, midY + 18); ctx.lineTo(xEnd, botY)
    ctx.stroke()
    // Bottom rail
    ctx.beginPath()
    ctx.moveTo(xEnd, botY); ctx.lineTo(xL2, botY)
    ctx.stroke()

    // L2 coil — vertical, facing LEFT (toward channel)
    verticalCoil(ctx, xL2, BUMPS, BUMP_R, wireS, false)

    // L2 label
    ctx.fillStyle  = wireS
    ctx.font       = '10px monospace'
    ctx.textAlign  = 'left'
    ctx.fillText('L₂', xL2 + 6, topY - 6)

    // ── COUPLING CHANNEL ───────────────────────────────────────────
    ctx.strokeStyle = coupleC
    ctx.lineWidth   = 1.5
    ctx.setLineDash([6, 4])
    ctx.beginPath(); ctx.moveTo(263, topY - 10); ctx.lineTo(263, botY + 10); ctx.stroke()
    ctx.beginPath(); ctx.moveTo(317, topY - 10); ctx.lineTo(317, botY + 10); ctx.stroke()
    ctx.setLineDash([])

    // k and M labels centered in channel
    ctx.fillStyle  = coupleC
    ctx.font       = '10px monospace'
    ctx.textAlign  = 'center'
    ctx.fillText(`k = ${params.k.toFixed(2)}`, 290, botY + 22)
    ctx.fillText(`M = ${fmt(results.M, 2)} mH`, 290, botY + 36)

    // Section labels
    ctx.fillStyle  = dimC
    ctx.font       = '9px monospace'
    ctx.textAlign  = 'center'
    ctx.fillText(t(lang, 'magPrimaryLabel'),   (xVs + xL1) / 2, botY + 14)
    ctx.fillText(t(lang, 'magSecondaryLabel'), (xL2 + xEnd) / 2, botY + 14)
  }, [results, params, lang])

  return (
    <canvas
      ref={canvasRef}
      width={W}
      height={H}
      className="w-full"
      aria-label={t(lang, 'magSchematicAriaLabel')}
    />
  )
}
