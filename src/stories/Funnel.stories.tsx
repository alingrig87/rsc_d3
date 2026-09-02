import type { Meta, StoryObj } from '@storybook/react';
import { Comparison } from './Comparison';
import { getFunnelSpec } from '../charts';

const meta: Meta<typeof Comparison> = {
  title: 'Charts/Funnel',
  component: Comparison,
  args: {
    spec: getFunnelSpec,
    replicaTitle: 'Vega-Lite',
    chartName: 'Funnel chart',
    colorScheme: 'light',
    width: 420,
    height: 260,
    note: "react-spectrum-charts has no native Funnel component, so there's no Spectrum panel to compare against here — this is a plain Vega-Lite chart styled with the same Spectrum theme as everything else. It's a horizontal bar per stage, sorted in decreasing order and centered on a shared midline (via calculated xStart/xEnd), which is what turns stepped bars into a taper.",
  },
  argTypes: {
    colorScheme: { control: 'radio', options: ['light', 'dark'] },
    spec: { table: { disable: true } },
    replicaTitle: { table: { disable: true } },
    note: { table: { disable: true } },
    chartName: { table: { disable: true } },
  },
};
export default meta;

type Story = StoryObj<typeof Comparison>;

export const Default: Story = {};
