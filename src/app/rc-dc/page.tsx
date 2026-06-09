import { RCDCSchematic }       from '@/components/rc-dc/RCDCSchematic'
import { RCDCParameterPanel }  from '@/components/rc-dc/RCDCParameterPanel'
import { RCDCMetricsGrid }     from '@/components/rc-dc/RCDCMetricsGrid'
import { RCDCChargingChart }   from '@/components/rc-dc/RCDCChargingChart'
import { RCDCEquationsCard }   from '@/components/rc-dc/RCDCEquationsCard'
import { RCDCHeaderSubtitle } from '@/components/rc-dc/RCDCHeaderSubtitle'
import { RCDCFooter }         from '@/components/rc-dc/RCDCFooter'
import { SimulatorNav }       from '@/components/ui/SimulatorNav'
import { SimulatorHeader }    from '@/components/ui/SimulatorHeader'
import { GitHubLink }         from '@/components/ui/GitHubLink'
import { SettingsPanel }      from '@/components/ui/SettingsPanel'

export default function RCDCPage() {
  return (
    <main className="min-h-screen">
      <SimulatorHeader subtitle={<RCDCHeaderSubtitle />}>
        <SimulatorNav />
        <GitHubLink />

        <SettingsPanel />
      </SimulatorHeader>

      <div className="max-w-7xl mx-auto px-4 py-6 grid grid-cols-1 md:grid-cols-2 gap-6">

        <div className="space-y-4">
          <div className="rounded-xl border border-neutral-200 dark:border-neutral-800 bg-white dark:bg-neutral-900 p-4">
            <RCDCSchematic />
          </div>
          <div className="rounded-xl border border-neutral-200 dark:border-neutral-800 bg-white dark:bg-neutral-900 p-4">
            <RCDCParameterPanel />
          </div>
        </div>

        <div className="space-y-4">
          <div className="rounded-xl border border-neutral-200 dark:border-neutral-800 bg-white dark:bg-neutral-900 p-4">
            <RCDCMetricsGrid />
          </div>
          <RCDCEquationsCard />
          <div className="rounded-xl border border-neutral-200 dark:border-neutral-800 bg-white dark:bg-neutral-900 p-4">
            <RCDCChargingChart />
          </div>
        </div>

      </div>

      <RCDCFooter />
    </main>
  )
}
