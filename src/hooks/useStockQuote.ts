import { useQuery } from '@tanstack/react-query';
import { getQuote, getCompanyProfile as getFinnhubProfile } from '../services/finnhub';
import { getYahooQuote, getYahooProfile } from '../services/yahooFinance';
import { getFMPProfile } from '../services/fmp';
import { isMarketOpen } from '../utils/marketHours';

const HAS_FINNHUB = !!import.meta.env.VITE_FINNHUB_API_KEY;
const HAS_FMP     = !!import.meta.env.VITE_FMP_API_KEY;

export function useStockQuote(symbol: string) {
  const marketOpen = isMarketOpen();

  return useQuery({
    queryKey: ['quote', symbol],
    queryFn: async () => {
      if (HAS_FINNHUB) return getQuote(symbol);
      return getYahooQuote(symbol);
    },
    refetchInterval: marketOpen ? 30_000 : 300_000,
    staleTime: marketOpen ? 15_000 : 120_000,
    enabled: !!symbol,
  });
}

export function useCompanyProfile(symbol: string) {
  return useQuery({
    queryKey: ['profile', symbol],
    queryFn: async () => {
      if (HAS_FMP) {
        const fmpProfile = await getFMPProfile(symbol);
        if (fmpProfile) return fmpProfile;
      }
      const yahooProfile = await getYahooProfile(symbol);
      if (yahooProfile.name !== symbol) return yahooProfile;
      return getFinnhubProfile(symbol);
    },
    staleTime: 600_000,
    refetchInterval: false,
    enabled: !!symbol,
  });
}

export function useMultipleQuotes(symbols: string[]) {
  return useQuery({
    queryKey: ['quotes', symbols.join(',')],
    queryFn: async () => {
      if (HAS_FINNHUB) return Promise.all(symbols.map(s => getQuote(s)));
      return Promise.all(symbols.map(s => getYahooQuote(s)));
    },
    refetchInterval: isMarketOpen() ? 30_000 : 300_000,
    staleTime: 15_000,
    enabled: symbols.length > 0,
  });
}
