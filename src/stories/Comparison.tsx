import type { ComponentType, ReactNode } from 'react';
import type { VisualizationSpec } from 'vega-embed';
import { VegaLiteChart } from '../VegaLiteChart';
import { PromptPanel } from './PromptPanel';

interface SpectrumChartProps {
  colorScheme?: 'light' | 'dark';
  width?: number;
  height?: number;
}

export interface ComparisonProps {
  colorScheme?: 'light' | 'dark';
  width?: number;
  height?: number;
  /** Omit when react-spectrum-charts has no equivalent component — renders a single panel. */
  Spectrum?: ComponentType<SpectrumChartProps>;
  spectrumTitle?: string;
  /** Vega-Lite spec (or a (width, height) => spec factory) for the replica panel. */
  spec?: VisualizationSpec | ((width: number, height: number) => VisualizationSpec);
  /** Use instead of `spec` when the replica isn't a plain Vega-Lite spec (e.g. BigNumber, Venn). */
  Replica?: ComponentType<SpectrumChartProps>;
  replicaTitle?: string;
  /** Optional caveat shown below the panels (e.g. "approximation, not pixel-exact"). */
  note?: ReactNode;
  /** Chart name for the LLM prompt panel (defaults to `replicaTitle`'s story title via Storybook — pass explicitly for a cleaner label). */
  chartName?: string;
  /** Hide the "LLM prompt for this chart" panel (shown by default whenever `spec` is set). */
  hidePrompt?: boolean;
  /** Custom categorical palette, forwarded to the replica's <VegaLiteChart colors={...}>. */
  colors?: string[];
  /** Forwarded to the replica's <VegaLiteChart onMarkClick={...}> — the host-side half of a click popover. */
  onMarkClick?: (datum: Record<string, unknown>, event: MouseEvent) => void;
}

export function Comparison({
  colorScheme = 'light',
  width = 420,
  height = 260,
  Spectrum,
  spectrumTitle = '@adobe/react-spectrum-charts',
  spec,
  Replica,
  replicaTitle = 'Vega-Lite replica',
  note,
  chartName,
  hidePrompt = false,
  colors,
  onMarkClick,
}: ComparisonProps) {
  const isDark = colorScheme === 'dark';
  const resolvedSpec = spec ? (typeof spec === 'function' ? spec(width, height) : spec) : undefined;

  return (
    <div
      style={{
        background: isDark ? '#1e1e1e' : '#fafafa',
        padding: 24,
        borderRadius: 8,
      }}
    >
      <div
        style={{
          display: 'grid',
          gridTemplateColumns: Spectrum ? 'repeat(auto-fit, minmax(460px, 1fr))' : 'minmax(0, 460px)',
          gap: 24,
        }}
      >
        {Spectrum && (
          <Panel title={spectrumTitle} isDark={isDark}>
            <Spectrum colorScheme={colorScheme} width={width} height={height} />
          </Panel>
        )}
        <Panel title={replicaTitle} isDark={isDark}>
          {Replica ? (
            <Replica colorScheme={colorScheme} width={width} height={height} />
          ) : resolvedSpec ? (
            <VegaLiteChart
              spec={resolvedSpec}
              colorScheme={colorScheme}
              width={width}
              height={height}
              colors={colors}
              onMarkClick={onMarkClick}
            />
          ) : null}
        </Panel>
      </div>
      {note && (
        <p
          style={{
            marginTop: 16,
            marginBottom: 0,
            fontSize: 12,
            lineHeight: 1.5,
            color: isDark ? '#9d9d9d' : '#666',
          }}
        >
          {note}
        </p>
      )}
      {!hidePrompt && resolvedSpec && (
        <PromptPanel chartName={chartName ?? replicaTitle} spec={resolvedSpec} isDark={isDark} />
      )}
    </div>
  );
}

function Panel({ title, isDark, children }: { title: string; isDark: boolean; children: React.ReactNode }) {
  return (
    <div
      style={{
        background: isDark ? '#262626' : '#fff',
        border: `1px solid ${isDark ? '#3a3a3a' : '#e6e6e6'}`,
        borderRadius: 8,
        padding: 16,
      }}
    >
      <h3
        style={{
          fontSize: 13,
          margin: '0 0 12px',
          fontFamily: 'monospace',
          color: isDark ? '#9d9d9d' : '#666',
          textTransform: 'uppercase',
          letterSpacing: 0.4,
        }}
      >
        {title}
      </h3>
      {children}
    </div>
  );
}
