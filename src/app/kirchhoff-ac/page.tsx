import { KirchhoffACSchematic }      from '@/components/kirchhoff-ac/KirchhoffACSchematic'
import { KirchhoffACParameterPanel } from '@/components/kirchhoff-ac/KirchhoffACParameterPanel'
import { KirchhoffACMetricsGrid }    from '@/components/kirchhoff-ac/KirchhoffACMetricsGrid'
import { KirchhoffACChartTabs }      from '@/components/kirchhoff-ac/KirchhoffACChartTabs'
import { KirchhoffACMeshAnalysisCard } from '@/components/kirchhoff-ac/KirchhoffACMeshAnalysisCard'
import { KirchhoffACHeaderSubtitle } from '@/components/kirchhoff-ac/KirchhoffACHeaderSubtitle'
import { KirchhoffACFooter }  from '@/components/kirchhoff-ac/KirchhoffACFooter'
import { SimulatorNav }      from '@/components/ui/SimulatorNav'
import { SimulatorHeader }   from '@/components/ui/SimulatorHeader'
import { GitHubLink }        from '@/components/ui/GitHubLink'
import { LangToggle }        from '@/components/ui/LangToggle'
import { ThemeToggle }       from '@/components/ui/ThemeToggle'

export default function KirchhoffACPage() {
  return (
    <main className="min-h-screen">
      <SimulatorHeader subtitle={<KirchhoffACHeaderSubtitle />}>
        <SimulatorNav />
        <GitHubLink />
        <LangToggle />
        <ThemeToggle />
      </SimulatorHeader>

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
