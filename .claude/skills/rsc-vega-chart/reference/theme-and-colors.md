# Theme tokens & configurable colors

Source of truth: [`src/spectrumVegaTheme.ts`](../../../../src/spectrumVegaTheme.ts).
Read the file directly for exact numeric values — this doc explains what
each token maps to on the RSC side and how to make colors configurable, it
doesn't re-list every value (they drift; the file doesn't).

## Fixed visual tokens (rarely need changing)

| Token | RSC origin | Notes |
|---|---|---|
| `ADOBE_CLEAN_FONT` | `adobe-clean` font stack with system fallbacks | applies to `config.font`, axis/legend/text/title |
| `CORNER_RADIUS` (6px) | bar top-corner rounding | `cornerRadiusTopLeft`/`cornerRadiusTopRight` at the **mark** level, not config — VL auto-restricts it to the top segment on stacked bars |
| `PADDING_RATIO` (0.4) → `scale.bandPaddingInner`/`bandPaddingOuter` | `getBandPadding()` in RSC's vega-spec-builder | band scale spacing for categorical axes |
| `DEFAULT_DONUT_HOLE_RATIO` (0.85) | `<Donut holeRatio>` default | `innerRadius = outerRadius * holeRatio` |
| `ROUNDED_SQUARE_PATH` | RSC's legend symbol shape | custom SVG path string used as `legend.symbolType` — this is why legend swatches are rounded squares, not the VL default circle/square |
| gray scale, `categorical16`, `divergentOrangeYellowSeafoam15`, `sequentialViridis16` | RSC's `@spectrum-charts/themes` palettes | see "Configurable colors" below for swapping these |

## Sizing model — why `autosize` and `axisX`/`axisY.tickCount` are load-bearing

Two config keys look like minor styling but are actually the single biggest
lever for visual parity, and got there the hard way: by adding RSC's own
`<Chart debug>` prop (it `console.log`s the exact Vega spec RSC generates),
capturing that spec, and diffing it against what our Vega-Lite config
compiles to — not by guessing from the minified `@spectrum-charts/vega-spec-builder`
bundle, which turned out to be an unreliable way to reverse-engineer this
(a first attempt based on reading the minified source alone produced a
formula that fixed one chart type and broke another; the debug-mode capture
gave byte-exact ground truth instead).

**`autosize: {type: 'pad'}`, not Vega-Lite's `'fit'`.** RSC's generated
specs never set `autosize` at all — meaning they get Vega's classic default
(`'pad'`): a fixed-size canvas whose plot area shrinks to make room for
axis/legend chrome. Vega-Lite's `'fit'` mode (this project's setting before
this was fixed) does the opposite — it grows/reflows the canvas around the
content and compiles point/band scale ranges as a *computed step signal*
instead of a plain `[0, width]`/`[0, height]` range. That difference
cascades into two visible things at once: point-scale (Line/Area) outer
padding, and every quantitative axis's tick density — both read the
`width`/`height` view signals, whose actual *value* differs between the two
autosize strategies even with an identical downstream formula. If you ever
need to re-verify this against a newer RSC release, add `debug` to a
`<Chart>` instance, open it in a browser, and read the spec off the
console — don't re-derive it from the bundle.

**`axisX`/`axisY`: `{tickCount: {signal: 'clamp(ceil(<dim>/100), 2, 10)'}}`.**
Confirmed byte-for-byte against RSC's captured spec for Bar, Dodged Bar,
Line, Area, and Scatter — always on the *quantitative* axis, keyed on
`width` for x and `height` for y. RSC never puts this on a categorical
(band/point-scale) axis; setting it there anyway (as this config does, on
both channels unconditionally) is harmless — Vega ignores `tickCount` for
non-continuous scales, since they always show one label per category
regardless.

**Known residual gap:** even with both fixes, a small number of
chart/domain combinations still don't match tick-for-tick (the Line story's
y-axis showed 2 labels on the RSC side vs 4 on the replica in one observed
case, and a Combo chart's secondary/independent y-scale can pick a finer
step than the primary one). The root cause is Vega's own internal
auto-layout pass (how much vertical space a given legend/axis
configuration actually consumes before the `height` signal is finalized)
producing a slightly different final pixel value between RSC's Vega
instance and vega-embed's, even from an identical formula and autosize
strategy — not something further config tuning fixes. Don't chase this
per-chart; it's a minor, accepted variance, not a config bug.

## Configurable colors — mirrors RSC's `<Chart colors={[...]}>`

RSC's real prop: `ChartOptions.colors?: ChartColors` where
`ChartColors = Colors | Colors[]` and
`Colors = ColorScale | string[] | SpectrumColor[]` (a named preset like
`'categorical16'`/`'s2Categorical12'`, a plain CSS-color array, or an array
of Spectrum color tokens like `'blue-700'`). On the Vega-Lite side this repo
only implements the "plain CSS-color array" case (the common one for a
custom/branded palette) — named-preset and Spectrum-token resolution would
need the `@spectrum-charts/themes` package's color lookup tables, which
aren't wired up here.

**This is a host-level config change, never a per-fragment one.**
`getSpectrumVegaLiteConfig(colorScheme, colors?)` takes the optional second
argument:

```ts
export function getSpectrumVegaLiteConfig(colorScheme: 'light' | 'dark' = 'light', colors?: string[]) {
  const categoryRange = colors && colors.length > 0 ? colors : categorical16;
  const defaultColor = categoryRange[0];
  // range.category / range.ordinal, and every mark's default fill/stroke, derive from these two
  ...
}
```

`VegaLiteChart.tsx` exposes this as a `colors?: string[]` prop, threaded
straight through to `getSpectrumVegaLiteConfig` on every render:

```tsx
<VegaLiteChart spec={getInteractiveDonutSpec(w, h)} colors={['rgb(20,122,243)', 'rgb(15,181,174)', ...]} />
```

The RSC equivalent, for a genuine side-by-side comparison:

```tsx
<Chart data={spend} colors={['rgb(20,122,243)', 'rgb(15,181,174)', ...]}>
  <Donut metric="value" color="category" />
</Chart>
```

Worked example: `CUSTOM_DONUT_COLORS` / `getInteractiveDonutSpec` in
[`src/interactiveSpecs.ts`](../../../../src/interactiveSpecs.ts), rendered
side by side with `SpectrumColorDonut` in
[`src/spectrum/SpectrumCharts.tsx`](../../../../src/spectrum/SpectrumCharts.tsx),
shown live in the `Charts/Interactive → CustomColors` Storybook story.

### Rules

- **Never** put a color override inside the `data`/`mark`/`encoding`
  fragment you'd hand to a model under the output contract (e.g. a per-mark
  `scale: {range: [...]}`) just to reskin the whole chart — that fights the
  shared `config.range.category` and produces a chart whose mark colors and
  legend swatch colors can disagree. Colors are a **config**-level concern,
  which is host-owned.
- A **single fixed color** for one series (not the whole palette) is
  different and *does* belong in the fragment — e.g. the combo chart's line
  layer hardcodes `stroke: COMBO_LINE_COLOR` (`rgb(82, 88, 228)`, RSC's own
  indigo-900 in their Combo docs example) because that's what the *specific*
  component instance does, not a palette swap.
- `colorOverride` on RSC's `<Bar>` (a data field naming a literal CSS color
  per row, bypassing the color scale entirely) maps to Vega-Lite's
  `fill: {field: '<colorField>', legend: null}` **without** setting `type`
  to `'nominal'` and instead using no scale — i.e. `scale: null` so the field
  values are used as literal colors, not mapped through a categorical scale.
  Only reach for this if the prompt specifically wants per-row/per-bar
  arbitrary colors, not a categorical series palette.
- Sequential/diverging asks ("color by magnitude", "heat scale") use
  `config.range.ramp`/`diverging` (already populated with
  `sequentialViridis16`/`divergentOrangeYellowSeafoam15`) via
  `scale: {scheme: '...'}` at the encoding level for a one-off — see rule 6
  in `funnelVariants.ts`'s variant 6 (`scale: {scheme: 'teals', reverse: true}`)
  for the pattern when a *specific mark* (not the whole chart) needs a
  quantitative color ramp instead of the shared categorical palette.

## Dark mode

`colorScheme: 'light' | 'dark'` is the first argument to
`getSpectrumVegaLiteConfig` and to every `Spectrum*` component's `theme`
prop — always pass the same value to both sides of a comparison. Don't
hand-roll a second dark palette; the gray-scale and font-color tokens in
`spectrumVegaTheme.ts` already branch on it.
