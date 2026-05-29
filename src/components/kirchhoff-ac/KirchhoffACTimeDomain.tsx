'use client'
import { useEffect, useRef } from 'react'
import { useKirchhoffAC } from '@/store/kirchhoff-ac-store'
import { t } from '@/lib/i18n'

const W = 580, H = 280
const SAMPLES = 400
const PAD = { top: 28, right: 56, bottom: 40, left: 52 }

export function KirchhoffACTimeDomain() {
  const canvasRef = useRef<HTMLCanvasElement>(null)
  const { state: { results, params, flags, lang } } = useKirchhoffAC()

  useEffect(() => {
    const canvas = canvasRef.current
    if (!canvas) return
    const ctx = canvas.getContext('2d')
    if (!ctx) return
    const isDark = window.matchMedia('(prefers-color-scheme: dark)').matches

    ctx.clearRect(0, 0, W, H)

    const { f, Vs } = params
    const { IR, IZm, IZc } = results
    const mesh3 = flags.mesh3
    const omega  = 2 * Math.PI * f
    const T      = 1 / f
    const plotW  = W - PAD.left - PAD.right
    const plotH  = H - PAD.top  - PAD.bottom

    const vPeak = Vs * Math.SQRT2
    const iMax  = Math.max(IR.mag, IZm.mag, mesh3 ? IZc.mag : 0, 1e-9)
    const iPeak = iMax * Math.SQRT2

    const midY = PAD.top + plotH / 2
    const toX  = (s: number) => PAD.left + (s / SAMPLES) * plotW
    const toYv = (v: number) => midY - (v / vPeak) * (plotH / 2 - 4)
    const toYi = (i: number) => midY - (i / iPeak) * (plotH / 2 - 4)

    const gridColor  = isDark ? '#262626' : '#f5f5f5'
    const axisColor  = isDark ? '#404040' : '#d4d4d4'
    const labelColor = isDark ? '#a3a3a3' : '#737373'

    // Grid
    ctx.strokeStyle = gridColor; ctx.lineWidth = 1
    for (let p = 0; p <= 4; p++) {
      const y = PAD.top + (p / 4) * plotH
      ctx.beginPath(); ctx.moveTo(PAD.left, y); ctx.lineTo(PAD.left + plotW, y); ctx.stroke()
    }
    for (let p = 0; p <= 4; p++) {
      const x = PAD.left + (p / 4) * plotW
      ctx.beginPath(); ctx.moveTo(x, PAD.top); ctx.lineTo(x, PAD.top + plotH); ctx.stroke()
    }

    // Axes
    ctx.strokeStyle = axisColor; ctx.lineWidth = 1
    ctx.beginPath(); ctx.moveTo(PAD.left, midY); ctx.lineTo(PAD.left + plotW, midY); ctx.stroke()
    ctx.beginPath(); ctx.moveTo(PAD.left, PAD.top); ctx.lineTo(PAD.left, PAD.top + plotH); ctx.stroke()

    // Labels
    ctx.fillStyle = labelColor; ctx.font = '10px monospace'
    ctx.textAlign = 'right'
    ctx.fillText(`${vPeak.toFixed(0)} V`,   PAD.left - 4, PAD.top + 4)
    ctx.fillText('0',                        PAD.left - 4, midY + 4)
    ctx.fillText(`-${vPeak.toFixed(0)} V`,  PAD.left - 4, PAD.top + plotH + 4)
    ctx.textAlign = 'left'
    ctx.fillText(`${iPeak.toFixed(2)} A`,   PAD.left + plotW + 4, PAD.top + 4)
    ctx.fillText('0',                        PAD.left + plotW + 4, midY + 4)
    ctx.fillText(`-${iPeak.toFixed(2)} A`,  PAD.left + plotW + 4, PAD.top + plotH + 4)
    ctx.textAlign = 'center'
    ctx.fillText(`${(2 * T * 1000).toFixed(2)} ms`, PAD.left + plotW / 2, H - 6)
    // T mark
    ctx.fillText('T', PAD.left + plotW / 4, H - 6)
    ctx.fillText('2T', PAD.left + plotW / 2, H - 6 - 0)

    // Period tick marks
    ctx.strokeStyle = axisColor; ctx.lineWidth = 1
    for (let n = 1; n <= 3; n++) {
      const x = PAD.left + (n / 4) * plotW
      ctx.beginPath(); ctx.moveTo(x, PAD.top + plotH); ctx.lineTo(x, PAD.top + plotH + 4); ctx.stroke()
    }

    // Helper: draw one waveform
    function plotWave(ampPeak: number, phiDeg: number, color: string, dash: number[], useV = false) {
      if (ampPeak < 1e-9) return
      const phiRad = phiDeg * Math.PI / 180
      ctx.strokeStyle = color; ctx.lineWidth = 2; ctx.setLineDash(dash)
      ctx.beginPath()
      for (let s = 0; s <= SAMPLES; s++) {
        const t_s = (s / SAMPLES) * 2 * T
        const val  = ampPeak * Math.sin(omega * t_s + phiRad)
        const y    = useV ? toYv(val) : toYi(val)
        if (s === 0) ctx.moveTo(toX(s), y); else ctx.lineTo(toX(s), y)
      }
      ctx.stroke(); ctx.setLineDash([])
    }

    const cVs  = isDark ? '#60a5fa' : '#2563eb'    // blue  — vs(t)
    const cIR  = isDark ? '#AFA9EC' : '#7F77DD'    // violet — iR(t)
    const cIZm = isDark ? '#5DCAA5' : '#1D9E75'    // teal   — iZm(t)
    const cIZc = isDark ? '#FDBA74' : '#EA580C'    // orange — iZc(t)

    plotWave(vPeak,             0,        cVs,  [],        true)
    plotWave(IR.mag  * Math.SQRT2, IR.ang,  cIR,  [6, 4])
    plotWave(IZm.mag * Math.SQRT2, IZm.ang, cIZm, [3, 3])
    if (mesh3) plotWave(IZc.mag * Math.SQRT2, IZc.ang, cIZc, [8, 3, 2, 3])

    // Legend
    const legendItems: { color: string; label: string; dash: number[] }[] = [
      { color: cVs,  label: 'vs(t)',   dash: []        },
      { color: cIR,  label: 'iR(t)',   dash: [6, 4]    },
      { color: cIZm, label: 'iZm(t)',  dash: [3, 3]    },
    ]
    if (mesh3) legendItems.push({ color: cIZc, label: 'iZc(t)', dash: [8, 3, 2, 3] })

    let lx = PAD.left
    ctx.font = '10px monospace'
    for (const { color, label, dash } of legendItems) {
      ctx.strokeStyle = color; ctx.lineWidth = 2
      ctx.setLineDash(dash)
      ctx.beginPath(); ctx.moveTo(lx, PAD.top - 10); ctx.lineTo(lx + 20, PAD.top - 10); ctx.stroke()
      ctx.setLineDash([])
      ctx.fillStyle = labelColor; ctx.textAlign = 'left'
      ctx.fillText(label, lx + 24, PAD.top - 6)
      lx += 84
    }
  }, [results, params, flags])

  return (
    <canvas
      ref={canvasRef}
      width={W}
      height={H}
      className="w-full"
      aria-label={t(lang, 'kacTimeDomainAria')}
    />
  )
}
