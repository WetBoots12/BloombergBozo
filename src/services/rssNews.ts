import type { NewsItem } from '../types/market';

// RSS News Aggregator - completely free, no API keys
// Uses public RSS feeds from major financial news outlets
// Note: RSS feeds require a CORS proxy in the browser

// Public CORS proxies (fallback chain)
const CORS_PROXIES = [
  'https://api.allorigins.win/raw?url=',
  'https://corsproxy.io/?',
];

const RSS_FEEDS = {
  reuters: {
    url: 'https://www.rss.app/feeds/v1.1/tYr3NxIg2a4FU2J1.json',  // Reuters business JSON feed alternative
    source: 'REUTERS',
  },
  cnbc: {
    url: 'https://www.cnbc.com/id/10000664/device/rss/rss.html',
    source: 'CNBC',
  },
  yahoo: {
    url: 'https://finance.yahoo.com/news/rssindex',
    source: 'YAHOO',
  },
  marketwatch: {
    url: 'https://feeds.marketwatch.com/marketwatch/topstories/',
    source: 'MKTWATCH',
  },
};

function parseRSSXml(xmlText: string, source: string): NewsItem[] {
  try {
    const parser = new DOMParser();
    const doc = parser.parseFromString(xmlText, 'text/xml');
    const items = doc.querySelectorAll('item');

    return Array.from(items).slice(0, 15).map((item, idx) => {
      const title = item.querySelector('title')?.textContent || '';
      const description = item.querySelector('description')?.textContent || '';
      const link = item.querySelector('link')?.textContent || '';
      const pubDate = item.querySelector('pubDate')?.textContent || '';
      const category = item.querySelector('category')?.textContent || '';

      // Strip HTML tags from description
      const cleanDesc = description.replace(/<[^>]*>/g, '').trim();

      return {
        id: `rss-${source}-${idx}-${Date.now()}`,
        headline: title,
        summary: cleanDesc.slice(0, 200),
        source,
        url: link,
        datetime: pubDate ? Math.floor(new Date(pubDate).getTime() / 1000) : Math.floor(Date.now() / 1000),
        category: category || 'general',
      };
    });
  } catch {
    return [];
  }
}

async function fetchWithCorsProxy(url: string): Promise<string | null> {
  for (const proxy of CORS_PROXIES) {
    try {
      const response = await fetch(proxy + encodeURIComponent(url), {
        signal: AbortSignal.timeout(8000),
      });
      if (response.ok) {
        return await response.text();
      }
    } catch {
      continue;
    }
  }
  return null;
}

export async function fetchRSSNews(): Promise<NewsItem[]> {
  const feedEntries = Object.values(RSS_FEEDS);
  const results = await Promise.allSettled(
    feedEntries.map(async (feed) => {
      const text = await fetchWithCorsProxy(feed.url);
      if (!text) return [];
      return parseRSSXml(text, feed.source);
    })
  );

  const allNews: NewsItem[] = [];
  for (const result of results) {
    if (result.status === 'fulfilled') {
      allNews.push(...result.value);
    }
  }

  // Sort by datetime descending
  allNews.sort((a, b) => b.datetime - a.datetime);
  return allNews.slice(0, 30);
}

// Fetch ticker-specific news from Yahoo Finance RSS
export async function fetchTickerRSS(ticker: string): Promise<NewsItem[]> {
  const url = `https://feeds.finance.yahoo.com/rss/2.0/headline?s=${ticker}&region=US&lang=en-US`;
  const text = await fetchWithCorsProxy(url);
  if (!text) return [];
  return parseRSSXml(text, 'YAHOO');
}
