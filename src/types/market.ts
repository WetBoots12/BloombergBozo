export interface StockQuote {
  symbol: string;
  price: number;
  change: number;
  changePercent: number;
  open: number;
  high: number;
  low: number;
  prevClose: number;
  volume: number;
  timestamp: number;
}

export interface CompanyProfile {
  symbol: string;
  name: string;
  exchange: string;
  currency: string;
  industry: string;
  sector: string;
  description: string;
  marketCap: number;
  peRatio: number;
  weekHigh52: number;
  weekLow52: number;
  logo: string;
  weburl: string;
  employees: number;
  country: string;
}

export interface ChartDataPoint {
  date: string;
  open: number;
  high: number;
  low: number;
  close: number;
  volume: number;
}

export interface NewsItem {
  id: string;
  headline: string;
  summary: string;
  source: string;
  url: string;
  datetime: number;
  category: string;
  image?: string;
  related?: string;
}

export interface CryptoAsset {
  id: string;
  symbol: string;
  name: string;
  image: string;
  current_price: number;
  market_cap: number;
  market_cap_rank: number;
  price_change_24h: number;
  price_change_percentage_24h: number;
  total_volume: number;
  high_24h: number;
  low_24h: number;
  circulating_supply: number;
  ath: number;
  ath_change_percentage: number;
  sparkline_in_7d?: { price: number[] };
}

export interface CryptoGlobal {
  total_market_cap: { usd: number };
  total_volume: { usd: number };
  market_cap_percentage: { btc: number; eth: number };
  market_cap_change_percentage_24h_usd: number;
}

export interface ForexPair {
  from: string;
  to: string;
  rate: number;
  change: number;
  changePercent: number;
  bid: number;
  ask: number;
}

export interface EconomicIndicator {
  name: string;
  value: string;
  change: string;
  changeDir: 'up' | 'down' | 'flat';
  period: string;
  source: string;
}

export interface WatchlistItem {
  symbol: string;
  addedAt: number;
  notes?: string;
}

export type PanelType =
  | 'market'
  | 'quote'
  | 'news'
  | 'crypto'
  | 'forex'
  | 'watchlist'
  | 'economic';

export type TimeRange = '1D' | '1W' | '1M' | '3M' | '6M' | '1Y' | '5Y';

export type MarketStatus = 'open' | 'closed' | 'pre-market' | 'after-hours';
