'use client'
import { useEffect, useRef } from 'react'
import { useMagnetic } from '@/store/magnetic-store'
import { useUI } from '@/store/ui-store'
import { t } from '@/lib/i18n'

const SIZE = 320

function drawArrow(
  ctx: CanvasRenderingContext2D,
  fromX: number, fromY: number,
  toX: number,   toY: number,
  color: string,
) {
  const headLen = 8
  const angle   = Math.atan2(toY - fromY, toX - fromX)
  ctx.strokeStyle = color
  ctx.fillStyle   = color
  ctx.lineWidth   = 2
  ctx.beginPath()
  ctx.moveTo(fromX, fromY)
  ctx.lineTo(toX, toY)
  ctx.stroke()
  ctx.beginPath()
  ctx.moveTo(toX, toY)
  ctx.lineTo(toX - headLen * Math.cos(angle - Math.PI / 6), toY - headLen * Math.sin(angle - Math.PI / 6))
  ctx.lineTo(toX - headLen * Math.cos(angle + Math.PI / 6), toY - headLen * Math.sin(angle + Math.PI / 6))
  ctx.closePath()
  ctx.fill()
}

export function MagneticPhasorDiagram() {
  const canvasRef = useRef<HTMLCanvasElement>(null)
  const { state: { results, params } } = useMagnetic()
  const { state: { lang } } = useUI()

  useEffect(() => {
    const canvas = canvasRef.current
    if (!canvas) return
    const ctx = canvas.getContext('2d')
    if (!ctx) return
    const isDark = window.matchMedia('(prefers-color-scheme: dark)').matches

    ctx.clearRect(0, 0, SIZE, SIZE)

    const cx = SIZE / 2
    const cy = SIZE / 2
    const axisColor   = isDark ? '#404040' : '#d4d4d4'
    const labelColor  = isDark ? '#a3a3a3' : '#737373'

    // Axes
    ctx.strokeStyle = axisColor
    ctx.lineWidth   = 1
    ctx.beginPath()
    ctx.moveTo(10, cy); ctx.lineTo(SIZE - 10, cy)
    ctx.moveTo(cx, 10); ctx.lineTo(cx, SIZE - 10)
    ctx.stroke()

    // Axis labels
    ctx.fillStyle  = labelColor
    ctx.font       = '11px monospace'
    ctx.textAlign  = 'left'
    ctx.fillText('Re', SIZE - 24, cy - 6)
    ctx.textAlign  = 'center'
    ctx.fillText('Im', cx, 16)

    const { phi1, I1, I2, phi2 } = results
    const { Vs } = params
    const vScale = (SIZE * 0.38) / (Vs > 0 ? Vs : 1)
    const iMax   = Math.max(I1, I2, 1e-6)
    const iScale = (SIZE * 0.32) / iMax

    // Vs — horizontal reference (blue)
    const vsLen = Vs * vScale
    drawArrow(ctx, cx, cy, cx + vsLen, cy, isDark ? '#60a5fa' : '#2563eb')

    // I1 phasor (teal) — lags Vs by phi1 degrees (clockwise)
    if (I1 > 1e-9) {
      const phi1Rad = (phi1 * Math.PI) / 180
      const i1x = cx + I1 * iScale * Math.cos(-phi1Rad)
      const i1y = cy + I1 * iScale * Math.sin(-phi1Rad)
      ctx.setLineDash([4, 3])
      drawArrow(ctx, cx, cy, i1x, i1y, isDark ? '#2dd4bf' : '#0d9488')
      ctx.setLineDash([])
    }

    // I2 phasor (orange) — at angle -phi2 from horizontal
    if (I2 > 1e-9) {
      const phi2Rad = (phi2 * Math.PI) / 180
      const i2x = cx + I2 * iScale * Math.cos(-phi2Rad)
      const i2y = cy + I2 * iScale * Math.sin(-phi2Rad)
      ctx.setLineDash([2, 3])
      drawArrow(ctx, cx, cy, i2x, i2y, isDark ? '#fb923c' : '#ea580c')
      ctx.setLineDash([])
    }

    // Legend
    const lx = 10
    let ly = 18
    const rows: { color: string; label: string }[] = [
      { color: isDark ? '#60a5fa' : '#2563eb', label: `Vs = ${Vs.toFixed(0)} V` },
    ]
    if (I1 > 1e-9) rows.push({ color: isDark ? '#2dd4bf' : '#0d9488', label: `I₁ = ${results.I1.toFixed(2)} A` })
    if (I2 > 1e-9) rows.push({ color: isDark ? '#fb923c' : '#ea580c', label: `I₂ = ${results.I2.toFixed(2)} A` })

    ctx.font = '10px monospace'
    for (const { color, label } of rows) {
      ctx.fillStyle = color
      ctx.fillRect(lx, ly - 8, 10, 10)
      ctx.fillStyle = labelColor
      ctx.textAlign = 'left'
      ctx.fillText(label, lx + 14, ly)
      ly += 16
    }
  }, [results, params])

  return (
    <canvas
      ref={canvasRef}
      width={SIZE}
      height={SIZE}
      className="w-full"
      aria-label={t(lang, 'magPhasorAriaLabel')}
    />
  )
}
