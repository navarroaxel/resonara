'use client'
import { useDC } from '@/store/dc-store'
import { t } from '@/lib/i18n'

export function DCHeaderSubtitle() {
  const { state: { lang } } = useDC()
  return (
    <p className="text-xs text-neutral-500 dark:text-neutral-400">
      {t(lang, 'dcPageSubtitle')}
    </p>
  )
}
