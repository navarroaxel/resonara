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
  const { I1, I2, I3, IR2, IR3, IR4, VR1, VR3, VR5, IR1, IR5 } = results
  const { R1, R3, R5 } = params
  const { mesh3 } = flags
  const PR1 = IR1 * IR1 * R1
  const PR3 = IR3 * IR3 * R3
  const PR5 = IR5 * IR5 * R5

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
        : <MetricCard label={t(lang, 'dcVoltageR3')}       value={fmt(VR3, 3)} unit="V"  />
      }
      <MetricCard label={t(lang, 'dcVoltageR3')}       value={fmt(VR3, 3)} unit="V"  />
      <MetricCard label={t(lang, 'dcPowerR1')}         value={fmt(PR1, 3)} unit="W"  color="text-green-600 dark:text-green-400"  />
      <MetricCard label={t(lang, 'dcPowerR3')}         value={fmt(PR3, 3)} unit="W"  color="text-green-600 dark:text-green-400"  />
      {mesh3
        ? <MetricCard label={t(lang, 'dcPowerR5')}         value={fmt(PR5, 3)} unit="W"  color="text-green-600 dark:text-green-400" />
        : <MetricCard label={t(lang, 'dcNodeVoltageA')}    value={fmt(results.VA, 3)} unit="V" />
      }
    </div>
  )
}
