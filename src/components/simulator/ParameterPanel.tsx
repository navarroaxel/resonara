'use client'
import { useRLC } from '@/store/rlc-store'
import { t, type TKey } from '@/lib/i18n'
import type { RLCParams } from '@/lib/types'
import { useState } from 'react'

interface ParamConfig {
  key:      keyof RLCParams
  labelKey: TKey
  unit:     string
  min:      number
  max:      number
  step:     number
}

const PARAMS: ParamConfig[] = [
  { key: 'Vs', labelKey: 'labelVs', unit: 'V',  min: 1, max: 500,  step: 1 },
  { key: 'R',  labelKey: 'labelR',  unit: 'Ω',  min: 1, max: 1000, step: 1 },
  { key: 'L',  labelKey: 'labelL',  unit: 'mH', min: 1, max: 500,  step: 1 },
  { key: 'C',  labelKey: 'labelC',  unit: 'µF', min: 1, max: 1000, step: 1 },
  { key: 'f',  labelKey: 'labelF',  unit: 'Hz', min: 1, max: 2000, step: 1 },
]

interface ParamRowProps {
  config:   ParamConfig
  value:    number
  enabled:  boolean
  lang:     string
  dispatch: (action: { type: 'SET_PARAM'; key: keyof RLCParams; value: number } | { type: 'SET_FLAGS'; flags: object }) => void
  isL:      boolean
  isC:      boolean
}

function ParamRow({ config, value, enabled, lang, dispatch, isL, isC }: ParamRowProps) {
  const { key, labelKey, unit, min, max, step } = config
  const hasToggle = isL || isC

  const [inputText, setInputText] = useState(String(value))
  const [focused,   setFocused]   = useState(false)

  // When not focused the number input mirrors the store value directly,
  // so no effect is needed to keep inputText in sync.

  function commitInput(text: string) {
    const v = Number(text)
    const clamped = isNaN(v) ? value : Math.min(max, Math.max(min, v))
    dispatch({ type: 'SET_PARAM', key, value: clamped })
    setInputText(String(clamped))
  }

  return (
    <div className={!enabled ? 'opacity-50' : ''}>
      <div className="flex justify-between items-center mb-1.5">
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
                {t(lang as 'es' | 'en', isL ? 'enableL' : 'enableC')}
              </span>
            </label>
          )}
          <span className="text-sm text-neutral-500 dark:text-neutral-400">
            {t(lang as 'es' | 'en', labelKey)}
          </span>
        </div>

        <div className="flex items-center gap-1">
          <input
            type="number"
            min={min}
            max={max}
            step={step}
            value={focused ? inputText : String(value)}
            disabled={!enabled}
            onFocus={() => { setFocused(true); setInputText(String(value)) }}
            onBlur={() => {
              setFocused(false)
              commitInput(inputText)
            }}
            onKeyDown={(e) => {
              if (e.key === 'Enter') (e.target as HTMLInputElement).blur()
            }}
            onChange={(e) => {
              setInputText(e.target.value)
              const v = Number(e.target.value)
              if (e.target.value !== '' && !isNaN(v) && v >= min && v <= max) {
                dispatch({ type: 'SET_PARAM', key, value: v })
              }
            }}
            className="w-16 text-right text-sm font-medium tabular-nums
              bg-transparent border border-neutral-300 dark:border-neutral-600
              rounded px-1.5 py-0.5 text-neutral-900 dark:text-neutral-100
              focus:outline-none focus:border-blue-500
              disabled:cursor-not-allowed
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
}

export function ParameterPanel() {
  const { state, dispatch } = useRLC()
  const { lang, flags } = state

  return (
    <div>
      <h2 className="text-xs font-medium text-neutral-400 uppercase tracking-wider mb-4">
        {t(lang, 'paramsTitle')}
      </h2>
      <div className="space-y-5">
        {PARAMS.map((config) => {
          const { key } = config
          const isL     = key === 'L'
          const isC     = key === 'C'
          const enabled = isL ? flags.hasL : isC ? flags.hasC : true

          return (
            <ParamRow
              key={key}
              config={config}
              value={state.params[key]}
              enabled={enabled}
              lang={lang}
              dispatch={dispatch as ParamRowProps['dispatch']}
              isL={isL}
              isC={isC}
            />
          )
        })}
      </div>
    </div>
  )
}
