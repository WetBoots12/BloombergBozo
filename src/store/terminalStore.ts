import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import type { PanelType } from '../types/market';

interface TerminalState {
  // Active security being viewed
  activeTicker: string;

  // Bottom-right panel type (switchable)
  bottomRightPanel: PanelType;
  // Top-left panel type (switchable)
  topLeftPanel: PanelType;

  // Watchlist
  watchlist: string[];

  // Command history
  commandHistory: string[];
  historyIndex: number;

  // UI state
  commandInput: string;
  isHelpOpen: boolean;

  // Actions
  setActiveTicker: (ticker: string) => void;
  setBottomRightPanel: (panel: PanelType) => void;
  setTopLeftPanel: (panel: PanelType) => void;
  addToWatchlist: (ticker: string) => void;
  removeFromWatchlist: (ticker: string) => void;
  pushCommand: (cmd: string) => void;
  setCommandInput: (input: string) => void;
  navigateHistory: (dir: 'up' | 'down') => string;
  toggleHelp: () => void;
  executeCommand: (input: string) => void;
}

export const useTerminalStore = create<TerminalState>()(
  persist(
    (set, get) => ({
      activeTicker: 'AAPL',
      bottomRightPanel: 'crypto',
      topLeftPanel: 'market',
      watchlist: ['AAPL', 'MSFT', 'NVDA', 'TSLA', 'GOOGL', 'AMZN'],
      commandHistory: [],
      historyIndex: -1,
      commandInput: '',
      isHelpOpen: false,

      setActiveTicker: (ticker) => set({ activeTicker: ticker.toUpperCase() }),

      setBottomRightPanel: (panel) => set({ bottomRightPanel: panel }),

      setTopLeftPanel: (panel) => set({ topLeftPanel: panel }),

      addToWatchlist: (ticker) => {
        const t = ticker.toUpperCase();
        const { watchlist } = get();
        if (!watchlist.includes(t)) {
          set({ watchlist: [...watchlist, t] });
        }
      },

      removeFromWatchlist: (ticker) => {
        const t = ticker.toUpperCase();
        set({ watchlist: get().watchlist.filter(s => s !== t) });
      },

      pushCommand: (cmd) => {
        if (!cmd.trim()) return;
        const history = [cmd, ...get().commandHistory.slice(0, 49)];
        set({ commandHistory: history, historyIndex: -1 });
      },

      setCommandInput: (input) => set({ commandInput: input }),

      navigateHistory: (dir) => {
        const { commandHistory, historyIndex } = get();
        let newIndex = historyIndex;

        if (dir === 'up') {
          // Navigate to older commands (higher index)
          if (historyIndex === -1 && commandHistory.length > 0) {
            newIndex = 0;
          } else if (historyIndex < commandHistory.length - 1) {
            newIndex = historyIndex + 1;
          }
        } else {
          // Navigate to newer commands (lower index)
          if (historyIndex > 0) {
            newIndex = historyIndex - 1;
          } else {
            newIndex = -1;
          }
        }

        set({ historyIndex: newIndex });
        // Return the command at the new index, or empty string if at the end (new input)
        return newIndex >= 0 ? commandHistory[newIndex] : '';
      },

      toggleHelp: () => set({ isHelpOpen: !get().isHelpOpen }),

      executeCommand: (input) => {
        const raw = input.trim().toUpperCase();
        if (!raw) return;

        get().pushCommand(raw);
        set({ commandInput: '' });

        // Parse Bloomberg-style commands
        // Strip suffixes like <EQUITY>, <CRYPTO>, etc.
        const cleaned = raw
          .replace(/<EQUITY>/g, '')
          .replace(/<CRYPTO>/g, '')
          .replace(/<INDEX>/g, '')
          .replace(/<GO>/g, '')
          .trim();

        // Named commands
        if (cleaned === 'HELP' || cleaned === 'H' || cleaned === '?') {
          set({ isHelpOpen: true });
          return;
        }
        if (cleaned === 'NEWS' || cleaned === 'N') {
          set({ bottomRightPanel: 'news', topLeftPanel: 'market' });
          return;
        }
        if (cleaned === 'CRYPTO' || cleaned === 'CRYP' || cleaned === 'BTC') {
          set({ bottomRightPanel: 'crypto' });
          if (cleaned === 'BTC') set({ activeTicker: 'BTC' });
          return;
        }
        if (cleaned === 'FX' || cleaned === 'FOREX' || cleaned === 'CCY') {
          set({ bottomRightPanel: 'forex' });
          return;
        }
        if (cleaned === 'WLT' || cleaned === 'WATCH' || cleaned === 'WATCHLIST') {
          set({ bottomRightPanel: 'watchlist' });
          return;
        }
        if (cleaned === 'ECO' || cleaned === 'ECON' || cleaned === 'MACRO') {
          set({ bottomRightPanel: 'economic' });
          return;
        }
        if (cleaned === 'MKT' || cleaned === 'MARKET' || cleaned === 'WM') {
          set({ topLeftPanel: 'market' });
          return;
        }
        if (cleaned === 'DES' || cleaned === 'OWN' || cleaned === 'FA' || cleaned === 'FILINGS' || cleaned === 'SEC') {
          set({ bottomRightPanel: 'filings' });
          return;
        }

        // Treat as ticker symbol
        if (/^[A-Z.]{1,10}$/.test(cleaned)) {
          set({ activeTicker: cleaned, topLeftPanel: 'market' });
        }
      },
    }),
    {
      name: 'bloomberg-bozo-state',
      partialize: (state) => ({
        watchlist: state.watchlist,
        activeTicker: state.activeTicker,
        commandHistory: state.commandHistory,
      }),
    }
  )
);
