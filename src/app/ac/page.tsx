import { CircuitTypeToggle } from '@/components/simulator/CircuitTypeToggle'
import { ParameterPanel } from '@/components/simulator/ParameterPanel'
import { HarmonicPanel } from '@/components/simulator/HarmonicPanel'
import { MetricsGrid } from '@/components/simulator/MetricsGrid'
import { ResonanceBadge } from '@/components/simulator/ResonanceBadge'
import { ChartTabs } from '@/components/simulator/ChartTabs'
import { RLCEquationsCard } from '@/components/simulator/RLCEquationsCard'
import { CircuitSchematic } from '@/components/schematic/CircuitSchematic'
import { HeaderSubtitle } from '@/components/ui/HeaderSubtitle'
import { SimulatorHeader } from '@/components/ui/SimulatorHeader'
import { Footer } from '@/components/ui/Footer'

export default function Home() {
  return (
    <main className="min-h-screen">
      <SimulatorHeader>
        <HeaderSubtitle />
      </SimulatorHeader>
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
          <RLCEquationsCard />
          <div className="rounded-xl border border-neutral-200 dark:border-neutral-800 bg-white dark:bg-neutral-900 p-4">
            <ChartTabs />
          </div>
        </div>
      </div>
      <Footer />
    </main>
  )
}
