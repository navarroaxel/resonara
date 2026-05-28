'use client'
import { useDC } from '@/store/dc-store'
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

export function DCMetricsGrid() {
  const { state: { results, params, flags, lang } } = useDC()
  const { I1, I2, I3, IR2, IR3, IR4, VR1, VR2, VR3, IR1, IR5 } = results
  const { R1, R3, R5 } = params
  const { mesh3, V1: enV1, V2: enV2, V3: enV3, polarityV1, polarityV2, polarityV3 } = flags

  const PR1 = IR1 * IR1 * R1
  const PR3 = IR3 * IR3 * R3
  const PR4 = IR4 * IR4 * R5
  const PR5 = IR5 * IR5 * R5

  // Effective voltages (after enable + polarity flags) — same as applyFlags in store
  const V1eff = enV1 ? params.V1 * (polarityV1 ? 1 : -1) : 0
  const V2eff = enV2 ? params.V2 * (polarityV2 ? 1 : -1) : 0
  const V3eff = enV3 ? params.V3 * (polarityV3 ? 1 : -1) : 0

  // Power delivered by each source (positive = delivering, negative = absorbing)
  const PV1 = V1eff * I1
  const PV2 = V2eff * I2
  const PV3 = V3eff * I3

  return (
    <div className="grid grid-cols-3 gap-2">
      <MetricCard label={t(lang, 'dcMeshCurrent1')}    value={fmt(I1, 4)}  unit="A"  color="text-violet-600 dark:text-violet-400" />
      <MetricCard label={t(lang, 'dcMeshCurrent2')}    value={fmt(I2, 4)}  unit="A"  color="text-teal-600 dark:text-teal-400"    />
      {mesh3
        ? <MetricCard label={t(lang, 'dcMeshCurrent3')}    value={fmt(I3, 4)}  unit="A"  color="text-orange-600 dark:text-orange-400" />
        : <MetricCard label={t(lang, 'dcVoltageR1')}       value={fmt(VR1, 3)} unit="V"  />
      }
      <MetricCard label={t(lang, 'dcBranchCurrentR2')} value={fmt(IR2, 4)} unit="A"  color="text-blue-600 dark:text-blue-400"    />
      {mesh3
        ? <MetricCard label={t(lang, 'dcBranchCurrentR4')} value={fmt(IR4, 4)} unit="A"  color="text-blue-600 dark:text-blue-400" />
        : <MetricCard label={t(lang, 'dcVoltageR2')}       value={fmt(VR2, 3)} unit="V"  />
      }
      <MetricCard label={t(lang, 'dcVoltageR3')}       value={fmt(VR3, 3)} unit="V"  />
      <MetricCard label={t(lang, 'dcPowerV1')} value={fmt(PV1, 3)} unit="W" color="text-violet-600 dark:text-violet-400" />
      <MetricCard label={t(lang, 'dcPowerV2')} value={fmt(PV2, 3)} unit="W" color="text-teal-600 dark:text-teal-400"    />
      {mesh3
          ? <MetricCard label={t(lang, 'dcPowerV3')} value={fmt(PV3, 3)} unit="W" color="text-orange-600 dark:text-orange-400" />
          : <MetricCard label={t(lang, 'dcNodeVoltageA')} value={fmt(results.VA, 3)} unit="V" />
      }
      <MetricCard label={t(lang, 'dcPowerR1')}         value={fmt(PR1, 3)} unit="W"  color="text-green-600 dark:text-green-400"  />
      <MetricCard label={t(lang, 'dcPowerR3')}         value={fmt(PR3, 3)} unit="W"  color="text-green-600 dark:text-green-400"  />
      {mesh3
        ? <MetricCard label={t(lang, 'dcPowerR5')}         value={fmt(PR5, 3)} unit="W"  color="text-green-600 dark:text-green-400" />
        : <MetricCard label={t(lang, 'dcPowerR4')}         value={fmt(PR4, 3)} unit="W"  color="text-green-600 dark:text-green-400" />
      }
    </div>
  )
}
