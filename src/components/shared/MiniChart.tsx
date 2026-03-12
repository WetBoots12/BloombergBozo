import { ResponsiveContainer, AreaChart, Area, Tooltip } from 'recharts';

interface MiniChartProps {
  data: number[];
  color?: string;
  height?: number;
  showTooltip?: boolean;
}

export function MiniChart({ data, color = '#00FF41', height = 40, showTooltip = false }: MiniChartProps) {
  if (!data || data.length < 2) {
    return <div style={{ height }} className="bg-bbg-panel-alt rounded animate-pulse" />;
  }

  const chartData = data.map((value, index) => ({ value, index }));
  const isPositive = data[data.length - 1] >= data[0];
  const lineColor = isPositive ? '#00FF41' : '#FF3131';
  const gradientId = `mini-${Math.random().toString(36).substr(2, 9)}`;

  return (
    <ResponsiveContainer width="100%" height={height}>
      <AreaChart data={chartData} margin={{ top: 2, right: 0, bottom: 2, left: 0 }}>
        <defs>
          <linearGradient id={gradientId} x1="0" y1="0" x2="0" y2="1">
            <stop offset="5%" stopColor={color || lineColor} stopOpacity={0.3} />
            <stop offset="95%" stopColor={color || lineColor} stopOpacity={0} />
          </linearGradient>
        </defs>
        {showTooltip && (
          <Tooltip
            contentStyle={{ background: '#0f0f0f', border: '1px solid #2a2a2a', borderRadius: 4, fontSize: 11 }}
            itemStyle={{ color: '#E8E8E8' }}
            formatter={(v) => [(Number(v)).toFixed(2), 'Price']}
            labelFormatter={() => ''}
          />
        )}
        <Area
          type="monotone"
          dataKey="value"
          stroke={color || lineColor}
          strokeWidth={1.5}
          fill={`url(#${gradientId})`}
          dot={false}
          activeDot={{ r: 2, fill: color || lineColor }}
          isAnimationActive={false}
        />
      </AreaChart>
    </ResponsiveContainer>
  );
}
