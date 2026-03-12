/**
 * Bloomberg Command Parser & Router
 * Parses Bloomberg-style terminal commands and routes to appropriate functions
 * 
 * Command formats:
 * - <TICKER> <FUNCTION>  e.g., "AAPL DES", "MSFT FA"
 * - <TICKER><FUNCTION>   e.g., "AAPLDES", "MSFTGO" (Bloomberg style)
 * - <FUNCTION>           e.g., "NEWS", "CRYPTO", "MARKET"
 * - <TICKER>             e.g., "AAPL" (defaults to quote/chart)
 */

import type { BloombergCommand, BloombergFunction } from '../types/bloomberg';

// Function aliases (multiple ways to invoke the same function)
const FUNCTION_ALIASES: Record<string, BloombergFunction> = {
  // Quote/Chart functions
  'GO': 'GO',
  'GP': 'GP',
  'QUOTE': 'GO',
  'Q': 'GO',
  'CHART': 'GP',
  'C': 'GP',
  
  // Company info
  'DES': 'DES',
  'DESCRIPTION': 'DES',
  'COMPANY': 'DES',
  'D': 'DES',
  
  // Financials
  'FA': 'FA',
  'FINANCIALS': 'FA',
  'FINANCIAL': 'FA',
  'F': 'FA',
  'INC': 'FA', // Income statement
  
  // Analyst data
  'ANR': 'ANR',
  'ANALYST': 'ANR',
  'RATINGS': 'ANR',
  'RECOMMENDATION': 'ANR',
  'REC': 'ANR',
  'TARGET': 'ANR',
  'PT': 'ANR', // Price target
  
  // Earnings
  'E': 'E',
  'EARNINGS': 'E',
  'ERN': 'E',
  'ESTIMATE': 'E',
  
  // News
  'CN': 'CN',
  'NEWS': 'NEWS',
  'N': 'NEWS',
  'COMPANY NEWS': 'CN',
  'TOP': 'TOP',
  'TOP NEWS': 'TOP',
  
  // Ownership
  'OWN': 'OWN',
  'OWNERSHIP': 'OWN',
  'INSIDER': 'OWN',
  'HOLDINGS': 'OWN',
  'FILINGS': 'FILINGS',
  'SEC': 'FILINGS',
  '10K': 'FILINGS',
  '10Q': 'FILINGS',
  '8K': 'FILINGS',
  
  // Market functions
  'MARKET': 'MARKET',
  'MKT': 'MARKET',
  'WM': 'MARKET', // World Market
  'INDEX': 'INDEX',
  'INDICES': 'INDEX',
  'COMDTY': 'COMDTY',
  'COMMODITY': 'COMDTY',
  'COMMODITIES': 'COMDTY',
  'CRYPTO': 'CRYPTO',
  'CRYP': 'CRYPTO',
  'BTC': 'CRYPTO',
  'FX': 'FX',
  'FOREX': 'FX',
  'CCY': 'FX',
  'CURRENCY': 'FX',
  'ECON': 'ECON',
  'ECO': 'ECON',
  'ECONOMIC': 'ECON',
  'MACRO': 'ECON',
  'YIELD': 'YIELD',
  'TREASURY': 'YIELD',
  'BOND': 'YIELD',
  
  // Portfolio
  'PORT': 'PORT',
  'PORTFOLIO': 'PORT',
  'P': 'PORT',
  'WLT': 'WLT',
  'WATCH': 'WLT',
  'WATCHLIST': 'WLT',
  
  // Analysis
  'SCREEN': 'SCREEN',
  'SCREENER': 'SCREEN',
  'CORR': 'CORR',
  'CORRELATION': 'CORR',
  'BETA': 'BETA',
  'VOL': 'VOL',
  'VOLATILITY': 'VOL',
  'PEERS': 'PEERS',
  'COMP': 'PEERS',
  'COMPARISON': 'PEERS',
  
  // Help
  'HELP': 'HELP',
  'H': 'HELP',
  '?': 'HELP',
};

// Known tickers to help parse commands (helps distinguish ticker from function)
const KNOWN_TICKERS = new Set([
  'AAPL', 'MSFT', 'NVDA', 'GOOGL', 'GOOG', 'AMZN', 'META', 'TSLA', 'BRK.B', 'V',
  'JPM', 'JNJ', 'WMT', 'PG', 'MA', 'UNH', 'HD', 'DIS', 'PYPL', 'BAC', 'NFLX',
  'ADBE', 'CRM', 'CMCSA', 'XOM', 'VZ', 'KO', 'NKE', 'PFE', 'INTC', 'T',
  'MRK', 'CSCO', 'ABT', 'PEP', 'TMO', 'COST', 'AVGO', 'ACN', 'TXN', 'LLY',
  'WFC', 'ORCL', 'MDT', 'NEE', 'DHR', 'BMY', 'QCOM', 'HON', 'UPS', 'PM',
  'AMGN', 'RTX', 'LOW', 'IBM', 'BA', 'SBUX', 'INTU', 'CAT', 'GS', 'BLK',
  'DE', 'GILD', 'AMD', 'ISRG', 'AXP', 'NOW', 'ELV', 'SYK', 'ADI', 'TJX',
  'SPY', 'QQQ', 'DIA', 'IWM', 'VTI', 'VOO', 'VEA', 'IEFA', 'AGG', 'BND',
  'GLD', 'SLV', 'USO', 'UNG', 'VIX', 'UVXY',
  'BTC', 'ETH', 'BNB', 'XRP', 'ADA', 'DOGE', 'SOL', 'DOT', 'MATIC', 'LTC',
  'EUR', 'GBP', 'JPY', 'CHF', 'CAD', 'AUD', 'NZD', 'CNY', 'USD',
]);

export function parseBloombergCommand(input: string): BloombergCommand {
  const raw = input.trim().toUpperCase();
  
  if (!raw) {
    return { func: 'HELP', raw };
  }

  // Remove Bloomberg suffixes
  const cleaned = raw
    .replace(/<EQUITY>/g, '')
    .replace(/<CRYPTO>/g, '')
    .replace(/<INDEX>/g, '')
    .replace(/<FOREX>/g, '')
    .replace(/<GO>/g, '')
    .trim();

  // Split into parts
  const parts = cleaned.split(/\s+/).filter(Boolean);
  
  if (parts.length === 0) {
    return { func: 'HELP', raw };
  }

  // Single word command
  if (parts.length === 1) {
    const part = parts[0];
    
    // Check if it's a function
    if (FUNCTION_ALIASES[part]) {
      return { func: FUNCTION_ALIASES[part], raw };
    }
    
    // Check if it's a ticker (assume GO function)
    if (isValidTicker(part)) {
      return { ticker: part, func: 'GO', raw };
    }
    
    // Unknown command
    return { func: 'HELP', raw };
  }

  // Multiple parts - try to identify ticker and function
  // Format: <TICKER> <FUNCTION> or <FUNCTION> <TICKER>
  
  const [first, second] = parts;
  
  // Check if first part is a ticker
  if (isValidTicker(first) && FUNCTION_ALIASES[second]) {
    return { ticker: first, func: FUNCTION_ALIASES[second], raw };
  }
  
  // Check if first part is a function and second is a ticker
  if (FUNCTION_ALIASES[first] && isValidTicker(second)) {
    return { ticker: second, func: FUNCTION_ALIASES[first], raw };
  }
  
  // Try to parse combined format (e.g., "AAPLDES")
  const combinedMatch = cleaned.match(/^([A-Z.]{1,10})([A-Z]{1,10})$/);
  if (combinedMatch) {
    const [, potentialTicker, potentialFunc] = combinedMatch;
    if (isValidTicker(potentialTicker) && FUNCTION_ALIASES[potentialFunc]) {
      return { ticker: potentialTicker, func: FUNCTION_ALIASES[potentialFunc], raw };
    }
  }
  
  // Default: treat first part as ticker
  if (isValidTicker(first)) {
    return { ticker: first, func: 'GO', raw };
  }
  
  // Check if first part is a function
  if (FUNCTION_ALIASES[first]) {
    return { func: FUNCTION_ALIASES[first], raw };
  }
  
  return { func: 'HELP', raw };
}

function isValidTicker(symbol: string): boolean {
  // Basic ticker validation
  if (!/^[A-Z.]{1,10}$/.test(symbol)) {
    return false;
  }
  
  // Check against known tickers
  if (KNOWN_TICKERS.has(symbol)) {
    return true;
  }
  
  // Accept any valid-looking ticker format
  return true;
}

// Get function description for help
export function getFunctionDescription(func: BloombergFunction): string {
  const descriptions: Record<BloombergFunction, string> = {
    'GO': 'Security quote and real-time chart',
    'GP': 'Price chart with technical indicators',
    'DES': 'Company description and key statistics',
    'ANR': 'Analyst recommendations and price targets',
    'E': 'Earnings data, estimates, and surprises',
    'CN': 'Company-specific news',
    'FA': 'Financial statements (Income, Balance Sheet, Cash Flow)',
    'OWN': 'Insider ownership and transactions',
    'FILINGS': 'SEC filings browser (10-K, 10-Q, 8-K)',
    'NEWS': 'Top market-moving news',
    'TOP': 'Most read news stories',
    'MARKET': 'Global market overview',
    'INDEX': 'Major stock indices',
    'COMDTY': 'Commodities prices (Gold, Oil, etc.)',
    'CRYPTO': 'Cryptocurrency dashboard',
    'FX': 'Foreign exchange rates',
    'ECON': 'Economic indicators and calendar',
    'YIELD': 'Treasury yield curve',
    'PORT': 'Portfolio tracker',
    'WLT': 'Watchlist management',
    'SCREEN': 'Stock screener',
    'CORR': 'Correlation matrix analysis',
    'BETA': 'Beta and volatility analysis',
    'VOL': 'Volatility analysis',
    'PEERS': 'Peer company comparison',
    'HELP': 'Show this help information',
  };
  
  return descriptions[func] || 'Function unavailable';
}

// Get all available functions for help display
export function getAvailableFunctions(): Array<{ code: string; name: string; description: string }> {
  return [
    { code: 'GO', name: 'Quote', description: 'Security quote and real-time chart' },
    { code: 'GP', name: 'Chart', description: 'Price chart with technical indicators' },
    { code: 'DES', name: 'Description', description: 'Company description and key statistics' },
    { code: 'FA', name: 'Financials', description: 'Financial statements' },
    { code: 'ANR', name: 'Analyst', description: 'Analyst recommendations and targets' },
    { code: 'E', name: 'Earnings', description: 'Earnings data and estimates' },
    { code: 'CN', name: 'Company News', description: 'Company-specific news' },
    { code: 'OWN', name: 'Ownership', description: 'Insider ownership and transactions' },
    { code: 'FILINGS', name: 'SEC Filings', description: 'SEC filings browser' },
    { code: 'NEWS', name: 'News', description: 'Top market news' },
    { code: 'MARKET', name: 'Market', description: 'Global market overview' },
    { code: 'INDEX', name: 'Indices', description: 'Major stock indices' },
    { code: 'COMDTY', name: 'Commodities', description: 'Commodities prices' },
    { code: 'CRYPTO', name: 'Crypto', description: 'Cryptocurrency dashboard' },
    { code: 'FX', name: 'Forex', description: 'Foreign exchange rates' },
    { code: 'ECON', name: 'Economic', description: 'Economic indicators' },
    { code: 'YIELD', name: 'Yield Curve', description: 'Treasury yield curve' },
    { code: 'PORT', name: 'Portfolio', description: 'Portfolio tracker' },
    { code: 'WLT', name: 'Watchlist', description: 'Watchlist management' },
    { code: 'SCREEN', name: 'Screener', description: 'Stock screener' },
    { code: 'PEERS', name: 'Peers', description: 'Peer comparison' },
  ];
}
