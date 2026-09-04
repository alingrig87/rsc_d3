import { Axis, Bar, Line, Area, Legend, Chart, Scatter, Title, ChartTooltip, ChartPopover } from '@adobe/react-spectrum-charts';
import { Donut, BigNumber } from '@adobe/react-spectrum-charts/rc';
import { Combo, Bullet, Venn } from '@adobe/react-spectrum-charts/alpha';
import { browserTrend, spend, regionSales, scatterData, comboData, bigNumberTrend, bulletData, vennData } from '../data';
import { CUSTOM_DONUT_COLORS } from '../interactiveSpecs';

// matches spectrum-charts' indigo-900, used as the fixed line color in their own Combo story
const COMBO_LINE_COLOR = 'rgb(82, 88, 228)';

interface SpectrumChartProps {
  colorScheme?: 'light' | 'dark';
  width?: number;
  height?: number;
}

export function SpectrumBar({ colorScheme = 'light', width = 420, height = 260 }: SpectrumChartProps) {
  return (
    <Chart data={spend} theme={colorScheme} width={width} height={height}>
      <Axis position="bottom" baseline title="Team" labelAlign="center" />
      <Axis position="left" grid title="Spend ($k)" />
      <Bar dimension="category" metric="value" />
    </Chart>
  );
}

export function SpectrumDodgedBar({ colorScheme = 'light', width = 420, height = 260 }: SpectrumChartProps) {
  return (
    <Chart data={regionSales} theme={colorScheme} width={width} height={height}>
      <Axis position="bottom" baseline title="" />
      <Axis position="left" grid title="Sales ($k)" />
      <Bar type="dodged" dimension="quarter" metric="value" color="region" />
      <Legend title="Region" />
    </Chart>
  );
}

export function SpectrumStackedBar({ colorScheme = 'light', width = 420, height = 260 }: SpectrumChartProps) {
  return (
    <Chart data={browserTrend} theme={colorScheme} width={width} height={height}>
      <Axis position="bottom" baseline title="Month" />
      <Axis position="left" grid title="Share (%)" />
      <Bar type="stacked" dimension="month" metric="share" color="browser" />
      <Legend title="Browser" />
    </Chart>
  );
}

export function SpectrumLine({ colorScheme = 'light', width = 420, height = 260 }: SpectrumChartProps) {
  return (
    <Chart data={browserTrend} theme={colorScheme} width={width} height={height}>
      <Axis position="bottom" baseline title="Month" />
      <Axis position="left" grid title="Share (%)" />
      <Line dimension="month" metric="share" color="browser" scaleType="point" />
      <Legend title="Browser" />
    </Chart>
  );
}

export function SpectrumArea({ colorScheme = 'light', width = 420, height = 260 }: SpectrumChartProps) {
  return (
    <Chart data={browserTrend} theme={colorScheme} width={width} height={height}>
      <Axis position="bottom" baseline title="Month" />
      <Axis position="left" grid title="Share (%)" />
      <Area dimension="month" metric="share" color="browser" scaleType="point" />
      <Legend title="Browser" />
    </Chart>
  );
}

export function SpectrumDonut({ colorScheme = 'light', width = 420, height = 260 }: SpectrumChartProps) {
  return (
    <Chart data={spend} theme={colorScheme} width={width} height={height}>
      <Donut metric="value" color="category" />
      <Legend title="Team" />
    </Chart>
  );
}

export function SpectrumScatter({ colorScheme = 'light', width = 420, height = 260 }: SpectrumChartProps) {
  return (
    <Chart data={scatterData} theme={colorScheme} width={width} height={height}>
      <Axis position="bottom" baseline grid title="Speed" />
      <Axis position="left" baseline grid title="Handling" />
      <Scatter dimension="speed" metric="handling" color="weightClass" />
      <Legend title="Weight class" />
    </Chart>
  );
}

export function SpectrumCombo({ colorScheme = 'light', width = 420, height = 260 }: SpectrumChartProps) {
  return (
    <Chart data={comboData} theme={colorScheme} width={width} height={height}>
      <Axis position="left" title="Visitors" grid />
      <Axis position="right" name="conversion" title="Conversion (%)" />
      <Axis position="bottom" baseline />
      <Combo>
        <Bar dimension="month" metric="visitors" />
        <Line dimension="month" metric="conversion" metricAxis="conversion" scaleType="point" color={{ value: COMBO_LINE_COLOR }} />
      </Combo>
    </Chart>
  );
}

export function SpectrumBigNumber({ colorScheme = 'light', width = 240, height = 140 }: SpectrumChartProps) {
  return (
    <Chart data={bigNumberTrend} theme={colorScheme} width={width} height={height}>
      <BigNumber dataKey="visitors" label="Visitors" orientation="vertical">
        <Line dimension="idx" metric="visitors" scaleType="linear" />
      </BigNumber>
    </Chart>
  );
}

export function SpectrumBullet({ colorScheme = 'light', width = 420, height = 260 }: SpectrumChartProps) {
  return (
    <Chart data={bulletData} theme={colorScheme} width={width} height={height}>
      <Bullet dimension="category" metric="current" target="target" />
    </Chart>
  );
}

// Full interaction set on one chart: <Legend highlight isToggleable> (hover
// dims other series, click hides one), <ChartTooltip> (per-segment content),
// and <ChartPopover> (click opens a detail panel). Compare against
// interactiveStackedBarSpec in interactiveSpecs.ts, which replicates all
// three with Vega-Lite params instead of RSC's built-in behavior.
export function SpectrumInteractiveBar({ colorScheme = 'light', width = 420, height = 260 }: SpectrumChartProps) {
  return (
    <Chart data={browserTrend} theme={colorScheme} width={width} height={height}>
      <Axis position="bottom" baseline title="Month" />
      <Axis position="left" grid title="Share (%)" />
      <Bar type="stacked" dimension="month" metric="share" color="browser">
        <ChartTooltip>{(datum) => <div>{String(datum.browser)}: {String(datum.share)}%</div>}</ChartTooltip>
        <ChartPopover>
          {(datum, close) => (
            <div>
              <div>
                {String(datum.browser)} — {String(datum.month)}
              </div>
              <div>{String(datum.share)}% share</div>
              <button onClick={close}>Close</button>
            </div>
          )}
        </ChartPopover>
      </Bar>
      <Legend title="Browser" highlight isToggleable />
    </Chart>
  );
}

// Custom categorical palette via <Chart colors={[...]}> — mirrors passing
// `colors` through to getSpectrumVegaLiteConfig on the Vega-Lite side
// (getInteractiveDonutSpec + <VegaLiteChart colors={CUSTOM_DONUT_COLORS}>).
export function SpectrumColorDonut({ colorScheme = 'light', width = 420, height = 260 }: SpectrumChartProps) {
  return (
    <Chart data={spend} theme={colorScheme} width={width} height={height} colors={CUSTOM_DONUT_COLORS}>
      <Donut metric="value" color="category">
        <ChartTooltip>{(datum) => <div>{String(datum.category)}: {String(datum.value)}</div>}</ChartTooltip>
      </Donut>
      <Legend title="Team" isToggleable />
    </Chart>
  );
}

export function SpectrumVenn({ colorScheme = 'light', width = 420, height = 260 }: SpectrumChartProps) {
  return (
    <Chart data={vennData} theme={colorScheme} width={width} height={height}>
      <Venn color="sets" metric="size" />
      <Title text="Instagram vs. TikTok" />
    </Chart>
  );
}
