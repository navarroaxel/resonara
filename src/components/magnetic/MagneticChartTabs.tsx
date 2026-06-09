'use client'
import { useMagnetic } from '@/store/magnetic-store'
import { useUI } from '@/store/ui-store'
import { t } from '@/lib/i18n'
import { cn } from '@/lib/utils'
import { MagneticPhasorDiagram } from './MagneticPhasorDiagram'
import { MagneticTimeDomain }    from './MagneticTimeDomain'
import { MagneticFreqResponse }  from './MagneticFreqResponse'
import { MagneticPowerChart }    from './MagneticPowerChart'
import type { MagneticActiveTab } from '@/lib/types'

const TABS: { value: MagneticActiveTab; labelKey: 'magPhasorTab' | 'magTimeDomainTab' | 'magFreqResponseTab' | 'magPowerTab' }[] = [
  { value: 'phasor',       labelKey: 'magPhasorTab'       },
  { value: 'time',         labelKey: 'magTimeDomainTab'   },
  { value: 'freqResponse', labelKey: 'magFreqResponseTab' },
  { value: 'power',        labelKey: 'magPowerTab'        },
]

export function MagneticChartTabs() {
  const { state: { activeTab }, dispatch } = useMagnetic()
  const { state: { lang } } = useUI()

  return (
    <div>
      <div className="flex gap-1 mb-4 border-b border-neutral-200 dark:border-neutral-700 overflow-x-auto">
        {TABS.map(({ value, labelKey }) => (
          <button
            key={value}
            onClick={() => dispatch({ type: 'SET_TAB', activeTab: value })}
            className={cn(
              'px-3 py-2 text-xs font-medium border-b-2 -mb-px transition-colors whitespace-nowrap',
              activeTab === value
                ? 'border-blue-500 text-blue-600 dark:text-blue-400'
                : 'border-transparent text-neutral-500 dark:text-neutral-400 hover:text-neutral-700 dark:hover:text-neutral-300',
            )}
          >
            {t(lang, labelKey)}
          </button>
        ))}
      </div>
      {activeTab === 'phasor'       && <MagneticPhasorDiagram />}
      {activeTab === 'time'         && <MagneticTimeDomain />}
      {activeTab === 'freqResponse' && <MagneticFreqResponse />}
      {activeTab === 'power'        && <MagneticPowerChart />}
    </div>
  )
}
