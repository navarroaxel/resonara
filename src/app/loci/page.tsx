"use client";
import { useState } from "react";
import { useUI } from "@/store/ui-store";
import { t } from "@/lib/i18n";
import { SimulatorHeader } from "@/components/ui/SimulatorHeader";
import { Footer } from "@/components/ui/Footer";
import { LociHeaderSubtitle } from "@/components/loci/LociHeaderSubtitle";
import { LociCircuitDiagram } from "@/components/loci/LociCircuitDiagram";
import { LociDiagram } from "@/components/loci/LociDiagram";
import { LociStepCard } from "@/components/loci/LociStepCard";

const TOTAL_STEPS = 11;

export default function LociPage() {
  const [step, setStep] = useState(0);
  const [showZ, setShowZ] = useState(true);
  const [showY, setShowY] = useState(true);
  const [showP, setShowP] = useState(true);
  const {
    state: { lang },
  } = useUI();

  return (
    <main className="min-h-screen">
      <SimulatorHeader>
        <LociHeaderSubtitle />
      </SimulatorHeader>

      <div className="mx-auto max-w-5xl space-y-6 px-4 py-6">
        {/* Circuit schematic */}
        <div className="rounded-xl border border-neutral-200 bg-white p-4 dark:border-neutral-800 dark:bg-neutral-900">
          <LociCircuitDiagram step={step} />
        </div>

        {/* Unified Z+Y diagram */}
        <div className="rounded-xl border border-neutral-200 bg-white p-4 dark:border-neutral-800 dark:bg-neutral-900">
          {/* Layer toggles */}
          <div className="mb-3 flex items-center justify-start gap-3">
            <button
              onClick={() => setShowZ((v) => !v)}
              aria-pressed={showZ}
              className={`rounded-full px-4 py-1.5 text-sm font-medium transition-colors ${
                showZ
                  ? "bg-violet-100 text-violet-700 dark:bg-violet-900/40 dark:text-violet-300"
                  : "bg-neutral-100 text-neutral-400 dark:bg-neutral-800 dark:text-neutral-500"
              }`}
            >
              {t(lang, "lociDiagZPlane")}
            </button>
            <button
              onClick={() => setShowY((v) => !v)}
              aria-pressed={showY}
              className={`rounded-full px-4 py-1.5 text-sm font-medium transition-colors ${
                showY
                  ? "bg-teal-100 text-teal-700 dark:bg-teal-900/40 dark:text-teal-300"
                  : "bg-neutral-100 text-neutral-400 dark:bg-neutral-800 dark:text-neutral-500"
              }`}
            >
              {t(lang, "lociDiagYPlane")}
            </button>
            <button
              onClick={() => setShowP((v) => !v)}
              aria-pressed={showP}
              className={`rounded-full px-4 py-1.5 text-sm font-medium transition-colors ${
                showP
                  ? "bg-rose-100 text-rose-700 dark:bg-rose-900/40 dark:text-rose-300"
                  : "bg-neutral-100 text-neutral-400 dark:bg-neutral-800 dark:text-neutral-500"
              }`}
            >
              {t(lang, "lociDiagPPlane")}
            </button>
          </div>

          <LociDiagram step={step} showZ={showZ} showY={showY} showP={showP} />
        </div>

        {/* Step description + navigation */}
        <LociStepCard
          step={step}
          totalSteps={TOTAL_STEPS}
          onPrev={() => setStep((s) => Math.max(0, s - 1))}
          onNext={() => setStep((s) => Math.min(TOTAL_STEPS - 1, s + 1))}
          lang={lang}
        />
      </div>

      <Footer />
    </main>
  );
}
