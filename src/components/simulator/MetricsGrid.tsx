'use client'
import { useRLC } from '@/store/rlc-store'
import { t } from '@/lib/i18n'
import { fmt } from '@/lib/utils'

function MetricCard({ label, value, unit, color }: {
  label: string; value: string; unit?: string; color?: string
}) {
  return (
    <div className="bg-neutral-50 dark:bg-neutral-800/60 rounded-lg p-3 text-center">
      <p className="text-xs text-neutral-500 dark:text-neutral-400 mb-1">{label}</p>
      <p className={`text-lg font-medium tabular-nums ${color ?? 'text-neutral-900 dark:text-neutral-100'}`}>
        {value}
        {unit && <span className="text-xs text-neutral-400 ml-1">{unit}</span>}
      </p>
    </div>
  )
}

export function MetricsGrid() {
  const { state: { results, lang } } = useRLC()
  const { Z, phi, I, XL, XC, fr, Q, P, Qp, S, fp } = results

  return (
    <div className="grid grid-cols-3 gap-2">
      <MetricCard label={t(lang, 'phaseAngle')}    value={fmt(phi, 1)} unit="°"   color="text-violet-600 dark:text-violet-400" />
      <MetricCard label={t(lang, 'current')}       value={fmt(I, 3)}   unit="A"   color="text-teal-600 dark:text-teal-400"    />
      <MetricCard label={t(lang, 'resFreq')}       value={fmt(fr, 1)}  unit="Hz"  />
      <MetricCard label={t(lang, 'impedance')}     value={fmt(Z)}      unit="Ω"   color="text-blue-600 dark:text-blue-400"    />
      <MetricCard label={t(lang, 'xl')}            value={fmt(XL)}     unit="Ω"   />
      <MetricCard label={t(lang, 'xc')}            value={fmt(XC)}     unit="Ω"   />
      <MetricCard label={t(lang, 'activePower')}   value={fmt(P)}      unit="W"   color="text-green-600 dark:text-green-400"  />
      <MetricCard label={t(lang, 'reactivePower')} value={fmt(Qp)}     unit="VAR" color="text-orange-500 dark:text-orange-400" />
      <MetricCard label={t(lang, 'apparentPower')} value={fmt(S)}      unit="VA"  color="text-blue-600 dark:text-blue-400"    />
      <MetricCard label={t(lang, 'qFactor')}       value={fmt(Q)}                 />
      <MetricCard label={t(lang, 'powerFactor')}   value={fmt(fp, 3)}             />
    </div>
  )
}
