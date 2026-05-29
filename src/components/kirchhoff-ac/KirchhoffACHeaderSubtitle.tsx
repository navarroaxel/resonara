'use client'
import { useKirchhoffAC } from '@/store/kirchhoff-ac-store'
import { t } from '@/lib/i18n'

export function KirchhoffACHeaderSubtitle() {
  const { state: { lang } } = useKirchhoffAC()
  return (
    <p className="text-xs text-neutral-500 dark:text-neutral-400">
      {t(lang, 'kacPageSubtitle')}
    </p>
  )
}
