import { ConnectionTypeToggle } from "@/components/three-phase/ConnectionTypeToggle";
import { ThreePhaseSchematic } from "@/components/three-phase/ThreePhaseSchematic";
import { ThreePhaseParameterPanel } from "@/components/three-phase/ThreePhaseParameterPanel";
import { ThreePhaseMetricsGrid } from "@/components/three-phase/ThreePhaseMetricsGrid";
import { ThreePhaseChartTabs } from "@/components/three-phase/ThreePhaseChartTabs";
import { ThreePhaseHeaderSubtitle } from "@/components/three-phase/ThreePhaseHeaderSubtitle";
import { ThreePhaseFooter } from "@/components/three-phase/ThreePhaseFooter";
import { SimulatorHeader } from "@/components/ui/SimulatorHeader";

export default function ThreePhasePage() {
  return (
    <main className="min-h-screen">
      <SimulatorHeader>
        <ThreePhaseHeaderSubtitle />
      </SimulatorHeader>
      <div className="mx-auto grid max-w-7xl grid-cols-1 gap-6 px-4 py-6 md:grid-cols-2">
        <div className="space-y-4">
          <div className="rounded-xl border border-neutral-200 bg-white p-4 dark:border-neutral-800 dark:bg-neutral-900">
            <ConnectionTypeToggle />
            <ThreePhaseSchematic />
          </div>
          <div className="rounded-xl border border-neutral-200 bg-white p-4 dark:border-neutral-800 dark:bg-neutral-900">
            <ThreePhaseParameterPanel />
          </div>
        </div>
        <div className="space-y-4">
          <div className="rounded-xl border border-neutral-200 bg-white p-4 dark:border-neutral-800 dark:bg-neutral-900">
            <ThreePhaseMetricsGrid />
          </div>
          <div className="rounded-xl border border-neutral-200 bg-white p-4 dark:border-neutral-800 dark:bg-neutral-900">
            <ThreePhaseChartTabs />
          </div>
        </div>
      </div>
      <ThreePhaseFooter />
    </main>
  );
}
