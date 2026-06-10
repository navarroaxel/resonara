import { RCDCSchematic } from "@/components/rc-dc/RCDCSchematic";
import { RCDCParameterPanel } from "@/components/rc-dc/RCDCParameterPanel";
import { RCDCMetricsGrid } from "@/components/rc-dc/RCDCMetricsGrid";
import { RCDCChargingChart } from "@/components/rc-dc/RCDCChargingChart";
import { RCDCEquationsCard } from "@/components/rc-dc/RCDCEquationsCard";
import { RCDCHeaderSubtitle } from "@/components/rc-dc/RCDCHeaderSubtitle";
import { RCDCFooter } from "@/components/rc-dc/RCDCFooter";
import { SimulatorHeader } from "@/components/ui/SimulatorHeader";

export default function RCDCPage() {
  return (
    <main className="min-h-screen">
      <SimulatorHeader>
        <RCDCHeaderSubtitle />
      </SimulatorHeader>
      <div className="mx-auto grid max-w-7xl grid-cols-1 gap-6 px-4 py-6 md:grid-cols-2">
        <div className="space-y-4">
          <div className="rounded-xl border border-neutral-200 bg-white p-4 dark:border-neutral-800 dark:bg-neutral-900">
            <RCDCSchematic />
          </div>
          <div className="rounded-xl border border-neutral-200 bg-white p-4 dark:border-neutral-800 dark:bg-neutral-900">
            <RCDCParameterPanel />
          </div>
        </div>
        <div className="space-y-4">
          <div className="rounded-xl border border-neutral-200 bg-white p-4 dark:border-neutral-800 dark:bg-neutral-900">
            <RCDCMetricsGrid />
          </div>
          <RCDCEquationsCard />
          <div className="rounded-xl border border-neutral-200 bg-white p-4 dark:border-neutral-800 dark:bg-neutral-900">
            <RCDCChargingChart />
          </div>
        </div>
      </div>
      <RCDCFooter />
    </main>
  );
}
