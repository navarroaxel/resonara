import type { ReactNode } from 'react'

export function SimulatorHeader({ subtitle, children }: { subtitle: ReactNode; children: ReactNode }) {
  return (
    <header className="border-b border-neutral-200 dark:border-neutral-800 px-6 py-3 flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
      <div>
        <h1 className="text-lg font-semibold tracking-tight">Resonara</h1>
        {subtitle}
      </div>
      <div className="flex items-center gap-2">
        {children}
      </div>
    </header>
  )
}
