import axios from 'axios';
import type { StockQuote, CompanyProfile, NewsItem, ChartDataPoint } from '../types/market';
import { MOCK_QUOTES, MOCK_PROFILES, MOCK_NEWS, MOCK_CHART_DATA } from './mockData';

const BASE_URL = 'https://finnhub.io/api/v1';
const API_KEY = import.meta.env.VITE_FINNHUB_API_KEY || '';

const cache = new Map<string, { data: unknown; timestamp: number }>();
const CACHE_TTL = 30_000; // 30 seconds for quotes

async function fetchWithCache<T>(url: string, ttl = CACHE_TTL): Promise<T> {
  const cached = cache.get(url);
  if (cached && Date.now() - cached.timestamp < ttl) {
    return cached.data as T;
  }
  const response = await axios.get<T>(url);
  cache.set(url, { data: response.data, timestamp: Date.now() });
  return response.data;
}

export async function getQuote(symbol: string): Promise<StockQuote> {
  if (!API_KEY) {
    const mock = MOCK_QUOTES[symbol.toUpperCase()];
    if (mock) {
      // Add slight variation to simulate live data
      const variation = (Math.random() - 0.5) * 0.002;
      return {
        ...mock,
        price: parseFloat((mock.price * (1 + variation)).toFixed(2)),
        timestamp: Date.now() / 1000,
      };
    }
    // Generate a mock for unknown tickers
    const basePrice = 50 + Math.random() * 200;
    return {
      symbol: symbol.toUpperCase(),
      price: parseFloat(basePrice.toFixed(2)),
      change: parseFloat(((Math.random() - 0.5) * 5).toFixed(2)),
      changePercent: parseFloat(((Math.random() - 0.5) * 3).toFixed(2)),
      open: parseFloat((basePrice * 0.99).toFixed(2)),
      high: parseFloat((basePrice * 1.02).toFixed(2)),
      low: parseFloat((basePrice * 0.98).toFixed(2)),
      prevClose: parseFloat((basePrice * 0.995).toFixed(2)),
      volume: Math.floor(Math.random() * 20_000_000 + 1_000_000),
      timestamp: Date.now() / 1000,
    };
  }

  try {
    const data = await fetchWithCache<{ c: number; d: number; dp: number; h: number; l: number; o: number; pc: number; v: number; t: number }>(
      `${BASE_URL}/quote?symbol=${symbol}&token=${API_KEY}`
    );
    return {
      symbol,
      price: data.c,
      change: data.d,
      changePercent: data.dp,
      open: data.o,
      high: data.h,
      low: data.l,
      prevClose: data.pc,
      volume: data.v,
      timestamp: data.t,
    };
  } catch {
    return MOCK_QUOTES[symbol.toUpperCase()] || MOCK_QUOTES['SPY'];
  }
}

export async function getCompanyProfile(symbol: string): Promise<CompanyProfile> {
  if (!API_KEY) {
    return MOCK_PROFILES[symbol.toUpperCase()] || {
      symbol: symbol.toUpperCase(),
      name: symbol.toUpperCase(),
      exchange: 'N/A',
      currency: 'USD',
      industry: 'Unknown',
      sector: 'Unknown',
      description: 'Company information not available in demo mode. Add a Finnhub API key to enable live data.',
      marketCap: 0,
      peRatio: 0,
      weekHigh52: 0,
      weekLow52: 0,
      logo: '',
      weburl: '#',
      employees: 0,
      country: 'US',
    };
  }

  try {
    const data = await fetchWithCache<{
      name: string; exchange: string; currency: string; finnhubIndustry: string;
      marketCapitalization: number; ticker: string; weburl: string; logo: string;
      employeeTotal: number; country: string;
    }>(`${BASE_URL}/stock/profile2?symbol=${symbol}&token=${API_KEY}`, 300_000);

    return {
      symbol,
      name: data.name || symbol,
      exchange: data.exchange || '',
      currency: data.currency || 'USD',
      industry: data.finnhubIndustry || '',
      sector: '',
      description: '',
      marketCap: (data.marketCapitalization || 0) * 1_000_000,
      peRatio: 0,
      weekHigh52: 0,
      weekLow52: 0,
      logo: data.logo || '',
      weburl: data.weburl || '#',
      employees: parseInt(String(data.employeeTotal)) || 0,
      country: data.country || 'US',
    };
  } catch {
    return MOCK_PROFILES[symbol.toUpperCase()] || MOCK_PROFILES['AAPL'];
  }
}

export async function getMarketNews(category = 'general'): Promise<NewsItem[]> {
  if (!API_KEY) {
    return MOCK_NEWS;
  }

  try {
    const data = await fetchWithCache<Array<{
      id: number; headline: string; summary: string; source: string;
      url: string; datetime: number; category: string; image?: string; related?: string;
    }>>(`${BASE_URL}/news?category=${category}&token=${API_KEY}`, 300_000);

    return data.slice(0, 20).map(item => ({
      id: String(item.id),
      headline: item.headline,
      summary: item.summary,
      source: item.source,
      url: item.url,
      datetime: item.datetime,
      category: item.category,
      image: item.image,
      related: item.related,
    }));
  } catch {
    return MOCK_NEWS;
  }
}

export async function getCompanyNews(symbol: string): Promise<NewsItem[]> {
  if (!API_KEY) {
    return MOCK_NEWS.filter(n => n.related?.includes(symbol)).slice(0, 10);
  }

  try {
    const to = new Date().toISOString().split('T')[0];
    const from = new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString().split('T')[0];
    const data = await fetchWithCache<Array<{
      id: number; headline: string; summary: string; source: string;
      url: string; datetime: number; category: string;
    }>>(`${BASE_URL}/company-news?symbol=${symbol}&from=${from}&to=${to}&token=${API_KEY}`, 300_000);

    return data.slice(0, 15).map(item => ({
      id: String(item.id),
      headline: item.headline,
      summary: item.summary,
      source: item.source,
      url: item.url,
      datetime: item.datetime,
      category: item.category,
    }));
  } catch {
    return MOCK_NEWS.slice(0, 10);
  }
}

export async function getStockCandles(symbol: string, resolution: string, from: number, to: number): Promise<ChartDataPoint[]> {
  if (!API_KEY) {
    const days = Math.floor((to - from) / 86400);
    const allData = MOCK_CHART_DATA[symbol.toUpperCase()] || MOCK_CHART_DATA['SPY'];
    return allData.slice(-Math.min(days, allData.length));
  }

  try {
    const data = await fetchWithCache<{
      c: number[]; h: number[]; l: number[]; o: number[]; v: number[]; t: number[]; s: string;
    }>(`${BASE_URL}/stock/candle?symbol=${symbol}&resolution=${resolution}&from=${from}&to=${to}&token=${API_KEY}`, 300_000);

    if (data.s !== 'ok') return [];

    return data.t.map((timestamp, i) => ({
      date: new Date(timestamp * 1000).toISOString().split('T')[0],
      open: data.o[i],
      high: data.h[i],
      low: data.l[i],
      close: data.c[i],
      volume: data.v[i],
    }));
  } catch {
    const allData = MOCK_CHART_DATA[symbol.toUpperCase()] || MOCK_CHART_DATA['SPY'];
    return allData.slice(-30);
  }
}

export async function getMultipleQuotes(symbols: string[]): Promise<StockQuote[]> {
  return Promise.all(symbols.map(getQuote));
}
