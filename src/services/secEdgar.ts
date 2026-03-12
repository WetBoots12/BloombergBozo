import axios from 'axios';
import type { SECFiling, InsiderTrade } from '../types/market';

// SEC EDGAR API - completely free, no API key required
// Just needs a User-Agent header with contact email
const BASE_URL = 'https://data.sec.gov';
const EFTS_URL = 'https://efts.sec.gov/LATEST';

const http = axios.create({
  headers: {
    'User-Agent': 'BloombergBozo/1.0 (bloomberg-bozo-terminal@example.com)',
    'Accept': 'application/json',
  },
});

// Cache CIK lookups
const cikCache = new Map<string, string>();

async function getCIK(ticker: string): Promise<string | null> {
  const cached = cikCache.get(ticker.toUpperCase());
  if (cached) return cached;

  try {
    const { data } = await http.get(`${EFTS_URL}/search-index?q=%22${ticker}%22&dateRange=custom&startdt=2020-01-01&forms=10-K`);
    if (data.hits?.hits?.[0]) {
      const cik = data.hits.hits[0]._source?.entity_id;
      if (cik) {
        cikCache.set(ticker.toUpperCase(), cik);
        return cik;
      }
    }
  } catch {
    // Try company tickers JSON as fallback
  }

  try {
    const { data } = await http.get('https://www.sec.gov/files/company_tickers.json');
    for (const entry of Object.values(data) as Array<{ cik_str: number; ticker: string }>) {
      if (entry.ticker.toUpperCase() === ticker.toUpperCase()) {
        const cik = String(entry.cik_str).padStart(10, '0');
        cikCache.set(ticker.toUpperCase(), cik);
        return cik;
      }
    }
  } catch {
    // CIK lookup failed
  }

  return null;
}

export async function getCompanyFilings(ticker: string, formTypes?: string[]): Promise<SECFiling[]> {
  const cik = await getCIK(ticker);
  if (!cik) return [];

  try {
    const { data } = await http.get(`${BASE_URL}/submissions/CIK${cik}.json`);

    const recent = data.filings?.recent;
    if (!recent) return [];

    const filings: SECFiling[] = [];
    const limit = Math.min(recent.accessionNumber.length, 50);

    for (let i = 0; i < limit; i++) {
      const form = recent.form[i];
      if (formTypes && formTypes.length > 0 && !formTypes.includes(form)) continue;

      const accessionRaw = recent.accessionNumber[i];
      const accessionDashed = accessionRaw.replace(/-/g, '');

      filings.push({
        accessionNumber: accessionRaw,
        filingDate: recent.filingDate[i],
        reportDate: recent.reportDate?.[i] || recent.filingDate[i],
        form,
        primaryDocument: recent.primaryDocument[i] || '',
        primaryDocDescription: recent.primaryDocDescription?.[i] || form,
        filingUrl: `https://www.sec.gov/Archives/edgar/data/${parseInt(cik)}/${accessionDashed}/${recent.primaryDocument[i]}`,
      });
    }

    return filings;
  } catch {
    return [];
  }
}

export async function getInsiderTrades(ticker: string): Promise<InsiderTrade[]> {
  // SEC EDGAR Form 4 filings contain insider trades
  // We parse from the EDGAR full-text search
  const cik = await getCIK(ticker);
  if (!cik) return [];

  try {
    const { data } = await http.get(`${BASE_URL}/submissions/CIK${cik}.json`);
    const recent = data.filings?.recent;
    if (!recent) return [];

    // Find Form 4 filings (insider transactions)
    const trades: InsiderTrade[] = [];
    const limit = Math.min(recent.accessionNumber.length, 100);

    for (let i = 0; i < limit; i++) {
      if (recent.form[i] !== '4') continue;
      if (trades.length >= 20) break;

      // For Form 4, we can extract basic info from the filing metadata
      // The owner info is in the filer name
      trades.push({
        filingDate: recent.filingDate[i],
        ownerName: recent.primaryDocDescription?.[i] || 'Insider',
        ownerTitle: 'Officer/Director',
        transactionType: 'S', // Default, would need XML parsing for exact type
        shares: 0,
        pricePerShare: 0,
        totalValue: 0,
        sharesOwned: 0,
      });
    }

    return trades;
  } catch {
    return [];
  }
}

// Get company description from EDGAR (DES command equivalent)
export async function getCompanyDescription(ticker: string): Promise<{
  name: string;
  cik: string;
  sic: string;
  sicDescription: string;
  stateOfIncorporation: string;
  fiscalYearEnd: string;
  addresses: { business: string; mailing: string };
  filings: SECFiling[];
} | null> {
  const cik = await getCIK(ticker);
  if (!cik) return null;

  try {
    const { data } = await http.get(`${BASE_URL}/submissions/CIK${cik}.json`);

    const bizAddr = data.addresses?.business;
    const mailAddr = data.addresses?.mailing;

    const formatAddr = (a: { street1?: string; street2?: string; city?: string; stateOrCountry?: string; zipCode?: string }) =>
      a ? [a.street1, a.street2, `${a.city || ''}, ${a.stateOrCountry || ''} ${a.zipCode || ''}`].filter(Boolean).join(', ') : '';

    // Get recent key filings (10-K, 10-Q, 8-K)
    const keyFilings = await getCompanyFilings(ticker, ['10-K', '10-Q', '8-K']);

    return {
      name: data.name || ticker,
      cik: cik,
      sic: data.sic || '',
      sicDescription: data.sicDescription || '',
      stateOfIncorporation: data.stateOfIncorporation || '',
      fiscalYearEnd: data.fiscalYearEnd || '',
      addresses: {
        business: formatAddr(bizAddr),
        mailing: formatAddr(mailAddr),
      },
      filings: keyFilings.slice(0, 15),
    };
  } catch {
    return null;
  }
}
