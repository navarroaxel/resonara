import { MagneticSchematic }      from '@/components/magnetic/MagneticSchematic'
import { MagneticParameterPanel } from '@/components/magnetic/MagneticParameterPanel'
import { MagneticMetricsGrid }    from '@/components/magnetic/MagneticMetricsGrid'
import { MagneticChartTabs }      from '@/components/magnetic/MagneticChartTabs'
import { MagneticEquationsCard }  from '@/components/magnetic/MagneticEquationsCard'
import { MagneticHeaderSubtitle } from '@/components/magnetic/MagneticHeaderSubtitle'
import { MagneticGitHubLink }     from '@/components/magnetic/MagneticGitHubLink'
import { MagneticLangToggle }     from '@/components/magnetic/MagneticLangToggle'
import { MagneticThemeToggle }    from '@/components/magnetic/MagneticThemeToggle'
import { MagneticFooter }         from '@/components/magnetic/MagneticFooter'
import { MagneticSimulatorNav }   from '@/components/ui/SimulatorNav'

export default function MagneticPage() {
  return (
    <main className="min-h-screen">
      <header className="border-b border-neutral-200 dark:border-neutral-800 px-6 py-3 flex items-center justify-between">
        <div>
          <h1 className="text-lg font-semibold tracking-tight">Resonara</h1>
          <MagneticHeaderSubtitle />
        </div>
        <div className="flex items-center gap-2">
          <MagneticSimulatorNav />
          <MagneticGitHubLink />
          <MagneticLangToggle />
          <MagneticThemeToggle />
        </div>
      </header>

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
