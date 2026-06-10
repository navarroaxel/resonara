import { MagneticSchematic } from "@/components/magnetic/MagneticSchematic";
import { MagneticParameterPanel } from "@/components/magnetic/MagneticParameterPanel";
import { MagneticMetricsGrid } from "@/components/magnetic/MagneticMetricsGrid";
import { MagneticChartTabs } from "@/components/magnetic/MagneticChartTabs";
import { MagneticEquationsCard } from "@/components/magnetic/MagneticEquationsCard";
import { MagneticHeaderSubtitle } from "@/components/magnetic/MagneticHeaderSubtitle";
import { MagneticFooter } from "@/components/magnetic/MagneticFooter";
import { SimulatorHeader } from "@/components/ui/SimulatorHeader";

export default function MagneticPage() {
  return (
    <main className="min-h-screen">
      <SimulatorHeader>
        <MagneticHeaderSubtitle />
      </SimulatorHeader>
      <div className="mx-auto grid max-w-7xl grid-cols-1 gap-6 px-4 py-6 md:grid-cols-2">
        <div className="space-y-4">
          <div className="rounded-xl border border-neutral-200 bg-white p-4 dark:border-neutral-800 dark:bg-neutral-900">
            <MagneticSchematic />
          </div>
          <div className="rounded-xl border border-neutral-200 bg-white p-4 dark:border-neutral-800 dark:bg-neutral-900">
            <MagneticParameterPanel />
          </div>
        </div>
        <div className="space-y-4">
          <div className="rounded-xl border border-neutral-200 bg-white p-4 dark:border-neutral-800 dark:bg-neutral-900">
            <MagneticMetricsGrid />
          </div>
          <MagneticEquationsCard />
          <div className="rounded-xl border border-neutral-200 bg-white p-4 dark:border-neutral-800 dark:bg-neutral-900">
            <MagneticChartTabs />
          </div>
        </div>
      </div>
      <MagneticFooter />
    </main>
  );
}
