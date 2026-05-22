'use client'
import { useRLC } from '@/store/rlc-store'
import { t, type TKey } from '@/lib/i18n'
import type { RLCParams } from '@/lib/types'

interface ParamConfig {
  key:      keyof RLCParams
  labelKey: TKey
  unit:     string
  min:      number
  max:      number
  step:     number
}

const PARAMS: ParamConfig[] = [
  { key: 'Vs', labelKey: 'labelVs', unit: 'V',  min: 1, max: 120,  step: 1 },
  { key: 'R',  labelKey: 'labelR',  unit: 'Ω',  min: 1, max: 1000, step: 1 },
  { key: 'L',  labelKey: 'labelL',  unit: 'mH', min: 1, max: 500,  step: 1 },
  { key: 'C',  labelKey: 'labelC',  unit: 'µF', min: 1, max: 1000, step: 1 },
  { key: 'f',  labelKey: 'labelF',  unit: 'Hz', min: 1, max: 2000, step: 1 },
]

export function ParameterPanel() {
  const { state, dispatch } = useRLC()
  const { lang, flags } = state

  return (
    <div>
      <h2 className="text-xs font-medium text-neutral-400 uppercase tracking-wider mb-4">
        {t(lang, 'paramsTitle')}
      </h2>
      <div className="space-y-5">
        {PARAMS.map(({ key, labelKey, unit, min, max, step }) => {
          const isL      = key === 'L'
          const isC      = key === 'C'
          const hasToggle = isL || isC
          const enabled  = isL ? flags.hasL : isC ? flags.hasC : true

          return (
            <div key={key} className={!enabled ? 'opacity-50' : ''}>
              <div className="flex justify-between mb-1.5">
                <div className="flex items-center gap-2">
                  {hasToggle && (
                    <label className="flex items-center gap-1.5 cursor-pointer">
                      <input
                        type="checkbox"
                        checked={enabled}
                        onChange={(e) =>
                          dispatch({
                            type:  'SET_FLAGS',
                            flags: isL ? { hasL: e.target.checked } : { hasC: e.target.checked },
                          })
                        }
                        className="w-3.5 h-3.5 rounded accent-blue-500 cursor-pointer"
                      />
                      <span className="text-xs text-neutral-400 dark:text-neutral-500">
                        {t(lang, isL ? 'enableL' : 'enableC')}
                      </span>
                    </label>
                  )}
                  {!hasToggle && (
                    <span className="text-sm text-neutral-500 dark:text-neutral-400">
                      {t(lang, labelKey)}
                    </span>
                  )}
                  {hasToggle && (
                    <span className="text-sm text-neutral-500 dark:text-neutral-400">
                      {t(lang, labelKey)}
                    </span>
                  )}
                </div>
                <span className="text-sm font-medium tabular-nums text-neutral-900 dark:text-neutral-100">
                  {state.params[key]} {unit}
                </span>
              </div>
              <input
                type="range"
                min={min}
                max={max}
                step={step}
                value={state.params[key]}
                disabled={!enabled}
                onChange={(e) =>
                  dispatch({ type: 'SET_PARAM', key, value: Number(e.target.value) })
                }
                className="w-full h-1.5 rounded-full appearance-none cursor-pointer
                  bg-neutral-200 dark:bg-neutral-700 accent-blue-500
                  disabled:cursor-not-allowed"
              />
            </div>
          )
        })}
      </div>
    </div>
  )
}
