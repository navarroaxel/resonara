'use client'
import { useState } from 'react'
import { useRCDC } from '@/store/rc-dc-store'
import { useUI } from '@/store/ui-store'
import { t, type TKey } from '@/lib/i18n'
import type { RCDCParams } from '@/lib/types'

interface ParamConfig {
  key:     keyof RCDCParams
  labelKey: TKey
  unit:    string
  min:     number
  max:     number
  step:    number
}

const PARAMS: ParamConfig[] = [
  { key: 'Vs', labelKey: 'rcDcLabelVs', unit: 'V',  min: 1,   max: 100,    step: 0.5  },
  { key: 'R',  labelKey: 'rcDcLabelR',  unit: 'Ω',  min: 1,   max: 1000,   step: 1    },
  { key: 'C',  labelKey: 'rcDcLabelC',  unit: 'µF', min: 1,   max: 10000,  step: 1    },
]

function ParamRow({
  config,
  value,
  lang,
  dispatch,
}: {
  config:   ParamConfig
  value:    number
  lang:     'es' | 'en'
  dispatch: (a: { type: 'SET_PARAM'; key: keyof RCDCParams; value: number }) => void
}) {
  const { key, labelKey, unit, min, max, step } = config
  const [inputText, setInputText] = useState(String(value))
  const [focused,   setFocused]   = useState(false)

  function commitInput(text: string) {
    const v = Number(text)
    const clamped = isNaN(v) ? value : Math.min(max, Math.max(min, v))
    dispatch({ type: 'SET_PARAM', key, value: clamped })
    setInputText(String(clamped))
  }

  return (
    <div>
      <div className="flex justify-between items-center mb-1.5">
        <span className="text-sm text-neutral-500 dark:text-neutral-400">
          {t(lang, labelKey)}
        </span>
        <div className="flex items-center gap-1">
          <input
            type="number"
            min={min}
            max={max}
            step={step}
            value={focused ? inputText : String(value)}
            onFocus={() => { setFocused(true); setInputText(String(value)) }}
            onBlur={() => { setFocused(false); commitInput(inputText) }}
            onKeyDown={(e) => { if (e.key === 'Enter') (e.target as HTMLInputElement).blur() }}
            onChange={(e) => {
              setInputText(e.target.value)
              const v = Number(e.target.value)
              if (e.target.value !== '' && !isNaN(v) && v >= min && v <= max) {
                dispatch({ type: 'SET_PARAM', key, value: v })
              }
            }}
            className="w-20 text-right text-sm font-medium tabular-nums
              bg-transparent border border-neutral-300 dark:border-neutral-600
              rounded px-1.5 py-0.5 text-neutral-900 dark:text-neutral-100
              focus:outline-none focus:border-blue-500
              [appearance:textfield] [&::-webkit-outer-spin-button]:appearance-none [&::-webkit-inner-spin-button]:appearance-none"
          />
          <span className="text-xs text-neutral-400 dark:text-neutral-500 w-6">{unit}</span>
        </div>
      </div>
      <input
        type="range"
        min={min}
        max={max}
        step={step}
        value={value}
        onChange={(e) => dispatch({ type: 'SET_PARAM', key, value: Number(e.target.value) })}
        className="w-full h-1.5 rounded-full appearance-none cursor-pointer
          bg-neutral-200 dark:bg-neutral-700 accent-blue-500"
      />
    </div>
  )
}

export function RCDCParameterPanel() {
  const { state, dispatch } = useRCDC()
  const { state: { lang } } = useUI()
  const {} = state

  return (
    <div>
      <h2 className="text-xs font-medium text-neutral-400 uppercase tracking-wider mb-4">
        {t(lang, 'rcDcParamsTitle')}
      </h2>
      <div className="space-y-5">
        {PARAMS.map((config) => (
          <ParamRow
            key={config.key}
            config={config}
            value={state.params[config.key]}
            lang={lang}
            dispatch={dispatch}
          />
        ))}
      </div>
    </div>
  )
}
