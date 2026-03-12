// Bloomberg Terminal Function Types

export type BloombergFunction =
  | 'GO'          // Security quote/chart
  | 'GP'          // Price chart
  | 'DES'         // Company description
  | 'ANR'         // Analyst recommendations
  | 'E'           // Earnings
  | 'CN'          // Company news
  | 'FA'          // Financial statements
  | 'OWN'         // Ownership/Insider
  | 'FILINGS'     // SEC filings
  | 'NEWS'        // Top news
  | 'TOP'         // Most read
  | 'MARKET'      // Market overview
  | 'INDEX'       // Indices
  | 'COMDTY'      // Commodities
  | 'CRYPTO'      // Crypto
  | 'FX'          // Forex
  | 'ECON'        // Economic data
  | 'YIELD'       // Yield curve
  | 'PORT'        // Portfolio
  | 'WLT'         // Watchlist
  | 'SCREEN'      // Stock screener
  | 'CORR'        // Correlation
  | 'BETA'        // Beta analysis
  | 'VOL'         // Volatility
  | 'PEERS'       // Peer comparison
  | 'HELP';       // Help

export interface BloombergCommand {
  ticker?: string;
  func: BloombergFunction;
  raw: string;
}

export interface AnalystRating {
  period: string;
  strongBuy: number;
  buy: number;
  hold: number;
  sell: number;
  strongSell: number;
  consensus: 'Strong Buy' | 'Buy' | 'Hold' | 'Sell' | 'Strong Sell';
  targetPrice: number;
  numberOfAnalysts: number;
}

export interface EarningsData {
  symbol: string;
  reportDate: string;
  fiscalQuarter: string;
  epsActual?: number;
  epsEstimate: number;
  epsSurprise?: number;
  surprisePercent?: number;
  revenueActual?: number;
  revenueEstimate: number;
  time: 'Before Market Open' | 'After Market Close' | 'TBA';
}

export interface FinancialStatement {
  date: string;
  period: 'Q' | 'A'; // Quarterly or Annual
  revenue: number;
  grossProfit: number;
  operatingIncome: number;
  netIncome: number;
  eps: number;
  ebitda: number;
  totalAssets?: number;
  totalLiabilities?: number;
  totalEquity?: number;
  cashAndEquivalents?: number;
  totalDebt?: number;
  freeCashFlow?: number;
}

export interface InsiderTransaction {
  filingDate: string;
  transactionDate: string;
  ownerName: string;
  ownerTitle: string;
  transactionType: 'P' | 'S' | 'A' | 'D' | 'M' | 'G';
  shares: number;
  pricePerShare: number;
  totalValue: number;
  sharesOwned: number;
  transactionCode: string;
}

export interface OwnershipData {
  symbol: string;
  insiderOwnership: number;
  institutionalOwnership: number;
  insiderTransactions: InsiderTransaction[];
  topHolders: { name: string; shares: number; percent: number }[];
}

export interface PeerComparison {
  symbol: string;
  peers: Array<{
    symbol: string;
    name: string;
    marketCap: number;
    peRatio: number;
    pbRatio: number;
    dividendYield: number;
    priceChange1Y: number;
  }>;
}

export interface CommodityPrice {
  name: string;
  symbol: string;
  price: number;
  change: number;
  changePercent: number;
  high52: number;
  low52: number;
  unit: string;
}

export interface IndexData {
  symbol: string;
  name: string;
  price: number;
  change: number;
  changePercent: number;
  high: number;
  low: number;
  open: number;
  prevClose: number;
}

export interface YieldCurveData {
  maturity: string;
  yield: number;
  change: number;
  previousClose: number;
}

export interface StockScreenerResult {
  symbol: string;
  name: string;
  marketCap: number;
  sector: string;
  industry: string;
  peRatio: number;
  price: number;
  changePercent: number;
  volume: number;
}

export interface PortfolioPosition {
  symbol: string;
  shares: number;
  avgCost: number;
  currentPrice: number;
  marketValue: number;
  gainLoss: number;
  gainLossPercent: number;
  weight: number;
}

export interface PortfolioSummary {
  totalValue: number;
  totalCost: number;
  totalGainLoss: number;
  totalGainLossPercent: number;
  positions: PortfolioPosition[];
  cash: number;
}

export interface AlertConfig {
  id: string;
  symbol: string;
  type: 'price_above' | 'price_below' | 'volume_spike' | 'percent_change';
  value: number;
  triggered: boolean;
  triggeredAt?: number;
  createdAt: number;
}

export interface ApiKeyConfig {
  name: string;
  key: string;
  provider: string;
  freeTier: string;
  signupUrl: string;
  description: string;
  functions: string[];
  required: boolean;
}
