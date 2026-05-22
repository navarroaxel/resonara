'use client'
import { useRLC } from '@/store/rlc-store'
import { t } from '@/lib/i18n'
import { cn } from '@/lib/utils'

export function ResonanceBadge() {
  const { state: { params, results, circuitType, flags, lang } } = useRLC()
  const { XL, XC, fr } = results

  let text: string
  let style: string

  if (!flags.hasL && !flags.hasC) {
    text  = t(lang, 'resistive')
    style = 'bg-neutral-50 text-neutral-600 border-neutral-200 dark:bg-neutral-800 dark:text-neutral-400 dark:border-neutral-700'
  } else if (flags.hasL && flags.hasC && Number.isFinite(fr) && Math.abs(params.f - fr) < fr * 0.05) {
    text  = t(lang, 'nearResonance')
    style = 'bg-emerald-50 text-emerald-700 border-emerald-200 dark:bg-emerald-950 dark:text-emerald-300 dark:border-emerald-800'
  } else if (XL > XC) {
    text  = t(lang, circuitType === 'serie' ? 'inductive_serie' : 'inductive_para')
    style = 'bg-blue-50 text-blue-700 border-blue-200 dark:bg-blue-950 dark:text-blue-300 dark:border-blue-800'
  } else {
    text  = t(lang, circuitType === 'serie' ? 'capacitive_serie' : 'capacitive_para')
    style = 'bg-amber-50 text-amber-700 border-amber-200 dark:bg-amber-950 dark:text-amber-300 dark:border-amber-800'
  }

  return (
    <div className={cn('text-xs font-medium px-3 py-2 rounded-lg border mb-3', style)}>
      {text}
    </div>
  )
}
