'use client'
import { useEffect, useRef } from 'react'
import { useThreePhase } from '@/store/three-phase-store'
import { useUI } from '@/store/ui-store'
import { t } from '@/lib/i18n'
import { fmt } from '@/lib/utils'

const W = 360
const H = 260
const ML = 50
const MB = 40
const MR = 20
const MT = 30
const PLOT_W = W - ML - MR
const PLOT_H = H - MT - MB

function drawArrow(
  ctx: CanvasRenderingContext2D,
  x1: number, y1: number, x2: number, y2: number,
  color: string,
) {
  const angle = Math.atan2(y2 - y1, x2 - x1)
  ctx.save()
  ctx.strokeStyle = color; ctx.fillStyle = color; ctx.lineWidth = 2.5
  ctx.beginPath(); ctx.moveTo(x1, y1); ctx.lineTo(x2, y2); ctx.stroke()
  ctx.beginPath()
  ctx.moveTo(x2, y2)
  ctx.lineTo(x2 - 10 * Math.cos(angle - 0.4), y2 - 10 * Math.sin(angle - 0.4))
  ctx.lineTo(x2 - 10 * Math.cos(angle + 0.4), y2 - 10 * Math.sin(angle + 0.4))
  ctx.closePath(); ctx.fill()
  ctx.restore()
}

export function ThreePhasePowerChart() {
  const canvasRef = useRef<HTMLCanvasElement>(null)
  const { state: { results } } = useThreePhase()
  const { state: { lang } } = useUI()

  useEffect(() => {
    const { P, Qr, S, fp } = results
    const canvas = canvasRef.current
    if (!canvas) return
    const ctx = canvas.getContext('2d')
    if (!ctx) return

    const isDark = window.matchMedia('(prefers-color-scheme: dark)').matches
    const textColor = isDark ? '#9FA0A0' : '#555'
    const gridColor = isDark ? 'rgba(255,255,255,0.1)' : 'rgba(0,0,0,0.08)'

    ctx.clearRect(0, 0, W, H)

    // Origin centered vertically so the triangle can go up (inductive) or down (capacitive)
    const ox = ML
    const oy = MT + PLOT_H / 2
    const scale = S > 0 ? Math.min(PLOT_W / (S * 1.1), (PLOT_H / 2) / (S * 1.1)) : 1

    const px = ox + P  * scale
    const py = oy
    const qx = px
    const qy = oy - Qr * scale   // above baseline when Qr>0 (inductive), below when Qr<0 (capacitive)
    const sx = ox + P  * scale
    const sy = oy - Qr * scale

    // Axes
    ctx.strokeStyle = gridColor; ctx.lineWidth = 0.5
    ctx.beginPath(); ctx.moveTo(ox, MT); ctx.lineTo(ox, MT + PLOT_H); ctx.stroke()
    ctx.beginPath(); ctx.moveTo(ox, oy); ctx.lineTo(ox + PLOT_W, oy); ctx.stroke()

    // Phase angle arc
    if (S > 0 && P > 0 && Math.abs(Qr) > 0) {
      const arcR   = Math.min(40, P * scale * 0.4)
      const phiRad = Math.atan2(Qr, P)  // signed
      ctx.save()
      ctx.strokeStyle = '#7F77DD'; ctx.lineWidth = 1.5
      ctx.beginPath()
      // arc from x-axis to S direction: min→max ensures correct sweep for both signs
      ctx.arc(ox, oy, arcR, Math.min(-phiRad, 0), Math.max(-phiRad, 0))
      ctx.stroke()
      ctx.fillStyle = '#7F77DD'; ctx.font = '11px sans-serif'
      // label on the correct side of the baseline
      ctx.fillText('φ', ox + arcR * 0.65, oy + (Qr < 0 ? arcR * 0.5 : -arcR * 0.3))
      ctx.restore()
    }

    // S — apparent (hypotenuse)
    if (S > 0) {
      drawArrow(ctx, ox, oy, sx, sy, '#378ADD')
      ctx.save()
      ctx.fillStyle = '#378ADD'; ctx.font = 'bold 11px sans-serif'
      ctx.fillText(`S=${fmt(S)} VA`, ox + (sx - ox) * 0.5 - 16, oy + (sy - oy) * 0.5 - 8)
      ctx.restore()
    }

    // P — active (horizontal)
    if (P > 0) {
      drawArrow(ctx, ox, oy, px, py, '#1D9E75')
      ctx.save()
      ctx.fillStyle = '#1D9E75'; ctx.font = 'bold 11px sans-serif'
      ctx.fillText(`P=${fmt(P)} W`, ox + (px - ox) * 0.5 - 16, oy + (Qr >= 0 ? 20 : -8))
      ctx.restore()
    }

    // Q — reactive (vertical, signed)
    if (Math.abs(Qr) > 0) {
      drawArrow(ctx, px, py, qx, qy, '#D85A30')
      ctx.save()
      ctx.fillStyle = '#D85A30'; ctx.font = 'bold 11px sans-serif'
      ctx.fillText(`Q=${fmt(Qr)} VAR`, qx + 6, oy - Qr * scale * 0.5)
      ctx.restore()
    }

    ctx.fillStyle = textColor; ctx.font = '11px sans-serif'; ctx.textAlign = 'center'
    ctx.fillText('P (W)', ox + PLOT_W / 2, MT + PLOT_H + 16)
    ctx.save()
    ctx.translate(14, MT + PLOT_H / 2)
    ctx.rotate(-Math.PI / 2)
    ctx.fillText('Q (VAR)', 0, 0)
    ctx.restore()
    ctx.textAlign = 'left'

    const legend: [string, string][] = [
      ['#1D9E75', t(lang, 'legendActive')],
      ['#D85A30', t(lang, 'legendReactive')],
      ['#378ADD', t(lang, 'legendApparent')],
    ]
    ctx.font = '11px sans-serif'
    legend.forEach(([c, l], i) => {
      ctx.fillStyle = c
      ctx.fillRect(W - MR - 90, MT + i * 17, 10, 10)
      ctx.fillStyle = textColor
      ctx.fillText(l, W - MR - 76, MT + 9 + i * 17)
    })

    ctx.fillStyle = textColor
    ctx.font = '12px sans-serif'
    ctx.fillText(`fp = ${fmt(fp, 3)}`, ox, MT + 16)
  }, [results])

  return (
    <canvas
      ref={canvasRef}
      width={W}
      height={H}
      className="mx-auto block"
      aria-label={t(lang, 'powerTriangle')}
    />
  )
}
