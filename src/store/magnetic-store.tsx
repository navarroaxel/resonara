'use client'
import { createContext, useContext, useReducer, useMemo } from 'react'
import { calcMagnetic } from '@/lib/magnetic-engine'
import type { MagneticParams, MagneticResult, MagneticActiveTab } from '@/lib/types'

const DEFAULT_PARAMS: MagneticParams = { Vs: 220, f: 50, R1: 10, L1: 200, R2: 100, L2: 200, k: 0.8 }

interface State {
  params:    MagneticParams
  activeTab: MagneticActiveTab
  results:   MagneticResult
}

type Action =
  | { type: 'SET_PARAM'; key: keyof MagneticParams; value: number }
  | { type: 'SET_TAB';   activeTab: MagneticActiveTab }

function reducer(state: State, action: Action): State {
  switch (action.type) {
    case 'SET_PARAM': {
      const params  = { ...state.params, [action.key]: action.value }
      const results = calcMagnetic(params)
      return { ...state, params, results }
    }
    case 'SET_TAB':
      return { ...state, activeTab: action.activeTab }
  }
}

const MagneticContext = createContext<{ state: State; dispatch: React.Dispatch<Action> } | null>(null)

export function MagneticProvider({ children }: { children: React.ReactNode }) {
  const [state, dispatch] = useReducer(reducer, {
    params:    DEFAULT_PARAMS,
    activeTab: 'phasor',
    results:   calcMagnetic(DEFAULT_PARAMS),
  })

  const value = useMemo(() => ({ state, dispatch }), [state])
  return <MagneticContext.Provider value={value}>{children}</MagneticContext.Provider>
}

export function useMagnetic() {
  const ctx = useContext(MagneticContext)
  if (!ctx) throw new Error('useMagnetic must be used inside MagneticProvider')
  return ctx
}
