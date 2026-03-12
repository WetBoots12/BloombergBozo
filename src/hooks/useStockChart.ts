import { useQuery } from '@tanstack/react-query';
import { getStockCandles } from '../services/finnhub';
import { getDailyHistory } from '../services/alphaVantage';
import { getYahooChart, yahooRangeParams } from '../services/yahooFinance';
import type { TimeRange, ChartDataPoint } from '../types/market';
import { MOCK_CHART_DATA } from '../services/mockData';

const HAS_FINNHUB     = !!import.meta.env.VITE_FINNHUB_API_KEY;
const HAS_ALPHA_VANTAGE = !!import.meta.env.VITE_ALPHA_VANTAGE_API_KEY;

function getTimeRangeParams(range: TimeRange): { resolution: string; days: number } {
  switch (range) {
    case '1D': return { resolution: '5',  days: 1    };
    case '1W': return { resolution: '30', days: 7    };
    case '1M': return { resolution: 'D',  days: 30   };
    case '3M': return { resolution: 'D',  days: 90   };
    case '6M': return { resolution: 'D',  days: 180  };
    case '1Y': return { resolution: 'D',  days: 365  };
    case '5Y': return { resolution: 'W',  days: 1825 };
  }
}

export function useStockChart(symbol: string, range: TimeRange) {
  return useQuery({
    queryKey: ['chart', symbol, range],
    queryFn: async (): Promise<ChartDataPoint[]> => {
      // 1. Try Yahoo Finance (always available, no key)
      try {
        const { range: yRange, interval } = yahooRangeParams(range);
        const data = await getYahooChart(symbol, yRange, interval);
        if (data.length > 0) return data;
      } catch { /* fall through */ }

      // 2. Try Finnhub candles (if key)
      if (HAS_FINNHUB) {
        try {
          const { resolution, days } = getTimeRangeParams(range);
          const to   = Math.floor(Date.now() / 1000);
          const from = to - days * 86400;
          const data = await getStockCandles(symbol, resolution, from, to);
          if (data.length > 0) return data;
        } catch { /* fall through */ }
      }

      // 3. Try Alpha Vantage daily (if key)
      if (HAS_ALPHA_VANTAGE) {
        try {
          const { days } = getTimeRangeParams(range);
          const avData = await getDailyHistory(symbol);
          return avData.slice(-days);
        } catch { /* fall through */ }
      }

      // 4. Fall back to mock data
      const allData = MOCK_CHART_DATA[symbol.toUpperCase()] || MOCK_CHART_DATA['SPY'];
      const { days } = getTimeRangeParams(range);
      return allData.slice(-Math.min(days, allData.length));
    },
    staleTime: 300_000,
    enabled: !!symbol,
  });
}
