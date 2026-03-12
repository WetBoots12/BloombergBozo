import { useTerminalStore } from '../../store/terminalStore';

const COMMANDS = [
  { cmd: '<TICKER>', desc: 'Look up any stock (e.g., AAPL, MSFT, NVDA)' },
  { cmd: 'NEWS', desc: 'Show financial news feed' },
  { cmd: 'CRYPTO / CRYP', desc: 'Show cryptocurrency dashboard' },
  { cmd: 'FX / FOREX', desc: 'Show forex currency pairs' },
  { cmd: 'WLT / WATCHLIST', desc: 'Show your watchlist' },
  { cmd: 'ECO / ECON', desc: 'Show economic indicators' },
  { cmd: 'MKT / MARKET', desc: 'Show market overview' },
  { cmd: 'HELP', desc: 'Show this help screen' },
];

const FUNCTION_KEYS = [
  { key: 'F1', desc: 'Open help overlay' },
  { key: 'F2', desc: 'Market overview' },
  { key: 'F3', desc: 'News feed' },
  { key: 'F4', desc: 'Crypto dashboard' },
  { key: 'F5', desc: 'Forex pairs' },
  { key: 'F6', desc: 'Watchlist' },
  { key: 'F7', desc: 'Economic indicators' },
  { key: 'F8', desc: 'Chart view' },
];

const APIS = [
  { name: 'Finnhub', purpose: 'Stock quotes, company data, news', key: 'VITE_FINNHUB_API_KEY' },
  { name: 'CoinGecko', purpose: 'Crypto prices & market data', key: 'No key required ✓' },
  { name: 'Alpha Vantage', purpose: 'Historical data & forex rates', key: 'VITE_ALPHA_VANTAGE_API_KEY' },
  { name: 'Fin. Modeling Prep', purpose: 'Fundamentals & financials', key: 'VITE_FMP_API_KEY' },
];

export function HelpOverlay() {
  const { isHelpOpen, toggleHelp } = useTerminalStore();

  if (!isHelpOpen) return null;

  return (
    <div
      className="fixed inset-0 bg-black/80 backdrop-blur-sm z-50 flex items-center justify-center p-4"
      onClick={toggleHelp}
    >
      <div
        className="bg-bbg-panel border-2 border-bbg-orange max-w-2xl w-full max-h-[85vh] overflow-y-auto"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="flex items-center justify-between px-4 py-3 border-b border-bbg-orange bg-bbg-orange/10">
          <div>
            <div className="text-bbg-orange font-bold text-lg tracking-wider">BLOOMBERG BOZO</div>
            <div className="text-bbg-muted text-xs">Terminal Reference Guide</div>
          </div>
          <button
            onClick={toggleHelp}
            className="text-bbg-muted hover:text-bbg-red text-lg transition-colors px-2"
          >
            ✕
          </button>
        </div>

        <div className="p-4 space-y-5">
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
            <div className="grid grid-cols-2 gap-1">
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
            <div className="text-bbg-amber font-bold text-xs mb-2 tracking-wider">API CONFIGURATION (.env)</div>
            <div className="bg-bbg-panel-alt border border-bbg-border p-3 rounded text-xs space-y-2">
              {APIS.map(({ name, purpose, key }) => (
                <div key={name} className="flex items-start gap-3">
                  <div className="w-44 flex-shrink-0">
                    <div className="text-bbg-amber font-bold">{name}</div>
                    <div className="text-bbg-muted">{purpose}</div>
                  </div>
                  <div className="font-mono text-bbg-green/80">{key}</div>
                </div>
              ))}
            </div>
            <div className="text-bbg-muted text-xs mt-2">
              ℹ Running in DEMO mode. Add API keys to .env for live data.
            </div>
          </div>

          {/* Tips */}
          <div>
            <div className="text-bbg-amber font-bold text-xs mb-2 tracking-wider">TIPS</div>
            <div className="text-xs text-bbg-text-dim space-y-1">
              <div>• Start typing a ticker anywhere — command bar auto-focuses</div>
              <div>• Press ↑/↓ in command bar to navigate history</div>
              <div>• Click any stock in Market Overview to view its chart</div>
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
