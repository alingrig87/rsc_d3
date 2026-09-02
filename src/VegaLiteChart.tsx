import { useEffect, useRef } from 'react';
import embed, { type VisualizationSpec } from 'vega-embed';
import { getSpectrumVegaLiteConfig } from './spectrumVegaTheme';

interface VegaLiteChartProps {
  spec: VisualizationSpec;
  colorScheme?: 'light' | 'dark';
  width?: number;
  height?: number;
}

export function VegaLiteChart({ spec, colorScheme = 'light', width = 500, height = 300 }: VegaLiteChartProps) {
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!containerRef.current) return;
    let cancelled = false;
    let cleanupFn: (() => void) | undefined;

    const fullSpec = {
      ...spec,
      width,
      height,
      config: getSpectrumVegaLiteConfig(colorScheme),
    } as VisualizationSpec;

    embed(containerRef.current, fullSpec, { actions: false, renderer: 'svg' }).then((result) => {
      if (cancelled) {
        result.view.finalize();
        return;
      }
      cleanupFn = () => result.view.finalize();
    });

    return () => {
      cancelled = true;
      cleanupFn?.();
    };
  }, [spec, colorScheme, width, height]);

  return <div ref={containerRef} />;
}
