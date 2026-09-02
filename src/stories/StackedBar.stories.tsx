import type { Meta, StoryObj } from '@storybook/react';
import { Comparison } from './Comparison';
import { SpectrumStackedBar } from '../spectrum/SpectrumCharts';
import { stackedBarSpec } from '../charts';

const meta: Meta<typeof Comparison> = {
  title: 'Charts/Stacked Bar',
  component: Comparison,
  args: { Spectrum: SpectrumStackedBar, spec: stackedBarSpec, chartName: 'Stacked bar chart', colorScheme: 'light', width: 420, height: 260 },
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
