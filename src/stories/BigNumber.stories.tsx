import type { Meta, StoryObj } from '@storybook/react';
import { Comparison } from './Comparison';
import { SpectrumBigNumber } from '../spectrum/SpectrumCharts';
import { BigNumberReplica } from '../spectrum/BigNumberReplica';

const meta: Meta<typeof Comparison> = {
  title: 'Charts/Big Number',
  component: Comparison,
  args: {
    Spectrum: SpectrumBigNumber,
    Replica: BigNumberReplica,
    replicaTitle: 'CSS + Vega-Lite sparkline',
    colorScheme: 'light',
    width: 240,
    height: 140,
    note: "BigNumber isn't a Vega mark on the Spectrum side either — it's a styled HTML number/label with an optional Vega-driven sparkline. The replica mirrors that split instead of faking a full Vega-Lite chart.",
  },
  argTypes: {
    colorScheme: { control: 'radio', options: ['light', 'dark'] },
    Spectrum: { table: { disable: true } },
    Replica: { table: { disable: true } },
    replicaTitle: { table: { disable: true } },
    note: { table: { disable: true } },
  },
};
export default meta;

type Story = StoryObj<typeof Comparison>;

export const Default: Story = {};
