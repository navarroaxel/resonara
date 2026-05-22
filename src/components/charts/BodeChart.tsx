'use client'
import { useEffect, useRef, useMemo } from 'react'
import { useRLC } from '@/store/rlc-store'
import { calcBodeCurve } from '@/lib/bode'
import { t } from '@/lib/i18n'

export function BodeChart() {
  const canvasRef = useRef<HTMLCanvasElement>(null)
  const { state: { params, circuitType, results, flags, lang } } = useRLC()
  const data = useMemo(() => calcBodeCurve(circuitType, params, flags), [circuitType, params, flags])

  useEffect(() => {
    const canvas = canvasRef.current
    if (!canvas) return
    const ctx = canvas.getContext('2d')
    if (!ctx) return

    const W = canvas.width, H = canvas.height
    const pad = { top: 20, right: 20, bottom: 36, left: 56 }
    const isDark = window.matchMedia('(prefers-color-scheme: dark)').matches
    const textC = isDark ? '#9FA0A0' : '#888'
    const gridC = isDark ? 'rgba(255,255,255,0.07)' : 'rgba(0,0,0,0.07)'

    ctx.clearRect(0, 0, W, H)

    const zVals = data.map(p => p.Z)
    const zMin  = Math.min(...zVals), zMax = Math.max(...zVals)
    const fMin  = data[0].f, fMax = data[data.length - 1].f

    const toX = (f: number) =>
      pad.left + ((Math.log10(f) - Math.log10(fMin)) / (Math.log10(fMax) - Math.log10(fMin))) *
      (W - pad.left - pad.right)
    const toY = (z: number) =>
      pad.top + (1 - (z - zMin) / (zMax - zMin || 1)) * (H - pad.top - pad.bottom)

    ctx.font = '10px sans-serif'; ctx.textAlign = 'center'; ctx.fillStyle = textC
    ;[1, 10, 100, 1000, 5000].forEach(f => {
      const x = toX(f)
      ctx.strokeStyle = gridC; ctx.lineWidth = 0.5
      ctx.beginPath(); ctx.moveTo(x, pad.top); ctx.lineTo(x, H - pad.bottom); ctx.stroke()
      ctx.fillText(f >= 1000 ? `${f / 1000}k` : String(f), x, H - pad.bottom + 14)
    })

    ctx.textAlign = 'right'
    for (let i = 0; i <= 4; i++) {
      const z = zMin + (i / 4) * (zMax - zMin)
      const y = toY(z)
      ctx.strokeStyle = gridC; ctx.lineWidth = 0.5
      ctx.beginPath(); ctx.moveTo(pad.left, y); ctx.lineTo(W - pad.right, y); ctx.stroke()
      ctx.fillText(z.toFixed(0), pad.left - 6, y + 4)
    }

    ctx.fillStyle = textC; ctx.font = '11px sans-serif'; ctx.textAlign = 'center'
    ctx.fillText(t(lang, 'freqAxisLabel'), W / 2, H - 4)
    ctx.save(); ctx.translate(14, H / 2); ctx.rotate(-Math.PI / 2)
    ctx.fillText(t(lang, 'impedAxisLabel'), 0, 0); ctx.restore()

    ctx.strokeStyle = '#378ADD'; ctx.lineWidth = 2; ctx.lineJoin = 'round'
    ctx.beginPath()
    data.forEach((p, i) => i === 0 ? ctx.moveTo(toX(p.f), toY(p.Z)) : ctx.lineTo(toX(p.f), toY(p.Z)))
    ctx.stroke()

    ctx.beginPath()
    ctx.arc(toX(params.f), toY(results.Z), 5, 0, 2 * Math.PI)
    ctx.fillStyle = '#D85A30'; ctx.fill()
    ctx.strokeStyle = 'white'; ctx.lineWidth = 1.5; ctx.stroke()
  }, [data, params.f, results.Z, lang])

  return (
    <canvas
      ref={canvasRef}
      width={580}
      height={220}
      className="w-full"
      aria-label={t(lang, 'freqResponseTab')}
    />
  )
}
