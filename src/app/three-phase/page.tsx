import { ConnectionTypeToggle } from '@/components/three-phase/ConnectionTypeToggle'
import { ThreePhaseSchematic } from '@/components/three-phase/ThreePhaseSchematic'
import { ThreePhaseParameterPanel } from '@/components/three-phase/ThreePhaseParameterPanel'
import { ThreePhaseMetricsGrid } from '@/components/three-phase/ThreePhaseMetricsGrid'
import { ThreePhaseChartTabs } from '@/components/three-phase/ThreePhaseChartTabs'
import { ThreePhaseHeaderSubtitle } from '@/components/three-phase/ThreePhaseHeaderSubtitle'
import { ThreePhaseFooter } from '@/components/three-phase/ThreePhaseFooter'
import { SimulatorHeader } from '@/components/ui/SimulatorHeader'

export default function ThreePhasePage() {
  return (
    <main className="min-h-screen">
      <SimulatorHeader>
        <ThreePhaseHeaderSubtitle />
      </SimulatorHeader>
      <div className="max-w-7xl mx-auto px-4 py-6 grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="space-y-4">
          <div className="rounded-xl border border-neutral-200 dark:border-neutral-800 bg-white dark:bg-neutral-900 p-4">
            <ConnectionTypeToggle />
            <ThreePhaseSchematic />
          </div>
          <div className="rounded-xl border border-neutral-200 dark:border-neutral-800 bg-white dark:bg-neutral-900 p-4">
            <ThreePhaseParameterPanel />
          </div>
        </div>
        <div className="space-y-4">
          <div className="rounded-xl border border-neutral-200 dark:border-neutral-800 bg-white dark:bg-neutral-900 p-4">
            <ThreePhaseMetricsGrid />
          </div>
          <div className="rounded-xl border border-neutral-200 dark:border-neutral-800 bg-white dark:bg-neutral-900 p-4">
            <ThreePhaseChartTabs />
          </div>
        </div>
      </div>
      <ThreePhaseFooter />
    </main>
  )
}
