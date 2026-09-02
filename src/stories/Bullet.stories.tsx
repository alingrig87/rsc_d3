import type { Meta, StoryObj } from '@storybook/react';
import { Comparison } from './Comparison';
import { SpectrumBullet } from '../spectrum/SpectrumCharts';
import { bulletSpec } from '../charts';

const meta: Meta<typeof Comparison> = {
  title: 'Charts/Bullet (alpha)',
  component: Comparison,
  args: {
    Spectrum: SpectrumBullet,
    spec: bulletSpec,
    chartName: 'Bullet chart',
    colorScheme: 'light',
    width: 420,
    height: 260,
    note: '<Bullet> is an alpha component (imported from the /alpha subpath). Bar rounding, target rule styling and colors are matched; row-label placement differs — Adobe floats the label above each bar, this replica uses a left axis since Vega-Lite has no direct equivalent.',
  },
  argTypes: {
    colorScheme: { control: 'radio', options: ['light', 'dark'] },
    Spectrum: { table: { disable: true } },
    spec: { table: { disable: true } },
    note: { table: { disable: true } },
    chartName: { table: { disable: true } },
  },
};
export default meta;

type Story = StoryObj<typeof Comparison>;

export const Default: Story = {};
