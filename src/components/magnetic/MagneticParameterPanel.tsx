"use client";
import { useState } from "react";
import { useMagnetic } from "@/store/magnetic-store";
import { useUI } from "@/store/ui-store";
import { t, type TKey } from "@/lib/i18n";
import type { MagneticParams } from "@/lib/types";

interface ParamConfig {
  key: keyof MagneticParams;
  labelKey: TKey;
  unit: string;
  min: number;
  max: number;
  step: number;
}

const PARAMS: ParamConfig[] = [
  { key: "Vs", labelKey: "magLabelVs", unit: "V", min: 1, max: 500, step: 1 },
  { key: "f", labelKey: "magLabelF", unit: "Hz", min: 1, max: 1000, step: 1 },
  {
    key: "R1",
    labelKey: "magLabelR1",
    unit: "Ω",
    min: 0.1,
    max: 1000,
    step: 0.1,
  },
  { key: "L1", labelKey: "magLabelL1", unit: "mH", min: 1, max: 2000, step: 1 },
  {
    key: "R2",
    labelKey: "magLabelR2",
    unit: "Ω",
    min: 0.1,
    max: 1000,
    step: 0.1,
  },
  { key: "L2", labelKey: "magLabelL2", unit: "mH", min: 1, max: 2000, step: 1 },
  { key: "k", labelKey: "magLabelK", unit: "", min: 0, max: 1, step: 0.01 },
];

interface ParamRowProps {
  config: ParamConfig;
  value: number;
  lang: string;
  onChange: (key: keyof MagneticParams, value: number) => void;
}

function ParamRow({ config, value, lang, onChange }: ParamRowProps) {
  const { key, labelKey, unit, min, max, step } = config;
  const [inputText, setInputText] = useState(String(value));
  const [focused, setFocused] = useState(false);

  function commit(text: string) {
    const v = Number(text);
    const clamped = isNaN(v) ? value : Math.min(max, Math.max(min, v));
    onChange(key, clamped);
    setInputText(String(clamped));
  }

  return (
    <div>
      <div className="mb-1.5 flex items-center justify-between">
        <span className="text-sm text-neutral-500 dark:text-neutral-400">
          {t(lang as "es" | "en", labelKey)}
        </span>
        <div className="flex items-center gap-1">
          <input
            type="number"
            min={min}
            max={max}
            step={step}
            value={focused ? inputText : String(value)}
            onFocus={() => {
              setFocused(true);
              setInputText(String(value));
            }}
            onBlur={() => {
              setFocused(false);
              commit(inputText);
            }}
            onKeyDown={(e) => {
              if (e.key === "Enter") (e.target as HTMLInputElement).blur();
            }}
            onChange={(e) => {
              setInputText(e.target.value);
              const v = Number(e.target.value);
              if (e.target.value !== "" && !isNaN(v) && v >= min && v <= max) {
                onChange(key, v);
              }
            }}
            className="w-16 [appearance:textfield] rounded border border-neutral-300 bg-transparent px-1.5 py-0.5 text-right text-sm font-medium text-neutral-900 tabular-nums focus:border-blue-500 focus:outline-none dark:border-neutral-600 dark:text-neutral-100 [&::-webkit-inner-spin-button]:appearance-none [&::-webkit-outer-spin-button]:appearance-none"
          />
          <span className="w-6 text-xs text-neutral-400 dark:text-neutral-500">
            {unit}
          </span>
        </div>
      </div>
      <input
        type="range"
        min={min}
        max={max}
        step={step}
        value={value}
        onChange={(e) => onChange(key, Number(e.target.value))}
        className="h-1.5 w-full cursor-pointer appearance-none rounded-full bg-neutral-200 accent-blue-500 dark:bg-neutral-700"
      />
    </div>
  );
}

export function MagneticParameterPanel() {
  const { state, dispatch } = useMagnetic();
  const {
    state: { lang },
  } = useUI();
  const { params } = state;

  function handleChange(key: keyof MagneticParams, value: number) {
    dispatch({ type: "SET_PARAM", key, value });
  }

  return (
    <div>
      <h2 className="mb-4 text-xs font-medium tracking-wider text-neutral-400 uppercase">
        {t(lang, "magParamsTitle")}
      </h2>
      <div className="space-y-5">
        {PARAMS.map((config) => (
          <ParamRow
            key={config.key}
            config={config}
            value={params[config.key]}
            lang={lang}
            onChange={handleChange}
          />
        ))}
      </div>
    </div>
  );
}
