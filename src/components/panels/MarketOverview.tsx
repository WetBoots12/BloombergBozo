import { Panel } from '../layout/Panel';
import { MiniChart } from '../shared/MiniChart';
import { PriceChange } from '../shared/PriceChange';
import { Skeleton } from '../shared/LoadingSkeleton';
import { useMultipleQuotes } from '../../hooks/useStockQuote';
import { useTerminalStore } from '../../store/terminalStore';
import { formatPrice } from '../../utils/formatters';
import { MOCK_CHART_DATA } from '../../services/mockData';

const INDEX_SYMBOLS = ['SPY', 'QQQ', 'DIA', 'IWM'];
const INDEX_NAMES: Record<string, string> = {
  SPY: 'S&P 500',
  QQQ: 'NASDAQ 100',
  DIA: 'DOW JONES',
  IWM: 'RUSSELL 2000',
};

const SECTOR_SYMBOLS = ['XLF', 'XLK', 'XLE', 'XLV', 'XLI', 'XLC', 'XLY', 'XLP', 'XLRE', 'XLU'];
const SECTOR_NAMES: Record<string, string> = {
  XLF: 'FINANCIALS', XLK: 'TECHNOLOGY', XLE: 'ENERGY', XLV: 'HEALTH CARE',
  XLI: 'INDUSTRIALS', XLC: 'COMM SVCS', XLY: 'CONS DISC', XLP: 'CONS STAPLES',
  XLRE: 'REAL ESTATE', XLU: 'UTILITIES',
};

export function MarketOverview() {
  const { data: indexQuotes, isLoading: indexLoading } = useMultipleQuotes(INDEX_SYMBOLS);
  const { data: sectorQuotes, isLoading: sectorLoading } = useMultipleQuotes(SECTOR_SYMBOLS);
  const setActiveTicker = useTerminalStore(s => s.setActiveTicker);

  return (
    <Panel
      title="MARKET OVERVIEW"
      subtitle="INDICES & SECTORS"
      color="orange"
    >
      <div className="h-full overflow-y-auto flex flex-col">
        {/* Major Indices */}
        <div className="p-2 border-b border-bbg-border">
          <div className="text-bbg-muted text-xs mb-2 px-1">── MAJOR INDICES</div>
          <div className="space-y-1">
            {indexLoading ? (
              Array(4).fill(0).map((_, i) => (
                <div key={i} className="flex items-center gap-2 p-1">
                  <Skeleton width="80px" height="14px" />
                  <Skeleton className="flex-1" height="14px" />
                </div>
              ))
            ) : (
              indexQuotes?.map(quote => {
                const chartData = MOCK_CHART_DATA[quote.symbol]?.slice(-30).map(d => d.close) || [];
                const isPositive = quote.change >= 0;
                return (
                  <div
                    key={quote.symbol}
                    className="flex items-center gap-2 p-1.5 rounded cursor-pointer
                      hover:bg-bbg-panel-alt transition-colors group"
                    onClick={() => setActiveTicker(quote.symbol)}
                  >
                    <div className="w-24 flex-shrink-0">
                      <div className="text-bbg-amber text-xs font-bold group-hover:text-bbg-orange">
                        {quote.symbol}
                      </div>
                      <div className="text-bbg-muted text-xs truncate">
                        {INDEX_NAMES[quote.symbol]}
                      </div>
                    </div>
                    <div className="flex-1 min-w-0">
                      <MiniChart
                        data={chartData}
                        color={isPositive ? '#00FF41' : '#FF3131'}
                        height={28}
                      />
                    </div>
                    <div className="w-32 flex-shrink-0 text-right">
                      <div className="text-bbg-text text-sm font-bold tabular-nums">
                        {formatPrice(quote.price)}
                      </div>
                      <PriceChange
                        change={quote.change}
                        changePercent={quote.changePercent}
                        size="sm"
                        showArrow
                      />
                    </div>
                  </div>
                );
              })
            )}
          </div>
        </div>

        {/* Sector Performance */}
        <div className="p-2 flex-1">
          <div className="text-bbg-muted text-xs mb-2 px-1">── SECTORS (HEAT MAP)</div>
          {sectorLoading ? (
            <div className="grid grid-cols-2 gap-1">
              {Array(10).fill(0).map((_, i) => <Skeleton key={i} height="36px" />)}
            </div>
          ) : (
            <div className="grid grid-cols-2 gap-1">
              {sectorQuotes?.map(quote => {
                const isPositive = quote.changePercent >= 0;
                const intensity = Math.min(Math.abs(quote.changePercent) / 3, 1);
                const bgColor = isPositive
                  ? `rgba(0, 255, 65, ${intensity * 0.25})`
                  : `rgba(255, 49, 49, ${intensity * 0.25})`;
                const borderColor = isPositive ? '#00FF41' : '#FF3131';

                return (
                  <div
                    key={quote.symbol}
                    className="p-1.5 rounded cursor-pointer border transition-all hover:opacity-90"
                    style={{ backgroundColor: bgColor, borderColor: borderColor + '40' }}
                    onClick={() => setActiveTicker(quote.symbol)}
                  >
                    <div className="flex justify-between items-start">
                      <span className="text-bbg-text-dim text-xs">
                        {SECTOR_NAMES[quote.symbol] || quote.symbol}
                      </span>
                      <span
                        className="text-xs font-bold tabular-nums"
                        style={{ color: isPositive ? '#00FF41' : '#FF3131' }}
                      >
                        {isPositive ? '+' : ''}{quote.changePercent.toFixed(2)}%
                      </span>
                    </div>
                    <div className="text-bbg-text text-sm font-bold mt-0.5 tabular-nums">
                      {formatPrice(quote.price)}
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      </div>
    </Panel>
  );
}
