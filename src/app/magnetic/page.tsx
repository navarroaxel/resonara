import { MagneticSchematic }      from '@/components/magnetic/MagneticSchematic'
import { MagneticParameterPanel } from '@/components/magnetic/MagneticParameterPanel'
import { MagneticMetricsGrid }    from '@/components/magnetic/MagneticMetricsGrid'
import { MagneticChartTabs }      from '@/components/magnetic/MagneticChartTabs'
import { MagneticEquationsCard }  from '@/components/magnetic/MagneticEquationsCard'
import { MagneticHeaderSubtitle } from '@/components/magnetic/MagneticHeaderSubtitle'
import { MagneticFooter }  from '@/components/magnetic/MagneticFooter'
import { SimulatorNav }    from '@/components/ui/SimulatorNav'
import { SimulatorHeader } from '@/components/ui/SimulatorHeader'
import { GitHubLink }      from '@/components/ui/GitHubLink'
import { LangToggle }      from '@/components/ui/LangToggle'
import { ThemeToggle }     from '@/components/ui/ThemeToggle'

export default function MagneticPage() {
  return (
    <main className="min-h-screen">
      <SimulatorHeader subtitle={<MagneticHeaderSubtitle />}>
        <SimulatorNav />
        <GitHubLink />
        <LangToggle />
        <ThemeToggle />
      </SimulatorHeader>

      <div className="max-w-7xl mx-auto px-4 py-6 grid grid-cols-1 md:grid-cols-2 gap-6">

        <div className="space-y-4">
          <div className="rounded-xl border border-neutral-200 dark:border-neutral-800 bg-white dark:bg-neutral-900 p-4">
            <MagneticSchematic />
          </div>
          <div className="rounded-xl border border-neutral-200 dark:border-neutral-800 bg-white dark:bg-neutral-900 p-4">
            <MagneticParameterPanel />
          </div>
        </div>

        <div className="space-y-4">
          <div className="rounded-xl border border-neutral-200 dark:border-neutral-800 bg-white dark:bg-neutral-900 p-4">
            <MagneticMetricsGrid />
          </div>
          <MagneticEquationsCard />
          <div className="rounded-xl border border-neutral-200 dark:border-neutral-800 bg-white dark:bg-neutral-900 p-4">
            <MagneticChartTabs />
          </div>
        </div>

      </div>

      <MagneticFooter />
    </main>
  )
}
