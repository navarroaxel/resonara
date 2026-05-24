Nice simulator overall — the core math structure is clean and consistent, and I like that the engine is pure TS and reused by charts/equations.

Here’s a focused review of **calculus, legends, and formulas**:

## ✅ What looks solid

- **Core RLC equations** for series and parallel are generally correct and internally consistent (`src/lib/rlc-engine.ts`).
- **Flag handling** (`hasL`, `hasC`) is applied in the math paths, avoiding many divide-by-zero cases when components are disabled.
- **Waveform equation signs** match the time-domain implementation:
  - `i(t)` uses `sin(ωt - φ)` logic in both `WaveformEquations` and `calcTimeDomain`.
- `fmt()` usage keeps UI stable when values become non-finite.

---

## ⚠️ Findings

### 1) Parallel inductive/capacitive state is inverted in badge logic (physics bug)
**Where:** `src/components/simulator/ResonanceBadge.tsx` lines ~19–24  
Current logic uses `XL > XC` to label *inductive* in parallel mode.

For **parallel** RLC, behavior depends on susceptance \(B = B_C - B_L = 1/X_C - 1/X_L\), so:
- Inductive net: \(B < 0 \Rightarrow X_L < X_C\)
- Capacitive net: \(B > 0 \Rightarrow X_L > X_C\)

So using `XL > XC` as “inductive” is reversed for parallel.

---

### 2) Parallel legend text is also reversed
**Where:** `src/lib/i18n.ts` lines ~26–28 and ~62–64  
`inductive_para` says current **leads**, and `capacitive_para` says current **lags**.  
That is opposite of standard AC behavior for total current in parallel net behavior.

---

### 3) Formula comment in parallel engine is misleading
**Where:** `src/lib/rlc-engine.ts` line ~37  
Comment says: `Y = 1/R + 1/jXL + jBC`  
This is not standard notation and can confuse maintainers (mixes reactance and susceptance symbols oddly). The implementation is fine, but comment clarity should be improved.

---

### 4) Legends are not localized consistently
**Where:** `src/components/charts/PhasorDiagram.tsx` lines ~68–77, aria label ~93; `CircuitSchematic.tsx` aria label ~177  
Legend text like `"V fuente"`, `"I total"` and ARIA strings are hardcoded in Spanish.  
If UI language is English, this causes UX inconsistency and accessibility mismatch.

---

### 5) Reactive power sign information is lost
**Where:** `src/lib/rlc-engine.ts` lines ~31 and ~59  
`Qp` uses `Math.abs(Math.sin(phiRad))`, so reactive power is always positive magnitude.  
If you want educational/physics clarity, sign (+ inductive / − capacitive) is usually valuable.

---

### 6) Test coverage misses the above classification issue
**Where:** `src/lib/__tests__/rlc-engine.test.ts`  
Current tests validate resonance and magnitude behavior, but not:
- parallel inductive/capacitive classification criteria,
- language label correctness tied to that classification.

Adding these would prevent regressions.
