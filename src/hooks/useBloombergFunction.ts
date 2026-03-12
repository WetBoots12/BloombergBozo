/**
 * useBloombergFunction Hook
 * Central hook for executing Bloomberg Terminal functions
 * Fetches and returns data for various Bloomberg functions
 */

import { useQuery } from '@tanstack/react-query';
import { getYahooQuote, getYahooProfile, getYahooChart, yahooRangeParams } from '../services/yahooFinance';
import { getFinnhubNews, getFinnhubRecommendations, getFinnhubPriceTarget, getFinnhubEarnings, getFinnhubCompanyProfile } from '../services/finnhubEnhanced';
import { getBalanceSheet, getCashFlowStatement, getInstitutionalOwnership } from '../services/fmpEnhanced';
import { getCompanyFilings, getInsiderTrades } from '../services/secEdgar';
import { apiKeyManager } from '../services/apiKeyManager';
import type { BloombergFunction } from '../types/bloomberg';
import type { StockQuote, CompanyProfile, ChartDataPoint, NewsItem } from '../types/market';
import { getIncomeStatements } from '../services/fmp';

export interface BloombergFunctionResult {
  loading: boolean;
  error: string | null;
  data: unknown;
  refetch: () => void;
}

// Quote data combining multiple sources
export interface QuoteData {
  quote: StockQuote | null;
  profile: CompanyProfile | null;
  chart: ChartDataPoint[];
}

// Analyst data
export interface AnalystData {
  recommendations: Array<{ period: string; strongBuy: number; buy: number; hold: number; sell: number; strongSell: number }>;
  priceTarget: { targetHigh: number; targetLow: number; targetMean: number; targetMedian: number } | null;
  consensus: 'Strong Buy' | 'Buy' | 'Hold' | 'Sell' | 'Strong Sell';
}

// Earnings data
export interface EarningsData {
  earnings: Array<{ period: string; actual: number; estimate: number; surprise: number; surprisePercent: number }>;
  upcoming: Array<{ date: string; time: string; epsEstimate: number }>;
}

// Financial statements
export interface FinancialData {
  income: Array<{ date: string; revenue: number; grossProfit: number; operatingIncome: number; netIncome: number; eps: number }>;
  balance: Array<{ date: string; totalAssets: number; totalLiabilities: number; totalEquity: number; totalDebt: number; cash: number }>;
  cashFlow: Array<{ date: string; operatingCashFlow: number; freeCashFlow: number; capitalExpenditure: number }>;
}

// Ownership data
export interface OwnershipData {
  institutional: Array<{ holder: string; shares: number; percentHeld: number; value: number; change: number }>;
  insider: Array<{ name: string; title: string; transactionType: string; shares: number; value: number; date: string }>;
  filings: Array<{ form: string; date: string; url: string; description: string }>;
}

export function useBloombergFunction(func: BloombergFunction, ticker?: string, params?: Record<string, string>): BloombergFunctionResult {
  switch (func) {
    case 'GO':
    case 'GP':
      return useQuoteFunction(ticker || 'AAPL', params?.range || '1M');
    case 'DES':
      return useDescriptionFunction(ticker || 'AAPL');
    case 'FA':
      return useFinancialsFunction(ticker || 'AAPL');
    case 'ANR':
      return useAnalystFunction(ticker || 'AAPL');
    case 'E':
      return useEarningsFunction(ticker || 'AAPL');
    case 'CN':
      return useCompanyNewsFunction(ticker || 'AAPL');
    case 'OWN':
      return useOwnershipFunction(ticker || 'AAPL');
    case 'FILINGS':
      return useFilingsFunction(ticker || 'AAPL');
    case 'NEWS':
      return useTopNewsFunction();
    case 'MARKET':
      return useMarketOverviewFunction();
    default:
      return { loading: false, error: `Function ${func} not implemented`, data: null, refetch: () => {} };
  }
}

function useQuoteFunction(ticker: string, range: string): BloombergFunctionResult {
  const { data, isLoading, error, refetch } = useQuery({
    queryKey: ['quote', ticker, range],
    queryFn: async () => {
      const [quote, profile, chartParams] = await Promise.all([
        getYahooQuote(ticker),
        getYahooProfile(ticker),
        Promise.resolve(yahooRangeParams(range)),
      ]);
      
      const chart = await getYahooChart(ticker, chartParams.range, chartParams.interval);
      
      return { quote, profile, chart };
    },
    enabled: !!ticker,
    refetchInterval: 60000, // Refresh every minute
  });

  return {
    loading: isLoading,
    error: error ? (error as Error).message : null,
    data: data || null,
    refetch,
  };
}

function useDescriptionFunction(ticker: string): BloombergFunctionResult {
  const { data, isLoading, error, refetch } = useQuery({
    queryKey: ['description', ticker],
    queryFn: async () => {
      const [yahooProfile, finnhubProfile] = await Promise.all([
        getYahooProfile(ticker),
        apiKeyManager.hasKey('finnhub') ? getFinnhubCompanyProfile(ticker) : Promise.resolve(null),
      ]);

      // Merge profiles, preferring Finnhub if available
      return finnhubProfile || yahooProfile;
    },
    enabled: !!ticker,
  });

  return {
    loading: isLoading,
    error: error ? (error as Error).message : null,
    data: data || null,
    refetch,
  };
}

function useFinancialsFunction(ticker: string): BloombergFunctionResult {
  const hasFmp = apiKeyManager.hasKey('fmp');
  
  const { data, isLoading, error, refetch } = useQuery({
    queryKey: ['financials', ticker],
    queryFn: async () => {
      const [income, balance, cashFlow] = await Promise.all([
        hasFmp ? getIncomeStatements(ticker, 8) : Promise.resolve([]),
        hasFmp ? getBalanceSheet(ticker, 8) : Promise.resolve([]),
        hasFmp ? getCashFlowStatement(ticker, 8) : Promise.resolve([]),
      ]);

      return { income, balance, cashFlow };
    },
    enabled: !!ticker,
  });

  return {
    loading: isLoading,
    error: error ? (error as Error).message : null,
    data: data || null,
    refetch,
  };
}

function useAnalystFunction(ticker: string): BloombergFunctionResult {
  const hasFinnhub = apiKeyManager.hasKey('finnhub');
  
  const { data, isLoading, error, refetch } = useQuery({
    queryKey: ['analyst', ticker],
    queryFn: async () => {
      const [recommendations, priceTarget] = await Promise.all([
        hasFinnhub ? getFinnhubRecommendations(ticker) : Promise.resolve([]),
        hasFinnhub ? getFinnhubPriceTarget(ticker) : Promise.resolve(null),
      ]);

      // Calculate consensus
      let consensus: AnalystData['consensus'] = 'Hold';
      if (recommendations.length > 0) {
        const latest = recommendations[0];
        const total = latest.strongBuy + latest.buy + latest.hold + latest.sell + latest.strongSell;
        const score = (latest.strongBuy * 5 + latest.buy * 4 + latest.hold * 3 + latest.sell * 2 + latest.strongSell) / total;
        
        if (score >= 4.5) consensus = 'Strong Buy';
        else if (score >= 3.5) consensus = 'Buy';
        else if (score >= 2.5) consensus = 'Hold';
        else if (score >= 1.5) consensus = 'Sell';
        else consensus = 'Strong Sell';
      }

      return { recommendations, priceTarget, consensus };
    },
    enabled: !!ticker,
  });

  return {
    loading: isLoading,
    error: error ? (error as Error).message : null,
    data: data || null,
    refetch,
  };
}

function useEarningsFunction(ticker: string): BloombergFunctionResult {
  const hasFinnhub = apiKeyManager.hasKey('finnhub');

  const { data, isLoading, error, refetch } = useQuery({
    queryKey: ['earnings', ticker],
    queryFn: async () => {
      const earnings = hasFinnhub ? await getFinnhubEarnings(ticker) : [];

      return {
        earnings: earnings.map((e: { year: number; quarter: number; actual: number; estimate: number; surprise: number; surprisePercent: number }) => ({
          period: `${e.year} Q${e.quarter}`,
          actual: e.actual,
          estimate: e.estimate,
          surprise: e.surprise,
          surprisePercent: e.surprisePercent,
        })),
        upcoming: [],
      };
    },
    enabled: !!ticker,
  });

  return {
    loading: isLoading,
    error: error ? (error as Error).message : null,
    data: data || null,
    refetch,
  };
}

function useCompanyNewsFunction(ticker: string): BloombergFunctionResult {
  const hasFinnhub = apiKeyManager.hasKey('finnhub');

  const { data, isLoading, error, refetch } = useQuery({
    queryKey: ['companyNews', ticker],
    queryFn: async () => {
      const finnhubNews = hasFinnhub ? await getFinnhubNews(ticker) : [];

      return finnhubNews.map((n: {
        id: number; headline: string; summary: string; source: string;
        url: string; datetime: number; category: string; image: string; related: string;
      }) => ({
        id: String(n.id),
        headline: n.headline,
        summary: n.summary,
        source: n.source,
        url: n.url,
        datetime: n.datetime * 1000,
        category: n.category,
        image: n.image,
        related: n.related,
      } as NewsItem));
    },
    enabled: !!ticker,
  });

  return {
    loading: isLoading,
    error: error ? (error as Error).message : null,
    data: data || null,
    refetch,
  };
}

function useOwnershipFunction(ticker: string): BloombergFunctionResult {
  const hasFmp = apiKeyManager.hasKey('fmp');

  const { data, isLoading, error, refetch } = useQuery({
    queryKey: ['ownership', ticker],
    queryFn: async () => {
      const [ownership, insider, filings] = await Promise.all([
        hasFmp ? getInstitutionalOwnership(ticker) : Promise.resolve(null),
        getInsiderTrades(ticker),
        getCompanyFilings(ticker),
      ]);

      return {
        institutional: ownership?.institutionalHolders || [],
        insider: insider.slice(0, 20),
        filings: filings.slice(0, 20),
      };
    },
    enabled: !!ticker,
  });

  return {
    loading: isLoading,
    error: error ? (error as Error).message : null,
    data: data || null,
    refetch,
  };
}

function useFilingsFunction(ticker: string): BloombergFunctionResult {
  const { data, isLoading, error, refetch } = useQuery({
    queryKey: ['filings', ticker],
    queryFn: () => getCompanyFilings(ticker),
    enabled: !!ticker,
  });

  return {
    loading: isLoading,
    error: error ? (error as Error).message : null,
    data: data || null,
    refetch,
  };
}

function useTopNewsFunction(): BloombergFunctionResult {
  const { data, isLoading, error, refetch } = useQuery({
    queryKey: ['topNews'],
    queryFn: async () => {
      // Return general market news - could be enhanced with NewsAPI
      return [];
    },
  });

  return {
    loading: isLoading,
    error: error ? (error as Error).message : null,
    data: data || null,
    refetch,
  };
}

function useMarketOverviewFunction(): BloombergFunctionResult {
  const { data, isLoading, error, refetch } = useQuery({
    queryKey: ['marketOverview'],
    queryFn: async () => {
      const indices = ['SPY', 'QQQ', 'DIA', 'IWM'];
      const quotes = await Promise.all(indices.map(idx => getYahooQuote(idx)));
      return { indices: quotes };
    },
  });

  return {
    loading: isLoading,
    error: error ? (error as Error).message : null,
    data: data || null,
    refetch,
  };
}
