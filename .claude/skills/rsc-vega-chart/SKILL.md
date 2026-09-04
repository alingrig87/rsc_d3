---
name: rsc-vega-chart
description: Use when the user asks to create, generate, or build a chart/graph/visualization that must look pixel-identical to Adobe's React Spectrum Charts (@adobe/react-spectrum-charts / @adobe/react-spectrum-charts/rc / /alpha) but implemented with plain vega (^6.2.0), vega-lite (^6.4.2) and vega-embed (^7.1.0) instead of the RSC React library — from a natural-language prompt describing the chart. Covers bar (simple/dodged/stacked), line, area, donut, scatter, combo, bullet, venn, big number, funnel, and every RSC visual token (font, corner radius, band padding, categorical palette). For legend/tooltip/popover interactivity or custom color palettes, this skill hands off to reference/theme-and-colors.md and the sibling rsc-vega-interactions skill. Triggers on "spectrum chart", "RSC chart in vega-lite", "react-spectrum-charts replica", "match RSC design without the library", "vega chart like Adobe Spectrum".
---

# RSC → Vega-Lite chart generator

Turns a natural-language chart request into a Vega-Lite v6 spec (or raw Vega
where Vega-Lite has no equivalent mark) that is visually identical to the
matching `@adobe/react-spectrum-charts` component, rendered through
`vega-embed`. This project (`d:\rsc_d3`) is a working reference
implementation — every rule below was reverse-engineered by building the RSC
component and the Vega-Lite replica side by side in Storybook and diffing
them, not guessed from documentation. Re-scan the installed package instead
of trusting stale memory whenever behavior is in doubt (see "Staying in sync"
at the bottom).

## Versions (pin exactly — don't let a package manager float these)

```json
{ "vega": "^6.2.0", "vega-lite": "^6.4.2", "vega-embed": "^7.1.0" }
```

## The four files that ARE the ruleset — read them, don't re-derive them

| File | What it owns |
|---|---|
| [`src/spectrumVegaTheme.ts`](../../../src/spectrumVegaTheme.ts) | The exact Vega `config` object (fonts, categorical16 palette, axis/legend styling, corner radius, band padding) extracted from RSC's own theme package. `getSpectrumVegaLiteConfig(colorScheme, colors?)` — the `colors` param is the configurable-palette hook, see reference/theme-and-colors.md. |
| [`src/charts.ts`](../../../src/charts.ts) | One canonical Vega-Lite spec per basic chart type (bar, dodged bar, stacked bar, line, area, donut, scatter, combo, bullet, venn, funnel), each with an inline comment explaining the RSC behavior it's matching. |
| [`src/funnelVariants.ts`](../../../src/funnelVariants.ts) | 10 funnel-shape variants — RSC has no native funnel mark, so pick the closest reading (centered taper, continuous silhouette, pyramid, lollipop, etc.) for what the prompt is asking for. |
| [`src/llmPrompt.ts`](../../../src/llmPrompt.ts) | `buildSystemPrompt()` — the same rules as this file, phrased for a chat model with no filesystem access. `formatExample()` strips host-owned fields (`config`/`width`/`height`) from a spec for display. Read this for the terse "rules learned the hard way" list (numbered 1–13); reference/ below extends it with colors/legend/tooltip/popover rules (14+) that aren't needed for the basic chatbot use case `llmPrompt.ts` was built for. |

`src/spectrum/SpectrumCharts.tsx` has the real RSC component for every chart
type in this list (`SpectrumBar`, `SpectrumDonut`, `SpectrumCombo`, …) — when
unsure what a prop does, that file plus the installed package's type
definitions (see "Staying in sync") are the ground truth, not this document.

## Output contract (same one `llmPrompt.ts` teaches a chat model)

Return **only** `data` / `transform` / `mark` / `encoding` / `layer` /
`resolve` / `params` — never `config`, `width`, `height`, or `autosize`. The
host (`VegaLiteChart.tsx`) merges those in from `getSpectrumVegaLiteConfig`
before calling `vega-embed`. When you (Claude) are asked to just "generate a
spec", follow this contract literally — when asked to build the whole
feature (component + spec + story), you own the host-side plumbing too and
this restriction doesn't apply to your own code, only to the fragment a
downstream chat model would emit.

Always render with `embed(el, spec, { actions: false, renderer: 'svg' })` —
`svg`, not `canvas`: corner-radius bars and the rounded-square legend swatch
need crisp vector paths, and RSC itself defaults to SVG.

## Generation procedure

1. **Identify the chart type and RSC component(s)** the prompt implies (bar
   vs dodged vs stacked; line vs area; scatter; donut; combo = bar+line;
   bullet; venn; funnel — RSC-shaped but no native mark; big number = HTML
   number + optional sparkline, not a chart mark at all).
2. **Pull the base spec** from `src/charts.ts` (or `funnelVariants.ts` for a
   funnel) as your starting point — don't re-derive `sort: null`, stack
   order, donut hole ratio, etc. from scratch; those are the rules in
   `llmPrompt.ts` #1–13 and they're already encoded there.
3. **Map the prompt's data** onto the spec's `field` names, updating
   `data.values`, axis titles, and the color/dimension/metric field
   assignments to match what the user described.
4. **Decide interactivity.** Default (nothing requested beyond "a chart"):
   ship the base spec as-is — RSC's own defaults have no hover-highlight,
   no click-to-hide, and a plain per-item tooltip is optional, not automatic
   (RSC only shows a tooltip if a `<ChartTooltip>` child is present). If the
   prompt mentions hovering, clicking legend entries, "highlight the
   series", popovers, or per-point tooltips, hand off to the
   **rsc-vega-interactions** skill for the exact param recipes — don't
   improvise `params`/selections without it, the empty-selection semantics
   are easy to get backwards (see reference/theme-and-colors.md's cross
   references and rsc-vega-interactions/reference/legend.md).
5. **Decide colors.** Default: the stock categorical16 palette, already in
   `getSpectrumVegaLiteConfig`'s `range.category` — do nothing. If the
   prompt asks for specific/branded/custom colors, see
   reference/theme-and-colors.md — this is a **host-level** config change
   (`getSpectrumVegaLiteConfig(colorScheme, customColors)`), never a per-mark
   `scale.range` override inside your fragment.
6. **Check for overlays** — trendlines, reference lines, metric
   ranges/bands, per-point/per-bar annotations, donut center summary,
   segment labels. See reference/annotations-and-overlays.md; these are
   common asks ("add a trendline", "show the target as a dashed line") that
   don't fit neatly into "just a mark type".
7. **Wire it into `<VegaLiteChart>`**: `spec`, `colorScheme`, `width`,
   `height`, optionally `colors` and `onMarkClick`. If building a
   Storybook-style comparison, follow `src/stories/Comparison.tsx` — every
   existing chart story (`Bar.stories.tsx`, `Donut.stories.tsx`, …) is the
   same six-line pattern: `Spectrum` component + `spec` + `chartName`.
8. **Validate**: `npx tsc -b` for type errors, then actually render it (dev
   server or Storybook) and compare against the real `Spectrum*` component
   side by side — a spec that type-checks can still be visually wrong (wrong
   stack order, hollow legend swatch, alphabetical instead of data-order
   categories are the three most common misses).

## Chart-type quick reference

| Ask | RSC component | Base spec in `charts.ts` | Gotcha |
|---|---|---|---|
| Bar chart | `<Bar>` | `barSpec` | `sort: null` on the category field |
| Dodged / grouped bar | `<Bar type="dodged">` | `dodgedBarSpec` | `xOffset` for the sub-groups, not a second `x` |
| Stacked bar | `<Bar type="stacked">` | `stackedBarSpec` | explicit `order` field — default VL stack order is reversed vs RSC |
| Line | `<Line>` | `lineSpec` | no point markers by default; solid legend swatch needs the stroke+fill dual-encoding trick |
| Area | `<Area>` | `areaSpec` | same stack-order fix as stacked bar |
| Donut | `<Donut>` (`/rc`) | `getDonutSpec(w, h)` | holeRatio 0.85, legend reserves height, doesn't shrink the ring |
| Scatter | `<Scatter>` | `scatterSpec` | baseline axis on both x and y |
| Combo (bar+line, dual axis) | `<Combo>` (`/alpha`) | `comboSpec` | `resolve: {scale: {y: 'independent'}}`, second axis `orient: 'right'` |
| Bullet | `<Bullet>` (`/alpha`) | `bulletSpec` | vega-only in RSC too — rect + tick, no native VL bullet mark |
| Venn | `<Venn>` (`/alpha`) | `getVennSpec(w, h)` | hand-placed circles, illustrative overlap only — say so if asked |
| Funnel | no RSC component | `funnelVariants.ts` (10 variants) | pick the variant that matches the prompt's phrasing ("pyramid", "smooth", "minimal", …) |
| Big number / KPI tile | `<BigNumber>` (`/rc`) | `src/spectrum/BigNumberReplica.tsx` pattern | not a chart mark — HTML number + label + optional Line sparkline |

## Staying in sync with the real package

RSC ships full TypeScript types with the actual prop surface — this file and
its reference/ siblings were built by reading them, but the installed
version can drift. Before trusting a claim about a prop you haven't already
seen used in this repo, grep the installed types rather than guessing:

```bash
# every component's props
cat node_modules/@adobe/react-spectrum-charts/dist/@types/components/index.d.ts
# the underlying spec-builder options (the real source of truth for defaults)
find node_modules/@spectrum-charts/vega-spec-builder/dist/@types/src/types -iname "*.d.ts" | grep -v map
```

If a prop in the installed package doesn't match what's described here, the
package won as the source of truth — update this skill (see `general-purpose`
grep patterns above) rather than working around the discrepancy silently.
