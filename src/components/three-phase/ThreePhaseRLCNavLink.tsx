'use client'
import Link from 'next/link'
import { useThreePhase } from '@/store/three-phase-store'
import { t } from '@/lib/i18n'

export function ThreePhaseRLCNavLink() {
  const { state: { lang } } = useThreePhase()
  return (
    <Link
      href="/"
      className="inline-flex items-center rounded-md border border-zinc-300 bg-white px-2.5 py-1 text-xs font-medium text-zinc-700 transition-colors hover:bg-zinc-50 dark:border-zinc-700 dark:bg-zinc-900 dark:text-zinc-200 dark:hover:bg-zinc-800"
    >
      {t(lang, 'navRlcLink')}
    </Link>
  )
}
