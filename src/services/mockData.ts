import type { StockQuote, CompanyProfile, ChartDataPoint, NewsItem, CryptoAsset, CryptoGlobal, ForexPair, EconomicIndicator } from '../types/market';

// Generate realistic-looking historical price data
function generatePriceHistory(basePrice: number, days: number, volatility = 0.02): ChartDataPoint[] {
  const data: ChartDataPoint[] = [];
  let price = basePrice * (1 - (Math.random() * 0.15));
  const now = Date.now();

  for (let i = days; i >= 0; i--) {
    const date = new Date(now - i * 24 * 60 * 60 * 1000);
    const change = (Math.random() - 0.48) * volatility * price;
    const open = price;
    price = Math.max(price + change, 1);
    const high = Math.max(open, price) * (1 + Math.random() * 0.01);
    const low = Math.min(open, price) * (1 - Math.random() * 0.01);
    const volume = Math.floor(Math.random() * 50_000_000 + 10_000_000);

    data.push({
      date: date.toISOString().split('T')[0],
      open: parseFloat(open.toFixed(2)),
      high: parseFloat(high.toFixed(2)),
      low: parseFloat(low.toFixed(2)),
      close: parseFloat(price.toFixed(2)),
      volume,
    });
  }
  return data;
}

export const MOCK_QUOTES: Record<string, StockQuote> = {
  AAPL: { symbol: 'AAPL', price: 189.50, change: 2.34, changePercent: 1.25, open: 187.20, high: 190.10, low: 186.80, prevClose: 187.16, volume: 52_340_000, timestamp: Date.now() / 1000 },
  MSFT: { symbol: 'MSFT', price: 415.23, change: -3.12, changePercent: -0.75, open: 418.50, high: 419.20, low: 413.80, prevClose: 418.35, volume: 18_920_000, timestamp: Date.now() / 1000 },
  GOOGL: { symbol: 'GOOGL', price: 175.84, change: 1.56, changePercent: 0.90, open: 174.30, high: 176.50, low: 173.90, prevClose: 174.28, volume: 23_100_000, timestamp: Date.now() / 1000 },
  AMZN: { symbol: 'AMZN', price: 198.72, change: 3.45, changePercent: 1.77, open: 195.30, high: 199.80, low: 194.90, prevClose: 195.27, volume: 31_450_000, timestamp: Date.now() / 1000 },
  NVDA: { symbol: 'NVDA', price: 875.39, change: 22.45, changePercent: 2.63, open: 853.20, high: 881.00, low: 850.10, prevClose: 852.94, volume: 42_780_000, timestamp: Date.now() / 1000 },
  TSLA: { symbol: 'TSLA', price: 248.50, change: -8.23, changePercent: -3.20, open: 256.80, high: 258.10, low: 247.20, prevClose: 256.73, volume: 98_650_000, timestamp: Date.now() / 1000 },
  META: { symbol: 'META', price: 505.18, change: 7.82, changePercent: 1.57, open: 497.40, high: 507.30, low: 496.20, prevClose: 497.36, volume: 14_230_000, timestamp: Date.now() / 1000 },
  SPY: { symbol: 'SPY', price: 527.82, change: 3.21, changePercent: 0.61, open: 524.65, high: 528.90, low: 524.10, prevClose: 524.61, volume: 78_430_000, timestamp: Date.now() / 1000 },
  QQQ: { symbol: 'QQQ', price: 448.93, change: 4.15, changePercent: 0.93, open: 444.80, high: 449.60, low: 444.20, prevClose: 444.78, volume: 45_230_000, timestamp: Date.now() / 1000 },
  DIA: { symbol: 'DIA', price: 421.34, change: 1.23, changePercent: 0.29, open: 420.15, high: 422.10, low: 419.80, prevClose: 420.11, volume: 5_430_000, timestamp: Date.now() / 1000 },
  IWM: { symbol: 'IWM', price: 211.45, change: -1.34, changePercent: -0.63, open: 212.80, high: 213.40, low: 210.90, prevClose: 212.79, volume: 28_760_000, timestamp: Date.now() / 1000 },
  GLD: { symbol: 'GLD', price: 213.82, change: 0.95, changePercent: 0.45, open: 212.90, high: 214.20, low: 212.50, prevClose: 212.87, volume: 8_230_000, timestamp: Date.now() / 1000 },
  BRK: { symbol: 'BRK.B', price: 452.67, change: 1.23, changePercent: 0.27, open: 451.45, high: 453.20, low: 451.00, prevClose: 451.44, volume: 3_450_000, timestamp: Date.now() / 1000 },
  JPM: { symbol: 'JPM', price: 234.56, change: 2.34, changePercent: 1.01, open: 232.25, high: 235.10, low: 232.00, prevClose: 232.22, volume: 9_870_000, timestamp: Date.now() / 1000 },
};

export const MOCK_PROFILES: Record<string, CompanyProfile> = {
  AAPL: {
    symbol: 'AAPL', name: 'Apple Inc.', exchange: 'NASDAQ', currency: 'USD',
    industry: 'Technology', sector: 'Consumer Electronics',
    description: 'Apple Inc. designs, manufactures, and markets smartphones, personal computers, tablets, wearables, and accessories worldwide. The company offers iPhone, Mac, iPad, Apple Watch, and various software services including the App Store, Apple Music, Apple TV+, and iCloud.',
    marketCap: 2_950_000_000_000, peRatio: 31.2, weekHigh52: 199.62, weekLow52: 164.08,
    logo: '', weburl: 'https://www.apple.com', employees: 161_000, country: 'US',
  },
  MSFT: {
    symbol: 'MSFT', name: 'Microsoft Corporation', exchange: 'NASDAQ', currency: 'USD',
    industry: 'Technology', sector: 'Software',
    description: 'Microsoft Corporation develops, licenses, and supports software, services, devices, and solutions worldwide. The company offers Office, Azure cloud services, Windows, Xbox, LinkedIn, and GitHub platforms.',
    marketCap: 3_080_000_000_000, peRatio: 35.8, weekHigh52: 468.35, weekLow52: 369.85,
    logo: '', weburl: 'https://www.microsoft.com', employees: 221_000, country: 'US',
  },
  NVDA: {
    symbol: 'NVDA', name: 'NVIDIA Corporation', exchange: 'NASDAQ', currency: 'USD',
    industry: 'Technology', sector: 'Semiconductors',
    description: 'NVIDIA Corporation designs and manufactures graphics processing units (GPUs), system-on-chip units, and API software for the gaming, professional visualization, data center, and automotive markets.',
    marketCap: 2_150_000_000_000, peRatio: 68.4, weekHigh52: 974.00, weekLow52: 435.50,
    logo: '', weburl: 'https://www.nvidia.com', employees: 29_600, country: 'US',
  },
  TSLA: {
    symbol: 'TSLA', name: 'Tesla, Inc.', exchange: 'NASDAQ', currency: 'USD',
    industry: 'Technology', sector: 'Electric Vehicles',
    description: 'Tesla, Inc. designs, develops, manufactures, leases, and sells electric vehicles, energy generation and storage systems, and related services. The company offers Model 3, Model Y, Model S, Model X, Cybertruck, and energy products.',
    marketCap: 792_000_000_000, peRatio: 52.3, weekHigh52: 299.29, weekLow52: 138.80,
    logo: '', weburl: 'https://www.tesla.com', employees: 127_855, country: 'US',
  },
  SPY: {
    symbol: 'SPY', name: 'SPDR S&P 500 ETF Trust', exchange: 'NYSE', currency: 'USD',
    industry: 'ETF', sector: 'Broad Market',
    description: 'The SPDR S&P 500 ETF Trust seeks to provide investment results that correspond generally to the price and yield performance of the S&P 500 Index.',
    marketCap: 550_000_000_000, peRatio: 22.1, weekHigh52: 586.25, weekLow52: 493.65,
    logo: '', weburl: 'https://www.ssga.com', employees: 0, country: 'US',
  },
};

export const MOCK_CHART_DATA: Record<string, ChartDataPoint[]> = {
  AAPL: generatePriceHistory(189.50, 365),
  MSFT: generatePriceHistory(415.23, 365),
  GOOGL: generatePriceHistory(175.84, 365),
  NVDA: generatePriceHistory(875.39, 365, 0.035),
  TSLA: generatePriceHistory(248.50, 365, 0.04),
  SPY: generatePriceHistory(527.82, 365, 0.01),
  QQQ: generatePriceHistory(448.93, 365, 0.012),
};

export const MOCK_NEWS: NewsItem[] = [
  { id: '1', headline: 'Fed Holds Rates Steady, Signals Caution on Future Cuts', summary: 'The Federal Reserve held interest rates steady and signaled a cautious approach to future rate reductions amid persistent inflation concerns.', source: 'Reuters', url: '#', datetime: Date.now() / 1000 - 1800, category: 'economy', related: 'SPY,TLT' },
  { id: '2', headline: 'NVIDIA Surpasses $2T Market Cap on AI Chip Demand', summary: 'NVIDIA Corporation crossed the $2 trillion market capitalization mark as demand for AI processors continues to surge across major tech companies.', source: 'Bloomberg', url: '#', datetime: Date.now() / 1000 - 3600, category: 'technology', related: 'NVDA' },
  { id: '3', headline: 'Apple Vision Pro Sales Exceed Early Expectations', summary: 'Apple reported that Vision Pro sales in the first quarter exceeded analyst expectations, driving optimism about the spatial computing market.', source: 'CNBC', url: '#', datetime: Date.now() / 1000 - 7200, category: 'technology', related: 'AAPL' },
  { id: '4', headline: 'Bitcoin Reaches New All-Time High Above $70,000', summary: 'Bitcoin surged past $70,000 for the first time as spot ETF inflows continue and the upcoming halving event approaches.', source: 'CoinDesk', url: '#', datetime: Date.now() / 1000 - 10800, category: 'crypto', related: 'BTC' },
  { id: '5', headline: 'S&P 500 Posts Strongest Quarter in Two Years', summary: 'The S&P 500 index closed up 10.2% for the quarter, marking its strongest three-month performance since late 2021.', source: 'WSJ', url: '#', datetime: Date.now() / 1000 - 14400, category: 'markets', related: 'SPY' },
  { id: '6', headline: 'Tesla Reports Record Deliveries Despite Price Competition', summary: 'Tesla delivered 484,000 vehicles in Q1 2024, beating analyst estimates despite intense competition from Chinese EV makers.', source: 'Reuters', url: '#', datetime: Date.now() / 1000 - 18000, category: 'technology', related: 'TSLA' },
  { id: '7', headline: 'Microsoft Azure Revenue Grows 28% on AI Demand', summary: 'Microsoft reported Azure cloud revenue growth of 28% year-over-year, driven by AI workloads and Copilot adoption.', source: 'CNBC', url: '#', datetime: Date.now() / 1000 - 21600, category: 'technology', related: 'MSFT' },
  { id: '8', headline: 'Oil Prices Slip as OPEC+ Output Concerns Ease', summary: 'Crude oil futures fell 1.3% after OPEC+ members signaled flexibility on production targets amid weaker-than-expected demand.', source: 'Bloomberg', url: '#', datetime: Date.now() / 1000 - 25200, category: 'markets', related: 'XLE,USO' },
  { id: '9', headline: 'Amazon AWS Margin Expansion Surprises Wall Street', summary: 'Amazon Web Services reported operating margins of 38%, significantly above consensus estimates, driving after-hours gains.', source: 'WSJ', url: '#', datetime: Date.now() / 1000 - 28800, category: 'technology', related: 'AMZN' },
  { id: '10', headline: 'Ethereum ETF Decision Expected by End of Month', summary: 'The SEC is expected to make a decision on spot Ethereum ETF applications within weeks, with approval odds rising.', source: 'CoinDesk', url: '#', datetime: Date.now() / 1000 - 32400, category: 'crypto', related: 'ETH' },
  { id: '11', headline: 'JPMorgan Raises S&P 500 Year-End Target to 5,800', summary: 'JPMorgan Chase equity strategists raised their year-end S&P 500 target citing strong earnings growth and AI productivity gains.', source: 'Bloomberg', url: '#', datetime: Date.now() / 1000 - 36000, category: 'markets', related: 'SPY' },
  { id: '12', headline: 'Meta AI Assistant Surpasses 1 Billion Monthly Users', summary: 'Meta announced that its AI assistant has surpassed 1 billion monthly active users across WhatsApp, Instagram, and Facebook.', source: 'Reuters', url: '#', datetime: Date.now() / 1000 - 43200, category: 'technology', related: 'META' },
];

export const MOCK_CRYPTO: CryptoAsset[] = [
  { id: 'bitcoin', symbol: 'BTC', name: 'Bitcoin', image: '', current_price: 67423, market_cap: 1_325_000_000_000, market_cap_rank: 1, price_change_24h: 1823.45, price_change_percentage_24h: 2.78, total_volume: 38_500_000_000, high_24h: 68200, low_24h: 65100, circulating_supply: 19_650_000, ath: 73750, ath_change_percentage: -8.55 },
  { id: 'ethereum', symbol: 'ETH', name: 'Ethereum', image: '', current_price: 3521.84, market_cap: 423_000_000_000, market_cap_rank: 2, price_change_24h: -45.23, price_change_percentage_24h: -1.27, total_volume: 18_200_000_000, high_24h: 3598, low_24h: 3480, circulating_supply: 120_100_000, ath: 4878, ath_change_percentage: -27.81 },
  { id: 'binancecoin', symbol: 'BNB', name: 'BNB', image: '', current_price: 598.42, market_cap: 87_500_000_000, market_cap_rank: 3, price_change_24h: 8.34, price_change_percentage_24h: 1.41, total_volume: 2_100_000_000, high_24h: 612, low_24h: 585, circulating_supply: 146_200_000, ath: 686.31, ath_change_percentage: -12.78 },
  { id: 'solana', symbol: 'SOL', name: 'Solana', image: '', current_price: 182.34, market_cap: 79_800_000_000, market_cap_rank: 4, price_change_24h: 6.78, price_change_percentage_24h: 3.86, total_volume: 4_500_000_000, high_24h: 185, low_24h: 175, circulating_supply: 437_600_000, ath: 259.96, ath_change_percentage: -29.86 },
  { id: 'ripple', symbol: 'XRP', name: 'XRP', image: '', current_price: 0.628, market_cap: 34_900_000_000, market_cap_rank: 5, price_change_24h: -0.012, price_change_percentage_24h: -1.87, total_volume: 1_800_000_000, high_24h: 0.645, low_24h: 0.618, circulating_supply: 55_600_000_000, ath: 3.40, ath_change_percentage: -81.53 },
  { id: 'dogecoin', symbol: 'DOGE', name: 'Dogecoin', image: '', current_price: 0.1823, market_cap: 26_200_000_000, market_cap_rank: 6, price_change_24h: 0.0045, price_change_percentage_24h: 2.53, total_volume: 1_950_000_000, high_24h: 0.1870, low_24h: 0.1765, circulating_supply: 143_800_000_000, ath: 0.7376, ath_change_percentage: -75.28 },
  { id: 'cardano', symbol: 'ADA', name: 'Cardano', image: '', current_price: 0.4823, market_cap: 17_100_000_000, market_cap_rank: 7, price_change_24h: -0.0145, price_change_percentage_24h: -2.92, total_volume: 456_000_000, high_24h: 0.502, low_24h: 0.477, circulating_supply: 35_500_000_000, ath: 3.10, ath_change_percentage: -84.44 },
  { id: 'avalanche-2', symbol: 'AVAX', name: 'Avalanche', image: '', current_price: 38.45, market_cap: 15_700_000_000, market_cap_rank: 8, price_change_24h: 1.23, price_change_percentage_24h: 3.30, total_volume: 678_000_000, high_24h: 39.2, low_24h: 37.0, circulating_supply: 408_000_000, ath: 146.22, ath_change_percentage: -73.71 },
  { id: 'tron', symbol: 'TRX', name: 'TRON', image: '', current_price: 0.1245, market_cap: 10_800_000_000, market_cap_rank: 9, price_change_24h: 0.0023, price_change_percentage_24h: 1.88, total_volume: 523_000_000, high_24h: 0.128, low_24h: 0.122, circulating_supply: 86_800_000_000, ath: 0.3004, ath_change_percentage: -58.56 },
  { id: 'polkadot', symbol: 'DOT', name: 'Polkadot', image: '', current_price: 8.92, market_cap: 12_400_000_000, market_cap_rank: 10, price_change_24h: -0.145, price_change_percentage_24h: -1.60, total_volume: 389_000_000, high_24h: 9.15, low_24h: 8.78, circulating_supply: 1_390_000_000, ath: 55.00, ath_change_percentage: -83.78 },
  { id: 'chainlink', symbol: 'LINK', name: 'Chainlink', image: '', current_price: 18.74, market_cap: 11_000_000_000, market_cap_rank: 11, price_change_24h: 0.567, price_change_percentage_24h: 3.12, total_volume: 678_000_000, high_24h: 19.2, low_24h: 18.1, circulating_supply: 587_000_000, ath: 52.88, ath_change_percentage: -64.58 },
  { id: 'uniswap', symbol: 'UNI', name: 'Uniswap', image: '', current_price: 12.34, market_cap: 7_400_000_000, market_cap_rank: 12, price_change_24h: 0.234, price_change_percentage_24h: 1.93, total_volume: 234_000_000, high_24h: 12.65, low_24h: 12.05, circulating_supply: 600_000_000, ath: 44.97, ath_change_percentage: -72.57 },
];

export const MOCK_CRYPTO_GLOBAL: CryptoGlobal = {
  total_market_cap: { usd: 2_650_000_000_000 },
  total_volume: { usd: 98_500_000_000 },
  market_cap_percentage: { btc: 50.2, eth: 15.9 },
  market_cap_change_percentage_24h_usd: 1.45,
};

export const MOCK_FOREX: ForexPair[] = [
  { from: 'EUR', to: 'USD', rate: 1.0845, change: 0.0023, changePercent: 0.21, bid: 1.0843, ask: 1.0847 },
  { from: 'GBP', to: 'USD', rate: 1.2712, change: -0.0045, changePercent: -0.35, bid: 1.2710, ask: 1.2714 },
  { from: 'USD', to: 'JPY', rate: 150.82, change: 0.45, changePercent: 0.30, bid: 150.80, ask: 150.84 },
  { from: 'USD', to: 'CHF', rate: 0.9012, change: -0.0018, changePercent: -0.20, bid: 0.9010, ask: 0.9014 },
  { from: 'AUD', to: 'USD', rate: 0.6534, change: 0.0012, changePercent: 0.18, bid: 0.6532, ask: 0.6536 },
  { from: 'USD', to: 'CAD', rate: 1.3621, change: 0.0034, changePercent: 0.25, bid: 1.3619, ask: 1.3623 },
  { from: 'NZD', to: 'USD', rate: 0.6123, change: -0.0008, changePercent: -0.13, bid: 0.6121, ask: 0.6125 },
  { from: 'EUR', to: 'GBP', rate: 0.8530, change: 0.0012, changePercent: 0.14, bid: 0.8528, ask: 0.8532 },
  { from: 'EUR', to: 'JPY', rate: 163.52, change: 0.82, changePercent: 0.50, bid: 163.50, ask: 163.54 },
  { from: 'GBP', to: 'JPY', rate: 191.72, change: -0.34, changePercent: -0.18, bid: 191.70, ask: 191.74 },
  { from: 'USD', to: 'CNY', rate: 7.2345, change: 0.0123, changePercent: 0.17, bid: 7.2342, ask: 7.2348 },
  { from: 'USD', to: 'HKD', rate: 7.8234, change: -0.0045, changePercent: -0.06, bid: 7.8232, ask: 7.8236 },
];

export const MOCK_ECONOMIC: EconomicIndicator[] = [
  { name: 'US GDP Growth (QoQ)', value: '3.2%', change: '+0.4%', changeDir: 'up', period: 'Q4 2023', source: 'BEA' },
  { name: 'US CPI (YoY)', value: '3.2%', change: '-0.1%', changeDir: 'down', period: 'Feb 2024', source: 'BLS' },
  { name: 'Core CPI (YoY)', value: '3.8%', change: '-0.1%', changeDir: 'down', period: 'Feb 2024', source: 'BLS' },
  { name: 'US Unemployment Rate', value: '3.9%', change: '+0.1%', changeDir: 'up', period: 'Feb 2024', source: 'BLS' },
  { name: 'Fed Funds Rate', value: '5.25-5.50%', change: '0.00%', changeDir: 'flat', period: 'Mar 2024', source: 'Fed' },
  { name: 'US 10Y Treasury Yield', value: '4.32%', change: '+0.05%', changeDir: 'up', period: 'Current', source: 'Treasury' },
  { name: 'US 2Y Treasury Yield', value: '4.68%', change: '+0.03%', changeDir: 'up', period: 'Current', source: 'Treasury' },
  { name: 'US Retail Sales (MoM)', value: '+0.6%', change: '+0.8%', changeDir: 'up', period: 'Feb 2024', source: 'Census' },
  { name: 'ISM Manufacturing PMI', value: '47.8', change: '+0.5', changeDir: 'up', period: 'Feb 2024', source: 'ISM' },
  { name: 'ISM Services PMI', value: '52.6', change: '-0.8', changeDir: 'down', period: 'Feb 2024', source: 'ISM' },
  { name: 'Nonfarm Payrolls (K)', value: '+275K', change: '+46K', changeDir: 'up', period: 'Feb 2024', source: 'BLS' },
  { name: 'US Trade Balance ($B)', value: '-$67.4B', change: '-$4.3B', changeDir: 'down', period: 'Jan 2024', source: 'Census' },
];
