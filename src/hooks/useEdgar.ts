import { useQuery } from '@tanstack/react-query';
import { getCompanyDescription, getCompanyFilings, getInsiderTrades } from '../services/secEdgar';

export function useCompanyFilings(ticker: string, formTypes?: string[]) {
  return useQuery({
    queryKey: ['edgar-filings', ticker, formTypes],
    queryFn: () => getCompanyFilings(ticker, formTypes),
    staleTime: 10 * 60_000, // 10 minutes
    enabled: !!ticker,
  });
}

export function useInsiderTrades(ticker: string) {
  return useQuery({
    queryKey: ['edgar-insider', ticker],
    queryFn: () => getInsiderTrades(ticker),
    staleTime: 10 * 60_000,
    enabled: !!ticker,
  });
}

export function useEdgarDescription(ticker: string) {
  return useQuery({
    queryKey: ['edgar-desc', ticker],
    queryFn: () => getCompanyDescription(ticker),
    staleTime: 30 * 60_000, // 30 minutes - rarely changes
    enabled: !!ticker,
  });
}
