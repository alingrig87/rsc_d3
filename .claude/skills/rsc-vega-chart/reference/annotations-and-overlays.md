# Annotations & overlays

None of these are implemented as worked examples in `src/charts.ts` yet —
this is reference knowledge (scanned from the installed package's types
under `node_modules/@spectrum-charts/vega-spec-builder/dist/@types/src/types/`)
for when a prompt asks for one. Each RSC option below is the *real* prop
surface (re-grep the installed types if it may have drifted — see the
bottom of `rsc-vega-chart/SKILL.md`), followed by the Vega-Lite pattern that
reproduces it.

## Trendline (`<Trendline>`, nested under `<Line>` or `<Scatter>`)

RSC options worth knowing: `method` (`'average'|'median'` via joinaggregate,
`'linear'|'exponential'|'logarithmic'|'power'|'quadratic'|'polynomial-N'` via
regression, or `'movingAverage-N'` via window), `dimensionExtent` (extend to
`'domain'` or clip to the data), `lineType`/`lineWidth`, `displayOnHover`
(+`displayOnHoverTrigger: 'nearest'|'item'|'dimension'`), `color` (defaults
to the parent series' color).

Vega-Lite pattern — a second `layer` sharing the same `x`/color scale, using
a `transform: [{regression: 'y', on: 'x', method: 'linear'|'poly'|...}]` (VL
has this built in for the regression methods) or
`transform: [{loess: ...}]` for smoothing, or a `window`/`joinaggregate`
transform for moving-average / average-line methods — VL's own transform
vocabulary maps close to 1:1 onto RSC's `TrendlineMethod` union:

```json
{
  "layer": [
    { "mark": "line", "encoding": { "x": {...}, "y": {...}, "color": {...} } },
    {
      "transform": [{ "regression": "share", "on": "monthIndex", "method": "linear" }],
      "mark": { "type": "line", "strokeDash": [4, 2] },
      "encoding": { "x": {"field": "monthIndex", "type": "quantitative"}, "y": {"field": "share", "type": "quantitative"} }
    }
  ]
}
```

Note VL's `regression` transform needs a **quantitative** x — if the base
chart's x is ordinal/temporal categories, add a calculated numeric index
field first and use it only for the trendline layer's x, keeping the visible
axis on the original field.

## Reference line (`<ReferenceLine>`, nested under `<Axis>`)

RSC options: `value` (axis position), `icon`, `label`/`labelColor`/
`labelFontWeight`, `position: 'before'|'after'|'center'` (bar charts only),
`layer: 'front'|'back'`, `lineType`.

Vega-Lite pattern — a `rule` mark with a fixed `datum` (not `field`) on the
relevant axis channel, layered `before` or `after` the main mark depending on
RSC's `layer` prop:

```json
{ "mark": {"type": "rule", "color": "rgb(211, 21, 16)", "strokeDash": [4, 2]}, "encoding": {"y": {"datum": 1000, "type": "quantitative"}} }
```

Add a `text` mark layer for the label if `label` is set (RSC draws it on the
axis itself — approximate by placing the text at the rule's edge).

## Metric range (`<MetricRange>`, nested under `<Line>`)

RSC options: `metricStart`/`metricEnd` (band edges), `metric` (center line,
optional), `rangeOpacity`, `displayOnHover: boolean | 'metric' | 'range'`,
`hoverPoint`, `scaleAxisToFit`.

Vega-Lite pattern — an `errorband`-style `area` layer between `metricStart`
(y) and `metricEnd` (y2), plus an optional `line` layer for `metric`:

```json
{
  "layer": [
    { "mark": {"type": "area", "opacity": 0.2}, "encoding": {"y": {"field": "metricStart", "type": "quantitative"}, "y2": {"field": "metricEnd"}} },
    { "mark": "line", "encoding": {"y": {"field": "metric", "type": "quantitative"}} }
  ]
}
```

For `displayOnHover`, combine with the hover-selection pattern in the
rsc-vega-interactions skill's `legend.md`/`tooltips-and-popovers.md` —
conditional `opacity` keyed off a `point` selection on the parent line's
series, not the legend.

## Per-point / per-bar annotations

- **`<BarAnnotation textKey>`** (nested under `<Bar>`) — a `text` mark layer
  positioned at the bar's top (or center, if it fits), reading `textKey`'s
  field. See `centeredLabelLayer()` in
  [`funnelVariants.ts`](../../../../src/funnelVariants.ts) for the exact
  "text mark can't take data-driven `align`/`dx`/`color`" workaround (rule
  10 in `llmPrompt.ts`) — split into filtered layers instead of one
  conditional layer.
- **`<LinePointAnnotation textKey anchor>`** / **`<ScatterAnnotation
  textKey anchor>`** — a `text` mark layer at each point, `dy` offset per
  the requested `anchor` (`'top'|'bottom'|'left'|'right'|'top-left'|...`,
  matching Vega's own `LabelAnchor` union — RSC reuses it directly). No
  built-in "try anchors in order until it fits" collision avoidance exists
  in Vega-Lite; pick the single best anchor for the data shape instead of
  attempting RSC's fallback-list behavior.

## Donut center content (`<DonutSummary>`, `<SegmentLabel>`, nested under `<Donut>`)

- **`DonutSummary`** — RSC draws the aggregate value + label in the donut's
  hole. Vega-Lite has no "center of an arc" anchor; add a `text` mark layer
  with `x`/`y` pinned to the chart's center (`width/2`, `height/2` as
  `datum` values, matching the `getVennSpec` hand-placement pattern in
  `charts.ts`) rather than trying to derive it from the arc encoding.
- **`SegmentLabel`** (`percent`/`value`, with d3 format specifiers) — a
  `text` mark layer with `theta`/`radius` positioning (Vega-Lite arc marks
  support a `text` mark sharing the same `theta`/`theta2` encoding, radius
  offset via `radius`) showing a `calculate`d percentage or the raw value,
  formatted with the same d3 format string RSC would use (`numberFormat`
  values like `'currency'`/`'shortNumber'`/`'standardNumber'` map to d3
  format specifiers — ask for the exact spec if the prompt names one, don't
  guess a format string).

## Scatter path (`<ScatterPath>`, nested under `<Scatter>`)

Connects points within a `groupBy` group with lines (e.g. tracing a
trajectory through scatter points). Vega-Lite: add a `line` mark layer over
the same data, `detail: {field: groupByField}` to keep separate groups from
being connected to each other, ordered by whatever field defines path order
(usually the dimension/time field already on the x-axis).
