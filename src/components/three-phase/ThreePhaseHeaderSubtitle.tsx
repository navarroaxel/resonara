'use client'
import { useThreePhase } from '@/store/three-phase-store'
import { t } from '@/lib/i18n'

export function ThreePhaseHeaderSubtitle() {
  const { state: { lang } } = useThreePhase()
  return (
    <p className="text-xs text-neutral-500 dark:text-neutral-400">
      {t(lang, 'threePhasePageSubtitle')}
    </p>
  )
}
