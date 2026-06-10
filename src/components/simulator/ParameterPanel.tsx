"use client";
import { useRLC } from "@/store/rlc-store";
import { useUI } from "@/store/ui-store";
import { t, type TKey } from "@/lib/i18n";
import type { RLCParams } from "@/lib/types";
import { useState } from "react";

interface ParamConfig {
  key: keyof RLCParams;
  labelKey: TKey;
  unit: string;
  min: number;
  max: number;
  step: number;
}

const PARAMS: ParamConfig[] = [
  { key: "Vs", labelKey: "labelVs", unit: "V", min: 1, max: 500, step: 1 },
  { key: "R", labelKey: "labelR", unit: "Ω", min: 1, max: 1000, step: 1 },
  { key: "L", labelKey: "labelL", unit: "mH", min: 1, max: 500, step: 1 },
  { key: "C", labelKey: "labelC", unit: "µF", min: 1, max: 1000, step: 1 },
  { key: "f", labelKey: "labelF", unit: "Hz", min: 1, max: 2000, step: 1 },
];

interface ParamRowProps {
  config: ParamConfig;
  value: number;
  enabled: boolean;
  lang: string;
  dispatch: (
    action:
      | { type: "SET_PARAM"; key: keyof RLCParams; value: number }
      | { type: "SET_FLAGS"; flags: object },
  ) => void;
  isL: boolean;
  isC: boolean;
}

function ParamRow({
  config,
  value,
  lang,
  enabled,
  dispatch,
  isL,
  isC,
}: ParamRowProps) {
  const { key, labelKey, unit, min, max, step } = config;
  const hasToggle = isL || isC;

  const [inputText, setInputText] = useState(String(value));
  const [focused, setFocused] = useState(false);

  // When not focused the number input mirrors the store value directly,
  // so no effect is needed to keep inputText in sync.

  function commitInput(text: string) {
    const v = Number(text);
    const clamped = isNaN(v) ? value : Math.min(max, Math.max(min, v));
    dispatch({ type: "SET_PARAM", key, value: clamped });
    setInputText(String(clamped));
  }

  return (
    <div className={!enabled ? "opacity-50" : ""}>
      <div className="mb-1.5 flex items-center justify-between">
        <div className="flex items-center gap-2">
          {hasToggle && (
            <button
              onClick={() =>
                dispatch({
                  type: "SET_FLAGS",
                  flags: isL ? { hasL: !enabled } : { hasC: !enabled },
                })
              }
              className={`h-4 w-8 flex-shrink-0 rounded-full transition-colors ${
                enabled ? "bg-blue-500" : "bg-neutral-300 dark:bg-neutral-600"
              }`}
              aria-label={enabled ? "Disable" : "Enable"}
            >
              <span
                className={`mx-0.5 block h-3 w-3 rounded-full bg-white shadow transition-transform ${
                  enabled ? "translate-x-4" : "translate-x-0"
                }`}
              />
            </button>
          )}
          <span className="text-sm text-neutral-500 dark:text-neutral-400">
            {t(lang as "es" | "en", labelKey)}
          </span>
        </div>

        <div className="flex items-center gap-1">
          <input
            type="number"
            min={min}
            max={max}
            step={step}
            value={focused ? inputText : String(value)}
            disabled={!enabled}
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
            className="w-16 [appearance:textfield] rounded border border-neutral-300 bg-transparent px-1.5 py-0.5 text-right text-sm font-medium text-neutral-900 tabular-nums focus:border-blue-500 focus:outline-none disabled:cursor-not-allowed dark:border-neutral-600 dark:text-neutral-100 [&::-webkit-inner-spin-button]:appearance-none [&::-webkit-outer-spin-button]:appearance-none"
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
        disabled={!enabled}
        onChange={(e) =>
          dispatch({ type: "SET_PARAM", key, value: Number(e.target.value) })
        }
        className="h-1.5 w-full cursor-pointer appearance-none rounded-full bg-neutral-200 accent-blue-500 disabled:cursor-not-allowed dark:bg-neutral-700"
      />
    </div>
  );
}

export function ParameterPanel() {
  const { state, dispatch } = useRLC();
  const {
    state: { lang },
  } = useUI();
  const { flags } = state;

  return (
    <div>
      <h2 className="mb-4 text-xs font-medium tracking-wider text-neutral-400 uppercase">
        {t(lang, "paramsTitle")}
      </h2>
      <div className="space-y-5">
        {PARAMS.map((config) => {
          const { key } = config;
          const isL = key === "L";
          const isC = key === "C";
          const enabled = isL ? flags.hasL : isC ? flags.hasC : true;

          return (
            <ParamRow
              key={key}
              config={config}
              value={state.params[key]}
              enabled={enabled}
              lang={lang}
              dispatch={dispatch as ParamRowProps["dispatch"]}
              isL={isL}
              isC={isC}
            />
          );
        })}
      </div>
    </div>
  );
}
