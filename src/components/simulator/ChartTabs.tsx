'use client'
import { useRLC } from '@/store/rlc-store'
import { t } from '@/lib/i18n'
import { cn } from '@/lib/utils'
import { BodeChart }          from '@/components/charts/BodeChart'
import { PhasorDiagram }      from '@/components/charts/PhasorDiagram'
import { TimeDomainChart }    from '@/components/charts/TimeDomainChart'
import { PowerChart }         from '@/components/charts/PowerChart'
import { HarmonicSpectrum }   from '@/components/charts/HarmonicSpectrum'
import { WaveformEquations }  from '@/components/simulator/WaveformEquations'
import type { ActiveTab }     from '@/lib/types'

const BASE_TABS: { value: ActiveTab; labelKey: 'freqResponseTab' | 'phasorTab' | 'timeDomainTab' | 'powerTab' | 'spectrumTab' }[] = [
  { value: 'phasor', labelKey: 'phasorTab'        },
  { value: 'time',   labelKey: 'timeDomainTab'    },
  { value: 'power',  labelKey: 'powerTab'         },
  { value: 'bode',   labelKey: 'freqResponseTab' },
]

export function ChartTabs() {
  const { state: { activeTab, lang, polyMode }, dispatch } = useRLC()

  const tabs = polyMode
    ? [...BASE_TABS, { value: 'spectrum' as ActiveTab, labelKey: 'spectrumTab' as const }]
    : BASE_TABS

  return (
    <div>
      <div className="flex gap-1 mb-4 border-b border-neutral-200 dark:border-neutral-700">
        {tabs.map(({ value, labelKey }) => (
          <button
            key={value}
            onClick={() => dispatch({ type: 'SET_TAB', activeTab: value })}
            className={cn(
              'px-3 py-2 text-xs font-medium border-b-2 -mb-px transition-colors',
              activeTab === value
                ? 'border-blue-500 text-blue-600 dark:text-blue-400'
                : 'border-transparent text-neutral-500 dark:text-neutral-400 hover:text-neutral-700 dark:hover:text-neutral-300',
            )}
          >
            {t(lang, labelKey)}
          </button>
        ))}
      </div>
      {activeTab === 'bode'     && <BodeChart />}
      {activeTab === 'phasor'   && <PhasorDiagram />}
      {activeTab === 'time'     && (
        <>
          {!polyMode && <WaveformEquations />}
          <TimeDomainChart />
        </>
      )}
      {activeTab === 'power'    && <PowerChart />}
      {activeTab === 'spectrum' && <HarmonicSpectrum />}
    </div>
  )
}
