'use client'
import { useEffect, useRef } from 'react'
import { useThreePhase } from '@/store/three-phase-store'
import { fmt } from '@/lib/utils'
import { t } from '@/lib/i18n'

const W = 580
const H = 320
const TWO_PI = 2 * Math.PI

const PHASE_COLORS_LIGHT = ['#C53030', '#B7791F', '#2B6CB0'] as const
const PHASE_COLORS_DARK  = ['#FC8181', '#F6AD55', '#63B3ED'] as const
const PHASE_LABELS = ['R', 'S', 'T'] as const

function wire(ctx: CanvasRenderingContext2D, x1: number, y1: number, x2: number, y2: number, c: string) {
  ctx.save(); ctx.strokeStyle = c; ctx.lineWidth = 2; ctx.lineCap = 'round'
  ctx.beginPath(); ctx.moveTo(x1, y1); ctx.lineTo(x2, y2); ctx.stroke(); ctx.restore()
}

function dot(ctx: CanvasRenderingContext2D, x: number, y: number, c: string) {
  ctx.save(); ctx.fillStyle = c
  ctx.beginPath(); ctx.arc(x, y, 4, 0, TWO_PI); ctx.fill(); ctx.restore()
}

function loadBox(
  ctx: CanvasRenderingContext2D,
  cx: number, cy: number, angle: number,
  hasL: boolean, hasC: boolean,
  grayC: string, nodeC: string, rC: string, lC: string, cC: string,
) {
  ctx.save()
  ctx.translate(cx, cy)
  ctx.rotate(angle)

  const totalW = 80
  const halfW  = totalW / 2
  const h = 20

  // entry/exit wires
  wire(ctx, -halfW - 12, 0, -halfW, 0, nodeC)
  wire(ctx,  halfW, 0,  halfW + 12, 0, nodeC)

  // R section
  const rW = hasL || hasC ? 24 : totalW
  ctx.save(); ctx.strokeStyle = rC; ctx.lineWidth = 1.8
  ctx.strokeRect(-halfW, -h / 2, rW, h); ctx.restore()
  ctx.save(); ctx.fillStyle = rC; ctx.font = 'bold 11px sans-serif'
  ctx.textAlign = 'center'; ctx.textBaseline = 'middle'
  ctx.fillText('R', -halfW + rW / 2, 0); ctx.restore()

  let x = -halfW + rW

  // L section
  if (hasL) {
    const lW = hasC ? 28 : totalW - rW
    const bumps = 3
    const bw = lW / bumps
    wire(ctx, x, 0, x + 2, 0, lC)
    ctx.save(); ctx.strokeStyle = lC; ctx.lineWidth = 1.8; ctx.lineCap = 'round'; ctx.lineJoin = 'round'
    ctx.beginPath(); ctx.moveTo(x + 2, 0)
    for (let i = 0; i < bumps; i++) {
      const bx = x + 2 + i * bw
      ctx.quadraticCurveTo(bx + bw * 0.25, -10, bx + bw * 0.5, 0)
      ctx.quadraticCurveTo(bx + bw * 0.75, 3, bx + bw, 0)
    }
    ctx.stroke(); ctx.restore()
    x += lW
  } else if (hasC) {
    // show disabled L box
    ctx.save(); ctx.strokeStyle = grayC; ctx.lineWidth = 1.5; ctx.setLineDash([3, 2])
    ctx.strokeRect(x, -h / 2, 28, h); ctx.restore()
    ctx.save(); ctx.fillStyle = grayC; ctx.font = '11px sans-serif'
    ctx.textAlign = 'center'; ctx.textBaseline = 'middle'
    ctx.fillText('L', x + 14, 0); ctx.restore()
    x += 28
  }

  // C section
  if (hasC) {
    const cW = halfW - (x - (-halfW)) // remaining width
    const midX = x + cW / 2
    wire(ctx, x, 0, midX - 8, 0, cC)
    ctx.save(); ctx.strokeStyle = cC; ctx.lineWidth = 2.2; ctx.lineCap = 'round'
    ctx.beginPath(); ctx.moveTo(midX - 8, -h / 2); ctx.lineTo(midX - 8, h / 2); ctx.stroke()
    ctx.beginPath(); ctx.moveTo(midX,     -h / 2); ctx.lineTo(midX,     h / 2); ctx.stroke()
    ctx.restore()
    wire(ctx, midX, 0, halfW, 0, cC)
  } else if (hasL) {
    // show disabled C box
    const cW = halfW - (x - (-halfW))
    ctx.save(); ctx.strokeStyle = grayC; ctx.lineWidth = 1.5; ctx.setLineDash([3, 2])
    ctx.strokeRect(x, -h / 2, cW, h); ctx.restore()
    ctx.save(); ctx.fillStyle = grayC; ctx.font = '11px sans-serif'
    ctx.textAlign = 'center'; ctx.textBaseline = 'middle'
    ctx.fillText('C', x + cW / 2, 0); ctx.restore()
  }

  ctx.restore()
}

function drawStar(
  ctx: CanvasRenderingContext2D, isDark: boolean,
  hasL: boolean, hasC: boolean,
  XL: number, XC: number, Z: number, fr: number,
  _lang: 'es' | 'en',
) {
  const phaseColors = isDark ? PHASE_COLORS_DARK : PHASE_COLORS_LIGHT
  const mC    = isDark ? '#9FA0A0' : '#888'
  const grayC = isDark ? '#404040' : '#C8C8C8'
  const rC    = isDark ? '#F0997B' : '#D85A30'
  const lC    = hasL ? (isDark ? '#AFA9EC' : '#7F77DD') : grayC
  const cC    = hasC ? (isDark ? '#5DCAA5' : '#1D9E75') : grayC
  const nodeC = isDark ? '#FAC775' : '#BA7517'

  const cx = W / 2, cy = H / 2 - 20
  const spokeLen = 110
  const loadDist = spokeLen * 0.5
  const spokeAngles = [0, -TWO_PI / 3, TWO_PI / 3]

  // Draw spokes and loads
  spokeAngles.forEach((angle, i) => {
    const tx = cx + spokeLen * Math.cos(angle)
    const ty = cy - spokeLen * Math.sin(angle)
    wire(ctx, cx, cy, tx, ty, phaseColors[i])
    const lx = cx + loadDist * Math.cos(angle)
    const ly = cy - loadDist * Math.sin(angle)
    loadBox(ctx, lx, ly, -angle, hasL, hasC, grayC, nodeC, rC, lC, cC)
    dot(ctx, tx, ty, phaseColors[i])
    ctx.save()
    ctx.fillStyle = phaseColors[i]
    ctx.font = 'bold 13px sans-serif'
    ctx.textAlign = 'center'; ctx.textBaseline = 'middle'
    const labelDist = spokeLen + 14
    ctx.fillText(PHASE_LABELS[i], cx + labelDist * Math.cos(angle), cy - labelDist * Math.sin(angle))
    ctx.restore()
  })

  // Neutral node N
  dot(ctx, cx, cy, nodeC)
  ctx.save()
  ctx.fillStyle = nodeC; ctx.font = 'bold 11px sans-serif'
  ctx.textAlign = 'center'; ctx.fillText('N', cx, cy + 14); ctx.restore()

  // Footer annotation
  const frStr = Number.isFinite(fr) ? `fr = ${fmt(fr, 1)} Hz` : 'fr = —'
  ctx.fillStyle = mC; ctx.font = '11px sans-serif'; ctx.textAlign = 'center'
  ctx.fillText(`Z = ${fmt(Z, 1)} Ω   XL = ${fmt(XL, 1)} Ω   XC = ${fmt(XC, 1)} Ω   ${frStr}`, W / 2, H - 12)
}

function drawDelta(
  ctx: CanvasRenderingContext2D, isDark: boolean,
  hasL: boolean, hasC: boolean,
  XL: number, XC: number, Z: number, fr: number,
  _lang: 'es' | 'en',
) {
  const phaseColors = isDark ? PHASE_COLORS_DARK : PHASE_COLORS_LIGHT
  const mC    = isDark ? '#9FA0A0' : '#888'
  const grayC = isDark ? '#404040' : '#C8C8C8'
  const rC    = isDark ? '#F0997B' : '#D85A30'
  const lC    = hasL ? (isDark ? '#AFA9EC' : '#7F77DD') : grayC
  const cC    = hasC ? (isDark ? '#5DCAA5' : '#1D9E75') : grayC
  const nodeC = isDark ? '#FAC775' : '#BA7517'

  // Equilateral triangle vertices: R top-center, S bottom-right, T bottom-left
  const triR = 110
  const cx = W / 2, cy = H / 2 - 10
  const verts = [
    { x: cx,              y: cy - triR,       label: 'R', colorIdx: 0 },  // R top
    { x: cx + triR * 0.866, y: cy + triR * 0.5, label: 'S', colorIdx: 1 },  // S bottom-right
    { x: cx - triR * 0.866, y: cy + triR * 0.5, label: 'T', colorIdx: 2 },  // T bottom-left
  ]

  // Draw triangle sides with loads (each side: Z_RS, Z_ST, Z_TR)
  // Side indices: 0→1 (R→S), 1→2 (S→T), 2→0 (T→R)
  const sides = [
    { from: 0, to: 1, colorIdx: 0 },
    { from: 1, to: 2, colorIdx: 1 },
    { from: 2, to: 0, colorIdx: 2 },
  ]

  sides.forEach(({ from, to, colorIdx }) => {
    const v0 = verts[from], v1 = verts[to]
    const color = phaseColors[colorIdx]
    wire(ctx, v0.x, v0.y, v1.x, v1.y, color)
    const mx = (v0.x + v1.x) / 2
    const my = (v0.y + v1.y) / 2
    const angle = Math.atan2(v0.y - v1.y, v0.x - v1.x)
    loadBox(ctx, mx, my, angle + Math.PI, hasL, hasC, grayC, nodeC, rC, lC, cC)
  })

  // Vertex dots and labels
  verts.forEach(({ x, y, label, colorIdx }) => {
    dot(ctx, x, y, phaseColors[colorIdx])
    const dx = x - cx, dy = y - cy
    const dist = Math.sqrt(dx * dx + dy * dy)
    const lx = x + (dx / dist) * 16
    const ly = y + (dy / dist) * 16
    ctx.save()
    ctx.fillStyle = phaseColors[colorIdx]
    ctx.font = 'bold 13px sans-serif'
    ctx.textAlign = 'center'; ctx.textBaseline = 'middle'
    ctx.fillText(label, lx, ly); ctx.restore()
  })

  const frStr = Number.isFinite(fr) ? `fr = ${fmt(fr, 1)} Hz` : 'fr = —'
  ctx.fillStyle = mC; ctx.font = '11px sans-serif'; ctx.textAlign = 'center'
  ctx.fillText(`Z = ${fmt(Z, 1)} Ω   XL = ${fmt(XL, 1)} Ω   XC = ${fmt(XC, 1)} Ω   ${frStr}`, W / 2, H - 12)
}

export function ThreePhaseSchematic() {
  const canvasRef = useRef<HTMLCanvasElement>(null)
  const { state: { connection, results, flags, lang } } = useThreePhase()

  useEffect(() => {
    const canvas = canvasRef.current
    if (!canvas) return
    const ctx = canvas.getContext('2d')
    if (!ctx) return
    const isDark = window.matchMedia('(prefers-color-scheme: dark)').matches
    ctx.clearRect(0, 0, W, H)

    const { XL, XC, Z, fr } = results
    const { hasL, hasC } = flags

    if (connection === 'star') {
      drawStar(ctx, isDark, hasL, hasC, XL, XC, Z, fr, lang)
    } else {
      drawDelta(ctx, isDark, hasL, hasC, XL, XC, Z, fr, lang)
    }
  }, [connection, results, flags, lang])

  return (
    <canvas
      ref={canvasRef}
      width={W}
      height={H}
      className="w-full"
      aria-label={t(lang, 'threePhaseSchematicAriaLabel')}
    />
  )
}
