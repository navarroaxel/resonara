'use client'
import { createContext, useContext, useReducer, useMemo, useEffect } from 'react'
import { readLang, writeLang } from '@/lib/lang-storage'
import type { Lang } from '@/lib/types'

interface UIState {
  lang: Lang
}

type UIAction = { type: 'SET_LANG'; lang: Lang }

function reducer(state: UIState, action: UIAction): UIState {
  switch (action.type) {
    case 'SET_LANG':
      writeLang(action.lang)
      return { ...state, lang: action.lang }
  }
}

const UIContext = createContext<{ state: UIState; dispatch: React.Dispatch<UIAction> } | null>(null)

export function UIProvider({ children }: { children: React.ReactNode }) {
  const [state, dispatch] = useReducer(reducer, { lang: 'es' })

  useEffect(() => {
    const saved = readLang()
    if (saved !== state.lang) dispatch({ type: 'SET_LANG', lang: saved })
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
