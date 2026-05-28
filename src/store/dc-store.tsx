'use client'
import { createContext, useContext, useReducer, useMemo, useEffect } from 'react'
import { calcDC } from '@/lib/dc-engine'
import { readLang, writeLang } from '@/lib/lang-storage'
import type { DCParams, DCFlags, DCResult, Lang } from '@/lib/types'

const DEFAULT_PARAMS: DCParams = { V1: 12, V2: 6, V3: 0, R1: 100, R2: 200, R3: 150, R4: 180, R5: 120 }
const DEFAULT_FLAGS: DCFlags  = { mesh3: true, V1: true, V2: true, V3: true, R1: true, R2: true, R3: true, R4: true, R5: true }

function applyFlags(params: DCParams, flags: DCFlags): DCParams {
  return {
    ...params,
    V1: flags.V1 ? params.V1 : 0,
    V2: flags.V2 ? params.V2 : 0,
    V3: flags.V3 ? params.V3 : 0,
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
  lang:    Lang
}

type Action =
  | { type: 'SET_PARAM'; key: keyof DCParams; value: number }
  | { type: 'SET_FLAG';  key: keyof DCFlags;  value: boolean }
  | { type: 'SET_LANG';  lang: Lang }

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
    case 'SET_LANG':
      writeLang(action.lang)
      return { ...state, lang: action.lang }
  }
}

const DCContext = createContext<{ state: State; dispatch: React.Dispatch<Action> } | null>(null)

export function DCProvider({ children }: { children: React.ReactNode }) {
  const [state, dispatch] = useReducer(reducer, {
    params:  DEFAULT_PARAMS,
    flags:   DEFAULT_FLAGS,
    results: calcDC(applyFlags(DEFAULT_PARAMS, DEFAULT_FLAGS), DEFAULT_FLAGS.mesh3),
    lang:    'es',
  })

  useEffect(() => {
    const saved = readLang()
    if (saved !== state.lang) dispatch({ type: 'SET_LANG', lang: saved })
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  const value = useMemo(() => ({ state, dispatch }), [state])
  return <DCContext.Provider value={value}>{children}</DCContext.Provider>
}

export function useDC() {
  const ctx = useContext(DCContext)
  if (!ctx) throw new Error('useDC must be used inside DCProvider')
  return ctx
}
