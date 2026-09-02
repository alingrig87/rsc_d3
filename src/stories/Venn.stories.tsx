import type { Meta, StoryObj } from '@storybook/react';
import { Comparison } from './Comparison';
import { SpectrumVenn } from '../spectrum/SpectrumCharts';
import { getVennSpec } from '../charts';

const meta: Meta<typeof Comparison> = {
  title: 'Charts/Venn (alpha)',
  component: Comparison,
  args: {
    Spectrum: SpectrumVenn,
    spec: getVennSpec,
    chartName: 'Venn diagram',
    colorScheme: 'light',
    width: 420,
    height: 260,
    note: '<Venn> is an alpha component (imported from the /alpha subpath) that runs a real proportional set-overlap layout algorithm — Vega-Lite has no mark for that. This replica hand-places two circles for the right colors/labels; the overlap size is illustrative, not solved for exact intersection area.',
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
