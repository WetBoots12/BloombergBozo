/**
 * FRED API Service (Federal Reserve Economic Data)
 * Free API with key - https://fred.stlouisfed.org/docs/api/fred/
 * 120 req/min, generous limits.
 *
 * Key series IDs used:
 *   GDP         - Real GDP
 *   CPIAUCSL    - CPI All Urban
 *   CPILFESL    - Core CPI (ex food/energy)
 *   UNRATE      - Unemployment Rate
 *   FEDFUNDS    - Fed Funds Rate
 *   DGS10       - 10-Year Treasury Yield
 *   DGS2        - 2-Year Treasury Yield
 *   DGS30       - 30-Year Treasury Yield
 *   PAYEMS      - Nonfarm Payrolls
 *   RSAFS       - Retail Sales
 *   HOUST       - Housing Starts
 *   DCOILWTICO  - WTI Crude Oil
 *   GOLDAMGBD228NLBM - Gold Price
 *   USREC       - Recession indicator
 */

import axios from 'axios';
import type { EconomicIndicator } from '../types/market';

const BASE_URL = 'https://api.stlouisfed.org/fred';
const API_KEY = import.meta.env.VITE_FRED_API_KEY || '';

const cache = new Map<string, { data: unknown; timestamp: number }>();
const CACHE_TTL = 10 * 60_000; // 10 minutes

interface FredObservation {
  date: string;
  value: string;
}

interface FredSeriesResponse {
  observations: FredObservation[];
}

async function fredGet<T>(endpoint: string, params: Record<string, string>): Promise<T> {
  const url = `${BASE_URL}/${endpoint}`;
  const cacheKey = url + JSON.stringify(params);
  const hit = cache.get(cacheKey);
  if (hit && Date.now() - hit.timestamp < CACHE_TTL) return hit.data as T;

  const { data } = await axios.get<T>(url, {
    params: { ...params, api_key: API_KEY, file_type: 'json' },
    timeout: 10000,
  });
  cache.set(cacheKey, { data, timestamp: Date.now() });
  return data;
}

async function getLatestObservations(
  seriesId: string,
  limit = 2
): Promise<FredObservation[]> {
  try {
    const data = await fredGet<FredSeriesResponse>('series/observations', {
      series_id: seriesId,
      sort_order: 'desc',
      limit: String(limit),
      observation_start: '2020-01-01',
    });
    return (data.observations || []).filter(o => o.value !== '.');
  } catch {
    return [];
  }
}

// Directional meaning: higher = good or bad for markets?
const SERIES_CONFIG: Array<{
  id: string;
  name: string;
  unit?: string;
  invertDir?: boolean; // when value goes up, is that 'bad'? (e.g. unemployment)
}> = [
  { id: 'GDP',           name: 'US Real GDP (Bil. USD)',      unit: 'B' },
  { id: 'CPIAUCSL',      name: 'CPI All Urban (Index)',        unit: '' },
  { id: 'CPILFESL',      name: 'Core CPI ex Food/Energy',     unit: '' },
  { id: 'UNRATE',        name: 'Unemployment Rate (%)',        unit: '%', invertDir: true },
  { id: 'FEDFUNDS',      name: 'Fed Funds Rate (%)',           unit: '%' },
  { id: 'DGS10',         name: '10Y Treasury Yield (%)',       unit: '%' },
  { id: 'DGS2',          name: '2Y Treasury Yield (%)',        unit: '%' },
  { id: 'DGS30',         name: '30Y Treasury Yield (%)',       unit: '%' },
  { id: 'T10Y2Y',        name: 'Yield Curve (10Y-2Y)',        unit: '%' },
  { id: 'PAYEMS',        name: 'Nonfarm Payrolls (K)',         unit: 'K' },
  { id: 'RSAFS',         name: 'Retail Sales (Mil. USD)',      unit: 'M' },
  { id: 'HOUST',         name: 'Housing Starts (K units)',     unit: 'K' },
  { id: 'DCOILWTICO',    name: 'WTI Crude Oil ($/bbl)',        unit: '' },
  { id: 'GOLDAMGBD228NLBM', name: 'Gold Price ($/oz)',         unit: '' },
  { id: 'VIXCLS',        name: 'CBOE VIX Index',              unit: '', invertDir: true },
  { id: 'M2SL',          name: 'M2 Money Supply (Bil.)',       unit: 'B' },
  { id: 'MORTGAGE30US',  name: '30Y Mortgage Rate (%)',        unit: '%', invertDir: true },
  { id: 'UMCSENT',       name: 'U. Michigan Sentiment',       unit: '' },
  { id: 'INDPRO',        name: 'Industrial Production Index', unit: '' },
  { id: 'PCE',           name: 'Personal Consumption (Bil.)', unit: 'B' },
];

function formatValue(value: number, unit: string): string {
  if (unit === 'B') return `${(value / 1000).toFixed(1)}T`; // FRED GDP is in billions
  if (unit === 'K') return `${value.toLocaleString()}K`;
  if (unit === 'M') return `$${(value / 1000).toFixed(1)}B`;
  if (unit === '%') return `${value.toFixed(2)}%`;
  if (value >= 10000) return value.toLocaleString('en-US', { maximumFractionDigits: 0 });
  if (value >= 100)   return value.toFixed(1);
  return value.toFixed(2);
}

export async function getFredIndicators(): Promise<EconomicIndicator[]> {
  if (!API_KEY) return [];

  const results = await Promise.allSettled(
    SERIES_CONFIG.map(async (series) => {
      const obs = await getLatestObservations(series.id, 2);
      if (obs.length === 0) return null;

      const latest = parseFloat(obs[0].value);
      const prev   = obs.length > 1 ? parseFloat(obs[1].value) : latest;
      if (isNaN(latest)) return null;

      const diff = latest - prev;
      const rawDir = diff > 0 ? 'up' : diff < 0 ? 'down' : 'flat';
      // For unemployment/VIX etc., "up" is actually bad (but we keep raw direction)
      const changeDir = rawDir as 'up' | 'down' | 'flat';

      const diffStr = diff >= 0 ? `+${formatValue(Math.abs(diff), series.unit || '')}` : `-${formatValue(Math.abs(diff), series.unit || '')}`;

      return {
        name:      series.name,
        value:     formatValue(latest, series.unit || ''),
        change:    obs.length > 1 ? diffStr : '--',
        changeDir,
        period:    obs[0].date,
        source:    'FRED',
      } satisfies EconomicIndicator;
    })
  );

  return results
    .filter((r): r is PromiseFulfilledResult<EconomicIndicator | null> => r.status === 'fulfilled')
    .map(r => r.value)
    .filter((v): v is EconomicIndicator => v !== null);
}
