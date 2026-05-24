'use client'
import { useEffect, useRef } from 'react'
import { useRLC } from '@/store/rlc-store'

const SIZE = 280

function drawArrow(
  ctx: CanvasRenderingContext2D,
  ox: number, oy: number, ex: number, ey: number,
  color: string, label: string,
) {
  ctx.save()
  ctx.strokeStyle = color; ctx.fillStyle = color; ctx.lineWidth = 2
  ctx.beginPath(); ctx.moveTo(ox, oy); ctx.lineTo(ex, ey); ctx.stroke()
  const angle = Math.atan2(ey - oy, ex - ox)
  ctx.beginPath()
  ctx.moveTo(ex, ey)
  ctx.lineTo(ex - 10 * Math.cos(angle - 0.4), ey - 10 * Math.sin(angle - 0.4))
  ctx.lineTo(ex - 10 * Math.cos(angle + 0.4), ey - 10 * Math.sin(angle + 0.4))
  ctx.closePath(); ctx.fill()
  ctx.font = 'bold 12px sans-serif'
  ctx.fillText(label, ex + 6, ey - 4)
  ctx.restore()
}

export function PhasorDiagram() {
  const canvasRef = useRef<HTMLCanvasElement>(null)
  const { state: { params, results, circuitType, flags } } = useRLC()

  useEffect(() => {
    const canvas = canvasRef.current
    if (!canvas) return
    const ctx = canvas.getContext('2d')
    if (!ctx) return

    const { Vs, R } = params
    const { I, phi: phiDeg, XL, XC } = results
    const isDark = window.matchMedia('(prefers-color-scheme: dark)').matches
    const cx = SIZE / 2, cy = SIZE / 2
    const scale = (SIZE * 0.38) / Vs

    ctx.clearRect(0, 0, SIZE, SIZE)

    ctx.strokeStyle = isDark ? 'rgba(255,255,255,0.12)' : 'rgba(0,0,0,0.1)'
    ctx.lineWidth = 0.5
    ctx.beginPath(); ctx.moveTo(0, cy); ctx.lineTo(SIZE, cy); ctx.stroke()
    ctx.beginPath(); ctx.moveTo(cx, 0); ctx.lineTo(cx, SIZE); ctx.stroke()

    ctx.fillStyle = isDark ? '#9FA0A0' : '#888'
    ctx.font = '11px sans-serif'
    ctx.fillText('Re', SIZE - 18, cy - 6)
    ctx.fillText('Im', cx + 4, 12)

    const phiRad = (phiDeg * Math.PI) / 180
    drawArrow(ctx, cx, cy, cx + Vs * scale, cy, '#378ADD', 'V')
    drawArrow(ctx, cx, cy,
      cx + I * scale * 3 * Math.cos(-phiRad),
      cy + I * scale * 3 * Math.sin(-phiRad),
      '#1D9E75', 'I'
    )

    if (circuitType === 'series') {
      drawArrow(ctx, cx, cy, cx + I * R  * scale,  cy,              '#185FA5', 'VR')
      if (flags.hasL) drawArrow(ctx, cx, cy, cx, cy - I * XL * scale, '#7F77DD', 'VL')
      if (flags.hasC) drawArrow(ctx, cx, cy, cx, cy + I * XC * scale, '#D85A30', 'VC')
    }

    const legend: [string, string][] = circuitType === 'series'
      ? [
          ['#378ADD', 'V fuente'],
          ['#1D9E75', 'I'],
          ['#185FA5', 'VR'],
          ...(flags.hasL ? [['#7F77DD', 'VL'] as [string, string]] : []),
          ...(flags.hasC ? [['#D85A30', 'VC'] as [string, string]] : []),
        ]
      : [['#378ADD', 'V fuente'], ['#1D9E75', 'I total']]

    ctx.font = '11px sans-serif'
    legend.forEach(([c, l], i) => {
      ctx.fillStyle = c
      ctx.fillRect(8, 8 + i * 16, 10, 10)
      ctx.fillStyle = isDark ? '#9FA0A0' : '#888'
      ctx.fillText(l, 22, 18 + i * 16)
    })
  }, [params, results, circuitType, flags])

  return (
    <canvas
      ref={canvasRef}
      width={SIZE}
      height={SIZE}
      className="mx-auto block"
      aria-label="Diagrama fasorial de voltaje y corriente"
    />
  )
}
