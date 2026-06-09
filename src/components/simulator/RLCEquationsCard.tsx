'use client'
import { useRLC } from '@/store/rlc-store'
import { useUI } from '@/store/ui-store'
import { t } from '@/lib/i18n'
import { fmt } from '@/lib/utils'

export function RLCEquationsCard() {
  const { state: { params, results, circuitType, flags, polyMode } } = useRLC()
  const { state: { lang } } = useUI()

  if (polyMode) return null

  const { Vs, R, f } = params
  const L_H = params.L / 1000
  const C_F = params.C / 1e6
  const { Z, phi, I, XL, XC, fr, Q, P, Qp, S, fp } = results

  const w    = 2 * Math.PI * f
  const fmtW = fmt(w, 2)

  const isSeries = circuitType === 'series'

  // Parallel admittances (for substituted section)
  const G  = 1 / R
  const BL = flags.hasL && XL > 0 ? 1 / XL : 0
  const BC = flags.hasC && XC > 0 ? 1 / XC : 0

  return (
    <div className="rounded-xl border border-neutral-200 dark:border-neutral-800 bg-white dark:bg-neutral-900 p-4">
      <h2 className="text-xs font-medium text-neutral-400 uppercase tracking-wider mb-3">
        {t(lang, 'rlcEquationsTitle')}
      </h2>

      {/* ── General form ── */}
      <p className="text-xs text-neutral-500 dark:text-neutral-400 mb-2">
        {t(lang, 'rcDcGeneralForm')}
      </p>
      <div className="font-mono text-xs space-y-1.5 text-neutral-700 dark:text-neutral-300 mb-4 leading-relaxed">
        {isSeries ? (
          <>
            <div>
              <span className="text-blue-600 dark:text-blue-400">XL</span>
              {' = ω·L'}
              {'   '}
              <span className="text-blue-600 dark:text-blue-400">XC</span>
              {' = 1 / (ω·C)'}
            </div>
            <div>
              {'|'}
              <span className="text-blue-600 dark:text-blue-400">Z</span>
              {'| = √(R² + ('}
              <span className="text-blue-600 dark:text-blue-400">XL</span>
              {' − '}
              <span className="text-blue-600 dark:text-blue-400">XC</span>
              {')²)'}
            </div>
            <div>
              {'φ = arctan(('}
              <span className="text-blue-600 dark:text-blue-400">XL</span>
              {' − '}
              <span className="text-blue-600 dark:text-blue-400">XC</span>
              {') / R)'}
            </div>
            <div>
              <span className="text-teal-600 dark:text-teal-400">I</span>
              {' = Vs / |'}
              <span className="text-blue-600 dark:text-blue-400">Z</span>
              {'|'}
            </div>
          </>
        ) : (
          <>
            <div>
              <span className="text-blue-600 dark:text-blue-400">G</span>
              {' = 1/R   '}
              <span className="text-blue-600 dark:text-blue-400">BL</span>
              {' = 1/(ω·L)   '}
              <span className="text-blue-600 dark:text-blue-400">BC</span>
              {' = ω·C'}
            </div>
            <div>
              {'|Y| = √('}
              <span className="text-blue-600 dark:text-blue-400">G</span>
              {'² + ('}
              <span className="text-blue-600 dark:text-blue-400">BC</span>
              {' − '}
              <span className="text-blue-600 dark:text-blue-400">BL</span>
              {')²)'}
            </div>
            <div>
              {'|'}
              <span className="text-blue-600 dark:text-blue-400">Z</span>
              {'| = 1 / |Y|'}
            </div>
            <div>
              {'φ = −arctan(('}
              <span className="text-blue-600 dark:text-blue-400">BC</span>
              {' − '}
              <span className="text-blue-600 dark:text-blue-400">BL</span>
              {') / '}
              <span className="text-blue-600 dark:text-blue-400">G</span>
              {')'}
            </div>
            <div>
              <span className="text-teal-600 dark:text-teal-400">I</span>
              {' = Vs · |Y|'}
            </div>
          </>
        )}
        <div className="border-t border-neutral-100 dark:border-neutral-800 pt-1.5 mt-1.5">
          {'fr = 1 / (2π·√(L·C))'}
        </div>
        <div>
          {isSeries
            ? 'Q = (1/R)·√(L/C)'
            : 'Q = R·√(C/L)'}
        </div>
        <div className="border-t border-neutral-100 dark:border-neutral-800 pt-1.5 mt-1.5">
          <span className="text-green-600 dark:text-green-400">P</span>
          {' = Vs·'}
          <span className="text-teal-600 dark:text-teal-400">I</span>
          {'·cos(φ)'}
          {'   '}
          <span className="text-orange-500 dark:text-orange-400">S</span>
          {' = Vs·'}
          <span className="text-teal-600 dark:text-teal-400">I</span>
        </div>
      </div>

      {/* ── Substituted values ── */}
      <p className="text-xs text-neutral-500 dark:text-neutral-400 mb-2">
        {t(lang, 'rcDcSubstituted')}
      </p>
      <div className="font-mono text-xs space-y-1.5 text-neutral-700 dark:text-neutral-300 mb-4 leading-relaxed">
        <div>
          {'ω = 2π · '}
          {fmt(f)}
          {' = '}
          <span className="font-medium">{fmtW}</span>
          {' rad/s'}
        </div>
        {flags.hasL && (
          <div>
            <span className="text-blue-600 dark:text-blue-400">XL</span>
            {` = ${fmtW} · ${fmt(L_H, 3)} = ${fmt(XL, 2)} Ω`}
          </div>
        )}
        {flags.hasC && (
          <div>
            <span className="text-blue-600 dark:text-blue-400">XC</span>
            {` = 1 / (${fmtW} · ${fmt(C_F, 6)}) = ${fmt(XC, 2)} Ω`}
          </div>
        )}
        {!isSeries && (
          <>
            <div>
              <span className="text-blue-600 dark:text-blue-400">G</span>
              {` = 1/${fmt(R)} = ${fmt(G, 5)} S`}
            </div>
            {flags.hasL && (
              <div>
                <span className="text-blue-600 dark:text-blue-400">BL</span>
                {` = 1/${fmt(XL, 2)} = ${fmt(BL, 5)} S`}
              </div>
            )}
            {flags.hasC && (
              <div>
                <span className="text-blue-600 dark:text-blue-400">BC</span>
                {` = 1/${fmt(XC, 2)} = ${fmt(BC, 5)} S`}
              </div>
            )}
          </>
        )}
        <div>
          {'|'}
          <span className="text-blue-600 dark:text-blue-400">Z</span>
          {`| = ${fmt(Z, 2)} Ω   φ = ${fmt(phi, 1)}°`}
        </div>
        <div>
          <span className="text-teal-600 dark:text-teal-400">I</span>
          {` = ${fmt(Vs)} / ${fmt(Z, 2)} = `}
          <span className="text-teal-600 dark:text-teal-400 font-medium">{fmt(I, 3)} A</span>
        </div>
        <div>{`fr = ${fmt(fr, 2)} Hz   Q = ${fmt(Q, 3)}`}</div>
        <div>
          <span className="text-green-600 dark:text-green-400">P</span>
          {` = ${fmt(P, 2)} W   `}
          <span className="text-orange-500 dark:text-orange-400">Qp</span>
          {` = ${fmt(Qp, 2)} VAR   `}
          <span className="text-blue-600 dark:text-blue-400">S</span>
          {` = ${fmt(S, 2)} VA`}
        </div>
        <div>{`fp = cos(${fmt(phi, 1)}°) = ${fmt(fp, 3)}`}</div>
      </div>
    </div>
  )
}
