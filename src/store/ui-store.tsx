'use client'
import { createContext, useContext, useReducer, useMemo, useEffect } from 'react'
import { readLang, writeLang } from '@/lib/lang-storage'
import type { Lang, ResistorSymbol, UnitNotation } from '@/lib/types'

interface UIState {
  lang: Lang
  resistorSymbol: ResistorSymbol
  unitNotation: UnitNotation
}

type UIAction =
  | { type: 'SET_LANG'; lang: Lang }
  | { type: 'SET_RESISTOR_SYMBOL'; resistorSymbol: ResistorSymbol }
  | { type: 'SET_UNIT_NOTATION'; unitNotation: UnitNotation }

function reducer(state: UIState, action: UIAction): UIState {
  switch (action.type) {
    case 'SET_LANG':
      writeLang(action.lang)
      return { ...state, lang: action.lang }
    case 'SET_RESISTOR_SYMBOL':
      if (typeof window !== 'undefined') localStorage.setItem('resistorSymbol', action.resistorSymbol)
      return { ...state, resistorSymbol: action.resistorSymbol }
    case 'SET_UNIT_NOTATION':
      if (typeof window !== 'undefined') localStorage.setItem('unitNotation', action.unitNotation)
      return { ...state, unitNotation: action.unitNotation }
  }
}

const UIContext = createContext<{ state: UIState; dispatch: React.Dispatch<UIAction> } | null>(null)

export function UIProvider({ children }: { children: React.ReactNode }) {
  const [state, dispatch] = useReducer(reducer, { lang: 'es', resistorSymbol: 'eu', unitNotation: 'raw' })

  useEffect(() => {
    const savedLang = readLang()
    if (savedLang !== state.lang) dispatch({ type: 'SET_LANG', lang: savedLang })

    const savedSymbol = localStorage.getItem('resistorSymbol')
    if (savedSymbol === 'eu' || savedSymbol === 'usa') dispatch({ type: 'SET_RESISTOR_SYMBOL', resistorSymbol: savedSymbol })

    const savedNotation = localStorage.getItem('unitNotation')
    if (savedNotation === 'raw' || savedNotation === 'si') dispatch({ type: 'SET_UNIT_NOTATION', unitNotation: savedNotation })
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  const value = useMemo(() => ({ state, dispatch }), [state])
  return <UIContext.Provider value={value}>{children}</UIContext.Provider>
}

export function useUI() {
  const ctx = useContext(UIContext)
  if (!ctx) throw new Error('useUI must be used inside UIProvider')
  return ctx
}
