'use client'
import { useRLC } from '@/store/rlc-store'
import { t } from '@/lib/i18n'
import { cn } from '@/lib/utils'
import type { CircuitType } from '@/lib/types'

const OPTIONS: { value: CircuitType; labelKey: 'serieName' | 'paraleloName' }[] = [
  { value: 'serie',    labelKey: 'serieName'    },
  { value: 'paralelo', labelKey: 'paraleloName' },
]

export function CircuitTypeToggle() {
  const { state, dispatch } = useRLC()

  return (
    <div className="flex gap-2 mb-4">
      {OPTIONS.map(({ value, labelKey }) => (
        <button
          key={value}
          onClick={() => dispatch({ type: 'SET_TYPE', circuitType: value })}
          className={cn(
            'flex-1 py-2 px-4 rounded-lg border text-sm font-medium transition-colors',
            state.circuitType === value
              ? 'bg-neutral-100 dark:bg-neutral-800 border-neutral-300 dark:border-neutral-600 text-neutral-900 dark:text-neutral-100'
              : 'border-neutral-200 dark:border-neutral-700 text-neutral-500 dark:text-neutral-400 hover:bg-neutral-50 dark:hover:bg-neutral-800/50'
          )}
        >
          {t(state.lang, labelKey)}
        </button>
      ))}
    </div>
  )
}
