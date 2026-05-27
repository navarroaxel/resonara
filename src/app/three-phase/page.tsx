import { ConnectionTypeToggle }       from '@/components/three-phase/ConnectionTypeToggle'
import { ThreePhaseSchematic }        from '@/components/three-phase/ThreePhaseSchematic'
import { ThreePhaseParameterPanel }   from '@/components/three-phase/ThreePhaseParameterPanel'
import { ThreePhaseMetricsGrid }      from '@/components/three-phase/ThreePhaseMetricsGrid'
import { ThreePhaseChartTabs }        from '@/components/three-phase/ThreePhaseChartTabs'
import { ThreePhaseHeaderSubtitle }   from '@/components/three-phase/ThreePhaseHeaderSubtitle'
import { ThreePhaseGitHubLink }       from '@/components/three-phase/ThreePhaseGitHubLink'
import { ThreePhaseLangToggle }       from '@/components/three-phase/ThreePhaseLangToggle'
import { ThreePhaseThemeToggle }      from '@/components/three-phase/ThreePhaseThemeToggle'
import { ThreePhaseFooter }           from '@/components/three-phase/ThreePhaseFooter'
import { ThreePhaseRLCNavLink }       from '@/components/three-phase/ThreePhaseRLCNavLink'

export default function ThreePhasePage() {
  return (
    <main className="min-h-screen">
      <header className="border-b border-neutral-200 dark:border-neutral-800 px-6 py-3 flex items-center justify-between">
        <div>
          <h1 className="text-lg font-semibold tracking-tight">Resonara</h1>
          <ThreePhaseHeaderSubtitle />
        </div>
        <div className="flex items-center gap-2">
          <ThreePhaseRLCNavLink />
          <ThreePhaseGitHubLink />
          <ThreePhaseLangToggle />
          <ThreePhaseThemeToggle />
        </div>
      </header>

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
