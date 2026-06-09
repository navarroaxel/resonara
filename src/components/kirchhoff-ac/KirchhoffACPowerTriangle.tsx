'use client'
import { useEffect, useRef } from 'react'
import { useKirchhoffAC } from '@/store/kirchhoff-ac-store'
import { useUI } from '@/store/ui-store'
import { t } from '@/lib/i18n'
import { fmt } from '@/lib/utils'

const W = 400, H = 280

export function KirchhoffACPowerTriangle() {
  const canvasRef = useRef<HTMLCanvasElement>(null)
  const { state: { results } } = useKirchhoffAC()
  const { state: { lang } } = useUI()

  useEffect(() => {
    const canvas = canvasRef.current
    if (!canvas) return
    const ctx = canvas.getContext('2d')
    if (!ctx) return
    const isDark = window.matchMedia('(prefers-color-scheme: dark)').matches

    ctx.clearRect(0, 0, W, H)

    const { P, Q, S, fp } = results
    if (!Number.isFinite(P) || !Number.isFinite(Q) || S < 1e-9) return

    const textColor  = isDark ? '#a3a3a3' : '#737373'
    const labelColor = isDark ? '#d4d4d4' : '#404040'

    const pad  = 40
    const orig = { x: pad, y: H - pad }

    const maxDim = Math.max(Math.abs(P), Math.abs(Q), 1)
    const scale  = Math.min((W - 2 * pad) / maxDim, (H - 2 * pad) / maxDim) * 0.85

    const pX = orig.x + P * scale
    const pY = orig.y
    const sX = pX
    const sY = orig.y - Q * scale

    // Q_target dashed line
    const phi_target = Math.acos(0.95)
    const Q_target   = P * Math.tan(phi_target)
    const tY = orig.y - Q_target * scale

    // Draw target Q dashed
    if (Q_target > 0) {
      ctx.setLineDash([4, 4])
      ctx.strokeStyle = isDark ? '#6b7280' : '#9ca3af'
      ctx.lineWidth   = 1.5
      ctx.beginPath()
      ctx.moveTo(pX, orig.y)
      ctx.lineTo(pX, tY)
      ctx.stroke()
      ctx.setLineDash([])
      // label
      ctx.fillStyle = textColor
      ctx.font = '10px sans-serif'
      ctx.textAlign = 'left'
      ctx.fillText(`Q₀.₉₅ = ${fmt(Q_target, 1)} VAR`, pX + 6, (orig.y + tY) / 2 + 4)
    }

    // P — horizontal (green)
    ctx.strokeStyle = isDark ? '#4ade80' : '#16a34a'
    ctx.lineWidth   = 2.5
    ctx.beginPath()
    ctx.moveTo(orig.x, orig.y)
    ctx.lineTo(pX, pY)
    ctx.stroke()

    // Q — vertical (orange/red)
    const qColor = Q > 0 ? (isDark ? '#fb923c' : '#ea580c') : (isDark ? '#60a5fa' : '#2563eb')
    ctx.strokeStyle = qColor
    ctx.lineWidth   = 2.5
    ctx.beginPath()
    ctx.moveTo(pX, pY)
    ctx.lineTo(sX, sY)
    ctx.stroke()

    // S — hypotenuse (blue/gray)
    ctx.strokeStyle = isDark ? '#818cf8' : '#4f46e5'
    ctx.lineWidth   = 2.5
    ctx.beginPath()
    ctx.moveTo(orig.x, orig.y)
    ctx.lineTo(sX, sY)
    ctx.stroke()

    // φ arc
    const phi = Math.atan2(Q, P)
    if (Math.abs(phi) > 0.01) {
      const arcR = Math.min(40, Math.abs(P) * scale * 0.4)
      ctx.strokeStyle = textColor
      ctx.lineWidth   = 1
      ctx.beginPath()
      ctx.arc(orig.x, orig.y, arcR, -phi, 0)
      ctx.stroke()
      const midAng = -phi / 2
      ctx.fillStyle = textColor
      ctx.font = '11px sans-serif'
      ctx.textAlign = 'center'
      ctx.fillText('φ', orig.x + (arcR + 10) * Math.cos(midAng), orig.y + (arcR + 10) * Math.sin(midAng))
    }

    // Labels
    ctx.font = '11px sans-serif'
    ctx.fillStyle = isDark ? '#4ade80' : '#16a34a'
    ctx.textAlign = 'center'
    ctx.fillText(`P = ${fmt(P, 1)} W`, orig.x + (P * scale) / 2, orig.y + 18)

    ctx.fillStyle = qColor
    ctx.textAlign = 'left'
    ctx.fillText(`Q = ${fmt(Q, 1)} VAR`, pX + 6, orig.y - (Q * scale) / 2)

    ctx.fillStyle = isDark ? '#818cf8' : '#4f46e5'
    ctx.textAlign = 'center'
    const midSx = (orig.x + sX) / 2
    const midSy = (orig.y + sY) / 2
    ctx.fillText(`S = ${fmt(S, 1)} VA`, midSx - 18, midSy - 8)

    // cos φ label
    ctx.fillStyle = labelColor
    ctx.font = '10px sans-serif'
    ctx.textAlign = 'right'
    ctx.fillText(`cos φ = ${fmt(fp, 4)}`, W - 10, 20)

  }, [results])

  return (
    <canvas
      ref={canvasRef}
      width={W}
      height={H}
      className="w-full"
      aria-label={t(lang, 'kacPowerAria')}
    />
  )
}
