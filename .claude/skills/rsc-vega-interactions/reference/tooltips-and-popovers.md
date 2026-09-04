# Tooltips & popovers

RSC prop surface: `ChartTooltipOptions` (`highlightBy: 'series'|'dimension'|
'item'|string[]`, `excludeDataKeys`, `targets`) on `<ChartTooltip>`, and
`ChartPopoverOptions` (`width`/`height`, `rightClick`, `UNSAFE_highlightBy`,
`onOpenChange`) on `<ChartPopover>`. Both are nested under a mark component
(`<Bar>`, `<Line>`, `<Donut>`, …) as children — in RSC, **no `<ChartTooltip>`
child means no tooltip at all**, it isn't automatic. On the Vega-Lite side
it's the opposite default: adding a `tooltip` encoding channel is all it
takes, vega-embed renders it via the bundled `vega-tooltip` handler with no
extra config. Match RSC's *opt-in* behavior at the product level — only add
a `tooltip` encoding if the prompt asks for one (or the chart type
conventionally has one), don't add it to every generated spec by reflex.

## Default per-item tooltip (`highlightBy: 'item'`, the default)

```json
{ "tooltip": [
  { "field": "browser", "type": "nominal", "title": "Browser" },
  { "field": "month", "type": "ordinal", "title": "Month" },
  { "field": "share", "type": "quantitative", "title": "Share (%)", "format": ".1f" }
] }
```

One row per encoded field, in the order listed — this is the direct
equivalent of RSC's default `<ChartTooltip>` content (no render-prop
children = show every encoded field as a labeled row). Field `title`s should
read the same as the chart's own axis/legend titles for consistency.

## `highlightBy: 'series'` (hovering one series highlights every point of it)

A `point` selection keyed on the color field, `nearest: true`, applied as an
opacity condition on the mark itself (not the legend) — same shape as the
legend hover recipe in `legend.md`, just triggered by hovering the mark
instead of the legend symbol:

```json
{
  "params": [{ "name": "series_hover", "select": { "type": "point", "fields": ["browser"], "on": "pointerover", "clear": "pointerout", "nearest": true } }],
  "encoding": { "opacity": { "condition": { "param": "series_hover", "value": 1 }, "value": 0.2 } }
}
```

## `highlightBy: 'dimension'` (hovering anywhere near an x highlights every series at that x)

This is the standard Vega-Lite "multi-series tooltip" pattern — needs an
invisible per-x hit-target layer (so `nearest` snaps to an x value
regardless of which series' line is visually closest), a rule mark for the
hover column, and a points layer carrying the actual tooltip content:

```json
{
  "layer": [
    { "mark": "line", "encoding": { "y": {...}, "color": {...} } },
    {
      "mark": { "type": "point", "opacity": 0 },
      "params": [{ "name": "dim_hover", "select": { "type": "point", "fields": ["month"], "nearest": true, "on": "pointerover", "clear": "pointerout" } }]
    },
    {
      "transform": [{ "filter": { "param": "dim_hover" } }],
      "mark": "rule"
    },
    {
      "transform": [{ "filter": { "param": "dim_hover" } }],
      "mark": { "type": "point", "filled": true },
      "encoding": { "color": {...}, "tooltip": [ ... ] }
    }
  ]
}
```

Full working version: `interactiveLineDimensionHighlightSpec` in
[`src/interactiveSpecs.ts`](../../../../src/interactiveSpecs.ts), shown live
in the `Charts/Interactive → LineDimensionHighlight` Storybook story. This is
what RSC's `<Line interactionMode="dimension">` +
`<ChartTooltip highlightBy="dimension">` renders — reach for it when a
prompt says "hover to compare all series" rather than "hover a single line".

## `excludeDataKeys` (suppress the tooltip for specific rows)

RSC: rows where any of these keys are truthy get no tooltip at all. Vega-Lite
has no per-row tooltip toggle — approximate with a conditional `tooltip`
encoding that resolves to `null` for excluded rows, or (cleaner) split into
two mark layers, one with `tooltip` and one without, each filtered by the
exclude condition — the same "text mark can't take data-driven styling"
workaround shape as `llmPrompt.ts` rule 10.

## Popovers (`<ChartPopover>`) — the one thing that needs host code

Vega-Lite/vega-embed can select the clicked datum but can't render a
positioned floating panel — that's DOM layout, not chart spec. Two pieces:

1. **In the spec**, nothing special is required beyond a `cursor: 'pointer'`
   mark property as an affordance (see `interactiveStackedBarSpec`) — the
   click event is available on any mark with a backing datum regardless.
2. **In the host**, `VegaLiteChart` exposes
   `onMarkClick?: (datum, event: MouseEvent) => void`, wired internally via
   `view.addEventListener('click', (event, item) => item?.datum && onMarkClick(item.datum, event))`.
   Use `event.clientX`/`clientY` (or the target element's bounding box) to
   position your own popover/menu component — a React portal, a floating-ui
   anchor, whatever the host app already uses for popovers elsewhere. Don't
   try to render popover content as Vega marks.

```tsx
<VegaLiteChart
  spec={interactiveStackedBarSpec}
  onMarkClick={(datum, event) => openPopoverAt(event.clientX, event.clientY, datum)}
/>
```

Worked (simplified) example: `Charts/Interactive → LegendAndTooltip` in
[`src/stories/Interactive.stories.tsx`](../../../../src/stories/Interactive.stories.tsx) —
it stands in a plain text readout for `openPopoverAt` to keep the demo
dependency-free, but the click wiring is the real pattern; swap in an actual
floating panel component for production use.

RSC's `rightClick` option is the same idea bound to the `contextmenu` event
instead of `click` — same `view.addEventListener('contextmenu', ...)` shape,
remembering to call `event.preventDefault()` to suppress the native browser
menu.
