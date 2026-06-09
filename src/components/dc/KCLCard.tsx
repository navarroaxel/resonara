'use client'
import { useDC } from '@/store/dc-store'
import { useUI } from '@/store/ui-store'
import { t } from '@/lib/i18n'
import { fmt } from '@/lib/utils'

const TOL = 1e-6

function valid(r: number) {
  return Number.isFinite(r) && Math.abs(r) < TOL
}

export function KCLCard() {
  const { state: { flags, results } } = useDC()
  const { state: { lang } } = useUI()
  const { IR1, IR2, IR3, IR4, IR5, kclA, kclB } = results
  const okA = valid(kclA)
  const okB = valid(kclB)
  const { mesh3 } = flags

  return (
    <div className="rounded-xl border border-neutral-200 dark:border-neutral-800 bg-white dark:bg-neutral-900 p-4">
      <h2 className="text-xs font-medium text-neutral-400 uppercase tracking-wider mb-3">
        {t(lang, 'kclTitle')}
      </h2>

      <div className="space-y-4">
        <div>
          <p className="text-xs font-medium text-amber-600 dark:text-amber-400 mb-1">
            {t(lang, 'kclNodeA')}
          </p>
          <p className="font-mono text-xs text-neutral-500 dark:text-neutral-400 mb-1">
            IR₁ = IR₂ + IR₃
          </p>
          <div className="font-mono text-sm text-neutral-700 dark:text-neutral-300 space-y-0.5">
            <p>IR₁ = {fmt(IR1, 4)} A</p>
            <p>IR₂ = {fmt(IR2, 4)} A</p>
            <p>IR₃ = {fmt(IR3, 4)} A</p>
          </div>
          <div className="mt-2 pt-2 border-t border-neutral-100 dark:border-neutral-800">
            <p className="font-mono text-xs text-neutral-500 dark:text-neutral-400 mb-0.5">
              {t(lang, 'kclBalance')}: IR₁ − IR₂ − IR₃
            </p>
            <p className="font-mono text-sm">
              <span className={okA ? 'text-green-600 dark:text-green-400' : 'text-red-500 dark:text-red-400'}>
                {fmt(kclA, 9)}
              </span>
              <span className={okA ? 'text-green-600 dark:text-green-400' : 'text-red-500 dark:text-red-400'}>
                {okA ? ' A ✓' : ' A ✗'}
              </span>
            </p>
          </div>
        </div>

        {mesh3 && <div>
          <p className="text-xs font-medium text-amber-600 dark:text-amber-400 mb-1">
            {t(lang, 'kclNodeB')}
          </p>
          <p className="font-mono text-xs text-neutral-500 dark:text-neutral-400 mb-1">
            IR₃ = IR₄ + IR₅
          </p>
          <div className="font-mono text-sm text-neutral-700 dark:text-neutral-300 space-y-0.5">
            <p>IR₃ = {fmt(IR3, 4)} A</p>
            <p>IR₄ = {fmt(IR4, 4)} A</p>
            <p>IR₅ = {fmt(IR5, 4)} A</p>
          </div>
          <div className="mt-2 pt-2 border-t border-neutral-100 dark:border-neutral-800">
            <p className="font-mono text-xs text-neutral-500 dark:text-neutral-400 mb-0.5">
              {t(lang, 'kclBalance')}: IR₃ − IR₄ − IR₅
            </p>
            <p className="font-mono text-sm">
              <span className={okB ? 'text-green-600 dark:text-green-400' : 'text-red-500 dark:text-red-400'}>
                {fmt(kclB, 9)}
              </span>
              <span className={okB ? 'text-green-600 dark:text-green-400' : 'text-red-500 dark:text-red-400'}>
                {okB ? ' A ✓' : ' A ✗'}
              </span>
            </p>
          </div>
        </div>}
      </div>
    </div>
  )
}
