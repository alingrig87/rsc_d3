// Shared sample datasets used by both the real @adobe/react-spectrum-charts
// components and their Vega-Lite replicas, so the two renders are always
// comparing the exact same data.

export const browserTrend = [
  { month: '2024-01', browser: 'Chrome', share: 63 },
  { month: '2024-01', browser: 'Safari', share: 20 },
  { month: '2024-01', browser: 'Firefox', share: 8 },
  { month: '2024-01', browser: 'Edge', share: 5 },
  { month: '2024-02', browser: 'Chrome', share: 64 },
  { month: '2024-02', browser: 'Safari', share: 19 },
  { month: '2024-02', browser: 'Firefox', share: 8 },
  { month: '2024-02', browser: 'Edge', share: 5 },
  { month: '2024-03', browser: 'Chrome', share: 65 },
  { month: '2024-03', browser: 'Safari', share: 19 },
  { month: '2024-03', browser: 'Firefox', share: 7 },
  { month: '2024-03', browser: 'Edge', share: 6 },
  { month: '2024-04', browser: 'Chrome', share: 66 },
  { month: '2024-04', browser: 'Safari', share: 18 },
  { month: '2024-04', browser: 'Firefox', share: 7 },
  { month: '2024-04', browser: 'Edge', share: 6 },
  { month: '2024-05', browser: 'Chrome', share: 67 },
  { month: '2024-05', browser: 'Safari', share: 17 },
  { month: '2024-05', browser: 'Firefox', share: 7 },
  { month: '2024-05', browser: 'Edge', share: 6 },
];

export const spend = [
  { category: 'Marketing', value: 42 },
  { category: 'Engineering', value: 78 },
  { category: 'Sales', value: 35 },
  { category: 'Support', value: 24 },
  { category: 'Design', value: 18 },
];

export const regionSales = [
  { region: 'West', quarter: 'Q1', value: 42 },
  { region: 'West', quarter: 'Q2', value: 51 },
  { region: 'West', quarter: 'Q3', value: 47 },
  { region: 'East', quarter: 'Q1', value: 33 },
  { region: 'East', quarter: 'Q2', value: 38 },
  { region: 'East', quarter: 'Q3', value: 41 },
];

// speed/handling per weight class, shaped like RSC's own Scatter docs example
export const scatterData = [
  { speed: 42, handling: 65, weightClass: 'Light' },
  { speed: 55, handling: 58, weightClass: 'Light' },
  { speed: 38, handling: 72, weightClass: 'Light' },
  { speed: 48, handling: 68, weightClass: 'Light' },
  { speed: 60, handling: 45, weightClass: 'Medium' },
  { speed: 65, handling: 50, weightClass: 'Medium' },
  { speed: 58, handling: 55, weightClass: 'Medium' },
  { speed: 63, handling: 47, weightClass: 'Medium' },
  { speed: 75, handling: 30, weightClass: 'Heavy' },
  { speed: 80, handling: 25, weightClass: 'Heavy' },
  { speed: 70, handling: 35, weightClass: 'Heavy' },
  { speed: 78, handling: 28, weightClass: 'Heavy' },
];

// monthly visitors (bar) + conversion rate (line, secondary axis)
export const comboData = [
  { month: '2024-01', visitors: 1200, conversion: 2.1 },
  { month: '2024-02', visitors: 1450, conversion: 2.4 },
  { month: '2024-03', visitors: 1600, conversion: 2.6 },
  { month: '2024-04', visitors: 1550, conversion: 2.9 },
  { month: '2024-05', visitors: 1800, conversion: 3.2 },
];

// sparkline trend backing a BigNumber KPI tile (last value = the displayed number)
export const bigNumberTrend = [
  { idx: 1, visitors: 980 },
  { idx: 2, visitors: 1120 },
  { idx: 3, visitors: 1050 },
  { idx: 4, visitors: 1300 },
  { idx: 5, visitors: 1250 },
  { idx: 6, visitors: 1480 },
];

export const bulletData = [
  { category: 'Storage used', current: 750, target: 1000 },
  { category: 'API requests', current: 850, target: 1000 },
  { category: 'Bandwidth', current: 420, target: 600 },
];

// Two-set overlap. Field names match Venn's defaults: color="sets", metric="size".
export const vennData = [
  { sets: ['Instagram'], size: 12 },
  { sets: ['TikTok'], size: 12 },
  { sets: ['Instagram', 'TikTok'], size: 4 },
];

// Conversion funnel — stages in decreasing order top to bottom.
export const funnelData = [
  { stage: 'Visitors', value: 5000 },
  { stage: 'Signups', value: 3200 },
  { stage: 'Trials', value: 1800 },
  { stage: 'Purchases', value: 950 },
  { stage: 'Renewals', value: 620 },
];
