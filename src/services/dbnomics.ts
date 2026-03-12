import axios from 'axios';
import type { DBnomicsSeries } from '../types/market';

// DBnomics API - free with optional API key for higher limits
const BASE_URL = 'https://api.db.nomics.world/v22';
const DBNOMICS_KEY = import.meta.env.VITE_DBNOMICS_KEY || '';

const cache = new Map<string, { data: unknown; timestamp: number }>();
const CACHE_TTL = 10 * 60_000; // 10 minutes

async function cachedGet<T>(url: string): Promise<T> {
  const cached = cache.get(url);
  if (cached && Date.now() - cached.timestamp < CACHE_TTL) {
    return cached.data as T;
  }
  const headers: Record<string, string> = {};
  if (DBNOMICS_KEY) headers['Authorization'] = `Bearer ${DBNOMICS_KEY}`;
  const { data } = await axios.get<T>(url, { headers });
  cache.set(url, { data, timestamp: Date.now() });
  return data;
}

// Key economic series from various providers available on DBnomics
const ECONOMIC_SERIES = [
  { id: 'FRED/GDP/GDP', name: 'US GDP (Billions)', source: 'FRED', frequency: 'Q' },
  { id: 'FRED/CPIAUCSL/CPIAUCSL', name: 'US CPI (Index)', source: 'FRED', frequency: 'M' },
  { id: 'FRED/UNRATE/UNRATE', name: 'US Unemployment Rate (%)', source: 'FRED', frequency: 'M' },
  { id: 'FRED/FEDFUNDS/FEDFUNDS', name: 'Fed Funds Rate (%)', source: 'FRED', frequency: 'M' },
  { id: 'FRED/DGS10/DGS10', name: 'US 10Y Treasury Yield (%)', source: 'FRED', frequency: 'D' },
  { id: 'FRED/DGS2/DGS2', name: 'US 2Y Treasury Yield (%)', source: 'FRED', frequency: 'D' },
  { id: 'FRED/PAYEMS/PAYEMS', name: 'Nonfarm Payrolls (Thousands)', source: 'FRED', frequency: 'M' },
  { id: 'FRED/RSAFS/RSAFS', name: 'US Retail Sales (Millions)', source: 'FRED', frequency: 'M' },
  { id: 'FRED/MANEMP/MANEMP', name: 'Manufacturing Employment', source: 'FRED', frequency: 'M' },
  { id: 'FRED/HOUST/HOUST', name: 'Housing Starts (Thousands)', source: 'FRED', frequency: 'M' },
  { id: 'FRED/DCOILWTICO/DCOILWTICO', name: 'WTI Crude Oil ($/bbl)', source: 'FRED', frequency: 'D' },
  { id: 'FRED/GOLDAMGBD228NLBM/GOLDAMGBD228NLBM', name: 'Gold Price ($/oz)', source: 'FRED', frequency: 'D' },
];

// Global macro series
const GLOBAL_SERIES = [
  { id: 'IMF/WEO:2024-04/USA.NGDP_RPCH.pcent_change', name: 'US GDP Growth (IMF)', source: 'IMF', frequency: 'A' },
  { id: 'IMF/WEO:2024-04/CHN.NGDP_RPCH.pcent_change', name: 'China GDP Growth (IMF)', source: 'IMF', frequency: 'A' },
  { id: 'IMF/WEO:2024-04/DEU.NGDP_RPCH.pcent_change', name: 'Germany GDP Growth (IMF)', source: 'IMF', frequency: 'A' },
  { id: 'IMF/WEO:2024-04/JPN.NGDP_RPCH.pcent_change', name: 'Japan GDP Growth (IMF)', source: 'IMF', frequency: 'A' },
  { id: 'IMF/WEO:2024-04/GBR.NGDP_RPCH.pcent_change', name: 'UK GDP Growth (IMF)', source: 'IMF', frequency: 'A' },
];

interface DBnomicsResponse {
  series: {
    docs: Array<{
      series_code: string;
      series_name: string;
      period: string[];
      value: (number | null)[];
    }>;
  };
}

async function fetchSeries(seriesId: string): Promise<{
  value: number;
  previousValue: number;
  period: string;
} | null> {
  try {
    const url = `${BASE_URL}/series/${seriesId}?observations=1&limit=2&offset=0&format=json`;
    const data = await cachedGet<DBnomicsResponse>(url);

    const doc = data?.series?.docs?.[0];
    if (!doc || !doc.value || doc.value.length === 0) return null;

    // Get last two non-null values
    const values: number[] = [];
    const periods: string[] = [];
    for (let i = doc.value.length - 1; i >= 0 && values.length < 2; i--) {
      if (doc.value[i] !== null) {
        values.unshift(doc.value[i]!);
        periods.unshift(doc.period[i]);
      }
    }

    if (values.length === 0) return null;

    return {
      value: values[values.length - 1],
      previousValue: values.length > 1 ? values[0] : values[0],
      period: periods[periods.length - 1],
    };
  } catch {
    return null;
  }
}

export async function getEconomicIndicators(): Promise<DBnomicsSeries[]> {
  const results = await Promise.allSettled(
    ECONOMIC_SERIES.map(async (series) => {
      const result = await fetchSeries(series.id);
      if (!result) return null;

      const change = result.value - result.previousValue;
      const changeDir = change > 0 ? 'up' : change < 0 ? 'down' : 'flat';

      return {
        id: series.id,
        name: series.name,
        value: result.value,
        previousValue: result.previousValue,
        change,
        changeDir: changeDir as 'up' | 'down' | 'flat',
        period: result.period,
        source: series.source,
        frequency: series.frequency,
      };
    })
  );

  return results
    .filter((r): r is PromiseFulfilledResult<DBnomicsSeries | null> => r.status === 'fulfilled')
    .map(r => r.value)
    .filter((v): v is DBnomicsSeries => v !== null);
}

export async function getGlobalMacro(): Promise<DBnomicsSeries[]> {
  const results = await Promise.allSettled(
    GLOBAL_SERIES.map(async (series) => {
      const result = await fetchSeries(series.id);
      if (!result) return null;

      const change = result.value - result.previousValue;
      const changeDir = change > 0 ? 'up' : change < 0 ? 'down' : 'flat';

      return {
        id: series.id,
        name: series.name,
        value: result.value,
        previousValue: result.previousValue,
        change,
        changeDir: changeDir as 'up' | 'down' | 'flat',
        period: result.period,
        source: series.source,
        frequency: series.frequency,
      };
    })
  );

  return results
    .filter((r): r is PromiseFulfilledResult<DBnomicsSeries | null> => r.status === 'fulfilled')
    .map(r => r.value)
    .filter((v): v is DBnomicsSeries => v !== null);
}
