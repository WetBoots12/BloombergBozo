import { useQuery } from '@tanstack/react-query';
import { getAllForexPairs } from '../services/alphaVantage';

export function useForexPairs() {
  return useQuery({
    queryKey: ['forex', 'pairs'],
    queryFn: getAllForexPairs,
    refetchInterval: 120_000, // 2 minutes
    staleTime: 60_000,
  });
}
