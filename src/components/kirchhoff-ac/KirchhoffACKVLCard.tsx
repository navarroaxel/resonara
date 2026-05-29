'use client'
import { useKirchhoffAC } from '@/store/kirchhoff-ac-store'
import { t } from '@/lib/i18n'
import { fmt } from '@/lib/utils'

const TOL = 1e-6

function valid(re: number, im: number) {
  return Number.isFinite(re) && Number.isFinite(im) && Math.hypot(re, im) < TOL
}

function Badge({ ok }: { ok: boolean }) {
  return (
    <span className={ok ? 'text-green-600 dark:text-green-400' : 'text-red-500 dark:text-red-400'}>
      {ok ? ' ✓' : ' ✗'}
    </span>
  )
}

function fmtMag(re: number, im: number) {
  if (!Number.isFinite(re)) return '—'
  return fmt(Math.hypot(re, im), 2)
}

export function KirchhoffACKVLCard() {
  const { state: { params, flags, results, lang } } = useKirchhoffAC()
  const { Vs, R1, R } = params
  const { kvl1_re, kvl1_im, kvl2_re, kvl2_im, kvl3_re, kvl3_im, Zm_re, Zm_im, Zc_im } = results

  const XLm = fmt(Zm_im, 2)
  const XCm = fmt(Math.abs(Zc_im), 2)

  return (
    <div className="space-y-4">
      <div>
        <p className="text-xs font-medium text-violet-600 dark:text-violet-400 mb-1">
          {t(lang, 'kacKVLLoop1')}
        </p>
        <p className="font-mono text-xs text-neutral-500 dark:text-neutral-400 mb-1">
          Vs − (R₁+R)·I₁ + R·I₂ = 0
        </p>
        <p className="font-mono text-xs text-neutral-500 dark:text-neutral-400 mb-1">
          {fmt(Vs, 1)}V, R₁={fmt(R1, 1)}Ω, R={fmt(R, 1)}Ω
        </p>
        <p className="font-mono text-sm text-neutral-700 dark:text-neutral-300">
          {'|residual| = '}
          <span className={valid(kvl1_re, kvl1_im) ? 'text-green-600 dark:text-green-400' : 'text-red-500 dark:text-red-400'}>
            {fmtMag(kvl1_re, kvl1_im)}
          </span>
          <Badge ok={valid(kvl1_re, kvl1_im)} />
        </p>
      </div>

      <div>
        <p className="text-xs font-medium text-teal-600 dark:text-teal-400 mb-1">
          {t(lang, 'kacKVLLoop2')}
        </p>
        <p className="font-mono text-xs text-neutral-500 dark:text-neutral-400 mb-1">
          R·I₁ − (R+Zm)·I₂ + Zm·I₃ = 0
        </p>
        <p className="font-mono text-xs text-neutral-500 dark:text-neutral-400 mb-1">
          Zm = {fmt(Zm_re, 1)} + j{XLm} Ω
        </p>
        <p className="font-mono text-sm text-neutral-700 dark:text-neutral-300">
          {'|residual| = '}
          <span className={valid(kvl2_re, kvl2_im) ? 'text-green-600 dark:text-green-400' : 'text-red-500 dark:text-red-400'}>
            {fmtMag(kvl2_re, kvl2_im)}
          </span>
          <Badge ok={valid(kvl2_re, kvl2_im)} />
        </p>
      </div>

      {flags.mesh3 && (
        <div>
          <p className="text-xs font-medium text-orange-600 dark:text-orange-400 mb-1">
            {t(lang, 'kacKVLLoop3')}
          </p>
          <p className="font-mono text-xs text-neutral-500 dark:text-neutral-400 mb-1">
            Zm·I₂ − (Zm+Zc)·I₃ = 0
          </p>
          <p className="font-mono text-xs text-neutral-500 dark:text-neutral-400 mb-1">
            Zc = −j{XCm} Ω
          </p>
          <p className="font-mono text-sm text-neutral-700 dark:text-neutral-300">
            {'|residual| = '}
            <span className={valid(kvl3_re, kvl3_im) ? 'text-green-600 dark:text-green-400' : 'text-red-500 dark:text-red-400'}>
              {fmtMag(kvl3_re, kvl3_im)}
            </span>
            <Badge ok={valid(kvl3_re, kvl3_im)} />
          </p>
        </div>
      )}
    </div>
  )
}
