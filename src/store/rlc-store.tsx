'use client'
import { createContext, useContext, useReducer, useMemo } from 'react'
import { calc } from '@/lib/rlc-engine'
import type { RLCParams, RLCResult, CircuitType, ActiveTab, ComponentFlags, Lang } from '@/lib/types'

const DEFAULT_PARAMS: RLCParams  = { Vs: 10, R: 100, L: 50, C: 100, f: 50 }
const DEFAULT_FLAGS: ComponentFlags = { hasL: true, hasC: true }

interface State {
  params:      RLCParams
  circuitType: CircuitType
  activeTab:   ActiveTab
  results:     RLCResult
  flags:       ComponentFlags
  lang:        Lang
}

type Action =
  | { type: 'SET_PARAM'; key: keyof RLCParams; value: number }
  | { type: 'SET_TYPE';  circuitType: CircuitType }
  | { type: 'SET_TAB';   activeTab: ActiveTab }
  | { type: 'SET_FLAGS'; flags: Partial<ComponentFlags> }
  | { type: 'SET_LANG';  lang: Lang }

function reducer(state: State, action: Action): State {
  switch (action.type) {
    case 'SET_PARAM': {
      const params = { ...state.params, [action.key]: action.value }
      return { ...state, params, results: calc(state.circuitType, params, state.flags) }
    }
    case 'SET_TYPE': {
      const circuitType = action.circuitType
      return { ...state, circuitType, results: calc(circuitType, state.params, state.flags) }
    }
    case 'SET_TAB':
      return { ...state, activeTab: action.activeTab }
    case 'SET_FLAGS': {
      const flags = { ...state.flags, ...action.flags }
      return { ...state, flags, results: calc(state.circuitType, state.params, flags) }
    }
    case 'SET_LANG':
      return { ...state, lang: action.lang }
  }
}

const RLCContext = createContext<{ state: State; dispatch: React.Dispatch<Action> } | null>(null)

export function RLCProvider({ children }: { children: React.ReactNode }) {
  const [state, dispatch] = useReducer(reducer, {
    params:      DEFAULT_PARAMS,
    circuitType: 'serie',
    activeTab:   'bode',
    results:     calc('serie', DEFAULT_PARAMS, DEFAULT_FLAGS),
    flags:       DEFAULT_FLAGS,
    lang:        'es',
  })
  const value = useMemo(() => ({ state, dispatch }), [state])
  return <RLCContext.Provider value={value}>{children}</RLCContext.Provider>
}

export function useRLC() {
  const ctx = useContext(RLCContext)
  if (!ctx) throw new Error('useRLC must be used inside RLCProvider')
  return ctx
}
