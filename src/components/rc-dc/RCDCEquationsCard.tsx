'use client'
import { useRCDC } from '@/store/rc-dc-store'
import { useUI } from '@/store/ui-store'
import { t } from '@/lib/i18n'
import { fmt } from '@/lib/utils'

function fmtTauSub(tau: number): string {
  if (tau < 0.001) return `${fmt(tau * 1e6, 2)} µs`
  if (tau < 1)     return `${fmt(tau * 1e3, 2)} ms`
  return `${fmt(tau, 4)} s`
}

function fmtTauExp(tau: number): string {
  // Exponent shown inside e^(−t/τ) — always in seconds for consistency
  if (tau < 0.001) return `${fmt(tau, 6)}`
  if (tau < 1)     return `${fmt(tau, 4)}`
  return `${fmt(tau, 3)}`
}

export function RCDCEquationsCard() {
  const { state: { params, results } } = useRCDC()
  const { state: { lang } } = useUI()
  const { Vs, R, C } = params
  const { tau, I0 } = results

  const tauSub = fmtTauSub(tau)
  const tauExp = fmtTauExp(tau)
  const CinF   = fmt(C * 1e-6, C < 10 ? 6 : 4)
  const I0str  = I0 < 0.001
    ? `${fmt(I0 * 1e6, 3)} µA`
    : I0 < 1
      ? `${fmt(I0 * 1e3, 4)} mA`
      : `${fmt(I0, 5)} A`

  return (
    <div className="rounded-xl border border-neutral-200 dark:border-neutral-800 bg-white dark:bg-neutral-900 p-4">
      <h2 className="text-xs font-medium text-neutral-400 uppercase tracking-wider mb-3">
        {t(lang, 'rcDcEquationsTitle')}
      </h2>

      {/* General form */}
      <p className="text-xs text-neutral-500 dark:text-neutral-400 mb-2">
        {t(lang, 'rcDcGeneralForm')}
      </p>
      <div className="font-mono text-xs space-y-1.5 text-neutral-700 dark:text-neutral-300 mb-4 leading-relaxed">
        <div>
          <span className="text-blue-600 dark:text-blue-400">τ</span>
          {' = R · C'}
        </div>
        <div>
          <span className="text-blue-600 dark:text-blue-400">V_C(t)</span>
          {' = Vs · (1 − e'}
          <sup>−t/τ</sup>
          {')'}
        </div>
        <div>
          <span className="text-red-600 dark:text-red-400">V_R(t)</span>
          {' = Vs · e'}
          <sup>−t/τ</sup>
        </div>
        <div>
          <span className="text-green-600 dark:text-green-400">I(t)</span>
          {' = (Vs / R) · e'}
          <sup>−t/τ</sup>
        </div>
      </div>

      {/* Substituted form */}
      <p className="text-xs text-neutral-500 dark:text-neutral-400 mb-2">
        {t(lang, 'rcDcSubstituted')}
      </p>
      <div className="font-mono text-xs space-y-1.5 text-neutral-700 dark:text-neutral-300 leading-relaxed">
        <div className="flex flex-wrap gap-x-1 items-baseline">
          <span className="text-blue-600 dark:text-blue-400">τ</span>
          <span>= {fmt(R, 0)} · {CinF} =</span>
          <span className="text-blue-600 dark:text-blue-400 font-medium">{tauSub}</span>
        </div>
        <div>
          <span className="text-blue-600 dark:text-blue-400">V_C(t)</span>
          {` = ${fmt(Vs, 1)} · (1 − e`}
          <sup>{`−t/${tauExp}`}</sup>
          {')'}
        </div>
        <div>
          <span className="text-red-600 dark:text-red-400">V_R(t)</span>
          {` = ${fmt(Vs, 1)} · e`}
          <sup>{`−t/${tauExp}`}</sup>
        </div>
        <div className="flex flex-wrap gap-x-1 items-baseline">
          <span className="text-green-600 dark:text-green-400">I(t)</span>
          <span>=</span>
          <span className="text-green-600 dark:text-green-400 font-medium">{I0str}</span>
          <span>· e</span>
          <sup>{`−t/${tauExp}`}</sup>
        </div>
      </div>
    </div>
  )
}
