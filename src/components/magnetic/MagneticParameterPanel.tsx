'use client'
import { useState } from 'react'
import { useMagnetic } from '@/store/magnetic-store'
import { t, type TKey } from '@/lib/i18n'
import type { MagneticParams } from '@/lib/types'

interface ParamConfig {
  key:      keyof MagneticParams
  labelKey: TKey
  unit:     string
  min:      number
  max:      number
  step:     number
}

const PARAMS: ParamConfig[] = [
  { key: 'Vs', labelKey: 'magLabelVs', unit: 'V',  min: 1,    max: 500,  step: 1    },
  { key: 'f',  labelKey: 'magLabelF',  unit: 'Hz', min: 1,    max: 1000, step: 1    },
  { key: 'R1', labelKey: 'magLabelR1', unit: 'Ω',  min: 0.1,  max: 1000, step: 0.1  },
  { key: 'L1', labelKey: 'magLabelL1', unit: 'mH', min: 1,    max: 2000, step: 1    },
  { key: 'R2', labelKey: 'magLabelR2', unit: 'Ω',  min: 0.1,  max: 1000, step: 0.1  },
  { key: 'L2', labelKey: 'magLabelL2', unit: 'mH', min: 1,    max: 2000, step: 1    },
  { key: 'k',  labelKey: 'magLabelK',  unit: '',   min: 0,    max: 1,    step: 0.01 },
]

interface ParamRowProps {
  config:   ParamConfig
  value:    number
  lang:     string
  onChange: (key: keyof MagneticParams, value: number) => void
}

function ParamRow({ config, value, lang, onChange }: ParamRowProps) {
  const { key, labelKey, unit, min, max, step } = config
  const [inputText, setInputText] = useState(String(value))
  const [focused,   setFocused]   = useState(false)

  function commit(text: string) {
    const v = Number(text)
    const clamped = isNaN(v) ? value : Math.min(max, Math.max(min, v))
    onChange(key, clamped)
    setInputText(String(clamped))
  }

  return (
    <div>
      <div className="flex justify-between items-center mb-1.5">
        <span className="text-sm text-neutral-500 dark:text-neutral-400">
          {t(lang as 'es' | 'en', labelKey)}
        </span>
        <div className="flex items-center gap-1">
          <input
            type="number"
            min={min}
            max={max}
            step={step}
            value={focused ? inputText : String(value)}
            onFocus={() => { setFocused(true); setInputText(String(value)) }}
            onBlur={() => { setFocused(false); commit(inputText) }}
            onKeyDown={(e) => { if (e.key === 'Enter') (e.target as HTMLInputElement).blur() }}
            onChange={(e) => {
              setInputText(e.target.value)
              const v = Number(e.target.value)
              if (e.target.value !== '' && !isNaN(v) && v >= min && v <= max) {
                onChange(key, v)
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
        onChange={(e) => onChange(key, Number(e.target.value))}
        className="w-full h-1.5 rounded-full appearance-none cursor-pointer
          bg-neutral-200 dark:bg-neutral-700 accent-blue-500"
      />
    </div>
  )
}

export function MagneticParameterPanel() {
  const { state, dispatch } = useMagnetic()
  const { lang, params } = state

  function handleChange(key: keyof MagneticParams, value: number) {
    dispatch({ type: 'SET_PARAM', key, value })
  }

  return (
    <div>
      <h2 className="text-xs font-medium text-neutral-400 uppercase tracking-wider mb-4">
        {t(lang, 'magParamsTitle')}
      </h2>
      <div className="space-y-5">
        {PARAMS.map((config) => (
          <ParamRow
            key={config.key}
            config={config}
            value={params[config.key]}
            lang={lang}
            onChange={handleChange}
          />
        ))}
      </div>
    </div>
  )
}
