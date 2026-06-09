'use client'
import { useEffect, useLayoutEffect, useRef, useState } from 'react'
import { useUI } from '@/store/ui-store'
import { t } from '@/lib/i18n'
import type { ResistorSymbol, UnitNotation, Lang } from '@/lib/types'

const useIsomorphicLayoutEffect =
  typeof window !== 'undefined' ? useLayoutEffect : useEffect

type ThemeMode = 'auto' | 'light' | 'dark'

function readTheme(): ThemeMode {
  if (typeof window === 'undefined') return 'auto'
  const v = window.localStorage.getItem('theme')
  return v === 'light' || v === 'dark' ? v : 'auto'
}

function applyTheme(mode: ThemeMode) {
  if (typeof window === 'undefined') return
  const systemDark = window.matchMedia('(prefers-color-scheme: dark)').matches
  document.documentElement.classList.toggle('dark', mode === 'dark' || (mode === 'auto' && systemDark))
  if (mode === 'auto') window.localStorage.removeItem('theme')
  else window.localStorage.setItem('theme', mode)
}

const THEME_ORDER: ThemeMode[] = ['auto', 'light', 'dark']
const THEME_ICONS: Record<ThemeMode, string> = { auto: '◑', light: '☀️', dark: '🌙' }

const segBtn = (active: boolean) =>
  `px-2.5 py-1 text-xs font-medium transition-colors ${
    active
      ? 'bg-zinc-800 text-white dark:bg-zinc-200 dark:text-zinc-900'
      : 'bg-white text-zinc-600 hover:bg-zinc-50 dark:bg-zinc-900 dark:text-zinc-400 dark:hover:bg-zinc-800'
  }`

export function SettingsPanel() {
  const [open, setOpen] = useState(false)
  const [themeMode, setThemeMode] = useState<ThemeMode>('auto')
  const [themeMounted, setThemeMounted] = useState(false)
  const panelRef = useRef<HTMLDivElement>(null)
  const { state, dispatch } = useUI()
  const { lang, resistorSymbol, unitNotation } = state

  useIsomorphicLayoutEffect(() => {
    const stored = readTheme()
    setThemeMode(stored)
    applyTheme(stored)
    setThemeMounted(true)
  }, [])

  useEffect(() => {
    if (themeMode !== 'auto') return
    const mq = window.matchMedia('(prefers-color-scheme: dark)')
    const handler = () => applyTheme('auto')
    mq.addEventListener('change', handler)
    return () => mq.removeEventListener('change', handler)
  }, [themeMode])

  useEffect(() => {
    if (!open) return
    function handleOutside(e: MouseEvent) {
      if (panelRef.current && !panelRef.current.contains(e.target as Node)) setOpen(false)
    }
    document.addEventListener('mousedown', handleOutside)
    return () => document.removeEventListener('mousedown', handleOutside)
  }, [open])

  const currentTheme = themeMounted ? themeMode : 'auto'

  return (
    <div ref={panelRef} className="relative">
      <button
        type="button"
        onClick={() => setOpen(v => !v)}
        aria-label={t(lang, 'settingsAriaOpen')}
        title={t(lang, 'settingsAriaOpen')}
        className="inline-flex items-center gap-1.5 rounded-md border border-zinc-300 bg-white px-2.5 py-1 text-xs font-medium text-zinc-700 transition-colors hover:bg-zinc-50 dark:border-zinc-700 dark:bg-zinc-900 dark:text-zinc-200 dark:hover:bg-zinc-800"
      >
        <span>⚙</span>
        <span>{t(lang, 'settingsLabel')}</span>
      </button>

      {open && (
        <div className="absolute right-0 top-full mt-1 z-50 w-60 rounded-lg border border-zinc-200 bg-white shadow-lg dark:border-zinc-700 dark:bg-zinc-900 p-3 space-y-3">
          <div>
            <p className="text-[10px] font-semibold uppercase tracking-wider text-zinc-400 dark:text-zinc-500 mb-2">
              {t(lang, 'settingsDisplaySection')}
            </p>

            <div className="flex items-center justify-between mb-2">
              <span className="text-xs text-zinc-600 dark:text-zinc-300">{t(lang, 'resistorSymbolLabel')}</span>
              <div className="flex rounded-md overflow-hidden border border-zinc-300 dark:border-zinc-700">
                {(['eu', 'usa'] as ResistorSymbol[]).map(v => (
                  <button key={v} type="button"
                    onClick={() => dispatch({ type: 'SET_RESISTOR_SYMBOL', resistorSymbol: v })}
                    className={segBtn(resistorSymbol === v)}
                  >
                    {t(lang, v === 'eu' ? 'resistorSymbolEU' : 'resistorSymbolUSA')}
                  </button>
                ))}
              </div>
            </div>

            <div className="flex items-center justify-between">
              <span className="flex items-center gap-1 text-xs text-zinc-600 dark:text-zinc-300">
                {t(lang, 'unitNotationLabel')}
                <span
                  title={t(lang, 'unitNotationTooltip')}
                  className="inline-flex items-center justify-center w-3.5 h-3.5 rounded-full border border-zinc-400 dark:border-zinc-500 text-zinc-400 dark:text-zinc-500 text-[9px] leading-none cursor-help select-none"
                >i</span>
              </span>
              <div className="flex rounded-md overflow-hidden border border-zinc-300 dark:border-zinc-700">
                {(['raw', 'si'] as UnitNotation[]).map(v => (
                  <button key={v} type="button"
                    onClick={() => dispatch({ type: 'SET_UNIT_NOTATION', unitNotation: v })}
                    className={segBtn(unitNotation === v)}
                  >
                    {t(lang, v === 'raw' ? 'unitNotationRaw' : 'unitNotationSI')}
                  </button>
                ))}
              </div>
            </div>
          </div>

          <div className="border-t border-zinc-200 dark:border-zinc-700 pt-3">
            <p className="text-[10px] font-semibold uppercase tracking-wider text-zinc-400 dark:text-zinc-500 mb-2">
              {t(lang, 'settingsInterfaceSection')}
            </p>

            <div className="flex items-center justify-between mb-2">
              <span className="text-xs text-zinc-600 dark:text-zinc-300">{t(lang, 'settingsLangLabel')}</span>
              <div className="flex rounded-md overflow-hidden border border-zinc-300 dark:border-zinc-700">
                {(['es', 'en'] as Lang[]).map(v => (
                  <button key={v} type="button"
                    onClick={() => dispatch({ type: 'SET_LANG', lang: v })}
                    className={`${segBtn(lang === v)} font-mono`}
                  >
                    {v.toUpperCase()}
                  </button>
                ))}
              </div>
            </div>

            <div className="flex items-center justify-between">
              <span className="text-xs text-zinc-600 dark:text-zinc-300">{t(lang, 'themeLabel')}</span>
              <div className="flex rounded-md overflow-hidden border border-zinc-300 dark:border-zinc-700">
                {THEME_ORDER.map(v => (
                  <button key={v} type="button"
                    onClick={() => { setThemeMode(v); applyTheme(v) }}
                    title={`${t(lang, 'themeLabel')} ${v}`}
                    suppressHydrationWarning
                    className={segBtn(currentTheme === v)}
                  >
                    {THEME_ICONS[v]}
                  </button>
                ))}
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
