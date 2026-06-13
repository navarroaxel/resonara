# Resonara

Simulador interactivo de circuitos RLC con análisis fasorial, de Bode y de dominio temporal en tiempo real.

Desarrollado con Next.js 16, React 19, TypeScript 5 estricto, Tailwind CSS v4 y Canvas 2D — sin dependencias de gráficos en tiempo de ejecución.

Desarrollado como apoyo didáctico para la cátedra de **Electrotécnica I** de la UTN – FRBA.

## Simuladores

| Ruta           | Simulador                                               |
| -------------- | ------------------------------------------------------- |
| `/`            | CC Kirchhoff — red de 3 mallas                          |
| `/rc-dc`       | Transitorio RC en CC                                    |
| `/ac`          | RLC CA serie/paralelo — fasores, Bode, dominio temporal |
| `/three-phase` | Trifásico RST                                           |
| `/magnetic`    | Acoplamiento magnético (transformador)                  |
| `/loci`        | Lugares geométricos — resonancia paralelo RLC           |

## Funcionalidades

- **Circuitos RLC serie y paralelo** con representación esquemática en tiempo real
- **Componentes L/C opcionales** — activá o desactivá inductores y capacitores de forma independiente
- **Métricas en tiempo real**: impedancia, ángulo de fase, corriente, XL, XC, frecuencia de resonancia, factor Q, potencia activa, factor de potencia
- **Indicador de resonancia** con clasificación inductivo/capacitivo/resistivo
- **Diagrama de Bode** (impedancia vs frecuencia) con marcador del punto de operación
- **Dominio temporal** — u(t) e i(t) con ecuaciones de onda analíticas
- **Diagrama fasorial** con flechas de tensión y corriente
- **Triángulo de potencias** — representación visual de P/Q/S con lectura del factor de potencia
- **Lugares geométricos** — recorrido interactivo de 11 pasos por los planos de impedancia (Z), admitancia (Y) y potencia (P) para la resonancia en paralelo RLC
- **Modo oscuro** (detecta preferencia del sistema, con alternancia manual y sin FOUC)
- **Selector de idioma ES / EN** — interfaz completamente bilingüe, incluidos ejes de canvas y pie de página

## Stack tecnológico

| Capa      | Tecnología                                |
| --------- | ----------------------------------------- |
| Framework | Next.js 16 App Router                     |
| UI        | React 19, componentes `'use client'`      |
| Estilos   | Tailwind CSS v4 (configuración CSS-first) |
| Estado    | React Context + `useReducer`              |
| Gráficos  | Canvas 2D (sin librería externa)          |
| Testing   | Jest 30 + `jest-environment-jsdom`        |
| Lenguaje  | TypeScript 5 estricto                     |

## Primeros pasos

```bash
npm install
npm run dev       # http://localhost:3000
```

```bash
npm test          # ejecutar tests unitarios del motor
npm run build     # build de producción
```

## Estructura del proyecto

```
src/
├── app/
│   ├── layout.tsx         # RLCProvider, script anti-FOUC para modo oscuro
│   ├── page.tsx           # layout principal
│   └── globals.css        # Tailwind v4 + variante dark-mode
├── lib/
│   ├── types.ts           # tipos TypeScript compartidos
│   ├── rlc-engine.ts      # matemática pura: calcSerie, calcParalelo, calc
│   ├── bode.ts            # datos de la curva de Bode
│   ├── time-domain.ts     # muestras del dominio temporal
│   ├── i18n.ts            # traducciones ES/EN
│   ├── utils.ts           # helpers fmt, cn
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

## Motor de cálculo

El motor RLC (`src/lib/rlc-engine.ts`) es TypeScript puro sin dependencia de React — se puede testear directamente en Node.js.

```ts
import { calc } from "@/lib/rlc-engine";

const resultado = calc("serie", { Vs: 10, R: 100, L: 0.01, C: 1e-6, f: 1000 });
// → { Z, phi, I, XL, XC, fr, Q, P, pf }
```

`ComponentFlags { hasL, hasC }` controla qué componentes reactivos están activos. Cuando un componente está desactivado, su reactancia se trata como cero (XL=0 en serie, BL=0 en paralelo).
