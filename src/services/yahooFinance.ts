/**
 * Yahoo Finance Browser Scraper
 * Uses Yahoo Finance's public JSON endpoints via CORS proxy.
 * No API key required. Acts as a Finnhub replacement for real-time quotes.
 *
 * Endpoints used:
 *   /v8/finance/chart/{symbol}       — OHLCV + metadata
 *   /v10/finance/quoteSummary/{symbol} — fundamentals
 */

import type { StockQuote, CompanyProfile, ChartDataPoint } from '../types/market';
import { MOCK_QUOTES, MOCK_PROFILES, MOCK_CHART_DATA } from './mockData';

const CORS_PROXIES = [
  'https://corsproxy.io/?url=',
  'https://api.allorigins.win/raw?url=',
];

const cache = new Map<string, { data: unknown; timestamp: number }>();
const CACHE_TTL = 30_000;

async function yfFetch<T>(path: string, ttl = CACHE_TTL): Promise<T> {
  const key = path;
  const hit = cache.get(key);
  if (hit && Date.now() - hit.timestamp < ttl) return hit.data as T;

  const yUrl = `https://query1.finance.yahoo.com${path}`;

  for (const proxy of CORS_PROXIES) {
    try {
      const res = await fetch(proxy + encodeURIComponent(yUrl), {
        signal: AbortSignal.timeout(8000),
        headers: { 'Accept': 'application/json' },
      });
      if (!res.ok) continue;
      const data = await res.json() as T;
      cache.set(key, { data, timestamp: Date.now() });
      return data;
    } catch {
      continue;
    }
  }
  throw new Error(`Yahoo Finance fetch failed for ${path}`);
}

export async function getYahooQuote(symbol: string): Promise<StockQuote> {
  try {
    const data = await yfFetch<{
      chart: {
        result: Array<{
          meta: {
            regularMarketPrice: number;
            regularMarketOpen: number;
            regularMarketDayHigh: number;
            regularMarketDayLow: number;
            regularMarketPreviousClose: number;
            regularMarketVolume: number;
            regularMarketChange: number;
            regularMarketChangePercent: number;
            currentTradingPeriod: { regular: { start: number; end: number } };
          };
        }>;
      };
    }>(`/v8/finance/chart/${symbol}?interval=1d&range=1d`);

    const meta = data.chart.result?.[0]?.meta;
    if (!meta) throw new Error('No data');

    return {
      symbol,
      price: meta.regularMarketPrice,
      change: meta.regularMarketChange,
      changePercent: meta.regularMarketChangePercent,
      open: meta.regularMarketOpen,
      high: meta.regularMarketDayHigh,
      low: meta.regularMarketDayLow,
      prevClose: meta.regularMarketPreviousClose,
      volume: meta.regularMarketVolume,
      timestamp: Date.now() / 1000,
    };
  } catch {
    const mock = MOCK_QUOTES[symbol.toUpperCase()];
    if (mock) {
      const v = (Math.random() - 0.5) * 0.002;
      return { ...mock, price: parseFloat((mock.price * (1 + v)).toFixed(2)), timestamp: Date.now() / 1000 };
    }
    const base = 50 + Math.random() * 200;
    return {
      symbol, price: base, change: (Math.random() - 0.5) * 5,
      changePercent: (Math.random() - 0.5) * 3,
      open: base * 0.99, high: base * 1.02, low: base * 0.98,
      prevClose: base * 0.995, volume: Math.floor(Math.random() * 20_000_000), timestamp: Date.now() / 1000,
    };
  }
}

export async function getYahooProfile(symbol: string): Promise<CompanyProfile> {
  try {
    const data = await yfFetch<{
      quoteSummary: {
        result: Array<{
          assetProfile?: {
            longBusinessSummary: string;
            sector: string;
            industry: string;
            fullTimeEmployees: number;
            country: string;
            website: string;
          };
          summaryDetail?: {
            marketCap: { raw: number };
            trailingPE: { raw: number };
            fiftyTwoWeekHigh: { raw: number };
            fiftyTwoWeekLow: { raw: number };
          };
          price?: {
            shortName: string;
            longName: string;
            exchangeName: string;
            currency: string;
          };
        }>;
      };
    }>(`/v10/finance/quoteSummary/${symbol}?modules=assetProfile,summaryDetail,price`, 600_000);

    const result = data.quoteSummary.result?.[0];
    if (!result) throw new Error('No profile');

    const profile = result.assetProfile;
    const detail = result.summaryDetail;
    const price = result.price;

    return {
      symbol,
      name: price?.longName || price?.shortName || symbol,
      exchange: price?.exchangeName || '',
      currency: price?.currency || 'USD',
      industry: profile?.industry || '',
      sector: profile?.sector || '',
      description: profile?.longBusinessSummary || '',
      marketCap: detail?.marketCap?.raw || 0,
      peRatio: detail?.trailingPE?.raw || 0,
      weekHigh52: detail?.fiftyTwoWeekHigh?.raw || 0,
      weekLow52: detail?.fiftyTwoWeekLow?.raw || 0,
      logo: `https://logo.clearbit.com/${(profile?.website || '').replace(/https?:\/\//, '')}`,
      weburl: profile?.website || '#',
      employees: profile?.fullTimeEmployees || 0,
      country: profile?.country || 'US',
    };
  } catch {
    return MOCK_PROFILES[symbol.toUpperCase()] || {
      symbol, name: symbol, exchange: '', currency: 'USD',
      industry: '', sector: '', description: 'Profile unavailable.',
      marketCap: 0, peRatio: 0, weekHigh52: 0, weekLow52: 0,
      logo: '', weburl: '#', employees: 0, country: 'US',
    };
  }
}

export async function getYahooChart(
  symbol: string,
  range: string,
  interval: string
): Promise<ChartDataPoint[]> {
  try {
    const data = await yfFetch<{
      chart: {
        result: Array<{
          timestamp: number[];
          indicators: {
            quote: Array<{
              open: (number | null)[];
              high: (number | null)[];
              low: (number | null)[];
              close: (number | null)[];
              volume: (number | null)[];
            }>;
          };
        }>;
      };
    }>(`/v8/finance/chart/${symbol}?interval=${interval}&range=${range}`, 300_000);

    const result = data.chart.result?.[0];
    if (!result) return [];

    const { timestamp, indicators } = result;
    const quote = indicators.quote[0];

    return timestamp
      .map((ts, i) => ({
        date: new Date(ts * 1000).toISOString().split('T')[0],
        open: quote.open[i] ?? 0,
        high: quote.high[i] ?? 0,
        low: quote.low[i] ?? 0,
        close: quote.close[i] ?? 0,
        volume: quote.volume[i] ?? 0,
      }))
      .filter(d => d.close > 0);
  } catch {
    return MOCK_CHART_DATA[symbol.toUpperCase()] || MOCK_CHART_DATA['SPY'];
  }
}

// Map TimeRange → Yahoo Finance range/interval params
export function yahooRangeParams(range: string): { range: string; interval: string } {
  switch (range) {
    case '1D': return { range: '1d',  interval: '5m'  };
    case '1W': return { range: '5d',  interval: '30m' };
    case '1M': return { range: '1mo', interval: '1d'  };
    case '3M': return { range: '3mo', interval: '1d'  };
    case '6M': return { range: '6mo', interval: '1d'  };
    case '1Y': return { range: '1y',  interval: '1wk' };
    case '5Y': return { range: '5y',  interval: '1wk' };
    default:   return { range: '1mo', interval: '1d'  };
  }
}
