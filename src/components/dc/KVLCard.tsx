'use client'
import { useDC } from '@/store/dc-store'
import { t } from '@/lib/i18n'
import { fmt } from '@/lib/utils'

const TOL = 1e-6

function valid(r: number) {
  return Number.isFinite(r) && Math.abs(r) < TOL
}

function Badge({ ok }: { ok: boolean }) {
  return (
    <span className={ok ? 'text-green-600 dark:text-green-400' : 'text-red-500 dark:text-red-400'}>
      {ok ? ' ✓' : ' ✗'}
    </span>
  )
}

export function KVLCard() {
  const { state: { params, results, lang } } = useDC()
  const { V1, V2 } = params
  const { VR1, VR2, VR3, kvl1, kvl2 } = results

  return (
    <div className="rounded-xl border border-neutral-200 dark:border-neutral-800 bg-white dark:bg-neutral-900 p-4">
      <h2 className="text-xs font-medium text-neutral-400 uppercase tracking-wider mb-3">
        {t(lang, 'kvlTitle')}
      </h2>

      <div className="space-y-4">
        <div>
          <p className="text-xs font-medium text-violet-600 dark:text-violet-400 mb-1">
            {t(lang, 'kvlLoop1')}
          </p>
          <p className="font-mono text-xs text-neutral-500 dark:text-neutral-400 mb-1">
            V₁ − VR₁ − VR₂ = 0
          </p>
          <p className="font-mono text-sm text-neutral-700 dark:text-neutral-300">
            {fmt(V1, 3)} − {fmt(VR1, 4)} − {fmt(VR2, 4)}
            {' = '}
            <span className={valid(kvl1) ? 'text-green-600 dark:text-green-400' : 'text-red-500 dark:text-red-400'}>
              {fmt(kvl1, 9)}
            </span>
            <Badge ok={valid(kvl1)} />
          </p>
        </div>

        <div>
          <p className="text-xs font-medium text-teal-600 dark:text-teal-400 mb-1">
            {t(lang, 'kvlLoop2')}
          </p>
          <p className="font-mono text-xs text-neutral-500 dark:text-neutral-400 mb-1">
            V₂ − VR₃ + VR₂ = 0
          </p>
          <p className="font-mono text-sm text-neutral-700 dark:text-neutral-300">
            {fmt(V2, 3)} − {fmt(VR3, 4)} + {fmt(VR2, 4)}
            {' = '}
            <span className={valid(kvl2) ? 'text-green-600 dark:text-green-400' : 'text-red-500 dark:text-red-400'}>
              {fmt(kvl2, 9)}
            </span>
            <Badge ok={valid(kvl2)} />
          </p>
        </div>
      </div>
    </div>
  )
}
