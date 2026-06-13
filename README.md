# Resonara

Interactive RLC circuit simulator with real-time phasor, Bode, and time-domain analysis.

Built with Next.js 16, React 19, TypeScript 5 strict, Tailwind CSS v4, and Canvas 2D — no runtime chart dependencies.

## Simulators

| Route          | Simulator                                          |
| -------------- | -------------------------------------------------- |
| `/`            | DC Kirchhoff — 3-mesh network                      |
| `/rc-dc`       | RC DC transient                                    |
| `/ac`          | AC RLC series/parallel — phasor, Bode, time-domain |
| `/three-phase` | Three-phase RST                                    |
| `/magnetic`    | Magnetic coupling (transformer)                    |
| `/loci`        | Geometric loci — parallel RLC resonance            |

## Features

- **Series and parallel RLC circuits** with live schematic rendering
- **Optional L/C components** — toggle inductors and capacitors independently via checkboxes
- **Real-time metrics**: impedance, phase angle, current, XL, XC, resonant frequency, Q factor, active power, power factor
- **Resonance detection badge** with inductive/capacitive/resistive classification
- **Bode chart** (impedance vs frequency) with current operating point marker
- **Time-domain chart** — u(t) and i(t) with analytic waveform equations
- **Phasor diagram** with voltage and current component arrows
- **Power triangle** — visual P/Q/S triangle with power-factor readout
- **Geometric loci** — 11-step interactive walkthrough of impedance (Z), admittance (Y), and power (P) planes for parallel RLC resonance
- **Dark mode** (system-aware with manual toggle, no FOUC)
- **EN / ES language toggle** — full bilingual UI including canvas axis labels and footer

## Tech stack

| Layer     | Choice                              |
| --------- | ----------------------------------- |
| Framework | Next.js 16 App Router               |
| UI        | React 19, `'use client'` components |
| Styling   | Tailwind CSS v4 (CSS-first config)  |
| State     | React Context + `useReducer`        |
| Charts    | Canvas 2D (no external library)     |
| Testing   | Jest 30 + `jest-environment-jsdom`  |
| Language  | TypeScript 5 strict                 |

## Getting started

```bash
npm install
npm run dev       # http://localhost:3000
```

```bash
npm test          # run engine unit tests
npm run build     # production build
```

## Project structure

```
src/
├── app/
│   ├── layout.tsx         # RLCProvider, dark-mode FOUC script
│   ├── page.tsx           # top-level layout
│   └── globals.css        # Tailwind v4 + dark-mode variant
├── lib/
│   ├── types.ts           # shared TypeScript types
│   ├── rlc-engine.ts      # pure math: calcSerie, calcParalelo, calc
│   ├── bode.ts            # Bode curve data
│   ├── time-domain.ts     # time-domain sample data
│   ├── i18n.ts            # ES/EN translations
│   ├── utils.ts           # fmt, cn helpers
│   └── __tests__/
│       └── rlc-engine.test.ts
├── store/
│   └── rlc-store.tsx      # RLCContext, RLCProvider, useRLC
└── components/
    ├── simulator/         # CircuitTypeToggle, ParameterPanel, MetricsGrid,
    │                      # ResonanceBadge, ChartTabs, WaveformEquations
    ├── charts/            # BodeChart, TimeDomainChart, PhasorDiagram, PowerChart
    ├── schematic/         # CircuitSchematic (Canvas 2D)
    └── ui/                # ThemeToggle, LangToggle, HeaderSubtitle, GitHubLink, Footer
```

## Engine

The RLC engine (`src/lib/rlc-engine.ts`) is pure TypeScript with no React dependency — safe to test in Node.js.

```ts
import { calc } from "@/lib/rlc-engine";

const result = calc("serie", { Vs: 10, R: 100, L: 0.01, C: 1e-6, f: 1000 });
// → { Z, phi, I, XL, XC, fr, Q, P, pf }
```

`ComponentFlags { hasL, hasC }` controls which reactive components are active. When a component is disabled its reactance is treated as zero (XL=0 for series, BL=0 for parallel).
