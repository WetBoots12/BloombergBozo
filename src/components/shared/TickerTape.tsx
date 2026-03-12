import { useMultipleQuotes } from '../../hooks/useStockQuote';
import { formatPrice, formatPercent } from '../../utils/formatters';

const TICKER_SYMBOLS = ['SPY', 'QQQ', 'DIA', 'IWM', 'AAPL', 'MSFT', 'NVDA', 'TSLA', 'GOOGL', 'AMZN', 'META', 'JPM'];

interface TickerItemProps {
  symbol: string;
  price: number;
  change: number;
  changePercent: number;
}

function TickerItem({ symbol, price, change, changePercent }: TickerItemProps) {
  const isPositive = change >= 0;
  const color = isPositive ? 'text-bbg-green' : 'text-bbg-red';
  const arrow = isPositive ? '▲' : '▼';

  return (
    <span className="inline-flex items-center gap-1.5 px-3">
      <span className="text-bbg-amber font-bold">{symbol}</span>
      <span className="text-bbg-text">{formatPrice(price)}</span>
      <span className={`${color} text-xs`}>
        {arrow} {formatPercent(changePercent)}
      </span>
    </span>
  );
}

export function TickerTape() {
  const { data: quotes, isLoading } = useMultipleQuotes(TICKER_SYMBOLS);

  if (isLoading || !quotes) {
    return (
      <div className="h-full flex items-center overflow-hidden">
        <div className="text-bbg-muted text-xs animate-pulse">LOADING MARKET DATA...</div>
      </div>
    );
  }

  // Duplicate items for seamless loop
  const items = [...quotes, ...quotes];

  return (
    <div className="h-full overflow-hidden flex items-center">
      <div className="ticker-tape flex items-center">
        {items.map((q, i) => (
          <TickerItem
            key={`${q.symbol}-${i}`}
            symbol={q.symbol}
            price={q.price}
            change={q.change}
            changePercent={q.changePercent}
          />
        ))}
        <span className="px-2 text-bbg-border">|</span>
      </div>
    </div>
  );
}
