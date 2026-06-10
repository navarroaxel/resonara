"use client";
import { createContext, useContext, useReducer, useMemo } from "react";
import { calcKirchhoffAC } from "@/lib/kirchhoff-ac-engine";
import type {
  KirchhoffACParams,
  KirchhoffACFlags,
  KirchhoffACResult,
  KirchhoffACActiveTab,
} from "@/lib/types";

const DEFAULT_PARAMS: KirchhoffACParams = {
  Vs: 220,
  f: 50,
  R1: 2,
  R: 100,
  Rm: 30,
  Lm: 200,
  C: 50,
};
const DEFAULT_FLAGS: KirchhoffACFlags = { mesh3: false };

interface State {
  params: KirchhoffACParams;
  flags: KirchhoffACFlags;
  results: KirchhoffACResult;
  activeTab: KirchhoffACActiveTab;
}

type Action =
  | { type: "SET_PARAM"; key: keyof KirchhoffACParams; value: number }
  | { type: "SET_FLAG"; key: keyof KirchhoffACFlags; value: boolean }
  | { type: "SET_TAB"; activeTab: KirchhoffACActiveTab };

function reducer(state: State, action: Action): State {
  switch (action.type) {
    case "SET_PARAM": {
      const params = { ...state.params, [action.key]: action.value };
      const results = calcKirchhoffAC(params, state.flags);
      return { ...state, params, results };
    }
    case "SET_FLAG": {
      const flags = { ...state.flags, [action.key]: action.value };
      const results = calcKirchhoffAC(state.params, flags);
      return { ...state, flags, results };
    }
    case "SET_TAB":
      return { ...state, activeTab: action.activeTab };
  }
}

const KirchhoffACContext = createContext<{
  state: State;
  dispatch: React.Dispatch<Action>;
} | null>(null);

export function KirchhoffACProvider({
  children,
}: {
  children: React.ReactNode;
}) {
  const [state, dispatch] = useReducer(reducer, {
    params: DEFAULT_PARAMS,
    flags: DEFAULT_FLAGS,
    results: calcKirchhoffAC(DEFAULT_PARAMS, DEFAULT_FLAGS),
    activeTab: "phasor",
  });

  const value = useMemo(() => ({ state, dispatch }), [state]);
  return (
    <KirchhoffACContext.Provider value={value}>
      {children}
    </KirchhoffACContext.Provider>
  );
}

export function useKirchhoffAC() {
  const ctx = useContext(KirchhoffACContext);
  if (!ctx)
    throw new Error("useKirchhoffAC must be used inside KirchhoffACProvider");
  return ctx;
}
