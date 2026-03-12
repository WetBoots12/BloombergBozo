/**
 * API Key Management Service
 * Handles storage, validation, and status checking for all API keys
 */

import type { ApiKeyConfig } from '../types/bloomberg';

const API_KEYS: Record<string, ApiKeyConfig> = {
  finnhub: {
    name: 'Finnhub',
    key: '',
    provider: 'Finnhub',
    freeTier: '60 req/min',
    signupUrl: 'https://finnhub.io/register',
    description: 'Real-time stock quotes, forex, news, and analyst ratings',
    functions: ['Real-time quotes', 'News', 'Analyst ratings', 'Earnings'],
    required: false,
  },
  alphaVantage: {
    name: 'Alpha Vantage',
    key: '',
    provider: 'Alpha Vantage',
    freeTier: '25-500 req/day',
    signupUrl: 'https://www.alphavantage.co/support/#api-key',
    description: 'Historical data, technical indicators, forex, commodities',
    functions: ['Historical charts', 'Technical indicators', 'Forex', 'Commodities'],
    required: false,
  },
  fmp: {
    name: 'Financial Modeling Prep',
    key: '',
    provider: 'FMP',
    freeTier: '250 req/day',
    signupUrl: 'https://site.financialmodelingprep.com/developer',
    description: 'Company fundamentals, financial statements, screeners',
    functions: ['Company profiles', 'Financial statements', 'Stock screener', 'Price targets'],
    required: false,
  },
  fred: {
    name: 'FRED',
    key: '',
    provider: 'Federal Reserve Bank of St. Louis',
    freeTier: 'Unlimited (generous limits)',
    signupUrl: 'https://fred.stlouisfed.org/docs/api/api_key.html',
    description: 'Economic data, treasury yields, interest rates',
    functions: ['Economic indicators', 'Treasury yield curve', 'Interest rates'],
    required: false,
  },
  newsApi: {
    name: 'NewsAPI',
    key: '',
    provider: 'NewsAPI.org',
    freeTier: '100 req/day',
    signupUrl: 'https://newsapi.org/register',
    description: 'Enhanced news search and categorization',
    functions: ['News by category', 'News by industry', 'Top headlines'],
    required: false,
  },
};

export interface ApiKeyStatus {
  key: string;
  isValid: boolean;
  isEmpty: boolean;
  config: ApiKeyConfig;
}

class ApiKeyManager {
  private keys: Map<string, string> = new Map();

  constructor() {
    this.loadFromEnv();
  }

  private loadFromEnv() {
    // Load from environment variables
    const envMappings: Record<string, string> = {
      finnhub: 'VITE_FINNHUB_API_KEY',
      alphaVantage: 'VITE_ALPHA_VANTAGE_API_KEY',
      fmp: 'VITE_FMP_API_KEY',
      fred: 'VITE_FRED_API_KEY',
      newsApi: 'VITE_NEWSAPI_API_KEY',
    };

    for (const [service, envVar] of Object.entries(envMappings)) {
      const key = (import.meta.env as Record<string, string>)[envVar];
      if (typeof key === 'string' && key.trim()) {
        this.keys.set(service, key.trim());
      }
    }

    // Also load from localStorage (for runtime configuration)
    for (const service of Object.keys(API_KEYS)) {
      const stored = localStorage.getItem(`api_key_${service}`);
      if (stored && stored.trim()) {
        this.keys.set(service, stored.trim());
      }
    }
  }

  getKey(service: string): string {
    return this.keys.get(service) || '';
  }

  setKey(service: string, key: string): void {
    const trimmed = key.trim();
    if (trimmed) {
      this.keys.set(service, trimmed);
      localStorage.setItem(`api_key_${service}`, trimmed);
    } else {
      this.keys.delete(service);
      localStorage.removeItem(`api_key_${service}`);
    }
  }

  hasKey(service: string): boolean {
    const key = this.keys.get(service);
    return !!key && key.length > 0;
  }

  getStatus(service: string): ApiKeyStatus {
    const config = API_KEYS[service];
    const key = this.keys.get(service) || '';
    return {
      key,
      isValid: key.length > 0,
      isEmpty: key.length === 0,
      config,
    };
  }

  getAllStatuses(): Record<string, ApiKeyStatus> {
    const result: Record<string, ApiKeyStatus> = {};
    for (const service of Object.keys(API_KEYS)) {
      result[service] = this.getStatus(service);
    }
    return result;
  }

  getConfigs(): Record<string, ApiKeyConfig> {
    return { ...API_KEYS };
  }

  getRequiredMissing(): string[] {
    const missing: string[] = [];
    for (const [service, config] of Object.entries(API_KEYS)) {
      if (config.required && !this.hasKey(service)) {
        missing.push(service);
      }
    }
    return missing;
  }

  getOptionalSuggested(): Array<{ service: string; config: ApiKeyConfig }> {
    const suggested: Array<{ service: string; config: ApiKeyConfig }> = [];
    for (const [service, config] of Object.entries(API_KEYS)) {
      if (!config.required && !this.hasKey(service)) {
        suggested.push({ service, config });
      }
    }
    return suggested;
  }

  // Validate key format (basic checks)
  validateKeyFormat(service: string, key: string): { valid: boolean; error?: string } {
    if (!key.trim()) {
      return { valid: true }; // Empty is allowed for optional keys
    }

    switch (service) {
      case 'finnhub':
        // Finnhub keys are typically 20 character hex strings
        if (!/^[a-z0-9]{20}$/i.test(key.trim())) {
          return { valid: false, error: 'Finnhub keys are 20-character alphanumeric strings' };
        }
        break;
      case 'alphaVantage':
        // Alpha Vantage keys are 16 character hex strings
        if (!/^[A-Z0-9]{16}$/i.test(key.trim())) {
          return { valid: false, error: 'Alpha Vantage keys are 16-character alphanumeric strings' };
        }
        break;
      case 'fmp':
        // FMP keys are typically 32 character hex strings
        if (!/^[a-z0-9]{32}$/i.test(key.trim())) {
          return { valid: false, error: 'FMP keys are 32-character alphanumeric strings' };
        }
        break;
      case 'fred':
        // FRED keys are 32 character hex strings
        if (!/^[a-z0-9]{32}$/i.test(key.trim())) {
          return { valid: false, error: 'FRED keys are 32-character alphanumeric strings' };
        }
        break;
    }
    return { valid: true };
  }
}

export const apiKeyManager = new ApiKeyManager();
export default apiKeyManager;
