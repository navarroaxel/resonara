import { KirchhoffACSchematic }      from '@/components/kirchhoff-ac/KirchhoffACSchematic'
import { KirchhoffACParameterPanel } from '@/components/kirchhoff-ac/KirchhoffACParameterPanel'
import { KirchhoffACMetricsGrid }    from '@/components/kirchhoff-ac/KirchhoffACMetricsGrid'
import { KirchhoffACChartTabs }      from '@/components/kirchhoff-ac/KirchhoffACChartTabs'
import { KirchhoffACMeshAnalysisCard } from '@/components/kirchhoff-ac/KirchhoffACMeshAnalysisCard'
import { KirchhoffACHeaderSubtitle } from '@/components/kirchhoff-ac/KirchhoffACHeaderSubtitle'
import { KirchhoffACGitHubLink }     from '@/components/kirchhoff-ac/KirchhoffACGitHubLink'
import { KirchhoffACLangToggle }     from '@/components/kirchhoff-ac/KirchhoffACLangToggle'
import { KirchhoffACThemeToggle }    from '@/components/kirchhoff-ac/KirchhoffACThemeToggle'
import { KirchhoffACFooter }         from '@/components/kirchhoff-ac/KirchhoffACFooter'
import { KirchhoffACSimulatorNav }   from '@/components/ui/SimulatorNav'

export default function KirchhoffACPage() {
  return (
    <main className="min-h-screen">
      <header className="border-b border-neutral-200 dark:border-neutral-800 px-6 py-3 flex items-center justify-between">
        <div>
          <h1 className="text-lg font-semibold tracking-tight">Resonara</h1>
          <KirchhoffACHeaderSubtitle />
        </div>
        <div className="flex items-center gap-2">
          <KirchhoffACSimulatorNav />
          <KirchhoffACGitHubLink />
          <KirchhoffACLangToggle />
          <KirchhoffACThemeToggle />
        </div>
      </header>

      <div className="max-w-7xl mx-auto px-4 py-6 space-y-6">

        {/* Full-width schematic */}
        <div className="rounded-xl border border-neutral-200 dark:border-neutral-800 bg-white dark:bg-neutral-900 p-4">
          <KirchhoffACSchematic />
        </div>

        {/* Two-column grid: params (left) + metrics/charts (right) */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">

          <div className="rounded-xl border border-neutral-200 dark:border-neutral-800 bg-white dark:bg-neutral-900 p-4">
            <KirchhoffACParameterPanel />
          </div>

          <div className="space-y-4">
            <div className="rounded-xl border border-neutral-200 dark:border-neutral-800 bg-white dark:bg-neutral-900 p-4">
              <KirchhoffACMetricsGrid />
            </div>
            <KirchhoffACMeshAnalysisCard />
            <div className="rounded-xl border border-neutral-200 dark:border-neutral-800 bg-white dark:bg-neutral-900 p-4">
              <KirchhoffACChartTabs />
            </div>
          </div>

        </div>

      </div>

      <KirchhoffACFooter />
    </main>
  )
}
