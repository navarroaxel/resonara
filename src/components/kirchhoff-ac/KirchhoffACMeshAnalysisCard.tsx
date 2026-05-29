'use client'
import { useKirchhoffAC } from '@/store/kirchhoff-ac-store'
import { t } from '@/lib/i18n'
import { fmt } from '@/lib/utils'

function fmtC(re: number, im: number, d = 2): string {
  if (!Number.isFinite(re) || !Number.isFinite(im)) return '—'
  const sign = im >= 0 ? '+' : '−'
  return `${fmt(re, d)} ${sign} j${fmt(Math.abs(im), d)}`
}

function fmtPhasor(mag: number, ang: number, d = 3): string {
  if (!Number.isFinite(mag)) return '—'
  return `${fmt(mag, d)} ∠ ${fmt(ang, 1)}°`
}

export function KirchhoffACMeshAnalysisCard() {
  const { state: { params, flags, results, lang } } = useKirchhoffAC()
  const { Vs, R1, R } = params
  const { I1, I2, I3, Zm_re, Zm_im, Zc_im, D_mag } = results

  const Z11_re = R1 + R;        const Z11_im = 0
  const Z12_re = -R;             const Z12_im = 0
  const Z22_re = R + Zm_re;     const Z22_im = Zm_im
  const Z23_re = -Zm_re;         const Z23_im = -Zm_im
  const Z33_re = Zm_re;          const Z33_im = Zm_im + Zc_im

  return (
    <div className="rounded-xl border border-neutral-200 dark:border-neutral-800 bg-white dark:bg-neutral-900 p-4">
      <h2 className="text-xs font-medium text-neutral-400 uppercase tracking-wider mb-3">
        {t(lang, 'kacMeshAnalysisTitle')}
      </h2>

      <p className="text-xs text-neutral-500 dark:text-neutral-400 mb-2">
        {t(lang, 'meshEquations')}
      </p>

      <div className="font-mono text-xs mb-3 space-y-1 text-neutral-700 dark:text-neutral-300">
        <div className="flex flex-wrap gap-x-1 items-center">
          <span className="text-violet-600 dark:text-violet-400">({fmtC(Z11_re, Z11_im, 1)})</span>
          <span>·I₁</span>
          <span className="text-neutral-400">+</span>
          <span className="text-teal-600 dark:text-teal-400">({fmtC(Z12_re, Z12_im, 1)})</span>
          {flags.mesh3
            ? <><span>·I₂ + (0)·I₃ = {fmt(Vs, 1)}</span></>
            : <><span>·I₂ = {fmt(Vs, 1)}</span></>
          }
        </div>
        <div className="flex flex-wrap gap-x-1 items-center">
          <span className="text-violet-600 dark:text-violet-400">({fmtC(Z12_re, Z12_im, 1)})</span>
          <span>·I₁</span>
          <span className="text-neutral-400">+</span>
          <span className="text-teal-600 dark:text-teal-400">({fmtC(Z22_re, Z22_im, 1)})</span>
          {flags.mesh3
            ? <>
                <span>·I₂</span>
                <span className="text-neutral-400">+</span>
                <span className="text-orange-600 dark:text-orange-400">({fmtC(Z23_re, Z23_im, 1)})</span>
                <span>·I₃ = 0</span>
              </>
            : <span>·I₂ = 0</span>
          }
        </div>
        {flags.mesh3 && (
          <div className="flex flex-wrap gap-x-1 items-center">
            <span>(0)·I₁</span>
            <span className="text-neutral-400">+</span>
            <span className="text-teal-600 dark:text-teal-400">({fmtC(Z23_re, Z23_im, 1)})</span>
            <span>·I₂</span>
            <span className="text-neutral-400">+</span>
            <span className="text-orange-600 dark:text-orange-400">({fmtC(Z33_re, Z33_im, 1)})</span>
            <span>·I₃ = 0</span>
          </div>
        )}
      </div>

      {flags.mesh3 && (
        <div className="text-xs text-neutral-500 dark:text-neutral-400 mb-3">
          <span>{t(lang, 'kacMeshDet')}: </span>
          <span className="font-mono font-medium text-neutral-700 dark:text-neutral-300">
            {fmt(D_mag, 4)} Ω³
          </span>
        </div>
      )}

      <p className="text-xs text-neutral-500 dark:text-neutral-400 mb-2">
        {t(lang, 'kacMeshSolution')}
      </p>
      <div className="font-mono text-sm space-y-1">
        <div>
          <span className="text-violet-600 dark:text-violet-400">I₁</span>
          <span className="text-neutral-700 dark:text-neutral-300"> = {fmtPhasor(I1.mag, I1.ang)} A</span>
        </div>
        <div>
          <span className="text-teal-600 dark:text-teal-400">I₂</span>
          <span className="text-neutral-700 dark:text-neutral-300"> = {fmtPhasor(I2.mag, I2.ang)} A</span>
        </div>
        {flags.mesh3 && (
          <div>
            <span className="text-orange-600 dark:text-orange-400">I₃</span>
            <span className="text-neutral-700 dark:text-neutral-300"> = {fmtPhasor(I3.mag, I3.ang)} A</span>
          </div>
        )}
      </div>
    </div>
  )
}
