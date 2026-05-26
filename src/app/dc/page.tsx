import Link from 'next/link'
import { DCSchematic }      from '@/components/dc/DCSchematic'
import { DCParameterPanel } from '@/components/dc/DCParameterPanel'
import { DCMetricsGrid }    from '@/components/dc/DCMetricsGrid'
import { MeshAnalysisCard } from '@/components/dc/MeshAnalysisCard'
import { KVLCard }          from '@/components/dc/KVLCard'
import { KCLCard }          from '@/components/dc/KCLCard'
import { DCThemeToggle }    from '@/components/dc/DCThemeToggle'
import { DCLangToggle }     from '@/components/dc/DCLangToggle'
import { DCHeaderSubtitle } from '@/components/dc/DCHeaderSubtitle'
import { DCGitHubLink }     from '@/components/dc/DCGitHubLink'
import { DCFooter }         from '@/components/dc/DCFooter'

export default function DCPage() {
  return (
    <main className="min-h-screen">
      <header className="border-b border-neutral-200 dark:border-neutral-800 px-6 py-3 flex items-center justify-between">
        <div>
          <h1 className="text-lg font-semibold tracking-tight">Resonara</h1>
          <DCHeaderSubtitle />
        </div>
        <div className="flex items-center gap-2">
          <Link
            href="/"
            className="inline-flex items-center rounded-md border border-zinc-300 bg-white px-2.5 py-1 text-xs font-medium text-zinc-700 transition-colors hover:bg-zinc-50 dark:border-zinc-700 dark:bg-zinc-900 dark:text-zinc-200 dark:hover:bg-zinc-800"
          >
            RLC CA →
          </Link>
          <DCGitHubLink />
          <DCLangToggle />
          <DCThemeToggle />
        </div>
      </header>

      <div className="max-w-7xl mx-auto px-4 py-6 grid grid-cols-1 md:grid-cols-2 gap-6">

        <div className="space-y-4">
          <div className="rounded-xl border border-neutral-200 dark:border-neutral-800 bg-white dark:bg-neutral-900 p-4">
            <DCSchematic />
          </div>
          <div className="rounded-xl border border-neutral-200 dark:border-neutral-800 bg-white dark:bg-neutral-900 p-4">
            <DCParameterPanel />
          </div>
        </div>

        <div className="space-y-4">
          <div className="rounded-xl border border-neutral-200 dark:border-neutral-800 bg-white dark:bg-neutral-900 p-4">
            <DCMetricsGrid />
          </div>
          <MeshAnalysisCard />
          <KVLCard />
          <KCLCard />
        </div>

      </div>

      <DCFooter />
    </main>
  )
}
