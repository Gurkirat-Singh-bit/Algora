# Contributing to Algora

Thanks for your interest in improving Algora. This guide covers local setup,
the conventions the codebase follows, and how to add a new visualizer.

## Prerequisites

- [Bun](https://bun.sh) (the project uses `bun.lock`)
- Node 20+ (for tooling compatibility)

## Local setup

```bash
git clone https://github.com/Gurkirat-Singh-bit/Algora.git
cd Algora
bun install
bun run dev        # http://localhost:3000
```

Before opening a pull request:

```bash
bunx tsc --noEmit  # types must pass
bun run lint       # eslint must pass
bun run build      # production build must succeed
```

## Conventions

- **TypeScript everywhere.** No `any` in new code; extend the shared contracts
  in `lib/types.ts` rather than inventing parallel shapes.
- **Algorithms are pure.** Files in `lib/algorithms/*` take input and return a
  `Step[]`. They never touch the DOM, React, or component state. This keeps
  them testable and reusable across visualizers.
- **One accent.** The UI uses a single green accent (see `Docs/DESIGN.md`).
  Reach for borders and tonal shifts before adding color.
- **Match the surrounding code** — naming, spacing, and comment density. Read a
  neighbouring visualizer before writing a new one.

## Adding a new visualizer

1. Write the step generators in `lib/algorithms/<topic>-ops.ts`. Each returns a
   `Step[]` describing the trace (highlight, compare, swap, insert, delete,
   traverse, found, info).
2. Build the component in `src/components/<topic>/<Topic>Visualizer.tsx`. Use
   the shared `useStepRunner` hook, `VisualizerLayout`, and `VizShell` so the
   controls, pseudocode, and step log come for free.
3. Add the route in `src/app/<topic>/page.tsx`.
4. Register it in `constants/navigation.ts` (label, href, icon, category,
   summary) so it appears in the sidebar and curriculum.
5. Verify it on desktop and at a 390px mobile width, in light and dark.

## Commit and PR style

- Keep commits focused and write a clear subject line (imperative mood).
- Describe the *why* in the PR body, not just the *what*.
- Include a before/after note (or screenshot) for any UI change.

## Reporting bugs

Open an [issue](https://github.com/Gurkirat-Singh-bit/Algora/issues) with steps
to reproduce, what you expected, what happened, and your browser + viewport.
