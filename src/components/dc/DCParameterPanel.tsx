'use client'
import { useState } from 'react'
import { useDC } from '@/store/dc-store'
import { t, type TKey } from '@/lib/i18n'
import type { DCParams, DCFlags } from '@/lib/types'
import { BatteryIcon } from './BatteryIcon'

interface ParamConfig {
  key:         keyof DCParams
  labelKey:    TKey
  unit:        string
  min:         number
  max:         number
  step:        number
  flagKey?:    keyof DCFlags
  polarityKey?: keyof DCFlags
}

const MESH1_PARAMS: ParamConfig[] = [
  { key: 'V1', labelKey: 'labelV1', unit: 'V', min: 0.1, max: 100,  step: 0.1, flagKey: 'V1', polarityKey: 'polarityV1' },
  { key: 'R1', labelKey: 'labelR1', unit: 'Ω', min: 1,   max: 1000, step: 1,   flagKey: 'R1' },
  { key: 'R2', labelKey: 'labelR2', unit: 'Ω', min: 1,   max: 1000, step: 1,   flagKey: 'R2' },
]

const MESH2_PARAMS: ParamConfig[] = [
  { key: 'V2', labelKey: 'labelV2', unit: 'V', min: 0,   max: 100,  step: 0.1, flagKey: 'V2', polarityKey: 'polarityV2' },
  { key: 'R3', labelKey: 'labelR3', unit: 'Ω', min: 1,   max: 1000, step: 1,   flagKey: 'R3' },
  { key: 'R4', labelKey: 'labelR4', unit: 'Ω', min: 1,   max: 1000, step: 1,   flagKey: 'R4' },
]

const MESH3_PARAMS: ParamConfig[] = [
  { key: 'V3', labelKey: 'labelV3', unit: 'V', min: 0.1, max: 100,  step: 0.1, flagKey: 'V3', polarityKey: 'polarityV3' },
  { key: 'R5', labelKey: 'labelR5', unit: 'Ω', min: 1,   max: 1000, step: 1,   flagKey: 'R5' },
]

function ParamRow({
  config,
  value,
  enabled,
  polarity,
  lang,
  dispatch,
}: {
  config:   ParamConfig
  value:    number
  enabled:  boolean
  polarity: boolean
  lang:     'es' | 'en'
  dispatch: (a: { type: 'SET_PARAM'; key: keyof DCParams; value: number } | { type: 'SET_FLAG'; key: keyof DCFlags; value: boolean }) => void
}) {
  const { key, labelKey, unit, min, max, step, flagKey, polarityKey } = config
  const [inputText, setInputText] = useState(String(value))
  const [focused,   setFocused]   = useState(false)

  function commitInput(text: string) {
    const v = Number(text)
    const clamped = isNaN(v) ? value : Math.min(max, Math.max(min, v))
    dispatch({ type: 'SET_PARAM', key, value: clamped })
    setInputText(String(clamped))
  }

  return (
    <div className={enabled ? '' : 'opacity-50'}>
      <div className="flex justify-between items-center mb-1.5">
        <div className="flex items-center gap-2">
          {flagKey && (
            <button
              onClick={() => dispatch({ type: 'SET_FLAG', key: flagKey, value: !enabled })}
              className={`w-8 h-4 rounded-full transition-colors flex-shrink-0 ${
                enabled ? 'bg-blue-500' : 'bg-neutral-300 dark:bg-neutral-600'
              }`}
              aria-label={enabled ? 'Disable' : 'Enable'}
            >
              <span className={`block w-3 h-3 rounded-full bg-white shadow transition-transform mx-0.5 ${
                enabled ? 'translate-x-4' : 'translate-x-0'
              }`} />
            </button>
          )}
          {polarityKey && (
            <button
              onClick={() => dispatch({ type: 'SET_FLAG', key: polarityKey, value: !polarity })}
              title="Flip polarity"
              className={`flex items-center justify-center w-12 h-7 rounded border flex-shrink-0 transition-colors ${
                polarity
                  ? 'border-green-500 text-green-600 dark:text-green-400'
                  : 'border-red-500 text-red-600 dark:text-red-400'
              }`}
            >
              <BatteryIcon normal={polarity} />
            </button>
          )}
          <span className="text-sm text-neutral-500 dark:text-neutral-400">
            {t(lang, labelKey)}
          </span>
        </div>
        <div className="flex items-center gap-1">
          <input
            type="number"
            min={min}
            max={max}
            step={step}
            disabled={!enabled}
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
            className="w-16 text-right text-sm font-medium tabular-nums
              bg-transparent border border-neutral-300 dark:border-neutral-600
              rounded px-1.5 py-0.5 text-neutral-900 dark:text-neutral-100
              focus:outline-none focus:border-blue-500 disabled:cursor-not-allowed
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
        disabled={!enabled}
        value={value}
        onChange={(e) => dispatch({ type: 'SET_PARAM', key, value: Number(e.target.value) })}
        className="w-full h-1.5 rounded-full appearance-none cursor-pointer disabled:cursor-not-allowed
          bg-neutral-200 dark:bg-neutral-700 accent-blue-500"
      />
    </div>
  )
}

export function DCParameterPanel() {
  const { state, dispatch } = useDC()
  const { lang, flags } = state

  return (
    <div>
      <h2 className="text-xs font-medium text-neutral-400 uppercase tracking-wider mb-4">
        {t(lang, 'dcParamsTitle')}
      </h2>
      <div className="space-y-5">
        <div className="pb-1 border-b border-neutral-200 dark:border-neutral-700">
          <span className="text-xs font-medium text-neutral-400 uppercase tracking-wider">
            {t(lang, 'meshSection1')}
          </span>
        </div>
        {MESH1_PARAMS.map((config) => (
          <ParamRow
            key={config.key}
            config={config}
            value={state.params[config.key]}
            enabled={config.flagKey ? flags[config.flagKey] : true}
            polarity={config.polarityKey ? flags[config.polarityKey] : true}
            lang={lang}
            dispatch={dispatch}
          />
        ))}

        <div className="pb-1 border-b border-neutral-200 dark:border-neutral-700">
          <span className="text-xs font-medium text-neutral-400 uppercase tracking-wider">
            {t(lang, 'meshSection2')}
          </span>
        </div>
        {MESH2_PARAMS.map((config) => (
          <ParamRow
            key={config.key}
            config={config}
            value={state.params[config.key]}
            enabled={config.flagKey ? flags[config.flagKey] : true}
            polarity={config.polarityKey ? flags[config.polarityKey] : true}
            lang={lang}
            dispatch={dispatch}
          />
        ))}

        {/* Mesh 3 section */}
        <div className="pt-2 border-neutral-200 dark:border-neutral-700">
          <div className="flex items-center gap-2 pb-1 border-b border-neutral-200 dark:border-neutral-700 mb-4">
            <span className="text-xs font-medium text-neutral-400 uppercase tracking-wider">
              {t(lang, 'meshSection3')}
            </span>
            <button
              onClick={() => dispatch({ type: 'SET_FLAG', key: 'mesh3', value: !flags.mesh3 })}
              className={`w-8 h-4 rounded-full transition-colors flex-shrink-0 ${
                flags.mesh3 ? 'bg-blue-500' : 'bg-neutral-300 dark:bg-neutral-600'
              }`}
              aria-label={flags.mesh3 ? 'Disable Mesh 3' : 'Enable Mesh 3'}
            >
              <span className={`block w-3 h-3 rounded-full bg-white shadow transition-transform mx-0.5 ${
                flags.mesh3 ? 'translate-x-4' : 'translate-x-0'
              }`} />
            </button>
          </div>
          {flags.mesh3 && (
            <div className="space-y-5">
              {MESH3_PARAMS.map((config) => (
                <ParamRow
                  key={config.key}
                  config={config}
                  value={state.params[config.key]}
                  enabled={config.flagKey ? flags[config.flagKey] : true}
                  polarity={config.polarityKey ? flags[config.polarityKey] : true}
                  lang={lang}
                  dispatch={dispatch}
                />
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
