"use client";
import { useState } from "react";
import { useThreePhase } from "@/store/three-phase-store";
import { useUI } from "@/store/ui-store";
import { t, type TKey } from "@/lib/i18n";
import type { ThreePhaseParams } from "@/lib/types";

interface ParamConfig {
  key: keyof ThreePhaseParams;
  labelKey: TKey;
  unit: string;
  min: number;
  max: number;
  step: number;
}

const PARAMS: ParamConfig[] = [
  {
    key: "VL",
    labelKey: "lineVoltageLabel",
    unit: "V",
    min: 100,
    max: 1000,
    step: 1,
  },
  { key: "f", labelKey: "labelF", unit: "Hz", min: 1, max: 500, step: 1 },
  {
    key: "P1_kW",
    labelKey: "tpLabelP1",
    unit: "kW",
    min: 1,
    max: 500,
    step: 1,
  },
  {
    key: "cosPhi1",
    labelKey: "tpLabelCosPhi1",
    unit: "",
    min: 0.5,
    max: 1,
    step: 0.01,
  },
  {
    key: "numLamps",
    labelKey: "tpLabelNumLamps",
    unit: "",
    min: 1,
    max: 300,
    step: 1,
  },
  {
    key: "wattPerLamp",
    labelKey: "tpLabelWattPerLamp",
    unit: "W",
    min: 1,
    max: 1000,
    step: 1,
  },
  {
    key: "cosPhi2",
    labelKey: "tpLabelCosPhi2",
    unit: "",
    min: 0.5,
    max: 1,
    step: 0.01,
  },
  {
    key: "targetFp",
    labelKey: "tpLabelTargetFp",
    unit: "",
    min: 0.5,
    max: 1,
    step: 0.01,
  },
];

interface ParamRowProps {
  config: ParamConfig;
  value: number;
  lang: string;
  dispatch: (action: {
    type: "SET_PARAM";
    key: keyof ThreePhaseParams;
    value: number;
  }) => void;
}

function ParamRow({ config, value, lang, dispatch }: ParamRowProps) {
  const { key, labelKey, unit, min, max, step } = config;

  const [inputText, setInputText] = useState(String(value));
  const [focused, setFocused] = useState(false);

  function commitInput(text: string) {
    const v = Number(text);
    const clamped = isNaN(v) ? value : Math.min(max, Math.max(min, v));
    dispatch({ type: "SET_PARAM", key, value: clamped });
    setInputText(String(clamped));
  }

  return (
    <div>
      <div className="mb-1.5 flex items-center justify-between">
        <span className="text-sm text-neutral-500 dark:text-neutral-400">
          {key === "VL" ? (
            <>
              {t(lang as "es" | "en", "lineVoltageLabel")} U<sub>L</sub>
            </>
          ) : (
            t(lang as "es" | "en", labelKey)
          )}
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
              commitInput(inputText);
            }}
            onKeyDown={(e) => {
              if (e.key === "Enter") (e.target as HTMLInputElement).blur();
            }}
            onChange={(e) => {
              setInputText(e.target.value);
              const v = Number(e.target.value);
              if (e.target.value !== "" && !isNaN(v) && v >= min && v <= max) {
                dispatch({ type: "SET_PARAM", key, value: v });
              }
            }}
            className="w-16 [appearance:textfield] rounded border border-neutral-300 bg-transparent px-1.5 py-0.5 text-right text-sm font-medium text-neutral-900 tabular-nums focus:border-blue-500 focus:outline-none dark:border-neutral-600 dark:text-neutral-100 [&::-webkit-inner-spin-button]:appearance-none [&::-webkit-outer-spin-button]:appearance-none"
          />
          {unit && (
            <span className="w-6 text-xs text-neutral-400 dark:text-neutral-500">
              {unit}
            </span>
          )}
        </div>
      </div>

      <input
        type="range"
        min={min}
        max={max}
        step={step}
        value={value}
        onChange={(e) =>
          dispatch({ type: "SET_PARAM", key, value: Number(e.target.value) })
        }
        className="h-1.5 w-full cursor-pointer appearance-none rounded-full bg-neutral-200 accent-blue-500 dark:bg-neutral-700"
      />
    </div>
  );
}

export function ThreePhaseParameterPanel() {
  const { state, dispatch } = useThreePhase();
  const {
    state: { lang },
  } = useUI();
  const { capacitorsOn } = state.flags;

  return (
    <div>
      <h2 className="mb-4 text-xs font-medium tracking-wider text-neutral-400 uppercase">
        {t(lang, "threePhaseParamsTitle")}
      </h2>

      <div className="mb-5 flex items-center justify-between">
        <span className="text-sm text-neutral-500 dark:text-neutral-400">
          {t(lang, "tpCapacitorsToggle")}
        </span>
        <button
          onClick={() =>
            dispatch({
              type: "SET_FLAGS",
              flags: { capacitorsOn: !capacitorsOn },
            })
          }
          className={`h-4 w-8 flex-shrink-0 rounded-full transition-colors ${
            capacitorsOn ? "bg-blue-500" : "bg-neutral-300 dark:bg-neutral-600"
          }`}
          aria-label={capacitorsOn ? "Disable" : "Enable"}
        >
          <span
            className={`mx-0.5 block h-3 w-3 rounded-full bg-white shadow transition-transform ${
              capacitorsOn ? "translate-x-4" : "translate-x-0"
            }`}
          />
        </button>
      </div>

      <div className="space-y-5">
        {PARAMS.map((config) => (
          <ParamRow
            key={config.key}
            config={config}
            value={state.params[config.key]}
            lang={lang}
            dispatch={dispatch as ParamRowProps["dispatch"]}
          />
        ))}
      </div>
    </div>
  );
}
