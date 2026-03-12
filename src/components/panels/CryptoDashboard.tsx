import { Panel } from '../layout/Panel';
import { MiniChart } from '../shared/MiniChart';
import { Skeleton, TableSkeleton } from '../shared/LoadingSkeleton';
import { useTopCryptos, useCryptoGlobal } from '../../hooks/useCrypto';
import { formatPrice, formatVolume, formatMarketCap } from '../../utils/formatters';
import type { CryptoAsset } from '../../types/market';

function CryptoRow({ coin, rank }: { coin: CryptoAsset; rank: number }) {
  const isPositive = coin.price_change_percentage_24h >= 0;
  const color = isPositive ? '#00FF41' : '#FF3131';
  const sparkline = coin.sparkline_in_7d?.price || [];

  return (
    <div className="flex items-center gap-2 px-3 py-1.5 border-b border-bbg-border/40 hover:bg-bbg-panel-alt transition-colors group text-xs">
      {/* Rank */}
      <div className="w-5 text-bbg-muted text-center flex-shrink-0">{rank}</div>

      {/* Name/Symbol */}
      <div className="w-24 flex-shrink-0">
        <div className="text-bbg-amber font-bold group-hover:text-bbg-orange uppercase">{coin.symbol}</div>
        <div className="text-bbg-muted text-xs truncate">{coin.name}</div>
      </div>

      {/* Sparkline */}
      <div className="w-16 flex-shrink-0">
        {sparkline.length > 1 ? (
          <MiniChart data={sparkline.slice(-24)} color={color} height={24} />
        ) : (
          <div className="h-6 bg-bbg-border/20 rounded" />
        )}
      </div>

      {/* Price */}
      <div className="w-20 text-right flex-shrink-0 text-bbg-text tabular-nums font-bold">
        {coin.current_price > 1000
          ? `$${formatPrice(coin.current_price, 0)}`
          : coin.current_price > 1
          ? `$${formatPrice(coin.current_price)}`
          : `$${coin.current_price.toFixed(4)}`}
      </div>

      {/* 24h Change */}
      <div className="w-16 text-right flex-shrink-0 tabular-nums" style={{ color }}>
        {isPositive ? '▲' : '▼'} {Math.abs(coin.price_change_percentage_24h).toFixed(2)}%
      </div>

      {/* Market Cap */}
      <div className="flex-1 text-right text-bbg-muted tabular-nums hidden lg:block">
        {formatMarketCap(coin.market_cap)}
      </div>

      {/* Volume */}
      <div className="w-20 text-right text-bbg-muted tabular-nums hidden xl:block">
        {formatVolume(coin.total_volume)}
      </div>
    </div>
  );
}

export function CryptoDashboard() {
  const { data: coins, isLoading: coinsLoading } = useTopCryptos(20);
  const { data: global, isLoading: globalLoading } = useCryptoGlobal();

  const globalChangePos = (global?.market_cap_change_percentage_24h_usd ?? 0) >= 0;

  return (
    <Panel
      title="CRYPTO"
      subtitle="DIGITAL ASSETS"
      color="amber"
    >
      <div className="h-full flex flex-col overflow-hidden">
        {/* Global Stats Bar */}
        <div className="px-3 py-2 border-b border-bbg-border bg-bbg-panel-alt flex-shrink-0">
          {globalLoading ? (
            <div className="flex gap-4">
              {Array(4).fill(0).map((_, i) => <Skeleton key={i} width="120px" height="14px" />)}
            </div>
          ) : global ? (
            <div className="flex items-center gap-4 text-xs overflow-x-auto">
              <div>
                <span className="text-bbg-muted">GLOBAL MKT CAP </span>
                <span className="text-bbg-text font-bold">{formatMarketCap(global.total_market_cap.usd)}</span>
                <span className={`ml-1 ${globalChangePos ? 'text-bbg-green' : 'text-bbg-red'}`}>
                  {globalChangePos ? '▲' : '▼'} {Math.abs(global.market_cap_change_percentage_24h_usd).toFixed(2)}%
                </span>
              </div>
              <div className="border-l border-bbg-border pl-4">
                <span className="text-bbg-muted">BTC DOM </span>
                <span className="text-bbg-amber font-bold">{global.market_cap_percentage.btc.toFixed(1)}%</span>
              </div>
              <div className="border-l border-bbg-border pl-4">
                <span className="text-bbg-muted">ETH DOM </span>
                <span className="text-bbg-blue font-bold">{global.market_cap_percentage.eth.toFixed(1)}%</span>
              </div>
              <div className="border-l border-bbg-border pl-4">
                <span className="text-bbg-muted">24H VOL </span>
                <span className="text-bbg-text font-bold">{formatMarketCap(global.total_volume.usd)}</span>
              </div>
            </div>
          ) : null}
        </div>

        {/* Table Header */}
        <div className="flex items-center gap-2 px-3 py-1 border-b border-bbg-border bg-bbg-header-alt flex-shrink-0 text-xs text-bbg-muted">
          <div className="w-5">#</div>
          <div className="w-24">ASSET</div>
          <div className="w-16">7D CHART</div>
          <div className="w-20 text-right">PRICE</div>
          <div className="w-16 text-right">24H CHG</div>
          <div className="flex-1 text-right hidden lg:block">MKT CAP</div>
          <div className="w-20 text-right hidden xl:block">VOLUME</div>
        </div>

        {/* Coin List */}
        <div className="flex-1 overflow-y-auto">
          {coinsLoading ? (
            <div className="p-3">
              <TableSkeleton rows={10} cols={5} />
            </div>
          ) : !coins?.length ? (
            <div className="flex items-center justify-center h-32 text-bbg-muted text-xs">
              NO CRYPTO DATA AVAILABLE
            </div>
          ) : (
            coins.map((coin, i) => (
              <CryptoRow key={coin.id} coin={coin} rank={i + 1} />
            ))
          )}
        </div>
      </div>
    </Panel>
  );
}
