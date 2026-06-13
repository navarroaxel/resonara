"use client";
import { t } from "@/lib/i18n";
import type { TKey } from "@/lib/i18n";
import type { Lang } from "@/lib/types";

const STEP_TITLES: TKey[] = [
  "lociStep0Title",
  "lociStep1Title",
  "lociStep2Title",
  "lociStep3Title",
  "lociStep4Title",
  "lociStep5Title",
  "lociStep6Title",
  "lociStep7Title",
  "lociStep8Title",
  "lociStep9Title",
  "lociStep10Title",
];

const STEP_DESCS: TKey[] = [
  "lociStep0Desc",
  "lociStep1Desc",
  "lociStep2Desc",
  "lociStep3Desc",
  "lociStep4Desc",
  "lociStep5Desc",
  "lociStep6Desc",
  "lociStep7Desc",
  "lociStep8Desc",
  "lociStep9Desc",
  "lociStep10Desc",
];

interface LociStepCardProps {
  step: number;
  totalSteps: number;
  onPrev: () => void;
  onNext: () => void;
  lang: Lang;
}

export function LociStepCard({
  step,
  totalSteps,
  onPrev,
  onNext,
  lang,
}: LociStepCardProps) {
  return (
    <div className="rounded-xl border border-neutral-200 bg-white p-4 dark:border-neutral-800 dark:bg-neutral-900">
      {/* Fixed-position nav row — always at the top so buttons never shift */}
      <div className="mb-3 flex items-center justify-between gap-3">
        <button
          onClick={onPrev}
          disabled={step === 0}
          className="rounded-lg border border-neutral-300 px-4 py-1.5 text-base font-medium text-neutral-700 transition-colors hover:bg-neutral-50 disabled:cursor-not-allowed disabled:opacity-40 dark:border-neutral-700 dark:text-neutral-300 dark:hover:bg-neutral-800"
        >
          {t(lang, "lociPrev")}
        </button>

        <h2 className="text-center text-base font-semibold text-neutral-800 dark:text-neutral-200">
          {t(lang, STEP_TITLES[step])}
        </h2>

        <button
          onClick={onNext}
          disabled={step === totalSteps - 1}
          className="rounded-lg bg-neutral-900 px-4 py-1.5 text-base font-medium text-white transition-colors hover:bg-neutral-700 disabled:cursor-not-allowed disabled:opacity-40 dark:bg-neutral-100 dark:text-neutral-900 dark:hover:bg-neutral-300"
        >
          {t(lang, "lociNext")}
        </button>
      </div>

      {/* Step description — variable height, below the fixed nav */}
      <p className="text-base leading-relaxed text-neutral-600 dark:text-neutral-400">
        {t(lang, STEP_DESCS[step])}
      </p>

      {/* Step counter pinned at the bottom */}
      <p className="mt-3 text-right text-xs text-neutral-400 dark:text-neutral-500">
        {step + 1} {t(lang, "lociStepOf")} {totalSteps}
      </p>
    </div>
  );
}
