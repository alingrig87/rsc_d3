// Extracted from @adobe/react-spectrum-charts (packages/themes/src)
// so Vega-Lite specs can reuse the exact same design tokens without
// depending on React Spectrum / react-spectrum-charts at all.

export const ADOBE_CLEAN_FONT =
  "adobe-clean, 'Source Sans Pro', -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Ubuntu, 'Trebuchet MS', 'Lucida Grande', sans-serif";

const gray = {
  light: {
    50: 'rgb(255, 255, 255)',
    75: 'rgb(253, 253, 253)',
    100: 'rgb(248, 248, 248)',
    200: 'rgb(230, 230, 230)',
    300: 'rgb(213, 213, 213)',
    400: 'rgb(177, 177, 177)',
    500: 'rgb(144, 144, 144)',
    600: 'rgb(109, 109, 109)',
    700: 'rgb(70, 70, 70)',
    800: 'rgb(34, 34, 34)',
    900: 'rgb(0, 0, 0)',
  },
  dark: {
    50: 'rgb(0, 0, 0)',
    75: 'rgb(14, 14, 14)',
    100: 'rgb(29, 29, 29)',
    200: 'rgb(48, 48, 48)',
    300: 'rgb(75, 75, 75)',
    400: 'rgb(106, 106, 106)',
    500: 'rgb(141, 141, 141)',
    600: 'rgb(176, 176, 176)',
    700: 'rgb(208, 208, 208)',
    800: 'rgb(235, 235, 235)',
    900: 'rgb(255, 255, 255)',
  },
} as const;

const blue400 = { light: 'rgb(150, 206, 253)', dark: 'rgb(0, 78, 166)' };

// categorical-100 .. categorical-1600, light scheme (source of truth for the default series color)
const categorical = {
  100: 'rgb(15, 181, 174)',
  200: 'rgb(64, 70, 202)',
  300: 'rgb(246, 133, 17)',
  400: 'rgb(222, 61, 130)',
  500: 'rgb(126, 132, 250)',
  600: 'rgb(114, 224, 106)',
  700: 'rgb(20, 122, 243)',
  800: 'rgb(115, 38, 211)',
  900: 'rgb(232, 198, 0)',
  1000: 'rgb(203, 93, 0)',
  1100: 'rgb(0, 143, 93)',
  1200: 'rgb(188, 233, 49)',
  1300: 'rgb(90, 169, 250)',
  1400: 'rgb(192, 56, 204)',
  1500: 'rgb(245, 107, 183)',
  1600: 'rgb(255, 226, 46)',
} as const;

export const categorical16: string[] = Object.values(categorical);

export const divergentOrangeYellowSeafoam15: string[] = [
  'rgb(88, 0, 0)',
  'rgb(121, 38, 11)',
  'rgb(156, 69, 17)',
  'rgb(189, 101, 26)',
  'rgb(221, 134, 41)',
  'rgb(245, 173, 82)',
  'rgb(254, 214, 147)',
  'rgb(255, 255, 224)',
  'rgb(187, 228, 209)',
  'rgb(118, 199, 190)',
  'rgb(62, 168, 166)',
  'rgb(32, 130, 136)',
  'rgb(7, 103, 105)',
];

export const sequentialViridis16: string[] = [
  'rgb(253, 231, 37)',
  'rgb(210, 226, 27)',
  'rgb(165, 219, 54)',
  'rgb(122, 209, 81)',
  'rgb(84, 197, 104)',
  'rgb(53, 183, 121)',
  'rgb(34, 168, 132)',
  'rgb(31, 152, 139)',
  'rgb(35, 136, 142)',
  'rgb(42, 120, 142)',
  'rgb(49, 104, 142)',
  'rgb(57, 86, 140)',
  'rgb(65, 68, 135)',
  'rgb(71, 47, 125)',
  'rgb(72, 26, 108)',
  'rgb(68, 1, 84)',
];

// Chart geometry constants (packages/constants/constants.ts)
export const CORNER_RADIUS = 6;
export const PADDING_RATIO = 0.4; // -> Vega-Lite band paddingInner
export const DISCRETE_PADDING = 0.5;
export const DEFAULT_DONUT_HOLE_RATIO = 0.85;
export const DEFAULT_DONUT_PAD_ANGLE = 0.01;

// legend swatch: rounded-corner square, same corner language as the bars
export const ROUNDED_SQUARE_PATH =
  'M -0.55 -1 h 1.1 a 0.45 0.45 0 0 1 0.45 0.45 v 1.1 a 0.45 0.45 0 0 1 -0.45 0.45 h -1.1 a 0.45 0.45 0 0 1 -0.45 -0.45 v -1.1 a 0.45 0.45 0 0 1 0.45 -0.45 z';
export const DEFAULT_SYMBOL_SIZE = 100;
export const DEFAULT_SYMBOL_STROKE_WIDTH = 2;
export const DEFAULT_LEGEND_SYMBOL_SIZE = 250;
export const DEFAULT_FONT_SIZE = 14;

/**
 * Builds a Vega(-Lite) `config` object that reproduces the visual theme
 * react-spectrum-charts applies on top of Vega — same axis/legend styling,
 * same categorical palette, same font stack, same corner radius / padding.
 *
 * `colors` mirrors RSC's `<Chart colors={...}>` prop: pass a custom array to
 * replace the default categorical16 palette (config.range.category/ordinal
 * and every mark's default fill/stroke) without touching the rest of the
 * theme. Omit it to get the stock Spectrum palette.
 */
export function getSpectrumVegaLiteConfig(colorScheme: 'light' | 'dark' = 'light', colors?: string[]) {
  const g = gray[colorScheme];
  const fontColor = colorScheme === 'light' ? gray.light[800] : gray.dark[800];
  const categoryRange = colors && colors.length > 0 ? colors : categorical16;
  const defaultColor = categoryRange[0];

  return {
    background: 'transparent',
    font: ADOBE_CLEAN_FONT,
    // RSC's own generated Vega specs (captured via <Chart debug>, see
    // rsc-vega-chart/reference/theme-and-colors.md's "Sizing model" section)
    // set NO autosize override at all — Vega's classic default ('pad') is
    // what they rely on: a fixed width/height canvas whose plot area shrinks
    // to make room for axis/legend chrome, rather than Vega-Lite's 'fit'
    // (which grows/reflows the canvas around the content, and compiles
    // point/band scale ranges as a computed-step signal instead of a plain
    // [0, width]/[0, height] range). That difference cascades into both
    // axis tick density (tickCount signals below read the `width`/`height`
    // signals, which differ in value between the two autosize strategies)
    // and point-scale outer padding on Line/Area — matching 'pad' fixes both.
    autosize: { type: 'pad' },
    range: {
      category: categoryRange,
      diverging: divergentOrangeYellowSeafoam15,
      ordinal: categoryRange,
      ramp: sequentialViridis16,
    },
    // matches getBandPadding(PADDING_RATIO) in packages/vega-spec-builder/src/scale/scaleSpecBuilder.ts
    scale: {
      bandPaddingInner: PADDING_RATIO,
      bandPaddingOuter: DISCRETE_PADDING - (1 - PADDING_RATIO) / 2,
    },
    axis: {
      bandPosition: 0.5,
      domain: false,
      domainWidth: 2,
      domainColor: g[900],
      gridColor: g[200],
      labelFont: ADOBE_CLEAN_FONT,
      labelFontSize: DEFAULT_FONT_SIZE,
      labelFontWeight: 'normal',
      labelPadding: 8,
      labelOverlap: true,
      labelColor: fontColor,
      ticks: false,
      tickColor: g[300],
      tickRound: true,
      tickSize: 8,
      tickCap: 'round',
      tickWidth: 1,
      titleAnchor: 'middle',
      titleColor: fontColor,
      titleFont: ADOBE_CLEAN_FONT,
      titleFontSize: DEFAULT_FONT_SIZE,
      titleFontWeight: 'bold',
      titlePadding: 16,
    },
    // Confirmed byte-for-byte against RSC's own generated spec (via <Chart
    // debug>): every *quantitative/linear* axis's tick count is a
    // dimension-driven signal, not Vega-Lite's own denser automatic
    // heuristic. RSC only puts this on linear axes — a categorical
    // (band/point-scale) axis shows one label per category regardless of
    // tickCount, so setting it here too is inert for those, not risky.
    // Split by channel (not a shared `axis.tickCount`) because the formula
    // needs `width` for x and `height` for y — e.g. Scatter's x (Speed) is
    // itself quantitative, unlike Bar's categorical x.
    axisX: { tickCount: { signal: 'clamp(ceil(width/100), 2, 10)' } },
    axisY: { tickCount: { signal: 'clamp(ceil(height/100), 2, 10)' } },
    legend: {
      columnPadding: 20,
      labelColor: fontColor,
      labelFont: ADOBE_CLEAN_FONT,
      labelFontSize: DEFAULT_FONT_SIZE,
      labelFontWeight: 'normal',
      labelLimit: 184,
      orient: 'bottom',
      direction: 'horizontal',
      rowPadding: 8,
      symbolSize: DEFAULT_LEGEND_SYMBOL_SIZE,
      symbolType: ROUNDED_SQUARE_PATH,
      symbolStrokeColor: g[700],
      titleColor: fontColor,
      titleFont: ADOBE_CLEAN_FONT,
      titleFontSize: DEFAULT_FONT_SIZE,
      titlePadding: 8,
    },
    arc: { fill: defaultColor },
    area: { line: true, fill: defaultColor, opacity: 0.8 },
    line: { strokeWidth: 2, stroke: defaultColor },
    bar: {
      fill: defaultColor,
      stroke: blue400[colorScheme],
      strokeWidth: 0,
      cornerRadiusTopLeft: CORNER_RADIUS,
      cornerRadiusTopRight: CORNER_RADIUS,
    },
    rect: { strokeWidth: 0, stroke: blue400[colorScheme], fill: defaultColor },
    rule: { stroke: g[900], strokeWidth: 2 },
    point: { strokeWidth: DEFAULT_SYMBOL_STROKE_WIDTH, size: DEFAULT_SYMBOL_SIZE, fill: defaultColor, filled: true },
    circle: { strokeWidth: DEFAULT_SYMBOL_STROKE_WIDTH, size: DEFAULT_SYMBOL_SIZE, fill: defaultColor },
    text: { fill: fontColor, font: ADOBE_CLEAN_FONT, fontSize: DEFAULT_FONT_SIZE },
    title: { offset: 10, font: ADOBE_CLEAN_FONT, fontSize: 18, color: fontColor },
    view: { stroke: 'transparent' },
  } as const;
}
