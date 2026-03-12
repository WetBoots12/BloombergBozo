import { Panel } from '../layout/Panel';
import { TableSkeleton } from '../shared/LoadingSkeleton';
import { useForexPairs } from '../../hooks/useForex';
import type { ForexPair } from '../../types/market';

const FLAG_MAP: Record<string, string> = {
  USD: '🇺🇸', EUR: '🇪🇺', GBP: '🇬🇧', JPY: '🇯🇵', CHF: '🇨🇭',
  AUD: '🇦🇺', CAD: '🇨🇦', NZD: '🇳🇿', CNY: '🇨🇳', HKD: '🇭🇰',
};

function ForexRow({ pair }: { pair: ForexPair }) {
  const isPositive = pair.changePercent >= 0;
  const decimals = pair.to === 'JPY' ? 2 : 4;

  return (
    <div className="flex items-center gap-2 px-3 py-2 border-b border-bbg-border/40 hover:bg-bbg-panel-alt transition-colors text-xs">
      {/* Pair */}
      <div className="w-28 flex-shrink-0">
        <div className="flex items-center gap-1">
          <span className="text-sm">{FLAG_MAP[pair.from] || ''}</span>
          <span className="text-sm">{FLAG_MAP[pair.to] || ''}</span>
        </div>
        <div className="text-bbg-amber font-bold mt-0.5">{pair.from}/{pair.to}</div>
      </div>

      {/* Rate */}
      <div className="flex-1 text-right">
        <div className="text-bbg-text font-bold tabular-nums text-sm">
          {pair.rate.toFixed(decimals)}
        </div>
      </div>

      {/* Change */}
      <div className="w-20 text-right tabular-nums" style={{ color: isPositive ? '#00FF41' : '#FF3131' }}>
        {isPositive ? '▲' : '▼'} {Math.abs(pair.changePercent).toFixed(2)}%
      </div>

      {/* Bid/Ask */}
      <div className="w-32 text-right text-bbg-muted tabular-nums hidden md:flex gap-1 justify-end">
        <span className="text-bbg-red">{pair.bid?.toFixed(decimals) || '--'}</span>
        <span>/</span>
        <span className="text-bbg-green">{pair.ask?.toFixed(decimals) || '--'}</span>
      </div>

      {/* Change absolute */}
      <div className="w-16 text-right tabular-nums text-bbg-muted hidden lg:block">
        {pair.change >= 0 ? '+' : ''}{pair.change?.toFixed(decimals) || '--'}
      </div>
    </div>
  );
}

export function ForexPanel() {
  const { data: pairs, isLoading } = useForexPairs();

  const majorPairs = pairs?.filter(p =>
    ['EUR/USD', 'GBP/USD', 'USD/JPY', 'USD/CHF', 'AUD/USD', 'USD/CAD'].includes(`${p.from}/${p.to}`)
  ) || [];

  const crossPairs = pairs?.filter(p =>
    !['EUR/USD', 'GBP/USD', 'USD/JPY', 'USD/CHF', 'AUD/USD', 'USD/CAD'].includes(`${p.from}/${p.to}`)
  ) || [];

  return (
    <Panel
      title="FOREX"
      subtitle="CURRENCY MARKETS"
      color="blue"
    >
      <div className="h-full flex flex-col overflow-hidden">
        {/* Table Header */}
        <div className="flex items-center gap-2 px-3 py-1.5 border-b border-bbg-border bg-bbg-header-alt flex-shrink-0 text-xs text-bbg-muted">
          <div className="w-28">PAIR</div>
          <div className="flex-1 text-right">RATE</div>
          <div className="w-20 text-right">CHG%</div>
          <div className="w-32 text-right hidden md:block">BID / ASK</div>
          <div className="w-16 text-right hidden lg:block">CHG</div>
        </div>

        <div className="flex-1 overflow-y-auto">
          {isLoading ? (
            <div className="p-3"><TableSkeleton rows={12} cols={4} /></div>
          ) : !pairs?.length ? (
            <div className="flex items-center justify-center h-32 text-bbg-muted text-xs">
              NO FOREX DATA
            </div>
          ) : (
            <>
              {majorPairs.length > 0 && (
                <>
                  <div className="px-3 py-1.5 text-xs text-bbg-muted bg-bbg-panel-alt border-b border-bbg-border">
                    ── MAJORS
                  </div>
                  {majorPairs.map((pair, i) => (
                    <ForexRow key={i} pair={pair} />
                  ))}
                </>
              )}
              {crossPairs.length > 0 && (
                <>
                  <div className="px-3 py-1.5 text-xs text-bbg-muted bg-bbg-panel-alt border-b border-bbg-border">
                    ── CROSSES & EXOTICS
                  </div>
                  {crossPairs.map((pair, i) => (
                    <ForexRow key={i} pair={pair} />
                  ))}
                </>
              )}
            </>
          )}
        </div>

        {/* Footer */}
        <div className="px-3 py-1.5 border-t border-bbg-border text-xs text-bbg-muted flex items-center justify-between flex-shrink-0">
          <span>RATES INDICATIVE — NOT FOR TRADING</span>
          <span className="text-bbg-orange">● LIVE</span>
        </div>
      </div>
    </Panel>
  );
}
