import { useState } from 'react';
import { Panel } from '../layout/Panel';
import { Skeleton } from '../shared/LoadingSkeleton';
import { useMarketNews } from '../../hooks/useNews';
import { useTerminalStore } from '../../store/terminalStore';
import { formatTimestamp } from '../../utils/formatters';
import type { NewsItem } from '../../types/market';

type NewsCategory = 'general' | 'forex' | 'crypto' | 'merger';
const CATEGORIES: { key: NewsCategory; label: string }[] = [
  { key: 'general', label: 'ALL' },
  { key: 'merger', label: 'M&A' },
  { key: 'forex', label: 'FX' },
  { key: 'crypto', label: 'CRYPTO' },
];

function NewsItemRow({ item, onClick }: { item: NewsItem; onClick: () => void }) {
  return (
    <div
      className="px-3 py-2 border-b border-bbg-border/50 cursor-pointer
        hover:bg-bbg-panel-alt transition-colors group"
      onClick={onClick}
    >
      <div className="flex items-start justify-between gap-2">
        <div className="flex-1 min-w-0">
          <div className="text-bbg-text text-xs leading-snug group-hover:text-bbg-amber transition-colors line-clamp-2">
            {item.headline}
          </div>
          <div className="flex items-center gap-2 mt-1">
            <span className="text-bbg-orange text-xs font-bold uppercase">{item.source}</span>
            <span className="text-bbg-muted text-xs">{formatTimestamp(item.datetime)}</span>
            {item.related && (
              <span className="text-bbg-blue text-xs">{item.related.split(',')[0]}</span>
            )}
          </div>
        </div>
        <span className="text-bbg-muted text-xs flex-shrink-0 mt-0.5">↗</span>
      </div>
    </div>
  );
}

export function NewsPanel() {
  const [category, setCategory] = useState<NewsCategory>('general');
  const activeTicker = useTerminalStore(s => s.activeTicker);
  const { data: news, isLoading } = useMarketNews(category);

  const handleNewsClick = (url: string) => {
    if (url && url !== '#') {
      window.open(url, '_blank', 'noopener,noreferrer');
    }
  };

  return (
    <Panel
      title="NEWS"
      subtitle={`MARKET HEADLINES`}
      color="blue"
      headerRight={
        <div className="flex items-center gap-1">
          {CATEGORIES.map(c => (
            <button
              key={c.key}
              onClick={() => setCategory(c.key)}
              className={`px-2 py-0.5 text-xs rounded transition-colors ${
                category === c.key
                  ? 'bg-bbg-blue text-bbg-black font-bold'
                  : 'text-bbg-muted hover:text-bbg-blue hover:bg-bbg-blue/10'
              }`}
            >
              {c.label}
            </button>
          ))}
        </div>
      }
    >
      <div className="h-full overflow-y-auto">
        {/* Ticker filter note */}
        {activeTicker && (
          <div className="px-3 py-1.5 bg-bbg-amber/5 border-b border-bbg-amber/20 text-xs text-bbg-amber">
            ● RELATED TO: {activeTicker}
          </div>
        )}

        {isLoading ? (
          <div className="p-3 space-y-3">
            {Array(8).fill(0).map((_, i) => (
              <div key={i} className="space-y-1">
                <Skeleton height="14px" />
                <Skeleton height="12px" width="60%" />
              </div>
            ))}
          </div>
        ) : !news?.length ? (
          <div className="flex items-center justify-center h-32 text-bbg-muted text-xs">
            NO NEWS AVAILABLE
          </div>
        ) : (
          news.map(item => (
            <NewsItemRow
              key={item.id}
              item={item}
              onClick={() => handleNewsClick(item.url)}
            />
          ))
        )}
      </div>
    </Panel>
  );
}
