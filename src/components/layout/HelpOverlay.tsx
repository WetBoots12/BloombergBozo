import { useTerminalStore } from '../../store/terminalStore';
import { getAvailableFunctions } from '../../services/bloombergCommands';

const COMMANDS = [
  { cmd: '<TICKER>', desc: 'Look up any stock (e.g., AAPL, MSFT, NVDA)' },
  { cmd: '<TICKER> <FUNC>', desc: 'Run function on ticker (e.g., AAPL DES, MSFT FA)' },
  { cmd: 'NEWS', desc: 'Show financial news feed' },
  { cmd: 'CRYPTO / CRYP', desc: 'Show cryptocurrency dashboard' },
  { cmd: 'FX / FOREX', desc: 'Show forex currency pairs' },
  { cmd: 'WLT / WATCHLIST', desc: 'Show your watchlist' },
  { cmd: 'ECO / ECON', desc: 'Show economic indicators' },
  { cmd: 'MKT / MARKET', desc: 'Show market overview' },
  { cmd: 'API / KEYS', desc: 'Open API key settings' },
  { cmd: 'HELP', desc: 'Show this help screen' },
];

const BLOOMBERG_FUNCTIONS = getAvailableFunctions();

const FUNCTION_KEYS = [
  { key: 'F1', desc: 'Help' },
  { key: 'F2', desc: 'Market' },
  { key: 'F3', desc: 'News' },
  { key: 'F4', desc: 'Crypto' },
  { key: 'F5', desc: 'Forex' },
  { key: 'F6', desc: 'Watchlist' },
  { key: 'F7', desc: 'Economic' },
  { key: 'F8', desc: 'SEC Filings' },
  { key: 'F9', desc: 'API Settings' },
];

const APIS = [
  { name: 'Finnhub', purpose: 'Real-time quotes, analyst ratings, earnings', key: 'VITE_FINNHUB_API_KEY', tier: '60 req/min' },
  { name: 'Alpha Vantage', purpose: 'Historical charts, technical indicators', key: 'VITE_ALPHA_VANTAGE_API_KEY', tier: '25-500 req/day' },
  { name: 'FMP', purpose: 'Financial statements, fundamentals', key: 'VITE_FMP_API_KEY', tier: '250 req/day' },
  { name: 'FRED', purpose: 'Economic data, treasury yields', key: 'VITE_FRED_API_KEY', tier: 'Unlimited' },
  { name: 'NewsAPI', purpose: 'Enhanced news search', key: 'VITE_NEWSAPI_API_KEY', tier: '100 req/day' },
  { name: 'CoinGecko', purpose: 'Crypto prices & market data', key: 'No key required', tier: 'Free' },
  { name: 'Yahoo Finance', purpose: 'Real-time quotes, charts', key: 'No key required', tier: 'Free (CORS proxy)' },
  { name: 'SEC EDGAR', purpose: 'Company filings, insider trades', key: 'No key required', tier: 'Public' },
];

export function HelpOverlay() {
  const { isHelpOpen, toggleHelp, toggleApiSettings } = useTerminalStore();

  if (!isHelpOpen) return null;

  return (
    <div
      className="fixed inset-0 bg-black/80 backdrop-blur-sm z-50 flex items-center justify-center p-4"
      onClick={toggleHelp}
    >
      <div
        className="bg-bbg-panel border-2 border-bbg-orange max-w-3xl w-full max-h-[90vh] overflow-y-auto"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="flex items-center justify-between px-4 py-3 border-b border-bbg-orange bg-bbg-orange/10">
          <div>
            <div className="text-bbg-orange font-bold text-lg tracking-wider">BLOOMBERG BOZO</div>
            <div className="text-bbg-muted text-xs">Terminal Reference Guide - Phase 1</div>
          </div>
          <button
            onClick={toggleHelp}
            className="text-bbg-muted hover:text-bbg-red text-lg transition-colors px-2"
          >
            ✕
          </button>
        </div>

        <div className="p-4 space-y-5">
          {/* Bloomberg Functions */}
          <div>
            <div className="text-bbg-amber font-bold text-xs mb-2 tracking-wider">BLOOMBERG FUNCTIONS</div>
            <div className="grid grid-cols-2 gap-1">
              {BLOOMBERG_FUNCTIONS.slice(0, 12).map(({ code, name, description }) => (
                <div key={code} className="flex items-center gap-2 text-xs">
                  <span className="text-bbg-orange font-bold w-16 font-mono">{code}</span>
                  <span className="text-bbg-text-dim">{name}: {description}</span>
                </div>
              ))}
            </div>
          </div>

          {/* Commands */}
          <div>
            <div className="text-bbg-amber font-bold text-xs mb-2 tracking-wider">COMMAND REFERENCE</div>
            <div className="space-y-1">
              {COMMANDS.map(({ cmd, desc }) => (
                <div key={cmd} className="flex items-start gap-3 text-xs">
                  <span className="text-bbg-orange font-bold w-40 flex-shrink-0 font-mono">{cmd}</span>
                  <span className="text-bbg-text-dim">{desc}</span>
                </div>
              ))}
            </div>
          </div>

          {/* Function Keys */}
          <div>
            <div className="text-bbg-amber font-bold text-xs mb-2 tracking-wider">FUNCTION KEYS</div>
            <div className="grid grid-cols-3 gap-1">
              {FUNCTION_KEYS.map(({ key, desc }) => (
                <div key={key} className="flex items-center gap-2 text-xs">
                  <span className="text-bbg-orange font-bold w-8 font-mono">{key}</span>
                  <span className="text-bbg-text-dim">{desc}</span>
                </div>
              ))}
            </div>
          </div>

          {/* API Keys */}
          <div>
            <div className="text-bbg-amber font-bold text-xs mb-2 tracking-wider">API CONFIGURATION</div>
            <div className="bg-bbg-panel-alt border border-bbg-border p-3 rounded text-xs space-y-2">
              {APIS.map(({ name, purpose, key, tier }) => (
                <div key={name} className="flex items-start gap-3">
                  <div className="flex-1">
                    <div className="text-bbg-amber font-bold">{name}</div>
                    <div className="text-bbg-muted">{purpose}</div>
                    <div className="text-bbg-green/60 text-xs mt-0.5">Free: {tier}</div>
                  </div>
                  <div className="font-mono text-bbg-green/80 text-xs">{key}</div>
                </div>
              ))}
            </div>
            <div className="flex items-center justify-between mt-2">
              <div className="text-bbg-muted text-xs">
                ℹ App works in DEMO mode. Add API keys for live data.
              </div>
              <button
                onClick={() => { toggleHelp(); toggleApiSettings(); }}
                className="text-bbg-orange hover:text-bbg-amber text-xs font-bold"
              >
                OPEN API SETTINGS →
              </button>
            </div>
          </div>

          {/* Tips */}
          <div>
            <div className="text-bbg-amber font-bold text-xs mb-2 tracking-wider">TIPS</div>
            <div className="text-xs text-bbg-text-dim space-y-1">
              <div>• Start typing a ticker anywhere — command bar auto-focuses</div>
              <div>• Press ↑/↓ in command bar to navigate history</div>
              <div>• Try: AAPL DES, MSFT FA, NVDA ANR, TSLA E</div>
              <div>• Drag panel borders to resize</div>
              <div>• Watchlist persists across sessions (localStorage)</div>
            </div>
          </div>
        </div>

        <div className="px-4 py-3 border-t border-bbg-border text-xs text-bbg-muted flex justify-between">
          <span>BLOOMBERG BOZO — Not affiliated with Bloomberg LP</span>
          <button onClick={toggleHelp} className="text-bbg-orange hover:text-bbg-amber">CLOSE [ESC]</button>
        </div>
      </div>
    </div>
  );
}
