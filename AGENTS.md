<!-- BEGIN:nextjs-agent-rules -->
# This is NOT the Next.js you know

This version has breaking changes — APIs, conventions, and file structure may all differ from your training data. Read the relevant guide in `node_modules/next/dist/docs/` before writing any code. Heed deprecation notices.
<!-- END:nextjs-agent-rules -->

# Resonara — project context

RLC circuit simulator. Fully client-side Next.js 16 App Router app. No server-side data fetching, no middleware, no async request APIs.

## Architecture

- **State**: single React Context + `useReducer` in `src/store/rlc-store.tsx`. One `dispatch` call recalculates all derived results immediately — no async state.
- **Engine**: `src/lib/rlc-engine.ts` is pure TypeScript (no React). All circuit math lives here. Test it directly with Jest.
- **Charts**: all four charts (Bode, time-domain, phasor, schematic) use Canvas 2D only. No charting library. Each chart is a `useEffect` that redraws on state change.
- **Dark mode**: class-based (`.dark` on `<html>`). Tailwind v4 needs `@custom-variant dark (&:where(.dark, .dark *))` in `globals.css` — already present. Do not use `dark:` classes without this.
- **i18n**: flat `T[lang][key]` object in `src/lib/i18n.ts`. `t(lang, key)` helper. Lang stored in RLC store, not in a separate context.

## Key invariants

- `ComponentFlags { hasL, hasC }` — when a component is disabled, its reactance is zeroed (XL=0, BL=0), never divided by zero.
- `fmt(n, decimals)` returns `'—'` for non-finite values (NaN fr/Q when components are missing). Use it instead of `.toFixed()` for any derived metric.
- Engine functions accept `flags` as an optional third parameter with `DEFAULT_FLAGS = { hasL: true, hasC: true }` so existing call sites without flags continue to work.
- All canvas draws read `window.matchMedia('(prefers-color-scheme: dark)')` inside `useEffect` — correct because the effect runs client-side after the `.dark` class is applied.

## Testing

`npm test` runs `src/lib/__tests__/rlc-engine.test.ts` — 6 unit tests for series and parallel engines. Keep them green. Do not mock the engine in component tests; prefer testing the engine directly.
