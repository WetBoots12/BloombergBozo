import { useState } from 'react';
import { Panel } from '../layout/Panel';
import { PriceChange } from '../shared/PriceChange';
import { TVChart } from '../shared/TVChart';
import { Skeleton } from '../shared/LoadingSkeleton';
import { useStockQuote, useCompanyProfile } from '../../hooks/useStockQuote';
import { useStockChart } from '../../hooks/useStockChart';
import { useTerminalStore } from '../../store/terminalStore';
import { formatPrice, formatVolume, formatMarketCap, formatPercent } from '../../utils/formatters';
import type { TimeRange } from '../../types/market';

const TIME_RANGES: TimeRange[] = ['1D', '1W', '1M', '3M', '6M', '1Y', '5Y'];

type ChartMode = 'area' | 'candlestick';

export function StockQuote() {
  const activeTicker = useTerminalStore(s => s.activeTicker);
  const [range, setRange] = useState<TimeRange>('1M');
  const [chartMode, setChartMode] = useState<ChartMode>('area');

  const { data: quote, isLoading: quoteLoading } = useStockQuote(activeTicker);
  const { data: profile } = useCompanyProfile(activeTicker);
  const { data: chartData, isLoading: chartLoading } = useStockChart(activeTicker, range);

  const isPositive = (quote?.change ?? 0) >= 0;

  const chartPoints = chartData || [];
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
          {/* Chart type toggle */}
          <button
            onClick={() => setChartMode(m => m === 'area' ? 'candlestick' : 'area')}
            className={`px-1.5 py-0.5 text-xs rounded transition-colors ${
              chartMode === 'candlestick'
                ? 'bg-bbg-amber text-bbg-black font-bold'
                : 'text-bbg-muted hover:text-bbg-amber hover:bg-bbg-amber/10'
            }`}
            title="Toggle candlestick/area chart"
          >
            {chartMode === 'candlestick' ? 'OHLC' : 'LINE'}
          </button>
          <span className="text-bbg-border mx-0.5">|</span>
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

        {/* TradingView Lightweight Chart */}
        <div className="flex-1 min-h-0 px-1 py-1">
          {chartLoading || !chartPoints.length ? (
            <div className="h-full flex items-center justify-center">
              <div className="text-bbg-muted text-xs animate-pulse">LOADING CHART DATA...</div>
            </div>
          ) : (
            <TVChart
              data={chartPoints}
              chartType={chartMode}
              isPositive={isPositive}
            />
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
