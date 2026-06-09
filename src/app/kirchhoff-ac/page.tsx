import { KirchhoffACSchematic } from '@/components/kirchhoff-ac/KirchhoffACSchematic'
import { KirchhoffACParameterPanel } from '@/components/kirchhoff-ac/KirchhoffACParameterPanel'
import { KirchhoffACMetricsGrid } from '@/components/kirchhoff-ac/KirchhoffACMetricsGrid'
import { KirchhoffACChartTabs } from '@/components/kirchhoff-ac/KirchhoffACChartTabs'
import { KirchhoffACMeshAnalysisCard } from '@/components/kirchhoff-ac/KirchhoffACMeshAnalysisCard'
import { KirchhoffACHeaderSubtitle } from '@/components/kirchhoff-ac/KirchhoffACHeaderSubtitle'
import { KirchhoffACFooter } from '@/components/kirchhoff-ac/KirchhoffACFooter'
import { SimulatorHeader } from '@/components/ui/SimulatorHeader'

export default function KirchhoffACPage() {
  return (
    <main className="min-h-screen">
      <SimulatorHeader><KirchhoffACHeaderSubtitle /></SimulatorHeader>
      <div className="max-w-7xl mx-auto px-4 py-6 space-y-6">
        <div className="rounded-xl border border-neutral-200 dark:border-neutral-800 bg-white dark:bg-neutral-900 p-4">
          <KirchhoffACSchematic />
        </div>
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
