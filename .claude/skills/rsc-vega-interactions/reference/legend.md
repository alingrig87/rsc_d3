# Legend interactivity

RSC prop surface (from `LegendOptions` in the installed
`@spectrum-charts/vega-spec-builder` types — re-grep if in doubt, see
`rsc-vega-chart/SKILL.md`'s "Staying in sync"): `highlight`, `isToggleable`,
`position`, `defaultHiddenSeries`, `hiddenEntries`, `legendLabels`,
`descriptions`, `title`, `titleLimit`, `labelLimit`, `align`, `keys`.

Read `rsc-vega-interactions/SKILL.md`'s "empty semantics" section first —
every recipe below depends on it.

## Hover highlight (`<Legend highlight>`)

```json
{
  "params": [
    { "name": "legend_hover", "select": { "type": "point", "fields": ["<colorField>"], "on": "pointerover", "clear": "pointerout" }, "bind": "legend" }
  ]
}
```

```json
{ "opacity": { "condition": { "param": "legend_hover", "value": 1 }, "value": 0.2 } }
```

Default `empty: true` is correct here — nothing hovered means everyone
matches the (empty) selection, so everyone renders at full opacity.

## Click-to-toggle-hide (`<Legend isToggleable>`)

```json
{
  "params": [
    { "name": "legend_toggle", "select": { "type": "point", "fields": ["<colorField>"] }, "bind": "legend" }
  ]
}
```

```json
{ "opacity": { "condition": { "param": "legend_toggle", "empty": false, "value": 0 }, "value": 1 } }
```

**Verified against the actual compiled Vega spec and a live click (don't
trust the `toggle` option here — it does nothing):**

- Vega-Lite **ignores a user-supplied `toggle` value** on a legend-bound
  point selection. It always compiles the click handler to key off the
  browser's native `event.shiftKey`, full stop — passing
  `select: {..., toggle: true}` type-checks and changes nothing at runtime.
  Don't add it; it cargo-cults a no-op and implies a guarantee ("independent
  toggling with a plain click") that isn't real.
- **Plain click** on a legend entry *replaces* the selection — it isolates
  that one series as hidden and un-hides whatever was hidden before. It is
  **not** independent per-entry toggling by itself.
- **Shift+click** adds/removes that entry from the hidden set — this is
  what actually gives you RSC's "click several entries, each stays hidden
  independently" behavior. If a prompt specifically wants a no-modifier
  independent toggle for every click (not just the first), say plainly that
  Vega-Lite's legend binding doesn't support that declaratively — it would
  need a raw Vega spec with a hand-written signal expression instead of a
  `bind: 'legend'` point selection.
- **Click target precision matters.** Only a click that lands on the
  legend's `<colorField>_legend_labels` or `<colorField>_legend_symbols`
  marks registers — confirmed by instrumenting the live Vega `View` and
  inspecting the click signal before/after. The entry's own invisible
  hit-rect (`path.background`, sized to the full label+symbol row) does
  **not** count despite visually covering the same area — a click that
  lands in the row's padding but not on the glyph or swatch itself is
  silently ignored. If building a custom click target overlay, target the
  label text or the symbol shape, not a padding rect around them.
- **The very first click on a legend entry in a freshly-mounted chart can be
  silently swallowed** — confirmed by instrumenting a live `View`: on a
  fresh `vega-embed` mount, click #1 on a legend label sometimes produces no
  signal change at all, while click #2 (same or a different entry)
  reliably registers. A prior *hover* over the same entry does not prevent
  it; only a prior *click* does. This reproduced consistently enough across
  repeated fresh-page loads that it isn't just automation flakiness, but the
  exact trigger wasn't isolated further (view/DOM initialization timing on
  first pointer interaction is the likely culprit). Don't assume a demo's
  first click works — if you're building a click-driven walkthrough or a
  test, warm up with one throwaway click first, and don't report "the
  legend doesn't respond to clicks" from a single first attempt.
- A `bind: 'legend'` selection isn't hover-vs-click-exclusive either way:
  the same compiled spec wires *both* a `pointerover`-driven highlight
  (see the section above) *and* a click-driven set/toggle — so a single
  named param bound to a legend is never "just a hover" or "just a click"
  selection once compiled, regardless of what `on`/`clear` you request.
  This is why the combined-opacity recipe further down works with two
  separate params rather than trying to cram both behaviors into one.

## Both at once (RSC's `highlight isToggleable` together)

Combine in one array on the same encoding channel, toggle-hidden checked
**first** so it wins over hover:

```json
{
  "opacity": {
    "condition": [
      { "param": "legend_toggle", "empty": false, "value": 0 },
      { "param": "legend_hover", "value": 1 }
    ],
    "value": 0.2
  }
}
```

Reading order: (1) if this series was clicked-off, opacity 0, full stop —
even if it's also the currently-hovered one. (2) else, if nothing is
hovered or this is the hovered series, opacity 1. (3) else (hover active,
this isn't the hovered series), fall through to the top-level `value: 0.2`.

Worked example: `interactiveStackedBarSpec` in
[`src/interactiveSpecs.ts`](../../../../src/interactiveSpecs.ts).

## `defaultHiddenSeries` (uncontrolled — starts hidden, user can reveal)

Seed the toggle param's initial `value` with the pre-hidden entries instead
of starting empty:

```json
{ "name": "legend_toggle", "select": { "type": "point", "fields": ["browser"], "toggle": true }, "bind": "legend", "value": [{ "browser": "Edge" }] }
```

## `hiddenEntries` (hide from the legend display only — chart still shows it)

Different from toggle: the series still renders on the chart, it's just not
*listed* in the legend. Use the legend's own `values` allowlist, not a data
filter (a data filter would also remove it from the chart):

```json
{ "color": { "field": "browser", "type": "nominal", "sort": null, "legend": { "title": "Browser", "values": ["Chrome", "Safari", "Firefox"] } } }
```

## `legendLabels` (custom display text per series)

```json
{ "legend": { "labelExpr": "{'Chrome':'Google Chrome','Safari':'Apple Safari'}[datum.label] || datum.label" } }
```

The `|| datum.label` fallback matters — without it, any series not in the
mapping renders a blank legend label instead of its raw value.

## Position / layout

`position` (RSC: `'top'|'bottom'|'left'|'right'`) → Vega-Lite
`legend: {orient: 'top'|'bottom'|'left'|'right'}` (same values, direct
mapping). `columns` for wrapping (RSC computes this from `labelLimit`
automatically; Vega-Lite needs it explicit when the default single-row/
single-column layout looks cramped — see rule 9 in `llmPrompt.ts`: only set
it for 5+ categories, donuts commonly need `columns: 3`). `titleLimit`/
`labelLimit` map straight across as pixel widths.

## `descriptions` (per-series tooltip text on the legend entry itself)

No native Vega-Lite equivalent for a *legend-item* tooltip (as opposed to a
mark tooltip) — Vega-Lite's `tooltip` encoding channel only applies to data
marks, not legend symbols. If asked for this specifically, say so rather
than silently dropping the requirement or faking it on the wrong element.
