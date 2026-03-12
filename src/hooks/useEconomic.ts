import { useQuery } from '@tanstack/react-query';
import { getEconomicIndicators, getGlobalMacro } from '../services/dbnomics';

export function useEconomicIndicators() {
  return useQuery({
    queryKey: ['dbnomics-economic'],
    queryFn: getEconomicIndicators,
    staleTime: 10 * 60_000, // 10 minutes
    refetchInterval: 15 * 60_000, // 15 minutes
  });
}

export function useGlobalMacro() {
  return useQuery({
    queryKey: ['dbnomics-global'],
    queryFn: getGlobalMacro,
    staleTime: 30 * 60_000,
    refetchInterval: 30 * 60_000,
  });
}
