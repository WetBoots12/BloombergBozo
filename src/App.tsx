import { useEffect } from 'react';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { Group as PanelGroup, Panel as ResizablePanel, Separator as PanelResizeHandle } from 'react-resizable-panels';
import { Header } from './components/layout/Header';
import { FunctionBar } from './components/layout/FunctionBar';
import { CommandBar } from './components/layout/CommandBar';
import { HelpOverlay } from './components/layout/HelpOverlay';
import { ApiSettings } from './components/layout/ApiSettings';
import { MarketOverview } from './components/panels/MarketOverview';
import { StockQuote } from './components/panels/StockQuote';
import { NewsPanel } from './components/panels/NewsPanel';
import { CryptoDashboard } from './components/panels/CryptoDashboard';
import { ForexPanel } from './components/panels/ForexPanel';
import { WatchlistPanel } from './components/panels/WatchlistPanel';
import { EconomicPanel } from './components/panels/EconomicPanel';
import { FilingsPanel } from './components/panels/FilingsPanel';
import { FunctionDispatcher } from './components/functions/FunctionDispatcher';
import { useTerminalStore } from './store/terminalStore';
import type { PanelType } from './types/market';

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      retry: 2,
      retryDelay: (attempt) => Math.min(1000 * 2 ** attempt, 30000),
      refetchOnWindowFocus: false,
    },
  },
});

function PanelRenderer({ type }: { type: PanelType }) {
  switch (type) {
    case 'market': return <MarketOverview />;
    case 'quote': return <StockQuote />;
    case 'news': return <NewsPanel />;
    case 'crypto': return <CryptoDashboard />;
    case 'forex': return <ForexPanel />;
    case 'watchlist': return <WatchlistPanel />;
    case 'economic': return <EconomicPanel />;
    case 'filings': return <FilingsPanel />;
    default: return <MarketOverview />;
  }
}

function Terminal() {
  const { bottomRightPanel, topLeftPanel, toggleHelp, isApiSettingsOpen, toggleApiSettings, activeFunction } = useTerminalStore();

  // Global keyboard shortcuts
  useEffect(() => {
    const handleKey = (e: KeyboardEvent) => {
      if (e.key === 'F1') { e.preventDefault(); toggleHelp(); }
    };
    window.addEventListener('keydown', handleKey);
    return () => window.removeEventListener('keydown', handleKey);
  }, [toggleHelp, toggleApiSettings]);

  // Determine if we should show a Bloomberg function overlay
  const showFunctionOverlay = ['DES', 'FA', 'ANR', 'E'].includes(activeFunction);

  return (
    <div className="flex flex-col w-full h-full bg-bbg-black overflow-hidden">
      {/* Top Header */}
      <Header />

      {/* Function Bar */}
      <FunctionBar />

      {/* Main Panel Area */}
      <div className="flex-1 min-h-0">
        <PanelGroup orientation="horizontal" className="h-full">
          {/* Left Column */}
          <ResizablePanel defaultSize={50} minSize={25}>
            <PanelGroup orientation="vertical" className="h-full">
              {/* Top Left: Switchable (Market Overview or Watchlist) */}
              <ResizablePanel defaultSize={55} minSize={25}>
                {showFunctionOverlay ? (
                  <div className="h-full">
                    <FunctionDispatcher />
                  </div>
                ) : (
                  <PanelRenderer type={topLeftPanel} />
                )}
              </ResizablePanel>

              <PanelResizeHandle className="h-1 bg-bbg-border hover:bg-bbg-orange transition-colors cursor-row-resize" />

              {/* Bottom Left: News */}
              <ResizablePanel defaultSize={45} minSize={20}>
                <NewsPanel />
              </ResizablePanel>
            </PanelGroup>
          </ResizablePanel>

          <PanelResizeHandle className="w-1 bg-bbg-border hover:bg-bbg-orange transition-colors cursor-col-resize" />

          {/* Right Column */}
          <ResizablePanel defaultSize={50} minSize={25}>
            <PanelGroup orientation="vertical" className="h-full">
              {/* Top Right: Stock Quote/Chart */}
              <ResizablePanel defaultSize={60} minSize={30}>
                {!showFunctionOverlay && <StockQuote />}
              </ResizablePanel>

              <PanelResizeHandle className="h-1 bg-bbg-border hover:bg-bbg-orange transition-colors cursor-row-resize" />

              {/* Bottom Right: Switchable (Crypto, Forex, Watchlist, Economic) */}
              <ResizablePanel defaultSize={40} minSize={20}>
                {!showFunctionOverlay && <PanelRenderer type={bottomRightPanel} />}
              </ResizablePanel>
            </PanelGroup>
          </ResizablePanel>
        </PanelGroup>
      </div>

      {/* Command Bar */}
      <CommandBar />

      {/* Overlays */}
      <HelpOverlay />
      {isApiSettingsOpen && <ApiSettings onClose={toggleApiSettings} />}
    </div>
  );
}

export default function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <Terminal />
    </QueryClientProvider>
  );
}
