import { VegaLiteChart } from '../VegaLiteChart';
import { ADOBE_CLEAN_FONT } from '../spectrumVegaTheme';
import { bigNumberTrend } from '../data';

interface ReplicaProps {
  colorScheme?: 'light' | 'dark';
  width?: number;
  height?: number;
}

// BigNumber isn't a Vega mark on the Spectrum side either — it's a styled
// HTML number + label, with an optional embedded Line chart as a sparkline.
// So the "Vega-Lite replica" here is the same split: plain CSS for the
// number/label (matched to the same font/color tokens as everything else),
// Vega-Lite only for the sparkline.
export function BigNumberReplica({ colorScheme = 'light', width = 240, height = 140 }: ReplicaProps) {
  const isDark = colorScheme === 'dark';
  const fontColor = isDark ? 'rgb(235, 235, 235)' : 'rgb(34, 34, 34)';
  const labelColor = isDark ? 'rgb(176, 176, 176)' : 'rgb(109, 109, 109)';
  const last = bigNumberTrend[bigNumberTrend.length - 1].visitors;

  const sparklineSpec = {
    data: { values: bigNumberTrend },
    mark: { type: 'line' as const, strokeWidth: 2 },
    encoding: {
      x: { field: 'idx', type: 'quantitative' as const, axis: null },
      y: { field: 'visitors', type: 'quantitative' as const, axis: null, scale: { zero: false } },
    },
  };

  return (
    <div style={{ width, height, display: 'flex', flexDirection: 'column', justifyContent: 'center' }}>
      <div style={{ fontFamily: ADOBE_CLEAN_FONT, fontSize: 13, color: labelColor, marginBottom: 2 }}>Visitors</div>
      <div style={{ fontFamily: ADOBE_CLEAN_FONT, fontSize: 34, fontWeight: 700, color: fontColor, lineHeight: 1 }}>
        {last.toLocaleString()}
      </div>
      <div style={{ marginTop: 8, height: 32, width: Math.min(width - 32, 160) }}>
        <VegaLiteChart spec={sparklineSpec} colorScheme={colorScheme} width={Math.min(width - 32, 160)} height={32} />
      </div>
    </div>
  );
}
