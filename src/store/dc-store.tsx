'use client'
import { createContext, useContext, useReducer, useMemo } from 'react'
import { calcDC } from '@/lib/dc-engine'
import type { DCParams, DCFlags, DCResult } from '@/lib/types'

const DEFAULT_PARAMS: DCParams = { V1: 12, V2: 0, V3: 6, R1: 100, R2: 200, R3: 150, R4: 180, R5: 120 }
const DEFAULT_FLAGS: DCFlags  = {
  mesh3: true,
  V1: true, V2: true, V3: true,
  polarityV1: true, polarityV2: true, polarityV3: true,
  R1: true, R2: true, R3: true, R4: true, R5: true,
}

function applyFlags(params: DCParams, flags: DCFlags): DCParams {
  return {
    ...params,
    V1: flags.V1 ? params.V1 * (flags.polarityV1 ? 1 : -1) : 0,
    V2: flags.V2 ? params.V2 * (flags.polarityV2 ? 1 : -1) : 0,  // Mesh 2 top-rail source
    V3: flags.V3 ? params.V3 * (flags.polarityV3 ? 1 : -1) : 0,  // Mesh 3 right source
    R1: flags.R1 ? params.R1 : 0,
    R2: flags.R2 ? params.R2 : 0,
    R3: flags.R3 ? params.R3 : 0,
    R4: flags.R4 ? params.R4 : 0,
    R5: flags.R5 ? params.R5 : 0,
  }
}

interface State {
  params:  DCParams
  flags:   DCFlags
  results: DCResult
}

type Action =
  | { type: 'SET_PARAM'; key: keyof DCParams; value: number }
  | { type: 'SET_FLAG';  key: keyof DCFlags;  value: boolean }

function reducer(state: State, action: Action): State {
  switch (action.type) {
    case 'SET_PARAM': {
      const params  = { ...state.params, [action.key]: action.value }
      const results = calcDC(applyFlags(params, state.flags), state.flags.mesh3)
      return { ...state, params, results }
    }
    case 'SET_FLAG': {
      const flags   = { ...state.flags, [action.key]: action.value }
      const results = calcDC(applyFlags(state.params, flags), flags.mesh3)
      return { ...state, flags, results }
    }
  }
}

const DCContext = createContext<{ state: State; dispatch: React.Dispatch<Action> } | null>(null)

export function DCProvider({ children }: { children: React.ReactNode }) {
  const [state, dispatch] = useReducer(reducer, {
    params:  DEFAULT_PARAMS,
    flags:   DEFAULT_FLAGS,
    results: calcDC(applyFlags(DEFAULT_PARAMS, DEFAULT_FLAGS), DEFAULT_FLAGS.mesh3),
  })

  const value = useMemo(() => ({ state, dispatch }), [state])
  return <DCContext.Provider value={value}>{children}</DCContext.Provider>
}

export function useDC() {
  const ctx = useContext(DCContext)
  if (!ctx) throw new Error('useDC must be used inside DCProvider')
  return ctx
}
