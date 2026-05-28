'use client'
import { createContext, useContext, useReducer, useMemo, useEffect } from 'react'
import { calcMagnetic } from '@/lib/magnetic-engine'
import { readLang, writeLang } from '@/lib/lang-storage'
import type { MagneticParams, MagneticResult, MagneticActiveTab, Lang } from '@/lib/types'

const DEFAULT_PARAMS: MagneticParams = { Vs: 220, f: 50, R1: 10, L1: 200, R2: 100, L2: 200, k: 0.8 }

interface State {
  params:    MagneticParams
  activeTab: MagneticActiveTab
  results:   MagneticResult
  lang:      Lang
}

type Action =
  | { type: 'SET_PARAM'; key: keyof MagneticParams; value: number }
  | { type: 'SET_TAB';   activeTab: MagneticActiveTab }
  | { type: 'SET_LANG';  lang: Lang }

function reducer(state: State, action: Action): State {
  switch (action.type) {
    case 'SET_PARAM': {
      const params  = { ...state.params, [action.key]: action.value }
      const results = calcMagnetic(params)
      return { ...state, params, results }
    }
    case 'SET_TAB':
      return { ...state, activeTab: action.activeTab }
    case 'SET_LANG':
      writeLang(action.lang)
      return { ...state, lang: action.lang }
  }
}

const MagneticContext = createContext<{ state: State; dispatch: React.Dispatch<Action> } | null>(null)

export function MagneticProvider({ children }: { children: React.ReactNode }) {
  const [state, dispatch] = useReducer(reducer, {
    params:    DEFAULT_PARAMS,
    activeTab: 'phasor',
    results:   calcMagnetic(DEFAULT_PARAMS),
    lang:      'es',
  })

  useEffect(() => {
    const saved = readLang()
    if (saved !== state.lang) dispatch({ type: 'SET_LANG', lang: saved })
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  const value = useMemo(() => ({ state, dispatch }), [state])
  return <MagneticContext.Provider value={value}>{children}</MagneticContext.Provider>
}

export function useMagnetic() {
  const ctx = useContext(MagneticContext)
  if (!ctx) throw new Error('useMagnetic must be used inside MagneticProvider')
  return ctx
}
