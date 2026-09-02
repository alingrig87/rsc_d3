import type { VisualizationSpec } from 'vega-embed';
import { DEFAULT_DONUT_HOLE_RATIO, DEFAULT_DONUT_PAD_ANGLE, CORNER_RADIUS } from './spectrumVegaTheme';
import { browserTrend, spend, regionSales, scatterData, comboData, bulletData, vennData } from './data';
import { getFunnelVariants } from './funnelVariants';

// react-spectrum-charts keeps categories/series in the order they first
// appear in the data (no implicit alphabetical sort), unlike Vega-Lite's
// nominal-field default. `sort: null` matches that behavior.
const encoding = {
  color: { field: 'browser', type: 'nominal', sort: null, legend: { title: 'Browser' } },
} as const;

// react-spectrum-charts stacks series in data order (first series at the
// baseline). Vega-Lite's default stack order does the opposite, so we drive
// it explicitly via a calculated `order` field.
const browserStackOrder = {
  calculate: "{'Chrome':0,'Safari':1,'Firefox':2,'Edge':3}[datum.browser]",
  as: 'stackOrder',
} as const;
const orderByStack = { field: 'stackOrder', type: 'quantitative' } as const;

// Adobe's <Axis position="bottom" baseline /> draws a solid domain line at
// the axis (our global theme otherwise turns the domain line off in favor of
// gridlines). `domain: true` re-enables it for that one axis, inheriting
// domainColor/domainWidth from the shared config.
const baselineAxis = { labelAngle: 0, domain: true } as const;

export const barSpec: VisualizationSpec = {
  data: { values: spend },
  mark: { type: 'bar' },
  encoding: {
    x: { field: 'category', type: 'nominal', sort: null, title: 'Team', axis: baselineAxis },
    y: { field: 'value', type: 'quantitative', title: 'Spend ($k)' },
  },
};

export const dodgedBarSpec: VisualizationSpec = {
  data: { values: regionSales },
  mark: { type: 'bar' },
  encoding: {
    x: { field: 'quarter', type: 'nominal', sort: null, title: null, axis: baselineAxis },
    xOffset: { field: 'region', sort: null },
    y: { field: 'value', type: 'quantitative', title: 'Sales ($k)' },
    color: { field: 'region', type: 'nominal', sort: null, legend: { title: 'Region' } },
  },
};

export const stackedBarSpec: VisualizationSpec = {
  data: { values: browserTrend },
  transform: [browserStackOrder],
  mark: { type: 'bar' },
  encoding: {
    x: { field: 'month', type: 'ordinal', title: 'Month', axis: baselineAxis },
    y: { field: 'share', type: 'quantitative', title: 'Share (%)', stack: 'zero' },
    order: orderByStack,
    ...encoding,
  },
};

// react-spectrum-charts' <Line> draws a plain line with no point markers by
// default (points are opt-in via the `Symbol` prop), so we match that here.
export const lineSpec: VisualizationSpec = {
  data: { values: browserTrend },
  mark: { type: 'line' },
  encoding: {
    x: { field: 'month', type: 'ordinal', title: 'Month', axis: baselineAxis },
    y: { field: 'share', type: 'quantitative', title: 'Share (%)' },
    stroke: { field: 'browser', type: 'nominal', sort: null, legend: null },
    // a line mark's color legend is stroke-only (hollow) by default; adding a
    // matching (invisible-on-the-mark) fill channel and putting the legend
    // there instead makes the swatch solid, like every other Spectrum legend symbol.
    fill: { field: 'browser', type: 'nominal', sort: null, legend: { title: 'Browser' } },
  },
};

export const areaSpec: VisualizationSpec = {
  data: { values: browserTrend },
  transform: [browserStackOrder],
  mark: { type: 'area', line: true, opacity: 0.8 },
  encoding: {
    x: { field: 'month', type: 'ordinal', title: 'Month', axis: baselineAxis },
    y: { field: 'share', type: 'quantitative', title: 'Share (%)', stack: 'zero' },
    order: orderByStack,
    ...encoding,
  },
};

// react-spectrum-charts computes the arc radius from the plot area and derives
// innerRadius from `holeRatio` (default 0.85 — a thin ring, not a thick donut).
// The `height` passed to <Chart> is the plot area only — a bottom legend adds
// extra height on top of it, it doesn't shrink the ring — so we reserve that
// space here too before sizing the circle off the *remaining* box.
const DONUT_LEGEND_RESERVE = 70;

export function getDonutSpec(width: number, height: number): VisualizationSpec {
  const outerRadius = Math.min(width, Math.max(height - DONUT_LEGEND_RESERVE, 40)) / 2;
  const innerRadius = outerRadius * DEFAULT_DONUT_HOLE_RATIO;
  return {
    data: { values: spend },
    transform: [{ calculate: "{'Marketing':0,'Engineering':1,'Sales':2,'Support':3,'Design':4}[datum.category]", as: 'order' }],
    mark: { type: 'arc', innerRadius, outerRadius, padAngle: DEFAULT_DONUT_PAD_ANGLE },
    encoding: {
      theta: { field: 'value', type: 'quantitative' },
      order: { field: 'order', type: 'quantitative' },
      color: { field: 'category', type: 'nominal', sort: null, legend: { title: 'Team', columns: 3 } },
    },
  };
}

export const scatterSpec: VisualizationSpec = {
  data: { values: scatterData },
  mark: { type: 'point', filled: true },
  encoding: {
    x: { field: 'speed', type: 'quantitative', title: 'Speed', axis: baselineAxis },
    y: { field: 'handling', type: 'quantitative', title: 'Handling', axis: baselineAxis },
    color: { field: 'weightClass', type: 'nominal', sort: null, legend: { title: 'Weight class' } },
  },
};

// matches spectrum-charts' indigo-900, used as the fixed line color in their own Combo story
const COMBO_LINE_COLOR = 'rgb(82, 88, 228)';

export const comboSpec: VisualizationSpec = {
  data: { values: comboData },
  resolve: { scale: { y: 'independent' } },
  layer: [
    {
      mark: { type: 'bar' },
      encoding: {
        x: { field: 'month', type: 'ordinal', title: null, axis: baselineAxis },
        y: { field: 'visitors', type: 'quantitative', title: 'Visitors' },
      },
    },
    {
      mark: { type: 'line', stroke: COMBO_LINE_COLOR },
      encoding: {
        x: { field: 'month', type: 'ordinal' },
        y: { field: 'conversion', type: 'quantitative', title: 'Conversion (%)', axis: { orient: 'right' } },
      },
    },
  ],
};

// Bullet is a Vega-only mark in RSC (rect + rule, drawn from scratch) — see
// packages/vega-spec-builder/src/bullet/bulletMarkUtils.ts. This replica
// matches its geometry (rounded far end, solid black target rule) but uses
// a left axis for the row label instead of Adobe's "label floats above the
// bar" layout, which Vega-Lite has no direct equivalent for.
export const bulletSpec: VisualizationSpec = {
  data: { values: bulletData },
  layer: [
    {
      mark: { type: 'bar', cornerRadiusTopRight: CORNER_RADIUS, cornerRadiusBottomRight: CORNER_RADIUS, height: 14 },
      encoding: {
        y: { field: 'category', type: 'nominal', sort: null, title: null, axis: { domain: false, ticks: false, grid: false } },
        x: { field: 'current', type: 'quantitative', title: null },
      },
    },
    {
      mark: { type: 'tick', thickness: 2, size: 26, color: 'black' },
      encoding: {
        y: { field: 'category', type: 'nominal', sort: null },
        x: { field: 'target', type: 'quantitative' },
      },
    },
  ],
};

// RSC's real <Venn> computes a proportional-overlap layout (own algorithm,
// not part of vega-lite's mark vocabulary). This is a hand-placed two-circle
// approximation — the overlap size is *illustrative*, not solved for exact
// intersection area — good enough to sanity-check color/typography, not
// layout fidelity.
export function getVennSpec(width: number, height: number): VisualizationSpec {
  const [setA, setB, intersection] = vennData as { sets: string[]; size: number }[];
  const pxPerUnitRadius = 45;
  const r1 = Math.sqrt(setA.size / Math.PI) * pxPerUnitRadius;
  const r2 = Math.sqrt(setB.size / Math.PI) * pxPerUnitRadius;
  const overlapFraction = Math.min(0.85, intersection.size / Math.min(setA.size, setB.size));
  const distance = (r1 + r2) * (1 - overlapFraction * 0.9);
  const cx = width / 2;
  const cy = height / 2 + 10;

  const circles = [
    { label: setA.sets[0], x: cx - distance / 2, y: cy, r: r1, size: Math.PI * r1 * r1 },
    { label: setB.sets[0], x: cx + distance / 2, y: cy, r: r2, size: Math.PI * r2 * r2 },
  ];
  const labels = [
    { label: setA.sets[0], x: cx - distance / 2, y: cy - r1 - 10 },
    { label: setB.sets[0], x: cx + distance / 2, y: cy - r2 - 10 },
  ];

  const posScale = (max: number) => ({ domain: [0, max] as [number, number] });

  return {
    data: { values: circles },
    layer: [
      {
        mark: { type: 'circle', opacity: 0.6, stroke: null },
        encoding: {
          x: { field: 'x', type: 'quantitative', axis: null, scale: posScale(width) },
          y: { field: 'y', type: 'quantitative', axis: null, scale: posScale(height) },
          // `scale: null` makes this an identity mapping — the field value
          // (already a px² area, computed from the target radius above) is
          // used as-is instead of being re-fit to a default size range.
          size: { field: 'size', type: 'quantitative', legend: null, scale: null },
          color: { field: 'label', type: 'nominal', sort: null, legend: null },
        },
      },
      {
        data: { values: labels },
        mark: { type: 'text', fontWeight: 'bold', fontSize: 13 },
        encoding: {
          x: { field: 'x', type: 'quantitative', axis: null, scale: posScale(width) },
          y: { field: 'y', type: 'quantitative', axis: null, scale: posScale(height) },
          text: { field: 'label' },
        },
      },
      {
        data: { values: [{ x: cx, y: cy, text: String(intersection.size) }] },
        mark: { type: 'text', fontWeight: 'bold', fontSize: 13, color: 'white' },
        encoding: {
          x: { field: 'x', type: 'quantitative', axis: null, scale: posScale(width) },
          y: { field: 'y', type: 'quantitative', axis: null, scale: posScale(height) },
          text: { field: 'text' },
        },
      },
    ],
  };
}

// A funnel is just a horizontal bar chart, sorted descending, with each bar
// centered on the same midline instead of left-aligned — that's what turns
// the "steps" into a taper. There's no native Vega-Lite funnel mark. This is
// variant 1 ("Centered taper") of the full set explored in funnelVariants.ts
// / the "Funnel Gallery" story.
export function getFunnelSpec(width: number, height: number): VisualizationSpec {
  return getFunnelVariants(width, height)[0].spec;
}
