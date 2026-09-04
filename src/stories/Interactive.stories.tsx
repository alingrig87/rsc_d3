import { useState } from 'react';
import type { Meta, StoryObj } from '@storybook/react';
import { Comparison } from './Comparison';
import { SpectrumInteractiveBar, SpectrumColorDonut } from '../spectrum/SpectrumCharts';
import {
  interactiveStackedBarSpec,
  interactiveLineDimensionHighlightSpec,
  getInteractiveDonutSpec,
  CUSTOM_DONUT_COLORS,
} from '../interactiveSpecs';

const meta: Meta<typeof Comparison> = {
  title: 'Charts/Interactive',
  component: Comparison,
  args: { colorScheme: 'light', width: 420, height: 260 },
  argTypes: {
    colorScheme: { control: 'radio', options: ['light', 'dark'] },
    Spectrum: { table: { disable: true } },
    spec: { table: { disable: true } },
    chartName: { table: { disable: true } },
  },
};
export default meta;

type Story = StoryObj<typeof Comparison>;

// Hover a legend entry to dim the others, click one to hide/show it, hover a
// bar segment for its tooltip. Click a segment to see the host-side popover
// wired through <VegaLiteChart onMarkClick>.
export const LegendAndTooltip: Story = {
  render: (args) => {
    function Demo() {
      const [clicked, setClicked] = useState<string | null>(null);
      return (
        <div>
          <Comparison
            {...args}
            Spectrum={SpectrumInteractiveBar}
            spec={interactiveStackedBarSpec}
            chartName="Interactive stacked bar (legend highlight + toggle, tooltip, popover)"
            onMarkClick={(datum) => setClicked(`${datum.browser} — ${datum.month}: ${datum.share}%`)}
          />
          {clicked && (
            <p style={{ fontSize: 12, marginTop: 12 }}>
              Vega-Lite panel click (host-rendered popover stand-in): <strong>{clicked}</strong>
            </p>
          )}
        </div>
      );
    }
    return <Demo />;
  },
};

// Custom categorical palette via RSC's `<Chart colors={[...]}>` vs.
// `getSpectrumVegaLiteConfig(colorScheme, colors)` on the Vega-Lite side.
export const CustomColors: Story = {
  args: {
    Spectrum: SpectrumColorDonut,
    spec: getInteractiveDonutSpec,
    chartName: 'Donut with a custom color array',
    colors: CUSTOM_DONUT_COLORS,
  },
};

// No RSC equivalent story here (interactionMode="dimension" would need its
// own <Chart>), but this is the live Vega-Lite recipe for RSC's
// interactionMode="dimension" + <ChartTooltip highlightBy="dimension">:
// hover anywhere near a month to highlight every series at that x at once.
export const LineDimensionHighlight: Story = {
  args: {
    spec: interactiveLineDimensionHighlightSpec,
    chartName: 'Line chart — dimension-highlight tooltip',
    replicaTitle: 'Vega-Lite replica (interactionMode="dimension" equivalent)',
    note: 'RSC equivalent: <Line interactionMode="dimension"><ChartTooltip highlightBy="dimension" /></Line>. No side-by-side RSC panel here — this story is the Vega-Lite recipe on its own.',
  },
};
