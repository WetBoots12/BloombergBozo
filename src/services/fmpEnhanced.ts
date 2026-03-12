/**
 * FMP Enhanced Service
 * Additional financial data functions for Bloomberg Terminal
 */

import axios from 'axios';
import { apiKeyManager } from './apiKeyManager';

const BASE_URL = 'https://financialmodelingprep.com/api/v3';

async function fmpGet<T>(path: string, params: Record<string, string | number> = {}): Promise<T> {
  const apiKey = apiKeyManager.getKey('fmp');
  if (!apiKey) throw new Error('No FMP API key');

  const { data } = await axios.get<T>(`${BASE_URL}${path}`, {
    params: { apikey: apiKey, ...params },
    timeout: 10000,
  });
  return data;
}

export interface FMPBalanceSheet {
  date: string;
  totalAssets: number;
  totalLiabilities: number;
  totalEquity: number;
  totalDebt: number;
  cashAndCashEquivalents: number;
  shortTermInvestments: number;
  netReceivables: number;
  inventory: number;
  propertyPlantEquipmentNet: number;
  goodwill: number;
  intangibleAssets: number;
  longTermInvestments: number;
  accountPayables: number;
  shortTermDebt: number;
  longTermDebt: number;
  retainedEarnings: number;
  commonStock: number;
}

export async function getBalanceSheet(symbol: string, limit = 4): Promise<FMPBalanceSheet[]> {
  try {
    const data = await fmpGet<FMPBalanceSheet[]>(`/balance-sheet-statement/${symbol}`, { limit });
    return data;
  } catch {
    return [];
  }
}

export interface FMPCashFlow {
  date: string;
  netIncome: number;
  depreciationAndAmortization: number;
  operatingCashFlow: number;
  capitalExpenditure: number;
  freeCashFlow: number;
  dividendsPaid: number;
  commonStockRepurchased: number;
  debtRepayment: number;
  commonStockIssued: number;
  debtIssuance: number;
  changeInCashAndCashEquivalents: number;
}

export async function getCashFlowStatement(symbol: string, limit = 4): Promise<FMPCashFlow[]> {
  try {
    const data = await fmpGet<FMPCashFlow[]>(`/cash-flow-statement/${symbol}`, { limit });
    return data;
  } catch {
    return [];
  }
}

export interface FMPPeerComparison {
  symbol: string;
  peersList: string[];
}

export async function getPeerSymbols(symbol: string): Promise<string[]> {
  try {
    const data = await fmpGet<FMPPeerComparison>(`/stock_peers`, { symbol });
    return data.peersList || [];
  } catch {
    return [];
  }
}

export interface FMPScreenerResult {
  symbol: string;
  name: string;
  marketCap: number;
  sector: string;
  industry: string;
  beta: number;
  price: number;
  lastAnnualDividend: number;
  volAvg: number;
  mktCap: number;
  lastDiv: number;
  range: string;
  changes: number;
  companyProfile: {
    description: string;
    ceo: string;
    website: string;
  };
}

export interface ScreenerFilters {
  sector?: string;
  industry?: string;
  marketCapMoreThan?: number;
  marketCapLessThan?: number;
  peMoreThan?: number;
  peLessThan?: number;
  priceMoreThan?: number;
  priceLessThan?: number;
  volumeMoreThan?: number;
  dividendMoreThan?: number;
  limit?: number;
}

export async function screenStocks(filters: ScreenerFilters = {}): Promise<FMPScreenerResult[]> {
  try {
    const params: Record<string, string | number> = {};
    if (filters.sector) params.sector = filters.sector;
    if (filters.industry) params.industry = filters.industry;
    if (filters.marketCapMoreThan) params.marketCapMoreThan = filters.marketCapMoreThan;
    if (filters.marketCapLessThan) params.marketCapLessThan = filters.marketCapLessThan;
    if (filters.peMoreThan) params.peMoreThan = filters.peMoreThan;
    if (filters.peLessThan) params.peLessThan = filters.peLessThan;
    if (filters.priceMoreThan) params.priceMoreThan = filters.priceMoreThan;
    if (filters.priceLessThan) params.priceLessThan = filters.priceLessThan;
    if (filters.volumeMoreThan) params.volumeMoreThan = filters.volumeMoreThan;
    if (filters.dividendMoreThan) params.dividendMoreThan = filters.dividendMoreThan;
    params.limit = filters.limit || 50;

    const data = await fmpGet<FMPScreenerResult[]>('/stock-screener', params);
    return data;
  } catch {
    return [];
  }
}

export interface FMPEstimates {
  symbol: string;
  estimatedRevenueLow: number;
  estimatedRevenueHigh: number;
  estimatedRevenueAvg: number;
  estimatedEpsLow: number;
  estimatedEpsHigh: number;
  estimatedEpsAvg: number;
  numberAnalystsEstimatedRevenue: number;
  numberAnalystsEstimatedEps: number;
  period: string;
}

export async function getCompanyEstimates(symbol: string): Promise<FMPEstimates[]> {
  try {
    const data = await fmpGet<FMPEstimates[]>(`/estimates/${symbol}`);
    return data;
  } catch {
    return [];
  }
}

export interface FMPKeyMetrics {
  date: string;
  revenuePerShare: number;
  netIncomePerShare: number;
  operatingCashFlowPerShare: number;
  freeCashFlowPerShare: number;
  cashPerShare: number;
  bookValuePerShare: number;
  tangibleBookValuePerShare: number;
  shareholdersEquityPerShare: number;
  interestDebtPerShare: number;
  marketCap: number;
  enterpriseValue: number;
  peRatio: number;
  priceToSalesRatio: number;
  pocfratio: number;
  pfcfRatio: number;
  pbRatio: number;
  ptbRatio: number;
  evToSales: number;
  enterpriseValueOverEBITDA: number;
  evToOperatingCashFlow: number;
  evToFreeCashFlow: number;
  earningsYield: number;
  freeCashFlowYield: number;
  debtToEquity: number;
  debtToAssets: number;
  netDebtToEBITDA: number;
  currentRatio: number;
  interestCoverage: number;
  incomeQuality: number;
  dividendYield: number;
  dividendYieldPercentage: number;
  payoutRatio: number;
  salesGeneralAndAdministrativeToRevenue: number;
  researchAndDdevelopementToRevenue: number;
 intangiblesToTotalAssets: number;
  capexToOperatingCashFlow: number;
  capexToRevenue: number;
  capexToDepreciation: number;
  stockBasedCompensationToRevenue: number;
  grahamNumber: number;
  roic: number;
  returnOnTangibleAssets: number;
  grahamNetNet: number;
  workingCapital: number;
  tangibleAssetValue: number;
  netCurrentAssetValue: number;
  investedCapital: number;
  averageReceivables: number;
  averagePayables: number;
  averageInventory: number;
  daysSalesOutstanding: number;
  daysPayablesOutstanding: number;
  daysOfInventoryOnHand: number;
  receivablesTurnover: number;
  payablesTurnover: number;
  inventoryTurnover: number;
  roe: number;
  capexPerShare: number;
}

export async function getKeyMetrics(symbol: string, limit = 4): Promise<FMPKeyMetrics[]> {
  try {
    const data = await fmpGet<FMPKeyMetrics[]>(`/key-metrics/${symbol}`, { limit });
    return data;
  } catch {
    return [];
  }
}

export interface FMPOwnerShipData {
  symbol: string;
  institutionalHolders: Array<{
    holder: string;
    shares: number;
    dateReported: string;
    percentHeld: number;
    change: number;
    value: number;
  }>;
  mutualFundHolders: Array<{
    holder: string;
    shares: number;
    dateReported: string;
    percentHeld: number;
    change: number;
    value: number;
  }>;
}

export async function getInstitutionalOwnership(symbol: string): Promise<FMPOwnerShipData | null> {
  try {
    const [institutional, mutual] = await Promise.all([
      fmpGet<Array<{ holder: string; shares: number; dateReported: string; percentHeld: number; change: number; value: number }>>(
        `/institutional-ownership/${symbol}`
      ),
      fmpGet<Array<{ holder: string; shares: number; dateReported: string; percentHeld: number; change: number; value: number }>>(
        `/mutual-fund-ownership/${symbol}`
      ),
    ]);

    return {
      symbol,
      institutionalHolders: institutional.slice(0, 10),
      mutualFundHolders: mutual.slice(0, 10),
    };
  } catch {
    return null;
  }
}
