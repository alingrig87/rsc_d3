import { useState } from 'react';
import { VegaLiteChart } from './VegaLiteChart';
import { barSpec, dodgedBarSpec, stackedBarSpec, lineSpec, areaSpec, getDonutSpec } from './charts';

const CHART_WIDTH = 420;
const CHART_HEIGHT = 260;

const charts: { title: string; spec: Parameters<typeof VegaLiteChart>[0]['spec'] }[] = [
  { title: 'Bar', spec: barSpec },
  { title: 'Dodged bar', spec: dodgedBarSpec },
  { title: 'Stacked bar', spec: stackedBarSpec },
  { title: 'Line', spec: lineSpec },
  { title: 'Area', spec: areaSpec },
  { title: 'Donut', spec: getDonutSpec(CHART_WIDTH, CHART_HEIGHT) },
];

export default function App() {
  const [colorScheme, setColorScheme] = useState<'light' | 'dark'>('light');
  const isDark = colorScheme === 'dark';

  return (
    <div
      style={{
        minHeight: '100vh',
        background: isDark ? '#1e1e1e' : '#fafafa',
        color: isDark ? '#eee' : '#222',
        fontFamily:
          "adobe-clean, 'Source Sans Pro', -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif",
        padding: '32px',
        transition: 'background 0.2s, color 0.2s',
      }}
    >
      <header style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 24 }}>
        <div>
          <h1 style={{ margin: 0, fontSize: 22 }}>React Spectrum Charts — Vega-Lite parity</h1>
          <p style={{ margin: '4px 0 0', opacity: 0.7, fontSize: 14 }}>
            Rendered with Vega-Lite using the Spectrum design tokens extracted from{' '}
            <code>@adobe/react-spectrum-charts</code> — no React Spectrum dependency.
          </p>
        </div>
        <button
          onClick={() => setColorScheme(isDark ? 'light' : 'dark')}
          style={{
            padding: '8px 16px',
            borderRadius: 6,
            border: `1px solid ${isDark ? '#555' : '#ccc'}`,
            background: isDark ? '#2a2a2a' : '#fff',
            color: isDark ? '#eee' : '#222',
            cursor: 'pointer',
          }}
        >
          {isDark ? '☀️ Light' : '🌙 Dark'} theme
        </button>
      </header>

      <div
        style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(460px, 1fr))',
          gap: 24,
        }}
      >
        {charts.map(({ title, spec }) => (
          <div
            key={title}
            style={{
              background: isDark ? '#262626' : '#fff',
              border: `1px solid ${isDark ? '#3a3a3a' : '#e6e6e6'}`,
              borderRadius: 8,
              padding: 16,
            }}
          >
            <h2 style={{ fontSize: 16, margin: '0 0 12px' }}>{title}</h2>
            <VegaLiteChart spec={spec} colorScheme={colorScheme} width={CHART_WIDTH} height={CHART_HEIGHT} />
          </div>
        ))}
      </div>
    </div>
  );
}
