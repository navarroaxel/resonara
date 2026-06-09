import type { ResistorSymbol } from './types'

export function drawResistorHBody(
  ctx: CanvasRenderingContext2D,
  x: number, y: number, w: number, h: number,
  c: string,
  symbol: ResistorSymbol,
) {
  if (symbol === 'eu') {
    ctx.save()
    ctx.strokeStyle = c; ctx.lineWidth = 1.8
    ctx.strokeRect(x, y, w, h)
    ctx.restore()
  } else {
    const cy = y + h / 2
    const peaks = 6
    const step = w / peaks
    const amp = h / 2 + 2
    ctx.save()
    ctx.strokeStyle = c; ctx.lineWidth = 1.8
    ctx.lineCap = 'round'; ctx.lineJoin = 'round'
    ctx.beginPath()
    ctx.moveTo(x, cy)
    for (let i = 0; i < peaks; i++) {
      ctx.lineTo(x + (i + 0.5) * step, cy + (i % 2 === 0 ? -1 : 1) * amp)
      ctx.lineTo(x + (i + 1) * step, cy)
    }
    ctx.stroke()
    ctx.restore()
  }
}

export function drawResistorVBody(
  ctx: CanvasRenderingContext2D,
  x: number, y: number, w: number, h: number,
  c: string,
  symbol: ResistorSymbol,
) {
  if (symbol === 'eu') {
    ctx.save()
    ctx.strokeStyle = c; ctx.lineWidth = 1.8
    ctx.strokeRect(x, y, w, h)
    ctx.restore()
  } else {
    const cx = x + w / 2
    const peaks = 6
    const step = h / peaks
    const amp = w / 2 + 2
    ctx.save()
    ctx.strokeStyle = c; ctx.lineWidth = 1.8
    ctx.lineCap = 'round'; ctx.lineJoin = 'round'
    ctx.beginPath()
    ctx.moveTo(cx, y)
    for (let i = 0; i < peaks; i++) {
      ctx.lineTo(cx + (i % 2 === 0 ? -1 : 1) * amp, y + (i + 0.5) * step)
      ctx.lineTo(cx, y + (i + 1) * step)
    }
    ctx.stroke()
    ctx.restore()
  }
}
