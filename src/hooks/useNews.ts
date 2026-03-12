import { useQuery } from '@tanstack/react-query';
import { getMarketNews, getCompanyNews } from '../services/finnhub';

export function useMarketNews(category = 'general') {
  return useQuery({
    queryKey: ['news', 'market', category],
    queryFn: () => getMarketNews(category),
    refetchInterval: 300_000, // 5 minutes
    staleTime: 120_000,
  });
}

export function useCompanyNews(symbol: string) {
  return useQuery({
    queryKey: ['news', 'company', symbol],
    queryFn: () => getCompanyNews(symbol),
    refetchInterval: 300_000,
    staleTime: 120_000,
    enabled: !!symbol,
  });
}
