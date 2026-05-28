'use client'
import { createContext, useContext, useReducer, useMemo, useEffect } from 'react'
import { calc } from '@/lib/rlc-engine'
import { calcPolyResult, PRESETS } from '@/lib/poly-engine'
import { readLang, writeLang } from '@/lib/lang-storage'
import type {
  RLCParams, RLCResult, CircuitType, ActiveTab, ComponentFlags, Lang,
  PolyPreset, HarmonicInput, PolyResult,
} from '@/lib/types'

const DEFAULT_PARAMS: RLCParams     = { Vs: 10, R: 100, L: 50, C: 100, f: 50 }
const DEFAULT_FLAGS: ComponentFlags = { hasL: true, hasC: true }

interface State {
  params:      RLCParams
  circuitType: CircuitType
  activeTab:   ActiveTab
  results:     RLCResult
  flags:       ComponentFlags
  lang:        Lang
  polyMode:    boolean
  polyPreset:  PolyPreset
  harmonics:   HarmonicInput[]
  polyResults: PolyResult | null
}

type Action =
  | { type: 'SET_PARAM';       key: keyof RLCParams; value: number }
  | { type: 'SET_TYPE';        circuitType: CircuitType }
  | { type: 'SET_TAB';         activeTab: ActiveTab }
  | { type: 'SET_FLAGS';       flags: Partial<ComponentFlags> }
  | { type: 'SET_LANG';        lang: Lang }
  | { type: 'TOGGLE_POLY_MODE' }
  | { type: 'SET_POLY_PRESET'; preset: PolyPreset }
  | { type: 'SET_HARMONIC';    index: number; harmonic: Partial<HarmonicInput> }
  | { type: 'ADD_HARMONIC' }
  | { type: 'REMOVE_HARMONIC'; index: number }

function recomputePoly(
  polyMode: boolean,
  circuitType: CircuitType,
  params: RLCParams,
  harmonics: HarmonicInput[],
  flags: ComponentFlags,
): PolyResult | null {
  return polyMode ? calcPolyResult(circuitType, params, harmonics, flags) : null
}

function reducer(state: State, action: Action): State {
  switch (action.type) {
    case 'SET_PARAM': {
      const params  = { ...state.params, [action.key]: action.value }
      const results = calc(state.circuitType, params, state.flags)
      const polyResults = recomputePoly(state.polyMode, state.circuitType, params, state.harmonics, state.flags)
      return { ...state, params, results, polyResults }
    }
    case 'SET_TYPE': {
      const { circuitType } = action
      const results = calc(circuitType, state.params, state.flags)
      const polyResults = recomputePoly(state.polyMode, circuitType, state.params, state.harmonics, state.flags)
      return { ...state, circuitType, results, polyResults }
    }
    case 'SET_TAB':
      return { ...state, activeTab: action.activeTab }
    case 'SET_FLAGS': {
      const flags   = { ...state.flags, ...action.flags }
      const results = calc(state.circuitType, state.params, flags)
      const polyResults = recomputePoly(state.polyMode, state.circuitType, state.params, state.harmonics, flags)
      return { ...state, flags, results, polyResults }
    }
    case 'SET_LANG':
      writeLang(action.lang)
      return { ...state, lang: action.lang }

    case 'TOGGLE_POLY_MODE': {
      const polyMode = !state.polyMode
      const polyResults = recomputePoly(polyMode, state.circuitType, state.params, state.harmonics, state.flags)
      const activeTab = !polyMode && state.activeTab === 'spectrum' ? ('phasor' as ActiveTab) : state.activeTab
      return { ...state, polyMode, polyResults, activeTab }
    }
    case 'SET_POLY_PRESET': {
      const { preset } = action
      const harmonics  = preset === 'custom' ? state.harmonics : PRESETS[preset]
      const polyResults = recomputePoly(state.polyMode, state.circuitType, state.params, harmonics, state.flags)
      return { ...state, polyPreset: preset, harmonics, polyResults }
    }
    case 'SET_HARMONIC': {
      const harmonics  = state.harmonics.map((h, i) => i === action.index ? { ...h, ...action.harmonic } : h)
      const polyResults = recomputePoly(state.polyMode, state.circuitType, state.params, harmonics, state.flags)
      return { ...state, harmonics, polyResults }
    }
    case 'ADD_HARMONIC': {
      if (state.harmonics.length >= 10) return state
      const maxN      = Math.max(...state.harmonics.map(h => h.n))
      const harmonics = [...state.harmonics, { n: maxN + 1, An: 0.5, phin: 0 }]
      const polyResults = recomputePoly(state.polyMode, state.circuitType, state.params, harmonics, state.flags)
      return { ...state, harmonics, polyResults }
    }
    case 'REMOVE_HARMONIC': {
      if (state.harmonics.length <= 1) return state
      const harmonics  = state.harmonics.filter((_, i) => i !== action.index)
      const polyResults = recomputePoly(state.polyMode, state.circuitType, state.params, harmonics, state.flags)
      return { ...state, harmonics, polyResults }
    }
  }
}

const DEFAULT_HARMONICS = PRESETS.square

const RLCContext = createContext<{ state: State; dispatch: React.Dispatch<Action> } | null>(null)

export function RLCProvider({ children }: { children: React.ReactNode }) {
  const [state, dispatch] = useReducer(reducer, {
    params:      DEFAULT_PARAMS,
    circuitType: 'series',
    activeTab:   'phasor',
    results:     calc('series', DEFAULT_PARAMS, DEFAULT_FLAGS),
    flags:       DEFAULT_FLAGS,
    lang:        'es',
    polyMode:    false,
    polyPreset:  'square',
    harmonics:   DEFAULT_HARMONICS,
    polyResults: null,
  })

  useEffect(() => {
    const saved = readLang()
    if (saved !== state.lang) dispatch({ type: 'SET_LANG', lang: saved })
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  const value = useMemo(() => ({ state, dispatch }), [state])
  return <RLCContext.Provider value={value}>{children}</RLCContext.Provider>
}

export function useRLC() {
  const ctx = useContext(RLCContext)
  if (!ctx) throw new Error('useRLC must be used inside RLCProvider')
  return ctx
}
