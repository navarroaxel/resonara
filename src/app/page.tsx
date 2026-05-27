import { CircuitTypeToggle } from '@/components/simulator/CircuitTypeToggle'
import { ParameterPanel }    from '@/components/simulator/ParameterPanel'
import { HarmonicPanel }     from '@/components/simulator/HarmonicPanel'
import { MetricsGrid }       from '@/components/simulator/MetricsGrid'
import { ResonanceBadge }    from '@/components/simulator/ResonanceBadge'
import { ChartTabs }         from '@/components/simulator/ChartTabs'
import { CircuitSchematic }  from '@/components/schematic/CircuitSchematic'
import { ThemeToggle }       from '@/components/ui/ThemeToggle'
import { LangToggle }        from '@/components/ui/LangToggle'
import { HeaderSubtitle }    from '@/components/ui/HeaderSubtitle'
import { GitHubLink }        from '@/components/ui/GitHubLink'
import { DCNavLink }         from '@/components/ui/DCNavLink'
import { ThreePhaseNavLink } from '@/components/ui/ThreePhaseNavLink'
import { Footer }            from '@/components/ui/Footer'

export default function Home() {
  return (
    <main className="min-h-screen">
      <header className="border-b border-neutral-200 dark:border-neutral-800 px-6 py-3 flex items-center justify-between">
        <div>
          <h1 className="text-lg font-semibold tracking-tight">Resonara</h1>
          <HeaderSubtitle />
        </div>
        <div className="flex items-center gap-2">
          <DCNavLink />
          <ThreePhaseNavLink />
          <GitHubLink />
          <LangToggle />
          <ThemeToggle />
        </div>
      </header>

      <div className="max-w-7xl mx-auto px-4 py-6 grid grid-cols-1 md:grid-cols-2 gap-6">

        <div className="space-y-4">
          <div className="rounded-xl border border-neutral-200 dark:border-neutral-800 bg-white dark:bg-neutral-900 p-4">
            <CircuitTypeToggle />
            <CircuitSchematic />
          </div>
          <div className="rounded-xl border border-neutral-200 dark:border-neutral-800 bg-white dark:bg-neutral-900 p-4">
            <ParameterPanel />
          </div>
          <HarmonicPanel />
        </div>

        <div className="space-y-4">
          <div className="rounded-xl border border-neutral-200 dark:border-neutral-800 bg-white dark:bg-neutral-900 p-4">
            <ResonanceBadge />
            <MetricsGrid />
          </div>
          <div className="rounded-xl border border-neutral-200 dark:border-neutral-800 bg-white dark:bg-neutral-900 p-4">
            <ChartTabs />
          </div>
        </div>

      </div>

      <Footer />
    </main>
  )
}
