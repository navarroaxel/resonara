'use client'
import { useRLC } from '@/store/rlc-store'
import { useUI } from '@/store/ui-store'
import { t, type TKey } from '@/lib/i18n'
import { cn, fmt } from '@/lib/utils'
import type { PolyPreset } from '@/lib/types'

const PRESETS: { value: Exclude<PolyPreset, 'custom'>; labelKey: TKey }[] = [
  { value: 'square',   labelKey: 'presetSquare'   },
  { value: 'triangle', labelKey: 'presetTriangle'  },
  { value: 'sawtooth', labelKey: 'presetSawtooth'  },
]

export function HarmonicPanel() {
  const { state: { polyMode, polyPreset, harmonics, polyResults }, dispatch } = useRLC()
  const { state: { lang } } = useUI()

  return (
    <div className="rounded-xl border border-neutral-200 dark:border-neutral-800 bg-white dark:bg-neutral-900 p-4 space-y-3">
      <div className="flex items-center justify-between">
        <span className="text-sm font-medium text-neutral-700 dark:text-neutral-300">
          {t(lang, 'polyModeLabel')}
        </span>
        <button
          onClick={() => dispatch({ type: 'TOGGLE_POLY_MODE' })}
          className={cn(
            'relative inline-flex h-5 w-9 items-center rounded-full transition-colors',
            'focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-blue-500',
            polyMode ? 'bg-blue-500' : 'bg-neutral-300 dark:bg-neutral-600',
          )}
          aria-pressed={polyMode}
          aria-label={t(lang, 'polyModeLabel')}
        >
          <span className={cn(
            'inline-block h-3.5 w-3.5 transform rounded-full bg-white shadow transition-transform',
            polyMode ? 'translate-x-4' : 'translate-x-1',
          )} />
        </button>
      </div>

      {polyMode && (
        <>
          {/* Preset selector */}
          <div className="flex gap-1 flex-wrap">
            {PRESETS.map(({ value, labelKey }) => (
              <button
                key={value}
                onClick={() => dispatch({ type: 'SET_POLY_PRESET', preset: value })}
                className={cn(
                  'px-2 py-1 text-xs rounded-md border transition-colors',
                  polyPreset === value
                    ? 'border-blue-500 bg-blue-50 dark:bg-blue-900/30 text-blue-600 dark:text-blue-400 font-medium'
                    : 'border-neutral-200 dark:border-neutral-700 text-neutral-500 dark:text-neutral-400 hover:border-neutral-400',
                )}
              >
                {t(lang, labelKey)}
              </button>
            ))}
            <button
              onClick={() => dispatch({ type: 'SET_POLY_PRESET', preset: 'custom' })}
              className={cn(
                'px-2 py-1 text-xs rounded-md border transition-colors',
                polyPreset === 'custom'
                  ? 'border-blue-500 bg-blue-50 dark:bg-blue-900/30 text-blue-600 dark:text-blue-400 font-medium'
                  : 'border-neutral-200 dark:border-neutral-700 text-neutral-500 dark:text-neutral-400 hover:border-neutral-400',
              )}
            >
              {t(lang, 'presetCustom')}
            </button>
          </div>

          {/* Read-only harmonic list for presets */}
          {polyPreset !== 'custom' && (
            <div className="space-y-1">
              {harmonics.map(h => (
                <div key={h.n} className="flex items-center gap-2 text-xs text-neutral-500 dark:text-neutral-400">
                  <span className="w-10 font-mono">n = {h.n}</span>
                  <div className="flex-1 h-1.5 bg-neutral-100 dark:bg-neutral-700 rounded-full overflow-hidden">
                    <div
                      className="h-full bg-blue-400 rounded-full"
                      style={{ width: `${Math.min(100, h.An * 100)}%` }}
                    />
                  </div>
                  <span className="w-10 text-right font-mono">{(h.An * 100).toFixed(0)}%</span>
                </div>
              ))}
            </div>
          )}

          {/* Editable harmonic list for custom */}
          {polyPreset === 'custom' && (
            <div className="space-y-2">
              <div className="grid grid-cols-[2.5rem_1fr_2.5rem_1fr_2.5rem_1.5rem] gap-x-1.5 text-xs text-neutral-400 dark:text-neutral-500 px-0.5">
                <span>{t(lang, 'harmonicOrder')}</span>
                <span>{t(lang, 'amplitude')}</span>
                <span></span>
                <span>{t(lang, 'phaseOffset')}</span>
                <span></span>
                <span></span>
              </div>
              {harmonics.map((h, idx) => {
                const isDuplicate = harmonics.some((o, i) => i !== idx && o.n === h.n)
                return (
                  <div key={idx} className="grid grid-cols-[2.5rem_1fr_2.5rem_1fr_2.5rem_1.5rem] gap-x-1.5 items-center">
                    <input
                      type="number"
                      value={h.n}
                      min={1}
                      max={20}
                      onChange={e => dispatch({
                        type: 'SET_HARMONIC',
                        index: idx,
                        harmonic: { n: Math.max(1, parseInt(e.target.value) || 1) },
                      })}
                      className={cn(
                        'w-full text-center text-xs border rounded bg-transparent px-1 py-0.5',
                        isDuplicate
                          ? 'border-amber-400 dark:border-amber-500'
                          : 'border-neutral-200 dark:border-neutral-700',
                      )}
                    />
                    <input
                      type="range"
                      min={0}
                      max={2}
                      step={0.1}
                      value={h.An}
                      onChange={e => dispatch({
                        type: 'SET_HARMONIC',
                        index: idx,
                        harmonic: { An: parseFloat(e.target.value) },
                      })}
                      className="w-full accent-blue-500"
                    />
                    <span className="text-xs text-right font-mono text-neutral-600 dark:text-neutral-300">
                      {h.An.toFixed(1)}
                    </span>
                    <input
                      type="range"
                      min={0}
                      max={360}
                      step={5}
                      value={h.phin}
                      onChange={e => dispatch({
                        type: 'SET_HARMONIC',
                        index: idx,
                        harmonic: { phin: parseInt(e.target.value) },
                      })}
                      className="w-full accent-blue-500"
                    />
                    <span className="text-xs text-right font-mono text-neutral-600 dark:text-neutral-300">
                      {h.phin}°
                    </span>
                    <button
                      onClick={() => dispatch({ type: 'REMOVE_HARMONIC', index: idx })}
                      disabled={harmonics.length <= 1}
                      className="text-neutral-400 hover:text-red-500 disabled:opacity-20 text-sm leading-none"
                      aria-label={t(lang, 'removeHarmonic')}
                    >
                      ×
                    </button>
                  </div>
                )
              })}
              {harmonics.some((h, i) => harmonics.findIndex(o => o.n === h.n) !== i) && (
                <p className="text-xs text-amber-600 dark:text-amber-400">
                  ⚠ {t(lang, 'duplicateNCombined')}
                </p>
              )}
              <button
                onClick={() => dispatch({ type: 'ADD_HARMONIC' })}
                disabled={harmonics.length >= 10}
                className="text-xs text-blue-500 hover:text-blue-600 dark:hover:text-blue-300 disabled:opacity-30 disabled:cursor-not-allowed"
              >
                + {t(lang, 'addHarmonic')}
              </button>
            </div>
          )}

          {/* THD summary */}
          {polyResults && (
            <p className="text-xs text-neutral-500 dark:text-neutral-400">
              {t(lang, 'thdCurrent')}:{' '}
              <span className="font-medium tabular-nums text-neutral-800 dark:text-neutral-200">
                {fmt(polyResults.THD_I, 1)} %
              </span>
            </p>
          )}
        </>
      )}
    </div>
  )
}
