import { useQuery } from '@tanstack/react-query';
import { getTopCoins, getGlobalData } from '../services/coingecko';

export function useTopCryptos(n = 20) {
  return useQuery({
    queryKey: ['crypto', 'top', n],
    queryFn: () => getTopCoins(n),
    refetchInterval: 60_000, // 1 minute
    staleTime: 30_000,
  });
}

export function useCryptoGlobal() {
  return useQuery({
    queryKey: ['crypto', 'global'],
    queryFn: getGlobalData,
    refetchInterval: 300_000, // 5 minutes
    staleTime: 120_000,
  });
}
