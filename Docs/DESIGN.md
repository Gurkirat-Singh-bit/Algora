# Design System — DSA Visualizer

A working spec for the in-app design system. Reflects what is actually shipped, not aspirational.

## North star

A precision instrument for understanding algorithms, modeled after the discipline of Vercel-grade developer tooling: tight rhythm, hairline boundaries, monospaced data, sparing color. The student opens a topic, types an input, and watches the structure mutate. Nothing on screen exists for decoration.

**Register:** product. Design serves the visualizer; the visualizer is the product.

## 1. Color

OKLCH palette, slight cool-green tint on every neutral so blacks are not pure `#000` and whites are not pure `#fff`. Forest accent is the only saturated hue.

### Strategy

**Restrained.** Tinted neutrals carry 90%+ of the surface area; the green accent appears only on:
- the active step in the playback,
- primary CTAs,
- traversed/active edges and visited nodes,
- the active sidebar item dot,
- focused inputs.

If you find yourself tinting two things primary in the same view, one of them is wrong.

### Tokens (dark, default)

```
--dsa-bg                oklch(0.10 0.005 150)   canvas
--dsa-surface           oklch(0.13 0.005 150)   header / sidebar
--dsa-card              oklch(0.18 0.006 150)   panel surface
--dsa-panel             oklch(0.21 0.006 150)   secondary panel
--dsa-elevated          oklch(0.245 0.007 150)  default cell fill
--dsa-border            oklch(0.245 0.007 150)  hairline
--dsa-border-strong     oklch(0.34 0.008 150)   focused border / strong divider

--dsa-primary           oklch(0.92 0.06 135)    light text accent
--dsa-primary-container oklch(0.78 0.16 135)    CTA fill, active edge, key tag
--dsa-active            oklch(0.82 0.14 135)    active node fill
--dsa-found             oklch(0.78 0.13 138)    success / found cell
--dsa-compare           oklch(0.66 0.05 230)    compared cell (cool blue tint)
--dsa-insert            oklch(0.68 0.09 290)    insertion highlight
--dsa-delete            oklch(0.68 0.10 25)     deletion / destructive

--dsa-text              oklch(0.97 0.005 150)   body
--dsa-text-strong       oklch(0.985 0.004 150)  display headings
--dsa-muted             oklch(0.66 0.009 150)   secondary text
--dsa-muted-soft        oklch(0.55 0.009 150)   tertiary / labels / line numbers
```

Light scheme exists, lower chroma, same roles. Never use `#fff`/`#000`. Tint everything.

### Accent rule

The accent fill (`primary-container`) earns its place exactly when:
1. Calling the user to act (primary button).
2. Marking the **single** focal value at the current step.
3. Persisting traversal state on edges and visited nodes.

Anywhere else, prefer borders (`border-dsa-border`), tonal shifts (`surface-floor → surface-low → surface-high`), or muted text.

## 2. Typography

**Family:** Geist Sans + Geist Mono. Loaded via `geist/font`. No fallback fonts get rendered before Geist arrives because we set `display: 'swap'` is intentionally **not** used on the body — Geist is a hard requirement for the aesthetic.

**Hierarchy** (≥1.25 ratio between adjacent steps):

| Role | Size | Weight | Tracking | Family |
|------|------|--------|----------|--------|
| Display 2XL | 48 / 56 | 600 | -0.025em | Sans |
| Display XL | 28 / 36 | 600 | -0.025em | Sans |
| Heading L | 20 / 28 | 600 | -0.02em | Sans |
| Body | 14 / 22 | 400 | -0.005em | Sans |
| Body small | 13 / 20 | 400 | -0.005em | Sans |
| Meta | 12 / 18 | 400 | 0 | Sans |
| Label | 10–11 | 500 | 0.16em uppercase | Mono |
| Data | any | 500 | 0.04em | Mono, tabular-nums |

Numbers, indices, sizes, step counters, edge weights, pseudocode line numbers — always Geist Mono with `tabular-nums`. Body line length capped at 65ch.

## 3. Layout

- Sidebar 17rem expanded, 3.5rem collapsed. Hairline divider on the right; no shadow, no gradient.
- Visualizer uses a 2-column shell on lg+: canvas left, code + step log right (22rem). Single column below.
- Canvas always has its own header strip (label + live status) before the geometry.
- Vary spacing. Header pad is generous (`pt-7`); list items are tight (`py-1.5`); algorithm steps in the log are tighter (`py-2`). Same padding everywhere is a smell.

## 4. Surface hierarchy

Tonal layers, no nested cards.

```
bg            → page canvas
surface       → sticky header, sidebar
card          → panels, inputs at rest
panel         → hover state
elevated      → default value cell
```

Boundaries are 1px hairlines (`--dsa-border`). For focus and important separation, step up to `--dsa-border-strong`. Never use heavy shadows for elevation; depth is tonal.

## 5. Components

### Cells (the visualizer atom)
- Default: `--dsa-elevated` fill, hairline border, mono body weight, value in `text-strong`.
- Active states swap fill to a token color (`active`, `compare`, `found`, etc.) and remove the border.
- Active states get a soft drop glow at 18% opacity in the accent hue. No drop shadow on default cells.

### Buttons
- **Primary:** solid `primary-container` fill, dark text (`oklch(0.16 0.020 150)`). 1px inner highlight. No gradient, no glow.
- **Outline:** transparent, hairline border that thickens on hover.
- **Ghost:** muted text, panel fill on hover.
- Heights: 32px default, 28px small. Radius 6px. Tight tracking.

### Inputs
- 32px tall, hairline border, slightly lifted card fill.
- Focused: border thickens to `border-strong`. No outline ring.
- Mono labels above, uppercase tracked.

### Tabs
- Underline tabs (no pill / chip backgrounds). Active tab gets a 1px accent underline that floats 1px below the row.

### Step log
- Numbered list, two-digit zero-padded mono indices.
- Hover row brightens to `card`. Active row gets accent fill at 12% opacity, mono index in accent hue.
- Click row to jump.

### Pseudocode block
- Bordered panel, mono. Header strip with line counter. Active line gets accent fill at 14% opacity.

### Sidebar
- Hairline right border. Sectioned by category in mono uppercase 10/16em-tracked labels.
- Active item: solid `card` fill, strong text, 1px tinted dot on the right edge.
- Collapsed rail keeps icons only, 36×36 hit targets.
- Hidden command hint at the bottom: `Space ←→ R 1-5`.

## 6. Motion

- Easing: cubic-bezier(0.16, 1, 0.3, 1) (ease-out-quint). 200–320ms for layout transitions, 150ms for color/border.
- Cells morph via Framer `layout` between snapshots. No spring overshoot beyond 1.04 scale on focus.
- Edges in the graph view animate (RF `animated`) only on the active compare. Traversed edges stay solid in the dim accent. Past steps keep their state when scrubbing back.

## 7. Bans

- No pure `#000` or `#fff`.
- No gradient text. Solid colors only.
- No side-stripe borders (left or right > 1px as a colored accent).
- No glassmorphism for ambience. The mobile drawer is a flat sheet.
- No nested cards. If you have a panel inside a panel, change one of them to a hairline strip.
- No em dashes in copy.
- No category-reflex coloring (no neon-on-black, no navy-and-gold).

## 8. AI slop test

If a screenshot of any view looks like a generic "developer dashboard template", revise. Check:
- Are values legible at the page's natural reading distance? Cell heights ≥64px on the visualizer.
- Are labels mono and uppercase? Are numbers tabular?
- Does the active step pop without the page screaming for attention everywhere?
- Is there exactly one tinted accent in the field of view (CTA, current step, or active edge — pick one focal)?
- Does the canvas have breathing room around the geometry, or is it cramped against the panel border?
