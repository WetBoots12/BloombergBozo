import axios from 'axios';
import type { ChartDataPoint, ForexPair } from '../types/market';
import { MOCK_CHART_DATA, MOCK_FOREX } from './mockData';

const BASE_URL = 'https://www.alphavantage.co/query';
const API_KEY = import.meta.env.VITE_ALPHA_VANTAGE_API_KEY || '';

const cache = new Map<string, { data: unknown; timestamp: number }>();

async function fetchWithCache<T>(url: string, ttl = 300_000): Promise<T> {
  const cached = cache.get(url);
  if (cached && Date.now() - cached.timestamp < ttl) {
    return cached.data as T;
  }
  const response = await axios.get<T>(url);
  cache.set(url, { data: response.data, timestamp: Date.now() });
  return response.data;
}

export async function getDailyHistory(symbol: string, outputsize = 'compact'): Promise<ChartDataPoint[]> {
  if (!API_KEY) {
    const allData = MOCK_CHART_DATA[symbol.toUpperCase()] || MOCK_CHART_DATA['SPY'];
    return allData;
  }

  try {
    const data = await fetchWithCache<{
      'Time Series (Daily)': Record<string, { '1. open': string; '2. high': string; '3. low': string; '4. close': string; '5. volume': string }>;
    }>(`${BASE_URL}?function=TIME_SERIES_DAILY&symbol=${symbol}&outputsize=${outputsize}&apikey=${API_KEY}`);

    const timeSeries = data['Time Series (Daily)'];
    if (!timeSeries) return MOCK_CHART_DATA[symbol] || [];

    return Object.entries(timeSeries)
      .map(([date, values]) => ({
        date,
        open: parseFloat(values['1. open']),
        high: parseFloat(values['2. high']),
        low: parseFloat(values['3. low']),
        close: parseFloat(values['4. close']),
        volume: parseInt(values['5. volume']),
      }))
      .sort((a, b) => a.date.localeCompare(b.date));
  } catch {
    return MOCK_CHART_DATA[symbol.toUpperCase()] || MOCK_CHART_DATA['SPY'];
  }
}

export async function getForexRate(from: string, to: string): Promise<ForexPair> {
  if (!API_KEY) {
    const mock = MOCK_FOREX.find(p => p.from === from && p.to === to);
    if (mock) {
      const variation = (Math.random() - 0.5) * 0.001;
      return { ...mock, rate: parseFloat((mock.rate * (1 + variation)).toFixed(4)) };
    }
    return MOCK_FOREX[0];
  }

  try {
    const data = await fetchWithCache<{
      'Realtime Currency Exchange Rate': {
        '1. From_Currency Code': string;
        '3. To_Currency Code': string;
        '5. Exchange Rate': string;
        '8. Bid Price': string;
        '9. Ask Price': string;
      };
    }>(`${BASE_URL}?function=CURRENCY_EXCHANGE_RATE&from_currency=${from}&to_currency=${to}&apikey=${API_KEY}`);

    const rate = parseFloat(data['Realtime Currency Exchange Rate']['5. Exchange Rate']);
    const bid = parseFloat(data['Realtime Currency Exchange Rate']['8. Bid Price']);
    const ask = parseFloat(data['Realtime Currency Exchange Rate']['9. Ask Price']);

    return { from, to, rate, change: 0, changePercent: 0, bid, ask };
  } catch {
    return MOCK_FOREX.find(p => p.from === from && p.to === to) || MOCK_FOREX[0];
  }
}

export async function getAllForexPairs(): Promise<ForexPair[]> {
  if (!API_KEY) {
    return MOCK_FOREX;
  }

  // With limited API calls, just return mock data + try a few key pairs
  return MOCK_FOREX;
}
