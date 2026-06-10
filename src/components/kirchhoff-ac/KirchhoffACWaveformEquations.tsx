"use client";
import { useKirchhoffAC } from "@/store/kirchhoff-ac-store";
import { useUI } from "@/store/ui-store";
import { t } from "@/lib/i18n";
import { fmt } from "@/lib/utils";

function phaseStr(angDeg: number): string {
  if (!Number.isFinite(angDeg) || Math.abs(angDeg) < 0.01) return "";
  const sign = angDeg >= 0 ? " + " : " − ";
  return `${sign}${fmt(Math.abs((angDeg * Math.PI) / 180), 3)}`;
}

function WaveRow({
  color,
  name,
  peak,
  angDeg,
  unit,
}: {
  color: string;
  name: string;
  peak: number;
  angDeg: number;
  unit: string;
}) {
  const phi = phaseStr(angDeg);
  return (
    <div className="flex flex-wrap items-baseline gap-1.5">
      <span className={`font-semibold ${color}`}>{name}</span>
      <span className="text-neutral-400">=</span>
      <span className="text-neutral-700 dark:text-neutral-300">
        {fmt(peak, 3)} · sin(ω·t{phi})
      </span>
      <span className="text-xs text-neutral-400">{unit}</span>
    </div>
  );
}

export function KirchhoffACWaveformEquations() {
  const {
    state: { params, results, flags },
  } = useKirchhoffAC();
  const {
    state: { lang },
  } = useUI();
  const { Vs, f } = params;
  const { IR, IZm, IZc } = results;
  const omega = 2 * Math.PI * f;

  return (
    <div className="mb-3 rounded-lg bg-neutral-50 p-3 dark:bg-neutral-800/50">
      <p className="mb-2 text-xs font-medium tracking-wider text-neutral-400 uppercase">
        {t(lang, "kacWaveformEqsTitle")}
      </p>
      <p className="mb-2 font-mono text-xs text-neutral-400">
        ω = {fmt(omega, 2)} rad/s
      </p>
      <div className="space-y-1.5 font-mono text-sm">
        <WaveRow
          color="text-blue-500"
          name="vs(t)"
          peak={Vs * Math.SQRT2}
          angDeg={0}
          unit="V"
        />
        <WaveRow
          color="text-violet-500"
          name="iR(t)"
          peak={IR.mag * Math.SQRT2}
          angDeg={IR.ang}
          unit="A"
        />
        <WaveRow
          color="text-teal-500"
          name="iZm(t)"
          peak={IZm.mag * Math.SQRT2}
          angDeg={IZm.ang}
          unit="A"
        />
        {flags.mesh3 && (
          <WaveRow
            color="text-orange-500"
            name="iZc(t)"
            peak={IZc.mag * Math.SQRT2}
            angDeg={IZc.ang}
            unit="A"
          />
        )}
      </div>
    </div>
  );
}
