'use client'
import { useEffect, useRef } from 'react'
import { useRLC } from '@/store/rlc-store'
import { t } from '@/lib/i18n'

const SIZE = 280

function drawArrow(
  ctx: CanvasRenderingContext2D,
  ox: number, oy: number, ex: number, ey: number,
  color: string, label: string,
  labelDx = 6,
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
  ctx.fillText(label, ex + labelDx, ey - 4)
  ctx.restore()
}

export function PhasorDiagram() {
  const canvasRef = useRef<HTMLCanvasElement>(null)
  const { state: { params, results, circuitType, flags, lang } } = useRLC()

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
    const iLen = SIZE * 0.32
    drawArrow(ctx, cx, cy, cx + Vs * scale, cy, '#378ADD', 'V')
    drawArrow(ctx, cx, cy,
      cx + iLen * Math.cos(-phiRad),
      cy + iLen * Math.sin(-phiRad),
      '#1D9E75', 'I'
    )

    if (circuitType === 'series') {
      drawArrow(ctx, cx, cy, cx + I * R  * scale,  cy,              '#D85A30', 'VR')
      if (flags.hasL) drawArrow(ctx, cx, cy, cx, cy - I * XL * scale, '#7F77DD', 'VL')
      if (flags.hasC) drawArrow(ctx, cx, cy, cx, cy + I * XC * scale, '#C0392B', 'VC')
    }

    const legend: [string, string][] = circuitType === 'series'
      ? [
          ['#378ADD', t(lang, 'vSource')],
          ['#1D9E75', 'I'],
          ['#D85A30', 'VR'],
          ...(flags.hasL ? [['#7F77DD', 'VL'] as [string, string]] : []),
          ...(flags.hasC ? [['#C0392B', 'VC'] as [string, string]] : []),
        ]
      : [['#378ADD', t(lang, 'vSource')], ['#1D9E75', t(lang, 'iTotal')]]

    ctx.font = '11px sans-serif'
    legend.forEach(([c, l], i) => {
      ctx.fillStyle = c
      ctx.fillRect(8, 8 + i * 16, 10, 10)
      ctx.fillStyle = isDark ? '#9FA0A0' : '#888'
      ctx.fillText(l, 22, 18 + i * 16)
    })
  }, [params, results, circuitType, flags, lang])

  return (
    <canvas
      ref={canvasRef}
      width={SIZE}
      height={SIZE}
      className="mx-auto block"
      aria-label={t(lang, 'phasorAriaLabel')}
    />
  )
}
