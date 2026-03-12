import { useQuery } from '@tanstack/react-query';
import { getStockCandles } from '../services/finnhub';
import { getDailyHistory } from '../services/alphaVantage';
import type { TimeRange, ChartDataPoint } from '../types/market';
import { MOCK_CHART_DATA } from '../services/mockData';

function getTimeRangeParams(range: TimeRange): { resolution: string; days: number } {
  switch (range) {
    case '1D': return { resolution: '5', days: 1 };
    case '1W': return { resolution: '30', days: 7 };
    case '1M': return { resolution: 'D', days: 30 };
    case '3M': return { resolution: 'D', days: 90 };
    case '6M': return { resolution: 'D', days: 180 };
    case '1Y': return { resolution: 'D', days: 365 };
    case '5Y': return { resolution: 'W', days: 1825 };
  }
}

export function useStockChart(symbol: string, range: TimeRange) {
  const { resolution, days } = getTimeRangeParams(range);

  return useQuery({
    queryKey: ['chart', symbol, range],
    queryFn: async (): Promise<ChartDataPoint[]> => {
      const to = Math.floor(Date.now() / 1000);
      const from = to - days * 86400;

      try {
        const data = await getStockCandles(symbol, resolution, from, to);
        if (data.length > 0) return data;
        // Fallback to Alpha Vantage for daily data
        const avData = await getDailyHistory(symbol);
        return avData.slice(-days);
      } catch {
        const allData = MOCK_CHART_DATA[symbol.toUpperCase()] || MOCK_CHART_DATA['SPY'];
        return allData.slice(-Math.min(days, allData.length));
      }
    },
    staleTime: 300_000, // 5 minutes
    enabled: !!symbol,
  });
}
