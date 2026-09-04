---
name: rsc-vega-interactions
description: Use when the user wants to add or change interactive behavior on a Vega-Lite/Vega chart that's meant to match Adobe React Spectrum Charts (@adobe/react-spectrum-charts) — legend hover-highlight, legend click-to-hide/toggle series, legend position/labels/descriptions, per-item or per-dimension tooltips on hover, or a click-triggered popover/detail panel. Companion to the rsc-vega-chart skill (which generates the base spec) — use this one whenever the ask is specifically about hover/click/legend/tooltip/popover behavior on top of a chart, not the chart's basic shape or colors. Triggers on "make the legend toggleable", "highlight series on hover", "add a tooltip", "click to hide a series", "popover on click", "highlightBy dimension".
---

# RSC legend / tooltip / popover interactivity in Vega-Lite

RSC's interactivity is React-side (`<Legend highlight isToggleable>`,
`<ChartTooltip>`, `<ChartPopover>` render props). None of that exists when
rendering with plain `vega-embed` — the equivalent behavior has to be built
from Vega-Lite `params` (selections) and conditional encodings, plus a thin
slice of host code for anything a declarative spec genuinely can't do
(popovers). This skill is the recipe book for that translation, built by
implementing both sides in this repo and comparing them live in Storybook.

**Worked, running examples** (don't reinvent these — copy and adapt):
[`src/interactiveSpecs.ts`](../../../src/interactiveSpecs.ts) next to
[`src/spectrum/SpectrumCharts.tsx`](../../../src/spectrum/SpectrumCharts.tsx)'s
`SpectrumInteractiveBar` / `SpectrumColorDonut`, shown side by side in the
`Charts/Interactive` Storybook stories
([`src/stories/Interactive.stories.tsx`](../../../src/stories/Interactive.stories.tsx)).

## Read these for the actual param syntax

- `reference/legend.md` — hover highlight, click-to-toggle-hide, position/
  columns/labels/descriptions, `defaultHiddenSeries`/`hiddenEntries`.
- `reference/tooltips-and-popovers.md` — default per-item tooltip,
  `highlightBy: 'item'|'series'|'dimension'`, `excludeDataKeys`, and why
  popovers need host code (`VegaLiteChart`'s `onMarkClick` prop).

## The one thing to get right before anything else: `empty` semantics

Every recipe in this skill hinges on Vega-Lite point-selection `empty`
behavior, and it's backwards from intuition in one of the two cases you'll
use constantly:

- **Hover-highlight** (dim everything except what's hovered): leave `empty`
  at its **default** (`true`). An empty selection (nothing hovered) then
  "matches everything" → full opacity for all series when nothing is
  hovered, which is what you want.
- **Click-to-toggle-hide** (hide only what's been clicked): set
  `empty: false` on the encoding condition. An empty selection (nothing
  toggled yet) then matches *nothing* → nobody starts hidden. Forgetting
  this makes every series render invisible the instant the chart loads,
  because the default "empty matches all" reading would hide everything.

Get this backwards and the failure mode is silent — the spec still
type-checks and renders, it just starts in the wrong state. Test the
no-interaction-yet state, not just the interaction itself.

## The second thing to get right: don't trust `toggle` on a legend selection

A `bind: 'legend'` point selection's `select.toggle` option is silently
ignored at runtime — Vega-Lite always uses the browser's native
`event.shiftKey` to decide replace-vs-add for legend clicks, regardless of
what you pass. Verified by compiling the spec and instrumenting a live
`View`'s signals before/after a real click — not a guess. Plain click
isolates one entry (hides it, un-hides whatever was hidden before);
shift+click builds up an independent multi-entry hidden set. See
`reference/legend.md`'s "Click-to-toggle-hide" section for the full
mechanics, including which DOM elements a click actually has to land on
(the label/symbol marks — not the entry's padding/hit-rect, which looks
clickable but isn't wired to anything).

## Chaining multiple interactions on one channel

RSC lets a chart have `highlight` and `isToggleable` on the same `<Legend>`
simultaneously. Two separate `params` (different `select.on` event streams —
`pointerover`/`pointerout` for hover, `click`+`toggle:true` for toggle) can
both `bind: 'legend'` at once — click and hover don't conflict as event
types. Combine them in one `opacity` **condition array**, ordered so a
toggled-hidden series stays hidden even while a different series is
hovered — see `reference/legend.md` for the exact array shape.

## What genuinely can't be done declaratively

A click-triggered floating popover with its own layout (RSC's
`<ChartPopover>`) has no Vega-Lite equivalent — Vega-Lite can select the
clicked datum, but rendering a positioned DOM panel is application code.
`VegaLiteChart.tsx` exposes `onMarkClick(datum, event)` for exactly this;
see `reference/tooltips-and-popovers.md`'s "Popovers" section for the full
pattern, including how the `Interactive.stories.tsx` demo wires it up.
