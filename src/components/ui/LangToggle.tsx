'use client'
import { useRLC } from '@/store/rlc-store'
import { t } from '@/lib/i18n'

export function LangToggle() {
  const { state, dispatch } = useRLC()
  return (
    <button
      onClick={() => dispatch({ type: 'SET_LANG', lang: state.lang === 'es' ? 'en' : 'es' })}
      aria-label="Switch language"
      className="px-2.5 py-1 text-xs rounded-md border border-neutral-200 dark:border-neutral-700
                 text-neutral-600 dark:text-neutral-400 hover:bg-neutral-50 dark:hover:bg-neutral-800
                 transition-colors font-mono font-medium"
    >
      {t(state.lang, 'switchLang')}
    </button>
  )
}
