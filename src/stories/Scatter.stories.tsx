import type { Meta, StoryObj } from '@storybook/react';
import { Comparison } from './Comparison';
import { SpectrumScatter } from '../spectrum/SpectrumCharts';
import { scatterSpec } from '../charts';

const meta: Meta<typeof Comparison> = {
  title: 'Charts/Scatter',
  component: Comparison,
  args: { Spectrum: SpectrumScatter, spec: scatterSpec, chartName: 'Scatter chart', colorScheme: 'light', width: 420, height: 260 },
  argTypes: {
    colorScheme: { control: 'radio', options: ['light', 'dark'] },
    Spectrum: { table: { disable: true } },
    spec: { table: { disable: true } },
    chartName: { table: { disable: true } },
  },
};
export default meta;

type Story = StoryObj<typeof Comparison>;

export const Default: Story = {};
