import type { Metadata } from "next";
import { DCSchematic } from "@/components/dc/DCSchematic";
import { DCParameterPanel } from "@/components/dc/DCParameterPanel";
import { DCMetricsGrid } from "@/components/dc/DCMetricsGrid";
import { MeshAnalysisCard } from "@/components/dc/MeshAnalysisCard";
import { KVLCard } from "@/components/dc/KVLCard";
import { KCLCard } from "@/components/dc/KCLCard";
import { DCHeaderSubtitle } from "@/components/dc/DCHeaderSubtitle";
import { DCFooter } from "@/components/dc/DCFooter";
import { SimulatorHeader } from "@/components/ui/SimulatorHeader";

export const metadata: Metadata = {
  title: "Resonara — Kirchhoff CC",
  description:
    "Simulador interactivo de circuitos resistivos con KVL, KCL y análisis de mallas.",
};

export default function DCPage() {
  return (
    <main className="min-h-screen">
      <SimulatorHeader>
        <DCHeaderSubtitle />
      </SimulatorHeader>
      <div className="mx-auto max-w-7xl space-y-6 px-4 py-6">
        <div className="rounded-xl border border-neutral-200 bg-white p-4 dark:border-neutral-800 dark:bg-neutral-900">
          <DCSchematic />
        </div>
        <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
          <div className="rounded-xl border border-neutral-200 bg-white p-4 dark:border-neutral-800 dark:bg-neutral-900">
            <DCParameterPanel />
          </div>
          <div className="space-y-4">
            <div className="rounded-xl border border-neutral-200 bg-white p-4 dark:border-neutral-800 dark:bg-neutral-900">
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
  );
}
