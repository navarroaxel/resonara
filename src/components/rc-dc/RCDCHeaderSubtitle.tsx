'use client'
import { useRCDC } from '@/store/rc-dc-store'
import { t } from '@/lib/i18n'

export function RCDCHeaderSubtitle() {
  const { state: { lang } } = useRCDC()
  return (
    <p className="text-xs text-neutral-500 dark:text-neutral-400">
      {t(lang, 'rcDcPageSubtitle')}
    </p>
  )
}
