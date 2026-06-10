"use client";
import { useDC } from "@/store/dc-store";
import { useUI } from "@/store/ui-store";
import { t } from "@/lib/i18n";
import { fmt } from "@/lib/utils";

export function MeshAnalysisCard() {
  const {
    state: { params, flags, results },
  } = useDC();
  const {
    state: { lang },
  } = useUI();
  const { V1, V2, V3, R1, R2, R3, R4, R5 } = params;
  const { I1, I2, I3, D } = results;
  const { mesh3 } = flags;

  const a11 = R1 + R2;
  const a22 = R2 + R3 + R4;
  const a33 = R4 + R5;

  return (
    <div className="rounded-xl border border-neutral-200 bg-white p-4 dark:border-neutral-800 dark:bg-neutral-900">
      <h2 className="mb-3 text-xs font-medium tracking-wider text-neutral-400 uppercase">
        {t(lang, "meshAnalysisTitle")}
      </h2>

      <p className="mb-2 text-xs text-neutral-500 dark:text-neutral-400">
        {t(lang, "meshEquations")}
      </p>

      <div className="mb-3 space-y-1 font-mono text-xs text-neutral-700 dark:text-neutral-300">
        <div className="flex items-center gap-1">
          <span className="text-violet-600 dark:text-violet-400">
            ({fmt(a11, 0)})
          </span>
          <span>·I₁</span>
          <span className="text-neutral-400">+</span>
          <span className="text-teal-600 dark:text-teal-400">
            ({fmt(-R2, 0)})
          </span>
          {mesh3 ? (
            <>
              <span>·I₂</span>
              <span className="text-neutral-400">+</span>
              <span>(0)·I₃ = {fmt(V1, 1)}</span>
            </>
          ) : (
            <span>·I₂ = {fmt(V1, 1)}</span>
          )}
        </div>
        <div className="flex items-center gap-1">
          <span className="text-violet-600 dark:text-violet-400">
            ({fmt(-R2, 0)})
          </span>
          <span>·I₁</span>
          <span className="text-neutral-400">+</span>
          <span className="text-teal-600 dark:text-teal-400">
            ({fmt(a22, 0)})
          </span>
          {mesh3 ? (
            <>
              <span>·I₂</span>
              <span className="text-neutral-400">+</span>
              <span className="text-orange-600 dark:text-orange-400">
                ({fmt(-R4, 0)})
              </span>
              <span>·I₃ = {fmt(V2, 1)}</span>
            </>
          ) : (
            <span>·I₂ = {fmt(V2, 1)}</span>
          )}
        </div>
        {mesh3 && (
          <div className="flex items-center gap-1">
            <span>(0)·I₁</span>
            <span className="text-neutral-400">+</span>
            <span className="text-teal-600 dark:text-teal-400">
              ({fmt(-R4, 0)})
            </span>
            <span>·I₂</span>
            <span className="text-neutral-400">+</span>
            <span className="text-orange-600 dark:text-orange-400">
              ({fmt(a33, 0)})
            </span>
            <span>·I₃ = {fmt(V3, 1)}</span>
          </div>
        )}
      </div>

      <div className="mb-3 text-xs text-neutral-500 dark:text-neutral-400">
        <span>{t(lang, "meshDeterminant")}: </span>
        <span className="font-mono font-medium text-neutral-700 dark:text-neutral-300">
          {fmt(D, 2)} {mesh3 ? "Ω³" : "Ω²"}
        </span>
      </div>

      <p className="mb-2 text-xs text-neutral-500 dark:text-neutral-400">
        {t(lang, "meshSolution")}
      </p>
      <div className="space-y-1 font-mono text-sm">
        <div>
          <span className="text-violet-600 dark:text-violet-400">I₁</span>
          <span className="text-neutral-700 dark:text-neutral-300">
            {" "}
            = {fmt(I1, 4)} A
          </span>
        </div>
        <div>
          <span className="text-teal-600 dark:text-teal-400">I₂</span>
          <span className="text-neutral-700 dark:text-neutral-300">
            {" "}
            = {fmt(I2, 4)} A
          </span>
        </div>
        {mesh3 && (
          <div>
            <span className="text-orange-600 dark:text-orange-400">I₃</span>
            <span className="text-neutral-700 dark:text-neutral-300">
              {" "}
              = {fmt(I3, 4)} A
            </span>
          </div>
        )}
      </div>
    </div>
  );
}
