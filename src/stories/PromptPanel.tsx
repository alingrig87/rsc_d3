import { useState } from 'react';
import type { VisualizationSpec } from 'vega-embed';
import { buildSystemPrompt, formatExample } from '../llmPrompt';

interface PromptPanelProps {
  chartName: string;
  spec: VisualizationSpec;
  isDark?: boolean;
}

const systemPrompt = buildSystemPrompt('light');

export function PromptPanel({ chartName, spec, isDark = false }: PromptPanelProps) {
  const [open, setOpen] = useState(false);
  const example = formatExample(chartName, spec);

  const codeStyle = {
    margin: 0,
    padding: 12,
    borderRadius: 6,
    fontSize: 11,
    lineHeight: 1.5,
    overflow: 'auto',
    maxHeight: 320,
    background: isDark ? '#151515' : '#f4f4f4',
    color: isDark ? '#d4d4d4' : '#333',
    whiteSpace: 'pre' as const,
  };

  return (
    <div style={{ marginTop: 16 }}>
      <button
        onClick={() => setOpen((v) => !v)}
        style={{
          fontSize: 12,
          padding: '6px 12px',
          borderRadius: 6,
          border: `1px solid ${isDark ? '#3a3a3a' : '#e0e0e0'}`,
          background: isDark ? '#262626' : '#fff',
          color: isDark ? '#eee' : '#222',
          cursor: 'pointer',
        }}
      >
        {open ? '▾' : '▸'} 🤖 LLM prompt for this chart
      </button>
      {open && (
        <div style={{ marginTop: 10, display: 'grid', gap: 10 }}>
          <div>
            <div style={{ fontSize: 11, fontWeight: 700, marginBottom: 4, color: isDark ? '#9d9d9d' : '#666' }}>
              System prompt (shared by every chart — send once)
            </div>
            <pre style={codeStyle}>{systemPrompt}</pre>
          </div>
          <div>
            <div style={{ fontSize: 11, fontWeight: 700, marginBottom: 4, color: isDark ? '#9d9d9d' : '#666' }}>
              Worked example for this chart (what the model should return)
            </div>
            <pre style={codeStyle}>{example}</pre>
          </div>
        </div>
      )}
    </div>
  );
}
