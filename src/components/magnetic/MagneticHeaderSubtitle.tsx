'use client'
import { useMagnetic } from '@/store/magnetic-store'
import { t } from '@/lib/i18n'

export function MagneticHeaderSubtitle() {
  const { state: { lang } } = useMagnetic()
  return (
    <p className="text-xs text-neutral-500 dark:text-neutral-400">
      {t(lang, 'magPageSubtitle')}
    </p>
  )
}
