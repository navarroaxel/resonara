import { CircuitTypeToggle } from "@/components/simulator/CircuitTypeToggle";
import { ParameterPanel } from "@/components/simulator/ParameterPanel";
import { HarmonicPanel } from "@/components/simulator/HarmonicPanel";
import { MetricsGrid } from "@/components/simulator/MetricsGrid";
import { ResonanceBadge } from "@/components/simulator/ResonanceBadge";
import { ChartTabs } from "@/components/simulator/ChartTabs";
import { RLCEquationsCard } from "@/components/simulator/RLCEquationsCard";
import { CircuitSchematic } from "@/components/schematic/CircuitSchematic";
import { HeaderSubtitle } from "@/components/ui/HeaderSubtitle";
import { SimulatorHeader } from "@/components/ui/SimulatorHeader";
import { Footer } from "@/components/ui/Footer";

export default function Home() {
  return (
    <main className="min-h-screen">
      <SimulatorHeader>
        <HeaderSubtitle />
      </SimulatorHeader>
      <div className="mx-auto grid max-w-7xl grid-cols-1 gap-6 px-4 py-6 md:grid-cols-2">
        <div className="space-y-4">
          <div className="rounded-xl border border-neutral-200 bg-white p-4 dark:border-neutral-800 dark:bg-neutral-900">
            <CircuitTypeToggle />
            <CircuitSchematic />
          </div>
          <div className="rounded-xl border border-neutral-200 bg-white p-4 dark:border-neutral-800 dark:bg-neutral-900">
            <ParameterPanel />
          </div>
          <HarmonicPanel />
        </div>

        <div className="space-y-4">
          <div className="rounded-xl border border-neutral-200 bg-white p-4 dark:border-neutral-800 dark:bg-neutral-900">
            <ResonanceBadge />
            <MetricsGrid />
          </div>
          <RLCEquationsCard />
          <div className="rounded-xl border border-neutral-200 bg-white p-4 dark:border-neutral-800 dark:bg-neutral-900">
            <ChartTabs />
          </div>
        </div>
      </div>
      <Footer />
    </main>
  );
}
