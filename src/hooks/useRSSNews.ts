import { useQuery } from '@tanstack/react-query';
import { fetchRSSNews, fetchTickerRSS } from '../services/rssNews';

export function useRSSNews() {
  return useQuery({
    queryKey: ['rss-news'],
    queryFn: fetchRSSNews,
    staleTime: 3 * 60_000, // 3 minutes
    refetchInterval: 5 * 60_000, // 5 minutes
  });
}

export function useTickerRSS(ticker: string) {
  return useQuery({
    queryKey: ['rss-ticker', ticker],
    queryFn: () => fetchTickerRSS(ticker),
    staleTime: 3 * 60_000,
    refetchInterval: 5 * 60_000,
    enabled: !!ticker,
  });
}
