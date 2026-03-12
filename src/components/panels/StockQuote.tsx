import { useState } from 'react';
import {
  ResponsiveContainer, AreaChart, Area, XAxis, YAxis,
  Tooltip, CartesianGrid, ReferenceLine,
} from 'recharts';
import { Panel } from '../layout/Panel';
import { PriceChange } from '../shared/PriceChange';
import { Skeleton } from '../shared/LoadingSkeleton';
import { useStockQuote, useCompanyProfile } from '../../hooks/useStockQuote';
import { useStockChart } from '../../hooks/useStockChart';
import { useTerminalStore } from '../../store/terminalStore';
import { formatPrice, formatVolume, formatMarketCap, formatPercent } from '../../utils/formatters';
import type { TimeRange } from '../../types/market';

const TIME_RANGES: TimeRange[] = ['1D', '1W', '1M', '3M', '6M', '1Y', '5Y'];

interface CustomTooltipProps {
  active?: boolean;
  payload?: Array<{ value: number }>;
  label?: string;
}

function CustomTooltip({ active, payload, label }: CustomTooltipProps) {
  if (!active || !payload?.[0]) return null;
  return (
    <div className="bg-bbg-panel border border-bbg-border px-2 py-1.5 text-xs">
      <div className="text-bbg-muted">{label}</div>
      <div className="text-bbg-amber font-bold">${formatPrice(payload[0].value)}</div>
    </div>
  );
}

export function StockQuote() {
  const activeTicker = useTerminalStore(s => s.activeTicker);
  const [range, setRange] = useState<TimeRange>('1M');

  const { data: quote, isLoading: quoteLoading } = useStockQuote(activeTicker);
  const { data: profile } = useCompanyProfile(activeTicker);
  const { data: chartData, isLoading: chartLoading } = useStockChart(activeTicker, range);

  const isPositive = (quote?.change ?? 0) >= 0;
  const chartColor = isPositive ? '#00FF41' : '#FF3131';

  const chartPoints = chartData?.map(d => ({
    date: d.date,
    close: d.close,
    volume: d.volume,
  })) || [];

  const minPrice = chartPoints.length ? Math.min(...chartPoints.map(d => d.close)) : 0;
  const maxPrice = chartPoints.length ? Math.max(...chartPoints.map(d => d.close)) : 0;
  const priceBuffer = (maxPrice - minPrice) * 0.1;

  const firstPrice = chartPoints[0]?.close || 0;
  const lastPrice = chartPoints[chartPoints.length - 1]?.close || 0;
  const chartChange = lastPrice - firstPrice;
  const chartChangePct = firstPrice ? (chartChange / firstPrice) * 100 : 0;

  return (
    <Panel
      title={`${activeTicker} EQUITY`}
      subtitle={profile?.name || activeTicker}
      color="green"
      headerRight={
        <div className="flex items-center gap-1">
          {TIME_RANGES.map(r => (
            <button
              key={r}
              onClick={() => setRange(r)}
              className={`px-1.5 py-0.5 text-xs rounded transition-colors ${
                range === r
                  ? 'bg-bbg-green text-bbg-black font-bold'
                  : 'text-bbg-muted hover:text-bbg-green hover:bg-bbg-green/10'
              }`}
            >
              {r}
            </button>
          ))}
        </div>
      }
    >
      <div className="h-full flex flex-col overflow-hidden">
        {/* Price Header */}
        <div className="px-3 pt-2 pb-1 border-b border-bbg-border flex-shrink-0">
          {quoteLoading ? (
            <div className="space-y-1">
              <Skeleton width="140px" height="32px" />
              <Skeleton width="180px" height="18px" />
            </div>
          ) : quote ? (
            <div className="flex items-end gap-4 flex-wrap">
              <div>
                <div className="text-bbg-text text-3xl font-bold tabular-nums leading-none">
                  ${formatPrice(quote.price)}
                </div>
                <PriceChange
                  change={quote.change}
                  changePercent={quote.changePercent}
                  size="md"
                  showArrow
                  className="mt-1"
                />
              </div>
              <div className="flex gap-4 text-xs text-bbg-muted pb-0.5">
                <span>O: <span className="text-bbg-text">{formatPrice(quote.open)}</span></span>
                <span>H: <span className="text-bbg-green">{formatPrice(quote.high)}</span></span>
                <span>L: <span className="text-bbg-red">{formatPrice(quote.low)}</span></span>
                <span>PC: <span className="text-bbg-text">{formatPrice(quote.prevClose)}</span></span>
                <span>VOL: <span className="text-bbg-text">{formatVolume(quote.volume)}</span></span>
              </div>
            </div>
          ) : null}
        </div>

        {/* Chart */}
        <div className="flex-1 min-h-0 px-2 py-2">
          {chartLoading || !chartPoints.length ? (
            <div className="h-full flex items-center justify-center">
              <div className="text-bbg-muted text-xs animate-pulse">LOADING CHART DATA...</div>
            </div>
          ) : (
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={chartPoints} margin={{ top: 5, right: 5, bottom: 0, left: 0 }}>
                <defs>
                  <linearGradient id="chartGradient" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor={chartColor} stopOpacity={0.3} />
                    <stop offset="95%" stopColor={chartColor} stopOpacity={0} />
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" stroke="#1a1a1a" vertical={false} />
                <XAxis
                  dataKey="date"
                  tick={{ fill: '#666666', fontSize: 10 }}
                  tickLine={false}
                  axisLine={false}
                  interval="preserveStartEnd"
                  tickFormatter={(v) => {
                    const d = new Date(v);
                    if (range === '1D') return d.toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' });
                    if (range === '1W' || range === '1M') return d.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
                    return d.toLocaleDateString('en-US', { month: 'short', year: '2-digit' });
                  }}
                />
                <YAxis
                  tick={{ fill: '#666666', fontSize: 10 }}
                  tickLine={false}
                  axisLine={false}
                  width={60}
                  domain={[minPrice - priceBuffer, maxPrice + priceBuffer]}
                  tickFormatter={(v) => `$${formatPrice(v)}`}
                />
                <Tooltip content={<CustomTooltip />} />
                <ReferenceLine
                  y={firstPrice}
                  stroke="#444444"
                  strokeDasharray="4 4"
                  strokeWidth={1}
                />
                <Area
                  type="monotone"
                  dataKey="close"
                  stroke={chartColor}
                  strokeWidth={2}
                  fill="url(#chartGradient)"
                  dot={false}
                  activeDot={{ r: 3, fill: chartColor, strokeWidth: 0 }}
                  isAnimationActive={false}
                />
              </AreaChart>
            </ResponsiveContainer>
          )}
        </div>

        {/* Range Performance */}
        {!chartLoading && chartPoints.length > 0 && (
          <div className="px-3 pb-2 flex-shrink-0 border-t border-bbg-border pt-1.5">
            <div className="flex items-center justify-between text-xs">
              <span className="text-bbg-muted">{range} PERFORMANCE</span>
              <span className={chartChange >= 0 ? 'text-bbg-green' : 'text-bbg-red'}>
                {chartChange >= 0 ? '▲' : '▼'} {formatPrice(Math.abs(chartChange))} ({formatPercent(chartChangePct)})
              </span>
            </div>
          </div>
        )}

        {/* Company Stats */}
        {profile && (
          <div className="px-3 py-2 border-t border-bbg-border flex-shrink-0 grid grid-cols-3 gap-x-4 gap-y-1 text-xs">
            <div className="flex justify-between">
              <span className="text-bbg-muted">MKT CAP</span>
              <span className="text-bbg-text tabular-nums">{formatMarketCap(profile.marketCap)}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-bbg-muted">P/E</span>
              <span className="text-bbg-text tabular-nums">{profile.peRatio ? profile.peRatio.toFixed(1) : '--'}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-bbg-muted">SECTOR</span>
              <span className="text-bbg-text truncate ml-1">{profile.sector || profile.industry || '--'}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-bbg-muted">52W HIGH</span>
              <span className="text-bbg-green tabular-nums">{profile.weekHigh52 ? formatPrice(profile.weekHigh52) : '--'}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-bbg-muted">52W LOW</span>
              <span className="text-bbg-red tabular-nums">{profile.weekLow52 ? formatPrice(profile.weekLow52) : '--'}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-bbg-muted">EXCH</span>
              <span className="text-bbg-text">{profile.exchange || '--'}</span>
            </div>
          </div>
        )}
      </div>
    </Panel>
  );
}
