/**
 * Finnhub API Service
 * Free tier: 60 API calls/minute
 * https://finnhub.io/docs/api
 * 
 * Used for:
 *  - Real-time quotes
 *  - Company news
 *  - Analyst recommendations
 *  - Earnings data
 *  - Price targets
 */

import axios from 'axios';
import { apiKeyManager } from './apiKeyManager';

const BASE_URL = 'https://finnhub.io/api/v1';

async function finnhubGet<T>(path: string, params: Record<string, string | number> = {}): Promise<T> {
  const apiKey = apiKeyManager.getKey('finnhub');
  if (!apiKey) throw new Error('No Finnhub API key');

  const { data } = await axios.get<T>(`${BASE_URL}${path}`, {
    params: { token: apiKey, ...params },
    timeout: 10000,
  });
  return data;
}

export interface FinnhubQuote {
  c: number; // Current price
  h: number; // High
  l: number; // Low
  o: number; // Open
  pc: number; // Previous close
  t: number; // Timestamp
}

export async function getFinnhubQuote(symbol: string): Promise<FinnhubQuote | null> {
  try {
    const data = await finnhubGet<FinnhubQuote>('/quote', { symbol });
    return data;
  } catch {
    return null;
  }
}

export interface FinnhubNews {
  category: string;
  datetime: number;
  headline: string;
  id: number;
  image: string;
  related: string;
  source: string;
  summary: string;
  url: string;
}

export async function getFinnhubNews(symbol: string, from?: string, to?: string): Promise<FinnhubNews[]> {
  try {
    const today = new Date();
    const fromDate = from || new Date(today.getTime() - 7 * 24 * 60 * 60 * 1000).toISOString().split('T')[0];
    const toDate = to || today.toISOString().split('T')[0];

    const data = await finnhubGet<FinnhubNews[]>('/company-news', {
      symbol,
      from: fromDate,
      to: toDate,
    });
    return data;
  } catch {
    return [];
  }
}

export interface FinnhubRecommendation {
  period: string; // YYYY-MM
  strongBuy: number;
  buy: number;
  hold: number;
  sell: number;
  strongSell: number;
}

export async function getFinnhubRecommendations(symbol: string): Promise<FinnhubRecommendation[]> {
  try {
    const data = await finnhubGet<FinnhubRecommendation[]>('/stock/recommendation', { symbol });
    return data;
  } catch {
    return [];
  }
}

export interface FinnhubPriceTarget {
  symbol: string;
  targetHigh: number;
  targetLow: number;
  targetMean: number;
  targetMedian: number;
  lastUpdated: string;
}

export async function getFinnhubPriceTarget(symbol: string): Promise<FinnhubPriceTarget | null> {
  try {
    const data = await finnhubGet<FinnhubPriceTarget>('/stock/price-target', { symbol });
    return data;
  } catch {
    return null;
  }
}

export interface FinnhubEarnings {
  actual: number;
  estimate: number;
  surprise: number;
  surprisePercent: number;
  period: string;
  quarter: number;
  symbol: string;
  year: number;
}

export async function getFinnhubEarnings(symbol: string): Promise<FinnhubEarnings[]> {
  try {
    const data = await finnhubGet<FinnhubEarnings[]>('/stock/earnings', { symbol });
    return data || [];
  } catch {
    return [];
  }
}

export interface FinnhubEarningsCalendar {
  earningsCalendar: Array<{
    symbol: string;
    epsActual?: number;
    epsEstimate: number;
    epsSurprise?: number;
    epsSurprisePercent?: number;
    time: 'Before Market Open' | 'After Market Close' | 'TBA';
    date: string;
    quarter: number;
    year: number;
  }>;
}

export async function getFinnhubEarningsCalendar(from?: string, to?: string): Promise<FinnhubEarningsCalendar['earningsCalendar']> {
  try {
    const today = new Date();
    const fromDate = from || today.toISOString().split('T')[0];
    const toDate = to || new Date(today.getTime() + 30 * 24 * 60 * 60 * 1000).toISOString().split('T')[0];

    const data = await finnhubGet<FinnhubEarningsCalendar>('/calendar/earnings', {
      from: fromDate,
      to: toDate,
    });
    return data.earningsCalendar;
  } catch {
    return [];
  }
}

export interface FinnhubCompanyProfile {
  country: string;
  currency: string;
  exchange: string;
  ipo: string;
  logo: string;
  marketCapitalization: number;
  name: string;
  phone: string;
  shareOutstanding: number;
  ticker: string;
  weburl: string;
  industry: string;
  sector: string;
  description: string;
  ceo: string;
  employees: number;
}

export async function getFinnhubCompanyProfile(symbol: string): Promise<FinnhubCompanyProfile | null> {
  try {
    const data = await finnhubGet<FinnhubCompanyProfile>('/stock/profile2', { symbol });
    return data;
  } catch {
    return null;
  }
}

export interface FinnhubStockSymbols {
  currency: string;
  description: string;
  displaySymbol: string;
  figi: string;
  figiShareClass: string;
  mic: string;
  symbol: string;
  symbol2: string;
  type: string;
}

export async function getFinnhubStockSymbols(exchange?: string): Promise<FinnhubStockSymbols[]> {
  try {
    const data = await finnhubGet<FinnhubStockSymbols[]>('/stock/symbol', {
      exchange: exchange || 'US',
    });
    return data;
  } catch {
    return [];
  }
}
