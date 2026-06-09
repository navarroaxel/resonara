'use client'
import { createContext, useContext, useReducer, useMemo } from 'react'
import { calcRCDC } from '@/lib/rc-dc-engine'
import type { RCDCParams, RCDCResult } from '@/lib/types'

const DEFAULT_PARAMS: RCDCParams = { Vs: 10, R: 1000, C: 100 }

interface State {
  params:  RCDCParams
  results: RCDCResult
}

type Action =
  | { type: 'SET_PARAM'; key: keyof RCDCParams; value: number }

function reducer(state: State, action: Action): State {
  switch (action.type) {
    case 'SET_PARAM': {
      const params  = { ...state.params, [action.key]: action.value }
      const results = calcRCDC(params)
      return { ...state, params, results }
    }
  }
}

const RCDCContext = createContext<{ state: State; dispatch: React.Dispatch<Action> } | null>(null)

export function RCDCProvider({ children }: { children: React.ReactNode }) {
  const [state, dispatch] = useReducer(reducer, {
    params:  DEFAULT_PARAMS,
    results: calcRCDC(DEFAULT_PARAMS),
  })

  const value = useMemo(() => ({ state, dispatch }), [state])
  return <RCDCContext.Provider value={value}>{children}</RCDCContext.Provider>
}

export function useRCDC() {
  const ctx = useContext(RCDCContext)
  if (!ctx) throw new Error('useRCDC must be used inside RCDCProvider')
  return ctx
}
