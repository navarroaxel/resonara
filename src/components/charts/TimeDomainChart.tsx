'use client'
import { useEffect, useRef, useMemo } from 'react'
import { useRLC } from '@/store/rlc-store'
import { calcTimeDomain } from '@/lib/time-domain'
import { t } from '@/lib/i18n'

export function TimeDomainChart() {
  const canvasRef = useRef<HTMLCanvasElement>(null)
  const { state: { params, circuitType, flags, lang } } = useRLC()
  const data = useMemo(() => calcTimeDomain(circuitType, params, flags), [circuitType, params, flags])

  useEffect(() => {
    const canvas = canvasRef.current
    if (!canvas) return
    const ctx = canvas.getContext('2d')
    if (!ctx) return

    const W = canvas.width, H = canvas.height
    const pad = { top: 20, right: 48, bottom: 36, left: 48 }
    const isDark = window.matchMedia('(prefers-color-scheme: dark)').matches
    const textC = isDark ? '#9FA0A0' : '#888'
    const gridC = isDark ? 'rgba(255,255,255,0.07)' : 'rgba(0,0,0,0.07)'

    ctx.clearRect(0, 0, W, H)

    const tMin = data[0].t, tMax = data[data.length - 1].t
    const vMax = Math.max(...data.map(p => Math.abs(p.v))) || 1
    const iMax = Math.max(...data.map(p => Math.abs(p.i))) || 1

    const toX  = (t: number) => pad.left + ((t - tMin) / (tMax - tMin)) * (W - pad.left - pad.right)
    const toYv = (v: number) => pad.top + (1 - (v + vMax) / (2 * vMax)) * (H - pad.top - pad.bottom)
    const toYi = (i: number) => pad.top + (1 - (i + iMax) / (2 * iMax)) * (H - pad.top - pad.bottom)

    for (let i = 0; i <= 4; i++) {
      const y = pad.top + (i / 4) * (H - pad.top - pad.bottom)
      ctx.strokeStyle = gridC; ctx.lineWidth = 0.5
      ctx.beginPath(); ctx.moveTo(pad.left, y); ctx.lineTo(W - pad.right, y); ctx.stroke()
    }

    ctx.strokeStyle = isDark ? 'rgba(255,255,255,0.15)' : 'rgba(0,0,0,0.12)'; ctx.lineWidth = 0.5
    ctx.beginPath(); ctx.moveTo(pad.left, toYv(0)); ctx.lineTo(W - pad.right, toYv(0)); ctx.stroke()

    ctx.font = '10px sans-serif'; ctx.textAlign = 'center'; ctx.fillStyle = textC
    for (let i = 0; i <= 4; i++) {
      const tVal = tMin + (i / 4) * (tMax - tMin)
      ctx.fillText(tVal.toFixed(1), toX(tVal), H - pad.bottom + 14)
    }
    ctx.fillText(t(lang, 'timeAxisLabel'), W / 2, H - 4)

    ctx.textAlign = 'right'; ctx.fillStyle = '#378ADD'
    ctx.fillText(`${vMax.toFixed(1)}`, pad.left - 6, pad.top + 4)
    ctx.fillText('0', pad.left - 6, toYv(0) + 4)
    ctx.fillText(`-${vMax.toFixed(1)}`, pad.left - 6, H - pad.bottom)
    ctx.save(); ctx.translate(12, H / 2); ctx.rotate(-Math.PI / 2)
    ctx.fillText('V', 0, 0); ctx.restore()

    ctx.textAlign = 'left'; ctx.fillStyle = '#1D9E75'
    ctx.fillText(`${iMax.toFixed(3)}`, W - pad.right + 6, pad.top + 4)
    ctx.fillText('0', W - pad.right + 6, toYi(0) + 4)
    ctx.fillText(`-${iMax.toFixed(3)}`, W - pad.right + 6, H - pad.bottom)
    ctx.save(); ctx.translate(W - 12, H / 2); ctx.rotate(Math.PI / 2)
    ctx.fillText('A', 0, 0); ctx.restore()

    // u(t) — source voltage
    ctx.strokeStyle = '#378ADD'; ctx.lineWidth = 2; ctx.lineJoin = 'round'
    ctx.beginPath()
    data.forEach((p, i) => i === 0 ? ctx.moveTo(toX(p.t), toYv(p.v)) : ctx.lineTo(toX(p.t), toYv(p.v)))
    ctx.stroke()

    // i(t) — circuit current, dashed
    ctx.strokeStyle = '#1D9E75'; ctx.lineWidth = 2; ctx.setLineDash([5, 3])
    ctx.beginPath()
    data.forEach((p, i) => i === 0 ? ctx.moveTo(toX(p.t), toYi(p.i)) : ctx.lineTo(toX(p.t), toYi(p.i)))
    ctx.stroke()
    ctx.setLineDash([])

    // Legend
    ctx.font = '11px sans-serif'; ctx.textAlign = 'left'
    ctx.fillStyle = '#378ADD'; ctx.fillRect(pad.left, pad.top - 14, 20, 3)
    ctx.fillText('u(t)', pad.left + 24, pad.top - 8)
    ctx.strokeStyle = '#1D9E75'; ctx.lineWidth = 2; ctx.setLineDash([5, 3])
    ctx.beginPath(); ctx.moveTo(pad.left + 62, pad.top - 12); ctx.lineTo(pad.left + 82, pad.top - 12); ctx.stroke()
    ctx.setLineDash([])
    ctx.fillStyle = '#1D9E75'; ctx.fillText('i(t)', pad.left + 86, pad.top - 8)
  }, [data, lang])

  return (
    <canvas
      ref={canvasRef}
      width={580}
      height={220}
      className="w-full"
      aria-label={t(lang, 'timeDomainTab')}
    />
  )
}
