import type { Meta, StoryObj } from '@storybook/react';
import { Comparison } from './Comparison';
import { SpectrumCombo } from '../spectrum/SpectrumCharts';
import { comboSpec } from '../charts';

const meta: Meta<typeof Comparison> = {
  title: 'Charts/Combo (alpha)',
  component: Comparison,
  args: {
    Spectrum: SpectrumCombo,
    spec: comboSpec,
    chartName: 'Combo chart (bar + line, dual axis)',
    colorScheme: 'light',
    width: 420,
    height: 260,
    note: '<Combo> is an alpha component in @adobe/react-spectrum-charts (imported from the /alpha subpath) — bar + line sharing one x-axis with independent y-scales.',
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
