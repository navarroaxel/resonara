'use client'
import { useRLC } from '@/store/rlc-store'
import { t } from '@/lib/i18n'

export function HeaderSubtitle() {
  const { state: { lang } } = useRLC()
  return (
    <p className="text-xs text-neutral-500 dark:text-neutral-400">
      {t(lang, 'subtitle')}
    </p>
  )
}
