'use client'
import { useEffect, useRef } from 'react'
import { useRLC } from '@/store/rlc-store'
import { fmt } from '@/lib/utils'

const W = 640, H = 280

function wire(ctx: CanvasRenderingContext2D, x1: number, y1: number, x2: number, y2: number, c: string) {
  ctx.save(); ctx.strokeStyle = c; ctx.lineWidth = 2; ctx.lineCap = 'round'
  ctx.beginPath(); ctx.moveTo(x1, y1); ctx.lineTo(x2, y2); ctx.stroke(); ctx.restore()
}

function resistor(ctx: CanvasRenderingContext2D, x: number, y: number, w: number, h: number, c: string, lbl: string) {
  wire(ctx, x, y + h / 2, x + 8, y + h / 2, c)
  ctx.save(); ctx.strokeStyle = c; ctx.lineWidth = 1.8
  ctx.strokeRect(x + 8, y, w - 16, h); ctx.restore()
  wire(ctx, x + w - 8, y + h / 2, x + w, y + h / 2, c)
  ctx.save(); ctx.fillStyle = c; ctx.font = '11px sans-serif'; ctx.textAlign = 'center'
  ctx.fillText(lbl, x + w / 2, y - 5); ctx.restore()
}

function inductor(ctx: CanvasRenderingContext2D, x: number, y: number, w: number, c: string, lbl: string) {
  const cy = y + 10, bumps = 4, bw = (w - 8) / bumps
  wire(ctx, x, cy, x + 4, cy, c)
  ctx.save(); ctx.strokeStyle = c; ctx.lineWidth = 1.8; ctx.lineCap = 'round'; ctx.lineJoin = 'round'
  ctx.beginPath(); ctx.moveTo(x + 4, cy)
  for (let i = 0; i < bumps; i++) {
    const bx = x + 4 + i * bw
    ctx.quadraticCurveTo(bx + bw * 0.25, cy - 13, bx + bw * 0.5, cy)
    ctx.quadraticCurveTo(bx + bw * 0.75, cy + 4, bx + bw, cy)
  }
  ctx.stroke(); ctx.restore()
  wire(ctx, x + w - 4, cy, x + w, cy, c)
  ctx.save(); ctx.fillStyle = c; ctx.font = '11px sans-serif'; ctx.textAlign = 'center'
  ctx.fillText(lbl, x + w / 2, y - 5); ctx.restore()
}

function capacitor(ctx: CanvasRenderingContext2D, x: number, y: number, h: number, c: string, lbl: string) {
  const cy = y + h / 2
  wire(ctx, x, cy, x + 12, cy, c)
  ctx.save(); ctx.strokeStyle = c; ctx.lineWidth = 2.2; ctx.lineCap = 'round'
  ctx.beginPath(); ctx.moveTo(x + 12, y); ctx.lineTo(x + 12, y + h); ctx.stroke()
  ctx.beginPath(); ctx.moveTo(x + 20, y); ctx.lineTo(x + 20, y + h); ctx.stroke()
  ctx.restore()
  wire(ctx, x + 20, cy, x + 32, cy, c)
  ctx.save(); ctx.fillStyle = c; ctx.font = '11px sans-serif'; ctx.textAlign = 'center'
  ctx.fillText(lbl, x + 16, y - 5); ctx.restore()
}

function sourceAC(ctx: CanvasRenderingContext2D, cx: number, cy: number, r: number, c: string) {
  ctx.save(); ctx.strokeStyle = c; ctx.lineWidth = 1.8
  ctx.beginPath(); ctx.arc(cx, cy, r, 0, 2 * Math.PI); ctx.stroke()
  ctx.fillStyle = c; ctx.font = '14px sans-serif'
  ctx.textAlign = 'center'; ctx.textBaseline = 'middle'
  ctx.fillText('~', cx, cy)
  ctx.font = '11px sans-serif'; ctx.textBaseline = 'alphabetic'
  ctx.fillText('Vs', cx - r - 6, cy + 4)
  ctx.restore()
}

function dot(ctx: CanvasRenderingContext2D, x: number, y: number, c: string) {
  ctx.save(); ctx.fillStyle = c
  ctx.beginPath(); ctx.arc(x, y, 3.5, 0, 2 * Math.PI); ctx.fill(); ctx.restore()
}

function drawSeries(
  ctx: CanvasRenderingContext2D, isDark: boolean,
  XL: number, XC: number, fr: number,
  hasL: boolean, hasC: boolean,
) {
  const grayC = isDark ? '#404040' : '#C8C8C8'
  const wC = isDark ? '#85B7EB' : '#378ADD', nC = isDark ? '#FAC775' : '#BA7517'
  const mC = isDark ? '#9FA0A0' : '#888', rC = isDark ? '#F0997B' : '#D85A30'
  const lC = hasL ? (isDark ? '#AFA9EC' : '#7F77DD') : grayC
  const cC = hasC ? (isDark ? '#5DCAA5' : '#1D9E75') : grayC
  const top = 60, bot = 220, left = 50, right = 590
  const srcX = left + 36, srcY = (top + bot) / 2
  wire(ctx, srcX, top, right, top, wC); wire(ctx, left, bot, right, bot, wC)
  wire(ctx, right, top, right, bot, wC)
  wire(ctx, srcX, bot, srcX, srcY + 22, wC); wire(ctx, srcX, top, srcX, srcY - 22, wC)
  sourceAC(ctx, srcX, srcY, 22, mC)
  const rw = 72, lw = 80, cw = 34
  const spacing = (right - left - 80 - rw - lw - cw) / 2
  const rStart = left + 80, lStart = rStart + rw + spacing, cStart = lStart + lw + spacing
  resistor(ctx, rStart, top - 10, rw, 20, rC, 'R')
  inductor(ctx, lStart, top - 10, lw, lC, 'L')
  capacitor(ctx, cStart, top - 14, 28, cC, 'C')
  dot(ctx, rStart + rw, top, nC); dot(ctx, lStart + lw, top, nC)
  const frStr = Number.isFinite(fr) ? `fr = ${fmt(fr, 1)} Hz` : 'fr = —'
  ctx.fillStyle = mC; ctx.font = '11px sans-serif'; ctx.textAlign = 'center'
  ctx.fillText(`XL = ${fmt(XL, 1)} Ω   XC = ${fmt(XC, 1)} Ω   ${frStr}`, W / 2, bot + 24)
}

function drawParallel(
  ctx: CanvasRenderingContext2D, isDark: boolean,
  XL: number, XC: number, fr: number,
  hasL: boolean, hasC: boolean,
) {
  const grayC = isDark ? '#404040' : '#C8C8C8'
  const wC = isDark ? '#85B7EB' : '#378ADD', nC = isDark ? '#FAC775' : '#BA7517'
  const mC = isDark ? '#9FA0A0' : '#888'
  const top = 60, bot = 220, left = 70, right = 570
  const srcX = left + 22, srcY = (top + bot) / 2
  wire(ctx, left, top, right, top, wC); wire(ctx, left, bot, right, bot, wC)
  wire(ctx, srcX, top, srcX, srcY - 22, wC); wire(ctx, srcX, bot, srcX, srcY + 22, wC)
  sourceAC(ctx, srcX, srcY, 22, mC)
  const branches = [
    { x: 210, type: 'R', color: isDark ? '#F0997B' : '#D85A30' },
    { x: 330, type: 'L', color: hasL ? (isDark ? '#AFA9EC' : '#7F77DD') : grayC },
    { x: 440, type: 'C', color: hasC ? (isDark ? '#5DCAA5' : '#1D9E75') : grayC },
  ]
  branches.forEach(({ x, type, color }) => {
    const bx = x + 17
    wire(ctx, bx, top, bx, top + 14, wC); wire(ctx, bx, bot, bx, bot - 14, wC)
    dot(ctx, bx, top, nC); dot(ctx, bx, bot, nC)
    if (type === 'R') {
      wire(ctx, bx, top + 14, bx, top + 20, wC)
      ctx.save(); ctx.strokeStyle = color; ctx.lineWidth = 1.8
      ctx.strokeRect(bx - 10, top + 20, 20, 56); ctx.restore()
      wire(ctx, bx, top + 76, bx, bot - 14, wC)
      ctx.fillStyle = color; ctx.font = '11px sans-serif'; ctx.textAlign = 'start'
      ctx.fillText('R', bx - 20, (top + bot) / 2 + 4)
    } else if (type === 'L') {
      const ly1 = top + 20, lh = bot - 20 - ly1, bumps = 4, bh = lh / bumps
      wire(ctx, bx, top + 14, bx, ly1, wC)
      ctx.save(); ctx.strokeStyle = color; ctx.lineWidth = 1.8; ctx.lineCap = 'round'; ctx.lineJoin = 'round'
      ctx.beginPath(); ctx.moveTo(bx, ly1)
      for (let i = 0; i < bumps; i++) {
        const by = ly1 + i * bh
        ctx.quadraticCurveTo(bx + 13, by + bh * 0.25, bx, by + bh * 0.5)
        ctx.quadraticCurveTo(bx - 4, by + bh * 0.75, bx, by + bh)
      }
      ctx.stroke(); ctx.restore()
      wire(ctx, bx, ly1 + lh, bx, bot - 14, wC)
      ctx.fillStyle = color; ctx.font = '11px sans-serif'; ctx.textAlign = 'start'
      ctx.fillText('L', bx + 14, (top + bot) / 2 + 4)
    } else {
      const mid = (top + bot) / 2
      wire(ctx, bx, top + 14, bx, mid - 8, wC)
      ctx.save(); ctx.strokeStyle = color; ctx.lineWidth = 2.2; ctx.lineCap = 'round'
      ctx.beginPath(); ctx.moveTo(bx - 12, mid - 8); ctx.lineTo(bx + 12, mid - 8); ctx.stroke()
      ctx.beginPath(); ctx.moveTo(bx - 12, mid + 8); ctx.lineTo(bx + 12, mid + 8); ctx.stroke()
      ctx.restore()
      wire(ctx, bx, mid + 8, bx, bot - 14, wC)
      ctx.fillStyle = color; ctx.font = '11px sans-serif'; ctx.textAlign = 'start'
      ctx.fillText('C', bx + 16, mid + 4)
    }
  })
  const frStr = Number.isFinite(fr) ? `fr = ${fmt(fr, 1)} Hz` : 'fr = —'
  ctx.fillStyle = mC; ctx.font = '11px sans-serif'; ctx.textAlign = 'center'
  ctx.fillText(`XL = ${fmt(XL, 1)} Ω   XC = ${fmt(XC, 1)} Ω   ${frStr}`, W / 2, bot + 24)
}

export function CircuitSchematic() {
  const canvasRef = useRef<HTMLCanvasElement>(null)
  const { state: { circuitType, results, flags } } = useRLC()

  useEffect(() => {
    const canvas = canvasRef.current
    if (!canvas) return
    const ctx = canvas.getContext('2d')
    if (!ctx) return
    const isDark = window.matchMedia('(prefers-color-scheme: dark)').matches
    ctx.clearRect(0, 0, W, H)
    if (circuitType === 'series') {
      drawSeries(ctx, isDark, results.XL, results.XC, results.fr, flags.hasL, flags.hasC)
    } else {
      drawParallel(ctx, isDark, results.XL, results.XC, results.fr, flags.hasL, flags.hasC)
    }
  }, [circuitType, results, flags])

  return (
    <canvas
      ref={canvasRef}
      width={W}
      height={H}
      className="w-full"
      aria-label={`Esquemático del circuito RLC ${circuitType}`}
    />
  )
}
