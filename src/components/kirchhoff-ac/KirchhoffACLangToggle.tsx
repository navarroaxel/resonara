'use client'
import { useKirchhoffAC } from '@/store/kirchhoff-ac-store'
import { t } from '@/lib/i18n'

export function KirchhoffACLangToggle() {
  const { state, dispatch } = useKirchhoffAC()
  return (
    <button
      onClick={() => dispatch({ type: 'SET_LANG', lang: state.lang === 'es' ? 'en' : 'es' })}
      aria-label={t(state.lang, 'switchLangAria')}
      className="inline-flex items-center rounded-md border border-zinc-300 bg-white px-2.5 py-1 text-xs font-medium font-mono text-zinc-700 transition-colors hover:bg-zinc-50 dark:border-zinc-700 dark:bg-zinc-900 dark:text-zinc-200 dark:hover:bg-zinc-800"
    >
      {t(state.lang, 'switchLang')}
    </button>
  )
}
