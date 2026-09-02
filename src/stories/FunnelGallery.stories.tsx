import type { Meta, StoryObj } from '@storybook/react';
import { VegaLiteChart } from '../VegaLiteChart';
import { getFunnelVariants } from '../funnelVariants';
import { PromptPanel } from './PromptPanel';

interface GalleryProps {
  colorScheme?: 'light' | 'dark';
}

function FunnelGallery({ colorScheme = 'light' }: GalleryProps) {
  const isDark = colorScheme === 'dark';
  const width = 300;
  const height = 170;
  const variants = getFunnelVariants(width, height);

  return (
    <div
      style={{
        display: 'grid',
        gridTemplateColumns: 'repeat(auto-fit, minmax(340px, 1fr))',
        gap: 20,
        background: isDark ? '#1e1e1e' : '#fafafa',
        padding: 24,
        borderRadius: 8,
      }}
    >
      {variants.map(({ title, note, spec }) => (
        <div
          key={title}
          style={{
            background: isDark ? '#262626' : '#fff',
            border: `1px solid ${isDark ? '#3a3a3a' : '#e6e6e6'}`,
            borderRadius: 8,
            padding: 16,
          }}
        >
          <h3 style={{ fontSize: 14, margin: '0 0 4px', color: isDark ? '#eee' : '#222' }}>{title}</h3>
          {note && (
            <p style={{ fontSize: 11, margin: '0 0 10px', color: isDark ? '#9d9d9d' : '#888' }}>{note}</p>
          )}
          <VegaLiteChart spec={spec} colorScheme={colorScheme} width={width} height={height} />
          <PromptPanel chartName={`Funnel — ${title}`} spec={spec} isDark={isDark} />
        </div>
      ))}
    </div>
  );
}

const meta: Meta<typeof FunnelGallery> = {
  title: 'Charts/Funnel Gallery',
  component: FunnelGallery,
  args: { colorScheme: 'light' },
  argTypes: {
    colorScheme: { control: 'radio', options: ['light', 'dark'] },
  },
};
export default meta;

type Story = StoryObj<typeof FunnelGallery>;

export const Default: Story = {};
