import { useState } from 'react';
import { Panel } from '../layout/Panel';
import { PriceChange } from '../shared/PriceChange';
import { Skeleton } from '../shared/LoadingSkeleton';
import { useMultipleQuotes } from '../../hooks/useStockQuote';
import { useTerminalStore } from '../../store/terminalStore';
import { formatPrice, formatVolume } from '../../utils/formatters';

export function WatchlistPanel() {
  const [input, setInput] = useState('');
  const { watchlist, addToWatchlist, removeFromWatchlist, setActiveTicker } = useTerminalStore();
  const { data: quotes, isLoading } = useMultipleQuotes(watchlist);

  const handleAdd = () => {
    const ticker = input.trim().toUpperCase();
    if (ticker && /^[A-Z.]{1,10}$/.test(ticker)) {
      addToWatchlist(ticker);
      setInput('');
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') handleAdd();
  };

  return (
    <Panel
      title="WATCHLIST"
      subtitle={`${watchlist.length} SECURITIES`}
      color="green"
    >
      <div className="h-full flex flex-col overflow-hidden">
        {/* Add ticker input */}
        <div className="px-3 py-2 border-b border-bbg-border flex gap-2 flex-shrink-0">
          <div className="flex items-center flex-1 bg-bbg-panel-alt border border-bbg-border rounded px-2">
            <span className="text-bbg-orange text-xs mr-1">+</span>
            <input
              type="text"
              value={input}
              onChange={(e) => setInput(e.target.value.toUpperCase())}
              onKeyDown={handleKeyDown}
              placeholder="ADD TICKER..."
              className="flex-1 bg-transparent outline-none text-xs text-bbg-amber placeholder-bbg-muted py-1 font-mono"
              maxLength={10}
            />
          </div>
          <button
            onClick={handleAdd}
            className="px-3 py-1 bg-bbg-green/10 border border-bbg-green/30
              text-bbg-green text-xs font-bold rounded
              hover:bg-bbg-green/20 transition-colors"
          >
            ADD
          </button>
        </div>

        {/* Table Header */}
        <div className="flex items-center gap-2 px-3 py-1.5 border-b border-bbg-border bg-bbg-header-alt flex-shrink-0 text-xs text-bbg-muted">
          <div className="w-16">TICKER</div>
          <div className="flex-1 text-right">PRICE</div>
          <div className="w-28 text-right">CHANGE</div>
          <div className="w-14 text-right hidden sm:block">VOL</div>
          <div className="w-6"></div>
        </div>

        {/* Watchlist items */}
        <div className="flex-1 overflow-y-auto">
          {watchlist.length === 0 ? (
            <div className="flex flex-col items-center justify-center h-32 text-bbg-muted text-xs gap-2">
              <span>NO SECURITIES IN WATCHLIST</span>
              <span>ADD A TICKER ABOVE</span>
            </div>
          ) : isLoading ? (
            <div className="p-3 space-y-2">
              {Array(watchlist.length).fill(0).map((_, i) => (
                <div key={i} className="flex gap-2">
                  <Skeleton width="60px" height="16px" />
                  <Skeleton className="flex-1" height="16px" />
                  <Skeleton width="80px" height="16px" />
                </div>
              ))}
            </div>
          ) : (
            quotes?.map((quote) => {
              return (
                <div
                  key={quote.symbol}
                  className="flex items-center gap-2 px-3 py-2 border-b border-bbg-border/40
                    hover:bg-bbg-panel-alt cursor-pointer transition-colors group"
                  onClick={() => setActiveTicker(quote.symbol)}
                >
                  {/* Symbol */}
                  <div className="w-16 flex-shrink-0">
                    <div className="text-bbg-amber text-xs font-bold group-hover:text-bbg-orange">
                      {quote.symbol}
                    </div>
                  </div>

                  {/* Price */}
                  <div className="flex-1 text-right text-bbg-text text-sm font-bold tabular-nums">
                    ${formatPrice(quote.price)}
                  </div>

                  {/* Change */}
                  <div className="w-28 flex-shrink-0 text-right">
                    <PriceChange
                      change={quote.change}
                      changePercent={quote.changePercent}
                      size="sm"
                      showArrow
                    />
                  </div>

                  {/* Volume */}
                  <div className="w-14 text-right text-bbg-muted text-xs tabular-nums hidden sm:block">
                    {formatVolume(quote.volume)}
                  </div>

                  {/* Remove button */}
                  <button
                    className="w-6 text-bbg-muted hover:text-bbg-red transition-colors text-xs flex-shrink-0 text-center"
                    onClick={(e) => {
                      e.stopPropagation();
                      removeFromWatchlist(quote.symbol);
                    }}
                    title="Remove from watchlist"
                  >
                    ✕
                  </button>
                </div>
              );
            })
          )}
        </div>

        {/* Footer */}
        <div className="px-3 py-1.5 border-t border-bbg-border text-xs text-bbg-muted flex-shrink-0 flex justify-between">
          <span>CLICK ROW TO VIEW CHART</span>
          <span className="text-bbg-muted">{watchlist.length}/50</span>
        </div>
      </div>
    </Panel>
  );
}
