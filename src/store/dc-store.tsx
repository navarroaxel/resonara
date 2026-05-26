'use client'
import { createContext, useContext, useReducer, useMemo, useEffect } from 'react'
import { calcDC } from '@/lib/dc-engine'
import { readLang, writeLang } from '@/lib/lang-storage'
import type { DCParams, DCResult, Lang } from '@/lib/types'

const DEFAULT_PARAMS: DCParams = { V1: 12, V2: 6, R1: 100, R2: 200, R3: 150 }

interface State {
  params:  DCParams
  results: DCResult
  lang:    Lang
}

type Action =
  | { type: 'SET_PARAM'; key: keyof DCParams; value: number }
  | { type: 'SET_LANG';  lang: Lang }

function reducer(state: State, action: Action): State {
  switch (action.type) {
    case 'SET_PARAM': {
      const params  = { ...state.params, [action.key]: action.value }
      const results = calcDC(params)
      return { ...state, params, results }
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
    results: calcDC(DEFAULT_PARAMS),
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
