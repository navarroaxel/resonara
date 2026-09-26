"use client";
import { createContext, useContext, useReducer, useMemo } from "react";
import { calcThreePhase } from "@/lib/three-phase-engine";
import type {
  ThreePhaseParams,
  ThreePhaseResult,
  ThreePhaseActiveTab,
  ThreePhaseFlags,
} from "@/lib/types";

const DEFAULT_PARAMS: ThreePhaseParams = {
  VL: 380,
  f: 50,
  P1_kW: 56,
  cosPhi1: 0.7,
  numLamps: 20,
  wattPerLamp: 150,
  cosPhi2: 0.6,
  targetFp: 0.85,
};
const DEFAULT_FLAGS: ThreePhaseFlags = { capacitorsOn: false };

interface State {
  params: ThreePhaseParams;
  flags: ThreePhaseFlags;
  activeTab: ThreePhaseActiveTab;
  results: ThreePhaseResult;
}

type Action =
  | { type: "SET_PARAM"; key: keyof ThreePhaseParams; value: number }
  | { type: "SET_FLAGS"; flags: Partial<ThreePhaseFlags> }
  | { type: "SET_TAB"; activeTab: ThreePhaseActiveTab };

function reducer(state: State, action: Action): State {
  switch (action.type) {
    case "SET_PARAM": {
      const params = { ...state.params, [action.key]: action.value };
      const results = calcThreePhase(params, state.flags.capacitorsOn);
      return { ...state, params, results };
    }
    case "SET_FLAGS": {
      const flags = { ...state.flags, ...action.flags };
      const results = calcThreePhase(state.params, flags.capacitorsOn);
      return { ...state, flags, results };
    }
    case "SET_TAB":
      return { ...state, activeTab: action.activeTab };
  }
}

const ThreePhaseContext = createContext<{
  state: State;
  dispatch: React.Dispatch<Action>;
} | null>(null);

export function ThreePhaseProvider({
  children,
}: {
  children: React.ReactNode;
}) {
  const [state, dispatch] = useReducer(reducer, {
    params: DEFAULT_PARAMS,
    flags: DEFAULT_FLAGS,
    activeTab: "phasor",
    results: calcThreePhase(DEFAULT_PARAMS, DEFAULT_FLAGS.capacitorsOn),
  });

  const value = useMemo(() => ({ state, dispatch }), [state]);
  return (
    <ThreePhaseContext.Provider value={value}>
      {children}
    </ThreePhaseContext.Provider>
  );
}

export function useThreePhase() {
  const ctx = useContext(ThreePhaseContext);
  if (!ctx)
    throw new Error("useThreePhase must be used inside ThreePhaseProvider");
  return ctx;
}
