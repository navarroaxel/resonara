'use client'
import { useEffect, useRef } from 'react'
import { useRLC } from '@/store/rlc-store'
import { useUI } from '@/store/ui-store'
import { t } from '@/lib/i18n'
import { fmt } from '@/lib/utils'

export function HarmonicSpectrum() {
  const canvasRef = useRef<HTMLCanvasElement>(null)
  const { state: { polyResults } } = useRLC()
  const { state: { lang } } = useUI()

  useEffect(() => {
    const canvas = canvasRef.current
    if (!canvas || !polyResults || polyResults.harmonics.length === 0) return
    const ctx = canvas.getContext('2d')
    if (!ctx) return

    const W = canvas.width, H = canvas.height
    const pad = { top: 28, right: 52, bottom: 36, left: 52 }
    const isDark = window.matchMedia('(prefers-color-scheme: dark)').matches
    const textC = isDark ? '#9FA0A0' : '#888'
    const gridC = isDark ? 'rgba(255,255,255,0.07)' : 'rgba(0,0,0,0.07)'

    ctx.clearRect(0, 0, W, H)

    const hs    = polyResults.harmonics
    const vMax  = Math.max(...hs.map(h => h.Vn)) || 1
    const iMax  = Math.max(...hs.map(h => h.In)) || 1
    const plotW = W - pad.left - pad.right
    const plotH = H - pad.top - pad.bottom

    const bottom = pad.top + plotH
    const toYv = (v: number) => pad.top + (1 - v / vMax) * plotH
    const toYi = (i: number) => pad.top + (1 - i / iMax) * plotH

    // Grid lines
    for (let i = 0; i <= 4; i++) {
      const y = pad.top + (i / 4) * plotH
      ctx.strokeStyle = gridC; ctx.lineWidth = 0.5
      ctx.beginPath(); ctx.moveTo(pad.left, y); ctx.lineTo(W - pad.right, y); ctx.stroke()
    }

    // Y axis labels — left (voltage)
    ctx.font = '10px sans-serif'; ctx.textAlign = 'right'; ctx.fillStyle = '#378ADD'
    for (let i = 0; i <= 4; i++) {
      const val = (1 - i / 4) * vMax
      ctx.fillText(val.toFixed(1), pad.left - 4, pad.top + (i / 4) * plotH + 4)
    }
    ctx.save(); ctx.translate(12, H / 2); ctx.rotate(-Math.PI / 2)
    ctx.textAlign = 'center'
    ctx.fillText(t(lang, 'spectrumVoltage'), 0, 0)
    ctx.restore()

    // Y axis labels — right (current)
    ctx.textAlign = 'left'; ctx.fillStyle = '#1D9E75'
    for (let i = 0; i <= 4; i++) {
      const val = (1 - i / 4) * iMax
      ctx.fillText(val.toFixed(3), W - pad.right + 4, pad.top + (i / 4) * plotH + 4)
    }
    ctx.save(); ctx.translate(W - 12, H / 2); ctx.rotate(Math.PI / 2)
    ctx.textAlign = 'center'; ctx.fillStyle = '#1D9E75'
    ctx.fillText(t(lang, 'spectrumCurrent'), 0, 0)
    ctx.restore()

    // Bars
    const groupW = plotW / hs.length
    const barW   = Math.max(4, groupW / 4)
    const gap    = barW * 0.4

    hs.forEach((h, idx) => {
      const cx   = pad.left + (idx + 0.5) * groupW
      const vTop = toYv(h.Vn)
      const iTop = toYi(h.In)

      // Voltage bar (blue)
      ctx.fillStyle = '#378ADD'
      ctx.fillRect(cx - gap / 2 - barW, vTop, barW, bottom - vTop)

      // Current bar (green)
      ctx.fillStyle = '#1D9E75'
      ctx.fillRect(cx + gap / 2, iTop, barW, bottom - iTop)

      // Bar value labels
      ctx.font = '9px sans-serif'; ctx.textAlign = 'center'
      ctx.fillStyle = '#378ADD'
      ctx.fillText(h.Vn.toFixed(1), cx - gap / 2 - barW / 2, Math.max(pad.top + 10, vTop - 2))
      ctx.fillStyle = '#1D9E75'
      ctx.fillText(h.In.toFixed(3), cx + gap / 2 + barW / 2, Math.max(pad.top + 10, iTop - 2))

      // X axis label
      ctx.fillStyle = textC; ctx.font = '10px sans-serif'; ctx.textAlign = 'center'
      ctx.fillText(`n=${h.n}`, cx, H - pad.bottom + 14)
    })

    // THD annotation
    ctx.font = '11px sans-serif'; ctx.textAlign = 'right'; ctx.fillStyle = textC
    ctx.fillText(
      `${t(lang, 'thdCurrent')}: ${fmt(polyResults.THD_I, 1)} %`,
      W - pad.right,
      pad.top - 8,
    )
  }, [polyResults])

  if (!polyResults) return null

  return (
    <canvas
      ref={canvasRef}
      width={580}
      height={240}
      className="w-full"
      aria-label={t(lang, 'spectrumTab')}
    />
  )
}
