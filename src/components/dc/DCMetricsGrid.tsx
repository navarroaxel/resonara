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
  const { state: { results, params, lang } } = useDC()
  const { I1, I2, IR2, VR1, VR2, VR3, IR1, IR3 } = results
  const { R1, R2, R3 } = params
  // Power = I²R — always non-negative, no sign ambiguity
  const PR1 = IR1 * IR1 * R1
  const PR2 = IR2 * IR2 * R2
  const PR3 = IR3 * IR3 * R3

  return (
    <div className="grid grid-cols-3 gap-2">
      <MetricCard label={t(lang, 'dcMeshCurrent1')}    value={fmt(I1, 4)}  unit="A"  color="text-violet-600 dark:text-violet-400" />
      <MetricCard label={t(lang, 'dcMeshCurrent2')}    value={fmt(I2, 4)}  unit="A"  color="text-teal-600 dark:text-teal-400"    />
      <MetricCard label={t(lang, 'dcBranchCurrentR2')} value={fmt(IR2, 4)} unit="A"  color="text-blue-600 dark:text-blue-400"    />
      <MetricCard label={t(lang, 'dcVoltageR1')}       value={fmt(VR1, 3)} unit="V"  />
      <MetricCard label={t(lang, 'dcVoltageR2')}       value={fmt(VR2, 3)} unit="V"  />
      <MetricCard label={t(lang, 'dcVoltageR3')}       value={fmt(VR3, 3)} unit="V"  />
      <MetricCard label={t(lang, 'dcPowerR1')}         value={fmt(PR1, 3)} unit="W"  color="text-green-600 dark:text-green-400"  />
      <MetricCard label={t(lang, 'dcPowerR2')}         value={fmt(PR2, 3)} unit="W"  color="text-green-600 dark:text-green-400"  />
      <MetricCard label={t(lang, 'dcPowerR3')}         value={fmt(PR3, 3)} unit="W"  color="text-green-600 dark:text-green-400"  />
    </div>
  )
}
