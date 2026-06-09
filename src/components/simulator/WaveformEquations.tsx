'use client'
import { useRLC } from '@/store/rlc-store'
import { useUI } from '@/store/ui-store'
import { t } from '@/lib/i18n'
import { fmt } from '@/lib/utils'

export function WaveformEquations() {
  const { state: { params, results, circuitType } } = useRLC()
  const { state: { lang } } = useUI()
  const { Vs, R, f } = params
  const { I, phi } = results

  const omega    = 2 * Math.PI * f
  const Vpeak    = Vs * Math.SQRT2
  const Ipeak    = I  * Math.SQRT2
  const VRpeak   = I * R * Math.SQRT2
  const phiRad   = (phi * Math.PI) / 180
  const absPhiRad = Math.abs(phiRad)
  const phiSign  = phiRad >= 0 ? ' − ' : ' + '
  const phiStr   = absPhiRad < 0.001 ? '' : `${phiSign}${fmt(absPhiRad, 3)}`

  return (
    <div className="mb-3 p-3 bg-neutral-50 dark:bg-neutral-800/50 rounded-lg">
      <p className="text-xs font-medium text-neutral-400 uppercase tracking-wider mb-2">
        {t(lang, 'waveformEqsTitle')}
      </p>
      <div className="font-mono text-sm space-y-1.5">
        <div className="flex items-baseline gap-1.5 flex-wrap">
          <span className="text-blue-500 font-semibold">u(t)</span>
          <span className="text-neutral-400">=</span>
          <span className="text-neutral-700 dark:text-neutral-300">
            {fmt(Vpeak, 2)} · sin({fmt(omega, 1)}·t)
          </span>
          <span className="text-neutral-400 text-xs">V</span>
        </div>
        <div className="flex items-baseline gap-1.5 flex-wrap">
          <span className="text-teal-500 font-semibold">i(t)</span>
          <span className="text-neutral-400">=</span>
          <span className="text-neutral-700 dark:text-neutral-300">
            {fmt(Ipeak, 3)} · sin({fmt(omega, 1)}·t{phiStr})
          </span>
          <span className="text-neutral-400 text-xs">A</span>
        </div>
        {circuitType === 'series' && (
          <div className="flex items-baseline gap-1.5 flex-wrap">
            <span className="text-orange-500 font-semibold">v&#8336;(t)</span>
            <span className="text-neutral-400">=</span>
            <span className="text-neutral-700 dark:text-neutral-300">
              {fmt(VRpeak, 2)} · sin({fmt(omega, 1)}·t{phiStr})
            </span>
            <span className="text-neutral-400 text-xs">V</span>
          </div>
        )}
      </div>
    </div>
  )
}
