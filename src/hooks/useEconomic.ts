import { useQuery } from '@tanstack/react-query';
import { getEconomicIndicators, getGlobalMacro } from '../services/dbnomics';
import { getFredIndicators } from '../services/fred';

const HAS_FRED = !!import.meta.env.VITE_FRED_API_KEY;

export function useEconomicIndicators() {
  return useQuery({
    queryKey: ['economic-indicators'],
    queryFn: async () => {
      // FRED API is more comprehensive and uses direct official data
      if (HAS_FRED) {
        const fredData = await getFredIndicators();
        if (fredData.length > 0) return fredData;
      }
      // Fallback: DBnomics (pulls from FRED/IMF/ECB via aggregator)
      return getEconomicIndicators();
    },
    staleTime: 10 * 60_000,
    refetchInterval: 15 * 60_000,
  });
}

export function useGlobalMacro() {
  return useQuery({
    queryKey: ['global-macro'],
    queryFn: getGlobalMacro,
    staleTime: 30 * 60_000,
    refetchInterval: 30 * 60_000,
  });
}
