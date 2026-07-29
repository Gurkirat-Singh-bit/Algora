---
name: Algora
description: A precise step-through workspace for learning data structures and algorithms.
colors:
  ink-canvas: "oklch(0.10 0.005 150)"
  ink-surface: "oklch(0.13 0.005 150)"
  ink-panel: "oklch(0.18 0.006 150)"
  ink-elevated: "oklch(0.245 0.007 150)"
  ink-border: "oklch(0.34 0.008 150)"
  chalk-text: "oklch(0.97 0.005 150)"
  forest-signal: "oklch(0.78 0.16 135)"
  compare-blue: "oklch(0.66 0.05 230)"
  delete-red: "oklch(0.68 0.10 25)"
typography:
  display:
    fontFamily: "Geist, ui-sans-serif, system-ui, sans-serif"
    fontSize: "3rem"
    fontWeight: 600
    lineHeight: 1.08
    letterSpacing: "-0.025em"
  title:
    fontFamily: "Geist, ui-sans-serif, system-ui, sans-serif"
    fontSize: "1.25rem"
    fontWeight: 600
    lineHeight: 1.4
    letterSpacing: "-0.02em"
  body:
    fontFamily: "Geist, ui-sans-serif, system-ui, sans-serif"
    fontSize: "0.875rem"
    fontWeight: 400
    lineHeight: 1.57
    letterSpacing: "-0.005em"
  label:
    fontFamily: "Geist Mono, ui-monospace, monospace"
    fontSize: "0.6875rem"
    fontWeight: 500
    lineHeight: 1.45
    letterSpacing: "0.16em"
rounded:
  control: "6px"
  panel: "8px"
spacing:
  control-x: "12px"
  panel: "16px"
  section: "32px"
components:
  button-primary:
    backgroundColor: "{colors.forest-signal}"
    textColor: "{colors.ink-canvas}"
    rounded: "{rounded.control}"
    padding: "6px 12px"
    height: "32px"
  button-outline:
    backgroundColor: "{colors.ink-canvas}"
    textColor: "{colors.chalk-text}"
    rounded: "{rounded.control}"
    padding: "6px 12px"
    height: "32px"
  input:
    backgroundColor: "{colors.ink-panel}"
    textColor: "{colors.chalk-text}"
    rounded: "{rounded.control}"
    padding: "6px 10px"
    height: "32px"
---

# Design System: Algora

## Overview

**Creative North Star: "The Algorithm Workbench"**

Algora feels like a well-organized workbench where every instrument has a clear purpose. A learner studies in a dorm room, classroom, or quiet commute, switching between laptop and phone while keeping the active trace in view. Dark mode supports long evening sessions, while a complete light mode supports classrooms and bright environments.

The system is precise, restrained, and information-dense. It rejects generic developer dashboards, neon cyberpunk algorithm tools, disconnected tutorial pages, novelty controls, heavy glass effects, purple gradients, and motion that delays the task.

**Key Characteristics:**

- Tonal surfaces separate work regions without heavy shadows.
- One forest-green signal identifies the current action.
- Monospaced labels and values make indices and state changes easy to scan.
- Responsive structure keeps controls and active state reachable on narrow screens.
- Motion communicates state changes and respects reduced-motion preferences.

## Colors

The palette uses green-tinted neutrals with one focused forest signal. State colors appear only when the algorithm needs to distinguish an operation.

### Primary

- **Forest Signal:** Marks primary actions, current traversal state, focus, and selected navigation.

### Secondary

- **Compare Blue:** Identifies comparisons without competing with the current-action signal.
- **Delete Red:** Identifies destructive operations and errors.

### Neutral

- **Ink Canvas:** The page background and deepest visual layer.
- **Ink Surface:** Navigation and persistent chrome.
- **Ink Panel:** Inputs, controls, and secondary work regions.
- **Ink Elevated:** Default data cells and raised interactive states.
- **Chalk Text:** Primary text with a slight green tint for softer contrast.

### Named Rules

**The One Signal Rule.** Forest Signal identifies the single most important action in the current view. It is never ambient decoration.

**The State Needs Shape Rule.** Color is always paired with a label, icon, border, or textual explanation.

## Typography

**Display Font:** Geist with system sans fallbacks  
**Body Font:** Geist with system sans fallbacks  
**Label/Mono Font:** Geist Mono with system monospace fallbacks

**Character:** Compact and technical without looking mechanical. The same sans family carries the product hierarchy, while mono is reserved for data, code, indices, and category labels.

### Hierarchy

- **Display** (600, 48px, 1.08): Landing-page headlines only.
- **Headline** (600, 28px, 1.29): Visualizer page titles.
- **Title** (600, 20px, 1.4): Section and panel headings.
- **Body** (400, 14px, 1.57): Instructions and explanations, capped at 65 characters where practical.
- **Label** (500, 10 to 11px, 0.16em, uppercase): Categories and technical metadata.

### Named Rules

**The Data Is Mono Rule.** Indices, values, step counters, code, weights, and complexity notation always use Geist Mono with tabular figures.

## Elevation

Algora is flat by default. Depth comes from tonal steps and one-pixel boundaries. Shadows are reserved for active data cells where a faint state glow helps connect the highlighted value to the current trace.

### Named Rules

**The Tonal Depth Rule.** Move one surface token lighter to create hierarchy. Never add a heavy card shadow to solve a layout problem.

## Components

### Buttons

- **Shape:** Gently squared corners (6px).
- **Primary:** Forest Signal fill with dark ink text and compact horizontal padding.
- **Hover / Focus:** A small tonal change with a clear two-pixel focus ring. Mobile targets expand to at least 44px.
- **Secondary / Ghost:** Hairline borders or transparent surfaces with a panel-toned hover.

### Chips

- **Style:** Compact mono labels with a subtle panel fill and no decorative glow.
- **State:** Selected chips use text and underline changes before adding fill.

### Cards / Containers

- **Corner Style:** Quietly rounded panels (8px).
- **Background:** Ink Surface, Ink Panel, and Ink Elevated define hierarchy.
- **Shadow Strategy:** No default shadows.
- **Border:** One-pixel tinted hairlines.
- **Internal Padding:** 12px for compact controls and 16px to 24px for work regions.

### Inputs / Fields

- **Style:** Ink Panel background, one-pixel boundary, 6px corners, and visible labels.
- **Focus:** Stronger border plus a visible focus ring.
- **Error / Disabled:** Error text and border accompany the state. Disabled fields remain legible.

### Navigation

Desktop navigation uses a collapsible left rail. Mobile navigation uses a top bar and flat drawer. Active routes combine stronger text, a forest icon, and a small state marker. All navigation targets reach at least 44px on touch screens.

### Visualizer Canvas

The canvas, pseudocode, and trace form one synchronized workspace. Desktop may place code beside the canvas. Mobile stacks the canvas first, pins playback within reach, and allows dense tables or graphs to scroll inside their own region.

## Do's and Don'ts

### Do:

- **Do** keep the data state, active code line, and explanation synchronized.
- **Do** pair every state color with text, shape, or position.
- **Do** use tonal surfaces and one-pixel boundaries for hierarchy.
- **Do** test every visualizer at 320px, 390px, 768px, and desktop widths.
- **Do** preserve keyboard operation, visible focus, reduced motion, and 200 percent zoom.

### Don't:

- **Don't** build generic developer dashboards filled with unrelated cards and decorative metrics.
- **Don't** use neon cyberpunk algorithm styling that sacrifices legibility for atmosphere.
- **Don't** separate prose, code, and examples into disconnected learning pages.
- **Don't** add novelty controls, heavy glass effects, purple gradients, or motion that delays the task.
- **Don't** use gradient text, decorative glass panels, colored side stripes, nested cards, or pure black and white.
- **Don't** use an em dash in product copy.
