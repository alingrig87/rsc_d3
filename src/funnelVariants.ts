import type { VisualizationSpec } from 'vega-embed';
import { funnelData } from './data';
import { categorical16, CORNER_RADIUS } from './spectrumVegaTheme';

export interface FunnelVariant {
  title: string;
  note?: string;
  spec: VisualizationSpec;
}

const maxValue = Math.max(...funnelData.map((d) => d.value));
const cx = maxValue / 2;
const stageColor = (i: number) => categorical16[i % categorical16.length];

const pctLabel = {
  calculate: `format(datum.value, ',') + '  (' + format(datum.value / ${maxValue} * 100, '.0f') + '%)'`,
  as: 'valueLabel',
} as const;

const hiddenAxis = { domain: false, ticks: false, grid: false } as const;
const stageAxis = { ...hiddenAxis, labelFontWeight: 'bold' as const, labelPadding: 8 };

// Vega-Lite's text mark doesn't take align/dx/color as data-driven encoding
// channels (TS-checked schema rejects it), so "label inside the wide bars,
// outside the narrow ones" is two statically-styled layers, each filtered to
// its own subset, rather than one conditionally-styled layer.
function centeredLabelLayer(threshold = 0.35) {
  const cutoff = maxValue * threshold;
  const shared = {
    encoding: {
      y: { field: 'stage', type: 'nominal' as const, sort: null },
      x: { field: 'xEnd', type: 'quantitative' as const },
      text: { field: 'valueLabel' },
    },
  };
  return [
    {
      ...shared,
      transform: [{ filter: `datum.value > ${cutoff}` }],
      mark: { type: 'text' as const, fontWeight: 'bold' as const, fontSize: 11, align: 'right' as const, dx: -8, color: 'white' },
    },
    {
      ...shared,
      transform: [{ filter: `datum.value <= ${cutoff}` }],
      mark: {
        type: 'text' as const,
        fontWeight: 'bold' as const,
        fontSize: 11,
        align: 'left' as const,
        dx: 8,
        color: 'rgb(70, 70, 70)',
      },
    },
  ];
}

export function getFunnelVariants(width: number, height: number): FunnelVariant[] {
  return [
    // 1. The one already shipped in the Funnel story: centered taper, categorical colors.
    {
      title: '1. Centered taper',
      spec: {
        data: { values: funnelData },
        transform: [
          { calculate: `(${maxValue} - datum.value) / 2`, as: 'xStart' },
          { calculate: `(${maxValue} + datum.value) / 2`, as: 'xEnd' },
          pctLabel,
        ],
        layer: [
          {
            mark: { type: 'bar' },
            encoding: {
              y: { field: 'stage', type: 'nominal', sort: null, title: null, axis: stageAxis },
              x: { field: 'xStart', type: 'quantitative', axis: null, scale: { domain: [0, maxValue] } },
              x2: { field: 'xEnd' },
              color: { field: 'stage', type: 'nominal', sort: null, legend: null },
            },
          },
          ...centeredLabelLayer(),
        ],
      },
    },

    // 2. A true continuous funnel silhouette: trapezoid panels stitched between
    // adjacent stages instead of discrete bars. This is what Vega-Lite has no
    // built-in mark for — each trapezoid is its own tiny 2-point area layer.
    {
      title: '2. Continuous silhouette',
      note: 'no bar mark at all — a trapezoid `area` layer per gap between stages',
      spec: {
        layer: funnelData.slice(0, -1).map((stage, i) => {
          const next = funnelData[i + 1];
          return {
            data: {
              values: [
                { idx: i, left: cx - stage.value / 2, right: cx + stage.value / 2 },
                { idx: i + 1, left: cx - next.value / 2, right: cx + next.value / 2 },
              ],
            },
            mark: { type: 'area', orient: 'horizontal', color: stageColor(i), opacity: 0.92 },
            encoding: {
              y: { field: 'idx', type: 'quantitative', axis: null, scale: { domain: [0, funnelData.length - 1] } },
              x: { field: 'left', type: 'quantitative', axis: null, scale: { domain: [0, maxValue] } },
              x2: { field: 'right' },
            },
          };
        }),
      },
    },

    // 3. Plain left-aligned bars — the most literal "bar chart with decreasing
    // values" reading, no centering trick at all.
    {
      title: '3. Left-aligned bars',
      spec: {
        data: { values: funnelData },
        transform: [pctLabel],
        layer: [
          {
            mark: { type: 'bar', cornerRadiusTopRight: CORNER_RADIUS, cornerRadiusBottomRight: CORNER_RADIUS },
            encoding: {
              y: { field: 'stage', type: 'nominal', sort: null, title: null, axis: stageAxis },
              x: { field: 'value', type: 'quantitative', axis: null, scale: { domain: [0, maxValue] } },
              color: { field: 'stage', type: 'nominal', sort: null, legend: null },
            },
          },
          {
            mark: { type: 'text', align: 'left', dx: 6, fontWeight: 'bold', fontSize: 11 },
            encoding: {
              y: { field: 'stage', type: 'nominal', sort: null },
              x: { field: 'value', type: 'quantitative' },
              text: { field: 'valueLabel' },
            },
          },
        ],
      },
    },

    // 4. Vertical columns instead of horizontal bars — same centering trick,
    // rotated 90°.
    {
      title: '4. Vertical columns',
      spec: {
        data: { values: funnelData },
        transform: [
          { calculate: `(${maxValue} - datum.value) / 2`, as: 'yStart' },
          { calculate: `(${maxValue} + datum.value) / 2`, as: 'yEnd' },
        ],
        mark: { type: 'bar' },
        encoding: {
          x: { field: 'stage', type: 'nominal', sort: null, title: null, axis: { ...hiddenAxis, labelFontWeight: 'bold', labelAngle: 0 } },
          y: { field: 'yStart', type: 'quantitative', axis: null, scale: { domain: [0, maxValue] } },
          y2: { field: 'yEnd' },
          color: { field: 'stage', type: 'nominal', sort: null, legend: null },
        },
      },
    },

    // 5. Fully rounded ("pill") bars.
    {
      title: '5. Pill bars',
      spec: {
        data: { values: funnelData },
        transform: [
          { calculate: `(${maxValue} - datum.value) / 2`, as: 'xStart' },
          { calculate: `(${maxValue} + datum.value) / 2`, as: 'xEnd' },
          pctLabel,
        ],
        layer: [
          {
            mark: { type: 'bar', cornerRadius: 20 },
            encoding: {
              y: { field: 'stage', type: 'nominal', sort: null, title: null, axis: stageAxis },
              x: { field: 'xStart', type: 'quantitative', axis: null, scale: { domain: [0, maxValue] } },
              x2: { field: 'xEnd' },
              color: { field: 'stage', type: 'nominal', sort: null, legend: null },
            },
          },
          ...centeredLabelLayer(),
        ],
      },
    },

    // 6. Single-hue sequential shade instead of the categorical16 rainbow —
    // darkest at the top, lightening down the funnel.
    {
      title: '6. Single-hue gradient',
      spec: {
        data: { values: funnelData },
        transform: [
          { calculate: `(${maxValue} - datum.value) / 2`, as: 'xStart' },
          { calculate: `(${maxValue} + datum.value) / 2`, as: 'xEnd' },
          pctLabel,
        ],
        layer: [
          {
            mark: { type: 'bar' },
            encoding: {
              y: { field: 'stage', type: 'nominal', sort: null, title: null, axis: stageAxis },
              x: { field: 'xStart', type: 'quantitative', axis: null, scale: { domain: [0, maxValue] } },
              x2: { field: 'xEnd' },
              color: {
                field: 'value',
                type: 'quantitative',
                legend: null,
                scale: { scheme: 'teals', reverse: true },
              },
            },
          },
          ...centeredLabelLayer(),
        ],
      },
    },

    // 7. Minimal: thin neutral bars with a colored left accent stripe, label
    // always outside. Low-ink alternative for dense dashboards.
    {
      title: '7. Minimal + accent stripe',
      spec: {
        data: { values: funnelData },
        transform: [pctLabel],
        layer: [
          {
            mark: { type: 'bar', height: 8, color: 'rgb(230, 230, 230)' },
            encoding: {
              y: { field: 'stage', type: 'nominal', sort: null, title: null, axis: stageAxis },
              x: { field: 'value', type: 'quantitative', axis: null, scale: { domain: [0, maxValue] } },
            },
          },
          {
            mark: { type: 'bar', height: 8, width: 3 },
            encoding: {
              y: { field: 'stage', type: 'nominal', sort: null },
              x: { field: 'value', type: 'quantitative' },
              x2: { datum: 0 },
              color: { field: 'stage', type: 'nominal', sort: null, legend: null },
            },
          },
          {
            mark: { type: 'text', align: 'left', dx: 6, fontSize: 11, color: 'rgb(70, 70, 70)' },
            encoding: {
              y: { field: 'stage', type: 'nominal', sort: null },
              x: { field: 'value', type: 'quantitative' },
              text: { field: 'valueLabel' },
            },
          },
        ],
      },
    },

    // 8. Centered taper with the stage-over-stage drop-off called out between
    // bars (the number a funnel is usually built to answer).
    {
      title: '8. With drop-off %',
      spec: {
        data: { values: funnelData },
        transform: [
          { calculate: `(${maxValue} - datum.value) / 2`, as: 'xStart' },
          { calculate: `(${maxValue} + datum.value) / 2`, as: 'xEnd' },
          pctLabel,
        ],
        layer: [
          {
            mark: { type: 'bar' },
            encoding: {
              y: { field: 'stage', type: 'nominal', sort: null, title: null, axis: stageAxis },
              x: { field: 'xStart', type: 'quantitative', axis: null, scale: { domain: [0, maxValue] } },
              x2: { field: 'xEnd' },
              color: { field: 'stage', type: 'nominal', sort: null, legend: null },
            },
          },
          ...centeredLabelLayer(0.5),
          {
            data: {
              values: funnelData.slice(1).map((d, i) => ({
                stage: d.stage,
                dropoff: `-${Math.round((1 - d.value / funnelData[i].value) * 100)}%`,
              })),
            },
            mark: { type: 'text', dy: -14, fontSize: 10, color: 'rgb(211, 21, 16)', fontStyle: 'italic' },
            encoding: {
              y: { field: 'stage', type: 'nominal', sort: null },
              x: { datum: cx, type: 'quantitative' },
              text: { field: 'dropoff' },
            },
          },
        ],
      },
    },

    // 9. Lollipop / dot-plot reading of the same funnel — no bars at all.
    {
      title: '9. Lollipop',
      spec: {
        data: { values: funnelData },
        // A plain `datum: 0` x-encoding (no backing field) tripped up
        // Vega-Lite's field-def scan when paired with a field-based x2 on
        // the same mark — using a real calculated field for both ends of
        // the rule sidesteps it.
        transform: [pctLabel, { calculate: '0', as: 'zero' }],
        layer: [
          {
            mark: { type: 'rule', strokeWidth: 2, color: 'rgb(213, 213, 213)' },
            encoding: {
              y: { field: 'stage', type: 'nominal', sort: null, title: null, axis: stageAxis },
              x: { field: 'zero', type: 'quantitative', axis: null },
              x2: { field: 'value' },
            },
          },
          {
            mark: { type: 'circle', size: 180 },
            encoding: {
              y: { field: 'stage', type: 'nominal', sort: null },
              x: { field: 'value', type: 'quantitative', axis: null, scale: { domain: [0, maxValue] } },
              color: { field: 'stage', type: 'nominal', sort: null, legend: null },
            },
          },
          {
            mark: { type: 'text', align: 'left', dx: 12, fontSize: 11, color: 'rgb(70, 70, 70)' },
            encoding: {
              y: { field: 'stage', type: 'nominal', sort: null },
              x: { field: 'value', type: 'quantitative', axis: null },
              text: { field: 'valueLabel' },
            },
          },
        ],
      },
    },

    // 10. Same centered taper, reversed reading order (narrowest on top) — a
    // pyramid instead of a funnel; useful when the story is "growth" not "drop-off".
    {
      title: '10. Reversed (pyramid)',
      spec: {
        data: { values: [...funnelData].reverse() },
        transform: [
          { calculate: `(${maxValue} - datum.value) / 2`, as: 'xStart' },
          { calculate: `(${maxValue} + datum.value) / 2`, as: 'xEnd' },
          pctLabel,
        ],
        layer: [
          {
            mark: { type: 'bar' },
            encoding: {
              y: { field: 'stage', type: 'nominal', sort: null, title: null, axis: stageAxis },
              x: { field: 'xStart', type: 'quantitative', axis: null, scale: { domain: [0, maxValue] } },
              x2: { field: 'xEnd' },
              color: { field: 'stage', type: 'nominal', sort: funnelData.map((d) => d.stage), legend: null },
            },
          },
          ...centeredLabelLayer(),
        ],
      },
    },
  ].map((variant) => ({
    ...variant,
    spec: { ...variant.spec, width, height } as VisualizationSpec,
  }));
}
