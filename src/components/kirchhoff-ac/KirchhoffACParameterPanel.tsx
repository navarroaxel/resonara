'use client'
import { useState } from 'react'
import { useKirchhoffAC } from '@/store/kirchhoff-ac-store'
import { useUI } from '@/store/ui-store'
import { t } from '@/lib/i18n'
import { fmt } from '@/lib/utils'
import type { KirchhoffACParams } from '@/lib/types'

interface ParamConfig {
  key:      keyof KirchhoffACParams
  labelKey: 'labelVs' | 'labelF' | 'kacLabelR1' | 'kacLabelR' | 'kacLabelRm' | 'kacLabelLm' | 'kacLabelC'
  unit:     string
  min:      number
  max:      number
  step:     number
}

const SOURCE_PARAMS: ParamConfig[] = [
  { key: 'Vs', labelKey: 'labelVs',   unit: 'V',  min: 1,    max: 500,  step: 1    },
  { key: 'f',  labelKey: 'labelF',    unit: 'Hz', min: 1,    max: 500,  step: 1    },
  { key: 'R1', labelKey: 'kacLabelR1', unit: 'Ω', min: 0,    max: 200,  step: 0.1  },
]

const LOAD_PARAMS: ParamConfig[] = [
  { key: 'R',  labelKey: 'kacLabelR',  unit: 'Ω',  min: 1,    max: 1000, step: 1    },
  { key: 'Rm', labelKey: 'kacLabelRm', unit: 'Ω',  min: 1,    max: 500,  step: 1    },
  { key: 'Lm', labelKey: 'kacLabelLm', unit: 'mH', min: 1,    max: 2000, step: 1    },
]

const PFC_PARAMS: ParamConfig[] = [
  { key: 'C',  labelKey: 'kacLabelC',  unit: 'µF', min: 0.1,  max: 5000, step: 0.1  },
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
  dispatch: (a: { type: 'SET_PARAM'; key: keyof KirchhoffACParams; value: number }) => void
}) {
  const { key, labelKey, unit, min, max, step } = config
  const [inputText, setInputText] = useState(String(value))
  const [focused, setFocused]     = useState(false)

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
            className="w-16 text-right text-sm font-medium tabular-nums
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

export function KirchhoffACParameterPanel() {
  const { state, dispatch } = useKirchhoffAC()
  const { state: { lang } } = useUI()
  const { flags, results } = state

  return (
    <div>
      <h2 className="text-xs font-medium text-neutral-400 uppercase tracking-wider mb-4">
        {t(lang, 'kacParamsTitle')}
      </h2>
      <div className="space-y-5">

        {/* Source / Line */}
        <div className="pb-1 border-b border-neutral-200 dark:border-neutral-700">
          <span className="text-xs font-medium text-neutral-400 uppercase tracking-wider">
            {t(lang, 'kacSourceSection')}
          </span>
        </div>
        {SOURCE_PARAMS.map((config) => (
          <ParamRow
            key={config.key}
            config={config}
            value={state.params[config.key]}
            lang={lang}
            dispatch={dispatch}
          />
        ))}

        {/* Loads */}
        <div className="pb-1 border-b border-neutral-200 dark:border-neutral-700">
          <span className="text-xs font-medium text-neutral-400 uppercase tracking-wider">
            {t(lang, 'kacLoadSection')}
          </span>
        </div>
        {LOAD_PARAMS.map((config) => (
          <ParamRow
            key={config.key}
            config={config}
            value={state.params[config.key]}
            lang={lang}
            dispatch={dispatch}
          />
        ))}

        {/* PFC — Mesh 3 */}
        <div className="pt-2 border-neutral-200 dark:border-neutral-700">
          <div className="flex items-center gap-2 pb-1 border-b border-neutral-200 dark:border-neutral-700 mb-4">
            <span className="text-xs font-medium text-neutral-400 uppercase tracking-wider">
              {t(lang, 'kacPFCSection')}
            </span>
            <button
              onClick={() => dispatch({ type: 'SET_FLAG', key: 'mesh3', value: !flags.mesh3 })}
              className={`w-8 h-4 rounded-full transition-colors flex-shrink-0 ${
                flags.mesh3 ? 'bg-blue-500' : 'bg-neutral-300 dark:bg-neutral-600'
              }`}
              aria-label={`${t(lang, flags.mesh3 ? 'toggleDisable' : 'toggleEnable')} ${t(lang, 'kacPFCSection')}`}
            >
              <span className={`block w-3 h-3 rounded-full bg-white shadow transition-transform mx-0.5 ${
                flags.mesh3 ? 'translate-x-4' : 'translate-x-0'
              }`} />
            </button>
          </div>

          {/* C_req callout — always visible */}
          <div className="mb-4 rounded-lg bg-amber-50 dark:bg-amber-950/30 border border-amber-200 dark:border-amber-800 px-3 py-2">
            <p className="text-xs text-amber-700 dark:text-amber-400 mb-0.5">
              {t(lang, 'kacCReq')}
            </p>
            <div className="flex items-center justify-between gap-2">
              <p className="text-lg font-semibold tabular-nums text-amber-800 dark:text-amber-300">
                {fmt(results.C_req, 2)}
                <span className="text-xs font-normal ml-1">µF</span>
              </p>
              <button
                disabled={!isFinite(results.C_req)}
                onClick={() => {
                  const clamped = Math.min(5000, Math.max(0.1, Math.round(results.C_req * 100) / 100))
                  dispatch({ type: 'SET_PARAM', key: 'C', value: clamped })
                  if (!flags.mesh3) dispatch({ type: 'SET_FLAG', key: 'mesh3', value: true })
                }}
                className="text-xs px-2 py-1 rounded bg-amber-500 hover:bg-amber-600 disabled:opacity-40 disabled:cursor-not-allowed text-white font-medium transition-colors"
              >
                {t(lang, 'kacApplyCReq')}
              </button>
            </div>
            <p className="text-xs text-amber-600 dark:text-amber-500 mt-0.5">
              {t(lang, 'kacCReqNote')}
              {Number.isFinite(results.fp_0) && (
                <span className="ml-2 tabular-nums">· {t(lang, 'kacFp0')}: <strong>{fmt(results.fp_0, 4)}</strong></span>
              )}
            </p>
          </div>

          <div className="space-y-5">
            {PFC_PARAMS.map((config) => (
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

      </div>
    </div>
  )
}
