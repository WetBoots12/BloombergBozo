import { useQuery } from '@tanstack/react-query';
import { getQuote, getCompanyProfile } from '../services/finnhub';
import { isMarketOpen } from '../utils/marketHours';

export function useStockQuote(symbol: string) {
  const marketOpen = isMarketOpen();

  return useQuery({
    queryKey: ['quote', symbol],
    queryFn: () => getQuote(symbol),
    refetchInterval: marketOpen ? 30_000 : 300_000, // 30s when open, 5min when closed
    staleTime: marketOpen ? 15_000 : 120_000,
    enabled: !!symbol,
  });
}

export function useCompanyProfile(symbol: string) {
  return useQuery({
    queryKey: ['profile', symbol],
    queryFn: () => getCompanyProfile(symbol),
    staleTime: 600_000, // 10 minutes
    refetchInterval: false,
    enabled: !!symbol,
  });
}

export function useMultipleQuotes(symbols: string[]) {
  return useQuery({
    queryKey: ['quotes', symbols.join(',')],
    queryFn: async () => {
      const quotes = await Promise.all(symbols.map(s => getQuote(s)));
      return quotes;
    },
    refetchInterval: isMarketOpen() ? 30_000 : 300_000,
    staleTime: 15_000,
    enabled: symbols.length > 0,
  });
}
