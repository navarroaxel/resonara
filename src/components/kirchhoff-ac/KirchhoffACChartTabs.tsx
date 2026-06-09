'use client'
import { useKirchhoffAC } from '@/store/kirchhoff-ac-store'
import { useUI } from '@/store/ui-store'
import { t } from '@/lib/i18n'
import { cn } from '@/lib/utils'
import { KirchhoffACPhasorDiagram }    from './KirchhoffACPhasorDiagram'
import { KirchhoffACTimeDomain }       from './KirchhoffACTimeDomain'
import { KirchhoffACWaveformEquations } from './KirchhoffACWaveformEquations'
import { KirchhoffACPowerTriangle }    from './KirchhoffACPowerTriangle'
import { KirchhoffACPowerEquations }   from './KirchhoffACPowerEquations'
import { KirchhoffACKVLCard }          from './KirchhoffACKVLCard'
import { KirchhoffACPFCCurve }         from './KirchhoffACPFCCurve'
import type { KirchhoffACActiveTab } from '@/lib/types'

const TABS: { value: KirchhoffACActiveTab; labelKey: 'kacPhasorTab' | 'kacTimeDomainTab' | 'kacPowerTab' | 'kacKVLTab' | 'kacPFCCurveTab' }[] = [
  { value: 'phasor',    labelKey: 'kacPhasorTab'     },
  { value: 'time',      labelKey: 'kacTimeDomainTab' },
  { value: 'power',     labelKey: 'kacPowerTab'      },
  { value: 'kvl',       labelKey: 'kacKVLTab'        },
  { value: 'pfcCurve',  labelKey: 'kacPFCCurveTab'   },
]

export function KirchhoffACChartTabs() {
  const { state: { activeTab }, dispatch } = useKirchhoffAC()
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
      {activeTab === 'phasor'   && <KirchhoffACPhasorDiagram />}
      {activeTab === 'time'     && <><KirchhoffACWaveformEquations /><KirchhoffACTimeDomain /></>}
      {activeTab === 'power'    && <><KirchhoffACPowerEquations /><KirchhoffACPowerTriangle /></>}
      {activeTab === 'kvl'      && <KirchhoffACKVLCard />}
      {activeTab === 'pfcCurve' && <KirchhoffACPFCCurve />}
    </div>
  )
}
