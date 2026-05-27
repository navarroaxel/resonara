'use client'
import { useEffect, useRef } from 'react'
import { useThreePhase } from '@/store/three-phase-store'
import { t } from '@/lib/i18n'

const SIZE = 320
const TWO_PI = 2 * Math.PI

const PHASE_COLORS = ['#E53E3E', '#D69E2E', '#3182CE'] as const
const PHASE_LABELS = ['R', 'S', 'T'] as const
const PHASE_ANGLES = [0, -TWO_PI / 3, TWO_PI / 3] as const

function drawArrow(
  ctx: CanvasRenderingContext2D,
  ox: number, oy: number, ex: number, ey: number,
  color: string, label: string,
  dashed = false,
  labelDx = 6,
) {
  ctx.save()
  ctx.strokeStyle = color; ctx.fillStyle = color
  ctx.lineWidth = dashed ? 1.5 : 2
  if (dashed) ctx.setLineDash([5, 3])
  ctx.beginPath(); ctx.moveTo(ox, oy); ctx.lineTo(ex, ey); ctx.stroke()
  ctx.setLineDash([])
  const angle = Math.atan2(ey - oy, ex - ox)
  ctx.beginPath()
  ctx.moveTo(ex, ey)
  ctx.lineTo(ex - 10 * Math.cos(angle - 0.4), ey - 10 * Math.sin(angle - 0.4))
  ctx.lineTo(ex - 10 * Math.cos(angle + 0.4), ey - 10 * Math.sin(angle + 0.4))
  ctx.closePath(); ctx.fill()
  ctx.font = 'bold 12px sans-serif'
  ctx.fillText(label, ex + labelDx, ey - 4)
  ctx.restore()
}

export function ThreePhasePhasorDiagram() {
  const canvasRef = useRef<HTMLCanvasElement>(null)
  const { state: { results, lang } } = useThreePhase()

  useEffect(() => {
    const canvas = canvasRef.current
    if (!canvas) return
    const ctx = canvas.getContext('2d')
    if (!ctx) return

    const isDark = window.matchMedia('(prefers-color-scheme: dark)').matches
    const cx = SIZE / 2, cy = SIZE / 2

    ctx.clearRect(0, 0, SIZE, SIZE)

    ctx.strokeStyle = isDark ? 'rgba(255,255,255,0.12)' : 'rgba(0,0,0,0.1)'
    ctx.lineWidth = 0.5
    ctx.beginPath(); ctx.moveTo(0, cy); ctx.lineTo(SIZE, cy); ctx.stroke()
    ctx.beginPath(); ctx.moveTo(cx, 0); ctx.lineTo(cx, SIZE); ctx.stroke()

    ctx.fillStyle = isDark ? '#9FA0A0' : '#888'
    ctx.font = '11px sans-serif'
    ctx.fillText('Re', SIZE - 18, cy - 6)
    ctx.fillText('Im', cx + 4, 12)

    const { V_ph, I_ph, phi } = results
    const phiRad = (phi * Math.PI) / 180

    const vScale = (SIZE * 0.38) / (V_ph || 1)
    const iScale = (SIZE * 0.30) / (I_ph || 1)

    PHASE_ANGLES.forEach((angle, i) => {
      const color = PHASE_COLORS[i]
      const label = PHASE_LABELS[i]
      const ex = cx + V_ph * vScale * Math.cos(angle)
      const ey = cy - V_ph * vScale * Math.sin(angle)
      drawArrow(ctx, cx, cy, ex, ey, color, `V${label}`)
    })

    PHASE_ANGLES.forEach((angle, i) => {
      const color = PHASE_COLORS[i]
      const label = PHASE_LABELS[i]
      const iAngle = angle - phiRad
      const ex = cx + I_ph * iScale * Math.cos(iAngle)
      const ey = cy - I_ph * iScale * Math.sin(iAngle)
      drawArrow(ctx, cx, cy, ex, ey, color, `I${label}`, true)
    })

    const legend: [string, string, boolean][] = [
      [PHASE_COLORS[0], `VR / IR`, false],
      [PHASE_COLORS[1], `VS / IS`, false],
      [PHASE_COLORS[2], `VT / IT`, false],
    ]
    ctx.font = '11px sans-serif'
    legend.forEach(([c, l], i) => {
      ctx.fillStyle = c
      ctx.fillRect(8, 8 + i * 16, 10, 10)
      ctx.fillStyle = isDark ? '#9FA0A0' : '#888'
      ctx.fillText(l, 22, 18 + i * 16)
    })
    ctx.fillStyle = isDark ? '#9FA0A0' : '#888'
    ctx.font = '10px sans-serif'
    ctx.fillText('— V  ╌╌ I', 8, 8 + 3 * 16)
  }, [results, lang])

  return (
    <canvas
      ref={canvasRef}
      width={SIZE}
      height={SIZE}
      className="mx-auto block"
      aria-label={t(lang, 'threePhasePhasorAriaLabel')}
    />
  )
}
