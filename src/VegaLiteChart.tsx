import { useEffect, useRef } from 'react';
import embed, { type VisualizationSpec } from 'vega-embed';
import type { ScenegraphEvent, View } from 'vega';
import { getSpectrumVegaLiteConfig } from './spectrumVegaTheme';

interface VegaLiteChartProps {
  spec: VisualizationSpec;
  colorScheme?: 'light' | 'dark';
  width?: number;
  height?: number;
  /** Custom categorical palette — mirrors RSC's `<Chart colors={[...]}>`. Omit for the default Spectrum palette. */
  colors?: string[];
  /**
   * Fired when a mark with a backing datum is clicked. This is the host-side
   * half of RSC's `<ChartPopover>` — Vega-Lite can select the clicked datum,
   * but rendering the floating detail panel is the host app's job. Open your
   * own popover/menu from here instead of trying to fake one in the spec.
   */
  onMarkClick?: (datum: Record<string, unknown>, event: MouseEvent) => void;
}

export function VegaLiteChart({
  spec,
  colorScheme = 'light',
  width = 500,
  height = 300,
  colors,
  onMarkClick,
}: VegaLiteChartProps) {
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!containerRef.current) return;
    let cancelled = false;
    let cleanupFn: (() => void) | undefined;

    const fullSpec = {
      ...spec,
      width,
      height,
      config: getSpectrumVegaLiteConfig(colorScheme, colors),
    } as VisualizationSpec;

    embed(containerRef.current, fullSpec, { actions: false, renderer: 'svg' }).then((result) => {
      if (cancelled) {
        result.view.finalize();
        return;
      }

      let clickHandler: ((event: ScenegraphEvent, item: { datum?: Record<string, unknown> } | null | undefined) => void) | undefined;
      if (onMarkClick) {
        clickHandler = (event, item) => {
          if (item?.datum) onMarkClick(item.datum, event as MouseEvent);
        };
        (result.view as View).addEventListener('click', clickHandler);
      }

      cleanupFn = () => {
        if (clickHandler) (result.view as View).removeEventListener('click', clickHandler);
        result.view.finalize();
      };
    });

    return () => {
      cancelled = true;
      cleanupFn?.();
    };
  }, [spec, colorScheme, width, height, colors, onMarkClick]);

  return <div ref={containerRef} />;
}
