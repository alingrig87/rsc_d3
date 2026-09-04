import type { VisualizationSpec } from 'vega-embed';
import { browserTrend, spend } from './data';

// react-spectrum-charts keeps categories/series in data order (see charts.ts
// for the long-form explanation) — every nominal field driving x/color here
// gets the same `sort: null` treatment.
const browserStackOrder = {
  calculate: "{'Chrome':0,'Safari':1,'Firefox':2,'Edge':3}[datum.browser]",
  as: 'stackOrder',
} as const;
const orderByStack = { field: 'stackOrder', type: 'quantitative' } as const;
const baselineAxis = { labelAngle: 0, domain: true } as const;

/**
 * Stacked bar with the full RSC legend interaction set:
 *  - `<Legend highlight>`    -> hovering any bar or legend entry dims the
 *                               other series (a legend-bound Vega-Lite
 *                               selection highlights from both directions)
 *  - `<Legend isToggleable>` -> click a legend entry to isolate it as
 *                               hidden (replaces any previously hidden
 *                               entry); shift+click to build up an
 *                               independent multi-entry hidden set — see
 *                               rsc-vega-interactions/reference/legend.md,
 *                               plain `toggle: true` does NOT give
 *                               independent per-click toggling, Vega-Lite
 *                               ignores that option on a legend selection
 *  - `<ChartTooltip>`        -> per-segment tooltip on hover
 *
 * Click-to-open detail (RSC's `<ChartPopover>`) isn't declarative — wire
 * `onMarkClick` on <VegaLiteChart> to open your own panel from the clicked datum.
 */
export const interactiveStackedBarSpec: VisualizationSpec = {
  data: { values: browserTrend },
  transform: [browserStackOrder],
  params: [
    {
      name: 'legend_hover',
      select: { type: 'point', fields: ['browser'], on: 'pointerover', clear: 'pointerout' },
      bind: 'legend',
    },
    {
      // `toggle` is intentionally omitted: Vega-Lite ignores a user-supplied
      // `toggle` value on a legend-bound point selection and always decides
      // replace-vs-add from the browser's native shiftKey instead — a plain
      // click isolates just the clicked series (replacing any previously
      // hidden one), shift+click adds/removes it from the hidden set. See
      // rsc-vega-interactions/reference/legend.md for the verified mechanics
      // and the click-target gotcha (only the legend's symbol/label marks
      // register a click — the entry's invisible hit-rect background doesn't).
      name: 'legend_toggle',
      select: { type: 'point', fields: ['browser'] },
      bind: 'legend',
    },
  ],
  mark: { type: 'bar', cursor: 'pointer' },
  encoding: {
    x: { field: 'month', type: 'ordinal', title: 'Month', axis: baselineAxis },
    y: { field: 'share', type: 'quantitative', title: 'Share (%)', stack: 'zero' },
    order: orderByStack,
    color: { field: 'browser', type: 'nominal', sort: null, legend: { title: 'Browser' } },
    opacity: {
      condition: [
        { param: 'legend_toggle', empty: false, value: 0 },
        { param: 'legend_hover', value: 1 },
      ],
      value: 0.2,
    },
    tooltip: [
      { field: 'browser', type: 'nominal', title: 'Browser' },
      { field: 'month', type: 'ordinal', title: 'Month' },
      { field: 'share', type: 'quantitative', title: 'Share (%)', format: '.1f' },
    ],
  },
};

/**
 * Line chart replicating RSC's `interactionMode="dimension"` +
 * `<ChartTooltip highlightBy="dimension">`: hovering anywhere near a month
 * highlights every series' point at that month (not just the nearest one)
 * and shows a combined tooltip, via an invisible per-month "selector" layer
 * + a vertical rule, the standard Vega-Lite multi-series-tooltip pattern.
 */
export const interactiveLineDimensionHighlightSpec: VisualizationSpec = {
  data: { values: browserTrend },
  encoding: {
    x: { field: 'month', type: 'ordinal', title: 'Month', axis: baselineAxis },
  },
  layer: [
    {
      mark: { type: 'line' },
      encoding: {
        y: { field: 'share', type: 'quantitative', title: 'Share (%)' },
        stroke: { field: 'browser', type: 'nominal', sort: null, legend: null },
        fill: { field: 'browser', type: 'nominal', sort: null, legend: { title: 'Browser' } },
        opacity: {
          condition: { param: 'dimension_hover', value: 1 },
          value: 1,
        },
      },
    },
    {
      // invisible hit-target: one mark per (month, browser) pair so `nearest`
      // can snap to a month regardless of which series' line is closest
      mark: { type: 'point', opacity: 0 },
      encoding: {
        y: { field: 'share', type: 'quantitative' },
      },
      params: [
        {
          name: 'dimension_hover',
          select: { type: 'point', fields: ['month'], nearest: true, on: 'pointerover', clear: 'pointerout' },
        },
      ],
    },
    {
      // vertical rule at the hovered month, RSC's "dimension" hover column
      transform: [{ filter: { param: 'dimension_hover' } }],
      mark: { type: 'rule', color: 'rgb(144, 144, 144)', strokeWidth: 1 },
      encoding: {},
    },
    {
      // solid points on every series at the hovered month, carrying the tooltip
      transform: [{ filter: { param: 'dimension_hover' } }],
      mark: { type: 'point', filled: true, size: 80 },
      encoding: {
        y: { field: 'share', type: 'quantitative' },
        color: { field: 'browser', type: 'nominal', sort: null, legend: null },
        tooltip: [
          { field: 'browser', type: 'nominal', title: 'Browser' },
          { field: 'month', type: 'ordinal', title: 'Month' },
          { field: 'share', type: 'quantitative', title: 'Share (%)', format: '.1f' },
        ],
      },
    },
  ],
};

/**
 * Donut demonstrating RSC's `<Chart colors={[...]}>` (a fully custom
 * categorical palette, not just the default categorical16 scale) plus a
 * tooltip and a toggleable legend. Pass the same array to
 * `<VegaLiteChart colors={...}>` so the host-owned config.range.category
 * picks it up — the fragment below never sets its own color range.
 */
export const CUSTOM_DONUT_COLORS = [
  'rgb(20, 122, 243)',
  'rgb(15, 181, 174)',
  'rgb(246, 133, 17)',
  'rgb(222, 61, 130)',
  'rgb(115, 38, 211)',
];

const DONUT_LEGEND_RESERVE = 70;

export function getInteractiveDonutSpec(width: number, height: number): VisualizationSpec {
  const outerRadius = Math.min(width, Math.max(height - DONUT_LEGEND_RESERVE, 40)) / 2;
  const innerRadius = outerRadius * 0.85;
  return {
    data: { values: spend },
    transform: [{ calculate: "{'Marketing':0,'Engineering':1,'Sales':2,'Support':3,'Design':4}[datum.category]", as: 'order' }],
    // see interactiveStackedBarSpec's comment above — `toggle` is a no-op on
    // a legend-bound selection, plain click isolates one entry, shift+click
    // builds a multi-entry hidden set.
    params: [{ name: 'legend_toggle', select: { type: 'point', fields: ['category'] }, bind: 'legend' }],
    mark: { type: 'arc', innerRadius, outerRadius, padAngle: 0.01, cursor: 'pointer' },
    encoding: {
      theta: { field: 'value', type: 'quantitative' },
      order: { field: 'order', type: 'quantitative' },
      color: { field: 'category', type: 'nominal', sort: null, legend: { title: 'Team', columns: 3 } },
      opacity: { condition: { param: 'legend_toggle', empty: false, value: 0 }, value: 1 },
      tooltip: [
        { field: 'category', type: 'nominal', title: 'Team' },
        { field: 'value', type: 'quantitative', title: 'Spend ($k)' },
      ],
    },
  };
}
