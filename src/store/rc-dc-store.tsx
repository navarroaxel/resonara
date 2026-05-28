'use client'
import { createContext, useContext, useReducer, useMemo, useEffect } from 'react'
import { calcRCDC } from '@/lib/rc-dc-engine'
import { readLang, writeLang } from '@/lib/lang-storage'
import type { RCDCParams, RCDCResult, Lang } from '@/lib/types'

const DEFAULT_PARAMS: RCDCParams = { Vs: 10, R: 1000, C: 100 }

interface State {
  params:  RCDCParams
  results: RCDCResult
  lang:    Lang
}

type Action =
  | { type: 'SET_PARAM'; key: keyof RCDCParams; value: number }
  | { type: 'SET_LANG';  lang: Lang }

function reducer(state: State, action: Action): State {
  switch (action.type) {
    case 'SET_PARAM': {
      const params  = { ...state.params, [action.key]: action.value }
      const results = calcRCDC(params)
      return { ...state, params, results }
    }
    case 'SET_LANG':
      writeLang(action.lang)
      return { ...state, lang: action.lang }
  }
}

const RCDCContext = createContext<{ state: State; dispatch: React.Dispatch<Action> } | null>(null)

export function RCDCProvider({ children }: { children: React.ReactNode }) {
  const [state, dispatch] = useReducer(reducer, {
    params:  DEFAULT_PARAMS,
    results: calcRCDC(DEFAULT_PARAMS),
    lang:    'es',
  })

  useEffect(() => {
    const saved = readLang()
    if (saved !== state.lang) dispatch({ type: 'SET_LANG', lang: saved })
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  const value = useMemo(() => ({ state, dispatch }), [state])
  return <RCDCContext.Provider value={value}>{children}</RCDCContext.Provider>
}

export function useRCDC() {
  const ctx = useContext(RCDCContext)
  if (!ctx) throw new Error('useRCDC must be used inside RCDCProvider')
  return ctx
}
