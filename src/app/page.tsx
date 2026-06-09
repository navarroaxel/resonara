import type { Metadata } from 'next'
import { DCSchematic }      from '@/components/dc/DCSchematic'
import { DCParameterPanel } from '@/components/dc/DCParameterPanel'
import { DCMetricsGrid }    from '@/components/dc/DCMetricsGrid'
import { MeshAnalysisCard } from '@/components/dc/MeshAnalysisCard'
import { KVLCard }          from '@/components/dc/KVLCard'
import { KCLCard }          from '@/components/dc/KCLCard'
import { DCHeaderSubtitle } from '@/components/dc/DCHeaderSubtitle'
import { DCFooter }         from '@/components/dc/DCFooter'
import { SimulatorNav }     from '@/components/ui/SimulatorNav'
import { SimulatorHeader }  from '@/components/ui/SimulatorHeader'
import { GitHubLink }       from '@/components/ui/GitHubLink'
import { SettingsPanel }      from '@/components/ui/SettingsPanel'

export const metadata: Metadata = {
  title: 'Resonara — Kirchhoff CC',
  description: 'Simulador interactivo de circuitos resistivos con KVL, KCL y análisis de mallas.',
}

export default function DCPage() {
  return (
    <main className="min-h-screen">
      <SimulatorHeader subtitle={<DCHeaderSubtitle />}>
        <SimulatorNav />
        <GitHubLink />

        <SettingsPanel />
      </SimulatorHeader>

      <div className="max-w-7xl mx-auto px-4 py-6 space-y-6">

        <div className="rounded-xl border border-neutral-200 dark:border-neutral-800 bg-white dark:bg-neutral-900 p-4">
          <DCSchematic />
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="rounded-xl border border-neutral-200 dark:border-neutral-800 bg-white dark:bg-neutral-900 p-4">
            <DCParameterPanel />
          </div>

          <div className="space-y-4">
            <div className="rounded-xl border border-neutral-200 dark:border-neutral-800 bg-white dark:bg-neutral-900 p-4">
              <DCMetricsGrid />
            </div>
            <MeshAnalysisCard />
            <KVLCard />
            <KCLCard />
          </div>
        </div>

      </div>

      <DCFooter />
    </main>
  )
}
