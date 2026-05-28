'use client'
import Link from 'next/link'
import { usePathname } from 'next/navigation'
import type { Lang } from '@/lib/types'
import { t } from '@/lib/i18n'
import { useRLC } from '@/store/rlc-store'
import { useDC } from '@/store/dc-store'
import { useThreePhase } from '@/store/three-phase-store'
import { useRCDC } from '@/store/rc-dc-store'
import { useMagnetic } from '@/store/magnetic-store'

const SIMULATORS = [
  { href: '/',            labelKey: 'navDcTab'         },
  { href: '/rc-dc',       labelKey: 'navRcDcTab'       },
  { href: '/ac',          labelKey: 'navRlcTab'        },
  { href: '/three-phase', labelKey: 'navThreePhaseTab' },
  { href: '/magnetic',    labelKey: 'navMagneticTab'   },
] as const

function SimulatorNav({ lang }: { lang: Lang }) {
  const pathname = usePathname()
  return (
    <nav
      aria-label="Simulators"
      className="flex items-center rounded-lg border border-zinc-200 dark:border-zinc-700 bg-zinc-100 dark:bg-zinc-800/60 p-0.5 gap-0.5"
    >
      {SIMULATORS.map(({ href, labelKey }) => {
        const active = pathname === href
        return (
          <Link
            key={href}
            href={href}
            aria-current={active ? 'page' : undefined}
            className={
              active
                ? 'inline-flex items-center rounded-md px-3 py-1 text-xs font-semibold bg-white dark:bg-zinc-700 text-zinc-900 dark:text-zinc-100 shadow-sm pointer-events-none'
                : 'inline-flex items-center rounded-md px-3 py-1 text-xs font-medium text-zinc-500 dark:text-zinc-400 hover:text-zinc-700 dark:hover:text-zinc-200 transition-colors'
            }
          >
            {t(lang, labelKey)}
          </Link>
        )
      })}
    </nav>
  )
}

export function RLCSimulatorNav() {
  const { state: { lang } } = useRLC()
  return <SimulatorNav lang={lang} />
}

export function DCSimulatorNav() {
  const { state: { lang } } = useDC()
  return <SimulatorNav lang={lang} />
}

export function ThreePhaseSimulatorNav() {
  const { state: { lang } } = useThreePhase()
  return <SimulatorNav lang={lang} />
}

export function RCDCSimulatorNav() {
  const { state: { lang } } = useRCDC()
  return <SimulatorNav lang={lang} />
}

export function MagneticSimulatorNav() {
  const { state: { lang } } = useMagnetic()
  return <SimulatorNav lang={lang} />
}
