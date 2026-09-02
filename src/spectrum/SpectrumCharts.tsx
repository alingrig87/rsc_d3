import { Axis, Bar, Line, Area, Legend, Chart, Scatter, Title } from '@adobe/react-spectrum-charts';
import { Donut, BigNumber } from '@adobe/react-spectrum-charts/rc';
import { Combo, Bullet, Venn } from '@adobe/react-spectrum-charts/alpha';
import { browserTrend, spend, regionSales, scatterData, comboData, bigNumberTrend, bulletData, vennData } from '../data';

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

export function SpectrumVenn({ colorScheme = 'light', width = 420, height = 260 }: SpectrumChartProps) {
  return (
    <Chart data={vennData} theme={colorScheme} width={width} height={height}>
      <Venn color="sets" metric="size" />
      <Title text="Instagram vs. TikTok" />
    </Chart>
  );
}
