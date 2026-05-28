'use client'
import { createContext, useContext, useReducer, useMemo, useEffect } from 'react'
import { calcThreePhase } from '@/lib/three-phase-engine'
import { readLang, writeLang } from '@/lib/lang-storage'
import type {
  ThreePhaseParams, ThreePhaseResult,
  ConnectionType, ThreePhaseActiveTab,
  ComponentFlags, Lang,
} from '@/lib/types'

const DEFAULT_PARAMS: ThreePhaseParams = { VL: 380, R: 100, L: 50, C: 100, f: 50 }
const DEFAULT_FLAGS:  ComponentFlags   = { hasL: true, hasC: true }
const DEFAULT_CONNECTION: ConnectionType = 'star'

interface State {
  params:     ThreePhaseParams
  connection: ConnectionType
  flags:      ComponentFlags
  activeTab:  ThreePhaseActiveTab
  results:    ThreePhaseResult
  lang:       Lang
}

type Action =
  | { type: 'SET_PARAM';      key: keyof ThreePhaseParams; value: number }
  | { type: 'SET_CONNECTION'; connection: ConnectionType }
  | { type: 'SET_FLAGS';      flags: Partial<ComponentFlags> }
  | { type: 'SET_TAB';        activeTab: ThreePhaseActiveTab }
  | { type: 'SET_LANG';       lang: Lang }

function reducer(state: State, action: Action): State {
  switch (action.type) {
    case 'SET_PARAM': {
      const params  = { ...state.params, [action.key]: action.value }
      const results = calcThreePhase(state.connection, params, state.flags)
      return { ...state, params, results }
    }
    case 'SET_CONNECTION': {
      const results = calcThreePhase(action.connection, state.params, state.flags)
      return { ...state, connection: action.connection, results }
    }
    case 'SET_FLAGS': {
      const flags   = { ...state.flags, ...action.flags }
      const results = calcThreePhase(state.connection, state.params, flags)
      return { ...state, flags, results }
    }
    case 'SET_TAB':
      return { ...state, activeTab: action.activeTab }
    case 'SET_LANG':
      writeLang(action.lang)
      return { ...state, lang: action.lang }
  }
}

const ThreePhaseContext = createContext<{ state: State; dispatch: React.Dispatch<Action> } | null>(null)

export function ThreePhaseProvider({ children }: { children: React.ReactNode }) {
  const [state, dispatch] = useReducer(reducer, {
    params:     DEFAULT_PARAMS,
    connection: DEFAULT_CONNECTION,
    flags:      DEFAULT_FLAGS,
    activeTab:  'phasor',
    results:    calcThreePhase(DEFAULT_CONNECTION, DEFAULT_PARAMS, DEFAULT_FLAGS),
    lang:       'es',
  })

  useEffect(() => {
    const saved = readLang()
    if (saved !== state.lang) dispatch({ type: 'SET_LANG', lang: saved })
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  const value = useMemo(() => ({ state, dispatch }), [state])
  return <ThreePhaseContext.Provider value={value}>{children}</ThreePhaseContext.Provider>
}

export function useThreePhase() {
  const ctx = useContext(ThreePhaseContext)
  if (!ctx) throw new Error('useThreePhase must be used inside ThreePhaseProvider')
  return ctx
}
