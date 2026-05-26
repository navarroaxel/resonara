import { CircuitTypeToggle } from '@/components/simulator/CircuitTypeToggle'
import { ParameterPanel }    from '@/components/simulator/ParameterPanel'
import { MetricsGrid }       from '@/components/simulator/MetricsGrid'
import { ResonanceBadge }    from '@/components/simulator/ResonanceBadge'
import { ChartTabs }         from '@/components/simulator/ChartTabs'
import { CircuitSchematic }  from '@/components/schematic/CircuitSchematic'
import { ThemeToggle }       from '@/components/ui/ThemeToggle'
import { LangToggle }        from '@/components/ui/LangToggle'
import { HeaderSubtitle }    from '@/components/ui/HeaderSubtitle'
import { GitHubLink }        from '@/components/ui/GitHubLink'

export default function Home() {
  return (
    <main className="min-h-screen">
      <header className="border-b border-neutral-200 dark:border-neutral-800 px-6 py-3 flex items-center justify-between">
        <div>
          <h1 className="text-lg font-semibold tracking-tight">Resonara</h1>
          <HeaderSubtitle />
        </div>
        <div className="flex items-center gap-2">
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

      <footer className="border-t border-neutral-200 dark:border-neutral-800 px-6 py-6 mt-4 text-sm text-neutral-500 dark:text-neutral-400">
        <p className="mb-3">
          Simulador interactivo desarrollado como apoyo didáctico en el marco de la cátedra de{' '}
          <span className="font-medium text-neutral-700 dark:text-neutral-300">Electrotécnica I</span>{' '}
          de la UTN – FRBA.
        </p>
        <ul className="space-y-1">
          <li>
            ¿Querés ver también el campo eléctrico y el método de relajación? Pasá por{' '}
            <a
              href="https://relax-method-viz.vercel.app"
              target="_blank"
              rel="noopener noreferrer"
              className="underline hover:text-neutral-900 dark:hover:text-neutral-100 transition-colors"
            >
              relax-method-viz.vercel.app
            </a>
          </li>
          <li>
            ¿Querés explorar la cinemática y dinámica de la trayectoria circular? Pasá por{' '}
            <a
              href="https://kinelab-theta.vercel.app"
              target="_blank"
              rel="noopener noreferrer"
              className="underline hover:text-neutral-900 dark:hover:text-neutral-100 transition-colors"
            >
              kinelab-theta.vercel.app
            </a>
          </li>
        </ul>
      </footer>
    </main>
  )
}
