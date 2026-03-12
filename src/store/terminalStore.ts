import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import type { PanelType } from '../types/market';
import type { BloombergFunction } from '../types/bloomberg';
import { parseBloombergCommand } from '../services/bloombergCommands';

interface TerminalState {
  // Active security being viewed
  activeTicker: string;

  // Current Bloomberg function being executed
  activeFunction: BloombergFunction;

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
  isApiSettingsOpen: boolean;

  // Actions
  setActiveTicker: (ticker: string) => void;
  setActiveFunction: (func: BloombergFunction) => void;
  setBottomRightPanel: (panel: PanelType) => void;
  setTopLeftPanel: (panel: PanelType) => void;
  addToWatchlist: (ticker: string) => void;
  removeFromWatchlist: (ticker: string) => void;
  pushCommand: (cmd: string) => void;
  setCommandInput: (input: string) => void;
  navigateHistory: (dir: 'up' | 'down') => string;
  toggleHelp: () => void;
  toggleApiSettings: () => void;
  executeCommand: (input: string) => void;
}

export const useTerminalStore = create<TerminalState>()(
  persist(
    (set, get) => ({
      activeTicker: 'AAPL',
      activeFunction: 'GO',
      bottomRightPanel: 'crypto',
      topLeftPanel: 'market',
      watchlist: ['AAPL', 'MSFT', 'NVDA', 'TSLA', 'GOOGL', 'AMZN'],
      commandHistory: [],
      historyIndex: -1,
      commandInput: '',
      isHelpOpen: false,
      isApiSettingsOpen: false,

      setActiveTicker: (ticker) => set({ activeTicker: ticker.toUpperCase() }),

      setActiveFunction: (func) => set({ activeFunction: func }),

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

      toggleApiSettings: () => set({ isApiSettingsOpen: !get().isApiSettingsOpen }),

      executeCommand: (input) => {
        const raw = input.trim().toUpperCase();
        if (!raw) return;

        get().pushCommand(raw);
        set({ commandInput: '' });

        // Parse using Bloomberg command parser
        const parsed = parseBloombergCommand(raw);

        // Handle API settings command
        if (raw === 'API' || raw === 'KEYS' || raw === 'SETTINGS') {
          set({ isApiSettingsOpen: true });
          return;
        }

        // Handle HELP
        if (parsed.func === 'HELP') {
          set({ isHelpOpen: true });
          return;
        }

        // Handle panel switch commands
        const panelCommands: Record<string, PanelType> = {
          'NEWS': 'news',
          'CRYPTO': 'crypto',
          'FX': 'forex',
          'FOREX': 'forex',
          'WLT': 'watchlist',
          'WATCHLIST': 'watchlist',
          'ECON': 'economic',
          'ECONOMIC': 'economic',
          'FILINGS': 'filings',
        };

        if (panelCommands[parsed.func]) {
          set({ bottomRightPanel: panelCommands[parsed.func] });
          if (parsed.ticker) set({ activeTicker: parsed.ticker });
          return;
        }

        if (parsed.func === 'MARKET') {
          set({ topLeftPanel: 'market' });
          return;
        }

        // Handle ticker-based functions - set active ticker and function
        if (parsed.ticker || ['GO', 'DES', 'FA', 'ANR', 'E', 'CN', 'OWN', 'FILINGS'].includes(parsed.func)) {
          set({
            activeTicker: parsed.ticker || get().activeTicker,
            activeFunction: parsed.func,
          });
          return;
        }

        // Handle standalone ticker (defaults to GO function)
        if (/^[A-Z.]{1,10}$/.test(raw)) {
          set({ activeTicker: raw, activeFunction: 'GO', topLeftPanel: 'market' });
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
