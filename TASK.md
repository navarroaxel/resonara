# Plan: Polyharmonic (Poliarmonicos) Mode

## Context
Resonara solves single-frequency sinusoidal RLC circuits. Polyharmonic mode extends this to non-sinusoidal periodic sources (square, triangular, sawtooth, custom) by applying superposition: the circuit is solved independently at each harmonic frequency n·f via the existing `calc()` engine, and all results are summed. The UI gains a harmonic editor panel, a new Spectrum tab, and extensions to existing charts.

---

## 1. New Types — `src/lib/types.ts`

```typescript
export interface HarmonicInput {
  n:    number  // harmonic number (1 = fundamental)
  An:   number  // relative amplitude (0–2, where 1 = same as Vs)
  phin: number  // source phase of this harmonic (degrees 0–360)
}

export interface HarmonicResult {
  n:             number
  fn:            number   // = n * params.f
  Vn:            number   // peak voltage = An * Vs * √2
  Zn:            number   // |Z| at fn
  phin_circuit:  number   // circuit phase angle at fn (degrees)
  In:            number   // peak current = Vn / Zn
}

export interface PolyResult {
  harmonics:  HarmonicResult[]
  I_rms:      number   // √(Σ In²/2)
  V_rms:      number   // √(Σ Vn²/2)
  THD_I:      number   // √(Σ_{n>1} In²) / I1 × 100 (%)
  P_total:    number   // Σ (Vn·In/2)·cos(φn_circuit) (W)
  Qp_total:   number   // VAR
  S_total:    number   // VA
}

export type PolyPreset = 'square' | 'triangle' | 'sawtooth' | 'custom'

// Add 'spectrum' to existing ActiveTab union:
export type ActiveTab = 'bode' | 'phasor' | 'time' | 'power' | 'spectrum'
```

---

## 2. New Engine — `src/lib/poly-engine.ts` (pure TS, no React)

```typescript
// Preset harmonic definitions (An normalized so fundamental = 1):
export const PRESETS: Record<Exclude<PolyPreset,'custom'>, HarmonicInput[]> = {
  square:   [1,3,5,7,9].map(n => ({ n, An: 1/n, phin: 0 })),
  triangle: [1,3,5,7].map((n,i) => ({ n, An: 1/(n*n), phin: i%2===0 ? 0 : 180 })),
  sawtooth: [1,2,3,4,5,6].map(n => ({ n, An: 1/n, phin: n%2===0 ? 180 : 0 })),
}

// Runs existing calc() at each harmonic frequency via params override:
export function calcPolyResult(
  type: CircuitType, params: RLCParams,
  harmonics: HarmonicInput[], flags?: ComponentFlags
): PolyResult

// Superposition in time domain — 200 points over 2 fundamental cycles:
export function calcPolyTimeDomain(
  type: CircuitType, params: RLCParams,
  harmonics: HarmonicInput[], flags?: ComponentFlags
): TimePoint[]   // reuses existing TimePoint type
```

**Math notes:**
- At harmonic n: `paramsN = { ...params, f: n * params.f, Vs: An * params.Vs }`; then call `calc(type, paramsN, flags)`.
- `I_rms = √(Σ In²/2)` where `In` is peak current amplitude.
- `THD_I = √(Σ_{n>1} In²) / I1 × 100`.
- Time-domain superposition: `i(t) = Σ In·sin(n·ω·t − φn_source − φn_circuit·π/180)`.

---

## 3. Store Extension — `src/store/rlc-store.tsx`

Add to `State`:
```typescript
polyMode:    boolean           // default: false
polyPreset:  PolyPreset        // default: 'square'
harmonics:   HarmonicInput[]   // default: PRESETS.square
polyResults: PolyResult | null // null when polyMode=false
```

Add to `Action` union:
```typescript
| { type: 'TOGGLE_POLY_MODE' }
| { type: 'SET_POLY_PRESET'; preset: PolyPreset }
| { type: 'SET_HARMONIC';    index: number; harmonic: Partial<HarmonicInput> }
| { type: 'ADD_HARMONIC' }
| { type: 'REMOVE_HARMONIC'; index: number }
```

Reducer: when `polyMode=true`, also compute `polyResults = calcPolyResult(...)` on every state change that affects params, flags, harmonics, or circuitType.

---

## 4. i18n — `src/lib/i18n.ts`

New keys needed (both `es` and `en`):
```
polyMode, polyModeLabel, harmonicsTitle,
presetSquare, presetTriangle, presetSawtooth, presetCustom,
harmonicN, amplitude, phaseOffset,
addHarmonic, removeHarmonic,
thdLabel, thdCurrent,
spectrumTab, spectrumVoltage, spectrumCurrent,
iRms, pTotal
```

---

## 5. New UI Panel — `src/components/simulator/HarmonicPanel.tsx`

`'use client'` component, reads/dispatches from `useRLC()`.

- **Toggle**: "Modo poliarmonico / Polyharmonic mode" switch (dispatches `TOGGLE_POLY_MODE`).
- When `polyMode=true`:
  - **Preset selector**: 4 buttons — Cuadrada, Triangular, Diente de sierra, Personalizada.
  - **Harmonic list** (visible only in `custom` preset): table with columns `n`, `An` (slider 0–2), `φn` (slider 0–360), remove button. Max 10 harmonics.
  - **Add harmonic** button (disabled at 10).
  - **THD inline**: shows `THD_I` from `polyResults` using `fmt()`.

---

## 6. Modified Charts

### `TimeDomainChart.tsx`
- When `polyMode=true`: call `calcPolyTimeDomain(...)` instead of `calcTimeDomain(...)`.
- Draw composite `v(t)` (solid blue) and composite `i(t)` (dashed green) — same rendering logic.

### `PhasorDiagram.tsx`
- When `polyMode=true`: draw one current phasor per harmonic from origin.
  - Each phasor: length ∝ `In`, angle = `phin_source - phin_circuit`.
  - Color per harmonic: fundamental=blue, 2nd=orange, 3rd=green, 4th=red, ...
  - Legend with `n` label and `In` value.
- When `polyMode=false`: unchanged existing behavior.

### `BodeChart.tsx`
- When `polyMode=true`: overlay colored dot markers at `fn = n·params.f` for each harmonic.
- Use same color scheme as PhasorDiagram.

---

## 7. New Chart — `src/components/charts/HarmonicSpectrum.tsx`

Canvas bar chart, shown in the new **Spectrum** tab (only visible when `polyMode=true`).

- **X-axis**: harmonic number n (1, 2, 3, ...).
- **Two bars per n**: `Vn` (blue, left) and `In` (green, right), auto-scaled Y-axis.
- **Labels**: value above each bar.
- **Annotation**: THD_I displayed prominently.

---

## 8. MetricsGrid — `src/components/simulator/MetricsGrid.tsx`

When `polyMode=true`, replace/supplement metrics with `polyResults`:
- Show `I_rms`, `P_total`, `THD_I` alongside existing layout.
- `fr` and `Q` remain from the single-frequency `results` (they're circuit properties, not source-dependent).

---

## 9. Page Layout — `src/app/page.tsx`

- Add `<HarmonicPanel />` below `<ParameterPanel />` in the left column.
- Add **Spectrum** tab button to the chart tab bar (visible only when `polyMode=true`).
- `activeTab` can now be `'spectrum'`; render `<HarmonicSpectrum />` for that tab.

---

## 10. Tests — `src/lib/__tests__/rlc-engine.test.ts`

Add 3 tests:
1. **Single-harmonic equivalence**: `calcPolyResult` with `[{n:1, An:1, phin:0}]` → `I_rms ≈ results.I / √2`.
2. **THD calculation**: known 2-harmonic input → expected THD_I value.
3. **Time-domain superposition**: 2-harmonic `calcPolyTimeDomain` point at t=0 matches manual formula.

---

## Implementation Order

1. `src/lib/types.ts` — add new types
2. `src/lib/poly-engine.ts` — pure engine + presets
3. `src/lib/__tests__/rlc-engine.test.ts` — engine tests (run `npm test`)
4. `src/store/rlc-store.tsx` — extend state + actions
5. `src/lib/i18n.ts` — add keys
6. `src/components/simulator/HarmonicPanel.tsx` — new panel
7. `src/components/charts/TimeDomainChart.tsx` — poly waveform
8. `src/components/charts/PhasorDiagram.tsx` — stacked phasors
9. `src/components/charts/BodeChart.tsx` — harmonic markers
10. `src/components/charts/HarmonicSpectrum.tsx` — new chart
11. `src/components/simulator/MetricsGrid.tsx` — THD + I_rms
12. `src/app/page.tsx` — wire panel + tab

---

## Verification

1. `npm test` — all 9 tests pass (6 existing + 3 new poly engine tests).
2. Run dev server (`npm run dev`), toggle polyharmonic mode ON with default Square preset.
3. Time-domain chart shows characteristic square-wave approximation.
4. Bode chart shows dot markers at f, 3f, 5f, 7f, 9f.
5. Spectrum tab shows bars for harmonics 1, 3, 5, 7, 9 with correct amplitudes.
6. Phasor tab shows 5 current phasors at different angles and lengths.
7. Switch to Triangular and Sawtooth presets — charts update correctly.
8. Custom mode: add/remove harmonics, change An and φn, verify charts update live.
9. Toggle polyMode OFF — all charts return to single-frequency behavior.
10. Verify both `es`/`en` language strings appear correctly.
