'use client'
import { useThreePhase } from '@/store/three-phase-store'
import { t } from '@/lib/i18n'
import { fmt } from '@/lib/utils'

export function ThreePhaseEquationsCard() {
  const { state: { params, results, connection, flags, lang } } = useThreePhase()
  const L_H = params.L / 1000
  const C_F = params.C / 1e6
  const { V_ph, V_L, I_ph, I_L, Z, phi, XL, XC, fr, Q, P, Qr, S, fp } = results

  const w      = 2 * Math.PI * params.f
  const fmtW   = fmt(w, 2)
  const isStar = connection === 'star'
  const { hasL, hasC } = flags

  return (
    <div>
      <p className="text-xs text-neutral-500 dark:text-neutral-400 mb-2">
        {t(lang, 'threePhaseGeneralForm')}
      </p>
      <div className="font-mono text-xs space-y-1.5 text-neutral-700 dark:text-neutral-300 mb-4 leading-relaxed">

        {(hasL || hasC) && (
          <div>
            {hasL && (
              <><span className="text-blue-600 dark:text-blue-400">XL</span>{' = ω·L'}</>
            )}
            {hasL && hasC && '   '}
            {hasC && (
              <><span className="text-blue-600 dark:text-blue-400">XC</span>{' = 1 / (ω·C)'}</>
            )}
          </div>
        )}

        <div
          role="img"
          aria-label={t(lang, hasL && hasC ? 'ariaZFormula' : hasL ? 'ariaZFormulaL' : hasC ? 'ariaZFormulaC' : 'ariaZFormulaR')}
        >
          {'|'}
          <span className="text-blue-600 dark:text-blue-400">Z</span>
          {hasL && hasC  && (<>{'| = √(R² + ('}<span className="text-blue-600 dark:text-blue-400">XL</span>{' − '}<span className="text-blue-600 dark:text-blue-400">XC</span>{')²)'}</>)}
          {hasL && !hasC && (<>{'| = √(R² + '}<span className="text-blue-600 dark:text-blue-400">XL</span>{'²)'}</>)}
          {!hasL && hasC && (<>{'| = √(R² + '}<span className="text-blue-600 dark:text-blue-400">XC</span>{'²)'}</>)}
          {!hasL && !hasC && '| = R'}
        </div>

        <div
          role="img"
          aria-label={t(lang, hasL && hasC ? 'ariaPhiFormula' : hasL ? 'ariaPhiFormulaL' : hasC ? 'ariaPhiFormulaC' : 'ariaPhiFormulaR')}
        >
          <span className="text-violet-600 dark:text-violet-400">φ</span>
          {hasL && hasC  && (<>{' = arctan(('}<span className="text-blue-600 dark:text-blue-400">XL</span>{' − '}<span className="text-blue-600 dark:text-blue-400">XC</span>{') / R)'}</>)}
          {hasL && !hasC && (<>{' = arctan('}<span className="text-blue-600 dark:text-blue-400">XL</span>{' / R)'}</>)}
          {!hasL && hasC && (<>{' = arctan(−'}<span className="text-blue-600 dark:text-blue-400">XC</span>{' / R)'}</>)}
          {!hasL && !hasC && ' = 0'}
        </div>

        <div
          className="border-t border-neutral-100 dark:border-neutral-800 pt-1.5 mt-1.5"
          role="img"
          aria-label={t(lang, isStar ? 'ariaStarVIFormula' : 'ariaDeltaVIFormula')}
        >
          {isStar ? (
            <>
              {'V_f = V_L / √3   |   '}
              <span className="text-teal-600 dark:text-teal-400">I_f</span>
              {' = '}
              <span className="text-teal-600 dark:text-teal-400">I_L</span>
              {' = V_f / |Z|'}
            </>
          ) : (
            <>
              {'V_f = V_L   |   '}
              <span className="text-teal-600 dark:text-teal-400">I_f</span>
              {' = V_f / |Z|   |   '}
              <span className="text-teal-600 dark:text-teal-400">I_L</span>
              {' = √3 · '}
              <span className="text-teal-600 dark:text-teal-400">I_f</span>
            </>
          )}
        </div>

        <div
          className="border-t border-neutral-100 dark:border-neutral-800 pt-1.5 mt-1.5"
          role="img"
          aria-label={t(lang, 'ariaPFormula')}
        >
          <span className="text-green-600 dark:text-green-400">P</span>
          {' = √3 · V_L · '}
          <span className="text-teal-600 dark:text-teal-400">I_L</span>
          {' · cos('}
          <span className="text-violet-600 dark:text-violet-400">φ</span>
          {')'}
        </div>
        <div role="img" aria-label={t(lang, 'ariaQrFormula')}>
          <span className="text-orange-500 dark:text-orange-400">Qr</span>
          {' = √3 · V_L · '}
          <span className="text-teal-600 dark:text-teal-400">I_L</span>
          {' · sin('}
          <span className="text-violet-600 dark:text-violet-400">φ</span>
          {')'}
        </div>
        <div role="img" aria-label={t(lang, 'ariaSFormula')}>
          <span className="text-blue-600 dark:text-blue-400">S</span>
          {' = √3 · V_L · '}
          <span className="text-teal-600 dark:text-teal-400">I_L</span>
        </div>

        {hasL && hasC && (
          <div className="border-t border-neutral-100 dark:border-neutral-800 pt-1.5 mt-1.5">
            {'fr = 1 / (2π·√(L·C))   Q = (1/R)·√(L/C)'}
          </div>
        )}
      </div>

      <p className="text-xs text-neutral-500 dark:text-neutral-400 mb-2">
        {t(lang, 'threePhaseSubstituted')}
      </p>
      <div className="font-mono text-xs space-y-1.5 text-neutral-700 dark:text-neutral-300 leading-relaxed">
        <div>
          {'ω = 2π · '}
          {fmt(params.f)}
          {' = '}
          <span className="font-medium">{fmtW}</span>
          {' rad/s'}
        </div>
        {hasL && (
          <div>
            <span className="text-blue-600 dark:text-blue-400">XL</span>
            {` = ${fmtW} · ${fmt(L_H, 3)} = ${fmt(XL, 2)} Ω`}
          </div>
        )}
        {hasC && (
          <div>
            <span className="text-blue-600 dark:text-blue-400">XC</span>
            {` = 1 / (${fmtW} · ${fmt(C_F, 6)}) = ${fmt(XC, 2)} Ω`}
          </div>
        )}
        <div>
          {'|'}
          <span className="text-blue-600 dark:text-blue-400">Z</span>
          {`| = ${fmt(Z, 2)} Ω   `}
          <span className="text-violet-600 dark:text-violet-400">φ</span>
          {` = ${fmt(phi, 1)}°`}
        </div>
        <div>
          {isStar
            ? `V_f = ${fmt(V_L, 1)} / √3 = ${fmt(V_ph, 2)} V`
            : `V_f = V_L = ${fmt(V_ph, 2)} V`}
        </div>
        <div>
          <span className="text-teal-600 dark:text-teal-400">I_f</span>
          {` = ${fmt(V_ph, 2)} / ${fmt(Z, 2)} = `}
          <span className="text-teal-600 dark:text-teal-400 font-medium">{fmt(I_ph, 3)} A</span>
        </div>
        {!isStar && (
          <div>
            <span className="text-teal-600 dark:text-teal-400">I_L</span>
            {` = √3 · ${fmt(I_ph, 3)} = `}
            <span className="text-teal-600 dark:text-teal-400 font-medium">{fmt(I_L, 3)} A</span>
          </div>
        )}
        <div>
          <span className="text-green-600 dark:text-green-400">P</span>
          {` = ${fmt(P, 2)} W   `}
          <span className="text-orange-500 dark:text-orange-400">Qr</span>
          {` = ${fmt(Qr, 2)} VAR   `}
          <span className="text-blue-600 dark:text-blue-400">S</span>
          {` = ${fmt(S, 2)} VA`}
        </div>
        <div>{`fp = cos(${fmt(phi, 1)}°) = ${fmt(fp, 3)}`}</div>
        {hasL && hasC && Number.isFinite(fr) && (
          <div>{`fr = ${fmt(fr, 1)} Hz   Q = ${fmt(Q, 3)}`}</div>
        )}
      </div>
    </div>
  )
}
