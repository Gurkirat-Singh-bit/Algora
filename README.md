<div align="center">

<img src="./public/logo.svg" width="88" height="88" alt="Algora logo" />

# Algora

**A step-through visualizer for data structures and algorithms.**

Pick a topic, run an operation, and scrub the trace. Every step highlights the
active indices, moves the pseudocode pointer, and logs exactly what changed.

[Live demo](https://rkirat-singh.workers.dev) · [Report a bug](https://github.com/Gurkirat-Singh-bit/Algora/issues) · [Contribute](./CONTRIBUTING.md)

</div>

---

## What it does

Algora turns a standard DSA syllabus into 13 interactive visualizers. Each one
runs entirely in the browser: no backend, no account, nothing sent anywhere.

- **Step engine** — play, pause, step forward/back, scrub, and set speed (1–5).
- **Synced views** — the canvas, the pseudocode pointer, and the step log all
  track the current step. Click any log line to jump there.
- **Complexity at a glance** — time and space Big-O for every operation.
- **Draggable graphs** — build your own graph, toggle directed/weighted, and
  watch BFS/DFS traverse it. Import, export, and share via URL.
- **Light and dark** themes, keyboard shortcuts, and PNG export of any frame.

## Topics

| Group | Topics |
|-------|--------|
| Linear | Arrays · Singly / Doubly / Circular Linked Lists · Stack · Queue |
| Algorithms | Recursion · Searching · Sorting |
| Trees & Graphs | Binary Tree · BST · Heap · Graphs |

## Keyboard shortcuts

| Key | Action |
|-----|--------|
| `Space` | Play / pause (or reset when complete) |
| `←` / `→` | Step backward / forward |
| `R` | Reset to the first step |
| `1`–`5` | Set playback speed (slow → fast) |

## Tech stack

- [Next.js 16](https://nextjs.org) (App Router, Turbopack) + React 19
- [Bun](https://bun.sh) for install and scripts
- [Tailwind CSS v4](https://tailwindcss.com)
- [React Flow](https://reactflow.dev) + [dagre](https://github.com/dagrejs/dagre) for node/graph layouts
- [Framer Motion](https://www.framer.com/motion/) for cell transitions
- [Zustand](https://github.com/pmndrs/zustand) for graph state

## Getting started

```bash
# install dependencies
bun install

# start the dev server (http://localhost:3000)
bun run dev

# production build
bun run build && bun run start
```

## Project layout

```
src/app/            route per topic + root layout
src/components/     visualizers, shared UI, primitives
src/hooks/          animation engine, step runner, keyboard controls
lib/algorithms/     pure step-generating functions (return Step[])
lib/types.ts        shared Step / NodeData / Complexity contracts
constants/          navigation + repo config
Docs/               design system + architecture notes
```

See [Docs/DESIGN.md](./Docs/DESIGN.md) for the design system and
[Docs/ARCHITECTURE.md](./Docs/ARCHITECTURE.md) for the build plan.

## Contributing

Contributions are welcome. See [CONTRIBUTING.md](./CONTRIBUTING.md) for setup,
conventions, and how to add a new visualizer.

## License

[MIT](./LICENSE) © 2026 Gurkirat Singh
