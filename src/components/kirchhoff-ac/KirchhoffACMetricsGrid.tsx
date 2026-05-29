'use client'
import { useKirchhoffAC } from '@/store/kirchhoff-ac-store'
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
  const { state: { results, flags, lang } } = useKirchhoffAC()
  const { I1, I2, I3, Zm_mag, Zc_mag, P, Q, S, fp, C_req, P_m, Q_m, S_m } = results

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
        <MetricCard label={t(lang, 'kacZm')} value={fmt(Zm_mag, 2)} unit="Ω" />
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

      {/* C_req highlight row */}
      <div className="rounded-lg bg-amber-50 dark:bg-amber-950/30 border border-amber-200 dark:border-amber-800 px-4 py-2 flex items-center justify-between">
        <span className="text-xs text-amber-700 dark:text-amber-400">
          {t(lang, 'kacCReq')}
        </span>
        <span className="text-base font-semibold tabular-nums text-amber-800 dark:text-amber-300">
          {fmt(C_req, 2)} <span className="text-xs font-normal">µF</span>
        </span>
      </div>
    </div>
  )
}
