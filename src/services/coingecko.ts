import axios from 'axios';
import type { CryptoAsset, CryptoGlobal } from '../types/market';
import { MOCK_CRYPTO, MOCK_CRYPTO_GLOBAL } from './mockData';

const BASE_URL = 'https://api.coingecko.com/api/v3';

const cache = new Map<string, { data: unknown; timestamp: number }>();

async function fetchWithCache<T>(url: string, ttl = 60_000): Promise<T> {
  const cached = cache.get(url);
  if (cached && Date.now() - cached.timestamp < ttl) {
    return cached.data as T;
  }
  try {
    const response = await axios.get<T>(url, {
      headers: { 'Accept': 'application/json' },
      timeout: 10000,
    });
    cache.set(url, { data: response.data, timestamp: Date.now() });
    return response.data;
  } catch (err) {
    if (cached) return cached.data as T; // Return stale cache on error
    throw err;
  }
}

export async function getTopCoins(n = 20): Promise<CryptoAsset[]> {
  try {
    const data = await fetchWithCache<CryptoAsset[]>(
      `${BASE_URL}/coins/markets?vs_currency=usd&order=market_cap_desc&per_page=${n}&page=1&sparkline=true&price_change_percentage=24h`,
      120_000 // 2 minute cache
    );
    return data;
  } catch {
    return MOCK_CRYPTO.slice(0, n);
  }
}

export async function getGlobalData(): Promise<CryptoGlobal> {
  try {
    const data = await fetchWithCache<{ data: CryptoGlobal }>(
      `${BASE_URL}/global`,
      300_000 // 5 minute cache
    );
    return data.data;
  } catch {
    return MOCK_CRYPTO_GLOBAL;
  }
}

export async function getCoinHistory(id: string, days: number): Promise<{ prices: [number, number][] }> {
  try {
    const data = await fetchWithCache<{ prices: [number, number][] }>(
      `${BASE_URL}/coins/${id}/market_chart?vs_currency=usd&days=${days}`,
      300_000
    );
    return data;
  } catch {
    const now = Date.now();
    const mockPrices: [number, number][] = [];
    let price = id === 'bitcoin' ? 67423 : id === 'ethereum' ? 3521 : 100;
    for (let i = days; i >= 0; i--) {
      const ts = now - i * 24 * 60 * 60 * 1000;
      price *= 1 + (Math.random() - 0.48) * 0.025;
      mockPrices.push([ts, parseFloat(price.toFixed(2))]);
    }
    return { prices: mockPrices };
  }
}
