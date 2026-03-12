/**
 * Financial Modeling Prep (FMP) API
 * Free tier: 250 requests/day
 * https://financialmodelingprep.com/developer/docs
 *
 * Used for:
 *  - Company profiles with full fundamentals (PE, EPS, 52W high/low)
 *  - Income statements, balance sheet
 *  - Stock screener results
 */

import axios from 'axios';
import type { CompanyProfile } from '../types/market';
import { MOCK_PROFILES } from './mockData';

const BASE_URL = 'https://financialmodelingprep.com/api/v3';
const API_KEY = import.meta.env.VITE_FMP_API_KEY || '';

const cache = new Map<string, { data: unknown; timestamp: number }>();
const CACHE_TTL = 15 * 60_000; // 15 minutes

async function fmpGet<T>(path: string): Promise<T> {
  if (!API_KEY) throw new Error('No FMP key');
  const cacheKey = path;
  const hit = cache.get(cacheKey);
  if (hit && Date.now() - hit.timestamp < CACHE_TTL) return hit.data as T;

  const { data } = await axios.get<T>(`${BASE_URL}${path}`, {
    params: { apikey: API_KEY },
    timeout: 10000,
  });
  cache.set(cacheKey, { data, timestamp: Date.now() });
  return data;
}

interface FMPProfile {
  symbol: string;
  companyName: string;
  exchangeShortName: string;
  currency: string;
  industry: string;
  sector: string;
  description: string;
  mktCap: number;
  image: string;
  website: string;
  fullTimeEmployees: string;
  country: string;
  // Ratios
  pe?: number;
  eps?: number;
}

interface FMPRatios {
  priceEarningsRatio: number;
  earningsPerShare: number;
  dividendYield: number;
  beta: number;
  returnOnEquity: number;
  returnOnAssets: number;
  currentRatio: number;
  debtToEquity: number;
}

interface FMPPriceTarget {
  lastWeekAvgPriceTarget: number;
  lastMonthAvgPriceTarget: number;
  lastQuarterAvgPriceTarget: number;
  numberOfAnalysts: number;
}

export async function getFMPProfile(symbol: string): Promise<CompanyProfile | null> {
  try {
    const profiles = await fmpGet<FMPProfile[]>(`/profile/${symbol}`);
    const p = profiles?.[0];
    if (!p) return null;

    // Also try to get key ratios for PE etc.
    let peRatio = 0;
    let weekHigh52 = 0;
    let weekLow52 = 0;
    try {
      const ratios = await fmpGet<FMPRatios[]>(`/ratios-ttm/${symbol}`);
      peRatio = ratios?.[0]?.priceEarningsRatio || 0;
    } catch { /* skip */ }

    try {
      const summary = await fmpGet<Array<{ week52High: number; week52Low: number }>>(`/key-metrics/${symbol}`);
      weekHigh52 = summary?.[0]?.week52High || 0;
      weekLow52  = summary?.[0]?.week52Low  || 0;
    } catch { /* skip */ }

    return {
      symbol,
      name:        p.companyName,
      exchange:    p.exchangeShortName,
      currency:    p.currency,
      industry:    p.industry,
      sector:      p.sector,
      description: p.description,
      marketCap:   p.mktCap,
      peRatio,
      weekHigh52,
      weekLow52,
      logo:        p.image,
      weburl:      p.website,
      employees:   parseInt(p.fullTimeEmployees) || 0,
      country:     p.country,
    };
  } catch {
    return MOCK_PROFILES[symbol.toUpperCase()] || null;
  }
}

export interface IncomeStatement {
  date: string;
  revenue: number;
  grossProfit: number;
  operatingIncome: number;
  netIncome: number;
  eps: number;
  ebitda: number;
}

export async function getIncomeStatements(symbol: string, limit = 4): Promise<IncomeStatement[]> {
  try {
    const data = await fmpGet<Array<{
      date: string;
      revenue: number;
      grossProfit: number;
      operatingIncome: number;
      netIncome: number;
      eps: number;
      ebitda: number;
    }>>(`/income-statement/${symbol}?limit=${limit}`);

    return (data || []).map(d => ({
      date:            d.date,
      revenue:         d.revenue,
      grossProfit:     d.grossProfit,
      operatingIncome: d.operatingIncome,
      netIncome:       d.netIncome,
      eps:             d.eps,
      ebitda:          d.ebitda,
    }));
  } catch {
    return [];
  }
}

export async function getAnalystPriceTarget(symbol: string): Promise<FMPPriceTarget | null> {
  try {
    const data = await fmpGet<FMPPriceTarget>(`/price-target-summary/${symbol}`);
    return data || null;
  } catch {
    return null;
  }
}

export async function getEarningsCalendar(from: string, to: string): Promise<Array<{
  symbol: string; date: string; eps: number; epsEstimated: number; revenue: number;
}>> {
  try {
    const data = await fmpGet<Array<{
      symbol: string; date: string; eps: number; epsEstimated: number; revenue: number;
    }>>(`/earning_calendar?from=${from}&to=${to}`);
    return data || [];
  } catch {
    return [];
  }
}
