'use client'
import { useEffect, useRef } from 'react'
import { useRLC } from '@/store/rlc-store'
import { useUI } from '@/store/ui-store'
import { t } from '@/lib/i18n'

const SIZE = 280

const HARMONIC_COLORS = [
  '#1D9E75', // n=1 (teal — matches current color)
  '#D85A30', // n=2 (orange)
  '#7F77DD', // n=3 (purple)
  '#C0392B', // n=4 (red)
  '#F39C12', // n=5 (amber)
  '#16A085', // n=6 (teal dark)
  '#8E44AD', // n=7 (violet)
  '#2ECC71', // n=8 (green)
  '#E74C3C', // n=9 (light red)
  '#3498DB', // n=10 (sky blue)
]

function drawArrow(
  ctx: CanvasRenderingContext2D,
  ox: number, oy: number, ex: number, ey: number,
  color: string, label: string,
  labelDx = 6,
) {
  ctx.save()
  ctx.strokeStyle = color; ctx.fillStyle = color; ctx.lineWidth = 2
  ctx.beginPath(); ctx.moveTo(ox, oy); ctx.lineTo(ex, ey); ctx.stroke()
  const angle = Math.atan2(ey - oy, ex - ox)
  ctx.beginPath()
  ctx.moveTo(ex, ey)
  ctx.lineTo(ex - 10 * Math.cos(angle - 0.4), ey - 10 * Math.sin(angle - 0.4))
  ctx.lineTo(ex - 10 * Math.cos(angle + 0.4), ey - 10 * Math.sin(angle + 0.4))
  ctx.closePath(); ctx.fill()
  ctx.font = 'bold 12px sans-serif'
  ctx.fillText(label, ex + labelDx, ey - 4)
  ctx.restore()
}

export function PhasorDiagram() {
  const canvasRef = useRef<HTMLCanvasElement>(null)
  const { state: { params, results, circuitType, flags, polyMode, polyResults } } = useRLC()
  const { state: { lang } } = useUI()

  useEffect(() => {
    const canvas = canvasRef.current
    if (!canvas) return
    const ctx = canvas.getContext('2d')
    if (!ctx) return

    const { Vs, R } = params
    const { I, phi: phiDeg, XL, XC } = results
    const isDark = window.matchMedia('(prefers-color-scheme: dark)').matches
    const cx = SIZE / 2, cy = SIZE / 2

    ctx.clearRect(0, 0, SIZE, SIZE)

    ctx.strokeStyle = isDark ? 'rgba(255,255,255,0.12)' : 'rgba(0,0,0,0.1)'
    ctx.lineWidth = 0.5
    ctx.beginPath(); ctx.moveTo(0, cy); ctx.lineTo(SIZE, cy); ctx.stroke()
    ctx.beginPath(); ctx.moveTo(cx, 0); ctx.lineTo(cx, SIZE); ctx.stroke()

    ctx.fillStyle = isDark ? '#9FA0A0' : '#888'
    ctx.font = '11px sans-serif'
    ctx.fillText('Re', SIZE - 18, cy - 6)
    ctx.fillText('Im', cx + 4, 12)

    if (polyMode && polyResults && polyResults.harmonics.length > 0) {
      // Polyharmonic mode: show V1 reference + current phasor per harmonic
      const scale_V = (SIZE * 0.38) / Vs
      const maxIn   = Math.max(...polyResults.harmonics.map(h => h.In))
      const scale_I = maxIn > 0 ? (SIZE * 0.35) / maxIn : 1

      // V1 reference (blue)
      drawArrow(ctx, cx, cy, cx + Vs * scale_V, cy, '#378ADD', 'V₁')

      const legend: [string, string][] = [['#378ADD', 'V₁']]

      polyResults.harmonics.forEach(h => {
        const color  = HARMONIC_COLORS[(h.n - 1) % HARMONIC_COLORS.length]
        const netRad = (h.phin_source - h.phin_circuit) * Math.PI / 180
        const len    = h.In * scale_I
        drawArrow(
          ctx, cx, cy,
          cx + len * Math.cos(-netRad),
          cy + len * Math.sin(-netRad),
          color, `I${subscript(h.n)}`,
        )
        legend.push([color, `I${subscript(h.n)}`])
      })

      ctx.font = '11px sans-serif'
      legend.forEach(([c, l], i) => {
        ctx.fillStyle = c
        ctx.fillRect(8, 8 + i * 16, 10, 10)
        ctx.fillStyle = isDark ? '#9FA0A0' : '#888'
        ctx.fillText(l, 22, 18 + i * 16)
      })
    } else {
      // Single-frequency mode (original behavior)
      const scale = (SIZE * 0.38) / Vs
      const phiRad  = (phiDeg * Math.PI) / 180
      const iLen    = SIZE * 0.32
      drawArrow(ctx, cx, cy, cx + Vs * scale, cy, '#378ADD', 'V')
      drawArrow(ctx, cx, cy,
        cx + iLen * Math.cos(-phiRad),
        cy + iLen * Math.sin(-phiRad),
        '#1D9E75', 'I',
      )

      if (circuitType === 'series') {
        drawArrow(ctx, cx, cy, cx + I * R * scale, cy, '#D85A30', 'VR')
        if (flags.hasL) drawArrow(ctx, cx, cy, cx, cy - I * XL * scale, '#7F77DD', 'VL')
        if (flags.hasC) drawArrow(ctx, cx, cy, cx, cy + I * XC * scale, '#C0392B', 'VC')
      }

      const legend: [string, string][] = circuitType === 'series'
        ? [
            ['#378ADD', t(lang, 'vSource')],
            ['#1D9E75', 'I'],
            ['#D85A30', 'VR'],
            ...(flags.hasL ? [['#7F77DD', 'VL'] as [string, string]] : []),
            ...(flags.hasC ? [['#C0392B', 'VC'] as [string, string]] : []),
          ]
        : [['#378ADD', t(lang, 'vSource')], ['#1D9E75', t(lang, 'iTotal')]]

      ctx.font = '11px sans-serif'
      legend.forEach(([c, l], i) => {
        ctx.fillStyle = c
        ctx.fillRect(8, 8 + i * 16, 10, 10)
        ctx.fillStyle = isDark ? '#9FA0A0' : '#888'
        ctx.fillText(l, 22, 18 + i * 16)
      })
    }
  }, [params, results, circuitType, flags, polyMode, polyResults, lang])

  return (
    <canvas
      ref={canvasRef}
      width={SIZE}
      height={SIZE}
      className="mx-auto block"
      aria-label={t(lang, 'phasorAriaLabel')}
    />
  )
}

function subscript(n: number): string {
  const sub: Record<number, string> = { 1:'₁',2:'₂',3:'₃',4:'₄',5:'₅',6:'₆',7:'₇',8:'₈',9:'₉' }
  return sub[n] ?? String(n)
}
