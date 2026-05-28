'use client'
import { useEffect, useMemo, useRef } from 'react'
import { useMagnetic } from '@/store/magnetic-store'
import { calcMagneticSweep } from '@/lib/magnetic-engine'
import { t } from '@/lib/i18n'

const W = 580
const H = 260
const PAD = { top: 24, right: 52, bottom: 40, left: 52 }

export function MagneticFreqResponse() {
  const canvasRef = useRef<HTMLCanvasElement>(null)
  const { state: { results, params, lang } } = useMagnetic()

  const sweep = useMemo(
    () => calcMagneticSweep(params),
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [params.Vs, params.R1, params.L1, params.R2, params.L2, params.k],
  )

  useEffect(() => {
    const canvas = canvasRef.current
    if (!canvas) return
    const ctx = canvas.getContext('2d')
    if (!ctx) return
    const isDark = window.matchMedia('(prefers-color-scheme: dark)').matches

    ctx.clearRect(0, 0, W, H)

    const plotW = W - PAD.left - PAD.right
    const plotH = H - PAD.top - PAD.bottom

    const fMin  = sweep[0].f
    const fMax  = sweep[sweep.length - 1].f
    const iMax  = Math.max(...sweep.map(p => Math.max(p.I1, p.I2)), 1e-9)

    function toX(f: number) {
      return PAD.left + (Math.log(f / fMin) / Math.log(fMax / fMin)) * plotW
    }
    function toY(i: number) { return PAD.top + plotH - (i / iMax) * plotH }

    const gridColor  = isDark ? '#262626' : '#f5f5f5'
    const axisColor  = isDark ? '#404040' : '#d4d4d4'
    const labelColor = isDark ? '#a3a3a3' : '#737373'

    // Grid
    ctx.strokeStyle = gridColor
    ctx.lineWidth   = 1
    for (let p = 0; p <= 4; p++) {
      const y = PAD.top + (p / 4) * plotH
      ctx.beginPath(); ctx.moveTo(PAD.left, y); ctx.lineTo(PAD.left + plotW, y); ctx.stroke()
    }

    // Axes
    ctx.strokeStyle = axisColor
    ctx.beginPath()
    ctx.moveTo(PAD.left, PAD.top); ctx.lineTo(PAD.left, PAD.top + plotH)
    ctx.moveTo(PAD.left, PAD.top + plotH); ctx.lineTo(PAD.left + plotW, PAD.top + plotH)
    ctx.stroke()

    // Labels
    ctx.fillStyle  = labelColor
    ctx.font       = '10px monospace'
    ctx.textAlign  = 'right'
    ctx.fillText(`${iMax.toFixed(2)} A`, PAD.left - 4, PAD.top + 4)
    ctx.fillText('0 A',                  PAD.left - 4, PAD.top + plotH + 4)
    ctx.textAlign  = 'center'
    ctx.fillText(`${fMin.toFixed(0)} Hz`, PAD.left,           H - 6)
    ctx.fillText(`${fMax.toFixed(0)} Hz`, PAD.left + plotW,   H - 6)
    ctx.fillText(`${params.f.toFixed(0)} Hz`, PAD.left + plotW / 2, H - 6)

    // I1 curve (teal)
    const i1Color = isDark ? '#2dd4bf' : '#0d9488'
    ctx.strokeStyle = i1Color
    ctx.lineWidth   = 2
    ctx.setLineDash([])
    ctx.beginPath()
    sweep.forEach((p, idx) => {
      const x = toX(p.f)
      const y = toY(p.I1)
      if (idx === 0) ctx.moveTo(x, y)
      else           ctx.lineTo(x, y)
    })
    ctx.stroke()

    // I2 curve (orange)
    const i2Color = isDark ? '#fb923c' : '#ea580c'
    ctx.strokeStyle = i2Color
    ctx.lineWidth   = 2
    ctx.setLineDash([6, 4])
    ctx.beginPath()
    sweep.forEach((p, idx) => {
      const x = toX(p.f)
      const y = toY(p.I2)
      if (idx === 0) ctx.moveTo(x, y)
      else           ctx.lineTo(x, y)
    })
    ctx.stroke()
    ctx.setLineDash([])

    // Operating point dots
    const opX = toX(params.f)
    ctx.fillStyle   = i1Color
    ctx.beginPath(); ctx.arc(opX, toY(results.I1), 4, 0, Math.PI * 2); ctx.fill()
    if (results.I2 > 1e-9) {
      ctx.fillStyle = i2Color
      ctx.beginPath(); ctx.arc(opX, toY(results.I2), 4, 0, Math.PI * 2); ctx.fill()
    }

    // Vertical operating line
    ctx.strokeStyle = isDark ? '#525252' : '#e5e5e5'
    ctx.lineWidth   = 1
    ctx.setLineDash([3, 3])
    ctx.beginPath(); ctx.moveTo(opX, PAD.top); ctx.lineTo(opX, PAD.top + plotH); ctx.stroke()
    ctx.setLineDash([])

    // Legend
    ctx.font = '10px monospace'
    const legends = [
      { color: i1Color, label: 'I₁(f)', dash: [] as number[] },
      { color: i2Color, label: 'I₂(f)', dash: [6, 4] },
    ]
    let lx = PAD.left
    for (const { color, label, dash } of legends) {
      ctx.strokeStyle = color; ctx.lineWidth = 2; ctx.setLineDash(dash)
      ctx.beginPath(); ctx.moveTo(lx, PAD.top - 8); ctx.lineTo(lx + 20, PAD.top - 8); ctx.stroke()
      ctx.setLineDash([])
      ctx.fillStyle  = labelColor; ctx.textAlign = 'left'
      ctx.fillText(label, lx + 24, PAD.top - 4)
      lx += 80
    }
  }, [sweep, results, params])

  return (
    <canvas
      ref={canvasRef}
      width={W}
      height={H}
      className="w-full"
      aria-label={t(lang, 'magFreqResponseAriaLabel')}
    />
  )
}
