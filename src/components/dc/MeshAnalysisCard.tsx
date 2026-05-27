'use client'
import { useDC } from '@/store/dc-store'
import { t } from '@/lib/i18n'
import { fmt } from '@/lib/utils'

export function MeshAnalysisCard() {
  const { state: { params, results, lang } } = useDC()
  const { V1, V2, R1, R2, R3 } = params
  const { I1, I2, D } = results

  const a11 = R1 + R2
  const a22 = R2 + R3

  return (
    <div className="rounded-xl border border-neutral-200 dark:border-neutral-800 bg-white dark:bg-neutral-900 p-4">
      <h2 className="text-xs font-medium text-neutral-400 uppercase tracking-wider mb-3">
        {t(lang, 'meshAnalysisTitle')}
      </h2>

      <p className="text-xs text-neutral-500 dark:text-neutral-400 mb-2">
        {t(lang, 'meshEquations')}
      </p>

      <div className="font-mono text-xs mb-3 space-y-1 text-neutral-700 dark:text-neutral-300">
        <div className="flex gap-1 items-center">
          <span className="text-violet-600 dark:text-violet-400">({fmt(a11, 0)})</span>
          <span>·I₁</span>
          <span className="text-neutral-400">+</span>
          <span className="text-teal-600 dark:text-teal-400">({fmt(-R2, 0)})</span>
          <span>·I₂ = {fmt(V1, 1)}</span>
        </div>
        <div className="flex gap-1 items-center">
          <span className="text-violet-600 dark:text-violet-400">({fmt(-R2, 0)})</span>
          <span>·I₁</span>
          <span className="text-neutral-400">+</span>
          <span className="text-teal-600 dark:text-teal-400">({fmt(a22, 0)})</span>
          <span>·I₂ = {fmt(V2, 1)}</span>
        </div>
      </div>

      <div className="text-xs text-neutral-500 dark:text-neutral-400 mb-3">
        <span>{t(lang, 'meshDeterminant')}: </span>
        <span className="font-mono font-medium text-neutral-700 dark:text-neutral-300">
          {fmt(D, 2)} Ω²
        </span>
      </div>

      <p className="text-xs text-neutral-500 dark:text-neutral-400 mb-2">
        {t(lang, 'meshSolution')}
      </p>
      <div className="font-mono text-sm space-y-1">
        <div>
          <span className="text-violet-600 dark:text-violet-400">I₁</span>
          <span className="text-neutral-700 dark:text-neutral-300"> = {fmt(I1, 4)} A</span>
        </div>
        <div>
          <span className="text-teal-600 dark:text-teal-400">I₂</span>
          <span className="text-neutral-700 dark:text-neutral-300"> = {fmt(I2, 4)} A</span>
        </div>
      </div>
    </div>
  )
}
