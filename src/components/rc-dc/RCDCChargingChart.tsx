'use client'
import { useEffect, useRef } from 'react'
import { useRCDC } from '@/store/rc-dc-store'
import { useUI } from '@/store/ui-store'
import { rcDCPoints } from '@/lib/rc-dc-engine'
import { t } from '@/lib/i18n'

const W = 640, H = 300
const PAD = { top: 30, right: 70, bottom: 48, left: 56 }

function timeUnit(tau: number) { return tau < 1 ? 'ms' : 's' }
function timeScale(tau: number) { return tau < 1 ? 1000 : 1 }

export function RCDCChargingChart() {
  const canvasRef = useRef<HTMLCanvasElement>(null)
  const { state: { params, results } } = useRCDC()
  const { state: { lang } } = useUI()

  useEffect(() => {
    const canvas = canvasRef.current
    if (!canvas) return
    const ctx = canvas.getContext('2d')
    if (!ctx) return

    const isDark = window.matchMedia('(prefers-color-scheme: dark)').matches
    ctx.clearRect(0, 0, W, H)

    const bg   = isDark ? '#171717' : '#ffffff'
    const grid = isDark ? '#3f3f46' : '#e5e7eb'
    const ax   = isDark ? '#a1a1aa' : '#6b7280'
    const vcC  = isDark ? '#60A5FA' : '#2563EB'   // blue  — V_C
    const vrC  = isDark ? '#F87171' : '#DC2626'   // red   — V_R
    const iC   = isDark ? '#4ADE80' : '#16A34A'   // green — I
    const tauC = isDark ? '#FBBF24' : '#D97706'   // amber — τ markers
    const asym = isDark ? '#374151' : '#f3f4f6'   // asymptote area

    ctx.fillStyle = bg
    ctx.fillRect(0, 0, W, H)

    const cW = W - PAD.left - PAD.right
    const cH = H - PAD.top  - PAD.bottom

    const pts  = rcDCPoints(params)
    const tau  = results.tau
    const tMax = 5 * tau
    const Vs   = params.Vs
    const I0   = results.I0

    const tS   = timeScale(tau)
    const tU   = timeUnit(tau)

    function xOf(t: number) { return PAD.left + (t / tMax) * cW }
    function yVOf(v: number) { return PAD.top + cH - (v / Vs) * cH }
    function yIOf(i: number) { return PAD.top + cH - (i / I0) * cH }

    // ── Asymptote shading near V_s ────────────────────────────────────────
    ctx.fillStyle = asym
    ctx.fillRect(PAD.left, PAD.top, cW, 8)

    // ── Grid lines ─────────────────────────────────────────────────────────
    ctx.strokeStyle = grid; ctx.lineWidth = 1; ctx.setLineDash([3, 3])
    for (let k = 1; k <= 4; k++) {
      const y = PAD.top + (k / 4) * cH
      ctx.beginPath(); ctx.moveTo(PAD.left, y); ctx.lineTo(PAD.left + cW, y); ctx.stroke()
    }
    ctx.setLineDash([])

    // ── τ marker lines ─────────────────────────────────────────────────────
    ctx.strokeStyle = tauC; ctx.lineWidth = 1; ctx.setLineDash([4, 4])
    for (let k = 1; k <= 5; k++) {
      const x = xOf(k * tau)
      ctx.beginPath(); ctx.moveTo(x, PAD.top); ctx.lineTo(x, PAD.top + cH); ctx.stroke()
      ctx.save()
      ctx.fillStyle = tauC; ctx.font = '10px sans-serif'
      ctx.textAlign = 'center'; ctx.textBaseline = 'top'
      ctx.fillText(`${k}τ`, x, PAD.top + cH + 4)
      ctx.restore()
    }
    ctx.setLineDash([])

    // ── Axes ───────────────────────────────────────────────────────────────
    ctx.strokeStyle = ax; ctx.lineWidth = 1.5
    ctx.beginPath()
    ctx.moveTo(PAD.left, PAD.top)
    ctx.lineTo(PAD.left, PAD.top + cH)
    ctx.lineTo(PAD.left + cW, PAD.top + cH)
    ctx.stroke()

    // Left Y-axis labels (voltage)
    ctx.fillStyle = ax; ctx.font = '11px sans-serif'; ctx.textAlign = 'right'; ctx.textBaseline = 'middle'
    for (let k = 0; k <= 4; k++) {
      const v = (k / 4) * Vs
      const y = yVOf(v)
      ctx.fillText(`${v.toFixed(1)}`, PAD.left - 6, y)
    }
    ctx.save(); ctx.fillStyle = vcC; ctx.font = 'bold 11px sans-serif'
    ctx.translate(14, PAD.top + cH / 2); ctx.rotate(-Math.PI / 2)
    ctx.textAlign = 'center'; ctx.textBaseline = 'middle'
    ctx.fillText('V (V)', 0, 0); ctx.restore()

    // Right Y-axis labels (current)
    ctx.fillStyle = iC; ctx.font = '11px sans-serif'; ctx.textAlign = 'left'; ctx.textBaseline = 'middle'
    for (let k = 0; k <= 4; k++) {
      const i = (k / 4) * I0
      const y = yIOf(i)
      const label = I0 < 0.001
        ? `${(i * 1e6).toFixed(1)}µA`
        : I0 < 1
          ? `${(i * 1000).toFixed(1)}mA`
          : `${i.toFixed(3)}A`
      ctx.fillText(label, PAD.left + cW + 4, y)
    }

    // X-axis labels (time)
    ctx.fillStyle = ax; ctx.font = '11px sans-serif'; ctx.textAlign = 'center'; ctx.textBaseline = 'top'
    for (let k = 0; k <= 5; k++) {
      const tV = (k / 5) * tMax
      const x  = xOf(tV)
      ctx.fillText(`${(tV * tS).toFixed(tS >= 1000 ? 0 : 2)}`, x, PAD.top + cH + 18)
    }
    ctx.save(); ctx.fillStyle = ax; ctx.font = '11px sans-serif'
    ctx.translate(PAD.left + cW / 2, H - 6)
    ctx.textAlign = 'center'; ctx.textBaseline = 'bottom'
    ctx.fillText(`t (${tU})`, 0, 0); ctx.restore()

    // ── V_C(t) line ────────────────────────────────────────────────────────
    ctx.strokeStyle = vcC; ctx.lineWidth = 2.5; ctx.lineJoin = 'round'
    ctx.beginPath()
    pts.forEach(({ t, vc }, i) => {
      const x = xOf(t), y = yVOf(vc)
      if (i === 0) ctx.moveTo(x, y); else ctx.lineTo(x, y)
    })
    ctx.stroke()

    // ── V_R(t) line ────────────────────────────────────────────────────────
    ctx.strokeStyle = vrC; ctx.lineWidth = 2; ctx.setLineDash([6, 3])
    ctx.beginPath()
    pts.forEach(({ t, vr }, i) => {
      const x = xOf(t), y = yVOf(vr)
      if (i === 0) ctx.moveTo(x, y); else ctx.lineTo(x, y)
    })
    ctx.stroke()
    ctx.setLineDash([])

    // ── I(t) line (right axis) ─────────────────────────────────────────────
    ctx.strokeStyle = iC; ctx.lineWidth = 1.8; ctx.setLineDash([3, 4])
    ctx.beginPath()
    pts.forEach(({ t, i }, idx) => {
      const x = xOf(t), y = yIOf(i)
      if (idx === 0) ctx.moveTo(x, y); else ctx.lineTo(x, y)
    })
    ctx.stroke()
    ctx.setLineDash([])

    // ── 63.2% marker ──────────────────────────────────────────────────────
    const x63 = xOf(tau)
    const y63 = yVOf(results.Vc_tau)
    ctx.save()
    ctx.fillStyle = vcC; ctx.strokeStyle = vcC; ctx.lineWidth = 1; ctx.setLineDash([2, 2])
    ctx.beginPath(); ctx.moveTo(PAD.left, y63); ctx.lineTo(x63, y63); ctx.stroke()
    ctx.beginPath(); ctx.moveTo(x63, PAD.top + cH); ctx.lineTo(x63, y63); ctx.stroke()
    ctx.setLineDash([])
    ctx.beginPath(); ctx.arc(x63, y63, 4, 0, 2 * Math.PI); ctx.fill()
    ctx.font = '10px sans-serif'; ctx.textAlign = 'left'; ctx.textBaseline = 'bottom'
    ctx.fillText('63.2%', x63 + 6, y63 - 2)
    ctx.restore()

    // ── Legend ─────────────────────────────────────────────────────────────
    const legendX = PAD.left + 10, legendY = PAD.top + 8
    const items = [
      { color: vcC, label: t(lang, 'rcDcLegendVc'), dash: false },
      { color: vrC, label: t(lang, 'rcDcLegendVr'), dash: true  },
      { color: iC,  label: t(lang, 'rcDcLegendI'),  dash: true  },
    ]
    items.forEach(({ color, label, dash }, k) => {
      const ly = legendY + k * 16
      ctx.save()
      ctx.strokeStyle = color; ctx.lineWidth = 2
      if (dash) ctx.setLineDash([5, 3])
      ctx.beginPath(); ctx.moveTo(legendX, ly + 5); ctx.lineTo(legendX + 22, ly + 5); ctx.stroke()
      ctx.setLineDash([])
      ctx.fillStyle = ax; ctx.font = '10px sans-serif'
      ctx.textAlign = 'left'; ctx.textBaseline = 'middle'
      ctx.fillText(label, legendX + 26, ly + 5)
      ctx.restore()
    })

  }, [params, results])

  return (
    <div>
      <h2 className="text-xs font-medium text-neutral-400 uppercase tracking-wider mb-3">
        {t(lang, 'rcDcChartTitle')}
      </h2>
      <canvas
        ref={canvasRef}
        width={W}
        height={H}
        className="w-full rounded"
        aria-label={t(lang, 'rcDcChartTitle')}
      />
    </div>
  )
}
