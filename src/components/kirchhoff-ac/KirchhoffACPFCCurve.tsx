'use client'
import { useEffect, useRef } from 'react'
import { useKirchhoffAC } from '@/store/kirchhoff-ac-store'
import { useUI } from '@/store/ui-store'
import { calcKirchhoffAC } from '@/lib/kirchhoff-ac-engine'
import { t } from '@/lib/i18n'
import { fmt } from '@/lib/utils'

const W = 400, H = 300
const PAD = { l: 52, r: 46, t: 28, b: 42 }
const PW = W - PAD.l - PAD.r
const PH = H - PAD.t - PAD.b

const N = 250
const LM_MIN = 1, LM_MAX = 2000

export function KirchhoffACPFCCurve() {
  const canvasRef = useRef<HTMLCanvasElement>(null)
  const { state: { params } } = useKirchhoffAC()
  const { state: { lang } } = useUI()

  useEffect(() => {
    const canvas = canvasRef.current
    if (!canvas) return
    const ctx = canvas.getContext('2d')
    if (!ctx) return
    const isDark = window.matchMedia('(prefers-color-scheme: dark)').matches

    ctx.clearRect(0, 0, W, H)

    const { Vs, f, R1, R, Rm, Lm: curLm } = params

    // Sweep Lm across full range
    const lms: number[] = []
    const cReqs: number[] = []
    const fp0s: number[] = []

    for (let i = 0; i < N; i++) {
      const lm = LM_MIN + (LM_MAX - LM_MIN) * (i / (N - 1))
      const res = calcKirchhoffAC({ Vs, f, R1, R, Rm, Lm: lm, C: 50 }, { mesh3: false })
      lms.push(lm)
      cReqs.push(Number.isFinite(res.C_req) ? res.C_req : 0)
      fp0s.push(Number.isFinite(res.fp_0) ? res.fp_0 : 1)
    }

    const maxCReq = Math.max(...cReqs, 1)
    const peakIdx = cReqs.indexOf(Math.max(...cReqs))

    // Colors
    const gridColor  = isDark ? '#3a3a3a' : '#e5e5e5'
    const textColor  = isDark ? '#a3a3a3' : '#737373'
    const amberLine  = isDark ? '#fbbf24' : '#d97706'
    const violetLine = isDark ? '#a78bfa' : '#7c3aed'
    const cursorCol  = isDark ? '#6b7280' : '#9ca3af'

    // Coordinate transforms
    const tx   = (lm: number) => PAD.l + ((lm - LM_MIN) / (LM_MAX - LM_MIN)) * PW
    const tyC  = (c: number)  => PAD.t + PH - (c / maxCReq) * PH
    const tyFp = (fp: number) => PAD.t + PH - fp * PH

    // Horizontal grid lines (5 bands)
    ctx.strokeStyle = gridColor
    ctx.lineWidth = 0.8
    for (let i = 0; i <= 4; i++) {
      const y = PAD.t + (i / 4) * PH
      ctx.beginPath(); ctx.moveTo(PAD.l, y); ctx.lineTo(PAD.l + PW, y); ctx.stroke()
    }
    // Vertical grid lines every 500 mH
    for (let lm = 500; lm < LM_MAX; lm += 500) {
      const x = tx(lm)
      ctx.beginPath(); ctx.moveTo(x, PAD.t); ctx.lineTo(x, PAD.t + PH); ctx.stroke()
    }

    // Current Lm cursor
    const xCur = tx(curLm)
    ctx.setLineDash([4, 4])
    ctx.strokeStyle = cursorCol
    ctx.lineWidth = 1.5
    ctx.beginPath(); ctx.moveTo(xCur, PAD.t); ctx.lineTo(xCur, PAD.t + PH); ctx.stroke()
    ctx.setLineDash([])

    // fp_0 curve (violet, thinner, behind)
    ctx.strokeStyle = violetLine
    ctx.lineWidth = 1.5
    ctx.beginPath()
    for (let i = 0; i < N; i++) {
      const x = tx(lms[i])
      const y = tyFp(fp0s[i])
      if (i === 0) ctx.moveTo(x, y); else ctx.lineTo(x, y)
    }
    ctx.stroke()

    // C_req curve (amber, bold, in front)
    ctx.strokeStyle = amberLine
    ctx.lineWidth = 2.2
    ctx.beginPath()
    for (let i = 0; i < N; i++) {
      const x = tx(lms[i])
      const y = tyC(cReqs[i])
      if (i === 0) ctx.moveTo(x, y); else ctx.lineTo(x, y)
    }
    ctx.stroke()

    // Peak dot + label
    const peakX = tx(lms[peakIdx])
    const peakY = tyC(cReqs[peakIdx])
    ctx.fillStyle = amberLine
    ctx.beginPath()
    ctx.arc(peakX, peakY, 4, 0, 2 * Math.PI)
    ctx.fill()
    ctx.fillStyle = isDark ? '#fcd34d' : '#92400e'
    ctx.font = '9px sans-serif'
    ctx.textAlign = 'center'
    ctx.fillText(`${fmt(cReqs[peakIdx], 1)} µF`, peakX, peakY - 8)

    // Current-Lm dots on both curves
    const curIdx = Math.max(0, Math.min(N - 1, Math.round(((curLm - LM_MIN) / (LM_MAX - LM_MIN)) * (N - 1))))
    ctx.fillStyle = amberLine
    ctx.beginPath(); ctx.arc(xCur, tyC(cReqs[curIdx]), 4, 0, 2 * Math.PI); ctx.fill()
    ctx.fillStyle = violetLine
    ctx.beginPath(); ctx.arc(xCur, tyFp(fp0s[curIdx]), 4, 0, 2 * Math.PI); ctx.fill()

    // Axes borders
    ctx.strokeStyle = textColor
    ctx.lineWidth = 1
    ctx.beginPath(); ctx.moveTo(PAD.l, PAD.t); ctx.lineTo(PAD.l, PAD.t + PH); ctx.stroke()
    ctx.beginPath(); ctx.moveTo(PAD.l + PW, PAD.t); ctx.lineTo(PAD.l + PW, PAD.t + PH); ctx.stroke()
    ctx.beginPath(); ctx.moveTo(PAD.l, PAD.t + PH); ctx.lineTo(PAD.l + PW, PAD.t + PH); ctx.stroke()

    // Left y-axis labels (C_req)
    ctx.font = '9px sans-serif'
    ctx.fillStyle = amberLine
    ctx.textAlign = 'right'
    for (let i = 0; i <= 4; i++) {
      const val = maxCReq * (1 - i / 4)
      ctx.fillText(fmt(val, 1), PAD.l - 5, PAD.t + (i / 4) * PH + 3)
    }
    ctx.save()
    ctx.translate(11, PAD.t + PH / 2)
    ctx.rotate(-Math.PI / 2)
    ctx.textAlign = 'center'
    ctx.fillText('C req (µF)', 0, 0)
    ctx.restore()

    // Right y-axis labels (fp_0)
    ctx.fillStyle = violetLine
    ctx.textAlign = 'left'
    for (let i = 0; i <= 4; i++) {
      const val = 1 - i / 4
      ctx.fillText(fmt(val, 2), PAD.l + PW + 5, PAD.t + (i / 4) * PH + 3)
    }
    ctx.save()
    ctx.translate(W - 9, PAD.t + PH / 2)
    ctx.rotate(Math.PI / 2)
    ctx.textAlign = 'center'
    ctx.fillText('fp₀', 0, 0)
    ctx.restore()

    // X-axis labels
    ctx.fillStyle = textColor
    ctx.textAlign = 'center'
    for (let lm = 0; lm <= LM_MAX; lm += 500) {
      ctx.fillText(`${lm}`, tx(lm), PAD.t + PH + 13)
    }
    ctx.fillText('Lm (mH)', PAD.l + PW / 2, H - 5)

    // Current Lm label above cursor
    ctx.fillStyle = cursorCol
    ctx.font = '9px sans-serif'
    ctx.textAlign = 'center'
    const labelX = Math.max(PAD.l + 18, Math.min(PAD.l + PW - 18, xCur))
    ctx.fillText(`${fmt(curLm, 0)} mH`, labelX, PAD.t - 8)

  }, [params])

  return (
    <canvas
      ref={canvasRef}
      width={W}
      height={H}
      className="w-full"
      aria-label={t(lang, 'kacPFCCurveAria')}
    />
  )
}
