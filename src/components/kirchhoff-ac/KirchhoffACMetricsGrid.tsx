'use client'
import { useKirchhoffAC } from '@/store/kirchhoff-ac-store'
import { useUI } from '@/store/ui-store'
import { t } from '@/lib/i18n'
import { fmt } from '@/lib/utils'
import type { ComplexDisplay } from '@/lib/types'

function MetricCard({ label, value, unit, color, sub }: {
  label: string; value: string; unit?: string; color?: string; sub?: string
}) {
  return (
    <div className="bg-neutral-50 dark:bg-neutral-800/60 rounded-lg p-3 text-center">
      <p className="text-xs text-neutral-500 dark:text-neutral-400 mb-1">{label}</p>
      <p className={`text-lg font-medium tabular-nums ${color ?? 'text-neutral-900 dark:text-neutral-100'}`}>
        {value}
        {unit && <span className="text-xs text-neutral-400 ml-1">{unit}</span>}
      </p>
      {sub && <p className="text-xs text-neutral-400 dark:text-neutral-500 mt-0.5">{sub}</p>}
    </div>
  )
}

function phasorLabel(cd: ComplexDisplay): string {
  if (!Number.isFinite(cd.mag)) return '—'
  return `${fmt(cd.mag, 3)} ∠${fmt(cd.ang, 1)}°`
}

export function KirchhoffACMetricsGrid() {
  const { state: { results, flags } } = useKirchhoffAC()
  const { state: { lang } } = useUI()
  const { I1, I2, I3, Zm_re, Zm_im, Zc_mag, P, Q, S, fp, P_m, Q_m, S_m, eta_m, P_R, P_R1 } = results

  return (
    <div className="space-y-2">
      <div className="grid grid-cols-3 gap-2">
        <MetricCard
          label={t(lang, 'kacMeshI1')}
          value={phasorLabel(I1)}
          unit="A"
          color="text-violet-600 dark:text-violet-400"
        />
        <MetricCard
          label={t(lang, 'kacMeshI2')}
          value={phasorLabel(I2)}
          unit="A"
          color="text-teal-600 dark:text-teal-400"
        />
        <MetricCard
          label={t(lang, 'kacMeshI3')}
          value={phasorLabel(I3)}
          unit="A"
          color="text-orange-600 dark:text-orange-400"
        />
      </div>
      <div className="grid grid-cols-3 gap-2">
        <MetricCard
          label={t(lang, 'kacPowerFactor')}
          value={fmt(fp, 4)}
          color={fp >= 0.95 ? 'text-green-600 dark:text-green-400' : 'text-amber-600 dark:text-amber-400'}
        />
        <MetricCard label={t(lang, 'kacZm')} value={`${fmt(Zm_re, 2)} + j${fmt(Zm_im, 2)}`} unit="Ω" />
        <MetricCard
          label={t(lang, 'kacZc')}
          value={flags.mesh3 ? fmt(Zc_mag, 2) : '—'}
          unit={flags.mesh3 ? 'Ω' : undefined}
        />
      </div>
      <div className="grid grid-cols-3 gap-2">
        <MetricCard label={t(lang, 'kacActivePower')}   value={fmt(P, 2)} unit="W"   color="text-green-600 dark:text-green-400" />
        <MetricCard label={t(lang, 'kacReactivePower')} value={fmt(Q, 2)} unit="VAR" color="text-orange-600 dark:text-orange-400" />
        <MetricCard label={t(lang, 'kacApparentPower')} value={fmt(S, 2)} unit="VA"  />
      </div>

      {/* Motor power row */}
      <div className="grid grid-cols-3 gap-2">
        <MetricCard label={t(lang, 'kacMotorActivePower')}   value={fmt(P_m, 2)} unit="W"   color="text-green-600 dark:text-green-400" />
        <MetricCard label={t(lang, 'kacMotorReactivePower')} value={fmt(Q_m, 2)} unit="VAR" color="text-orange-600 dark:text-orange-400" />
        <MetricCard label={t(lang, 'kacMotorApparentPower')} value={fmt(S_m, 2)} unit="VA"  />
      </div>

      {/* Resistance power + motor efficiency */}
      <div className="grid grid-cols-3 gap-2">
        <MetricCard label={t(lang, 'kacLoadPower')}      value={fmt(P_R,   2)} unit="W" color="text-green-600 dark:text-green-400" />
        <MetricCard label={t(lang, 'kacLinePower')}      value={fmt(P_R1,  2)} unit="W" />
        <MetricCard label={t(lang, 'kacMotorEfficiency')} value={fmt(eta_m * 100, 2)} unit="%" color={eta_m >= 0.9 ? 'text-green-600 dark:text-green-400' : 'text-amber-600 dark:text-amber-400'} />
      </div>
    </div>
  )
}
