import { RCDCSchematic }       from '@/components/rc-dc/RCDCSchematic'
import { RCDCParameterPanel }  from '@/components/rc-dc/RCDCParameterPanel'
import { RCDCMetricsGrid }     from '@/components/rc-dc/RCDCMetricsGrid'
import { RCDCChargingChart }   from '@/components/rc-dc/RCDCChargingChart'
import { RCDCThemeToggle }     from '@/components/rc-dc/RCDCThemeToggle'
import { RCDCLangToggle }      from '@/components/rc-dc/RCDCLangToggle'
import { RCDCHeaderSubtitle }  from '@/components/rc-dc/RCDCHeaderSubtitle'
import { RCDCGitHubLink }      from '@/components/rc-dc/RCDCGitHubLink'
import { RCDCFooter }          from '@/components/rc-dc/RCDCFooter'
import { RCDCSimulatorNav }    from '@/components/ui/SimulatorNav'

export default function RCDCPage() {
  return (
    <main className="min-h-screen">
      <header className="border-b border-neutral-200 dark:border-neutral-800 px-6 py-3 flex items-center justify-between">
        <div>
          <h1 className="text-lg font-semibold tracking-tight">Resonara</h1>
          <RCDCHeaderSubtitle />
        </div>
        <div className="flex items-center gap-2">
          <RCDCSimulatorNav />
          <RCDCGitHubLink />
          <RCDCLangToggle />
          <RCDCThemeToggle />
        </div>
      </header>

      <div className="max-w-7xl mx-auto px-4 py-6 space-y-6">

        <div className="rounded-xl border border-neutral-200 dark:border-neutral-800 bg-white dark:bg-neutral-900 p-4 flex justify-center">
          <RCDCSchematic />
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="rounded-xl border border-neutral-200 dark:border-neutral-800 bg-white dark:bg-neutral-900 p-4">
            <RCDCParameterPanel />
          </div>

          <div className="space-y-4">
            <div className="rounded-xl border border-neutral-200 dark:border-neutral-800 bg-white dark:bg-neutral-900 p-4">
              <RCDCMetricsGrid />
            </div>
            <div className="rounded-xl border border-neutral-200 dark:border-neutral-800 bg-white dark:bg-neutral-900 p-4">
              <RCDCChargingChart />
            </div>
          </div>
        </div>

      </div>

      <RCDCFooter />
    </main>
  )
}
