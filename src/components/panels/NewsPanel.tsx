import { useState } from 'react';
import { Panel } from '../layout/Panel';
import { Skeleton } from '../shared/LoadingSkeleton';
import { useMarketNews } from '../../hooks/useNews';
import { useRSSNews, useTickerRSS } from '../../hooks/useRSSNews';
import { useTerminalStore } from '../../store/terminalStore';
import { formatTimestamp } from '../../utils/formatters';
import type { NewsItem } from '../../types/market';

type NewsSource = 'all' | 'rss' | 'api' | 'ticker';

const SOURCES: { key: NewsSource; label: string }[] = [
  { key: 'all', label: 'ALL' },
  { key: 'rss', label: 'RSS' },
  { key: 'api', label: 'API' },
  { key: 'ticker', label: 'TICKER' },
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
  const [source, setSource] = useState<NewsSource>('all');
  const activeTicker = useTerminalStore(s => s.activeTicker);

  const { data: apiNews, isLoading: apiLoading } = useMarketNews('general');
  const { data: rssNews, isLoading: rssLoading } = useRSSNews();
  const { data: tickerNews, isLoading: tickerLoading } = useTickerRSS(activeTicker);

  const handleNewsClick = (url: string) => {
    if (url && url !== '#') {
      window.open(url, '_blank', 'noopener,noreferrer');
    }
  };

  // Merge and deduplicate news based on selected source
  let displayedNews: NewsItem[] = [];
  let isLoading = false;

  switch (source) {
    case 'rss':
      displayedNews = rssNews || [];
      isLoading = rssLoading;
      break;
    case 'api':
      displayedNews = apiNews || [];
      isLoading = apiLoading;
      break;
    case 'ticker':
      displayedNews = tickerNews || [];
      isLoading = tickerLoading;
      break;
    case 'all':
    default: {
      // Merge RSS + API news, deduplicate by headline similarity
      const all = [...(rssNews || []), ...(apiNews || [])];
      const seen = new Set<string>();
      displayedNews = all.filter(item => {
        // Simple dedup: use first 50 chars of headline
        const key = item.headline.slice(0, 50).toLowerCase();
        if (seen.has(key)) return false;
        seen.add(key);
        return true;
      }).sort((a, b) => b.datetime - a.datetime).slice(0, 30);
      isLoading = apiLoading && rssLoading;
      break;
    }
  }

  return (
    <Panel
      title="NEWS"
      subtitle="MARKET HEADLINES"
      color="blue"
      headerRight={
        <div className="flex items-center gap-1">
          {SOURCES.map(s => (
            <button
              key={s.key}
              onClick={() => setSource(s.key)}
              className={`px-2 py-0.5 text-xs rounded transition-colors ${
                source === s.key
                  ? 'bg-bbg-blue text-bbg-black font-bold'
                  : 'text-bbg-muted hover:text-bbg-blue hover:bg-bbg-blue/10'
              }`}
            >
              {s.key === 'ticker' ? `${activeTicker}` : s.label}
            </button>
          ))}
        </div>
      }
    >
      <div className="h-full overflow-y-auto">
        {/* Source indicator */}
        <div className="px-3 py-1.5 bg-bbg-amber/5 border-b border-bbg-amber/20 text-xs text-bbg-amber flex justify-between">
          <span>
            {source === 'rss' ? '● RSS FEEDS (REUTERS, CNBC, YAHOO, MARKETWATCH)' :
             source === 'ticker' ? `● ${activeTicker} NEWS (YAHOO FINANCE RSS)` :
             source === 'api' ? '● FINNHUB API' :
             '● ALL SOURCES'}
          </span>
          {(rssNews?.length ?? 0) > 0 && source !== 'api' && (
            <span className="text-bbg-green">RSS ACTIVE</span>
          )}
        </div>

        {isLoading ? (
          <div className="p-3 space-y-3">
            {Array(8).fill(0).map((_, i) => (
              <div key={i} className="space-y-1">
                <Skeleton height="14px" />
                <Skeleton height="12px" width="60%" />
              </div>
            ))}
          </div>
        ) : !displayedNews?.length ? (
          <div className="flex items-center justify-center h-32 text-bbg-muted text-xs">
            <div className="text-center">
              <div>NO NEWS AVAILABLE</div>
              {source === 'rss' && (
                <div className="mt-1 text-bbg-amber">RSS feeds may be blocked by CORS. Try ALL source.</div>
              )}
            </div>
          </div>
        ) : (
          displayedNews.map(item => (
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
