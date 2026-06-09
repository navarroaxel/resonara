'use client'
import { useEffect, useRef } from 'react'
import { useMagnetic } from '@/store/magnetic-store'
import { useUI } from '@/store/ui-store'
import { t } from '@/lib/i18n'

const W = 580
const H = 260
const SAMPLES = 400
const PAD = { top: 24, right: 52, bottom: 40, left: 52 }

export function MagneticTimeDomain() {
  const canvasRef = useRef<HTMLCanvasElement>(null)
  const { state: { results, params } } = useMagnetic()
  const { state: { lang } } = useUI()

  useEffect(() => {
    const canvas = canvasRef.current
    if (!canvas) return
    const ctx = canvas.getContext('2d')
    if (!ctx) return
    const isDark = window.matchMedia('(prefers-color-scheme: dark)').matches

    ctx.clearRect(0, 0, W, H)

    const { f, Vs } = params
    const { I1, I2, phi1, phi2 } = results
    const T = 1 / f
    const plotW = W - PAD.left - PAD.right
    const plotH = H - PAD.top - PAD.bottom

    const vPeak = Vs * Math.SQRT2
    const iPeak = Math.max(I1, I2) * Math.SQRT2 || 1

    function toX(s: number) { return PAD.left + (s / SAMPLES) * plotW }
    function toYv(v: number) { return PAD.top + plotH / 2 - (v / vPeak) * (plotH / 2 - 4) }
    function toYi(i: number) { return PAD.top + plotH / 2 - (i / iPeak) * (plotH / 2 - 4) }

    const gridColor  = isDark ? '#262626' : '#f5f5f5'
    const axisColor  = isDark ? '#404040' : '#d4d4d4'
    const labelColor = isDark ? '#a3a3a3' : '#737373'

    // Grid lines
    ctx.strokeStyle = gridColor
    ctx.lineWidth = 1
    for (let p = 0; p <= 4; p++) {
      const y = PAD.top + (p / 4) * plotH
      ctx.beginPath(); ctx.moveTo(PAD.left, y); ctx.lineTo(PAD.left + plotW, y); ctx.stroke()
    }
    for (let p = 0; p <= 4; p++) {
      const x = PAD.left + (p / 4) * plotW
      ctx.beginPath(); ctx.moveTo(x, PAD.top); ctx.lineTo(x, PAD.top + plotH); ctx.stroke()
    }

    // Axes
    ctx.strokeStyle = axisColor
    const midY = PAD.top + plotH / 2
    ctx.beginPath(); ctx.moveTo(PAD.left, midY); ctx.lineTo(PAD.left + plotW, midY); ctx.stroke()
    ctx.beginPath(); ctx.moveTo(PAD.left, PAD.top); ctx.lineTo(PAD.left, PAD.top + plotH); ctx.stroke()

    // Axis labels
    ctx.fillStyle  = labelColor
    ctx.font       = '10px monospace'
    ctx.textAlign  = 'right'
    ctx.fillText(`${vPeak.toFixed(0)} V`, PAD.left - 4, PAD.top + 4)
    ctx.fillText('0',                      PAD.left - 4, midY + 4)
    ctx.fillText(`-${vPeak.toFixed(0)} V`, PAD.left - 4, PAD.top + plotH + 4)

    ctx.textAlign = 'left'
    ctx.fillText(`${iPeak.toFixed(2)} A`, PAD.left + plotW + 4, PAD.top + 4)
    ctx.fillText('0',                      PAD.left + plotW + 4, midY + 4)

    ctx.textAlign = 'center'
    ctx.fillText(`${(2 * T * 1000).toFixed(1)} ms`, PAD.left + plotW / 2, H - 6)

    // vs(t) — solid blue
    const vColor = isDark ? '#60a5fa' : '#2563eb'
    ctx.strokeStyle = vColor
    ctx.lineWidth   = 2
    ctx.setLineDash([])
    ctx.beginPath()
    for (let s = 0; s <= SAMPLES; s++) {
      const t_s = (s / SAMPLES) * 2 * T
      const v   = vPeak * Math.sin(2 * Math.PI * f * t_s)
      if (s === 0) ctx.moveTo(toX(s), toYv(v))
      else         ctx.lineTo(toX(s), toYv(v))
    }
    ctx.stroke()

    // i1(t) — dashed teal
    if (I1 > 1e-9) {
      const i1Color = isDark ? '#2dd4bf' : '#0d9488'
      const phi1Rad = (phi1 * Math.PI) / 180
      ctx.strokeStyle = i1Color
      ctx.lineWidth   = 2
      ctx.setLineDash([6, 4])
      ctx.beginPath()
      for (let s = 0; s <= SAMPLES; s++) {
        const t_s = (s / SAMPLES) * 2 * T
        const i   = I1 * Math.SQRT2 * Math.sin(2 * Math.PI * f * t_s - phi1Rad)
        if (s === 0) ctx.moveTo(toX(s), toYi(i))
        else         ctx.lineTo(toX(s), toYi(i))
      }
      ctx.stroke()
    }

    // i2(t) — dashed orange
    if (I2 > 1e-9) {
      const i2Color = isDark ? '#fb923c' : '#ea580c'
      const phi2Rad = (phi2 * Math.PI) / 180
      ctx.strokeStyle = i2Color
      ctx.lineWidth   = 2
      ctx.setLineDash([3, 3])
      ctx.beginPath()
      for (let s = 0; s <= SAMPLES; s++) {
        const t_s = (s / SAMPLES) * 2 * T
        const i   = I2 * Math.SQRT2 * Math.sin(2 * Math.PI * f * t_s - phi2Rad)
        if (s === 0) ctx.moveTo(toX(s), toYi(i))
        else         ctx.lineTo(toX(s), toYi(i))
      }
      ctx.stroke()
    }

    ctx.setLineDash([])

    // Legend
    const legendItems: { color: string; label: string; dash: number[] }[] = [
      { color: vColor,                              label: `vs(t)`, dash: [] },
    ]
    if (I1 > 1e-9) legendItems.push({ color: isDark ? '#2dd4bf' : '#0d9488', label: 'i₁(t)', dash: [6, 4] })
    if (I2 > 1e-9) legendItems.push({ color: isDark ? '#fb923c' : '#ea580c', label: 'i₂(t)', dash: [3, 3] })

    let lx = PAD.left
    ctx.font = '10px monospace'
    for (const { color, label, dash } of legendItems) {
      ctx.strokeStyle = color
      ctx.lineWidth   = 2
      ctx.setLineDash(dash)
      ctx.beginPath(); ctx.moveTo(lx, PAD.top - 8); ctx.lineTo(lx + 20, PAD.top - 8); ctx.stroke()
      ctx.setLineDash([])
      ctx.fillStyle  = isDark ? '#a3a3a3' : '#737373'
      ctx.textAlign  = 'left'
      ctx.fillText(label, lx + 24, PAD.top - 4)
      lx += 80
    }
  }, [results, params])

  return (
    <canvas
      ref={canvasRef}
      width={W}
      height={H}
      className="w-full"
      aria-label={t(lang, 'magTimeDomainAriaLabel')}
    />
  )
}
